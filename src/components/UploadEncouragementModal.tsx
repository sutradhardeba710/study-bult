import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, FileText, Award, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackModalView, trackModalClickUpload, trackModalClickRemind, trackModalClickDismiss } from '../services/modalAnalytics';

interface CommunityStats {
    totalPapers: number;
    totalUsers: number;
    recentUploads: number;
}

// ─── Trigger Reason ───────────────────────────────────────────────────────────
interface ModalContext {
    headline: string;
    subtext: string;
}

const getModalContext = (): ModalContext => ({
    headline: "You're one of our most active members",
    subtext: 'Your continued participation helps Study Volte grow. If you have a useful question paper, consider sharing it with the community.',
});

const UploadEncouragementModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<CommunityStats>({ totalPapers: 0, totalUsers: 0, recentUploads: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();

    // ── Permanent suppression: never show if user ever uploaded
    const hasEverUploaded = (): boolean => {
        if (localStorage.getItem('em_hasEverUploaded') === 'true') return true;
        if (localStorage.getItem('lastUploadTime')) return true;
        return false;
    };

    // Per-user cap: keep this an occasional loyalty prompt, not a recurring interruption.
    const withinFrequencyCap = (userId: string): boolean => {
        const last = localStorage.getItem(`em_loyaltyLastShown_${userId}`);
        if (!last) return false;
        return Date.now() - parseInt(last, 10) < 30 * 24 * 60 * 60 * 1000;
    };

    // Minimal Firestore check (only for logged-in users as a safety net)
    const checkRecentUpload = useCallback(async (): Promise<boolean> => {
        if (!currentUser) return false;
        try {
            const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');
            const q = query(
                collection(db, 'papers'),
                where('uploaderId', '==', currentUser.uid),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                localStorage.setItem('em_hasEverUploaded', 'true');
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [currentUser]);

    // Fetch community statistics
    const fetchStats = useCallback(async () => {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');
            const papersQuery = query(
                collection(db, 'papers'),
                where('status', '==', 'approved')
            );
            const papersSnapshot = await getDocs(papersQuery);
            const totalPapers = papersSnapshot.size;

            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);
            const recentQuery = query(
                collection(db, 'papers'),
                where('createdAt', '>=', yesterday),
                where('status', '==', 'approved')
            );
            const recentSnapshot = await getDocs(recentQuery);
            const recentUploads = recentSnapshot.size;

            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            const fetchedStats = { totalPapers, totalUsers, recentUploads };
            setStats(fetchedStats);
            return fetchedStats;
        } catch (error) {
            console.error('Error fetching stats:', error);
            const fallbackStats = { totalPapers: 500, totalUsers: 1000, recentUploads: 12 };
            setStats(fallbackStats);
            return fallbackStats;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Loyalty prompt v3: verified members only, based on durable repeat usage.
        // A single long page view, scroll, or accidental click can never qualify a user.
        if (authLoading || !currentUser || !currentUser.emailVerified) return;
        if (localStorage.getItem('uploadModal_permanentDismiss') === 'true') return;
        if (sessionStorage.getItem('uploadModal_sessionDismiss') === 'true') return;
        if (hasEverUploaded() || withinFrequencyCap(currentUser.uid)) return;

        const userId = currentUser.uid;
        const shownCountKey = `em_loyaltyShownCount_${userId}`;
        if (parseInt(localStorage.getItem(shownCountKey) || '0', 10) >= 2) return;

        const accountCreatedAt = currentUser.metadata.creationTime
            ? new Date(currentUser.metadata.creationTime).getTime()
            : Date.now();
        const accountAgeDays = (Date.now() - accountCreatedAt) / (24 * 60 * 60 * 1000);
        if (accountAgeDays < 7) return;

        const metricsKey = `em_loyaltyMetrics_${userId}`;
        const sessionKey = `em_loyaltySession_${userId}`;
        type LoyaltyMetrics = {
            sessions: number;
            activeDays: string[];
            activeSeconds: number;
            meaningfulActions: number;
        };

        const readMetrics = (): LoyaltyMetrics => {
            try {
                const stored = JSON.parse(localStorage.getItem(metricsKey) || '{}');
                return {
                    sessions: Number(stored.sessions) || 0,
                    activeDays: Array.isArray(stored.activeDays) ? stored.activeDays.slice(-30) : [],
                    activeSeconds: Number(stored.activeSeconds) || 0,
                    meaningfulActions: Number(stored.meaningfulActions) || 0,
                };
            } catch {
                return { sessions: 0, activeDays: [], activeSeconds: 0, meaningfulActions: 0 };
            }
        };

        let metrics = readMetrics();
        const today = new Date().toISOString().slice(0, 10);
        if (!metrics.activeDays.includes(today)) metrics.activeDays.push(today);
        if (sessionStorage.getItem(sessionKey) !== 'true') {
            metrics.sessions += 1;
            sessionStorage.setItem(sessionKey, 'true');
        }
        localStorage.setItem(metricsKey, JSON.stringify(metrics));

        let triggered = false;
        let currentSessionSeconds = 0;
        let pendingActiveSeconds = 0;
        let isPageActive = !document.hidden;

        const isSuitablePage = () => {
            const path = window.location.pathname;
            return path === '/' || path.startsWith('/browse') ||
                path.includes('question-papers') || path.startsWith('/courses');
        };

        const qualifies = () =>
            metrics.sessions >= 6 &&
            metrics.activeDays.length >= 4 &&
            metrics.activeSeconds >= 15 * 60 &&
            metrics.meaningfulActions >= 3 &&
            currentSessionSeconds >= 2 * 60 &&
            isSuitablePage();

        const persistActiveTime = () => {
            if (!pendingActiveSeconds) return;
            metrics.activeSeconds += pendingActiveSeconds;
            pendingActiveSeconds = 0;
            localStorage.setItem(metricsKey, JSON.stringify(metrics));
        };

        const show = async () => {
            if (triggered || !qualifies()) return;
            triggered = true;
            persistActiveTime();
            const alreadyUploaded = await checkRecentUpload();
            if (alreadyUploaded) return;
            const newStats = await fetchStats();
            localStorage.setItem(`em_loyaltyLastShown_${userId}`, Date.now().toString());
            localStorage.setItem(shownCountKey, String(parseInt(localStorage.getItem(shownCountKey) || '0', 10) + 1));
            setIsVisible(true);
            trackModalView(userId, currentUser.email || undefined, newStats, currentSessionSeconds * 1000);
        };

        const recordMeaningfulAction = (event: MouseEvent) => {
            const target = (event.target as HTMLElement).closest('a, button');
            if (!target) return;
            const text = (target.textContent || '').toLowerCase();
            const className = String(target.className || '').toLowerCase();
            const href = (target as HTMLAnchorElement).href || '';
            const action = text.includes('download') || className.includes('download') || href.includes('.pdf')
                ? 'download'
                : text.includes('preview') || text.includes('view') || className.includes('preview')
                    ? 'view'
                    : text.includes('like') || className.includes('heart') || className.includes('favorite')
                        ? 'like'
                        : null;
            if (!action) return;

            const actionKey = `em_loyaltyAction_${userId}_${action}`;
            if (sessionStorage.getItem(actionKey) === 'true') return;
            sessionStorage.setItem(actionKey, 'true');
            metrics.meaningfulActions += 1;
            localStorage.setItem(metricsKey, JSON.stringify(metrics));
            void show();
        };

        const onVisibilityChange = () => {
            isPageActive = !document.hidden;
            if (!isPageActive) persistActiveTime();
        };
        const activeTimer = setInterval(() => {
            if (!isPageActive) return;
            currentSessionSeconds += 1;
            pendingActiveSeconds += 1;
            if (pendingActiveSeconds >= 15) persistActiveTime();
            if (currentSessionSeconds % 15 === 0) void show();
        }, 1000);

        document.addEventListener('visibilitychange', onVisibilityChange);
        document.addEventListener('click', recordMeaningfulAction);

        return () => {
            clearInterval(activeTimer);
            persistActiveTime();
            document.removeEventListener('visibilitychange', onVisibilityChange);
            document.removeEventListener('click', recordMeaningfulAction);
        };
    }, [authLoading, currentUser, checkRecentUpload, fetchStats]);

    const handleUploadNow = () => {
        trackModalClickUpload(currentUser?.uid, currentUser?.email || undefined);
        sessionStorage.setItem('uploadModal_sessionDismiss', 'true');
        setIsVisible(false);
        navigate('/dashboard/upload');
    };

    const handleRemindLater = () => {
        trackModalClickRemind(currentUser?.uid, currentUser?.email || undefined);
        sessionStorage.setItem('uploadModal_sessionDismiss', 'true');
        setIsVisible(false);
    };

    const handleDontShowAgain = () => {
        trackModalClickDismiss(currentUser?.uid, currentUser?.email || undefined);
        localStorage.setItem('uploadModal_permanentDismiss', 'true');
        setIsVisible(false);
    };

    if (!isVisible || isLoading) return null;

    const ctx = getModalContext();

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-2 pt-16 sm:p-4 sm:pt-20 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="upload-encouragement-title">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto upload-encouragement-modal relative">

                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-xl md:blur-2xl md:animate-blob transform translate-z-0" style={{ willChange: 'transform, opacity' }}></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-xl md:blur-2xl md:animate-blob animation-delay-2000 transform translate-z-0" style={{ willChange: 'transform, opacity' }}></div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleRemindLater}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 sm:p-2 transition-all z-20"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="relative z-10 pr-8 sm:pr-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h2 id="upload-encouragement-title" className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{ctx.headline}</h2>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-white text-opacity-95 leading-relaxed">
                            {ctx.subtext}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8">
                    {/* Community Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 md:gap-3">
                                <div className="bg-blue-500 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-base sm:text-xl md:text-2xl font-bold text-blue-900">{stats.totalPapers}+</div>
                                    <div className="text-xs sm:text-sm text-blue-700">Papers</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-purple-200">
                            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 md:gap-3">
                                <div className="bg-purple-500 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-base sm:text-xl md:text-2xl font-bold text-purple-900">{stats.totalUsers}+</div>
                                    <div className="text-xs sm:text-sm text-purple-700">Students</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-green-200">
                            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 md:gap-3">
                                <div className="bg-green-500 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-base sm:text-xl md:text-2xl font-bold text-green-900">{stats.recentUploads}+</div>
                                    <div className="text-xs sm:text-sm text-green-700">Today</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Motivational Content */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="bg-amber-500 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                                    Share a paper in 3 simple steps
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 leading-relaxed">
                                    Share a previous-year question paper from your verified Study Volte account.
                                </p>
                                <div className="bg-white rounded-lg p-2 sm:p-3 mb-3 border border-amber-300">
                                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">VERIFIED</span>
                                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">Member upload</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600">Your account details are already connected.</p>
                                </div>
                                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500 font-bold">&#10003;</span>
                                        <span><strong>Step 1:</strong> Add the paper details</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500 font-bold">&#10003;</span>
                                        <span><strong>Step 2:</strong> Fill paper details &amp; upload PDF</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500 font-bold">&#10003;</span>
                                        <span><strong>Step 3:</strong> Done! We'll notify you when it's approved</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <button
                            onClick={handleUploadNow}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-1"
                        >
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Share a Paper</span>
                            </div>
                            <span className="text-xs font-normal opacity-90">Continue from your verified account</span>
                        </button>
                        <button
                            onClick={handleRemindLater}
                            className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors"
                        >
                            Remind Me Later
                        </button>
                    </div>

                    {/* Don't show again link */}
                    <div className="text-center mt-3 sm:mt-4">
                        <button
                            onClick={handleDontShowAgain}
                            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Don't show this again
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadEncouragementModal;

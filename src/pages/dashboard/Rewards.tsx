import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Trophy, Star, Upload, BookOpen,
    TrendingUp, Lock, ChevronRight, Award, Target,
    Calendar, Gift, Shield, Crown, Sparkles, Check,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPapers, getUserLikeEvents, getUserDownloads } from '../../services/papers';
import { getBadges } from '../../utils/badges';
import { useCountUp } from '../../hooks/useCountUp';
import {
    DAILY_TASKS, getDailyTaskState, claimDailyTask, markTaskDone,
    STREAK_MILESTONES, getUnclaimedStreakMilestones, claimStreakMilestone, getStreakMilestoneStates,
    type TaskId
} from '../../services/engagement';
import toast from 'react-hot-toast';

// ─── XP Level System ──────────────────────────────────────────────────────────
const XP_LEVELS = [
    { level: 1, label: 'Newcomer', minXP: 0, maxXP: 99, color: 'from-slate-400 to-slate-500', ring: 'ring-slate-300', bg: 'bg-slate-50', text: 'text-slate-700', icon: '🌱', desc: 'Just getting started' },
    { level: 2, label: 'Contributor', minXP: 100, maxXP: 299, color: 'from-emerald-400 to-green-500', ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '📘', desc: 'Sharing knowledge' },
    { level: 3, label: 'Scholar', minXP: 300, maxXP: 599, color: 'from-blue-400 to-cyan-500', ring: 'ring-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', icon: '🎓', desc: 'A dedicated learner' },
    { level: 4, label: 'Expert', minXP: 600, maxXP: 1099, color: 'from-violet-500 to-purple-600', ring: 'ring-violet-300', bg: 'bg-violet-50', text: 'text-violet-700', icon: '⚡', desc: 'Highly knowledgeable' },
    { level: 5, label: 'Knowledge Lord', minXP: 1100, maxXP: 2499, color: 'from-amber-400 to-orange-500', ring: 'ring-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', icon: '👑', desc: 'A true master' },
    { level: 6, label: 'Legend', minXP: 2500, maxXP: Infinity, color: 'from-rose-500 to-pink-600', ring: 'ring-rose-300', bg: 'bg-rose-50', text: 'text-rose-700', icon: '🏆', desc: 'Hall of Fame' },
];

type Level = typeof XP_LEVELS[0];
function getLevel(xp: number): Level {
    return XP_LEVELS.filter(l => xp >= l.minXP).at(-1) ?? XP_LEVELS[0];
}

// ─── How to earn XP guide ─────────────────────────────────────────────────────
const HOW_TO_EARN = [
    { icon: '📅', action: 'Daily Check-In', xp: '+5 XP / day', color: 'bg-violet-50 border-violet-100', pill: 'bg-violet-100 text-violet-700' },
    { icon: '📤', action: 'Upload a paper (task)', xp: '+8 XP', color: 'bg-blue-50 border-blue-100', pill: 'bg-blue-100 text-blue-700' },
    { icon: '❤️', action: 'Someone likes your paper', xp: '+3 XP / like', color: 'bg-rose-50 border-rose-100', pill: 'bg-rose-100 text-rose-700' },
    { icon: '📥', action: 'Paper gets downloaded', xp: '+5 XP / dl', color: 'bg-emerald-50 border-emerald-100', pill: 'bg-emerald-100 text-emerald-700' },
];

// ─── Badge progress hints ─────────────────────────────────────────────────────
interface BadgeHint { id: string; hint: (stats: { totalUploads: number; totalLikes: number; totalDownloads: number }, streak: number) => string; }
const BADGE_HINTS: BadgeHint[] = [
    { id: 'first_upload', hint: (s) => s.totalUploads === 0 ? 'Upload your first paper to unlock' : '' },
    { id: 'rising_star', hint: (s) => `${s.totalUploads}/5 papers uploaded` },
    { id: 'community_hero', hint: (s) => `${s.totalUploads}/10 papers uploaded` },
    { id: 'knowledge_seeker', hint: (s) => `${s.totalLikes}/10 papers liked` },
    { id: 'popular_creator', hint: (s) => `${s.totalDownloads}/50 downloads received` },
    { id: 'streak_master', hint: (_s, streak) => `${streak}/7 day streak` },
];

// ─── Circular XP Ring ─────────────────────────────────────────────────────────
function XPRing({ pct, children }: { pct: number; children: React.ReactNode }) {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s ease-out' }} />
            </svg>
            <div className="relative z-10 w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex flex-col items-center justify-center text-white shadow-inner">
                {children}
            </div>
        </div>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconClass, title, badge }: { icon: React.ElementType; iconClass: string; title: string; badge?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {badge && <span className="ml-auto">{badge}</span>}
        </div>
    );
}

// ─── Daily Task Row ───────────────────────────────────────────────────────────
interface DailyTaskRowProps {
    taskId: TaskId;
    icon: string;
    label: string;
    description: string;
    xp: number;
    claimed: boolean;
    done: boolean;
    onClaim: (taskId: TaskId) => void;
    claiming: boolean;
}
function DailyTaskRow({ taskId, icon, label, description, xp, claimed, done, onClaim, claiming }: DailyTaskRowProps) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${claimed
            ? 'bg-emerald-50 border-emerald-100'
            : done
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}>
            {/* Checkbox */}
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${claimed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                }`}>
                {claimed && <Check className="w-4 h-4 text-white" />}
            </div>

            {/* Icon + text */}
            <span className="text-xl shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${claimed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
            </div>

            {/* XP pill */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${claimed ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700'
                }`}>
                {claimed ? 'Done' : `+${xp} XP`}
            </span>

            {/* Claim / state indicator */}
            {claimed ? null : done ? (
                <button
                    onClick={() => onClaim(taskId)}
                    disabled={claiming}
                    className="ml-1 shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm disabled:opacity-60"
                >
                    {claiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Claim'}
                </button>
            ) : (
                <span className="ml-1 shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200 select-none">
                    Pending
                </span>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Rewards() {
    const { userProfile, setUserProfile } = useAuth() as any;

    const [xp, setXp] = useState<number>(userProfile?.xp ?? 0);
    const streak = userProfile?.streak ?? 0;
    const [stats, setStats] = useState({ totalUploads: 0, totalLikes: 0, totalDownloads: 0 });
    const [loading, setLoading] = useState(true);

    // Daily tasks state
    const [claimedTasks, setClaimedTasks] = useState<TaskId[]>([]);
    const [doneTasks, setDoneTasks] = useState<TaskId[]>([]);
    const [claimingTask, setClaimingTask] = useState<TaskId | null>(null);
    const [tasksLoaded, setTasksLoaded] = useState(false);

    // Streak milestone state
    type StreakMilestone = typeof STREAK_MILESTONES[number];
    const [unclaimedMilestones, setUnclaimedMilestones] = useState<StreakMilestone[]>([]);
    const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
    const [claimingMilestone, setClaimingMilestone] = useState<number | null>(null);

    const animXP = useCountUp(xp, 1200);

    // Load stats + daily task state
    useEffect(() => {
        if (!userProfile?.uid) { setLoading(false); return; }
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        Promise.all([
            getUserPapers(userProfile.uid),
            getUserLikeEvents(userProfile.uid),
            getUserDownloads(userProfile.uid),
            getDailyTaskState(userProfile.uid),
            getUnclaimedStreakMilestones(userProfile.uid),
            getStreakMilestoneStates(userProfile.uid),
        ]).then(([papers, likes, downloads, taskState, milestones, milestoneStates]) => {
            setStats({ totalUploads: papers.length, totalLikes: likes.length, totalDownloads: downloads.length });
            setClaimedTasks(taskState.claimed);
            setDoneTasks(taskState.done);
            setUnclaimedMilestones(milestones as StreakMilestone[]);
            setClaimedMilestones((milestoneStates as any).claimed ?? []);

            // Auto-mark tasks as "done" based on TODAY's actions only
            const autoDone: TaskId[] = [];
            const toDate = (d: any) => d?.toDate ? d.toDate() : new Date(d);
            if (papers.some(p => toDate(p.updatedAt || p.createdAt).toISOString().slice(0, 10) === today))
                autoDone.push('upload_paper');
            if (likes.some((e: any) => toDate(e.date).toISOString().slice(0, 10) === today))
                autoDone.push('like_paper');

            const newlyDone = autoDone.filter(t => !taskState.done.includes(t));
            if (newlyDone.length > 0) {
                setDoneTasks(prev => Array.from(new Set([...prev, ...newlyDone])));
                newlyDone.forEach(t => markTaskDone(userProfile.uid, t));
            }
        }).finally(() => { setLoading(false); setTasksLoaded(true); });
    }, [userProfile?.uid]);

    // Mark "explore_reward" and "daily_login" as done once on page load (fires only once)
    const hasMarkedPageVisit = useRef(false);
    useEffect(() => {
        if (!userProfile?.uid || hasMarkedPageVisit.current) return;
        hasMarkedPageVisit.current = true;
        markTaskDone(userProfile.uid, 'explore_reward');
        markTaskDone(userProfile.uid, 'daily_login');
        setDoneTasks(prev => Array.from(new Set([...prev, 'explore_reward', 'daily_login'])));
    }, [userProfile?.uid]);

    const handleClaim = useCallback(async (taskId: TaskId) => {
        if (!userProfile?.uid || claimingTask) return;
        setClaimingTask(taskId);
        try {
            const { success, xpGained } = await claimDailyTask(userProfile.uid, taskId);
            if (success) {
                setClaimedTasks(prev => [...prev, taskId]);
                setXp(prev => prev + xpGained);
                // update userProfile in context if possible
                if (setUserProfile) {
                    setUserProfile((p: any) => ({ ...p, xp: (p?.xp ?? 0) + xpGained }));
                }
                const task = DAILY_TASKS.find(t => t.id === taskId);
                toast.success(`+${xpGained} XP claimed! ${task?.icon ?? '🎉'}`);
            } else {
                toast('Already claimed today!', { icon: '🔄' });
            }
        } catch {
            toast.error('Failed to claim. Try again.');
        } finally {
            setClaimingTask(null);
        }
    }, [userProfile?.uid, claimingTask, setUserProfile]);

    const handleClaimMilestone = useCallback(async (days: number) => {
        if (!userProfile?.uid || claimingMilestone !== null) return;
        setClaimingMilestone(days);
        try {
            const { success, xpGained } = await claimStreakMilestone(userProfile.uid, days);
            if (success) {
                setUnclaimedMilestones(prev => prev.filter(m => m.days !== days));
                setXp(prev => prev + xpGained);
                if (setUserProfile) setUserProfile((p: any) => ({ ...p, xp: (p?.xp ?? 0) + xpGained }));
                const m = STREAK_MILESTONES.find(x => x.days === days);
                toast.success(`${m?.icon ?? '🔥'} ${m?.label} bonus claimed! +${xpGained} XP`, {
                    duration: 5000,
                    style: { background: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fbbf24' },
                });
            } else {
                toast('Already claimed!', { icon: '🔄' });
            }
        } catch {
            toast.error('Failed to claim milestone. Try again.');
        } finally {
            setClaimingMilestone(null);
        }
    }, [userProfile?.uid, claimingMilestone, setUserProfile]);

    // XP / level helpers
    const currentLevel = getLevel(xp);
    const nextLevel = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
    const xpIntoLevel = xp - currentLevel.minXP;
    const xpNeededForNext = nextLevel ? nextLevel.minXP - currentLevel.minXP : 1;
    const levelPct = nextLevel ? Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100)) : 100;

    const badges = getBadges(stats, streak);
    const earnedBadges = badges.filter(b => b.earned);
    const lockedBadges = badges.filter(b => !b.earned);
    const badgeProgress = Math.round((earnedBadges.length / badges.length) * 100);

    const claimedCount = claimedTasks.length;
    const totalTasks = DAILY_TASKS.length;
    const allDone = claimedCount === totalTasks;

    return (
        <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto pb-10">

            {/* ══ PAGE HEADER ════════════════════════════════════════════ */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-amber-500" /> Rewards &amp; Progress
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Complete tasks &rarr; earn XP &rarr; unlock badges &rarr; level up.</p>
                </div>
                <Link to="/dashboard/upload"
                    className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-primary-500/30 text-sm shrink-0">
                    <Upload className="w-4 h-4" /> Upload &amp; Earn
                </Link>
            </div>

            {/* ══ HERO — LEVEL CARD ══════════════════════════════════════ */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentLevel.color} p-6 sm:p-8 text-white shadow-2xl`}>
                <div className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                    <XPRing pct={levelPct}>
                        <span className="text-4xl font-black leading-none">{currentLevel.level}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-0.5">Level</span>
                    </XPRing>

                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Current Rank</p>
                        <h2 className="text-4xl font-extrabold mb-0.5">{currentLevel.icon} {currentLevel.label}</h2>
                        <p className="text-sm opacity-75 mb-3 italic">{currentLevel.desc}</p>

                        <div className="flex items-center gap-2 mb-1.5">
                            <Zap className="w-4 h-4 shrink-0" />
                            <span className="text-xl font-bold">{animXP} XP</span>
                            {nextLevel && <span className="text-sm opacity-60">/ {nextLevel.minXP} XP</span>}
                        </div>
                        {nextLevel ? (
                            <div>
                                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-2.5 bg-white rounded-full transition-all duration-1000" style={{ width: `${levelPct}%` }} />
                                </div>
                                <p className="text-xs opacity-60 mt-1.5">
                                    {levelPct}% → next: <strong>{nextLevel.label}</strong> (Level {nextLevel.level})
                                    &nbsp;·&nbsp; {nextLevel.minXP - xp} XP to go
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm opacity-80 mt-1">🏆 Max Level Reached — You're a Legend!</p>
                        )}
                    </div>

                    <div className="shrink-0 flex flex-col items-center bg-white/15 border border-white/30 rounded-2xl px-5 py-4 backdrop-blur-sm">
                        <span className="text-4xl leading-none mb-0.5">🔥</span>
                        <span className="text-3xl font-extrabold leading-none">{streak}</span>
                        <span className="text-xs font-semibold opacity-75 mt-0.5">Day Streak</span>
                    </div>
                </div>
            </div>

            {/* ══ HOW IT WORKS — QUICK INFO BAR ══════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                    { step: '1', label: 'Complete Tasks', sub: 'Do the daily actions', color: 'bg-violet-50 border-violet-100', num: 'bg-violet-500' },
                    { step: '2', label: 'Click Claim', sub: 'Collect your XP reward', color: 'bg-amber-50 border-amber-100', num: 'bg-amber-500' },
                    { step: '3', label: 'Build Streak', sub: 'Log in every day', color: 'bg-orange-50 border-orange-100', num: 'bg-orange-500' },
                    { step: '4', label: 'Level Up', sub: 'Unlock badges & ranks', color: 'bg-emerald-50 border-emerald-100', num: 'bg-emerald-500' },
                ].map(s => (
                    <div key={s.step} className={`flex items-center gap-3 border ${s.color} rounded-2xl px-3 py-3`}>
                        <span className={`w-6 h-6 rounded-full ${s.num} text-white text-xs font-black flex items-center justify-center shrink-0`}>{s.step}</span>
                        <div>
                            <p className="text-xs font-bold text-gray-800 leading-tight">{s.label}</p>
                            <p className="text-[10px] text-gray-400 leading-tight">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ STEP 1 — DAILY TASKS ════════════════════════════════════ */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shrink-0 shadow-sm border border-violet-400">
                        <span className="text-white text-xs font-black">1</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daily Tasks</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Do these actions today, then come here to claim XP</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {allDone && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
                                ✅ All Done!
                            </span>
                        )}
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner hidden sm:block">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${(claimedCount / totalTasks) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{claimedCount}/{totalTasks}</span>
                    </div>
                </div>

                {/* Status legend */}
                <div className="flex items-center gap-4 mb-4 mt-3 px-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />Pending — action not done yet</span>
                    <span className="flex items-center gap-1.5 text-xs text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Ready — click Claim</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Done — XP collected</span>
                </div>

                {/* Resets tip */}
                <div className="flex items-center gap-2 mb-4 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                    <span className="text-sm">🔄</span>
                    <p className="text-xs text-gray-600">
                        <strong className="text-violet-700">Tasks reset every midnight.</strong>{' '}
                        Come back daily to collect XP and keep your streak!
                    </p>
                </div>

                {/* Task list */}
                <div className="space-y-2.5">
                    {!tasksLoaded ? (
                        <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading tasks...
                        </div>
                    ) : (
                        DAILY_TASKS.map(task => (
                            <DailyTaskRow
                                key={task.id}
                                taskId={task.id}
                                icon={task.icon}
                                label={task.label}
                                description={task.description}
                                xp={task.xp}
                                claimed={claimedTasks.includes(task.id)}
                                done={doneTasks.includes(task.id)}
                                onClaim={handleClaim}
                                claiming={claimingTask === task.id}
                            />
                        ))
                    )}
                </div>

                {/* All done celebration */}
                {allDone && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 text-center">
                        <p className="text-2xl mb-1">🎉</p>
                        <p className="font-bold text-emerald-700 text-sm">All daily tasks completed!</p>
                        <p className="text-xs text-gray-500 mt-0.5">See you tomorrow for more XP!</p>
                    </div>
                )}
            </div>

            {/* ══ STEP 2 — STREAK MILESTONES ══════════════════════════════ */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-400">
                        <span className="text-white text-xs font-black">2</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Streak Milestones</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Log in every day to unlock — then claim your bonus XP</p>
                    </div>
                    {unclaimedMilestones.length > 0 && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-pulse shadow-sm min-w-max self-start sm:self-auto">
                            🎁 {unclaimedMilestones.length} Ready!
                        </span>
                    )}
                </div>

                {/* State legend */}
                <div className="flex items-center gap-4 mb-4 mt-3 px-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Lock className="w-3 h-3" />Locked — streak not reached</span>
                    <span className="flex items-center gap-1.5 text-xs text-amber-600"><Gift className="w-3 h-3" />Claimable — click Claim!</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600"><Check className="w-3 h-3" />Claimed — bonus collected</span>
                </div>

                <div className="space-y-3">
                    {STREAK_MILESTONES.map(m => {
                        const isClaimed = claimedMilestones.includes(m.days);
                        const isClaimable = !isClaimed && unclaimedMilestones.some(u => u.days === m.days);
                        const isLocked = !isClaimed && !isClaimable;
                        const daysLeft = Math.max(0, m.days - streak);

                        return (
                            <div key={m.days} className={`
                                flex items-center gap-4 rounded-2xl px-5 py-4 border-2 transition-all duration-300
                                ${isClaimed ? 'bg-emerald-50 border-emerald-200 opacity-80' : ''}
                                ${isClaimable ? 'bg-amber-50 border-amber-400 shadow-lg shadow-amber-100' : ''}
                                ${isLocked ? 'bg-gray-50 border-gray-150 opacity-70' : ''}
                            `}>
                                <span className={`text-3xl shrink-0 ${isLocked ? 'grayscale opacity-40' : ''}`}>
                                    {isLocked ? '🔒' : m.icon}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm ${isClaimed ? 'text-emerald-700' : isClaimable ? 'text-amber-900' : 'text-gray-500'}`}>
                                        {m.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {isClaimed && '✅ Bonus already claimed — great work!'}
                                        {isClaimable && m.desc}
                                        {isLocked && `🔒 ${daysLeft} more day${daysLeft !== 1 ? 's' : ''} to unlock`}
                                    </p>
                                    {isLocked && (
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-400 rounded-full transition-all duration-700"
                                                    style={{ width: `${Math.min(100, (streak / m.days) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 shrink-0">{streak}/{m.days}d</span>
                                        </div>
                                    )}
                                </div>

                                <span className={`font-black text-sm shrink-0 ${isClaimed ? 'text-emerald-600' : isClaimable ? 'text-amber-600' : 'text-gray-400'}`}>
                                    +{m.bonus} XP
                                </span>

                                {isClaimed && (
                                    <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl shrink-0">
                                        <Check className="w-3.5 h-3.5" /> Done
                                    </div>
                                )}
                                {isClaimable && (
                                    <button
                                        onClick={() => handleClaimMilestone(m.days)}
                                        disabled={claimingMilestone === m.days}
                                        className="shrink-0 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                                    >
                                        {claimingMilestone === m.days
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Gift className="w-3.5 h-3.5" />}
                                        {claimingMilestone === m.days ? 'Claiming…' : 'Claim!'}
                                    </button>
                                )}
                                {isLocked && (
                                    <div className="flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-2 rounded-xl shrink-0">
                                        <Lock className="w-3.5 h-3.5" /> Locked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══ STATS ROW ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'XP Earned', value: xp, icon: Zap, bg: 'bg-amber-50 border-amber-100', icon_cls: 'text-amber-600' },
                    { label: 'Papers Uploaded', value: stats.totalUploads, icon: Upload, bg: 'bg-blue-50 border-blue-100', icon_cls: 'text-blue-600' },
                    { label: 'Papers Liked', value: stats.totalLikes, icon: BookOpen, bg: 'bg-rose-50 border-rose-100', icon_cls: 'text-rose-600' },
                    { label: 'Downloads', value: stats.totalDownloads, icon: TrendingUp, bg: 'bg-emerald-50 border-emerald-100', icon_cls: 'text-emerald-600' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-2xl p-4 flex flex-col items-center shadow-sm`}>
                        <s.icon className={`w-5 h-5 mb-2 ${s.icon_cls}`} />
                        <span className="text-2xl font-extrabold text-gray-900">{loading ? '—' : s.value}</span>
                        <span className="text-xs text-gray-500 font-medium text-center leading-tight mt-0.5">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ══ STEP 3 — BADGES ════════════════════════════════════════ */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-400">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Badge Collection</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Unlock badges by reaching contribution milestones</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 w-24 overflow-hidden shadow-inner hidden sm:block">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${badgeProgress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{earnedBadges.length}/{badges.length}</span>
                    </div>
                </div>

                {/* Earned badges */}
                {earnedBadges.length > 0 && (
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Earned — {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {earnedBadges.map(badge => (
                                <div key={badge.id} className={`relative flex items-center gap-3 p-4 rounded-2xl border ${badge.color} shadow-sm overflow-hidden transition-transform hover:-translate-y-0.5`}>
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${badge.color} shadow-sm`}>
                                        <badge.Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{badge.label}</p>
                                        <p className="text-xs opacity-70 mt-0.5 truncate">{badge.description}</p>
                                    </div>
                                    <Check className="w-4 h-4 shrink-0 opacity-70" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {earnedBadges.length === 0 && (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center mb-5">
                        <div className="text-4xl mb-3">🎖️</div>
                        <p className="text-gray-500 text-sm font-medium">No badges yet — start uploading to earn your first!</p>
                        <Link to="/dashboard/upload" className="inline-flex items-center gap-1 mt-4 text-primary-600 font-semibold text-sm hover:underline">
                            Upload now <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* Locked badges */}
                {lockedBadges.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Locked — {lockedBadges.length} remaining</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {lockedBadges.map(badge => {
                                const hintDef = BADGE_HINTS.find(h => h.id === badge.id);
                                const hint = hintDef ? hintDef.hint(stats, streak) : badge.description;
                                return (
                                    <div key={badge.id} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70">
                                        <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-400 truncate">{badge.label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{hint}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ══ BOTTOM GRID — HOW TO EARN + LEVEL ROADMAP ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* How to earn XP */}
                <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100 rounded-3xl p-6">
                    <SectionHeader icon={Target} iconClass="bg-indigo-100 text-indigo-600" title="How to Earn XP" />
                    <div className="space-y-2.5">
                        {HOW_TO_EARN.map(item => (
                            <div key={item.action} className={`flex items-center gap-3 border ${item.color} rounded-xl px-4 py-3`}>
                                <span className="text-xl shrink-0">{item.icon}</span>
                                <p className="text-sm font-semibold text-gray-800 flex-1">{item.action}</p>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${item.pill}`}>{item.xp}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-white/60 border border-orange-100 rounded-xl px-4 py-3">
                        <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                        <p className="text-xs text-gray-600">
                            <strong className="text-orange-600">Tip:</strong> Log in every day to keep your 🔥 streak alive and earn bonus XP.
                        </p>
                    </div>
                </div>

                {/* Level Roadmap */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                        <SectionHeader icon={Star} iconClass="bg-amber-100 text-amber-600" title="Level Roadmap" />
                        <div className="space-y-2">
                            {XP_LEVELS.map(lvl => {
                                const isCurrentLevel = lvl.level === currentLevel.level;
                                const isUnlocked = xp >= lvl.minXP;
                                return (
                                    <div key={lvl.level} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 ${isCurrentLevel
                                        ? 'border-primary-200 bg-primary-50 shadow-sm ring-2 ring-primary-100'
                                        : isUnlocked
                                            ? 'border-gray-100 bg-gray-50/50'
                                            : 'border-gray-100 bg-gray-50/30 opacity-50'
                                        }`}>
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lvl.color} flex items-center justify-center shrink-0 shadow-sm`}>
                                            <span className="text-base">{lvl.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${isCurrentLevel ? 'text-primary-700' : 'text-gray-800'}`}>{lvl.label}</p>
                                            <p className="text-xs text-gray-400">
                                                {lvl.minXP} XP{lvl.maxXP < Infinity ? ` – ${lvl.maxXP} XP` : '+'}
                                            </p>
                                        </div>
                                        {isCurrentLevel && (
                                            <span className="text-xs font-bold text-primary-700 bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-full">
                                                Current
                                            </span>
                                        )}
                                        {isUnlocked && !isCurrentLevel && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                                        {!isUnlocked && <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ CTA ═══════════════════════════════════════════════════ */}
            {earnedBadges.length < badges.length && (
                <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center gap-4 shadow-xl">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-base">Keep climbing! 🚀</p>
                            <p className="text-sm opacity-80">
                                {badges.length - earnedBadges.length} badge{badges.length - earnedBadges.length !== 1 ? 's' : ''} left to unlock.
                                Upload more papers to level up faster.
                            </p>
                        </div>
                    </div>
                    <Link to="/dashboard/upload"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4" /> Upload Paper
                    </Link>
                </div>
            )}

            {earnedBadges.length === badges.length && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white flex items-center gap-4 shadow-xl">
                    <Crown className="w-10 h-10 shrink-0 opacity-90" />
                    <div>
                        <p className="font-extrabold text-lg">🏆 All Badges Earned!</p>
                        <p className="text-sm opacity-80">You've mastered the Study Volte rewards system. You're a true Legend!</p>
                    </div>
                    <Shield className="w-10 h-10 shrink-0 opacity-90 ml-auto" />
                </div>
            )}

        </div>
    );
}

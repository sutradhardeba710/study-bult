import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, ArrowRight } from 'lucide-react';

interface NudgeBannerProps {
    totalUploads: number;
    totalDownloads: number;
    streak: number;
    hasPendingPaper: boolean;
}

interface Nudge {
    key: string;
    message: string;
    cta?: { label: string; to: string };
    color: string; // Tailwind classes
}

function getNudge(props: NudgeBannerProps): Nudge | null {
    const { totalUploads, totalDownloads, streak, hasPendingPaper } = props;

    if (hasPendingPaper) {
        return {
            key: 'pending',
            message: 'Your uploaded paper is under review — our team will verify and approve it shortly!',
            color: 'bg-blue-50/80 border-blue-200 text-blue-900',
        };
    }
    if (totalUploads === 0 && totalDownloads >= 1) {
        return {
            key: 'give_back',
            message: `You've downloaded ${totalDownloads} paper${totalDownloads > 1 ? 's' : ''}. Support fellow students by sharing a paper!`,
            cta: { label: 'Upload a paper', to: '/dashboard/upload' },
            color: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
        };
    }
    if (totalUploads === 0) {
        return {
            key: 'first_upload',
            message: 'Be the first to upload a question paper from your college and earn XP!',
            cta: { label: 'Upload now', to: '/dashboard/upload' },
            color: 'bg-violet-50/80 border-violet-200 text-violet-950',
        };
    }
    if (streak <= 1) {
        return {
            key: 'streak',
            message: 'Study daily to build your streak and unlock exclusive contributor badges & bonus XP!',
            color: 'bg-amber-50/80 border-amber-200 text-amber-950',
        };
    }
    return null;
}

const DISMISS_KEY_PREFIX = 'nudge_dismissed_';

export default function NudgeBanner(props: NudgeBannerProps) {
    const nudge = useMemo(() => getNudge(props), [props]);
    const [dismissed, setDismissed] = useState(false);

    // Check if this nudge was dismissed today
    useEffect(() => {
        if (!nudge) return;
        const stored = localStorage.getItem(DISMISS_KEY_PREFIX + nudge.key);
        if (stored === new Date().toISOString().slice(0, 10)) {
            setDismissed(true);
        } else {
            setDismissed(false);
        }
    }, [nudge]);

    if (!nudge || dismissed) return null;

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY_PREFIX + nudge.key, new Date().toISOString().slice(0, 10));
        setDismissed(true);
    };

    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border text-sm font-medium ${nudge.color} shadow-xs backdrop-blur-sm transition-all`}>
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
                </span>
                <span className="truncate">{nudge.message}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {nudge.cta && (
                    <Link
                        to={nudge.cta.to}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 hover:bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs border border-slate-200/80 transition-all hover:shadow-xs"
                    >
                        {nudge.cta.label}
                        <ArrowRight className="w-3 h-3 text-primary-600" />
                    </Link>
                )}
                <button
                    onClick={dismiss}
                    aria-label="Dismiss notification"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export { Upload };

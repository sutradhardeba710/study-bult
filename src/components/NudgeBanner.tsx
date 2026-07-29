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
            message: '⏳ Your paper is under review — hang tight! We\'ll approve it soon.',
            color: 'bg-blue-50 border-blue-200 text-blue-800',
        };
    }
    if (totalUploads === 0 && totalDownloads >= 1) {
        return {
            key: 'give_back',
            message: `📥 You've downloaded ${totalDownloads} paper${totalDownloads > 1 ? 's' : ''}. Give back to the community!`,
            cta: { label: 'Upload yours →', to: '/dashboard/upload' },
            color: 'bg-amber-50 border-amber-200 text-amber-800',
        };
    }
    if (totalUploads === 0) {
        return {
            key: 'first_upload',
            message: '🚀 Be the first to upload a paper from your college!',
            cta: { label: 'Upload now →', to: '/dashboard/upload' },
            color: 'bg-violet-50 border-violet-200 text-violet-800',
        };
    }
    if (streak <= 1) {
        return {
            key: 'streak',
            message: '🔥 Come back tomorrow to start a daily streak and earn bonus XP!',
            color: 'bg-orange-50 border-orange-200 text-orange-800',
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
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${nudge.color} mb-4`}>
            <span className="flex-1">{nudge.message}</span>
            <div className="flex items-center gap-2 shrink-0">
                {nudge.cta && (
                    <Link
                        to={nudge.cta.to}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                        {nudge.cta.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
                <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export { Upload };

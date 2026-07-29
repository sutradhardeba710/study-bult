import type { FC } from 'react';
import { Upload, Star, Trophy, BookOpen, Flame, Zap } from 'lucide-react';

export interface Badge {
    id: string;
    label: string;
    description: string;
    Icon: FC<{ className?: string }>;
    color: string; // Tailwind bg + text classes for the pill
    earned: boolean;
}

interface Stats {
    totalUploads: number;
    totalDownloads: number;
    totalLikes: number;
}

/**
 * Pure function — no Firestore calls needed.
 * Returns all badge definitions with `earned` set based on current stats / streak.
 */
export function getBadges(stats: Stats, streak: number): Badge[] {
    return [
        {
            id: 'first_upload',
            label: 'First Upload',
            description: 'Uploaded your first paper',
            Icon: Upload,
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            earned: stats.totalUploads >= 1,
        },
        {
            id: 'rising_star',
            label: 'Rising Star',
            description: 'Uploaded 5 papers',
            Icon: Star,
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            earned: stats.totalUploads >= 5,
        },
        {
            id: 'community_hero',
            label: 'Community Hero',
            description: 'Uploaded 10+ papers',
            Icon: Trophy,
            color: 'bg-amber-100 text-amber-700 border-amber-200',
            earned: stats.totalUploads >= 10,
        },
        {
            id: 'knowledge_seeker',
            label: 'Knowledge Seeker',
            description: 'Liked 10+ papers',
            Icon: BookOpen,
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            earned: stats.totalLikes >= 10,
        },
        {
            id: 'popular_creator',
            label: 'Popular Creator',
            description: 'Your papers were downloaded 50+ times',
            Icon: Flame,
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            earned: stats.totalDownloads >= 50,
        },
        {
            id: 'streak_master',
            label: 'Streak Master',
            description: '7-day streak achieved',
            Icon: Zap,
            color: 'bg-violet-100 text-violet-700 border-violet-200',
            earned: streak >= 7,
        },
        {
            id: 'flame_legend',
            label: 'Flame Legend',
            description: '30-day streak — unstoppable!',
            Icon: Flame,
            color: 'bg-rose-100 text-rose-700 border-rose-200',
            earned: streak >= 30,
        },
    ];
}

/** Returns only earned badges */
export function getEarnedBadges(stats: Stats, streak: number): Badge[] {
    return getBadges(stats, streak).filter(b => b.earned);
}

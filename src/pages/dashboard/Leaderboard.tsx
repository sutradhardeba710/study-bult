import { useEffect, useState, useMemo } from 'react';
import { Trophy, Zap, Flame, Upload, Medal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers } from '../../services/users';
import { getUserPapers } from '../../services/papers';
import Skeleton from '../../components/Skeleton';

// ─── Shared level config ──────────────────────────────────────────────────────
const XP_LEVELS = [
    { minXP: 0, label: 'Newcomer', icon: '🌱', color: 'bg-slate-100 text-slate-600' },
    { minXP: 100, label: 'Contributor', icon: '📘', color: 'bg-emerald-100 text-emerald-700' },
    { minXP: 300, label: 'Scholar', icon: '🎓', color: 'bg-blue-100 text-blue-700' },
    { minXP: 600, label: 'Expert', icon: '⚡', color: 'bg-violet-100 text-violet-700' },
    { minXP: 1100, label: 'Knowledge Lord', icon: '👑', color: 'bg-amber-100 text-amber-700' },
    { minXP: 2500, label: 'Legend', icon: '🏆', color: 'bg-rose-100 text-rose-700' },
];
function getLevel(xp: number) {
    return XP_LEVELS.filter(l => xp >= l.minXP).at(-1) ?? XP_LEVELS[0];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeaderUser {
    uid: string;
    name: string;
    xp: number;
    streak: number;
    totalUploads: number;
}

// ─── Rank medal colours ───────────────────────────────────────────────────────
const RANK_STYLES: Record<number, { ring: string; bg: string; medal: string }> = {
    1: { ring: 'ring-2 ring-amber-400', bg: 'bg-amber-50', medal: '🥇' },
    2: { ring: 'ring-2 ring-slate-400', bg: 'bg-slate-50', medal: '🥈' },
    3: { ring: 'ring-2 ring-orange-400', bg: 'bg-orange-50', medal: '🥉' },
};

// ─── Avatar initial bubble ────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black shrink-0`}>
            {name?.[0]?.toUpperCase() ?? '?'}
        </div>
    );
}

// ─── Podium Card (rank 1‑3) ───────────────────────────────────────────────────
function PodiumCard({ user, rank }: { user: LeaderUser; rank: number }) {
    const style = RANK_STYLES[rank];
    const level = getLevel(user.xp);
    const heights = { 1: 'pt-4', 2: 'pt-8', 3: 'pt-10' };
    return (
        <div className={`flex flex-col items-center gap-2 ${heights[rank as 1 | 2 | 3]}`}>
            <span className="text-3xl">{style.medal}</span>
            <div className={`${style.ring} rounded-full`}>
                <Avatar name={user.name} size="lg" />
            </div>
            <div className={`${style.bg} rounded-2xl px-4 py-2.5 text-center shadow-sm border border-gray-100 min-w-[110px]`}>
                <p className="font-bold text-gray-900 text-sm truncate max-w-[100px]">{user.name.split(' ')[0]}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${level.color}`}>
                    {level.icon} {level.label}
                </span>
                <p className="text-sm font-black text-amber-600 mt-1">⚡ {user.xp} XP</p>
            </div>
            <div className={`w-full ${rank === 1 ? 'h-24 bg-amber-400' : rank === 2 ? 'h-16 bg-slate-400' : 'h-12 bg-orange-400'} rounded-t-xl opacity-30`} />
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Leaderboard() {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<LeaderUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getAllUsers()
            .then(async (raw) => {
                const withUploads = await Promise.all(
                    raw.map(async u => {
                        const papers = await getUserPapers(u.uid).catch(() => []);
                        return {
                            uid: u.uid,
                            name: (u as any).name || 'Anonymous',
                            xp: (u as any).xp ?? 0,
                            streak: (u as any).streak ?? 0,
                            totalUploads: papers.length,
                        } as LeaderUser;
                    })
                );
                if (!cancelled) {
                    setUsers(withUploads.sort((a, b) => b.xp - a.xp));
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const top10 = useMemo(() => users.slice(0, 10), [users]);
    const podium = useMemo(() => [top10[1], top10[0], top10[2]].filter(Boolean), [top10]); // 2nd, 1st, 3rd visual order
    const tableRows = useMemo(() => top10.slice(3), [top10]);

    // Current user's rank
    const myRank = useMemo(() =>
        userProfile?.uid ? users.findIndex(u => u.uid === userProfile.uid) + 1 : 0,
        [users, userProfile?.uid]
    );
    const myEntry = useMemo(() =>
        userProfile?.uid ? users.find(u => u.uid === userProfile.uid) : null,
        [users, userProfile?.uid]
    );
    const above = myRank > 1 ? users[myRank - 2] : null;
    const xpGap = above && myEntry ? above.xp - myEntry.xp : 0;

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} variant="rect" height={56} />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8 pb-10">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3">
                    <Trophy className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Leaderboard</h1>
                <p className="text-slate-500 font-medium mt-1">Top contributors ranked by XP</p>
            </div>

            {/* Podium */}
            {top10.length >= 3 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div className="relative z-10 flex items-end justify-center gap-4">
                        {/* 2nd */}
                        {podium[0] && <PodiumCard user={podium[0]} rank={2} />}
                        {/* 1st */}
                        {podium[1] && <PodiumCard user={podium[1]} rank={1} />}
                        {/* 3rd */}
                        {podium[2] && <PodiumCard user={podium[2]} rank={3} />}
                    </div>
                </div>
            )}

            {/* Table rows 4–10 */}
            {tableRows.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 divide-y divide-slate-100 overflow-hidden">
                    {tableRows.map((user, idx) => {
                        const rank = idx + 4;
                        const level = getLevel(user.xp);
                        const isMe = user.uid === userProfile?.uid;
                        return (
                            <div
                                key={user.uid}
                                className={`flex items-center gap-3 px-5 py-4 transition-colors ${isMe ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
                            >
                                <span className="w-6 text-sm font-bold text-slate-400 text-center shrink-0">#{rank}</span>
                                <Avatar name={user.name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-bold text-slate-900 truncate">
                                        {user.name.split(' ')[0]}
                                        {isMe && <span className="ml-1.5 text-xs text-violet-600 font-bold">(You)</span>}
                                    </p>
                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${level.color}`}>
                                        {level.icon} {level.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[13px] font-medium text-slate-500 shrink-0">
                                    {user.streak > 0 && (
                                        <span className="flex items-center gap-1 font-bold text-orange-500">
                                            <Flame className="w-4 h-4" />{user.streak}d
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-slate-400">
                                        <Upload className="w-4 h-4" />{user.totalUploads}
                                    </span>
                                    <span className="flex items-center gap-1 font-black text-amber-600 text-sm">
                                        <Zap className="w-4 h-4" />{user.xp}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Your rank card — only if outside top 10 */}
            {myRank > 0 && myEntry && myRank > 10 && (
                <div className="bg-violet-600 rounded-3xl shadow-lg px-5 py-4 text-white flex items-center gap-4">
                    <Medal className="w-8 h-8 shrink-0 opacity-80" />
                    <div className="flex-1">
                        <p className="text-sm font-bold">Your Rank</p>
                        <p className="text-lg font-extrabold">#{myRank}</p>
                        {xpGap > 0 && (
                            <p className="text-xs text-violet-200 mt-0.5">
                                {xpGap} XP away from #{myRank - 1} — keep going! 🚀
                            </p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-black">⚡ {myEntry.xp}</p>
                        <p className="text-xs text-violet-200">XP</p>
                    </div>
                </div>
            )}

            {/* If user is in top 10 — highlight callout */}
            {myRank > 0 && myRank <= 10 && (
                <div className="text-center text-sm text-violet-700 font-semibold bg-violet-50 rounded-2xl py-3 border border-violet-100">
                    🎉 You're in the <strong>Top 10</strong>! Keep it up!
                </div>
            )}

            <p className="text-center text-xs text-gray-400">Rankings update in real-time · Based on total XP earned</p>
        </div>
    );
}

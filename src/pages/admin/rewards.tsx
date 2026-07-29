import React, { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllUsers, updateUser, type UserProfile } from '../../services/users';
import { getBadges } from '../../utils/badges';
import { getUserPapers, getUserDownloads, getUserLikeEvents } from '../../services/papers';
import toast from 'react-hot-toast';
import {
    PanelLeft, Trophy, Zap, Flame, Award, Search,
    ChevronUp, ChevronDown, Pencil, X, Check,
    TrendingUp, Users, Star, RefreshCw
} from 'lucide-react';

// ─── XP Level helper ──────────────────────────────────────────────────────────
const XP_LEVELS = [
    { level: 1, label: 'Newcomer', minXP: 0, color: 'bg-slate-100 text-slate-700', icon: '🌱' },
    { level: 2, label: 'Contributor', minXP: 100, color: 'bg-emerald-100 text-emerald-700', icon: '📘' },
    { level: 3, label: 'Scholar', minXP: 300, color: 'bg-blue-100 text-blue-700', icon: '🎓' },
    { level: 4, label: 'Expert', minXP: 600, color: 'bg-violet-100 text-violet-700', icon: '⚡' },
    { level: 5, label: 'Knowledge Lord', minXP: 1100, color: 'bg-amber-100 text-amber-700', icon: '👑' },
    { level: 6, label: 'Legend', minXP: 2500, color: 'bg-rose-100 text-rose-700', icon: '🏆' },
];
function getLevel(xp: number) {
    return XP_LEVELS.filter(l => xp >= l.minXP).at(-1) ?? XP_LEVELS[0];
}

// ─── Extended user type with stats ───────────────────────────────────────────
interface UserWithStats extends UserProfile {
    xp: number;
    streak: number;
    totalUploads: number;
    totalDownloads: number;
    totalLikes: number;
    earnedBadges: number;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditXPModalProps {
    user: UserWithStats;
    onClose: () => void;
    onSave: (uid: string, xp: number, streak: number) => Promise<void>;
}

const EditXPModal: React.FC<EditXPModalProps> = ({ user, onClose, onSave }) => {
    // String state = user can freely clear and type any value
    const [xpStr, setXpStr] = useState(String(user.xp));
    const [streakStr, setStreakStr] = useState(String(user.streak));
    const [saving, setSaving] = useState(false);

    // Live parsed values for preview (never NaN)
    const xpNum = Math.max(0, parseInt(xpStr, 10) || 0);
    const streakNum = Math.max(0, parseInt(streakStr, 10) || 0);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(user.uid, xpNum, streakNum);
            onClose();
        } catch {
            // error already toasted inside onSave
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-violet-600" /> Edit Rewards
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User info card */}
                <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* XP Points */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" /> XP Points
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            autoFocus
                            value={xpStr}
                            onChange={e => setXpStr(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={() => setXpStr(String(xpNum))}
                            placeholder="e.g. 150"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Level preview: {getLevel(xpNum).icon} <span className="font-semibold">{getLevel(xpNum).label}</span>
                        </p>

                        {/* Quick XP preset buttons */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {[
                                { label: '0 — Newcomer', val: 0 },
                                { label: '50 — Contributor', val: 50 },
                                { label: '150 — Scholar', val: 150 },
                                { label: '300 — Expert', val: 300 },
                                { label: '500 — Knowledge Lord', val: 500 },
                                { label: '1000 — Legend', val: 1000 },
                            ].map(p => (
                                <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setXpStr(String(p.val))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${xpNum === p.val
                                        ? 'bg-violet-600 text-white border-violet-600'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Streak */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-orange-500" /> Daily Streak (days)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={streakStr}
                            onChange={e => setStreakStr(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={() => setStreakStr(String(streakNum))}
                            placeholder="e.g. 7"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <div className="flex gap-2 mt-2">
                            {[0, 3, 7, 14, 30].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setStreakStr(String(d))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${streakNum === d
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                                        }`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2 shadow"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminRewards: React.FC = () => {
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'xp' | 'streak' | 'uploads' | 'downloads' | 'badges'>('xp');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [editUser, setEditUser] = useState<UserWithStats | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchUsersWithStats = async () => {
        setLoading(true);
        try {
            const rawUsers = await getAllUsers();
            const usersWithStats: UserWithStats[] = await Promise.all(
                rawUsers.map(async (u) => {
                    const [papers, likes, downloads] = await Promise.all([
                        getUserPapers(u.uid).catch(() => []),
                        getUserLikeEvents(u.uid).catch(() => []),
                        getUserDownloads(u.uid).catch(() => []),
                    ]);
                    const xp = (u as any).xp ?? 0;
                    const streak = (u as any).streak ?? 0;
                    const stats = { totalUploads: papers.length, totalLikes: likes.length, totalDownloads: downloads.length };
                    const earnedBadges = getBadges(stats, streak).filter(b => b.earned).length;
                    return {
                        ...u,
                        xp,
                        streak,
                        totalUploads: papers.length,
                        totalLikes: likes.length,
                        totalDownloads: downloads.length,
                        earnedBadges,
                    };
                })
            );
            setUsers(usersWithStats);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load rewards data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsersWithStats(); }, []);

    const handleSaveXP = async (uid: string, xp: number, streak: number) => {
        try {
            await updateUser(uid, { xp, streak } as any);
            setUsers(prev => prev.map(u => u.uid === uid
                ? { ...u, xp, streak, earnedBadges: getBadges({ totalUploads: u.totalUploads, totalLikes: u.totalLikes, totalDownloads: u.totalDownloads }, streak).filter(b => b.earned).length }
                : u
            ));
            toast.success('Rewards updated ✅');
        } catch (err) {
            toast.error('Failed to update rewards');
            throw err;
        }
    };

    const handleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const displayed = useMemo(() => {
        const filtered = users.filter(u =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        );
        const key = { xp: 'xp', streak: 'streak', uploads: 'totalUploads', downloads: 'totalDownloads', badges: 'earnedBadges' }[sortBy] as keyof UserWithStats;
        return [...filtered].sort((a, b) => {
            const aVal = (a[key] as number) ?? 0;
            const bVal = (b[key] as number) ?? 0;
            return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
    }, [users, search, sortBy, sortDir]);

    const totalXP = users.reduce((s, u) => s + u.xp, 0);
    const activeStreaks = users.filter(u => u.streak >= 3).length;
    const badgesEarned = users.reduce((s, u) => s + u.earnedBadges, 0);
    const topUser = users.reduce<UserWithStats | null>((top, u) => (!top || u.xp > top.xp) ? u : top, null);

    const SortIcon = ({ col }: { col: typeof sortBy }) =>
        sortBy === col
            ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3 inline ml-1" /> : <ChevronUp className="w-3 h-3 inline ml-1" />)
            : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <button
                className="md:hidden fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
            >
                <PanelLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex flex-col md:flex-row">
                <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 max-w-7xl">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-amber-500" /> Rewards Control
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">Monitor &amp; modify XP, streaks, and badges for all users.</p>
                        </div>
                        <button
                            onClick={fetchUsersWithStats}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Users', value: users.length, icon: Users, bg: 'bg-blue-50 border-blue-100', ic: 'text-blue-600' },
                            { label: 'Total XP Distributed', value: totalXP, icon: Zap, bg: 'bg-amber-50 border-amber-100', ic: 'text-amber-600' },
                            { label: 'Active Streakers (3+ days)', value: activeStreaks, icon: Flame, bg: 'bg-orange-50 border-orange-100', ic: 'text-orange-600' },
                            { label: 'Total Badges Earned', value: badgesEarned, icon: Award, bg: 'bg-violet-50 border-violet-100', ic: 'text-violet-600' },
                        ].map(c => (
                            <div key={c.label} className={`${c.bg} border rounded-2xl p-4 flex flex-col gap-1 shadow-sm`}>
                                <c.icon className={`w-5 h-5 mb-1 ${c.ic}`} />
                                <span className="text-2xl font-extrabold text-gray-900">{loading ? '—' : c.value}</span>
                                <span className="text-xs text-gray-500 font-medium leading-tight">{c.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Top Performer Banner */}
                    {!loading && topUser && (
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 mb-6 text-white flex items-center gap-4 shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-black shrink-0">
                                {getLevel(topUser.xp).icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">🏆 Top XP Performer</p>
                                <p className="font-extrabold text-lg truncate">{topUser.name}</p>
                                <p className="text-sm opacity-80 truncate">{topUser.email}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-3xl font-extrabold">{topUser.xp}</p>
                                <p className="text-xs opacity-80">XP · {getLevel(topUser.xp).label}</p>
                            </div>
                            <div className="text-right shrink-0 hidden sm:block">
                                <p className="text-2xl font-extrabold">🔥 {topUser.streak}</p>
                                <p className="text-xs opacity-80">Day Streak</p>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        />
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
                                <span className="ml-3 text-gray-500 font-medium">Loading rewards data...</span>
                            </div>
                        ) : displayed.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">No users found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Level</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:text-violet-600" onClick={() => handleSort('xp')}>
                                                XP <SortIcon col="xp" />
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:text-orange-600" onClick={() => handleSort('streak')}>
                                                Streak <SortIcon col="streak" />
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:text-blue-600 hidden md:table-cell" onClick={() => handleSort('uploads')}>
                                                Uploads <SortIcon col="uploads" />
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:text-emerald-600 hidden lg:table-cell" onClick={() => handleSort('downloads')}>
                                                Downloads <SortIcon col="downloads" />
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:text-amber-600" onClick={() => handleSort('badges')}>
                                                Badges <SortIcon col="badges" />
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {displayed.map((user, idx) => {
                                            const lvl = getLevel(user.xp);
                                            const isTopRow = idx === 0 && sortBy === 'xp' && sortDir === 'desc';
                                            return (
                                                <tr key={user.uid} className={`hover:bg-gray-50/70 transition-colors ${isTopRow ? 'bg-amber-50/50' : ''}`}>
                                                    <td className="px-4 py-3 font-bold text-gray-400">
                                                        {idx === 0 && sortBy === 'xp' && sortDir === 'desc' ? '🥇'
                                                            : idx === 1 && sortBy === 'xp' && sortDir === 'desc' ? '🥈'
                                                                : idx === 2 && sortBy === 'xp' && sortDir === 'desc' ? '🥉'
                                                                    : `#${idx + 1}`}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                                {user.name?.[0]?.toUpperCase() ?? '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-900 truncate max-w-[140px]">{user.name}</p>
                                                                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${lvl.color}`}>
                                                            {lvl.icon} {lvl.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-extrabold text-amber-600">⚡ {user.xp}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`font-bold ${user.streak >= 7 ? 'text-orange-600' : user.streak >= 3 ? 'text-orange-400' : 'text-gray-400'}`}>
                                                            🔥 {user.streak}d
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center hidden md:table-cell">
                                                        <span className="font-semibold text-blue-600">{user.totalUploads}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                                                        <span className="font-semibold text-emerald-600">{user.totalDownloads}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-bold text-amber-600">🏅 {user.earnedBadges}/6</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => setEditUser(user)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition shadow-sm"
                                                        >
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Badge Distribution */}
                    {!loading && users.length > 0 && (
                        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
                                <Star className="w-4 h-4 text-amber-500" /> Badge Distribution Overview
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { id: 'first_upload', label: 'First Upload', emoji: '📤', check: (u: UserWithStats) => u.totalUploads >= 1 },
                                    { id: 'rising_star', label: 'Rising Star', emoji: '⭐', check: (u: UserWithStats) => u.totalUploads >= 5 },
                                    { id: 'community_hero', label: 'Community Hero', emoji: '🏆', check: (u: UserWithStats) => u.totalUploads >= 10 },
                                    { id: 'knowledge_seeker', label: 'Knowledge Seeker', emoji: '📚', check: (u: UserWithStats) => u.totalLikes >= 10 },
                                    { id: 'popular_creator', label: 'Popular Creator', emoji: '🔥', check: (u: UserWithStats) => u.totalDownloads >= 50 },
                                    { id: 'streak_master', label: 'Streak Master', emoji: '⚡', check: (u: UserWithStats) => u.streak >= 7 },
                                ].map(badge => {
                                    const count = users.filter(badge.check).length;
                                    const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                                    return (
                                        <div key={badge.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                            <div className="text-2xl mb-1">{badge.emoji}</div>
                                            <p className="text-xs font-semibold text-gray-700 leading-tight mb-1">{badge.label}</p>
                                            <p className="text-lg font-extrabold text-gray-900">{count}</p>
                                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{pct}% of users</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Level Distribution */}
                    {!loading && users.length > 0 && (
                        <div className="mt-4 mb-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-violet-500" /> Level Distribution
                            </h2>
                            <div className="space-y-2.5">
                                {XP_LEVELS.map(lvl => {
                                    const count = users.filter(u => getLevel(u.xp).level === lvl.level).length;
                                    const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                                    return (
                                        <div key={lvl.level} className="flex items-center gap-3">
                                            <span className="w-28 text-xs font-semibold text-gray-600 truncate">{lvl.icon} {lvl.label}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-6 text-xs font-bold text-gray-700 text-right">{count}</span>
                                            <span className="w-10 text-xs text-gray-400 text-right">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Edit Modal */}
            {editUser && (
                <EditXPModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={handleSaveXP}
                />
            )}
        </div>
    );
};

export default AdminRewards;

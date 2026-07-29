import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Heart,
  Settings,
  LogOut,
  User,
  Trophy,
  BarChart2,
  X,
  Search,
  HelpCircle,
  HomeIcon,
  ChevronRight,
  Coins,
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import { subscribeWallet } from '../services/coins';

const DashboardSidebar = ({ onClose }: { onClose?: () => void }) => {
  const { userProfile, currentUser, logout } = useAuth();
  const location = useLocation();
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeWallet(currentUser.uid, (wallet) => setCoinBalance(wallet.available));
  }, [currentUser?.uid]);

  const avatarUrl = currentUser?.photoURL || userProfile?.avatar || null;
  const displayName = userProfile?.name || 'User';
  const initials = displayName.trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-primary-600', bg: 'bg-primary-50' },
    { name: 'Upload Paper', href: '/dashboard/upload', icon: Upload, color: 'text-violet-600', bg: 'bg-violet-50' },
    { name: 'My Uploads', href: '/dashboard/my-uploads', icon: FolderOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
    { name: 'Liked Papers', href: '/dashboard/likes', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Earnings', href: '/dashboard/earnings', icon: Coins, color: 'text-amber-700', bg: 'bg-amber-50', separatorBefore: true },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  const exploreLinks = [
    { name: 'Home', href: '/', icon: HomeIcon, color: 'text-indigo-500' },
    { name: 'Browse Papers', href: '/browse', icon: Search, color: 'text-teal-500' },
    { name: 'Help Center', href: '/help-center', icon: HelpCircle, color: 'text-orange-400' },
  ];

  const handleLogout = async () => {
    try { await logout(); }
    catch (error) { console.error('Logout error:', error); }
  };

  return (
    <div className="h-full flex flex-col bg-white sm:rounded-3xl ring-1 ring-slate-900/5 shadow-xl overflow-hidden sm:h-[calc(100vh-3rem)]">

      {/* ── Gradient Header ── */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 px-5 pt-5 pb-5 shrink-0">

        {/* Close button — mobile only */}
        {onClose && (
          <button
            className="md:hidden absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Logo — navigates to Home, does NOT close sidebar */}
        <Link to="/" className="flex items-center gap-2.5 mb-5 group">
          <img
            src="/logo-optimized.webp?v=8"
            alt="Study Volte"
            className="h-8 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 2px rgba(255,255,255,1))' }}
            width={128}
            height={32}
          />
          <span className="text-lg font-black text-white tracking-tight">Study Volte</span>
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" width={44} height={44} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                {initials
                  ? <span className="text-sm font-black text-white select-none">{initials}</span>
                  : <User className="w-5 h-5 text-white" />}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate leading-tight">{displayName}</p>
            <p className="text-[11px] text-white/60 truncate mt-0.5">{userProfile?.email || ''}</p>
            <div className="flex items-center gap-2 mt-1">
              {(userProfile?.streak ?? 0) > 0 && (
                <span className="text-[11px] font-bold text-orange-300">🔥 {userProfile?.streak}d</span>
              )}
              <span className="text-[11px] font-semibold text-yellow-300">⚡ {userProfile?.xp ?? 0} XP</span>
            </div>
          </div>
          {/* Notification bell — desktop only */}
          <span className="hidden md:flex shrink-0 text-white/80">
            <NotificationsPanel />
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 no-scrollbar">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu</p>

        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${item.separatorBefore ? 'mt-3 before:absolute before:-top-2 before:left-3 before:right-3 before:h-px before:bg-slate-100' : ''} ${isActive
                ? 'bg-primary-50 ring-1 ring-primary-200/60 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {/* Active left bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
              )}

              {/* Icon badge */}
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors ${isActive ? `${item.bg} ${item.color}` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                <item.icon className="w-4 h-4" />
              </span>

              <span className="text-sm font-semibold tracking-tight flex-1">{item.name}</span>

              {item.name === 'Earnings' && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                  ₹{(coinBalance / 100).toFixed(0)}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              )}
            </Link>
          );
        })}

        {/* ── Explore (mobile & desktop) ── */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Explore</p>
          {exploreLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 shrink-0">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </span>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Logout ── */}
      <div className="shrink-0 px-3 pb-4 pt-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors shrink-0">
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </span>
          <span className="tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
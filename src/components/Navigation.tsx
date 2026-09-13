import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, User, Upload, Home, LogOut, Shield, Settings, HelpCircle,
  MessageCircle, FileQuestion, Search, FileText, Landmark,
  GraduationCap, FlaskConical, Briefcase, BookOpen, ChevronDown,
  ArrowRight, Menu, Sparkles, Bell, Megaphone
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SystemNoticeModal from './SystemNoticeModal';

// Rich browse menu — hover, click, outside-click, and Escape support
function BrowsePapersDropdown({ active = false }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 120);
  };
  const closeMenu = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const menuLink = 'group flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-all hover:bg-primary-50/80 hover:text-primary-700';

  return (
    <div className="relative" ref={ref} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        className={`nav-link flex items-center gap-1.5 px-3 text-sm font-medium transition-colors ${
          active ? 'text-primary-600 font-semibold' : 'text-slate-700 hover:text-slate-900'
        }`}
      >
        <span>Browse Papers</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-2.5" role="menu">
          <div className="nav-dropdown-panel grid w-[680px] grid-cols-[1.4fr_1fr] gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10">
            <div className="space-y-4 p-1">
              <div>
                <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  By University &amp; College
                </p>
                <div className="space-y-1">
                  <Link
                    to="/universities/tripura/mbbu-question-papers"
                    onClick={() => setOpen(false)}
                    className={menuLink}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary-600 shrink-0">
                      <Landmark className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-semibold text-slate-800 group-hover:text-primary-700">MBBU</strong>
                      <span className="block truncate text-xs text-slate-500">Maharaja Bir Bikram University</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary-500 opacity-0 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>

                  <Link
                    to="/universities/tripura/bbmc-question-papers"
                    onClick={() => setOpen(false)}
                    className={menuLink}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-semibold text-slate-800 group-hover:text-violet-700">BBMC</strong>
                      <span className="block truncate text-xs text-slate-500">Bir Bikram Memorial College</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-violet-500 opacity-0 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>

                  <Link
                    to="/universities/tripura"
                    onClick={() => setOpen(false)}
                    className={menuLink}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-semibold text-slate-800 group-hover:text-emerald-700">Tripura Hub</strong>
                      <span className="block truncate text-xs text-slate-500">All Colleges in Tripura</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </div>
              </div>

              <div>
                <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Popular Degree Courses
                </p>
                <div className="grid grid-cols-4 gap-1.5 px-1">
                  {[
                    ['BA', '/courses/ba'],
                    ['BSc', '/courses/bsc'],
                    ['BCom', '/courses/bcom'],
                    ['BCA', '/courses/bca'],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/60 py-2 text-center text-xs font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-primary-50/80 via-slate-50 to-indigo-50/60 p-4 border border-primary-100/50">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Quick Picks</p>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/browse?search=Semester%201"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-primary-700 transition-colors"
                  >
                    <span>1st Semester Papers</span>
                    <span className="text-[10px] text-slate-400">Freshers</span>
                  </Link>
                  <Link
                    to="/browse?search=Semester%206"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-primary-700 transition-colors"
                  >
                    <span>6th Semester Papers</span>
                    <span className="text-[10px] text-slate-400">Final Year</span>
                  </Link>
                  <Link
                    to="/exams/cuet"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-primary-700 transition-colors"
                  >
                    <span>CUET UG Papers</span>
                    <span className="text-[10px] text-primary-600 font-semibold">Exams</span>
                  </Link>
                  <Link
                    to="/guides"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-primary-700 transition-colors"
                  >
                    <span>Study &amp; Exam Guides</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              <Link
                to="/browse"
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white shadow-sm shadow-primary-500/20 transition-all hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/30"
              >
                <span>Browse All Papers</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone dropdown for Support
function SupportDropdown({ links, active = false }: { links: { name: string; href: string; icon: any }[]; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-current={active ? 'page' : undefined}
        className={`nav-link flex items-center gap-1.5 px-3 text-sm font-medium transition-colors ${
          active ? 'text-primary-600 font-semibold' : 'text-slate-700 hover:text-slate-900'
        }`}
      >
        <span>Support</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 pt-2.5">
          <div className="nav-dropdown-panel w-56 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10">
            {links.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-50/80 hover:text-primary-700"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ userProfile, avatarPreview, handleLogout }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 pr-2.5 border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-500/20 shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" width={32} height={32} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              {userProfile?.name
                ? <span className="text-xs font-bold text-white select-none">{userProfile.name[0].toUpperCase()}</span>
                : <User className="w-4 h-4 text-white" />}
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
          {userProfile?.name || 'Account'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 pt-2.5">
          <div className="w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5">
            {/* User Header */}
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
              {userProfile?.role === 'admin' && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200/60">
                  <Shield className="w-3 h-3" /> Administrator
                </span>
              )}
            </div>

            {/* Links */}
            <div className="py-1 space-y-0.5">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to render cropped avatar using canvas
function getCroppedAvatarUrl(imageUrl: string, crop: { x: number; y: number; width: number; height: number; zoom: number } | null | undefined, callback: (url: string) => void) {
  if (!imageUrl || !crop) {
    callback(imageUrl);
    return;
  }
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return callback(imageUrl);
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        callback(url);
      } else {
        callback(imageUrl);
      }
    }, 'image/jpeg', 0.95);
  };
  img.onerror = () => callback(imageUrl);
  img.src = imageUrl;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navQuery, setNavQuery] = useState('');
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);
  const navSearchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check notice dismissal status
  useEffect(() => {
    try {
      const dismissedDate = localStorage.getItem('sv_notice_dismissed_today');
      const today = new Date().toDateString();
      if (dismissedDate !== today) {
        setHasUnreadNotice(true);
      } else {
        setHasUnreadNotice(false);
      }
    } catch {
      // safe fallback
    }
  }, [isNoticeOpen]);

  const handleCloseNoticeToday = () => {
    try {
      localStorage.setItem('sv_notice_dismissed_today', new Date().toDateString());
    } catch {
      // safe fallback
    }
    setHasUnreadNotice(false);
    setIsNoticeOpen(false);
  };

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    let isActive = true;

    if (userProfile?.avatarOriginal && userProfile.avatarCrop) {
      getCroppedAvatarUrl(userProfile.avatarOriginal, userProfile.avatarCrop, (url) => {
        if (!isActive) {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
          return;
        }
        if (url.startsWith('blob:')) {
          objectUrlToRevoke = url;
        }
        setAvatarPreview(url);
      });
    } else if (userProfile?.avatarOriginal) {
      setAvatarPreview(userProfile.avatarOriginal);
    } else if (currentUser?.photoURL) {
      setAvatarPreview(currentUser.photoURL);
    } else {
      setAvatarPreview(undefined);
    }

    return () => {
      isActive = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [userProfile?.avatarOriginal, userProfile?.avatarCrop, currentUser?.photoURL]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let frame = 0;
    const updateNavigation = () => {
      frame = 0;
      const top = window.scrollY;
      const available = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setIsScrolled(top > 16);
      setScrollProgress(Math.min((top / available) * 100, 100));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateNavigation);
    };
    updateNavigation();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navSearchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const submitNavSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = navQuery.trim();
    navigate(query ? `/browse?search=${encodeURIComponent(query)}` : '/browse');
  };

  const isActive = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  // Desktop navigation
  const desktopNavigation = [
    { name: 'Home', href: currentUser ? '/browse' : '/' },
    { name: 'Browse Papers', href: '/browse' },
    { name: 'Study Guides', href: '/guides' },
  ];

  // Mobile navigation
  const mobileNavigation = [
    { name: 'Home', href: currentUser ? '/browse' : '/', icon: Home },
    { name: 'All Papers', href: '/browse', icon: FileText },
    { name: 'Upload Paper', href: '/upload', icon: Upload },
    ...(currentUser ? [{ name: 'Dashboard', href: '/dashboard', icon: User }] : []),
    ...(userProfile?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help-center', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: FileQuestion },
    { name: 'Contact Us', href: '/contact', icon: MessageCircle },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header
        data-scrolled={isScrolled}
        className={`sv-nav sticky top-0 z-50 transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-slate-200/80 shadow-sm shadow-slate-900/5'
            : 'bg-white/95 backdrop-blur-sm border-slate-200/50'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* ── Brand Logo ── */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/" className="group flex items-center gap-2.5 transition-transform active:scale-98" aria-label="Study Volte home">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-200/60 shadow-sm transition-all group-hover:border-primary-300 group-hover:shadow-md group-hover:shadow-primary-500/10">
                  <img
                    src="/logo-optimized.webp?v=8"
                    alt="Study Volte"
                    className="h-6 w-auto transition-transform group-hover:scale-105"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[19px] font-black tracking-tight text-slate-900">
                    Study<span className="text-primary-600">Volte</span>
                  </span>
                  <span className="hidden rounded-full bg-primary-50 border border-primary-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700 xl:inline">
                    Tripura
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
              {desktopNavigation.map((item) => {
                if (item.name === 'Browse Papers') {
                  return (
                    <BrowsePapersDropdown
                      key={item.name}
                      active={
                        location.pathname.startsWith('/browse') ||
                        location.pathname.startsWith('/universities') ||
                        location.pathname.startsWith('/courses')
                      }
                    />
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`nav-link px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 font-semibold'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <SupportDropdown
                links={supportLinks}
                active={['/help-center', '/faq', '/contact'].some(path => location.pathname.startsWith(path))}
              />
            </nav>

            {/* ── Right Action Controls ── */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {/* Quick Search Shell */}
              <form onSubmit={submitNavSearch} role="search" className="nav-search-shell relative flex h-9 w-[210px] items-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 transition-all focus-within:w-[260px] focus-within:border-primary-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/15">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="nav-paper-search" className="sr-only">Search papers</label>
                <input
                  ref={navSearchRef}
                  id="nav-paper-search"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  placeholder="Search papers…"
                  className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 shadow-2xs">
                  Ctrl K
                </kbd>
              </form>

              {/* System Notices & Updates Bell */}
              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/80 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 active:scale-95 shadow-2xs"
                title="System Notices & Platform Updates"
                aria-label="System Notices and Platform Updates"
              >
                <Bell className="h-4 w-4" />
                {hasUnreadNotice && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-500/20" />
                  </span>
                )}
              </button>

              {/* Upload Paper CTA */}
              <Link
                to="/upload"
                aria-current={isActive('/upload') ? 'page' : undefined}
                className="nav-upload inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-primary-500/20 transition-all hover:from-primary-700 hover:to-indigo-700 hover:shadow-md hover:shadow-primary-500/25 active:scale-98"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Paper</span>
              </Link>

              {/* User Profile or Login/Register */}
              {currentUser ? (
                <ProfileDropdown
                  userProfile={userProfile}
                  avatarPreview={avatarPreview}
                  handleLogout={handleLogout}
                />
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className="btn-login inline-flex items-center justify-center rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-98"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-register inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-98"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger, Notice Bell & Quick Search ── */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/80 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                aria-label="Platform Updates and Notices"
              >
                <Bell className="h-4 w-4" />
                {hasUnreadNotice && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
                  </span>
                )}
              </button>
              <Link
                to="/browse"
                aria-label="Search question papers"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Search className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <span
          className="nav-progress absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 transition-transform duration-75"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
          aria-hidden="true"
        />
      </header>

      {/* ── Mobile Slide-Over Drawer ── */}
      <div
        className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
        style={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className="lg:hidden fixed top-0 right-0 z-50 h-full w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col"
        style={{
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 border border-primary-200/60">
              <img src="/logo-optimized.webp?v=8" alt="" className="h-5 w-auto" width={24} height={24} />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              Study<span className="text-primary-600">Volte</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer User Card or Welcome */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-50 to-indigo-50/60 p-3 border border-primary-100/60">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary-500/20 shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" width={40} height={40} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                    {userProfile?.name
                      ? <span className="text-sm font-bold text-white select-none">{userProfile.name[0].toUpperCase()}</span>
                      : <User className="w-5 h-5 text-white" />}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{userProfile?.name || 'Student'}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile?.email || ''}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-primary-50/40 p-3 border border-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-700">Tripura Academic Library</p>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">Access and share previous year exam papers with ease.</p>
            </div>
          )}

          {/* Quick Search inside Drawer */}
          <form
            onSubmit={(e) => {
              submitNavSearch(e);
              setIsMobileMenuOpen(false);
            }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs"
          >
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search papers, courses..."
              className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </form>
        </div>

        {/* Drawer Scrollable Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Quick Notice Trigger */}
          <div>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNoticeOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-indigo-500/10 border border-amber-200/70 p-2.5 text-left text-xs font-bold text-slate-800 transition-all hover:bg-amber-100/40 active:scale-98"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                  <Megaphone className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="font-bold text-slate-800">Platform Notices</span>
                  <span className="text-[11px] font-normal text-slate-500">Updates, Earning &amp; Guidelines</span>
                </span>
              </span>
              {hasUnreadNotice && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  NEW
                </span>
              )}
            </button>
          </div>

          <div>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
            <div className="space-y-0.5">
              {mobileNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-primary-50/80 hover:text-primary-700 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Explore Papers</p>
            <div className="space-y-0.5">
              {[
                { name: 'Tripura Universities Hub', href: '/universities/tripura', icon: Landmark },
                { name: 'MBBU Question Papers', href: '/universities/tripura/mbbu-question-papers', icon: BookOpen },
                { name: 'BBMC Question Papers', href: '/universities/tripura/bbmc-question-papers', icon: BookOpen },
                { name: 'BA Degree Papers', href: '/courses/ba', icon: GraduationCap },
                { name: 'BSc Degree Papers', href: '/courses/bsc', icon: FlaskConical },
                { name: 'BCom Degree Papers', href: '/courses/bcom', icon: Briefcase },
                { name: 'CUET UG Exams', href: '/exams/cuet', icon: Sparkles },
                { name: 'Study & Exam Guides', href: '/guides', icon: FileText },
              ].map(({ name, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-primary-50/80 hover:text-primary-700 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Support &amp; Help</p>
            <div className="space-y-0.5">
              {supportLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-primary-50/80 hover:text-primary-700 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 shrink-0">
          {currentUser ? (
            <div className="space-y-2">
              <Link
                to="/dashboard/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── System Notice Modal ── */}
      <SystemNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        onCloseToday={handleCloseNoticeToday}
      />
    </>
  );
};

export default Navigation;

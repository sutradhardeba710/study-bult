import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, User, Upload, Home, LogOut, Shield, Settings, HelpCircle, MessageCircle, FileQuestion, Search, FileText, Landmark, GraduationCap, FlaskConical, Briefcase, BookOpen, ChevronDown, ArrowRight, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

  const menuLink = 'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#4a5570] transition hover:bg-primary-50 hover:text-primary-700';
  return (
    <div className="relative" ref={ref} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        className="nav-link flex items-center gap-1.5 px-3 text-sm font-medium"
      >
        Browse Papers <ChevronDown className={`h-3.5 w-3.5 text-[#8a93ad] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-30 -translate-x-1/2 pt-3" role="menu">
          <div className="nav-dropdown-panel grid w-[620px] grid-cols-[1.35fr_.85fr] gap-2 p-2">
            <div className="p-2">
              <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a93ad]">By university</p>
              <Link to="/universities/tripura/mbbu-question-papers" onClick={() => setOpen(false)} className={menuLink}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary-700"><Landmark className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#0b1020]">MBBU</strong><span className="block truncate text-xs text-[#8a93ad]">Maharaja Bir Bikram University</span></span><ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" /></Link>
              <Link to="/universities/tripura/bbmc-question-papers" onClick={() => setOpen(false)} className={menuLink}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><BookOpen className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#0b1020]">BBMC</strong><span className="block truncate text-xs text-[#8a93ad]">Bir Bikram Memorial College</span></span><ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" /></Link>
              <p className="px-2 pb-2 pt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a93ad]">By course</p>
              <div className="grid grid-cols-4 gap-2 px-2">
                {[['BA','/courses/ba'],['BSc','/courses/bsc'],['BCom','/courses/bcom'],['BCA','/courses/bca']].map(([label, href]) => <Link key={href} to={href} onClick={() => setOpen(false)} className="rounded-lg border border-[#e6eaf5] bg-[#fbfcff] px-2 py-2 text-center text-xs font-bold text-[#4a5570] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700">{label}</Link>)}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-700">Quick picks</p>
              <div className="mt-3 space-y-1">
                <Link to="/browse?search=Semester%201" onClick={() => setOpen(false)} className={menuLink}>Semester 1</Link>
                <Link to="/browse?search=Political%20Science" onClick={() => setOpen(false)} className={menuLink}>Political Science</Link>
                <Link to="/browse" onClick={() => setOpen(false)} className={menuLink}>Recently added <ArrowRight className="ml-auto h-4 w-4" /></Link>
              </div>
              <Link to="/browse" onClick={() => setOpen(false)} className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 transition hover:-translate-y-0.5">Browse all papers</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Standalone dropdown for Support — hover + click, closes on outside click or link navigation
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
        className="nav-link flex items-center gap-1.5 px-3 text-sm font-medium outline-none"
      >
        <span>Support</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#8a93ad] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 pt-3">
          <div className="nav-dropdown-panel w-56 p-2">
            {links.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-[#4a5570] transition hover:bg-primary-50 hover:text-primary-700"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
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
    <div className="relative profile-dropdown-container" ref={ref} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center space-x-2 focus:outline-none cursor-pointer rounded-full pr-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary-100 transition-all shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" width={40} height={40} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500 via-primary-500 to-indigo-600 flex items-center justify-center">
              {userProfile?.name
                ? <span className="text-sm font-black text-white select-none">{userProfile.name[0].toUpperCase()}</span>
                : <User className="w-4 h-4 text-white" />}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
          {userProfile?.name || 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 pt-2">
          <div className="bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg w-56 origin-top-right">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.name}</p>
              <p className="text-sm text-gray-500 truncate">{userProfile?.email}</p>
            </div>
            <div className="py-1">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-[#4a5570] transition hover:bg-primary-50 hover:text-primary-700"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-[#4a5570] transition hover:bg-primary-50 hover:text-primary-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
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
  const navSearchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      // Fall back to Google / OAuth profile photo
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
      setIsScrolled(top > 24);
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
        setIsScrolled(true);
        window.requestAnimationFrame(() => navSearchRef.current?.focus());
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
    { name: 'Home', href: currentUser ? '/browse' : '/', icon: Home },
    { name: 'Browse Papers', href: '/browse', icon: Search },
    ...(currentUser ? [{ name: 'Dashboard', href: '/dashboard', icon: User }] : []),
    ...(userProfile?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
  ];

  // Mobile navigation
  const mobileNavigation = [
    { name: 'Home', href: currentUser ? '/browse' : '/', icon: Home },
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
      <nav data-scrolled={isScrolled} className="sv-nav sticky top-0 z-50 border-b">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className={`flex justify-between transition-[height] duration-300 ${isScrolled ? 'h-16' : 'h-16 lg:h-[72px]'}`}>
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="group flex items-center gap-2.5" aria-label="Study Volte home">
                <span className="nav-logo-mark flex h-10 w-10 items-center justify-center rounded-xl"><img src="/logo-optimized.webp?v=8" alt="" className="h-8 w-auto" width={128} height={32} /></span>
                <span className="whitespace-nowrap text-[19px] font-black tracking-[-0.02em] text-[#0b1020]">Study <span className="text-primary-600">Volte</span></span>
                <span className="hidden rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-primary-700 xl:inline">Tripura</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {desktopNavigation.map((item) => {
                if (item.name === 'Browse Papers') {
                  return <BrowsePapersDropdown key={item.name} active={location.pathname.startsWith('/browse') || location.pathname.startsWith('/universities') || location.pathname.startsWith('/courses')} />;
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="nav-link flex items-center px-3 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                );
              })}



              <SupportDropdown links={supportLinks} active={['/help-center', '/faq', '/contact'].some(path => location.pathname.startsWith(path))} />

              {/* Upload Paper Link - Visible to all users */}
              <Link
                to="/upload"
                aria-current={isActive('/upload') ? 'page' : undefined}
                className="nav-upload flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-bold"
              >
                <Upload className="h-4 w-4" /> Upload Paper
              </Link>
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden items-center gap-3 lg:flex">
              <form onSubmit={submitNavSearch} role="search" className={`nav-search-shell hidden h-10 items-center overflow-hidden rounded-full xl:flex ${isScrolled ? 'w-[220px] px-3 opacity-100' : 'pointer-events-none w-0 border-transparent px-0 opacity-0'}`}>
                <Search className="h-4 w-4 shrink-0 text-[#8a93ad]" aria-hidden="true" />
                <label htmlFor="nav-paper-search" className="sr-only">Search papers</label>
                <input ref={navSearchRef} id="nav-paper-search" value={navQuery} onChange={(event) => setNavQuery(event.target.value)} placeholder="Search papers…" className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[#0b1020] outline-none placeholder:text-[#8a93ad]" />
                <span className="rounded-md border border-[#e6eaf5] bg-[#fbfcff] px-1.5 py-0.5 text-[9px] font-bold text-[#8a93ad]">Ctrl K</span>
              </form>
              <div className={`hidden h-6 w-px bg-[#e6eaf5] transition-opacity xl:block ${isScrolled ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <ProfileDropdown
                    userProfile={userProfile}
                    avatarPreview={avatarPreview}
                    handleLogout={handleLogout}
                  />
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    aria-current={isActive('/login') ? 'page' : undefined}
                    className="btn-login flex min-h-11 items-center px-2 text-sm font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary btn-register cta-shine px-[18px] text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger button */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                to="/browse"
                aria-label="Search question papers"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <Search className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6eaf5] bg-white text-[#4a5570] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        <span className="nav-progress absolute inset-x-0 bottom-0 h-0.5 origin-left" style={{ transform: `scaleX(${scrollProgress / 100})` }} aria-hidden="true" />
      </nav>

      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="lg:hidden fixed top-0 right-0 z-50 h-full w-[88vw] max-w-sm bg-white shadow-2xl flex flex-col"
        style={{
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: isMobileMenuOpen ? 'transform' : 'auto',
        }}
      >
        {/* ── Drawer header ── */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 px-5 pt-5 pb-6 shrink-0">
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 mb-4">
            <img src="/logo-optimized.webp?v=8" alt="Study Volte Logo" className="h-7 w-auto" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 2px rgba(255,255,255,1))' }} width={112} height={28} />
            <span className="text-base font-bold text-white">Study Volte</span>
          </Link>

          {/* User profile card (if logged in) or guest greeting */}
          {currentUser ? (
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" width={44} height={44} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                    {userProfile?.name
                      ? <span className="text-sm font-black text-white select-none">{userProfile.name[0].toUpperCase()}</span>
                      : <User className="w-5 h-5 text-white" />}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'User'}</p>
                <p className="text-[11px] text-white/60 truncate">{userProfile?.email || ''}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold text-white">Welcome to Study Volte</p>
              <p className="text-[11px] text-white/60 mt-0.5">Sign in to upload &amp; earn rewards</p>
            </div>
          )}
        </div>

        {/* ── Nav links (scrollable) ── */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">

          {/* Main nav */}
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Menu</p>
          {mobileNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150 group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors shrink-0">
                <item.icon className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
              </span>
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          ))}

          {/* Explore / SILO section */}
          <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Explore Papers</p>
          {[
            { name: 'All Question Papers', href: '/browse', icon: FileText },
            { name: 'Tripura Universities', href: '/universities/tripura', icon: Landmark },
            { name: 'BA Papers', href: '/courses/ba', icon: GraduationCap },
            { name: 'BSc Papers', href: '/courses/bsc', icon: FlaskConical },
            { name: 'BCom Papers', href: '/courses/bcom', icon: Briefcase },
            { name: 'Study Guides', href: '/guides', icon: BookOpen },
          ].map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150 group"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors shrink-0"><Icon className="w-4 h-4 text-gray-500 group-hover:text-primary-600" /></span>
              <span className="text-sm font-semibold">{name}</span>
            </Link>
          ))}

          {/* Support section */}
          <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Support</p>
          {supportLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150 group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors shrink-0">
                <item.icon className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
              </span>
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* ── Bottom auth area ── */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-4 space-y-2">
          {currentUser ? (
            <>
              <Link
                to="/dashboard/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-11 flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="min-h-11 flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-11 flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-11 flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-200 transition-all duration-150"
              >
                Create Free Account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;

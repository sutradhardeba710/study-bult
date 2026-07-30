import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, CheckCircle, ChevronDown, Facebook,
  Instagram, Linkedin, LockKeyhole, Mail, MapPin, Send, ShieldCheck,
  Twitter, Youtube,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

const quickLinks = [
  { to: '/browse', label: 'Browse papers' },
  { to: '/upload', label: 'Upload a paper', badge: 'New' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About Study Volte' },
];

const browseLinks = [
  { to: '/universities/tripura/mbbu-question-papers', label: 'MBBU papers' },
  { to: '/universities/tripura/bbmc-question-papers', label: 'BBMC papers' },
  { to: '/courses/ba', label: 'BA papers' },
  { to: '/courses/bsc', label: 'BSc papers' },
  { to: '/browse?search=Semester%201', label: 'Semester 1–6' },
];

const supportLinks = [
  { to: '/help-center', label: 'Help center' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact us' },
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms of service' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61586033282836', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com/@studybult', label: 'X' },
  { icon: Instagram, href: 'https://www.instagram.com/studybult/', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com/company/studyvolte', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://www.youtube.com/@StudyVolte', label: 'YouTube' },
];

type FooterLink = { to: string; label: string; badge?: string };

const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
    setSubscribed(true);
    window.setTimeout(() => setSubscribed(false), 4000);
  };

  const LinkColumn = ({ id, title, links }: { id: string; title: string; links: FooterLink[] }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-white/10 py-1 md:border-0 md:py-0">
        <button
          type="button"
          onClick={() => setOpenSection(isOpen ? null : id)}
          aria-expanded={isOpen}
          className="flex min-h-14 w-full items-center justify-between text-left md:hidden"
        >
          <span className="text-sm font-black uppercase tracking-[0.1em] text-white">{title}</span>
          <ChevronDown className={`h-5 w-5 text-[#b7c2dc] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <h3 className="mb-5 hidden text-[13px] font-black uppercase tracking-[0.1em] text-white md:block">{title}</h3>
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 md:!grid-rows-[1fr] md:!opacity-100 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <ul className="space-y-1 pb-4 md:space-y-2.5 md:pb-0">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#b7c2dc]">
                    <ArrowRight className="footer-link-arrow h-3.5 w-3.5 text-primary-300" />
                    <span>{link.label}</span>
                    {link.badge && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">{link.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const Newsletter = ({ className = '' }: { className?: string }) => (
    <div className={className}>
      <h3 className="mb-4 text-[13px] font-black uppercase tracking-[0.1em] text-white">Stay updated</h3>
      <p className="mb-4 text-sm leading-6 text-[#95a2c0]">Useful paper updates and exam tips. No noise.</p>
      <form onSubmit={handleNewsletterSubmit} className="mb-5">
        {subscribed ? (
          <div role="status" className="flex min-h-11 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 text-sm font-bold text-emerald-300">
            <CheckCircle className="h-4 w-4" /> You're in
          </div>
        ) : (
          <div className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="news-input min-w-0 flex-1 px-3.5 text-sm"
            />
            <button type="submit" aria-label="Subscribe to updates" className="news-send flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/30">
              <Send className="h-4 w-4 transition-transform duration-200" />
            </button>
          </div>
        )}
      </form>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#95a2c0]">Follow Study Volte</p>
      <div className="flex flex-wrap gap-2.5">
        {socialLinks.map(({ icon: Icon, href, label }, index) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="sv-social" style={{ transitionDelay: `${index * 20}ms` }}>
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <footer className="sv-footer relative overflow-hidden">
      <div className="sv-footer-glow-line" aria-hidden="true" />
      <div className="sv-footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path className="wave-one" d="M0,48 C240,110 480,10 720,44 C960,78 1200,18 1440,56 L1440,120 L0,120 Z" />
          <path className="wave-two" d="M0,64 C260,120 520,26 780,58 C1040,90 1240,34 1440,70 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">

        <div className="grid gap-0 py-12 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.25fr_.72fr_.72fr_.72fr_1.15fr] lg:gap-8 lg:py-16">
          <div className="pb-8 md:pb-0">
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="nav-logo-mark flex h-11 w-11 items-center justify-center rounded-xl"><img src="/logo-optimized.webp?v=8" alt="" className="h-8 w-auto" width={128} height={32} /></span>
              <span className="text-xl font-black tracking-tight text-white">Study <span className="text-primary-300">Volte</span></span>
            </Link>
            <p className="mt-5 max-w-[30ch] text-sm leading-7 text-[#95a2c0]">A focused academic library for finding, checking, and sharing previous-year question papers.</p>
            <div className="mt-6 space-y-2.5">
              <a href="mailto:support@study-volte.site" className="contact-row"><span className="contact-icon"><Mail className="h-4 w-4" /></span><span className="text-sm text-[#b7c2dc]">support@study-volte.site</span></a>
              <div className="contact-row"><span className="contact-icon"><MapPin className="h-4 w-4" /></span><span className="text-sm text-[#b7c2dc]">Tripura, India</span></div>
            </div>
          </div>
          <LinkColumn id="quick" title="Quick links" links={quickLinks} />
          <LinkColumn id="browse" title="Browse" links={browseLinks} />
          <LinkColumn id="support" title="Support" links={supportLinks} />
          <Newsletter className="border-t border-white/10 pt-7 md:border-0 md:pt-0" />
        </div>

        <div className="footer-divider h-px" aria-hidden="true" />
        <div className="grid gap-4 py-6 text-center sm:text-left lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs text-[#7c89a8] sm:text-sm">© {new Date().getFullYear()} Study Volte · Made with <span className="heart-beat inline-block text-rose-400" aria-label="love">♥</span> for students.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#7c89a8] sm:justify-start">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />Papers reviewed</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary-300" />Made in Tripura</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-amber-300" />No paywall</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-1 text-xs text-[#7c89a8] sm:text-sm lg:justify-end">
            <Link to="/privacy" className="rounded-lg px-2 py-1.5 transition hover:bg-white/5 hover:text-white">Privacy</Link><span className="py-1.5 text-white/20">·</span>
            <Link to="/terms" className="rounded-lg px-2 py-1.5 transition hover:bg-white/5 hover:text-white">Terms</Link><span className="py-1.5 text-white/20">·</span>
            <Link to="/cookie-policy" className="rounded-lg px-2 py-1.5 transition hover:bg-white/5 hover:text-white">Cookies</Link><span className="py-1.5 text-white/20">·</span>
            <Link to="/sitemap" className="rounded-lg px-2 py-1.5 transition hover:bg-white/5 hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`back-to-top fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-300 ${showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  );
};

export default Footer;
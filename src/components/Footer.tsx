import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, CheckCircle, ChevronDown, Facebook,
  Instagram, Linkedin, LockKeyhole, Mail, MapPin, Send, ShieldCheck,
  Twitter, Youtube, Heart, Sparkles, Activity
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

const universityLinks = [
  { to: '/universities/tripura/mbbu-question-papers', label: 'MBBU Question Papers' },
  { to: '/universities/tripura/mbbu-ma-question-papers', label: 'MBBU MA Papers', badge: 'PG' },
  { to: '/universities/tripura/bbmc-question-papers', label: 'BBMC Question Papers' },
  { to: '/universities/tripura', label: 'Tripura University Hub' },
  { to: '/browse?search=Tripura', label: 'All Tripura Colleges' },
];

const programLinks = [
  { to: '/courses/ba', label: 'BA Question Papers' },
  { to: '/courses/bsc', label: 'BSc Question Papers' },
  { to: '/courses/bcom', label: 'BCom Question Papers' },
  { to: '/courses/bca', label: 'BCA Question Papers' },
  { to: '/exams/cuet', label: 'CUET (UG) Papers', badge: 'Exam' },
  { to: '/exams/ssc', label: 'SSC & Govt Exams' },
];

const resourceLinks = [
  { to: '/guides/how-to-use-previous-year-papers', label: 'How to Use PYQs' },
  { to: '/guides/exam-preparation-strategy', label: 'Exam Prep Strategy' },
  { to: '/guides/are-questions-repeated-in-exams', label: 'Are Questions Repeated?' },
  { to: '/upload', label: 'Upload & Earn Coins', badge: 'Earn' },
  { to: '/help-center', label: 'Help Center' },
  { to: '/faq', label: 'FAQ' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61586033282836', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com/@studybult', label: 'X (Twitter)' },
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
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    window.setTimeout(() => setSubscribed(false), 4000);
  };

  const LinkColumn = ({ id, title, links }: { id: string; title: string; links: FooterLink[] }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-slate-800/80 py-3 md:border-0 md:py-0">
        <button
          type="button"
          onClick={() => setOpenSection(isOpen ? null : id)}
          aria-expanded={isOpen}
          className="flex min-h-12 w-full items-center justify-between text-left md:hidden"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <h3 className="mb-4 hidden text-xs font-bold uppercase tracking-wider text-slate-300 md:block">{title}</h3>
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 md:!grid-rows-[1fr] md:!opacity-100 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <ul className="space-y-2 pb-3 md:space-y-2.5 md:pb-0">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="footer-link inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="footer-link-arrow h-3 w-3 text-primary-400 opacity-0 -translate-x-1 transition-all" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-primary-500/15 border border-primary-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <footer className="sv-footer relative overflow-hidden bg-slate-950 text-slate-400">
      {/* Top Ambient Glow Accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid gap-8 pb-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr_1.1fr] lg:gap-8">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Study Volte home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                <img src="/logo-optimized.webp?v=8" alt="" className="h-6 w-auto" width={28} height={28} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Study<span className="text-primary-400">Volte</span>
              </span>
            </Link>

            <p className="max-w-[32ch] text-xs leading-relaxed text-slate-400">
              Tripura's focused academic vault for finding, downloading, and sharing previous-year question papers and exam guides.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="mailto:support@study-volte.site"
                className="contact-row inline-flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-950 text-primary-400">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span>support@study-volte.site</span>
              </a>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span>Agartala, Tripura, India</span>
              </div>
            </div>

            {/* Platform Status */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>All Academic Repositories Active</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <LinkColumn id="universities" title="Universities" links={universityLinks} />
          <LinkColumn id="programs" title="Programs & Exams" links={programLinks} />
          <LinkColumn id="resources" title="Guides & Support" links={resourceLinks} />

          {/* Newsletter & Community Column */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                <h3>Paper Alerts</h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Receive notifications when new semester papers or exam guides are uploaded.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              {subscribed ? (
                <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-400">
                  <CheckCircle className="h-4 w-4" /> You're subscribed!
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your student email"
                    autoComplete="email"
                    required
                    className="news-input min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to paper alerts"
                    className="news-send flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm hover:bg-primary-500 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </form>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Connect with Study Volte</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="sv-social flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/90 pt-6" aria-hidden="true" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Study Volte. Dedicated to university students across Tripura &amp; Northeast India.</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Verified Papers</span>
              <span className="inline-flex items-center gap-1"><LockKeyhole className="h-3 w-3 text-amber-500" /> Free &amp; Open Access</span>
              <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-rose-500" /> Student Powered</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end gap-3 text-xs">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span className="text-slate-700">·</span>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span className="text-slate-700">·</span>
            <Link to="/cookie-policy" className="hover:text-slate-300 transition-colors">Cookies</Link>
            <span className="text-slate-700">·</span>
            <Link to="/copyright" className="hover:text-slate-300 transition-colors">DMCA</Link>
            <span className="text-slate-700">·</span>
            <Link to="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Floating Back to Top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`back-to-top fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-300 ${
          showTop ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  );
};

export default Footer;
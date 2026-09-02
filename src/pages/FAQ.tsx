import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = '',
}) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All', icon: '✦' },
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'papers', label: 'Papers', icon: '📄' },
  { id: 'downloads', label: 'Downloads', icon: '📥' },
  { id: 'uploads', label: 'My Uploads', icon: '📤' },
  { id: 'rewards', label: 'Rewards & XP', icon: '🏆' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'technical', label: 'Technical', icon: '🔧' },
];

// ─── Category colour map ──────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'getting-started': 'bg-violet-50 text-violet-700 border-violet-200',
  papers: 'bg-blue-50 text-blue-700 border-blue-200',
  downloads: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  uploads: 'bg-orange-50 text-orange-700 border-orange-200',
  rewards: 'bg-amber-50 text-amber-700 border-amber-200',
  account: 'bg-pink-50 text-pink-700 border-pink-200',
  technical: 'bg-slate-50 text-slate-700 border-slate-200',
};

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  // ── Getting Started ──
  {
    category: 'getting-started',
    q: 'What is Study Volte?',
    a: (
      <p>
        Study Volte is a <strong>free, student-powered platform</strong> where you can share,
        discover, and download academic question papers from colleges across India. Our goal is
        to help students prepare smarter for exams by providing free access to previous-year
        papers — contributed by students like you.
      </p>
    ),
  },
  {
    category: 'getting-started',
    q: 'Is Study Volte completely free?',
    a: (
      <div className="space-y-2">
        <p>Yes — <strong>100% free, forever.</strong> You can:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Browse all papers without an account.</li>
          <li>Preview PDFs in-browser for free.</li>
          <li>Download papers for free (guest or logged-in).</li>
          <li>Create an account to upload papers, earn rewards, and access your dashboard.</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'getting-started',
    q: 'How do I create an account?',
    a: (
      <div className="space-y-2">
        <p>Click <strong>Register</strong> in the top navigation. You have two options:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Email sign-up:</strong> Enter your name, email, and password. Verify your email to activate.</li>
          <li><strong>Google Sign-In:</strong> One-tap sign-in with your Google account — no password needed.</li>
        </ul>
        <p>After registering, complete your profile by setting your college, course, and semester so papers are personalised to you.</p>
      </div>
    ),
  },
  {
    category: 'getting-started',
    q: 'Do I need an account to use Study Volte?',
    a: (
      <p>
        No! <strong>Guests can browse and download papers</strong> without creating an account.
        However, signing up unlocks: uploading papers, liking papers, earning XP and badges,
        your personal dashboard, notifications, and the leaderboard.
      </p>
    ),
  },
  {
    category: 'getting-started',
    q: 'What browsers and devices are supported?',
    a: (
      <p>
        Study Volte works on all modern browsers (Chrome, Firefox, Edge, Safari) on{' '}
        <strong>desktop, tablet, and mobile</strong>. The PDF viewer renders in-browser on all
        devices. For best experience, use Chrome or Edge on desktop.
      </p>
    ),
  },

  // ── Papers ──
  {
    category: 'papers',
    q: 'How do I find a specific paper?',
    a: (
      <div className="space-y-2">
        <p>Go to the <Link to="/browse" className="text-indigo-600 font-medium hover:underline">Browse page</Link> and use the filters:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>College/University:</strong> Select your institution.</li>
          <li><strong>Course:</strong> e.g., B.Tech, BCA, MBA.</li>
          <li><strong>Semester:</strong> 1st to 8th semester.</li>
          <li><strong>Subject:</strong> Search or pick from the list.</li>
          <li><strong>Exam Type:</strong> Mid-term, End-term, Supplementary, etc.</li>
        </ul>
        <p>Results update instantly as you filter. No search button needed.</p>
      </div>
    ),
  },
  {
    category: 'papers',
    q: 'How do I preview a paper before downloading?',
    a: (
      <p>
        Click any paper card to open the <strong>built-in PDF Viewer</strong>. You can read
        through the entire paper directly in your browser — scroll through all pages, zoom in,
        and decide whether to download. No app required.
      </p>
    ),
  },
  {
    category: 'papers',
    q: 'Can I like a paper?',
    a: (
      <p>
        Yes! Click the ❤️ heart icon on any paper card or inside the PDF viewer. Liked papers
        are saved to <strong>Dashboard &rarr; Liked Papers</strong> for quick access later.
        Liking a paper also earns the author <strong>+3 XP</strong> as a reward for sharing.
        You can unlike anytime.
      </p>
    ),
  },
  {
    category: 'papers',
    q: 'How many papers are available?',
    a: (
      <p>
        The library grows every day as students upload new papers. We currently host papers
        from <strong>multiple colleges and universities</strong> covering dozens of courses.
        If you cannot find your paper, consider uploading it yourself to help others — and
        earn XP in the process!
      </p>
    ),
  },
  {
    category: 'papers',
    q: 'Are the papers verified or moderated?',
    a: (
      <p>
        All papers are uploaded by registered students. We rely on the community to flag
        incorrect or inappropriate content. If you spot a mislabelled or wrong paper, please{' '}
        <a href="mailto:support@study-volte.site" className="text-indigo-600 font-medium hover:underline">
          email our support team
        </a>{' '}
        or use the Contact page and we will review it promptly.
      </p>
    ),
  },

  // ── Downloads ──
  {
    category: 'downloads',
    q: 'How do I download a paper?',
    a: (
      <div className="space-y-2">
        <p>Two easy ways:</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Click the <strong>Download</strong> button directly on any paper card in Browse.</li>
          <li>Open the paper in the PDF viewer, then click the <strong>download icon</strong> in the toolbar.</li>
        </ol>
        <p>Downloads are instant — no waiting, no queue. The file is saved as a PDF on your device.</p>
      </div>
    ),
  },
  {
    category: 'downloads',
    q: 'Is there a download limit?',
    a: (
      <p>
        <strong>No limits.</strong> You can download as many papers as you want, as many
        times as you want — completely free. There are no daily caps or premium tiers.
      </p>
    ),
  },
  {
    category: 'downloads',
    q: 'Do I need to log in to download?',
    a: (
      <p>
        No. <strong>Guest users can download papers freely</strong> without creating an
        account. Logging in is only required for uploading, liking, and earning rewards.
      </p>
    ),
  },
  {
    category: 'downloads',
    q: 'Why does the PDF not open or download?',
    a: (
      <div className="space-y-2">
        <p>Try these steps:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Check your internet connection and reload the page.</li>
          <li>Try a different browser (Chrome or Edge recommended).</li>
          <li>Disable browser extensions that block pop-ups or downloads.</li>
          <li>Clear your browser cache and try again.</li>
        </ul>
        <p>If the problem persists, <a href="mailto:support@study-volte.site" className="text-indigo-600 font-medium hover:underline">contact support</a> with the paper link.</p>
      </div>
    ),
  },
  {
    category: 'downloads',
    q: 'Do downloads give the paper author any benefit?',
    a: (
      <p>
        Yes! Every time someone downloads a paper, the <strong>author earns +5 XP</strong>{' '}
        in our rewards system. This incentivises students to upload quality content and share
        their resources with the community.
      </p>
    ),
  },

  // ── Uploads ──
  {
    category: 'uploads',
    q: 'How do I upload a paper?',
    a: (
      <div className="space-y-2">
        <ol className="list-decimal ml-5 space-y-1">
          <li>Log in to your account (registration is free).</li>
          <li>Go to <Link to="/upload" className="text-indigo-600 font-medium hover:underline">Upload</Link> in the nav, or <strong>Dashboard &rarr; Upload Paper</strong>.</li>
          <li>Fill in all required details: College, Course, Semester, Subject, Exam Year, Exam Type.</li>
          <li>Attach your <strong>PDF file</strong> (only PDFs accepted).</li>
          <li>Click <strong>Submit</strong>. Your paper is published immediately and visible to all students.</li>
        </ol>
      </div>
    ),
  },
  {
    category: 'uploads',
    q: 'What file types can I upload?',
    a: (
      <p>
        Only <strong>PDF files</strong> are accepted. This ensures consistent viewing and
        downloading across all devices. Please convert your paper to PDF before uploading.
        Tools like Microsoft Print to PDF, Google Drive, or SmallPDF can help.
      </p>
    ),
  },
  {
    category: 'uploads',
    q: 'Can I edit or delete a paper I uploaded?',
    a: (
      <p>
        Yes. Go to <strong>Dashboard &rarr; My Uploads</strong>. Each listing has an{' '}
        <strong>Edit</strong> button (to update details like subject, semester, or year)
        and a <strong>Delete</strong> button. Deletions are permanent and cannot be undone.
      </p>
    ),
  },
  {
    category: 'uploads',
    q: 'Are there any upload restrictions?',
    a: (
      <div className="space-y-2">
        <p><strong className="text-emerald-700">Allowed:</strong></p>
        <ul className="list-disc ml-5 space-y-0.5 text-gray-600">
          <li>Genuine academic question papers and previous-year exam papers.</li>
          <li>Model papers and university-issued question sets.</li>
        </ul>
        <p className="mt-2"><strong className="text-red-600">Not allowed:</strong></p>
        <ul className="list-disc ml-5 space-y-0.5 text-gray-600">
          <li>Answer sheets, study guides, or notes (not question papers).</li>
          <li>Plagiarised or copyright-infringing content.</li>
          <li>Password-protected or corrupted PDF files.</li>
          <li>Any content not related to academic exams.</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'uploads',
    q: 'Do I earn anything for uploading papers?',
    a: (
      <div className="space-y-2">
        <p>Absolutely! Every upload benefits you through the Rewards system:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Complete the <strong>Upload a Paper</strong> daily task to earn <strong>+8 XP</strong>.</li>
          <li>Earn <strong>+5 XP every time someone downloads</strong> your paper.</li>
          <li>Earn <strong>+3 XP every time someone likes</strong> your paper.</li>
          <li>Unlock badges like <em>Rising Star</em> (5 uploads) and <em>Community Hero</em> (10 uploads).</li>
        </ul>
      </div>
    ),
  },

  // ── Rewards ──
  {
    category: 'rewards',
    q: 'What is the Rewards system?',
    a: (
      <p>
        Study Volte has a gamified <strong>XP (Experience Points)</strong> system. You earn
        XP by completing daily tasks, uploading papers, and getting likes and downloads.
        XP levels you up through 6 ranks — from <em>Newcomer</em> to <em>Legend</em> — and
        unlocks exclusive badges. Track everything on{' '}
        <Link to="/dashboard/rewards" className="text-indigo-600 font-medium hover:underline">
          Dashboard &rarr; Rewards
        </Link>.
      </p>
    ),
  },
  {
    category: 'rewards',
    q: 'How do I earn XP?',
    a: (
      <div className="space-y-2">
        <p>XP is earned across multiple activities:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {[
            { e: '📅', a: 'Daily Check-In', x: '+5 XP/day' },
            { e: '📤', a: 'Upload Paper (daily task)', x: '+8 XP' },
            { e: '❤️', a: 'Your paper gets liked', x: '+3 XP/like' },
            { e: '📥', a: 'Your paper gets downloaded', x: '+5 XP/dl' },
            { e: '🔥', a: '7-day login streak', x: '+20 XP' },
            { e: '🔥', a: '14-day login streak', x: '+50 XP' },
            { e: '🔥', a: '30-day login streak', x: '+100 XP' },
          ].map(r => (
            <div key={r.a} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <span className="text-base shrink-0">{r.e}</span>
              <span className="text-sm text-gray-700 flex-1">{r.a}</span>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{r.x}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    category: 'rewards',
    q: 'What are the XP Levels / Ranks?',
    a: (
      <div className="space-y-2">
        <p>There are 6 levels, each with a unique title:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {[
            { i: '🌱', l: 'Newcomer', r: '0 – 99 XP', c: 'bg-slate-50 border-slate-200' },
            { i: '📘', l: 'Contributor', r: '100 – 299 XP', c: 'bg-emerald-50 border-emerald-200' },
            { i: '🎓', l: 'Scholar', r: '300 – 599 XP', c: 'bg-blue-50 border-blue-200' },
            { i: '⚡', l: 'Expert', r: '600 – 1,099 XP', c: 'bg-violet-50 border-violet-200' },
            { i: '👑', l: 'Knowledge Lord', r: '1,100 – 2,499 XP', c: 'bg-amber-50 border-amber-200' },
            { i: '🏆', l: 'Legend', r: '2,500+ XP', c: 'bg-rose-50 border-rose-200' },
          ].map(lv => (
            <div key={lv.l} className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 ${lv.c}`}>
              <span className="text-xl">{lv.i}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{lv.l}</p>
                <p className="text-xs text-gray-500">{lv.r}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    category: 'rewards',
    q: 'What are Daily Tasks?',
    a: (
      <div className="space-y-2">
        <p>
          Each day, a fresh set of tasks appears on your{' '}
          <Link to="/dashboard/rewards" className="text-indigo-600 font-medium hover:underline">Rewards page</Link>.
          Complete the action, then click <strong>Claim</strong> to collect your XP.
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Daily Login</strong> — just log in today (+5 XP).</li>
          <li><strong>Upload a Paper</strong> — share any question paper (+8 XP).</li>
          <li><strong>Like a Paper</strong> — like any paper you find useful (+3 XP).</li>
          <li><strong>Visit Rewards Page</strong> — check your rewards dashboard (+5 XP).</li>
        </ul>
        <p className="text-sm text-gray-500 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
          Tasks reset every midnight. Come back daily to keep earning!
        </p>
      </div>
    ),
  },
  {
    category: 'rewards',
    q: 'What is a Streak and how does it work?',
    a: (
      <p>
        Your <strong>streak counter</strong> increases by 1 every day you log in. Miss a
        day and your streak resets to 0. Maintaining a streak unlocks bonus XP milestones
        at <strong>7 days (+20 XP)</strong>, <strong>14 days (+50 XP)</strong>, and{' '}
        <strong>30 days (+100 XP)</strong>. Your streak is shown on the Rewards page and
        the Dashboard home.
      </p>
    ),
  },
  {
    category: 'rewards',
    q: 'What are Badges and how do I earn them?',
    a: (
      <div className="space-y-2">
        <p>Badges are achievement medals you collect by reaching milestones:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>🌟 <strong>First Upload</strong> — upload your very first paper.</li>
          <li>🚀 <strong>Rising Star</strong> — upload 5 papers.</li>
          <li>🦸 <strong>Community Hero</strong> — upload 10 papers.</li>
          <li>📚 <strong>Knowledge Seeker</strong> — like 10 papers.</li>
          <li>🌟 <strong>Popular Creator</strong> — get 50 total downloads on your papers.</li>
          <li>🔥 <strong>Streak Master</strong> — maintain a 7-day login streak.</li>
        </ul>
        <p>Earned badges display on your Rewards page and, in future, on your public profile.</p>
      </div>
    ),
  },
  {
    category: 'rewards',
    q: 'Where can I see the Leaderboard?',
    a: (
      <p>
        Go to <Link to="/dashboard/leaderboard" className="text-indigo-600 font-medium hover:underline">
          Dashboard &rarr; Leaderboard
        </Link>{' '}
        to see the top contributors ranked by XP. Your rank is shown so you can see how far
        you are from the next position. The leaderboard updates in real time as XP is earned.
      </p>
    ),
  },

  // ── Account ──
  {
    category: 'account',
    q: 'How do I update my profile?',
    a: (
      <p>
        Go to <Link to="/dashboard/settings" className="text-indigo-600 font-medium hover:underline">
          Dashboard &rarr; Settings
        </Link>.
        You can update your <strong>display name, college, course, semester</strong>, and
        <strong> profile picture</strong> (with a built-in avatar cropper). Changes are
        saved instantly.
      </p>
    ),
  },
  {
    category: 'account',
    q: 'How do I reset my password?',
    a: (
      <p>
        On the <Link to="/login" className="text-indigo-600 font-medium hover:underline">Login page</Link>,
        click <strong>Forgot Password?</strong>. Enter your registered email address and
        we will send you a secure reset link. The link expires after <strong>1 hour</strong>{' '}
        for security. Check your spam folder if you do not receive the email.
      </p>
    ),
  },
  {
    category: 'account',
    q: 'Can I sign in with Google?',
    a: (
      <p>
        Yes! Click <strong>Sign in with Google</strong> on the Login or Register page.
        If it is your first time, you will be prompted to complete your profile (college,
        course, semester) after authentication. Subsequent logins are instant.
      </p>
    ),
  },
  {
    category: 'account',
    q: 'How do I delete my account?',
    a: (
      <p>
        Account deletion is currently handled by our support team. Email{' '}
        <a href="mailto:support@study-volte.site" className="text-indigo-600 font-medium hover:underline">
          support@study-volte.site
        </a>{' '}
        with your request and registered email address. All your data including uploads,
        likes, and XP will be permanently removed.
      </p>
    ),
  },
  {
    category: 'account',
    q: 'How do I report inappropriate or incorrect content?',
    a: (
      <p>
        Email{' '}
        <a href="mailto:support@study-volte.site" className="text-indigo-600 font-medium hover:underline">
          support@study-volte.site
        </a>{' '}
        with the link to the paper and a brief description of the issue. We review all
        reports within 24–48 hours and remove content that violates our guidelines.
      </p>
    ),
  },

  // ── Technical ──
  {
    category: 'technical',
    q: 'Why is a paper not loading in the viewer?',
    a: (
      <div className="space-y-2">
        <ul className="list-disc ml-5 space-y-1">
          <li>Reload the page and try again.</li>
          <li>Check your internet connection stability.</li>
          <li>Try a different browser (Chrome recommended).</li>
          <li>Disable ad-blockers or browser extensions temporarily.</li>
          <li>Try downloading the paper directly instead of previewing.</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'technical',
    q: 'Is my data secure on Study Volte?',
    a: (
      <p>
        Yes. Study Volte is built on <strong>Firebase</strong> (Google Cloud), which provides
        industry-standard security for authentication, database, and file storage. Passwords
        are never stored in plaintext. Read our{' '}
        <Link to="/privacy" className="text-indigo-600 font-medium hover:underline">Privacy Policy</Link>{' '}
        for full details on how we handle your data.
      </p>
    ),
  },
  {
    category: 'technical',
    q: 'Does Study Volte work offline?',
    a: (
      <p>
        A partial offline experience is possible if you have previously visited a page
        (service worker caching). However, <strong>fetching papers, uploading, and logging
          in require an active internet connection</strong>. Already-downloaded PDFs remain
        accessible through your device file system.
      </p>
    ),
  },
  {
    category: 'technical',
    q: 'How do I contact support?',
    a: (
      <p>
        You can reach us via the{' '}
        <Link to="/contact" className="text-indigo-600 font-medium hover:underline">Contact page</Link>{' '}
        or email us at{' '}
        <a href="mailto:support@study-volte.site" className="text-indigo-600 font-medium hover:underline">
          support@study-volte.site
        </a>. We typically respond within 24–48 hours on business days.
      </p>
    ),
  },
];

// ─── Single accordion item ────────────────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: React.ReactNode; idx: number; category: string }> = ({
  q, a, idx, category,
}) => {
  const [open, setOpen] = useState(false);
  const labelCls = CAT_COLORS[category] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const catLabel = CATEGORIES.find(c => c.id === category)?.label ?? category;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${open ? 'border-indigo-200 shadow-lg shadow-indigo-50/60' : 'border-gray-200 hover:border-gray-300'}`}
      style={{
        opacity: 0,
        animation: `fadeSlide 0.45s ease ${idx * 45}ms forwards`,
      }}
    >
      <button
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className={`inline-flex items-center self-start gap-1 text-[10px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${labelCls}`}>
            {CATEGORIES.find(c => c.id === category)?.icon} {catLabel}
          </span>
          <span className="font-semibold text-sm sm:text-base text-gray-800 leading-snug">{q}</span>
        </div>
        <span className={`shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? 'bg-indigo-100 rotate-180' : 'bg-gray-100'}`}>
          <svg className={`w-4 h-4 ${open ? 'text-indigo-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '800px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-5 pt-3 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
          {a}
        </div>
      </div>
    </div>
  );
};

// ─── Main FAQ page ────────────────────────────────────────────────────────────
const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };

  const filtered = FAQS.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const matchQ = search === '' || f.q.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  // Count per category for badges
  const catCounts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = c.id === 'all' ? FAQS.length : FAQS.filter(f => f.category === c.id).length;
    return acc;
  }, {});

  return (
    <>
      <SEOHead title="Frequently Asked Questions | Study Volte" description="Answers to common questions about downloading free previous year question papers, uploading, accounts, and contributor rewards on Study Volte." />
      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">

        {/* ── HERO ── */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse-dot 2s infinite' }} />
              Frequently Asked Questions
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              Got a <span className="text-yellow-300">question?</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Everything you need to know about Study Volte — papers, rewards, uploads, downloads, and your account.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-2xl text-gray-800 bg-white shadow-2xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-white/70">
              <span>📋 {FAQS.length} questions answered</span>
              <span>·</span>
              <span>🗂️ {CATEGORIES.length - 1} topic categories</span>
              <span>·</span>
              <span>⚡ Instant answers</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* ── Category tabs — inline flex: [‹] [scrollable] [›] ── */}
          <div className="flex items-center gap-2 mb-8">
            {/* Left arrow */}
            <button
              onClick={() => scrollTabs('left')}
              aria-label="Scroll left"
              className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ visibility: canScrollLeft ? 'visible' : 'hidden' }}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Scrollable tabs strip */}
            <div
              ref={tabScrollRef}
              onScroll={updateScrollState}
              className="flex-1 min-w-0"
              style={{ overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}
            >
              <div className="flex gap-2 pb-0.5" style={{ width: 'max-content' }}>
                {CATEGORIES.map(cat => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:scale-105'
                        }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {catCounts[cat.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollTabs('right')}
              aria-label="Scroll right"
              className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              style={{ visibility: canScrollRight ? 'visible' : 'hidden' }}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ── FAQ list ── */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((f, i) => (
                <FAQItem key={f.q} q={f.q} a={f.a} idx={i} category={f.category} />
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  No questions match <strong className="text-indigo-500">{search}</strong> in{' '}
                  {activeCategory === 'all' ? 'all categories' : `"${CATEGORIES.find(c => c.id === activeCategory)?.label}"`}.
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('all'); }}
                  className="text-indigo-600 font-semibold text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </FadeIn>
          )}

          {/* ── Quick-links strip ── */}
          <FadeIn delay={100}>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: '/browse', icon: '📄', label: 'Browse Papers' },
                { to: '/upload', icon: '📤', label: 'Upload Paper' },
                { to: '/dashboard/rewards', icon: '🏆', label: 'My Rewards' },
                { to: '/dashboard/leaderboard', icon: '🏅', label: 'Leaderboard' },
              ].map(ql => (
                <Link key={ql.to} to={ql.to}
                  className="flex flex-col items-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{ql.icon}</span>
                  <span>{ql.label}</span>
                </Link>
              ))}
            </div>
          </FadeIn>

          {/* ── Contact CTA ── */}
          <FadeIn delay={200}>
            <div className="mt-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="relative">
                <div className="text-4xl mb-3">💬</div>
                <h2 className="text-xl sm:text-2xl font-black mb-2">Still have a question?</h2>
                <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                  Our support team is happy to help. You can also check the Help Center for detailed walkthroughs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/contact"
                    className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-sm">
                    📩 Contact Support
                  </Link>
                  <Link to="/help-center"
                    className="bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                    📖 View Help Center
                  </Link>
                  <a href="mailto:support@study-volte.site"
                    className="bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                    ✉️ Email Us
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </>
  );
};

export default FAQ;
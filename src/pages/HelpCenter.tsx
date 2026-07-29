import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Animation Hook ────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Accordion Item ───────────────────────────────────────────────────────────
const AccordionItem: React.FC<{ question: string; answer: React.ReactNode; idx: number }> = ({ question, answer, idx }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base leading-snug">{question}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180 bg-indigo-100' : ''}`}>
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '600px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ icon: string; title: string; subtitle: string; gradient: string }> = ({ icon, title, subtitle, gradient }) => (
  <div className="text-center mb-10">
    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-2xl mb-4 shadow-lg`}>
      {icon}
    </div>
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">{subtitle}</p>
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ icon: string; title: string; desc: string; color: string; delay?: number }> = ({ icon, title, desc, color, delay = 0 }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default ${color}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s, translate 0.3s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-current opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-1.5 text-base">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard: React.FC<{ num: number; icon: string; title: string; desc: string; color: string; delay?: number }> = ({ num, icon, title, desc, color, delay = 0 }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="flex gap-4 items-start"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-20px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}
    >
      <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
        {num}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <h4 className="font-bold text-gray-800 text-sm sm:text-base">{title}</h4>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

// ─── XP Row ───────────────────────────────────────────────────────────────────
const XPRow: React.FC<{ icon: string; action: string; xp: string; pill: string }> = ({ icon, action, xp, pill }) => (
  <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow">
    <span className="text-xl shrink-0">{icon}</span>
    <p className="text-sm font-medium text-gray-700 flex-1">{action}</p>
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${pill}`}>{xp}</span>
  </div>
);

// ─── Level Badge ──────────────────────────────────────────────────────────────
const LevelBadge: React.FC<{ icon: string; label: string; range: string; color: string }> = ({ icon, label, range, color }) => (
  <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${color}`}>
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="font-bold text-gray-800 text-sm">{label}</p>
      <p className="text-xs text-gray-500">{range}</p>
    </div>
  </div>
);

// ─── Badge Chip ───────────────────────────────────────────────────────────────
const BadgeChip: React.FC<{ icon: string; label: string; desc: string }> = ({ icon, label, desc }) => (
  <div className="flex items-center gap-3 bg-white border border-amber-100 rounded-xl px-4 py-3 hover:border-amber-200 hover:shadow-sm transition-all">
    <span className="text-2xl shrink-0">{icon}</span>
    <div>
      <p className="font-bold text-gray-800 text-sm">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '✦ All Topics' },
    { id: 'getting-started', label: '🚀 Getting Started' },
    { id: 'papers', label: '📄 Papers' },
    { id: 'rewards', label: '🏆 Rewards' },
    { id: 'account', label: '👤 Account' },
  ];

  const faqs = [
    { category: 'getting-started', q: 'What is Study Volte?', a: <p>Study Volte is a free student-powered platform where you can <strong>share, discover, and download</strong> academic question papers from colleges across India. Our goal is to help students prepare smarter for exams by giving free access to previous years' papers.</p> },
    { category: 'getting-started', q: 'Is Study Volte free to use?', a: <p>Yes — completely free, always. You can browse and download papers as a guest. Create a free account to unlock uploads, rewards, likes, and your personal dashboard.</p> },
    { category: 'getting-started', q: 'How do I create an account?', a: <p>Click <strong>Register</strong> in the top navigation. You can sign up with your <strong>email address</strong> or use <strong>Google Sign-In</strong> for a one-click setup. After registering, complete your profile by selecting your college, semester, and course.</p> },
    { category: 'papers', q: 'How do I browse and find papers?', a: <><p className="mb-2">Use the <strong>Browse</strong> page and apply filters:</p><ul className="list-disc ml-5 space-y-1"><li>College / University</li><li>Course (e.g., B.Tech, BCA)</li><li>Semester (1st–8th)</li><li>Subject name</li><li>Exam type (Mid-term / End-term / etc.)</li></ul><p className="mt-2">Results update instantly as you filter. You can also search by paper title.</p></> },
    { category: 'papers', q: 'How do I preview a paper before downloading?', a: <p>Click on any paper card to open the <strong>PDF Viewer</strong> directly in your browser. You can read through the entire paper without downloading it first. The viewer is powered by a secure in-browser renderer.</p> },
    { category: 'papers', q: 'How do I download a paper?', a: <><p className="mb-2">Two ways to download:</p><ol className="list-decimal ml-5 space-y-1"><li>Click the <strong>Download</strong> button on any paper card.</li><li>Open the PDF preview and use the download icon in the viewer toolbar.</li></ol><p className="mt-2">Downloads are free and instant. Each download also earns the paper author +5 XP in our rewards system.</p></> },
    { category: 'papers', q: 'How do I upload a paper?', a: <><p className="mb-2">To upload a paper:</p><ol className="list-decimal ml-5 space-y-1"><li>Log in to your account.</li><li>Navigate to <strong>Dashboard → Upload</strong> or click the <strong>Upload</strong> button in the nav.</li><li>Fill in the paper details (college, course, semester, subject, exam year, exam type).</li><li>Select your <strong>PDF file</strong> (only PDFs are accepted).</li><li>Click <strong>Submit</strong> — your paper is reviewed and published.</li></ol></> },
    { category: 'papers', q: 'What file formats are accepted?', a: <p>Only <strong>PDF files</strong> are accepted. This ensures consistent viewing and downloading experience across all devices and operating systems. Make sure your file is a proper PDF before uploading.</p> },
    { category: 'papers', q: 'Can I edit or delete my uploaded papers?', a: <p>Yes. Go to <strong>Dashboard → My Uploads</strong>. Each of your papers has an <strong>Edit</strong> and <strong>Delete</strong> option. You can update the paper's details or remove it entirely. Note: deletions are permanent.</p> },
    { category: 'papers', q: 'How do I like a paper?', a: <p>Click the ❤️ heart icon on any paper card or inside the PDF viewer. Liking a paper saves it to your <strong>Liked Papers</strong> list in your dashboard and also gives the paper's author +3 XP. You can unlike a paper at any time.</p> },
    { category: 'rewards', q: 'What is the Rewards system?', a: <p>Study Volte has a gamified rewards system. You earn <strong>XP (experience points)</strong> by completing daily tasks, uploading papers, getting likes and downloads. XP helps you level up from <em>Newcomer</em> all the way to <em>Legend</em>, and unlock exclusive badges.</p> },
    { category: 'rewards', q: 'How do I earn XP?', a: <><p className="mb-2">XP is earned through multiple activities:</p><ul className="list-disc ml-5 space-y-1"><li>📅 <strong>Daily Check-In</strong> → +5 XP/day</li><li>📤 <strong>Upload a paper task</strong> → +8 XP</li><li>❤️ <strong>Someone likes your paper</strong> → +3 XP per like</li><li>📥 <strong>Your paper gets downloaded</strong> → +5 XP per download</li><li>🔥 <strong>Login streaks</strong> → Bonus XP at milestones (7, 14, 30 days)</li></ul></> },
    { category: 'rewards', q: 'What are Daily Tasks?', a: <p>Each day you get a fresh set of tasks to complete (e.g., daily login, upload a paper, like a paper). Once you complete them, visit <strong>Dashboard → Rewards</strong> and click <strong>Claim</strong> to collect your XP. Tasks reset every midnight.</p> },
    { category: 'rewards', q: 'What is a Streak?', a: <p>Your streak increases by 1 every day you log in to Study Volte. If you miss a day, your streak resets to 0. Maintain streaks to unlock milestone bonuses at 7, 14, and 30 days. Your current streak is shown on the Rewards page.</p> },
    { category: 'rewards', q: 'What are the XP Levels?', a: <><p className="mb-2">There are 6 levels:</p><ul className="list-disc ml-5 space-y-1"><li>🌱 <strong>Newcomer</strong> — 0–99 XP</li><li>📘 <strong>Contributor</strong> — 100–299 XP</li><li>🎓 <strong>Scholar</strong> — 300–599 XP</li><li>⚡ <strong>Expert</strong> — 600–1,099 XP</li><li>👑 <strong>Knowledge Lord</strong> — 1,100–2,499 XP</li><li>🏆 <strong>Legend</strong> — 2,500+ XP</li></ul></> },
    { category: 'rewards', q: 'What are Badges?', a: <p>Badges are achievement medals you earn by reaching milestones: uploading your first paper, getting 50 downloads, maintaining a 7-day streak, and more. Earned badges are displayed on your profile and Rewards page.</p> },
    { category: 'rewards', q: 'Where do I see my Leaderboard rank?', a: <p>Go to <strong>Dashboard → Leaderboard</strong> to see the top contributors ranked by XP. Your rank updates in real time as you earn more XP.</p> },
    { category: 'account', q: 'How do I update my profile?', a: <p>Go to <strong>Dashboard → Settings</strong>. From there you can change your display name, profile picture (with built-in avatar cropper), college, course, semester, and password.</p> },
    { category: 'account', q: 'How do I reset my password?', a: <p>On the <strong>Login</strong> page, click <strong>Forgot Password?</strong>. Enter your registered email and we'll send you a reset link. The link expires after 1 hour for security.</p> },
    { category: 'account', q: 'Can I sign in with Google?', a: <p>Yes! Click <strong>Sign in with Google</strong> on the Login or Register page. If it's your first time, you'll be prompted to complete your profile (college, course, semester) after Google authentication.</p> },
    { category: 'account', q: 'How do I contact support?', a: <p>You can reach us via the <Link to="/contact" className="text-indigo-600 hover:underline font-medium">Contact page</Link> or email us directly at <a href="mailto:support@study-volte.site" className="text-indigo-600 hover:underline font-medium">support@study-volte.site</a>. We respond within 24–48 hours.</p> },
    { category: 'account', q: 'How do I report inappropriate content?', a: <p>If you see a paper that violates our terms (wrong content, plagiarism, inappropriate material), email us at <a href="mailto:support@study-volte.site" className="text-indigo-600 hover:underline font-medium">support@study-volte.site</a> with the paper link and reason. We review all reports promptly.</p> },
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesCategory = activeTab === 'all' || f.category === activeTab;
    const matchesSearch = searchQuery === '' || f.q.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Help Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            How can we <span className="text-yellow-300">help you?</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Everything you need to know about Study Volte — features, rewards, uploads, downloads, and more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 bg-white shadow-2xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { to: '/browse', label: '📄 Browse Papers' },
              { to: '/upload', label: '📤 Upload Paper' },
              { to: '/dashboard/rewards', label: '🏆 My Rewards' },
              { to: '/faq', label: '❓ FAQ' },
              { to: '/contact', label: '💬 Contact Us' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-sm hover:scale-105">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-20">

        {/* ── FEATURES OVERVIEW ──────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="✨"
              title="What You Can Do"
              subtitle="Study Volte is packed with features designed to make exam prep easier for every student."
              gradient="from-violet-400 to-indigo-500"
            />
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '📄', title: 'Browse Papers', desc: 'Filter thousands of question papers by college, course, semester, and subject. Find exactly what you need in seconds.', color: 'border-blue-100', delay: 0 },
              { icon: '📥', title: 'Download PDFs', desc: 'Download any paper instantly for free. No login required for basic downloads. Papers open directly in your browser.', color: 'border-emerald-100', delay: 60 },
              { icon: '📤', title: 'Upload & Share', desc: 'Contribute to the community by uploading your own papers. Every upload earns you XP and helps fellow students.', color: 'border-violet-100', delay: 120 },
              { icon: '🔍', title: 'Preview Before Download', desc: 'Read the full paper inside the built-in PDF viewer before deciding to download — no wasted clicks.', color: 'border-amber-100', delay: 180 },
              { icon: '❤️', title: 'Like & Save Papers', desc: 'Like papers to save them to your personal library. Your liked papers are always accessible from your dashboard.', color: 'border-rose-100', delay: 240 },
              { icon: '🏆', title: 'Earn Rewards & Badges', desc: 'Complete daily tasks, maintain streaks, and earn XP. Level up from Newcomer to Legend and collect exclusive badges.', color: 'border-orange-100', delay: 300 },
              { icon: '📊', title: 'Personal Dashboard', desc: 'Track all your uploads, liked papers, rewards progress, and settings from one unified dashboard.', color: 'border-teal-100', delay: 360 },
              { icon: '🏅', title: 'Leaderboard', desc: 'See where you rank among all contributors. The top uploaders get featured and earn bonus visibility.', color: 'border-indigo-100', delay: 420 },
              { icon: '🔔', title: 'Notifications', desc: 'Get notified when someone likes or downloads your papers. Stay on top of your contribution activity.', color: 'border-pink-100', delay: 480 },
            ].map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ── HOW TO BROWSE & DOWNLOAD ──────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="📄"
              title="Browsing & Downloading Papers"
              subtitle="Find and access the papers you need in just a few steps."
              gradient="from-blue-400 to-cyan-500"
            />
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-6">
              <h3 className="font-black text-gray-800 text-lg sm:text-xl">Browsing Papers</h3>
              <div className="space-y-5">
                {[
                  { num: 1, icon: '🌐', title: 'Go to Browse', desc: 'Open the Browse page from the navigation bar. No login required.', color: 'from-blue-400 to-blue-600', delay: 0 },
                  { num: 2, icon: '🔽', title: 'Apply Filters', desc: 'Use dropdown filters for College, Course, Semester, Subject, and Exam Type to narrow your search.', color: 'from-cyan-400 to-blue-500', delay: 80 },
                  { num: 3, icon: '👀', title: 'Preview the Paper', desc: 'Click any paper card to open the PDF viewer and read through it before downloading.', color: 'from-violet-400 to-indigo-500', delay: 160 },
                  { num: 4, icon: '📥', title: 'Download', desc: 'Click the Download button on the card or in the viewer. The PDF is saved to your device instantly.', color: 'from-emerald-400 to-teal-500', delay: 240 },
                ].map(s => <StepCard key={s.num} {...s} />)}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-gray-800 text-lg sm:text-xl">Download Tips</h3>
              {[
                { icon: '⚡', tip: 'Downloads are instant — no wait time or queues.' },
                { icon: '🔓', tip: 'Guest users can download without creating an account.' },
                { icon: '📱', tip: 'Works on mobile, tablet, and desktop browsers.' },
                { icon: '📂', tip: 'Downloaded files are in PDF format, compatible with all PDF readers.' },
                { icon: '🔁', tip: 'You can re-download any paper any time — no limits.' },
                { icon: '🎁', tip: 'Each download gives the paper author +5 XP in the rewards system.' },
              ].map(t => (
                <div key={t.tip} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 hover:bg-blue-100/50 transition-colors">
                  <span className="text-lg shrink-0">{t.icon}</span>
                  <p className="text-sm text-gray-700">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW TO UPLOAD ─────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="📤"
              title="Uploading Papers"
              subtitle="Share your papers with the community and earn XP every time someone views or downloads them."
              gradient="from-violet-400 to-purple-600"
            />
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-100 rounded-3xl p-6 sm:p-8">
              <h3 className="font-black text-gray-800 text-lg mb-6">Step-by-Step Upload</h3>
              <div className="space-y-5">
                {[
                  { num: 1, icon: '🔑', title: 'Log In', desc: 'You must be signed in to upload. Register for free if you do not have an account.', color: 'from-violet-400 to-violet-600', delay: 0 },
                  { num: 2, icon: '📂', title: 'Go to Upload Page', desc: 'Navigate to Dashboard → Upload, or click the Upload button in the navigation bar.', color: 'from-purple-400 to-violet-500', delay: 80 },
                  { num: 3, icon: '📝', title: 'Fill in Paper Details', desc: 'Enter: College, Course, Semester, Subject, Exam Year, and Exam Type (Mid-term / End-term / etc.).', color: 'from-indigo-400 to-purple-500', delay: 160 },
                  { num: 4, icon: '📎', title: 'Attach Your PDF', desc: 'Click the file picker and select your PDF file. Only PDF format is accepted.', color: 'from-blue-400 to-indigo-500', delay: 240 },
                  { num: 5, icon: '🚀', title: 'Submit', desc: 'Click Submit. Your paper is published immediately and appears in Browse for everyone to find.', color: 'from-emerald-400 to-teal-500', delay: 320 },
                ].map(s => <StepCard key={s.num} {...s} />)}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-gray-800 text-lg sm:text-xl">Upload Guidelines</h3>
              <div className="space-y-3">
                {[
                  { icon: '✅', label: 'Accepted', text: 'Genuine academic question papers, previous year exam papers, model papers.' },
                  { icon: '✅', label: 'Accepted', text: 'PDF files only. Clearly labelled with correct college, course, and semester details.' },
                  { icon: '❌', label: 'Not Accepted', text: 'Plagiarised content, solved answer sheets, study guides, or non-exam materials.' },
                  { icon: '❌', label: 'Not Accepted', text: 'Corrupted PDFs, password-protected files, or files that cannot be rendered in a browser.' },
                  { icon: '⚠️', label: 'Note', text: 'Ensure all details are accurate — incorrect tags make papers hard to discover by other students.' },
                  { icon: '🏆', label: 'Reward', text: 'Every upload earns you XP. You also earn +5 XP each time someone downloads your paper.' },
                ].map((g, i) => (
                  <div key={i} className={`flex gap-3 border rounded-xl px-4 py-3 ${g.icon === '✅' ? 'bg-emerald-50 border-emerald-100' : g.icon === '❌' ? 'bg-red-50 border-red-100' : g.icon === '🏆' ? 'bg-amber-50 border-amber-100' : 'bg-yellow-50 border-yellow-100'}`}>
                    <span className="text-lg shrink-0">{g.icon}</span>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wide ${g.icon === '✅' ? 'text-emerald-700' : g.icon === '❌' ? 'text-red-700' : g.icon === '🏆' ? 'text-amber-700' : 'text-yellow-700'}`}>{g.label}</span>
                      <p className="text-sm text-gray-600 mt-0.5">{g.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/upload"
                className="inline-flex items-center gap-2 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md text-sm">
                📤 Upload a Paper Now
              </Link>
            </div>
          </div>
        </section>

        {/* ── REWARDS SYSTEM ────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="🏆"
              title="Rewards & XP System"
              subtitle="Earn XP, level up, maintain streaks, and collect badges as you contribute to the community."
              gradient="from-amber-400 to-orange-500"
            />
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* How to Earn XP */}
            <div className="lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span> How to Earn XP
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '📅', action: 'Daily Check-In', xp: '+5 XP/day', pill: 'bg-violet-100 text-violet-700' },
                  { icon: '📤', action: 'Upload a paper (task)', xp: '+8 XP', pill: 'bg-blue-100 text-blue-700' },
                  { icon: '❤️', action: 'Paper gets liked', xp: '+3 XP/like', pill: 'bg-rose-100 text-rose-700' },
                  { icon: '📥', action: 'Paper gets downloaded', xp: '+5 XP/dl', pill: 'bg-emerald-100 text-emerald-700' },
                  { icon: '🔥', action: '7-day streak bonus', xp: '+20 XP', pill: 'bg-orange-100 text-orange-700' },
                  { icon: '🔥🔥', action: '14-day streak bonus', xp: '+50 XP', pill: 'bg-amber-100 text-amber-700' },
                  { icon: '🔥🔥🔥', action: '30-day streak bonus', xp: '+100 XP', pill: 'bg-red-100 text-red-700' },
                ].map(x => <XPRow key={x.action} {...x} />)}
              </div>
            </div>

            {/* XP Levels */}
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🎯</span> XP Levels
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🌱', label: 'Newcomer', range: '0 – 99 XP', color: 'bg-slate-50 border-slate-200' },
                  { icon: '📘', label: 'Contributor', range: '100 – 299 XP', color: 'bg-emerald-50 border-emerald-100' },
                  { icon: '🎓', label: 'Scholar', range: '300 – 599 XP', color: 'bg-blue-50 border-blue-100' },
                  { icon: '⚡', label: 'Expert', range: '600 – 1,099 XP', color: 'bg-violet-50 border-violet-100' },
                  { icon: '👑', label: 'Knowledge Lord', range: '1,100 – 2,499 XP', color: 'bg-amber-50 border-amber-100' },
                  { icon: '🏆', label: 'Legend', range: '2,500+ XP', color: 'bg-rose-50 border-rose-100' },
                ].map(l => <LevelBadge key={l.label} {...l} />)}
              </div>
            </div>

            {/* Badges & Daily Tasks */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-100 rounded-3xl p-6">
                <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🎖️</span> Badges to Earn
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: '🌟', label: 'First Upload', desc: 'Upload your very first paper' },
                    { icon: '🚀', label: 'Rising Star', desc: '5 papers uploaded' },
                    { icon: '🦸', label: 'Community Hero', desc: '10 papers uploaded' },
                    { icon: '📚', label: 'Knowledge Seeker', desc: 'Like 10 papers' },
                    { icon: '🌟', label: 'Popular Creator', desc: 'Get 50 downloads' },
                    { icon: '🔥', label: 'Streak Master', desc: 'Maintain a 7-day streak' },
                  ].map(b => <BadgeChip key={b.label} {...b} />)}
                </div>
              </div>

              <div className="bg-indigo-600 rounded-3xl p-6 text-white text-center">
                <div className="text-3xl mb-2">🔥</div>
                <h4 className="font-black text-lg mb-1">Daily Streaks</h4>
                <p className="text-white/80 text-sm mb-4">Log in every day to grow your streak. Miss a day and it resets!</p>
                <Link to="/dashboard/rewards"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                  View My Rewards →
                </Link>
              </div>
            </div>
          </div>

          {/* Daily Tasks explanation */}
          <FadeIn delay={200}>
            <div className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white">
              <h3 className="font-black text-xl mb-2">📅 Daily Tasks — Reset Every Midnight</h3>
              <p className="text-white/80 mb-6 text-sm sm:text-base">Each day you get a new set of tasks. Complete them, then go to the Rewards page and click <strong>Claim</strong> to collect your XP.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: '🔑', label: 'Daily Login', desc: 'Just log in today', xp: '+5 XP' },
                  { icon: '📤', label: 'Upload a Paper', desc: 'Share a question paper', xp: '+8 XP' },
                  { icon: '❤️', label: 'Like a Paper', desc: 'Like any paper you enjoy', xp: '+3 XP' },
                  { icon: '🎯', label: 'Visit Rewards', desc: 'Check your rewards page', xp: '+5 XP' },
                ].map(t => (
                  <div key={t.label} className="bg-white/15 border border-white/20 rounded-2xl px-4 py-4 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-white/60 text-xs mt-0.5">{t.desc}</p>
                    <span className="inline-block mt-2 bg-yellow-300 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">{t.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── DASHBOARD GUIDE ───────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="📊"
              title="Your Dashboard"
              subtitle="Everything you need — uploads, rewards, settings, and more — in one place."
              gradient="from-teal-400 to-cyan-600"
            />
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🏠', title: 'Dashboard Home', desc: 'Overview of your stats: total uploads, likes received, XP earned, and your current level and streak.', link: '/dashboard', cta: 'Open Dashboard' },
              { icon: '📄', title: 'My Uploads', desc: 'View all papers you have uploaded. Edit details, check download counts, or delete papers you no longer want to share.', link: '/dashboard/my-uploads', cta: 'Manage Uploads' },
              { icon: '❤️', title: 'Liked Papers', desc: 'All papers you have liked are saved here for quick access later. Unlike a paper to remove it from this list.', link: '/dashboard/liked', cta: 'View Liked' },
              { icon: '🏆', title: 'Rewards & XP', desc: 'Claim daily task XP, track your streak milestones, and see your badge collection and level progress.', link: '/dashboard/rewards', cta: 'Go to Rewards' },
              { icon: '🏅', title: 'Leaderboard', desc: 'See the top contributors ranked by XP. Find your own rank and see how close you are to the top spots.', link: '/dashboard/leaderboard', cta: 'View Leaderboard' },
              { icon: '🔧', title: 'Settings', desc: 'Update your name, profile photo, college, course, semester, and password. Manage your account preferences.', link: '/dashboard/settings', cta: 'Open Settings' },
            ].map((d, i) => (
              <FadeIn key={d.title} delay={i * 60}>
                <div className="h-full bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all group">
                  <div className="text-3xl mb-3">{d.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{d.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{d.desc}</p>
                  <Link to={d.link}
                    className="text-indigo-600 text-sm font-semibold hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {d.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── FAQ SECTION ───────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <SectionTitle
              icon="❓"
              title="Frequently Asked Questions"
              subtitle="Can't find what you're looking for? Browse questions by topic or use the search above."
              gradient="from-indigo-400 to-blue-500"
            />
          </FadeIn>

          {/* Tab Filter */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0
              ? filteredFaqs.map((f, i) => <AccordionItem key={f.q} question={f.q} answer={f.a} idx={i} />)
              : (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="font-medium">No results found for "<span className="text-indigo-500">{searchQuery}</span>"</p>
                  <p className="text-sm mt-1">Try a different search term or browse by topic above.</p>
                </div>
              )}
          </div>
        </section>

        {/* ── CONTACT CTA ───────────────────────────────────────────── */}
        <FadeIn>
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-center text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">Still need help?</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto text-sm sm:text-base">
                Our support team is here for you. Also check out our full FAQ for more answers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact"
                  className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-sm">
                  📩 Contact Support
                </Link>
                <Link to="/faq"
                  className="bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                  ❓ View Full FAQ
                </Link>
                <a href="mailto:support@study-volte.site"
                  className="bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                  ✉️ support@study-volte.site
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
};

export default HelpCenter;
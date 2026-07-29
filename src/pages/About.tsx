import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Upload, Users, Star, Shield, Zap, Target, Heart,
  ArrowRight, CheckCircle, Globe, Award, TrendingUp, Search,
  Download, MessageCircle,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

/* ── Intersection-observer hook for scroll-reveal ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════ */
const About = () => {
  const heroSection = useInView(0.1);
  const missionSection = useInView(0.1);
  const howSection = useInView(0.1);
  const whySection = useInView(0.1);
  const valuesSection = useInView(0.1);
  const ctaSection = useInView(0.1);

  const stats = [
    { icon: BookOpen, value: 10000, suffix: '+', label: 'Question Papers', color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Users, value: 5000, suffix: '+', label: 'Active Students', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Globe, value: 200, suffix: '+', label: 'Colleges & Universities', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Download, value: 50000, suffix: '+', label: 'Total Downloads', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const steps = [
    {
      step: '01',
      icon: Search,
      title: 'Find What You Need',
      desc: 'Search by subject, university, course, or year. Our smart filters help you zero in on exactly the papers you need for your exam prep.',
      color: 'from-primary-500 to-indigo-600',
      light: 'bg-primary-50 text-primary-600',
    },
    {
      step: '02',
      icon: Download,
      title: 'Download Instantly',
      desc: 'One-click download with no registration required for browsing. Get previous year papers, model answers, and study notes in seconds.',
      color: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: '03',
      icon: Upload,
      title: 'Give Back & Earn',
      desc: 'Upload papers you have and earn points, badges, and climb the leaderboard. Your contribution helps thousands of fellow students.',
      color: 'from-violet-500 to-purple-600',
      light: 'bg-violet-50 text-violet-600',
    },
    {
      step: '04',
      icon: Star,
      title: 'Grow Together',
      desc: 'Rate papers, leave feedback, and build your academic reputation. The more you contribute, the more the community rewards you.',
      color: 'from-amber-500 to-orange-500',
      light: 'bg-amber-50 text-amber-600',
    },
  ];

  const whyReasons = [
    { icon: Shield, title: 'Verified & Safe', desc: 'Every uploaded paper is reviewed to ensure quality and authenticity before it goes live.' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant search results with smart filters — find the exact paper in under 10 seconds.' },
    { icon: Award, title: 'Reward System', desc: 'Earn badges, XP points and climb the leaderboard as you help grow the community.' },
    { icon: Globe, title: 'Pan-India Coverage', desc: 'Papers from hundreds of colleges across every major state and university board.' },
    { icon: TrendingUp, title: 'Always Growing', desc: 'New papers added daily by a community of thousands of active student contributors.' },
    { icon: MessageCircle, title: 'Community Driven', desc: 'Built for students, by students. Your feedback directly shapes our roadmap.' },
  ];

  const values = [
    { icon: Heart, title: 'Student First', desc: 'Every decision we make starts with one question: does this help students succeed?', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
    { icon: Users, title: 'Open Collaboration', desc: 'Knowledge shared is knowledge multiplied. We believe in the power of community.', color: 'text-primary-500', bg: 'bg-primary-50 border-primary-100' },
    { icon: Target, title: 'Access for All', desc: 'Premium study resources shouldn\'t be gated behind paywalls. We keep it free.', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
  ];

  return (
    <>
      <SEOHead
        title="About Study Volte – India's Student Resource Platform"
        description="Learn about Study Volte – India's collaborative platform for sharing and downloading question papers, study notes, and academic resources. Built by students, for students."
        keywords="about study volte, student platform india, question papers sharing, academic resources free, study community"
      />

      <div className="bg-gray-50 min-h-screen">

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full animate-blob" />
            <div className="absolute top-20 right-0 w-80 h-80 bg-indigo-400/10 rounded-full animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-primary-300/10 rounded-full animate-blob animation-delay-4000" />
          </div>

          <div
            ref={heroSection.ref}
            className={`relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center transition-all duration-700 ${heroSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce-dot" />
              Built for Indian Students 🇮🇳
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Empowering Students with{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 bg-clip-text text-transparent animate-gradient-text">
                Free Academic Resources
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Study Volte is a free, community-powered platform where students upload and download
              question papers, past exam papers, and study notes from colleges and universities across India.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20"
              >
                <BookOpen className="w-4 h-4" />
                Browse Papers
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 border border-white/30 text-white rounded-xl font-semibold text-sm hover:bg-white/25 transition-all hover:-translate-y-0.5 backdrop-blur-sm"
              >
                <Upload className="w-4 h-4" />
                Upload & Contribute
              </Link>
            </div>
          </div>
        </section>

        {/* ══ STATS ═══════════════════════════════════════════════ */}
        <section className="relative -mt-8 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-extrabold ${s.color} tabular-nums`}>
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ MISSION ══════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            ref={missionSection.ref}
            className={`transition-all duration-700 ${missionSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Text */}
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-4">
                  Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-5">
                  Making quality study material accessible to <span className="text-primary-600">every student</span>
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  We started Study Volte with a simple belief: <strong className="text-gray-800">no student should fail an exam just because they couldn't find the right study material.</strong>
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Coaching centres charge thousands. Seniors hoard their notes. Good resources stay locked
                  behind paid platforms. We're changing that — one question paper at a time.
                </p>
                <ul className="space-y-3">
                  {[
                    'Completely free — no paywalls, no subscriptions',
                    'Covers engineering, medical, arts, commerce & more',
                    'Students verified papers with ratings & reviews',
                    'Earn rewards for every paper you contribute',
                  ].map((pt) => (
                    <li key={pt} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-3xl opacity-60 blur-2xl" />
                <div className="relative bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white text-center">
                    <img loading="lazy" src="/logo-optimized.webp?v=8" alt="Study Volte" className="h-14 w-auto mx-auto mb-3" style={{ mixBlendMode: 'screen' }} width={224} height={56} />
                    <h3 className="font-bold text-xl">Study Volte</h3>
                    <p className="text-primary-200 text-sm mt-1">India's Free Academic Hub</p>
                  </div>
                  {/* Card body */}
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Papers Available', value: '10,000+', pct: 85 },
                      { label: 'Student Satisfaction', value: '4.8 / 5', pct: 96 },
                      { label: 'Upload Success Rate', value: '99.2%', pct: 99 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 font-medium">{item.label}</span>
                          <span className="text-primary-600 font-bold">{item.value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════ */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={howSection.ref}
              className={`transition-all duration-700 ${howSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="text-center mb-14">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-4">
                  How It Works
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                  Simple, Free & Powerful
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                  From searching to downloading, everything takes just seconds. No sign-up hassle for browsing.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {steps.map((s, i) => (
                  <div
                    key={s.step}
                    className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Step number */}
                    <span className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                      {s.step}
                    </span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <s.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ WHY CHOOSE US ════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={whySection.ref}
              className={`transition-all duration-700 ${whySection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="text-center mb-14">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-4">
                  Why Study Volte?
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                  Everything you need to ace your exams
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  Not just another file-sharing site — a complete academic ecosystem built around your success.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {whyReasons.map((r, i) => (
                  <div
                    key={r.title}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                      <r.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{r.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ OUR VALUES ═══════════════════════════════════════════ */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={valuesSection.ref}
              className={`transition-all duration-700 ${valuesSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="text-center mb-14">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-4">
                  Our Values
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                  What we stand for
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {values.map((v) => (
                  <div
                    key={v.title}
                    className={`border rounded-2xl p-7 ${v.bg} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                  >
                    <v.icon className={`w-8 h-8 ${v.color} mb-4`} />
                    <h3 className="font-extrabold text-gray-900 text-lg mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════════════ */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={ctaSection.ref}
              className={`relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl shadow-primary-200 transition-all duration-700 ${ctaSection.inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-400/10 rounded-full" />

              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="h-px w-12 bg-white/30" />
                  <span className="text-primary-200 text-xs font-bold uppercase tracking-widest">Join the Community</span>
                  <div className="h-px w-12 bg-white/30" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                  Ready to supercharge your exam prep?
                </h2>
                <p className="text-white/75 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                  Join thousands of students who use Study Volte every day to find papers, earn rewards,
                  and help each other succeed — completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 animate-pulse-glow"
                  >
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/browse"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/15 border border-white/30 text-white rounded-xl font-semibold text-sm hover:bg-white/25 transition-all hover:-translate-y-0.5 backdrop-blur-sm"
                  >
                    <Search className="w-4 h-4" />
                    Browse Without Signing Up
                  </Link>
                </div>
                <p className="text-white/50 text-xs mt-5">
                  Free forever · No credit card · No hidden charges
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;
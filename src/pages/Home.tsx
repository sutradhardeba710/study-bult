import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, ArrowUp, BadgeCheck, BookOpen, CheckCircle, ChevronRight, Download,
    Eye, FileText, Filter, Search, Shield, Sparkles, Upload, Users, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingLoggedIn from './LandingLoggedIn';
import PaperCard from '../components/PaperCard';
import SEOHead from '../components/SEOHead';
import type { PaperData } from '../services/upload';

function Reveal({ children, className = '', delay = 0 }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.08, rootMargin: '0px 0px -48px' });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 420ms ease-out ${delay}ms, transform 420ms ease-out ${delay}ms`,
        }}>
            {children}
        </div>
    );
}

function SectionIntro({ eyebrow, title, description, align = 'left' }: {
    eyebrow: string;
    title: React.ReactNode;
    description: string;
    align?: 'left' | 'center';
}) {
    return (
        <div className={`max-w-2xl ${align === 'center' ? 'sm:mx-auto sm:text-center' : ''}`}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700 sm:mb-3 sm:text-xs">{eyebrow}</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600">{description}</p>
        </div>
    );
}

let featuredPapersCache: PaperData[] | null = null;

const Home = () => {
    const { userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredPapers, setFeaturedPapers] = useState<PaperData[]>(featuredPapersCache ?? []);
    const [papersLoading, setPapersLoading] = useState(featuredPapersCache === null);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        if (featuredPapersCache !== null) return;
        const loadFeaturedPapers = async () => {
            setPapersLoading(true);
            const { getFeaturedPapers } = await import('../services/featuredPapers');
            const papers = await getFeaturedPapers(8);
            featuredPapersCache = papers;
            setFeaturedPapers(papers);
            setPapersLoading(false);
        };
        if (!authLoading && !userProfile) void loadFeaturedPapers();
    }, [authLoading, userProfile]);

    if (userProfile) return <LandingLoggedIn />;

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        navigate(query ? `/browse?search=${encodeURIComponent(query)}` : '/browse');
    };

    const quickSearches = [
        { label: 'Political Science' },
        { label: 'Education' },
        { label: 'English' },
        { label: 'Semester 1' },
    ];
    const workflow = [
        { icon: Search, label: 'Search', detail: 'Use university, course, semester, or subject.' },
        { icon: Eye, label: 'Preview', detail: 'Check the paper before you download it.' },
        { icon: Download, label: 'Download', detail: 'Get the PDF directly without a paywall.' },
        { icon: BookOpen, label: 'Prepare', detail: 'Practice smarter with real exam material.' },
    ];
    const faqs = [
        { question: 'Are the question papers free?', answer: 'Yes. You can browse, preview, and download available question papers without a paywall.' },
        { question: 'How do I find the correct semester paper?', answer: 'Search by subject or semester, then use the university, course, semester, subject, and year details shown on every result.' },
        { question: 'How are uploaded papers checked?', answer: 'Uploads are reviewed for readable scans, complete pages, and accurate academic details before quality indicators are shown.' },
        { question: 'Can I contribute a paper without an account?', answer: 'Guest upload is available with your name and email. Creating an account adds activity history and contributor rewards.' },
    ];

    const homeFaqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Study Volte',
        alternateName: ['Study Bult', 'studybult', 'StudyVolte'],
        url: 'https://study-volte.site',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://study-volte.site/browse?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    const eduOrgSchema = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Study Volte',
        url: 'https://study-volte.site',
        logo: 'https://study-volte.site/logo-optimized.webp',
        description: 'Free academic platform for downloading previous year question papers, semester exam papers, and university study materials for MBBU, BBMC, BA, BSc, BCom, BCA, CUET and SSC.',
        sameAs: [
            'https://www.facebook.com/profile.php?id=61586033282836',
            'https://x.com/@studybult',
            'https://www.instagram.com/studybult/',
            'https://linkedin.com/company/studyvolte',
            'https://www.youtube.com/@StudyVolte'
        ]
    };

    return (
        <main className="overflow-x-hidden bg-[#fbfcff] text-[#0b1020]">
            <SEOHead
                title="Previous Year Question Paper PDF Download | MBBU, BBMC & University Exams | Study Volte"
                description="Download free previous year question papers (PYQ), last year papers, and semester exams for MBBU, BBMC, Tripura University, BA, BSc, BCom, BCA, CUET & SSC. Fast PDF downloads."
                keywords="previous year question paper, previous year question paper pdf download, last year question paper, question papers, free question papers pdf, college question papers, semester question papers, mbbu previous year question paper, bbmc question paper, tripura university question paper, ba question papers, bsc question papers, bcom question papers, bca question papers, pyq download, study volte, studybult, study bult"
            />
            <script type="application/ld+json">{JSON.stringify(homeFaqSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(eduOrgSchema)}</script>
            <section className="hero-mesh relative isolate overflow-hidden text-[#0b1020]">

                <div className="academic-dot-grid absolute inset-0 -z-10 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden="true" />

                <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-14 lg:min-h-[660px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8 lg:py-20">
                    <div className="min-w-0 max-w-3xl">
                        <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/70 px-3.5 py-1.5 text-xs font-semibold text-primary-800 shadow-2xs backdrop-blur-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Official Previous Year Papers for MBBU & BBMC
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                            Previous Year Question Papers
                            <span className="block mt-2 text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent leading-snug">
                                Free PDF Download for MBBU, BBMC & University Exams
                            </span>
                        </h1>

                        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                            Find and download authentic university question papers by course, semester, and subject. Preview clean scans and save PDFs in seconds—100% free.
                        </p>

                        <form onSubmit={submitSearch} className="mt-6 sm:mt-8 min-w-0 max-w-2xl" role="search">
                            <label htmlFor="home-paper-search" className="sr-only">Search question papers</label>
                            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl bg-white p-1.5 sm:p-2 border border-slate-200/90 shadow-lg shadow-blue-900/5 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all gap-2">
                                <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2.5">
                                    <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                    <input
                                        id="home-paper-search"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search by subject, semester, or course..."
                                        className="min-w-0 flex-1 border-0 bg-transparent text-sm sm:text-base text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary cta-shine min-h-11 shrink-0 rounded-xl px-5 sm:px-6 text-sm sm:text-base font-bold shadow-sm"
                                >
                                    Search papers
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 flex min-w-0 items-center gap-2 flex-wrap text-xs sm:text-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular:</span>
                            {quickSearches.map((term) => (
                                <button
                                    key={term.label}
                                    type="button"
                                    onClick={() => navigate(`/browse?search=${encodeURIComponent(term.label)}`)}
                                    className="inline-flex items-center rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/40 shadow-2xs transition-all active:scale-95"
                                >
                                    {term.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative mx-auto min-w-0 w-full max-w-md sm:max-w-lg lg:mx-0" aria-label="Preview of a Study Volte question paper">
                        {/* Decorative layered backdrop cards */}
                        <div className="absolute -left-4 top-8 hidden h-[84%] w-full rotate-[-3.5deg] rounded-3xl border border-primary-200/70 bg-gradient-to-br from-primary-100/70 to-blue-50/50 shadow-sm sm:block" aria-hidden="true" />
                        <div className="absolute -right-3 top-5 hidden h-[88%] w-full rotate-[2.5deg] rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-100/70 to-violet-50/50 shadow-sm sm:block" aria-hidden="true" />

                        {/* Floating verified badge */}
                        <div className="absolute -top-3.5 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md border border-slate-200/80">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                            Official 2024 Exam PDF
                        </div>

                        {/* Floating downloads badge */}
                        <div className="absolute -bottom-3 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                            <Download className="w-3.5 h-3.5 text-primary-400" />
                            1,420+ Downloads
                        </div>

                        {/* Main Paper Card */}
                        <div className="hero-paper-float relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_25px_60px_-20px_rgba(30,58,138,0.22)]">
                            {/* Paper Meta Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6 sm:py-3.5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-xs">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-900">Political Science</p>
                                        <p className="truncate text-xs text-slate-500">MBBU · BA · Semester 2 (2024)</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                    <CheckCircle className="h-3 w-3" /> Verified Scan
                                </span>
                            </div>

                            {/* Simulated Realistic University Paper Preview */}
                            <div className="p-4 sm:p-6 bg-slate-50/50">
                                <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs text-slate-800">
                                    {/* University Header */}
                                    <div className="text-center border-b border-slate-200 pb-3 sm:pb-4">
                                        <p className="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase">Maharaja Bir Bikram University</p>
                                        <p className="text-[9px] sm:text-[10px] font-medium text-slate-400">Agartala, Tripura · Term End Exam 2024</p>
                                        <div className="my-2 sm:my-2.5 mx-auto h-px w-16 bg-slate-300" />
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">B.A. 2ND SEMESTER EXAMINATION</h4>
                                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium">Subject: Political Science (Major / Minor)</p>
                                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-semibold px-2">
                                            <span>Time: 3 Hours</span>
                                            <span>Full Marks: 80</span>
                                        </div>
                                    </div>

                                    {/* Real Exam Content Preview */}
                                    <div className="pt-3 sm:pt-4 space-y-2.5 text-[11px] sm:text-xs leading-relaxed">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Group — A</p>
                                        <p className="text-slate-700">
                                            <strong className="text-slate-900">1. Answer any four questions:</strong> (4 × 10 = 40)
                                        </p>
                                        <div className="space-y-1.5 pl-2 text-slate-600 italic">
                                            <p>(a) Critically examine Plato&apos;s concept of the Ideal State.</p>
                                            <p>(b) Discuss Aristotle&apos;s theory of citizenship and government.</p>
                                            <p className="hidden sm:block">(c) Explain Machiavelli&apos;s advice to rulers in &apos;The Prince&apos;.</p>
                                        </div>
                                    </div>

                                    {/* Quality Seal Banner */}
                                    <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50/70 px-3 py-1.5 text-center text-[10px] font-semibold text-primary-800 flex items-center justify-center gap-1.5">
                                        <BadgeCheck className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                                        <span>Complete 4-Page PDF Scan · Crystal Clear Quality</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-3.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    <span>Free Download</span>
                                </div>
                                <Link
                                    to="/browse"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all"
                                >
                                    Browse Library <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="border-y border-primary-100 bg-primary-50/80">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8 lg:grid-cols-4 lg:px-8">
                    {[
                        { icon: CheckCircle, value: 'Free', label: 'No paywall' },
                        { icon: BookOpen, value: 'MBBU + BBMC', label: 'Local collections' },
                        { icon: Filter, value: 'All semesters', label: 'Organized access' },
                        { icon: Users, value: 'Student-led', label: 'Community papers' },
                    ].map(({ icon: Icon, value, label }) => (
                        <div key={value} className="rounded-2xl border border-primary-100 bg-white/80 p-4 shadow-sm sm:flex sm:items-center sm:gap-4 sm:p-5 lg:border-0 lg:bg-transparent lg:shadow-none">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm ring-1 ring-slate-200"><Icon className="h-4 w-4" /></div>
                            <div className="mt-3 min-w-0 sm:mt-0"><p className="text-base font-black tracking-tight text-primary-700 sm:text-lg">{value}</p><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{label}</p></div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="bg-[#f5f8ff] py-14 sm:py-20 lg:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
                    <Reveal>
                        <SectionIntro eyebrow="Find papers faster" title={<>A search flow built around <span className="text-primary-700">how students think.</span></>} description="Start broad, then narrow by university, course, semester, subject, and year. No digging through folders or guessing file names." />
                        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-5">
                            {[
                                { icon: Filter, title: 'Useful filters', text: 'Every result keeps the academic context visible.' },
                                { icon: Eye, title: 'Preview before download', text: 'Check scan quality and paper details first.' },
                                { icon: Download, title: 'Direct access', text: 'Move from result to PDF with fewer steps.' },
                            ].map(({ icon: Icon, title, text }) => (
                                <div key={title} className="card-lift flex gap-3 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm sm:gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm ring-1 ring-slate-200"><Icon className="h-5 w-5" /></div>
                                    <div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="card-lift overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-xl shadow-blue-900/10 sm:rounded-3xl">
                            <div className="border-b border-slate-200 p-5 sm:p-6">
                                <div className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-100 px-4 text-sm text-slate-700"><Search className="h-5 w-5 text-primary-700" />Semester 2 Political Science</div>
                                <div className="mt-3 flex flex-wrap gap-2">{['MBBU', 'BA', 'Semester 2', '2024'].map((filter) => <span key={filter} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{filter}</span>)}</div>
                            </div>
                            <div className="p-3 sm:p-4">
                                {[
                                    ['Political Science — 2024', 'MBBU · BA · Semester 2', 'Verified'],
                                    ['Political Theory — 2023', 'MBBU · BA · Semester 2', 'Clear scan'],
                                    ['Indian Government — 2022', 'MBBU · BA · Semester 2', 'Complete'],
                                ].map(([title, meta, quality], index) => (
                                    <div key={title} className={`flex items-center gap-4 rounded-xl p-3 sm:p-4 ${index === 0 ? 'bg-primary-50 ring-1 ring-primary-100' : ''}`}>
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-primary-700 ring-1 ring-slate-200"><FileText className="h-5 w-5" /></div>
                                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-950">{title}</p><p className="mt-1 truncate text-xs text-slate-500">{meta}</p></div>
                                        <span className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex ${quality === 'Verified' ? 'bg-emerald-50 text-emerald-700' : quality === 'Clear scan' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}><BadgeCheck className="h-3.5 w-3.5" />{quality}</span>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 sm:px-6">Results stay clear on mobile, tablet, and desktop.</div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="bg-white py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal><SectionIntro eyebrow="Browse locally" title="Start with your institution." description="Study Volte is focused on the universities and colleges students in Tripura actually need." align="center" /></Reveal>
                    <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
                        <Reveal>
                            <Link to="/universities/tripura/mbbu-question-papers" className="card-lift group relative flex min-h-[245px] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#3b6ef6] to-[#2454db] p-6 text-white sm:min-h-[320px] sm:rounded-3xl sm:p-9">
                                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[44px] border-white/10" aria-hidden="true" /><BookOpen className="absolute -bottom-8 -right-5 h-44 w-44 rotate-[-10deg] text-white/10" aria-hidden="true" />
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20"><BookOpen className="h-6 w-6" /></div>
                                    <p className="mt-5 text-xs font-semibold text-blue-100 sm:mt-8 sm:text-sm">Maharaja Bir Bikram University</p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">MBBU question papers</h3>
                                    <p className="mt-3 max-w-md text-sm leading-6 text-blue-100 sm:mt-4 sm:text-base sm:leading-7">Browse BA, BSc, BCom, MA, and semester-wise papers in one organized collection.</p>
                                </div>
                                <span className="relative mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold sm:mt-8 sm:text-base">Explore MBBU <ArrowRight className="link-arrow h-4 w-4" /></span>
                            </Link>
                        </Reveal>
                        <Reveal delay={80}>
                            <Link to="/universities/tripura/bbmc-question-papers" className="card-lift group relative flex min-h-[245px] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#7c5cfc] to-[#4f37ce] p-6 text-white sm:min-h-[320px] sm:rounded-3xl sm:p-9">
                                <FileText className="absolute -bottom-8 -right-5 h-44 w-44 rotate-[8deg] text-white/10" aria-hidden="true" />
                                <div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><FileText className="h-6 w-6" /></div>
                                    <p className="mt-5 text-xs font-semibold text-violet-100 sm:mt-8 sm:text-sm">Bir Bikram Memorial College</p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">BBMC question papers</h3>
                                    <p className="mt-3 max-w-md text-sm leading-6 text-violet-100 sm:mt-4 sm:text-base sm:leading-7">Find papers across courses, subjects, and semesters without sorting through unrelated files.</p>
                                </div>
                                <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold sm:mt-8 sm:text-base">Explore BBMC <ArrowRight className="link-arrow h-4 w-4" /></span>
                            </Link>
                        </Reveal>
                    </div>
                </div>
            </section>
            {(papersLoading || featuredPapers.length > 0) && (
                <section className="bg-gradient-to-b from-[#f7f9ff] to-[#eef4ff] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <Reveal><SectionIntro eyebrow="From the library" title="Recently available papers." description="A direct look at real papers currently available on Study Volte." /></Reveal>
                            <Link to="/browse" className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-primary-700 hover:text-primary-900">View the full library <ArrowRight className="link-arrow h-4 w-4" /></Link>
                        </div>
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {papersLoading
                                ? Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className={`${index > 3 ? 'hidden sm:block' : ''} min-h-[380px] animate-pulse rounded-2xl border border-slate-200 bg-white p-4`}>
                                        <div className="h-52 rounded-xl bg-slate-200" /><div className="mt-5 h-4 w-3/4 rounded bg-slate-200" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-200" /><div className="mt-8 h-10 rounded-lg bg-slate-200" />
                                    </div>
                                ))
                                : featuredPapers.map((paper, index) => (
                                    <Reveal key={paper.id} className={index > 3 ? 'hidden sm:block' : ''} delay={Math.min(index * 45, 180)}><PaperCard paper={paper} index={index} /></Reveal>
                                ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-white py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal><SectionIntro eyebrow="Designed for exam preparation" title="Useful details, not feature noise." description="Every part of the experience is designed to help students judge a paper quickly and move on to studying." /></Reveal>
                    <div className="mt-8 grid auto-rows-auto gap-3 sm:mt-12 sm:gap-5 md:grid-cols-2 md:auto-rows-[minmax(220px,auto)] lg:grid-cols-3">
                        <Reveal className="md:col-span-2">
                            <div className="card-lift flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1020] to-[#25245a] p-6 text-white sm:min-h-[300px] sm:rounded-3xl sm:p-9">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20"><Filter className="h-6 w-6" /></div>
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Smart organization</span>
                                </div>
                                <div className="mt-7 grid gap-5 sm:mt-12 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
                                    <div><h3 className="text-2xl font-black tracking-tight sm:text-4xl">From university to subject in a few clear choices.</h3><p className="mt-4 max-w-xl leading-7 text-slate-300">Filters preserve context, so you always know which paper you are viewing.</p></div>
                                    <div className="flex flex-wrap gap-2 sm:max-w-[210px]">{['University', 'Course', 'Semester', 'Subject', 'Year'].map((label) => <span key={label} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">{label}</span>)}</div>
                                </div>
                            </div>
                        </Reveal>
                        {[
                            { icon: Shield, title: 'Quality indicators', text: 'See whether a paper has a clear scan, complete pages, and reliable details.', surface: 'border-emerald-200 bg-emerald-50 ring-emerald-100', iconTone: 'text-emerald-700' },
                            { icon: Eye, title: 'Preview first', text: 'Open the preview and confirm the content before downloading the PDF.', surface: 'border-slate-200 bg-slate-50 ring-slate-200', iconTone: 'text-primary-700' },
                            { icon: Upload, title: 'Students grow the library', text: 'Share a useful paper once and make it easier for the next student to prepare.', surface: 'border-amber-200 bg-amber-50 ring-amber-100', iconTone: 'text-amber-700' },
                            { icon: Zap, title: 'Fast on every screen', text: 'Comfortable touch targets and responsive layouts keep the library usable on mobile.', surface: 'border-primary-200 bg-primary-50 ring-primary-100', iconTone: 'text-primary-700' },
                        ].map(({ icon: Icon, title, text, surface, iconTone }, index) => (
                            <Reveal key={title} delay={(index % 2) * 60}>
                                <div className={`card-lift flex h-full items-start gap-4 rounded-2xl border p-5 ring-1 sm:min-h-[220px] sm:flex-col sm:justify-between sm:gap-0 sm:rounded-3xl sm:p-8 ${surface}`}>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ${iconTone}`}><Icon className="h-6 w-6" /></div>
                                    <div className="min-w-0 sm:mt-10"><h3 className="text-lg font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">{text}</p></div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-primary-50 py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal><SectionIntro eyebrow="Quality you can understand" title="How paper review works." description="Simple quality signals help you judge a paper before you spend time downloading it." align="center" /></Reveal>
                    <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
                        {[
                            { icon: Upload, step: '01', title: 'A student shares', text: 'The upload includes university, course, semester, subject, and year details.', tone: 'bg-rose-50 text-[#d94a3e]' },
                            { icon: Eye, step: '02', title: 'The paper is reviewed', text: 'Scan readability, page completeness, and academic details are checked.', tone: 'bg-blue-50 text-primary-700' },
                            { icon: BadgeCheck, step: '03', title: 'Quality is labelled', text: 'Verified, clear-scan, and complete-page signals appear where supported.', tone: 'bg-emerald-50 text-emerald-700' },
                        ].map(({ icon: Icon, step, title, text, tone }, index) => (
                            <Reveal key={title} delay={index * 70}>
                                <div className="card-lift h-full rounded-2xl border border-white bg-white/90 p-5 ring-1 ring-slate-200 sm:rounded-3xl sm:p-7">
                                    <div className="flex items-center justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div><span className="text-sm font-black text-slate-300">{step}</span></div>
                                    <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">{title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="border-y border-slate-200 bg-slate-50 py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal><SectionIntro eyebrow="A shorter path to preparation" title="Search. Preview. Download. Study." description="A simple path from finding the right paper to starting exam preparation." align="center" /></Reveal>
                    <div className="relative mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-8">
                        <div className="steps-progress-line absolute left-[12.5%] right-[12.5%] top-6 hidden h-1 rounded-full lg:block" aria-hidden="true" />
                        {workflow.map(({ icon: Icon, label, detail }, index) => (
                            <Reveal key={label} delay={index * 60}>
                                <div className="relative flex items-start gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 sm:block sm:bg-transparent sm:p-0 sm:text-center sm:shadow-none sm:ring-0">
                                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full sm:ring-8 sm:ring-slate-50"><Icon className="h-5 w-5" /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-700 sm:mt-5 sm:text-xs">Step {index + 1}</p>
                                        <h3 className="mt-1 text-lg font-black text-slate-950 sm:mt-2 sm:text-xl">{label}</h3>
                                        <p className="mt-1 text-sm leading-5 text-slate-600 sm:mx-auto sm:mt-2 sm:max-w-xs sm:leading-6">{detail}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#141d3a] to-[#1b3fa8] py-14 text-white sm:py-20 lg:py-24">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
                <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-primary-400/10 blur-3xl" aria-hidden="true" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
                    <Reveal>
                        <div className="min-w-0 max-w-3xl">
                            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary-200"><Users className="h-5 w-5" />A student-powered library</div>
                            <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">One useful upload can help an entire class.</h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">If you have a clear previous-year paper, add it to the library. Study Volte keeps the process straightforward and credits community contribution.</p>
                            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-300 sm:mt-7 sm:flex sm:flex-wrap sm:gap-x-5">{['Simple upload flow', 'Paper review', 'Contributor rewards'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" />{item}</span>)}</div>
                        </div>
                    </Reveal>
                    <Reveal delay={80}><Link to="/upload" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-primary-800 shadow-lg transition-colors hover:bg-primary-50 sm:w-auto">Share a question paper<Upload className="h-5 w-5" /></Link></Reveal>
                </div>
            </section>

            <section className="bg-[#f7f9ff] py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Reveal><SectionIntro eyebrow="Questions, answered" title="Everything you need to know." description="Clear answers before you browse, download, or contribute a paper." align="center" /></Reveal>
                    <div className="mt-8 space-y-3 sm:mt-12">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <Reveal key={faq.question} delay={index * 45}>
                                    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                        <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen} className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-slate-950 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:px-6">
                                            <span>{faq.question}</span><ChevronRight className={`h-5 w-5 shrink-0 text-primary-600 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                                        </button>
                                        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-6 text-slate-600 sm:px-6 sm:text-base sm:leading-7">{faq.answer}</p></div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>
            <section className="bg-white py-14 sm:py-20 lg:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#2454db] to-[#1b3fa8] p-8 shadow-xl shadow-primary-900/20 sm:p-10 lg:flex-row lg:items-center lg:p-12">
                            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                            <div className="relative max-w-xl text-left">
                                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary-200">Free Academic Library</p>
                                <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to find your next paper?</h2>
                                <p className="text-base text-primary-100 sm:text-lg">Search the library free—no account needed.</p>
                            </div>
                            <div className="relative flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                                <Link to="/browse" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-primary-700 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/20">
                                    Browse papers <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/upload" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20">
                                    Upload a paper <ArrowUp className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    );
};

export default Home;
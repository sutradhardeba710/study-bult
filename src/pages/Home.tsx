import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, BadgeCheck, BookOpen, CheckCircle, ChevronRight, Download,
    Eye, FileText, Filter, Search, Shield, Sparkles, Upload, Users, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingLoggedIn from './LandingLoggedIn';
import PaperCard from '../components/PaperCard';
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
            <h2 className="text-[2rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:mt-4 sm:text-lg">{description}</p>
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
        { label: 'Political Science', tone: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100' },
        { label: 'Education', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' },
        { label: 'English', tone: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' },
        { label: 'Semester 1', tone: 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100' },
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

    return (
        <main className="overflow-x-hidden bg-[#fbfcff] text-[#0b1020]">
            <section className="hero-mesh relative isolate overflow-hidden text-[#0b1020]">

                <div className="academic-dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden="true" />

                <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-7 px-4 py-8 sm:gap-9 sm:px-6 sm:py-16 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
                    <div className="min-w-0 max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-sm backdrop-blur sm:mb-6 sm:text-sm">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 ring-4 ring-emerald-100" aria-hidden="true" />
                            Built for MBBU and BBMC students
                        </div>
                        <h1 className="text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-[#0b1020] min-[360px]:text-[2.65rem] min-[360px]:leading-[0.96] sm:text-6xl lg:text-7xl">
                            Less searching.
                            <span className="hero-gradient-text block">More studying.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-[#4a5570] sm:mt-7 sm:max-w-2xl sm:text-xl sm:leading-8">
                            Find previous-year question papers by university, course, semester, and subject—then preview and download the right PDF in seconds.
                        </p>

                        <form onSubmit={submitSearch} className="mt-6 min-w-0 max-w-2xl sm:mt-9" role="search">
                            <label htmlFor="home-paper-search" className="sr-only">Search question papers</label>
                            <div className="hero-search-shell grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-1.5 rounded-2xl bg-white p-2 min-[360px]:gap-2">
                                <div className="flex min-h-11 min-w-0 items-center gap-2 px-1.5 min-[360px]:px-2 sm:min-h-12 sm:gap-3 sm:px-3">
                                    <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                    <input id="home-paper-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Subject or semester" className="min-w-0 flex-1 border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400" />
                                </div>
                                <button type="submit" className="btn-primary cta-shine min-h-11 min-w-11 shrink-0 px-3 text-sm min-[360px]:px-4 sm:min-h-12 sm:px-6 sm:text-base"><span className="min-[360px]:hidden">Go</span><span className="hidden min-[360px]:inline">Search papers</span></button>
                            </div>
                        </form>

                        <div className="mt-4 -mx-4 flex min-w-0 max-w-full items-center gap-2 overflow-x-auto px-4 pb-2 text-sm text-[#8a93ad] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-5 sm:flex-wrap sm:px-0">
                            <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700">Popular</span>
                            {quickSearches.map((term) => (
                                <button key={term.label} type="button" onClick={() => navigate(`/browse?search=${encodeURIComponent(term.label)}`)} className={`min-h-11 shrink-0 rounded-full border px-3 py-2 text-sm font-bold shadow-sm transition duration-150 hover:-translate-y-0.5 ${term.tone}`}>{term.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="relative mx-auto min-w-0 w-full max-w-md sm:max-w-lg lg:mx-0" aria-label="Preview of a Study Volte question paper">
                        <div className="absolute -left-5 top-10 hidden h-[82%] w-full rotate-[-4deg] rounded-[1.75rem] border border-primary-200 bg-primary-100/80 sm:block" aria-hidden="true" />
                        <div className="absolute -right-4 top-6 hidden h-[88%] w-full rotate-[3deg] rounded-[1.75rem] border border-violet-200 bg-violet-100/80 sm:block" aria-hidden="true" />
                        <div className="hero-paper-float relative overflow-hidden rounded-2xl border border-white bg-white text-slate-900 shadow-[0_30px_80px_-32px_rgba(59,110,246,.45)] ring-1 ring-[#e6eaf5] sm:rounded-[1.75rem]">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><FileText className="h-5 w-5" /></div>
                                    <div className="min-w-0"><p className="truncate text-sm font-bold">Political Science</p><p className="truncate text-xs text-slate-500">MBBU · BA · Semester 2</p></div>
                                </div>
                                <span className="hidden shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 min-[360px]:inline-flex">Verified</span>
                            </div>
                            <div className="bg-slate-100 p-3 sm:p-7">
                                <div className="grid grid-cols-[74px_minmax(0,1fr)] items-center gap-3 min-[360px]:grid-cols-[82px_minmax(0,1fr)] min-[360px]:gap-4 sm:hidden">
                                    <div className="aspect-[3/4] rounded-lg border border-slate-300 bg-white p-2 shadow-md">
                                        <p className="text-center text-[6px] font-bold uppercase tracking-wide text-slate-500">MBBU</p>
                                        <div className="mx-auto my-2 h-px w-8 bg-slate-300" />
                                        <p className="text-center text-[7px] font-black leading-tight text-slate-900">BA SEMESTER 2</p>
                                        <div className="mt-3 space-y-1.5">{[86, 70, 92, 63, 78].map((width, index) => <div key={index} className="h-1 rounded-full bg-slate-200" style={{ width: `${width}%` }} />)}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle className="h-3 w-3" />Verified scan</span>
                                        <h3 className="mt-3 text-base font-black tracking-tight text-slate-950 min-[360px]:text-lg">BA Semester 2</h3>
                                        <p className="mt-1 text-sm text-slate-500">Political Science · 2024</p>
                                        <div className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600"><p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" />Clear scan</p><p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" />Complete pages</p></div>
                                    </div>
                                </div>
                                <div className="mx-auto hidden aspect-[3/4] max-w-[290px] rounded-md border border-slate-300 bg-white p-6 shadow-lg sm:block">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Maharaja Bir Bikram University</p>
                                        <div className="mx-auto my-4 h-px w-20 bg-slate-300" />
                                        <p className="text-sm font-black text-slate-900">BA SECOND SEMESTER EXAMINATION</p>
                                        <p className="mt-2 text-xs text-slate-600">Political Science · 2024</p>
                                    </div>
                                    <div className="mt-7 space-y-3">{[88, 72, 94, 63, 82, 74].map((width, index) => <div key={index} className="h-2 rounded-full bg-slate-200" style={{ width: `${width}%` }} />)}</div>
                                    <div className="mt-7 rounded-lg border border-dashed border-primary-200 bg-primary-50 px-3 py-2 text-center text-[10px] font-semibold text-primary-700">Clear scan · Complete pages</div>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-200 px-3 py-3 min-[360px]:gap-4 min-[360px]:px-4 sm:px-6 sm:py-4">
                                <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-slate-500 min-[360px]:gap-2 min-[360px]:text-xs"><BadgeCheck className="h-4 w-4 text-emerald-600" />Quality checked</div>
                                <Link to="/browse" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800 min-[360px]:gap-2 sm:px-4 sm:text-sm"><span className="min-[360px]:hidden">Browse</span><span className="hidden min-[360px]:inline">Browse library</span><ArrowRight className="link-arrow h-4 w-4" /></Link>
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
            <section className="bg-gradient-to-br from-[#ff6b5a] via-[#f25566] to-[#7c5cfc] py-14 text-white sm:py-20 lg:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
                    <Reveal>
                        <div className="min-w-0 max-w-3xl">
                            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-blue-100"><Users className="h-5 w-5" />A student-powered library</div>
                            <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">One useful upload can help an entire class.</h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:mt-5 sm:text-lg sm:leading-8">If you have a clear previous-year paper, add it to the library. Study Volte keeps the process straightforward and credits community contribution.</p>
                            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-blue-100 sm:mt-7 sm:flex sm:flex-wrap sm:gap-x-5">{['Simple upload flow', 'Paper review', 'Contributor rewards'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-300" />{item}</span>)}</div>
                        </div>
                    </Reveal>
                    <Reveal delay={80}><Link to="/upload" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-primary-800 shadow-lg transition-colors hover:bg-blue-50 sm:w-auto">Share a question paper<Upload className="h-5 w-5" /></Link></Reveal>
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
                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white"><Sparkles className="h-6 w-6" /></div>
                        <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:mt-7 sm:text-5xl lg:text-6xl">Your next paper is probably already here.</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">Search the library for free. Create an account only when you want to upload, save activity, or earn contributor rewards.</p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link to="/browse" className="btn-primary cta-shine inline-flex min-h-12 items-center justify-center gap-2 px-7 py-3">Browse question papers <ArrowRight className="link-arrow h-4 w-4" /></Link>
                            <Link to="/register" className="btn-secondary inline-flex min-h-12 items-center justify-center gap-2 px-7 py-3">Create free account</Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    );
};

export default Home;
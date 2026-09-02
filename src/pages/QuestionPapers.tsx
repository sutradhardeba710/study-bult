import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import {
    Search, Download, BookOpen, ChevronDown, ArrowRight,
    FileText, GraduationCap, Clock, Star, Users, CheckCircle,
    BookMarked, Library, Layers, Award, Eye, TrendingUp,
    Shield, Zap, Target, Hash, Calendar, BarChart2
} from 'lucide-react';
import { getPapers } from '../services/papers';
import SEOHead from '../components/SEOHead';

/* ── types ── */
interface Paper {
    id?: string; title: string; subject?: string; course?: string;
    semester?: string; college?: string; examType?: string;
    likeCount?: number; downloadCount?: number;
}

const SITE = 'https://study-volte.site';
const PAGE = `${SITE}/question-papers`;

/* ── data ── */
const CATS = [
    { icon: Layers, title: 'Semester Exam Papers', desc: 'Previous year semester question papers for BCA, BSc, BA, BCom, BBA and all other courses — Semester 1 to 8.', link: '/browse?examType=Semester', tag: 'Sem 1–8', grad: 'from-indigo-500 to-purple-600' },
    { icon: Clock, title: 'Mid-Term Question Papers', desc: 'Mid-semester internal assessment and mid-term question papers for all streams and universities.', link: '/browse?examType=Mid-Term', tag: 'All Courses', grad: 'from-amber-500 to-orange-600' },
    { icon: BookMarked, title: 'Annual Exam Papers', desc: 'Annual and yearly examination question papers with solutions for undergraduate and postgraduate courses.', link: '/browse?examType=Annual', tag: 'All Years', grad: 'from-emerald-500 to-teal-600' },
    { icon: Library, title: 'Unit Test Papers', desc: 'Unit-wise and chapter-wise test question papers for focused subject preparation.', link: '/browse?examType=Unit Test', tag: 'Unit-wise', grad: 'from-rose-500 to-pink-600' },
];

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Economics', 'Commerce', 'Accountancy',
    'Statistics', 'Environmental Science', 'Political Science', 'Sociology', 'Psychology',
];

const COURSES = [
    { name: 'BCA Question Papers', link: '/browse?course=BCA', icon: '💻' },
    { name: 'BSc Question Papers', link: '/browse?course=BSc', icon: '🔬' },
    { name: 'BA Question Papers', link: '/browse?course=BA', icon: '📖' },
    { name: 'BCom Question Papers', link: '/browse?course=BCom', icon: '📊' },
    { name: 'BBA Question Papers', link: '/browse?course=BBA', icon: '🏢' },
    { name: 'MA Question Papers', link: '/browse?course=MA', icon: '🎓' },
    { name: 'MSc Question Papers', link: '/browse?course=MSc', icon: '🧪' },
    { name: 'MCom Question Papers', link: '/browse?course=MCom', icon: '💰' },
];

const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

const FAQS = [
    { q: 'Where can I find previous year question papers for free?', a: 'Study Volte is the best free platform to find previous year question papers. Students from across India upload real question papers from their own exams. Simply visit our Browse page, filter by college, course, or semester, and download any question paper as a PDF — completely free, no registration required.' },
    { q: 'How to download last year question papers from Study Volte?', a: 'Downloading last year question papers on Study Volte is easy: (1) Go to Browse Papers, (2) Select your college, course, and semester using the filters, (3) Click on any question paper card to preview it, (4) Hit the Download button to save the PDF to your device. The entire process takes under 30 seconds.' },
    { q: 'Are the previous year question papers authentic and real?', a: 'Yes. Every question paper on Study Volte is uploaded by students who personally appeared in those exams. Our admin team reviews and approves all submissions before they go live. We do not accept fake or modified papers.' },
    { q: 'Which universities question papers are available on Study Volte?', a: 'We currently have question papers from MBB University (MBBU), Bir Bikram Memorial College (BBMC), and several other colleges across Tripura and India. We are constantly expanding with new universities added regularly by student contributions.' },
    { q: 'Can I get question papers semester-wise?', a: 'Yes. You can filter question papers by semester (1st through 8th), by course (BCA, BSc, BA, BCom, BBA, MA, MSc), and by subject. This makes it very easy to find exactly the previous year question paper you need.' },
    { q: 'Why are previous year question papers important for exam preparation?', a: 'Solving previous year question papers helps you: understand the exam pattern and marking scheme, identify repeated important topics, practice time management under exam conditions, reduce exam anxiety by getting familiar with question formats, and score higher by focusing your preparation on what actually gets asked.' },
    { q: 'How many question papers are available on Study Volte?', a: 'Study Volte has 500+ question papers across 20+ colleges, covering 15+ courses and all semesters. Our collection grows every day as students from across India contribute their exam papers after appearing in them.' },
    { q: 'Can I upload my own question papers?', a: 'Absolutely! Create a free account and go to Upload Paper to submit your question papers. Your uploads help thousands of students prepare for the same exam in the future. Contributors earn points on our leaderboard and get recognized by the community.' },
    { q: 'Are question papers available in PDF format?', a: 'Yes. All question papers on Study Volte are stored and available as PDF files. You can open them on any device — mobile phone, tablet, laptop, or desktop computer. They can also be printed easily.' },
    { q: 'Is Study Volte completely free to use?', a: 'Study Volte is 100% free for all students. There are no subscription plans, no premium tiers, no hidden fees, and no paywalls. Browse as many question papers as you want and download them all for free.' },
    { q: 'What is the difference between previous year and last year question papers?', a: '"Previous year question papers" refers to question papers from any past year, while "last year question paper" specifically means the most recent previous year — the exam that happened in the year just before the current one. On Study Volte, you can find both: the most recent year\'s papers and papers from several years back.' },
    { q: 'How often are new question papers added?', a: 'New question papers are added continuously, especially after major exam seasons. Students upload papers right after appearing in exams, so you can often find the latest question papers within days of the exam being conducted.' },
];

const RELATED = [
    'previous year question paper pdf download',
    'last year question paper free download',
    'university question papers with solutions',
    'semester question papers free',
    'old question papers pdf',
    'question paper 2024 2025',
    'college question papers download',
    'subject-wise question papers',
];

const TOC = [
    { id: 'categories', label: 'Browse by Category' },
    { id: 'courses', label: 'Course-wise Papers' },
    { id: 'how-to', label: 'How to Download' },
    { id: 'latest', label: 'Latest Papers' },
    { id: 'why', label: 'Why Use Previous Year Papers' },
    { id: 'universities', label: 'University Papers' },
    { id: 'faq', label: 'FAQ' },
];

/* ── schemas ── */
function schemas() {
    const faq = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };
    const breadcrumb = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Previous Year Question Papers', item: PAGE },
        ],
    };
    const howTo = {
        '@context': 'https://schema.org', '@type': 'HowTo',
        name: 'How to Download Previous Year Question Papers',
        description: 'Step-by-step guide to find and download free previous year question papers on Study Volte.',
        totalTime: 'PT2M',
        step: [
            { '@type': 'HowToStep', position: 1, name: 'Go to Browse Papers', text: 'Navigate to the Browse Papers section on Study Volte and use the search filters.' },
            { '@type': 'HowToStep', position: 2, name: 'Filter by Course and Semester', text: 'Select your college, course (BCA, BSc, BA, etc.), and semester to find relevant question papers.' },
            { '@type': 'HowToStep', position: 3, name: 'Preview the Question Paper', text: 'Click on any question paper card to preview it in your browser before downloading.' },
            { '@type': 'HowToStep', position: 4, name: 'Download as PDF', text: 'Click the Download button to save the question paper PDF to your device. It is completely free.' },
        ],
    };
    const aggregate = {
        '@context': 'https://schema.org', '@type': 'Product',
        name: 'Previous Year Question Papers - Free Download',
        url: PAGE,
        image: `${SITE}/logo-optimized.webp`,
        description: 'Download free previous year question papers and last year question papers for all courses and semesters.',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '1240', bestRating: '5', worstRating: '1' },
        brand: { '@type': 'Brand', name: 'Study Volte' },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2027-12-31',
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
                    transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
                },
                shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'IN',
                returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
            },
        },
    };
    const itemList = {
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: 'Previous Year Question Paper Categories',
        numberOfItems: CATS.length,
        itemListElement: CATS.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.title, url: `${SITE}${c.link}` })),
    };
    const eduOrg = {
        '@context': 'https://schema.org', '@type': 'EducationalOrganization',
        name: 'Study Volte', url: SITE,
        description: 'Free platform for students to access and share previous year question papers from Indian colleges and universities.',
        sameAs: ['https://www.facebook.com/profile.php?id=61586033282836', 'https://www.instagram.com/studybult/', 'https://www.youtube.com/@StudyVolte'],
    };
    return { faq, breadcrumb, howTo, aggregate, itemList, eduOrg };
}

/* ═══════════════════════════════════════════════════════════════ */
export default function QuestionPapers() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const s = schemas();

    useEffect(() => {
        getPapers({ status: 'approved' })
            .then(all => setPapers((all as Paper[]).slice(0, 6)))
            .catch(() => setPapers([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <SEOHead
                title="Previous Year Question Papers - Free PDF Download | Study Volte"
                description="Download free previous year question papers, last year question papers and old question papers for all semesters & courses in India. 100% free PDF download. 500+ papers available."
                keywords="previous year question paper, last year question paper, question papers, question paper, previous year question papers, old question papers, university question papers, semester question papers, free question papers download, question paper pdf, previous year paper pdf download, college question papers, BCA question papers, BSc question papers, BA question papers"
            />
            <Head>
                <script type="application/ld+json">{JSON.stringify(s.faq)}</script>
                <script type="application/ld+json">{JSON.stringify(s.breadcrumb)}</script>
                <script type="application/ld+json">{JSON.stringify(s.howTo)}</script>
                <script type="application/ld+json">{JSON.stringify(s.aggregate)}</script>
                <script type="application/ld+json">{JSON.stringify(s.itemList)}</script>
                <script type="application/ld+json">{JSON.stringify(s.eduOrg)}</script>
            </Head>

            <main className="min-h-screen bg-gray-50">

                {/* ── HERO ── */}
                <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl" />
                    </div>
                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
                        <nav aria-label="Breadcrumb" className="flex justify-center mb-5">
                            <ol className="flex items-center gap-2 text-sm text-indigo-300" itemScope itemType="https://schema.org/BreadcrumbList">
                                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                    <Link to="/" className="hover:text-white transition-colors" itemProp="item"><span itemProp="name">Home</span></Link>
                                    <meta itemProp="position" content="1" />
                                </li>
                                <li className="text-indigo-500">/</li>
                                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                    <span className="text-white font-medium" itemProp="name">Previous Year Question Papers</span>
                                    <meta itemProp="position" content="2" />
                                </li>
                            </ol>
                        </nav>

                        {/* Rating badge */}
                        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 px-4 py-2 rounded-full mb-6">
                            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                            <span className="text-yellow-300 text-sm font-semibold">4.8/5 — Trusted by 5,000+ students</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
                            Previous Year{' '}
                            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                Question Papers
                            </span>
                            <br className="hidden sm:block" /> Free PDF Download
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-200 max-w-3xl mx-auto mb-4 leading-relaxed">
                            Find and download <strong className="text-white">previous year question papers</strong>, <strong className="text-white">last year question papers</strong>, and <strong className="text-white">old question papers</strong> for every semester, course, and university — 100% free. Over 500 real question papers uploaded by students.
                        </p>
                        <p className="text-sm text-indigo-400 mb-10">
                            📅 Last updated: February 2026 &nbsp;·&nbsp; 📄 500+ Question Papers &nbsp;·&nbsp; 🆓 Always Free
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/browse" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:from-yellow-300 hover:to-amber-400 transition-all active:scale-95">
                                <Search className="w-5 h-5" /> Browse All Question Papers
                            </Link>
                            <Link to="/upload" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-all active:scale-95">
                                <FileText className="w-5 h-5" /> Upload a Paper
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── STATS ── */}
                <section className="bg-white border-b border-gray-100 py-8">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {[
                                { icon: FileText, val: '500+', label: 'Question Papers', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: GraduationCap, val: '20+', label: 'Colleges & Universities', color: 'text-purple-600', bg: 'bg-purple-50' },
                                { icon: BookOpen, val: '15+', label: 'Courses Available', color: 'text-amber-600', bg: 'bg-amber-50' },
                                { icon: Users, val: '5,000+', label: 'Students Helped', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-center gap-2">
                                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.val}</p>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TABLE OF CONTENTS ── */}
                <section className="py-10 bg-indigo-50/60 border-b border-indigo-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-indigo-600" /> Table of Contents
                        </h2>
                        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {TOC.map((item, i) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`} className="flex items-center gap-2.5 text-indigo-700 hover:text-indigo-900 text-sm font-medium group">
                                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                                        <span className="group-hover:underline underline-offset-2">{item.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ── CATEGORIES ── */}
                <section id="categories" className="py-16 md:py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                Previous Year Question Papers by Exam Type
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Download <strong>question papers</strong> organized by exam category. All <strong>previous year question papers</strong> are free PDF downloads.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {CATS.map(c => (
                                <Link key={c.title} to={c.link} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                        <c.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">{c.tag}</span>
                                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{c.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                                    <div className="mt-4 flex items-center gap-1 text-indigo-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                        View Papers <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── COURSE-WISE ── */}
                <section id="courses" className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                                Course-wise Previous Year Question Papers
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Find <strong>question papers</strong> for your specific degree. Select your course below to browse all available question papers.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                            {COURSES.map(c => (
                                <Link key={c.name} to={c.link} className="group flex items-center gap-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl p-4 transition-all">
                                    <span className="text-2xl">{c.icon}</span>
                                    <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 leading-snug">{c.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Semester quick links */}
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600" /> Browse by Semester
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {SEMESTERS.map(sem => (
                                    <Link key={sem} to={`/browse?semester=${encodeURIComponent(sem)}`}
                                        className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                        <BookMarked className="w-3.5 h-3.5" /> {sem} Question Papers
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── HOW TO DOWNLOAD ── */}
                <section id="how-to" className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-indigo-950 text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                                How to Download Previous Year Question Papers
                            </h2>
                            <p className="text-indigo-300 text-lg max-w-2xl mx-auto">
                                Get your <strong className="text-white">last year question paper</strong> PDF in under 2 minutes — no account required.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" itemScope itemType="https://schema.org/HowTo">
                            <meta itemProp="name" content="How to Download Previous Year Question Papers" />
                            {[
                                { n: '01', icon: Search, t: 'Visit Browse Papers', d: 'Go to the Browse Papers section. Use search filters to find your college, course, or subject.', prop: 'step' },
                                { n: '02', icon: Target, t: 'Apply Filters', d: 'Select your course (BCA, BSc, BA etc.), semester (1st to 8th), and exam type to narrow down results.', prop: 'step' },
                                { n: '03', icon: Eye, t: 'Preview Paper', d: 'Click any question paper card to preview it in your browser. Verify it is the right paper before downloading.', prop: 'step' },
                                { n: '04', icon: Download, t: 'Download Free PDF', d: 'Hit the Download button to save the question paper PDF to your device. 100% free, always.', prop: 'step' },
                            ].map((step, idx) => (
                                <div key={step.n} className="relative flex flex-col items-center text-center" itemProp={step.prop} itemScope itemType="https://schema.org/HowToStep">
                                    <meta itemProp="position" content={String(idx + 1)} />
                                    <meta itemProp="name" content={step.t} />
                                    <meta itemProp="text" content={step.d} />
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/50">
                                        <step.icon className="w-7 h-7 text-white" />
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-gray-900 text-xs font-extrabold rounded-full flex items-center justify-center">{idx + 1}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{step.t}</h3>
                                    <p className="text-indigo-300 text-sm leading-relaxed">{step.d}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Link to="/browse" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:from-yellow-300 hover:to-amber-400 transition-all active:scale-95">
                                <Download className="w-5 h-5" /> Download Question Papers Now
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── LATEST PAPERS ── */}
                <section id="latest" className="py-16 md:py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                                Latest Previous Year Question Papers
                            </h2>
                            <p className="text-gray-600">Recently added <strong>question papers</strong> — updated continuously by students.</p>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
                                        <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                                    </div>
                                ))}
                            </div>
                        ) : papers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {papers.map((p, idx) => (
                                    <article key={p.id ?? idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-indigo-600" /></div>
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{p.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {p.course && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{p.course}</span>}
                                            {p.semester && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{p.semester}</span>}
                                            {p.examType && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{p.examType}</span>}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 mt-auto pt-2 border-t border-gray-50">
                                            <span><Star className="w-3 h-3 inline text-yellow-400 mr-0.5" />{p.likeCount ?? 0} likes</span>
                                            <span><Download className="w-3 h-3 inline text-emerald-500 mr-0.5" />{p.downloadCount ?? 0}</span>
                                        </div>
                                        <Link to={`/browse?q=${encodeURIComponent(p.title ?? '')}`} className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all">
                                            <Eye className="w-4 h-4" /> View Question Paper
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p><Link to="/browse" className="text-indigo-600 hover:underline font-semibold">Browse all question papers →</Link></p>
                            </div>
                        )}
                        <div className="mt-10 text-center">
                            <Link to="/browse" className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 font-bold px-8 py-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                                View All Previous Year Question Papers <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── WHY SECTION — E-E-A-T + keyword-rich body ── */}
                <section id="why" className="py-16 md:py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
                            Why Previous Year Question Papers Are the #1 Exam Preparation Tool
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-5 text-lg">
                            Topping your university exams is not about reading the entire syllabus. It is about reading the right material. And nothing tells you what the right material is more accurately than <strong>previous year question papers</strong>. At Study Volte, we provide free access to hundreds of <strong>question papers</strong> from real university exams so every student — regardless of their financial situation — can prepare effectively.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            Our collection covers students at <Link to="/universities/tripura/mbbu-question-papers" className="text-indigo-600 font-semibold hover:underline underline-offset-2">MBB University (MBBU)</Link> and <Link to="/universities/tripura/bbmc-question-papers" className="text-indigo-600 font-semibold hover:underline underline-offset-2">Bir Bikram Memorial College (BBMC)</Link>.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            When you study a <strong>last year question paper</strong>, you are reverse-engineering the examiner's thinking. You will notice that certain topics reappear in almost every year's <strong>question paper</strong>. Long answer questions tend to be drawn from specific chapters. Short answer and MCQ sections follow predictable patterns. This intelligence is simply not available anywhere else — not in textbooks, not in coaching notes, not in summaries. Only <strong>previous year question papers</strong> reveal this pattern.
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                            5 Proven Benefits of Solving Previous Year Question Papers
                        </h3>
                        <ul className="space-y-4 mb-8">
                            {[
                                { icon: TrendingUp, title: 'Better Performance', desc: 'Students who solve at least 5 previous year question papers before an exam consistently score 15–25% higher than those who don\'t.' },
                                { icon: Target, title: 'Know Exactly What to Study', desc: 'Last year question papers reveal the exact topics, chapter weightages, and question types your examiner prefers.' },
                                { icon: Clock, title: 'Sharpen Time Management', desc: 'Practising question papers under timed conditions trains you to allocate time correctly across sections.' },
                                { icon: Shield, title: 'Reduce Exam Anxiety', desc: 'Familiarity with the question format dramatically reduces exam stress. No surprises when you have already seen the pattern.' },
                                { icon: Zap, title: 'Spot Repeated Questions', desc: 'Many university questions repeat verbatim or with minor variations every 2–3 years. Catching these is a major competitive advantage.' },
                            ].map(b => (
                                <li key={b.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                        <b.icon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{b.title}</p>
                                        <p className="text-gray-500 text-sm mt-0.5">{b.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            How Study Volte Makes Previous Year Question Papers Accessible
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            Study Volte is a student-powered platform. Every <strong>question paper</strong> in our database was uploaded by a student who personally appeared in that exam. This means you are getting authentic, real-exam <strong>previous year question papers</strong> — not re-created or guessed papers. Our admin team verifies every submission before it goes live, so you can trust the quality of every paper.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            Our browse system lets you filter <strong>question papers</strong> by college, university, course, semester, subject, and exam type. You can preview any <strong>question paper</strong> right in your browser without downloading. When you find the paper you need, download it as a PDF in one click — no login needed, no payment, no subscription. We believe access to <strong>previous year question papers</strong> should be a right for every student, not a privilege.
                        </p>

                        <ul className="space-y-2 mb-7">
                            {[
                                'Filter question papers by college, course, semester and subject', 'Preview papers in your browser before downloading',
                                'Download any question paper as a free PDF', 'Find the most recent previous year question papers first',
                                'Upload your question papers and help thousands of students', 'Earn community points and leaderboard recognition for uploading',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            How to Use Previous Year Question Papers Strategically
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-5">
                            Simply collecting <strong>question papers</strong> is not enough. Use them strategically: start by solving the <strong>last year question paper</strong> for each subject early in your preparation to understand what will be tested. Then work backwards through 3–5 years of <strong>previous year question papers</strong> to identify repeating patterns. Make a list of topics that appear every year and ensure those are fully covered in your revision. Finally, in the week before the exam, solve full <strong>question papers</strong> under strict timed conditions to simulate the real exam environment.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            We also encourage every student who has recently appeared in an exam to contribute their <strong>question paper</strong> back to Study Volte. Together, we are building the most comprehensive free <strong>previous year question papers</strong> database in India. Every paper you upload directly helps hundreds of your fellow students.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/browse" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-7 py-3.5 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95">
                                <Search className="w-4 h-4" /> Browse Previous Year Question Papers
                            </Link>
                            <Link to="/upload" className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-2xl hover:border-indigo-300 hover:text-indigo-700 transition-all active:scale-95">
                                <FileText className="w-4 h-4" /> Upload a Question Paper
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── TRUST BADGES ── */}
                <section className="py-10 bg-indigo-50 border-y border-indigo-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            {[
                                { icon: Shield, t: '100% Authentic', s: 'Admin-verified question papers' },
                                { icon: Download, t: 'Free PDF Download', s: 'No charges, ever' },
                                { icon: Calendar, t: 'Always Updated', s: 'New papers added weekly' },
                                { icon: BarChart2, t: 'Trusted Platform', s: '4.8★ by 5000+ students' },
                            ].map(b => (
                                <div key={b.t} className="flex flex-col items-center gap-2 p-4">
                                    <b.icon className="w-7 h-7 text-indigo-600" />
                                    <p className="font-bold text-gray-900 text-sm">{b.t}</p>
                                    <p className="text-xs text-gray-500">{b.s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SUBJECT CLOUD ── */}
                <section className="py-12 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                            Subject-wise Previous Year Question Papers
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {SUBJECTS.map(sub => (
                                <Link key={sub} to={`/browse?subject=${encodeURIComponent(sub)}`}
                                    className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                    <BookOpen className="w-3.5 h-3.5" /> {sub} Question Papers
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── UNIVERSITY LINKS ── */}
                <section id="universities" className="py-14 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
                            University-Specific Previous Year Question Papers
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { name: 'MBB University (MBBU) Previous Year Question Papers', desc: 'All previous year question papers for courses under Maharaja Bir Bikram University, Agartala, Tripura. BCA, BSc, BA, BCom and more.', link: '/universities/tripura/mbbu-question-papers', badge: 'MBBU · Tripura', icon: Award },
                                { name: 'BBMC Previous Year Question Papers', desc: 'Bir Bikram Memorial College question papers for BA, BSc, BCom, and other undergraduate courses. All semesters available.', link: '/universities/tripura/bbmc-question-papers', badge: 'BBMC · Tripura', icon: GraduationCap },
                            ].map(u => (
                                <Link key={u.name} to={u.link} className="group flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0"><u.icon className="w-6 h-6 text-white" /></div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{u.name}</h3>
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">{u.badge}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{u.desc}</p>
                                        <span className="inline-flex items-center gap-1 text-indigo-600 text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                                            View Question Papers <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" className="py-16 md:py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                                Frequently Asked Questions about Question Papers
                            </h2>
                            <p className="text-gray-600">Everything you need to know about <strong>previous year question papers</strong> on Study Volte.</p>
                        </div>
                        <div className="space-y-3">
                            {FAQS.map((faq, idx) => (
                                <div key={idx} className={`rounded-2xl border overflow-hidden transition-all ${openFaq === idx ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 bg-gray-50'}`}>
                                    <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === idx ? null : idx)} aria-expanded={openFaq === idx}>
                                        <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <p className="px-5 pb-5 text-gray-600 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <Link to="/faq" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 underline underline-offset-4">
                                View All FAQs <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── RELATED SEARCHES (grey-hat keyword silo) ── */}
                <section className="py-10 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Related Searches</h2>
                        <div className="flex flex-wrap gap-2">
                            {RELATED.map(r => (
                                <Link key={r} to={`/browse?q=${encodeURIComponent(r)}`}
                                    className="inline-block bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:text-indigo-700 hover:border-indigo-300 transition-all capitalize">
                                    {r}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className="py-16 md:py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-5 leading-tight">
                            Start Downloading Previous Year Question Papers Now
                        </h2>
                        <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
                            Join 5,000+ students already using Study Volte to access free <strong className="text-white">previous year question papers</strong>, study smarter, and score higher in exams.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/browse" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:from-yellow-300 hover:to-amber-400 transition-all active:scale-95">
                                <Download className="w-5 h-5" /> Browse Question Papers
                            </Link>
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-all active:scale-95">
                                <GraduationCap className="w-5 h-5" /> Create Free Account
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

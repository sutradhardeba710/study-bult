import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { Award, BookOpen, ChevronRight, Home, Target } from 'lucide-react';

const SITE = 'https://study-volte.site';

const exams = [
    {
        name: 'CUET',
        fullName: 'Common University Entrance Test',
        path: '/exams/cuet',
        subPages: [
            { label: 'CUET 2025 Papers', path: '/exams/cuet/2025' },
            { label: 'CUET 2024 Papers', path: '/exams/cuet/2024' },
        ],
        desc: 'National-level entrance test for admission to central universities. Download CUET previous year question papers for all subjects.',
        keyword: 'CUET previous year papers',
        badge: 'Most Popular',
        icon: Target,
    },
    {
        name: 'SSC CGL',
        fullName: 'Staff Selection Commission — Combined Graduate Level',
        path: '/exams/ssc-cgl',
        subPages: [],
        desc: 'SSC CGL previous year question papers for Tier 1 & Tier 2 exams. Download free PDF for all shifts.',
        keyword: 'SSC CGL papers',
        badge: '',
        icon: Award,
    },
    {
        name: 'SSC',
        fullName: 'Staff Selection Commission — All Exams',
        path: '/exams/ssc',
        subPages: [
            { label: 'SSC CGL Papers', path: '/exams/ssc-cgl' },
            { label: 'SSC CHSL Papers', path: '/exams/ssc-chsl' },
            { label: 'SSC GD Papers', path: '/exams/ssc-gd' },
        ],
        desc: 'Browse all SSC exam question papers — CGL, CHSL, GD Constable, and more.',
        keyword: 'SSC question papers',
        badge: '',
        icon: BookOpen,
    },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'National Exams', item: `${SITE}/question-papers/exams` },
    ],
};

export default function ExamsHub() {
    return (
        <>
            <SEOHead
                title="National Exam Question Papers | CUET, SSC CGL, CHSL | Free PDF | Study Volte"
                description="Download free previous year question papers for all national competitive exams — CUET, SSC CGL, SSC CHSL, SSC GD. All years, all subjects, instant PDF download."
                keywords="national exam question papers, CUET question papers, SSC CGL question papers, SSC CHSL papers, competitive exam papers, government exam papers PDF, CUET previous year papers, SSC previous year question paper"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers" className="hover:text-primary-600 transition-colors">Question Papers</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">National Exams</li>
                        </ol>
                    </div>
                </nav>

                {/* Hero */}
                <section className="bg-gradient-to-br from-orange-600 via-red-700 to-rose-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <Target className="w-4 h-4 text-yellow-300" />
                            <span>All National Competitive Exams</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            National Exam
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Previous Year Question Papers
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto">
                            Free PDFs for CUET, SSC CGL, SSC CHSL, SSC GD and more. Prepare smarter — not harder.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Exam Cards */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Exam</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.name} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-lg p-6 transition-all duration-200 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                                            <exam.icon className="w-6 h-6 text-orange-600" />
                                        </div>
                                        {exam.badge && (
                                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">{exam.badge}</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{exam.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{exam.fullName}</p>
                                    <p className="text-gray-600 text-sm mb-4">{exam.desc}</p>
                                    <Link to={exam.path} className="inline-flex items-center text-orange-600 font-semibold text-sm hover:text-orange-700 mb-3">
                                        View All {exam.name} Papers <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                    {exam.subPages.length > 0 && (
                                        <div className="pt-3 border-t border-gray-100 space-y-1">
                                            {exam.subPages.map(sub => (
                                                <Link key={sub.path} to={sub.path} className="flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors py-0.5">
                                                    <ChevronRight className="w-3.5 h-3.5 mr-1 text-gray-300" />
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Why Prepare with PYQs */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Practice with Previous Year Papers?</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    For competitive exams like CUET and SSC, practicing with authentic previous year question papers is the single most effective strategy to improve your score. Exam patterns are largely consistent year-on-year, and many concepts repeat across papers.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Studies show that candidates who solve 5+ years of previous year papers score 25–30% higher than those who don't. By solving real exam papers, you train your brain to recognise question patterns, manage time effectively, and avoid common traps.
                                </p>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    'Understand exact exam pattern & difficulty level',
                                    'Identify most important chapters and topics',
                                    'Build speed and accuracy under time pressure',
                                    'Track your progress across multiple years',
                                    'Gain confidence by solving real exam questions',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                        <span className="text-gray-600 text-sm">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Also Explore */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers', label: '📄 All Question Papers' },
                                { to: '/question-papers/universities/tripura', label: '🏛️ Tripura Universities' },
                                { to: '/question-papers/courses/ba', label: '📚 BA Papers' },
                                { to: '/browse', label: '🔍 Browse All Papers' },
                                { to: '/guides/exam-preparation-strategy', label: '🎯 Exam Strategy' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

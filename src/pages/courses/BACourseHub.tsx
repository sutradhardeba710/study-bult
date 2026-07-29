import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { BookOpen, ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const SEMESTERS = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];
const COLLEGES = [
    { name: 'MBBU', slug: 'mbbu', hub: '/universities/tripura/mbbu-question-papers' },
    { name: 'BBMC', slug: 'bbmc', hub: '/universities/tripura/bbmc-question-papers' },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'By Course', item: `${SITE}/question-papers/courses` },
        { '@type': 'ListItem', position: 4, name: 'BA Question Papers', item: `${SITE}/question-papers/courses/ba` },
    ],
};

const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BA Previous Year Question Papers by College and Semester',
    numberOfItems: COLLEGES.length * SEMESTERS.length,
    itemListElement: COLLEGES.flatMap((c, ci) =>
        SEMESTERS.map((sem, si) => ({
            '@type': 'ListItem',
            position: ci * SEMESTERS.length + si + 1,
            name: `${c.name} BA ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
            url: `${SITE}/${c.slug}/ba/${sem}-question-papers`,
        }))
    ),
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Where can I download BA previous year question papers?',
            acceptedAnswer: { '@type': 'Answer', text: 'Study Volte offers free BA previous year question papers from MBBU and BBMC for all 6 semesters. Search by college, semester or subject and download instantly as PDF.' },
        },
        {
            '@type': 'Question',
            name: 'Are BA question papers repeated every year?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes, many BA exam questions repeat across years. Practicing with 3–5 years of previous papers helps identify recurring topics in History, Political Science, English, Economics, and other BA subjects.' },
        },
        {
            '@type': 'Question',
            name: 'Which BA subjects are covered?',
            acceptedAnswer: { '@type': 'Answer', text: 'Our BA question paper collection covers History, Political Science, English, Bengali, Economics, Sociology, Philosophy, Geography, and all other core and elective subjects offered by MBBU and BBMC.' },
        },
    ],
};

export default function BACourseHub() {
    return (
        <>
            <SEOHead
                title="BA Previous Year Question Papers | All Semesters Free PDF | Study Volte"
                description="Download BA (Bachelor of Arts) previous year question papers from MBBU and BBMC for all 6 semesters. History, Political Science, English, Economics and all subjects. Free PDF download."
                keywords="BA question papers, BA previous year question paper, Bachelor of Arts question papers, BA semester papers, BA 1st semester question paper, BA 2nd semester question paper, MBBU BA papers, BBMC BA papers, BA exam papers PDF"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers" className="hover:text-primary-600 transition-colors">Question Papers</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers/courses" className="hover:text-primary-600 transition-colors">By Course</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">BA</li>
                        </ol>
                    </div>
                </nav>

                {/* Hero */}
                <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <BookOpen className="w-4 h-4 text-yellow-300" />
                            <span>Bachelor of Arts</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            BA Previous Year
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Question Papers
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                            Download free BA question papers from MBBU and BBMC. All 6 semesters, all subjects — instant PDF download.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/browse?course=BA" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">
                                <BookOpen className="w-5 h-5" /> Browse All BA Papers
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* College x Semester Grid */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">BA Papers by College & Semester</h2>
                        <div className="space-y-6">
                            {COLLEGES.map(college => (
                                <div key={college.slug} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{college.name} — BA Question Papers</h3>
                                        <Link to={college.hub} className="text-sm text-primary-600 font-semibold hover:underline">
                                            {college.name} Hub →
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {SEMESTERS.map((sem, idx) => (
                                            <Link
                                                key={sem}
                                                to={`/${college.slug}/ba/${sem}-question-papers`}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold text-sm transition-all"
                                            >
                                                <span className="text-lg font-bold">{idx + 1}</span>
                                                <span className="text-xs text-gray-400">Sem {idx + 1}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* About BA */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About BA Previous Year Question Papers</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The Bachelor of Arts (BA) is a 3-year undergraduate program offered by most colleges affiliated with Tripura University, following the CBCS (Choice Based Credit System) with 6 semesters. The program covers a wide range of humanities and social science subjects.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Our collection includes authentic BA previous year question papers from MBBU and BBMC for subjects including History, Political Science, English Literature, Bengali, Economics, Sociology, Philosophy, and Geography. All papers are contributed by students who appeared in the actual exams.
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Key BA Subjects Covered</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                            {['History', 'Political Science', 'English', 'Bengali', 'Economics', 'Sociology', 'Philosophy', 'Geography', 'Sanskrit', 'Education'].map(sub => (
                                <div key={sub} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    {sub}
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            BA exams typically have a mix of objective and descriptive questions. Theory papers are 70–80 marks for 3 hours. Practicing with previous year papers helps you understand the expected answer depth, essay structure, and common focus areas for each subject.
                        </p>
                    </section>

                    {/* FAQ */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqSchema.mainEntity.map((faq, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.name}</h3>
                                    <p className="text-gray-600">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Also Explore */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers/courses/bsc', label: '🔬 BSc Papers' },
                                { to: '/question-papers/courses/bcom', label: '💼 BCom Papers' },
                                { to: '/question-papers/courses/bca', label: '💻 BCA Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Hub' },
                                { to: '/guides/how-to-use-previous-year-papers', label: '📖 Study Guide' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">
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

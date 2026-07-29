import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const SEMESTERS = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];
const COLLEGES = [
    { name: 'MBBU', slug: 'mbbu', hub: '/universities/tripura/mbbu-question-papers' },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'By Course', item: `${SITE}/question-papers/courses` },
        { '@type': 'ListItem', position: 4, name: 'BCA Question Papers', item: `${SITE}/question-papers/courses/bca` },
    ],
};

const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'BCA Previous Year Question Papers by College and Semester',
    numberOfItems: COLLEGES.length * SEMESTERS.length,
    itemListElement: COLLEGES.flatMap((c, ci) =>
        SEMESTERS.map((sem, si) => ({
            '@type': 'ListItem', position: ci * SEMESTERS.length + si + 1,
            name: `${c.name} BCA ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
            url: `${SITE}/${c.slug}/bca/${sem}-question-papers`,
        }))
    ),
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Where to find BCA previous year question papers?', acceptedAnswer: { '@type': 'Answer', text: 'Study Volte offers free BCA question papers from MBBU for all 6 semesters. Programming, Data Structures, DBMS, Networking, and all BCA subjects are covered.' } },
        { '@type': 'Question', name: 'Which BCA subjects\' papers are available?', acceptedAnswer: { '@type': 'Answer', text: 'We have papers for C Programming, C++, Java, Data Structures, DBMS, Computer Networks, Software Engineering, Web Technology, and other core BCA subjects at MBBU.' } },
    ],
};

export default function BCACourseHub() {
    return (
        <>
            <SEOHead
                title="BCA Previous Year Question Papers | All Semesters Free PDF | Study Volte"
                description="Download BCA (Bachelor of Computer Applications) previous year question papers from MBBU. Programming, Data Structures, DBMS, Networking — all 6 semesters free PDF."
                keywords="BCA question papers, BCA previous year question paper, Bachelor of Computer Applications question papers, BCA semester papers, MBBU BCA papers, programming question paper, data structures question paper, DBMS question paper"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers" className="hover:text-primary-600 transition-colors">Question Papers</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers/courses" className="hover:text-primary-600 transition-colors">By Course</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">BCA</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            BCA Previous Year
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Question Papers</span>
                        </h1>
                        <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">Programming, Data Structures, DBMS, Networking — all 6 semesters, free PDF download.</p>
                        <Link to="/browse?course=BCA" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">Browse All BCA Papers</Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">BCA Papers by College & Semester</h2>
                        <div className="space-y-6">
                            {COLLEGES.map(college => (
                                <div key={college.slug} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{college.name} — BCA Question Papers</h3>
                                        <Link to={college.hub} className="text-sm text-primary-600 font-semibold hover:underline">{college.name} Hub →</Link>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {SEMESTERS.map((sem, idx) => (
                                            <Link key={sem} to={`/${college.slug}/bca/${sem}-question-papers`}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 text-gray-700 font-semibold text-sm transition-all">
                                                <span className="text-lg font-bold">{idx + 1}</span>
                                                <span className="text-xs text-gray-400">Sem {idx + 1}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About BCA Previous Year Question Papers</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            BCA is a 3-year technical degree program covering core computer science and application subjects. Exam papers include both theoretical concepts and practical programming problems. Previous year papers help you understand expected code quality, algorithm descriptions, and the balance between theory and application.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {['C Programming', 'C++ OOP', 'Java', 'Data Structures', 'DBMS', 'Computer Networks', 'Software Engineering', 'Web Technology', 'Operating Systems'].map(sub => (
                                <div key={sub} className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>{sub}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers/courses/ba', label: '📚 BA Papers' },
                                { to: '/question-papers/courses/bsc', label: '🔬 BSc Papers' },
                                { to: '/question-papers/courses/bcom', label: '💼 BCom Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Hub' },
                                { to: '/guides/exam-preparation-strategy', label: '🎯 Exam Strategy' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

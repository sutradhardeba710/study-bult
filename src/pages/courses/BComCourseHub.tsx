import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const SEMESTERS = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];
const COLLEGES = [
    { name: 'MBBU', slug: 'mbbu', hub: '/universities/tripura/mbbu-question-papers' },
    { name: 'BBMC', slug: 'bbmc', hub: '/universities/tripura/bbmc-question-papers' },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'By Course', item: `${SITE}/question-papers/courses` },
        { '@type': 'ListItem', position: 4, name: 'BCom Question Papers', item: `${SITE}/question-papers/courses/bcom` },
    ],
};

const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'BCom Previous Year Question Papers by College and Semester',
    numberOfItems: COLLEGES.length * SEMESTERS.length,
    itemListElement: COLLEGES.flatMap((c, ci) =>
        SEMESTERS.map((sem, si) => ({
            '@type': 'ListItem', position: ci * SEMESTERS.length + si + 1,
            name: `${c.name} BCom ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
            url: `${SITE}/${c.slug}/bcom/${sem}-question-papers`,
        }))
    ),
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Where to find BCom previous year question papers?', acceptedAnswer: { '@type': 'Answer', text: 'Study Volte has free BCom previous year papers from MBBU and BBMC covering Accountancy, Business Studies, Economics, and all commerce subjects for all 6 semesters.' } },
        { '@type': 'Question', name: 'Which BCom subjects are covered?', acceptedAnswer: { '@type': 'Answer', text: 'Our BCom collection covers Financial Accountancy, Business Studies, Business Mathematics, Economics, Commercial Law, Income Tax, Cost Accounting, Financial Management and more.' } },
    ],
};

export default function BComCourseHub() {
    return (
        <>
            <SEOHead
                title="BCom Previous Year Question Papers | All Semesters Free PDF | Study Volte"
                description="Download BCom (Bachelor of Commerce) previous year question papers from MBBU and BBMC. Accountancy, Business Studies, Economics, Financial Management — all 6 semesters free PDF."
                keywords="BCom question papers, BCom previous year question paper, Bachelor of Commerce question papers, BCom semester papers, MBBU BCom papers, BBMC BCom papers, accountancy question paper, business studies question paper"
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
                            <li className="font-semibold text-gray-800">BCom</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-amber-600 via-orange-700 to-orange-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            BCom Previous Year
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Question Papers</span>
                        </h1>
                        <p className="text-lg text-amber-100 max-w-2xl mx-auto mb-8">Accountancy, Business Studies, Economics and all commerce subjects — all 6 semesters, free PDF.</p>
                        <Link to="/browse?course=BCom" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">Browse All BCom Papers</Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">BCom Papers by College & Semester</h2>
                        <div className="space-y-6">
                            {COLLEGES.map(college => (
                                <div key={college.slug} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{college.name} — BCom Question Papers</h3>
                                        <Link to={college.hub} className="text-sm text-primary-600 font-semibold hover:underline">{college.name} Hub →</Link>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {SEMESTERS.map((sem, idx) => (
                                            <Link key={sem} to={`/${college.slug}/bcom/${sem}-question-papers`}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 text-gray-700 font-semibold text-sm transition-all">
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About BCom Previous Year Question Papers</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The Bachelor of Commerce (BCom) is a 3-year program spread across 6 semesters. It focuses on financial, business, and commercial education. Previous year papers reveal the weight given to practical problems (journal entries, ledger, financial statements) versus theory in each subject.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            What makes BCom exams different from most arts and science papers is the split between numerical and descriptive answers. Accounting, cost accounting, and income tax papers are built around problems you solve step by step, where presentation and format carry marks of their own — a correctly ruled ledger or a properly structured trading and profit &amp; loss account earns credit even before the final figure. Theory-heavy papers like business studies, commercial law, and economics reward precise definitions, relevant sections or case references, and clearly labelled points. Looking at two or three previous year papers side by side quickly shows you which subjects lean numerical and which lean descriptive, so you can plan practice time accordingly.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The most efficient way to prepare is to solve the practical papers with a pen rather than just reading them. Accounting improves only with repetition — the same categories of adjustment entries, depreciation methods, and final-account formats recur year after year, and speed comes from having worked them enough times that the format is automatic. For theory subjects, prepare a one-page summary of the questions that appear most often across years; in commerce papers a small set of long-answer topics tends to dominate, and securing those confidently is usually worth more than thin coverage of the entire syllabus. Practising past papers under the actual time limit also trains you to allocate minutes between the compulsory numerical section and the choice-based theory section, which is where many students lose marks to time pressure rather than lack of knowledge.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {['Financial Accountancy', 'Business Studies', 'Business Mathematics', 'Economics', 'Commercial Law', 'Income Tax', 'Cost Accounting', 'Financial Management', 'Auditing'].map(sub => (
                                <div key={sub} className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>{sub}
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
                                { to: '/question-papers/courses/bca', label: '💻 BCA Papers' },
                                { to: '/universities/tripura/bbmc-question-papers', label: '🏛️ BBMC Hub' },
                                { to: '/guides/how-to-use-previous-year-papers', label: '📖 Study Guide' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700 hover:text-amber-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

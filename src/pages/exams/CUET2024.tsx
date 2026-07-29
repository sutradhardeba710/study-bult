import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ArrowLeft, Calendar, ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';

const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'CUET', item: `${SITE}/exams/cuet` },
        { '@type': 'ListItem', position: 4, name: 'CUET 2024', item: `${SITE}/exams/cuet/2024` },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'When was CUET 2024 conducted?', acceptedAnswer: { '@type': 'Answer', text: 'CUET 2024 was conducted by NTA in May 2024 across two rounds — CUET UG (May 15 to 24, 2024). Results were declared in June 2024.' } },
        { '@type': 'Question', name: 'How is CUET 2024 different from 2023?', acceptedAnswer: { '@type': 'Answer', text: 'CUET 2024 had a revised pattern with hybrid mode exam (CBT + PBT) and shorter duration for some subjects. Domain subjects were reduced to 40 questions (35 to attempt).' } },
        { '@type': 'Question', name: 'Are CUET 2024 papers helpful for 2025 prep?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — CUET 2024 papers are among the most valuable resources for CUET 2025 preparation. The topic distribution and difficulty level closely mirrors what you can expect in 2025.' } },
    ],
};

const subjects = ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Political Science', 'Economics', 'Geography', 'Accountancy', 'Business Studies', 'General Test', 'Computer Science', 'Sociology'];

export default function CUET2024() {
    return (
        <>
            <SEOHead
                title="CUET 2024 Previous Year Question Paper | Free PDF Download | Study Volte"
                description="Download CUET 2024 previous year question papers for all subjects. Authentic NTA CUET 2024 papers with answer keys — English, Mathematics, Physics, Chemistry, General Test and more."
                keywords="CUET 2024 question paper, CUET 2024 previous year paper, CUET 2024 PDF download, NTA CUET 2024 paper, CUET 2024 answer key, CUET 2024 subject papers, CUET UG 2024 question paper"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers/exams" className="hover:text-primary-600 transition-colors">National Exams</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/exams/cuet" className="hover:text-primary-600 transition-colors">CUET</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">2024</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-violet-700 via-violet-800 to-purple-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <Calendar className="w-4 h-4 text-yellow-300" />
                            <span>CUET 2024 — NTA</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            CUET 2024
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Previous Year Question Papers</span>
                        </h1>
                        <p className="text-lg text-violet-100 max-w-2xl mx-auto mb-8">
                            Authentic CUET 2024 papers for all 27 domain subjects. Essential for CUET 2025 preparation.
                        </p>
                        <Link to="/browse?exam=CUET&year=2024" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">Browse CUET 2024 Papers</Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <Link to="/exams/cuet" className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline"><ArrowLeft className="w-4 h-4" /> Back to CUET Hub</Link>
                    </div>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">CUET 2024 Subjects</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subjects.map(sub => (
                                <Link key={sub} to={`/browse?exam=CUET&year=2024&subject=${encodeURIComponent(sub)}`}
                                    className="flex items-center justify-between bg-white border border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-gray-700 hover:text-violet-700 font-medium px-4 py-3 rounded-xl transition-all text-sm group">
                                    {sub}
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </section>

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

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/exams/cuet/2025', label: '🆕 CUET 2025 Papers' },
                                { to: '/exams/cuet', label: '🎯 CUET Hub' },
                                { to: '/exams/ssc-cgl', label: '📋 SSC CGL Papers' },
                                { to: '/question-papers/exams', label: '🏆 All Exams' },
                                { to: '/guides/exam-preparation-strategy', label: '📖 Exam Strategy' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-gray-700 hover:text-violet-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

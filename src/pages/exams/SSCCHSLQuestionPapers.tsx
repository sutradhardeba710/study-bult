import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` }, { '@type': 'ListItem', position: 3, name: 'SSC', item: `${SITE}/exams/ssc` }, { '@type': 'ListItem', position: 4, name: 'SSC CHSL', item: `${SITE}/exams/ssc-chsl` }] };
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'What is SSC CHSL exam?', acceptedAnswer: { '@type': 'Answer', text: 'SSC CHSL (Combined Higher Secondary Level) is conducted by SSC for 10+2 pass candidates for posts like LDC, DEO, PA/SA in government departments. The exam has Tier 1 (CBT) and Tier 2 (Descriptive).' } }, { '@type': 'Question', name: 'What is SSC CHSL Tier 1 syllabus?', acceptedAnswer: { '@type': 'Answer', text: 'SSC CHSL Tier 1 covers General Intelligence, English, Quantitative Aptitude, and General Awareness. 100 questions in 60 minutes. +2 for correct, -0.5 for wrong.' } }, { '@type': 'Question', name: 'How to prepare for SSC CHSL?', acceptedAnswer: { '@type': 'Answer', text: 'Practice SSC CHSL previous year papers daily. Focus on Quantitative Aptitude and English as they have highest weightage. Aim for 20+ papers before the exam.' } }] };

export default function SSCCHSLQuestionPapers() {
    return (
        <>
            <SEOHead
                title="SSC CHSL Previous Year Question Paper | Free PDF Download | Study Volte"
                description="Download SSC CHSL previous year question papers for Tier 1 and Tier 2. All years, all shifts — English, Quantitative Aptitude, Reasoning, General Awareness. Free PDF."
                keywords="SSC CHSL question paper, SSC CHSL previous year paper, SSC CHSL Tier 1 paper, SSC CHSL PDF download, SSC CHSL 2024 paper, SSC CHSL reasoning paper, SSC CHSL maths paper"
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
                            <li><Link to="/exams/ssc" className="hover:text-primary-600 transition-colors">SSC</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">SSC CHSL</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-cyan-700 via-cyan-800 to-teal-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <span>SSC Combined Higher Secondary Level</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            SSC CHSL
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Previous Year Question Papers</span>
                        </h1>
                        <p className="text-lg text-cyan-100 max-w-2xl mx-auto mb-8">Download authentic SSC CHSL Tier 1 & Tier 2 papers for all years. All shifts, all subjects — free PDF download.</p>
                        <Link to="/browse?exam=SSC-CHSL" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">Browse SSC CHSL Papers</Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Tier 1 Sections */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">SSC CHSL Tier 1 — Sections</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'General Intelligence', q: '25 Qs / 25 Marks', desc: 'Verbal and non-verbal reasoning, analogies, classification, series, puzzles' },
                                { title: 'English Language', q: '25 Qs / 25 Marks', desc: 'Fill in the blanks, one-word substitution, spelling, idioms, reading comprehension' },
                                { title: 'Quantitative Aptitude', q: '25 Qs / 25 Marks', desc: 'Arithmetic, algebra, geometry, mensuration, statistics, number system' },
                                { title: 'General Awareness', q: '25 Qs / 25 Marks', desc: 'History, Geography, Polity, Science, Current Affairs, Economy' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                                    <p className="text-xs font-semibold text-cyan-600 mb-2">{s.q}</p>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                </div>
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
                            {[{ to: '/exams/ssc-cgl', label: '📋 SSC CGL Papers' }, { to: '/exams/ssc-gd', label: '🛡️ SSC GD Papers' }, { to: '/exams/ssc', label: '📄 SSC Hub' }, { to: '/exams/cuet', label: '🎯 CUET Papers' }, { to: '/guides/exam-preparation-strategy', label: '📖 Exam Strategy' }].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

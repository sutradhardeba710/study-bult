import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'SSC', item: `${SITE}/exams/ssc` }, { '@type': 'ListItem', position: 3, name: 'SSC GD', item: `${SITE}/exams/ssc-gd` }] };
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'What is SSC GD Constable exam?', acceptedAnswer: { '@type': 'Answer', text: 'SSC GD (General Duty) Constable exam is conducted by SSC for recruitment to CRPF, BSF, CISF, ITBP, SSB, NIA, SSF and AR. It requires Class 10 pass qualification.' } }, { '@type': 'Question', name: 'What is SSC GD exam pattern?', acceptedAnswer: { '@type': 'Answer', text: 'SSC GD CBT has 80 questions in 60 minutes — General Intelligence (20Qs), General Knowledge (20Qs), Elementary Maths (20Qs), English/Hindi (20Qs). +2 for correct, -0.5 for wrong.' } }] };

export default function SSCGDQuestionPapers() {
    return (
        <>
            <SEOHead
                title="SSC GD Constable Previous Year Question Paper | Free PDF | Study Volte"
                description="Download SSC GD Constable previous year question papers — all years and all shifts. General Intelligence, GK, Maths, English. Authentic papers for SSC GD 2024, 2023, 2022."
                keywords="SSC GD question paper, SSC GD constable previous year paper, SSC GD PDF download, SSC GD 2024 paper, SSC GD reasoning paper, SSC GD maths paper, SSC GD general knowledge"
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
                            <li className="font-semibold text-gray-800">SSC GD</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                            SSC GD Constable
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Previous Year Question Papers</span>
                        </h1>
                        <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8">Authentic SSC GD CBT papers for all years and shifts. General Intelligence, GK, Maths, English — free PDF.</p>
                        <Link to="/browse?exam=SSC-GD" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">Browse SSC GD Papers</Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">SSC GD CBT — Exam Pattern</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[{ title: 'General Intelligence', q: '20 Qs / 40 Marks', desc: 'Series, analogies, classification, blood relations, coding-decoding' }, { title: 'General Knowledge', q: '20 Qs / 40 Marks', desc: 'History, Geography, Polity, Science, Current Affairs, Sports' }, { title: 'Elementary Mathematics', q: '20 Qs / 40 Marks', desc: 'Arithmetic, number system, percentages, ratio, time & work, simple interest' }, { title: 'English / Hindi', q: '20 Qs / 40 Marks', desc: 'Grammar, vocabulary, comprehension in both English and Hindi medium' }].map((s, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                                    <p className="text-xs font-semibold text-emerald-600 mb-2">{s.q}</p>
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
                            {[{ to: '/exams/ssc-cgl', label: '📋 SSC CGL' }, { to: '/exams/ssc-chsl', label: '📄 SSC CHSL' }, { to: '/exams/ssc', label: '🏆 SSC Hub' }, { to: '/exams/cuet', label: '🎯 CUET' }, { to: '/guides/exam-preparation-strategy', label: '📖 Strategy Guide' }].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

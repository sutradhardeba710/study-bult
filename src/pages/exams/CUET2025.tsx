import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ArrowLeft, Calendar, ChevronRight, Home, Target } from 'lucide-react';

const SITE = 'https://study-volte.site';

const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'CUET', item: `${SITE}/exams/cuet` },
        { '@type': 'ListItem', position: 4, name: 'CUET 2025', item: `${SITE}/exams/cuet/2025` },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'When is CUET 2025?', acceptedAnswer: { '@type': 'Answer', text: 'CUET 2025 is expected to be conducted by NTA in May–June 2025. Check NTA\'s official website for exact dates.' } },
        { '@type': 'Question', name: 'What subjects are in CUET 2025?', acceptedAnswer: { '@type': 'Answer', text: 'CUET 2025 includes Section IA (Languages), Section IB (Additional Languages), Section II (Domain Subjects: 27 subjects), and Section III (General Test).' } },
        { '@type': 'Question', name: 'How many questions are in CUET 2025?', acceptedAnswer: { '@type': 'Answer', text: 'CUET 2025 has 50 questions per domain subject (45 to be attempted in 45 minutes). Each correct answer gives +5 marks, incorrect -1.' } },
    ],
};

const subjects = [
    'English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'History', 'Political Science', 'Economics', 'Geography', 'Accountancy', 'Business Studies',
    'General Test', 'Computer Science', 'Sociology',
];

export default function CUET2025() {
    return (
        <>
            <SEOHead
                title="CUET 2025 Previous Year Question Paper | Free PDF Download | Study Volte"
                description="Download CUET 2025 previous year question papers for all subjects — English, Mathematics, Physics, Chemistry, Biology, History, Economics, General Test and more. Free PDF."
                keywords="CUET 2025 question paper, CUET 2025 previous year paper, CUET 2025 PDF download, CUET question paper 2025, NTA CUET 2025 paper, CUET 2025 practice paper, CUET 2025 subject wise paper"
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
                            <li className="font-semibold text-gray-800">2025</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-rose-700 via-rose-800 to-pink-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <Calendar className="w-4 h-4 text-yellow-300" />
                            <span>CUET 2025 — NTA</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            CUET 2025
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Previous Year Question Papers
                            </span>
                        </h1>
                        <p className="text-lg text-rose-100 max-w-2xl mx-auto mb-8">
                            Practice with authentic CUET 2025 papers across all subjects. Understand exam patterns, difficulty levels, and score higher.
                        </p>
                        <Link to="/browse?exam=CUET&year=2025" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg">
                            <Target className="w-5 h-5" /> Browse CUET 2025 Papers
                        </Link>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back to CUET Hub */}
                    <div className="mb-8">
                        <Link to="/exams/cuet" className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
                            <ArrowLeft className="w-4 h-4" /> Back to CUET Hub
                        </Link>
                    </div>

                    {/* Subjects Grid */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">CUET 2025 Subjects</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subjects.map(sub => (
                                <Link
                                    key={sub}
                                    to={`/browse?exam=CUET&year=2025&subject=${encodeURIComponent(sub)}`}
                                    className="flex items-center justify-between bg-white border border-gray-200 hover:border-rose-400 hover:bg-rose-50 text-gray-700 hover:text-rose-700 font-medium px-4 py-3 rounded-xl transition-all text-sm group"
                                >
                                    {sub}
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Exam Pattern */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2025 Exam Pattern</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: 'Section IA & IB', desc: 'Language papers — 40 questions, 45 minutes each. Tests reading comprehension and language skills.' },
                                { title: 'Section II — Domain', desc: '27 domain subjects. 50 questions per paper (45 to attempt). 45 minutes. +5 for correct, -1 for wrong.' },
                                { title: 'Section III — General Test', desc: 'General Knowledge, Current Affairs, Logical Reasoning, Quantitative Aptitude. 60 questions, 60 minutes.' },
                            ].map((s, i) => (
                                <div key={i} className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                                    <h3 className="font-bold text-rose-900 mb-2">{s.title}</h3>
                                    <p className="text-sm text-gray-600">{s.desc}</p>
                                </div>
                            ))}
                        </div>
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
                                { to: '/exams/cuet/2024', label: '📄 CUET 2024 Papers' },
                                { to: '/exams/cuet', label: '🎯 CUET Hub' },
                                { to: '/exams/ssc-cgl', label: '📋 SSC CGL Papers' },
                                { to: '/question-papers/exams', label: '🏆 All Exams' },
                                { to: '/guides/exam-preparation-strategy', label: '📖 Exam Strategy' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-rose-400 hover:bg-rose-50 text-gray-700 hover:text-rose-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">{item.label}</Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

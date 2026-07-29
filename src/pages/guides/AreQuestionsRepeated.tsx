import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Do questions repeat in MBBU exams?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, MBBU exam questions repeat significantly — especially in theory-heavy subjects like History, Political Science, and Economics. Frequently, 30–50% of long answer questions are directly repeated or slightly rephrased from previous years.' } },
        { '@type': 'Question', name: 'How many years of previous papers should I solve?', acceptedAnswer: { '@type': 'Answer', text: 'For university exams (MBBU, BBMC), solve at least 3-5 years of previous papers per subject to get a solid pattern understanding.' } },
    ],
};

const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'Are Questions Repeated in University Exams?',
    description: 'Data-backed analysis of how often questions repeat in MBBU and BBMC exams.',
    author: { '@type': 'Organization', name: 'Study Volte' },
    publisher: { '@type': 'Organization', name: 'Study Volte', logo: { '@type': 'ImageObject', url: `${SITE}/logo-optimized.webp` } },
    mainEntityOfPage: `${SITE}/guides/are-questions-repeated-in-exams`,
};

export default function AreQuestionsRepeated() {
    return (
        <>
            <SEOHead
                title="Are Questions Repeated in Exams? MBBU, BBMC Analysis | Study Volte"
                description="Find out how often questions repeat in MBBU, and BBMC university exams. Data-backed analysis with practical tips to target repeated topics."
                keywords="are questions repeated in exams, question repeat pattern, MBBU question repeat, previous year paper strategy, common exam questions, BBMC repeated questions"
            />
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/guides" className="hover:text-primary-600 transition-colors">Guides</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">Are Questions Repeated?</li>
                        </ol>
                    </div>
                </nav>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <span className="text-4xl mb-4 block">🔁</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">Are Questions Repeated in University & Competitive Exams?</h1>
                        <p className="text-lg text-gray-500">4 min read · Study Strategy</p>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Short answer: <strong>Yes — especially in university exams.</strong> Understanding this pattern will help you plan your revision far more strategically.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">University Exams (MBBU & BBMC)</h2>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                            <h3 className="font-bold text-green-900 mb-3">📊 Repeat Rate: 40–60% in theory subjects</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Long answer questions in History and Political Science repeat almost verbatim</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Short notes topics cycle through with minimal variation every 2–3 years</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Objective/MCQ sections have 20–30% direct repeat</li>
                                <li className="flex items-start gap-2"><span className="text-yellow-500 font-bold mt-0.5">⚠</span>Science numerical problems are rephased but test the same concept</li>
                            </ul>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            The most reliable way to identify repeated questions for MBBU or BBMC is to solve the last 3–5 years of papers for each subject and highlight recurring long-answer questions. You'll typically find 8–12 "golden questions" per subject that appear repeatedly and should be prepared thoroughly.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">How to Target Repeated Questions</h2>
                        <ol className="space-y-4 text-gray-700">
                            {['Collect 3–5 previous year papers for your exam', 'Highlight every question you see in ≥2 years', 'Create a "high probability" question bank of 50–100 questions', 'Prepare these questions first before moving to new topics', 'Review your question bank 3 days before the exam for quick recall'].map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* FAQ */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqSchema.mainEntity.map((faq, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.name}</h3>
                                    <p className="text-gray-600">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <Link to="/guides/how-to-use-previous-year-papers" className="bg-white border border-gray-200 hover:border-primary-400 rounded-xl p-4 transition-all group">
                            <p className="text-xs text-gray-400 mb-1">← Previous</p>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">How to Use Previous Year Papers</p>
                        </Link>
                        <Link to="/guides/exam-preparation-strategy" className="bg-white border border-gray-200 hover:border-primary-400 rounded-xl p-4 transition-all group text-right">
                            <p className="text-xs text-gray-400 mb-1">Next →</p>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">Exam Preparation Strategy</p>
                        </Link>
                    </div>

                    <div className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
                        <p className="font-semibold text-gray-900 mb-3">Start practicing with previous year papers now</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/universities/tripura/mbbu-question-papers" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">MBBU Papers</Link>
                            <Link to="/universities/tripura/bbmc-question-papers" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary-400 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">BBMC Papers</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

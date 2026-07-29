import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Use Previous Year Question Papers Effectively', description: 'A complete strategy guide on using previous year papers to maximize exam scores.', author: { '@type': 'Organization', name: 'Study Volte' }, publisher: { '@type': 'Organization', name: 'Study Volte', logo: { '@type': 'ImageObject', url: `${SITE}/logo-optimized.webp` } }, mainEntityOfPage: `${SITE}/guides/how-to-use-previous-year-papers` };
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'When should I start solving previous year papers?', acceptedAnswer: { '@type': 'Answer', text: 'Start solving previous year papers after completing 60–70% of your syllabus. Solving too early is counterproductive. Start with recent papers (latest year first) and work backward.' } }, { '@type': 'Question', name: 'How many previous year papers should I solve?', acceptedAnswer: { '@type': 'Answer', text: 'Solve at least 3 years of papers for university exams (MBBU, BBMC) to get a solid pattern understanding.' } }, { '@type': 'Question', name: 'Should I solve papers under timed conditions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Always solve at least 50% of your previous year papers under exact exam conditions — same time limit, no breaks, no reference materials. This is the only way to build time management skills.' } }] };

const steps = [
    { step: 1, title: 'Start with the Latest Year', desc: 'Begin with the most recent year paper. This gives you the current exam pattern, difficulty level, and the topics the examiner has been focusing on recently. The latest paper is the best predictor of the upcoming exam.', tip: 'Don\'t look at the solutions first. Attempt the paper genuinely.' },
    { step: 2, title: 'Analyze Before You Practice', desc: 'Before solving the second paper, spend 30 minutes analyzing your first attempt. Which chapters had the most questions? Where did you lose marks? This analysis tells you where to invest study time next.', tip: 'Make a topic-wise tally. You\'ll see patterns immediately.' },
    { step: 3, title: 'Identify Your Weak Chapters', desc: 'After 2–3 papers, you\'ll see a clear pattern of your weaker areas. Go back to your textbook and revise only those specific chapters — not the entire subject.', tip: 'Focus revision on your bottom 20% of chapters, not all chapters equally.' },
    { step: 4, title: 'Create a High-Priority Question Bank', desc: 'For every question you got wrong or skipped, add it to a personal "revision list." Questions that appear in multiple previous year papers go to the top of this list. These are your high-probability questions.', tip: 'Maintain a physical or digital notebook of these questions.' },
    { step: 5, title: 'Practice Under Exam Conditions', desc: 'At least once per subject, solve a complete previous year paper under actual exam conditions: same duration, no breaks, no phone. This builds the mental stamina and time management skills you need.', tip: 'Simulate exam-day morning — wake at the same time, eat the same, start at the same time.' },
    { step: 6, title: 'Review and Repeat', desc: 'Two or three days before your exam, don\'t study new material. Instead, review your high-priority question bank and make sure you\'re confident on every entry. This review session is where marks are secured.', tip: 'Read solutions aloud — it engages auditory memory and reinforces recall.' },
];

export default function HowToUsePYQ() {
    return (
        <>
            <SEOHead
                title="How to Use Previous Year Question Papers Effectively | Study Guide | Study Volte"
                description="Complete 6-step strategy guide on how to effectively use previous year question papers to maximize exam scores in university exams like MBBU and BBMC."
                keywords="how to use previous year question papers, previous year paper strategy, how to prepare with previous year papers, PYQ strategy, exam preparation with old papers, question paper analysis guide"
            />
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/guides" className="hover:text-primary-600 transition-colors">Guides</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">How to Use PYQ Papers</li>
                        </ol>
                    </div>
                </nav>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <span className="text-4xl mb-4 block">📖</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">How to Use Previous Year Question Papers Effectively</h1>
                        <p className="text-lg text-gray-500">6 min read · Study Strategy</p>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                        Previous year question papers are the single most underutilized resource in most students' study plan. The majority of students either never touch them, or solve them too late (the night before the exam). This guide gives you a systematic 6-step process to extract maximum value from every paper you solve.
                    </p>

                    <div className="space-y-6 mb-12">
                        {steps.map(s => (
                            <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-7">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-primary-600 text-white font-extrabold text-xl flex items-center justify-center flex-shrink-0">{s.step}</div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
                                        <p className="text-gray-600 leading-relaxed mb-4">{s.desc}</p>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
                                            <span className="text-xs font-bold text-yellow-800">💡 Pro Tip: </span>
                                            <span className="text-sm text-yellow-900">{s.tip}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
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

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div></div>
                        <Link to="/guides/are-questions-repeated-in-exams" className="bg-white border border-gray-200 hover:border-primary-400 rounded-xl p-4 transition-all group text-right">
                            <p className="text-xs text-gray-400 mb-1">Next →</p>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">Are Questions Repeated in Exams?</p>
                        </Link>
                    </div>

                    <div className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
                        <p className="font-semibold text-gray-900 mb-3">Find the right previous year papers for your exam</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/universities/tripura/mbbu-question-papers" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">MBBU Papers</Link>
                            <Link to="/universities/tripura/bbmc-question-papers" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary-400 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">BBMC Papers</Link>
                            <Link to="/browse" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary-400 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">Browse All</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

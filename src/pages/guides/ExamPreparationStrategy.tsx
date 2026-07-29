import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: 'Exam Preparation Strategy That Works', description: 'A proven 30-day exam preparation strategy using previous year papers, active recall, and targeted revision.', author: { '@type': 'Organization', name: 'Study Volte' }, publisher: { '@type': 'Organization', name: 'Study Volte', logo: { '@type': 'ImageObject', url: `${SITE}/logo-optimized.webp` } }, mainEntityOfPage: `${SITE}/guides/exam-preparation-strategy` };

const weeks = [
    { week: 'Week 1–2', title: 'Foundation + Pattern Analysis', color: 'blue', tasks: ['Complete syllabus coverage at lecture pace', 'Collect all previous year papers (min. 3 years)', 'Solve 1 paper per subject — don\'t time yourself yet', 'Create subject-wise topic frequency chart from papers', 'Identify your top 3 weak chapters per subject'] },
    { week: 'Week 3', title: 'Targeted Revision', color: 'primary', tasks: ['Revise only high-frequency topics (from your chart)', 'For each weak chapter: read, make notes, then test yourself', 'Solve 1 more paper per subject timed (70% of real time)', 'Build your "high-probability question bank"', 'Review all incorrect answers from Week 1 papers'] },
    { week: 'Week 4', title: 'Full Mock + Refinement', color: 'green', tasks: ['Solve 2+ full papers per subject under real exam time', 'Alternate between different subjects daily', 'Focus all new study on your question bank only', 'Practice paragraph answers for theory subjects aloud', 'Get 8 hours of sleep every night — memory consolidates during sleep'] },
    { week: 'Final 3 Days', title: 'Lock-In & Review', color: 'amber', tasks: ['No new topics — only review your question bank', 'Re-read your own notes (not the textbook)', 'Do one light revision paper per subject (read-through only)', 'Prepare all exam materials the night before', 'Sleep at consistent times — maintain your body clock'] },
];

const colorMap: Record<string, string> = { blue: 'bg-blue-100 text-blue-800 border-blue-200', primary: 'bg-primary-100 text-primary-800 border-primary-200', green: 'bg-green-100 text-green-800 border-green-200', amber: 'bg-amber-100 text-amber-800 border-amber-200' };

export default function ExamPreparationStrategy() {
    return (
        <>
            <SEOHead
                title="Exam Preparation Strategy That Works | 30-Day Plan | Study Volte"
                description="A proven 30-day exam preparation strategy using previous year papers, active recall, and targeted revision. Works for MBBU, BBMC, and all university exams."
                keywords="exam preparation strategy, 30 day study plan, how to prepare for exams, study schedule, exam preparation tips, university exam strategy, active recall study method"
            />
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/guides" className="hover:text-primary-600 transition-colors">Guides</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">Exam Preparation Strategy</li>
                        </ol>
                    </div>
                </nav>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <span className="text-4xl mb-4 block">🎯</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">Exam Preparation Strategy That Works — 30-Day Plan</h1>
                        <p className="text-lg text-gray-500">8 min read · Study Strategy</p>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                        This strategy works because it's built around two core principles: <strong>Pattern Recognition</strong> (what do examiners ask again and again?) and <strong>Strategic Retrieval</strong> (practicing recall, not just re-reading). Most students study passively — they read notes over and over. This plan is fundamentally different.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-10 text-lg">
                        The central tool of this strategy is the <strong>previous year question paper</strong>. Every week's activities revolves around it. Without papers, you're preparing blindly.
                    </p>

                    <div className="space-y-6 mb-12">
                        {weeks.map(w => (
                            <div key={w.week} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className={`px-6 py-4 border-b ${colorMap[w.color] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-extrabold text-sm">{w.week}</span>
                                        <span className="font-bold text-lg">{w.title}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {w.tasks.map((task, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                                <span className="text-gray-700 text-sm leading-relaxed">{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-900 text-white rounded-2xl p-8 mb-12">
                        <h2 className="text-xl font-bold mb-4">The Golden Rules (Don't Break These)</h2>
                        <ul className="space-y-3">
                            {[
                                'Never revise an entire book — only high-frequency topics from papers',
                                'Never solve a paper without reviewing it afterward',
                                'Never skip timed mock papers — time management is learnable only by practice',
                                'Never study new material in the final 3 days',
                                'Never sacrifice sleep for extra revision — it always backfires',
                            ].map((rule, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                                    <span className="text-gray-300">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <Link to="/guides/are-questions-repeated-in-exams" className="bg-white border border-gray-200 hover:border-primary-400 rounded-xl p-4 transition-all group">
                            <p className="text-xs text-gray-400 mb-1">← Previous</p>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">Are Questions Repeated in Exams?</p>
                        </Link>
                        <div></div>
                    </div>

                    <div className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
                        <p className="font-semibold text-gray-900 mb-3">Start your preparation with previous year papers</p>
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

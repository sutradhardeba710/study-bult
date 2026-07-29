import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { BookOpen, ChevronRight, Clock, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';
const guides = [
    { title: 'How to Use Previous Year Question Papers Effectively', slug: 'how-to-use-previous-year-papers', desc: 'A complete strategy guide on how to analyze, practice, and revise using previous year papers to maximize your exam score.', readTime: '6 min read', icon: '📖' },
    { title: 'Are Questions Repeated in University Exams?', slug: 'are-questions-repeated-in-exams', desc: 'Data-backed answer on how often questions repeat in MBBU, BBMC, CUET, and SSC exams — and how to target them.', readTime: '4 min read', icon: '🔁' },
    { title: 'Exam Preparation Strategy That Works', slug: 'exam-preparation-strategy', desc: 'A proven 30-day exam preparation strategy using previous year papers, active recall, and targeted revision.', readTime: '8 min read', icon: '🎯' },
];

const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides` }] };

export default function GuidesIndex() {
    return (
        <>
            <SEOHead
                title="Study Guides & Exam Strategy | How to Use Previous Year Papers | Study Volte"
                description="Expert guides on exam preparation, how to use previous year question papers, study strategies, and tips for CUET, SSC, MBBU, BBMC and other competitive exams."
                keywords="exam preparation guide, how to study with previous year papers, exam strategy, question paper analysis, study tips for competitive exams, CUET preparation guide, SSC preparation guide"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">Guides</li>
                        </ol>
                    </div>
                </nav>

                <section className="bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <BookOpen className="w-4 h-4 text-yellow-300" /><span>Study Guides & Strategy</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Exam Preparation
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">Guides & Strategy</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">Expert guides to help you prepare smarter — how to use question papers, study strategies, and exam-specific tips.</p>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6 mb-12">
                        {guides.map(guide => (
                            <Link key={guide.slug} to={`/guides/${guide.slug}`}
                                className="group block bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-lg p-8 transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex items-start gap-5">
                                    <span className="text-4xl">{guide.icon}</span>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{guide.title}</h2>
                                        <p className="text-gray-600 mb-3">{guide.desc}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" />{guide.readTime}</span>
                                            <span className="flex items-center text-primary-600 font-semibold text-sm">Read Guide <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to practice?</h2>
                        <p className="text-gray-600 mb-4">Browse thousands of previous year question papers across all exams and universities.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/question-papers" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">📄 All Question Papers</Link>
                            <Link to="/browse" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all">🔍 Browse Papers</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

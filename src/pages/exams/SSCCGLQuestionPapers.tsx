import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, TrendingUp, ChevronRight, Star, Upload, Download, FileText,
    CheckCircle, Clock, Target, Shield
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const SSCCGLQuestionPapers = () => {
    const [latestPapers, setLatestPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0 });

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        try {
            const papersRef = collection(db, 'papers');
            const q = query(
                papersRef,
                where('exam', '==', 'SSC CGL'),
                where('status', '==', 'approved')
            );
            const snapshot = await getDocs(q);
            const allPapers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PaperData[];

            allPapers.sort((a, b) => {
                const dateA = (a as any).createdAt?.seconds || 0;
                const dateB = (b as any).createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setLatestPapers(allPapers.slice(0, 12));
            setStats({ total: allPapers.length });
        } catch (error) {
            console.error('Error loading SSC CGL papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const tiers = [
        { name: 'Tier 1', desc: 'General Intelligence, General Awareness, Quantitative Aptitude, English', papers: '200+', link: '/browse?exam=SSC+CGL&category=Tier+1' },
        { name: 'Tier 2', desc: 'Paper-I (MCQ): Math, Reasoning, English, Computer. Paper-II: Statistics / Finance', papers: '150+', link: '/browse?exam=SSC+CGL&category=Tier+2' },
    ];

    const years = ['2024', '2023', '2022', '2021', '2020', '2019'];

    // Full structured data for top SEO ranking
    const webpageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "SSC CGL Previous Year Question Paper",
        "description": "Download free SSC CGL previous year question papers for Tier 1 and Tier 2 exams. Authentic PDFs uploaded by real aspirants on Study Volte.",
        "url": "https://study-volte.site/exams/ssc-cgl",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://study-volte.site" },
                { "@type": "ListItem", "position": 2, "name": "SSC Exams", "item": "https://study-volte.site/exams/ssc" },
                { "@type": "ListItem", "position": 3, "name": "SSC CGL Previous Year Question Paper", "item": "https://study-volte.site/exams/ssc-cgl" }
            ]
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Where can I download SSC CGL previous year question paper for free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Study Volte provides a completely free library of SSC CGL previous year question papers for Tier 1 and Tier 2. All papers are uploaded by real aspirants and verified by us. Download instantly in PDF format — no login or payment required to browse."
                }
            },
            {
                "@type": "Question",
                "name": "Which years' SSC CGL papers are available on Study Volte?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Study Volte has SSC CGL previous year question papers from 2019 to 2024, including all shift papers for Tier 1 and Tier 2 exams. Our community continuously adds the latest papers after every exam."
                }
            },
            {
                "@type": "Question",
                "name": "Are SSC CGL papers on Study Volte authentic?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Every SSC CGL paper on Study Volte is submitted by aspirants who appeared in the actual exam. Our moderation team verifies each paper for accuracy and readability before it's published."
                }
            },
            {
                "@type": "Question",
                "name": "How does practicing SSC CGL previous year papers help in preparation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Practicing SSC CGL previous year question papers helps you understand the exam pattern, identify high-weightage topics, improve speed and accuracy, and get familiar with the types of questions asked in Tier 1 and Tier 2. Most toppers recommend solving at least 10 years of papers before the exam."
                }
            },
            {
                "@type": "Question",
                "name": "Can I upload my SSC CGL question paper to Study Volte?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely! If you have recently appeared in SSC CGL, you can upload your memory-based questions or the official paper PDF to Study Volte. This helps thousands of aspiring candidates prepare better. Click the 'Upload Your Paper' button to contribute."
                }
            }
        ]
    };

    return (
        <>
            <SEOHead
                title="SSC CGL Previous Year Question Paper | Free Tier 1 & Tier 2 PDF | Study Volte"
                description="Download SSC CGL previous year question paper for Tier 1 and Tier 2 absolutely free. Authentic papers from 2019-2024 uploaded by real aspirants. Upload yours & help others crack SSC CGL."
                keywords="ssc cgl previous year question paper, ssc cgl previous paper pdf, ssc cgl tier 1 previous year paper, ssc cgl tier 2 previous year paper, ssc cgl question paper 2024, ssc cgl question paper 2023, ssc cgl paper download free, ssc combined graduate level previous year paper"
            />
            <script type="application/ld+json">
                {JSON.stringify(webpageSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">

                {/* Breadcrumb for SEO */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="text-sm text-gray-500 flex items-center gap-2">
                            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
                            <span>/</span>
                            <Link to="/exams/ssc" className="hover:text-orange-600 transition-colors">SSC Exams</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">SSC CGL Previous Year Question Paper</span>
                        </nav>
                    </div>
                </div>

                {/* Hero */}
                <section className="bg-gradient-to-br from-red-700 via-orange-600 to-amber-600 text-white py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-300 rounded-full opacity-20 blur-3xl" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                                <span>Most Searched Govt Job Exam | Free Papers Available</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                SSC CGL
                                <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-white to-orange-200 bg-clip-text text-transparent">
                                    Previous Year Question Paper
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-orange-100 mb-3 max-w-3xl mx-auto">
                                Free Tier 1 & Tier 2 papers from <strong className="text-yellow-300">2019 to 2024</strong> — uploaded by real aspirants.
                            </p>
                            <p className="text-lg text-orange-200 mb-10 max-w-2xl mx-auto">
                                Solve authentic SSC CGL previous year question papers and crack the exam on your first attempt.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/browse?exam=SSC+CGL"
                                    className="bg-yellow-400 text-red-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
                                >
                                    <Download className="w-6 h-6" />
                                    Download SSC CGL Papers Free
                                </Link>
                                <Link
                                    to="/upload"
                                    className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-6 h-6" />
                                    Upload Your Paper
                                </Link>
                            </div>

                            {/* Stats bar */}
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/20">
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold">{stats.total > 0 ? `${stats.total}+` : '300+'}</div>
                                    <div className="text-orange-200 text-sm font-medium mt-1">SSC CGL Papers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold">6</div>
                                    <div className="text-orange-200 text-sm font-medium mt-1">Years Covered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold">2</div>
                                    <div className="text-orange-200 text-sm font-medium mt-1">Tiers Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold">₹0</div>
                                    <div className="text-orange-200 text-sm font-medium mt-1">Cost to Download</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why practice PYQs */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Solve SSC CGL Previous Year Question Paper?
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Every SSC CGL topper will tell you the same thing — solve previous year papers religiously. Here's why:</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Target, title: 'Understand Exam Pattern', desc: 'Know exactly what question types and topics SSC CGL Tier 1 & Tier 2 focus on.' },
                                { icon: TrendingUp, title: 'Identify High-Weight Topics', desc: 'Spot repeated topics across years and prioritize them in your preparation.' },
                                { icon: Clock, title: 'Improve Speed & Accuracy', desc: 'Timed practice with real papers trains you for the actual 60-minute Tier 1 pressure.' },
                                { icon: CheckCircle, title: 'Boost Confidence', desc: 'Walking into the exam hall knowing you\'ve solved 5+ years of papers changes everything.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-orange-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-orange-100">
                                    <div className="w-14 h-14 bg-orange-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tier wise papers */}
                <section className="py-16 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">SSC CGL Tier-wise Papers</h2>
                            <p className="text-gray-600 text-lg">Choose your exam tier and browse all available SSC CGL question papers</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {tiers.map((tier, i) => (
                                <Link
                                    key={i}
                                    to={tier.link}
                                    className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-500"
                                >
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 text-orange-600 group-hover:text-white transition-all">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <span className="text-sm font-bold text-white bg-orange-600 px-4 py-1.5 rounded-full">
                                            {tier.papers} Papers
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">SSC CGL {tier.name}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{tier.desc}</p>
                                    <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                        Browse Papers <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Year-wise quick access */}
                <section className="py-16 bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse Year-Wise SSC CGL Papers</h2>
                            <p className="text-gray-600">Jump directly to the year you want to practice</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {years.map(year => (
                                <Link
                                    key={year}
                                    to={`/browse?exam=SSC+CGL&year=${year}`}
                                    className="bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700 border-2 border-orange-200 hover:border-orange-600 font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                                >
                                    SSC CGL {year}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Study Volte Works</h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                We are a community-powered platform where SSC aspirants share and access real exam papers — for free, always.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            {[
                                { icon: Upload, step: '01', title: 'Students Upload Papers', desc: 'Aspirants who appeared in SSC CGL share their memory-based questions or paper PDFs on Study Volte immediately after the exam.' },
                                { icon: Shield, step: '02', title: 'We Verify & Publish', desc: 'Our moderation team reviews each paper for authenticity and quality before making it available to the community.' },
                                { icon: Download, step: '03', title: 'You Download for Free', desc: 'Search for the exact SSC CGL previous year question paper you need — by year, tier, or shift — and download the PDF instantly.' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="relative inline-flex mb-6">
                                        <div className="w-20 h-20 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto">
                                            <item.icon className="w-10 h-10" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Latest Papers */}
                {!loading && latestPapers.length > 0 && (
                    <section className="py-16 bg-white border-t border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Latest SSC CGL Papers Added</h2>
                                <p className="text-gray-600">Recently uploaded by the community</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {latestPapers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </div>
                            <div className="mt-10 text-center">
                                <Link to="/browse?exam=SSC+CGL" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
                                    View All SSC CGL Papers <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ */}
                <section className="py-16 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
                            <p className="text-gray-600">Everything you need to know about SSC CGL previous year papers</p>
                        </div>
                        <div className="space-y-5">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                                        <span className="text-orange-600 font-extrabold shrink-0">Q{index + 1}.</span>
                                        {faq.name}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed pl-8">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Also Explore — cross-linking widget */}
                <section className="py-14 bg-white border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers', label: '📄 All Question Papers' },
                                { to: '/exams/ssc', label: '📋 All SSC Papers' },
                                { to: '/exams/cuet', label: '🎯 CUET Question Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Papers' },
                                { to: '/universities/tripura/bbmc-question-papers', label: '📚 BBMC Papers' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center justify-center text-center bg-orange-50 border border-orange-100 hover:border-orange-400 hover:bg-orange-100 text-gray-700 hover:text-orange-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust badges + final CTA */}
                <section className="py-16 bg-gradient-to-r from-red-700 to-orange-700">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            {[
                                { icon: Star, label: '100% Free Papers' },
                                { icon: Shield, label: 'Verified by Moderators' },
                                { icon: CheckCircle, label: 'Real Exam Papers' },
                                { icon: BookOpen, label: 'All Years Covered' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/15 rounded-full px-5 py-2 border border-white/30">
                                    <badge.icon className="w-4 h-4 text-yellow-300" />
                                    <span className="text-white text-sm font-semibold">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                            Appeared in SSC CGL? <br />
                            <span className="text-yellow-300">Share Your Paper, Help Others Crack It.</span>
                        </h2>
                        <p className="text-orange-100 text-lg mb-8">
                            It takes 2 minutes to upload. Your contribution could help thousands of aspirants prepare for next year's SSC CGL exam.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/upload" className="bg-yellow-400 text-red-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2">
                                <Upload className="w-6 h-6" />
                                Upload SSC CGL Paper Now
                            </Link>
                            <Link to="/browse?exam=SSC+CGL" className="bg-white/15 hover:bg-white/25 border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2">
                                <Download className="w-6 h-6" />
                                Browse All CGL Papers
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SSCCGLQuestionPapers;

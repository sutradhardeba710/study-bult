import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, ChevronRight, Star, Upload, Download, FileText } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const SSCQuestionPapers = () => {
    const [latestPapers, setLatestPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, downloads: 0 });

    useEffect(() => {
        loadSSCPapers();
    }, []);

    const loadSSCPapers = async () => {
        try {
            const papersRef = collection(db, 'papers');
            const q = query(
                papersRef,
                where('exam', '==', 'SSC'),
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
            const totalDownloads = allPapers.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
            setStats({ total: allPapers.length, downloads: totalDownloads });

        } catch (error) {
            console.error('Error loading SSC papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const examCategories = [
        { name: 'SSC CGL', link: '/browse?exam=SSC&category=CGL', desc: 'Combined Graduate Level', papers: '100+' },
        { name: 'SSC CHSL', link: '/browse?exam=SSC&category=CHSL', desc: 'Combined Higher Secondary Level', papers: '80+' },
        { name: 'SSC MTS', link: '/browse?exam=SSC&category=MTS', desc: 'Multi-Tasking Staff', papers: '60+' },
        { name: 'SSC GD', link: '/browse?exam=SSC&category=GD', desc: 'General Duty Constable', papers: '50+' },
        { name: 'SSC CPO', link: '/browse?exam=SSC&category=CPO', desc: 'Central Police Organisation', papers: '40+' },
        { name: 'SSC JE', link: '/browse?exam=SSC&category=JE', desc: 'Junior Engineer', papers: '30+' },
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Where can I download SSC previous year question paper for free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Study Volte provides a completely free, student-driven library of SSC previous year question papers for exams like CGL, CHSL, MTS, GD, CPO, and JE. Download instantly in PDF format without any registration fee."
                }
            },
            {
                "@type": "Question",
                "name": "Are these real SSC exam papers?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Every SSC paper on Study Volte is uploaded directly by students and aspirants who have recently appeared in the exam. Our moderation team reviews each paper before it goes live to ensure authenticity."
                }
            },
            {
                "@type": "Question",
                "name": "How do I upload my SSC question paper to Study Volte?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Click the 'Upload & Help Others' button on this page, create a free account, and upload your SSC paper as a PDF or image. You'll be helping thousands of fellow aspirants prepare smarter."
                }
            },
            {
                "@type": "Question",
                "name": "Which SSC exams does Study Volte cover?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Study Volte covers a wide range of SSC exams including SSC CGL, SSC CHSL, SSC MTS, SSC GD Constable, SSC CPO, and SSC JE. We continuously add new papers uploaded by our student community."
                }
            }
        ]
    };

    return (
        <>
            <SEOHead
                title="SSC Previous Year Question Paper | Free PDF Download | Study Volte"
                description="Download SSC previous year question paper for CGL, CHSL, MTS, GD, CPO & JE exams for free. Get authentic PDFs uploaded by real aspirants. Upload your papers and help others on Study Volte."
                keywords="ssc previous year question paper, ssc cgl previous year paper, ssc chsl previous year paper, ssc question paper pdf, ssc mts previous paper, ssc gd question paper, free ssc paper download, study volte ssc"
            />
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-orange-600 via-red-600 to-red-800 text-white py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 rounded-full opacity-10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-300 rounded-full opacity-20 blur-3xl" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                                <span className="text-white">India's Fastest Growing SSC Library</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                SSC
                                <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-white to-orange-200 bg-clip-text text-transparent">
                                    Previous Year Question Paper
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-orange-100 mb-10 max-w-3xl mx-auto">
                                The ultimate free resource for SSC aspirants.
                                <span className="text-yellow-300 font-bold block mt-2">Download real SSC papers or contribute yours to help the community.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Link
                                    to="/browse?exam=SSC"
                                    className="bg-yellow-400 text-red-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-6 h-6" />
                                    Browse SSC Papers
                                </Link>
                                <Link
                                    to="/upload"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-6 h-6" />
                                    Upload & Help Others
                                </Link>
                            </div>

                            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/20">
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">{stats.total > 0 ? `${stats.total}+` : '500+'}</div>
                                    <div className="text-orange-200 font-medium">Papers Uploaded</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">100%</div>
                                    <div className="text-orange-200 font-medium">Free Access</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">6+</div>
                                    <div className="text-orange-200 font-medium">SSC Exam Types</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Study Volte Works for SSC Aspirants</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Preparing for SSC shouldn't cost a fortune. We believe every aspirant deserves free access to authentic previous year papers.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="bg-orange-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-orange-100">
                                <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Students Upload</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Aspirants who appeared in recent SSC exams upload their papers — memory-based questions, official answer keys, or complete paper PDFs — directly to Study Volte.
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-orange-100">
                                <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. We Verify</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Every uploaded SSC previous year question paper is reviewed by our moderation team to ensure authenticity and readability before it's published for download.
                                </p>
                            </div>

                            <div className="bg-orange-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-orange-100">
                                <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                                    <Download className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. You Download Free</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    No subscriptions. No hidden fees. Find the exact SSC exam paper you need and download it as a PDF — instantly and for free.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Browse by SSC Exam */}
                <section className="py-20 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by SSC Exam</h2>
                                <p className="text-xl text-gray-600 max-w-2xl">Find the exact SSC previous year question paper for your target exam.</p>
                            </div>
                            <Link to="/browse?exam=SSC" className="hidden md:inline-flex items-center text-orange-600 font-bold hover:text-orange-800 transition-colors">
                                View All SSC Papers <ChevronRight className="w-5 h-5 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {examCategories.map((exam, index) => (
                                <Link
                                    key={index}
                                    to={exam.link}
                                    className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-500"
                                >
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white text-orange-600 transition-all">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <span className="text-sm font-bold text-orange-700 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
                                            {exam.papers} Papers
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{exam.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{exam.desc}</p>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 text-center md:hidden">
                            <Link to="/browse?exam=SSC" className="inline-flex items-center text-orange-600 font-bold hover:text-orange-800">
                                View All SSC Papers <ChevronRight className="w-5 h-5 ml-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Latest Uploads */}
                {!loading && latestPapers.length > 0 && (
                    <section className="py-20 bg-white border-t border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest SSC Papers Added</h2>
                                <p className="text-xl text-gray-600">Fresh papers recently contributed by the community</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {latestPapers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </div>
                            <div className="mt-12 text-center">
                                <Link
                                    to="/browse?exam=SSC"
                                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
                                >
                                    View All {stats.total > 0 ? stats.total : ''} SSC Papers
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Why Use Study Volte */}
                <section className="py-20 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Thousands of SSC Aspirants Choose Study Volte</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {[
                                { title: 'Completely Free', desc: 'Every SSC previous year question paper is free to download. No premium plans, no paywalls.' },
                                { title: 'Authentic Papers', desc: 'All papers are uploaded by real aspirants and verified by our team before publishing.' },
                                { title: 'All SSC Exams', desc: 'CGL, CHSL, MTS, GD, CPO, JE — we cover every major SSC exam type under one roof.' },
                                { title: 'Help the Community', desc: 'Took an exam recently? Upload your paper and help thousands of other aspirants prepare better.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">✅ {item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-20 bg-white border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-6">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-colors">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                                        <span className="text-orange-600">Q.</span>
                                        {faq.name}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed pl-8">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Exam Papers — cross-linking widget */}
                <section className="py-14 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers', label: '📄 All Question Papers' },
                                { to: '/exams/cuet', label: '🎯 CUET Question Papers' },
                                { to: '/exams/ssc-cgl', label: '📊 SSC CGL Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Papers' },
                                { to: '/universities/tripura/bbmc-question-papers', label: '📚 BBMC Papers' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 bg-gradient-to-r from-orange-700 to-red-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Give Back to the SSC Community
                        </h2>
                        <p className="text-xl text-orange-100 mb-10">
                            Appeared in an SSC exam recently? Your paper can help thousands of aspirants crack their dream government job. It takes just 2 minutes to upload.
                        </p>
                        <Link
                            to="/upload"
                            className="bg-yellow-400 text-red-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                        >
                            <Upload className="w-6 h-6" />
                            Upload An SSC Paper Now
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SSCQuestionPapers;

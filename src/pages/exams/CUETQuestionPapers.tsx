import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, TrendingUp, ChevronRight, Star, Upload } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const CUETQuestionPapers = () => {
    const [latestPapers, setLatestPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, downloads: 0 });

    useEffect(() => {
        loadCUETPapers();
    }, []);

    const loadCUETPapers = async () => {
        try {
            const papersRef = collection(db, 'papers');
            // Query by exam type CUET
            const q = query(
                papersRef,
                where('exam', '==', 'CUET'),
                where('status', '==', 'approved')
            );

            const snapshot = await getDocs(q);
            const allPapers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PaperData[];

            // Sort by createdAt desc client-side
            allPapers.sort((a, b) => {
                const dateA = (a as any).createdAt?.seconds || 0;
                const dateB = (b as any).createdAt?.seconds || 0;
                return dateB - dateA;
            });

            const papers = allPapers.slice(0, 12);
            setLatestPapers(papers);

            const totalDownloads = allPapers.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
            setStats({ total: allPapers.length, downloads: totalDownloads });

        } catch (error) {
            console.error('Error loading CUET papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const domains = [
        { name: 'Language Test', link: '/browse?exam=CUET&category=Language', papers: '50+' },
        { name: 'Domain Subjects', link: '/browse?exam=CUET&category=Domain', papers: '200+' },
        { name: 'General Test', link: '/browse?exam=CUET&category=General', papers: '150+' },
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Where can I download a CUET previous year question paper for free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Study Volte provides a free, crowdsourced library of CUET previous year question papers. You can browse by subject (Domain, Language, General Test) and download them instantly in PDF format."
                }
            },
            {
                "@type": "Question",
                "name": "How do I upload my CUET question paper to help others?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can help fellow aspirants by clicking the 'Upload & Help Others' button on our platform. Simply snap a picture or upload the PDF of your CUET paper, and we will verify and add it to the collection."
                }
            },
            {
                "@type": "Question",
                "name": "Are these real CUET exam papers?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! The papers on Study Volte are uploaded directly by students who have recently taken the CUET exam, ensuring you get the most authentic and up-to-date practice materials."
                }
            }
        ]
    };

    return (
        <>
            <SEOHead
                title="CUET Previous Year Question Paper | Free PDF Download | Study Volte"
                description="Download the latest CUET previous year question paper for Domain, Language, and General Test. Get free PDF downloads and help others by uploading your papers on Study Volte."
                keywords="cuet previous year question paper, cuet paper, cuet question papers, cuet exam paper, cuet domain subject papers, cuet general test previous year paper, free cuet pdf download, study volte cuet"
            />

            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 via-primary-700 to-indigo-900 text-white py-16 md:py-24 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                                <span className="text-white">India's Fastest Growing CUET Library</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                CUET
                                <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-white to-primary-200 bg-clip-text text-transparent">
                                    Previous Year Question Paper
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                                The ultimate crowdsourced platform for CUET aspirants.
                                <span className="text-yellow-300 font-bold block mt-2">Download free PDFs or upload your paper to help the community.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Link
                                    to="/browse?exam=CUET"
                                    className="bg-yellow-400 text-indigo-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-6 h-6" />
                                    Browse CUET Papers
                                </Link>
                                <Link
                                    to="/upload"
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-6 h-6" />
                                    Upload & Help Others
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/20">
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">{stats.total > 0 ? `${stats.total}+` : '100+'}</div>
                                    <div className="text-indigo-200 font-medium">Papers Uploaded</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">100%</div>
                                    <div className="text-indigo-200 font-medium">Free Access</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-white">All</div>
                                    <div className="text-indigo-200 font-medium">Domain Subjects</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How Study Volte Works */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">By the Students, For the Students</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Finding a reliable CUET previous year question paper shouldn't be hard or locked behind paywalls.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="bg-indigo-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-indigo-100">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Students Upload</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Aspirants who just gave the exam click photos of their memory-based questions or official answer keys and upload them directly to Study Volte.
                                </p>
                            </div>

                            <div className="bg-indigo-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-indigo-100">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. We Verify</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our moderation system ensures every uploaded CUET previous year question paper is completely legitimate, readable, and relevant before it goes live.
                                </p>
                            </div>

                            <div className="bg-indigo-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow border border-indigo-100">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                                    <Download className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. You Download Free</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    No hidden fees. No premium memberships. Search for your domain subject and download the exact paper you need instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Target Categories */}
                <section className="py-20 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Browse by CUET Section
                                </h2>
                                <p className="text-xl text-gray-600 max-w-2xl">
                                    Jump straight to the CUET previous year question paper you need the most.
                                </p>
                            </div>
                            <Link to="/browse?exam=CUET" className="hidden md:inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                                View Full Collection <ChevronRight className="w-5 h-5 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {domains.map((domain, index) => (
                                <Link
                                    key={index}
                                    to={domain.link}
                                    className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 transition-all">
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                                            {domain.papers} Papers
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {domain.name}
                                    </h3>
                                    <p className="text-gray-500 font-medium">Click to browse recent uploads</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Latest Uploads */}
                {!loading && latestPapers.length > 0 && (
                    <section className="py-20 bg-white border-t border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Latest Community Uploads
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Fresh papers recently added by students just like you
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {latestPapers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </div>

                            <div className="mt-12 text-center">
                                <Link
                                    to="/browse?exam=CUET"
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
                                >
                                    View All {stats.total} CUET Papers
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                <section className="py-20 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                            <p className="text-gray-600 text-lg">Everything you need to know about preparing with Study Volte</p>
                        </div>

                        <div className="space-y-6">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                                        <span className="text-indigo-600">Q.</span>
                                        {faq.name}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed pl-8">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Exam Papers — cross-linking widget */}
                <section className="py-14 bg-white border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/question-papers', label: '📄 All Question Papers' },
                                { to: '/exams/ssc', label: '📋 SSC Question Papers' },
                                { to: '/exams/ssc-cgl', label: '📊 SSC CGL Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Papers' },
                                { to: '/universities/tripura/bbmc-question-papers', label: '📚 BBMC Papers' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center justify-center text-center bg-gray-50 border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-20 bg-gradient-to-r from-indigo-700 to-indigo-900">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Help Your Fellow Aspirants Succeed
                        </h2>
                        <p className="text-xl text-indigo-100 mb-10">
                            Have you taken the CUET exam? Do you have mock tests or previous year papers? Upload them to Study Volte and directly help thousands of students across India.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/upload"
                                className="bg-yellow-400 text-indigo-900 hover:bg-yellow-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <Upload className="w-6 h-6" />
                                Upload A Paper Now
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default CUETQuestionPapers;

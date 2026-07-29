import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, TrendingUp, Users, Calendar, ChevronRight, Star } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const BBMCQuestionPapers = () => {
    const [latestPapers, setLatestPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, downloads: 0 });

    useEffect(() => {
        loadBBMCPapers();
    }, []);

    const loadBBMCPapers = async () => {
        try {
            const papersRef = collection(db, 'papers');
            // Query only by college and status (no orderBy to avoid index requirement)
            const q = query(
                papersRef,
                where('college', '==', 'Bir Bikram Memorial College'),
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
            console.error('Error loading BBMC papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const semesters = [
        { name: 'Semester 1', link: '/browse?college=BBMC&semester=1', papers: '25+' },
        { name: 'Semester 2', link: '/browse?college=BBMC&semester=2', papers: '30+' },
        { name: 'Semester 3', link: '/browse?college=BBMC&semester=3', papers: '35+' },
        { name: 'Semester 4', link: '/browse?college=BBMC&semester=4', papers: '28+' },
        { name: 'Semester 5', link: '/browse?college=BBMC&semester=5', papers: '32+' },
        { name: 'Semester 6', link: '/browse?college=BBMC&semester=6', papers: '40+' },
    ];

    const semesterGrid = [
        { course: 'BA', label: 'Bachelor of Arts' },
        { course: 'BSc', label: 'Bachelor of Science' },
        { course: 'BCom', label: 'Bachelor of Commerce' },
    ];

    const semesterKeys = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'BBMC Previous Year Question Papers by Course and Semester',
        numberOfItems: semesterGrid.length * semesterKeys.length,
        itemListElement: semesterGrid.flatMap((c, ci) =>
            semesterKeys.map((sem, si) => ({
                '@type': 'ListItem',
                position: ci * semesterKeys.length + si + 1,
                name: `BBMC ${c.course} ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
                url: `https://study-volte.site/bbmc/${c.course.toLowerCase()}/${sem}-question-papers`,
            }))
        ),
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How to download a BBMC paper?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Simply browse our collection of BBMC paper by semester, select the BBMC previous year question paper you need, and click download. All BBMC papers are free and available in PDF format without registration."
                }
            },
            {
                "@type": "Question",
                "name": "Which courses are available for BBMC?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "BBMC offers BA, BSc, and BCom programs affiliated with Tripura University. We have previous year papers for all major subjects across all six semesters."
                }
            },
            {
                "@type": "Question",
                "name": "Are BBMC papers updated regularly?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Students regularly upload new BBMC papers. The latest BBMC paper is added within days of exams, especially during exam seasons."
                }
            }
        ]
    };

    return (
        <>
            <SEOHead
                title="BBMC Previous Year Question Papers 2025 | All Semesters Free PDF | Study Volte"
                description="Download Bir Bikram Memorial College (BBMC) previous year question papers for all semesters. Free PDF downloads for BA, BSc, BCom. All 6 semesters, all subjects covered."
                keywords="bbmc previous year question paper, bbmc, bbmc paper, bbmc question papers, bbmc semester papers, Bir Bikram Memorial College papers, bbmc exam papers PDF, Tripura college question papers"
            />

            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>
            {/* ItemList Schema for semester pages */}
            <script type="application/ld+json">
                {JSON.stringify(itemListSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 text-white py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <Star className="w-4 h-4 text-yellow-300" />
                                <span>Trusted by BBMC Students</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                BBMC
                                <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                    Previous Year Question Paper
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                                Download Bir Bikram Memorial College previous year papers.
                                All semesters, all subjects - completely free!
                            </p>

                            <div className="flex flex-wrap justify-center gap-8 mt-12">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{stats.total}+</div>
                                    <div className="text-purple-200">Papers Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">6</div>
                                    <div className="text-purple-200">Semesters Covered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{(stats.downloads / 1000).toFixed(1)}K+</div>
                                    <div className="text-purple-200">Happy Students</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">Free</div>
                                    <div className="text-purple-200">No Hidden Costs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About BBMC Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Bir Bikram Memorial College (BBMC)</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Bir Bikram Memorial College, located in Agartala, Tripura, is one of the premier undergraduate colleges in the state. Affiliated with Tripura University, BBMC has a rich legacy of providing quality education to students across various disciplines since its establishment.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                The college offers three-year degree programs in Arts, Science, and Commerce streams. With dedicated faculty and modern infrastructure, BBMC focuses on comprehensive student development through academics, co-curricular activities, and skill enhancement programs.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Practicing with a **BBMC paper** is essential for students. These resources provide insights into exam patterns, help identify important topics, and enable highly effective exam preparation. Our platform offers free access to a comprehensive archive of the latest BBMC paper and previous year question papers for all semesters to support your academic success.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Semester Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Browse by Semester
                            </h2>
                            <p className="text-xl text-gray-600">
                                Select your semester to access previous year question papers
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {semesters.map((semester, index) => (
                                <Link
                                    key={index}
                                    to={semester.link}
                                    className="group card hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Calendar className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                            {semester.papers}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                        {semester.name}
                                    </h3>
                                    <div className="flex items-center text-purple-600 font-medium">
                                        View Papers
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-gray-600 mb-4">
                                Looking for a specific subject or year?
                            </p>
                            <Link
                                to="/browse?college=BBMC"
                                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <BookOpen className="w-5 h-5" />
                                Browse All BBMC Papers
                            </Link>
                        </div>
                    </div>
                </section>

                {/* BBMC Semester Navigation Grid */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Browse BBMC Papers by Course &amp; Semester
                            </h2>
                            <p className="text-xl text-gray-600">
                                Select your course and semester to jump directly to the papers you need
                            </p>
                        </div>
                        <div className="space-y-8">
                            {semesterGrid.map(({ course, label }) => (
                                <div key={course} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        BBMC {course} — {label}
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {semesterKeys.map((sem, idx) => (
                                            <Link
                                                key={sem}
                                                to={`/bbmc/${course.toLowerCase()}/${sem}-question-papers`}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 text-gray-700 font-semibold text-sm transition-all"
                                            >
                                                <span className="text-lg font-bold">{idx + 1}</span>
                                                <span className="text-xs text-gray-400">Sem {idx + 1}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Latest Papers */}
                {!loading && latestPapers.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Latest BBMC Paper Uploads
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Recently uploaded by BBMC students
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {latestPapers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Why Use PYQs */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Every BBMC Paper Matters</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card bg-white">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                                    <TrendingUp className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Identify Patterns</h3>
                                <p className="text-gray-600">
                                    Recognize frequently asked questions, important topics, and exam trends across semesters. Focus your preparation on high-weightage areas.
                                </p>
                            </div>

                            <div className="card bg-white">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice Effectively</h3>
                                <p className="text-gray-600">
                                    Solve actual exam questions under timed conditions. Build confidence and improve your time management skills for the real exam.
                                </p>
                            </div>

                            <div className="card bg-white">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                                    <Star className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Score Higher</h3>
                                <p className="text-gray-600">
                                    Students who practice with PYQs consistently score 15-20% higher. Understand exactly what examiners expect in answers.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Study Tips */}
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Exam Preparation Tips for BBMC Students</h2>

                        <div className="space-y-6">
                            <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">📅 Start Early, Study Consistently</h3>
                                <p className="text-gray-600">Begin preparation at least 2 months before exams. Download semester papers and create a study schedule covering all subjects.</p>
                            </div>

                            <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">🎯 Analyze Previous 5 Years</h3>
                                <p className="text-gray-600">Download papers from the last 5 years. Mark recurring questions and topics - these have a high probability of appearing again.</p>
                            </div>

                            <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">⏱️ Practice with Time Limits</h3>
                                <p className="text-gray-600">Solve papers in 3-hour sessions as in actual exams. This improves speed and helps manage time pressure during the real exam.</p>
                            </div>

                            <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">📝 Create Answer Frameworks</h3>
                                <p className="text-gray-600">For frequently asked questions, prepare structured answers with key points. This ensures you don't miss important aspects during exams.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div key={index} className="card bg-white">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Also Explore — related pages cross-linking */}
                <section className="py-12 bg-white border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/browse', label: '📄 All Question Papers' },
                                { to: '/universities/tripura/mbbu-question-papers', label: '🎓 MBBU Papers' },
                                { to: '/question-papers/courses/ba', label: '📖 BA Papers' },
                                { to: '/question-papers/courses/bsc', label: '🔬 BSc Papers' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center justify-center text-center bg-purple-50 border border-purple-100 hover:border-purple-400 hover:bg-purple-100 text-gray-700 hover:text-purple-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Join the BBMC Student Community
                        </h2>
                        <p className="text-xl text-purple-100 mb-8">
                            Upload your papers, help fellow students, and build your academic network.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/upload"
                                className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Upload Your Papers
                            </Link>
                            <Link
                                to="/register"
                                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <Users className="w-5 h-5" />
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default BBMCQuestionPapers;

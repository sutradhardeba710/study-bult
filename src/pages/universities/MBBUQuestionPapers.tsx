import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, TrendingUp, Users, Award, FileText, ChevronRight } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const MBBUQuestionPapers = () => {
    const [latestPapers, setLatestPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, downloads: 0 });

    useEffect(() => {
        loadMBBUPapers();
    }, []);

    const loadMBBUPapers = async () => {
        try {
            // Fetch latest MBBU papers
            const papersRef = collection(db, 'papers');
            // Query only by college and status (no orderBy to avoid index requirement)
            const q = query(
                papersRef,
                where('college', '==', 'Maharaja bir bikram college'),
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

            // Calculate stats
            const totalDownloads = allPapers.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
            setStats({ total: allPapers.length, downloads: totalDownloads });

        } catch (error) {
            console.error('Error loading MBBU papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const courses = [
        // Links point to existing course hub pages that already show MBBU semester grids
        { name: 'BA (Bachelor of Arts)', link: '/question-papers/courses/ba', icon: BookOpen, papers: '150+' },
        { name: 'BSc (Bachelor of Science)', link: '/question-papers/courses/bsc', icon: Award, papers: '200+' },
        { name: 'BCom (Bachelor of Commerce)', link: '/question-papers/courses/bcom', icon: TrendingUp, papers: '100+' },
        { name: 'BCA (Bachelor of Computer Applications)', link: '/question-papers/courses/bca', icon: FileText, papers: '80+' },
    ];

    const semesterGrid = [
        { course: 'BA', label: 'Bachelor of Arts' },
        { course: 'BSc', label: 'Bachelor of Science' },
        { course: 'BCom', label: 'Bachelor of Commerce' },
        { course: 'BCA', label: 'Bachelor of Computer Applications' },
    ];

    const semesters = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'MBBU Previous Year Question Papers by Course and Semester',
        numberOfItems: semesterGrid.length * semesters.length,
        itemListElement: semesterGrid.flatMap((c, ci) =>
            semesters.map((sem, si) => ({
                '@type': 'ListItem',
                position: ci * semesters.length + si + 1,
                name: `MBBU ${c.course} ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
                url: `https://study-volte.site/mbbu/${c.course.toLowerCase()}/${sem}-question-papers`,
            }))
        ),
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How to download MBBU question papers?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Visit our MBBU question papers page, browse by course and semester, and click the download button. All papers are available in PDF format for free."
                }
            },
            {
                "@type": "Question",
                "name": "Where to find an MBB College previous year question paper?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, every MBB College previous year question paper on Study Volte is completely free to download. No registration required for downloading your MBBU paper, though registered users can upload papers."
                }
            },
            {
                "@type": "Question",
                "name": "Which MBBU courses are covered?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We cover all major MBBU courses including BA, BSc, BCom, MA, MSc, and MCom. Papers are available for all semesters across subjects like English, Mathematics, Physics, Chemistry, Commerce, and more."
                }
            },
            {
                "@type": "Question",
                "name": "How often is a new MBBU paper uploaded?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our platform is updated regularly by students. A new MBBU paper is uploaded weekly, especially during exam seasons. You can check the 'Latest Uploads' section for recent additions."
                }
            }
        ]
    };

    return (
        <>
            <SEOHead
                title="MBBU Previous Year Question Papers 2025 | All Semesters Free PDF | Study Volte"
                description="Download Maharaja Bir Bikram University (MBBU) previous year question papers for all semesters. Free PDF downloads for BA, BSc, BCom, BCA, MA and all courses. All 6 semesters covered."
                keywords="mbbu, mbbu paper, mbb college previous year question paper, MBBU question papers, MBBU previous year papers, Maharaja Bir Bikram University papers, MBBU exam papers PDF, Tripura university question papers, MBBU PYQ download"
            />

            {/* FAQ Schema */}
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>
            {/* ItemList Schema for semester pages */}
            <script type="application/ld+json">
                {JSON.stringify(itemListSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                                <span>Tripura's #1 Question Paper Platform</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                MBB College
                                <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                    Previous Year Question Paper
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                                Download every MBBU paper and MBB College previous year question paper for free.
                                All courses, all semesters, all subjects - in PDF format.
                            </p>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap justify-center gap-8 mt-12">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{stats.total}+</div>
                                    <div className="text-primary-200">Papers Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">All</div>
                                    <div className="text-primary-200">Courses Covered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">{(stats.downloads / 1000).toFixed(1)}K+</div>
                                    <div className="text-primary-200">Downloads</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white">100%</div>
                                    <div className="text-primary-200">Free Forever</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About MBBU Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Maharaja Bir Bikram University (MBBU)</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Maharaja Bir Bikram University, located in Agartala, Tripura, is a premier state university offering undergraduate and postgraduate programs across various disciplines. Established to provide quality higher education to students in Tripura and surrounding regions, MBBU has become a cornerstone of academic excellence in the northeastern states.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                The university offers programs in Arts, Science, Commerce, and professional courses. With a focus on holistic development, MBBU prepares students for successful careers through rigorous academic curricula and practical exposure.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Practicing with an **MBB College previous year question paper** is an invaluable resource for MBBU students. These materials help you understand exam patterns, identify frequently asked questions, and practice time management. Our platform provides free access to hundreds of documents, including every **MBBU paper**, to help you excel in your exams.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Courses Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Browse by Course
                            </h2>
                            <p className="text-xl text-gray-600">
                                Select your course to access previous year question papers
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map((course, index) => (
                                <Link
                                    key={index}
                                    to={course.link}
                                    className="group card hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-transparent hover:border-primary-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <course.icon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                            {course.papers}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {course.name}
                                    </h3>
                                    <div className="flex items-center text-primary-600 font-medium">
                                        Browse Papers
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Semester Navigation Grid */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Browse MBBU Papers by Course &amp; Semester
                            </h2>
                            <p className="text-xl text-gray-600">
                                Select your course and semester to jump directly to the papers you need
                            </p>
                        </div>

                        <div className="space-y-8">
                            {semesterGrid.map(({ course, label }) => (
                                <div key={course} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        MBBU {course} — {label}
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {semesters.map((sem, idx) => (
                                            <Link
                                                key={sem}
                                                to={`/mbbu/${course.toLowerCase()}/${sem}-question-papers`}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-semibold text-sm transition-all"
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


                {!loading && latestPapers.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Latest MBBU Paper Uploads
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Recently uploaded MBB College previous year question papers
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {latestPapers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </div>

                            <div className="text-center mt-12">
                                <Link
                                    to="/browse?university=MBBU"
                                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                                >
                                    View All MBBU Papers
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Exam Pattern Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">MBBU Examination Pattern</h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="card">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Semester System</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Two semesters per academic year (Odd & Even)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>6 semesters for 3-year degree programs</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>4 semesters for 2-year postgraduate programs</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Choice Based Credit System (CBCS) followed</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="card">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Marking Scheme</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Theory exams: 70-80 marks (Duration: 3 hours)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Internal assessment: 20-30 marks</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Practical exams for applicable subjects</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>Minimum 40% required to pass individual papers</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Use Previous Year Papers?</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-primary-600 font-bold text-lg mb-2">📊 Understand Pattern</div>
                                    <p className="text-gray-600 text-sm">Identify question types, marking distribution, and exam structure</p>
                                </div>
                                <div>
                                    <div className="text-primary-600 font-bold text-lg mb-2">🎯 Focus Study</div>
                                    <p className="text-gray-600 text-sm">Recognize frequently asked topics and high-weightage areas</p>
                                </div>
                                <div>
                                    <div className="text-primary-600 font-bold text-lg mb-2">⏱️ Time Management</div>
                                    <p className="text-gray-600 text-sm">Practice solving papers within the exam time limit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Download Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Download an MBBU Paper</h2>

                        <div className="space-y-6">
                            {[
                                { step: 1, title: 'Browse by Course', desc: 'Select your course (BA, BSc, BCom, etc.) from the options above' },
                                { step: 2, title: 'Choose Subject & Semester', desc: 'Navigate to your specific subject and semester' },
                                { step: 3, title: 'Click Download', desc: 'Click the download button to get the PDF instantly - no registration required!' },
                                { step: 4, title: 'Upload Your Papers', desc: 'Help fellow students by uploading papers you have (registration required for uploads)' },
                            ].map(({ step, title, desc }) => (
                                <div key={step} className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {step}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
                                        <p className="text-gray-600">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 text-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
                            >
                                <Users className="w-5 h-5" />
                                Join Study Volte Community
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div key={index} className="card">
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
                                { to: '/universities/tripura/bbmc-question-papers', label: '📚 BBMC Papers' },
                                { to: '/question-papers/courses/ba', label: '📖 BA Papers' },
                                { to: '/question-papers/courses/bsc', label: '🔬 BSc Papers' },
                            ].map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center justify-center text-center bg-primary-50 border border-primary-100 hover:border-primary-400 hover:bg-primary-100 text-gray-700 hover:text-primary-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Help Your Fellow MBBU Students!
                        </h2>
                        <p className="text-xl text-primary-100 mb-8">
                            Have question papers that aren't on our platform? Upload them and contribute to the community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/upload"
                                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Upload Papers
                            </Link>
                            <Link
                                to="/browse?university=MBBU"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Browse All Papers
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default MBBUQuestionPapers;

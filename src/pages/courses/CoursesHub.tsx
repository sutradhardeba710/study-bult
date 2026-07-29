import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { BookOpen, ChevronRight, Home } from 'lucide-react';

const SITE = 'https://study-volte.site';

const courses = [
    {
        code: 'BA',
        name: 'Bachelor of Arts',
        path: '/question-papers/courses/ba',
        desc: 'Download BA previous year question papers for History, Political Science, English, Economics, Sociology and all subjects.',
        subjects: ['History', 'Political Science', 'English', 'Economics', 'Sociology', 'Philosophy'],
        color: 'blue',
    },
    {
        code: 'BSc',
        name: 'Bachelor of Science',
        path: '/question-papers/courses/bsc',
        desc: 'BSc previous year question papers for Physics, Chemistry, Mathematics, Botany, Zoology and more.',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology', 'Computer Science'],
        color: 'green',
    },
    {
        code: 'BCom',
        name: 'Bachelor of Commerce',
        path: '/question-papers/courses/bcom',
        desc: 'BCom question papers for Accountancy, Business Studies, Economics, Financial Management and all commerce subjects.',
        subjects: ['Accountancy', 'Business Studies', 'Economics', 'Financial Management', 'Taxation'],
        color: 'amber',
    },
    {
        code: 'BCA',
        name: 'Bachelor of Computer Applications',
        path: '/question-papers/courses/bca',
        desc: 'BCA question papers for Programming, Data Structures, Database Management, Networking and more.',
        subjects: ['Programming (C/C++/Java)', 'Data Structures', 'DBMS', 'Networking', 'Web Technology'],
        color: 'purple',
    },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'Course-Based Papers', item: `${SITE}/question-papers/courses` },
    ],
};

export default function CoursesHub() {
    return (
        <>
            <SEOHead
                title="Course-Based Question Papers | BA, BSc, BCom, BCA | Free PDF | Study Volte"
                description="Download previous year question papers sorted by course — BA, BSc, BCom, BCA. Find papers from MBBU, BBMC and other colleges for all semesters. Free PDF download."
                keywords="BA question papers, BSc question papers, BCom question papers, BCA question papers, course wise question papers, semester papers by course, undergraduate question papers PDF"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers" className="hover:text-primary-600 transition-colors">Question Papers</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">By Course</li>
                        </ol>
                    </div>
                </nav>

                {/* Hero */}
                <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <BookOpen className="w-4 h-4 text-yellow-300" />
                            <span>Browse by Your Course</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Question Papers
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Sorted by Course
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
                            Select your undergraduate degree to find all previous year papers across every college and semester.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Course Cards */}
                    <section className="mb-12">
                        <div className="grid md:grid-cols-2 gap-6">
                            {courses.map(course => (
                                <Link
                                    key={course.code}
                                    to={course.path}
                                    className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-lg p-8 transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl font-extrabold text-teal-700">{course.code[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">{course.code}</h2>
                                            <p className="text-sm text-gray-500 mb-3">{course.name}</p>
                                            <p className="text-gray-600 text-sm mb-4">{course.desc}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {course.subjects.slice(0, 4).map(s => (
                                                    <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{s}</span>
                                                ))}
                                                {course.subjects.length > 4 && (
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{course.subjects.length - 4} more</span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-teal-600 font-semibold text-sm">
                                                Browse {course.code} Papers <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Info */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How Course-based Filtering Helps</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            When you're preparing for your semester exams, you often need papers from your specific course — not from a different stream. Our course-based organization lets you find all BA, BSc, BCom or BCA papers from every available college in one place.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Each course page lists all colleges that offer that program, organized by semester, so you can compare question trends across different universities. This is particularly useful for students who want to see how MBBU and BBMC structure their exams for the same subject.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/browse', label: '📄 All Question Papers' },
                                { to: '/question-papers/universities/tripura', label: '🏛️ Tripura Universities' },
                                { to: '/guides/how-to-use-previous-year-papers', label: '📖 Study Guide' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-700 hover:text-teal-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

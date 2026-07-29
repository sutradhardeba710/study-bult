import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { ChevronRight, Home, BookOpen } from 'lucide-react';

const SITE = 'https://study-volte.site';

// Map known colleges to their hub page paths
const COLLEGE_HUB: Record<string, { label: string; path: string }> = {
    mbbu: { label: 'MBBU Question Papers', path: '/universities/tripura/mbbu-question-papers' },
    bbmc: { label: 'BBMC Question Papers', path: '/universities/tripura/bbmc-question-papers' },
};

const SEMESTERS = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];

export default function CollegeCourseSemester() {
    const { college, course, semester } = useParams();

    const collegeKey = college?.toLowerCase() ?? '';
    const courseKey = course?.toLowerCase() ?? '';
    const semesterKey = semester ?? '';

    // Formatting values for display
    const formattedCollege = collegeKey.toUpperCase();
    const formattedCourse = courseKey.toUpperCase();
    const formattedSemester = semesterKey.replace(/-/g, ' ').toUpperCase();

    const hub = COLLEGE_HUB[collegeKey];

    const title = `${formattedCollege} ${formattedCourse} ${formattedSemester} Question Papers | Free PDF | Study Volte`;
    const description = `Download ${formattedCollege} ${formattedCourse} ${formattedSemester} previous year question papers PDF for free. All subjects covered. Prepare better for your ${formattedCollege} ${formattedSemester} exams with Study Volte.`;

    const canonicalUrl = `${SITE}/${collegeKey}/${courseKey}/${semesterKey}-question-papers`;

    // JSON-LD: BreadcrumbList
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            hub && { '@type': 'ListItem', position: 2, name: hub.label, item: `${SITE}${hub.path}` },
            { '@type': 'ListItem', position: hub ? 3 : 2, name: `${formattedCourse} Papers`, item: `${SITE}/${collegeKey}/${courseKey}` },
            { '@type': 'ListItem', position: hub ? 4 : 3, name: formattedSemester, item: canonicalUrl },
        ].filter(Boolean),
    };

    // JSON-LD: ItemList of sibling semesters (helps Google discover and understand semester structure)
    const semesterItemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${formattedCollege} ${formattedCourse} Question Papers by Semester`,
        numberOfItems: SEMESTERS.length,
        itemListElement: SEMESTERS.map((sem, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${formattedCollege} ${formattedCourse} ${sem.replace(/-/g, ' ').toUpperCase()} Question Papers`,
            url: `${SITE}/${collegeKey}/${courseKey}/${sem}-question-papers`,
        })),
    };

    return (
        <>
            <SEOHead title={title} description={description} />

            {/* BreadcrumbList JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
            {/* Semester ItemList JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(semesterItemListSchema)}
            </script>

            <div className="min-h-screen bg-gray-50">
                {/* ── BREADCRUMB NAVIGATION ── */}
                <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li>
                                <Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                    <Home className="w-3.5 h-3.5" />
                                    Home
                                </Link>
                            </li>
                            {hub && (
                                <>
                                    <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                                    <li>
                                        <Link to={hub.path} className="hover:text-primary-600 transition-colors">
                                            {hub.label}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="text-gray-400">{formattedCourse} Papers</li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">{formattedSemester}</li>
                        </ol>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 text-white py-12 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <BookOpen className="w-4 h-4 text-yellow-300" />
                            <span>Free PDF Download</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            {formattedCollege} {formattedCourse}{' '}
                            <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent block mt-2">
                                {formattedSemester} Question Papers
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
                            Download all {formattedCollege} {formattedCourse} {formattedSemester} previous year question papers for free.
                            All subjects covered — instant PDF download.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to={`/browse?college=${formattedCollege}&course=${formattedCourse}`}
                                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg"
                            >
                                <BookOpen className="w-5 h-5" />
                                Browse All Papers
                            </Link>
                            {hub && (
                                <Link
                                    to={hub.path}
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-all"
                                >
                                    ← Back to {formattedCollege} Hub
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── MAIN CONTENT ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* About section */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            About {formattedCollege} {formattedCourse} {formattedSemester}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The {formattedCourse} program at {formattedCollege} is designed to provide students with comprehensive knowledge and practical skills. Accessing {formattedCollege} {formattedCourse} {formattedSemester} previous year question papers is one of the most effective ways to prepare for your upcoming semester exams.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            By practicing with real past papers, you can identify the most frequently asked questions, understand the marking scheme, and develop effective time management strategies. All question papers on Study Volte are uploaded by students who appeared in the actual exams, ensuring authenticity.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Exam Pattern & Preparation Tips</h3>
                        <ul className="list-none space-y-3 text-gray-600 mb-6">
                            {[
                                'Review the syllabus thoroughly before diving into past papers.',
                                'Practice time management by solving these papers within the actual exam duration (usually 3 hours).',
                                `Identify recurring topics and high-weightage sections from ${formattedSemester} papers across multiple years.`,
                                'Discuss difficult questions with your peers or professors.',
                                'Focus on units with the highest mark allocation first.',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* ── SEMESTER SIBLINGS GRID ── */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            All {formattedCollege} {formattedCourse} Semesters
                        </h2>
                        <p className="text-gray-500 mb-6">Navigate to a different semester for the same course.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {SEMESTERS.map((sem, idx) => {
                                const isActive = sem === semesterKey;
                                return (
                                    <Link
                                        key={sem}
                                        to={`/${collegeKey}/${courseKey}/${sem}-question-papers`}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 font-semibold text-sm transition-all ${isActive
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700'
                                            }`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <span className="text-lg font-bold">{idx + 1}</span>
                                        <span className="text-xs mt-0.5">Sem {idx + 1}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── ALSO EXPLORE ── */}
                    {hub && (
                        <section className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {[
                                    { to: hub.path, label: `📚 All ${formattedCollege} Papers` },
                                    { to: '/browse', label: '📄 All Question Papers' },
                                    { to: '/guides/how-to-use-previous-year-papers', label: '📖 Study Guide' },
                                ].map(item => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-sm font-medium px-3 py-3 rounded-xl transition-all"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

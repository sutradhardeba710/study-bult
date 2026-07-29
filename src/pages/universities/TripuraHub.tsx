import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { ChevronRight, GraduationCap, Home, MapPin } from 'lucide-react';

const SITE = 'https://study-volte.site';

const colleges = [
    {
        name: 'Maharaja Bir Bikram University (MBBU)',
        shortName: 'MBBU',
        slug: 'mbbu-question-papers',
        path: '/universities/tripura/mbbu-question-papers',
        desc: 'Tripura\'s premier state university. BA, BSc, BCom, BCA, MA and more. All 6 semesters covered.',
        courses: ['BA', 'BSc', 'BCom', 'BCA', 'MA'],
        color: 'primary',
    },
    {
        name: 'Bir Bikram Memorial College (BBMC)',
        shortName: 'BBMC',
        slug: 'bbmc-question-papers',
        path: '/universities/tripura/bbmc-question-papers',
        desc: 'One of Tripura\'s leading undergraduate colleges. BA, BSc, BCom across all semesters.',
        courses: ['BA', 'BSc', 'BCom'],
        color: 'purple',
    },
];

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
        { '@type': 'ListItem', position: 3, name: 'Tripura Universities', item: `${SITE}/question-papers/universities/tripura` },
    ],
};

const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tripura University Question Papers',
    numberOfItems: colleges.length,
    itemListElement: colleges.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${c.name} Previous Year Question Papers`,
        url: `${SITE}${c.path}`,
    })),
};

export default function TripuraHub() {
    return (
        <>
            <SEOHead
                title="Tripura University Question Papers | MBBU & BBMC Free PDF | Study Volte"
                description="Download previous year question papers from Tripura's top colleges — MBBU and BBMC. Free PDF for all courses (BA, BSc, BCom, BCA) and all semesters. Maharaja Bir Bikram University and Bir Bikram Memorial College papers."
                keywords="tripura university question papers, MBBU question papers, BBMC question papers, tripura college papers, MBB university papers, Bir Bikram Memorial College, Tripura exam papers PDF, semester question papers Tripura"
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>

            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <nav className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                            <li><Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors"><Home className="w-3.5 h-3.5" />Home</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li><Link to="/question-papers" className="hover:text-primary-600 transition-colors">Question Papers</Link></li>
                            <li><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
                            <li className="font-semibold text-gray-800">Tripura Universities</li>
                        </ol>
                    </div>
                </nav>

                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 text-white py-14 md:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                            <MapPin className="w-4 h-4 text-yellow-300" />
                            <span>Tripura, India</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Tripura University
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Previous Year Question Papers
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
                            Download free previous year question papers from Tripura's top colleges.
                            All courses, all semesters — instant PDF download.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* College Cards */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by College</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {colleges.map(college => (
                                <Link
                                    key={college.slug}
                                    to={college.path}
                                    className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-lg p-8 transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <GraduationCap className="w-7 h-7 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                                {college.shortName}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3">{college.name}</p>
                                            <p className="text-gray-600 text-sm mb-4">{college.desc}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {college.courses.map(c => (
                                                    <span key={c} className="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full border border-primary-100">{c}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center text-primary-600 font-semibold text-sm">
                                                View All Papers <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Tripura's Universities</h2>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Tripura is home to several prestigious colleges and universities affiliated with Tripura University. The state's higher education system follows the semester-based CBCS (Choice Based Credit System) pattern, making previous year question papers an invaluable resource for students preparing for their semester examinations.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Maharaja Bir Bikram University (MBBU) is the state university offering both undergraduate and postgraduate programs in diverse disciplines including Arts, Science, and Commerce. Bir Bikram Memorial College (BBMC), located in Agartala, is among the state's premier undergraduate colleges affiliated with Tripura University.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Students appearing in these examinations often find that 40–60% of questions in any given semester paper are repeated from previous years. Practicing with authentic previous year papers helps you:
                            </p>
                            <ul className="list-none space-y-2 mb-4">
                                {[
                                    'Identify the most frequently asked question types',
                                    'Understand the marking scheme and answer length expected',
                                    'Practice time management under real exam conditions',
                                    'Spot recurring topics across multiple years',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600">
                                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-600 leading-relaxed">
                                All question papers on Study Volte are uploaded by verified students who appeared in actual exams. Papers are free and available in PDF format — no registration required to download.
                            </p>
                        </div>
                    </section>

                    {/* Future Expansion Note */}
                    <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">🚀 Coming Soon — More Tripura Colleges</h2>
                        <p className="text-gray-600 text-sm">
                            We're expanding our Tripura library. Papers from additional affiliated colleges will be added soon.
                            <Link to="/upload" className="text-primary-600 font-semibold hover:underline ml-1">Upload papers from your college →</Link>
                        </p>
                    </section>

                    {/* Also Explore */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Also Explore</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { to: '/browse', label: '📄 All Question Papers' },
                                { to: '/question-papers/courses/ba', label: '📚 BA Question Papers' },
                                { to: '/question-papers/courses/bsc', label: '🔬 BSc Question Papers' },
                                { to: '/guides/how-to-use-previous-year-papers', label: '📖 Study Guide' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} className="flex items-center justify-center text-center bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-sm font-medium px-3 py-3 rounded-xl transition-all">
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

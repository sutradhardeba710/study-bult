import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { FileText, GraduationCap, BookOpen, HelpCircle, Shield, Home } from 'lucide-react';

interface SitemapGroup {
    title: string;
    icon: React.ElementType;
    color: string;
    links: { label: string; to: string; desc?: string }[];
}

const groups: SitemapGroup[] = [
    {
        title: 'Study Resources',
        icon: BookOpen,
        color: 'indigo',
        links: [
            { label: 'Previous Year Question Papers', to: '/question-papers', desc: 'Central question paper library and search' },
            { label: 'Browse Papers', to: '/browse', desc: 'Filter by course, semester, or college' },
            { label: 'Upload a Paper', to: '/upload', desc: 'Contribute to the student community' },
        ],
    },
    {
        title: 'University & College Papers',
        icon: GraduationCap,
        color: 'blue',
        links: [
            { label: 'Tripura University Hub', to: '/universities/tripura', desc: 'Overview of all colleges and universities in Tripura' },
            { label: 'MBBU Question Papers', to: '/universities/tripura/mbbu-question-papers', desc: 'Maharaja Bir Bikram University — all courses & semesters' },
            { label: 'BBMC Question Papers', to: '/universities/tripura/bbmc-question-papers', desc: 'Bir Bikram Memorial College — all semesters' },
        ],
    },
    {
        title: 'Course Hubs',
        icon: BookOpen,
        color: 'teal',
        links: [
            { label: 'All Courses Hub', to: '/courses', desc: 'Find papers by degree' },
            { label: 'BA Question Papers', to: '/courses/ba', desc: 'Bachelor of Arts — all 6 semesters' },
            { label: 'BSc Question Papers', to: '/courses/bsc', desc: 'Bachelor of Science — all 6 semesters' },
            { label: 'BCom Question Papers', to: '/courses/bcom', desc: 'Bachelor of Commerce — all 6 semesters' },
            { label: 'BCA Question Papers', to: '/courses/bca', desc: 'Computer Applications — all 6 semesters' },
        ],
    },
    {
        title: 'Competitive Exams',
        icon: GraduationCap,
        color: 'orange',
        links: [
            { label: 'National Exams Hub', to: '/exams', desc: 'CUET, SSC and national entrance exams' },
            { label: 'CUET Question Papers', to: '/exams/cuet', desc: 'CUET UG previous year papers' },
            { label: 'CUET 2025 Papers', to: '/exams/cuet/2025', desc: 'CUET UG 2025 papers and syllabus' },
            { label: 'CUET 2024 Papers', to: '/exams/cuet/2024', desc: 'CUET UG 2024 papers and answer keys' },
            { label: 'SSC Question Papers', to: '/exams/ssc', desc: 'All SSC exams previous year papers' },
            { label: 'SSC CGL Papers', to: '/exams/ssc-cgl', desc: 'SSC Combined Graduate Level Tier 1 & 2' },
            { label: 'SSC CHSL Papers', to: '/exams/ssc-chsl', desc: 'SSC CHSL 10+2 previous year papers' },
            { label: 'SSC GD Papers', to: '/exams/ssc-gd', desc: 'SSC GD Constable previous year papers' },
        ],
    },
    {
        title: 'Exam Preparation Guides',
        icon: FileText,
        color: 'emerald',
        links: [
            { label: 'Exam Guides Index', to: '/guides', desc: 'All student preparation articles and strategies' },
            { label: 'How to Use PYQs Effectively', to: '/guides/how-to-use-previous-year-papers', desc: 'Step-by-step strategy for studying with past papers' },
            { label: 'Are Questions Repeated in Exams?', to: '/guides/are-questions-repeated-in-exams', desc: 'Data and patterns on exam repetition' },
            { label: 'Exam Preparation Strategy', to: '/guides/exam-preparation-strategy', desc: '30-day revision and score improvement plan' },
        ],
    },
    {
        title: 'Account & Community',
        icon: Home,
        color: 'indigo',
        links: [
            { label: 'Home', to: '/' },
            { label: 'Browse Library', to: '/browse' },
            { label: 'Contribute Paper', to: '/upload' },
        ],
    },
    {
        title: 'Help & Support',
        icon: HelpCircle,
        color: 'emerald',
        links: [
            { label: 'Help Center', to: '/help-center' },
            { label: 'Contact Us', to: '/contact' },
            { label: 'About Us', to: '/about' },
        ],
    },
    {
        title: 'Legal',
        icon: Shield,
        color: 'gray',
        links: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Cookie Policy', to: '/cookie-policy' },
        ],
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'bg-indigo-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'bg-orange-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'bg-teal-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-600' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'bg-gray-600' },
};

const HTMLSitemap = () => {
    return (
        <>
            <Head>
                <title>Sitemap | Study Volte — Browse All Pages</title>
                <meta name="description" content="Complete sitemap of Study Volte. Find all pages including question paper libraries for MBBU, BBMC, CUET, SSC, and more." />
                <link rel="canonical" href="https://study-volte.site/sitemap" />
            </Head>

            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                            <FileText className="w-4 h-4" /> Complete Site Directory
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Study Volte Sitemap</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            A complete directory of all pages on Study Volte. Use this to quickly navigate to any section of our free question paper library.
                        </p>
                    </div>

                    {/* Groups */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map(group => {
                            const c = colorMap[group.color];
                            return (
                                <div key={group.title} className={`rounded-2xl border ${c.border} ${c.bg} p-6`}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={`w-10 h-10 ${c.icon} text-white rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <group.icon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">{group.title}</h2>
                                    </div>
                                    <ul className="space-y-3">
                                        {group.links.map(link => (
                                            <li key={link.to}>
                                                <Link
                                                    to={link.to}
                                                    className={`block group ${c.text} hover:underline underline-offset-2 font-semibold text-sm`}
                                                >
                                                    {link.label}
                                                </Link>
                                                {link.desc && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>

                    {/* Back to homepage */}
                    <div className="mt-14 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors shadow-lg"
                        >
                            <Home className="w-5 h-5" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HTMLSitemap;

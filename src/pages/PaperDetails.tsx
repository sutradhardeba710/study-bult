import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, BookOpen, GraduationCap, Calendar, Clock, CheckCircle, ChevronRight, Home, ArrowLeft, Eye, MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { getPaperById } from '../services/papers';
import type { PaperData } from '../services/upload';

const SITE = 'https://study-volte.site';

export default function PaperDetails() {
    const { id } = useParams<{ id: string }>();
    const [paper, setPaper] = useState<PaperData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;
        setLoading(true);
        getPaperById(id)
            .then((data) => {
                if (!isMounted) return;
                if (data) {
                    setPaper(data);
                } else {
                    setError('Paper not found');
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                setError('Failed to load paper details');
                console.error(err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleShareWhatsApp = () => {
        if (!paper) return;
        const text = `Download ${paper.title} (${paper.college} ${paper.semester}) previous year question paper PDF on Study Volte: ${window.location.href}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDownload = () => {
        if (paper?.fileUrl) {
            window.open(paper.fileUrl, '_blank', 'noopener,noreferrer');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                    <p className="text-sm font-semibold">Loading paper details...</p>
                </div>
            </div>
        );
    }

    if (error || !paper) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 max-w-md w-full">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Paper Not Found</h1>
                    <p className="text-slate-600 mb-6">The requested question paper might have been removed or the link is incorrect.</p>
                    <Link to="/browse" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold">
                        <ArrowLeft className="h-4 w-4" /> Browse Library
                    </Link>
                </div>
            </div>
        );
    }

    const collegeKey = paper.college?.toLowerCase() || '';
    const courseKey = paper.course?.toLowerCase() || '';
    const semesterKey = paper.semester?.toLowerCase().replace(/\s+/g, '-') || '';

    const semesterUrl = collegeKey && courseKey && semesterKey 
        ? `/${collegeKey}/${courseKey}/${semesterKey}-question-papers` 
        : `/browse?college=${encodeURIComponent(paper.college)}&course=${encodeURIComponent(paper.course)}`;

    const fullTitle = `${paper.title} — ${paper.college} ${paper.course} ${paper.semester} Question Paper PDF Download | Study Volte`;
    const fullDesc = `Download free PDF of ${paper.title} (${paper.subject || ''}) for ${paper.college}, ${paper.course} ${paper.semester}. Authentic previous year question paper with instant PDF download on Study Volte.`;
    const dynamicKeywords = `${paper.title}, ${paper.subject || ''} question paper, ${paper.college} previous year question paper pdf download, ${paper.college} ${paper.course} ${paper.semester} paper, ${paper.college} pyq, ${paper.course} semester question paper, study volte`;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Question Papers', item: `${SITE}/question-papers` },
            { '@type': 'ListItem', position: 3, name: `${paper.college} ${paper.semester}`, item: `${SITE}${semesterUrl}` },
            { '@type': 'ListItem', position: 4, name: paper.title, item: `${SITE}/paper/${id}` },
        ],
    };

    const documentSchema = {
        '@context': 'https://schema.org',
        '@type': 'DigitalDocument',
        name: paper.title,
        description: fullDesc,
        encodingFormat: 'application/pdf',
        url: paper.fileUrl,
        educationalLevel: paper.course,
        about: {
            '@type': 'Course',
            name: paper.subject || paper.title,
            provider: paper.college,
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `How can I download ${paper.title} question paper in PDF?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `You can preview and download ${paper.title} for ${paper.college} ${paper.semester} completely free by clicking the 'Download PDF' button on Study Volte.`,
                },
            },
            {
                '@type': 'Question',
                name: `Is this ${paper.title} paper genuine and from ${paper.college}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes, all papers on Study Volte are submitted by students who appeared in the actual examinations and verified by our academic team.`,
                },
            },
        ],
    };

    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(paper.fileUrl)}&embedded=true`;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
            <SEOHead
                title={fullTitle}
                description={fullDesc}
                keywords={dynamicKeywords}
            />
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(documentSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            {/* Breadcrumb Bar */}
            <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 flex-wrap">
                        <li>
                            <Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                <Home className="w-3.5 h-3.5" /> Home
                            </Link>
                        </li>
                        <li><ChevronRight className="w-3.5 h-3.5 text-slate-300" /></li>
                        <li>
                            <Link to="/question-papers" className="hover:text-primary-600 transition-colors">
                                Question Papers
                            </Link>
                        </li>
                        <li><ChevronRight className="w-3.5 h-3.5 text-slate-300" /></li>
                        <li>
                            <Link to={semesterUrl} className="hover:text-primary-600 transition-colors">
                                {paper.college} {paper.course} {paper.semester}
                            </Link>
                        </li>
                        <li><ChevronRight className="w-3.5 h-3.5 text-slate-300" /></li>
                        <li className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{paper.title}</li>
                    </ol>
                </div>
            </nav>

            {/* Header / Hero */}
            <header className="bg-slate-900 text-white py-6 sm:py-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Verified Paper
                        </span>
                        <span className="rounded-full bg-primary-500/10 border border-primary-500/30 px-2 py-0.5 text-[11px] font-bold text-primary-300">
                            {paper.college}
                        </span>
                        <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {paper.course} · {paper.semester}
                        </span>
                        {paper.year && (
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                                Year {paper.year}
                            </span>
                        )}
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                        {paper.title}
                    </h1>

                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Official {paper.subject ? `${paper.subject} ` : ''}examination question paper from {paper.college}. Free PDF download for semester exam preparation.
                    </p>

                    {/* Action Bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                        >
                            <Download className="h-4 w-4" /> Download PDF
                        </button>
                        <button
                            onClick={handleShareWhatsApp}
                            className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                            <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
                    {/* Left Column: PDF Viewer */}
                    <section aria-label="PDF Document Viewer" className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden p-3.5 sm:p-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-primary-600" />
                                Document Preview
                            </h2>
                            <a
                                href={paper.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                            >
                                Direct PDF link ↗
                            </a>
                        </div>

                        <div className="w-full h-[520px] sm:h-[580px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <iframe
                                src={googleDocsViewerUrl}
                                title={paper.title}
                                className="w-full h-full border-0"
                                loading="lazy"
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Having trouble viewing? Use Direct PDF link or click Download.</span>
                            <button
                                onClick={handleDownload}
                                className="text-primary-600 font-bold hover:underline"
                            >
                                Download file
                            </button>
                        </div>
                    </section>

                    {/* Right Column: Paper Metadata & Silo Links */}
                    <aside className="space-y-4">
                        {/* Paper Details Card */}
                        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 pb-2 border-b border-slate-100">
                                Paper Details
                            </h3>
                            <dl className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Institution</dt>
                                    <dd className="font-semibold text-slate-800 text-right">{paper.college}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Course</dt>
                                    <dd className="font-semibold text-slate-800">{paper.course}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Semester</dt>
                                    <dd className="font-semibold text-slate-800">{paper.semester}</dd>
                                </div>
                                {paper.subject && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Subject</dt>
                                        <dd className="font-semibold text-slate-800 text-right">{paper.subject}</dd>
                                    </div>
                                )}
                                {paper.examType && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Exam Type</dt>
                                        <dd className="font-semibold text-slate-800">{paper.examType}</dd>
                                    </div>
                                )}
                                {paper.year && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Examination Year</dt>
                                        <dd className="font-semibold text-slate-800">{paper.year}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* More Papers from this Semester */}
                        <div className="bg-gradient-to-br from-primary-50 to-indigo-50/50 rounded-xl border border-primary-100 p-4 shadow-2xs">
                            <h3 className="text-xs sm:text-sm font-bold text-primary-900 mb-1.5">
                                More {paper.college} Papers
                            </h3>
                            <p className="text-[11px] text-primary-700 mb-3">
                                Browse all subjects and semesters for {paper.course} at {paper.college}.
                            </p>
                            <Link
                                to={semesterUrl}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors shadow-2xs"
                            >
                                Browse {paper.semester} Papers
                            </Link>
                        </div>

                        {/* Contributor Callout */}
                        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs text-center">
                            <GraduationCap className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Have more exam papers?</h4>
                            <p className="text-xs text-slate-500 mb-4">
                                Help other students and earn contributor badges on Study Volte.
                            </p>
                            <Link
                                to="/upload"
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Upload Question Paper
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

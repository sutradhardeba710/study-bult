import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Heart, GraduationCap, BookOpen, Calendar, Sparkles, Eye, User, Share2, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';
import PDFThumbnail from './PDFThumbnail';
import type { PaperData } from '../services/upload';

// ── Level config (mirrors Rewards.tsx — single source of truth ideally) ─────────
const LEVELS = [
    { minXP: 0, icon: '🌱', label: 'Newcomer', color: 'bg-slate-100 text-slate-600' },
    { minXP: 100, icon: '📘', label: 'Contributor', color: 'bg-emerald-100 text-emerald-700' },
    { minXP: 300, icon: '🎓', label: 'Scholar', color: 'bg-blue-100 text-blue-700' },
    { minXP: 600, icon: '⚡', label: 'Expert', color: 'bg-violet-100 text-violet-700' },
    { minXP: 1100, icon: '👑', label: 'Knowledge Lord', color: 'bg-amber-100 text-amber-700' },
    { minXP: 2500, icon: '🏆', label: 'Legend', color: 'bg-rose-100 text-rose-700' },
];
function getLevelBadge(xp: number) {
    return LEVELS.filter(l => xp >= l.minXP).at(-1) ?? LEVELS[0];
}

interface PaperCardProps {
    paper: PaperData;
    index?: number;
}

const PaperCard = ({ paper, index = 0 }: PaperCardProps) => {
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    // Create URL for browse page with filters
    const browseUrl = `/browse?college=${encodeURIComponent(paper.college)}&semester=${encodeURIComponent(paper.semester)}`;

    // Determine if paper is popular (high downloads or likes)
    const isPopular = (paper.downloadCount || 0) > 50 || (paper.likeCount || 0) > 20;

    // Color schemes for variety
    const colorSchemes = [
        'from-blue-500/10 to-cyan-500/10 border-blue-200',
        'from-purple-500/10 to-pink-500/10 border-purple-200',
        'from-green-500/10 to-emerald-500/10 border-green-200',
        'from-orange-500/10 to-red-500/10 border-orange-200',
    ];

    const colorScheme = colorSchemes[index % colorSchemes.length];

    // Format counts for display - show "New" if no activity
    const downloadCount = paper.downloadCount || 0;
    const likeCount = paper.likeCount || 0;
    const hasActivity = downloadCount > 0 || likeCount > 0;

    // Handle clicks outside the dropdown to close it
    // Using a simple blur or generic mouse click could work, but since it's an inline card,
    // let's rely on native propagation or the user just clicking away...
    const handleMouseLeave = () => {
        if (isShareMenuOpen) setIsShareMenuOpen(false);
    };

    return (
        <Link
            to={browseUrl}
            className="group relative block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2 hover:scale-[1.02]"
            style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards'
            }}
            onMouseLeave={handleMouseLeave}
        >
            {/* Popular or New Badge */}
            {isPopular ? (
                <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Popular
                </div>
            ) : !hasActivity ? (
                <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    New
                </div>
            ) : null}

            {/* Thumbnail Section with Gradient Overlay */}
            <div className={`relative bg-gradient-to-br ${colorScheme} flex items-center justify-center p-6 h-56 overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                {/* Thumbnail */}
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                    <PDFThumbnail
                        fileUrl={paper.fileUrl}
                        title={paper.title}
                        thumbnailUrl={paper.thumbnailUrl}
                        width={140}
                        height={190}
                        className="shadow-2xl ring-2 ring-white/50"
                    />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content Section */}
            <div className="p-5 relative">
                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-primary-600 transition-colors duration-300">
                    {paper.title}
                </h3>

                {/* Metadata Grid */}
                <div className="space-y-2 mb-4">
                    {/* College */}
                    <div className="flex items-start gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="text-gray-500 text-xs">College:</span>
                            <p className="text-gray-900 font-medium line-clamp-1">{paper.college}</p>
                        </div>
                    </div>

                    {/* Semester & Subject Row */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Semester</p>
                                <p className="text-gray-900 font-semibold">{paper.semester}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm">
                            <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Subject</p>
                                <p className="text-gray-900 font-semibold truncate">{paper.subject}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row with Improved Design */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        {/* Downloads */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-2 rounded-full shadow-sm">
                            <Download className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-700">{downloadCount}</span>
                        </div>

                        {/* Likes */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-2 rounded-full shadow-sm">
                            <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
                            <span className="text-sm font-bold text-pink-700">{likeCount}</span>
                        </div>
                    </div>

                    {/* Actions Container */}
                    <div className="flex items-center gap-1.5 relative z-20">
                        {/* Share Button Wrapper */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsShareMenuOpen(!isShareMenuOpen);
                                }}
                                className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Share"
                                type="button"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>

                            {/* Share Dropdown */}
                            {isShareMenuOpen && (
                                <div
                                    className="absolute right-0 bottom-full mb-2 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 animate-fade-in"
                                    onClick={(e) => {
                                        // Prevents clicking the dropdown from bubbling to the outer <Link>
                                        e.stopPropagation();
                                    }}
                                >
                                    <div style={{ position: 'absolute', bottom: '-6px', right: '10px', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #e5e7eb' }} />
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 w-full text-left"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigator.clipboard.writeText(window.location.origin + '/browse?q=' + encodeURIComponent(paper.title));
                                            toast.success('Link copied!');
                                            setIsShareMenuOpen(false);
                                        }}
                                        type="button"
                                    >
                                        <Clipboard className="w-4 h-4" /> Copy Link
                                    </button>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent('Check out this paper: "' + paper.title + '" on Study Volte! ' + window.location.origin + '/browse?q=' + encodeURIComponent(paper.title))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm text-green-600 font-semibold w-full"
                                        onClick={() => setIsShareMenuOpen(false)}
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.19-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.68.97.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* View Button */}
                        <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-2 rounded-full text-primary-700 font-semibold text-xs group-hover:bg-primary-100 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Uploader row with level badge */}
                {paper.uploaderName && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 truncate flex-1">{paper.uploaderName}</span>
                        {paper.uploaderXP !== undefined && (() => {
                            const lvl = getLevelBadge(paper.uploaderXP!);
                            return (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${lvl.color}`}>
                                    {lvl.icon} {lvl.label}
                                </span>
                            );
                        })()}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PaperCard;

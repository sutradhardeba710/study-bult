import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BadgeCheck, BookOpen, Check, ChevronDown, Download, Edit2, Eye,
    FileText, Filter, Flame, GraduationCap, Heart, Search, Share2,
    SlidersHorizontal, Upload, X
} from 'lucide-react';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { markTaskDone } from '../services/engagement';
import { addDownload, getPapers, getUserLikedPaperIds, likePaper, unlikePaper } from '../services/papers';
import { incrementDownloadCount, type PaperData } from '../services/upload';
import EditPaperModal from '../components/admin/EditPaperModal';
import PDFThumbnail from '../components/PDFThumbnail';
import PdfViewer from '../components/PdfViewer';
import SEOHead from '../components/SEOHead';
import Skeleton from '../components/Skeleton';

type SortMode = 'relevance' | 'trending' | 'newest' | 'liked';
type FilterKey = 'college' | 'course' | 'semester' | 'subject';
type Filters = Record<FilterKey, string[]>;
type FilterOption = { value: string; count: number };

const EMPTY_FILTERS: Filters = { college: [], course: [], semester: [], subject: [] };
const STOP_WORDS = new Set(['a', 'all', 'and', 'for', 'from', 'i', 'in', 'me', 'need', 'of', 'paper', 'papers', 'please', 'question', 'the', 'to', 'want', 'year']);

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function asDate(value: unknown): Date | null {
    const source = (value as { toDate?: () => Date })?.toDate?.() ?? (value ? new Date(value as string | number) : null);
    return source && !Number.isNaN(source.getTime()) ? source : null;
}

function formatDate(value: unknown): string {
    const source = asDate(value);
    return source ? source.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable';
}

function formatFileSize(bytes?: number): string {
    if (!bytes) return 'PDF';
    return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function getPaperYear(paper: PaperData): string | null {
    return paper.title.match(/\b(19|20)\d{2}\b/)?.[0] ?? null;
}

function buildOptions(papers: PaperData[], key: FilterKey): FilterOption[] {
    const values = new Map<string, number>();
    papers.forEach((paper) => {
        const value = paper[key]?.trim();
        if (value) values.set(value, (values.get(value) ?? 0) + 1);
    });
    return Array.from(values, ([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function SearchField({ value, onChange, suggestions, compact = false }: {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    compact?: boolean;
}) {
    const inputId = compact ? 'sticky-paper-search' : 'hero-paper-search';
    return (
        <div className="relative">
            <Search className={cx('pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400', compact ? 'h-4 w-4' : 'h-5 w-5')} aria-hidden="true" />
            <label htmlFor={inputId} className="sr-only">Search question papers</label>
            <input
                id={inputId}
                type="search"
                list={`${inputId}-suggestions`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Try “BA 2nd semester History”"
                autoComplete="off"
                className={cx(
                    'w-full rounded-xl border bg-white text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15',
                    compact ? 'h-11 border-slate-200 pl-11 pr-11 text-sm' : 'h-14 border-white/15 pl-12 pr-12 text-base shadow-2xl shadow-slate-950/25'
                )}
            />
            <datalist id={`${inputId}-suggestions`}>
                {suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
            </datalist>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

function FilterGroup({ title, options, selected, onToggle, initialLimit = 6 }: {
    title: string;
    options: FilterOption[];
    selected: string[];
    onToggle: (value: string) => void;
    initialLimit?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const visibleOptions = expanded ? options : options.slice(0, initialLimit);
    if (!options.length) return null;

    return (
        <fieldset className="min-w-0 border-b border-slate-200 py-5 last:border-0">
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</legend>
            <div className="min-w-0 space-y-1">
                {visibleOptions.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                        <label key={option.value} className={cx('flex min-h-10 w-full min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm transition', isSelected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50')}>
                            <input type="checkbox" checked={isSelected} onChange={() => onToggle(option.value)} className="peer sr-only" />
                            <span aria-hidden="true" className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded border transition', isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2')}>
                                {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{option.value}</span>
                            <span className="shrink-0 text-xs tabular-nums text-slate-400">{option.count}</span>
                        </label>
                    );
                })}
            </div>
            {options.length > initialLimit && (
                <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-2 flex min-h-10 items-center gap-1 px-2 text-sm font-semibold text-blue-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {expanded ? 'Show fewer' : `Show ${options.length - initialLimit} more`}
                    <ChevronDown className={cx('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                </button>
            )}
        </fieldset>
    );
}

function FilterPanel({ filters, options, activeCount, onToggle, onClear }: {
    filters: Filters;
    options: Record<FilterKey, FilterOption[]>;
    activeCount: number;
    onToggle: (key: FilterKey, value: string) => void;
    onClear: () => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-950">Filters</h2>
                    {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">{activeCount}</span>}
                </div>
                {activeCount > 0 && <button type="button" onClick={onClear} className="min-h-10 px-2 text-xs font-bold text-blue-700 hover:text-blue-900">Clear</button>}
            </div>
            <FilterGroup title="University or college" options={options.college} selected={filters.college} onToggle={(value) => onToggle('college', value)} />
            <FilterGroup title="Course" options={options.course} selected={filters.course} onToggle={(value) => onToggle('course', value)} />
            <FilterGroup title="Semester" options={options.semester} selected={filters.semester} onToggle={(value) => onToggle('semester', value)} initialLimit={8} />
            <FilterGroup title="Subject" options={options.subject} selected={filters.subject} onToggle={(value) => onToggle('subject', value)} initialLimit={7} />
        </div>
    );
}

function PaperResultCard({ paper, isLiked, canLike, onPreview, onDownload, onLike, onShare }: {
    paper: PaperData;
    isLiked: boolean;
    canLike: boolean;
    onPreview: () => void;
    onDownload: () => void;
    onLike: () => void;
    onShare: () => void;
}) {
    const year = getPaperYear(paper);
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10">
            <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5 sm:p-5">
                <button type="button" onClick={onPreview} className="relative flex min-h-[142px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 transition group-hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:min-h-[174px]" aria-label={`Preview ${paper.title}`}>
                    <div className="transition duration-200 group-hover:scale-[1.025] group-hover:shadow-lg">
                        <PDFThumbnail fileUrl={paper.fileUrl} title={paper.title} thumbnailUrl={paper.thumbnailUrl} width={112} height={154} className="rounded-sm shadow-md" />
                    </div>
                    <span className="absolute bottom-2 left-2 right-2 hidden min-h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-950/90 px-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:flex"><Eye className="h-3.5 w-3.5" /> Open preview</span>
                </button>
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200"><BadgeCheck className="h-3.5 w-3.5" /> Approved</span>
                        {(paper.downloadCount || 0) > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200"><Flame className="h-3.5 w-3.5" /> Downloaded</span>}
                    </div>
                    <button type="button" onClick={onPreview} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-950 transition group-hover:text-blue-700 sm:text-lg">{paper.title}</h3>
                    </button>
                    <p className="mt-2 line-clamp-1 text-sm font-semibold text-blue-700">{paper.subject || 'General paper'}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{paper.college}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div><dt className="text-slate-400">Course</dt><dd className="mt-0.5 truncate font-semibold text-slate-700">{paper.course || '—'}</dd></div>
                        <div><dt className="text-slate-400">Semester</dt><dd className="mt-0.5 truncate font-semibold text-slate-700">{paper.semester || '—'}</dd></div>
                        <div><dt className="text-slate-400">{year ? 'Year' : 'Format'}</dt><dd className="mt-0.5 font-semibold text-slate-700">{year || 'PDF'}</dd></div>
                        <div><dt className="text-slate-400">File</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatFileSize(paper.fileSize)}</dd></div>
                    </dl>
                </div>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
                <div className="mr-auto flex items-center gap-3 text-xs font-semibold tabular-nums text-slate-500">
                    <span className="flex items-center gap-1.5" title="Downloads"><Download className="h-3.5 w-3.5 text-emerald-600" /> {paper.downloadCount || 0}</span>
                    <span className="flex items-center gap-1.5" title="Likes"><Heart className="h-3.5 w-3.5 text-rose-500" /> {paper.likeCount || 0}</span>
                </div>
                {canLike && <button type="button" onClick={onLike} className={cx('flex h-11 w-11 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-blue-500', isLiked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600')} aria-label={isLiked ? `Unlike ${paper.title}` : `Like ${paper.title}`}><Heart className={cx('h-4 w-4', isLiked && 'fill-current')} /></button>}
                <button type="button" onClick={onShare} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={`Share ${paper.title}`}><Share2 className="h-4 w-4" /></button>
                <button type="button" onClick={onPreview} className="hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex"><Eye className="h-4 w-4" /> Preview</button>
                <button type="button" onClick={onDownload} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Download className="h-4 w-4" /><span className="hidden sm:inline">Download</span></button>
            </div>
        </article>
    );
}
const Browse = () => {
    const { userProfile } = useAuth();
    const urlParams = useMemo(() => typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search), []);
    const [papers, setPapers] = useState<PaperData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(urlParams.get('q') || urlParams.get('search') || '');
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [sortMode, setSortMode] = useState<SortMode>('relevance');
    const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [likedPapers, setLikedPapers] = useState<Set<string>>(new Set());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchPapers = useCallback(async () => {
        try {
            setLoading(true);
            const [paperData, likedIds] = await Promise.all([
                getPapers({ status: 'approved' as const }, 50),
                userProfile?.uid ? getUserLikedPaperIds(userProfile.uid) : Promise.resolve(new Set<string>()),
            ]);
            setPapers(paperData);
            setLikedPapers(likedIds);
        } catch (error: unknown) {
            console.error('Error fetching papers:', error);
            const message = error instanceof Error ? error.message : '';
            toast.error(message.includes('index') ? 'This filter combination is not available yet.' : 'Could not load papers. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [userProfile?.uid]);

    useEffect(() => { fetchPapers(); }, [fetchPapers]);
    useEffect(() => { if (userProfile?.uid) markTaskDone(userProfile.uid, 'visit_browse'); }, [userProfile?.uid]);

    useEffect(() => {
        if (!mobileFiltersOpen || typeof document === 'undefined') return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [mobileFiltersOpen]);

    useEffect(() => {
        if (!papers.length) return;
        const requestedCollege = urlParams.get('college') || urlParams.get('university');
        const course = urlParams.get('course');
        const semester = urlParams.get('semester');
        setFilters((current) => {
            const next = { ...current };
            if (requestedCollege) {
                const token = requestedCollege.toLowerCase();
                const aliases = token === 'mbbu' ? ['maharaja bir bikram', 'mbbu'] : token === 'bbmc' ? ['bir bikram memorial', 'bbmc'] : [token];
                const match = papers.find((paper) => aliases.some((alias) => paper.college?.toLowerCase().includes(alias)))?.college;
                if (match) next.college = [match];
            }
            if (course) {
                const match = papers.find((paper) => paper.course?.toLowerCase() === course.toLowerCase())?.course;
                if (match) next.course = [match];
            }
            if (semester) {
                const match = papers.find((paper) => paper.semester?.toLowerCase() === semester.toLowerCase())?.semester;
                if (match) next.semester = [match];
            }
            return next;
        });
    }, [papers, urlParams]);

    const filterOptions = useMemo<Record<FilterKey, FilterOption[]>>(() => ({
        college: buildOptions(papers, 'college'),
        course: buildOptions(papers, 'course'),
        semester: buildOptions(papers, 'semester'),
        subject: buildOptions(papers, 'subject'),
    }), [papers]);
    const activeFilterCount = Object.values(filters).reduce((count, values) => count + values.length, 0);

    const fuse = useMemo(() => new Fuse(papers, {
        keys: ['title', 'subject', 'course', 'semester', 'college', 'examType'],
        threshold: 0.38,
        ignoreLocation: true,
    }), [papers]);

    const searchSuggestions = useMemo(() => {
        const candidates = [
            ...papers.map((paper) => paper.title),
            ...filterOptions.subject.map((option) => option.value),
            ...papers.map((paper) => `${paper.subject} ${paper.semester}`.trim()),
        ];
        return Array.from(new Set(candidates)).filter(Boolean).slice(0, 60);
    }, [filterOptions.subject, papers]);

    const filteredPapers = useMemo(() => {
        let results = papers;
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch) {
            const tokens = normalizedSearch.split(/[^a-z0-9]+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token));
            const tokenMatches = papers.filter((paper) => {
                const text = [paper.title, paper.subject, paper.course, paper.semester, paper.college, paper.examType].filter(Boolean).join(' ').toLowerCase();
                return tokens.length > 0 && tokens.every((token) => text.includes(token));
            });
            results = tokenMatches.length ? tokenMatches : fuse.search(normalizedSearch).map((result) => result.item);
        }
        (Object.keys(filters) as FilterKey[]).forEach((key) => {
            if (filters[key].length) results = results.filter((paper) => filters[key].includes(paper[key]?.trim()));
        });
        if (sortMode === 'trending') results = [...results].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        if (sortMode === 'newest') results = [...results].sort((a, b) => (asDate(b.createdAt)?.getTime() ?? 0) - (asDate(a.createdAt)?.getTime() ?? 0));
        if (sortMode === 'liked') results = [...results].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        return results;
    }, [filters, fuse, papers, searchTerm, sortMode]);

    const featuredPapers = useMemo(() => {
        const hasDownloads = papers.some((paper) => (paper.downloadCount || 0) > 0);
        return [...papers].sort((a, b) => hasDownloads
            ? (b.downloadCount || 0) - (a.downloadCount || 0)
            : (asDate(b.createdAt)?.getTime() ?? 0) - (asDate(a.createdAt)?.getTime() ?? 0)).slice(0, 3);
    }, [papers]);

    const relatedPapers = useMemo(() => {
        if (!selectedPaper) return [];
        return papers.filter((paper) => paper.id !== selectedPaper.id && (paper.subject === selectedPaper.subject || paper.semester === selectedPaper.semester)).slice(0, 4);
    }, [papers, selectedPaper]);

    const toggleFilter = (key: FilterKey, value: string) => setFilters((current) => ({
        ...current,
        [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
    const clearFilters = () => setFilters(EMPTY_FILTERS);
    const handlePreview = (paper: PaperData) => { setSelectedPaper(paper); setShowPreview(true); };
    const closePreview = () => { setShowPreview(false); setSelectedPaper(null); };

    const handleDownload = async (paper: PaperData) => {
        if (!paper.id) return;
        const toastId = toast.loading('Preparing your PDF…');
        try {
            await incrementDownloadCount(paper.id);
            if (userProfile?.uid) await addDownload(paper.id, userProfile.uid);
            if (paper.fileUrl && typeof window !== 'undefined') window.open(paper.fileUrl, '_blank', 'noopener,noreferrer');
            toast.success('Download started', { id: toastId });
        } catch {
            toast.error('Download failed. Please try again.', { id: toastId });
        }
    };

    const handleLike = async (paper: PaperData) => {
        if (!userProfile?.uid || !paper.id) { toast.error('Log in to save papers.'); return; }
        const isLiked = likedPapers.has(paper.id);
        setLikedPapers((current) => {
            const next = new Set(current);
            isLiked ? next.delete(paper.id!) : next.add(paper.id!);
            return next;
        });
        setPapers((current) => current.map((item) => item.id === paper.id
            ? { ...item, likeCount: Math.max(0, (item.likeCount || 0) + (isLiked ? -1 : 1)) }
            : item));
        try {
            if (isLiked) await unlikePaper(paper.id, userProfile.uid);
            else await likePaper(paper.id, userProfile.uid);
            toast.success(isLiked ? 'Removed from saved papers' : 'Saved for later');
        } catch {
            fetchPapers();
            toast.error('Could not update this paper.');
        }
    };

    const handleShare = async (paper: PaperData) => {
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}/browse?q=${encodeURIComponent(paper.title)}`;
        try {
            if (navigator.share) await navigator.share({ title: paper.title, text: 'View this question paper on Study Volte', url });
            else { await navigator.clipboard.writeText(url); toast.success('Paper link copied'); }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            toast.error('Could not share this paper.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-slate-950 px-4 py-16"><div className="mx-auto max-w-6xl"><Skeleton variant="text" width={180} height={20} /><div className="mt-5 max-w-2xl"><Skeleton variant="text" width="90%" height={52} /></div><div className="mt-8 max-w-3xl"><Skeleton variant="rect" width="100%" height={56} /></div></div></div>
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="hidden space-y-3 lg:block">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} variant="rect" width="100%" height={42} />)}</div>
                    <div className="grid gap-5 xl:grid-cols-2">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-5"><Skeleton variant="rect" width={124} height={170} /><div className="flex-1 space-y-3"><Skeleton variant="text" width="40%" height={18} /><Skeleton variant="text" width="90%" height={24} /><Skeleton variant="text" width="65%" height={16} /></div></div></div>)}</div>
                </div>
            </div>
        );
    }

    const sortOptions: Array<{ id: SortMode; label: string }> = [
        { id: 'relevance', label: searchTerm ? 'Best match' : 'Recommended' },
        { id: 'trending', label: 'Most downloaded' },
        { id: 'newest', label: 'Recently added' },
        { id: 'liked', label: 'Most saved' },
    ];
    const isDiscoveryView = !searchTerm && activeFilterCount === 0;
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <SEOHead
                title="Browse Previous Year Question Papers | Study Volte"
                description="Find free MBBU and BBMC previous year question papers by subject, course, semester, and college. Preview each PDF before downloading."
                keywords="browse question papers, previous year paper PDF, MBBU papers, BBMC papers, semester question papers"
            />

            <section className="site-academic-bg relative overflow-hidden border-b border-slate-800 text-white">
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:px-8 lg:py-20">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-200"><BookOpen className="h-4 w-4" /> Previous-year paper library</div>
                        <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Find the paper.<span className="block text-blue-400">Start revising.</span></h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Search real student-contributed question papers by subject, semester, course, or institution—then preview the PDF before you download.</p>
                        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available now</dt><dd className="mt-1 text-2xl font-black tabular-nums">{papers.length}</dd></div>
                            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subjects</dt><dd className="mt-1 text-2xl font-black tabular-nums">{filterOptions.subject.length}</dd></div>
                            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Institutions</dt><dd className="mt-1 text-2xl font-black tabular-nums">{filterOptions.college.length}</dd></div>
                            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Access</dt><dd className="mt-1 text-2xl font-black">Free</dd></div>
                        </dl>
                    </div>
                    <div className="self-center rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white"><Search className="h-5 w-5" /></div>
                            <div><p className="font-bold text-white">Search in plain language</p><p className="text-sm text-slate-400">Title, subject, course, semester, or college</p></div>
                        </div>
                        <SearchField value={searchTerm} onChange={setSearchTerm} suggestions={searchSuggestions} />
                        <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Popular searches</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {filterOptions.subject.slice(0, 3).map((option) => <button key={option.value} type="button" onClick={() => setSearchTerm(option.value)} className="min-h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400/50 hover:bg-blue-400/10 focus:outline-none focus:ring-2 focus:ring-blue-400">{option.value}</button>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="min-w-0 flex-1 lg:max-w-2xl"><SearchField value={searchTerm} onChange={setSearchTerm} suggestions={searchSuggestions} compact /></div>
                    <button type="button" onClick={() => setMobileFiltersOpen(true)} className="relative flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden">
                        <Filter className="h-4 w-4" /><span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] text-white">{activeFilterCount}</span>}
                    </button>
                    <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 lg:flex"><GraduationCap className="h-4 w-4 text-slate-400" /><span className="text-sm font-semibold text-slate-600">{filteredPapers.length} paper{filteredPapers.length === 1 ? '' : 's'}</span></div>
                </div>
            </div>

            <main>
                {isDiscoveryView && featuredPapers.length > 0 && (
                    <section className="border-b border-slate-200 bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            <div className="mb-5 flex items-end justify-between gap-4">
                                <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700"><Flame className="h-4 w-4" /> Start here</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{papers.some((paper) => (paper.downloadCount || 0) > 0) ? 'Popular with students' : 'Recently added'}</h2></div>
                                <p className="hidden text-sm text-slate-500 sm:block">Preview before downloading</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {featuredPapers.map((paper, index) => (
                                    <button key={paper.id} type="button" onClick={() => handlePreview(paper)} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm"><span className="text-lg font-black tabular-nums text-slate-400">{String(index + 1).padStart(2, '0')}</span></div>
                                        <div className="min-w-0"><p className="line-clamp-2 font-bold leading-snug text-slate-900 group-hover:text-blue-700">{paper.title}</p><p className="mt-2 truncate text-xs font-semibold text-slate-500">{paper.subject} · {paper.semester}</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-700"><Download className="h-3.5 w-3.5" /> {paper.downloadCount || 0} downloads</p></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-10">
                    <aside className="hidden min-w-0 lg:block"><div className="sticky top-40 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><FilterPanel filters={filters} options={filterOptions} activeCount={activeFilterCount} onToggle={toggleFilter} onClear={clearFilters} /></div></aside>
                    <section aria-labelledby="paper-results-title" className="min-w-0">
                        <div className="mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{searchTerm ? 'Search results' : 'Paper library'}</p>
                                    <h2 id="paper-results-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{searchTerm ? `Results for “${searchTerm}”` : 'All question papers'}</h2>
                                    <p className="mt-2 text-sm text-slate-500">Showing <span className="font-bold tabular-nums text-slate-800">{filteredPapers.length}</span> of {papers.length} available papers</p>
                                </div>
                                <div className="shrink-0">
                                    <label htmlFor="paper-sort" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort by</label>
                                    <select id="paper-sort" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="h-11 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15">
                                        {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            {activeFilterCount > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {(Object.keys(filters) as FilterKey[]).flatMap((key) => filters[key].map((value) => <button key={`${key}-${value}`} type="button" onClick={() => toggleFilter(key, value)} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-800 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">{value}<X className="h-3.5 w-3.5" /></button>))}
                                    <button type="button" onClick={clearFilters} className="min-h-9 px-2 text-xs font-bold text-slate-500 hover:text-slate-900">Clear all</button>
                                </div>
                            )}
                        </div>

                        {filteredPapers.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><FileText className="h-8 w-8" /></div>
                                <h3 className="mt-5 text-xl font-black text-slate-950">No exact match yet</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try removing one filter or search with a shorter subject name. You can also contribute the missing paper for other students.</p>
                                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                    <button type="button" onClick={() => { setSearchTerm(''); clearFilters(); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">Reset search</button>
                                    <Link to="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><Upload className="h-4 w-4" /> Upload a paper</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-5 xl:grid-cols-2">
                                {filteredPapers.map((paper) => <PaperResultCard key={paper.id} paper={paper} isLiked={likedPapers.has(paper.id || '')} canLike={Boolean(userProfile)} onPreview={() => handlePreview(paper)} onDownload={() => handleDownload(paper)} onLike={() => handleLike(paper)} onShare={() => handleShare(paper)} />)}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
                    <button type="button" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" />
                    <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl">
                        <div className="sticky top-0 z-10 -mx-5 flex items-center border-b border-slate-200 bg-white px-5 pb-4">
                            <div className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-full bg-slate-300" aria-hidden="true" />
                            <h2 id="mobile-filter-title" className="mt-3 text-lg font-black text-slate-950">Filter papers</h2>
                            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="ml-auto mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close filters"><X className="h-5 w-5" /></button>
                        </div>
                        <FilterPanel filters={filters} options={filterOptions} activeCount={activeFilterCount} onToggle={toggleFilter} onClear={clearFilters} />
                        <button type="button" onClick={() => setMobileFiltersOpen(false)} className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Show {filteredPapers.length} paper{filteredPapers.length === 1 ? '' : 's'}</button>
                    </div>
                </div>
            )}
            {showPreview && selectedPaper && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pdf-preview-title"
                    onMouseDown={(event) => { if (event.target === event.currentTarget) closePreview(); }}
                    onKeyDown={(event) => { if (event.key === 'Escape') closePreview(); }}
                    tabIndex={-1}
                >
                    <div className="flex h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[92dvh]">
                        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText className="h-5 w-5" /></div>
                            <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Approved paper</p><h2 id="pdf-preview-title" className="truncate text-sm font-black text-slate-950 sm:text-base">{selectedPaper.title}</h2></div>
                            <button type="button" onClick={closePreview} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close preview"><X className="h-5 w-5" /></button>
                        </header>

                        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="min-h-0 overflow-hidden bg-slate-100">
                                <PdfViewer fileUrl={selectedPaper.fileUrl} title={selectedPaper.title} onDownload={() => handleDownload(selectedPaper)} />
                            </div>
                            <aside className="hidden overflow-y-auto border-l border-slate-200 bg-white p-5 lg:block">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200"><BadgeCheck className="h-3.5 w-3.5" /> Approved</span>
                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{formatFileSize(selectedPaper.fileSize)}</span>
                                </div>
                                <h3 className="mt-4 text-xl font-black leading-tight text-slate-950">{selectedPaper.title}</h3>
                                <p className="mt-2 text-sm font-bold text-blue-700">{selectedPaper.subject}</p>
                                <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-200 py-5 text-sm">
                                    <div className="col-span-2"><dt className="text-xs font-semibold text-slate-400">Institution</dt><dd className="mt-1 font-bold leading-5 text-slate-800">{selectedPaper.college || 'Not provided'}</dd></div>
                                    <div><dt className="text-xs font-semibold text-slate-400">Course</dt><dd className="mt-1 font-bold text-slate-800">{selectedPaper.course || '—'}</dd></div>
                                    <div><dt className="text-xs font-semibold text-slate-400">Semester</dt><dd className="mt-1 font-bold text-slate-800">{selectedPaper.semester || '—'}</dd></div>
                                    <div><dt className="text-xs font-semibold text-slate-400">Exam</dt><dd className="mt-1 font-bold text-slate-800">{selectedPaper.examType || '—'}</dd></div>
                                    <div><dt className="text-xs font-semibold text-slate-400">Added</dt><dd className="mt-1 font-bold text-slate-800">{formatDate(selectedPaper.createdAt)}</dd></div>
                                </dl>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-slate-50 p-3"><Download className="h-4 w-4 text-emerald-600" /><p className="mt-2 text-xl font-black tabular-nums text-slate-950">{selectedPaper.downloadCount || 0}</p><p className="text-xs text-slate-500">Downloads</p></div>
                                    <div className="rounded-xl bg-slate-50 p-3"><Heart className="h-4 w-4 text-rose-500" /><p className="mt-2 text-xl font-black tabular-nums text-slate-950">{selectedPaper.likeCount || 0}</p><p className="text-xs text-slate-500">Saves</p></div>
                                </div>
                                <div className="mt-5 space-y-2">
                                    <button type="button" onClick={() => handleDownload(selectedPaper)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Download className="h-4 w-4" /> Download PDF</button>
                                    <button type="button" onClick={() => handleShare(selectedPaper)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><Share2 className="h-4 w-4" /> Share paper</button>
                                    {userProfile && <button type="button" onClick={() => handleLike(selectedPaper)} className={cx('flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500', likedPapers.has(selectedPaper.id || '') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}><Heart className={cx('h-4 w-4', likedPapers.has(selectedPaper.id || '') && 'fill-current')} />{likedPapers.has(selectedPaper.id || '') ? 'Saved' : 'Save for later'}</button>}
                                    {userProfile?.role === 'admin' && <button type="button" onClick={() => setIsEditModalOpen(true)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"><Edit2 className="h-4 w-4" /> Edit paper</button>}
                                </div>
                                {relatedPapers.length > 0 && (
                                    <div className="mt-7">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Related papers</p>
                                        <div className="mt-3 space-y-2">
                                            {relatedPapers.map((paper) => <button key={paper.id} type="button" onClick={() => setSelectedPaper(paper)} className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><p className="line-clamp-2 text-sm font-bold leading-snug text-slate-800">{paper.title}</p><p className="mt-1 truncate text-xs text-slate-500">{paper.subject} · {paper.semester}</p></button>)}
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>

                        <footer className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3 lg:hidden">
                            <button type="button" onClick={() => handleShare(selectedPaper)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Share paper"><Share2 className="h-4 w-4" /></button>
                            {userProfile && <button type="button" onClick={() => handleLike(selectedPaper)} className={cx('flex h-11 w-11 items-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500', likedPapers.has(selectedPaper.id || '') ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600')} aria-label="Save paper"><Heart className={cx('h-4 w-4', likedPapers.has(selectedPaper.id || '') && 'fill-current')} /></button>}
                            <button type="button" onClick={() => handleDownload(selectedPaper)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Download className="h-4 w-4" /> Download PDF</button>
                        </footer>
                    </div>
                </div>
            )}

            <EditPaperModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                paper={selectedPaper}
                onSaveSuccess={() => { fetchPapers(); setIsEditModalOpen(false); }}
            />
        </div>
    );
};

export default Browse;
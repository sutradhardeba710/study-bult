import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Download, Eye, Heart, Search, X, Share2, Clipboard } from 'lucide-react';
import { getPapers, likePaper, unlikePaper, isPaperLiked, addDownload } from '../services/papers';
import { incrementDownloadCount } from '../services/upload';
import { useAuth } from '../context/AuthContext';
import type { PaperData } from '../services/upload';
import { useMeta } from '../context/MetaContext';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import Button from '../components/Button';
import { Document, Page, pdfjs } from 'react-pdf';
import Skeleton from '../components/Skeleton';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Browse = () => {
  const { userProfile } = useAuth();
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [likedPapers, setLikedPapers] = useState<Set<string>>(new Set());
  const { loading: metaLoading } = useMeta();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    // Only fetch all papers, no filters
    fetchPapers();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.relative')) setShareMenuOpen(null);
    };
    if (shareMenuOpen) {
      document.addEventListener('mousedown', closeMenu);
      return () => document.removeEventListener('mousedown', closeMenu);
    }
  }, [shareMenuOpen]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      // Build queryFilters robustly: only include non-empty string values
      const queryFilters: any = { status: 'approved' as const };
      const papersData = await getPapers(queryFilters, 50);
      setPapers(papersData);
      // Check which papers are liked by current user
      if (userProfile?.uid) {
        const likedSet = new Set<string>();
        for (const paper of papersData) {
          if (paper.id) {
            const isLiked = await isPaperLiked(paper.id, userProfile.uid);
            if (isLiked) {
              likedSet.add(paper.id);
            }
          }
        }
        setLikedPapers(likedSet);
      }
    } catch (error: any) {
      console.error('Error fetching papers:', error);
      if (error?.message?.includes('index')) {
        toast.error('A new filter combination requires admin approval. Please try a different filter or contact support.');
      } else {
        toast.error('Failed to load papers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fuse = useMemo(() => {
    return new Fuse(papers, {
      keys: ['title', 'subject'],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [papers]);

  const fuzzyResults = useMemo(() => {
    if (!searchTerm.trim()) return papers;
    return fuse.search(searchTerm).map(result => result.item);
  }, [fuse, searchTerm, papers]);

  const filteredPapers = fuzzyResults;

  const handleDownload = async (paper: PaperData) => {
    if (!paper.id) return;
    const toastId = toast.loading('Preparing download...');
    try {
      // Increment download count
      await incrementDownloadCount(paper.id);
      // Track user download if logged in
      if (userProfile?.uid) {
        await addDownload(paper.id, userProfile.uid);
      }
      // Open download in a new tab
      if (paper.fileUrl) {
        window.open(paper.fileUrl, '_blank', 'noopener,noreferrer');
      }
      toast.success('Download started!', { id: toastId });
    } catch (error) {
      toast.error('Failed to download paper. Please try again.', { id: toastId });
      console.error('Download error:', error);
    }
  };

  const handleLike = async (paper: PaperData) => {
    if (!userProfile?.uid || !paper.id) return;
      const isLiked = likedPapers.has(paper.id);
      
    // Optimistically update UI
    setLikedPapers(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(paper.id!);
      } else {
        newSet.add(paper.id!);
      }
      return newSet;
    });
    setPapers(prev => prev.map(p =>
      p.id === paper.id
        ? { ...p, likeCount: (p.likeCount || 0) + (isLiked ? -1 : 1) }
        : p
    ));

    try {
      if (isLiked) {
        await unlikePaper(paper.id, userProfile.uid);
        toast.success('Like removed');
      } else {
        await likePaper(paper.id, userProfile.uid);
        toast.success('Paper liked!');
      }
    } catch (error) {
      // Revert UI if error
      setLikedPapers(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(paper.id!);
        } else {
          newSet.delete(paper.id!);
      }
        return newSet;
      });
      setPapers(prev => prev.map(p => 
        p.id === paper.id 
          ? { ...p, likeCount: (p.likeCount || 0) + (isLiked ? 1 : -1) }
          : p
      ));
      toast.error('Failed to update like. Please try again.');
      console.error('Like error:', error);
    }
  };

  const handlePreview = (paper: PaperData) => {
    setSelectedPaper(paper);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedPaper(null);
  };

  // Leaderboard logic
  // const topLiked = [...papers].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 5);
  // const topDownloaded = [...papers].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5);

  if (loading || metaLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <Skeleton variant="text" width={180} height={24} className="mb-2" />
                  <div className="space-y-2 mb-4">
                    <Skeleton variant="text" width={120} height={14} />
                    <Skeleton variant="text" width={100} height={14} />
                    <Skeleton variant="text" width={100} height={14} />
                    <Skeleton variant="text" width={140} height={14} />
                    <Skeleton variant="text" width={100} height={14} />
                    <Skeleton variant="text" width={120} height={14} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton variant="rect" width={60} height={32} />
                    <Skeleton variant="rect" width={60} height={32} />
                    <Skeleton variant="rect" width={60} height={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Browse Papers</h1>
              <p className="mt-2 text-gray-600">
                Find and download question papers from various colleges and courses
              </p>
            </div>
            {/* 3. Remove Filters button and filter dropdowns from the UI */}
            {/* Only keep the search bar and leaderboard */}
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search papers by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          {/* 3. Remove Filters button and filter dropdowns from the UI */}
          {/* Only keep the search bar and leaderboard */}

          {/* Leaderboard */}
          {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h2 className="text-lg font-bold text-primary-700 mb-3 flex items-center"><Heart className="w-5 h-5 mr-2 text-red-500" /> Most Liked Papers</h2>
                {topLiked.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : (
                  <ul className="divide-y divide-gray-100">
                    {topLiked.map(paper => (
                      <li key={paper.id} className="py-2 flex items-center justify-between">
                        <span className="truncate font-medium text-gray-900">{paper.title}</span>
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-gray-700">{paper.likeCount || 0}</span>
                          <Button size="sm" variant="outline" onClick={() => handlePreview(paper)}>Preview</Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h2 className="text-lg font-bold text-primary-700 mb-3 flex items-center"><Download className="w-5 h-5 mr-2 text-blue-500" /> Most Downloaded Papers</h2>
                {topDownloaded.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : (
                  <ul className="divide-y divide-gray-100">
                    {topDownloaded.map(paper => (
                      <li key={paper.id} className="py-2 flex items-center justify-between">
                        <span className="truncate font-medium text-gray-900">{paper.title}</span>
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-700">{paper.downloadCount || 0}</span>
                          <Button size="sm" variant="outline" onClick={() => handlePreview(paper)}>Preview</Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              </div>
            </div> */}
        </div>
      </div>

      {/* Papers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {paper.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Subject:</span> {paper.subject}</p>
                    <p><span className="font-medium">Semester:</span> {paper.semester}</p>
                    <p><span className="font-medium">Course:</span> {paper.course}</p>
                    <p><span className="font-medium">College:</span> {paper.college}</p>
                    <p><span className="font-medium">Uploaded by:</span> {paper.uploaderName}</p>
                    <p><span className="font-medium">Last Updated:</span> {
                      paper.updatedAt && typeof paper.updatedAt === 'object' && typeof paper.updatedAt.toDate === 'function'
                        ? paper.updatedAt.toDate().toLocaleDateString()
                        : (typeof paper.updatedAt === 'string' || typeof paper.updatedAt === 'number')
                          ? new Date(paper.updatedAt).toLocaleDateString()
                          : (paper.createdAt && typeof paper.createdAt === 'object' && typeof paper.createdAt.toDate === 'function')
                            ? paper.createdAt.toDate().toLocaleDateString()
                            : (typeof paper.createdAt === 'string' || typeof paper.createdAt === 'number')
                              ? new Date(paper.createdAt).toLocaleDateString()
                              : 'N/A'
                    }</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {paper.likeCount || 0}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {paper.downloadCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons and share menu in a single relative container */}
                  <div className="relative">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(paper)}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(paper)}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      {userProfile && (
                        <button
                          onClick={() => handleLike(paper)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            likedPapers.has(paper.id || '')
                              ? 'text-red-600 bg-red-50 border border-red-200'
                              : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPapers.has(paper.id || '') ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => setShareMenuOpen(shareMenuOpen === paper.id ? null : (paper.id || null))}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        title="Share"
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={shareMenuOpen === paper.id}
                        aria-controls={`share-menu-${paper.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      {shareMenuOpen === paper.id && (
                        <div
                          id={`share-menu-${paper.id}`}
                          role="menu"
                          aria-label="Share options"
                          className="absolute right-0 top-full mt-2 z-50 w-44 bg-white border border-gray-200 rounded shadow-lg p-2 flex flex-col gap-2 animate-fade-in"
                          style={{ minWidth: '10rem' }}
                        >
                          {/* Arrow indicator */}
                          <div style={{ position: 'absolute', top: '-8px', right: '16px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #e5e7eb' }} aria-hidden="true"></div>
                          <button
                            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin + '/browse?paper=' + paper.id);
                              toast.success('Link copied!');
                              setShareMenuOpen(null);
                            }}
                            role="menuitem"
                          >
                            <Clipboard className="w-4 h-4" /> Copy Link
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent('Check out this paper on StudyVault: ' + window.location.origin + '/browse?paper=' + paper.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm"
                            onClick={() => setShareMenuOpen(null)}
                            role="menuitem"
                          >
                            {/* WhatsApp SVG */}
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.19-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.68.97.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/></svg>
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && selectedPaper && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-preview-title"
          tabIndex={-1}
          onClick={closePreview}
          onKeyDown={e => {
            if (e.key === 'Escape') closePreview();
            // Trap tab key
            if (e.key === 'Tab') {
              // Focus management for modal
              const modal = document.querySelector('[role="dialog"]') as HTMLElement;
              const focusableEls = modal?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusableEls && focusableEls.length > 0) {
                const first = focusableEls[0] as HTMLElement;
                const last = focusableEls[focusableEls.length - 1] as HTMLElement;
                if (e.shiftKey) {
                  if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                  }
                } else {
                  if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }
            }
          }}

        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 id="pdf-preview-title" className="text-lg font-semibold text-gray-900">{selectedPaper.title}</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close PDF preview"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center bg-gray-50">
              <Document
                file={selectedPaper.fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="text-center text-gray-400">Loading PDF...</div>}
                className="w-full flex flex-col items-center"
              >
                <Page pageNumber={pageNumber} scale={zoom} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>Prev</Button>
                <span className="text-sm">Page {pageNumber} of {numPages || '?'}</span>
                <Button type="button" variant="secondary" onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={numPages ? pageNumber >= numPages : true}>Next</Button>
                <Button type="button" variant="secondary" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} disabled={zoom <= 0.5}>-</Button>
                <span className="text-sm">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <Button type="button" variant="secondary" onClick={() => setZoom(z => Math.min(2, z + 0.1))} disabled={zoom >= 2}>+</Button>
                <Button type="button" variant="secondary" onClick={() => setZoom(1.0)} disabled={zoom === 1.0}>Reset</Button>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Subject: {selectedPaper.subject} | Semester: {selectedPaper.semester}</p>
                <p>Course: {selectedPaper.course} | College: {selectedPaper.college}</p>
                <p>Exam Type: {selectedPaper.examType}</p>
                <p>File Size: {selectedPaper.fileSize ? (selectedPaper.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
                <p>Likes: {selectedPaper.likeCount || 0} | Downloads: {selectedPaper.downloadCount || 0}</p>
                <p>Uploaded by: {selectedPaper.uploaderName} on {new Date(selectedPaper.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(selectedPaper)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Download
                </button>
                {userProfile && (
                  <button
                    onClick={() => handleLike(selectedPaper)}
                    className={`px-4 py-2 rounded-md ${
                      likedPapers.has(selectedPaper.id || '')
                        ? 'text-red-600 bg-red-50 border border-red-200'
                        : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPapers.has(selectedPaper.id || '') ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse; 
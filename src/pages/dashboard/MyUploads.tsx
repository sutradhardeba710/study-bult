import { useState, useEffect, useCallback } from 'react';
import { FileText, Heart, Download, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPapers } from '../../services/papers';
import type { PaperData } from '../../services/upload';
import PDFThumbnail from '../../components/PDFThumbnail';
import Skeleton from '../../components/Skeleton';
import logger from '../../utils/logger';

const MyUploads = () => {
  const { userProfile } = useAuth();
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    if (!userProfile?.uid) {
      logger.warn('No user ID found, cannot fetch papers');
      return;
    }

    try {
      setError(null);
      // Remove sensitive logging
      const userPapers = await getUserPapers(userProfile.uid);
      // Remove sensitive logging that shows paper contents
      logger.debug('Papers fetched', { count: userPapers.length });
      setPapers(userPapers);
    } catch (error) {
      logger.error('Error fetching papers', error);
      setError('Failed to load your papers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPapers();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Firestore Timestamp
    if (typeof date === 'object' && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    // String or number
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'N/A';
  };

  const getStats = () => {
    const totalLikes = papers.reduce((sum, paper) => sum + (paper.likeCount || 0), 0);
    const totalDownloads = papers.reduce((sum, paper) => sum + (paper.downloadCount || 0), 0);
    const approvedPapers = papers.filter(paper => paper.status === 'approved').length;
    const pendingPapers = papers.filter(paper => paper.status === 'pending').length;

    return { totalLikes, totalDownloads, approvedPapers, pendingPapers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Mobile skeleton cards */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Skeleton variant="rect" width={40} height={56} className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton variant="text" width={120} height={16} className="mb-1" />
                  <Skeleton variant="text" width={60} height={12} />
                </div>
              </div>
              <Skeleton variant="text" width={180} height={12} />
              <Skeleton variant="text" width={100} height={12} />
              <Skeleton variant="text" width={80} height={12} />
            </div>
          ))}
        </div>
        {/* Desktop skeleton table */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3" colSpan={6}>
                    <Skeleton variant="text" width={200} height={20} />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton variant="rect" width={40} height={56} /></td>
                    <td className="px-6 py-4"><Skeleton variant="text" width={80} height={16} /></td>
                    <td className="px-6 py-4"><Skeleton variant="text" width={60} height={16} /></td>
                    <td className="px-6 py-4"><Skeleton variant="text" width={60} height={16} /></td>
                    <td className="px-6 py-4"><Skeleton variant="text" width={80} height={16} /></td>
                    <td className="px-6 py-4"><Skeleton variant="rect" width={24} height={24} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} uploaded
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {papers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Papers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -z-10 group-hover:bg-primary-100/50 transition-colors duration-300"></div>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl shadow-sm border border-primary-100/50 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-primary-600 drop-shadow-sm" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Papers</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{papers.length}</p>
              </div>
            </div>
          </div>

          {/* Total Likes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:bg-red-100/50 transition-colors duration-300"></div>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl shadow-sm border border-red-100/50 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-red-500 drop-shadow-sm" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Likes</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.totalLikes}</p>
              </div>
            </div>
          </div>

          {/* Total Downloads */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100/50 transition-colors duration-300"></div>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-6 h-6 text-blue-500 drop-shadow-sm" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Downloads</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          {/* Approved Papers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100/50 transition-colors duration-300"></div>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl shadow-sm border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
                <span className="text-emerald-600 text-lg font-black drop-shadow-sm">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Approved</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.approvedPapers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {papers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 px-8 text-center">
          <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 via-violet-100 to-indigo-100 flex items-center justify-center shadow-inner">
            <span className="text-5xl select-none">📄</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No papers yet — be the first!</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-1">
            Share your question papers and help thousands of students across your college.
          </p>
          <p className="text-xs text-primary-500 font-semibold mb-8">
            ⚡ Earn XP + badges for every upload you make
          </p>
          <a
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            Upload Your First Paper 🚀
          </a>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {papers.map((paper) => (
              <div key={paper.id} className="bg-white/80 rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col space-y-3 group hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-10 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    <PDFThumbnail fileUrl={paper.fileUrl} width={40} height={56} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-900 truncate tracking-tight">{paper.title}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">{formatFileSize(paper.fileSize ?? 0)}</div>
                  </div>
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 shrink-0"
                    title="View Paper"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{paper.subject}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{paper.semester}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{paper.course}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${paper.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : paper.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${paper.status === 'approved'
                        ? 'bg-emerald-500'
                        : paper.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                        }`}></span>
                      {paper.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span className="flex items-center group/stat hover:text-rose-600 transition-colors cursor-default"><Heart className="w-3.5 h-3.5 text-rose-500 mr-1.5 group-hover/stat:scale-110 transition-transform" />{paper.likeCount || 0}</span>
                    <span className="flex items-center group/stat hover:text-blue-600 transition-colors cursor-default"><Download className="w-3.5 h-3.5 text-blue-500 mr-1.5 group-hover/stat:scale-110 transition-transform" />{paper.downloadCount || 0}</span>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-400 text-right">{formatDate(paper.createdAt)}</div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Paper
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-100">
                  {papers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors duration-200">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-10 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                            <PDFThumbnail fileUrl={paper.fileUrl} width={40} height={56} />
                          </div>
                          <div className="ml-4 min-w-0 max-w-xs">
                            <div className="text-[15px] font-bold text-slate-900 truncate tracking-tight">
                              {paper.title}
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">
                              {formatFileSize(paper.fileSize ?? 0)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-[14px] font-semibold text-slate-900 truncate max-w-[200px]">{paper.subject}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">
                          {paper.semester} • {paper.course}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${paper.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : paper.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${paper.status === 'approved'
                            ? 'bg-emerald-500'
                            : paper.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            }`}></span>
                          {paper.status}
                        </span>
                        {paper.status === 'pending' && (
                          <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                            Under review
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-5 text-sm font-semibold text-slate-600">
                          <div className="flex items-center group cursor-default">
                            <Heart className="w-4 h-4 text-rose-500 mr-2 group-hover:scale-110 transition-transform" />
                            {paper.likeCount || 0}
                          </div>
                          <div className="flex items-center group cursor-default">
                            <Download className="w-4 h-4 text-blue-500 mr-2 group-hover:scale-110 transition-transform" />
                            {paper.downloadCount || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-slate-500">
                        {formatDate(paper.createdAt)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <a
                            href={paper.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            title="View Paper"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )
      }
    </div >
  );
};

export default MyUploads; 
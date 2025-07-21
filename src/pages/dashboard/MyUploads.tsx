import { useState, useEffect } from 'react';
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

    const fetchPapers = async () => {
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
    };

  useEffect(() => {
    fetchPapers();
  }, [userProfile?.uid]);

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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Papers</p>
                <p className="text-2xl font-bold text-gray-900">{papers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedPapers}</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No papers uploaded yet</h3>
          <p className="text-gray-600 mb-6">
            Start sharing your question papers with the community
          </p>
          <a
            href="/dashboard/upload"
            className="btn-primary inline-flex items-center"
          >
            Upload Your First Paper
          </a>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {papers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden">
                    <PDFThumbnail fileUrl={paper.fileUrl} width={40} height={56} />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">{paper.title}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(paper.fileSize)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                  <span>{paper.subject}</span>
                  <span>• {paper.semester}</span>
                  <span>• {paper.course}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paper.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : paper.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      paper.status === 'approved'
                        ? 'bg-green-400'
                        : paper.status === 'pending'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}></span>
                    {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                  </span>
                  {paper.status === 'pending' && (
                    <span className="text-xs text-gray-500">Under review</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center"><Heart className="w-4 h-4 text-red-500 mr-1" />{paper.likeCount || 0}</span>
                  <span className="flex items-center"><Download className="w-4 h-4 text-blue-500 mr-1" />{paper.downloadCount || 0}</span>
                </div>
                <div className="text-xs text-gray-500">{formatDate(paper.createdAt)}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-900"
                    title="View Paper"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden">
                            <PDFThumbnail fileUrl={paper.fileUrl} width={40} height={56} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {paper.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(paper.fileSize)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paper.subject}</div>
                      <div className="text-sm text-gray-500">
                        {paper.semester} • {paper.course}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paper.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : paper.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${
                            paper.status === 'approved' 
                              ? 'bg-green-400'
                              : paper.status === 'pending'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}></span>
                        {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                      </span>
                        {paper.status === 'pending' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Under review
                          </p>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          {paper.likeCount || 0}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 text-blue-500 mr-1" />
                          {paper.downloadCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(paper.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                            title="View Paper"
                        >
                          <MoreHorizontal className="w-4 h-4" />
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
      )}
    </div>
  );
};

export default MyUploads; 
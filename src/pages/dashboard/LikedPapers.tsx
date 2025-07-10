import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLikedPapers, unlikePaper } from '../../services/papers';
import type { PaperData } from '../../services/upload';
import { Download, Heart, Eye, FileText } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';

const LikedPapers = () => {
  const { userProfile } = useAuth();
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPapers = async () => {
      if (!userProfile?.uid) return;

      try {
        const likedPapers = await getLikedPapers(userProfile.uid);
        setPapers(likedPapers);
      } catch (error) {
        console.error('Error fetching liked papers:', error);
        toast.error('Failed to load liked papers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPapers();
  }, [userProfile?.uid]);

  const handleUnlike = async (paperId: string) => {
    if (!userProfile?.uid) return;

    try {
      await unlikePaper(paperId, userProfile.uid);
      setPapers(papers.filter(paper => paper.id !== paperId));
      toast.success('Paper removed from likes');
    } catch (error) {
      console.error('Error unliking paper:', error);
      toast.error('Failed to remove paper from likes. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Skeleton variant="rect" width={40} height={40} className="rounded-lg" />
              <div>
                <Skeleton variant="text" width={120} height={18} className="mb-2" />
                <Skeleton variant="text" width={80} height={14} />
              </div>
            </div>
            <Skeleton variant="text" width={100} height={12} className="mb-2" />
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="text" width={60} height={12} />
            <div className="flex space-x-2 mt-4">
              <Skeleton variant="rect" width={60} height={32} />
              <Skeleton variant="rect" width={60} height={32} />
              <Skeleton variant="circle" width={32} height={32} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Liked Papers</h1>
        <div className="text-sm text-gray-500">
          {papers.length} paper{papers.length !== 1 ? 's' : ''} liked
        </div>
      </div>

      {papers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No liked papers yet</h3>
          <p className="text-gray-600 mb-6">
            Papers you like will appear here for easy access
          </p>
          <a
            href="/browse"
            className="btn-primary inline-flex items-center"
          >
            Browse Papers
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-gray-500">{paper.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{paper.course}</span>
                    <span>{paper.semester}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{paper.examType}</span>
                    <span>{formatDate(paper.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        {paper.likeCount || 0}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Download className="w-4 h-4 text-blue-500 mr-1" />
                        {paper.downloadCount || 0}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      by {paper.uploaderName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    <Eye className="w-4 h-4 mr-1 inline" />
                    View
                  </a>
                  <a
                    href={paper.fileUrl}
                    download
                    className="flex-1 btn-secondary text-center text-sm py-2"
                  >
                    <Download className="w-4 h-4 mr-1 inline" />
                    Download
                  </a>
                  <button
                    onClick={() => handleUnlike(paper.id!)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Unlike"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPapers; 
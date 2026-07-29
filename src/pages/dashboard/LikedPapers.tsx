import { useState, useEffect } from 'react';
import { Heart, Download, Eye } from 'lucide-react';
import { getLikedPapers, unlikePaper } from '../../services/papers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import type { PaperData } from '../../services/upload';
import Skeleton from '../../components/Skeleton';
import PDFThumbnail from '../../components/PDFThumbnail';

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
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Liked Papers</h1>
          <p className="text-slate-500 font-medium mt-1">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} you've found helpful
          </p>
        </div>
      </div>

      {papers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-12 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-rose-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No liked papers yet</h3>
          <p className="text-slate-500 font-medium mb-8">
            Papers you like will appear here for easy access
          </p>
          <a
            href="/browse"
            className="inline-flex items-center bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Browse Papers
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 p-5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="flex items-start space-x-4 mb-4">
                <div className="h-16 w-12 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-shadow">
                  <PDFThumbnail fileUrl={paper.fileUrl} width={48} height={64} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                    {paper.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{paper.subject}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{paper.course}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-[13px] font-medium text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Semester</span>
                    <span>{paper.semester}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Exam Type</span>
                    <span>{paper.examType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[13px] font-medium pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg"><Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />{paper.likeCount || 0}</span>
                    <span className="flex items-center font-semibold text-slate-500"><Download className="w-3.5 h-3.5 mr-1" />{paper.downloadCount || 0}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate(paper.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center space-x-2">
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary-50 text-primary-700 font-bold text-sm py-2.5 rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center group/btn"
                >
                  <Eye className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                  View
                </a>
                <a
                  href={paper.fileUrl}
                  download
                  className="flex-1 bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center group/btn"
                >
                  <Download className="w-4 h-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                  Save
                </a>
                <button
                  onClick={() => handleUnlike(paper.id!)}
                  className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border-2 border-transparent hover:border-rose-100 shrink-0"
                  title="Unlike"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPapers; 
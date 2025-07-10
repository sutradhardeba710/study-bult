import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUserPapers, getUserLikeEvents, getUserDownloads, getPapers } from '../services/papers';
import { Upload, FileText, Download, Heart, User, ChevronRight, Info } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const LandingLoggedIn = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalLikes: 0,
    totalDownloads: 0,
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.uid) return;
      try {
        const [userPapers, likeEvents, downloads] = await Promise.all([
          getUserPapers(userProfile.uid),
          getUserLikeEvents(userProfile.uid),
          getUserDownloads(userProfile.uid),
        ]);
        setStats({
          totalUploads: userPapers.length,
          totalLikes: likeEvents.length,
          totalDownloads: downloads.length,
        });
        // Recent activity (uploads + downloads + likes)
        const uploadActivities = userPapers.map(paper => ({
          type: 'upload',
          title: paper.title,
          date: paper.updatedAt || paper.createdAt,
          paperId: paper.id,
        }));
        const likeActivities = likeEvents.map(event => ({
          type: 'like',
          title: event.title,
          date: event.date,
          paperId: event.paperId,
        }));
        const downloadActivities = downloads.map(d => ({
          type: 'download',
          title: d.title || 'Unknown',
          date: d.createdAt,
          paperId: d.id,
        }));
        const all = [...uploadActivities, ...likeActivities, ...downloadActivities].sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });
        setActivity(all.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userProfile?.uid]);

  useEffect(() => {
    // Fetch recommended papers based on course/semester
    const fetchRecommended = async () => {
      if (!userProfile?.course && !userProfile?.semester) return;
      setRecLoading(true);
      try {
        const papers = await getPapers({
          course: userProfile.course,
          semester: userProfile.semester,
          status: 'approved',
        }, 4);
        setRecommended(papers);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommended();
  }, [userProfile?.course, userProfile?.semester]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 space-y-8">
        <Skeleton variant="text" width={240} height={36} />
        <Skeleton variant="text" width={180} height={20} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={80} />
          ))}
        </div>
        <Skeleton variant="text" width={160} height={24} />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rect" width="100%" height={32} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col items-center justify-start py-8 px-2 md:px-4 animate-fade-in">
      <div className="w-full max-w-3xl mx-auto">
        {/* Announcement */}
        {showAnnouncement && (
          <div className="mb-6 flex items-center bg-primary-100 border border-primary-200 rounded-lg p-4 shadow-sm relative">
            <Info className="w-5 h-5 text-primary-600 mr-2" />
            <span className="text-primary-800 font-medium">New:</span>
            <span className="ml-2 text-primary-700">Check out the new personalized dashboard and offline detection features!</span>
            <button onClick={() => setShowAnnouncement(false)} className="absolute right-3 top-2 text-primary-400 hover:text-primary-700 text-lg">&times;</button>
          </div>
        )}
        {/* Profile Card */}
        <div className="flex items-center gap-4 bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center text-2xl font-bold text-primary-800 overflow-hidden">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              userProfile?.name?.[0] || <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-primary-900 mb-1">{getGreeting()}, {userProfile?.name || 'Student'}!</div>
            <div className="text-gray-600 text-sm">{userProfile?.email}</div>
            <div className="text-gray-500 text-xs mt-1">{userProfile?.college} {userProfile?.course && `| ${userProfile.course}`} {userProfile?.semester && `| ${userProfile.semester}`}</div>
          </div>
          <Link to="/dashboard/settings" className="btn-secondary flex items-center gap-1 text-sm px-3 py-2">
            <User className="w-4 h-4" /> View Profile
          </Link>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col items-center transition-transform hover:scale-105">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalUploads}</div>
            <div className="text-gray-500 text-sm">Uploads</div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col items-center transition-transform hover:scale-105">
            <Heart className="w-8 h-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
            <div className="text-gray-500 text-sm">Likes</div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col items-center transition-transform hover:scale-105">
            <Download className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</div>
            <div className="text-gray-500 text-sm">Downloads</div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link to="/dashboard/upload" className="btn-primary flex items-center justify-center gap-2 text-lg py-4 transition-transform hover:scale-105">
            <Upload className="w-5 h-5" /> Upload New Paper
          </Link>
          <Link to="/dashboard/uploads" className="btn-secondary flex items-center justify-center gap-2 text-lg py-4 transition-transform hover:scale-105">
            <FileText className="w-5 h-5" /> My Uploads
          </Link>
          <Link to="/dashboard/likes" className="btn-secondary flex items-center justify-center gap-2 text-lg py-4 transition-transform hover:scale-105">
            <Heart className="w-5 h-5" /> Liked Papers
          </Link>
          <Link to="/browse" className="btn-secondary flex items-center justify-center gap-2 text-lg py-4 transition-transform hover:scale-105">
            <Download className="w-5 h-5" /> Browse Papers
          </Link>
        </div>
        {/* Recommended Papers */}
        {(userProfile?.course || userProfile?.semester) && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">Recommended for you</h2>
            {recLoading ? (
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rect" width={180} height={80} />)}
              </div>
            ) : recommended.length === 0 ? (
              <div className="text-gray-500">No recommendations yet. Upload or like papers to get personalized suggestions!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map(paper => (
                  <Link to={`/browse?paper=${paper.id}`} key={paper.id} className="bg-white border border-primary-100 rounded-lg shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition group">
                    <div className="font-semibold text-primary-700 group-hover:underline truncate">{paper.title}</div>
                    <div className="text-xs text-gray-500">{paper.subject} | {paper.course} | {paper.semester}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <Heart className="w-4 h-4 text-red-500" /> {paper.likeCount || 0}
                      <Download className="w-4 h-4 text-green-500" /> {paper.downloadCount || 0}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="text-gray-500 text-center">No recent activity yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activity.map((act, i) => (
                <li key={i} className="py-3 flex items-center gap-3">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${act.type === 'upload' ? 'bg-blue-100' : act.type === 'like' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {act.type === 'upload' && <Upload className="w-5 h-5 text-blue-500" />}
                    {act.type === 'like' && <Heart className="w-5 h-5 text-red-500" />}
                    {act.type === 'download' && <Download className="w-5 h-5 text-green-500" />}
                  </div>
                  <span className="font-medium text-gray-800 truncate max-w-xs">{act.title}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {act.date && (act.date.toDate ? act.date.toDate().toLocaleDateString() : new Date(act.date).toLocaleDateString())}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingLoggedIn; 
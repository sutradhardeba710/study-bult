import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download, FileText, Heart, TrendingUp, Download as DownloadIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPapers, getUserLikeEvents, getPapersByIds } from '../../services/papers';
import { db } from '../../services/firebaseDb';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import logger from '../../utils/logger';
import NudgeBanner from '../../components/NudgeBanner';
import { getEarnedBadges } from '../../utils/badges';

const DashboardHome = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalLikes: 0,
    totalDownloads: 0,
    likedPapers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [hasPendingPaper, setHasPendingPaper] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.uid) return;
      try {
        setLoading(true);
        const [userPapers, likeEvents] = await Promise.all([
          getUserPapers(userProfile.uid),
          getUserLikeEvents(userProfile.uid)
        ]);
        // Fetch user downloads for the stat
        const downloadsQuery = query(
          collection(db, 'downloads'),
          where('userId', '==', userProfile.uid)
        );
        const downloadsSnapshot = await getDocs(downloadsQuery);
        const totalDownloads = downloadsSnapshot.size;
        const totalLikes = likeEvents.length;
        setStats({
          totalUploads: userPapers.length,
          totalLikes,
          totalDownloads,
          likedPapers: totalLikes
        });
        setHasPendingPaper(userPapers.some(p => (p as any).status === 'pending'));
        logger.debug('Stats fetched successfully');
      } catch (error) {
        logger.error('Error fetching stats', error);
        toast.error('Failed to load dashboard stats. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userProfile?.uid]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!userProfile?.uid) return;
      setActivityLoading(true);
      try {
        // Fetch uploads
        const uploads = await getUserPapers(userProfile.uid);
        const uploadActivities = uploads.map(paper => ({
          type: 'upload',
          title: paper.title,
          status: paper.status,
          date: paper.updatedAt || paper.createdAt,
          paperId: paper.id
        }));

        // Fetch like events (true activity log)
        const likeEvents = await getUserLikeEvents(userProfile.uid);
        const likeActivities = likeEvents.map(event => ({
          type: 'like',
          title: event.title,
          date: event.date,
          paperId: event.paperId
        }));

        // Fetch download events directly from downloads collection
        const downloadsQuery = query(
          collection(db, 'downloads'),
          where('userId', '==', userProfile.uid)
        );
        const downloadsSnapshot = await getDocs(downloadsQuery);
        const downloadDocs = downloadsSnapshot.docs.map(doc => doc.data());
        const downloadPaperIds = downloadDocs.map(d => d.paperId).filter(Boolean);
        // Batch fetch all downloaded paper titles
        const downloadPaperMap = await getPapersByIds(downloadPaperIds);
        const downloadActivities = downloadDocs.map(d => ({
          type: 'download',
          title: downloadPaperMap[d.paperId]?.title || 'Unknown',
          date: d.createdAt,
          paperId: d.paperId
        }));

        // Merge and sort by date desc
        const allActivities = [...uploadActivities, ...likeActivities, ...downloadActivities].sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });
        setActivity(allActivities.slice(0, 10)); // Show up to 10 recent activities
        logger.debug('Activity fetched', { count: allActivities.length });
      } catch (error) {
        logger.error('Error fetching activity', error);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [userProfile?.uid]);

  const quickActions = [
    {
      title: 'Upload New Paper',
      description: 'Share your question papers with the community',
      icon: Upload,
      href: '/dashboard/upload',
      color: 'bg-blue-500'
    },
    {
      title: 'Browse Papers',
      description: 'Find papers from other students',
      icon: FileText,
      href: '/browse',
      color: 'bg-green-500'
    },
    {
      title: 'My Uploads',
      description: 'Manage your uploaded papers',
      icon: Download,
      href: '/dashboard/my-uploads',
      color: 'bg-purple-500'
    },
    {
      title: 'Liked Papers',
      description: 'View your favorite papers',
      icon: Heart,
      href: '/dashboard/likes',
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Skeleton variant="text" width={200} height={28} className="mb-2" />
          <Skeleton variant="text" width={300} height={16} />
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Skeleton variant="circle" width={40} height={40} className="mb-4" />
              <Skeleton variant="text" width={100} height={16} className="mb-2" />
              <Skeleton variant="text" width={60} height={24} />
            </div>
          ))}
        </div>
        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Skeleton variant="text" width={160} height={20} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <Skeleton variant="circle" width={32} height={32} className="mb-2" />
                <Skeleton variant="text" width={100} height={16} className="mb-1" />
                <Skeleton variant="text" width={120} height={12} />
              </div>
            ))}
          </div>
        </div>
        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Skeleton variant="text" width={140} height={20} className="mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="text" width={200} height={16} />
                <Skeleton variant="text" width={100} height={12} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Nudge Banner */}
      <NudgeBanner
        totalUploads={stats.totalUploads}
        totalDownloads={stats.totalDownloads}
        streak={userProfile?.streak ?? 0}
        hasPendingPaper={hasPendingPaper}
      />

      {/* Badge Shelf */}
      {(() => {
        const earned = getEarnedBadges(
          { totalUploads: stats.totalUploads, totalDownloads: stats.totalDownloads, totalLikes: stats.totalLikes },
          userProfile?.streak ?? 0
        );
        return earned.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Badges</p>
            <div className="flex flex-wrap gap-2">
              {earned.map(b => (
                <span
                  key={b.id}
                  title={b.description}
                  className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-full cursor-default select-none ${b.color}`}
                >
                  <b.Icon className="w-3.5 h-3.5" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* Welcome Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">{userProfile?.name || 'Student'}</span>! 👋
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Here's what's happening with your academic resources today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Uploads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100/50 transition-colors duration-300"></div>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-6 h-6 text-blue-600 drop-shadow-sm" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Total Uploads</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.totalUploads}</p>
            </div>
          </div>
        </div>

        {/* Likes Received */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:bg-red-100/50 transition-colors duration-300"></div>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl shadow-sm border border-red-100/50 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-6 h-6 text-red-600 drop-shadow-sm" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Likes Received</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.totalLikes}</p>
            </div>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100/50 transition-colors duration-300"></div>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl shadow-sm border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
              <Download className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Total Downloads</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>

        {/* Papers Liked */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:bg-purple-100/50 transition-colors duration-300"></div>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl shadow-sm border border-purple-100/50 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-purple-600 drop-shadow-sm" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Papers Liked</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stats.likedPapers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            // Apply slight modifications to action colors for modern look
            let iconBgColor = 'from-blue-500 to-blue-600';
            if (action.color.includes('green')) iconBgColor = 'from-emerald-400 to-emerald-500';
            if (action.color.includes('purple')) iconBgColor = 'from-indigo-500 to-purple-600';
            if (action.color.includes('red')) iconBgColor = 'from-rose-500 to-pink-600';

            return (
              <Link
                key={index}
                to={action.href}
                className="group block p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start sm:flex-col sm:items-start space-x-4 sm:space-x-0 sm:space-y-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBgColor} shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">{action.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-blue-700">Live updates</span>
          </div>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 font-medium">Loading your activity...</p>
            </div>
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Start building your academic journey by uploading papers or discovering content from others.
            </p>
            <div className="flex justify-center space-x-3">
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Paper
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Browse Papers
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {activity.map((item, idx) => {
              // ... keep original loop map but just update classnames for the items
              return (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                    {item.type === 'upload' ? (
                      <Upload className="w-4 h-4 text-primary-600" />
                    ) : item.type === 'like' ? (
                      <Heart className="w-4 h-4 text-rose-500" />
                    ) : item.type === 'download' ? (
                      <DownloadIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 cursor-default">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.type === 'upload' ? 'Uploaded' : item.type === 'like' ? 'Liked' : 'Downloaded'}
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        {item.date?.toDate ? item.date.toDate().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }) : (item.date ? new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A')}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {item.title}
                    </div>
                    {item.type === 'upload' && item.status && (
                      <div className="mt-2 text-xs font-semibold">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {activity.length >= 10 && (
              <div className="text-center pt-4">
                <Link
                  to="/dashboard/my-uploads"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  View all activity
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserPapers, getUserLikeEvents, getUserDownloads, getDownloadDate, getPapersByIds } from '../../services/papers';
import { Upload, Download, Heart, FileText, TrendingUp, Download as DownloadIcon } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?.uid) return;
      try {
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
      } catch (error) {
        console.error('Error fetching stats:', error);
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
      } catch (error) {
        console.error('Error fetching activity:', error);
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
      href: '/dashboard/uploads',
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
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Welcome back, {userProfile?.name || 'Student'}! 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Here's what's happening with your academic resources today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Likes Received</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Papers Liked</p>
              <p className="text-2xl font-bold text-gray-900">{stats.likedPapers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-500">Live updates</span>
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
          <div className="space-y-4">
            {activity.map((item, idx) => {
              console.log(`Activity item ${idx}:`, item);
              return (
              <div key={idx} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.type === 'upload' 
                      ? 'bg-blue-100' 
                      : item.type === 'like' 
                      ? 'bg-red-100' 
                      : item.type === 'download'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}>
                    {item.type === 'upload' ? (
                      <Upload className="w-5 h-5 text-blue-600" />
                    ) : item.type === 'like' ? (
                      <Heart className="w-5 h-5 text-red-600" />
                    ) : item.type === 'download' ? (
                      <DownloadIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {item.type === 'upload' ? 'Uploaded' : item.type === 'like' ? 'Liked' : 'Downloaded'}
                    </span>
                    {item.type === 'upload' && item.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'approved' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status === 'pending' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status === 'rejected' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {item.title}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {item.date?.toDate ? item.date.toDate().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : (item.date ? new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A')}
                    </span>
                    
                    {item.type === 'upload' && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Paper uploaded
                      </span>
                    )}
                    
                    {item.type === 'like' && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Paper liked
                      </span>
                    )}
                    
                    {item.type === 'download' && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Paper downloaded
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )})}
            
            {activity.length >= 10 && (
              <div className="text-center pt-4">
                <Link
                  to="/dashboard/uploads"
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
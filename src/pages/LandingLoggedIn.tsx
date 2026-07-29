import { useAuth } from '../context/AuthContext';
import { useMeta } from '../context/MetaContext';
import { useEffect, useState } from 'react';
import { getUserPapers, getUserLikeEvents, getUserDownloads, getPapers, getPaperOfTheWeek, getSubjectCoverage } from '../services/papers';
import {
  Upload, FileText, Download, Heart, User, ChevronRight,
  BookOpen, Search, Sparkles, TrendingUp, Zap, Trophy, BarChart2
} from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';
import NudgeBanner from '../components/NudgeBanner';
import { getEarnedBadges } from '../utils/badges';
import { useCountUp } from '../hooks/useCountUp';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(date: any): string {
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (!d || isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

const activityConfig = {
  upload: { icon: Upload, color: 'bg-blue-100 text-blue-600', label: 'Uploaded' },
  like: { icon: Heart, color: 'bg-rose-100 text-rose-500', label: 'Liked' },
  download: { icon: Download, color: 'bg-emerald-100 text-emerald-600', label: 'Downloaded' },
};

const LandingLoggedIn = () => {
  const { userProfile, currentUser } = useAuth();
  const { subjects } = useMeta();
  const [stats, setStats] = useState({ totalUploads: 0, totalLikes: 0, totalDownloads: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [paperOfWeek, setPaperOfWeek] = useState<any>(null);
  const [hasPendingPaper, setHasPendingPaper] = useState(false);
  const [coveredSubjects, setCoveredSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // If uid is not yet available, don't stay loading forever
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }
      try {
        const [userPapers, likeEvents, downloads, potw] = await Promise.all([
          getUserPapers(userProfile.uid),
          getUserLikeEvents(userProfile.uid),
          getUserDownloads(userProfile.uid),
          getPaperOfTheWeek(),
        ]);
        setStats({ totalUploads: userPapers.length, totalLikes: likeEvents.length, totalDownloads: downloads.length });
        setHasPendingPaper(userPapers.some(p => (p as any).status === 'pending'));
        setPaperOfWeek(potw);
        const all = [
          ...userPapers.map(p => ({ type: 'upload', title: p.title, date: p.updatedAt || p.createdAt, paperId: p.id })),
          ...likeEvents.map(e => ({ type: 'like', title: e.title, date: e.date, paperId: e.paperId })),
          ...downloads.map(d => ({ type: 'download', title: d.title || 'Unknown', date: d.createdAt, paperId: d.id })),
        ].sort((a, b) => {
          const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return db - da;
        });
        setActivity(all.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userProfile?.uid]);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!userProfile?.course && !userProfile?.semester) return;
      setRecLoading(true);
      try {
        const papers = await getPapers({ course: userProfile.course, semester: userProfile.semester, status: 'approved' }, 4);
        setRecommended(papers);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommended();
  }, [userProfile?.course, userProfile?.semester]);

  // Subject coverage — always try; falls back gracefully
  useEffect(() => {
    const college = userProfile?.college;
    const semester = userProfile?.semester;
    if (!college || !semester) return; // No data to query — card shows fallback
    getSubjectCoverage(college, semester)
      .then(setCoveredSubjects)
      .catch(err => console.warn('[subjectCoverage] fetch failed:', err));
  }, [userProfile?.college, userProfile?.semester]);

  // Animated stat count-ups — must be before any early return (Rules of Hooks)
  const animUploads = useCountUp(stats.totalUploads);
  const animLikes = useCountUp(stats.totalLikes);
  const animDownloads = useCountUp(stats.totalDownloads);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="h-40 bg-gradient-to-br from-primary-700 to-indigo-900 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
                <Skeleton variant="circle" width={56} height={56} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
              </div>
            ))}
          </div>
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={72} />
            ))}
          </div>
          {/* Activity skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton variant="circle" width={36} height={36} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="30%" height={12} />
                </div>
                <Skeleton variant="text" width={60} height={28} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  const firstName = userProfile?.name?.split(' ')[0] || 'Student';
  const avatarUrl = currentUser?.photoURL || userProfile?.avatar || null;
  const streak = userProfile?.streak ?? 0;
  const xp = userProfile?.xp ?? 0;
  const earnedBadges = getEarnedBadges(stats, streak);

  // (useCountUp hooks moved above the early return)

  const statCards = [
    { label: 'Uploads', value: animUploads, icon: Upload, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-600', link: '/dashboard/my-uploads' },
    { label: 'Liked Papers', value: animLikes, icon: Heart, gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', iconColor: 'text-rose-500', link: '/dashboard/likes' },
    { label: 'Downloads', value: animDownloads, icon: Download, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', link: '/browse' },
  ];

  const quickActions = [
    { label: 'Upload New Paper', to: '/dashboard/upload', icon: Upload, primary: true, desc: 'Share with students' },
    { label: 'My Uploads', to: '/dashboard/my-uploads', icon: FileText, primary: false, desc: 'Manage your papers' },
    { label: 'Liked Papers', to: '/dashboard/likes', icon: Heart, primary: false, desc: 'Your saved papers' },
    { label: 'Browse Papers', to: '/browse', icon: Search, primary: false, desc: 'Explore all papers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO GREETING BANNER ── */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10 md:h-14">
            <path d="M0,30 C360,70 1080,0 1440,40 L1440,60 L0,60 Z" fill="#f9fafb" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar: Google photo → custom upload → generated gradient initial */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white/30">
              {avatarUrl
                ? <img src={avatarUrl} alt={userProfile?.name || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 via-primary-500 to-indigo-600 flex items-center justify-center">
                    {firstName && firstName !== 'Student'
                      ? <span className="text-4xl font-black text-white select-none drop-shadow">{firstName[0].toUpperCase()}</span>
                      : <User className="w-9 h-9 text-white opacity-90" />
                    }
                  </div>
                )
              }
            </div>

            {/* Greeting text */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-primary-200 text-sm font-medium">{getGreeting()}!</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{firstName} 👋</h1>
              <p className="text-primary-200 text-sm">
                {userProfile?.email}
                {userProfile?.college && <> &nbsp;•&nbsp; {userProfile.college}</>}
                {userProfile?.course && <> &nbsp;•&nbsp; {userProfile.course}</>}
                {userProfile?.semester && <> &nbsp;•&nbsp; {userProfile.semester}</>}
              </p>

              {/* Streak & XP pills */}
              <div className="flex items-center gap-2 mt-3 justify-center md:justify-start flex-wrap">
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-orange-400/20 border border-orange-300/40 text-orange-100 text-xs font-bold px-3 py-1 rounded-full">
                    🔥 {streak}-day streak
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-300/40 text-yellow-100 text-xs font-bold px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3" /> {xp} XP
                </span>
                {earnedBadges.slice(0, 2).map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Trophy className="w-3 h-3" /> {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile link */}
            <Link to="/dashboard/settings"
              className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <User className="w-4 h-4" /> View Profile
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* ── NUDGE BANNER ── */}
        <NudgeBanner
          totalUploads={stats.totalUploads}
          totalDownloads={stats.totalDownloads}
          streak={streak}
          hasPendingPaper={hasPendingPaper}
        />

        {/* ── PAPER OF THE WEEK ── */}
        {paperOfWeek && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">📄 Paper of the Week</p>
              <p className="text-gray-900 font-semibold truncate">{paperOfWeek.title}</p>
              <p className="text-xs text-gray-500">{paperOfWeek.college} · {paperOfWeek.semester} · {paperOfWeek.downloadCount ?? 0} downloads</p>
            </div>
            <Link
              to={`/browse?college=${encodeURIComponent(paperOfWeek.college)}&semester=${encodeURIComponent(paperOfWeek.semester)}`}
              className="shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((s) => (
            <Link to={s.link} key={s.label}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className={`w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-7 h-7 ${s.iconColor}`} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-gray-500 text-sm font-medium">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── SUBJECT COVERAGE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-primary-500" />
            <p className="text-sm font-bold text-gray-700">
              {userProfile?.college && userProfile?.semester
                ? `${userProfile.semester} — Subject Coverage at ${userProfile.college}`
                : 'Subject Coverage'}
            </p>
          </div>

          {/* Case 1: Profile incomplete */}
          {(!userProfile?.college || !userProfile?.semester) && (
            <div className="text-sm text-gray-400">
              📝 Set your <strong>College</strong> and <strong>Semester</strong> in{' '}
              <a href="/dashboard/settings" className="text-primary-600 underline font-medium">Settings</a>{' '}
              to see subject coverage for your semester.
            </div>
          )}

          {/* Case 2: Profile set but no papers yet */}
          {userProfile?.college && userProfile?.semester && coveredSubjects.length === 0 && (
            <p className="text-sm text-gray-400">No approved papers yet for your semester. Be the first to upload! 🚀</p>
          )}

          {/* Case 3: Papers exist — show exact X/Y count */}
          {userProfile?.college && userProfile?.semester && coveredSubjects.length > 0 && (() => {
            const total = subjects.length > 0 ? subjects.length : 12;
            const pct = Math.min(100, Math.round((coveredSubjects.length / total) * 100));
            const remaining = Math.max(0, total - coveredSubjects.length);
            return (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-bold text-primary-600">{coveredSubjects.length}/{total}</span>{' '}
                  subjects covered
                  {remaining > 0
                    ? ` — upload yours to complete it! 🚀`
                    : ' — 🎉 Full coverage achieved!'}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {coveredSubjects.map(s => (
                    <span key={s} className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{pct}% complete</p>
              </>
            );
          })()}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.to}
                className={`group flex items-center gap-4 rounded-2xl px-6 py-5 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.primary
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-indigo-700 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${action.primary ? 'bg-white/20' : 'bg-primary-50'}`}>
                  <action.icon className={`w-5 h-5 ${action.primary ? 'text-white' : 'text-primary-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{action.label}</div>
                  <div className={`text-xs ${action.primary ? 'text-primary-100' : 'text-gray-400'}`}>{action.desc}</div>
                </div>
                <ChevronRight className={`w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform ${action.primary ? 'text-white' : 'text-gray-400'}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── RECOMMENDED PAPERS ── */}
        {(userProfile?.course || userProfile?.semester) && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" /> Recommended for You
            </h2>
            {recLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rect" width="100%" height={90} />)}
              </div>
            ) : recommended.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                No recommendations yet — upload or explore papers to get personalised suggestions!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map(paper => (
                  <Link to={`/browse?paper=${paper.id}`} key={paper.id}
                    className="group bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2">
                    <div className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors truncate">{paper.title}</div>
                    <div className="flex flex-wrap gap-2">
                      {paper.subject && <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">{paper.subject}</span>}
                      {paper.course && <span className="bg-violet-50 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">{paper.course}</span>}
                      {paper.semester && <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{paper.semester}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {paper.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-500" /> {paper.downloadCount || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY TIMELINE ── */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {activity.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                No recent activity yet. Upload or explore papers to get started!
              </div>
            ) : (
              activity.map((act, i) => {
                const cfg = activityConfig[act.type as keyof typeof activityConfig] || activityConfig.download;
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <cfg.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{act.title}</div>
                      <div className="text-xs text-gray-400 capitalize">{cfg.label}</div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      {timeAgo(act.date)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingLoggedIn;
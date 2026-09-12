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
    <div className="min-h-screen bg-[#f8faff]">

      {/* ── HERO GREETING BANNER ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#101b38] to-[#0b1226] text-white border-b border-slate-800/80 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            {/* Avatar: Google photo → custom upload → generated gradient initial */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-xl ring-4 ring-white/10 border border-white/20">
              {avatarUrl
                ? <img src={avatarUrl} alt={userProfile?.name || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-primary-600 to-sky-400 flex items-center justify-center">
                    {firstName && firstName !== 'Student'
                      ? <span className="text-2xl sm:text-3xl font-black text-white select-none drop-shadow-sm">{firstName[0].toUpperCase()}</span>
                      : <User className="w-8 h-8 text-white/90" />
                    }
                  </div>
                )
              }
            </div>

            {/* Greeting text */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-primary-200 backdrop-blur-md mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{getGreeting()}!</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">{firstName} 👋</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-0.5">
                <span>{userProfile?.email}</span>
                {userProfile?.college && <><span>•</span><span>{userProfile.college}</span></>}
                {userProfile?.course && <><span>•</span><span>{userProfile.course}</span></>}
                {userProfile?.semester && <><span>•</span><span>{userProfile.semester}</span></>}
              </p>

              {/* Streak & XP pills */}
              <div className="flex items-center gap-2 mt-3.5 justify-center sm:justify-start flex-wrap">
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-2xs">
                    🔥 {streak}-day streak
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-amber-300" /> {xp} XP
                </span>
                {earnedBadges.slice(0, 2).map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" /> {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile link */}
            <Link to="/dashboard/settings"
              className="shrink-0 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-md transition-all shadow-xs hover:shadow-sm">
              <User className="w-4 h-4 text-primary-300" /> View Profile
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* ── NUDGE BANNER ── */}
        <NudgeBanner
          totalUploads={stats.totalUploads}
          totalDownloads={stats.totalDownloads}
          streak={streak}
          hasPendingPaper={hasPendingPaper}
        />

        {/* ── PAPER OF THE WEEK ── */}
        {paperOfWeek && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-xs">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm text-white">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">📄 Paper of the Week</p>
              <p className="text-slate-900 font-bold text-sm sm:text-base truncate">{paperOfWeek.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{paperOfWeek.college} · {paperOfWeek.semester} · {paperOfWeek.downloadCount ?? 0} downloads</p>
            </div>
            <Link
              to={`/browse?college=${encodeURIComponent(paperOfWeek.college)}&semester=${encodeURIComponent(paperOfWeek.semester)}`}
              className="shrink-0 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {statCards.map((s) => (
            <Link to={s.link} key={s.label}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-6 hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">{s.value}</div>
                <div className="text-slate-500 text-xs sm:text-sm font-medium mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── SUBJECT COVERAGE ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {userProfile?.college && userProfile?.semester
                    ? `${userProfile.semester} Subject Coverage`
                    : 'Semester Subject Coverage'}
                </h3>
                <p className="text-xs text-slate-500">
                  {userProfile?.college || 'Set your college in settings'}
                </p>
              </div>
            </div>
            {userProfile?.college && userProfile?.semester && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto">
                {userProfile.semester}
              </span>
            )}
          </div>

          {/* Case 1: Profile incomplete */}
          {(!userProfile?.college || !userProfile?.semester) && (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4 text-sm text-slate-600 flex items-center justify-between gap-4">
              <span>Select your <strong>College</strong> and <strong>Semester</strong> in profile settings to track syllabus coverage.</span>
              <Link to="/dashboard/settings" className="shrink-0 text-xs font-bold text-primary-600 hover:text-primary-700 underline">Update →</Link>
            </div>
          )}

          {/* Case 2: Profile set but no papers yet (0%) */}
          {userProfile?.college && userProfile?.semester && coveredSubjects.length === 0 && (
            <div className="rounded-xl bg-gradient-to-r from-primary-50/60 to-indigo-50/60 border border-primary-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Be the first contributor for {userProfile.semester}!</p>
                <p className="text-xs text-slate-600 mt-1">No question papers uploaded yet for your semester subjects. Share your papers to earn 50 XP & help classmates.</p>
              </div>
              <Link
                to="/dashboard/upload"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
              >
                <Upload className="w-3.5 h-3.5" /> Upload First Paper
              </Link>
            </div>
          )}

          {/* Case 3: Papers exist */}
          {userProfile?.college && userProfile?.semester && coveredSubjects.length > 0 && (() => {
            const total = subjects.length > 0 ? subjects.length : 12;
            const pct = Math.min(100, Math.round((coveredSubjects.length / total) * 100));
            const remaining = Math.max(0, total - coveredSubjects.length);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    <span className="text-primary-600 font-bold">{coveredSubjects.length}</span> of {total} subjects covered
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">{pct}% complete</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {coveredSubjects.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-200/60 px-2.5 py-1 rounded-lg font-medium">
                      ✓ {s}
                    </span>
                  ))}
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-slate-500">
                    Missing {remaining} subject{remaining > 1 ? 's' : ''} — <Link to="/dashboard/upload" className="text-primary-600 font-semibold hover:underline">upload to complete coverage!</Link>
                  </p>
                )}
              </div>
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
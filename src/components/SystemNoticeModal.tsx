import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Upload, X, ShieldAlert, Sparkles,
  ArrowRight, CheckCircle2, Trash2, Plus,
  Wallet, Coins, HelpCircle, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseDb';
import toast from 'react-hot-toast';

export interface SystemNoticeItem {
  id: string;
  title: string;
  content: string;
  tag: 'Update' | 'Notice' | 'Important' | 'Rewards' | 'Feature';
  dateStr?: string;
  createdAt?: any;
  link?: string;
  linkText?: string;
}

const DEFAULT_NOTICES: SystemNoticeItem[] = [
  {
    id: 'notice-1',
    title: 'Tripura University & MBBU Exam Question Papers Live',
    content: 'Full archives of previous year semester question papers for Maharaja Bir Bikram University (MBBU) and Tripura University (TU) across B.A, B.Sc, B.Com, and BCA are now updated and verified. Read and download instantly on mobile or PC with zero waiting time.',
    tag: 'Update',
    dateStr: 'Live',
    link: '/browse',
    linkText: 'Browse All Papers'
  },
  {
    id: 'notice-2',
    title: 'Student Earning Program: Upload Papers & Earn Real Cash via UPI',
    content: 'Help fellow students prepare for exams and earn real rewards. Get 50 to 100 Reward Coins for every approved question paper. Redeem coins directly into your bank account via UPI (GPay, PhonePe, Paytm) or convert them into Amazon Gift Vouchers.',
    tag: 'Rewards',
    dateStr: 'Active',
    link: '/upload',
    linkText: 'Start Uploading Now'
  },
  {
    id: 'notice-3',
    title: 'Fast Mobile PDF Viewer & Offline Save Mode',
    content: 'Preview complete question papers directly within your browser without wasting data or device storage. Clean reading experience optimized for all college students across Tripura.',
    tag: 'Feature',
    dateStr: 'Live',
    link: '/browse',
    linkText: 'Explore Viewer'
  }
];

interface SystemNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseToday?: () => void;
}

export default function SystemNoticeModal({ isOpen, onClose, onCloseToday }: SystemNoticeModalProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  // Earning & Upload is placed at the top and set as the default view
  const [activeTab, setActiveTab] = useState<'earning' | 'notice'>('earning');
  const [notices, setNotices] = useState<SystemNoticeItem[]>(DEFAULT_NOTICES);
  const [showAdminAddForm, setShowAdminAddForm] = useState(false);

  // Admin form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<'Update' | 'Notice' | 'Important' | 'Rewards' | 'Feature'>('Notice');
  const [newLink, setNewLink] = useState('');
  const [newLinkText, setNewLinkText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time listener for notices from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'system_notices'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const liveNotices: SystemNoticeItem[] = snap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data()
            })) as SystemNoticeItem[];
            setNotices(liveNotices);
          } else {
            setNotices(DEFAULT_NOTICES);
          }
        },
        (error) => {
          console.warn('Could not fetch system_notices, using defaults:', error);
          setNotices(DEFAULT_NOTICES);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Notice listener initialization failed:', e);
    }
  }, []);

  if (!isOpen) return null;

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'system_notices'), {
        title: newTitle.trim(),
        content: newContent.trim(),
        tag: newTag,
        link: newLink.trim() || null,
        linkText: newLinkText.trim() || null,
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: serverTimestamp(),
        authorEmail: userProfile?.email || 'admin'
      });
      toast.success('Notice published successfully!');
      setNewTitle('');
      setNewContent('');
      setNewLink('');
      setNewLinkText('');
      setShowAdminAddForm(false);
    } catch (error: any) {
      console.error('Error adding notice:', error);
      toast.error(error.message || 'Failed to post notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteDoc(doc(db, 'system_notices', noticeId));
      toast.success('Notice deleted');
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const handleCloseToday = () => {
    if (onCloseToday) {
      onCloseToday();
    } else {
      try {
        localStorage.setItem('sv_notice_dismissed_today', new Date().toDateString());
      } catch {
        // safe fallback
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[640px] bg-[#161922] text-slate-200 rounded-2xl border border-slate-700/70 shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-notice-title"
      >
        {/* ── Top Header Bar: Clean Sans Title & Segmented Pills (Reference Matching) ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800 shrink-0 bg-[#161922]">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">📢</span>
            <h2 id="system-notice-title" className="text-base font-bold tracking-normal text-white">
              System Notice
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented Pill Tabs: Earning on the top/first */}
            <div className="flex items-center bg-[#0e1118] p-0.5 rounded-lg border border-slate-800/90">
              <button
                type="button"
                onClick={() => setActiveTab('earning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'earning'
                    ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💰</span>
                <span>Earn &amp; Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'notice'
                    ? 'bg-[#2b3345] text-white border border-slate-600/50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notice</span>
              </button>
            </div>

            {/* Close Icon Button */}
            <button
              onClick={onClose}
              aria-label="Close Notice"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── TAB: EARN BY UPLOADING PAPERS (PRIMARY MOTIVE) ── */}
          {/* ══════════════════════════════════════════════════════ */}
          {activeTab === 'earning' && (
            <div className="space-y-4">
              {/* High Impact Hero Banner with Glowing Emojis */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary-600/15 to-emerald-500/10 border border-amber-500/40 p-4 sm:p-5 text-slate-100 shadow-lg shadow-amber-500/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                      <span>🔥</span> Contributor Rewards Live
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      💰 Earn ₹ Cash by Uploading Question Papers! 🚀
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                      Have exam papers from college or university? Snap photos with your phone, upload in 30 seconds, and get rewarded directly to your UPI (GPay, PhonePe, Paytm)!
                    </p>
                  </div>
                  <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 items-center justify-center text-3xl shadow-inner shrink-0">
                    💸
                  </div>
                </div>

                {/* Big Direct Action Button Right in Hero Banner */}
                <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                    <span>⚡ Instant Approval</span>
                    <span className="text-slate-600">•</span>
                    <span>🪙 +50 to +100 Coins/Paper</span>
                    <span className="text-slate-600">•</span>
                    <span>📲 UPI Cashout</span>
                  </div>
                  <Link
                    to="/upload"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
                  >
                    <span>📤 Upload Paper Now</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                </div>
              </div>

              {/* 3 Step Visual Earning Guide */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <span>🎯</span> How to Upload &amp; Earn in 3 Easy Steps
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Step 1 */}
                  <div className="p-3 bg-[#11141c] border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">📸</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">STEP 1</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Snap or Pick PDF</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Take clear photos of your exam paper or select a PDF from your phone or PC.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-[#11141c] border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🏷️</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">STEP 2</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Select Course &amp; Sem</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Pick University (MBBU/TU), Subject, Semester &amp; Year. Takes only 30 seconds!
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-[#11141c] border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">💵</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">STEP 3</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Get Paid to UPI</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Earn coins automatically on approval. Cash out to GPay, PhonePe or Amazon!
                    </p>
                  </div>
                </div>
              </div>

              {/* Coin Value & Earning Table with Rich Emojis */}
              <div className="p-3.5 bg-[#11141c] border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🪙</span> Reward Coin Valuation Chart
                  </p>
                  <span className="text-[11px] text-amber-400 font-semibold">100 Coins = Real Cash Transfer</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-[#181c26] border border-slate-800/80 rounded-lg text-center space-y-0.5">
                    <div className="text-base">📄</div>
                    <span className="block text-[11px] text-slate-400">UG Semester</span>
                    <span className="block font-black text-amber-400 text-xs">+50 Coins</span>
                  </div>

                  <div className="p-2.5 bg-[#181c26] border border-slate-800/80 rounded-lg text-center space-y-0.5">
                    <div className="text-base">🎓</div>
                    <span className="block text-[11px] text-slate-400">PG / MA / MSc</span>
                    <span className="block font-black text-amber-400 text-xs">+100 Coins</span>
                  </div>

                  <div className="p-2.5 bg-[#181c26] border border-slate-800/80 rounded-lg text-center space-y-0.5">
                    <div className="text-base">🔥</div>
                    <span className="block text-[11px] text-slate-400">Daily Streak</span>
                    <span className="block font-black text-primary-400 text-xs">+10 Coins</span>
                  </div>

                  <div className="p-2.5 bg-[#181c26] border border-slate-800/80 rounded-lg text-center space-y-0.5">
                    <div className="text-base">🏦</div>
                    <span className="block text-[11px] text-slate-400">Payout Mode</span>
                    <span className="block font-black text-emerald-400 text-xs">UPI / GPay</span>
                  </div>
                </div>
              </div>

              {/* What Papers Can You Upload? */}
              <div className="p-3 bg-[#11141c] border border-slate-800 rounded-xl space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>📥</span> Accepted Question Papers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>MBBU Semester Exams (BA, BSc, BCom, BCA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tripura University (General &amp; Honors)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Master's Degrees (MA, MSc, MCom)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mid-term / Internal / Practical Question Papers</span>
                  </div>
                </div>
              </div>

              {/* High-Converting Main Upload CTA Banner */}
              <div className="pt-1">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full group flex items-center justify-center gap-3 py-3 px-5 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 hover:from-primary-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-primary-600/30 transition-all active:scale-98"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">📤</span>
                  <span>Click Here to Load &amp; Upload Question Paper</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-center text-[10px] text-slate-500 mt-1.5">
                  Supported formats: PDF, JPEG, PNG (up to 25MB) • No complicated sign-up needed
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── TAB: SYSTEM NOTICES & ANNOUNCEMENTS ── */}
          {/* ══════════════════════════════════════════════════════ */}
          {activeTab === 'notice' && (
            <div className="space-y-4">
              {/* Pinned Earning Reminder Banner at Top of Notice Tab */}
              <div className="p-3 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl select-none">💰</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Have Question Papers? Earn Cash via UPI!</h4>
                    <p className="text-[11px] text-slate-300">Earn +50 to +100 Coins for every paper you upload.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('earning')}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 transition-colors shadow-xs"
                >
                  See How 🚀
                </button>
              </div>

              {/* Admin Notice Manager Toggle */}
              {isAdmin && (
                <div className="p-3 bg-[#202534] border border-amber-500/40 rounded-xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Admin Notice Publisher
                    </span>
                    <button
                      onClick={() => setShowAdminAddForm(!showAdminAddForm)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {showAdminAddForm ? 'Cancel' : 'Post New Notice'}
                    </button>
                  </div>

                  {showAdminAddForm && (
                    <form onSubmit={handleCreateNotice} className="mt-3 pt-3 border-t border-slate-700/70 space-y-2.5 text-slate-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Title</label>
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. 2025 MBBU Semester Papers Added"
                          className="w-full px-3 py-1.5 bg-[#0f121a] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Content</label>
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          rows={3}
                          placeholder="Write announcement details..."
                          className="w-full px-3 py-1.5 bg-[#0f121a] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category Tag</label>
                          <select
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-[#0f121a] border border-slate-700 rounded-lg text-xs text-white outline-none"
                          >
                            <option value="Notice">Notice</option>
                            <option value="Update">Update</option>
                            <option value="Rewards">Rewards</option>
                            <option value="Important">Important</option>
                            <option value="Feature">Feature</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Action Link (Optional)</label>
                          <input
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="/upload or /browse"
                            className="w-full px-3 py-1.5 bg-[#0f121a] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Publishing...' : 'Publish Notice to All Users'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* List of Notices matching the reference format */}
              <div className="space-y-4">
                {notices.map((item, index) => (
                  <div key={item.id || index} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">📢</span>
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {index + 1}. {item.title}
                        </h3>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotice(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors shrink-0"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                      {item.content}
                    </p>

                    {item.link && (
                      <div className="pl-6 pt-1">
                        <Link
                          to={item.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                        >
                          <span>{item.linkText || 'Learn more'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {index < notices.length - 1 && (
                      <hr className="border-slate-800 my-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Bottom Bar: Two Dark Pill Buttons on Right (Exact Match to Screenshot) ── */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-800 bg-[#12151d] shrink-0">
          <button
            type="button"
            onClick={handleCloseToday}
            className="px-4 py-1.5 bg-[#2b3345] hover:bg-[#374156] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            Close Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2b3345] hover:bg-[#374156] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}

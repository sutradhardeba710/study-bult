import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Upload, X, ShieldAlert, Sparkles,
  ArrowRight, CheckCircle2, Trash2, Plus,
  Wallet, Coins, Camera, Tag, Banknote,
  Flame, GraduationCap, FileText, ExternalLink
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

  // Default tab is Earning & Upload so students immediately see how to earn cash
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

  const getTagBadgeClass = (tag: string) => {
    switch (tag) {
      case 'Important':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Rewards':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Feature':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[650px] bg-white text-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-notice-title"
      >
        {/* ── Top Header Bar: Clean Sans Title & Segmented Tab Switcher (Fresh Light Design) ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-3.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 id="system-notice-title" className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              System Notice
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented Pill Tabs: Light Mode */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab('earning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'earning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💰</span>
                <span>Earn &amp; Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'notice'
                    ? 'bg-white text-slate-900 border border-slate-200/90 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-primary-600" />
                <span>Notice</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Notice"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans bg-slate-50/40">

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── TAB: EARN BY UPLOADING PAPERS (PRIMARY MOTIVE) ── */}
          {/* ══════════════════════════════════════════════════════ */}
          {activeTab === 'earning' && (
            <div className="space-y-4">
              {/* Vibrant Gold/Amber Hero Banner in Light Mode */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 border border-amber-200/90 p-4 sm:p-5 text-slate-800 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                      <span>🔥</span> Contributor Rewards Program
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      💰 Earn Real Cash by Uploading Question Papers! 🚀
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                      Have exam question papers from your college or university? Snap photos with your phone, upload in 30 seconds, and get rewarded directly to your UPI (Google Pay, PhonePe, Paytm)!
                    </p>
                  </div>
                  <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-300/60 items-center justify-center text-3xl shadow-xs shrink-0">
                    💸
                  </div>
                </div>

                {/* Hero Quick Highlights & Fast CTA */}
                <div className="mt-3.5 pt-3 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1">⚡ Instant 24h Approval</span>
                    <span className="text-amber-300">•</span>
                    <span className="flex items-center gap-1">🪙 +50 to +100 Coins/Paper</span>
                    <span className="text-amber-300">•</span>
                    <span className="flex items-center gap-1">📲 Direct UPI Cashout</span>
                  </div>
                  <Link
                    to="/upload"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md shadow-amber-500/20 transition-all active:scale-95 shrink-0"
                  >
                    <span>📤 Upload Paper Now</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                </div>
              </div>

              {/* 3 Step Visual Earning Guide in Light Mode */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <span>🎯</span> How to Upload &amp; Earn in 3 Easy Steps
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Step 1 */}
                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        STEP 1
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Snap or Pick PDF</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Take clear photos of your exam paper or select a PDF from your phone or PC.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs hover:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                        STEP 2
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Choose Course &amp; Sem</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Select University (MBBU/TU), Subject, Semester &amp; Year in 30 seconds!
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        STEP 3
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Get Paid to UPI</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Earn coins automatically on approval. Cash out to GPay, PhonePe or Amazon!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Coin Valuation Grid */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>Reward Coin Valuation Breakdown</span>
                  </p>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    100 Coins = Real Cash
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-xl text-center space-y-0.5">
                    <FileText className="w-4 h-4 text-primary-600 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-500">UG Semester</span>
                    <span className="block font-black text-amber-600 text-xs">+50 Coins</span>
                  </div>

                  <div className="p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-xl text-center space-y-0.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-500">PG / MA / MSc</span>
                    <span className="block font-black text-amber-600 text-xs">+100 Coins</span>
                  </div>

                  <div className="p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-xl text-center space-y-0.5">
                    <Flame className="w-4 h-4 text-orange-500 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-500">Daily Streak</span>
                    <span className="block font-black text-primary-600 text-xs">+10 Coins</span>
                  </div>

                  <div className="p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-xl text-center space-y-0.5">
                    <Wallet className="w-4 h-4 text-emerald-600 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-500">Payout Mode</span>
                    <span className="block font-black text-emerald-600 text-xs">UPI / GPay</span>
                  </div>
                </div>
              </div>

              {/* What Papers Can You Upload? Checklist */}
              <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accepted Question Papers</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
                    <span>MBBU Semester Exams (BA, BSc, BCom, BCA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
                    <span>Tripura University (General &amp; Honors)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
                    <span>Master's Degrees (MA, MSc, MCom)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
                    <span>Mid-term / Internal / Practical Exam Papers</span>
                  </div>
                </div>
              </div>

              {/* HIGH-CONVERTING MAIN UPLOAD CTA BUTTON */}
              <div className="pt-1">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full group flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-98"
                >
                  <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>Click Here to Load &amp; Upload Question Paper</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
                  ⚡ Takes under 1 minute • Mobile photos accepted • Earn coins immediately on approval
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
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl select-none">💰</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Have Question Papers? Earn Cash via UPI!</h4>
                    <p className="text-[11px] text-slate-600">Earn +50 to +100 Coins for every paper you upload.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('earning')}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs"
                >
                  See How 🚀
                </button>
              </div>

              {/* Admin Notice Manager Toggle */}
              {isAdmin && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-700" /> Admin Notice Publisher
                    </span>
                    <button
                      onClick={() => setShowAdminAddForm(!showAdminAddForm)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {showAdminAddForm ? 'Cancel' : 'Post New Notice'}
                    </button>
                  </div>

                  {showAdminAddForm && (
                    <form onSubmit={handleCreateNotice} className="mt-3 pt-3 border-t border-amber-200/60 space-y-2.5 text-slate-700">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">Title</label>
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. 2025 MBBU Semester Papers Added"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">Content</label>
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          rows={3}
                          placeholder="Write announcement details..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">Category Tag</label>
                          <select
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                          >
                            <option value="Notice">Notice</option>
                            <option value="Update">Update</option>
                            <option value="Rewards">Rewards</option>
                            <option value="Important">Important</option>
                            <option value="Feature">Feature</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">Action Link (Optional)</label>
                          <input
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="/upload or /browse"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {submitting ? 'Publishing...' : 'Publish Notice to All Users'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* List of Notices */}
              <div className="space-y-3">
                {notices.map((item, index) => (
                  <div key={item.id || index} className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">📢</span>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTagBadgeClass(item.tag)}`}>
                          {item.tag}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteNotice(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                      {item.content}
                    </p>

                    {item.link && (
                      <div className="pl-6 pt-1">
                        <Link
                          to={item.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        >
                          <span>{item.linkText || 'Learn more'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Bottom Bar: Light Mode Pill Buttons ── */}
        <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={handleCloseToday}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-98"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}

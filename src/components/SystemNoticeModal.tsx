import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Upload, X, ShieldAlert, Sparkles,
  ArrowRight, CheckCircle2, Trash2, Plus, ExternalLink,
  Wallet, Coins, HelpCircle
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

  const [activeTab, setActiveTab] = useState<'notice' | 'earning'>('notice');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[620px] bg-[#1a1d26] text-slate-200 rounded-2xl border border-slate-700/70 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-notice-title"
      >
        {/* ── Modal Header: Title on left, segmented pill tabs & close on right (Matching Reference Image) ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800/80 shrink-0">
          <h2 id="system-notice-title" className="text-base font-bold tracking-normal text-white">
            System Notice
          </h2>

          <div className="flex items-center gap-2">
            {/* Segmented Pill Tabs */}
            <div className="flex items-center bg-[#13161f] p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'notice'
                    ? 'bg-[#2b3345] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('earning')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'earning'
                    ? 'bg-[#2b3345] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Earn &amp; Upload</span>
              </button>
            </div>

            {/* Close Cross Button */}
            <button
              onClick={onClose}
              aria-label="Close Notice"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {/* TAB 1: SYSTEM NOTICES & ANNOUNCEMENTS */}
          {activeTab === 'notice' && (
            <div className="space-y-4">
              {/* Admin Notice Manager Toggle */}
              {isAdmin && (
                <div className="p-3 bg-[#222838] border border-amber-500/40 rounded-xl text-xs">
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
                          className="w-full px-3 py-1.5 bg-[#13161f] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Content</label>
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          rows={3}
                          placeholder="Write announcement details..."
                          className="w-full px-3 py-1.5 bg-[#13161f] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category Tag</label>
                          <select
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-[#13161f] border border-slate-700 rounded-lg text-xs text-white outline-none"
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
                            className="w-full px-3 py-1.5 bg-[#13161f] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none"
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

              {/* List of Notices */}
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

              {/* Quick Earning Teaser Banner inside Notice tab */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-indigo-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Have Question Papers from Previous Exams?</h4>
                    <p className="text-[11px] text-slate-400">Earn +50 to +100 Coins per paper. Redeem cash via UPI.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('earning')}
                  className="px-3 py-1.5 bg-[#2b3345] hover:bg-[#384257] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EARNING & PAPER UPLOAD PROGRAM */}
          {activeTab === 'earning' && (
            <div className="space-y-4">
              {/* Header intro */}
              <div className="p-3.5 bg-[#141822] border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Student Contributor &amp; Earning Program</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded text-[10px] font-bold uppercase tracking-wider">
                    Instant Rewards
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Study Volte rewards students for building the largest open academic archive in Tripura. Help classmates succeed and get compensated for your verified question papers.
                </p>
              </div>

              {/* 3 Steps to Earn */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">How It Works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#13161f] border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">1</span>
                      <h4 className="text-xs font-bold text-white">Scan or Snap</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Take clear photos or create a PDF of your semester exam paper.
                    </p>
                  </div>

                  <div className="p-3 bg-[#13161f] border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">2</span>
                      <h4 className="text-xs font-bold text-white">Upload &amp; Tag</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Select University, Course, Semester &amp; Year. Takes only 30 seconds.
                    </p>
                  </div>

                  <div className="p-3 bg-[#13161f] border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">3</span>
                      <h4 className="text-xs font-bold text-white">Get Paid</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Receive coins on approval. Cash out to GPay, PhonePe or Amazon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coin Value Chart */}
              <div className="p-3 bg-[#13161f] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Reward Coin Breakdown
                  </p>
                  <span className="text-[11px] text-slate-400">100 Coins = Cash Payout</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#1a1e2a] rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Verified UG Paper</span>
                    <span className="font-bold text-amber-400">+50 Coins</span>
                  </div>
                  <div className="p-2 bg-[#1a1e2a] rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Rare / PG Paper</span>
                    <span className="font-bold text-amber-400">+100 Coins</span>
                  </div>
                  <div className="p-2 bg-[#1a1e2a] rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Daily Streak Bonus</span>
                    <span className="font-bold text-primary-400">+10 Coins</span>
                  </div>
                  <div className="p-2 bg-[#1a1e2a] rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Payout Channels</span>
                    <span className="font-bold text-emerald-400">UPI / Amazon</span>
                  </div>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upload Checklist for Fast Approval</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Good lighting, all question numbers and text readable.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Include all pages of the question paper in order.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>PDF or JPEG/PNG files are supported up to 25MB.</span>
                  </div>
                </div>
              </div>

              {/* DIRECT CALL TO ACTION BUTTON: LOAD PAPER */}
              <div className="pt-2">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>Load &amp; Upload Question Paper Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Bottom Bar: Two Dark Pill Buttons on Right (Exact Match to Screenshot) ── */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-800/80 bg-[#161922] shrink-0">
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

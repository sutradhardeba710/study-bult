import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Megaphone, Coins, Upload, X, ShieldAlert, Sparkles,
  ArrowRight, CheckCircle2, Clock, Trash2, Plus, ExternalLink,
  Wallet, Gift, FileText, ChevronRight
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
    id: 'default-1',
    title: 'Tripura University & MBBU Exam Archives Live',
    content: 'Over 200+ previous year semester question papers across B.A, B.Sc, B.Com, and BCA have been verified and added to the open vault. All papers are completely free to read and download without ads.',
    tag: 'Update',
    dateStr: 'Recent',
    link: '/browse',
    linkText: 'Explore Papers'
  },
  {
    id: 'default-2',
    title: 'Student Earning Program: Upload Papers & Earn Coins',
    content: 'Earn 50 reward coins for every approved question paper you contribute. Accumulate coins and request direct cashouts to your UPI (Google Pay, PhonePe, Paytm) or Amazon Gift Cards.',
    tag: 'Rewards',
    dateStr: 'Active',
    link: '/upload',
    linkText: 'Upload & Earn'
  },
  {
    id: 'default-3',
    title: 'Fast PDF Viewer & Mobile Reading Mode',
    content: 'You can now preview and study previous year question papers directly inside your browser on both mobile and desktop without using up storage.',
    tag: 'Feature',
    dateStr: 'Live',
    link: '/browse',
    linkText: 'Try Viewer'
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

  const [activeTab, setActiveTab] = useState<'notices' | 'earnings' | 'upload'>('notices');
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

  const getTagBadgeClass = (tag: string) => {
    switch (tag) {
      case 'Important':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Rewards':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Update':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Feature':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-notice-title"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <h2 id="system-notice-title" className="text-base font-black tracking-tight text-slate-900">
                System Notice &amp; Updates
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Notice"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-white border-b border-slate-100 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'notices'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notices &amp; Updates</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{notices.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'earnings'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Earning &amp; Rewards</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Guidelines</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ── TAB 1: SYSTEM NOTICES ── */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              {/* Admin Post Action */}
              {isAdmin && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Admin Notice Manager
                    </span>
                    <button
                      onClick={() => setShowAdminAddForm(!showAdminAddForm)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {showAdminAddForm ? 'Cancel' : 'Post New Notice'}
                    </button>
                  </div>

                  {showAdminAddForm && (
                    <form onSubmit={handleCreateNotice} className="mt-3 pt-3 border-t border-amber-200/60 space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Title</label>
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. MBBU 2nd Sem Results & Papers Live"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Badge Tag</label>
                          <select
                            value={newTag}
                            onChange={(e: any) => setNewTag(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-500"
                          >
                            <option value="Notice">Notice</option>
                            <option value="Update">Update</option>
                            <option value="Important">Important</option>
                            <option value="Rewards">Rewards</option>
                            <option value="Feature">Feature</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Link (Optional)</label>
                          <input
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="/browse or /upload"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Content</label>
                        <textarea
                          rows={3}
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          placeholder="Write the full update message..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
                      >
                        {submitting ? 'Publishing...' : 'Publish System Notice'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Notices List */}
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="group relative p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-primary-200 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTagBadgeClass(n.tag)}`}>
                          {n.tag}
                        </span>
                        {n.dateStr && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {n.dateStr}
                          </span>
                        )}
                      </div>

                      {isAdmin && n.id && !n.id.startsWith('default-') && (
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {n.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {n.content}
                    </p>

                    {n.link && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                        <Link
                          to={n.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                        >
                          <span>{n.linkText || 'Learn more'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: EARNING DETAILS & REWARDS ── */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary-500/10 to-indigo-500/10 border border-amber-200/80 p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Student Rewards &amp; Earning System</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Study Volte rewards student contributors with coins for uploading previous year question papers. Accumulate coins and cash them out directly to your bank account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Per Approved Paper</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-black">+50 Coins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload any college/university previous year exam paper. Coins awarded as soon as reviewed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Daily Login Streak</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-xs font-black">+10 Coins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Visit the question paper library daily to claim streak bonuses in your dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Rare / PG Paper Bonus</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-black">+100 Coins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Special rewards for missing Master’s papers (MA, MSc), older archives (&lt;2020), or complete sets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Cashout Options</span>
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-md text-xs font-black">UPI &amp; Gift Cards</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Withdraw directly to GPay, PhonePe, Paytm UPI ID, or convert to Amazon voucher cards.
                  </p>
                </div>
              </div>

              {/* CTA to view user's wallet / rewards */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ready to check your rewards?</p>
                  <p className="text-[11px] text-slate-500">View your earned balance and transaction history.</p>
                </div>
                {userProfile ? (
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>View Dashboard &amp; Coins</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
                  >
                    <span>Create Free Account (+10 Coins)</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: UPLOAD GUIDELINES & LOAD PAPER ── */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-bold">Paper Upload Guidelines</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To ensure fellow students get readable and accurate study materials, please follow these simple checklist points before uploading.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { title: 'Legible Scans or Photos', desc: 'Ensure all pages are well-lit, not blurry, and text can be clearly read.' },
                  { title: 'Correct Details', desc: 'Specify the exact University/College, Course (BA, BSc, MA), Semester, and Year.' },
                  { title: 'All Pages in Single PDF', desc: 'If the paper has multiple pages, combine them into one sequential PDF or multi-page upload.' },
                  { title: '24-Hour Verification', desc: 'Our student moderation team verifies each paper within 24 hours. Once approved, coins are credited to your account.' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Upload CTA Button */}
              <div className="pt-2">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>Open Paper Upload Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar (Matching User's Reference) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onCloseToday || onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}

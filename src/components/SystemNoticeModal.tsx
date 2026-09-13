import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Upload, X, ShieldAlert, Sparkles,
  ArrowRight, Trash2, Plus,
  Coins, Camera, Tag,
  GraduationCap, FileText, IndianRupee,
  Smartphone, Zap, ShieldCheck
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
    content: 'Help fellow students prepare for exams and earn real cash. Get ₹15 to ₹50 cash for every approved question paper. Payouts sent directly to your UPI ID (Google Pay, PhonePe, Paytm) within 24 hours.',
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

  // Default tab is Earning so students immediately see the cash opportunity
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs sv-notice-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[620px] bg-white text-slate-800 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/25 overflow-hidden flex flex-col max-h-[92vh] sv-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-notice-title"
      >
        {/* ── Top Header Bar: Clean & Minimal ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h2 id="system-notice-title" className="text-base font-black tracking-tight text-slate-900">
              Student Rewards
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented Pill Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('earning')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'earning'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                <span>Earn Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'notice'
                    ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3 h-3 text-primary-600" />
                <span>Notices</span>
              </button>
            </div>

            {/* Close Cross Button */}
            <button
              onClick={onClose}
              aria-label="Close Notice"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Scrollable Body: Visual First, No Long Paragraphs ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 font-sans bg-slate-50/40">

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── TAB: EARN REAL RUPEES (VISUAL & HIGH IMPACT) ── */}
          {/* ══════════════════════════════════════════════════════ */}
          {activeTab === 'earning' && (
            <div className="space-y-3.5">
              {/* Visual Cash & UPI Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/40 border border-emerald-300/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Instant UPI Payment</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      Earn <span className="text-emerald-700 font-black">₹15 to ₹50</span> per Question Paper!
                    </h3>

                    <p className="text-xs text-slate-600 font-medium">
                      Snap exam photos on your phone. Get paid directly to Google Pay, PhonePe, or Paytm!
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
                      <span className="bg-white/90 px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 shadow-2xs">
                        ⚡ 30s Upload
                      </span>
                      <span className="bg-white/90 px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 shadow-2xs">
                        📲 24h Bank Transfer
                      </span>
                    </div>
                  </div>

                  {/* Real Money & Indian Rupee Graphic */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md bg-white p-1 ring-2 ring-emerald-400/20">
                      <picture>
                        <source srcSet="/images/indian-rupee-cash-earning.webp?v=3" type="image/webp" />
                        <img
                          src="/images/indian-rupee-cash-earning.jpg?v=3"
                          alt="Earn Real Indian Rupees via UPI"
                          className="w-full h-full object-cover rounded-xl"
                          width={128}
                          height={128}
                          loading="eager"
                        />
                      </picture>
                    </div>
                    <div className="absolute -bottom-1.5 -right-1 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-emerald-400">
                      <ShieldCheck className="w-2.5 h-2.5" /> UPI Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Rupee Rate Cards (Visual & Clear) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-white border border-slate-200/90 rounded-xl text-center space-y-0.5 shadow-2xs hover:border-emerald-300 transition-colors">
                  <FileText className="w-4 h-4 text-emerald-600 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-600">1 Paper</span>
                  <span className="block font-black text-emerald-700 text-sm">₹15 – ₹25</span>
                  <span className="block text-[10px] text-slate-400">UG Semester</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200/90 rounded-xl text-center space-y-0.5 shadow-2xs hover:border-emerald-300 transition-colors">
                  <Coins className="w-4 h-4 text-amber-500 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-600">1 Semester</span>
                  <span className="block font-black text-emerald-700 text-sm">₹100+</span>
                  <span className="block text-[10px] text-slate-400">5-6 Papers</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200/90 rounded-xl text-center space-y-0.5 shadow-2xs hover:border-emerald-300 transition-colors">
                  <GraduationCap className="w-4 h-4 text-indigo-600 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-600">PG / Rare</span>
                  <span className="block font-black text-amber-600 text-sm">₹50 / paper</span>
                  <span className="block text-[10px] text-slate-400">MA, MSc, Old</span>
                </div>
              </div>

              {/* 3 Quick Steps (Short & Punchy) */}
              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Snap Photos</p>
                    <p className="text-[10px] text-slate-500">Phone camera or PDF</p>
                  </div>

                  <div className="space-y-1 border-x border-slate-100">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Select Course</p>
                    <p className="text-[10px] text-slate-500">MBBU / TU in 30s</p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                      3
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Receive Cash</p>
                    <p className="text-[10px] text-slate-500">Direct to GPay / UPI</p>
                  </div>
                </div>
              </div>

              {/* High-Converting Direct CTA Button */}
              <div className="space-y-2 pt-1">
                <Link
                  to="/upload"
                  onClick={onClose}
                  className="w-full group flex items-center justify-center gap-2.5 py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all active:scale-98"
                >
                  <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>Upload Question Papers &amp; Earn ₹ Cash Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center justify-center gap-3 text-[10px] font-semibold text-slate-500">
                  <span>Supported:</span>
                  <span className="text-slate-700 font-bold">Google Pay</span>
                  <span>•</span>
                  <span className="text-slate-700 font-bold">PhonePe</span>
                  <span>•</span>
                  <span className="text-slate-700 font-bold">Paytm</span>
                  <span>•</span>
                  <span className="text-slate-700 font-bold">Amazon Pay</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── TAB: SYSTEM NOTICES & ANNOUNCEMENTS ── */}
          {/* ══════════════════════════════════════════════════════ */}
          {activeTab === 'notice' && (
            <div className="space-y-3">
              {/* Pinned Earning Reminder Banner at Top of Notice Tab */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Upload Exam Papers &amp; Earn ₹ Cash!</h4>
                    <p className="text-[11px] text-slate-600">Get ₹15 to ₹50 per paper sent to your UPI.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('earning')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shrink-0 transition-colors shadow-xs"
                >
                  Upload
                </button>
              </div>

              {/* Admin Notice Manager Toggle */}
              {isAdmin && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Admin Publisher
                    </span>
                    <button
                      onClick={() => setShowAdminAddForm(!showAdminAddForm)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3 inline mr-0.5" />
                      {showAdminAddForm ? 'Cancel' : 'Add Notice'}
                    </button>
                  </div>

                  {showAdminAddForm && (
                    <form onSubmit={handleCreateNotice} className="mt-2.5 pt-2.5 border-t border-amber-200/60 space-y-2 text-slate-700">
                      <div>
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Notice Title"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                        />
                      </div>
                      <div>
                        <textarea
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          rows={2}
                          placeholder="Notice Content..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {submitting ? 'Publishing...' : 'Publish Notice'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* List of Notices */}
              <div className="space-y-2.5">
                {notices.map((item, index) => (
                  <div key={item.id || index} className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm select-none">📢</span>
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getTagBadgeClass(item.tag)}`}>
                          {item.tag}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteNotice(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                      {item.content}
                    </p>

                    {item.link && (
                      <div className="pl-5 pt-0.5">
                        <Link
                          to={item.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
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
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={handleCloseToday}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-98"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}

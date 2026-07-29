import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Download, Heart, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseDb';
import { useAuth } from '../context/AuthContext';
import type { PaperData } from '../services/upload';

interface Notification {
    id: string;
    message: string;
    type: 'download' | 'like';
    paperId: string;
}

const BASELINE_KEY = 'notif_baseline';

/** Build notification messages by diffing current counts against stored baseline */
function buildNotifications(
    papers: PaperData[],
    baseline: Record<string, { downloads: number; likes: number }>
): Notification[] {
    const notifs: Notification[] = [];
    for (const p of papers) {
        if (!p.id) continue;
        const prev = baseline[p.id] || { downloads: 0, likes: 0 };
        const newDownloads = (p.downloadCount || 0) - (prev.downloads || 0);
        const newLikes = (p.likeCount || 0) - (prev.likes || 0);
        if (newDownloads > 0) {
            notifs.push({
                id: `${p.id}-dl`,
                paperId: p.id,
                message: `Your paper "${p.title}" got ${newDownloads} new download${newDownloads > 1 ? 's' : ''}! 📥`,
                type: 'download',
            });
        }
        if (newLikes > 0) {
            notifs.push({
                id: `${p.id}-lk`,
                paperId: p.id,
                message: `Your paper "${p.title}" got ${newLikes} new like${newLikes > 1 ? 's' : ''}! ❤️`,
                type: 'like',
            });
        }
    }
    return notifs;
}

/** Save current counts as the new baseline */
function saveBaseline(papers: PaperData[]) {
    const baseline: Record<string, { downloads: number; likes: number }> = {};
    for (const p of papers) {
        if (p.id) baseline[p.id] = { downloads: p.downloadCount || 0, likes: p.likeCount || 0 };
    }
    localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
}

export default function NotificationsPanel() {
    const { userProfile } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [papers, setPapers] = useState<PaperData[]>([]);
    const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    // Track whether this is the very first snapshot load (to avoid firing toasts for old data)
    const isFirstLoad = useRef(true);

    // ─── Real-time listener ────────────────────────────────────────────────────
    useEffect(() => {
        if (!userProfile?.uid) return;

        isFirstLoad.current = true;

        const q = query(
            collection(db, 'papers'),
            where('uploaderId', '==', userProfile.uid)
        );

        const unsub = onSnapshot(q, (snap) => {
            const latestPapers: PaperData[] = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            })) as PaperData[];

            setPapers(latestPapers);

            const raw = localStorage.getItem(BASELINE_KEY);
            const baseline: Record<string, { downloads: number; likes: number }> =
                raw ? JSON.parse(raw) : {};

            const generated = buildNotifications(latestPapers, baseline);

            if (isFirstLoad.current) {
                // First load: show existing unread in the panel (no toasts yet)
                isFirstLoad.current = false;
                setNotifs(generated);
                setUnread(generated.length);
            } else {
                // Subsequent snapshots = real-time changes → fire instant toasts
                const newNotifs = buildNotifications(latestPapers, baseline);
                newNotifs.forEach((n, i) => {
                    setTimeout(() => {
                        toast(n.message, {
                            icon: n.type === 'download' ? '📥' : '❤️',
                            duration: 5000,
                            style: {
                                borderLeft: `4px solid ${n.type === 'download' ? '#3b82f6' : '#f43f5e'}`,
                                fontWeight: 500,
                            },
                        });
                    }, i * 600);
                });

                if (newNotifs.length > 0) {
                    // Save new baseline immediately so toasts don't repeat
                    saveBaseline(latestPapers);
                    setNotifs(prev => {
                        // Merge new notifs with existing, dedup by id
                        const ids = new Set(prev.map(n => n.id));
                        const merged = [...prev, ...newNotifs.filter(n => !ids.has(n.id))];
                        setUnread(merged.length);
                        return merged;
                    });
                }
            }
        }, (err) => {
            console.warn('[NotificationsPanel] onSnapshot error:', err);
        });

        return () => unsub();
    }, [userProfile?.uid]);

    // ─── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const panel = document.getElementById('notif-panel');
            if (panel && panel.contains(e.target as Node)) return;
            if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // ─── Mark read ─────────────────────────────────────────────────────────────
    const markRead = () => {
        saveBaseline(papers);
        setUnread(0);
    };

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const viewportGutter = 16;
            const panelWidth = Math.min(320, Math.max(0, window.innerWidth - viewportGutter * 2));
            const maxLeft = Math.max(viewportGutter, window.innerWidth - panelWidth - viewportGutter);
            const left = Math.min(Math.max(viewportGutter, rect.right - panelWidth), maxLeft);
            setDropPos({ top: rect.bottom + 8, left, width: panelWidth });
        }
        setOpen(prev => {
            const next = !prev;
            if (next && unread > 0) markRead();
            return next;
        });
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                aria-label="Notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 shrink-0"
            >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full border border-white flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white leading-none px-0.5">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    </span>
                )}
            </button>

            {/* Fixed-position dropdown */}
            {open && dropPos && createPortal(
                <div
                    id="notif-panel"
                    role="dialog"
                    aria-label="Notifications"
                    className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                    style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-bold text-gray-800">
                            Activity on your papers
                            {unread === 0 && notifs.length > 0 && (
                                <span className="ml-2 text-xs font-normal text-gray-400">· all caught up</span>
                            )}
                        </p>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {notifs.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No new activity on your papers
                        </div>
                    ) : (
                        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                            {notifs.map(n => (
                                <li key={n.id}>
                                    <Link
                                        to="/dashboard/my-uploads"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors cursor-pointer group"
                                    >
                                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.type === 'download' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-500'}`}>
                                            {n.type === 'download' ? <Download className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-snug flex-1">{n.message}</p>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 shrink-0 transition-colors" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}

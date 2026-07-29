import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getContactMessages, markMessageAsRead, deleteMessage, type ContactMessage } from '../../services/contact';
import toast from 'react-hot-toast';
import { PanelLeft, Mail, Trash2, Eye, Clock, MessageSquare, Search, Filter, RefreshCw, Reply, CheckCheck, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type FilterType = 'all' | 'unread' | 'read';

const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'Just now';
    const d = ts.toDate();
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TopicBadge: React.FC<{ subject: string }> = ({ subject }) => {
    const colors: Record<string, string> = {
        'Technical Support': 'bg-orange-50 text-orange-700 border-orange-200',
        'Feature Request': 'bg-purple-50 text-purple-700 border-purple-200',
        'Account Issues': 'bg-red-50 text-red-700 border-red-200',
        'Report a Problem': 'bg-rose-50 text-rose-700 border-rose-200',
        'General Inquiry': 'bg-blue-50 text-blue-700 border-blue-200',
        'Other': 'bg-gray-50 text-gray-600 border-gray-200',
    };
    const cls = colors[subject] || 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${cls}`}>
            {subject}
        </span>
    );
};

const AdminContactMessages: React.FC = () => {
    useAuth();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await getContactMessages();
            setMessages(data);
        } catch (error: any) {
            toast.error(`Failed to fetch messages: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markMessageAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
            if (selectedMessage?.id === id) setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null);
        } catch {
            toast.error('Failed to update message');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this message? This cannot be undone.')) return;
        try {
            await deleteMessage(id);
            toast.success('Message deleted');
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setIsModalOpen(false);
        } catch {
            toast.error('Failed to delete message');
        }
    };

    const openMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        setIsModalOpen(true);
        if (message.status === 'unread' && message.id) handleMarkAsRead(message.id);
    };

    const filtered = messages
        .filter(m => filter === 'all' || m.status === filter)
        .filter(m => {
            const q = search.toLowerCase();
            return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
        });

    const unreadCount = messages.filter(m => m.status === 'unread').length;
    const readCount = messages.filter(m => m.status === 'read').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <button
                className="md:hidden fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
                onClick={() => setSidebarOpen(true)}
            >
                <PanelLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex flex-col md:flex-row">
                <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage and respond to user inquiries</p>
                        </div>
                        <button
                            onClick={fetchMessages}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Inbox className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total</p>
                                <p className="text-xl font-bold text-gray-900">{messages.length}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-blue-200 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-medium">Unread</p>
                                <p className="text-xl font-bold text-blue-700">{unreadCount}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-medium">Read</p>
                                <p className="text-xl font-bold text-green-700">{readCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters + Search */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, subject or message…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                            <Filter className="w-4 h-4 text-gray-400 ml-2" />
                            {(['all', 'unread', 'read'] as FilterType[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-semibold text-gray-400">No messages found</p>
                                <p className="text-sm text-gray-400 mt-1">{search ? 'Try a different search term.' : 'Messages you receive will appear here.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/80">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Sender</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Topic</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Preview</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map(message => (
                                            <tr
                                                key={message.id}
                                                onClick={() => openMessage(message)}
                                                className={`cursor-pointer transition-colors group ${message.status === 'unread' ? 'bg-blue-50/20 hover:bg-blue-50/40' : 'hover:bg-gray-50/80'}`}
                                            >
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    {message.status === 'unread' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                            New
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                                            <CheckCheck className="w-3 h-3" />
                                                            Read
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {message.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-semibold ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>{message.name}</p>
                                                            <p className="text-xs text-gray-400">{message.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <TopicBadge subject={message.subject} />
                                                </td>
                                                <td className="px-5 py-4 hidden lg:table-cell max-w-xs">
                                                    <p className="text-sm text-gray-500 truncate">{message.message}</p>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDate(message.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => openMessage(message)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100"
                                                            title="View message"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(message.id!)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {!loading && filtered.length > 0 && (
                        <p className="text-xs text-gray-400 mt-3 text-right">Showing {filtered.length} of {messages.length} message{messages.length !== 1 ? 's' : ''}</p>
                    )}
                </main>
            </div>

            {/* Message Detail Modal */}
            {isModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Colour strip */}
                        <div className={`h-1.5 w-full ${selectedMessage.status === 'unread' ? 'bg-gradient-to-r from-blue-500 to-primary-600' : 'bg-gray-200'}`} />

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedMessage.name}</h2>
                                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary-600 hover:underline">{selectedMessage.email}</a>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <TopicBadge subject={selectedMessage.subject} />
                                    <p className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        {selectedMessage.createdAt?.toDate ? selectedMessage.createdAt.toDate().toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 mb-6" />

                            {/* Message Label */}
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</span>
                            </div>

                            {/* Message Content */}
                            <div className="bg-gray-50 rounded-2xl p-5 mb-8 min-h-[120px] border border-gray-100">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                            </div>

                            {/* Quick Info Row */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium">Status</p>
                                    <p className="text-sm font-bold text-gray-700 mt-0.5 capitalize">{selectedMessage.status}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium">Topic</p>
                                    <p className="text-sm font-bold text-gray-700 mt-0.5">{selectedMessage.subject}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium">Received</p>
                                    <p className="text-sm font-bold text-gray-700 mt-0.5">{formatDate(selectedMessage.createdAt)}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => handleDelete(selectedMessage.id!)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                                    >
                                        <Reply className="w-4 h-4" />
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContactMessages;

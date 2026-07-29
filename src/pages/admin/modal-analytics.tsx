import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getModalAnalytics } from '../../services/modalAnalytics';
import toast from 'react-hot-toast';
import { PanelLeft, TrendingUp, Eye, MousePointer, Upload as UploadIcon, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface AnalyticsData {
    totalViews: number;
    uploadClicks: number;
    actualUploads: number;
    reminds: number;
    dismissals: number;
    conversionRate: string;
    clickThroughRate: string;
    events: any[];
}

const ModalAnalytics: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            let startDate: Date | undefined;
            const now = new Date();

            if (dateRange === '7days') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateRange === '30days') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            const data = await getModalAnalytics(startDate);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch modal analytics:', error);
            toast.error('Failed to fetch analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Prepare data for event distribution pie chart
    const eventDistributionData = analytics ? [
        { name: 'Views', value: analytics.totalViews, color: COLORS[0] },
        { name: 'Upload Clicks', value: analytics.uploadClicks, color: COLORS[1] },
        { name: 'Actual Uploads', value: analytics.actualUploads, color: COLORS[2] },
        { name: 'Remind Later', value: analytics.reminds, color: COLORS[3] },
        { name: 'Dismissals', value: analytics.dismissals, color: COLORS[4] },
    ] : [];

    // Prepare funnel data
    const funnelData = analytics ? [
        { stage: 'Modal Views', count: analytics.totalViews },
        { stage: 'Upload Clicks', count: analytics.uploadClicks },
        { stage: 'Actual Uploads', count: analytics.actualUploads },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
                title="Open admin menu"
            >
                <PanelLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex flex-col md:flex-row">
                <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 p-2 sm:p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Modal Analytics</h1>
                            <p className="text-gray-600">Upload encouragement modal performance metrics</p>
                        </div>

                        {/* Date Range Selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDateRange('7days')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === '7days'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => setDateRange('30days')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === '30days'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                30 Days
                            </button>
                            <button
                                onClick={() => setDateRange('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${dateRange === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                All Time
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Key Metrics Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Conversion Rate */}
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-8 h-8 opacity-80" />
                                        <span className="text-3xl font-bold">{analytics.conversionRate}%</span>
                                    </div>
                                    <div className="text-sm opacity-90">Conversion Rate</div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {analytics.actualUploads} / {analytics.uploadClicks} clicked upload
                                    </div>
                                </div>

                                {/* Click-Through Rate */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <MousePointer className="w-8 h-8 opacity-80" />
                                        <span className="text-3xl font-bold">{analytics.clickThroughRate}%</span>
                                    </div>
                                    <div className="text-sm opacity-90">Click-Through Rate</div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {analytics.uploadClicks} / {analytics.totalViews} views
                                    </div>
                                </div>

                                {/* Total Views */}
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Eye className="w-8 h-8 opacity-80" />
                                        <span className="text-3xl font-bold">{analytics.totalViews}</span>
                                    </div>
                                    <div className="text-sm opacity-90">Total Views</div>
                                    <div className="text-xs opacity-75 mt-1">Modal impressions</div>
                                </div>

                                {/* Actual Uploads */}
                                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <UploadIcon className="w-8 h-8 opacity-80" />
                                        <span className="text-3xl font-bold">{analytics.actualUploads}</span>
                                    </div>
                                    <div className="text-sm opacity-90">Successful Conversions</div>
                                    <div className="text-xs opacity-75 mt-1">Actual uploads</div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Conversion Funnel */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold mb-4">Conversion Funnel</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={funnelData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="stage" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill={COLORS[0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Event Distribution */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold mb-4">Event Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={eventDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={(entry) => {
                                                    const percent = (entry.percent * 100).toFixed(0);
                                                    // Only show label if percentage is above 1%
                                                    return percent !== '0' ? `${entry.name}: ${percent}%` : '';
                                                }}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {eventDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Event Breakdown Table */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold mb-4">Event Breakdown</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Upload Clicks */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-cyan-100 p-2 rounded-lg">
                                                <MousePointer className="w-5 h-5 text-cyan-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{analytics.uploadClicks}</div>
                                                <div className="text-sm text-gray-600">Upload Clicks</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actual Uploads */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <UploadIcon className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{analytics.actualUploads}</div>
                                                <div className="text-sm text-gray-600">Conversions</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remind Later */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-amber-100 p-2 rounded-lg">
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{analytics.reminds}</div>
                                                <div className="text-sm text-gray-600">Remind Later</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dismissals */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-red-100 p-2 rounded-lg">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{analytics.dismissals}</div>
                                                <div className="text-sm text-gray-600">Dismissals</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Insights */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-blue-900 mb-3">📊 Insights</h3>
                                <ul className="space-y-2 text-blue-800">
                                    <li>
                                        • <strong>{analytics.clickThroughRate}%</strong> of users who saw the modal clicked "Upload Now"
                                    </li>
                                    <li>
                                        • <strong>{analytics.conversionRate}%</strong> of users who clicked actually uploaded a paper
                                    </li>
                                    {parseFloat(analytics.conversionRate) > 20 && (
                                        <li className="text-green-700">
                                            ✅ Excellent conversion rate! The modal is performing very well.
                                        </li>
                                    )}
                                    {parseFloat(analytics.clickThroughRate) < 10 && (
                                        <li className="text-amber-700">
                                            ⚠️ Consider improving the modal's messaging to increase click-through rate.
                                        </li>
                                    )}
                                    <li>
                                        • <strong>{analytics.reminds}</strong> users postponed the action (potential for email follow-up)
                                    </li>
                                    <li>
                                        • <strong>{analytics.dismissals}</strong> users permanently dismissed the modal
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Analytics Data</h3>
                            <p className="text-gray-600">
                                No modal analytics data available yet. The modal needs to be viewed by users first.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ModalAnalytics;

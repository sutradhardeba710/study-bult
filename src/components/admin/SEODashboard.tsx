import { useState, useEffect } from 'react';
import { TrendingUp, Search, Eye, MousePointer, AlertCircle, CheckCircle, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';
import { searchConsoleService, type SearchConsoleMetrics } from '../../services/searchConsole';
import { analyzeSEO, generateXMLSitemap } from '../../services/seo';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface SEODashboardProps {
  className?: string;
}

const SEODashboard = ({ className = '' }: SEODashboardProps) => {
  const [metrics, setMetrics] = useState<{
    summary: {
      totalClicks: number;
      totalImpressions: number;
      avgCTR: number;
      avgPosition: number;
    };
    topQueries: SearchConsoleMetrics[];
    topPages: SearchConsoleMetrics[];
    recommendations: string[];
  } | null>(null);
  
  const [seoAnalysis, setSeoAnalysis] = useState<{
    score: number;
    recommendations: string[];
    criticalIssues: string[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sitemapStatus, setSitemapStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [performanceData, analysisData] = await Promise.all([
        searchConsoleService.generatePerformanceReport(30),
        analyzeSEO()
      ]);
      
      setMetrics(performanceData);
      setSeoAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading SEO data:', error);
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('SEO data refreshed');
  };

  const generateSitemap = async () => {
    setSitemapStatus('generating');
    try {
      await generateXMLSitemap();
      
      // Submit to Search Console
      const submitted = await searchConsoleService.submitSitemap();
      
      if (submitted) {
        setSitemapStatus('success');
        toast.success('Sitemap generated and submitted successfully');
      } else {
        setSitemapStatus('success');
        toast.success('Sitemap generated (manual submission may be required)');
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setSitemapStatus('error');
      toast.error('Failed to generate sitemap');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Dashboard</h2>
          <p className="text-gray-600">Monitor search performance and optimize for better visibility</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={generateSitemap}
            disabled={sitemapStatus === 'generating'}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>
              {sitemapStatus === 'generating' ? 'Generating...' : 'Generate Sitemap'}
            </span>
          </Button>
        </div>
      </div>

      {/* SEO Score Card */}
      {seoAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO Health Score</h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              seoAnalysis.score >= 80 ? 'bg-green-100 text-green-800' :
              seoAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {seoAnalysis.score >= 80 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{seoAnalysis.score}/100</span>
            </div>
          </div>
          
          {seoAnalysis.criticalIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Critical Issues</h4>
              <ul className="space-y-1">
                {seoAnalysis.criticalIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {seoAnalysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {seoAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-600 flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average CTR</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.summary.avgCTR.toFixed(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Position</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.summary.avgPosition.toFixed(1)}</p>
              </div>
              <Search className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Top Queries and Pages */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Queries */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Search Queries</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topQueries.slice(0, 10).map((query, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {query.query || 'Unknown Query'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Position: {query.position.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{query.clicks} clicks</span>
                      <span>{query.impressions} impressions</span>
                      <span>{(query.ctr * 100).toFixed(1)}% CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Pages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {page.page?.replace('https://study-vault-gamma.vercel.app', '') || '/'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Position: {page.position.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{page.clicks} clicks</span>
                      <span>{page.impressions} impressions</span>
                      <span>{(page.ctr * 100).toFixed(1)}% CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {metrics && metrics.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
          <div className="space-y-3">
            {metrics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">Search Console</p>
              <p className="text-sm text-gray-600">View detailed reports</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </a>
          
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">View Sitemap</p>
              <p className="text-sm text-gray-600">Check sitemap.xml</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </a>
          
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">View Robots.txt</p>
              <p className="text-sm text-gray-600">Check crawl rules</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SEODashboard; 
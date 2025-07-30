// Google Search Console Integration Service
import { autoSubmitPaperToIndex } from './seo';

export interface SearchConsoleMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  query?: string;
  page?: string;
  country?: string;
  device?: string;
  date: string;
}

export interface IndexingStatus {
  url: string;
  status: 'SUBMITTED' | 'DUPLICATE' | 'CRAWLED' | 'ERROR';
  lastCrawlTime?: string;
  crawlErrorDetails?: string;
}

class SearchConsoleService {
  private apiKey: string;
  private siteUrl: string;
  private baseUrl = 'https://www.googleapis.com/webmasters/v3';
  private authToken: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_API_KEY || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'https://study-vault-gamma.vercel.app';
  }

  // Check if Search Console is properly configured
  isConfigured(): boolean {
    return !!(this.apiKey && this.siteUrl);
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Get search performance data
  async getSearchPerformance(
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query'],
    filters?: Array<{ dimension: string; operator: string; expression: string }>
  ): Promise<SearchConsoleMetrics[]> {
    if (!this.isConfigured()) {
      console.warn('Google Search Console API not configured');
      return [];
    }

    try {
      const requestBody = {
        startDate,
        endDate,
        dimensions,
        rowLimit: 1000,
        startRow: 0,
        ...(filters && { dimensionFilterGroups: [{ filters }] })
      };

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query?key=${this.apiKey}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search Console API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return data.rows?.map((row: any) => ({
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        query: row.keys?.[0],
        page: row.keys?.[1],
        country: row.keys?.[2],
        device: row.keys?.[3],
        date: startDate
      })) || [];
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      return [];
    }
  }

  // Get top performing queries
  async getTopQueries(days = 30): Promise<SearchConsoleMetrics[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getSearchPerformance(startDate, endDate, ['query']);
  }

  // Get top performing pages
  async getTopPages(days = 30): Promise<SearchConsoleMetrics[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getSearchPerformance(startDate, endDate, ['page']);
  }

  // Submit sitemap to Google Search Console
  async submitSitemap(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Search Console API not configured');
      return false;
    }

    try {
      const sitemapUrl = `${this.siteUrl}/sitemap.xml`;
      const response = await fetch(
        `${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}?key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        console.log('Sitemap submitted successfully to Google Search Console');
        return true;
      } else {
        console.error('Failed to submit sitemap:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error submitting sitemap:', error);
      return false;
    }
  }

  // Check indexing status of URLs
  async checkIndexingStatus(urls: string[]): Promise<IndexingStatus[]> {
    if (!this.isConfigured()) {
      console.warn('Google Search Console API not configured');
      return [];
    }

    const results: IndexingStatus[] = [];

    for (const url of urls) {
      try {
        const response = await fetch(
          `${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/urlInspection/index:inspect?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inspectionUrl: url })
          }
        );

        if (response.ok) {
          const data = await response.json();
          results.push({
            url,
            status: data.indexStatusResult?.coverageState || 'ERROR',
            lastCrawlTime: data.indexStatusResult?.lastCrawlTime,
            crawlErrorDetails: data.indexStatusResult?.crawlErrorInfo?.errorMessage
          });
        } else {
          results.push({
            url,
            status: 'ERROR',
            crawlErrorDetails: 'Failed to fetch indexing status'
          });
        }
      } catch (error) {
        console.error(`Error checking indexing status for ${url}:`, error);
        results.push({
          url,
          status: 'ERROR',
          crawlErrorDetails: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Request indexing of specific URLs
  async requestIndexing(urls: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const url of urls) {
      try {
        await autoSubmitPaperToIndex(url);
        success++;
      } catch (error) {
        console.error(`Error requesting indexing for ${url}:`, error);
        failed++;
      }

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return { success, failed };
  }

  // Get search appearance data (rich results, etc.)
  async getSearchAppearance(days = 30): Promise<{
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
    richResults: Array<{ type: string; clicks: number; impressions: number }>;
  }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const data = await this.getSearchPerformance(startDate, endDate, ['searchAppearance']);
    
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    const richResults: Array<{ type: string; clicks: number; impressions: number }> = [];

    data.forEach(metric => {
      totalClicks += metric.clicks;
      totalImpressions += metric.impressions;
      totalPosition += metric.position * metric.impressions;
      
      if (metric.query) {
        richResults.push({
          type: metric.query,
          clicks: metric.clicks,
          impressions: metric.impressions
        });
      }
    });

    return {
      totalClicks,
      totalImpressions,
      avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgPosition: totalImpressions > 0 ? totalPosition / totalImpressions : 0,
      richResults
    };
  }

  // Generate Search Console performance report
  async generatePerformanceReport(days = 30): Promise<{
    summary: {
      totalClicks: number;
      totalImpressions: number;
      avgCTR: number;
      avgPosition: number;
    };
    topQueries: SearchConsoleMetrics[];
    topPages: SearchConsoleMetrics[];
    recommendations: string[];
  }> {
    const [queries, pages] = await Promise.all([
      this.getTopQueries(days),
      this.getTopPages(days)
    ]);

    const totalClicks = queries.reduce((sum, q) => sum + q.clicks, 0);
    const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = queries.length > 0 ? queries.reduce((sum, q) => sum + q.position, 0) / queries.length : 0;

    const recommendations: string[] = [];

    // Generate recommendations based on performance
    if (avgCTR < 2) {
      recommendations.push('Low click-through rate. Consider improving titles and meta descriptions.');
    }
    if (avgPosition > 10) {
      recommendations.push('Average position is low. Focus on SEO optimization and content quality.');
    }
    if (totalImpressions < 100) {
      recommendations.push('Low impressions. Consider expanding keyword targeting and content creation.');
    }

    // Find pages with high impressions but low CTR
    const lowCTRPages = pages.filter(p => p.impressions > 50 && p.ctr < 0.02);
    if (lowCTRPages.length > 0) {
      recommendations.push(`${lowCTRPages.length} pages have high impressions but low CTR. Optimize their titles and descriptions.`);
    }

    return {
      summary: {
        totalClicks,
        totalImpressions,
        avgCTR,
        avgPosition
      },
      topQueries: queries.slice(0, 20),
      topPages: pages.slice(0, 20),
      recommendations
    };
  }
}

export const searchConsoleService = new SearchConsoleService(); 
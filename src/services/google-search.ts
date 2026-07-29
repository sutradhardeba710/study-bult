import axios from 'axios';

interface SitemapSubmissionResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Google Search integration service
 * Provides client-side methods to interact with Google Search Console API
 */
class GoogleSearchService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = '/api/google-search';
  }

  /**
   * Submit the site's sitemap to Google Search Console
   */
  async submitSitemap(): Promise<SitemapSubmissionResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/submit-sitemap`);
      return response.data;
    } catch (error) {
      console.error('Failed to submit sitemap:', error);
      return {
        success: false,
        message: 'Failed to submit sitemap to Google Search Console',
      };
    }
  }

  /**
   * Check if sitemap is properly indexed
   */
  async checkSitemapStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/sitemap-status`);
      return response.data;
    } catch (error) {
      console.error('Failed to check sitemap status:', error);
      return {
        success: false,
        message: 'Failed to check sitemap status',
      };
    }
  }

  /**
   * Request Google to recrawl a specific URL
   */
  async requestRecrawl(url: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/recrawl`, { url });
      return response.data;
    } catch (error) {
      console.error(`Failed to request recrawl for ${url}:`, error);
      return {
        success: false,
        message: 'Failed to request URL recrawl',
      };
    }
  }
}

export default new GoogleSearchService(); 
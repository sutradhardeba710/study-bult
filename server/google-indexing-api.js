const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Google Indexing API Integration
 * For faster URL indexing (originally for job postings/livestreams, but works for any content)
 */
class GoogleIndexingAPI {
  constructor() {
    this.serviceAccountPath = path.join(__dirname, 'credentials.json');
    this.indexingService = null;
  }

  /**
   * Initialize Google Indexing API
   */
  async initialize() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8'));
      
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/indexing'] // Indexing API scope
      );

      await auth.authorize();
      
      this.indexingService = google.indexing({
        version: 'v3',
        auth: auth
      });

      console.log('✅ Google Indexing API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Indexing API:', error.message);
      return false;
    }
  }

  /**
   * Request URL to be updated in Google's index
   */
  async updateUrl(url) {
    try {
      const response = await this.indexingService.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED'
        }
      });

      console.log(`✅ URL update notification sent: ${url}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request URL to be deleted from Google's index
   */
  async deleteUrl(url) {
    try {
      const response = await this.indexingService.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_DELETED'
        }
      });

      console.log(`🗑️ URL deletion notification sent: ${url}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the status of a URL notification
   */
  async getUrlStatus(url) {
    try {
      const response = await this.indexingService.urlNotifications.getMetadata({
        url: url
      });

      console.log(`📊 URL status for ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get URL status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk submit URLs for indexing
   */
  async bulkUpdateUrls(urls) {
    const results = [];
    
    for (const url of urls) {
      try {
        const result = await this.updateUrl(url);
        results.push({ url, success: true, result });
        
        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }
    }

    console.log(`📋 Bulk update completed: ${results.filter(r => r.success).length}/${urls.length} successful`);
    return results;
  }
}

/**
 * Usage Example
 */
async function main() {
  const indexingAPI = new GoogleIndexingAPI();

  try {
    // Initialize API
    const initialized = await indexingAPI.initialize();
    if (!initialized) return;

    // URLs to index
    const urlsToIndex = [
      'https://study-vault2.vercel.app/',
      'https://study-vault2.vercel.app/browse',
      'https://study-vault2.vercel.app/upload',
      'https://study-vault2.vercel.app/about',
      'https://study-vault2.vercel.app/contact',
      'https://study-vault2.vercel.app/xml-sitemap.xml'
    ];

    // Submit URLs for indexing
    await indexingAPI.bulkUpdateUrls(urlsToIndex);

  } catch (error) {
    console.error('❌ Indexing process failed:', error.message);
  }
}

// Auto-run if called directly
if (require.main === module) {
  main();
}

module.exports = GoogleIndexingAPI; 
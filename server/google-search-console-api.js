const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Google Search Console API Integration
 * Allows programmatic sitemap submission and management
 */
class GoogleSearchConsoleAPI {
  constructor() {
    this.siteUrl = 'https://study-vault2.vercel.app/';
    this.serviceAccountPath = path.join(__dirname, 'credentials.json'); // Download from Google Cloud Console
    this.webmastersService = null;
  }

  /**
   * Step 1: Initialize Google Search Console API
   */
  async initialize() {
    try {
      // Load service account credentials
      const credentials = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8'));
      
      // Create JWT auth client
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/webmasters'] // Search Console scope
      );

      // Authenticate
      await auth.authorize();
      
      // Initialize Search Console service
      this.webmastersService = google.webmasters({
        version: 'v3',
        auth: auth
      });

      console.log('✅ Google Search Console API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Search Console API:', error.message);
      return false;
    }
  }

  /**
   * Step 2: Submit Sitemap Programmatically
   */
  async submitSitemap(sitemapUrl) {
    try {
      const response = await this.webmastersService.sitemaps.submit({
        siteUrl: this.siteUrl,
        feedpath: sitemapUrl
      });

      console.log(`✅ Sitemap submitted successfully: ${sitemapUrl}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to submit sitemap: ${error.message}`);
      throw error;
    }
  }

  /**
   * Step 3: List All Sitemaps
   */
  async listSitemaps() {
    try {
      const response = await this.webmastersService.sitemaps.list({
        siteUrl: this.siteUrl
      });

      console.log('📋 Current sitemaps:');
      response.data.sitemap?.forEach(sitemap => {
        console.log(`- ${sitemap.feedpath} (Status: ${sitemap.type})`);
      });

      return response.data.sitemap || [];
    } catch (error) {
      console.error('❌ Failed to list sitemaps:', error.message);
      throw error;
    }
  }

  /**
   * Step 4: Delete Old Sitemap
   */
  async deleteSitemap(sitemapUrl) {
    try {
      await this.webmastersService.sitemaps.delete({
        siteUrl: this.siteUrl,
        feedpath: sitemapUrl
      });

      console.log(`🗑️ Sitemap deleted: ${sitemapUrl}`);
    } catch (error) {
      console.error(`❌ Failed to delete sitemap: ${error.message}`);
      throw error;
    }
  }

  /**
   * Step 5: Get Site Information
   */
  async getSiteInfo() {
    try {
      const response = await this.webmastersService.sites.get({
        siteUrl: this.siteUrl
      });

      console.log('🏠 Site information:');
      console.log(`- URL: ${response.data.siteUrl}`);
      console.log(`- Permission Level: ${response.data.permissionLevel}`);

      return response.data;
    } catch (error) {
      console.error('❌ Failed to get site info:', error.message);
      throw error;
    }
  }

  /**
   * Complete Workflow: Replace Old Sitemap with New One
   */
  async refreshSitemap(newSitemapUrl, oldSitemapUrl = null) {
    try {
      console.log('🔄 Starting sitemap refresh process...');

      // 1. List current sitemaps
      const currentSitemaps = await this.listSitemaps();

      // 2. Delete old sitemap if specified
      if (oldSitemapUrl) {
        await this.deleteSitemap(oldSitemapUrl);
      } else if (currentSitemaps.length > 0) {
        // Delete all existing sitemaps
        for (const sitemap of currentSitemaps) {
          await this.deleteSitemap(sitemap.feedpath);
        }
      }

      // 3. Submit new sitemap
      await this.submitSitemap(newSitemapUrl);

      console.log('✅ Sitemap refresh completed successfully!');
    } catch (error) {
      console.error('❌ Sitemap refresh failed:', error.message);
      throw error;
    }
  }
}

/**
 * Usage Example
 */
async function main() {
  const gscAPI = new GoogleSearchConsoleAPI();

  try {
    // Initialize API
    const initialized = await gscAPI.initialize();
    if (!initialized) return;

    // Get current site info
    await gscAPI.getSiteInfo();

    // Refresh sitemap with new timestamped version
    const newSitemapUrl = `https://study-vault2.vercel.app/xml-sitemap.xml`;
    await gscAPI.refreshSitemap(newSitemapUrl);

    // Verify submission
    await gscAPI.listSitemaps();

  } catch (error) {
    console.error('❌ Process failed:', error.message);
  }
}

// Auto-run if called directly
if (require.main === module) {
  main();
}

module.exports = GoogleSearchConsoleAPI; 
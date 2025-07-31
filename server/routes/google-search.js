const express = require('express');
const router = express.Router();

// Import Google API services
const GoogleSearchConsoleAPI = require('../google-search-console-api');
const GoogleIndexingAPI = require('../google-indexing-api');

// Initialize APIs
const searchConsoleAPI = new GoogleSearchConsoleAPI();
const indexingAPI = new GoogleIndexingAPI();

/**
 * Submit sitemap to Google Search Console
 */
router.post('/submit-sitemap', async (req, res) => {
  try {
    // Initialize the API
    const initialized = await searchConsoleAPI.initialize();
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Search Console API' 
      });
    }

    // Submit sitemap
    const sitemapUrl = 'https://study-vault2.vercel.app/sitemap.xml';
    const result = await searchConsoleAPI.submitSitemap(sitemapUrl);
    
    res.json({ 
      success: true, 
      message: 'Sitemap submitted successfully', 
      details: result 
    });
  } catch (error) {
    console.error('Failed to submit sitemap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit sitemap', 
      error: error.message 
    });
  }
});

/**
 * Check sitemap status in Google Search Console
 */
router.get('/sitemap-status', async (req, res) => {
  try {
    // Initialize the API
    const initialized = await searchConsoleAPI.initialize();
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Search Console API' 
      });
    }

    // Get sitemaps
    const sitemaps = await searchConsoleAPI.listSitemaps();
    
    res.json({ 
      success: true, 
      message: 'Sitemap status retrieved successfully', 
      sitemaps 
    });
  } catch (error) {
    console.error('Failed to get sitemap status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get sitemap status', 
      error: error.message 
    });
  }
});

/**
 * Request Google to recrawl a specific URL
 */
router.post('/recrawl', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL is required' 
      });
    }

    // Initialize the API
    const initialized = await indexingAPI.initialize();
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Indexing API' 
      });
    }

    // Update URL in index
    const result = await indexingAPI.updateUrl(url);
    
    res.json({ 
      success: true, 
      message: 'URL recrawl requested successfully', 
      details: result 
    });
  } catch (error) {
    console.error('Failed to request URL recrawl:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request URL recrawl', 
      error: error.message 
    });
  }
});

/**
 * Bulk submit URLs for indexing
 */
router.post('/bulk-index', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid array of URLs is required' 
      });
    }

    // Initialize the API
    const initialized = await indexingAPI.initialize();
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Indexing API' 
      });
    }

    // Bulk update URLs
    const results = await indexingAPI.bulkUpdateUrls(urls);
    
    // Count successful submissions
    const successCount = results.filter(r => r.success).length;
    
    res.json({ 
      success: true, 
      message: `${successCount}/${urls.length} URLs indexed successfully`, 
      results 
    });
  } catch (error) {
    console.error('Failed to bulk index URLs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to bulk index URLs', 
      error: error.message 
    });
  }
});

module.exports = router; 
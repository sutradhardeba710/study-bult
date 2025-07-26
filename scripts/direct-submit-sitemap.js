/**
 * Direct sitemap submission script using ping URLs
 * Run with: node scripts/direct-submit-sitemap.js
 */

import https from 'https';

// Your sitemap URLs
const SITEMAP_URLS = [
  'https://study-vault2.vercel.app/sitemap.xml',
  'https://study-vault2.vercel.app/sitemap.txt'
];

// Search engines to ping
const SEARCH_ENGINES = [
  {
    name: 'Google',
    pingUrl: 'www.google.com/ping',
    paramName: 'sitemap'
  },
  {
    name: 'Bing',
    pingUrl: 'www.bing.com/ping',
    paramName: 'sitemap'
  }
];

/**
 * Ping a search engine with your sitemap URL
 */
function pingSearchEngine(engine, sitemapUrl) {
  return new Promise((resolve, reject) => {
    const url = `https://${engine.pingUrl}?${engine.paramName}=${encodeURIComponent(sitemapUrl)}`;
    
    console.log(`Pinging ${engine.name} with URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            engine: engine.name,
            sitemapUrl,
            statusCode: res.statusCode,
            success: true
          });
        } else {
          reject({
            engine: engine.name,
            sitemapUrl,
            statusCode: res.statusCode,
            success: false,
            error: `HTTP Status: ${res.statusCode}`
          });
        }
      });
    }).on('error', (err) => {
      reject({
        engine: engine.name,
        sitemapUrl,
        success: false,
        error: err.message
      });
    });
  });
}

/**
 * Submit all sitemaps to all search engines
 */
async function submitSitemaps() {
  console.log('Starting direct sitemap submission...');
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const sitemapUrl of SITEMAP_URLS) {
    console.log(`\nSubmitting sitemap: ${sitemapUrl}`);
    
    for (const engine of SEARCH_ENGINES) {
      try {
        const result = await pingSearchEngine(engine, sitemapUrl);
        console.log(`✅ Successfully pinged ${engine.name} for ${sitemapUrl}`);
        results.success.push(result);
      } catch (error) {
        console.error(`❌ Failed to ping ${engine.name} for ${sitemapUrl}: ${error.error || 'Unknown error'}`);
        results.failed.push(error);
      }
    }
  }
  
  // Print summary
  console.log('\n--- Submission Summary ---');
  console.log(`Total successful submissions: ${results.success.length}`);
  console.log(`Total failed submissions: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nManual submission instructions:');
    console.log('1. Google Search Console: https://search.google.com/search-console');
    console.log('2. Bing Webmaster Tools: https://www.bing.com/webmasters/about');
  }
}

// Run the submission
submitSitemaps().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
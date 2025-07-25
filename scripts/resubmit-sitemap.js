/**
 * This script directly pings Google to resubmit your sitemap
 * Run with: node scripts/resubmit-sitemap.js
 */

const https = require('https');
const url = require('url');

// Your sitemap URL
const SITEMAP_URL = 'https://study-vault2.vercel.app/sitemap.xml';

// Function to ping Google about your sitemap
function pingSearchEngine(searchEngine, sitemapUrl) {
  return new Promise((resolve, reject) => {
    const pingUrl = `http://www.${searchEngine}.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const parsedUrl = url.parse(pingUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET'
    };

    console.log(`Pinging ${searchEngine} at: ${pingUrl}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            searchEngine,
            statusCode: res.statusCode,
            message: `Successfully pinged ${searchEngine}`
          });
        } else {
          reject({
            searchEngine,
            statusCode: res.statusCode,
            message: `Failed to ping ${searchEngine}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        searchEngine,
        error: error.message,
        message: `Error pinging ${searchEngine}`
      });
    });
    
    req.end();
  });
}

// Main function
async function main() {
  console.log('Resubmitting sitemap to search engines...');
  console.log(`Sitemap URL: ${SITEMAP_URL}`);
  
  try {
    // Ping Google
    await pingSearchEngine('google', SITEMAP_URL);
    console.log('✅ Successfully pinged Google');
    
    // Ping Bing
    await pingSearchEngine('bing', SITEMAP_URL);
    console.log('✅ Successfully pinged Bing');
    
    console.log('\nAlternative manual submission methods:');
    console.log('1. Google Search Console: https://search.google.com/search-console');
    console.log('2. Bing Webmaster Tools: https://www.bing.com/webmasters/about');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nIf automatic pinging failed, try manual submission:');
    console.log('1. Google Search Console: https://search.google.com/search-console');
    console.log('2. Bing Webmaster Tools: https://www.bing.com/webmasters/about');
  }
}

// Run the script
main(); 
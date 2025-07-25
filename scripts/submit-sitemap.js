/**
 * This script submits the sitemap to Google Search Console via the Indexing API
 * You need to set up API access and credentials as described here:
 * https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */

const https = require('https');

// Replace with your actual sitemap URL
const SITEMAP_URL = 'https://study-vault2.vercel.app/sitemap.xml';

// Function to ping Google about your sitemap
function pingGoogle() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.google.com',
      path: '/ping?sitemap=' + encodeURIComponent(SITEMAP_URL),
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`Successfully pinged Google: Status code ${res.statusCode}`);
        } else {
          reject(`Failed to ping Google: Status code ${res.statusCode}`);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(`Error pinging Google: ${error.message}`);
    });
    
    req.end();
  });
}

// Function to ping Bing about your sitemap
function pingBing() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.bing.com',
      path: '/ping?sitemap=' + encodeURIComponent(SITEMAP_URL),
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`Successfully pinged Bing: Status code ${res.statusCode}`);
        } else {
          reject(`Failed to ping Bing: Status code ${res.statusCode}`);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(`Error pinging Bing: ${error.message}`);
    });
    
    req.end();
  });
}

// Run the pings
async function main() {
  try {
    console.log('Submitting sitemap to search engines...');
    
    const googleResult = await pingGoogle();
    console.log(googleResult);
    
    const bingResult = await pingBing();
    console.log(bingResult);
    
    console.log('Sitemap submission complete!');
  } catch (error) {
    console.error('Error submitting sitemap:', error);
  }
}

main(); 
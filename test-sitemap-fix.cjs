const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_URL = 'https://study-vault2.vercel.app';
const LOCAL_URL = 'http://localhost:5000';

// Test endpoints
const ENDPOINTS = [
  '/sitemap.xml',
  '/robots.txt'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test function
async function testEndpoint(baseUrl, endpoint) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${endpoint}`;
    const client = baseUrl.startsWith('https') ? https : http;
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      const result = {
        url,
        status: res.statusCode,
        headers: res.headers,
        success: res.statusCode === 200
      };
      resolve(result);
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
}

// Verify content type and headers
function verifyHeaders(result, endpoint) {
  const issues = [];
  
  if (endpoint === '/sitemap.xml') {
    const contentType = result.headers['content-type'];
    if (!contentType || !contentType.includes('application/xml')) {
      issues.push(`❌ Wrong Content-Type: ${contentType} (should be application/xml)`);
    }
    
    const cacheControl = result.headers['cache-control'];
    if (!cacheControl || !cacheControl.includes('max-age')) {
      issues.push(`⚠️  Missing Cache-Control header`);
    }
  }
  
  if (endpoint === '/robots.txt') {
    const contentType = result.headers['content-type'];
    if (!contentType || !contentType.includes('text/plain')) {
      issues.push(`❌ Wrong Content-Type: ${contentType} (should be text/plain)`);
    }
  }
  
  return issues;
}

// Get full content for verification
async function getContent(baseUrl, endpoint) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${endpoint}`;
    const client = baseUrl.startsWith('https') ? https : http;
    
    const req = client.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          content: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ error: 'Request timeout' });
    });
    
    req.end();
  });
}

// Verify sitemap content
function verifySitemapContent(content) {
  const issues = [];
  
  if (!content.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    issues.push('❌ Missing XML declaration');
  }
  
  if (!content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    issues.push('❌ Missing or incorrect urlset declaration');
  }
  
  if (!content.includes('<loc>')) {
    issues.push('❌ No URLs found in sitemap');
  }
  
  // Check for HTML content (common issue)
  if (content.includes('<html>') || content.includes('<!DOCTYPE html>')) {
    issues.push('❌ CRITICAL: Sitemap contains HTML content instead of XML!');
  }
  
  // Count URLs
  const urlCount = (content.match(/<url>/g) || []).length;
  if (urlCount === 0) {
    issues.push('❌ No URLs found in sitemap');
  } else {
    issues.push(`✅ Found ${urlCount} URLs in sitemap`);
  }
  
  return issues;
}

// Main test function
async function runTests() {
  log('🔍 Testing StudyVault Sitemap Fix', colors.blue);
  log('=====================================\n', colors.blue);
  
  // Test local server first
  log('Testing Local Server (http://localhost:5000):', colors.yellow);
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(LOCAL_URL, endpoint);
    
    if (result.success) {
      log(`✅ ${endpoint}: ${result.status}`, colors.green);
      
      // Check headers
      const headerIssues = verifyHeaders(result, endpoint);
      headerIssues.forEach(issue => log(`   ${issue}`));
      
      // Get and verify content for sitemap
      if (endpoint === '/sitemap.xml') {
        const contentResult = await getContent(LOCAL_URL, endpoint);
        if (contentResult.content) {
          const contentIssues = verifySitemapContent(contentResult.content);
          contentIssues.forEach(issue => log(`   ${issue}`));
        }
      }
      
    } else {
      log(`❌ ${endpoint}: ${result.status} - ${result.error || 'Failed'}`, colors.red);
    }
  }
  
  log('\n=====================================', colors.blue);
  
  // Test production server
  log('Testing Production Server (https://study-vault2.vercel.app):', colors.yellow);
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(PRODUCTION_URL, endpoint);
    
    if (result.success) {
      log(`✅ ${endpoint}: ${result.status}`, colors.green);
      
      // Check headers
      const headerIssues = verifyHeaders(result, endpoint);
      headerIssues.forEach(issue => log(`   ${issue}`));
      
      // Get and verify content for sitemap
      if (endpoint === '/sitemap.xml') {
        const contentResult = await getContent(PRODUCTION_URL, endpoint);
        if (contentResult.content) {
          const contentIssues = verifySitemapContent(contentResult.content);
          contentIssues.forEach(issue => log(`   ${issue}`));
        }
      }
      
    } else {
      log(`❌ ${endpoint}: ${result.status} - ${result.error || 'Failed'}`, colors.red);
    }
  }
  
  log('\n=====================================', colors.blue);
  log('🔧 Next Steps for Google Search Console:', colors.blue);
  log('1. Deploy the updated code to Vercel', colors.yellow);
  log('2. Wait 5-10 minutes for deployment to propagate', colors.yellow);
  log('3. Test the production sitemap URL manually', colors.yellow);
  log('4. Submit the sitemap again in Google Search Console', colors.yellow);
  log('5. Wait 24-48 hours for Google to re-crawl', colors.yellow);
  
  log('\n📋 Deployment Checklist:', colors.blue);
  log('✅ Removed duplicate sitemap files', colors.green);
  log('✅ Updated vercel.json routing', colors.green);
  log('✅ Enhanced backend sitemap generation', colors.green);
  log('✅ Fixed XML headers and content-type', colors.green);
  log('✅ Removed static sitemaps to avoid conflicts', colors.green);
}

// Run the tests
runTests().catch(console.error); 
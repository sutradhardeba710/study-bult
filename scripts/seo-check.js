/**
 * Simple SEO checker script
 * Run with: node scripts/seo-check.js
 */

const https = require('https');
const { parse } = require('node-html-parser');

// Site URL to check
const SITE_URL = 'https://study-vault2.vercel.app';

// Function to fetch HTML content
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to load ${url}: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to check SEO elements
async function checkSEO(url) {
  try {
    console.log(`Checking SEO for ${url}...`);
    
    const html = await fetchHTML(url);
    const root = parse(html);
    
    // Check title
    const title = root.querySelector('title');
    console.log('\n--- Title ---');
    if (title) {
      console.log(`✅ Title found: "${title.text}"`);
      if (title.text.length < 30) {
        console.log('⚠️ Title is too short (less than 30 characters)');
      } else if (title.text.length > 60) {
        console.log('⚠️ Title is too long (more than 60 characters)');
      } else {
        console.log('✅ Title length is optimal');
      }
    } else {
      console.log('❌ No title found');
    }
    
    // Check meta description
    const metaDescription = root.querySelector('meta[name="description"]');
    console.log('\n--- Meta Description ---');
    if (metaDescription) {
      const content = metaDescription.getAttribute('content');
      console.log(`✅ Meta description found: "${content}"`);
      if (content.length < 120) {
        console.log('⚠️ Meta description is too short (less than 120 characters)');
      } else if (content.length > 160) {
        console.log('⚠️ Meta description is too long (more than 160 characters)');
      } else {
        console.log('✅ Meta description length is optimal');
      }
    } else {
      console.log('❌ No meta description found');
    }
    
    // Check headings
    console.log('\n--- Headings ---');
    const h1 = root.querySelectorAll('h1');
    if (h1.length === 0) {
      console.log('❌ No H1 heading found');
    } else if (h1.length === 1) {
      console.log(`✅ H1 heading found: "${h1[0].text.trim()}"`);
    } else {
      console.log(`⚠️ Multiple H1 headings found (${h1.length})`);
    }
    
    // Check images with alt text
    console.log('\n--- Images ---');
    const images = root.querySelectorAll('img');
    if (images.length === 0) {
      console.log('ℹ️ No images found on the page');
    } else {
      const imagesWithAlt = images.filter(img => img.hasAttribute('alt') && img.getAttribute('alt').trim() !== '');
      console.log(`✅ ${imagesWithAlt.length}/${images.length} images have alt text`);
      if (imagesWithAlt.length < images.length) {
        console.log('⚠️ Some images are missing alt text');
      }
    }
    
    // Check canonical URL
    console.log('\n--- Canonical URL ---');
    const canonical = root.querySelector('link[rel="canonical"]');
    if (canonical) {
      console.log(`✅ Canonical URL found: "${canonical.getAttribute('href')}"`);
    } else {
      console.log('❌ No canonical URL found');
    }
    
    // Check mobile viewport
    console.log('\n--- Mobile Viewport ---');
    const viewport = root.querySelector('meta[name="viewport"]');
    if (viewport) {
      console.log(`✅ Viewport meta tag found: "${viewport.getAttribute('content')}"`);
    } else {
      console.log('❌ No viewport meta tag found');
    }
    
    // Check structured data
    console.log('\n--- Structured Data ---');
    const structuredData = root.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length > 0) {
      console.log(`✅ ${structuredData.length} structured data blocks found`);
    } else {
      console.log('❌ No structured data found');
    }
    
    console.log('\nSEO check completed!');
    
  } catch (error) {
    console.error('Error checking SEO:', error);
  }
}

// Run the SEO check
checkSEO(SITE_URL); 
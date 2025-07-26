/**
 * Simple sitemap validator script
 * Run with: node scripts/validate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

function validateSitemap() {
  console.log('Validating sitemap...');
  
  try {
    // Read the sitemap file
    const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
    console.log(`Sitemap file loaded: ${SITEMAP_PATH}`);
    
    // Parse the XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(sitemap, 'text/xml');
    console.log('XML parsed successfully');
    
    // Get all URLs
    const urlElements = doc.getElementsByTagName('url');
    console.log(`Found ${urlElements.length} URLs in sitemap`);
    
    // Validate each URL
    let hasErrors = false;
    let hasFutureDates = false;
    
    for (let i = 0; i < urlElements.length; i++) {
      const urlElement = urlElements[i];
      
      // Check for loc element
      const locElements = urlElement.getElementsByTagName('loc');
      if (locElements.length === 0) {
        console.error(`Error: URL at index ${i} is missing a loc element`);
        hasErrors = true;
        continue;
      }
      
      const loc = locElements[0].textContent;
      
      // Check for lastmod element
      const lastmodElements = urlElement.getElementsByTagName('lastmod');
      if (lastmodElements.length === 0) {
        console.warn(`Warning: URL ${loc} is missing a lastmod element`);
        continue;
      }
      
      const lastmod = lastmodElements[0].textContent;
      
      // Check if lastmod is a valid date
      if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
        console.error(`Error: URL ${loc} has an invalid lastmod date format: ${lastmod}`);
        hasErrors = true;
        continue;
      }
      
      // Check if lastmod is in the future
      const lastmodDate = new Date(lastmod);
      const today = new Date();
      
      if (lastmodDate > today) {
        console.error(`Error: URL ${loc} has a future lastmod date: ${lastmod}`);
        hasErrors = true;
        hasFutureDates = true;
      }
    }
    
    // Final result
    if (hasErrors) {
      console.error('\nSitemap validation failed!');
      if (hasFutureDates) {
        console.error('Future dates detected! Google will reject your sitemap.');
        console.error('Please update your sitemap generator to use current or past dates.');
      }
      return false;
    } else {
      console.log('\n✅ Sitemap validation successful!');
      console.log('Your sitemap appears to be valid and ready for submission to Google.');
      return true;
    }
  } catch (error) {
    console.error('Error validating sitemap:', error);
    return false;
  }
}

// Run the validation
validateSitemap(); 
// Script to check Google Search Console verification
const https = require('https');

const domain = 'study-vault2.vercel.app';
const verificationFile = 'google7gNNxuxFze935OwrznhPaNPnkGQ9jFleE2MS4fO5zE0.html';
const expectedContent = 'google-site-verification: google7gNNxuxFze935OwrznhPaNPnkGQ9jFleE2MS4fO5zE0.html';

console.log(`Checking Google Search Console verification for ${domain}...`);

// Check HTML verification file
https.get(`https://${domain}/${verificationFile}`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`✅ Verification file accessible at https://${domain}/${verificationFile}`);
      
      if (data.trim() === expectedContent) {
        console.log('✅ Verification file content is correct');
      } else {
        console.log('❌ Verification file content is incorrect');
        console.log(`Expected: "${expectedContent}"`);
        console.log(`Received: "${data.trim()}"`);
      }
    } else {
      console.log(`❌ Verification file not accessible (Status: ${res.statusCode})`);
    }
    
    // Check meta tag
    checkMetaTag();
  });
}).on('error', (err) => {
  console.log(`❌ Error accessing verification file: ${err.message}`);
  checkMetaTag();
});

// Check meta tag in index.html
function checkMetaTag() {
  https.get(`https://${domain}/`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ Homepage accessible`);
        
        const metaTagRegex = /<meta\s+name="google-site-verification"\s+content="7gNNxuxFze935OwrznhPaNPnkGQ9jFleE2MS4fO5zE0"\s*\/?>/i;
        if (metaTagRegex.test(data)) {
          console.log('✅ Google verification meta tag found in homepage');
        } else {
          console.log('❌ Google verification meta tag not found in homepage');
        }
      } else {
        console.log(`❌ Homepage not accessible (Status: ${res.statusCode})`);
      }
      
      // Check sitemap
      checkSitemap();
    });
  }).on('error', (err) => {
    console.log(`❌ Error accessing homepage: ${err.message}`);
    checkSitemap();
  });
}

// Check sitemap
function checkSitemap() {
  https.get(`https://${domain}/sitemap.xml`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ Sitemap accessible at https://${domain}/sitemap.xml`);
        
        // Check if sitemap contains the correct domain
        if (data.includes(`https://${domain}/`)) {
          console.log('✅ Sitemap contains correct domain references');
        } else {
          console.log('❌ Sitemap does not contain correct domain references');
        }
      } else {
        console.log(`❌ Sitemap not accessible (Status: ${res.statusCode})`);
      }
      
      // Check robots.txt
      checkRobotsTxt();
    });
  }).on('error', (err) => {
    console.log(`❌ Error accessing sitemap: ${err.message}`);
    checkRobotsTxt();
  });
}

// Check robots.txt
function checkRobotsTxt() {
  https.get(`https://${domain}/robots.txt`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ robots.txt accessible at https://${domain}/robots.txt`);
        
        // Check if robots.txt contains the correct sitemap URL
        const expectedSitemapUrl = `Sitemap: https://${domain}/sitemap.xml`;
        if (data.includes(expectedSitemapUrl)) {
          console.log('✅ robots.txt contains correct sitemap URL');
        } else {
          console.log('❌ robots.txt does not contain correct sitemap URL');
          console.log(`Expected: "${expectedSitemapUrl}"`);
        }
      } else {
        console.log(`❌ robots.txt not accessible (Status: ${res.statusCode})`);
      }
      
      console.log('\nVerification Summary:');
      console.log('1. Deploy your website to make these changes live');
      console.log('2. Go to Google Search Console: https://search.google.com/search-console');
      console.log('3. Add your property using URL prefix: https://study-vault2.vercel.app/');
      console.log('4. Choose HTML file verification method and verify ownership');
      console.log('5. After verification, submit your sitemap by going to "Sitemaps" section');
    });
  }).on('error', (err) => {
    console.log(`❌ Error accessing robots.txt: ${err.message}`);
    
    console.log('\nVerification Summary:');
    console.log('1. Deploy your website to make these changes live');
    console.log('2. Go to Google Search Console: https://search.google.com/search-console');
    console.log('3. Add your property using URL prefix: https://study-vault2.vercel.app/');
    console.log('4. Choose HTML file verification method and verify ownership');
    console.log('5. After verification, submit your sitemap by going to "Sitemaps" section');
  });
} 
import https from 'https';

const domain = 'study-vault2.vercel.app';
const paths = ['/sitemap.xml', '/robots.txt', '/google7gNNxuxFze935OwrznhPaNPnkGQ9jFleE2MS4fO5zE0.html'];

console.log(`Testing files on ${domain}...\n`);

async function testPath(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      path: path,
      method: 'HEAD',
    };

    const req = https.request(options, (res) => {
      console.log(`${path}:`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Content-Type: ${res.headers['content-type'] || 'Not specified'}`);
      
      if (path === '/sitemap.xml') {
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/xml')) {
          console.log('  ✅ Correct content type for sitemap.xml');
        } else {
          console.log('  ❌ Wrong content type for sitemap.xml. Should be application/xml');
        }
      }
      
      if (path === '/robots.txt') {
        if (res.headers['content-type'] && res.headers['content-type'].includes('text/plain')) {
          console.log('  ✅ Correct content type for robots.txt');
        } else {
          console.log('  ❌ Wrong content type for robots.txt. Should be text/plain');
        }
      }
      
      console.log('');
      resolve();
    });

    req.on('error', (error) => {
      console.error(`Error accessing ${path}: ${error.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (const path of paths) {
    await testPath(path);
  }
  
  console.log('\nNote: If you see incorrect content types, it may be because:');
  console.log('1. The changes to vercel.json have not been deployed yet');
  console.log('2. Vercel\'s cache might still be serving the old version');
  console.log('\nTo fix:');
  console.log('1. Commit and push the changes to your repository');
  console.log('2. Deploy the changes to Vercel');
  console.log('3. You may need to wait a few minutes for the changes to propagate');
}

runTests(); 
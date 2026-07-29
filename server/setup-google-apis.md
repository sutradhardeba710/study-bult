# Google APIs Setup Guide

## 🚀 Complete Setup for Google Search Console & Indexing APIs

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name: "StudyVault SEO APIs"
4. Click "Create"

### **Step 2: Enable Required APIs**

1. Go to **APIs & Services → Library**
2. Search and enable:
   - **Google Search Console API**
   - **Google Indexing API**

### **Step 3: Create Service Account**

1. Go to **APIs & Services → Credentials**
2. Click **"Create Credentials" → "Service Account"**
3. Name: "StudyVault SEO Service"
4. Role: **"Owner"** (for full access)
5. Click **"Create and Continue"**
6. Click **"Done"**

### **Step 4: Generate JSON Key**

1. Click on your service account email
2. Go to **"Keys"** tab
3. Click **"Add Key" → "Create New Key"**
4. Choose **"JSON"**
5. Download and save as `server/credentials.json`

### **Step 5: Grant Search Console Access**

1. Copy the service account email (ends with `@project-id.iam.gserviceaccount.com`)
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Select your property: `https://study-vault2.vercel.app`
4. Go to **Settings → Users and permissions**
5. Click **"Add User"**
6. Paste the service account email
7. Set permission: **"Owner"**
8. Click **"Add"**

### **Step 6: Install Dependencies**

```bash
npm install googleapis
```

### **Step 7: Usage Examples**

#### **Automatic Sitemap Submission**
```javascript
const GoogleSearchConsoleAPI = require('./google-search-console-api');

const gscAPI = new GoogleSearchConsoleAPI();
await gscAPI.initialize();

// Submit new sitemap
await gscAPI.submitSitemap('https://study-vault2.vercel.app/xml-sitemap.xml');

// Replace old sitemap
await gscAPI.refreshSitemap(
  'https://study-vault2.vercel.app/xml-sitemap.xml',
  'https://study-vault2.vercel.app/sitemap.xml'
);
```

#### **Fast URL Indexing**
```javascript
const GoogleIndexingAPI = require('./google-indexing-api');

const indexingAPI = new GoogleIndexingAPI();
await indexingAPI.initialize();

// Index important URLs immediately
await indexingAPI.bulkUpdateUrls([
  'https://study-vault2.vercel.app/',
  'https://study-vault2.vercel.app/browse',
  'https://study-vault2.vercel.app/upload'
]);
```

### **Step 8: Automated Deployment Integration**

Add to your `package.json`:

```json
{
  "scripts": {
    "deploy:seo": "node server/google-search-console-api.js && node server/google-indexing-api.js"
  }
}
```

### **Step 9: Vercel Deployment Hooks**

Create `scripts/post-deploy.js`:

```javascript
const GoogleSearchConsoleAPI = require('../server/google-search-console-api');
const GoogleIndexingAPI = require('../server/google-indexing-api');

async function postDeploy() {
  console.log('🚀 Starting post-deployment SEO tasks...');
  
  try {
    // 1. Submit fresh sitemap
    const gscAPI = new GoogleSearchConsoleAPI();
    await gscAPI.initialize();
    await gscAPI.refreshSitemap('https://study-vault2.vercel.app/xml-sitemap.xml');
    
    // 2. Index key pages immediately
    const indexingAPI = new GoogleIndexingAPI();
    await indexingAPI.initialize();
    await indexingAPI.updateUrl('https://study-vault2.vercel.app/');
    
    console.log('✅ Post-deployment SEO completed!');
  } catch (error) {
    console.error('❌ Post-deployment SEO failed:', error);
  }
}

postDeploy();
```

## 🔥 **Benefits of This Approach**

✅ **Automated Sitemap Submission** - No manual work needed  
✅ **Instant URL Indexing** - Pages get indexed within hours instead of days/weeks  
✅ **Integration with CI/CD** - Automatically runs after each deployment  
✅ **Error Handling** - Robust error handling and logging  
✅ **Rate Limiting** - Respects Google's API limits  
✅ **Multiple Sitemaps** - Can manage multiple sitemaps easily

## 📊 **API Limits**

- **Search Console API**: 1,200 requests/day
- **Indexing API**: 200 requests/day
- **Rate Limiting**: Max 1 request/second recommended

## 🚨 **Security Best Practices**

1. **Never commit `credentials.json`** - Add to `.gitignore`
2. **Use environment variables** for production
3. **Rotate service account keys** regularly
4. **Monitor API usage** in Google Cloud Console

## 🎯 **Next Steps**

1. Test the APIs with your credentials
2. Integrate with your deployment pipeline
3. Monitor indexing performance in Search Console
4. Set up automated reporting 
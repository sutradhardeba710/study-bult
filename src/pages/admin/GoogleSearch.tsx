import React from 'react';
import GoogleSearchVerification from '../../components/GoogleSearchVerification';
import SitemapGenerator from '../../components/SitemapGenerator';

const GoogleSearch: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Google Search Console Integration</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Google Search Console Overview</h2>
          <p className="mb-4">
            This page helps you manage your site's presence on Google Search by allowing you to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Submit your sitemap to Google Search Console</li>
            <li>Generate a fresh sitemap with the latest content</li>
            <li>Request Google to index specific URLs</li>
            <li>Monitor the status of your sitemap submission</li>
          </ul>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To use these features, you must have a verified Google Search Console property for this domain
              and the proper service account credentials configured.
            </p>
          </div>
        </div>
        
        {/* Verification Status Component */}
        <GoogleSearchVerification />
        
        {/* Sitemap Generator Component */}
        <SitemapGenerator />
        
        {/* SEO Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">SEO Best Practices</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Keep your sitemap updated</h3>
              <p className="text-sm text-gray-600">
                Regularly generate new sitemaps when content changes significantly.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Prioritize important pages</h3>
              <p className="text-sm text-gray-600">
                Make sure your most important pages are included in the sitemap and submit them directly for indexing.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Use proper meta tags</h3>
              <p className="text-sm text-gray-600">
                Ensure each page has unique and descriptive title, description, and other meta tags.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Monitor indexing status</h3>
              <p className="text-sm text-gray-600">
                Regularly check Google Search Console to see which pages are indexed and fix any issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSearch; 
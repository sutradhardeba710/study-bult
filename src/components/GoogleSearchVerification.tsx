import React, { useState, useEffect } from 'react';
import googleSearchService from '../services/google-search';

interface GoogleSearchVerificationProps {
  className?: string;
}

const GoogleSearchVerification: React.FC<GoogleSearchVerificationProps> = ({ className }) => {
  const [sitemapStatus, setSitemapStatus] = useState<{
    success: boolean;
    message: string;
    sitemaps?: any[];
  }>({
    success: false,
    message: 'Loading sitemap status...',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch sitemap status on component mount
  useEffect(() => {
    checkSitemapStatus();
  }, []);

  // Check sitemap status in Google Search Console
  const checkSitemapStatus = async () => {
    try {
      const status = await googleSearchService.checkSitemapStatus();
      setSitemapStatus(status);
    } catch (error) {
      console.error('Failed to check sitemap status:', error);
      setSitemapStatus({
        success: false,
        message: 'Failed to check sitemap status',
      });
    }
  };

  // Submit sitemap to Google Search Console
  const handleSubmitSitemap = async () => {
    setIsSubmitting(true);
    setSubmitMessage('Submitting sitemap...');
    
    try {
      const result = await googleSearchService.submitSitemap();
      setSubmitMessage(result.message);
      
      // Refresh status after submission
      await checkSitemapStatus();
    } catch (error) {
      console.error('Failed to submit sitemap:', error);
      setSubmitMessage('Failed to submit sitemap');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
      <h2 className="text-lg font-semibold mb-4">Google Search Integration</h2>
      
      {/* Status Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Sitemap Status</h3>
        <div className={`text-sm p-3 rounded ${sitemapStatus.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
          {sitemapStatus.message}
        </div>
        
        {sitemapStatus.sitemaps && sitemapStatus.sitemaps.length > 0 ? (
          <div className="mt-2">
            <p className="text-sm font-medium">Registered sitemaps:</p>
            <ul className="list-disc pl-5 text-sm">
              {sitemapStatus.sitemaps.map((sitemap, index) => (
                <li key={index}>{sitemap.feedpath} - {sitemap.type}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm mt-2">No sitemaps are currently registered.</p>
        )}
      </div>
      
      {/* Actions Section */}
      <div>
        <button
          onClick={handleSubmitSitemap}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white font-medium ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Sitemap to Google'}
        </button>
        
        {submitMessage && (
          <p className={`mt-2 text-sm ${
            submitMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {submitMessage}
          </p>
        )}
        
        <button
          onClick={checkSitemapStatus}
          className="mt-2 px-4 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default GoogleSearchVerification; 
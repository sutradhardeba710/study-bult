import React, { useState } from 'react';
import axios from 'axios';

interface SitemapGeneratorProps {
  className?: string;
}

const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  // Get base URL from environment or window location
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  
  const [mainUrls, setMainUrls] = useState<string[]>([
    `${baseUrl}/`,
    `${baseUrl}/browse`,
    `${baseUrl}/about`
  ]);
  const [customUrl, setCustomUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate sitemap
  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    setStatus('Generating sitemap...');

    try {
      // Call backend to generate sitemap - ensure endpoint matches server route
      const response = await axios.post('/api/sitemap/generate');
      setStatus(`Sitemap generated successfully: ${response.data.path || 'sitemap.xml'}`);
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      setStatus('Failed to generate sitemap. Check server logs for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add custom URL to the list
  const handleAddUrl = () => {
    if (customUrl && !mainUrls.includes(customUrl)) {
      setMainUrls([...mainUrls, customUrl]);
      setCustomUrl('');
    }
  };

  // Remove URL from the list
  const handleRemoveUrl = (urlToRemove: string) => {
    setMainUrls(mainUrls.filter(url => url !== urlToRemove));
  };

  // Submit URLs to Google for indexing
  const handleSubmitUrls = async () => {
    if (mainUrls.length === 0) return;
    
    setIsSubmitting(true);
    setStatus('Submitting URLs to Google for indexing...');
    
    try {
      // Make sure this endpoint matches the server route configuration
      const response = await axios.post('/api/google-search/bulk-index', { urls: mainUrls });
      
      if (response.data && response.data.success) {
        setStatus(`${response.data.message}`);
      } else {
        setStatus(`Error: ${response.data?.message || 'Unknown error occurred'}`);
      }
    } catch (error: any) {
      console.error('Failed to submit URLs for indexing:', error);
      setStatus(`Failed to submit URLs: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
      <h2 className="text-lg font-semibold mb-4">Sitemap & URL Indexing Tools</h2>
      
      {/* Sitemap Generation */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Generate Sitemap</h3>
        <button
          onClick={handleGenerateSitemap}
          disabled={isGenerating}
          className={`px-4 py-2 rounded text-white font-medium ${
            isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate New Sitemap'}
        </button>
      </div>
      
      {/* URL Management */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">URL Indexing</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Add URL to index</label>
          <div className="flex">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={`${baseUrl}/example`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm"
            />
            <button
              onClick={handleAddUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 text-sm"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* URL List */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">URLs to index ({mainUrls.length}):</p>
          <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
            {mainUrls.map((url, index) => (
              <li key={index} className="flex justify-between items-center text-sm py-1">
                <span className="truncate flex-1">{url}</span>
                <button
                  onClick={() => handleRemoveUrl(url)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </li>
            ))}
            {mainUrls.length === 0 && (
              <li className="text-gray-500 text-sm py-1">No URLs added</li>
            )}
          </ul>
        </div>
        
        <button
          onClick={handleSubmitUrls}
          disabled={isSubmitting || mainUrls.length === 0}
          className={`px-4 py-2 rounded text-white font-medium ${
            isSubmitting || mainUrls.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit URLs to Google'}
        </button>
      </div>
      
      {/* Status Message */}
      {status && (
        <div className={`p-3 rounded text-sm ${
          status.includes('success') || status.includes('generated') 
            ? 'bg-green-100 text-green-800'
            : status.includes('Failed')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default SitemapGenerator; 
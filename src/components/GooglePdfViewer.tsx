import React, { useState } from 'react';

interface GooglePdfViewerProps {
  fileUrl: string;
  width?: string | number;
  height?: string | number;
  title?: string;
}

/**
 * A component that uses Google's PDF Viewer to display PDFs
 * with custom styling applied to the container instead of injecting CSS
 */
const GooglePdfViewer: React.FC<GooglePdfViewerProps> = ({
  fileUrl,
  width = '100%',
  height = '500px',
  title = 'PDF Document'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Encode the URL for Google Docs Viewer and add parameters to hide UI elements
  // Add parameters to hide UI elements directly in the URL
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true&chrome=false&dov=1`;

  // Handle iframe load event - just set loaded state
  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="google-pdf-viewer-container relative" style={{ width, height }}>
      {/* Custom loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      )}

      <iframe
        id="google-pdf-viewer"
        src={googleDocsUrl}
        title={title}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa',
          overflow: 'auto'
        }}
        allowFullScreen
        onLoad={handleIframeLoad}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        sandbox="allow-scripts allow-same-origin allow-forms"
      ></iframe>

      {/* Custom watermark/overlay hidden */}
      <div className="hidden absolute bottom-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
        Study Volte PDF Viewer
      </div>
    </div>
  );
};

export default GooglePdfViewer; 
import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Maximize, Minimize, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Printer, RotateCw, Share2, Search, BookOpen } from 'lucide-react';
import GooglePdfViewer from './GooglePdfViewer';
import Button from './Button';
import './PdfViewer.css';

interface PdfViewerProps {
  fileUrl: string;
  title: string;
  onDownload?: () => void;
}

/**
 * A component that provides multiple options for viewing PDFs with a custom interface
 */
const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  title,
  onDownload
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerType, setViewerType] = useState<'google' | 'direct'>('google');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Prevent background scrolling when PDF is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Simulate loading and page count
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      // This is just a placeholder - in a real implementation, 
      // we would get the actual page count from the PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [fileUrl]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    const printWindow = window.open(fileUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  const directViewerUrl = fileUrl;

  return (
    <div 
      className={`pdf-viewer-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 fullscreen' : 'relative'}`}
      style={{ height: isFullscreen ? '100vh' : '70vh' }}
    >
      {/* Custom toolbar */}
      <div className="hidden flex-col sm:flex-row justify-between items-start sm:items-center mb-2 bg-gray-100 p-2 rounded shadow-sm pdf-toolbar">
        <div className="font-medium truncate mr-2 mb-2 sm:mb-0 flex items-center">
          <BookOpen className="mr-2 text-primary-600" size={18} />
          <span className="text-gray-800">{title}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto justify-end">
          {/* Viewer type selector */}
          <div className="hidden">
            <button 
              className={`px-2 py-1 text-xs sm:text-sm ${viewerType === 'google' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewerType('google')}
            >
              Google Viewer
            </button>
            <button 
              className={`px-2 py-1 text-xs sm:text-sm ${viewerType === 'direct' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewerType('direct')}
            >
              Direct
            </button>
          </div>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowControls(!showControls)}
            title={showControls ? "Hide controls" : "Show controls"}
            className="hidden"
          >
            {showControls ? "Hide Controls" : "Show Controls"}
          </Button>
        </div>
      </div>

      {/* Page controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 bg-white p-2 rounded shadow-sm page-controls">
          <div className="flex items-center space-x-1">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <input 
                type="number" 
                value={currentPage} 
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= totalPages) {
                    setCurrentPage(value);
                  }
                }}
                className="w-10 text-center bg-transparent border-none focus:outline-none"
                min={1}
                max={totalPages}
                disabled={isLoading}
              />
              <span className="text-gray-600 text-sm">/ {isLoading ? '...' : totalPages}</span>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              title="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={zoom <= 50 || isLoading}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </Button>
            
            <div className="bg-gray-100 px-2 py-1 rounded text-sm">
              {zoom}%
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoom >= 200 || isLoading}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            {onDownload && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onDownload}
                title="Download PDF"
              >
                <Download size={16} className="mr-1" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={openInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={16} className="mr-1" />
              <span className="hidden sm:inline">Open</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handlePrint}
              title="Print"
            >
              <Printer size={16} className="mr-1" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </Button>
          </div>
        </div>
      )}
      
      {/* PDF content with custom wrapper */}
      <div className="pdf-content h-full relative bg-gray-200 rounded shadow-inner overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4 pdf-loading-spinner"></div>
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        )}
        
        <div className="w-full h-full" style={{ 
          transform: viewerType === 'direct' ? `scale(${zoom / 100})` : 'none', 
          transformOrigin: 'center top',
          transition: 'transform 0.2s ease'
        }}>
          {viewerType === 'google' ? (
            <div className="w-full h-full custom-google-viewer">
              <GooglePdfViewer 
                fileUrl={fileUrl} 
                title={title} 
                height="100%" 
                width="100%" 
              />
            </div>
          ) : (
            <iframe 
              src={directViewerUrl} 
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>
      </div>
      
      {/* Mobile controls toggle - hidden */}
      <button 
        className="hidden sm:hidden fixed bottom-4 right-4 bg-primary-600 text-white p-2 rounded-full shadow-lg z-20 mobile-controls-toggle"
        onClick={() => setShowControls(!showControls)}
      >
        {showControls ? <Minimize size={20} /> : <Search size={20} />}
      </button>
    </div>
  );
};

export default PdfViewer; 
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
  showBadge?: boolean;
}

/**
 * A component that displays a PDF icon with styling
 * This version doesn't try to render actual PDF content to avoid CORS issues
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ 
  fileUrl, 
  width = 40, 
  height = 56,
  showBadge = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [fileExists, setFileExists] = useState(true);

  // Check if the file exists by making a HEAD request
  useEffect(() => {
    if (!fileUrl) {
      setFileExists(false);
      setIsLoading(false);
      return;
    }

    const checkFile = async () => {
      try {
        setIsLoading(true);
        
        // Simple HEAD request to check if file exists
        const response = await fetch(fileUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Use no-cors to avoid CORS issues
        });
        
        // Since no-cors doesn't give us status, we'll assume success
        setFileExists(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking PDF:', err);
        setFileExists(false);
        setIsLoading(false);
      }
    };

    checkFile();
  }, [fileUrl]);

  // Generate a color based on the fileUrl (for visual variety)
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate hue from 0 to 360
    const hue = hash % 360;
    
    // Use a pastel color with fixed saturation and lightness
    return `hsl(${hue}, 70%, 85%)`;
  };

  const bgColor = fileUrl ? getColorFromString(fileUrl) : '#f3f4f6';
  const textColor = fileUrl ? `hsl(${getColorFromString(fileUrl).match(/\d+/)?.[0] || 0}, 80%, 30%)` : '#9ca3af';

  // Show loading state
  if (isLoading) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center bg-gray-100 rounded overflow-hidden animate-pulse"
      >
        <FileText className="w-2/3 h-2/3 text-gray-300" />
      </div>
    );
  }

  // Show error state or placeholder
  if (!fileExists) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center bg-gray-100 rounded overflow-hidden"
      >
        <FileText className="w-2/3 h-2/3 text-gray-400" />
        {showBadge && (
          <div className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-tl">
            PDF
          </div>
        )}
      </div>
    );
  }

  // Get file name from URL for display
  const fileName = fileUrl.split('/').pop()?.split('?')[0] || '';
  const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF';
  
  // First letter of the filename (excluding extension)
  const firstLetter = fileName.replace(/\.[^/.]+$/, "").charAt(0).toUpperCase();

  // Show styled PDF icon
  return (
    <div 
      style={{ width, height, backgroundColor: bgColor }} 
      className="relative rounded overflow-hidden shadow-sm flex flex-col"
    >
      {/* Top part (page fold) */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-20">
        <div 
          className="absolute bottom-0 left-0 w-0 h-0 border-b-[8px] border-r-[8px]"
          style={{ 
            borderBottomColor: bgColor, 
            borderRightColor: 'transparent' 
          }}
        ></div>
      </div>
      
      {/* Document icon */}
      <div className="flex-grow flex items-center justify-center">
        <FileText 
          className="w-1/2 h-1/2" 
          style={{ color: textColor }} 
        />
      </div>
      
      {/* First letter of filename */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg"
        style={{ color: textColor }}
      >
        {firstLetter}
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black bg-opacity-20"></div>
      
      {/* PDF badge */}
      {showBadge && (
        <div className="absolute bottom-0 right-0 bg-primary-600 text-white text-[8px] px-1 rounded-tl">
          {fileExt}
        </div>
      )}
    </div>
  );
};

export default PDFThumbnail; 
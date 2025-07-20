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
 * Uses a visually appealing document icon with the first letter of the filename
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ 
  fileUrl, 
  width = 40, 
  height = 56,
  showBadge = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for a brief period
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [fileUrl]);

  // Generate a color based on the fileUrl (for visual variety)
  const getColorFromString = (str: string) => {
    if (!str) return '#f3f4f6';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate hue from 0 to 360
    const hue = Math.abs(hash % 360);
    
    // Use a pastel color with fixed saturation and lightness
    return `hsl(${hue}, 70%, 85%)`;
  };

  // Get file name from URL for display
  const fileName = fileUrl?.split('/').pop()?.split('?')[0] || 'doc';
  const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF';
  
  // First letter of the filename (excluding extension)
  const firstLetter = fileName.replace(/\.[^/.]+$/, "").charAt(0).toUpperCase() || 'D';

  // Generate colors
  const bgColor = getColorFromString(fileUrl);
  const textColor = `hsl(${parseInt(bgColor.match(/\d+/)?.[0] || '0')}, 80%, 30%)`;

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

  // Show styled PDF icon
  return (
    <div 
      style={{ width, height }} 
      className="relative rounded overflow-hidden shadow-sm flex flex-col"
    >
      {/* Document background with color */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: bgColor }}
      ></div>
      
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
      <div className="relative flex-grow flex items-center justify-center z-10">
        <FileText 
          className="w-1/2 h-1/2" 
          style={{ color: textColor }} 
        />
      </div>
      
      {/* First letter of filename */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg z-20"
        style={{ color: textColor }}
      >
        {firstLetter}
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black bg-opacity-20 z-10"></div>
      
      {/* PDF badge */}
      {showBadge && (
        <div className="absolute bottom-0 right-0 bg-primary-600 text-white text-[8px] px-1 rounded-tl z-20">
          {fileExt}
        </div>
      )}
    </div>
  );
};

export default PDFThumbnail; 
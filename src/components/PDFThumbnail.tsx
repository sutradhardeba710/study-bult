import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * A thumbnail component for PDFs
 * Attempts to generate a thumbnail from the PDF URL using Cloudinary
 * Falls back to a placeholder icon if the thumbnail cannot be generated
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ fileUrl, width = 40, height = 56, className = '' }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    // Check if it's a Cloudinary URL
    if (fileUrl.includes('cloudinary.com')) {
      // Create a thumbnail URL by adding transformation parameters
      // This uses Cloudinary's PDF to image conversion with page 1 at 40% quality
      const baseUrl = fileUrl.split('/upload/')[0] + '/upload/';
      const filePathAndOptions = fileUrl.split('/upload/')[1];
      
      // Add transformation for PDF: extract first page, convert to JPG, resize
      const thumbnailUrl = `${baseUrl}w_${width*2},h_${height*2},c_fill,pg_1,q_40/f_jpg/${filePathAndOptions}`;
      setThumbnailUrl(thumbnailUrl);
    } else {
      // For non-Cloudinary URLs, we can't generate thumbnails
      setError(true);
    }
    
    setLoading(false);
  }, [fileUrl, width, height]);

  if (loading) {
    return (
      <div 
        style={{ width, height }} 
        className={`flex items-center justify-center bg-gray-100 rounded overflow-hidden animate-pulse ${className}`}
      >
        <div className="w-2/3 h-2/3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <div 
        style={{ width, height }} 
        className={`flex items-center justify-center bg-gray-100 rounded overflow-hidden ${className}`}
      >
        <FileText className="w-2/3 h-2/3 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      style={{ width, height }} 
      className={`bg-gray-100 rounded overflow-hidden ${className}`}
    >
      <img 
        src={thumbnailUrl} 
        alt="PDF Preview" 
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default PDFThumbnail; 
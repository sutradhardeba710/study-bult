import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  thumbnailUrl?: string;
}

/**
 * A thumbnail component for PDFs
 * Displays server-generated thumbnail if available
 * Falls back to object tag preview for legacy files
 * Optimized for smooth scrolling and loading
 */
const PDFThumbnail = React.memo(({
  fileUrl,
  width = 80,
  height = 110,
  className = '',
  title = 'PDF',
  thumbnailUrl
}: PDFThumbnailProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const firstLetter = title.charAt(0).toUpperCase();

  // Clean white placeholder that sits behind content
  const Placeholder = () => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-white"
    >
      <div className="bg-gray-50 rounded-lg p-3 mb-2 shadow-sm">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <div className="text-sm font-semibold text-gray-700">{firstLetter}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">PDF</div>
    </div>
  );

  // If we have a pre-generated thumbnail, use it
  if (thumbnailUrl && !imageError) {
    return (
      <div
        style={{ width, height }}
        className={`rounded overflow-hidden relative bg-white shadow-sm border border-gray-200 ${className}`}
      >
        {/* Always render placeholder behind image for smooth loading */}
        <Placeholder />

        <img
          src={thumbnailUrl}
          alt={`${title} thumbnail`}
          className={`relative z-10 w-full h-full object-contain bg-white ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Show actual PDF preview using object tag with loading state
  return (
    <div
      style={{ width, height }}
      className={`rounded overflow-hidden relative bg-white shadow-sm border border-gray-200 ${className}`}
    >
      {/* Placeholder visible while object loads */}
      <Placeholder />

      <div
        style={{
          width,
          height,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'white',
          zIndex: 10
        }}
      >
        <object
          data={`${fileUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          type="application/pdf"
          width={width + 20}
          height={height + 20}
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            overflow: 'hidden',
            pointerEvents: 'none',
            border: 'none',
            display: 'block',
            opacity: imageLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={() => setImageLoading(false)}
        >
          {/* Fallback content for object tag */}
          <div className="flex items-center justify-center h-full bg-white">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </object>

        {/* Force clear loading state after timeout as object onLoad is unreliable */}
        <img
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          alt=""
          style={{ display: 'none' }}
          onLoad={() => {
            setTimeout(() => setImageLoading(false), 2000);
          }}
        />
      </div>
    </div>
  );
});

export default PDFThumbnail;
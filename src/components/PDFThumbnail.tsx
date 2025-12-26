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
 * Displays actual PDF preview using object tag
 * Falls back to thumbnail image or clean placeholder
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  fileUrl,
  width = 80,
  height = 110,
  className = '',
  title = 'PDF',
  thumbnailUrl
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const firstLetter = title.charAt(0).toUpperCase();

  // Clean white placeholder
  const renderPlaceholder = () => (
    <div
      style={{ width, height }}
      className={`rounded overflow-hidden flex flex-col items-center justify-center shadow-sm bg-white border border-gray-200 ${className}`}
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
        {imageLoading && (
          <div
            style={{ width, height }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white"
          >
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <FileText className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <div className="text-xs text-gray-500 mt-1">Loading...</div>
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={`${title} thumbnail`}
          className={`w-full h-full object-contain bg-white ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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

  // Show actual PDF preview using object tag
  return (
    <div
      style={{ width, height }}
      className={`rounded overflow-hidden relative bg-white shadow-sm border border-gray-200 ${className}`}
    >
      <div
        style={{
          width,
          height,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'white'
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
            display: 'block'
          }}
        >
          {renderPlaceholder()}
        </object>
      </div>
    </div>
  );
};

export default PDFThumbnail;
import React from 'react';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
}

/**
 * A simple thumbnail component for PDFs
 * Uses a placeholder icon instead of trying to render the actual PDF
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ width = 40, height = 56 }) => {
  return (
    <div 
      style={{ width, height }} 
      className="flex items-center justify-center bg-gray-100 rounded overflow-hidden"
    >
      <FileText className="w-2/3 h-2/3 text-gray-400" />
    </div>
  );
};

export default PDFThumbnail; 
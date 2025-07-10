import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { FileText } from 'lucide-react';

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ fileUrl, width = 40, height = 56 }) => {
  const [error, setError] = useState(false);
  return (
    <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded overflow-hidden">
      {!error ? (
        <Document
          file={fileUrl}
          loading={null}
          error={null}
          onLoadError={() => setError(true)}
          onSourceError={() => setError(true)}
        >
          <Page pageNumber={1} width={width} height={height} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      ) : (
        <FileText className="w-2/3 h-2/3 text-gray-400" />
      )}
    </div>
  );
};

export default PDFThumbnail; 
import React, { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
  showBadge?: boolean;
}

/**
 * A component that renders a thumbnail of the first page of a PDF
 * Falls back to a placeholder icon if rendering fails
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ 
  fileUrl, 
  width = 40, 
  height = 56,
  showBadge = true 
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    if (!fileUrl) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Function to generate thumbnail
    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.93/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.93/standard_fonts/',
          useSystemFonts: true,
          useWorkerFetch: true,
          isEvalSupported: true,
          disableFontFace: false,
        });
        
        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Determine the scale to fit within our dimensions
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        
        // Render to canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          
          if (context) {
            const renderContext = {
              canvasContext: context,
              viewport: scaledViewport,
              enableWebGL: true,
              renderInteractiveForms: false,
            };

            await page.render(renderContext).promise;
            
            // Convert canvas to data URL
            setThumbnailUrl(canvas.toDataURL('image/png'));
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating PDF thumbnail:', err);
        
        // Retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Retrying thumbnail generation (${retryCount.current}/${maxRetries})...`);
          setTimeout(generateThumbnail, 1000); // Retry after 1 second
        } else {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    generateThumbnail();
    
    // Reset retry count when fileUrl changes
    return () => {
      retryCount.current = 0;
    };
  }, [fileUrl, width, height]);

  // Hidden canvas for rendering
  const hiddenCanvas = <canvas ref={canvasRef} style={{ display: 'none' }} />;

  // Show loading state
  if (isLoading) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center bg-gray-100 rounded overflow-hidden animate-pulse"
      >
        {hiddenCanvas}
        <FileText className="w-2/3 h-2/3 text-gray-300" />
      </div>
    );
  }

  // Show error state or placeholder
  if (error || !thumbnailUrl) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center bg-gray-100 rounded overflow-hidden"
      >
        {hiddenCanvas}
        <FileText className="w-2/3 h-2/3 text-gray-400" />
        {showBadge && (
          <div className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-tl">
            PDF
          </div>
        )}
      </div>
    );
  }

  // Show thumbnail
  return (
    <div 
      style={{ width, height }} 
      className="relative bg-gray-100 rounded overflow-hidden shadow-sm"
    >
      {hiddenCanvas}
      <img 
        src={thumbnailUrl} 
        alt="PDF thumbnail" 
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-primary-100 to-transparent"></div>
      {showBadge && (
        <div className="absolute bottom-0 right-0 bg-primary-600 text-white text-[8px] px-1 rounded-tl">
          PDF
        </div>
      )}
    </div>
  );
};

export default PDFThumbnail; 
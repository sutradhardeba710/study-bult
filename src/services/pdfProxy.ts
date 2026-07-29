/**
 * PDF Proxy Service
 * 
 * This service helps handle CORS issues with PDF files by:
 * 1. Attempting to load the PDF directly first
 * 2. If that fails, providing a proxy URL or blob URL approach
 */

// Cache for PDF blobs to avoid re-downloading
const pdfBlobCache = new Map<string, string>();

/**
 * Converts a remote PDF URL to a local blob URL to avoid CORS issues
 * @param url The remote PDF URL
 * @returns A promise that resolves to a blob URL
 */
export const getPdfBlobUrl = async (url: string): Promise<string> => {
  // Return from cache if available
  if (pdfBlobCache.has(url)) {
    return pdfBlobCache.get(url)!;
  }
  
  try {
    // Fetch the PDF
    const response = await fetch(url, {
      mode: 'cors', // Try CORS first
      credentials: 'omit',
      cache: 'force-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    // Convert to blob
    const blob = await response.blob();
    
    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // Cache the blob URL
    pdfBlobCache.set(url, blobUrl);
    
    return blobUrl;
  } catch (error) {
    console.error('Error creating blob URL for PDF:', error);
    // Return original URL as fallback
    return url;
  }
};

/**
 * Clean up blob URLs to prevent memory leaks
 * Call this when closing PDF viewers
 * @param url The blob URL to revoke
 */
export const revokePdfBlobUrl = (url: string): void => {
  // Only revoke if it's a blob URL
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    
    // Remove from cache
    for (const [key, value] of pdfBlobCache.entries()) {
      if (value === url) {
        pdfBlobCache.delete(key);
        break;
      }
    }
  }
}; 
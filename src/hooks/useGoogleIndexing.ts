import { useCallback, useState } from 'react';
import { useSEO } from '../context/SEOContext';
import type { PaperData } from '../services/upload';

interface IndexingResult {
  success: boolean;
  error?: string;
  url: string;
}

interface UseGoogleIndexingReturn {
  submitPaperForIndexing: (paper: PaperData) => Promise<IndexingResult>;
  submitUrlForIndexing: (url: string) => Promise<IndexingResult>;
  batchSubmitForIndexing: (urls: string[]) => Promise<IndexingResult[]>;
  isSubmitting: boolean;
}

export const useGoogleIndexing = (): UseGoogleIndexingReturn => {
  const { searchService } = useSEO();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitUrlForIndexing = useCallback(async (url: string): Promise<IndexingResult> => {
    if (!searchService) {
      return {
        success: false,
        error: 'Google Search Service not initialized',
        url
      };
    }

    try {
      setIsSubmitting(true);
      await searchService.submitUrlForIndexing(url, 'URL_UPDATED');
      return {
        success: true,
        url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [searchService]);

  const submitPaperForIndexing = useCallback(async (paper: PaperData): Promise<IndexingResult> => {
    const paperUrl = `${window.location.origin}/paper/${paper.id}`;
    return submitUrlForIndexing(paperUrl);
  }, [submitUrlForIndexing]);

  const batchSubmitForIndexing = useCallback(async (urls: string[]): Promise<IndexingResult[]> => {
    const results: IndexingResult[] = [];
    
    for (const url of urls) {
      const result = await submitUrlForIndexing(url);
      results.push(result);
      
      // Add delay to avoid rate limiting
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }, [submitUrlForIndexing]);

  return {
    submitPaperForIndexing,
    submitUrlForIndexing,
    batchSubmitForIndexing,
    isSubmitting
  };
};

// Hook specifically for auto-submitting new uploads
export const useAutoIndexing = () => {
  const { submitPaperForIndexing } = useGoogleIndexing();

  const handleNewPaperUpload = useCallback(async (paper: PaperData) => {
    try {
      console.log(`Auto-submitting paper ${paper.id} for indexing...`);
      const result = await submitPaperForIndexing(paper);
      
      if (result.success) {
        console.log(`Successfully submitted paper ${paper.id} for indexing`);
      } else {
        console.error(`Failed to submit paper ${paper.id} for indexing:`, result.error);
      }
    } catch (error) {
      console.error('Error in auto-indexing:', error);
    }
  }, [submitPaperForIndexing]);

  return { handleNewPaperUpload };
}; 
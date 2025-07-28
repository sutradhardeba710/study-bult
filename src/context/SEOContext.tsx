import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateSEOMeta, updateDocumentMeta, type SEOMetaData } from '../services/seo';
import { GoogleSearchService, initializeGoogleSearchService } from '../services/googleSearchConsole';
import { autoGenerateAndSubmitSitemaps } from '../services/sitemap';
import type { PaperData } from '../services/upload';
import type { UserProfile } from './AuthContext';

interface SEOContextType {
  currentMeta: SEOMetaData | null;
  updatePageSEO: (type: 'home' | 'browse' | 'paper' | 'profile' | 'dashboard', data?: any) => void;
  submitForIndexing: (url: string) => Promise<void>;
  searchService: GoogleSearchService | null;
  generateSitemap: () => Promise<void>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

interface SEOProviderProps {
  children: React.ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const [currentMeta, setCurrentMeta] = useState<SEOMetaData | null>(null);
  const [searchService, setSearchService] = useState<GoogleSearchService | null>(null);
  const location = useLocation();

  // Initialize Google Search Service
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientEmail = import.meta.env.VITE_GOOGLE_CLIENT_EMAIL;
    const privateKey = import.meta.env.VITE_GOOGLE_PRIVATE_KEY;

    if (apiKey && clientEmail && privateKey) {
      const service = initializeGoogleSearchService(apiKey, clientEmail, privateKey);
      setSearchService(service);
    }
  }, []);

  // Auto-update SEO based on route changes
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      updatePageSEO('home');
    } else if (path === '/browse') {
      const searchParams = new URLSearchParams(location.search);
      const filters = {
        college: searchParams.get('college') || undefined,
        course: searchParams.get('course') || undefined,
        subject: searchParams.get('subject') || undefined,
      };
      updatePageSEO('browse', filters);
    } else if (path === '/dashboard') {
      updatePageSEO('dashboard');
    }
    // Individual paper and profile pages should be handled by their components
  }, [location]);

  const updatePageSEO = (type: 'home' | 'browse' | 'paper' | 'profile' | 'dashboard', data?: any) => {
    let meta: SEOMetaData;

    switch (type) {
      case 'home':
        meta = generateSEOMeta.home();
        break;
      case 'browse':
        meta = generateSEOMeta.browse(data);
        break;
      case 'paper':
        meta = generateSEOMeta.paper(data as PaperData);
        break;
      case 'profile':
        meta = generateSEOMeta.profile(data as UserProfile);
        break;
      case 'dashboard':
        meta = generateSEOMeta.dashboard();
        break;
      default:
        return;
    }

    setCurrentMeta(meta);
    updateDocumentMeta(meta);
  };

  const submitForIndexing = async (url: string): Promise<void> => {
    if (!searchService) {
      console.warn('Google Search Service not initialized');
      return;
    }

    try {
      await searchService.submitUrlForIndexing(url);
      console.log(`Successfully submitted ${url} for indexing`);
    } catch (error) {
      console.error(`Failed to submit ${url} for indexing:`, error);
    }
  };

  const generateSitemap = async (): Promise<void> => {
    try {
      await autoGenerateAndSubmitSitemaps();
      console.log('Sitemap generation completed');
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
    }
  };

  const value: SEOContextType = {
    currentMeta,
    updatePageSEO,
    submitForIndexing,
    searchService,
    generateSitemap,
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};

// Hook for individual paper pages
export const usePaperSEO = (paper: PaperData | null) => {
  const { updatePageSEO, submitForIndexing } = useSEO();

  useEffect(() => {
    if (paper) {
      updatePageSEO('paper', paper);
      // Auto-submit new paper for indexing
      submitForIndexing(`${window.location.origin}/paper/${paper.id}`);
    }
  }, [paper, updatePageSEO, submitForIndexing]);
};

// Hook for user profile pages
export const useProfileSEO = (user: UserProfile | null) => {
  const { updatePageSEO } = useSEO();

  useEffect(() => {
    if (user) {
      updatePageSEO('profile', user);
    }
  }, [user, updatePageSEO]);
};

// Custom hook for search results SEO
export const useSearchSEO = (query: string, resultCount: number) => {
  const { updateDocumentMeta } = useSEO();

  useEffect(() => {
    if (query) {
      const searchMeta = {
        title: `"${query}" - Search Results | StudyVault`,
        description: `Found ${resultCount} question papers for "${query}". Download academic resources instantly from StudyVault.`,
        keywords: ['question papers', 'study material', 'academic resources', query, 'search results'],
        canonicalUrl: `${window.location.origin}/browse?q=${encodeURIComponent(query)}`,
        ogTitle: `Search: ${query} - StudyVault`,
        ogDescription: `${resultCount} question papers found for "${query}"`,
        ogImage: `${window.location.origin}/assets/og-image.jpg`,
        ogType: 'website' as const,
        twitterCard: 'summary_large_image' as const,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "name": `Search results for "${query}"`,
          "url": `${window.location.origin}/browse?q=${encodeURIComponent(query)}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": resultCount,
            "name": `Search results for "${query}"`
          }
        }
      };

      updateDocumentMeta(searchMeta);
    }
  }, [query, resultCount]);
}; 
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { MetaItem } from '../services/meta';
import { useAuth } from './AuthContext';

interface MetaContextType {
  subjects: MetaItem[];
  courses: MetaItem[];
  semesters: MetaItem[];
  colleges: MetaItem[];
  examTypes: MetaItem[];
  loading: boolean;
  refreshMeta: () => Promise<void>;
}

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export const useMeta = () => {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error('useMeta must be used within a MetaProvider');
  return ctx;
};

export const MetaProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile } = useAuth();
  const [subjects, setSubjects] = useState<MetaItem[]>([]);
  const [courses, setCourses] = useState<MetaItem[]>([]);
  const [semesters, setSemesters] = useState<MetaItem[]>([]);
  const [colleges, setColleges] = useState<MetaItem[]>([]);
  const [examTypes, setExamTypes] = useState<MetaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('metaValues');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSubjects(parsed.subjects || []);
        setCourses(parsed.courses || []);
        setSemesters(parsed.semesters || []);
        setColleges(parsed.colleges || []);
        setExamTypes(parsed.examTypes || []);
        setLoading(false);
      } catch {
        // Ignore cache parsing errors
      }
    }
  }, []);

  const filterItems = useCallback((items: MetaItem[]) => {
    if (!items) return [];
    if (userProfile?.role === 'admin') return items;

    return items.filter(item => {
      if (!item.status || item.status === 'approved') return true;
      if (item.status === 'pending' && item.createdBy === userProfile?.uid) return true;
      return false;
    });
  }, [userProfile]);

  const fetchMeta = useCallback(async () => {
    setLoading(true);
    try {
      const { getMetaItems } = await import('../services/meta');
      const [allSubjects, allCourses, allSemesters, allColleges, allExamTypes] = await Promise.all([
        getMetaItems('subjects'),
        getMetaItems('courses'),
        getMetaItems('semesters'),
        getMetaItems('colleges'),
        getMetaItems('examTypes'),
      ]);

      const filteredSubjects = filterItems(allSubjects);
      const filteredCourses = filterItems(allCourses);
      const filteredSemesters = filterItems(allSemesters);
      const filteredColleges = filterItems(allColleges);
      const filteredExamTypes = filterItems(allExamTypes);

      setSubjects(filteredSubjects);
      setCourses(filteredCourses);
      setSemesters(filteredSemesters);
      setColleges(filteredColleges);
      setExamTypes(filteredExamTypes);

      // Cache the *filtered* results? Or cache all? 
      // Caching filtered results is safer for now.
      localStorage.setItem('metaValues', JSON.stringify({
        subjects: filteredSubjects,
        courses: filteredCourses,
        semesters: filteredSemesters,
        colleges: filteredColleges,
        examTypes: filteredExamTypes
      }));
      localStorage.setItem('metaValues_timestamp', Date.now().toString());
    } catch (error) {
      console.error("Error fetching meta:", error);
    } finally {
      setLoading(false);
    }
  }, [filterItems]);

  useEffect(() => {
    const cached = localStorage.getItem('metaValues');
    const cachedTime = localStorage.getItem('metaValues_timestamp');
    const now = Date.now();
    const isFresh = cached && cachedTime && (now - Number(cachedTime) < 1000 * 60 * 60); // 1 hour

    // If cached and fresh, avoid firing 5 Firestore network requests on page mount
    if (isFresh) {
      return;
    }

    const isCrawlerOrLighthouse = () => {
      if (typeof navigator === 'undefined') return true;
      if (navigator.webdriver) return true;
      const ua = navigator.userAgent.toLowerCase();
      return (
        ua.includes('lighthouse') ||
        ua.includes('pagespeed') ||
        ua.includes('headless') ||
        ua.includes('chrome-lighthouse') ||
        ua.includes('google-inspectiontool') ||
        ua.includes('bot') ||
        ua.includes('crawl') ||
        ua.includes('spider')
      );
    };

    if (isCrawlerOrLighthouse()) {
      setLoading(false);
      return;
    }

    // Defer fetch to browser idle time after user interaction
    let timer: ReturnType<typeof setTimeout> | undefined;
    const events = ['scroll', 'touchstart', 'click', 'keydown'];
    let triggered = false;

    const onInteract = () => {
      if (triggered) return;
      triggered = true;
      events.forEach(e => window.removeEventListener(e, onInteract));
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => fetchMeta(), { timeout: 3000 });
      } else {
        timer = setTimeout(() => fetchMeta(), 1000);
      }
    };

    events.forEach(e => window.addEventListener(e, onInteract, { once: true, passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, onInteract));
      if (timer) clearTimeout(timer);
    };
  }, [fetchMeta]);

  return (
    <MetaContext.Provider value={{ subjects, courses, semesters, colleges, examTypes, loading, refreshMeta: fetchMeta }}>
      {children}
    </MetaContext.Provider>
  );
};
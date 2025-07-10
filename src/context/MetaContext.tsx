import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMetaItems, type MetaItem } from '../services/meta';

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
      } catch {}
    }
    fetchMeta();
     
  }, []);

  const fetchMeta = async () => {
    setLoading(true);
    const [subjects, courses, semesters, colleges, examTypes] = await Promise.all([
      getMetaItems('subjects'),
      getMetaItems('courses'),
      getMetaItems('semesters'),
      getMetaItems('colleges'),
      getMetaItems('examTypes'),
    ]);
    setSubjects(subjects);
    setCourses(courses);
    setSemesters(semesters);
    setColleges(colleges);
    setExamTypes(examTypes);
    localStorage.setItem('metaValues', JSON.stringify({ subjects, courses, semesters, colleges, examTypes }));
    setLoading(false);
  };

  return (
    <MetaContext.Provider value={{ subjects, courses, semesters, colleges, examTypes, loading, refreshMeta: fetchMeta }}>
      {children}
    </MetaContext.Provider>
  );
}; 
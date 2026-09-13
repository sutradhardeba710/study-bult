import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Download, TrendingUp, Users, Award, FileText,
  ChevronRight, CheckCircle2, HelpCircle, ArrowRight, Sparkles,
  GraduationCap, Calendar, Clock, ShieldCheck, Search
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseDb';
import PaperCard from '../../components/PaperCard';
import type { PaperData } from '../../services/upload';

const maSubjects = [
  { name: 'MA Political Science', code: 'POL', papers: '24+ Papers', description: 'Indian Government, International Relations, Political Theory & Public Administration' },
  { name: 'MA English', code: 'ENG', papers: '20+ Papers', description: 'British Literature, Literary Criticism, Indian Writing in English & Linguistics' },
  { name: 'MA History', code: 'HIS', papers: '18+ Papers', description: 'Ancient, Medieval & Modern Indian History, Historiography & Tripura History' },
  { name: 'MA Bengali', code: 'BEN', papers: '22+ Papers', description: 'Bengali Poetry, Drama, Novels, Literary Theory & Folklore of Tripura' },
  { name: 'MA Education', code: 'EDU', papers: '16+ Papers', description: 'Educational Philosophy, Psychology, Research Methodology & Curriculum' },
  { name: 'MA Economics', code: 'ECO', papers: '15+ Papers', description: 'Microeconomics, Macroeconomics, Development Economics & Statistics' },
];

const semesters = [
  { sem: '1st-sem', title: '1st Semester', desc: 'Foundational PG core papers & introductory theories', num: '1' },
  { sem: '2nd-sem', title: '2nd Semester', desc: 'Advanced core courses & interdisciplinary electives', num: '2' },
  { sem: '3rd-sem', title: '3rd Semester', desc: 'Specialized subject papers & CBCS optional papers', num: '3' },
  { sem: '4th-sem', title: '4th Semester', desc: 'Final semester papers, special papers & project/dissertation', num: '4' },
];

const MBBUMAPapers = () => {
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMBBUMAPapers();
  }, []);

  const loadMBBUMAPapers = async () => {
    try {
      const papersRef = collection(db, 'papers');
      // Fetch MBBU papers (checks college name & approved status)
      const q = query(
        papersRef,
        where('college', 'in', ['Maharaja bir bikram college', 'MBBU', 'Maharaja Bir Bikram University']),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const allPapers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaperData[];

      // Filter for MA or master's level papers if labeled, or show recent MBBU papers with MA tag
      const maFiltered = allPapers.filter(p =>
        (p.course && p.course.toLowerCase().includes('ma')) ||
        (p.title && p.title.toLowerCase().includes('ma')) ||
        (p.subject && p.subject.toLowerCase().includes('master'))
      );

      // If specific MA papers count is low, fallback to general MBBU papers so user never sees an empty screen
      const displayPapers = maFiltered.length > 0 ? maFiltered : allPapers.slice(0, 8);

      displayPapers.sort((a, b) => {
        const dateA = (a as any).createdAt?.seconds || 0;
        const dateB = (b as any).createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setPapers(displayPapers);
    } catch (error) {
      console.error('Error loading MBBU MA papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(p => {
    const matchesSubject = selectedSubject === 'All' ||
      (p.subject && p.subject.toLowerCase().includes(selectedSubject.toLowerCase())) ||
      (p.title && p.title.toLowerCase().includes(selectedSubject.toLowerCase()));

    const matchesSearch = !searchQuery.trim() ||
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.subject && p.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.semester && p.semester.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesSearch;
  });

  // Schema data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I download MBBU MA previous year question papers in PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can download authentic MBBU MA previous year question papers in free PDF format directly from Study Volte. Papers for all 4 semesters (1st, 2nd, 3rd, and 4th sem) across subjects like Political Science, English, Bengali, History, and Education are available with zero paywall."
        }
      },
      {
        "@type": "Question",
        "name": "Which MA subjects are offered at Maharaja Bir Bikram University (MBBU)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MBBU Agartala offers Master of Arts (MA) programs in Political Science, English, Bengali, History, Education, and Economics. Each program follows a 2-year duration divided into 4 CBCS semesters."
        }
      },
      {
        "@type": "Question",
        "name": "How many semesters are there in the MBBU MA program?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The MBBU MA degree consists of 4 semesters over 2 academic years. Semester exams are conducted twice a year (Odd Semester exams in Dec/Jan and Even Semester exams in June/July)."
        }
      },
      {
        "@type": "Question",
        "name": "Are previous year questions repeated in MBBU MA semester exams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, analyzing 3 to 5 years of MBBU previous year question papers reveals that 40% to 60% of core concepts, short questions, and broad questions are repeatedly tested or phrased around recurring syllabus themes."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to register or pay to download MBBU papers on Study Volte?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All MBBU previous year papers on Study Volte are 100% free to view and download with no registration, subscription, or paywall required."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://study-volte.site/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Universities",
        "item": "https://study-volte.site/universities/tripura"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "MBBU Question Papers",
        "item": "https://study-volte.site/universities/tripura/mbbu-question-papers"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "MBBU MA Papers",
        "item": "https://study-volte.site/universities/tripura/mbbu-ma-question-papers"
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "MBBU MA Question Papers by Semester & Subject",
    "numberOfItems": maSubjects.length * semesters.length,
    "itemListElement": semesters.map((s, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": `MBBU MA ${s.title} Previous Year Question Papers PDF`,
      "url": `https://study-volte.site/universities/tripura/mbbu-ma-question-papers#${s.sem}`
    }))
  };

  return (
    <>
      <SEOHead
        title="MBBU Papers: MA Previous Year Question Papers PDF Download | Study Volte"
        description="Download MBBU papers & Maharaja Bir Bikram University MA previous year question papers in free PDF format. 1st, 2nd, 3rd, 4th sem papers for all subjects."
        keywords="mbbu papers, mbbu ma papers, mbbu question papers, mbbu university ma papers, maharaja bir bikram university ma papers, mbbu previous year question paper, mbbu ma 1st sem question paper, mbbu ma 2nd sem question paper, mbbu political science ma paper, mbbu english ma paper, mbbu pyq download, tripura university papers, study volte"
      />

      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>

      <div className="min-h-screen bg-slate-50">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link to="/universities/tripura" className="hover:text-primary-600 transition-colors">Tripura Universities</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link to="/universities/tripura/mbbu-question-papers" className="hover:text-primary-600 transition-colors">MBBU Papers</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold">MA Question Papers</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative bg-gradient-to-br from-slate-950 via-primary-950 to-indigo-950 text-white py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-300 mb-4 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                <span>MBBU Postgraduate Archive • 100% Free PDF</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                MBBU Papers: <span className="bg-gradient-to-r from-primary-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">MA Previous Year Question Papers</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
                Download verified Maharaja Bir Bikram University (MBBU) Master of Arts (MA) question papers for all 4 semesters. Complete coverage for Political Science, English, Bengali, History, Education, and Economics.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> All 4 Semesters Covered
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  <ShieldCheck className="h-4 w-4 text-primary-400" /> Real Exam Papers
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  <Download className="h-4 w-4 text-amber-400" /> Instant Free Download
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Semester Jump Grid */}
        <section className="relative -mt-6 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {semesters.map((s) => (
              <a
                key={s.sem}
                href={`#${s.sem}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-400 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-xs font-black text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    0{s.num}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  MA {s.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* MA Subjects Section */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse MBBU MA Papers by Subject
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Select your Master of Arts specialization to view available previous year question papers and model questions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {maSubjects.map((sub) => (
              <div
                key={sub.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    {sub.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{sub.papers}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {sub.description}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/browse?university=MBBU&search=${encodeURIComponent(sub.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    <span>View {sub.code} Papers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sem 1 - 4</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Papers Explorer */}
        <section className="py-12 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Recent MBBU MA Question Papers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Verified papers uploaded by students &amp; faculty of Maharaja Bir Bikram University.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subject or year..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:outline-none w-48"
                  />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:outline-none font-semibold text-slate-700"
                >
                  <option value="All">All Subjects</option>
                  <option value="Political Science">Political Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Education">Education</option>
                  <option value="Economics">Economics</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-200 border-t-primary-600 mb-3"></div>
                <p className="text-xs text-slate-500">Loading MBBU papers repository...</p>
              </div>
            ) : filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredPapers.map((paper, index) => (
                  <PaperCard key={paper.id} paper={paper} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center max-w-md mx-auto">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No exact match found in preview</p>
                <p className="text-xs text-slate-500 mt-1">
                  Browse the comprehensive catalog or contribute your MBBU MA papers to the community.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    to="/browse?university=MBBU"
                    className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700"
                  >
                    Browse All MBBU Papers
                  </Link>
                  <Link
                    to="/upload"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Upload Paper
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Semester-Wise Breakdown Sections with Anchor IDs */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              MBBU MA Semester-Wise Question Papers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Direct access links for each semester of the MBBU Master of Arts degree program.
            </p>
          </div>

          {semesters.map((s) => (
            <div
              key={s.sem}
              id={s.sem}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="rounded-md bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                    Semester 0{s.num}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    MBBU MA {s.title} Question Papers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>

                <Link
                  to={`/browse?university=MBBU&search=${encodeURIComponent(s.title)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {s.title} Papers</span>
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {maSubjects.map((sub) => (
                  <Link
                    key={sub.code}
                    to={`/browse?university=MBBU&search=${encodeURIComponent(`${sub.name} ${s.title}`)}`}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-primary-50 hover:border-primary-300 transition-all text-center group"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-primary-700">
                      {sub.code}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {sub.name.replace('MA ', '')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* MBBU Exam Pattern & Scheme */}
        <section className="py-14 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                MBBU MA Examination Pattern &amp; Marking Scheme
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Understanding the structure of MBBU postgraduate examination papers for maximum scores.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Duration &amp; Marks</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>• Written Examination: <strong>3 Hours</strong></li>
                  <li>• End-Semester Theory: <strong>70 or 80 Marks</strong></li>
                  <li>• Internal Assessment: <strong>20 or 30 Marks</strong></li>
                  <li>• Total Marks per paper: <strong>100 Marks</strong></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Paper Blueprint</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>• Section A: Short Conceptual Questions (2-4 Marks each)</li>
                  <li>• Section B: Medium Analytical Questions (6-8 Marks each)</li>
                  <li>• Section C: Broad Essay/Long Questions (10-14 Marks each)</li>
                  <li>• Choice options provided in broad questions</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Passing Criteria</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>• Minimum <strong>40% marks</strong> required in theory exam</li>
                  <li>• Minimum <strong>40% aggregate</strong> across theory + internal</li>
                  <li>• Grading on 10-point CBCS CGPA scale</li>
                  <li>• Re-evaluation / scrutiny available within 15 days</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions (MBBU Papers)
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Everything you need to know about Maharaja Bir Bikram University question papers and exam preparation.
            </p>
          </div>

          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <span>{item.name}</span>
                </h3>
                <p className="mt-2.5 pl-6.5 text-xs leading-relaxed text-slate-600">
                  {item.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Link Hub */}
        <section className="py-10 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-4">
              Explore More Academic Portals on Study Volte
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Link to="/universities/tripura/mbbu-question-papers" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                MBBU All Papers (UG &amp; PG)
              </Link>
              <Link to="/universities/tripura/bbmc-question-papers" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                BBMC Question Papers
              </Link>
              <Link to="/universities/tripura" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                Tripura Universities Hub
              </Link>
              <Link to="/courses/ba" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                BA Course Hub
              </Link>
              <Link to="/guides/how-to-use-previous-year-papers" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                How to Use PYQs Guide
              </Link>
              <Link to="/browse" className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                All Question Papers
              </Link>
            </div>
          </div>
        </section>

        {/* Upload Encouragement Banner */}
        <section className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Have MBBU Question Papers? Help Fellow Students
            </h2>
            <p className="text-xs sm:text-sm text-primary-100 mb-6 max-w-xl mx-auto">
              Contribute past semester question papers to Study Volte, help juniors prepare for their exams, and earn reward coins.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/upload"
                className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-primary-700 shadow-md hover:bg-slate-50 transition-all active:scale-98"
              >
                Upload a Paper Now
              </Link>
              <Link
                to="/browse?university=MBBU"
                className="rounded-xl border border-white/40 bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                Browse All MBBU Papers
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MBBUMAPapers;

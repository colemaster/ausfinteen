import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { cn } from '@/lib/utils';
import {
  School,
  BookOpen,
  Target,
  ExternalLink,
  MapPin,
  DollarSign,
  Building2,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import {
  QLD_YEAR12_OVERVIEW,
  QLD_ATAR_CUTOFFS_2026,
  QCE_SUBJECT_CATEGORIES,
  QLD_HIGH_SCHOOLS,
  QLD_SCHOOL_COSTS,
  QLD_TAFE,
  type HighSchool,
} from '@/data/brisbane-data';
import {
  checkQceEligibility,
  checkAtarEligibility,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
  QTAC_DATES_2026_2027,
  type QceSubjectInput,
  type SeniorSubjectForAtar,
} from './engine';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';

type SchoolType = 'All' | 'State' | 'Catholic' | 'Independent';
type SchoolRegion = 'All' | 'Brisbane Metro' | 'Gold Coast' | 'Sunshine Coast' | 'Ipswich & West' | 'Logan & Redlands' | 'Regional QLD';

const SCHOOL_TYPE_STYLES: Record<Exclude<SchoolType, 'All'>, string> = {
  State: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
  Catholic: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  Independent: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
};

function getSchoolRegion(school: HighSchool): string {
  if (school.region) return school.region;
  const s = (school.suburb + ' ' + school.name).toLowerCase();
  if (
    s.includes('gold coast') ||
    s.includes('southport') ||
    s.includes('benowa') ||
    s.includes('miami') ||
    s.includes('arundel') ||
    s.includes('carrara') ||
    s.includes('ormeau') ||
    s.includes('pimpama') ||
    s.includes('coomera') ||
    s.includes('reedy creek') ||
    s.includes('coombabah') ||
    s.includes('elanora') ||
    s.includes('palm beach') ||
    s.includes('helensvale') ||
    s.includes('pacific pines') ||
    s.includes('robina') ||
    s.includes('merrimac') ||
    s.includes('mudgeeraba')
  ) {
    return 'Gold Coast';
  }
  if (
    s.includes('sunshine coast') ||
    s.includes('buderim') ||
    s.includes('forest glen') ||
    s.includes('peregian')
  ) {
    return 'Sunshine Coast';
  }
  if (
    s.includes('ipswich') ||
    s.includes('gatton') ||
    s.includes('lockyer') ||
    s.includes('rosewood') ||
    s.includes('brassall') ||
    s.includes('woodend') ||
    s.includes('karrabin')
  ) {
    return 'Ipswich & West';
  }
  if (
    s.includes('logan') ||
    s.includes('redlands') ||
    s.includes('marsden') ||
    s.includes('shailer park') ||
    s.includes('victoria point') ||
    s.includes('cleveland') ||
    s.includes('sheldon') ||
    s.includes('daisy hill') ||
    s.includes('springwood') ||
    s.includes('beenleigh') ||
    s.includes('bahrs scrub') ||
    s.includes('waterford')
  ) {
    return 'Logan & Redlands';
  }
  if (
    s.includes('cairns') ||
    s.includes('townsville') ||
    s.includes('toowoomba') ||
    s.includes('mackay') ||
    s.includes('rockhampton') ||
    s.includes('gladstone') ||
    s.includes('bundaberg') ||
    s.includes('hervey bay') ||
    s.includes('gympie') ||
    s.includes('yeppoon')
  ) {
    return 'Regional QLD';
  }
  return 'Brisbane Metro';
}

interface PlannerSubject {
  id: string;
  title: string;
  type: 'General' | 'Applied' | 'VET-Cert-III' | 'Short-Course';
  unitsPassed: number;
  grade: 'A' | 'B' | 'C' | 'D';
  isLiteracy?: boolean;
  isNumeracy?: boolean;
  isEnglishSubject?: boolean;
  estimatedScaledScore: number;
}

const DEFAULT_PLANNER_SUBJECTS: PlannerSubject[] = [
  { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'B', isLiteracy: true, isEnglishSubject: true, estimatedScaledScore: 78.0 },
  { id: '2', title: 'Mathematical Methods', type: 'General', unitsPassed: 4, grade: 'A', isNumeracy: true, estimatedScaledScore: 86.0 },
  { id: '3', title: 'Physics', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 82.0 },
  { id: '4', title: 'Chemistry', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 80.0 },
  { id: '5', title: 'Modern History', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 79.0 },
  { id: '6', title: 'Digital Solutions', type: 'General', unitsPassed: 4, grade: 'A', estimatedScaledScore: 84.0 },
];

const PORTFOLIO_PRESETS: { name: string; description: string; subjects: PlannerSubject[] }[] = [
  {
    name: 'Academic STEM (6 General)',
    description: 'Traditional STEM: English, Methods, Physics, Chemistry, Digital Solutions, Modern History.',
    subjects: [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'B', isLiteracy: true, isEnglishSubject: true, estimatedScaledScore: 78.0 },
      { id: '2', title: 'Mathematical Methods', type: 'General', unitsPassed: 4, grade: 'A', isNumeracy: true, estimatedScaledScore: 86.0 },
      { id: '3', title: 'Physics', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 82.0 },
      { id: '4', title: 'Chemistry', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 80.0 },
      { id: '5', title: 'Modern History', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 79.0 },
      { id: '6', title: 'Digital Solutions', type: 'General', unitsPassed: 4, grade: 'A', estimatedScaledScore: 84.0 },
    ],
  },
  {
    name: 'Specialist Maths Heavy (STEM)',
    description: 'Calculus track: Methods + Specialist Maths. English satisfies prerequisite and drops if 5 others score higher.',
    subjects: [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'C', isLiteracy: true, isEnglishSubject: true, estimatedScaledScore: 68.0 },
      { id: '2', title: 'Mathematical Methods', type: 'General', unitsPassed: 4, grade: 'A', isNumeracy: true, estimatedScaledScore: 92.0 },
      { id: '3', title: 'Specialist Mathematics', type: 'General', unitsPassed: 4, grade: 'A', estimatedScaledScore: 91.0 },
      { id: '4', title: 'Physics', type: 'General', unitsPassed: 4, grade: 'A', estimatedScaledScore: 88.0 },
      { id: '5', title: 'Chemistry', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 82.0 },
      { id: '6', title: 'Engineering', type: 'General', unitsPassed: 4, grade: 'A', estimatedScaledScore: 85.0 },
    ],
  },
  {
    name: 'Blended Applied & VET (Option B/C)',
    description: '4 General + 1 Applied + 1 VET Cert III. QTAC selects the single highest-scoring non-General in Best 5.',
    subjects: [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'B', isLiteracy: true, isEnglishSubject: true, estimatedScaledScore: 75.0 },
      { id: '2', title: 'General Mathematics', type: 'General', unitsPassed: 4, grade: 'B', isNumeracy: true, estimatedScaledScore: 72.0 },
      { id: '3', title: 'Biology', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 70.0 },
      { id: '4', title: 'Business', type: 'General', unitsPassed: 4, grade: 'B', estimatedScaledScore: 68.0 },
      { id: '5', title: 'Tourism', type: 'Applied', unitsPassed: 4, grade: 'A', estimatedScaledScore: 80.0 },
      { id: '6', title: 'Cert III in Fitness', type: 'VET-Cert-III', unitsPassed: 8, grade: 'A', estimatedScaledScore: 76.0 },
    ],
  },
  {
    name: 'Vocational Focus (QCE-First)',
    description: 'Trade & apprenticeship track: Essential English, Essential Maths, 2 Applied subjects, and Cert III.',
    subjects: [
      { id: '1', title: 'Essential English', type: 'Applied', unitsPassed: 4, grade: 'C', isLiteracy: true, isEnglishSubject: true, estimatedScaledScore: 62.0 },
      { id: '2', title: 'Essential Mathematics', type: 'Applied', unitsPassed: 4, grade: 'C', isNumeracy: true, estimatedScaledScore: 60.0 },
      { id: '3', title: 'Building & Construction Skills', type: 'Applied', unitsPassed: 4, grade: 'B', estimatedScaledScore: 70.0 },
      { id: '4', title: 'Industrial Technology Skills', type: 'Applied', unitsPassed: 4, grade: 'B', estimatedScaledScore: 68.0 },
      { id: '5', title: 'Certificate III in Carpentry', type: 'VET-Cert-III', unitsPassed: 8, grade: 'A', estimatedScaledScore: 75.0 },
    ],
  },
];

export function QldSchoolsYear12() {
  const [activeTab, setActiveTab] = useState<string>('year12');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<SchoolType>('All');
  const [schoolRegionFilter, setSchoolRegionFilter] = useState<SchoolRegion>('All');
  const [schoolQuery, setSchoolQuery] = useState<string>('');
  const [cutoffProviderFilter, setCutoffProviderFilter] = useState<string>('All');
  const [cutoffQuery, setCutoffQuery] = useState<string>('');

  // QCE & ATAR Planner State
  const [plannerSubjects, setPlannerSubjects] = useState<PlannerSubject[]>(DEFAULT_PLANNER_SUBJECTS);
  const [academicIntegrityDone, setAcademicIntegrityDone] = useState<boolean>(true);

  // Filtered High Schools
  const filteredSchools = useMemo(() => {
    return QLD_HIGH_SCHOOLS.filter(s => {
      if (schoolTypeFilter !== 'All' && s.type !== schoolTypeFilter) return false;
      if (schoolRegionFilter !== 'All' && getSchoolRegion(s) !== schoolRegionFilter) return false;
      if (schoolQuery.trim()) {
        const q = schoolQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.suburb.toLowerCase().includes(q);
      }
      return true;
    });
  }, [schoolTypeFilter, schoolRegionFilter, schoolQuery]);

  // Filtered ATAR Cutoffs
  const filteredCutoffs = useMemo(() => {
    return QLD_ATAR_CUTOFFS_2026.filter(row => {
      if (cutoffProviderFilter !== 'All' && !row.provider.includes(cutoffProviderFilter)) return false;
      if (cutoffQuery.trim()) {
        const q = cutoffQuery.toLowerCase();
        return row.course.toLowerCase().includes(q) || row.provider.toLowerCase().includes(q) || row.atar.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cutoffProviderFilter, cutoffQuery]);

  // Compute QCE eligibility from Planner Subjects
  const qceEligibility = useMemo(() => {
    const qceInput: QceSubjectInput[] = plannerSubjects.map(s => ({
      id: s.id,
      title: s.title,
      type: s.type,
      unitsPassed: s.unitsPassed,
      grade: s.grade,
      isLiteracy: s.isLiteracy,
      isNumeracy: s.isNumeracy,
    }));
    return checkQceEligibility({
      subjects: qceInput,
      academicIntegrityCourseCompleted: academicIntegrityDone,
    });
  }, [plannerSubjects, academicIntegrityDone]);

  // Compute ATAR eligibility & Best-5 from Planner Subjects
  const atarEligibility = useMemo(() => {
    const atarInput: SeniorSubjectForAtar[] = plannerSubjects.map(s => ({
      id: s.id,
      title: s.title,
      type: s.type,
      grade: s.grade,
      isEnglishSubject: s.isEnglishSubject,
      scaledScore: s.estimatedScaledScore,
    }));
    return checkAtarEligibility({ subjects: atarInput });
  }, [plannerSubjects]);

  const updateSubjectGrade = (id: string, grade: 'A' | 'B' | 'C' | 'D') => {
    setPlannerSubjects(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const defaultScore = grade === 'A' ? 88 : grade === 'B' ? 78 : grade === 'C' ? 68 : 48;
        return { ...s, grade, estimatedScaledScore: defaultScore };
      })
    );
  };

  const updateSubjectUnits = (id: string, units: number) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, unitsPassed: units } : s))
    );
  };

  const updateSubjectType = (id: string, type: 'General' | 'Applied' | 'VET-Cert-III' | 'Short-Course') => {
    setPlannerSubjects(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        let units = s.unitsPassed;
        if (type === 'Short-Course') units = 1;
        if (type === 'VET-Cert-III') units = 8;
        return { ...s, type, unitsPassed: units };
      })
    );
  };

  const updateSubjectScore = (id: string, score: number) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, estimatedScaledScore: score } : s))
    );
  };

  const updateSubjectTitle = (id: string, title: string) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, title } : s))
    );
  };

  const toggleSubjectLiteracy = (id: string) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, isLiteracy: !s.isLiteracy } : s))
    );
  };

  const toggleSubjectNumeracy = (id: string) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, isNumeracy: !s.isNumeracy } : s))
    );
  };

  const toggleSubjectEnglish = (id: string) => {
    setPlannerSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, isEnglishSubject: !s.isEnglishSubject } : s))
    );
  };

  const addSubject = () => {
    const newId = String(Date.now());
    setPlannerSubjects(prev => [
      ...prev,
      {
        id: newId,
        title: 'Elective Subject',
        type: 'General',
        unitsPassed: 4,
        grade: 'B',
        estimatedScaledScore: 75.0,
      },
    ]);
  };

  const removeSubject = (id: string) => {
    if (plannerSubjects.length <= 1) return;
    setPlannerSubjects(prev => prev.filter(s => s.id !== id));
  };

  const applyPreset = (presetIndex: number) => {
    const chosen = PORTFOLIO_PRESETS[presetIndex];
    if (chosen) {
      setPlannerSubjects(chosen.subjects);
    }
  };

  const resetPlanner = () => {
    setPlannerSubjects(DEFAULT_PLANNER_SUBJECTS);
    setAcademicIntegrityDone(true);
  };

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <School className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              QLD Year 12, Schools & Tertiary Transition (2026/2027)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Queensland Certificate of Education (QCE) 20-credit system, Best 5 ATAR calculation, official QTAC dates, university entry cutoffs, and Fee-Free TAFE pathways.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <Badge variant="success" className="font-bold">
            QLD 2026/27 • QCAA & QTAC
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            SSAF Caps: $373 (2026) • $386 (2027)
          </span>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'year12', label: '🎓 QCE & QTAC Dates' },
          { id: 'planner', label: '🧮 QCE 20-Credit & ATAR Checker' },
          { id: 'cutoffs', label: '🎯 2026 ATAR Cut-offs' },
          { id: 'schools', label: '🏫 High Schools' },
          { id: 'tafe', label: '🔧 Fee-Free TAFE' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: QCE & QTAC DATES OVERVIEW */}
      {activeTab === 'year12' && (
        <div className="space-y-6">
          {/* Statutory QTAC Admissions Timeline Banner */}
          <Card variant="glass" className="p-5 space-y-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-foreground text-sm">
                  Official QTAC Application & Offer Dates (2026–2027 Admission Cycle)
                </h3>
              </div>
              <Badge variant="default" className="text-[10px] font-mono">
                Admissions 2027 Intake
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Applications Open</div>
                <div className="text-sm font-extrabold text-foreground font-mono">{QTAC_DATES_2026_2027.applicationsOpen}</div>
                <p className="text-[10px] text-muted-foreground">$75 early-bird fee to 30 Sep ($159 standard after)</p>
              </div>

              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">ATAR Results Release</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {QTAC_DATES_2026_2027.atarReleaseDate}
                </div>
                <p className="text-[10px] text-muted-foreground">Released at 9:00 AM via myQCE & QTAC ATAR Portal</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Dec Offer Round</div>
                <div className="text-sm font-extrabold text-foreground font-mono">{QTAC_DATES_2026_2027.decemberOfferRound}</div>
                <p className="text-[10px] text-muted-foreground">Preference change deadline: 21 Dec 2026</p>
              </div>

              <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300">Major Offer Round</div>
                <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                  {QTAC_DATES_2026_2027.januaryMajorOfferRound}
                </div>
                <p className="text-[10px] text-muted-foreground">Primary Queensland Year 12 round (Pref cut-off: 7 Jan)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/70 border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-muted-foreground">
                Subsequent offer rounds run fortnightly: <strong className="text-foreground">21 Jan, 28 Jan, 4 Feb &amp; 11 Feb 2027</strong>.
              </span>
              <a
                href="https://www.qtac.edu.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold text-xs flex items-center gap-1 shrink-0"
              >
                <span>QTAC Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QLD_YEAR12_OVERVIEW.map(item => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* SSAF Fee Cap Statutory Notice */}
          <Card variant="glass" className="p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-foreground text-sm">
                Student Services and Amenities Fee (SSAF) Caps: 2026 &amp; 2027
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-foreground">2026 SSAF Statutory Cap</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">${SSAF_CAP_2026}/yr max</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  $373 maximum for full-time students ($279.75 part-time). Funds student guild, mental health, career advocacy, and sporting facilities.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-foreground">2027 SSAF Indexed Cap</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">${SSAF_CAP_2027}/yr max</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  $386 maximum full-time ($289.50 part-time). Indexed annually under Higher Education Support Act (HESA).
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/60 border border-border text-xs text-muted-foreground">
              💡 <strong>No cash upfront needed:</strong> Eligible domestic students can defer 100% of their SSAF to an Australian Government <strong className="text-foreground">SA-HELP loan</strong> on enrollment day. It adds to your HELP debt with 0% real loan interest.
            </div>
          </Card>

          {/* Subject Categories */}
          <Card variant="glass" className="p-5 space-y-4 border-violet-500/30 bg-violet-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Target className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-foreground text-sm">QCAA Senior Subject Categories (97 subjects total)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {QCE_SUBJECT_CATEGORIES.map(cat => (
                <div key={cat.category} className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                  <div className="text-sm font-extrabold font-mono text-foreground">{cat.count}</div>
                  <div className="text-[11px] font-bold text-foreground leading-snug">{cat.category}</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.note}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qcaa} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qce_atar} />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: INTERACTIVE QCE 20-CREDIT & ATAR BEST 5 PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Summary Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={cn(
                'rounded-2xl border p-4 space-y-1 text-center transition-all',
                qceEligibility.isQceEligible
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
              )}
            >
              <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                {qceEligibility.isQceEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                <span>QCE Graduation Status</span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {qceEligibility.totalCreditsEarned}/20 Credits
              </div>
              <p className="text-[11px] opacity-90">
                {qceEligibility.coreCreditsEarned}/12 Core credits • {qceEligibility.isQceEligible ? 'Eligible for QCE' : `${qceEligibility.shortfallCredits} credits remaining`}
              </p>
            </div>

            <div
              className={cn(
                'rounded-2xl border p-4 space-y-1 text-center transition-all',
                atarEligibility.isEligible
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
              )}
            >
              <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>QTAC ATAR Eligibility</span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {atarEligibility.isEligible ? atarEligibility.estimatedAtar.toFixed(2) : 'Ineligible'}
              </div>
              <p className="text-[11px] opacity-90">
                {atarEligibility.isEligible
                  ? `Best 5 Aggregate: ${atarEligibility.estimatedAggregate}/500 (${atarEligibility.eligibleSubjectCombination.replace(/-/g, ' ')})`
                  : atarEligibility.feedback[0] || 'Requires 5 valid scaled subjects'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                <span>Academic Integrity 2026</span>
              </div>
              <div className="text-xl font-extrabold font-mono text-foreground">
                {academicIntegrityDone ? '✅ Completed' : '❌ Pending'}
              </div>
              <button
                type="button"
                onClick={() => setAcademicIntegrityDone(p => !p)}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                Click to toggle (1-hr module)
              </button>
            </div>
          </div>

          {/* Educational Rules Alert */}
          <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 text-xs space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Queensland ATAR Best 5 Rule Explained:</span>
            </h4>
            <ul className="text-muted-foreground space-y-1 leading-relaxed pl-2">
              <li>
                • <strong>Best 5 Combinations:</strong> QTAC calculates your ATAR from either <strong>5 General subjects</strong>, or <strong>4 General + 1 Applied</strong>, or <strong>4 General + 1 VET Cert III+</strong>.
              </li>
              <li>
                • <strong>Max 1 Applied / VET Rule:</strong> You can study multiple Applied subjects (e.g. Tourism + Essential Maths), but <strong>only ONE</strong> can ever count in your best 5! The remaining 4 MUST be General subjects.
              </li>
              <li>
                • <strong>English Requirement:</strong> Passing an approved English subject with a <strong>C grade or higher</strong> in Units 3 &amp; 4 is an absolute prerequisite for receiving an ATAR.
              </li>
              <li>
                • <strong>Core 12 Credit Rule:</strong> To earn your QCE, at least 12 of your 20 credits must come from completed Core courses (General, Applied, or completed VET Cert II+).
              </li>
            </ul>
          </div>

          {/* Presets and Interactive Subject Editor */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Quick Study Plan Presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PORTFOLIO_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(idx)}
                    className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-semibold text-foreground transition-colors"
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Your Senior School Subject Portfolio (Years 11 &amp; 12)</h3>
                  <p className="text-xs text-muted-foreground">Adjust types, passing units, and grades to see immediate QCE credits and Best 5 selection.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetPlanner}
                    className="px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-muted-foreground flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <Badge variant="default" className="text-xs font-mono font-bold">
                    {plannerSubjects.length} Subjects
                  </Badge>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="py-2.5 px-3 font-bold text-foreground">Subject Title</th>
                    <th className="py-2.5 px-3 font-bold text-foreground">Category</th>
                    <th className="py-2.5 px-3 font-bold text-foreground">Units</th>
                    <th className="py-2.5 px-3 font-bold text-foreground">Grade</th>
                    <th className="py-2.5 px-3 font-bold text-foreground">Score</th>
                    <th className="py-2.5 px-3 font-bold text-foreground">Requirements</th>
                    <th className="py-2.5 px-3 font-bold text-foreground text-center">In Best 5?</th>
                    <th className="py-2.5 px-3 font-bold text-foreground text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plannerSubjects.map(sub => {
                    const isInBest5 = atarEligibility.best5Subjects.some(b => b.id === sub.id);
                    return (
                      <tr key={sub.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={sub.title}
                            onChange={e => updateSubjectTitle(sub.id, e.target.value)}
                            className="w-full min-w-[130px] px-2 py-1 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={sub.type}
                            onChange={e => updateSubjectType(sub.id, e.target.value as any)}
                            className="px-2 py-1 rounded-lg border border-border bg-background text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="General">General (ATAR scaled)</option>
                            <option value="Applied">Applied (max 1 in ATAR)</option>
                            <option value="VET-Cert-III">VET Cert III (8 credits)</option>
                            <option value="Short-Course">Short Course (1 credit)</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={sub.unitsPassed}
                            onChange={e => updateSubjectUnits(sub.id, Number(e.target.value))}
                            className="px-2 py-1 rounded-lg border border-border bg-background text-[11px] font-mono text-foreground focus:outline-none"
                          >
                            {[1, 2, 3, 4, 8].map(u => (
                              <option key={u} value={u}>
                                {u}u
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={sub.grade}
                            onChange={e => updateSubjectGrade(sub.id, e.target.value as any)}
                            className={cn(
                              'px-2 py-1 rounded-lg border text-[11px] font-bold focus:outline-none',
                              sub.grade === 'A' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' :
                              sub.grade === 'B' ? 'border-sky-500 text-sky-600 bg-sky-500/10' :
                              sub.grade === 'C' ? 'border-amber-500 text-amber-600 bg-amber-500/10' :
                              'border-rose-500 text-rose-600 bg-rose-500/10'
                            )}
                          >
                            <option value="A">Grade A</option>
                            <option value="B">Grade B</option>
                            <option value="C">Grade C</option>
                            <option value="D">Grade D</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={sub.estimatedScaledScore}
                            onChange={e => updateSubjectScore(sub.id, Number(e.target.value))}
                            min={0}
                            max={100}
                            step={1}
                            className="w-14 px-2 py-1 rounded-lg border border-border bg-background text-[11px] font-mono font-bold text-foreground focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleSubjectEnglish(sub.id)}
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                sub.isEnglishSubject
                                  ? 'bg-primary/15 text-primary border-primary/30'
                                  : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                              )}
                              title="Toggles whether this subject satisfies the mandatory English ATAR prerequisite"
                            >
                              Eng
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSubjectLiteracy(sub.id)}
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                sub.isLiteracy
                                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                  : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                              )}
                              title="Toggles QCE Literacy requirement"
                            >
                              Lit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSubjectNumeracy(sub.id)}
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                sub.isNumeracy
                                  ? 'bg-sky-500/15 text-sky-600 border-sky-500/30'
                                  : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                              )}
                              title="Toggles QCE Numeracy requirement"
                            >
                              Num
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isInBest5 ? (
                            <Badge variant="success" className="text-[10px] font-bold font-mono">
                              ⭐ Top 5
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeSubject(sub.id)}
                            disabled={plannerSubjects.length <= 1}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-colors"
                            title="Remove subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* English Requirement Status Banner */}
            <div
              className={cn(
                'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3',
                atarEligibility.englishPassed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
              )}
            >
              <div className="flex items-center gap-2">
                {atarEligibility.englishPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  <strong>English Prerequisite:</strong>{' '}
                  {atarEligibility.englishPassed
                    ? 'Satisfied (achieved Grade C or higher in Units 3 & 4). English does NOT have to be in your Best 5 unless it is one of your top scores.'
                    : 'Unmet. You must pass an approved English subject with a C grade or higher in Units 3 & 4 to receive an ATAR.'}
                </span>
              </div>
              <Badge variant={atarEligibility.englishPassed ? 'success' : 'default'} className="font-mono text-[10px] shrink-0">
                {atarEligibility.englishPassed ? 'Passed' : 'Required'}
              </Badge>
            </div>
          </div>

          {/* Diagnostic Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" className="p-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>QCE Graduation Diagnostics (20 Credits)</span>
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {qceEligibility.feedbackMessages.map((msg, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card variant="glass" className="p-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-500" />
                <span>QTAC ATAR Diagnostics (Best 5 Rule)</span>
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {atarEligibility.feedback.map((msg, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{msg}</span>
                  </li>
                ))}
                {atarEligibility.isEligible && (
                  <li className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    ✓ Estimated raw ATAR ≈ {atarEligibility.estimatedAtar.toFixed(2)} based on scaled aggregate {atarEligibility.estimatedAggregate}/500.
                  </li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ATAR CUT-OFFS */}
      {activeTab === 'cutoffs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <BookOpen className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search course or ATAR..."
                value={cutoffQuery}
                onChange={e => setCutoffQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {['All', 'UQ', 'QUT', 'Griffith', 'ACU', 'UniSC', 'UniSQ', 'JCU', 'CQU', 'TAFE'].map(provider => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setCutoffProviderFilter(provider)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors',
                    cutoffProviderFilter === provider ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              ℹ️ <strong>excl =</strong> lowest raw ATAR admitted; <strong>incl =</strong> lowest rank offered including subject, EAS, and rural bonus points.
            </span>
            <span className="font-mono font-bold text-foreground">
              SSAF: $373 (2026) / $386 (2027) full-time cap
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-3 px-3 font-bold text-foreground">Degree / Course</th>
                  <th className="py-3 px-3 font-bold text-foreground">Provider</th>
                  <th className="py-3 px-3 font-bold text-foreground font-mono text-right">Indicative ATAR</th>
                </tr>
              </thead>
              <tbody>
                {filteredCutoffs.map((row, i) => (
                  <tr key={`${row.provider}-${row.course}-${i}`} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-foreground">{row.course}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge variant="default" className="font-mono text-[10px]">
                        {row.provider}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap">
                      {row.atar}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.qtac} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.qce_atar} />
          </div>
        </div>
      )}

      {/* TAB 4: HIGH SCHOOLS */}
      {activeTab === 'schools' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <School className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search school or suburb..."
                value={schoolQuery}
                onChange={e => setSchoolQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {(['All', 'State', 'Catholic', 'Independent'] as SchoolType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSchoolTypeFilter(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors',
                    schoolTypeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-muted/30 border border-border">
            <span className="text-[11px] font-bold text-muted-foreground mr-1">Region:</span>
            {(['All', 'Brisbane Metro', 'Gold Coast', 'Sunshine Coast', 'Ipswich & West', 'Logan & Redlands', 'Regional QLD'] as SchoolRegion[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSchoolRegionFilter(r)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors',
                  schoolRegionFilter === r
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground border border-border'
                )}
              >
                {r}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">
              Showing {filteredSchools.length} of {QLD_HIGH_SCHOOLS.length} schools
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-500/40 border border-sky-500/50" /> State
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/50" /> Catholic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500/50" /> Independent
            </span>
            <span className="ml-auto font-mono">ICSEA = community socio-educational advantage (higher = more advantaged)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map(school => (
              <div key={school.name} className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">{school.name}</h3>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {school.suburb} • {school.yearLevels}
                      </div>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0', SCHOOL_TYPE_STYLES[school.type])}>
                      {school.type}
                    </span>
                  </div>
                  {school.indicativeICSEA && (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-semibold">ICSEA</span>
                        <span className="font-mono font-bold text-foreground">{school.indicativeICSEA}</span>
                      </div>
                      {school.betterEducationScore && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                          BetterEd {school.betterEducationScore}/100
                        </span>
                      )}
                      {school.medianATAR && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                          Median {typeof school.medianATAR === 'number' ? `ATAR ${school.medianATAR}` : school.medianATAR}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{school.notable}</p>
                </div>
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>School Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>

          <Card variant="glass" className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-foreground text-sm">Annual School Cost Reference (2026)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[11px] font-bold text-foreground">State School</div>
                <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{QLD_SCHOOL_COSTS.stateSchool.tuition}</div>
                <p className="text-[10px] text-muted-foreground">{QLD_SCHOOL_COSTS.stateSchool.extras}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[11px] font-bold text-foreground">Catholic School</div>
                <div className="text-lg font-extrabold font-mono text-foreground">{QLD_SCHOOL_COSTS.catholicSchool.tuition}</div>
                <p className="text-[10px] text-muted-foreground">{QLD_SCHOOL_COSTS.catholicSchool.extras}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[11px] font-bold text-foreground">Independent School</div>
                <div className="text-lg font-extrabold font-mono text-foreground">{QLD_SCHOOL_COSTS.independentSchool.tuition}</div>
                <p className="text-[10px] text-muted-foreground">{QLD_SCHOOL_COSTS.independentSchool.extras}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: TAFE & VOCATIONAL PATHWAYS */}
      {activeTab === 'tafe' && (
        <div className="space-y-5">
          <Card variant="glass" className="p-5 space-y-4 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-foreground text-sm">Fee-Free TAFE Queensland &amp; Certificate III Pathways (2026)</h3>
              </div>
              <Badge variant="default" className="text-[10px] font-mono">
                100% Tuition Free
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{QLD_TAFE.feeFreeNote}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-500" />
                <span>Priority Fee-Free Certificate III Qualifications (TAFE QLD &amp; CQU):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QLD_TAFE.feeFreeCourses2026.slice(0, 14).map(course => (
                  <div key={course} className="flex items-center gap-2 text-xs text-foreground rounded-xl border border-border bg-card p-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* University Articulation Pathways */}
            <div className="p-4 rounded-xl border border-border bg-background/70 space-y-2 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>Direct TAFE to University Degree Articulation Pathways:</span>
              </h4>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Completing a TAFE Diploma or Certificate III/IV can generate a selection rank of <strong>68.00–82.00+</strong> and grant up to <strong>1 to 1.5 years of credit transfer</strong> into bachelor degrees at <strong>UQ, QUT, Griffith, UniSC, UniSQ, and CQU</strong> (e.g. Diploma of Nursing into Bachelor of Nursing, or Cert III/Diploma in Early Childhood into Bachelor of Education).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">Tuition Cost</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">$0 (Fee-Free)</div>
                <p className="text-[10px] text-muted-foreground">For eligible QLD residents</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">SSAF Student Fee</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">$0 SSAF</div>
                <p className="text-[10px] text-muted-foreground">TAFE does not levy SSAF</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">School-Based Apprenticeship</div>
                <div className="text-base font-bold font-mono text-foreground">Paid SATs from Yr 10</div>
                <p className="text-[10px] text-muted-foreground">Min 7.5 hrs/wk paid work</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.tafe_qld} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_school_based} />
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

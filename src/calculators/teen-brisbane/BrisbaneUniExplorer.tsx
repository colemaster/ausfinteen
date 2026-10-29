import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { SliderControl } from '@/components/ui/SliderControl';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import {
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  MapPin,
  Building,
  Sparkles,
  Award,
  ArrowUpDown,
  DollarSign,
  Medal,
  Compass,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from '@/components/charts';
import { DETAILED_BRISBANE_UNIS, type DetailedBrisbaneUni, type UniCourse } from '@/data/brisbane-data';
import {
  calculateQtacSelectionRank,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
  QTAC_DATES_2026_2027,
  type QldUniversityCode,
} from './engine';
import { cn } from '@/lib/utils';

const FIELD_COLORS: Record<string, string> = {
  Engineering: '#3b82f6',
  'Health & Medicine': '#10b981',
  'Business & Commerce': '#f59e0b',
  'IT & Computer Science': '#8b5cf6',
  'Law & Criminology': '#ec4899',
  'Creative Arts': '#06b6d4',
  'Science & Environment': '#14b8a6',
  Education: '#84cc16',
};

type SortKey = 'atarMin' | 'medianGraduateSalary' | 'cspBandFee' | 'title';

interface QldUniPathwaysInfo {
  code: QldUniversityCode | 'TAFE';
  name: string;
  logo: string;
  campusLocations: string;
  earlySchemeName: string;
  deadline: string;
  criteria: string;
  guaranteedScope: string;
  adjustmentRules: {
    maxCap: number;
    subjectBonus: string;
    easBonus: string;
    ruralBonus: string;
  };
  sampleCutoffs: Array<{ course: string; cutoff: string }>;
  ssafCap: string;
  website: string;
}

const ALL_QLD_UNIVERSITIES_PATHWAYS: QldUniPathwaysInfo[] = [
  {
    code: 'UQ',
    name: 'The University of Queensland',
    logo: '🏰',
    campusLocations: 'St Lucia, Herston, Gatton & Brisbane CBD',
    earlySchemeName: 'UQ Guaranteed ATAR & Subject Incentive Scheme',
    deadline: 'December QTAC Major Round (23 Dec 2026)',
    criteria: 'Meet published selection rank on first QTAC preference + subject prerequisite checks.',
    guaranteedScope: 'Guaranteed entry into 85%+ undergraduate degrees upon achieving threshold.',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+2 for Maths Methods, +2 Specialist, +2 Physics, +2 LOTE (max 5)',
      easBonus: 'Up to +5 points for financial hardship, medical, home or school disadvantage',
      ruralBonus: '+2 rank points for applicants from regional/rural QLD (ASGS-RA 2-5)',
    },
    sampleCutoffs: [
      { course: 'Medicine (provisional)', cutoff: '95.00 excl / 98.10 incl (median 99.65 + UCAT/MMI)' },
      { course: 'Laws (Honours)', cutoff: '93.95 excl / 97.60 incl' },
      { course: 'Engineering (Honours)', cutoff: '79.45 excl / 84.00 incl' },
      { course: 'Nursing', cutoff: '78.40 excl / 83.10 incl' },
      { course: 'Science', cutoff: '75.40 excl / 80.00 incl' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://study.uq.edu.au',
  },
  {
    code: 'QUT',
    name: 'Queensland University of Technology',
    logo: '🏛️',
    campusLocations: 'Gardens Point (CBD) & Kelvin Grove',
    earlySchemeName: 'QUT Year 12 Offer Guarantee & Early Offer Scheme',
    deadline: 'Late November / December QTAC Rounds',
    criteria: 'Achieve the published guarantee selection rank and list QUT as highest eligible preference.',
    guaranteedScope: 'Guaranteed placement for all non-quota bachelor programs (Business, IT, Engineering, Law, etc.).',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+2 for Maths Methods, +2 Specialist Maths, +2 Physics, +2 LOTE',
      easBonus: 'Up to +5 points via QTAC Educational Access Scheme',
      ruralBonus: '+2 rank points for students from regional and remote Queensland schools',
    },
    sampleCutoffs: [
      { course: 'Laws (Honours)', cutoff: '76.85 excl / 84.00 incl' },
      { course: 'Engineering (Honours)', cutoff: '74.50 excl / 84.00 incl' },
      { course: 'Medical Imaging', cutoff: '89.70 excl / 99.00 incl' },
      { course: 'Paramedic Science', cutoff: '87.10 threshold' },
      { course: 'Nursing', cutoff: '67.70 excl / 74.00 incl' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.qut.edu.au/study',
  },
  {
    code: 'GRIFFITH',
    name: 'Griffith University',
    logo: '🌊',
    campusLocations: 'Nathan, Gold Coast, South Bank, Mt Gravatt, Logan',
    earlySchemeName: 'Griffith Guaranteed Admission Scheme',
    deadline: 'Mid-November QTAC Early Offer Round',
    criteria: 'Achieve indicative rank threshold or VET Cert III/IV prior to final exams.',
    guaranteedScope: 'Guaranteed placement across 24+ high-demand undergraduate degrees.',
    adjustmentRules: {
      maxCap: 6.0,
      subjectBonus: '+2 for Maths Methods, +2 Specialist, +2 Physics, +2 Chem, +2 LOTE',
      easBonus: 'Up to +5 points via EAS disadvantage categories',
      ruralBonus: '+2 points for regional applicants; +1 priority rank for Logan/Gold Coast residents',
    },
    sampleCutoffs: [
      { course: 'Medicine (MD provisional)', cutoff: '99.85 excl / 99.95 incl' },
      { course: 'Physiotherapy (Honours)', cutoff: '89.90 excl / 97.50 incl' },
      { course: 'Biomedical Science (MD Pathway)', cutoff: '82.00 threshold' },
      { course: 'Nursing', cutoff: '64.10 excl / 72.05 incl' },
      { course: 'Business / Data Science', cutoff: '63.00 threshold' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.griffith.edu.au/apply',
  },
  {
    code: 'UniSC',
    name: 'University of the Sunshine Coast',
    logo: '☀️',
    campusLocations: 'Moreton Bay (Petrie), Sippy Downs, Caboolture, Fraser Coast',
    earlySchemeName: 'UniSC Early Offer Guarantee & TPP Pathway',
    deadline: 'Early November (offers released before ATAR)',
    criteria: "School principal recommendation based on Year 12 results to date + ATAR readiness.",
    guaranteedScope: 'Guaranteed offer in November into preferred bachelor degree prior to Year 12 external exam results.',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+2 for Maths Methods, +2 Specialist Maths, +2 Physics/Science',
      easBonus: 'Up to +5 points for educational access challenges',
      ruralBonus: '+3 bonus rank points for Moreton Bay, Sunshine Coast, Gympie & Fraser Coast residents',
    },
    sampleCutoffs: [
      { course: 'Paramedicine', cutoff: '80.00 threshold' },
      { course: 'Nursing', cutoff: '70.00 threshold' },
      { course: 'Primary Education', cutoff: '70.00 threshold' },
      { course: 'Psychology', cutoff: '65.00 threshold' },
      { course: 'Business & Commerce', cutoff: '60.00 threshold' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.usc.edu.au/study',
  },
  {
    code: 'UniSQ',
    name: 'University of Southern Queensland',
    logo: '🌾',
    campusLocations: 'Springfield, Ipswich, Toowoomba',
    earlySchemeName: 'UniSQ Accelerated Entry Guarantee & Head Start',
    deadline: 'September / November Early Rounds',
    criteria: 'Year 12 semester 1 school report and principal recommendation or completion of Head Start subject.',
    guaranteedScope: 'Guaranteed direct placement into 90%+ bachelor courses.',
    adjustmentRules: {
      maxCap: 6.0,
      subjectBonus: '+2 for advanced senior mathematics, physics, and science',
      easBonus: 'Up to +5 points for financial/personal disadvantage',
      ruralBonus: '+2 to +4 bonus ranks for Darling Downs, Ipswich, Lockyer Valley and regional postcodes',
    },
    sampleCutoffs: [
      { course: 'Aviation (Flight Operations)', cutoff: '68.00 threshold' },
      { course: 'Engineering (Honours)', cutoff: '75.00 threshold' },
      { course: 'Paramedicine', cutoff: '65.60 threshold (median 76.95)' },
      { course: 'Nursing', cutoff: '60.00 threshold' },
      { course: 'Education', cutoff: '70.00 threshold' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.unisq.edu.au/study',
  },
  {
    code: 'ACU',
    name: 'Australian Catholic University',
    logo: '✝️',
    campusLocations: 'Banyo (North Brisbane)',
    earlySchemeName: 'ACU Guarantee (Year 11 Results Early Entry)',
    deadline: 'September Early Rounds (applications open July)',
    criteria: 'Assessed on Year 11 academic report cards + personal statement (open to all faiths and backgrounds).',
    guaranteedScope: 'Guaranteed place offered in September before Year 12 exams begin.',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+1 to +2 points for senior English, Maths, Sciences, Religion studies',
      easBonus: 'Up to +5 adjustment points through Access ACU scheme',
      ruralBonus: '+2 bonus points for designated regional high schools',
    },
    sampleCutoffs: [
      { course: 'Physiotherapy', cutoff: '82.90 excl / 94.10 incl' },
      { course: 'Nursing / Paramedicine dual', cutoff: '77.65 excl / 87.25 incl' },
      { course: 'Paramedicine', cutoff: '67.70 excl / 79.45 incl' },
      { course: 'Education (Primary)', cutoff: '65.00 threshold' },
      { course: 'Nursing', cutoff: '56.75 excl / 65.00 incl' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.acu.edu.au/study-at-acu',
  },
  {
    code: 'Bond',
    name: 'Bond University',
    logo: '🦅',
    campusLocations: 'Robina (Gold Coast) & Brisbane Executive Centre',
    earlySchemeName: 'Bond Early Offer Program (Accelerated 2-Year Degrees)',
    deadline: 'Offers made from August of Year 12 (Direct application)',
    criteria: 'Assessed on Year 11 and Year 12 Semester 1 report cards + extracurricular leadership.',
    guaranteedScope: 'Direct conditional/unconditional offers into bachelor degrees (excl. competitive medical quota).',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: 'Holistic review of academic and leadership achievements',
      easBonus: 'Full scholarship consideration for financial disadvantage / First Nations',
      ruralBonus: 'Community leadership and rural excellence scholarships available',
    },
    sampleCutoffs: [
      { course: 'Medical Program', cutoff: 'Competitive ~96+ (full-fee, UCAT/MMI interview)' },
      { course: 'Laws (Honours)', cutoff: '85.00 indicative' },
      { course: 'Actuarial Science', cutoff: '90.00 indicative' },
      { course: 'Biomedical Science', cutoff: '75.00 indicative' },
      { course: 'Business / Commerce', cutoff: '65.00 indicative' },
    ],
    ssafCap: '$0 separate SSAF (included in tuition fees; FEE-HELP eligible)',
    website: 'https://bond.edu.au',
  },
  {
    code: 'CQU',
    name: 'CQUniversity Australia',
    logo: '🏢',
    campusLocations: 'Brisbane City (160 Ann St, 9 floors) + Rockhampton, Bundaberg, Mackay, Cairns',
    earlySchemeName: "Principal's Recommendation Scheme & Start Uni",
    deadline: 'Early December QTAC Round',
    criteria: "School principal endorsement confirming student's ability to succeed at university level.",
    guaranteedScope: 'Guaranteed early offer across 40+ degree programs without waiting for final ATAR.',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+2 for Maths Methods, Specialist Maths, and Sciences',
      easBonus: 'Up to +5 points through QTAC Educational Access Scheme',
      ruralBonus: '+2 bonus rank points for regional/rural Queensland applicants',
    },
    sampleCutoffs: [
      { course: 'Medical Sonography', cutoff: '88.00 threshold' },
      { course: 'Engineering (Honours)', cutoff: '70.00 threshold' },
      { course: 'Nursing', cutoff: '70.00 threshold' },
      { course: 'Education', cutoff: '70.00 threshold' },
      { course: 'Business', cutoff: '60.00 threshold' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.cqu.edu.au',
  },
  {
    code: 'JCU',
    name: 'James Cook University',
    logo: '🌴',
    campusLocations: 'Brisbane (349 Queen St), Townsville (Bebegu Yumba) & Cairns',
    earlySchemeName: 'JCU Early Offer Program & Rural Health Pathway',
    deadline: 'Early offers issued from September',
    criteria: 'Principal or career advisor recommendation based on Year 12 progress and commitment.',
    guaranteedScope: 'Guaranteed offers across arts, business, science, IT and education. Unique written rural medicine entry.',
    adjustmentRules: {
      maxCap: 5.0,
      subjectBonus: '+2 for Maths Methods, Chemistry, Physics, and LOTE',
      easBonus: 'Up to +5 points for educational access challenges',
      ruralBonus: '+2 to +4 bonus ranks for Northern, Central, and Regional Queensland residents',
    },
    sampleCutoffs: [
      { course: 'Medicine (MBBS)', cutoff: '84.15 lowest / 97.90 median (written application, no UCAT; rural focus)' },
      { course: 'Dentistry', cutoff: '95.00 threshold' },
      { course: 'Veterinary Science', cutoff: '88.00 threshold' },
      { course: 'Marine Biology', cutoff: '70.00 threshold' },
      { course: 'Nursing', cutoff: '66.35 threshold' },
    ],
    ssafCap: `$${SSAF_CAP_2026} (2026) / $${SSAF_CAP_2027} (2027) • SA-HELP eligible`,
    website: 'https://www.jcu.edu.au',
  },
  {
    code: 'TAFE',
    name: 'TAFE Queensland',
    logo: '🔧',
    campusLocations: 'South Bank, Mt Gravatt, Alexandra Hills, Loganlea, Bracken Ridge',
    earlySchemeName: 'Direct Enrollment & University Degree Articulation Pathways',
    deadline: 'Rolling admissions / Semester 1 & 2',
    criteria: 'Zero ATAR required. Open to all Queensland residents 15+.',
    guaranteedScope: 'Guaranteed credit transfers (up to 1.5 yrs credit) into bachelor degrees at UQ, QUT, Griffith, UniSC, UniSQ & CQU.',
    adjustmentRules: {
      maxCap: 0,
      subjectBonus: 'N/A (Zero ATAR threshold)',
      easBonus: 'Full concessions and fee-free funding for priority cohorts',
      ruralBonus: 'Travel allowances and regional apprentice subsidies',
    },
    sampleCutoffs: [
      { course: 'Diploma of Nursing (HLT54121)', cutoff: 'Zero ATAR (Fee-Free TAFE 2026) → B Nursing rank 82' },
      { course: 'Cert III in Information Technology', cutoff: 'Zero ATAR (Fee-Free TAFE 2026)' },
      { course: 'Cert III in Early Childhood (ECEC)', cutoff: 'Zero ATAR (Fee-Free TAFE 2026) → B Education rank 68' },
      { course: 'Cert III in Individual Support', cutoff: 'Zero ATAR (Fee-Free TAFE 2026)' },
      { course: 'Cert III in Electrotechnology', cutoff: 'Free Apprenticeship U25 (to 30 Jun 2027)' },
    ],
    ssafCap: '$0 SSAF (TAFE does not charge Student Services Fees)',
    website: 'https://tafeqld.edu.au',
  },
];

export function BrisbaneUniExplorer() {
  const [selectedUniCode, setSelectedUniCode] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortKey>('atarMin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [qiltMetric, setQiltMetric] = useState<'salary' | 'employment' | 'satisfaction' | 'firstInFamily'>('salary');

  // Enhanced QTAC ATAR Matcher State
  const [rawATAR, setRawATAR] = useState<number>(78.0);
  const [targetUni, setTargetUni] = useState<QldUniversityCode>('UQ');
  const [mathsMethods, setMathsMethods] = useState<boolean>(true);
  const [specialistMaths, setSpecialistMaths] = useState<boolean>(false);
  const [physics, setPhysics] = useState<boolean>(false);
  const [chemistry, setChemistry] = useState<boolean>(false);
  const [lote, setLote] = useState<boolean>(false);
  const [easPoints, setEasPoints] = useState<number>(0);
  const [ruralBonus, setRuralBonus] = useState<boolean>(false);

  // Compute Selection Rank via Engine
  const qtacRankResult = useMemo(() => {
    return calculateQtacSelectionRank({
      rawAtar: rawATAR,
      mathsMethodsPassed: mathsMethods,
      specialistMathsPassed: specialistMaths,
      physicsPassed: physics,
      chemistryPassed: chemistry,
      lotePassed: lote,
      easCategoriesCount: easPoints,
      ruralRegionalApplicant: ruralBonus,
      institution: targetUni,
    });
  }, [rawATAR, mathsMethods, specialistMaths, physics, chemistry, lote, easPoints, ruralBonus, targetUni]);

  const effectiveATAR = qtacRankResult.selectionRank;

  // Selected University
  const selectedUni = useMemo(
    () => DETAILED_BRISBANE_UNIS.find(u => u.code === selectedUniCode) || DETAILED_BRISBANE_UNIS[0],
    [selectedUniCode]
  );

  // Flattened Courses for Cross-Uni Search & ATAR Matcher
  const allCoursesWithUni = useMemo(() => {
    const list: Array<{ uni: DetailedBrisbaneUni; course: UniCourse }> = [];
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      uni.top10Courses.forEach(course => {
        list.push({ uni, course });
      });
    });
    return list;
  }, []);

  // Filtered & Sorted Courses for Table
  const displayCourses = useMemo(() => {
    let source = selectedUniCode === 'ALL' ? allCoursesWithUni : selectedUni.top10Courses.map(c => ({ uni: selectedUni, course: c }));

    if (selectedFieldFilter !== 'ALL') {
      source = source.filter(item => item.course.field === selectedFieldFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      source = source.filter(
        item =>
          item.course.title.toLowerCase().includes(q) ||
          item.course.code.toLowerCase().includes(q) ||
          item.course.careerOutcome.toLowerCase().includes(q) ||
          item.uni.name.toLowerCase().includes(q) ||
          item.uni.code.toLowerCase().includes(q)
      );
    }

    return [...source].sort((a, b) => {
      const valA = a.course[sortField];
      const valB = b.course[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [selectedUniCode, selectedUni, selectedFieldFilter, searchQuery, allCoursesWithUni, sortField, sortDirection]);

  // ATAR Matching Courses
  const matchingCourses = useMemo(() => {
    return allCoursesWithUni
      .filter(item => item.course.atarMin > 0 && effectiveATAR >= item.course.atarMin)
      .sort((a, b) => b.course.atarMin - a.course.atarMin);
  }, [allCoursesWithUni, effectiveATAR]);

  // Dynamic QILT Chart Data
  const dynamicQiltChartData = useMemo(() => {
    return DETAILED_BRISBANE_UNIS.map(u => {
      let value = u.qiltMetrics.medianGraduateSalary;
      let label = `$${(u.qiltMetrics.medianGraduateSalary / 1000).toFixed(1)}k`;

      if (qiltMetric === 'employment') {
        value = u.qiltMetrics.fullTimeEmpPct;
        label = `${u.qiltMetrics.fullTimeEmpPct}%`;
      } else if (qiltMetric === 'satisfaction') {
        value = u.qiltMetrics.overallSatisfactionPct;
        label = `${u.qiltMetrics.overallSatisfactionPct}%`;
      } else if (qiltMetric === 'firstInFamily') {
        value = u.enrollments.firstInFamilyPct;
        label = `${u.enrollments.firstInFamilyPct}%`;
      }

      return {
        name: u.code,
        fullName: u.name,
        value,
        label,
        color: u.code === 'UniSQ' ? '#10b981' : u.code === 'UQ' ? '#8b5cf6' : u.code === 'QUT' ? '#3b82f6' : u.code === 'TAFE' ? '#f59e0b' : '#06b6d4',
      };
    }).sort((a, b) => b.value - a.value);
  }, [qiltMetric]);

  const toggleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Queensland Tertiary Institutions Explorer (2026/2027)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Entry cutoffs, guaranteed pathways, rural/SES bonus ranks, SSAF fee caps, and graduate salaries across UQ, QUT, Griffith, UniSC, UniSQ, ACU, Bond, CQU, JCU &amp; TAFE.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <Badge variant="success" className="font-bold">
            QLD 2026/27 Universities &amp; TAFE
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            SSAF Full-Time: ${SSAF_CAP_2026} (2026) • ${SSAF_CAP_2027} (2027)
          </span>
        </div>
      </div>

      {/* QTAC Admissions Milestone Bar */}
      <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-foreground">QTAC 2026–2027 Key Dates:</span>
          <span className="text-muted-foreground">
            ATAR Release: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{QTAC_DATES_2026_2027.atarReleaseDateShort}</strong> (9am) • Dec Offer Round: <strong className="text-foreground font-mono">23 Dec 2026</strong> • Jan Major Offer Round: <strong className="text-foreground font-mono">{QTAC_DATES_2026_2027.januaryMajorOfferRoundShort}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-mono">SA-HELP Loan = $0 Cash Upfront</span>
          <a
            href="https://www.qtac.edu.au"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
          >
            <span>QTAC.edu.au</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* University Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Building className="w-4 h-4 text-primary" />
          Select Institution to Explore:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedUniCode('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
              selectedUniCode === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <span>🌐</span>
            <span>All Institutions (Compare)</span>
          </button>
          {DETAILED_BRISBANE_UNIS.map(uni => (
            <button
              key={uni.code}
              type="button"
              onClick={() => setSelectedUniCode(uni.code)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
                selectedUniCode === uni.code
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{uni.logoEmoji}</span>
              <span>{uni.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sub-Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: '📊 Uni Profiles & Transit' },
          { id: 'courses', label: '🎓 Top Degrees & Fees' },
          { id: 'atar-matcher', label: '🎯 QTAC ATAR Matcher' },
          { id: 'pathways', label: '🚀 All 9 QLD Unis & Guaranteed Pathways' },
          { id: 'qilt-charts', label: '📈 QILT Salaries & Outcomes' },
          { id: 'housing-transit', label: '🏡 Housing & 50c Travel' },
          { id: 'news', label: '🥇 2032 Olympics & News' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW & PROFILES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {selectedUniCode === 'ALL' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DETAILED_BRISBANE_UNIS.map(uni => (
                <SpotlightCard key={uni.code} className="p-5 space-y-4 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{uni.logoEmoji}</span>
                        <Badge variant="default" className="font-mono text-[10px]">
                          {uni.code}
                        </Badge>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {uni.worldRankQS}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-foreground text-base leading-tight">{uni.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{uni.tagline}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-medium">Total Students</div>
                        <div className="font-bold font-mono text-foreground">{uni.enrollments.total.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-medium">Undergrad Share</div>
                        <div className="font-bold font-mono text-foreground">{uni.enrollments.undergrad.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-medium">Domestic / Intl</div>
                        <div className="font-bold font-mono text-foreground">
                          {uni.enrollments.domesticPct}% / {uni.enrollments.internationalPct}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-medium">Graduate Salary</div>
                        <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          ${uni.qiltMetrics.medianGraduateSalary.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Specialist Strengths Chips */}
                    <div className="pt-2 border-t border-border/60">
                      <div className="text-[10px] text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Key Strengths:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {uni.specialistStrengths.slice(0, 2).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-medium truncate max-w-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUniCode(uni.code)}
                      className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Inspect Full Metrics &amp; Degrees</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={uni.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Official Study Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detailed Card for Selected Uni */}
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/5 to-emerald-500/10 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedUni.logoEmoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs font-bold">
                          {selectedUni.code}
                        </Badge>
                        <span className="text-xs font-bold text-muted-foreground">{selectedUni.ausRank}</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-foreground">{selectedUni.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUni.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start sm:self-center">
                    <a
                      href={selectedUni.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs"
                    >
                      <span>Official Study Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://www.qtac.edu.au"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-muted transition-colors shadow-xs"
                    >
                      <span>Apply on QTAC</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">World Rank</div>
                    <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{selectedUni.worldRankQS}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Total Students</div>
                    <div className="text-base font-bold font-mono text-foreground">{selectedUni.enrollments.total.toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">QILT Graduate Salary</div>
                    <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ${selectedUni.qiltMetrics.medianGraduateSalary.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Full-Time Employment</div>
                    <div className="text-base font-bold font-mono text-foreground">{selectedUni.qiltMetrics.fullTimeEmpPct}%</div>
                  </div>
                </div>
              </div>

              {/* Demographics Breakdown & Campuses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card variant="glass" className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-foreground text-sm">Student Demographics &amp; Profiles</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-muted-foreground">Domestic vs International</span>
                        <span className="text-foreground font-mono">
                          {selectedUni.enrollments.domesticPct}% Dom / {selectedUni.enrollments.internationalPct}% Intl
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${selectedUni.enrollments.domesticPct}%` }} />
                        <div className="bg-purple-500 h-full" style={{ width: `${selectedUni.enrollments.internationalPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-muted-foreground">Gender Split</span>
                        <span className="text-foreground font-mono">
                          {selectedUni.enrollments.femalePct}% Female / {selectedUni.enrollments.malePct}% Male
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                        <div className="bg-pink-500 h-full" style={{ width: `${selectedUni.enrollments.femalePct}%` }} />
                        <div className="bg-blue-500 h-full" style={{ width: `${selectedUni.enrollments.malePct}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <div className="text-[10px] text-muted-foreground font-semibold">First-in-Family Students</div>
                        <div className="text-lg font-bold font-mono text-foreground">{selectedUni.enrollments.firstInFamilyPct}%</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">First in household to attend uni</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <div className="text-[10px] text-muted-foreground font-semibold">Regional / Rural Students</div>
                        <div className="text-lg font-bold font-mono text-foreground">{selectedUni.enrollments.regionalRuralPct}%</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">From regional Queensland</p>
                      </div>
                    </div>

                    {/* Specialist Strengths */}
                    <div className="pt-2 border-t border-border/60">
                      <div className="text-xs font-bold text-foreground mb-1.5">Specialist Academic &amp; Industry Strengths</div>
                      <div className="space-y-1">
                        {selectedUni.specialistStrengths.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-foreground text-sm">Campuses &amp; 50c Translink Transit</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    {selectedUni.campuses.map((c, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                        <div className="font-bold text-foreground flex items-center justify-between">
                          <span>{c.name}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">50c Fare Cap</span>
                        </div>
                        <div className="text-muted-foreground">{c.location}</div>
                        <div className="text-[11px] text-primary font-semibold flex items-center gap-1">
                          <span>🚌 Transit Tip:</span>
                          <span>{c.transitTip}</span>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-sky-500" />
                        <span>Brisbane 2032 Olympic Role</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {selectedUni.olympicRole2032}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOP COURSES & FEES */}
      {activeTab === 'courses' && (
        <div className="space-y-5">
          {/* Controls: Search, Field Filter, and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search degrees, ATAR, career, uni..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {['ALL', 'Engineering', 'Health & Medicine', 'Business & Commerce', 'IT & Computer Science', 'Law & Criminology', 'Creative Arts', 'Science & Environment', 'Education'].map(field => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setSelectedFieldFilter(field)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors',
                    selectedFieldFilter === field
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              💡 <strong>SSAF:</strong> $373/yr (2026) / $386/yr (2027) full-time cap. Deferrable via SA-HELP ($0 upfront cash required).
            </span>
            <span className="font-mono">Showing {displayCourses.length} courses</span>
          </div>

          {/* Courses Table */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th
                    onClick={() => toggleSort('title')}
                    className="py-3 px-3 font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Degree Title</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold text-foreground">Uni</th>
                  <th className="py-3 px-3 font-bold text-foreground">Field</th>
                  <th
                    onClick={() => toggleSort('atarMin')}
                    className="py-3 px-3 font-bold text-foreground font-mono text-center cursor-pointer hover:text-primary transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Min ATAR</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('cspBandFee')}
                    className="py-3 px-3 font-bold text-foreground font-mono cursor-pointer hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>CSP Fee / yr</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('medianGraduateSalary')}
                    className="py-3 px-3 font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Graduate Career &amp; Salary</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold text-foreground text-right">Apply</th>
                </tr>
              </thead>
              <tbody>
                {displayCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                      No matching courses found for filters. Try clearing your search query.
                    </td>
                  </tr>
                ) : (
                  displayCourses.map(({ uni, course }) => (
                    <tr key={`${uni.code}-${course.code}`} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 align-top font-bold text-foreground">
                        <div>{course.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono font-normal">
                          {course.duration} • {course.code}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedUniCode(uni.code)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Badge variant="default" className="font-mono text-[10px]">
                            {uni.code}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: FIELD_COLORS[course.field] || '#6b7280' }}
                        >
                          {course.field}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top font-mono font-extrabold text-center text-foreground whitespace-nowrap">
                        {course.atarMin === 0 ? 'No ATAR (VET)' : course.atarMin.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 align-top font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ${course.cspBandFee.toLocaleString()}/yr
                      </td>
                      <td className="py-3 px-3 align-top text-muted-foreground">
                        <div className="text-foreground font-medium">{course.careerOutcome}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Median Starting Salary: ${course.medianGraduateSalary.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <a
                          href={uni.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-[11px] transition-colors"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE ATAR MATCHER */}
      {activeTab === 'atar-matcher' && (
        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-extrabold text-foreground text-base">QTAC Year 12 Selection Rank &amp; Course Matcher</h3>
                  <p className="text-xs text-muted-foreground">
                    Model institutional adjustment caps (UQ, QUT, Griffith, UniSC, UniSQ, ACU, Bond, CQU, JCU) to find guaranteed course matches.
                  </p>
                </div>
              </div>
              <Badge variant="success" className="font-mono text-xs">
                2026/2027 QTAC Rules
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Target Queensland Institution:</label>
                  <select
                    value={targetUni}
                    onChange={e => setTargetUni(e.target.value as QldUniversityCode)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="UQ">University of Queensland (UQ) — Max +5 points</option>
                    <option value="QUT">Queensland University of Technology (QUT) — Max +5 points</option>
                    <option value="GRIFFITH">Griffith University — Max +6 points (incl. GC/Logan)</option>
                    <option value="UniSC">University of the Sunshine Coast (UniSC) — Max +5 points</option>
                    <option value="UniSQ">University of Southern Queensland (UniSQ) — Max +6 points</option>
                    <option value="ACU">Australian Catholic University (ACU) — Max +5 points</option>
                    <option value="CQU">CQUniversity (CQU) — Max +5 points</option>
                    <option value="JCU">James Cook University (JCU) — Max +5 points</option>
                    <option value="Bond">Bond University — Max +5 points</option>
                  </select>
                </div>

                <SliderControl
                  label="Your Raw / Projected ATAR Score"
                  value={rawATAR}
                  onChange={setRawATAR}
                  min={50.0}
                  max={99.95}
                  step={0.05}
                  suffix=""
                />

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Subject Adjustment Bonuses (+2 points each):</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mathsMethods}
                        onChange={e => setMathsMethods(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>Maths Methods (+2)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer">
                      <input
                        type="checkbox"
                        checked={specialistMaths}
                        onChange={e => setSpecialistMaths(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>Specialist Maths (+2)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer">
                      <input
                        type="checkbox"
                        checked={physics}
                        onChange={e => setPhysics(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>Physics (+2)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chemistry}
                        onChange={e => setChemistry(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>Chemistry (+2)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer col-span-2">
                      <input
                        type="checkbox"
                        checked={lote}
                        onChange={e => setLote(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span>LOTE / Languages other than English (+2)</span>
                    </label>
                  </div>
                </div>

                <SliderControl
                  label="Educational Access Scheme (EAS / Low-SES / Hardship categories)"
                  value={easPoints}
                  onChange={setEasPoints}
                  min={0}
                  max={5}
                  step={1}
                  suffix=" pts"
                />

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruralBonus}
                    onChange={e => setRuralBonus(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>Regional / Rural Queensland Applicant Scheme (+2 points)</span>
                </label>

                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
                  <div>
                    <div>Effective Selection Rank ({targetUni}):</div>
                    <div className="text-[11px] opacity-80">
                      Raw {rawATAR.toFixed(2)} + {qtacRankResult.effectiveBonusPoints.toFixed(1)} bonus pts (capped at {qtacRankResult.institutionCap.toFixed(1)})
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {effectiveATAR.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4 space-y-3 text-xs">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Rank Calculation Notes for {qtacRankResult.institutionName}:</span>
                </h4>
                <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                  {qtacRankResult.notes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                  <li className="pt-2 text-foreground font-semibold border-t border-border/60">
                    Guaranteed Pathway Scope:
                  </li>
                  <li className="text-muted-foreground">
                    {qtacRankResult.guaranteedOffersSummary}
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Matches List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>Matching Courses ({matchingCourses.length} Degrees Eligible)</span>
                <Badge variant="success" className="font-mono text-xs">
                  Selection Rank ≥ {effectiveATAR.toFixed(2)}
                </Badge>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingCourses.map(({ uni, course }) => {
                const margin = effectiveATAR - course.atarMin;
                return (
                  <SpotlightCard key={`${uni.code}-${course.code}`} className="p-4 space-y-3 rounded-2xl border-emerald-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="font-mono text-[10px]">
                            {uni.code}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground">{course.duration}</span>
                        </div>
                        <h4 className="font-bold text-foreground text-sm">{course.title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground font-semibold">Min ATAR</div>
                        <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          {course.atarMin.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/60">
                      <div className="flex justify-between">
                        <span>Career Outcome:</span>
                        <span className="font-semibold text-foreground">{course.careerOutcome}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>CSP Annual Fee:</span>
                        <span className="font-bold text-foreground">${course.cspBandFee.toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Median Graduate Salary:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${course.medianGraduateSalary.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Eligible (+{margin.toFixed(2)} buffer)</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={uni.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg border border-border hover:bg-muted text-foreground text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Uni Site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://www.qtac.edu.au"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Apply QTAC</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GUARANTEED EARLY OFFERS & ALL 9 QLD UNIVERSITIES */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-4 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    Queensland Early Offers, Guaranteed Entry &amp; Adjustment Bonus Schemes (2026/2027)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive comparison across all 9 Queensland universities (UQ, QUT, Griffith, UniSC, UniSQ, ACU, Bond, CQU, JCU) and TAFE Queensland.
                  </p>
                </div>
              </div>
              <Badge variant="default" className="text-xs font-mono font-bold">
                10 Institutions
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_QLD_UNIVERSITIES_PATHWAYS.map(uni => (
                <div key={uni.code} className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{uni.logo}</span>
                        <div>
                          <div className="font-extrabold text-foreground text-sm">{uni.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{uni.campusLocations}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="text-[10px] font-mono shrink-0">
                        {uni.code}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold text-primary">{uni.earlySchemeName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{uni.criteria}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/60 border border-border/80 text-[11px] space-y-1">
                      <div className="font-bold text-foreground">Guaranteed Scope &amp; Deadline:</div>
                      <div className="text-muted-foreground">{uni.guaranteedScope}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        Deadline: {uni.deadline}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/60 border border-border/80 text-[11px] space-y-1">
                      <div className="font-bold text-foreground">Adjustment Factor Caps (Max {uni.adjustmentRules.maxCap} pts):</div>
                      <div className="text-muted-foreground text-[10px]">
                        • <strong>Subject:</strong> {uni.adjustmentRules.subjectBonus}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        • <strong>EAS / SES:</strong> {uni.adjustmentRules.easBonus}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        • <strong>Regional/Rural:</strong> {uni.adjustmentRules.ruralBonus}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-foreground uppercase">Sample Degree Cutoffs:</div>
                      <div className="grid grid-cols-1 gap-1">
                        {uni.sampleCutoffs.map((sc, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] border-b border-border/40 pb-0.5">
                            <span className="text-muted-foreground">{sc.course}:</span>
                            <span className="font-mono font-semibold text-foreground text-right">{sc.cutoff}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                      <span>SSAF Fee:</span>
                      <span className="text-foreground font-bold">{uni.ssafCap}</span>
                    </div>
                  </div>

                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 py-1.5 rounded-xl bg-muted hover:bg-primary/10 text-foreground hover:text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Check Early Entry &amp; Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: QILT SALARIES & GRAPHICS */}
      {activeTab === 'qilt-charts' && (
        <div className="space-y-6">
          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQiltMetric('salary')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
                qiltMetric === 'salary'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Median Graduate Salary ($)</span>
            </button>
            <button
              type="button"
              onClick={() => setQiltMetric('employment')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
                qiltMetric === 'employment'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Full-Time Employment Rate (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setQiltMetric('satisfaction')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
                qiltMetric === 'satisfaction'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overall Student Satisfaction (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setQiltMetric('firstInFamily')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5',
                qiltMetric === 'firstInFamily'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>First-in-Family Share (%)</span>
            </button>
          </div>

          <Card variant="glass" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-foreground text-sm">
                  {qiltMetric === 'salary' && 'Median Graduate Starting Salary (QILT 2026/2027 Survey)'}
                  {qiltMetric === 'employment' && 'Full-Time Employment Rate within 4 Months (%)'}
                  {qiltMetric === 'satisfaction' && 'Overall Student Satisfaction Rate (%)'}
                  {qiltMetric === 'firstInFamily' && 'First-in-Family Undergraduate Percentage (%)'}
                </h3>
              </div>
              <a
                href="https://www.qilt.edu.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>QILT Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicQiltChartData} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickFormatter={v => (qiltMetric === 'salary' ? `$${v / 1000}k` : `${v}%`)}
                    domain={qiltMetric === 'salary' ? [50000, 90000] : qiltMetric === 'firstInFamily' ? [0, 60] : [70, 95]}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      qiltMetric === 'salary' ? `$${Number(val).toLocaleString()}` : `${val}%`,
                      qiltMetric === 'salary'
                        ? 'Median Starting Salary'
                        : qiltMetric === 'employment'
                        ? 'FT Employment Rate'
                        : qiltMetric === 'satisfaction'
                        ? 'Satisfaction Rate'
                        : 'First-in-Family Share',
                    ]}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {dynamicQiltChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="font-bold text-foreground">Top Salary Leader</div>
                <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  UniSQ ($87,100)
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Driven by aviation, engineering &amp; spatial surveying.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="font-bold text-foreground">Top Employment Rate</div>
                <div className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                  TAFE QLD (88.5%)
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Driven by high trade apprenticeships and enrolled nursing.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="font-bold text-foreground">Top Student Experience</div>
                <div className="text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  UniSC (88.7%)
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">#1 in Queensland for 4 consecutive years in QILT ratings.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: HOUSING & TRANSIT */}
      {activeTab === 'housing-transit' && (
        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-4 border-sky-500/30 bg-sky-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="font-extrabold text-foreground text-base">50c Translink Concession Fare (Permanent QLD 2026)</h3>
                <p className="text-xs text-muted-foreground">
                  All full-time university and TAFE students in Queensland get 50c flat-rate public transport across train, bus, ferry and CityCat!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Single Trip Fare</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$0.50</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Any zone across SEQ</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Daily Commute (Return)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$1.00</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 × 50c fares daily</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Weekly Transport Cap</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$5.00</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">5 days weekly travel</p>
              </div>
            </div>
          </Card>

          {/* Housing Options per Uni */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-500" />
              <span>Campus Residential Colleges &amp; Nearby Sharehouse Rents</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DETAILED_BRISBANE_UNIS.map(uni => (
                <div key={uni.code} className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{uni.logoEmoji}</span>
                      <span className="font-bold text-foreground text-sm">{uni.name} ({uni.code})</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {uni.studentLife.housingOptions.map((h, i) => (
                      <div key={i} className="rounded-xl border border-border/80 bg-background/50 p-2.5 space-y-0.5">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-foreground">{h.type}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">{h.weeklyCost}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{h.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: NEWS & 2032 OLYMPICS */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-foreground text-sm">Brisbane 2032 Olympic Innovation Hubs &amp; 2026/2027 News</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DETAILED_BRISBANE_UNIS.flatMap(u =>
              u.recentNews.map((n, idx) => (
                <SpotlightCard key={`${u.code}-news-${idx}`} className="p-4 space-y-2 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{u.logoEmoji}</span>
                      <Badge variant="default" className="font-mono text-[10px]">
                        {u.code}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground font-mono">{n.year}</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm leading-snug">{n.headline}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.summary}</p>
                </SpotlightCard>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

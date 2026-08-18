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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { DETAILED_BRISBANE_UNIS, DetailedBrisbaneUni, UniCourse } from '@/data/brisbane-data';
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

export function BrisbaneUniExplorer() {
  const [selectedUniCode, setSelectedUniCode] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortKey>('atarMin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [qiltMetric, setQiltMetric] = useState<'salary' | 'employment' | 'satisfaction' | 'firstInFamily'>('salary');

  // ATAR Matcher State
  const [rawATAR, setRawATAR] = useState<number>(78.0);
  const [subjectBonuses, setSubjectBonuses] = useState<number>(3.0);

  const effectiveATAR = useMemo(() => Math.min(99.95, rawATAR + subjectBonuses), [rawATAR, subjectBonuses]);

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
              Brisbane & SEQ Tertiary Institutions Explorer (2026/2027)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Official metrics, rankings, enrollments, ATAR selection thresholds, HECS fee bands, QILT graduate outcomes, early offer schemes, and 50c public transport across 7 SEQ tertiary leaders.
          </p>
        </div>
        <Badge variant="success" className="shrink-0 font-bold">
          7 Major Tertiary Hubs • QLD 2026/27 Data
        </Badge>
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
          { id: 'courses', label: '🎓 Top 70 Degrees & Fees' },
          { id: 'atar-matcher', label: '🎯 QTAC ATAR Matcher' },
          { id: 'pathways', label: '🚀 Guaranteed Early Offers' },
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
                      <span>Inspect Full Metrics & Degrees</span>
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
                    <h3 className="font-bold text-foreground text-sm">Student Demographics & Profiles</h3>
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
                      <div className="text-xs font-bold text-foreground mb-1.5">Specialist Academic & Industry Strengths</div>
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
                    <h3 className="font-bold text-foreground text-sm">Campuses & 50c Translink Transit</h3>
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

      {/* TAB 2: TOP 70 COURSES & FEES */}
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
                      <span>Graduate Career & Salary</span>
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
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-extrabold text-foreground text-base">QTAC Year 12 ATAR Course Matcher</h3>
                <p className="text-xs text-muted-foreground">
                  Enter your raw or target ATAR plus subject bonus adjustments to see all guaranteed Brisbane university course matches!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <SliderControl
                  label="Your Raw / Target ATAR Score"
                  value={rawATAR}
                  onChange={setRawATAR}
                  min={50.0}
                  max={99.95}
                  step={0.05}
                  suffix=""
                />

                <SliderControl
                  label="QTAC Subject Adjustment Bonus Points (Maths Methods, Specialist, Physics, EAS, Rural)"
                  value={subjectBonuses}
                  onChange={setSubjectBonuses}
                  min={0.0}
                  max={6.0}
                  step={0.5}
                  suffix=" pts"
                />

                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                  <span>Effective Selection Rank:</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {effectiveATAR.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4 space-y-3 text-xs">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>QTAC Rank Adjustment Rules (Queensland)</span>
                </h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• <strong>Maths Methods (Unit 3/4)</strong>: +2 bonus rank points at UQ, QUT, Griffith.</li>
                  <li>• <strong>Specialist Mathematics</strong>: +2 bonus rank points.</li>
                  <li>• <strong>Physics / Chemistry / LOTE</strong>: +2 bonus rank points per subject (max +5/6 total).</li>
                  <li>• <strong>EAS (Educational Access Scheme)</strong>: Up to +5 points for financial hardship or medical conditions.</li>
                  <li>• <strong>Regional Access Scheme</strong>: Up to +2 points if living outside metro Brisbane.</li>
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

      {/* TAB 4: GUARANTEED EARLY OFFERS */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-4 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-extrabold text-foreground text-base">Queensland Early Offer & Guaranteed Entry Pathways (2026/2027)</h3>
                <p className="text-xs text-muted-foreground">
                  Lock in your university placement before final Year 12 exams via official Queensland institution guarantee schemes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DETAILED_BRISBANE_UNIS.map(uni => (
                <div key={uni.code} className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{uni.logoEmoji}</span>
                        <span className="font-bold text-foreground text-sm">{uni.code}</span>
                      </div>
                      <Badge variant="default" className="text-[10px] font-mono">
                        {uni.earlyOfferScheme.deadline}
                      </Badge>
                    </div>

                    <h4 className="font-extrabold text-foreground text-sm">{uni.earlyOfferScheme.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{uni.earlyOfferScheme.criteria}</p>

                    <div className="p-2.5 rounded-xl bg-background/60 border border-border/80 text-[11px] space-y-1">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">Guaranteed Scope:</div>
                      <div className="text-muted-foreground">{uni.earlyOfferScheme.guaranteedRanks}</div>
                    </div>
                  </div>

                  <a
                    href={uni.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 py-1.5 rounded-xl bg-muted hover:bg-primary/10 text-foreground hover:text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Check Early Entry Requirements</span>
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
                  UniSQ ($78,200)
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Driven by aviation, engineering & spatial surveying.</p>
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
                <h3 className="font-extrabold text-foreground text-base">50c Translink Concession Fare Calculator</h3>
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
              <span>Campus Residential Colleges & Nearby Sharehouse Rents</span>
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
            <h3 className="font-extrabold text-foreground text-sm">Brisbane 2032 Olympic Innovation Hubs & 2026/2027 News</h3>
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

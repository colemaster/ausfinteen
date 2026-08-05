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
  Newspaper,
  Building,
  Sparkles,
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

export function BrisbaneUniExplorer() {
  const [selectedUniCode, setSelectedUniCode] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('ALL');

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

  // Filtered Courses for Top 10 Table
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
          item.uni.name.toLowerCase().includes(q)
      );
    }

    return source;
  }, [selectedUniCode, selectedUni, selectedFieldFilter, searchQuery, allCoursesWithUni]);

  // ATAR Matching Courses
  const matchingCourses = useMemo(() => {
    return allCoursesWithUni
      .filter(item => item.course.atarMin > 0 && effectiveATAR >= item.course.atarMin)
      .sort((a, b) => b.course.atarMin - a.course.atarMin);
  }, [allCoursesWithUni, effectiveATAR]);

  // Chart Data: Graduate Salary Comparison Across Unis
  const salaryChartData = useMemo(() => {
    return DETAILED_BRISBANE_UNIS.map(u => ({
      name: u.code,
      fullName: u.name,
      salary: u.qiltMetrics.medianGraduateSalary,
      empRate: u.qiltMetrics.fullTimeEmpPct,
      satisfaction: u.qiltMetrics.overallSatisfactionPct,
    }));
  }, []);

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
            Full metrics, enrollments, ATAR thresholds, HECS fee bands, QILT graduate outcome salaries, and news across UQ, QUT, Griffith, UniSC, UniSQ, ACU, and TAFE QLD.
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
          { id: 'overview', label: '📊 Uni Profiles & Enrollments' },
          { id: 'courses', label: '🎓 Top 10 Courses & ATARs' },
          { id: 'atar-matcher', label: '🎯 Interactive ATAR Matcher' },
          { id: 'qilt-charts', label: '📈 QILT Salaries & Graphics' },
          { id: 'housing-transit', label: '🏡 Housing & 50c Translink' },
          { id: 'news', label: '📰 News & 2032 Olympics Hubs' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW & ENROLLMENTS */}
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
                        <div className="text-[10px] text-muted-foreground">Total Students</div>
                        <div className="font-bold font-mono text-foreground">{uni.enrollments.total.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Undergrad Share</div>
                        <div className="font-bold font-mono text-foreground">{uni.enrollments.undergrad.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Domestic / Intl</div>
                        <div className="font-bold font-mono text-foreground">
                          {uni.enrollments.domesticPct}% / {uni.enrollments.internationalPct}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Graduate Salary</div>
                        <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          ${uni.qiltMetrics.medianGraduateSalary.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedUniCode(uni.code)}
                    className="w-full mt-3 py-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary text-foreground text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Full Metrics</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </button>
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
                  <a
                    href={selectedUni.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity self-start sm:self-center"
                  >
                    <span>Visit Official Study Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOP 10 COURSES & ATARS */}
      {activeTab === 'courses' && (
        <div className="space-y-5">
          {/* Controls: Search & Field Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search courses, ATAR, degrees..."
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
                  <th className="py-3 px-3 font-bold text-foreground">Degree Title</th>
                  <th className="py-3 px-3 font-bold text-foreground">Uni</th>
                  <th className="py-3 px-3 font-bold text-foreground">Field</th>
                  <th className="py-3 px-3 font-bold text-foreground font-mono text-center">Min ATAR</th>
                  <th className="py-3 px-3 font-bold text-foreground font-mono text-center">Median ATAR</th>
                  <th className="py-3 px-3 font-bold text-foreground font-mono">CSP Fee / yr</th>
                  <th className="py-3 px-3 font-bold text-foreground">Career & Median Salary</th>
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
                        <Badge variant="default" className="font-mono text-[10px]">
                          {uni.code}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{ backgroundColor: FIELD_COLORS[course.field] || '#6b7280' }}
                        >
                          {course.field}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top font-mono font-extrabold text-center text-foreground whitespace-nowrap">
                        {course.atarMin === 0 ? 'No ATAR (VET)' : course.atarMin.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 align-top font-mono text-center text-muted-foreground whitespace-nowrap">
                        {course.atarMedian === 0 ? 'N/A' : course.atarMedian.toFixed(2)}
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

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Eligible (+{margin.toFixed(2)} pts buffer)</span>
                      </span>
                      <a
                        href={uni.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Apply QTAC</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QILT SALARIES & GRAPHICS */}
      {activeTab === 'qilt-charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card variant="glass" className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-foreground text-sm">Median Graduate Starting Salary (QILT 2026)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis domain={[50000, 90000]} stroke="#888888" fontSize={10} tickFormatter={v => `$${v / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Median Salary']}
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="salary" radius={[8, 8, 0, 0]}>
                      {salaryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'UniSQ' ? '#10b981' : entry.name === 'UQ' ? '#8b5cf6' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                QILT national graduate survey data shows UniSQ leading Australia with a median starting salary of $78,200, followed by UQ ($76,500) and ACU ($76,000).
              </p>
            </Card>

            <Card variant="glass" className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-foreground text-sm">Full-Time Employment Rate (%) Within 4 Months</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis domain={[75, 95]} stroke="#888888" fontSize={10} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'FT Employment']}
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="empRate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                TAFE Queensland (88.5%), UniSQ (87.9%), and ACU (86.8%) achieve top employment outcomes due to clinical placements and trade apprenticeships.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: HOUSING & TRANSIT */}
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
                <p className="text-[10px] text-muted-foreground mt-0.5">Any zone in SEQ</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Daily Commute (Return)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$1.00</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 × 50c fares</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Weekly Transport Cap</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$5.00</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">5 days uni travel</p>
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

      {/* TAB 6: NEWS & INNOVATION HUBS */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Newspaper className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-foreground text-sm">2026/2027 Brisbane Tertiary News & Olympic Innovation Hubs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DETAILED_BRISBANE_UNIS.flatMap(u =>
              u.recentNews.map((n, idx) => (
                <SpotlightCard key={`${u.code}-news-${idx}`} className="p-4 space-y-2 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="font-mono text-[10px]">
                      {u.code}
                    </Badge>
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

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
} from 'lucide-react';
import {
  QLD_YEAR12_OVERVIEW,
  QLD_ATAR_CUTOFFS_2026,
  QCE_SUBJECT_CATEGORIES,
  QCE_SUBJECT_EXAMPLES,
  QLD_HIGH_SCHOOLS,
  QLD_SCHOOL_COSTS,
  QLD_TAFE,
} from '@/data/brisbane-data';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';

type SchoolType = 'All' | 'State' | 'Catholic' | 'Independent';

const SCHOOL_TYPE_STYLES: Record<Exclude<SchoolType, 'All'>, string> = {
  State: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
  Catholic: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  Independent: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
};

export function QldSchoolsYear12() {
  const [activeTab, setActiveTab] = useState<string>('year12');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<SchoolType>('All');
  const [schoolQuery, setSchoolQuery] = useState<string>('');

  const filteredSchools = useMemo(() => {
    return QLD_HIGH_SCHOOLS.filter(s => {
      if (schoolTypeFilter !== 'All' && s.type !== schoolTypeFilter) return false;
      if (schoolQuery.trim()) {
        const q = schoolQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.suburb.toLowerCase().includes(q);
      }
      return true;
    });
  }, [schoolTypeFilter, schoolQuery]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <School className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              QLD Year 12, Schools & TAFE (2026)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The QCE, ATAR and QCAA subject system, indicative university cut-offs, Brisbane &amp; regional high
            schools, and Fee-Free TAFE pathways.
          </p>
        </div>
        <Badge variant="success" className="shrink-0 font-bold">
          QLD 2026 • Education
        </Badge>
      </div>

      <Tabs
        tabs={[
          { id: 'year12', label: '🎓 QCE & ATAR' },
          { id: 'cutoffs', label: '🎯 2026 ATAR Cut-offs' },
          { id: 'schools', label: '🏫 High Schools' },
          { id: 'tafe', label: '🔧 Fee-Free TAFE' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: QCE & ATAR OVERVIEW */}
      {activeTab === 'year12' && (
        <div className="space-y-6">
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

          <Card variant="glass" className="p-5 space-y-4 border-violet-500/30 bg-violet-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Target className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-foreground text-sm">QCAA Senior Subject Categories (97 available)</h3>
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

          <Card variant="glass" className="p-5 space-y-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-foreground text-sm">Sample QCAA Senior Subjects (97 available in 2026)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold text-foreground mb-1.5">General subjects (scaled for ATAR)</div>
                <div className="flex flex-wrap gap-1.5">
                  {QCE_SUBJECT_EXAMPLES.general.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-foreground mb-1.5">Applied subjects (only ONE counts to ATAR)</div>
                <div className="flex flex-wrap gap-1.5">
                  {QCE_SUBJECT_EXAMPLES.applied.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-foreground mb-1.5">Short Courses</div>
                <div className="flex flex-wrap gap-1.5">
                  {QCE_SUBJECT_EXAMPLES.shortCourses.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qcaa} />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: ATAR CUT-OFFS */}
      {activeTab === 'cutoffs' && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Indicative 2026 ATAR selection ranks for popular Queensland courses (QTAC, indicative only — actual
            offers vary each year).
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-3 px-3 font-bold text-foreground">Course</th>
                  <th className="py-3 px-3 font-bold text-foreground">Provider</th>
                  <th className="py-3 px-3 font-bold text-foreground font-mono text-right">Indicative ATAR</th>
                </tr>
              </thead>
              <tbody>
                {QLD_ATAR_CUTOFFS_2026.map((row, i) => (
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

      {/* TAB 3: HIGH SCHOOLS */}
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
                    schoolTypeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
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
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground font-semibold">ICSEA</span>
                      <span className="font-mono font-bold text-foreground">{school.indicativeICSEA}</span>
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

      {/* TAB 4: TAFE */}
      {activeTab === 'tafe' && (
        <div className="space-y-5">
          <Card variant="glass" className="p-5 space-y-4 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-foreground text-sm">Fee-Free TAFE Queensland (2026)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{QLD_TAFE.feeFreeNote}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QLD_TAFE.feeFreeCourses2026.map(course => (
                <div key={course} className="flex items-center gap-2 text-xs text-foreground rounded-xl border border-border bg-card p-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{course}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">Typical Course Cost</div>
                <div className="text-sm font-bold font-mono text-foreground">{QLD_TAFE.typicalCourseCost}</div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">School-Based Apprenticeship</div>
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{QLD_TAFE.apprenticeshipNote}</div>
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

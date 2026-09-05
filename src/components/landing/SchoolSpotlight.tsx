import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ExternalLink, GraduationCap, MapPin, School, Search, Sparkles, X } from 'lucide-react';
import { Link } from '@/lib/router';
import { QLD_HIGH_SCHOOLS, type HighSchool } from '@/data/brisbane-data';

/** Sector filter options for the school search. */
type SchoolTypeFilter = 'All' | 'State' | 'Catholic' | 'Independent';

const TYPE_FILTERS: readonly SchoolTypeFilter[] = ['All', 'State', 'Catholic', 'Independent'];

/** Max result cards rendered; the full dataset (101 schools) lives in the Brisbane guide. */
const MAX_RESULTS = 12;

/** Total schools indexed — QLD_HIGH_SCHOOLS currently holds 101 entries. */
const TOTAL_SCHOOLS = QLD_HIGH_SCHOOLS.length;

/** Deep link into the Brisbane guide's schools tab (verified: BNE_TABS includes 'schools'). */
const SCHOOLS_GUIDE_HREF = '/brisbane-qld?tab=schools';

type IcseaTier = 'elite' | 'strong';

/**
 * Classify a school's indicative ICSEA score.
 * Elite: >= 1150 · Strong: >= 1050 · otherwise no badge.
 */
function icseaTier(icsea: number | undefined): IcseaTier | null {
  if (icsea === undefined) return null;
  if (icsea >= 1150) return 'elite';
  if (icsea >= 1050) return 'strong';
  return null;
}

const ICSEA_BADGE_STYLES: Record<IcseaTier, string> = {
  elite:
    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  strong:
    'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
};

const TYPE_BADGE_STYLES: Record<Exclude<SchoolTypeFilter, 'All'>, string> = {
  State: 'bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300',
  Catholic: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  Independent: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300',
};

interface FeaturedEntry {
  /** Substring matched against the dataset name to resolve the live record. */
  nameMatch: string;
  /** Hardcoded verified blurb (checked against QLD_HIGH_SCHOOLS + My School/ACARA notes). */
  blurb: string;
  tag: string;
}

/** Verified selective-entry schools — blurbs cross-checked against brisbane-data.ts. */
const FEATURED_SELECTIVE: readonly FeaturedEntry[] = [
  {
    nameMatch: 'Brisbane State High School',
    blurb:
      "Queensland's top-performing state school — selective entry across academic, cultural and sporting pathways with consistently outstanding ATAR outcomes.",
    tag: 'Selective state · South Brisbane',
  },
  {
    nameMatch: 'Science Mathematics & Technology',
    blurb:
      'Selective IB World School in Toowong — entry by exam + interview, median IB 38 (≈ ATAR 95+), Queensland’s leading state IB performer.',
    tag: 'Selective IB · Toowong',
  },
  {
    nameMatch: 'Health Sciences (QAHS)',
    blurb:
      'Selective health-sciences IB World School on the Gold Coast (10–12) — entry by exam + interview, top-3 QLD IB results with direct Griffith health pathways.',
    tag: 'Selective IB · Gold Coast',
  },
];

interface ResolvedFeatured {
  school: HighSchool;
  blurb: string;
  tag: string;
}

/** Resolve featured blurbs to live dataset records (name, suburb, ICSEA, website). */
const RESOLVED_FEATURED: readonly ResolvedFeatured[] = FEATURED_SELECTIVE.flatMap(
  (entry: FeaturedEntry): readonly ResolvedFeatured[] => {
    const school: HighSchool | undefined = QLD_HIGH_SCHOOLS.find((s: HighSchool): boolean =>
      s.name.includes(entry.nameMatch),
    );
    return school === undefined ? [] : [{ school, blurb: entry.blurb, tag: entry.tag }];
  },
);

/**
 * SchoolSpotlight — 'Find your high school' search over QLD_HIGH_SCHOOLS.
 *
 * Search input + sector filter (All/State/Catholic/Independent), a featured row
 * of 3 selective schools with verified blurbs, ICSEA badges (elite ≥1150,
 * strong ≥1050), and a capped result list (12) deep-linking to the full
 * Brisbane schools guide. Motion layout animations; light + dark; 375px-safe.
 */
export function SchoolSpotlight() {
  const reducedMotion = useReducedMotion() ?? false;
  const searchId = useId();
  const headingId = useId();
  const countId = useId();
  const [query, setQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<SchoolTypeFilter>('All');

  const filteredSchools: readonly HighSchool[] = useMemo((): readonly HighSchool[] => {
    const q: string = query.trim().toLowerCase();
    return QLD_HIGH_SCHOOLS.filter((s: HighSchool): boolean => {
      if (typeFilter !== 'All' && s.type !== typeFilter) return false;
      if (q.length === 0) return true;
      return s.name.toLowerCase().includes(q) || s.suburb.toLowerCase().includes(q);
    });
  }, [query, typeFilter]);

  const visibleSchools: readonly HighSchool[] = useMemo(
    (): readonly HighSchool[] => filteredSchools.slice(0, MAX_RESULTS),
    [filteredSchools],
  );

  const isFiltered: boolean = query.trim().length > 0 || typeFilter !== 'All';

  const resultSummary: string = isFiltered
    ? `Showing ${visibleSchools.length} of ${filteredSchools.length} matching ${filteredSchools.length === 1 ? 'school' : 'schools'} · ${TOTAL_SCHOOLS} schools indexed`
    : `Showing ${visibleSchools.length} of ${TOTAL_SCHOOLS} schools`;

  const motionItem = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97 },
        transition: { duration: 0.2 },
      };

  return (
    <section
      aria-labelledby={headingId}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
        >
          <School className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
          >
            Find your high school
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Search {TOTAL_SCHOOLS} Queensland high schools by name or suburb, and filter by sector.
          </p>
        </div>
      </div>

      {/* Featured selective row */}
      <div className="mb-5">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          Selective entry spotlight
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {RESOLVED_FEATURED.map(({ school, blurb, tag }: ResolvedFeatured) => {
            const tier: IcseaTier | null = icseaTier(school.indicativeICSEA);
            return (
              <motion.article
                key={school.name}
                layout={!reducedMotion}
                {...motionItem}
                className="flex min-w-0 flex-col rounded-xl border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {tag}
                </p>
                <h3 className="mt-0.5 text-sm font-bold leading-snug text-slate-900 dark:text-white">
                  {school.name}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {blurb}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {tier !== null && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${ICSEA_BADGE_STYLES[tier]}`}
                    >
                      ICSEA {school.indicativeICSEA} · {tier === 'elite' ? 'Elite' : 'Strong'}
                    </span>
                  )}
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                  >
                    Official site
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Search + filter */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            Search high schools by name or suburb
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value)}
            placeholder="Try “Grammar”, “Toowong”, “Southport”…"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={(): void => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by school sector">
          {TYPE_FILTERS.map((filter: SchoolTypeFilter) => {
            const isActive: boolean = typeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isActive}
                onClick={(): void => setTypeFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500 dark:text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <p
        id={countId}
        role="status"
        aria-live="polite"
        className="mb-2 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400"
      >
        {resultSummary}
      </p>

      {/* Results */}
      {visibleSchools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <GraduationCap
            className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            No schools match “{query.trim()}”
            {typeFilter !== 'All' ? ` in ${typeFilter} schools` : ''}
          </p>
          <button
            type="button"
            onClick={(): void => {
              setQuery('');
              setTypeFilter('All');
            }}
            className="mt-3 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            Reset search
          </button>
        </div>
      ) : (
        <motion.ul layout={!reducedMotion} aria-describedby={countId} className="space-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleSchools.map((school: HighSchool) => {
              const tier: IcseaTier | null = icseaTier(school.indicativeICSEA);
              return (
                <motion.li
                  key={school.name}
                  layout={!reducedMotion}
                  {...motionItem}
                  className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="min-w-0 flex-1 basis-40 truncate text-sm font-bold text-slate-900 dark:text-white">
                      {school.name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_BADGE_STYLES[school.type]}`}
                    >
                      {school.type}
                    </span>
                    {tier !== null && (
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${ICSEA_BADGE_STYLES[tier]}`}
                      >
                        ICSEA {school.indicativeICSEA} · {tier === 'elite' ? 'Elite' : 'Strong'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {school.suburb}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Years {school.yearLevels}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {school.notable}
                  </p>
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                  >
                    Visit school website
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Deep link to full guide */}
      <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
        <Link
          to={SCHOOLS_GUIDE_HREF}
          className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
        >
          <span className="min-w-0">
            Compare all {TOTAL_SCHOOLS} schools, NAPLAN &amp; fees in the Brisbane guide
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { cn } from '@/lib/utils';

interface JourneyMonth {
  /** Stable key, e.g. 'jan'. */
  key: string;
  /** Pill label, e.g. 'Jan'. */
  short: string;
  /** Full month name, e.g. 'January'. */
  full: string;
  /** Qld school-term context for the month. */
  term: string;
  /** Money milestone title. */
  milestone: string;
  /** One-to-two sentence explainer. */
  detail: string;
  /** The single action for the month. */
  action: string;
  /** MANDY_MODULES id used to resolve the deep-link route. */
  moduleId: string;
  /** CTA label for the deep link. */
  linkLabel: string;
}

/**
 * Resolve a MANDY_MODULES route by id. Falls back to '/' if unknown,
 * so links never break if module ids change.
 */
function moduleRoute(moduleId: string): string {
  return MANDY_MODULES.find((m) => m.id === moduleId)?.route ?? '/';
}

function moduleTitle(moduleId: string): string {
  return MANDY_MODULES.find((m) => m.id === moduleId)?.title ?? 'Guide';
}

const JOURNEY_MAP: ReadonlyArray<JourneyMonth> = [
  {
    key: 'jan',
    short: 'Jan',
    full: 'January',
    term: 'Summer holidays · Term 1 starts late Jan',
    milestone: 'TFN + New Year job hunt',
    detail:
      'Shops and cafes backfill Christmas casuals in January. You need a TFN before your first shift, or payers must withhold 47% from the top dollar.',
    action: 'Apply for a free TFN (ATO + AusPost ID check), then hand Form NAT 3092 to your manager.',
    moduleId: 'careers-employment',
    linkLabel: 'TFN + first-job checklist',
  },
  {
    key: 'feb',
    short: 'Feb',
    full: 'February',
    term: 'Term 1 · back to school',
    milestone: 'Back-to-school budget + SRS costs',
    detail:
      'Student Resource Scheme, stationery, BYO device and 50c Translink fares all land in one month. Split the hit before it splits you.',
    action: 'List every school cost, then split each pay 60/20/20 (spend / Mojo buffer / big goal).',
    moduleId: 'teen-budgeting',
    linkLabel: 'Build my school-term budget',
  },
  {
    key: 'mar',
    short: 'Mar',
    full: 'March',
    term: 'Term 1 · first full pay cycles',
    milestone: 'First super check payday',
    detail:
      'Worked 30+ hours in a holiday week? Your 12% Super Guarantee should land in your fund within 7 business days under Payday Super.',
    action: 'Match one payslip to your fund app and myGov > ATO > Super.',
    moduleId: 'super-retirement',
    linkLabel: 'Check my super',
  },
  {
    key: 'apr',
    short: 'Apr',
    full: 'April',
    term: 'Term 1 ends · Easter break · Term 2 starts',
    milestone: 'Easter public-holiday penalty shifts',
    detail:
      'Good Friday, Easter Saturday/Sunday and Easter Monday pay 200–250% casual. Volunteer for the days others avoid.',
    action: "Screenshot your award's public-holiday rate on PACT and check the April payslip.",
    moduleId: 'careers-employment',
    linkLabel: 'Penalty-rate checker',
  },
  {
    key: 'may',
    short: 'May',
    full: 'May',
    term: 'Term 2 · winter assessment lead-up',
    milestone: 'HELP indexation warning — 1 June',
    detail:
      'HELP debt is indexed every 1 June (2.8% in 2026). Balances grow while you study — know it before you plan uni.',
    action: 'Look up the current indexation rate and repayment threshold before locking uni plans.',
    moduleId: 'brisbane-qld',
    linkLabel: 'HELP + uni costs explained',
  },
  {
    key: 'jun',
    short: 'Jun',
    full: 'June',
    term: 'Term 2 ends · EOFY 30 June',
    milestone: 'EOFY + HELP indexation applied',
    detail:
      'Indexation hits 1 June and the financial year ends 30 June. Under-$18,200 workers get withheld PAYG back on lodgment.',
    action: "Save your June payslip and wait for 'Tax Ready' in myGov before lodging.",
    moduleId: 'tax-guide',
    linkLabel: 'Lodge my first return',
  },
  {
    key: 'jul',
    short: 'Jul',
    full: 'July',
    term: 'Winter holidays · Term 3 starts · new financial year',
    milestone: 'New FY rates + minimum-wage rise',
    detail:
      'From 1 July: updated tax brackets, SG rules and the Fair Work minimum-wage rise flow into junior award rates.',
    action: 'Re-check your hourly rate and the $18,200 tax-free threshold for the new FY.',
    moduleId: 'tax-guide',
    linkLabel: 'New-year tax + pay rates',
  },
  {
    key: 'aug',
    short: 'Aug',
    full: 'August',
    term: 'Term 3 · subject selection + QTAC opens',
    milestone: 'QTAC opens + subject selection',
    detail:
      'QTAC opens early August for next-year uni. Year 10/11 subject choices now shape prerequisites and future HELP debt.',
    action: 'Shortlist 3 QTAC courses and check prerequisites + ATAR cut-offs.',
    moduleId: 'brisbane-qld',
    linkLabel: 'Explore QTAC pathways',
  },
  {
    key: 'sep',
    short: 'Sep',
    full: 'September',
    term: 'Term 3 ends · Term 4 starts',
    milestone: "Early-bird QTAC cutoff + Father's Day shifts",
    detail:
      "QTAC early-bird closes late September (fees jump after). Father's Day Sunday pays Sunday penalties — a prime casual weekend.",
    action: 'Submit QTAC before the early-bird deadline, then grab the Father’s Day roster.',
    moduleId: 'brisbane-qld',
    linkLabel: 'Beat the QTAC deadline',
  },
  {
    key: 'oct',
    short: 'Oct',
    full: 'October',
    term: 'Term 4 · external exams + SEE',
    milestone: 'External exams + Senior External Examination',
    detail:
      'Year 12 externals run Oct–Nov. Cut shifts, protect sleep, and let your Mojo buffer cover the hours you drop.',
    action: 'Give your manager exam blackout dates and freeze non-essential spending.',
    moduleId: 'money-and-you',
    linkLabel: 'Exam-season money plan',
  },
  {
    key: 'nov',
    short: 'Nov',
    full: 'November',
    term: 'Exams end · schoolies week',
    milestone: 'Schoolies budget guardrails',
    detail:
      'Accommodation, transport and food stack fast. Scams and BNPL target schoolies — set a hard cap before you go.',
    action: 'Set a daily schoolies cap and leave BNPL off your phone.',
    moduleId: 'spending-saving',
    linkLabel: 'Schoolies-safe spending',
  },
  {
    key: 'dec',
    short: 'Dec',
    full: 'December',
    term: 'Summer holidays · results + offers',
    milestone: 'ATAR 18 Dec + major offers + Christmas peak',
    detail:
      'Qld ATAR drops 18 Dec with major QTAC offers to follow. Retail and hospo Christmas rosters pay peak Sunday + PH rates.',
    action: 'Diary ATAR + offer dates, then apply early for Christmas casual roles.',
    moduleId: 'careers-employment',
    linkLabel: 'Nail Christmas casual work',
  },
];

export interface JourneyMapProps {
  className?: string;
}

/**
 * JourneyMap — "Your money year" interactive 12-month roadmap.
 *
 * Jan–Dec pills select a month; the panel shows that month's Qld
 * school-term context, money milestone, one action, and one
 * MANDY_MODULES deep link. Panel swaps animate (spring) unless the
 * user prefers reduced motion, in which case they swap instantly.
 */
export function JourneyMap({ className }: JourneyMapProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const m = new Date().getMonth();
    return m >= 0 && m <= 11 ? m : 0;
  });

  const selected: JourneyMonth = JOURNEY_MAP[selectedIdx] ?? JOURNEY_MAP[0]!;

  const goPrev = (): void => setSelectedIdx((i) => (i + 11) % 12);
  const goNext = (): void => setSelectedIdx((i) => (i + 1) % 12);

  return (
    <section aria-labelledby="journey-map-heading" className={cn('w-full', className)}>
      <div className="mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Month by month
        </p>
        <h2
          id="journey-map-heading"
          className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white"
        >
          Your money year
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
          Pick a month to see what school is doing — and the one money move to make.
        </p>
      </div>

      {/* Month selector pills: scrollable at 375px, wraps on larger screens */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label={`Previous month, show ${JOURNEY_MAP[(selectedIdx + 11) % 12]?.full ?? ''}`}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <div
          role="group"
          aria-label="Choose a month"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {JOURNEY_MAP.map((month, i) => {
            const isActive = i === selectedIdx;
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => setSelectedIdx(i)}
                aria-pressed={isActive}
                aria-label={`${month.full}: ${month.milestone}`}
                className={cn(
                  'shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300',
                )}
              >
                {month.short}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label={`Next month, show ${JOURNEY_MAP[(selectedIdx + 1) % 12]?.full ?? ''}`}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {/* Detail panel: aria-live so month changes are announced */}
      <div aria-live="polite" aria-atomic="true">
        {reducedMotion ? (
          <div
            key={selected.key}
            role="tabpanel"
            aria-label={`${selected.full}: ${selected.milestone}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <PanelBody month={selected} />
          </div>
        ) : (
          <motion.div
            key={selected.key}
            role="tabpanel"
            aria-label={`${selected.full}: ${selected.milestone}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <PanelBody month={selected} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function PanelBody({ month }: { month: JourneyMonth }): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
          {month.full}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{month.term}</span>
      </div>

      <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg dark:text-white">
        {month.milestone}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{month.detail}</p>

      <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-900 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-900">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          <span className="font-bold">Do this: </span>
          {month.action}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Link
          to={moduleRoute(month.moduleId)}
          aria-label={`${month.linkLabel} — open ${moduleTitle(month.moduleId)} guide`}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-950"
        >
          {month.linkLabel}
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          From: {moduleTitle(month.moduleId)}
        </span>
      </div>
    </div>
  );
}

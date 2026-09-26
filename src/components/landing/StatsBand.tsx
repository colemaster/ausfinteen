import { AnimatedNumber, type AnimatedNumberFormat } from '@/components/ui/AnimatedNumber';
import { LANDING_STATS } from '@/data/landing-stats';

interface StatChip {
  id: string;
  value: number;
  format: AnimatedNumberFormat;
  label: string;
  emoji: string;
}

/**
 * StatsBand — infinite CSS marquee band of 8 headline teen-money stats.
 *
 * Pre-computed constants from LANDING_STATS avoid pulling 350+ KB of deep datasets into
 * the critical rendering path, ensuring instantaneous above-the-fold paint.
 *
 * Motion: CSS-only loop (duplicate list, seamless -50% translate) reusing the
 * global `.animate-ticker` / `.mask-fade-edges` utilities — pauses on hover,
 * disabled under prefers-reduced-motion (global kill-switch + motion-reduce).
 */
export function StatsBand(): React.JSX.Element {
  const schoolCount = LANDING_STATS.schoolCount;
  const guideCount = LANDING_STATS.guideCount;
  const feeFreeCount = LANDING_STATS.feeFreeCount;
  const atarCutoffCount = LANDING_STATS.atarCutoffCount;
  const topHisaRate = LANDING_STATS.topHisaRate;
  const sgPercent = LANDING_STATS.sgPercent;
  const helpThreshold = LANDING_STATS.helpThreshold;
  const FLAT_FARE_CENTS = LANDING_STATS.flatFareCents;

  const stats: StatChip[] = [
    { id: 'schools', value: schoolCount, format: 'number', label: 'QLD schools', emoji: '🏫' },
    { id: 'guides', value: guideCount, format: 'number', label: 'money guides', emoji: '📚' },
    {
      id: 'fee-free',
      value: feeFreeCount,
      format: 'number',
      label: 'fee-free TAFE courses',
      emoji: '🛠️',
    },
    {
      id: 'atar-cutoffs',
      value: atarCutoffCount,
      format: 'number',
      label: 'ATAR cut-offs',
      emoji: '📊',
    },
    {
      id: 'hisa',
      value: topHisaRate,
      format: (v: number): string => `${v.toFixed(2)}%`,
      label: 'top youth HISA',
      emoji: '🏦',
    },
    {
      id: 'sg',
      value: sgPercent,
      format: (v: number): string => `${v.toFixed(1)}%`,
      label: 'super guarantee',
      emoji: '⭐️',
    },
    {
      id: 'help-threshold',
      value: helpThreshold,
      format: 'currency',
      label: 'HELP threshold',
      emoji: '🎓',
    },
    {
      id: 'fares',
      value: FLAT_FARE_CENTS,
      format: (v: number): string => `${Math.round(v)}c`,
      label: 'flat fares',
      emoji: '🚌',
    },
  ];

  const chipClass =
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white ' +
    'px-3 py-1.5 text-xs whitespace-nowrap shadow-sm dark:border-slate-800 dark:bg-slate-900';
  const numberClass = 'font-mono font-bold tabular-nums text-slate-900 dark:text-white';
  const labelClass = 'font-medium text-slate-600 dark:text-slate-300';

  const renderList = (hidden: boolean): React.JSX.Element => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-2 pr-2"
    >
      {stats.map((stat) => (
        <li key={`${hidden ? 'copy-' : ''}${stat.id}`} className={chipClass}>
          <span aria-hidden="true">{stat.emoji}</span>
          <AnimatedNumber value={stat.value} format={stat.format} className={numberClass} />
          <span className={labelClass}>{stat.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Teen money figures at a glance">
      <div
        role="marquee"
        aria-label="Key teen money statistics"
        className="mask-fade-edges relative overflow-hidden border-y border-slate-200 bg-slate-50 py-3 select-none dark:border-slate-800 dark:bg-slate-950"
      >
        <div
          className="animate-ticker motion-reduce:animate-none flex w-max will-change-transform"
          style={{ animationDuration: '45s' }}
        >
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
    </section>
  );
}

import { AnimatedNumber, type AnimatedNumberFormat } from '@/components/ui/AnimatedNumber';
import { QLD_ATAR_CUTOFFS_2026, QLD_HIGH_SCHOOLS, QLD_TAFE } from '@/data/brisbane-data';
import { HELP_REPAYMENT_THRESHOLDS_2026_27 } from '@/data/constants';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { SUPER_RULES } from '@/data/super-rules';
import { TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';

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
 * All figures are computed inline from data imports (no hardcoded counts):
 * - QLD schools = QLD_HIGH_SCHOOLS.length
 * - Money guides = total topics across MANDY_MODULES
 * - Fee-free TAFE courses = QLD_TAFE.feeFreeCourses2026.length
 * - ATAR cut-offs = QLD_ATAR_CUTOFFS_2026.length
 * - Top youth HISA = max of TEEN_SAVINGS_ACCOUNTS.maxRate
 * - Super guarantee = SUPER_RULES.sgRate (as a percent)
 * - HELP threshold = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max
 * - Flat fares = QLD TransLink 50c flat fare (statewide policy figure)
 *
 * Motion: CSS-only loop (duplicate list, seamless -50% translate) reusing the
 * global `.animate-ticker` / `.mask-fade-edges` utilities — pauses on hover,
 * disabled under prefers-reduced-motion (global kill-switch + motion-reduce).
 */
export function StatsBand(): React.JSX.Element {
  const schoolCount: number = QLD_HIGH_SCHOOLS.length;
  const guideCount: number = MANDY_MODULES.reduce((sum, mod) => sum + mod.topics.length, 0);
  const feeFreeCount: number = QLD_TAFE.feeFreeCourses2026.length;
  const atarCutoffCount: number = QLD_ATAR_CUTOFFS_2026.length;
  const topHisaRate: number = Math.max(...TEEN_SAVINGS_ACCOUNTS.map((account) => account.maxRate));
  const sgPercent: number = SUPER_RULES.sgRate * 100;
  const helpThreshold: number = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max;

  /** QLD TransLink statewide flat fare in cents (50c policy fare). */
  const FLAT_FARE_CENTS: number = 50;

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

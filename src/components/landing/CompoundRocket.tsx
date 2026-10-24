import { useId, useMemo, useState, useCallback } from 'react';
import { ArrowRight, Flame, Rocket, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link } from '@/lib/router';
import { cn } from '@/lib/utils';

/**
 * CompoundRocket — Interactive early vs late starter growth visualizer to age 60.
 *
 * Math (monthly compounding, end-of-month deposits):
 * - Early starter: deposit starts at age 15.
 *   5.80% p.a. nominal (HISA) from 15–18, then 8% p.a. nominal (ETFs) 18–60.
 * - Late starter: deposit (2× the early starter amount) starts at age 25.
 *   8% p.a. nominal, monthly compounding.
 * - Monthly rate = annual / 12. Illustrative only.
 *
 * Accessibility: hand-rolled SVG with role="img", computed aria-label,
 * and a full screen-reader-accessible table of milestone values.
 */

const START_AGE = 15;
const HISA_END_AGE = 18;
const LATE_START_AGE = 25;
const END_AGE = 60;
const HISA_ANNUAL = 0.058;
const ETF_ANNUAL = 0.08;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

const MILESTONE_AGES: readonly number[] = [18, 25, 40, 60];
const TARGET_GOALS: readonly number[] = [10_000, 50_000, 100_000, 1_000_000];

const VIEW_W = 680;
const VIEW_H = 380;
const PAD_L = 62;
const PAD_R = 30;
const PAD_T = 24;
const PAD_B = 40;

const EARLY_STROKE = '#10b981'; // Emerald 500
const LATE_STROKE = '#3b82f6';  // Sky/Blue 500

type ContributionPreset = 15 | 25 | 50 | 100;
type Frequency = 'weekly' | 'fortnightly' | 'monthly';

interface BalancePoint {
  age: number;
  early: number;
  late: number;
}

interface Milestone {
  age: number;
  early: number;
  late: number;
}

interface GoalHit {
  target: number;
  age: number | null;
}

/** Full AUD with commas, e.g. 69798 → "$69,798". */
function formatAUD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-AU')}`;
}

/** Compact AUD for chart labels, e.g. 19537 → "$20k", 566806 → "$567k". */
function formatCompactAUD(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `$${Math.round(value / 1000)}k`;
  if (abs >= 1_000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

/** Snap a raw tick step to a 1 / 2 / 2.5 / 5 / 10 × magnitude nice number. */
function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, raw)));
  const n = raw / magnitude;
  if (n <= 1) return 1 * magnitude;
  if (n <= 2) return 2 * magnitude;
  if (n <= 2.5) return 2.5 * magnitude;
  if (n <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function CompoundRocket(): React.JSX.Element {
  const gradientId = useId();

  const [weeklyDeposit, setWeeklyDeposit] = useState<ContributionPreset>(25);
  const [frequency, setFrequency] = useState<Frequency>('weekly');

  // Derive weekly base equivalents
  const earlyWeekly = weeklyDeposit;
  const lateWeekly = weeklyDeposit * 2;

  // Monthly deposit calculation for compounding math
  const monthlyEarly = (earlyWeekly * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
  const monthlyLate = (lateWeekly * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;

  // Display label based on frequency selection
  const earlyFreqLabel =
    frequency === 'weekly'
      ? `$${earlyWeekly}/wk`
      : frequency === 'fortnightly'
        ? `$${earlyWeekly * 2}/fn`
        : `$${Math.round(monthlyEarly)}/mo`;

  const lateFreqLabel =
    frequency === 'weekly'
      ? `$${lateWeekly}/wk`
      : frequency === 'fortnightly'
        ? `$${lateWeekly * 2}/fn`
        : `$${Math.round(monthlyLate)}/mo`;

  const series = useMemo<BalancePoint[]>(() => {
    const totalMonths = (END_AGE - START_AGE) * MONTHS_PER_YEAR;
    const hisaMonths = (HISA_END_AGE - START_AGE) * MONTHS_PER_YEAR;
    const lateOffsetMonths = (LATE_START_AGE - START_AGE) * MONTHS_PER_YEAR;
    const rHisa = HISA_ANNUAL / MONTHS_PER_YEAR;
    const rEtf = ETF_ANNUAL / MONTHS_PER_YEAR;
    const points: BalancePoint[] = [{ age: START_AGE, early: 0, late: 0 }];
    let early = 0;
    let late = 0;
    for (let m = 1; m <= totalMonths; m += 1) {
      const r = m <= hisaMonths ? rHisa : rEtf;
      early = early * (1 + r) + monthlyEarly;
      if (m > lateOffsetMonths) {
        late = late * (1 + rEtf) + monthlyLate;
      }
      points.push({ age: START_AGE + m / MONTHS_PER_YEAR, early, late });
    }
    return points;
  }, [monthlyEarly, monthlyLate]);

  const milestones = useMemo<Milestone[]>(
    () =>
      MILESTONE_AGES.map((age) => {
        const idx = Math.round((age - START_AGE) * MONTHS_PER_YEAR);
        const point = series[idx] ?? series[series.length - 1]!;
        return { age, early: point.early, late: point.late };
      }),
    [series],
  );

  const goalHits = useMemo<GoalHit[]>(() => {
    return TARGET_GOALS.map((target) => {
      const point = series.find((p) => p.early >= target);
      return {
        target,
        age: point ? Math.round(point.age * 10) / 10 : null,
      };
    });
  }, [series]);

  const earlyFinal = series[series.length - 1]?.early ?? 0;
  const lateFinal = series[series.length - 1]?.late ?? 0;
  const delta = earlyFinal - lateFinal;

  const earlyContrib = earlyWeekly * WEEKS_PER_YEAR * (END_AGE - START_AGE);
  const lateContrib = lateWeekly * WEEKS_PER_YEAR * (END_AGE - LATE_START_AGE);
  const contribLess = lateContrib - earlyContrib;

  const innerW = VIEW_W - PAD_L - PAD_R;
  const innerH = VIEW_H - PAD_T - PAD_B;
  const yMax = Math.max(earlyFinal, lateFinal) * 1.08;

  // Coordinate functions with explicit parameter pass-through for React Compiler
  const xForAge = useCallback(
    (age: number): number => PAD_L + ((age - START_AGE) / (END_AGE - START_AGE)) * innerW,
    [innerW],
  );

  const yForValue = useCallback(
    (value: number): number => PAD_T + innerH * (1 - Math.max(0, value) / yMax),
    [innerH, yMax],
  );

  // Derive SVG path strings cleanly with fully qualified dependencies
  const earlyPath = useMemo<string>(() => {
    return series
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xForAge(p.age).toFixed(2)} ${yForValue(p.early).toFixed(2)}`,
      )
      .join(' ');
  }, [series, xForAge, yForValue]);

  const latePath = useMemo<string>(() => {
    return series
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xForAge(p.age).toFixed(2)} ${yForValue(p.late).toFixed(2)}`,
      )
      .join(' ');
  }, [series, xForAge, yForValue]);

  const yTicks = useMemo<number[]>(() => {
    const step = niceStep(yMax / 4);
    return [0, step, step * 2, step * 3, step * 4].filter((t) => t <= yMax * 1.001);
  }, [yMax]);

  const visibleTargetGoals = useMemo<number[]>(() => {
    return TARGET_GOALS.filter((g) => g <= yMax * 0.95);
  }, [yMax]);

  const xTicks: readonly number[] = [START_AGE, ...MILESTONE_AGES];

  const svgSummary =
    `Growth to age ${END_AGE}: starting ${earlyFreqLabel} at 15 reaches ` +
    `${formatAUD(earlyFinal)}; starting ${lateFreqLabel} at 25 reaches ` +
    `${formatAUD(lateFinal)}. Starting at 15 wins by ${formatAUD(delta)} ` +
    `despite depositing ${formatAUD(contribLess)} less.`;

  return (
    <section
      aria-labelledby="compound-rocket-heading"
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/90 to-card/60 p-5 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-primary/20 dark:shadow-[0_0_50px_-15px_rgba(16,185,129,0.15)]"
    >
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/20"
      />

      {/* Header and badge */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 ring-1 ring-emerald-500/30 shadow-inner dark:from-emerald-500/30 dark:to-teal-500/10 dark:text-emerald-400"
          >
            <Rocket className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Exponential Compounding
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Age 15 → 60 Simulation
              </span>
            </div>
            <h2
              id="compound-rocket-heading"
              className="mt-1 text-lg font-extrabold tracking-tight text-foreground sm:text-xl"
            >
              Start at 15 vs Double at 25
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Early starter invests <strong className="text-emerald-600 dark:text-emerald-400">{earlyFreqLabel}</strong> from 15 (HISA 15–18, then 8% ETFs).
              Late starter invests double (<strong className="text-sky-600 dark:text-sky-400">{lateFreqLabel}</strong>) starting at 25.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-inner">
        {/* Deposit Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Starter Pay:
          </span>
          {([15, 25, 50, 100] as const).map((amt) => {
            const active = weeklyDeposit === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setWeeklyDeposit(amt)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200',
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 dark:bg-emerald-500 dark:text-slate-950'
                    : 'bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border/60',
                )}
              >
                ${amt}/wk
              </button>
            );
          })}
        </div>

        {/* Frequency toggles */}
        <div className="flex items-center gap-1 bg-card/60 p-1 rounded-xl border border-border/60">
          {(['weekly', 'fortnightly', 'monthly'] as const).map((freq) => {
            const active = frequency === freq;
            return (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {freq}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Delta Verdict Callout */}
      <div
        aria-live="polite"
        className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-4 text-emerald-950 dark:text-emerald-100"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs leading-relaxed sm:text-sm">
            <span className="block text-sm font-extrabold sm:text-base text-foreground">
              Starting at 15 wins by{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base sm:text-lg">
                {formatAUD(delta)}
              </span>{' '}
              at age {END_AGE}!
            </span>
            <span className="mt-0.5 block text-muted-foreground">
              Despite depositing <strong className="text-foreground">{formatAUD(contribLess)} less out-of-pocket</strong> ({formatAUD(earlyContrib)} total vs {formatAUD(lateContrib)}). That is the mathematical superpower of time in the market.
            </span>
          </div>
        </div>
      </div>

      {/* Target Goal Markers Grid */}
      <div className="relative mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {goalHits.map(({ target, age }) => (
          <div
            key={target}
            className="flex flex-col rounded-xl border border-border/60 bg-card/60 p-2.5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3 w-3 text-emerald-500" />
              <span>{formatCompactAUD(target)} Milestone</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              {age !== null ? (
                <>
                  <span className="font-mono text-base font-extrabold text-foreground">
                    Age {age}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    hit!
                  </span>
                </>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">Age 60+</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Legend */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: EARLY_STROKE }}
            />
            Age 15 starter ({earlyFreqLabel}) →{' '}
            <strong className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatCompactAUD(earlyFinal)}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: LATE_STROKE }}
            />
            Age 25 starter ({lateFreqLabel}) →{' '}
            <strong className="font-mono text-sky-600 dark:text-sky-400">
              {formatCompactAUD(lateFinal)}
            </strong>
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950/5 p-2 dark:bg-slate-950/60 shadow-inner">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={svgSummary}
          className="h-auto w-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`${gradientId}-early-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EARLY_STROKE} stopOpacity="0.28" />
              <stop offset="60%" stopColor={EARLY_STROKE} stopOpacity="0.08" />
              <stop offset="100%" stopColor={EARLY_STROKE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${gradientId}-late-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LATE_STROKE} stopOpacity="0.18" />
              <stop offset="100%" stopColor={LATE_STROKE} stopOpacity="0" />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={EARLY_STROKE} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Gridlines + Y labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_L}
                y1={yForValue(tick)}
                x2={VIEW_W - PAD_R}
                y2={yForValue(tick)}
                strokeWidth="1"
                className="stroke-slate-200 dark:stroke-slate-800/80"
                strokeDasharray={tick === 0 ? undefined : '3 3'}
              />
              <text
                x={PAD_L - 8}
                y={yForValue(tick) + 4}
                textAnchor="end"
                fontSize="10"
                className="fill-muted-foreground font-mono font-medium"
              >
                {formatCompactAUD(tick)}
              </text>
            </g>
          ))}

          {/* Target Goal Horizontal Reference Markers */}
          {visibleTargetGoals.map((target) => (
            <g key={`goal-${target}`}>
              <line
                x1={PAD_L}
                y1={yForValue(target)}
                x2={VIEW_W - PAD_R}
                y2={yForValue(target)}
                strokeWidth="1"
                stroke="#10b981"
                strokeOpacity="0.35"
                strokeDasharray="4 4"
              />
              <text
                x={VIEW_W - PAD_R}
                y={yForValue(target) - 3}
                textAnchor="end"
                fontSize="9"
                fontWeight="700"
                className="fill-emerald-600/70 dark:fill-emerald-400/80 font-mono"
              >
                Goal {formatCompactAUD(target)}
              </text>
            </g>
          ))}

          {/* X Age Axis Labels */}
          {xTicks.map((age) => (
            <g key={age}>
              <line
                x1={xForAge(age)}
                y1={PAD_T}
                x2={xForAge(age)}
                y2={VIEW_H - PAD_B}
                strokeWidth="1"
                className="stroke-slate-200/50 dark:stroke-slate-800/50"
                strokeDasharray="2 4"
              />
              <text
                x={xForAge(age)}
                y={VIEW_H - PAD_B + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                className="fill-muted-foreground font-mono"
              >
                {age === START_AGE ? `Age ${age}` : age}
              </text>
            </g>
          ))}

          {/* Area fill under early curve */}
          <path
            d={`${earlyPath} L ${xForAge(END_AGE).toFixed(2)} ${yForValue(0).toFixed(2)} L ${xForAge(START_AGE).toFixed(2)} ${yForValue(0).toFixed(2)} Z`}
            fill={`url(#${gradientId}-early-fill)`}
            className="svg-fade"
          />

          {/* Late starter curve — drawn first */}
          <path
            d={latePath}
            fill="none"
            stroke={LATE_STROKE}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="svg-draw svg-draw-late"
          />

          {/* Early starter curve with subtle glow */}
          <path
            d={earlyPath}
            fill="none"
            stroke={EARLY_STROKE}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${gradientId}-glow)`}
            pathLength={1}
            className="svg-draw"
          />

          {/* Milestone markers */}
          {milestones.map((m, i) => {
            const cx = xForAge(m.age);
            const cyEarly = yForValue(m.early);
            const cyLate = yForValue(m.late);
            const showLate = m.late > 0;
            const dotDelay = `${1.0 + i * 0.2}s`;
            return (
              <g key={m.age}>
                {showLate && (
                  <circle
                    cx={cx}
                    cy={cyLate}
                    r="5"
                    fill={LATE_STROKE}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="svg-dot"
                    style={{ animationDelay: dotDelay }}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cyEarly}
                  r="5.5"
                  fill={EARLY_STROKE}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="svg-dot"
                  style={{ animationDelay: dotDelay }}
                />
                <text
                  x={cx}
                  y={Math.max(16, cyEarly - 12)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  className="fill-emerald-600 font-mono dark:fill-emerald-400"
                >
                  {formatCompactAUD(m.early)}
                </text>
                {showLate && (
                  <text
                    x={cx}
                    y={cyLate + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    className="fill-sky-600 font-mono dark:fill-sky-400"
                  >
                    {formatCompactAUD(m.late)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Animated Rocket Marker at the Early finish line */}
          <g
            className="svg-fade"
            style={{ animationDelay: '1.8s', animationDuration: '0.5s' }}
            transform={`translate(${xForAge(END_AGE) - 10}, ${yForValue(earlyFinal) - 28})`}
          >
            <circle cx="10" cy="10" r="14" fill="#10b981" fillOpacity="0.2" />
            <Rocket className="h-5 w-5 text-emerald-500" />
            <Flame className="h-3 w-3 text-amber-500 -ml-1 -mt-1 animate-pulse" />
          </g>
        </svg>
      </div>

      <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
        Ages 15–60 · monthly compounding · balances in today&apos;s dollars (illustrative nominal returns before tax)
      </p>

      {/* Screen-reader accessible data table */}
      <table className="sr-only">
        <caption>
          Projected balances by age: starting at 15 vs starting at 25, to age {END_AGE}. {svgSummary}
        </caption>
        <thead>
          <tr>
            <th scope="col">Age</th>
            <th scope="col">{earlyFreqLabel} from 15</th>
            <th scope="col">{lateFreqLabel} from 25</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.age}>
              <th scope="row">{m.age}</th>
              <td>{formatAUD(m.early)}</td>
              <td>{formatAUD(m.late)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer CTA & Notice */}
      <div className="mt-4 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-sm">
          5.80% HISA from 15–18, then 8% broad-market index ETFs (ASX 200 / S&amp;P 500 historic baseline). Not personal financial advice.
        </p>
        <Link
          to="/investing-shares"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>Explore ETF Investing Guide</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

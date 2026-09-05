import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Rocket, TrendingUp } from 'lucide-react';
import { Link } from '@/lib/router';

/**
 * CompoundRocket — "$25/week from 15 vs $50/week from 25" animated SVG
 * growth chart to age 60.
 *
 * Math (computed inline, monthly compounding, end-of-month deposits):
 * - Early starter: $25/wk ($25 × 52 / 12 per month) from age 15 to 60.
 *   5.5% p.a. nominal (HISA) from 15–18, then 8% p.a. nominal (ETFs) 18–60.
 * - Late starter: $50/wk ($50 × 52 / 12 per month) from age 25 to 60 at
 *   8% p.a. nominal, monthly compounding.
 * - Monthly rate = annual / 12. No tax, fees or inflation. Illustrative only.
 *
 * Motion: two `motion.path` strokes animate `pathLength` 0 → 1 on mount,
 * disabled when the user prefers reduced motion. Milestone dots fade/scale
 * in after the draw (also skipped under reduced motion).
 *
 * Accessibility: the SVG is `role="img"` with a computed `aria-label`
 * summary; the milestone figures live in an `sr-only` data table so screen
 * readers get exact values. Hand-rolled SVG (no recharts).
 */

const EARLY_WEEKLY = 25;
const LATE_WEEKLY = 50;
const START_AGE = 15;
const HISA_END_AGE = 18;
const LATE_START_AGE = 25;
const END_AGE = 60;
const HISA_ANNUAL = 0.055;
const ETF_ANNUAL = 0.08;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

const MILESTONE_AGES: readonly number[] = [18, 25, 40, 60];

const VIEW_W = 640;
const VIEW_H = 360;
const PAD_L = 58;
const PAD_R = 14;
const PAD_T = 18;
const PAD_B = 34;

const EARLY_STROKE = '#10b981';
const LATE_STROKE = '#3b82f6';

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

/** Full AUD with commas, e.g. 69798 → "$69,798". */
function formatAUD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-AU')}`;
}

/** Compact AUD for chart labels, e.g. 19537 → "$20k", 566806 → "$567k". */
function formatCompactAUD(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${Math.round(value / 1000)}k`;
  if (abs >= 1_000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

/** Snap a raw tick step to a 1 / 2 / 2.5 / 5 / 10 × magnitude nice number. */
function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const n = raw / magnitude;
  if (n <= 1) return 1 * magnitude;
  if (n <= 2) return 2 * magnitude;
  if (n <= 2.5) return 2.5 * magnitude;
  if (n <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function CompoundRocket(): React.JSX.Element {
  const reducedMotion = useReducedMotion() ?? false;
  const gradientId = useId();

  const monthlyEarly = (EARLY_WEEKLY * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
  const monthlyLate = (LATE_WEEKLY * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;

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

  const earlyFinal = series[series.length - 1]!.early;
  const lateFinal = series[series.length - 1]!.late;
  // Exact head-to-head delta at 60 — rendered in the verdict headline.
  const delta = earlyFinal - lateFinal;

  // Exact lifetime deposits — rendered as "depositing $X less".
  const earlyContrib =
    EARLY_WEEKLY * WEEKS_PER_YEAR * (END_AGE - START_AGE);
  const lateContrib =
    LATE_WEEKLY * WEEKS_PER_YEAR * (END_AGE - LATE_START_AGE);
  const contribLess = lateContrib - earlyContrib;

  const innerW = VIEW_W - PAD_L - PAD_R;
  const innerH = VIEW_H - PAD_T - PAD_B;
  const yMax = Math.max(earlyFinal, lateFinal) * 1.06;

  const xForAge = (age: number): number =>
    PAD_L + ((age - START_AGE) / (END_AGE - START_AGE)) * innerW;
  const yForValue = (value: number): number =>
    PAD_T + innerH * (1 - value / yMax);

  const earlyPath = useMemo<string>(
    () =>
      series
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${xForAge(p.age).toFixed(2)} ${yForValue(p.early).toFixed(2)}`,
        )
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, yMax],
  );

  const latePath = useMemo<string>(
    () =>
      series
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${xForAge(p.age).toFixed(2)} ${yForValue(p.late).toFixed(2)}`,
        )
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, yMax],
  );

  const yTicks = useMemo<number[]>(() => {
    const step = niceStep(yMax / 4);
    return [0, step, step * 2, step * 3, step * 4].filter((t) => t <= yMax * 1.001);
  }, [yMax]);

  const xTicks: readonly number[] = [START_AGE, ...MILESTONE_AGES];

  const svgSummary =
    `Growth to age ${END_AGE}: starting $${EARLY_WEEKLY} a week at 15 reaches ` +
    `${formatAUD(earlyFinal)}; starting $${LATE_WEEKLY} a week at 25 reaches ` +
    `${formatAUD(lateFinal)}. Starting at 15 wins by ${formatAUD(delta)} ` +
    `despite depositing ${formatAUD(contribLess)} less.`;

  const drawTransitionEarly = reducedMotion
    ? { duration: 0 }
    : { duration: 1.8, ease: 'easeOut' as const };
  const drawTransitionLate = reducedMotion
    ? { duration: 0 }
    : { duration: 1.8, delay: 0.35, ease: 'easeOut' as const };

  return (
    <section
      aria-labelledby="compound-rocket-heading"
      className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
        >
          <Rocket className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="compound-rocket-heading"
            className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
          >
            ${EARLY_WEEKLY}/week from 15 vs ${LATE_WEEKLY}/week from 25
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Same finish line (age {END_AGE}), different start. Early money
            rides a 5.5% HISA from 15–18, then 8% ETFs — late money starts at
            25 in 8% ETFs.
          </p>
        </div>
      </div>

      {/* Verdict — exact delta computed inline above, never hardcoded. */}
      <p
        aria-live="polite"
        className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm leading-snug text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      >
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-extrabold">
            Start at 15 wins by {formatAUD(delta)} at {END_AGE}
          </strong>{' '}
          despite depositing {formatAUD(contribLess)} less (
          {formatAUD(earlyContrib)} vs {formatAUD(lateContrib)}).
        </span>
      </p>

      {/* Legend */}
      <ul
        aria-label="Chart legend"
        className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold"
      >
        <li className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span
            aria-hidden="true"
            className="inline-block h-1 w-6 rounded-full"
            style={{ backgroundColor: EARLY_STROKE }}
          />
            ${EARLY_WEEKLY}/wk from 15 → {formatCompactAUD(earlyFinal)}
        </li>
        <li className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span
            aria-hidden="true"
            className="inline-block h-1 w-6 rounded-full"
            style={{ backgroundColor: LATE_STROKE }}
          />
            ${LATE_WEEKLY}/wk from 25 → {formatCompactAUD(lateFinal)}
        </li>
      </ul>

      {/* Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={svgSummary}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`${gradientId}-early-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EARLY_STROKE} stopOpacity="0.22" />
              <stop offset="100%" stopColor={EARLY_STROKE} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines + y labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_L}
                y1={yForValue(tick)}
                x2={VIEW_W - PAD_R}
                y2={yForValue(tick)}
                strokeWidth="1"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <text
                x={PAD_L - 6}
                y={yForValue(tick) + 4}
                textAnchor="end"
                fontSize="11"
                className="fill-slate-500 font-mono dark:fill-slate-400"
              >
                {formatCompactAUD(tick)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {xTicks.map((age) => (
            <text
              key={age}
              x={xForAge(age)}
              y={VIEW_H - 10}
              textAnchor="middle"
              fontSize="11"
              className="fill-slate-500 font-mono dark:fill-slate-400"
            >
              {age}
            </text>
          ))}

          {/* Area fill under the early-starter curve */}
          <motion.path
            d={`${earlyPath} L ${xForAge(END_AGE).toFixed(2)} ${yForValue(0).toFixed(2)} L ${xForAge(START_AGE).toFixed(2)} ${yForValue(0).toFixed(2)} Z`}
            fill={`url(#${gradientId}-early-fill)`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 1.4 }}
          />

          {/* Late starter — drawn first so the winner sits on top */}
          <motion.path
            d={latePath}
            fill="none"
            stroke={LATE_STROKE}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={drawTransitionLate}
          />
          {/* Early starter */}
          <motion.path
            d={earlyPath}
            fill="none"
            stroke={EARLY_STROKE}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={drawTransitionEarly}
          />

          {/* Milestone dots + values */}
          {milestones.map((m, i) => {
            const cx = xForAge(m.age);
            const cyEarly = yForValue(m.early);
            const cyLate = yForValue(m.late);
            const showLate = m.late > 0;
            const dotDelay = reducedMotion ? 0 : 1.2 + i * 0.25;
            return (
              <g key={m.age}>
                {showLate && (
                  <motion.circle
                    cx={cx}
                    cy={cyLate}
                    r="5"
                    fill={LATE_STROKE}
                    stroke="#ffffff"
                    strokeWidth="2"
                    initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={
                      reducedMotion ? { duration: 0 } : { duration: 0.3, delay: dotDelay }
                    }
                    style={{ transformOrigin: `${cx}px ${cyLate}px` }}
                  />
                )}
                <motion.circle
                  cx={cx}
                  cy={cyEarly}
                  r="5"
                  fill={EARLY_STROKE}
                  stroke="#ffffff"
                  strokeWidth="2"
                  initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={
                    reducedMotion ? { duration: 0 } : { duration: 0.3, delay: dotDelay }
                  }
                  style={{ transformOrigin: `${cx}px ${cyEarly}px` }}
                />
                <text
                  x={cx}
                  y={Math.max(12, cyEarly - 10)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  className="fill-emerald-700 font-mono dark:fill-emerald-300"
                >
                  {formatCompactAUD(m.early)}
                </text>
                {showLate && (
                  <text
                    x={cx}
                    y={cyLate + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    className="fill-blue-700 font-mono dark:fill-blue-300"
                  >
                    {formatCompactAUD(m.late)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-1 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
        Age → · monthly compounding · balances in today&apos;s dollars (no inflation adjustment)
      </p>

      {/* Screen-reader data table — exact milestone figures */}
      <table className="sr-only">
        <caption>
          Projected balances by age: ${EARLY_WEEKLY} a week from 15 versus $
          {LATE_WEEKLY} a week from 25, to age {END_AGE}. {svgSummary}
        </caption>
        <thead>
          <tr>
            <th scope="col">Age</th>
            <th scope="col">${EARLY_WEEKLY} per week from 15</th>
            <th scope="col">${LATE_WEEKLY} per week from 25</th>
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

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Illustrative only — 5.5% HISA 15–18, then 8% ETFs; monthly
          compounding, before tax/fees. Not financial advice.
        </p>
        <Link
          to="/investing-shares"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:bg-violet-500 dark:text-slate-950 dark:hover:bg-violet-400"
        >
          See how ETFs work
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

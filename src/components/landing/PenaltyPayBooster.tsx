import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Coins } from 'lucide-react';
import { JUNIOR_AWARD_RATES } from '@/data/teen-finance-data';
import { Link } from '@/lib/router';

/**
 * Shared 2026–27 adult Level 1 base both awards use ($27.81/hr).
 * All casual rates below are derived inline as `ADULT_BASE × multiplier`
 * (penalty multipliers are loading-inclusive, e.g. ×1.25 base casual,
 * ×1.50 Saturday, ×1.75 Retail Sunday, ×2.50 public holiday).
 */
const ADULT_BASE = JUNIOR_AWARD_RATES.retail.adultBaseRate;

/** 16yo junior percentage under the Retail award (50%). */
const RETAIL_16_PCT = JUNIOR_AWARD_RATES.retail.rates[1].pct;

type PenaltyDayId = 'weekday' | 'saturday' | 'sunday' | 'public-holiday';

interface PenaltyDay {
  id: PenaltyDayId;
  label: string;
  retailMult: number;
  fastFoodMult: number;
}

const PENALTY_DAYS: PenaltyDay[] = [
  { id: 'weekday', label: 'Weekday base', retailMult: 1.25, fastFoodMult: 1.25 },
  { id: 'saturday', label: 'Saturday', retailMult: 1.5, fastFoodMult: 1.5 },
  { id: 'sunday', label: 'Sunday', retailMult: 1.75, fastFoodMult: 1.5 },
  { id: 'public-holiday', label: 'Public holiday', retailMult: 2.5, fastFoodMult: 2.5 },
];

function aud2(n: number): string {
  return `$${n.toFixed(2)}`;
}

function asPct(mult: number): string {
  return `${Math.round(mult * 100)}%`;
}

/**
 * PenaltyPayBooster — Retail vs Fast Food casual penalty-rate comparison
 * with animated bars, plus a mini shift calculator for a 16yo Retail
 * casual ($17.39/hr base).
 */
export function PenaltyPayBooster() {
  const reducedMotion = useReducedMotion() ?? false;
  const [dayId, setDayId] = useState<PenaltyDayId>('saturday');
  const [hours, setHours] = useState<number>(5);

  const rows = useMemo(
    () =>
      PENALTY_DAYS.map((d) => ({
        ...d,
        retailRate: ADULT_BASE * d.retailMult,
        fastFoodRate: ADULT_BASE * d.fastFoodMult,
      })),
    [],
  );

  // Scale every bar against the public-holiday rate (the maximum).
  const scaleMax = ADULT_BASE * 2.5;

  // 16yo Retail casual base: junior base rounded to cents ($13.91), then
  // ×1.25 casual loading inline → $17.39/hr.
  const juniorBase16 = Math.round(ADULT_BASE * RETAIL_16_PCT * 100) / 100;
  const teenBase = juniorBase16 * 1.25;

  const activeDay = rows.find((d) => d.id === dayId) ?? rows[0];
  const shiftHourly = juniorBase16 * activeDay.retailMult;
  const shiftTotal = shiftHourly * hours;

  // Retail Sunday premium over Fast Food Level 1 Sunday ($/hr).
  const sundayGap = ADULT_BASE * 1.75 - ADULT_BASE * 1.5;

  return (
    <section
      aria-labelledby="penalty-booster-heading"
      className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
        >
          <Coins className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="penalty-booster-heading"
            className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
          >
            Penalty Pay Booster: Retail vs Fast Food
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Adult casual rates from the {aud2(ADULT_BASE)}/hr Level&nbsp;1 base (
            {JUNIOR_AWARD_RATES.retail.code} vs {JUNIOR_AWARD_RATES.fast_food.code},
            2026–27) × penalty multiplier, loading inclusive.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sky-500" />
          Retail
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
          Fast Food L1
        </span>
      </div>

      <ol className="space-y-4">
        {rows.map((row, rowIndex) => {
          const retailPct = Math.min(100, (row.retailRate / scaleMax) * 100);
          const ffPct = Math.min(100, (row.fastFoodRate / scaleMax) * 100);
          const retailWins = row.retailRate > row.fastFoodRate;
          return (
            <li key={row.id} className="min-w-0">
              <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <p className="min-w-0 flex-1 basis-32 text-sm font-semibold text-slate-900 dark:text-white">
                  {row.label}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {asPct(row.retailMult)} / {asPct(row.fastFoodMult)}
                </span>
                {retailWins && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Retail +{aud2(sundayGap)}/hr
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="mb-0.5 flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Retail
                    </span>
                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
                      {aud2(row.retailRate)}/hr
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`Retail ${row.label}: ${aud2(row.retailRate)} per hour (${asPct(row.retailMult)})`}
                    className="h-6 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                  >
                    <motion.div
                      initial={reducedMotion ? false : { width: '0%' }}
                      animate={{ width: `${retailPct}%` }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.8,
                        delay: reducedMotion ? 0 : rowIndex * 0.1,
                        ease: 'easeOut',
                      }}
                      className="h-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-0.5 flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Fast Food L1
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                      {aud2(row.fastFoodRate)}/hr
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`Fast Food Level 1 ${row.label}: ${aud2(row.fastFoodRate)} per hour (${asPct(row.fastFoodMult)})`}
                    className="h-6 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                  >
                    <motion.div
                      initial={reducedMotion ? false : { width: '0%' }}
                      animate={{ width: `${ffPct}%` }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.8,
                        delay: reducedMotion ? 0 : rowIndex * 0.1 + 0.08,
                        ease: 'easeOut',
                      }}
                      className="h-full rounded-lg bg-gradient-to-r from-amber-400 to-orange-500"
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
        <h3
          id="penalty-shift-calc-heading"
          className="text-sm font-bold text-slate-900 dark:text-white"
        >
          Mini shift calculator
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          One shift at the 16yo Retail casual base of {aud2(teenBase)}/hr
          (50% junior + 25% loading). Pick a day, slide the hours.
        </p>

        <div
          role="group"
          aria-label="Shift day"
          className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {rows.map((d) => {
            const isActive = d.id === dayId;
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setDayId(d.id)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isActive
                    ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300'
                }`}
              >
                {d.id === 'weekday'
                  ? 'Weekday'
                  : d.id === 'saturday'
                    ? 'Saturday'
                    : d.id === 'sunday'
                      ? 'Sunday'
                      : 'Public hol.'}
                <span className="mt-0.5 block font-mono text-[10px] font-normal opacity-80">
                  {asPct(d.retailMult)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label
            htmlFor="penalty-shift-hours"
            className="flex items-baseline justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <span>Shift length</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {hours} hrs
            </span>
          </label>
          <input
            id="penalty-shift-hours"
            type="range"
            min={3}
            max={8}
            step={0.5}
            value={hours}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setHours(Number(e.target.value))
            }
            aria-describedby="penalty-shift-result"
            className="mt-2 w-full accent-sky-600 dark:accent-sky-400"
          />
          <div className="flex justify-between font-mono text-[10px] text-slate-400 dark:text-slate-500">
            <span>3h min</span>
            <span>8h max</span>
          </div>
        </div>

        <p
          id="penalty-shift-result"
          aria-live="polite"
          className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          {aud2(shiftHourly)}/hr × {hours} hrs ={' '}
          <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
            {aud2(shiftTotal)}
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Sunday is the big split: Retail 175% ({aud2(ADULT_BASE * 1.75)}/hr) vs
          Fast Food L1 150% ({aud2(ADULT_BASE * 1.5)}/hr). Confirm your award on
          the Fair Work calculator.
        </p>
        <Link
          to="/careers-employment?tab=rights"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:bg-violet-500 dark:text-slate-950 dark:hover:bg-violet-400"
        >
          Know your work rights
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

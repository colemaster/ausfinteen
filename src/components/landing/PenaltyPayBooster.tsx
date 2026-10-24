import { useMemo, useState } from 'react';
import { ArrowRight, Coins, Sparkles } from 'lucide-react';
import { JUNIOR_AWARD_RATES } from '@/data/teen-finance-data';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { SliderControl } from '@/components/ui/SliderControl';
import { Link } from '@/lib/router';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

/**
 * 2026–27 adult Level 1 base both awards use ($27.81/hr).
 * Retail vs Fast Food casual rates are derived as `ADULT_BASE × multiplier`.
 */
const ADULT_BASE = JUNIOR_AWARD_RATES.retail.adultBaseRate;

/** 16yo junior rate under the Retail award (50%). */
const RETAIL_16_PCT = JUNIOR_AWARD_RATES.retail.rates[1].pct;

type PenaltyDayId = 'weekday' | 'saturday' | 'sunday' | 'public-holiday';

interface PenaltyDay {
  id: PenaltyDayId;
  label: string;
  retailMult: number;
  fastFoodMult: number;
}

const PENALTY_DAYS: readonly PenaltyDay[] = [
  { id: 'weekday', label: 'Weekday Casual', retailMult: 1.25, fastFoodMult: 1.25 },
  { id: 'saturday', label: 'Saturday Penalty', retailMult: 1.5, fastFoodMult: 1.5 },
  { id: 'sunday', label: 'Sunday Penalty', retailMult: 1.75, fastFoodMult: 1.5 },
  { id: 'public-holiday', label: 'Public Holiday', retailMult: 2.5, fastFoodMult: 2.5 },
];

function aud2(n: number): string {
  return `$${n.toFixed(2)}`;
}

function asPct(mult: number): string {
  return `${Math.round(mult * 100)}%`;
}

export function PenaltyPayBooster() {
  const [dayId, setDayId] = useState<PenaltyDayId>('sunday');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(6);
  const [calcMode, setCalcMode] = useState<'shift' | 'weekly'>('weekly');

  const rows = useMemo(
    () =>
      PENALTY_DAYS.map((d) => ({
        ...d,
        retailRate: ADULT_BASE * d.retailMult,
        fastFoodRate: ADULT_BASE * d.fastFoodMult,
      })),
    [],
  );

  const scaleMax = ADULT_BASE * 2.5;

  // 16yo Retail casual calculations
  const juniorBase16 = Math.round(ADULT_BASE * RETAIL_16_PCT * 100) / 100;
  const activeDay = rows.find((d) => d.id === dayId) ?? rows[0];
  const hourlyRate16 = juniorBase16 * activeDay.retailMult;
  const weekdayRate16 = juniorBase16 * 1.25;

  // Periodic earnings
  const sessionTotal = hourlyRate16 * hoursPerWeek;
  const weekdayEquivalent = weekdayRate16 * hoursPerWeek;

  // Annual surplus from working this penalty shift vs plain weekday
  const annualPenaltySurplus =
    calcMode === 'weekly'
      ? Math.max(0, (sessionTotal - weekdayEquivalent) * 50)
      : Math.max(0, (sessionTotal - weekdayEquivalent) * 50);

  // Sunday retail premium over fast food
  const sundayHourlyGap = ADULT_BASE * 1.75 - ADULT_BASE * 1.5;

  return (
    <section
      aria-labelledby="penalty-booster-heading"
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-5 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-violet-500/20 dark:shadow-[0_0_50px_-15px_rgba(139,92,246,0.12)]"
    >
      {/* Decorative cyber ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15"
      />

      {/* Header */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 ring-1 ring-violet-500/30 shadow-inner dark:from-violet-500/30 dark:to-purple-500/10 dark:text-violet-400"
          >
            <Coins className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3 w-3" />
                Fair Work Commission 2026-27
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Base Level 1: {aud2(ADULT_BASE)}/hr
              </span>
            </div>
            <h2
              id="penalty-booster-heading"
              className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
            >
              Penalty Pay Booster: Retail vs Fast Food
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              General Retail (MA000004) pays up to 175% on Sundays vs 150% in Fast Food (MA000003). See how much more you bank.
            </p>
          </div>
        </div>
      </div>

      {/* Legend & Award Pills */}
      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-700 dark:text-sky-300">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sky-500" />
            General Retail (MA000004)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
            Fast Food L1 (MA000003)
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Loading-inclusive rates
        </span>
      </div>

      {/* Comparative Animated Bars */}
      <ol className="space-y-4">
        {rows.map((row, rowIndex) => {
          const retailPct = Math.min(100, (row.retailRate / scaleMax) * 100);
          const ffPct = Math.min(100, (row.fastFoodRate / scaleMax) * 100);
          const retailWins = row.retailRate > row.fastFoodRate;

          return (
            <li
              key={row.id}
              className={cn(
                'min-w-0 rounded-2xl border p-3.5 transition-all sm:p-4',
                retailWins
                  ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-card to-card shadow-sm dark:border-emerald-500/30'
                  : 'border-border/80 bg-card/60 hover:bg-card/80',
              )}
            >
              <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {row.label}
                  </h3>
                  {retailWins && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Retail +{aud2(sundayHourlyGap)}/hr Extra
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  Retail {asPct(row.retailMult)} · Fast Food {asPct(row.fastFoodMult)}
                </span>
              </div>

              {/* Stacked comparison meters */}
              <div className="space-y-2">
                {/* Retail meter */}
                <div>
                  <div className="mb-1 flex items-baseline justify-between text-[11px]">
                    <span className="font-medium text-sky-700 dark:text-sky-300">
                      Retail Casual
                    </span>
                    <span className="font-mono font-extrabold text-sky-700 dark:text-sky-300">
                      {aud2(row.retailRate)}/hr
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`Retail ${row.label}: ${aud2(row.retailRate)} per hour`}
                    className="h-6 w-full overflow-hidden rounded-lg bg-muted/60"
                  >
                    <div
                      style={{ width: `${retailPct}%`, animationDelay: `${rowIndex * 0.1}s` }}
                      className="bar-fill h-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 shadow-sm"
                    />
                  </div>
                </div>

                {/* Fast Food meter */}
                <div>
                  <div className="mb-1 flex items-baseline justify-between text-[11px]">
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      Fast Food Level 1
                    </span>
                    <span className="font-mono font-extrabold text-amber-700 dark:text-amber-300">
                      {aud2(row.fastFoodRate)}/hr
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`Fast Food Level 1 ${row.label}: ${aud2(row.fastFoodRate)} per hour`}
                    className="h-6 w-full overflow-hidden rounded-lg bg-muted/60"
                  >
                    <div
                      style={{ width: `${ffPct}%`, animationDelay: `${rowIndex * 0.1 + 0.05}s` }}
                      className="bar-fill h-full rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Interactive Shift & Weekly Pay Calculator */}
      <div className="mt-6 rounded-2xl border border-border/80 bg-muted/40 p-4 sm:p-5 shadow-inner">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              Interactive 16yo Retail Calculator
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on the 16yo junior casual rate ({aud2(juniorBase16)} × loading = {aud2(weekdayRate16)}/hr base).
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-card p-1 border border-border/60">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setCalcMode('shift');
              }}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
                calcMode === 'shift'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Per Shift
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setCalcMode('weekly');
              }}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
                calcMode === 'weekly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Weekly Schedule
            </button>
          </div>
        </div>

        {/* Day selection buttons */}
        <div
          role="group"
          aria-label="Shift day selector"
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {rows.map((d) => {
            const isActive = d.id === dayId;
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  sound.playClick();
                  setDayId(d.id);
                }}
                className={cn(
                  'rounded-xl border p-2.5 text-xs font-bold transition-all',
                  isActive
                    ? 'border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/20 dark:bg-violet-500 dark:text-slate-950'
                    : 'border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                <span>{d.label.split(' ')[0]}</span>
                <span className="block font-mono text-[10px] opacity-80 font-normal">
                  {asPct(d.retailMult)} (16yo: {aud2(juniorBase16 * d.retailMult)}/hr)
                </span>
              </button>
            );
          })}
        </div>

        {/* Hours Slider */}
        <div className="mt-4">
          <SliderControl
            label={calcMode === 'shift' ? 'Shift Duration' : 'Hours Rostered per Week'}
            value={hoursPerWeek}
            onChange={setHoursPerWeek}
            min={calcMode === 'shift' ? 3 : 4}
            max={calcMode === 'shift' ? 10 : 25}
            step={0.5}
            suffix=" hrs"
          />
        </div>

        {/* Output & Annual Surplus Callout */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card/80 p-3.5 backdrop-blur-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {calcMode === 'shift' ? 'Shift Paycheck' : 'Weekly Pay'} ({aud2(hourlyRate16)}/hr)
            </span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-foreground">
              <AnimatedNumber value={sessionTotal} format="currency" />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {hoursPerWeek} hours on {activeDay.label}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-950 dark:text-emerald-100 backdrop-blur-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Annual Penalty Surplus
            </span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +<AnimatedNumber value={annualPenaltySurplus} format="currency" /> / yr
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Bonus banked over 50 working weeks vs standard weekday shifts!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-sm">
          Junior Award rates per Fair Work Ombudsman (MA000004 &amp; MA000003). 3-hour minimum casual shift rule applies.
        </p>
        <Link
          to="/careers-employment?tab=rights"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:from-violet-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span>Fair Work Rights &amp; Payslips</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

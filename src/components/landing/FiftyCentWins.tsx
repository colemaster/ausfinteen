import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bus, Check } from 'lucide-react';
import { SliderControl } from '@/components/ui/SliderControl';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Link } from '@/lib/router';

/** Flat TransLink fare per trip (AUD). */
const FLAT_FARE = 0.5;

/** Max weekly saving used to scale the bus-progress visual: (6 − 0.5) × 20. */
const MAX_WEEKLY_SAVING = (6 - FLAT_FARE) * 20;

const aud2 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * FiftyCentWins — interactive TransLink 50c fare saver.
 *
 * Weekly saving = (oldFare − 0.50) × tripsPerWeek; yearly = weekly × 52.
 * Bus marker travels across the route line proportional to weekly saving
 * relative to the maximum possible saving; static when reduced motion is on.
 */
export function FiftyCentWins() {
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [oldFare, setOldFare] = useState<number>(4);
  const reducedMotion = useReducedMotion() ?? false;

  const calc = useMemo(() => {
    const perTripSaving = Math.max(0, oldFare - FLAT_FARE);
    const weeklySaving = perTripSaving * tripsPerWeek;
    const yearlySaving = weeklySaving * 52;
    const weeklyCostNow = FLAT_FARE * tripsPerWeek;
    return { perTripSaving, weeklySaving, yearlySaving, weeklyCostNow };
  }, [tripsPerWeek, oldFare]);

  const progressPct = Math.min(
    100,
    Math.max(0, (calc.weeklySaving / MAX_WEEKLY_SAVING) * 100),
  );

  return (
    <section
      aria-labelledby="fifty-cent-wins-heading"
      className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
        >
          <Bus className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="fifty-cent-wins-heading"
            className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
          >
            50¢ TransLink Wins
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Queensland&apos;s flat 50c fare vs what you used to pay per trip.
            Drag the sliders to see your saving.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SliderControl
          label="Trips per week"
          value={tripsPerWeek}
          onChange={setTripsPerWeek}
          min={2}
          max={20}
          step={1}
          suffix=" trips/wk"
        />
        <SliderControl
          label="Old fare per trip"
          value={oldFare}
          onChange={setOldFare}
          min={2}
          max={6}
          step={0.1}
          prefix="$"
          suffix=" /trip"
          decimals={2}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            You save / week
          </dt>
          <dd className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-800 sm:text-2xl dark:text-emerald-200">
            <AnimatedNumber
              value={calc.weeklySaving}
              format="currency"
              className="font-mono font-bold tabular-nums"
            />
          </dd>
          <dd className="mt-0.5 truncate text-[11px] text-emerald-700/80 dark:text-emerald-300/70">
            {aud2.format(calc.perTripSaving)}/trip × {tripsPerWeek} trips
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-950/40">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
            You save / year
          </dt>
          <dd className="mt-1 font-mono text-xl font-bold tabular-nums text-sky-800 sm:text-2xl dark:text-sky-200">
            <AnimatedNumber
              value={calc.yearlySaving}
              format="currency"
              className="font-mono font-bold tabular-nums"
            />
          </dd>
          <dd className="mt-0.5 truncate text-[11px] text-sky-700/80 dark:text-sky-300/70">
            Weekly × 52 · now {aud2.format(calc.weeklyCostNow)}/wk
          </dd>
        </div>
      </dl>

      <div
        role="img"
        aria-label={`Bus progress: saving ${Math.round(progressPct)} percent of the maximum weekly saving`}
        className="mt-5"
      >
        <div className="relative h-12 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          <div
            aria-hidden="true"
            className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300 dark:border-slate-600"
          />
          {[0, 50, 100].map((stop) => (
            <span
              key={stop}
              aria-hidden="true"
              style={{ left: `calc(${stop}% + ${(0.5 - stop / 100) * 24}px)` }}
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 dark:bg-slate-500"
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full"
          >
            <motion.div
              initial={reducedMotion ? false : { width: '0%' }}
              animate={{ width: `${progressPct}%` }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                ease: 'easeOut',
              }}
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
            />
          </div>
          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? false : { left: '12px' }}
            animate={{ left: `calc(${(progressPct / 100) * 100}% + ${(0.5 - progressPct / 100) * 40}px)` }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: 'easeOut',
            }}
            className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sky-600 text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
          >
            <Bus className="h-4 w-4" />
          </motion.div>
        </div>
        <p className="mt-1.5 text-center font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
          {aud2.format(calc.weeklySaving)}/wk banked — every trip costs just 50c
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {[
          'Permanent flat 50c — all modes (bus, train, tram, ferry) & all zones',
          'No cap or signup needed — fare is just 50c, every trip',
          'Tap on/off with contactless, go card, or TransLink app',
        ].map((fact) => (
          <li key={fact} className="flex items-start gap-2 text-xs leading-relaxed">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="min-w-0 text-slate-700 dark:text-slate-300">{fact}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Illustrative saving: (old fare − $0.50) × trips, × 52 for yearly.
        </p>
        <Link
          to="/brisbane-qld"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
          Brisbane money guide
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

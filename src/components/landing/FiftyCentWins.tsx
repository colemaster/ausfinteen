import { useMemo, useState } from 'react';
import { ArrowRight, Bus, Check, Sparkles } from 'lucide-react';
import { SliderControl } from '@/components/ui/SliderControl';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Link } from '@/lib/router';
import { sound } from '@/lib/sound-synthesizer';

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

export function FiftyCentWins() {
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [oldFare, setOldFare] = useState<number>(4);

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
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-5 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-sky-500/20 dark:shadow-[0_0_50px_-15px_rgba(14,165,233,0.12)]"
    >
      {/* Decorative cyber ambient blooms */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
      />

      {/* Header */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-600 ring-1 ring-sky-500/30 shadow-inner dark:from-sky-500/30 dark:to-blue-500/10 dark:text-sky-400"
          >
            <Bus className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                <Sparkles className="h-3 w-3" />
                Permanent QLD Policy
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                All Zones &amp; Modes (Bus, Train, Ferry, Tram)
              </span>
            </div>
            <h2
              id="fifty-cent-wins-heading"
              className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
            >
              50¢ TransLink Wins: Queensland Transit Savings
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Queensland’s flat 50c fare vs previous zone fares. Drag the sliders to calculate your annual savings.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="relative mb-5 rounded-2xl border border-border/80 bg-muted/40 p-4 shadow-inner">
        <div className="flex flex-col gap-4">
          <SliderControl
            label="Trips per week"
            value={tripsPerWeek}
            onChange={(v) => {
              sound.playTick?.();
              setTripsPerWeek(v);
            }}
            min={2}
            max={20}
            step={1}
            suffix=" trips/wk"
          />
          <SliderControl
            label="Previous average fare per trip"
            value={oldFare}
            onChange={(v) => {
              sound.playTick?.();
              setOldFare(v);
            }}
            min={2}
            max={6}
            step={0.1}
            prefix="$"
            suffix=" /trip"
            decimals={2}
          />
        </div>
      </div>

      {/* Savings Metric Cards */}
      <dl className="relative mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100 backdrop-blur-sm">
          <dt className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Weekly Money Banked
          </dt>
          <dd className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-3xl">
            <AnimatedNumber value={calc.weeklySaving} format="currency" />
          </dd>
          <dd className="mt-1 truncate text-xs text-muted-foreground">
            {aud2.format(calc.perTripSaving)} saved/trip × {tripsPerWeek} trips (now costs {aud2.format(calc.weeklyCostNow)}/wk)
          </dd>
        </div>

        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-950 dark:text-sky-100 backdrop-blur-sm">
          <dt className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Annual Cash Kept
          </dt>
          <dd className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-sky-700 dark:text-sky-300 sm:text-3xl">
            <AnimatedNumber value={calc.yearlySaving} format="currency" />
          </dd>
          <dd className="mt-1 truncate text-xs text-muted-foreground">
            52 weeks of travel savings ready to compound in your youth HISA!
          </dd>
        </div>
      </dl>

      {/* Cyber Transit Path Visualizer */}
      <div
        role="img"
        aria-label={`Bus progress: saving ${Math.round(progressPct)} percent of maximum`}
        className="relative mb-5 rounded-2xl border border-border/80 bg-muted/50 p-4 shadow-inner"
      >
        <div className="relative h-14 w-full overflow-hidden rounded-xl bg-card border border-border/60">
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-sky-500/30"
          />
          {[0, 25, 50, 75, 100].map((stop) => (
            <span
              key={stop}
              aria-hidden="true"
              style={{ left: `calc(${stop}% + ${(0.5 - stop / 100) * 28}px)` }}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-card bg-muted-foreground/60 shadow-xs"
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full"
          >
            <div
              style={{ width: `${progressPct}%` }}
              className="bar-fill h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-500 shadow-sm"
            />
          </div>
          <div
            aria-hidden="true"
            style={{ left: `calc(${(progressPct / 100) * 100}% + ${(0.5 - progressPct / 100) * 44}px)` }}
            className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 ring-2 ring-white/20 transition-[left] duration-(--motion-slower) ease-(--ease-out)"
          >
            <Bus className="h-4.5 w-4.5" />
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-xs font-semibold text-muted-foreground">
          {aud2.format(calc.weeklySaving)}/week banked · Every ride on public transit is just 50¢
        </p>
      </div>

      {/* Facts Strip */}
      <ul className="space-y-2">
        {[
          'Permanent flat 50c — all modes (bus, train, tram, ferry) across South East Queensland',
          'No special student concessions or paperwork required — universal 50c for all riders',
          'Tap on/off with contactless credit/debit card, phone wallet, go card, or TransLink app',
        ].map((fact) => (
          <li key={fact} className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-muted-foreground">{fact}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-sm">
          TransLink Queensland statutory fare policy. Verified 50c flat pricing across SEQ.
        </p>
        <Link
          to="/brisbane-qld"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:from-sky-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <span>Brisbane Youth Guide</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

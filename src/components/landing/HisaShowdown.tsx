import { useMemo, useState } from 'react';
import { ArrowRight, Crown, PiggyBank, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { SliderControl } from '@/components/ui/SliderControl';
import { Link } from '@/lib/router';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

const PRESET_BALANCES = [500, 1000, 2000, 5000] as const;
const BIG4_TRANSACTION_RATE = 0.0001; // 0.01% p.a. standard big-4 everyday transaction rate

export function HisaShowdown() {
  const [balance, setBalance] = useState<number>(2000);

  const topFive = useMemo(
    () =>
      [...TEEN_SAVINGS_ACCOUNTS]
        .sort((a, b) => b.maxRate - a.maxRate)
        .slice(0, 5),
    [],
  );

  const topAccount = topFive[0];
  const scaleMax = topAccount?.maxRate ?? 6.0;

  // Annual calculations
  const topInterest = (balance * (topAccount?.maxRate ?? 0)) / 100;
  const deadInterest = balance * BIG4_TRANSACTION_RATE;
  const annualSurplus = Math.max(0, topInterest - deadInterest);

  return (
    <section
      aria-labelledby="hisa-showdown-heading"
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-5 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-emerald-500/20 dark:shadow-[0_0_50px_-15px_rgba(16,185,129,0.12)]"
    >
      {/* Decorative cyber ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15"
      />

      {/* Header */}
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 ring-1 ring-emerald-500/30 shadow-inner dark:from-emerald-500/30 dark:to-teal-500/10 dark:text-emerald-400"
          >
            <PiggyBank className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Live Rate Tracker
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                APRA $250k FCS Guaranteed
              </span>
            </div>
            <h2
              id="hisa-showdown-heading"
              className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
            >
              Youth HISA Showdown: Top 5 High-Yield Accounts
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Bonus max rates vs base fallback rates for teen savers. Adjust your balance to test instant interest.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Balance Slider & Presets */}
      <div className="relative mb-5 rounded-2xl border border-border/80 bg-muted/40 p-4 shadow-inner">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Sample Savings:
            </span>
            {PRESET_BALANCES.map((p) => {
              const active = balance === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBalance(p);
                  }}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 dark:bg-emerald-500 dark:text-slate-950'
                      : 'border border-border/60 bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground',
                  )}
                >
                  ${p.toLocaleString('en-AU')}
                </button>
              );
            })}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Testing:</span>
            <span className="font-mono text-lg font-extrabold text-foreground">
              ${balance.toLocaleString('en-AU')}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <SliderControl
            label="Adjust your savings deposit"
            value={balance}
            onChange={setBalance}
            min={200}
            max={10000}
            step={100}
            prefix="$"
          />
        </div>
      </div>

      {/* Instant Annual Surplus Callout */}
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-4 text-emerald-950 dark:text-emerald-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs leading-relaxed sm:text-sm">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-extrabold sm:text-base text-foreground">
                Annual Interest Surplus:
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                +<AnimatedNumber value={annualSurplus} format="currency" /> / year
              </span>
            </div>
            <p className="mt-0.5 text-muted-foreground">
              By parking ${balance.toLocaleString('en-AU')} in {topAccount?.bank} at {topAccount?.maxRate.toFixed(2)}% rather than leaving it dormant in a 0.01% everyday card account!
            </p>
          </div>
        </div>
      </div>

      {/* Comparative Animated Bars */}
      <ol className="space-y-4">
        {topFive.map((acct, index) => {
          const isWinner = index === 0;
          const barPct = Math.min(100, (acct.maxRate / scaleMax) * 100);
          const basePct = Math.min(100, (acct.baseRate / scaleMax) * 100);
          const annualReturn = (balance * acct.maxRate) / 100;

          return (
            <li
              key={acct.bank}
              className={cn(
                'min-w-0 rounded-2xl border p-3.5 transition-all sm:p-4',
                isWinner
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-md shadow-amber-500/5 dark:border-amber-500/30'
                  : 'border-border/80 bg-card/60 hover:bg-card/80',
              )}
            >
              <div className="mb-2 flex min-w-0 items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  {isWinner ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                      <Crown className="h-4 w-4" />
                    </div>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted font-mono text-[11px] font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                  <h3 className="truncate text-sm font-bold text-foreground">
                    {acct.bank}
                  </h3>
                  {isWinner && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Top Pick
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                    Ages {acct.minAge}+
                  </span>
                  {acct.canOpenIndependentlyAt15 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      15yo Solo
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Visualizer */}
              <div
                role="img"
                aria-label={`${acct.bank}: max ${acct.maxRate.toFixed(2)}% p.a., base ${acct.baseRate.toFixed(2)}% p.a.`}
                className="relative h-8 w-full overflow-hidden rounded-xl bg-muted/70 p-0.5"
              >
                <div
                  style={{ width: `${barPct}%`, animationDelay: `${index * 0.1}s` }}
                  className={cn(
                    'bar-fill h-full rounded-lg shadow-sm',
                    isWinner
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500',
                  )}
                />
                {acct.baseRate > 0 && (
                  <span
                    title={`Base fallback rate ${acct.baseRate.toFixed(2)}% p.a.`}
                    aria-hidden="true"
                    style={{ left: `${basePct}%` }}
                    className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-foreground/60 shadow-sm"
                  />
                )}
                <span className="absolute inset-y-0 left-3 flex items-center font-mono text-xs font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {acct.maxRate.toFixed(2)}% p.a.
                </span>
                <span className="absolute inset-y-0 right-3 flex items-center font-mono text-xs font-extrabold text-foreground">
                  +<AnimatedNumber value={annualReturn} format="currency" /> / yr
                </span>
              </div>

              {/* Conditions footnote */}
              <div className="mt-2 flex items-baseline justify-between gap-3 text-[11px] leading-relaxed text-muted-foreground">
                <p className="flex-1 truncate">
                  {acct.conditions}
                  <span className="ml-1 opacity-75 font-mono">
                    (Base: {acct.baseRate.toFixed(2)}%)
                  </span>
                </p>
                <span className="shrink-0 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  $0 fees
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer CTA & Notice */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-sm">
          Accounts backed by the Australian Government Financial Claims Scheme ($250,000 per ADI). Bonus criteria must be maintained monthly.
        </p>
        <Link
          to="/interest-products"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>All 10+ Youth Accounts</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

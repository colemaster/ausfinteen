import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Crown, PiggyBank } from 'lucide-react';
import { TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';

/** Balance used for the illustrative yearly-interest figure rendered per bar. */
const EXAMPLE_BALANCE = 2000;

/**
 * HisaShowdown — top-5 youth high-interest savings accounts as animated
 * horizontal bars.
 *
 * Data: sorted desc by `maxRate` from `TEEN_SAVINGS_ACCOUNTS`, top 5 only.
 * Bar length = maxRate (bonus rate); tick marker = baseRate (fallback rate).
 * Yearly interest on $2,000 is computed inline per row (simple interest).
 */
export function HisaShowdown() {
  const reducedMotion = useReducedMotion() ?? false;

  const topFive = useMemo(
    () =>
      [...TEEN_SAVINGS_ACCOUNTS]
        .sort((a, b) => b.maxRate - a.maxRate)
        .slice(0, 5),
    [],
  );

  const scaleMax = topFive[0]?.maxRate ?? 1;

  return (
    <section
      aria-labelledby="hisa-showdown-heading"
      className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <PiggyBank className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="hisa-showdown-heading"
            className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
          >
            Youth HISA Showdown: Top 5 Rates
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Bonus (max) rate vs base rate for teen-friendly savings accounts.
            Figures show yearly interest on ${EXAMPLE_BALANCE.toLocaleString('en-AU')}.
          </p>
        </div>
      </div>

      <ol className="space-y-4">
        {topFive.map((acct, index) => {
          const isWinner = index === 0;
          const barPct = Math.min(100, (acct.maxRate / scaleMax) * 100);
          const basePct = Math.min(100, (acct.baseRate / scaleMax) * 100);
          return (
            <li key={acct.bank} className="min-w-0">
              <div className="mb-1 flex min-w-0 items-center gap-2">
                {isWinner ? (
                  <Crown
                    aria-label="Top rate"
                    className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-4 shrink-0 text-center font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500"
                  >
                    {index + 1}
                  </span>
                )}
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {acct.bank}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Ages {acct.minAge}+
                </span>
              </div>

              <div
                role="img"
                aria-label={`${acct.bank}: max ${acct.maxRate.toFixed(2)} percent per annum, base ${acct.baseRate.toFixed(2)} percent per annum`}
                className="relative h-7 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <motion.div
                  initial={reducedMotion ? false : { width: '0%' }}
                  animate={{ width: `${barPct}%` }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.9,
                    delay: reducedMotion ? 0 : index * 0.12,
                    ease: 'easeOut',
                  }}
                  className={`h-full rounded-lg ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600'
                  }`}
                />
                {acct.baseRate > 0 && (
                  <span
                    title={`Base rate ${acct.baseRate.toFixed(2)}% p.a.`}
                    aria-hidden="true"
                    style={{ left: `${basePct}%` }}
                    className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-slate-900/70 dark:bg-white/80"
                  />
                )}
                <span className="absolute inset-y-0 left-2 flex items-center font-mono text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
                  {acct.maxRate.toFixed(2)}% p.a.
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="min-w-0 flex-1 basis-48 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                  {acct.conditions}{' '}
                  <span className="whitespace-nowrap font-mono text-slate-400 dark:text-slate-500">
                    (base {acct.baseRate.toFixed(2)}%)
                  </span>
                </p>
                <p className="shrink-0 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {/* Yearly interest on $2,000, computed inline (simple interest). */}
                  ${((EXAMPLE_BALANCE * acct.maxRate) / 100).toFixed(2)}/yr
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Bonus rates need monthly conditions met — otherwise the base rate
          applies. Rates change; confirm with the bank.
        </p>
        <a
          href="/teen-budgeting"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          Build my teen budget
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

import { motion, useReducedMotion } from 'motion/react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { AGE_PRESETS, TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import {
  HELP_REPAYMENT_THRESHOLDS_2026_27,
  WEEKS_PER_YEAR,
} from '@/data/constants';
import { fadeInUp, fastStagger } from '@/lib/animations';

/**
 * LiveMoneyCounters — row of 4 animated teen-money figures for the landing page.
 *
 * All figures are computed inline from data imports (no hardcoded totals):
 * 1. 15yo weekly take-home = AGE_PRESETS[15].hourlyRate × hoursPerWeek
 *    (8hrs @ $13.90/hr Fast Food casual; below the tax-free threshold so
 *    take-home equals gross).
 * 2. $500 Mojo buffer after 1yr = savingsGoalTarget × (1 + BOQ maxRate / 100).
 * 3. Yearly TransLink saving = ($4 avg fare − $0.50 flat) × 10 trips/wk × 52 wks.
 * 4. HELP compulsory-repayment threshold = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max.
 *
 * Assumptions: 15yo claims the tax-free threshold and earns under $18,200/yr
 * (0% income tax); BOQ Future Saver bonus criteria auto-waived for 14–17yo;
 * TransLink $4 average fare is a comparison baseline, not a statutory figure.
 */
export function LiveMoneyCounters(): React.JSX.Element {
  const reduceMotion = useReducedMotion() ?? false;

  // (1) 15yo Fast Food casual weekly take-home — derived from the age preset.
  const teen15 = AGE_PRESETS[15];
  const weeklyTakeHome: number = teen15.hourlyRate * teen15.hoursPerWeek;

  // (2) $500 Mojo buffer growth at the BOQ youth rate — both from data.
  const boqAccount =
    TEEN_SAVINGS_ACCOUNTS.find((a) => a.bank.startsWith('BOQ')) ??
    TEEN_SAVINGS_ACCOUNTS[0];
  const mojoPrincipal: number = teen15.savingsGoalTarget;
  const mojoRateDecimal: number = boqAccount.maxRate / 100;
  const mojoBalance1yr: number = mojoPrincipal * (1 + mojoRateDecimal);
  const mojoInterest1yr: number = mojoPrincipal * mojoRateDecimal;

  // (3) Yearly TransLink 50c saving vs a $4 average fare, 10 trips/week.
  const TRANSLINK_FLAT_FARE = 0.5;
  const TRANSLINK_AVG_FARE = 4;
  const TRANSLINK_TRIPS_PER_WEEK = 10;
  const translinkYearlySavings: number =
    (TRANSLINK_AVG_FARE - TRANSLINK_FLAT_FARE) *
    TRANSLINK_TRIPS_PER_WEEK *
    WEEKS_PER_YEAR;

  // (4) HELP 2026-27 first repayment threshold — single source of truth.
  const helpThreshold: number = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max;

  const odoDurationMs = reduceMotion ? 0 : 900;
  const animatedDurationMs = reduceMotion ? 0 : 1200;

  const cardClass =
    'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ' +
    'dark:border-slate-800 dark:bg-slate-900';
  const labelClass =
    'block text-[10px] font-bold uppercase tracking-widest ' +
    'text-slate-500 dark:text-slate-400';
  const valueClass =
    'tabular-nums font-mono text-xl font-bold tracking-tight ' +
    'text-slate-900 sm:text-2xl dark:text-white';
  const captionClass = 'mt-1 block text-[11px] leading-snug text-slate-500 dark:text-slate-400';

  return (
    <motion.div
      variants={fastStagger}
      initial={reduceMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      role="list"
      aria-label="Live teen money figures"
    >
      {/* (1) 15yo weekly take-home */}
      <motion.div variants={fadeInUp} role="listitem" className={cardClass}>
        <span className={labelClass}>15yo weekly take-home</span>
        <OdometerCounter
          value={weeklyTakeHome}
          prefix="$"
          decimals={2}
          durationMs={odoDurationMs}
          className={valueClass}
        />
        <span className={captionClass}>
          {teen15.hoursPerWeek}hrs @ ${teen15.hourlyRate.toFixed(2)}/hr {teen15.jobTitle}
        </span>
      </motion.div>

      {/* (2) $500 Mojo buffer after 1 year at BOQ youth rate */}
      <motion.div variants={fadeInUp} role="listitem" className={cardClass}>
        <span className={labelClass}>Mojo buffer in 1yr</span>
        <OdometerCounter
          value={mojoBalance1yr}
          prefix="$"
          decimals={0}
          durationMs={odoDurationMs}
          className={valueClass}
        />
        <span className={captionClass}>
          ${mojoPrincipal} + ${mojoInterest1yr.toFixed(0)} interest @ {boqAccount.maxRate.toFixed(2)}%
          p.a. BOQ
        </span>
      </motion.div>

      {/* (3) Yearly TransLink 50c saving */}
      <motion.div variants={fadeInUp} role="listitem" className={cardClass}>
        <span className={labelClass}>TransLink saves /yr</span>
        <AnimatedNumber
          value={translinkYearlySavings}
          format="currency"
          duration={animatedDurationMs}
          className={valueClass}
        />
        <span className={captionClass}>
          50c vs ${TRANSLINK_AVG_FARE} fare × {TRANSLINK_TRIPS_PER_WEEK} trips/wk
        </span>
      </motion.div>

      {/* (4) HELP 2026-27 repayment threshold */}
      <motion.div variants={fadeInUp} role="listitem" className={cardClass}>
        <span className={labelClass}>HELP threshold 2026-27</span>
        <AnimatedNumber
          value={helpThreshold}
          format="currency"
          duration={animatedDurationMs}
          className={valueClass}
        />
        <span className={captionClass}>Repayments start above this income</span>
      </motion.div>
    </motion.div>
  );
}

/**
 * Teen Budget Engine — paycheck split frameworks (50/30/20, Barefoot buckets,
 * 4-bucket), custom splits that always total 100%, and paycheck period
 * conversions (weekly / fortnightly / monthly).
 */

import { PERIODS_PER_YEAR, type PaymentPeriod } from '@/components/ui/PaymentPeriodToggle';

export interface BucketSplit {
  needs: number;
  wants: number;
  savings: number;
}

export interface SplitAmounts {
  needs: number;
  wants: number;
  savings: number;
}

/**
 * Split a paycheck amount across needs / wants / savings percentages.
 * Percentages are normalised to 100% so the split always accounts for the
 * full paycheck (e.g. 50/30/15 becomes ~52.6/31.6/15.8).
 */
export function splitPaycheck(
  amount: number,
  needsPct: number,
  wantsPct: number,
  savingsPct: number
): SplitAmounts {
  const safeAmount = Math.max(amount, 0);
  const total = needsPct + wantsPct + savingsPct;
  if (total <= 0) return { needs: 0, wants: 0, savings: 0 };
  const scale = safeAmount / total;
  return {
    needs: needsPct * scale,
    wants: wantsPct * scale,
    savings: savingsPct * scale,
  };
}

export type BucketKey = keyof BucketSplit;

/**
 * Adjust one bucket of a percentage split while keeping the total at exactly
 * 100%: the change is redistributed proportionally across the other two
 * buckets. If the other buckets are both zero, the split is left unchanged.
 */
export function adjustSplitKeepingTotal(
  current: BucketSplit,
  changedKey: BucketKey,
  newPct: number
): BucketSplit {
  const clamped = Math.min(Math.max(newPct, 0), 100);
  const others = (Object.keys(current) as BucketKey[]).filter(k => k !== changedKey);
  const otherSum = others.reduce((s, k) => s + current[k], 0);

  if (otherSum <= 0) {
    return { ...current, [changedKey]: clamped };
  }

  const remaining = 100 - clamped;
  const next = { ...current, [changedKey]: clamped };
  others.forEach(k => {
    next[k] = (current[k] / otherSum) * remaining;
  });
  return next;
}

/**
 * Convert a paycheck amount between payment periods using the standard
 * Australian period lengths (52 weeks, 26 fortnights, 12 months).
 */
export function convertPaycheckPeriod(
  amount: number,
  from: PaymentPeriod,
  to: PaymentPeriod
): number {
  return (amount * PERIODS_PER_YEAR[from]) / PERIODS_PER_YEAR[to];
}
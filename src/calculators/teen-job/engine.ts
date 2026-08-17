/**
 * Teen Job Pay Engine — junior award rates, PAYG withholding, super eligibility
 * and penalty-rate breakdowns for Australian teen workers.
 *
 * Data sources: Fair Work Ombudsman junior award percentages (MA000003 Fast
 * Food, MA000004 Retail, MA000009 Hospitality, MA000012 Pharmacy, MA000094
 * Fitness) and ATO PAYG withholding rules, all read from '@/data'.
 */

import { JUNIOR_AWARD_RATES, PENALTY_RATES } from '@/data/teen-finance-data';
import { SUPER_RULES } from '@/data/super-rules';

export type AwardName = keyof typeof JUNIOR_AWARD_RATES;

export interface JuniorRateLookup {
  pct: number;
  label: string;
}

/**
 * Look up the junior award percentage for a worker's age under a given modern
 * award. Ages below the first band use the youngest band; ages 21+ use the
 * adult (100%) band.
 */
export function getJuniorRatePct(age: number, awardName: AwardName): JuniorRateLookup {
  const bands = JUNIOR_AWARD_RATES[awardName].rates;
  if (bands.length === 0) return { pct: 1, label: '100% (Adult Rate)' };
  const first = bands[0];
  const last = bands[bands.length - 1];
  if (!first || !last) return { pct: 1, label: '100% (Adult Rate)' };

  if (age < 16) return { pct: first.pct, label: first.label };
  if (age >= 21) return { pct: last.pct, label: last.label };

  const match = bands.find(b => /^(\d+) years?$/.test(b.age) && Number(b.age.match(/^(\d+)/)?.[1]) === age);
  if (match) return { pct: match.pct, label: match.label };

  // Fallback: highest band whose age is at or below the worker's age.
  for (const band of bands) {
    const num = band.age.match(/^(\d+) years?$/)?.[1];
    if (num && Number(num) <= age) return { pct: band.pct, label: band.label };
  }
  return { pct: first.pct, label: first.label };
}

export interface NetPayOptions {
  claimsTaxFreeThreshold?: boolean;
  weeklyAllowances?: number;
  penaltyMultiplier?: number;
}

export interface NetPayResult {
  awardName: AwardName;
  juniorPct: number;
  juniorLabel: string;
  effectiveHourlyRate: number;
  grossWeekly: number;
  taxWithheldWeekly: number;
  netWeekly: number;
  annualGross: number;
  superWeekly: number;
  isSuperEligible: boolean;
}

/**
 * Calculate a teen's weekly net pay applying the junior award percentage,
 * penalty multipliers, workplace allowances, PAYG withholding and the ATO
 * under-18 super eligibility rule (>30 hours/week for under 18s).
 *
 * Assumptions:
 * - PAYG withholding: $0 withheld when claiming the tax-free threshold and
 *   gross weekly pay is $350 or less; otherwise 16% is withheld on the excess
 *   over $350 (consistent with the site's teen calculators).
 * - Super guarantee paid at 12% (SUPER_RULES.sgRate) only when eligible.
 */
export function netPayWithAllowances(
  age: number,
  hourlyRate: number,
  weeklyHours: number,
  awardName: AwardName,
  options: NetPayOptions = {}
): NetPayResult {
  const {
    claimsTaxFreeThreshold = true,
    weeklyAllowances = 0,
    penaltyMultiplier = 1,
  } = options;

  const junior = getJuniorRatePct(age, awardName);
  const effectiveHourlyRate = hourlyRate * junior.pct * penaltyMultiplier;
  const grossWeekly = effectiveHourlyRate * weeklyHours + weeklyAllowances;
  const annualGross = grossWeekly * 52;

  let taxWithheldWeekly = 0;
  if (!claimsTaxFreeThreshold) {
    taxWithheldWeekly = grossWeekly * 0.16;
  } else if (grossWeekly > 350) {
    taxWithheldWeekly = (grossWeekly - 350) * 0.16;
  }
  const netWeekly = Math.max(0, grossWeekly - taxWithheldWeekly);

  // ATO rule: under 18s must work MORE than 30 hours in a week to receive SG.
  const isSuperEligible = age >= 18 || weeklyHours > SUPER_RULES.under18WeeklyHoursThreshold;
  const superWeekly = isSuperEligible ? grossWeekly * SUPER_RULES.sgRate : 0;

  return {
    awardName,
    juniorPct: junior.pct,
    juniorLabel: junior.label,
    effectiveHourlyRate,
    grossWeekly,
    taxWithheldWeekly,
    netWeekly,
    annualGross,
    superWeekly,
    isSuperEligible,
  };
}

export interface PenaltyRateRow {
  type: keyof typeof PENALTY_RATES;
  label: string;
  multiplier: number;
  effectiveRate: number;
}

/**
 * Build a full penalty-rate breakdown for a base hourly rate across every
 * shift type defined in PENALTY_RATES (weekday, Saturday, Sunday, public
 * holiday and night shift).
 */
export function penaltyRateBreakdown(hourlyRate: number): PenaltyRateRow[] {
  return (Object.keys(PENALTY_RATES) as Array<keyof typeof PENALTY_RATES>).map(type => {
    const { label, multiplier } = PENALTY_RATES[type];
    return { type, label, multiplier, effectiveRate: hourlyRate * multiplier };
  });
}
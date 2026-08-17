/**
 * Teen Super Engine — super vs outside-super investing decision and compound
 * growth with fee drag for Australian teens.
 *
 * Data sources: ATO super rules ('@/data/super-rules') and tax brackets
 * ('@/data/tax-brackets').
 */

import { SUPER_RULES } from '@/data/super-rules';
import { getCombinedMarginalRate, getMarginalRate } from '@/data/tax-brackets';

/**
 * Assumptions shared by the super-vs-outside decision model.
 * Growth of 7.5% p.a. is a documented long-run default; the horizon runs to
 * age 60 (preservation age).
 */
export const SUPER_COMPARISON_ASSUMPTIONS = {
  growthRate: 0.075,
  yearsTo60: 40,
} as const;

export interface SuperVsOutsideResult {
  superTaxRate: number;         // 15% tax on concessional contributions
  outsideTaxRate: number;       // Marginal rate paid if taken as cash
  perDollarSuper: number;       // $ invested in super per $1 of pre-tax salary
  perDollarOutside: number;     // $ invested outside super per $1 of pre-tax salary
  annualContributionCompared: number;
  employerSgContribution: number; // income x employerRate (informational)
  growthRate: number;
  yearsTo60: number;
  futureValueSuper: number;     // FV of the annual contribution at age 60
  futureValueOutside: number;
  superAdvantage: number;       // futureValueSuper - futureValueOutside
  division293Applies: boolean;
}

/**
 * Compare salary-sacrificing into super (taxed at 15% inside super) versus
 * investing the same money outside super after paying personal marginal tax.
 *
 * @param income - Annual amount of pre-tax salary to compare (AUD)
 * @param personalRate - The worker's personal marginal tax rate (decimal).
 *                       Pass 0 for teens earning under the tax-free threshold.
 * @param employerRate - Employer SG rate on income (default 12% from SUPER_RULES)
 *
 * Assumptions:
 * - Concessional contributions are taxed at 15% (SUPER_RULES.taxRateInSuper).
 * - The comparison ignores the 50% CGT discount inside super and outside
 *   earnings drag for simplicity, so both sides compound at the same rate.
 * - Division 293 may apply once income + contributions exceed $250,000.
 */
export function superComparison(
  income: number,
  personalRate: number,
  employerRate: number = SUPER_RULES.sgRate
): SuperVsOutsideResult {
  const superTaxRate = SUPER_RULES.taxRateInSuper;
  const outsideTaxRate = Math.min(Math.max(personalRate, 0), 0.47);
  const perDollarSuper = 1 - superTaxRate;
  const perDollarOutside = 1 - outsideTaxRate;

  const { growthRate, yearsTo60 } = SUPER_COMPARISON_ASSUMPTIONS;
  const r = growthRate / 12;
  const n = yearsTo60 * 12;
  // FV factor: end-of-year contributions, monthly compounding, over `yearsTo60`.
  const fvFactor = r > 0 ? 12 * ((Math.pow(1 + r, n) - 1) / r) : 12 * n;

  const futureValueSuper = fvFactor * income * perDollarSuper;
  const futureValueOutside = fvFactor * income * perDollarOutside;

  return {
    superTaxRate,
    outsideTaxRate,
    perDollarSuper,
    perDollarOutside,
    annualContributionCompared: income,
    employerSgContribution: income * employerRate,
    growthRate,
    yearsTo60,
    futureValueSuper: Math.round(futureValueSuper),
    futureValueOutside: Math.round(futureValueOutside),
    superAdvantage: Math.round(futureValueSuper - futureValueOutside),
    division293Applies: income + income * employerRate > SUPER_RULES.division293Threshold,
  };
}

export interface FeeDragResult {
  grossReturnRate: number;      // p.a. before fees (decimal)
  feeRate: number;              // p.a. management fee (decimal)
  netReturnRate: number;        // gross - fee (decimal)
  futureValueNoFees: number;    // FV without any fee drag
  futureValueWithFees: number;  // FV with fee drag
  feeDragLoss: number;          // money lost to fees over the term
  feeDragPct: number;           // % of the no-fee balance lost to fees
}

/**
 * Compound growth of a regular monthly contribution with an ongoing fee drag
 * (e.g. super fund MER of 0.5% p.a.), applied as a simple subtraction from the
 * gross return before monthly compounding.
 *
 * Assumptions: contributions land at the end of each month; fees are deducted
 * continuously via the reduced rate (standard approximation).
 */
export function compoundGrowthWithFees(
  monthlyContribution: number,
  years: number,
  grossReturnRate: number,
  feeRate: number = 0.005
): FeeDragResult {
  const safeYears = Math.max(years, 0);
  const safeContrib = Math.max(monthlyContribution, 0);
  const netReturnRate = Math.max(grossReturnRate - feeRate, 0);
  const n = safeYears * 12;

  const fv = (r: number): number => {
    if (n === 0 || safeContrib === 0) return 0;
    const rm = r / 12;
    if (rm === 0) return safeContrib * n;
    return safeContrib * ((Math.pow(1 + rm, n) - 1) / rm);
  };

  const futureValueNoFees = fv(Math.max(grossReturnRate, 0));
  const futureValueWithFees = fv(netReturnRate);
  const feeDragLoss = futureValueNoFees - futureValueWithFees;

  return {
    grossReturnRate,
    feeRate,
    netReturnRate,
    futureValueNoFees: Math.round(futureValueNoFees),
    futureValueWithFees: Math.round(futureValueWithFees),
    feeDragLoss: Math.round(feeDragLoss),
    feeDragPct: futureValueNoFees > 0 ? (feeDragLoss / futureValueNoFees) * 100 : 0,
  };
}

/**
 * Convenience helper: combined marginal rate for a salary (used by the UI to
 * feed `personalRate` into `superComparison`).
 */
export function teenMarginalRate(annualSalary: number): number {
  return getCombinedMarginalRate(annualSalary);
}

export { getMarginalRate };
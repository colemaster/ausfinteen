/**
 * Teen Super Engine — super vs outside-super investing decision and compound
 * growth with fee drag for Australian teens.
 *
 * Figures verified 18 October 2026 for the 2026-27 financial year: 12.0% SG,
 * $32,500 concessional cap, $130,000 non-concessional cap and a $250,000
 * Division 293 threshold (all ATO). Payday Super has applied since 1 July 2026.
 *
 * Data sources: ATO super rules ('@/data/super-rules') and tax brackets
 * ('@/data/tax-brackets').
 */

import { SUPER_RULES } from '@/data/super-rules';
import { getCombinedMarginalRate, getMarginalRate } from '@/data/tax-brackets';

/**
 * Under-18 Super Guarantee eligibility check under the Superannuation Guarantee
 * (Administration) Act 1992 (Cth) s 27(1)(a).
 *
 * Under section 27(1)(a), salary or wages paid to an employee under 18 years
 * of age are exempt from mandatory employer Super Guarantee unless the employee
 * works more than 30 hours in a given week (>30 hours per calendar week).
 *
 * Once an employee reaches 18 years of age, the 30-hour weekly limitation ceases
 * and employer SG (12.0% statutory rate) is payable on all ordinary time earnings (OTE).
 *
 * @param age - Employee age in years
 * @param hoursPerWeek - Hours worked in the calendar week
 * @returns boolean - true if employer SG must be paid
 */
export function isUnder18SuperEligible(age: number, hoursPerWeek: number): boolean {
  if (age >= 18) return true;
  return hoursPerWeek > SUPER_RULES.under18WeeklyHoursThreshold;
}

/**
 * Assumptions shared by the super-vs-outside decision model.
 * Growth of 7.5% p.a. is a documented long-run default (an assumption, not an
 * ATO figure); the horizon runs to age 60 (preservation age).
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
 * @param yearsTo60 - Compounding horizon in years to preservation age 60 (default 40, or 45 for age 15)
 * @param growthRate - Projected gross annual growth rate (default 0.075)
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
  employerRate: number = SUPER_RULES.sgRate,
  yearsTo60: number = SUPER_COMPARISON_ASSUMPTIONS.yearsTo60,
  growthRate: number = SUPER_COMPARISON_ASSUMPTIONS.growthRate
): SuperVsOutsideResult {
  const superTaxRate = SUPER_RULES.taxRateInSuper;
  const outsideTaxRate = Math.min(Math.max(personalRate, 0), 0.47);
  const perDollarSuper = 1 - superTaxRate;
  const perDollarOutside = 1 - outsideTaxRate;

  const safeYears = Math.max(yearsTo60, 0);
  const safeGrowth = Math.max(growthRate, 0);
  const r = safeGrowth / 12;
  const n = safeYears * 12;
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
    growthRate: safeGrowth,
    yearsTo60: safeYears,
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

export interface CasualSuperCompoundingResult {
  weeklyContribution: number;
  annualContribution: number;
  startAge: number;
  preservationAge: number;
  compoundingYears: number;
  totalContributionsPaid: number;
  grossReturnRate: number;
  feeRate: number;
  netReturnRate: number;
  futureValueNoFees: number;
  futureValueWithFees: number;
  feeDragLoss: number;
  feeDragPct: number;
  compoundingMultiplier: number;
}

/**
 * Model long-term compound super growth from teen casual contributions (e.g. $50/week)
 * through to preservation age 60 (45-year horizon starting at age 15).
 * Demonstrates the dramatic exponential compounding of early youth contributions
 * versus cash savings or fee drag.
 *
 * @param weeklyContribution - Weekly contribution amount in AUD (e.g. $50)
 * @param startAge - Starting age in years (default 15)
 * @param preservationAge - Super preservation age (default 60 from SUPER_RULES)
 * @param grossReturnRate - Annual gross return rate (default 0.085 for indexed high growth)
 * @param feeRate - Annual management expense ratio (default 0.005 for 0.5% MER)
 */
export function modelCasualSuperCompounding(
  weeklyContribution: number,
  startAge: number = 15,
  preservationAge: number = SUPER_RULES.preservationAge,
  grossReturnRate: number = 0.085,
  feeRate: number = 0.005,
): CasualSuperCompoundingResult {
  const safeWeekly = Math.max(weeklyContribution, 0);
  const compoundingYears = Math.max(0, preservationAge - startAge);
  const monthlyContribution = (safeWeekly * 52) / 12;
  const feeResult = compoundGrowthWithFees(monthlyContribution, compoundingYears, grossReturnRate, feeRate);
  const totalContributionsPaid = Math.round(safeWeekly * 52 * compoundingYears);
  const compoundingMultiplier =
    totalContributionsPaid > 0
      ? Math.round((feeResult.futureValueWithFees / totalContributionsPaid) * 100) / 100
      : 0;

  return {
    weeklyContribution: safeWeekly,
    annualContribution: Math.round(safeWeekly * 52),
    startAge,
    preservationAge,
    compoundingYears,
    totalContributionsPaid,
    grossReturnRate,
    feeRate,
    netReturnRate: feeResult.netReturnRate,
    futureValueNoFees: feeResult.futureValueNoFees,
    futureValueWithFees: feeResult.futureValueWithFees,
    feeDragLoss: feeResult.feeDragLoss,
    feeDragPct: feeResult.feeDragPct,
    compoundingMultiplier,
  };
}

export { getMarginalRate };
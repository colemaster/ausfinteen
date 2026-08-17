/**
 * Teen Tax — Financial Engine
 * After-school job tax estimates (weekly → annual), TFN withholding rules,
 * and payslip-style breakdowns. Pure functions, no React, no side effects.
 * Based on 2026-27 ATO rates.
 */

import {
  calcIncomeTax,
  calcMedicareLevy,
  getMarginalRate,
} from '../../data/tax-brackets';
import {
  calcHELPRepayment,
  calcHELPRate,
  TFN_WITHHOLDING_RATE,
  TAX_FREE_THRESHOLD,
  WEEKS_PER_YEAR,
} from '../../data/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AfterSchoolJobTaxOptions {
  /** Weeks worked per year, default 52 */
  weeksPerYear?: number;
  /** Include Medicare levy (2% with ATO low-income shade-in), default true */
  includeMedicare?: boolean;
  /** Include HELP/HECS repayment (0–10% of income), default false */
  includeHELP?: boolean;
}

export interface AfterSchoolJobTaxResult {
  weeklyHours: number;
  hourlyRate: number;
  weeklyGross: number;
  annualGross: number;
  incomeTax: number;
  medicareLevy: number;
  helpRepayment: number;
  helpRate: number;
  totalTax: number;
  netAnnual: number;
  netWeekly: number;
  effectiveRate: number;
  marginalRate: number;
}

/**
 * Estimate annual tax for an after-school job from weekly hours and hourly rate.
 *
 * @param weeklyHours - Hours worked per week
 * @param hourlyRate - Hourly rate in AUD
 * @param options - Optional flags (weeks per year, Medicare, HELP)
 * @returns AfterSchoolJobTaxResult — weekly and annual figures
 *
 * Assumptions:
 * - Weekly income × weeks per year (default 52) = annual gross income
 * - The $18,200 tax-free threshold is applied automatically via the Stage 3
 *   brackets (0% under $18,200)
 * - Medicare levy uses ATO low-income shade-in rules (0% → 2%)
 * - HELP/HECS repayment (0–10%) applies to gross income when included
 */
export function afterSchoolJobTax(
  weeklyHours: number,
  hourlyRate: number,
  options: AfterSchoolJobTaxOptions = {},
): AfterSchoolJobTaxResult {
  const weeksPerYear = options.weeksPerYear ?? WEEKS_PER_YEAR;
  const includeMedicare = options.includeMedicare ?? true;
  const includeHELP = options.includeHELP ?? false;

  const weeklyGross = Math.max(0, weeklyHours) * Math.max(0, hourlyRate);
  const annualGross = weeklyGross * weeksPerYear;

  const incomeTax = calcIncomeTax(annualGross);
  const medicareLevy = includeMedicare ? calcMedicareLevy(annualGross) : 0;
  const helpRate = includeHELP ? calcHELPRate(annualGross) : 0;
  const helpRepayment = includeHELP ? calcHELPRepayment(annualGross) : 0;

  const totalTax = incomeTax + medicareLevy + helpRepayment;
  const netAnnual = annualGross - totalTax;
  const netWeekly = weeklyGross - totalTax / weeksPerYear;
  const effectiveRate = annualGross > 0 ? totalTax / annualGross : 0;

  return {
    weeklyHours,
    hourlyRate,
    weeklyGross: Math.round(weeklyGross * 100) / 100,
    annualGross,
    incomeTax: Math.round(incomeTax),
    medicareLevy: Math.round(medicareLevy),
    helpRepayment: Math.round(helpRepayment),
    helpRate,
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netWeekly: Math.round(netWeekly * 100) / 100,
    effectiveRate,
    marginalRate: getMarginalRate(annualGross),
  };
}

// ─── TFN Withholding ──────────────────────────────────────────────────────────

export interface TFNWithholdingResult {
  annualIncome: number;
  claimExemption: boolean;
  exemptionEligible: boolean;
  withholdingRate: number;
  annualWithheld: number;
  weeklyWithheld: number;
  actualAnnualTax: number;
  estimatedRefund: number;
  taxOwingAtLodgement: number;
}

/**
 * Model TFN withholding for a teen job:
 * - Claiming the tax-free-threshold exemption (income ≤ $18,200) → 0% withheld
 * - Not claiming (or no TFN provided) → 47% top marginal withholding rate
 *
 * @param annualIncome - Annual gross employment income in AUD
 * @param claimExemption - Whether the teen claims the TFN exemption
 * @returns TFNWithholdingResult — withheld amounts plus refund / owing at lodgement
 *
 * Assumptions:
 * - Exemption is only valid while annual income ≤ $18,200; above that the
 *   employer must withhold at the 47% no-TFN rate
 * - Refund/owing compares withholding against the actual annual tax
 *   (income tax + Medicare, no HELP by default)
 */
export function tfnWithholding(
  annualIncome: number,
  claimExemption: boolean,
): TFNWithholdingResult {
  const exemptionEligible = annualIncome <= TAX_FREE_THRESHOLD;
  const exemptionValid = claimExemption && exemptionEligible;
  const withholdingRate = exemptionValid ? 0 : TFN_WITHHOLDING_RATE;

  const annualWithheld = annualIncome * withholdingRate;
  const weeklyWithheld = annualWithheld / WEEKS_PER_YEAR;

  // Actual annual tax (income tax + Medicare, no HELP) for refund/owing estimate
  const actualAnnualTax = calcIncomeTax(annualIncome) + calcMedicareLevy(annualIncome);

  const estimatedRefund = Math.max(0, annualWithheld - actualAnnualTax);
  const taxOwingAtLodgement = Math.max(0, actualAnnualTax - annualWithheld);

  return {
    annualIncome,
    claimExemption,
    exemptionEligible,
    withholdingRate,
    annualWithheld: Math.round(annualWithheld),
    weeklyWithheld: Math.round(weeklyWithheld * 100) / 100,
    actualAnnualTax,
    estimatedRefund: Math.round(estimatedRefund),
    taxOwingAtLodgement: Math.round(taxOwingAtLodgement),
  };
}

// ─── Payslip Breakdown ────────────────────────────────────────────────────────

export interface PayslipBreakdownOptions {
  weeksPerYear?: number;
  includeSuper?: boolean;
  sgRate?: number;
  /** Claim the TFN tax-free-threshold exemption (valid while ≤ $18,200/yr) */
  claimExemption?: boolean;
}

export interface PayslipBreakdownRow {
  key: string;
  label: string;
  amount: number;
  kind: 'gross' | 'deduction' | 'net' | 'employer';
}

export interface PayslipBreakdownResult {
  rows: PayslipBreakdownRow[];
  grossWeekly: number;
  taxWithheldWeekly: number;
  netWeekly: number;
  superWeekly: number;
}

/**
 * Build a payslip-style weekly breakdown: gross, PAYG withheld, super, net.
 *
 * @param weeklyHours - Hours worked per week
 * @param hourlyRate - Hourly rate in AUD
 * @param options - Optional flags (weeks per year, super inclusion + SG rate)
 * @returns PayslipBreakdownResult — labelled rows ready for display
 *
 * Assumptions:
 * - PAYG withheld uses the TFN withholding model (0% exemption under $18,200,
 *   otherwise 47%) converted to a weekly figure
 * - Superannuation Guarantee 12% is an employer payment shown for education —
 *   it does NOT reduce the teen's take-home pay
 */
export function payslipBreakdown(
  weeklyHours: number,
  hourlyRate: number,
  options: PayslipBreakdownOptions = {},
): PayslipBreakdownResult {
  const weeksPerYear = options.weeksPerYear ?? WEEKS_PER_YEAR;
  const includeSuper = options.includeSuper ?? true;
  const sgRate = options.sgRate ?? 0.12;

  const taxEstimate = afterSchoolJobTax(weeklyHours, hourlyRate, { weeksPerYear });
  const withholding = tfnWithholding(
    taxEstimate.annualGross,
    options.claimExemption ?? taxEstimate.annualGross <= TAX_FREE_THRESHOLD,
  );

  const grossWeekly = taxEstimate.weeklyGross;
  const taxWithheldWeekly = withholding.weeklyWithheld;
  const superWeekly = includeSuper ? grossWeekly * sgRate : 0;
  const netWeekly = Math.max(0, grossWeekly - taxWithheldWeekly);

  const rows: PayslipBreakdownRow[] = [
    { key: 'gross', label: 'Gross Pay (hours × rate)', amount: grossWeekly, kind: 'gross' },
    { key: 'payg', label: 'PAYG Tax Withheld', amount: taxWithheldWeekly, kind: 'deduction' },
  ];
  if (includeSuper) {
    rows.push({
      key: 'super',
      label: 'Superannuation (12% employer)',
      amount: superWeekly,
      kind: 'employer',
    });
  }
  rows.push({ key: 'net', label: 'Net Pay (into your bank)', amount: netWeekly, kind: 'net' });

  return {
    rows,
    grossWeekly,
    taxWithheldWeekly,
    netWeekly,
    superWeekly,
  };
}

/**
 * Teen Tax — Financial Engine
 * After-school job tax estimates (weekly → annual), TFN withholding rules,
 * and payslip-style breakdowns. Pure functions, no React, no side effects.
 * Based on 2026-27 ATO rates.
 */

import {
  calcIncomeTax,
  calcLITO,
  calcMedicareLevy,
  getMarginalRate,
} from '../../data/tax-brackets';
import {
  calcHELPRepayment,
  calcHELPRate,
  TFN_WITHHOLDING_RATE,
  TAX_FREE_THRESHOLD,
  WEEKS_PER_YEAR,
  CENTS_PER_KM_2026_27,
  WFH_FIXED_RATE_HOURLY,
  STANDARD_DEDUCTION_2026_27,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
  INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER,
  TAX_DEADLINES_2026_27,
} from '../../data/constants';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Effective tax-free threshold for 2026-27: $22,866.
 * Statutory $18,200 + ($700 maximum LITO ÷ 0.15 Stage 3 second bracket tax rate = $4,666.67).
 * At $22,866 taxable income, gross tax is ($22,866 − $18,200) × 15% = $700.
 * LITO reduces tax by $700 → net income tax payable is $0!
 */
export const EFFECTIVE_TAX_FREE_THRESHOLD = 22866;

/** Division 6AA minor unearned income thresholds & rates (Part III Div 6AA ITAA 1936) */
export const DIV6AA_TAX_FREE_LIMIT = 416;
export const DIV6AA_SHADE_IN_LIMIT = 1307;
export const DIV6AA_SHADE_IN_RATE = 0.66;
export const DIV6AA_TOP_RATE = 0.45;

/** ATO Motor vehicle cents-per-kilometre deduction rate for 2026-27 (91c/km, max 5,000 km) */
export const CENTS_PER_KM_RATE = CENTS_PER_KM_2026_27;

/** Re-export constants for easy access */
export {
  WFH_FIXED_RATE_HOURLY,
  STANDARD_DEDUCTION_2026_27,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
  INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER,
  TAX_DEADLINES_2026_27,
};

/** Section 900-35 ITAA 1997: $300 general work-related deduction threshold without receipts */
export const SUBSTANTIATION_THRESHOLD_NO_RECEIPTS = 300;

/** ATO reasonable laundry allowance threshold without receipts */
export const LAUNDRY_THRESHOLD_NO_RECEIPTS = 150;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AfterSchoolJobTaxOptions {
  /** Weeks worked per year, default 52 */
  weeksPerYear?: number;
  /** Include Medicare levy (2% with ATO low-income shade-in), default true */
  includeMedicare?: boolean;
  /** Include HELP/HECS repayment (0–10% of income), default false */
  includeHELP?: boolean;
  /** Apply Low Income Tax Offset (LITO up to $700) to totalTax, default false for backwards compatibility */
  includeLITO?: boolean;
}

export interface AfterSchoolJobTaxResult {
  weeklyHours: number;
  hourlyRate: number;
  weeklyGross: number;
  annualGross: number;
  incomeTax: number;
  lito: number;
  taxAfterOffsets: number;
  isUnderEffectiveThreshold: boolean;
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
 * @param options - Optional flags (weeks per year, Medicare, HELP, LITO)
 * @returns AfterSchoolJobTaxResult — weekly and annual figures
 *
 * Assumptions:
 * - Weekly income × weeks per year (default 52) = annual gross income
 * - The $18,200 tax-free threshold is applied automatically via the Stage 3
 *   brackets (0% under $18,200)
 * - LITO ($700 max) creates an effective tax-free threshold of $22,866 under Stage 3 (15%)
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
  const includeLITO = options.includeLITO ?? false;

  const weeklyGross = Math.max(0, weeklyHours) * Math.max(0, hourlyRate);
  const annualGross = weeklyGross * weeksPerYear;

  const incomeTax = calcIncomeTax(annualGross);
  const lito = Math.round(calcLITO(annualGross));
  const taxAfterOffsets = Math.max(0, incomeTax - lito);
  const medicareLevy = includeMedicare ? calcMedicareLevy(annualGross) : 0;
  const helpRate = includeHELP ? calcHELPRate(annualGross) : 0;
  const helpRepayment = includeHELP ? calcHELPRepayment(annualGross) : 0;

  const baseTaxForTotal = includeLITO ? taxAfterOffsets : incomeTax;
  const totalTax = baseTaxForTotal + medicareLevy + helpRepayment;
  const netAnnual = annualGross - totalTax;
  const netWeekly = weeklyGross - totalTax / weeksPerYear;
  const effectiveRate = annualGross > 0 ? totalTax / annualGross : 0;

  return {
    weeklyHours,
    hourlyRate,
    weeklyGross: Math.round(weeklyGross * 100) / 100,
    annualGross,
    incomeTax: Math.round(incomeTax),
    lito,
    taxAfterOffsets: Math.round(taxAfterOffsets),
    isUnderEffectiveThreshold: annualGross <= EFFECTIVE_TAX_FREE_THRESHOLD,
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

// ─── Division 6AA Minor Unearned Income ───────────────────────────────────────

export interface Division6AATaxResult {
  unearnedIncome: number;
  taxPayable: number;
  isExempt: boolean;
  bracket: 'exempt' | 'shade_in' | 'top_rate';
  effectiveRate: number;
  marginalRate: number;
  description: string;
}

/**
 * Calculate Division 6AA minor unearned income tax (Part III Div 6AA ITAA 1936).
 * Applies to passive income (interest, dividends, trust distributions) of minors under 18:
 * - $0 to $416: Nil tax (0%)
 * - $417 to $1,307: 66% shade-in rate on amount over $416 → (income − $416) × 66%
 * - Over $1,307: 45% flat rate on the entire unearned income (or 45% flat rate)
 *
 * Wages and employment income are completely exempt from Division 6AA and receive
 * the standard adult $18,200 threshold + LITO ($22,866 effective tax-free threshold).
 */
export function calcDivision6AATax(unearnedIncome: number): Division6AATaxResult {
  const income = Math.max(0, unearnedIncome);

  if (income <= DIV6AA_TAX_FREE_LIMIT) {
    return {
      unearnedIncome: income,
      taxPayable: 0,
      isExempt: true,
      bracket: 'exempt',
      effectiveRate: 0,
      marginalRate: 0,
      description: 'Tax-free: Unearned income is $416 or less — 0% tax applies.',
    };
  }

  if (income <= DIV6AA_SHADE_IN_LIMIT) {
    const taxPayable = Math.round((income - DIV6AA_TAX_FREE_LIMIT) * DIV6AA_SHADE_IN_RATE * 100) / 100;
    return {
      unearnedIncome: income,
      taxPayable,
      isExempt: false,
      bracket: 'shade_in',
      effectiveRate: income > 0 ? taxPayable / income : 0,
      marginalRate: DIV6AA_SHADE_IN_RATE,
      description: 'Shade-in rate: 66% tax applies to unearned income exceeding $416.',
    };
  }

  // Over $1,307: flat 45% rate on the entire unearned income
  const taxPayable = Math.round(income * DIV6AA_TOP_RATE * 100) / 100;
  return {
    unearnedIncome: income,
    taxPayable,
    isExempt: false,
    bracket: 'top_rate',
    effectiveRate: DIV6AA_TOP_RATE,
    marginalRate: DIV6AA_TOP_RATE,
    description: 'Top minor rate: Over $1,307 — flat 45% tax applies to entire unearned income.',
  };
}

// ─── Work-Related Vehicle Deduction (Cents-per-km) ───────────────────────────

export interface CentsPerKmResult {
  workKm: number;
  cappedKm: number;
  ratePerKm: number;
  deduction: number;
  isCapped: boolean;
}

/**
 * Calculate ATO cents-per-kilometre deduction for work car travel (2026-27 rate = 91c/km).
 * Up to 5,000 work-related kilometres (maximum deduction: $4,550).
 */
export function calcCentsPerKmDeduction(workKm: number, ratePerKm = CENTS_PER_KM_2026_27): CentsPerKmResult {
  const km = Math.max(0, workKm);
  const cappedKm = Math.min(5000, km);
  const deduction = Math.round(cappedKm * ratePerKm * 100) / 100;
  return {
    workKm: km,
    cappedKm,
    ratePerKm,
    deduction,
    isCapped: km > 5000,
  };
}

// ─── Work From Home (WFH) Fixed Rate Deduction (PCG 2023/1) ─────────────────

export interface WFHFixedRateResult {
  hoursWorked: number;
  ratePerHour: number;
  deduction: number;
  coveredExpenses: string[];
  separateClaimableItems: string[];
  substantiationRequirement: string;
}

/**
 * Calculate ATO Working From Home (WFH) deduction using the revised fixed rate method (PCG 2023/1).
 * Rate: 70c per hour (2024-25, 2025-26, and 2026-27).
 * Covers: energy (electricity/gas), internet, mobile & home phone, stationery and consumables.
 * Does NOT require separate apportionment between private and work use.
 * Separate items (depreciation of laptops/monitors/furniture, office cleaning) can be claimed on top.
 */
export function calcWFHFixedRateDeduction(
  hoursWorked: number,
  ratePerHour = WFH_FIXED_RATE_HOURLY,
): WFHFixedRateResult {
  const hours = Math.max(0, hoursWorked);
  const deduction = Math.round(hours * ratePerHour * 100) / 100;

  return {
    hoursWorked: hours,
    ratePerHour,
    deduction,
    coveredExpenses: [
      'Energy expenses (electricity and gas) for heating, cooling, and lighting',
      'Internet and data network access expenses',
      'Mobile phone and home phone usage expenses',
      'Stationery and computer consumables (paper, ink cartridges, notebooks)',
    ],
    separateClaimableItems: [
      'Decline in value (depreciation) of computers, laptops, monitors, desks, and ergonomic chairs',
      'Repairs and maintenance of work-related tech and furniture',
      'Cleaning costs of a dedicated home office work space',
    ],
    substantiationRequirement:
      'Continuous record of all actual hours worked from home across the income year (timesheet, roster, or continuous diary; 4-week estimates not accepted) plus at least one bill/invoice per expense category.',
  };
}

// ─── Small Business Instant Asset Write-Off (s 328-180 ITAA 1997) ─────────────

export interface InstantAssetWriteOffResult {
  assetCost: number;
  businessUsePct: number;
  businessDeductibleCost: number;
  isEligibleTurnover: boolean;
  isUnderThreshold: boolean;
  canWriteOffImmediately: boolean;
  immediateDeduction: number;
  firstYearPoolDepreciation: number;
  threshold: number;
}

/**
 * Calculate Small Business Instant Asset Write-Off under s 328-180 ITAA 1997.
 * Eligible for entities (sole traders, freelancers, side hustles) with turnover < $10,000,000.
 * Threshold: $20,000 per asset.
 * If cost < $20,000: 100% of business portion written off in the year first used.
 * If cost >= $20,000: Allocated to the simplified depreciation pool (15% in year 1, 30% thereafter).
 */
export function calcInstantAssetWriteOff(
  assetCost: number,
  businessUsePct = 1.0,
  annualTurnover = 50000,
  threshold = INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
  maxTurnover = INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER,
): InstantAssetWriteOffResult {
  const cost = Math.max(0, assetCost);
  const pct = Math.min(1, Math.max(0, businessUsePct));
  const businessDeductibleCost = Math.round(cost * pct * 100) / 100;
  const isEligibleTurnover = annualTurnover < maxTurnover;
  const isUnderThreshold = cost < threshold;
  const canWriteOffImmediately = isEligibleTurnover && isUnderThreshold;

  const immediateDeduction = canWriteOffImmediately ? businessDeductibleCost : 0;
  const firstYearPoolDepreciation = !canWriteOffImmediately && isEligibleTurnover
    ? Math.round(businessDeductibleCost * 0.15 * 100) / 100
    : 0;

  return {
    assetCost: cost,
    businessUsePct: pct,
    businessDeductibleCost,
    isEligibleTurnover,
    isUnderThreshold,
    canWriteOffImmediately,
    immediateDeduction,
    firstYearPoolDepreciation,
    threshold,
  };
}

// ─── Weekly PAYG Withholding ──────────────────────────────────────────────────

export interface WeeklyPAYGOptions {
  /** Has provided a valid TFN to employer (default true) */
  hasTFN?: boolean;
  /** Claimed the tax-free threshold on TFN declaration (default true) */
  claimTaxFreeThreshold?: boolean;
  /** Whether the employee is under 18 years old (eligible for $350/wk no-TFN exemption on NAT 3092 Question 1) */
  isUnder18?: boolean;
  /** @deprecated Use isUnder18 instead — Form NAT 3092 Question 1 exemption covers all under-18 employees */
  isUnder16?: boolean;
}

/**
 * Calculate Pay-As-You-Go (PAYG) tax withholding on a weekly pay slip.
 * Based on ATO weekly tax tables (Schedule 1 / NAT 1005) for 2026-27 Stage 3 rates:
 *
 * 1. No TFN provided:
 *    - Under 18 and weekly pay <= $350 ($18,200/yr): $0 withheld (NAT 3092 Question 1 exemption / ITAA 1936 s 202D).
 *    - Otherwise: 47% top marginal rate withheld from total gross pay.
 *
 * 2. TFN provided, claiming tax-free threshold:
 *    - Weekly gross <= $350 ($18,200/yr): $0 withheld.
 *    - Weekly gross > $350: 15% withheld on the excess over $350.
 *
 * 3. TFN provided, NOT claiming tax-free threshold (e.g. second job):
 *    - 15% withheld on entire gross pay from dollar 1.
 */
export function calcWeeklyPAYGWithholding(
  weeklyGross: number,
  options: WeeklyPAYGOptions = {},
): number {
  const gross = Math.max(0, weeklyGross);
  const hasTFN = options.hasTFN ?? true;
  const claimTaxFreeThreshold = options.claimTaxFreeThreshold ?? true;
  const isUnder18 = options.isUnder18 ?? options.isUnder16 ?? false;

  if (!hasTFN) {
    if (isUnder18 && gross <= 350) {
      return 0;
    }
    return Math.round(gross * TFN_WITHHOLDING_RATE * 100) / 100;
  }

  if (claimTaxFreeThreshold) {
    if (gross <= 350) {
      return 0;
    }
    return Math.round((gross - 350) * 0.15 * 100) / 100;
  }

  return Math.round(gross * 0.15 * 100) / 100;
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
  /** Has provided a valid TFN to employer (default true) */
  hasTFN?: boolean;
  /** Claiming the tax-free threshold on TFN declaration (default true) */
  claimTaxFreeThreshold?: boolean;
  /** Whether the employee is under 18 years old (eligible for $350/wk no-TFN exemption on NAT 3092) */
  isUnder18?: boolean;
  /** @deprecated Use isUnder18 instead */
  isUnder16?: boolean;
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
 * @param options - Optional flags (weeks per year, super inclusion, TFN/threshold options)
 * @returns PayslipBreakdownResult — labelled rows ready for display
 *
 * Assumptions:
 * - PAYG withheld uses either the TFN exemption model (when claimExemption is provided)
 *   or the weekly PAYG withholding scale (0% under $350/wk, 15% above $350 when threshold claimed)
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
  const grossWeekly = taxEstimate.weeklyGross;

  let taxWithheldWeekly = 0;
  if (options.claimExemption !== undefined) {
    const withholding = tfnWithholding(taxEstimate.annualGross, options.claimExemption);
    taxWithheldWeekly = withholding.weeklyWithheld;
  } else if (
    options.hasTFN !== undefined ||
    options.claimTaxFreeThreshold !== undefined ||
    options.isUnder18 !== undefined ||
    options.isUnder16 !== undefined
  ) {
    taxWithheldWeekly = calcWeeklyPAYGWithholding(grossWeekly, {
      hasTFN: options.hasTFN ?? true,
      claimTaxFreeThreshold: options.claimTaxFreeThreshold ?? true,
      isUnder18: options.isUnder18 ?? options.isUnder16 ?? false,
    });
  } else {
    const withholding = tfnWithholding(
      taxEstimate.annualGross,
      taxEstimate.annualGross <= TAX_FREE_THRESHOLD,
    );
    taxWithheldWeekly = withholding.weeklyWithheld;
  }

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

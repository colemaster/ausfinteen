/**
 * Australian financial constants for 2026-27.
 * Sources: ATO, ASIC MoneySmart, StudyAssist, Fair Work, QCAA, QTAC.
 */

// ─── HELP / HECS Repayment Thresholds 2026-27 ────────────────────────────────

export interface HELPThreshold {
  min: number;
  max: number;
  rate: number;
}

/** 2026-27 HELP/HECS marginal repayment thresholds (effective 1 July 2026) */
export const HELP_REPAYMENT_THRESHOLDS_2026_27: HELPThreshold[] = [
  { min: 0,       max: 69528,   rate: 0 },
  { min: 69529,   max: 129717,  rate: 0.15 },
  { min: 129718,  max: 186050,  rate: 0.17 },
  { min: 186051,  max: Infinity, rate: 0.10 },
];

/** @deprecated Use HELP_REPAYMENT_THRESHOLDS_2026_27 instead */
export const HELP_REPAYMENT_THRESHOLDS_2024_25 = HELP_REPAYMENT_THRESHOLDS_2026_27;

/** HELP debt indexation rate for 2026 (applied 1 June 2026) — confirmed by ATO/StudyAssist */
export const HELP_INDEXATION_RATE_2026 = 0.028; // 2.8%

/** One-off 20% HELP debt reduction applied before indexation on 1 June 2025 */
export const HELP_DEBT_REDUCTION_2025 = 0.20; // 20%

/**
 * Calculate HELP/HECS compulsory repayment for a given repayment income
 * using the 2026-27 marginal band system (15% above $69,528, 17% above
 * $129,717, then 10% of total income above $186,051).
 * Uses HELP_REPAYMENT_THRESHOLDS_2026_27 as the single source of truth.
 */
export function calcHELPRepayment(repaymentIncome: number): number {
  if (repaymentIncome <= HELP_REPAYMENT_THRESHOLDS_2026_27[0].max) return 0;
  if (repaymentIncome <= 129717) {
    return (repaymentIncome - 69528) * 0.15;
  }
  if (repaymentIncome <= 186050) {
    const tier1 = (129717 - 69528) * 0.15; // 9,028.35
    return tier1 + (repaymentIncome - 129717) * 0.17;
  }
  // Above $186,051: flat 10% of total repayment income
  return repaymentIncome * 0.10;
}

/**
 * Return the HELP/HECS repayment rate (0% to 10%) for a given repayment income.
 * Returns 0 for incomes at or below the minimum threshold ($69,528).
 */
export function calcHELPRate(repaymentIncome: number): number {
  for (const t of HELP_REPAYMENT_THRESHOLDS_2026_27) {
    if (repaymentIncome <= t.max) {
      return t.rate;
    }
  }
  return 0;
}

/**
 * Return the HELP/HECS threshold bracket a given repayment income falls into.
 * @returns The matching HELPThreshold or undefined below $69,528.
 */
export function getHELPBracket(repaymentIncome: number): HELPThreshold | undefined {
  return HELP_REPAYMENT_THRESHOLDS_2026_27.find(
    (t, i) =>
      repaymentIncome <= t.max &&
      (i === 0 || repaymentIncome >= HELP_REPAYMENT_THRESHOLDS_2026_27[i - 1]!.max + 1),
  );
}

// ─── PAYG Withholding & Tax-Free Threshold ───────────────────────────────────

/** $18,200 tax-free threshold for residents — built into TAX_BRACKETS_2026_27 */
export const TAX_FREE_THRESHOLD = 18200;

/** $1,000 standard deduction for work-related expenses (from 2026-27, replacing $300 no-receipt threshold) */
export const STANDARD_DEDUCTION_2026_27 = 1000;

/** Top marginal rate used when a TFN is NOT provided (or exemption not claimed) */
export const TFN_WITHHOLDING_RATE = 0.47;

/** Weeks in a standard working year used for weekly → annual estimates */
export const WEEKS_PER_YEAR = 52;

// ─── Tax Year 2026-27 Key Dates ────────────────────────────────────────────────

export const TAX_DEADLINES_2026_27 = {
  fyStart: '1 July 2026',
  fyEnd: '30 June 2027',
  lodgementDeadline: '31 October 2027',
  agentLodgementDeadline: '15 January 2028 (with lodgement)',
  instantAssetWriteOffThreshold: 20000, // $20,000 permanent for businesses < $10M turnover
  instantAssetWriteOffPermanentFrom: '1 July 2026',
} as const;

// ─── CGT Discount Rates ───────────────────────────────────────────────────────

/** 50% CGT discount for individuals — assets held >12 months */
export const CGT_DISCOUNT_INDIVIDUAL = 0.50;

/** 33.33% CGT discount for complying superannuation funds */
export const CGT_DISCOUNT_SUPER = 1 / 3;

/** No CGT discount for companies */
export const CGT_DISCOUNT_COMPANY = 0;

// ─── Lenders Mortgage Insurance (LMI) Estimates ───────────────────────────────
// Approximate premiums (vary by lender; use as indicative only)
export const LMI_ESTIMATES = [
  { minLvr: 0,    maxLvr: 0.80, rate: 0 },
  { minLvr: 0.80, maxLvr: 0.85, rate: 0.006 },
  { minLvr: 0.85, maxLvr: 0.90, rate: 0.013 },
  { minLvr: 0.90, maxLvr: 0.95, rate: 0.025 },
  { minLvr: 0.95, maxLvr: 1.00, rate: 0.040 },
];

// ─── APRA Serviceability Buffer ───────────────────────────────────────────────
export const APRA_SERVICEABILITY_BUFFER = 0.03; // 3% above the loan rate

// ─── Payday Super (from 1 July 2026) ───────────────────────────────────────────
/** Super must be paid with each pay run (within 7 business days of payday) from 1 July 2026 */
export const PAYDAY_SUPER_FROM = '1 July 2026';

// ─── Common Property Holding Cost Defaults ───────────────────────────────────
export const PROPERTY_HOLDING_COST_DEFAULTS = {
  councilRatesAnnual: 2000,
  waterRatesAnnual: 1200,
  insuranceAnnual: 1800,
  maintenanceRate: 0.005,     // ~0.5% of property value
  propertyManagementRate: 0.07,
  strataAnnual: 0,            // 0 for house; user sets for unit
};

// ─── Tax Year Label ───────────────────────────────────────────────────────────
export const CURRENT_TAX_YEAR = '2026-27';

// ─── Future Legislation (2027-28) ────────────────────────────────────────────────
/** $250 Working Australians Tax Offset (WATO) legislated from 2027-28 */
export const WORKING_AMERICANS_TAX_OFFSET_2027_28 = 250;
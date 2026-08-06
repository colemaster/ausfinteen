/**
 * Australian financial constants for 2026-27.
 * Sources: ATO, ASIC MoneySmart, StudyAssist.
 */

// ─── HELP / HECS Repayment Thresholds 2026-27 ────────────────────────────────

export interface HELPThreshold {
  min: number;
  max: number;
  rate: number;
}

export const HELP_REPAYMENT_THRESHOLDS_2026_27: HELPThreshold[] = [
  { min: 0,       max: 67000,   rate: 0 },
  { min: 67001,   max: 75000,   rate: 0.01 },
  { min: 75001,   max: 80000,   rate: 0.02 },
  { min: 80001,   max: 85000,   rate: 0.025 },
  { min: 85001,   max: 90000,   rate: 0.03 },
  { min: 90001,   max: 95000,   rate: 0.035 },
  { min: 95001,   max: 100000,  rate: 0.04 },
  { min: 100001,  max: 105000,  rate: 0.045 },
  { min: 105001,  max: 110000,  rate: 0.05 },
  { min: 110001,  max: 115000,  rate: 0.055 },
  { min: 115001,  max: 120000,  rate: 0.06 },
  { min: 120001,  max: 125000,  rate: 0.065 },
  { min: 125001,  max: 130000,  rate: 0.07 },
  { min: 130001,  max: 135000,  rate: 0.075 },
  { min: 135001,  max: 140000,  rate: 0.08 },
  { min: 140001,  max: 145000,  rate: 0.085 },
  { min: 145001,  max: 150000,  rate: 0.09 },
  { min: 150001,  max: 160000,  rate: 0.095 },
  { min: 160001,  max: Infinity, rate: 0.10 },
];

/** @deprecated Use HELP_REPAYMENT_THRESHOLDS_2026_27 instead */
export const HELP_REPAYMENT_THRESHOLDS_2024_25 = HELP_REPAYMENT_THRESHOLDS_2026_27;

/**
 * Calculate HELP/HECS repayment for a given repayment income.
 */
export function calcHELPRepayment(repaymentIncome: number): number {
  for (const t of HELP_REPAYMENT_THRESHOLDS_2026_27) {
    if (repaymentIncome <= t.max) {
      return repaymentIncome * t.rate;
    }
  }
  return 0;
}

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

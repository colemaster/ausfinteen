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

/** $1,000 standard deduction for work-related expenses (from 2026-27, replacing $300 no-receipt threshold; legislated via Tax Reform No.1 Act 2026 — auto-applied against labour income, first claimed in 2026-27 return) */
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
  instantAssetWriteOffThreshold: 20000, // $20,000 permanent for businesses < $10M turnover (now law via Tax Reform No.2 Act 2026, passed Aug 2026)
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
/** $250 Working Australians Tax Offset (WATO) legislated from 2027-28 (non-refundable, labour income > $18,200; first claimed in 2027-28 return) */
export const WORKING_AUSTRALIANS_TAX_OFFSET_2027_28 = 250;

/** @deprecated Typo alias — use WORKING_AUSTRALIANS_TAX_OFFSET_2027_28 instead */
export const WORKING_AMERICANS_TAX_OFFSET_2027_28 = WORKING_AUSTRALIANS_TAX_OFFSET_2027_28;

// ─── HELP Loan & Fee Caps 2026 ──────────────────────────────────────────────────
// Sources: StudyAssist 2026 booklets, Dept of Education indexed rates (1 Jan 2026)

/** HELP borrowing limit 2026: $129,883 general / $186,544 medicine-dentistry-vet-aviation */
export const HELP_LOAN_LIMIT_2026 = {
  general: 129883,
  medicineDentistryVetAviation: 186544,
} as const;

/** FEE-HELP loan fee for undergraduate non-Table B courses (25% → 20% from 1 Jan 2023; postgrad/Table B exempt) */
export const FEE_HELP_LOAN_FEE_UNDERGRAD = 0.20;

/** VET Student Loans indexed course caps 2026 (1 Jan 2026) */
export const VET_STUDENT_LOAN_CAPS_2026 = {
  band1: 6428,
  band2: 12858,
  band3: 19290,
  specificSchedule2: 96467,
} as const;

/** 2027 indexed student contribution bands (StudyAssist, published 15 July 2026) */
export const HECS_BANDS_2027 = {
  cluster1LawCommerce: 18025,
  cluster2AlliedHealthEngineeringScience: 9880,
  cluster1LowBandEducationNursing: 4908,
  cluster4MedicineDentistryVet: 14046,
} as const;

// ─── Super Co-contribution 2026-27 ──────────────────────────────────────────────
// Source: ATO key super rates (max $500 matching for eligible after-tax contributions)

/** Government co-contribution income test 2026-27 ($49,293–$64,293; was $47,488–$62,488 in 2025-26) */
export const SUPER_CO_CONTRIBUTION_2026_27 = {
  maxContribution: 500,
  lowerThreshold: 49293,
  upperThreshold: 64293,
} as const;

// ─── RBA Cash Rate (Sept 2026) ──────────────────────────────────────────────────
// Source: RBA cash rate target decisions (held 11–12 Aug 2026 meeting)

/** RBA cash rate target, 4.35% p.a. (raised Feb/Mar/May 2026 after 3.60% low in Aug 2025) */
export const RBA_CASH_RATE_SEPT_2026 = 0.0435;

// ─── National Minimum Wage (1 July 2026) ────────────────────────────────────────
// Source: FWC Annual Wage Review 2026 ([2026] FWCFB 3500, 2 June 2026)

/** NMW $26.44/hr / $1,004.90 per 38-hr week (+~6%); modern awards +4.75% (Retail/Fast Food L1 adult $27.81/hr base, $34.76/hr casual) */
export const NATIONAL_MINIMUM_WAGE_2026 = {
  hourly: 26.44,
  weekly38hr: 1004.90,
  casualLoading: 0.25,
  retailFastFoodL1Base: 27.81,
} as const;
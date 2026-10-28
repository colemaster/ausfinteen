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

/** HELP debt indexation cap under Universities Accord reform (lower of CPI and WPI; 2.8% applied 1 June 2026) */
export const HELP_INDEXATION_CAP_2026 = 0.028; // 2.8%

/** Minimum repayment income threshold for HELP/HECS in 2026-27 */
export const HELP_MINIMUM_REPAYMENT_THRESHOLD_2026_27 = 69528;

/** Marginal rate applied to repayment income in the first repayment band ($69,529 to $129,717) */
export const HELP_FIRST_MARGINAL_RATE_2026_27 = 0.15;

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

/** ATO Work from home fixed rate deduction (PCG 2023/1): 70c/hour for 2025-26 and 2026-27 */
export const WFH_FIXED_RATE_HOURLY = 0.70;

/** ATO Motor vehicle cents-per-kilometre deduction rate (max 5,000 km): 88c/km (2025-26), 91c/km (2026-27) */
export const CENTS_PER_KM_2026_27 = 0.91;

/** ATO Motor vehicle cents-per-kilometre maximum claimable distance without logbook */
export const CENTS_PER_KM_MAX_KM = 5000;

/** ATO Motor vehicle maximum cents-per-kilometre deduction for 2026-27 (5,000 km × $0.91) */
export const CENTS_PER_KM_MAX_DEDUCTION_2026_27 = 4550;

/** Small business instant asset write-off threshold ($20,000 permanent under Tax Reform No.2 Act 2026) */
export const INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27 = 20000;

/** @alias INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27 */
export const INSTANT_ASSET_WRITE_OFF_THRESHOLD = INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27;

/** Small business turnover cap for instant asset write-off eligibility (< $10M aggregated turnover) */
export const INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER = 10000000;

/** Top marginal rate used when a TFN is NOT provided (or exemption not claimed) */
export const TFN_WITHHOLDING_RATE = 0.47;

/**
 * Under-18 TFN Declaration Exemption Thresholds (ATO Form NAT 3092 Question 1).
 * Employees under 18 who earn below these pay-frequency thresholds can claim an exemption
 * from quoting a TFN, resulting in $0 PAYG withholding (ITAA 1936 s 202D).
 */
export const UNDER_18_TFN_EXEMPTION_THRESHOLDS = {
  weekly: 350,
  fortnightly: 700,
  monthly: 1517,
  annual: 18200,
} as const;

/**
 * Minor Bank Account TFN Withholding Thresholds (ITAA 1936 s 202EB).
 * Financial institutions withhold 47% No-TFN tax on interest unless:
 * - Under 16: interest < $120 (no DOB needed) or < $420 (with DOB recorded under code 333333333).
 * - Aged 16-17: interest < $120 without TFN; otherwise TFN must be quoted.
 */
export const MINOR_BANK_INTEREST_THRESHOLDS = {
  under16WithDob: 420,
  standardWithoutTFN: 120,
} as const;

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

/** HELP borrowing limit 2027: $134,558 general / $193,259 medicine-dentistry-vet-aviation (indexed per StudyAssist) */
export const HELP_LOAN_LIMIT_2027 = {
  general: 134558,
  medicineDentistryVetAviation: 193259,
} as const;

/** HELP borrowing limits by calendar year (Higher Education Support Act 2003) */
export const HELP_LOAN_LIMITS = {
  2026: HELP_LOAN_LIMIT_2026,
  2027: HELP_LOAN_LIMIT_2027,
} as const;

/** Student Services and Amenities Fee (SSAF) maximum cap: 2026 ($373) / 2027 ($386 statutory maximum per Higher Education Support Act 2003 s 19-37) */
export const SSAF_CAP_2026 = 373;
export const SSAF_CAP_2027 = 386;

/** SSAF part-time (75%) maximum cap per Higher Education Support Act 2003 s 19-37 */
export const SSAF_PART_TIME_CAP_2026 = 279.75;
export const SSAF_PART_TIME_CAP_2027 = 289.50;

/** SSAF statutory caps by calendar year */
export const SSAF_CAPS = {
  2026: SSAF_CAP_2026,
  2027: SSAF_CAP_2027,
} as const;

/** SSAF detailed statutory caps including full-time and part-time loads */
export const SSAF_DETAILED_CAPS = {
  2026: {
    fullTime: SSAF_CAP_2026,
    partTime: SSAF_PART_TIME_CAP_2026,
  },
  2027: {
    fullTime: SSAF_CAP_2027,
    partTime: SSAF_PART_TIME_CAP_2027,
  },
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

/** 2026 Commonwealth Supported Places (CSP) maximum student contribution bands (StudyAssist / Dept of Education) */
export const CSP_STUDENT_CONTRIBUTION_BANDS_2026 = {
  band1EducationNursing: 4738,
  band2AlliedHealthEngineeringScience: 9537,
  band3MedicineDentistryVet: 13558,
  band4LawCommerceEconomics: 17399,
} as const;

/** 2027 Commonwealth Supported Places (CSP) maximum student contribution bands (StudyAssist / Dept of Education, published 15 July 2026) */
export const CSP_STUDENT_CONTRIBUTION_BANDS_2027 = {
  band1EducationNursing: 4908,
  band2AlliedHealthEngineeringScience: 9880,
  band3MedicineDentistryVet: 14046,
  band4LawCommerceEconomics: 18025,
} as const;

/** Commonwealth Supported Places (CSP) maximum contribution amounts by calendar year */
export const CSP_STUDENT_CONTRIBUTION_BANDS = {
  2026: CSP_STUDENT_CONTRIBUTION_BANDS_2026,
  2027: CSP_STUDENT_CONTRIBUTION_BANDS_2027,
} as const;

/** @deprecated Use CSP_STUDENT_CONTRIBUTION_BANDS_2027 instead */
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

// ─── Youth Allowance & Student Support 2026-27 ───────────────────────────────
// Sources: Services Australia, Social Security Act 1991 (Part 3.10, s 1067G-H1 & s 1067G-J3)

/** Youth Allowance personal income free area ($539 per fortnight before payment tapers) */
export const YOUTH_ALLOWANCE_INCOME_FREE_FORTNIGHT = 539;

/**
 * Student Income Bank maximum accumulation limit:
 * Statutory baseline: $12,000 per Social Security Act 1991 s 1067G-J3.
 * Services Australia operational indexed cap: $13,500.
 */
export const STUDENT_INCOME_BANK_MAX_ACCUMULATION = 12000;

/** Services Australia current operational Income Bank maximum accumulation cap */
export const STUDENT_INCOME_BANK_OPERATIONAL_CAP = 13500;

/** Apprentice Income Bank maximum accumulation limit ($1,000) */
export const APPRENTICE_INCOME_BANK_MAX_ACCUMULATION = 1000;

/** Youth Allowance and Student Support statutory rates & thresholds for 2026-27 */
export const YOUTH_ALLOWANCE_CONSTANTS_2026_27 = {
  personalIncomeFreeAreaFortnightly: 539,
  incomeTaperUpperFortnight: 646,
  taperRateLow: 0.50,              // 50c per dollar between $539 and $646
  taperRateHigh: 0.60,             // 60c per dollar above $646
  studentIncomeBankStatutoryCap: 12000,
  studentIncomeBankMaxAccumulation: 12000,
  studentIncomeBankOperationalCap: 13500,
  apprenticeIncomeBankCap: 1000,
  studentStartUpLoanPerHalfYear: 1349,
} as const;

// ─── Macroeconomic & Investment Benchmarks ────────────────────────────────────
// Sources: Reserve Bank of Australia (RBA), ASX Long-Term Investing Report, Treasury

/** Current RBA cash rate target: 4.35% p.a. (held at Aug/Sept 2026 board meetings) */
export const RBA_CASH_RATE_TARGET = 0.0435;

/** RBA cash rate target, 4.35% p.a. (raised Feb/Mar/May 2026 after 3.60% low in Aug 2025) */
export const RBA_CASH_RATE_SEPT_2026 = 0.0435;

/** RBA monetary policy parameters and cash rate expectations */
export const RBA_MONETARY_POLICY = {
  currentCashRate: 0.0435,           // 4.35% p.a.
  neutralCashRateEstimate: 0.0350,   // ~3.50% p.a. estimated nominal neutral cash rate
  terminalRateExpectation: 0.0375,    // ~3.75% market consensus easing cycle terminal rate
  targetRangeMin: 0.020,             // 2.0% inflation target lower bound
  targetRangeMax: 0.030,             // 3.0% inflation target upper bound
  targetMidpoint: 0.025,             // 2.5% inflation target midpoint
} as const;

/** Long-term Australian consumer price inflation (CPI) target midpoint: 2.5% p.a. */
export const LONG_TERM_INFLATION_TARGET = 0.025; // 2.5% (RBA 2.0%–3.0% target band midpoint)

/** Long-term ASX real return benchmark: 7.5% p.a. (after inflation, based on ~100-yr ASX All Ords historical data) */
export const LONG_TERM_ASX_REAL_RETURN = 0.075; // 7.5% real return p.a.

/** Long-term ASX nominal return benchmark: ~10.0% p.a. (7.5% real + 2.5% inflation) */
export const LONG_TERM_ASX_NOMINAL_RETURN = 0.100; // 10.0% nominal return p.a.

export const MACRO_ECONOMIC_BENCHMARKS = {
  rbaCashRate: 0.0435,
  neutralCashRate: 0.0350,
  terminalCashRateExpectation: 0.0375,
  inflationTargetMidpoint: 0.025,
  inflationTargetRange: { min: 0.020, max: 0.030 },
  asxRealReturnBenchmark: 0.075,
  asxNominalReturnBenchmark: 0.100,
} as const;

// ─── National Minimum Wage (1 July 2026) ────────────────────────────────────────
// Source: FWC Annual Wage Review 2026 ([2026] FWCFB 3500, 2 June 2026)

/** NMW $26.44/hr / $1,004.90 per 38-hr week (+~6%); modern awards +4.75% (Retail/Fast Food L1 adult $27.81/hr base, $34.76/hr casual) */
export const NATIONAL_MINIMUM_WAGE_2026 = {
  hourly: 26.44,
  weekly38hr: 1004.90,
  casualLoading: 0.25,
  retailFastFoodL1Base: 27.81,
} as const;
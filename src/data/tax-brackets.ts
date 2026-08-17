/**
 * Australian tax brackets and Medicare levy thresholds for 2024-2027.
 * Source: ATO — ato.gov.au/rates/individual-income-tax-rates/
 * Stage 3 legislated tax rates apply from 1 July 2024 and through 2026-27.
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  baseTax?: number; // Pre-calculated tax on the lower bound for efficiency
}

export const TAX_BRACKETS_2026_27: TaxBracket[] = [
  { min: 0,      max: 18200,   rate: 0,    baseTax: 0 },
  { min: 18201,  max: 45000,   rate: 0.16, baseTax: 0 },
  { min: 45001,  max: 135000,  rate: 0.30, baseTax: 4288 },
  { min: 135001, max: 190000,  rate: 0.37, baseTax: 31288 },
  { min: 190001, max: Infinity, rate: 0.45, baseTax: 51638 },
];

/** @deprecated Use TAX_BRACKETS_2026_27 instead */
export const TAX_BRACKETS_2024_25 = TAX_BRACKETS_2026_27;

export const MEDICARE_LEVY_RATE = 0.02;

export const MEDICARE_LEVY_REDUCTION = {
  threshold: 27222,        // Below this, full exemption (FY2024-25/26/27)
  phaseOutThreshold: 34027, // Above this, full 2% applies
  shadeInRate: 0.10,       // 10% shade-in rate
  familyThreshold: 45907,
  familyChildBonus: 4216,
};

export const MEDICARE_LEVY_SURCHARGE = {
  thresholds: {
    tier1: 101000,
    tier2: 118000,
    tier3: 158000,
  },
  familyThresholds: {
    tier1: 202000,
    tier2: 236000,
    tier3: 316000,
  },
  rates: {
    tier1: 0.010,
    tier2: 0.0125,
    tier3: 0.015,
  },
};

export const LOW_INCOME_TAX_OFFSET = {
  maxOffset: 700,
  fullOffsetThreshold: 37500,
  phase1End: 45000,
  phase1Rate: 0.05,     // reduces offset by 5c per $1 over $37,500
  phase2End: 66667,
  phase2Rate: 0.015,    // reduces by 1.5c per $1 over $45,000
};

export const LOW_AND_MIDDLE_INCOME_TAX_OFFSET_ENDED = true; // LMITO ended 30 June 2022

/**
 * Calculate total income tax payable (excluding Medicare levy and LITO).
 * @param taxableIncome - Annual taxable income in AUD
 */
export function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of TAX_BRACKETS_2026_27) {
    if (taxableIncome <= bracket.max) {
      const taxableInBracket = taxableIncome - bracket.min + 1;
      const baseTax = bracket.baseTax ?? 0;
      return baseTax + taxableInBracket * bracket.rate;
    }
  }
  return 0;
}

/**
 * Calculate Low Income Tax Offset (LITO).
 */
export function calcLITO(taxableIncome: number): number {
  if (taxableIncome <= LOW_INCOME_TAX_OFFSET.fullOffsetThreshold) {
    return LOW_INCOME_TAX_OFFSET.maxOffset;
  }
  if (taxableIncome <= LOW_INCOME_TAX_OFFSET.phase1End) {
    const reduction = (taxableIncome - LOW_INCOME_TAX_OFFSET.fullOffsetThreshold) * LOW_INCOME_TAX_OFFSET.phase1Rate;
    return Math.max(0, LOW_INCOME_TAX_OFFSET.maxOffset - reduction);
  }
  if (taxableIncome <= LOW_INCOME_TAX_OFFSET.phase2End) {
    const reductionPhase1 = (LOW_INCOME_TAX_OFFSET.phase1End - LOW_INCOME_TAX_OFFSET.fullOffsetThreshold) * LOW_INCOME_TAX_OFFSET.phase1Rate;
    const reductionPhase2 = (taxableIncome - LOW_INCOME_TAX_OFFSET.phase1End) * LOW_INCOME_TAX_OFFSET.phase2Rate;
    return Math.max(0, LOW_INCOME_TAX_OFFSET.maxOffset - reductionPhase1 - reductionPhase2);
  }
  return 0;
}

/**
 * Calculate Medicare levy with shade-in threshold rules.
 */
export function calcMedicareLevy(taxableIncome: number): number {
  if (taxableIncome <= MEDICARE_LEVY_REDUCTION.threshold) return 0;
  if (taxableIncome <= MEDICARE_LEVY_REDUCTION.phaseOutThreshold) {
    // Shade-in formula: 10% of excess over threshold
    return Math.min(
      taxableIncome * MEDICARE_LEVY_RATE,
      (taxableIncome - MEDICARE_LEVY_REDUCTION.threshold) * MEDICARE_LEVY_REDUCTION.shadeInRate
    );
  }
  return taxableIncome * MEDICARE_LEVY_RATE;
}

/**
 * Calculate Medicare Levy Surcharge (MLS) for individuals without private health cover.
 */
export function calcMedicareLevySurcharge(incomeForMLS: number, hasHospitalCover: boolean): number {
  if (hasHospitalCover) return 0;
  const { thresholds, rates } = MEDICARE_LEVY_SURCHARGE;
  if (incomeForMLS > thresholds.tier3) return incomeForMLS * rates.tier3;
  if (incomeForMLS > thresholds.tier2) return incomeForMLS * rates.tier2;
  if (incomeForMLS > thresholds.tier1) return incomeForMLS * rates.tier1;
  return 0;
}

/**
 * Calculate marginal tax rate for a given income level (excluding Medicare).
 */
export function getMarginalRate(taxableIncome: number): number {
  for (const bracket of [...TAX_BRACKETS_2026_27].reverse()) {
    if (taxableIncome > bracket.min) return bracket.rate;
  }
  return 0;
}

/**
 * Calculate combined marginal tax rate including Medicare levy.
 */
export function getCombinedMarginalRate(taxableIncome: number): number {
  const baseMarginal = getMarginalRate(taxableIncome);
  if (taxableIncome > MEDICARE_LEVY_REDUCTION.phaseOutThreshold) {
    return baseMarginal + MEDICARE_LEVY_RATE;
  }
  if (taxableIncome > MEDICARE_LEVY_REDUCTION.threshold) {
    return baseMarginal + MEDICARE_LEVY_REDUCTION.shadeInRate;
  }
  return baseMarginal;
}

/**
 * Calculate net tax payable (income tax - LITO + Medicare levy).
 */
export function calcNetTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const grossTax = calcIncomeTax(taxableIncome);
  const lito = calcLITO(taxableIncome);
  const netIncomeTax = Math.max(0, grossTax - lito);
  const medicare = calcMedicareLevy(taxableIncome);
  return netIncomeTax + medicare;
}

/**
 * Calculate effective (average) tax rate including Medicare levy and LITO.
 */
export function getEffectiveRate(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const totalTax = calcNetTax(taxableIncome);
  return totalTax / taxableIncome;
}

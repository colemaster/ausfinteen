/**
 * Australian tax brackets, offset and Medicare levy thresholds for 2024-27,
 * with the legislated 2027-28 rates previewed.
 * Source: ATO — ato.gov.au/rates/individual-income-tax-rates/
 * Stage 3 legislated tax rates apply from 1 July 2024 and through 2026-27.
 * From 1 July 2026: second bracket rate reduced from 16% to 15% (TAX_BRACKETS_2026_27).
 * From 1 July 2027: second bracket rate reduced from 15% to 14% (TAX_BRACKETS_2027_28 preview; now law).
 * Medicare levy low-income thresholds increased 2.9% from 1 July 2025 (retroactive); SAPTO thresholds per ATO.
 * MLS income thresholds indexed from 1 July 2026 (single $105k/$123k/$164k).
 * $1,000 standard deduction for work-related expenses introduced from 2026-27 (replaces $300 no-receipt threshold).
 * $20,000 instant asset write-off now permanent for businesses with turnover < $10M (from 1 July 2026).
 * Payday Super: employers must pay super with each pay run from 1 July 2026 (within 7 business days).
 * Division 6AA minor (unearned income) rates: $416 nil, 66% to $1,307, 45% flat above $1,307.
 * Verified against ATO rates pages, 22 Oct 2026.
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  baseTax?: number; // Pre-calculated tax on the lower bound for efficiency
}

/** 2026-27 tax brackets (effective 1 July 2026) */
export const TAX_BRACKETS_2026_27: TaxBracket[] = [
  { min: 0,      max: 18200,   rate: 0,    baseTax: 0 },
  { min: 18201,  max: 45000,   rate: 0.15, baseTax: 0 },
  { min: 45001,  max: 135000,  rate: 0.30, baseTax: 4020 },
  { min: 135001, max: 190000,  rate: 0.37, baseTax: 31020 },
  { min: 190001, max: Infinity, rate: 0.45, baseTax: 51370 },
];

/** @deprecated Use TAX_BRACKETS_2026_27 instead */
export const TAX_BRACKETS_2024_25 = TAX_BRACKETS_2026_27;

/**
 * LEGISLATED PREVIEW — 2027-28 tax brackets (second bracket 15% → 14% from 1 July 2027;
 * Treasury Laws Amendment (More Cost of Living Relief) Act 2025). The $250 Working Australians
 * Tax Offset also starts in 2027-28 (see constants.ts). Base amounts are derived from the 14%
 * second-bracket rate and match the published 2027-28 scale.
 */
export const TAX_BRACKETS_2027_28: TaxBracket[] = [
  { min: 0,      max: 18200,   rate: 0,    baseTax: 0 },
  { min: 18201,  max: 45000,   rate: 0.14, baseTax: 0 },
  { min: 45001,  max: 135000,  rate: 0.30, baseTax: 3752 },
  { min: 135001, max: 190000,  rate: 0.37, baseTax: 30752 },
  { min: 190001, max: Infinity, rate: 0.45, baseTax: 51102 },
];

/**
 * 2026-27 foreign resident tax rates — no tax-free threshold, no Medicare levy; 30% from $1.
 * Rates unchanged from 2025-26. Source: ATO tax rates – foreign residents (updated 1 June 2026).
 */
export const FOREIGN_RESIDENT_TAX_BRACKETS_2026_27: TaxBracket[] = [
  { min: 0,      max: 135000,   rate: 0.30, baseTax: 0 },
  { min: 135001, max: 190000,   rate: 0.37, baseTax: 40500 },
  { min: 190001, max: Infinity, rate: 0.45, baseTax: 60850 },
];

/**
 * 2026-27 working holiday maker (subclass 417/462) tax rates — 15% on the first $45,000.
 * Source: ATO Schedule 15 – Tax table for working holiday makers (published 17 June 2026).
 */
export const WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27: TaxBracket[] = [
  { min: 0,      max: 45000,    rate: 0.15, baseTax: 0 },
  { min: 45001,  max: 135000,   rate: 0.30, baseTax: 6750 },
  { min: 135001, max: 190000,   rate: 0.37, baseTax: 33750 },
  { min: 190001, max: Infinity, rate: 0.45, baseTax: 54100 },
];

export const MEDICARE_LEVY_RATE = 0.02;

export const MEDICARE_LEVY_REDUCTION = {
  threshold: 28011,        // Below this, full exemption (FY2025-26/2026-27 — 2.9% indexation uplift)
  phaseOutThreshold: 35013, // Above this, full 2% applies (threshold × 1.25, 10% shade-in rate)
  shadeInRate: 0.10,       // 10% shade-in rate on excess over lower threshold
  familyThreshold: 47243,  // Family low-income threshold ($47,243 indexed / $47,238 base)
  familyChildBonus: 4339,  // Per dependent child/student uplift ($4,339 indexed / $4,338 base)
  familyPhaseOutThreshold: 59054, // Family shade-in upper threshold ($47,243 × 1.25)
  familyChildPhaseOutBonus: 5424, // Per child upper uplift ($4,339 × 1.25)
  saptoThreshold: 44268,   // Seniors and Pensioners Tax Offset (SAPTO) single threshold
  saptoPhaseOutThreshold: 55335, // SAPTO single upper shade-in ($44,268 × 1.25)
  saptoFamilyThreshold: 61623, // SAPTO family threshold
  saptoFamilyPhaseOutThreshold: 77028, // SAPTO family upper shade-in ($61,623 × 1.25)
};

export const MEDICARE_LEVY_SURCHARGE = {
  thresholds: {
    tier1: 105000,   // 2026-27 indexed (was $101,000 in 2025-26)
    tier2: 123000,   // 2026-27 indexed (was $118,000 in 2025-26)
    tier3: 164000,   // 2026-27 indexed (was $158,000 in 2025-26)
  },
  familyThresholds: {
    tier1: 210000,   // 2026-27 indexed (was $202,000 in 2025-26)
    tier2: 246000,   // 2026-27 indexed (was $236,000 in 2025-26)
    tier3: 328000,   // 2026-27 indexed (was $316,000 in 2025-26)
  },
  familyChildBonus: 1500, // +$1,500 per MLS dependent child after the first
  rates: {
    tier1: 0.010,
    tier2: 0.0125,
    tier3: 0.015,
  },
  /** Maximum allowable policy excess to maintain MLS exemption */
  maxExcess: {
    single: 750,
    family: 1500,
  },
};

/**
 * Australian Government Private Health Insurance Rebate (2026-27).
 * Income tiers align with Medicare Levy Surcharge thresholds ($105k / $210k).
 * Rebate percentages vary by income tier and age of oldest person covered.
 * Source: ATO & Department of Health and Aged Care.
 */
export const PRIVATE_HEALTH_INSURANCE_REBATE_2026_27 = {
  incomeTiers: {
    base: { singleMax: 105000, familyMax: 210000 },
    tier1: { singleMax: 123000, familyMax: 246000 },
    tier2: { singleMax: 164000, familyMax: 328000 },
    tier3: { singleMin: 164001, familyMin: 328001 },
  },
  familyChildThresholdBonus: 1500, // +$1,500 per child after the first
  /** Standard rebate percentages (indicative for 2026-27, adjusted 1 April annually) */
  rates: {
    base: { under65: 0.24608, age65to69: 0.28710, age70plus: 0.32812 },
    tier1: { under65: 0.16405, age65to69: 0.20507, age70plus: 0.24608 },
    tier2: { under65: 0.08202, age65to69: 0.12303, age70plus: 0.16405 },
    tier3: { under65: 0.0,     age65to69: 0.0,     age70plus: 0.0 },
  },
  /** Complying hospital cover criteria to avoid MLS */
  complyingCoverRules: {
    maxSingleExcess: 750,
    maxFamilyExcess: 1500,
    extrasOnlyQualifies: false,
    overseasCoverQualifies: false,
  },
} as const;

export const LOW_INCOME_TAX_OFFSET = {
  maxOffset: 700,
  fullOffsetThreshold: 37500,
  phase1End: 45000,
  phase1Rate: 0.05,     // reduces offset by 5c per $1 over $37,500
  phase2End: 66667,
  phase2Rate: 0.015,    // reduces by 1.5c per $1 over $45,000
  zeroTaxThreshold: 22866, // Effective zero-tax threshold in 2026-27 ($18,200 + $700/0.15 = $22,866)
};

export const LOW_AND_MIDDLE_INCOME_TAX_OFFSET_ENDED = true; // LMITO ended 30 June 2022

/** Statutory tax-free threshold for resident individuals ($18,200) */
export const STATUTORY_TAX_FREE_THRESHOLD = 18200;

/**
 * Effective tax-free threshold for Australian resident individuals in 2026-27 with LITO.
 * Under the 15% rate on $18,201–$45,000, max $700 LITO offsets tax on $4,666.67 above $18,200:
 * $18,200 + ($700 / 0.15) = $22,866.67. Tax on $22,866 is ($22,866 - $18,200) × 0.15 = $699.90,
 * which is 100% covered by LITO, yielding $0 net tax (and $0 Medicare levy below $28,011).
 * (Note: in 2024–26 under the 16% rate, this was $22,575: $18,200 + $700 / 0.16).
 */
export const EFFECTIVE_TAX_FREE_THRESHOLD_2026_27 = 22866;

/**
 * Effective tax-free thresholds for Australian resident individuals in 2027-28 under the 14% rate:
 * - With LITO alone: $18,200 + ($700 / 0.14) = $23,200.
 * - With LITO + legislated $250 Working Australians Tax Offset (WATO) on labour earnings:
 *   $18,200 + (($700 + $250) / 0.14) = $18,200 + $6,785.71 = $24,985.71 (~$24,985).
 */
export const EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_LITO_ONLY = 23200;
export const EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_WITH_WATO = 24985;

/**
 * Part-Year Resident Tax-Free Threshold parameters (Income Tax Rates Act 1986 s 18).
 * Applies ONLY to individuals who become or cease to be Australian tax residents mid-year.
 *
 * NOTE: Resident teens/students entering the workforce or completing studies mid-year receive
 * the FULL $18,200 threshold; the historical "stopped full-time education" pro-rating rule was
 * repealed in 2012 (Clean Energy (Tax Laws Amendments) Act 2011).
 *
 * Formula: Base $13,464 + ($4,736 × resident months / 12).
 */
export const PART_YEAR_RESIDENT_THRESHOLDS = {
  base: 13464,
  variable: 4736,
} as const;

/**
 * Calculate the part-year tax-free threshold for an individual changing Australian tax residency mid-year.
 * @param residentMonths - Number of calendar months as an Australian tax resident (1 to 12).
 *                         Any portion of a month in Australia counts as a full month.
 */
export function calcPartYearTaxFreeThreshold(residentMonths: number): number {
  const months = Math.min(12, Math.max(1, Math.round(residentMonths)));
  if (months >= 12) return STATUTORY_TAX_FREE_THRESHOLD;
  return Math.round(
    PART_YEAR_RESIDENT_THRESHOLDS.base +
      (PART_YEAR_RESIDENT_THRESHOLDS.variable * months) / 12,
  );
}

/**
 * ATO Division 6AA Minor Unearned Income Tax Rates & Thresholds (ITAA 1936 Part III Div 6AA).
 * Applies to minors (under 18) receiving eligible unearned income (dividends, trust distributions, interest).
 * - $0 – $416: Nil tax (0%)
 * - $417 – $1,307: 66% shade-in rate on amount exceeding $416
 * - Over $1,307: 45% flat on the entire unearned income (or ordinary marginal rate if higher)
 */
export const DIVISION_6AA_RATES = {
  taxFreeLimit: 416,
  threshold66: 1307,
  shadeInRate: 0.66,
  topRate: 0.45,
} as const;

/**
 * Calculate Division 6AA tax on minor unearned income.
 * @param unearnedIncome - Annual unearned income in AUD
 */
export function calcDivision6AATax(unearnedIncome: number): number {
  if (unearnedIncome <= DIVISION_6AA_RATES.taxFreeLimit) return 0;
  if (unearnedIncome <= DIVISION_6AA_RATES.threshold66) {
    return (unearnedIncome - DIVISION_6AA_RATES.taxFreeLimit) * DIVISION_6AA_RATES.shadeInRate;
  }
  return unearnedIncome * DIVISION_6AA_RATES.topRate;
}

/**
 * Calculate total tax for an under-18 minor combining earned employment wages and unearned passive income.
 * Personal exertion / employment income enjoys the $18,200 threshold and LITO (effective $22,866 threshold).
 * Passive unearned income (trust distributions, dividends, interest) is taxed under Division 6AA.
 */
export function calcMinorTotalTax(
  earnedIncome: number,
  unearnedIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): {
  earnedTax: number;
  unearnedTax: number;
  medicareLevy: number;
  totalTax: number;
  effectiveRate: number;
} {
  const safeEarned = Math.max(0, earnedIncome);
  const safeUnearned = Math.max(0, unearnedIncome);

  // Earned income receives normal tax scale with LITO
  const grossEarnedTax = calcIncomeTax(safeEarned, brackets);
  const lito = calcLITO(safeEarned);
  const earnedTax = Math.max(0, grossEarnedTax - lito);

  // Unearned income faces Division 6AA rates ($416 free, 66% to $1,307, 45% flat above)
  const unearnedTax = calcDivision6AATax(safeUnearned);

  // Medicare levy applies to combined total taxable income above low-income thresholds
  const totalIncome = safeEarned + safeUnearned;
  const medicareLevy = calcMedicareLevy(totalIncome);

  const totalTax = earnedTax + unearnedTax + medicareLevy;
  const effectiveRate = totalIncome > 0 ? totalTax / totalIncome : 0;

  return {
    earnedTax,
    unearnedTax,
    medicareLevy,
    totalTax,
    effectiveRate,
  };
}

/**
 * Calculate total income tax payable (excluding Medicare levy and LITO).
 * @param taxableIncome - Annual taxable income in AUD
 * @param brackets - Optional bracket table (defaults to TAX_BRACKETS_2026_27)
 */
export function calcIncomeTax(
  taxableIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      const lowerThreshold = bracket.min === 0 ? 0 : bracket.min - 1;
      const taxableInBracket = taxableIncome - lowerThreshold;
      const baseTax = bracket.baseTax ?? 0;
      return Math.round((baseTax + taxableInBracket * bracket.rate) * 100) / 100;
    }
  }
  return 0;
}

/**
 * Calculate Low Income Tax Offset (LITO).
 */
export function calcLITO(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
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

export interface MedicareLevyOptions {
  isSapto?: boolean;
  isFamily?: boolean;
  dependants?: number;
}

/**
 * Calculate Medicare levy with shade-in threshold rules.
 * Supports individual, SAPTO, and family thresholds.
 */
export function calcMedicareLevy(
  taxableIncome: number,
  options: MedicareLevyOptions = {},
): number {
  if (taxableIncome <= 0) return 0;

  let lowerThreshold = MEDICARE_LEVY_REDUCTION.threshold;
  let upperThreshold = MEDICARE_LEVY_REDUCTION.phaseOutThreshold;

  if (options.isSapto) {
    if (options.isFamily) {
      lowerThreshold = MEDICARE_LEVY_REDUCTION.saptoFamilyThreshold;
      upperThreshold = MEDICARE_LEVY_REDUCTION.saptoFamilyPhaseOutThreshold;
    } else {
      lowerThreshold = MEDICARE_LEVY_REDUCTION.saptoThreshold;
      upperThreshold = MEDICARE_LEVY_REDUCTION.saptoPhaseOutThreshold;
    }
  } else if (options.isFamily) {
    const bonus = (options.dependants ?? 0) * MEDICARE_LEVY_REDUCTION.familyChildBonus;
    lowerThreshold = MEDICARE_LEVY_REDUCTION.familyThreshold + bonus;
    upperThreshold = Math.round(lowerThreshold * 1.25);
  }

  if (taxableIncome <= lowerThreshold) return 0;
  if (taxableIncome <= upperThreshold) {
    // Shade-in formula: 10% of excess over threshold, capped at full 2%
    return Math.min(
      taxableIncome * MEDICARE_LEVY_RATE,
      (taxableIncome - lowerThreshold) * MEDICARE_LEVY_REDUCTION.shadeInRate,
    );
  }
  return taxableIncome * MEDICARE_LEVY_RATE;
}

export interface MedicareLevySurchargeOptions {
  isFamily?: boolean;
  /** Number of dependent children (threshold increases by $1,500 per child after the first) */
  dependants?: number;
}

/**
 * Calculate Medicare Levy Surcharge (MLS) for individuals/families without complying private health cover.
 * High earners without complying hospital cover (excess <= $750 single, <= $1,500 family) pay 1.0%–1.5%.
 * Families receive a $1,500 increase to each tier threshold for every dependent child after the first.
 */
export function calcMedicareLevySurcharge(
  incomeForMLS: number,
  hasHospitalCover: boolean,
  optionsOrIsFamily: boolean | MedicareLevySurchargeOptions = false,
): number {
  if (hasHospitalCover) return 0;
  const isFamily = typeof optionsOrIsFamily === 'boolean' ? optionsOrIsFamily : !!optionsOrIsFamily.isFamily;
  const dependants = typeof optionsOrIsFamily === 'object' ? (optionsOrIsFamily.dependants ?? 0) : 0;

  const childBonus = isFamily && dependants > 1
    ? (dependants - 1) * MEDICARE_LEVY_SURCHARGE.familyChildBonus
    : 0;

  const base = isFamily ? MEDICARE_LEVY_SURCHARGE.familyThresholds : MEDICARE_LEVY_SURCHARGE.thresholds;
  const tier1Threshold = base.tier1 + childBonus;
  const tier2Threshold = base.tier2 + childBonus;
  const tier3Threshold = base.tier3 + childBonus;

  const { rates } = MEDICARE_LEVY_SURCHARGE;
  if (incomeForMLS > tier3Threshold) return incomeForMLS * rates.tier3;
  if (incomeForMLS > tier2Threshold) return incomeForMLS * rates.tier2;
  if (incomeForMLS > tier1Threshold) return incomeForMLS * rates.tier1;
  return 0;
}

/**
 * Calculate marginal tax rate for a given income level (excluding Medicare).
 * @param taxableIncome - Annual taxable income in AUD
 * @param brackets - Optional bracket table (defaults to TAX_BRACKETS_2026_27)
 */
export function getMarginalRate(
  taxableIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1]?.rate ?? 0;
}

/**
 * Calculate combined marginal tax rate including Medicare levy.
 */
export function getCombinedMarginalRate(
  taxableIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): number {
  const baseMarginal = getMarginalRate(taxableIncome, brackets);
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
export function calcNetTax(
  taxableIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): number {
  if (taxableIncome <= 0) return 0;
  const grossTax = calcIncomeTax(taxableIncome, brackets);
  const lito = calcLITO(taxableIncome);
  const netIncomeTax = Math.max(0, grossTax - lito);
  const medicare = calcMedicareLevy(taxableIncome);
  return netIncomeTax + medicare;
}

/**
 * Calculate effective (average) tax rate including Medicare levy and LITO.
 */
export function getEffectiveRate(
  taxableIncome: number,
  brackets: TaxBracket[] = TAX_BRACKETS_2026_27,
): number {
  if (taxableIncome <= 0) return 0;
  const totalTax = calcNetTax(taxableIncome, brackets);
  return totalTax / taxableIncome;
}

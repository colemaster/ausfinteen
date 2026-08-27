/**
 * Australian superannuation rules for 2024-2027.
 * Source: ATO — ato.gov.au/individuals-and-families/super-for-individuals-and-families/
 * Note: SG rate is 12.0% statutory rate for FY 2025-26 and FY 2026-27.
 * From 1 July 2026: concessional cap $32,500, non-concessional cap $130,000,
 * bring-forward cap $390,000, transfer balance cap $2.1M.
 */

export const SUPER_RULES = {
  /** Superannuation Guarantee rate (12.0% statutory rate for FY 2025-26 & FY 2026-27) */
  sgRate: 0.12,

  /** Annual concessional (pre-tax) contribution cap ($32,500 in FY 2026-27) */
  concessionalCap: 32500,

  /** Annual non-concessional (post-tax) contribution cap ($130,000 in FY 2026-27) */
  nonConcessionalCap: 130000,

  /** Non-concessional 3-year bring-forward cap ($390,000 in FY 2026-27) */
  bringForwardCap: 390000,

  /** Tax rate on concessional contributions inside super */
  taxRateInSuper: 0.15,

  /**
   * Division 293 threshold — extra 15% tax on concessional contributions
   * if income + concessional contributions > $250,000
   */
  division293Threshold: 250000,

  /** Division 293 extra tax rate */
  division293Rate: 0.15,

  /** Preservation age for individuals born after 1 July 1964 */
  preservationAge: 60,

  /** Centrelink Age Pension Age (Statutory: 67 years) */
  agePensionAge: 67,

  /** Transfer Balance Cap indexations */
  transferBalanceCap: 1900000,       // $1.9M general TBC (indexed to $2.0M / $2.1M)
  transferBalanceCap2026: 2000000,
  transferBalanceCap2027: 2100000,

  /**
   * Unused concessional cap carry-forward:
   * - Can carry forward unused amounts from the previous 5 financial years
   * - Only available if total super balance < $500,000 at 30 June of prior year
   */
  carryForwardYears: 5,
  carryForwardBalanceThreshold: 500000,

  /** Total super balance threshold for non-concessional contributions (bring-forward) */
  totalSuperBalanceNCCThreshold: 1900000,

  /** Under-18 Super Guarantee threshold rule: >30 hours per calendar week */
  under18WeeklyHoursThreshold: 30,

  /** Super low balance fee cap (max 3% p.a. on balances under $6,000) */
  lowBalanceFeeCap: 0.03,
  lowBalanceThreshold: 6000,

  /** Minimum annual drawdown rates by age bracket (Schedule 7 SISR for Account-Based Pensions) */
  minimumDrawdown: [
    { minAge: 55, maxAge: 64, rate: 0.04 },
    { minAge: 65, maxAge: 74, rate: 0.05 },
    { minAge: 75, maxAge: 79, rate: 0.06 },
    { minAge: 80, maxAge: 84, rate: 0.07 },
    { minAge: 85, maxAge: 89, rate: 0.09 },
    { minAge: 90, maxAge: 94, rate: 0.11 },
    { minAge: 95, maxAge: Infinity, rate: 0.14 },
  ],
} as const;

/**
 * Calculate the maximum additional salary sacrifice amount available.
 * @param grossSalary - Annual gross salary
 * @param sgRate - Employer SG rate (decimal)
 * @returns Maximum additional concessional contribution
 */
export function maxAdditionalSacrifice(grossSalary: number, sgRate: number = SUPER_RULES.sgRate): number {
  const employerSG = grossSalary * sgRate;
  const remaining = SUPER_RULES.concessionalCap - employerSG;
  return Math.max(0, remaining);
}

/**
 * Check if Division 293 tax applies.
 * @param income - Taxable income
 * @param concessionalContribs - Total concessional contributions
 */
export function isDivision293(income: number, concessionalContribs: number): boolean {
  return income + concessionalContribs > SUPER_RULES.division293Threshold;
}

/**
 * Check if Division 293 tax applies and calculate the extra tax amount.
 * @param income - Taxable income + reportable fringe benefits + total net investment loss
 * @param concessionalContribs - Total concessional contributions
 */
export function calcDivision293Tax(income: number, concessionalContribs: number): { applies: boolean; taxPayable: number } {
  const total = income + concessionalContribs;
  if (total <= SUPER_RULES.division293Threshold) {
    return { applies: false, taxPayable: 0 };
  }
  const excess = total - SUPER_RULES.division293Threshold;
  const taxableContributions = Math.min(excess, concessionalContribs);
  const taxPayable = taxableContributions * SUPER_RULES.division293Rate;
  return { applies: true, taxPayable };
}

/**
 * Get statutory minimum annual drawdown rate for an account-based pension by age.
 */
export function getMinimumDrawdownRate(age: number): number {
  const tier = SUPER_RULES.minimumDrawdown.find(t => age >= t.minAge && age <= t.maxAge);
  return tier ? tier.rate : 0.04;
}
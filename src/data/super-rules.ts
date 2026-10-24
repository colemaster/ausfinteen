/**
 * Australian superannuation rules for the 2026-27 financial year.
 * Verified 18 October 2026 against the ATO "Key super rates and thresholds"
 * (ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds)
 * and Division 296 guidance, plus APRA "Protecting Your Super" material.
 *
 * 2026-27 headline figures: SG rate 12.0%, concessional cap $32,500,
 * non-concessional cap $130,000, 3-year bring-forward $390,000,
 * general transfer balance cap $2.1M (from 1 July 2026), Division 293
 * threshold $250,000 and Division 296 thresholds $3M / $10M.
 */

export const SUPER_RULES = {
  /** Superannuation Guarantee rate (12.0% statutory rate for FY 2025-26 & FY 2026-27) */
  sgRate: 0.12,

  /** Annual concessional (pre-tax) contribution cap ($32,500 in FY 2026-27) */
  concessionalCap: 32500,

  /** Annual non-concessional (post-tax) contribution cap ($130,000 in FY 2026-27) */
  nonConcessionalCap: 130000,

  /** Non-concessional 3-year bring-forward cap ($390,000 in FY 2026-27; TSB < $1.84M at 30 June 2026) */
  bringForwardCap: 390000,

  /** Non-concessional 2-year bring-forward cap ($260,000 in FY 2026-27; TSB $1.84M–<$1.97M) */
  bringForwardCap2Year: 260000,

  /** Tax rate on concessional contributions inside super */
  taxRateInSuper: 0.15,

  /**
   * Division 293 threshold — extra 15% tax on concessional contributions
   * if income + concessional contributions > $250,000
   */
  division293Threshold: 250000,

  /** Division 293 extra tax rate */
  division293Rate: 0.15,

  /**
   * Division 296 tax on large balances (from 1 July 2026).
   * Extra 15% on the share of taxable super earnings attributable to TSB > $3M,
   * plus a further 10% on the share attributable to TSB > $10M (so 25% on that slice).
   * Final legislated basis: realised earnings — an adjusted amount of fund taxable
   * income (unrealised gains are not taxed), with funds able to elect a
   * 30 June 2026 market-value CGT cost base adjustment. Thresholds are indexed
   * by CPI in $150,000 (LSBT) and $500,000 (VLSBT) increments; first assessments
   * issue in the later half of 2027-28.
   * Source: ATO Division 296 tax guidance (updated 29 June 2026 & 21 September 2026).
   */
  division296Threshold: 3000000,
  division296UpperThreshold: 10000000,
  division296Rate: 0.15,
  division296UpperAdditionalRate: 0.10,

  /** Preservation age for individuals born after 1 July 1964 */
  preservationAge: 60,

  /** Centrelink Age Pension Age (Statutory: 67 years) */
  agePensionAge: 67,

  /**
   * Transfer balance cap (general), $2.1M from 1 July 2026 (FY2026-27).
   * These fields keep the original financial-year labels for compatibility:
   * 2026 = FY2025-26 ($2.0M), 2027 = FY2026-27 ($2.1M, the current cap).
   */
  transferBalanceCap: 2100000,       // $2.1M general TBC, current from 1 July 2026
  transferBalanceCap2026: 2000000,   // FY2025-26 general TBC
  transferBalanceCap2027: 2100000,   // FY2026-27 general TBC (current)

  /** Defined benefit income cap (2026-27): $131,250 (ATO) */
  definedBenefitIncomeCap: 131250,

  /**
   * Unused concessional cap carry-forward:
   * - Can carry forward unused amounts from the previous 5 financial years
   * - Only available if total super balance < $500,000 at 30 June of prior year
   */
  carryForwardYears: 5,
  carryForwardBalanceThreshold: 500000,

  /**
   * Total super balance thresholds for the non-concessional bring-forward
   * (from 1 July 2026, based on TSB at 30 June of the previous year):
   * - TSB < $1,840,000: 3-year bring-forward, $390,000
   * - TSB $1,840,000 to < $1,970,000: 2-year bring-forward, $260,000
   * - TSB >= $1,970,000: no bring-forward, current-year cap only ($130,000)
   * The annual non-concessional cap is nil if TSB >= the general TBC ($2.1M).
   */
  totalSuperBalanceNCCThreshold: 1840000,
  totalSuperBalanceNCCUpperThreshold: 1970000,

  /** Under-18 Super Guarantee threshold rule: >30 hours per calendar week */
  under18WeeklyHoursThreshold: 30,

  /**
   * Super low balance fee cap: administration and investment fees are capped at
   * 3% p.a. for accounts with a balance below $6,000. The $6,000 figure is not
   * indexed. Source: APRA "Protecting Your Super" package guidance (apra.gov.au).
   */
  lowBalanceFeeCap: 0.03,
  lowBalanceThreshold: 6000,

  /**
   * Minimum annual drawdown rates by age bracket (Schedule 7 SISR, account-based
   * pensions; the ATO states the first bracket as "under 65"). The 50% COVID-era
   * reduction ended in 2022-23 — normal rates apply from 2023-24 onwards.
   */
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

/**
 * Estimate Division 296 tax on large super balances (from 1 July 2026).
 * Simplified model: applies the 15% rate to the share of realised earnings
 * attributable to the balance above $3M, plus a further 10% on the share above
 * $10M. In 2026-27 the test uses the TSB at the end of the income year only
 * (transitional rule); later years also test the TSB before the year starts.
 * @param totalSuperBalance - TSB at the end of the income year (assessable year end)
 * @param superEarnings - Division 296 fund earnings for the year (realised/fund taxable income basis)
 */
export function calcDivision296Tax(totalSuperBalance: number, superEarnings: number): { applies: boolean; taxPayable: number } {
  if (totalSuperBalance <= SUPER_RULES.division296Threshold || superEarnings <= 0) {
    return { applies: false, taxPayable: 0 };
  }
  const pctAbove3M = (totalSuperBalance - SUPER_RULES.division296Threshold) / totalSuperBalance;
  let taxPayable = superEarnings * pctAbove3M * SUPER_RULES.division296Rate;
  if (totalSuperBalance > SUPER_RULES.division296UpperThreshold) {
    const pctAbove10M = (totalSuperBalance - SUPER_RULES.division296UpperThreshold) / totalSuperBalance;
    taxPayable += superEarnings * pctAbove10M * SUPER_RULES.division296UpperAdditionalRate;
  }
  return { applies: true, taxPayable };
}
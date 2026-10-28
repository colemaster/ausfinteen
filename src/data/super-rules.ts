/**
 * Australian superannuation rules for the 2026-27 and 2027-28 financial years.
 * Verified October 2026 against official ATO "Key super rates and thresholds"
 * (ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds),
 * Treasury Division 296 guidance, APRA "Protecting Your Super" regulations,
 * and the Payday Super legislation (effective 1 July 2026).
 *
 * 2026-27 headline figures:
 * - SG rate: 12.0% statutory rate (FY 2025-26, FY 2026-27 & FY 2027-28)
 * - Concessional cap: $32,500 (indexed)
 * - Non-concessional cap: $130,000 (4x concessional cap)
 * - 3-year bring-forward: up to $390,000 (TSB < $1.84M)
 * - General Transfer Balance Cap (TBC): $2.1M (indexed from 1 July 2026)
 * - Division 293 threshold: $250,000 (15% additional tax)
 * - Division 296 tax: $3M threshold (15% rate) & $10M tier (+10% rate)
 * - Government Co-contribution: $500 max, lower threshold $49,293 (~$45,400 base), upper $64,293 (~$60,400 base)
 * - Low Income Super Tax Offset (LISTO): 15% refund up to $500 for incomes up to $37,000 (expanding to $45k / $810 in 2027-28)
 * - First Home Super Saver Scheme (FHSSS): $15,000 max/yr, $50,000 lifetime limit
 * - Payday Super: legislated 1 July 2026 start date (7 business days payment window)
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
   * - TSB >= $1,970,000 to < $2,100,000: no bring-forward, current-year cap only ($130,000)
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
   * Inactive Low-Balance Accounts (ILBA): Accounts with a balance under $6,000
   * that have not received a contribution or rollover for 16 months and have no
   * insurance are transferred to the ATO, where they are fee-free and CPI-indexed.
   */
  inactiveLowBalanceThreshold: 6000,
  inactiveLowBalanceMonths: 16,

  /**
   * Putting Members' Interests First (PMIF) Act 2019: Default insurance (Life/TPD)
   * cannot be provided automatically to members under age 25 or with balances under
   * $6,000; insurance is strictly opt-in for these members.
   */
  pmifUnder25InsuranceExemptionAge: 25,

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

  /**
   * Government Super Co-contribution (for low-to-middle income earners):
   * Matches 50% of eligible personal non-concessional contributions up to $500.
   * - Maximum payment: $500
   * - 2026-27 indexed lower income threshold: $49,293 (statutory base ~$45,400)
   * - 2026-27 indexed upper income threshold: $64,293 (statutory base ~$60,400)
   * - Phase-out rate: 3.333 cents per dollar (0.03333...) above lower threshold
   * - Minimum payment: $20 if entitled
   */
  coContributionMax: 500,
  coContributionMatchRate: 0.50,
  coContributionLowerThreshold: 49293,
  coContributionUpperThreshold: 64293,
  coContributionBaseLowerThreshold: 45400,
  coContributionBaseUpperThreshold: 60400,
  coContributionMinPayment: 20,
  coContributionReductionRate: 0.03333333333333333,

  coContribution: {
    maxContribution: 500,
    matchRate: 0.50,
    lowerIncomeThreshold: 49293,
    upperIncomeThreshold: 64293,
    baseLowerIncomeThreshold: 45400,
    baseUpperIncomeThreshold: 60400,
    reductionRate: 0.03333333333333333,
    minPayment: 20,
  },

  /**
   * Low Income Super Tax Offset (LISTO):
   * 15% refund of concessional contributions for adjusted taxable income up to $37,000.
   * - Maximum payment: $500
   * - Income threshold: $37,000
   * - Refund rate: 15%
   * - Minimum payment: $10 if entitled
   * (Legislated to increase to $45,000 income threshold and $810 max from 1 July 2027).
   */
  listoIncomeThreshold: 37000,
  listoMaxAmount: 500,
  listoRate: 0.15,
  listoMinPayment: 10,
  listoFutureIncomeThreshold2027: 45000,
  listoFutureMaxAmount2027: 810,

  listo: {
    incomeThreshold: 37000,
    maxAmount: 500,
    rate: 0.15,
    minPayment: 10,
    futureThreshold2027: 45000,
    futureMaxAmount2027: 810,
  },

  /**
   * First Home Super Saver Scheme (FHSSS):
   * Maximum voluntary contributions eligible for release:
   * - Annual limit: $15,000 per financial year
   * - Lifetime limit: $50,000 across all years
   */
  fhsssAnnualCap: 15000,
  fhsssLifetimeCap: 50000,

  fhsss: {
    annualLimit: 15000,
    lifetimeLimit: 50000,
  },

  /**
   * Payday Super:
   * Commenced 1 July 2026 under the Treasury Laws Amendment (Payday Superannuation) Act 2025.
   * Super Guarantee contributions must be paid on each payday and received by the fund
   * within 7 business days of payday (20 business days for brand-new funds / employees).
   * Super funds must allocate contributions to the member account within 3 business days.
   * Statutory baseline for calculations shifted from OTE to Qualifying Earnings (QE).
   */
  paydaySuperStartDate: '2026-07-01',
  paydaySuperDueBusinessDays: 7,
  paydaySuperNewFundDueBusinessDays: 20,
  paydaySuperFundAllocationDays: 3,
  paydaySuperBaseEarnings: 'Qualifying Earnings (QE)',

  paydaySuper: {
    startDate: '2026-07-01',
    label: '1 July 2026',
    paymentDueBusinessDays: 7,
    newFundDueBusinessDays: 20,
    fundAllocationDays: 3,
    baseEarnings: 'Qualifying Earnings (QE)',
  },
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

/**
 * Calculate the available non-concessional contribution cap and bring-forward period
 * based on Total Super Balance (TSB) at 30 June of the prior financial year.
 * @param totalSuperBalance - Total Super Balance at 30 June of prior year
 */
export function getNonConcessionalCap(totalSuperBalance: number): {
  cap: number;
  bringForwardYears: number;
  eligible: boolean;
} {
  if (totalSuperBalance >= SUPER_RULES.transferBalanceCap) {
    return { cap: 0, bringForwardYears: 0, eligible: false };
  }
  if (totalSuperBalance >= SUPER_RULES.totalSuperBalanceNCCUpperThreshold) {
    return { cap: SUPER_RULES.nonConcessionalCap, bringForwardYears: 1, eligible: true };
  }
  if (totalSuperBalance >= SUPER_RULES.totalSuperBalanceNCCThreshold) {
    return { cap: SUPER_RULES.bringForwardCap2Year, bringForwardYears: 2, eligible: true };
  }
  return { cap: SUPER_RULES.bringForwardCap, bringForwardYears: 3, eligible: true };
}

/**
 * Calculate the Australian Government super co-contribution.
 * Matches 50% of personal non-concessional contributions up to $500, phasing out
 * between lower and upper income thresholds.
 * @param income - Assessable income + reportable fringe benefits + reportable employer super
 * @param personalNonConcessional - Eligible after-tax personal contributions made
 * @param useBaseThresholds - Optional flag to use unindexed baseline thresholds (~$45.4k/~$60.4k) instead of 2026-27 indexed thresholds ($49,293/$64,293)
 */
export function calcCoContribution(
  income: number,
  personalNonConcessional: number,
  useBaseThresholds: boolean = false,
): { eligible: boolean; entitlement: number } {
  if (personalNonConcessional <= 0) {
    return { eligible: false, entitlement: 0 };
  }
  const lower = useBaseThresholds
    ? SUPER_RULES.coContributionBaseLowerThreshold
    : SUPER_RULES.coContributionLowerThreshold;
  const upper = useBaseThresholds
    ? SUPER_RULES.coContributionBaseUpperThreshold
    : SUPER_RULES.coContributionUpperThreshold;

  if (income >= upper) {
    return { eligible: false, entitlement: 0 };
  }

  const maxMatch = Math.min(
    SUPER_RULES.coContributionMax,
    personalNonConcessional * SUPER_RULES.coContributionMatchRate,
  );

  let entitlement = maxMatch;
  if (income > lower) {
    const reduction = (income - lower) * SUPER_RULES.coContributionReductionRate;
    entitlement = Math.max(0, maxMatch - reduction);
  }

  if (entitlement <= 0) {
    return { eligible: false, entitlement: 0 };
  }

  // ATO rule: minimum payment is $20 if entitled
  if (entitlement < SUPER_RULES.coContributionMinPayment) {
    entitlement = SUPER_RULES.coContributionMinPayment;
  }

  return { eligible: true, entitlement: Math.round(entitlement * 100) / 100 };
}

/**
 * Calculate the Low Income Super Tax Offset (LISTO).
 * 15% refund of concessional contributions up to $500 for adjusted taxable income <= $37,000.
 * @param adjustedTaxableIncome - Taxable income + reportable fringe benefits + reportable super + total net investment loss
 * @param concessionalContributions - Total eligible concessional contributions (employer SG + salary sacrifice)
 */
export function calcListo(
  adjustedTaxableIncome: number,
  concessionalContributions: number,
): { eligible: boolean; entitlement: number } {
  if (adjustedTaxableIncome > SUPER_RULES.listoIncomeThreshold || concessionalContributions <= 0) {
    return { eligible: false, entitlement: 0 };
  }
  const calculated = concessionalContributions * SUPER_RULES.listoRate;
  let entitlement = Math.min(SUPER_RULES.listoMaxAmount, calculated);
  // ATO rule: minimum payment is $10 if entitled
  if (entitlement > 0 && entitlement < SUPER_RULES.listoMinPayment) {
    entitlement = SUPER_RULES.listoMinPayment;
  }
  return { eligible: true, entitlement: Math.round(entitlement * 100) / 100 };
}

/**
 * Check if an employee is legally entitled to Superannuation Guarantee under SGAA 1992 s 27(1)(a).
 * - Employees aged 18+ qualify on all eligible earnings (no hours threshold).
 * - Employees under 18 must work MORE than 30 hours in a single calendar week for that employer.
 * @param age - Employee's current age
 * @param weeklyHours - Hours worked in the specific calendar week (cannot be averaged across fortnights)
 */
export function isUnder18SuperEligible(age: number, weeklyHours: number): boolean {
  if (age >= 18) return true;
  return weeklyHours > SUPER_RULES.under18WeeklyHoursThreshold;
}

/**
 * Calculate the capped fee on a low super balance (<$6,000) under the Protecting Your Super package.
 * Administration and investment fees are capped at 3% p.a. Any excess charged during the financial
 * year must be refunded by the fund within 3 months of 30 June.
 * @param balance - Account balance at 30 June
 * @param proposedAnnualFee - Total annual administration and investment fees before capping
 */
export function calcLowBalanceCappedFee(
  balance: number,
  proposedAnnualFee: number
): { cappedFee: number; feeRebate: number; isCapped: boolean } {
  if (balance <= 0) {
    return { cappedFee: 0, feeRebate: 0, isCapped: false };
  }
  if (balance < SUPER_RULES.lowBalanceThreshold) {
    const maxFee = balance * SUPER_RULES.lowBalanceFeeCap;
    if (proposedAnnualFee > maxFee) {
      return {
        cappedFee: Math.round(maxFee * 100) / 100,
        feeRebate: Math.round((proposedAnnualFee - maxFee) * 100) / 100,
        isCapped: true,
      };
    }
  }
  return { cappedFee: proposedAnnualFee, feeRebate: 0, isCapped: false };
}

/**
 * Project superannuation compound growth over a given number of years.
 * Models regular weekly contributions plus initial balance with weekly compounding.
 * @param initialBalance - Starting super balance (AUD)
 * @param weeklyContribution - Employer + personal contribution per week (AUD)
 * @param annualReturnRate - Net annual return rate (decimal, e.g. 0.085 for 8.5% p.a.)
 * @param years - Investment runway in years (e.g. 42 years from age 18 to 60)
 */
export function calcSuperCompoundingProjection(
  initialBalance: number,
  weeklyContribution: number,
  annualReturnRate: number,
  years: number
): { futureValue: number; totalContributions: number; totalInterest: number } {
  const safeYears = Math.max(0, years);
  const safeInitial = Math.max(0, initialBalance);
  const safeContrib = Math.max(0, weeklyContribution);
  const rWeekly = annualReturnRate / 52;
  const nWeeks = safeYears * 52;

  // FV of lump sum
  const fvLumpSum = safeInitial * Math.pow(1 + annualReturnRate, safeYears);

  // FV of weekly annuity
  let fvAnnuity = 0;
  if (rWeekly > 0 && nWeeks > 0) {
    fvAnnuity = safeContrib * ((Math.pow(1 + rWeekly, nWeeks) - 1) / rWeekly);
  } else {
    fvAnnuity = safeContrib * nWeeks;
  }

  const futureValue = Math.round(fvLumpSum + fvAnnuity);
  const totalContributions = Math.round(safeInitial + safeContrib * nWeeks);
  const totalInterest = Math.max(0, futureValue - totalContributions);

  return { futureValue, totalContributions, totalInterest };
}

/**
 * Check if an individual meets the Total Super Balance test for carry-forward unused concessional cap amounts.
 * Under ITAA 1997 s 291-142, carry-forward is accessible only if Total Super Balance (TSB)
 * at 30 June of the previous financial year is strictly under $500,000.
 * @param priorYearEndBalance - Total Super Balance at 30 June of the prior financial year
 */
export function isCarryForwardEligible(priorYearEndBalance: number): boolean {
  return priorYearEndBalance < SUPER_RULES.carryForwardBalanceThreshold;
}

/**
 * Calculate the maximum releasable voluntary contributions under the First Home Super Saver Scheme (FHSSS)
 * pursuant to ITAA 1997 Division 131.
 * - 100% of eligible personal non-concessional (after-tax) contributions
 * - 85% of eligible voluntary concessional (pre-tax / salary sacrifice) contributions (15% tax retained)
 * - Annual cap: $15,000 per financial year
 * - Lifetime cap: $50,000 total across all years
 * @param voluntaryConcessional - Eligible pre-tax voluntary contributions (capped at $15k/yr)
 * @param voluntaryNonConcessional - Eligible post-tax voluntary contributions (capped at $15k/yr)
 */
export function calcFhsssMaxRelease(
  voluntaryConcessional: number,
  voluntaryNonConcessional: number
): {
  concessionalReleasable: number;
  nonConcessionalReleasable: number;
  totalReleasableContributions: number;
  isCappedByLifetimeLimit: boolean;
} {
  const safeConc = Math.max(0, voluntaryConcessional);
  const safeNonConc = Math.max(0, voluntaryNonConcessional);
  const totalNominal = safeConc + safeNonConc;

  let effectiveConc = safeConc;
  let effectiveNonConc = safeNonConc;
  let isCapped = false;

  if (totalNominal > SUPER_RULES.fhsssLifetimeCap) {
    isCapped = true;
    const ratio = SUPER_RULES.fhsssLifetimeCap / totalNominal;
    effectiveConc = safeConc * ratio;
    effectiveNonConc = safeNonConc * ratio;
  }

  const concessionalReleasable = Math.round(effectiveConc * 0.85 * 100) / 100;
  const nonConcessionalReleasable = Math.round(effectiveNonConc * 100) / 100;
  const totalReleasableContributions = Math.round((concessionalReleasable + nonConcessionalReleasable) * 100) / 100;

  return {
    concessionalReleasable,
    nonConcessionalReleasable,
    totalReleasableContributions,
    isCappedByLifetimeLimit: isCapped,
  };
}

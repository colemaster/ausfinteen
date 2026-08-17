/**
 * Tax Savings Guide — Financial Engine
 * Covers: Super Salary Sacrifice, DR Tax Benefit, Negative Gearing, Tax Breakdown.
 * Pure functions, no React, no side effects.
 * Based on 2026-27 ATO rates.
 */

import { SUPER_RULES, isDivision293 } from '../../data/super-rules';
import {
  calcIncomeTax,
  calcMedicareLevy,
  getMarginalRate,
  TAX_BRACKETS_2026_27,
  getCombinedMarginalRate,
} from '../../data/tax-brackets';
import { calcHELPRepayment, calcHELPRate } from '../../data/constants';
import { projectGrowth } from '../../utils/financial';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuperSacrificeParams {
  grossSalary: number;
  currentSuperBalance: number;
  sgRate: number;          // decimal, e.g. 0.12
  additionalSacrifice: number;
  unusedCarryForward: number;
  age: number;
  retirementAge: number;
  superReturn: number;     // percentage, e.g. 7
  includeHELP?: boolean;   // include HELP/HECS repayment in take-home comparison
  helpDebt?: number;       // outstanding HELP debt (>0 enables HELP repayment)
}

export interface SuperSacrificeResult {
  employerSG: number;
  maxAdditionalAvailable: number;
  actualSacrifice: number;
  taxInSuper: number;
  taxSaving: number;
  isDiv293: boolean;
  div293Tax: number;
  projectedSuperAtRetirement: number;
  yearsToRetirement: number;
  incomeTaxWithSacrifice: number;
  incomeTaxWithoutSacrifice: number;
  helpWithSacrifice: number;
  helpWithoutSacrifice: number;
}

export interface NegGearingParams {
  propertyValue: number;
  rentalIncomeWeekly: number;
  mortgageRate: number;    // percentage
  lvr: number;             // percentage, e.g. 80
  councilRates: number;    // annual
  insurance: number;       // annual
  pmFeeRate: number;       // decimal, e.g. 0.07
  maintenance: number;     // annual
  depreciation: number;    // annual
  margTax: number;         // decimal
}

export interface NegGearingResult {
  rentalIncomeAnnual: number;
  mortgageInterest: number;
  totalExpenses: number;
  taxableLoss: number;
  taxRefund: number;
  netCashPosition: number;
  isPositivelyGeared: boolean;
}

export interface TaxBreakdown {
  taxableIncome: number;
  incomeTax: number;
  medicareLevy: number;
  helpRepayment: number;
  total: number;
  afterTaxIncome: number;
  effectiveRate: number;
  marginalRate: number;
}

// ─── Super Salary Sacrifice ────────────────────────────────────────────────────

/**
 * Calculate tax savings and projected balance from additional salary sacrifice.
 *
 * @param params - SuperSacrificeParams
 * @returns SuperSacrificeResult
 *
 * Key rules:
 * - Concessional cap = $30,000 (2024-25); includes employer SG
 * - Carry-forward allows using unused cap from prior 5 years (only if total super < $500k)
 * - Division 293: extra 15% on concessional contributions if income + contribs > $250k
 */
export function calculateSuperSacrifice(
  params: SuperSacrificeParams,
): SuperSacrificeResult {
  const {
    grossSalary,
    currentSuperBalance,
    sgRate,
    additionalSacrifice,
    unusedCarryForward,
    age,
    retirementAge,
    superReturn,
  } = params;

  const employerSG = grossSalary * sgRate;

  // Effective concessional cap (base + carry-forward if eligible)
  const canUseCarryForward =
    currentSuperBalance < SUPER_RULES.carryForwardBalanceThreshold;
  const effectiveCap =
    SUPER_RULES.concessionalCap +
    (canUseCarryForward ? Math.min(unusedCarryForward, 150000) : 0);
  const maxAdditional = Math.max(0, effectiveCap - employerSG);
  const actualSacrifice = Math.min(additionalSacrifice, maxAdditional);

  // Tax in super on concessional contributions (15% standard)
  const taxInSuper = actualSacrifice * SUPER_RULES.taxRateInSuper;

  // Division 293 check
  const taxableIncome = grossSalary - actualSacrifice;
  const div293Applies = isDivision293(taxableIncome, employerSG + actualSacrifice);
  const div293Tax = div293Applies ? actualSacrifice * SUPER_RULES.division293Rate : 0;

  // Tax saving = marginal rate on sacrifice minus 15% super tax
  const marginalRate = getMarginalRate(grossSalary);
  const taxSaving = Math.max(
    0,
    actualSacrifice * marginalRate - taxInSuper - div293Tax,
  );

  // Income tax comparison
  const includeHELP = params.includeHELP === true && (params.helpDebt ?? 0) > 0;
  const incomeTaxWithSacrifice =
    calcIncomeTax(taxableIncome) + calcMedicareLevy(taxableIncome);
  const incomeTaxWithoutSacrifice =
    calcIncomeTax(grossSalary) + calcMedicareLevy(grossSalary);
  const helpWithSacrifice = includeHELP ? calcHELPRepayment(taxableIncome) : 0;
  const helpWithoutSacrifice = includeHELP ? calcHELPRepayment(grossSalary) : 0;

  // Projected super balance at retirement
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const annualContribs = employerSG + actualSacrifice - taxInSuper - div293Tax;
  const projArray = projectGrowth(
    currentSuperBalance,
    annualContribs,
    superReturn,
    yearsToRetirement,
  );
  const projectedSuperAtRetirement =
    projArray[projArray.length - 1] ?? currentSuperBalance;

  return {
    employerSG: Math.round(employerSG),
    maxAdditionalAvailable: Math.round(maxAdditional),
    actualSacrifice: Math.round(actualSacrifice),
    taxInSuper: Math.round(taxInSuper),
    taxSaving: Math.round(taxSaving),
    isDiv293: div293Applies,
    div293Tax: Math.round(div293Tax),
    projectedSuperAtRetirement: Math.round(projectedSuperAtRetirement),
    yearsToRetirement,
    incomeTaxWithSacrifice: Math.round(incomeTaxWithSacrifice),
    incomeTaxWithoutSacrifice: Math.round(incomeTaxWithoutSacrifice),
    helpWithSacrifice: Math.round(helpWithSacrifice),
    helpWithoutSacrifice: Math.round(helpWithoutSacrifice),
  };
}

// ─── Negative Gearing ─────────────────────────────────────────────────────────

/**
 * Calculate cash position for a negatively geared investment property.
 */
export function calculateNegativeGearing(
  params: NegGearingParams,
): NegGearingResult {
  const {
    propertyValue,
    rentalIncomeWeekly,
    mortgageRate,
    lvr,
    councilRates,
    insurance,
    pmFeeRate,
    maintenance,
    depreciation,
    margTax,
  } = params;

  const rentalIncomeAnnual = rentalIncomeWeekly * 52;
  const loanAmount = propertyValue * (lvr / 100);
  const mortgageInterest = loanAmount * (mortgageRate / 100);
  const pmFees = rentalIncomeAnnual * pmFeeRate;
  const totalExpenses =
    mortgageInterest + councilRates + insurance + pmFees + maintenance + depreciation;

  const taxableLoss = rentalIncomeAnnual - totalExpenses; // negative = loss
  const taxRefund =
    taxableLoss < 0 ? Math.abs(taxableLoss) * margTax : 0;
  const netCashPosition =
    rentalIncomeAnnual - mortgageInterest - councilRates - insurance - pmFees - maintenance + taxRefund;

  return {
    rentalIncomeAnnual: Math.round(rentalIncomeAnnual),
    mortgageInterest: Math.round(mortgageInterest),
    totalExpenses: Math.round(totalExpenses),
    taxableLoss: Math.round(taxableLoss),
    taxRefund: Math.round(taxRefund),
    netCashPosition: Math.round(netCashPosition),
    isPositivelyGeared: taxableLoss >= 0,
  };
}

// ─── Tax Breakdown ─────────────────────────────────────────────────────────────

/**
 * Calculate full tax breakdown for a taxable income.
 *
 * @param taxableIncome - Annual taxable income in AUD
 * @param includeHELP - Whether to include HELP/HECS repayment
 */
export function calculateTaxBreakdown(
  taxableIncome: number,
  includeHELP: boolean,
): TaxBreakdown {
  const incomeTax = calcIncomeTax(taxableIncome);
  const medicareLevy = calcMedicareLevy(taxableIncome);
  const helpRepayment = includeHELP ? calcHELPRepayment(taxableIncome) : 0;
  const total = incomeTax + medicareLevy + helpRepayment;
  const afterTaxIncome = taxableIncome - total;
  const effectiveRate = taxableIncome > 0 ? total / taxableIncome : 0;
  const marginalRate = getMarginalRate(taxableIncome);

  return {
    taxableIncome,
    incomeTax: Math.round(incomeTax),
    medicareLevy: Math.round(medicareLevy),
    helpRepayment: Math.round(helpRepayment),
    total: Math.round(total),
    afterTaxIncome: Math.round(afterTaxIncome),
    effectiveRate,
    marginalRate,
  };
}

// ─── HELP-Aware Tax ──────────────────────────────────────────────────────────

export interface TaxWithHELPResult {
  taxableIncome: number;
  helpDebt: number;
  incomeTax: number;
  medicareLevy: number;
  helpRepayment: number;
  helpRate: number;
  total: number;
  afterTaxIncome: number;
  effectiveRate: number;
  marginalRate: number;
  marginalRateWithHELP: number;
}

/**
 * Full tax picture for an individual with a HELP/HECS debt:
 * income tax + Medicare levy 2% + HELP repayment (0%–10% by income, 2026-27).
 *
 * @param taxableIncome - Annual taxable income in AUD
 * @param helpDebt - Outstanding HELP/HECS balance; 0 = no HELP debt
 * @returns TaxWithHELPResult — total tax and after-tax income
 *
 * Assumptions:
 * - HELP repayment rate applies to the full repayment income (ATO schedule)
 * - Medicare levy uses ATO low-income shade-in rules
 * - Marginal rate with HELP adds the marginal HELP rate on top of the
 *   combined marginal rate (income tax + medicare)
 */
export function taxWithHELP(taxableIncome: number, helpDebt: number): TaxWithHELPResult {
  const incomeTax = calcIncomeTax(taxableIncome);
  const medicareLevy = calcMedicareLevy(taxableIncome);
  const hasHELP = helpDebt > 0;
  const helpRate = hasHELP ? calcHELPRate(taxableIncome) : 0;
  const helpRepayment = hasHELP ? calcHELPRepayment(taxableIncome) : 0;
  const total = incomeTax + medicareLevy + helpRepayment;
  const afterTaxIncome = taxableIncome - total;
  const effectiveRate = taxableIncome > 0 ? total / taxableIncome : 0;
  const marginalRate = getCombinedMarginalRate(taxableIncome);
  const marginalRateWithHELP = marginalRate + helpRate;

  return {
    taxableIncome,
    helpDebt,
    incomeTax: Math.round(incomeTax),
    medicareLevy: Math.round(medicareLevy),
    helpRepayment: Math.round(helpRepayment),
    helpRate,
    total: Math.round(total),
    afterTaxIncome: Math.round(afterTaxIncome),
    effectiveRate,
    marginalRate,
    marginalRateWithHELP,
  };
}

// ─── Division 293 Exposure ────────────────────────────────────────────────────

export interface Div293ExposureResult {
  applies: boolean;
  threshold: number;
  income: number;
  concessionalContribs: number;
  totalIncome: number;
  excess: number;
  taxableContributions: number;
  extraTax: number;
  message: string;
}

/**
 * Division 293 exposure: extra 15% tax on concessional super contributions
 * when income + concessional contributions exceed the $250,000 threshold.
 *
 * @param income - Taxable income (plus reportable fringe benefits / net investment loss)
 * @param concessionalContribs - Total concessional contributions (employer SG + sacrifices)
 * @param threshold - Division 293 threshold, default $250,000
 * @returns Div293ExposureResult including the extra tax payable and a plain-English message
 *
 * Assumptions:
 * - Extra 15% applies to the lesser of (excess over threshold) and concessional contributions
 * - Based on 2026-27 ATO Division 293 rules (ITAA 1997 Div 293)
 */
export function div293Exposure(
  income: number,
  concessionalContribs: number,
  threshold: number = SUPER_RULES.division293Threshold,
): Div293ExposureResult {
  const totalIncome = income + concessionalContribs;
  const applies = totalIncome > threshold;
  const excess = applies ? totalIncome - threshold : 0;
  const taxableContributions = applies ? Math.min(excess, concessionalContribs) : 0;
  const extraTax = taxableContributions * SUPER_RULES.division293Rate;

  const message = applies
    ? `Income + super contributions of ${formatAud(totalIncome)} exceed the $250,000 Division 293 threshold. ` +
      `An extra 15% (${formatAud(extraTax)}) applies on ${formatAud(taxableContributions)} of your concessional contributions.`
    : `Income + super contributions of ${formatAud(totalIncome)} are below the $250,000 Division 293 threshold — no extra tax applies.`;

  return {
    applies,
    threshold,
    income,
    concessionalContribs,
    totalIncome,
    excess,
    taxableContributions,
    extraTax,
    message,
  };
}

function formatAud(value: number): string {
  return `$${Math.round(value).toLocaleString('en-AU')}`;
}

// ─── Marginal Rate Breakdown ──────────────────────────────────────────────────

export interface MarginalBracketRow {
  key: string;
  label: string;
  min: number;
  max: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
  kind: 'bracket' | 'medicare' | 'help' | 'total';
}

/**
 * Marginal-rate breakdown table for a taxable income.
 * Shows tax payable in each income-tax bracket plus Medicare levy and
 * (optionally) HELP/HECS repayment rows.
 *
 * @param income - Annual taxable income in AUD
 * @param includeHELP - Whether to append the HELP repayment row
 * @returns Array of rows (brackets + medicare + optional HELP + grand total)
 *
 * Assumptions:
 * - Per-bracket tax uses the 2026-27 Stage 3 rates (0/16/30/37/45%)
 * - Medicare levy uses ATO low-income shade-in rules (0% → 2%)
 * - HELP repayment uses 2026-27 ATO thresholds (0%–10%)
 */
export function marginalRateBrackets(income: number, includeHELP: boolean): MarginalBracketRow[] {
  const rows: MarginalBracketRow[] = [];
  let cumulative = 0;

  for (const b of TAX_BRACKETS_2026_27) {
    if (income <= b.min) break;
    const upper = Math.min(income, b.max);
    const taxableAmount = upper - b.min + 1;
    const tax = taxableAmount * b.rate;
    cumulative += tax;
    rows.push({
      key: `bracket-${b.min}`,
      label:
        b.min === 0
          ? '$0 – $18.2k'
          : b.max === Infinity
            ? `$${(b.min / 1000).toFixed(0)}k+`
            : `$${(b.min / 1000).toFixed(0)}k – $${(b.max / 1000).toFixed(0)}k`,
      min: b.min,
      max: b.max === Infinity ? null : b.max,
      rate: b.rate,
      taxableAmount,
      tax,
      kind: 'bracket',
    });
    if (income <= b.max) break;
  }

  const medicare = calcMedicareLevy(income);
  cumulative += medicare;
  rows.push({
    key: 'medicare',
    label: 'Medicare Levy',
    min: 0,
    max: null,
    rate: 0.02,
    taxableAmount: income,
    tax: medicare,
    kind: 'medicare',
  });

  if (includeHELP) {
    const help = calcHELPRepayment(income);
    const helpRate = calcHELPRate(income);
    cumulative += help;
    rows.push({
      key: 'help',
      label: 'HELP/HECS Repayment',
      min: 0,
      max: null,
      rate: helpRate,
      taxableAmount: income,
      tax: help,
      kind: 'help',
    });
  }

  rows.push({
    key: 'total',
    label: 'Total Tax + Levies',
    min: 0,
    max: null,
    rate: income > 0 ? cumulative / income : 0,
    taxableAmount: income,
    tax: cumulative,
    kind: 'total',
  });

  return rows;
}

// ─── DR Tax Benefit ────────────────────────────────────────────────────────────

export interface DRTaxBenefitRow {
  year: number;
  annualDeduction: number;
  cumulative: number;
  effectiveAfterTaxRate: number;
}

/**
 * Calculate annual DR tax deductions over a number of years.
 *
 * @param investLoanBal - Investment loan balance
 * @param rate - Annual interest rate as %
 * @param margTax - Marginal tax rate as decimal
 * @param yearsArray - Array of years to show (e.g. [1, 5, 10, 15])
 */
export function calculateDRTaxBenefit(
  investLoanBal: number,
  rate: number,
  margTax: number,
  yearsArray: number[],
): DRTaxBenefitRow[] {
  const annualInterest = investLoanBal * (rate / 100);
  const annualDeduction = annualInterest * margTax;
  const effectiveAfterTaxRate = rate * (1 - margTax);

  return yearsArray.map(year => ({
    year,
    annualDeduction: Math.round(annualDeduction),
    cumulative: Math.round(annualDeduction * year),
    effectiveAfterTaxRate,
  }));
}

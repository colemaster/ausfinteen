/**
 * Direct Investing vs Debt Recycling — Financial Engine
 * Pure functions, no React, no side effects.
 *
 * margTax parameters are DECIMALS (e.g. 0.32 for 32%).
 * Rates are PERCENTAGES (e.g. 8.5 for 8.5% pa).
 */

import { CGT_DISCOUNT_INDIVIDUAL } from '../../data/constants';

export interface DirectYearlyRow {
  year: number;
  portfolioValue: number;
  totalDividendsTaxPaid: number;
  netWealth: number;
}

export interface DirectResult {
  finalValue: number;
  totalDividendsTaxPaid: number;
  cgtIfSold: number;
  netWealthAfterCGT: number;
  yearly: DirectYearlyRow[];
}

export interface DRStandaloneYearlyRow {
  year: number;
  portfolioValue: number;
  totalInterestPaid: number;
  totalTaxDeductions: number;
  netInterestCost: number;
  netWealth: number;
}

export interface DRStandaloneResult {
  finalValue: number;
  totalInterestPaid: number;
  totalTaxDeductions: number;
  netInterestCost: number;
  cgtIfSold: number;
  netWealthAfterCGT: number;
  yearly: DRStandaloneYearlyRow[];
}

/**
 * Run a direct (unlevered) ETF investment.
 *
 * @param amount - Initial investment (AUD)
 * @param etfReturn - Total annual return as % (e.g. 8.5)
 * @param divYield - Dividend yield as % (e.g. 2.5) — taxed at margTax each month
 * @param margTax - Marginal tax rate as DECIMAL (e.g. 0.32)
 * @param cgtDiscount - CGT discount as DECIMAL (e.g. 0.5)
 * @param years - Projection horizon
 *
 * Assumptions:
 * - Monthly compounding: portfolio grows at growthOnly per month.
 * - Dividends taxed each month at margTax (reduces effective dividend).
 * - CGT on unrealised gain at end with cgtDiscount discount.
 */
export function runDirectInvest(
  amount: number,
  etfReturn: number,
  divYield: number,
  margTax: number,
  cgtDiscount: number,
  years: number,
): DirectResult {
  const growthOnlyMonthly = (etfReturn - divYield) / 100 / 12;
  const monthlyDivGross = divYield / 100 / 12;

  let portfolioValue = amount;
  let totalDividendsTaxPaid = 0;
  const costBase = amount;
  const yearly: DirectResult['yearly'] = [];

  for (let m = 1; m <= years * 12; m++) {
    const growth = portfolioValue * growthOnlyMonthly;
    const divGross = portfolioValue * monthlyDivGross;
    const divTax = divGross * margTax;
    const divNet = divGross - divTax;
    portfolioValue += growth + divNet;
    totalDividendsTaxPaid += divTax;

    if (m % 12 === 0) {
      const unrealisedGain = portfolioValue - costBase;
      const cgt =
        unrealisedGain > 0 ? unrealisedGain * (1 - cgtDiscount) * margTax : 0;
      yearly.push({
        year: m / 12,
        portfolioValue: Math.round(portfolioValue),
        totalDividendsTaxPaid: Math.round(totalDividendsTaxPaid),
        netWealth: Math.round(portfolioValue - cgt),
      });
    }
  }

  const unrealisedGain = portfolioValue - costBase;
  const cgtIfSold =
    unrealisedGain > 0 ? unrealisedGain * (1 - cgtDiscount) * margTax : 0;

  return {
    finalValue: Math.round(portfolioValue),
    totalDividendsTaxPaid: Math.round(totalDividendsTaxPaid),
    cgtIfSold: Math.round(cgtIfSold),
    netWealthAfterCGT: Math.round(portfolioValue - cgtIfSold),
    yearly,
  };
}

/**
 * Run a debt-recycled ETF investment (levered, tax-deductible interest).
 *
 * @param amount - Investment / loan amount (AUD)
 * @param etfReturn - Total annual ETF return as %
 * @param divYield - Dividend yield as %
 * @param mortgageRate - Borrowing rate as %
 * @param margTax - Marginal tax rate as DECIMAL
 * @param cgtDiscount - CGT discount as DECIMAL
 * @param years - Projection horizon
 * @param recycleFraction - Fraction of `amount` converted to the investment
 *        structure per year (debt recycling cycle speed). 1 = fully recycled
 *        at t=0 (default); 0.25 = a quarter of the capital is recycled each
 *        year until fully converted.
 *
 * Assumptions:
 * - IO loan at mortgageRate; interest deducted at margTax each month.
 * - Recycle chunks are borrowed and invested at the start of each year; the
 *   un-recycled remainder earns nothing until converted (held as cash).
 * - Portfolio grows same as direct but interest is an ongoing cost.
 * - Net wealth = portfolioValue - loanBalance.
 */
export function runDebtRecyclingStandalone(
  amount: number,
  etfReturn: number,
  divYield: number,
  mortgageRate: number,
  margTax: number,
  cgtDiscount: number,
  years: number,
  recycleFraction = 1,
): DRStandaloneResult {
  const growthOnlyMonthly = (etfReturn - divYield) / 100 / 12;
  const monthlyDivGross = divYield / 100 / 12;
  const monthlyInterestRate = mortgageRate / 100 / 12;

  const target = amount;
  const annualChunk = amount * Math.min(1, Math.max(0, recycleFraction));
  let invested = Math.min(target, annualChunk);
  let portfolioValue = invested;
  let loanBalance = invested;
  let costBase = invested;
  let totalInterestPaid = 0;
  let totalTaxDeductions = 0;
  let totalDividendsTaxPaid = 0;
  const yearly: DRStandaloneResult['yearly'] = [];

  for (let m = 1; m <= years * 12; m++) {
    // Start of each subsequent year: recycle the next chunk
    if (m > 1 && m % 12 === 1 && invested < target) {
      const chunk = Math.min(target - invested, annualChunk);
      invested += chunk;
      portfolioValue += chunk;
      loanBalance += chunk;
      costBase += chunk;
    }

    const growth = portfolioValue * growthOnlyMonthly;
    const divGross = portfolioValue * monthlyDivGross;
    const divTax = divGross * margTax;
    const divNet = divGross - divTax;
    portfolioValue += growth + divNet;
    totalDividendsTaxPaid += divTax;

    const interest = loanBalance * monthlyInterestRate;
    const deduction = interest * margTax;
    totalInterestPaid += interest;
    totalTaxDeductions += deduction;

    if (m % 12 === 0) {
      const unrealisedGain = portfolioValue - costBase;
      const cgt =
        unrealisedGain > 0 ? unrealisedGain * (1 - cgtDiscount) * margTax : 0;
      const netInterestSoFar = totalInterestPaid - totalTaxDeductions;
      yearly.push({
        year: m / 12,
        portfolioValue: Math.round(portfolioValue),
        totalInterestPaid: Math.round(totalInterestPaid),
        totalTaxDeductions: Math.round(totalTaxDeductions),
        netInterestCost: Math.round(netInterestSoFar),
        netWealth: Math.round(portfolioValue - cgt - loanBalance),
      });
    }
  }

  const unrealisedGain = portfolioValue - costBase;
  const cgtIfSold =
    unrealisedGain > 0 ? unrealisedGain * (1 - cgtDiscount) * margTax : 0;

  return {
    finalValue: Math.round(portfolioValue),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalTaxDeductions: Math.round(totalTaxDeductions),
    netInterestCost: Math.round(totalInterestPaid - totalTaxDeductions),
    cgtIfSold: Math.round(cgtIfSold),
    netWealthAfterCGT: Math.round(portfolioValue - cgtIfSold - loanBalance),
    yearly,
  };
}

/**
 * Breakeven ETF return for DR to match direct investing.
 * DR after-tax borrowing cost = mortgageRate × (1 − marginalTaxRate).
 *
 * @param mortgageRate - Annual borrowing rate as %
 * @param margTaxPct - Marginal tax rate as PERCENTAGE (e.g. 47)
 */
export function findBreakevenReturn(
  mortgageRate: number,
  margTaxPct: number,
): number {
  return mortgageRate * (1 - margTaxPct / 100);
}

export interface CgtOutcome {
  taxableGain: number;      // gain × (1 − discount) — gain assessed for tax
  discountAmount: number;   // portion of the gain exempt via the CGT discount
  cgtPayable: number;       // taxableGain × marginalRate
  proceedsAfterCgt: number; // investmentValue − cgtPayable
}

/**
 * CGT payable on disposal of an investment, applying the 50% individual CGT
 * discount when the asset has been held longer than 12 months.
 *
 * @param investmentValue - Current market value at sale (AUD)
 * @param costBase - Original cost base (AUD)
 * @param holdingYears - Years held (time-weighted: ≥1 → discount applies)
 * @param marginalRate - Marginal tax rate as DECIMAL (e.g. 0.32)
 * @param discount - CGT discount as DECIMAL (default 0.50 from data/constants)
 *
 * Assumptions:
 * - 50% discount only applies when holdingYears >= 1 (ATO rule).
 * - No indexation, no carry-forward capital losses, no other disposals.
 */
export function cgtAfterSell(
  investmentValue: number,
  costBase: number,
  holdingYears: number,
  marginalRate: number,
  discount: number = CGT_DISCOUNT_INDIVIDUAL,
): CgtOutcome {
  const gain = Math.max(0, investmentValue - costBase);
  const discountAmount = holdingYears >= 1 ? gain * discount : 0;
  const taxableGain = gain - discountAmount;
  const cgtPayable = taxableGain * marginalRate;
  return {
    taxableGain,
    discountAmount,
    cgtPayable,
    proceedsAfterCgt: investmentValue - cgtPayable,
  };
}

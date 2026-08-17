/**
 * Savings Rate Impact — Financial Engine
 *
 * Models how dramatically savings rate affects years to financial independence.
 * Uses the 4% safe withdrawal rule (FIRE number = annual expenses / 0.04).
 *
 * Assumptions:
 * - Annual compounding
 * - "Years to FIRE" = years until portfolio covers annual expenses via 4% SWR
 * - Annual expenses = income × (1 - savingsRate)
 * - SWR is fixed at 4%
 */

import { SUPER_RULES } from '../../data/super-rules';
import { calcHELPRepayment } from '../../data/constants';

const SWR = 0.04;

export interface SavingsRateRow {
  /** Savings rate as a decimal (0.10 to 0.90) */
  rate: number;
  /** Annual expenses when spending income * (1 - rate) */
  annualExpenses: number;
  /** FIRE number = annualExpenses / SWR */
  fireNumber: number;
  /** Years to reach FIRE from currentNW */
  years: number;
}

export interface SavingsRateResult {
  rows: SavingsRateRow[];
  /** Row matching the user's actual savings rate (closest step) */
  currentRow: SavingsRateRow;
}

/**
 * Calculate years to reach a FIRE target from a given starting net worth,
 * with annual savings and a fixed annual return rate.
 *
 * @param currentNW - Current net worth / investable assets ($)
 * @param annualSavings - Amount saved per year ($)
 * @param fireNumber - Target portfolio size ($)
 * @param returnRate - Annual investment return as percent (e.g. 7)
 * @returns Years to FIRE (integer, capped at 100 if unreachable)
 */
export function yearsToFIREFromNW(
  currentNW: number,
  annualSavings: number,
  fireNumber: number,
  returnRate: number,
): number {
  if (currentNW >= fireNumber) return 0;
  if (annualSavings <= 0 && returnRate <= 0) return 100;

  const r = returnRate / 100;
  let balance = currentNW;

  for (let y = 1; y <= 100; y++) {
    balance = balance * (1 + r) + annualSavings;
    if (balance >= fireNumber) return y;
  }
  return 100;
}

/**
 * Build a table of savings rates from 10% to 90% (in 5% steps) showing
 * the impact on years to financial independence.
 *
 * @param income - Annual after-tax income ($)
 * @param currentNW - Current net worth ($)
 * @param returnRate - Annual return rate as percent (e.g. 7)
 * @param currentSavingsRate - User's current savings rate as percent (e.g. 30)
 * @returns SavingsRateResult with all rows and the highlighted current row
 */
export function yearsToFIREBySavingsRate(
  income: number,
  currentNW: number,
  returnRate: number,
  currentSavingsRate: number,
): SavingsRateResult {
  const steps = Array.from({ length: 17 }, (_, i) => 10 + i * 5); // 10..90

  const rows: SavingsRateRow[] = steps.map(pct => {
    const rate = pct / 100;
    const annualExpenses = income * (1 - rate);
    const annualSavings = income * rate;
    const fireNumber = annualExpenses / SWR;
    const years = yearsToFIREFromNW(currentNW, annualSavings, fireNumber, returnRate);
    return { rate, annualExpenses, fireNumber, years };
  });

  // Find the row closest to the user's current savings rate
  const targetPct = Math.round(currentSavingsRate / 5) * 5;
  const clampedPct = Math.max(10, Math.min(90, targetPct));
  const currentRow = rows.find(r => Math.round(r.rate * 100) === clampedPct) ?? rows[4]; // fallback 30%

  return { rows, currentRow };
}

/**
 * Build a year-by-year projection for a given savings rate and income.
 * Useful for the trajectory line chart.
 *
 * @param income - Annual after-tax income ($)
 * @param currentNW - Current net worth ($)
 * @param savingsRatePct - Savings rate as percent (e.g. 30)
 * @param returnRate - Annual return rate as percent (e.g. 7)
 * @param maxYears - How many years to project
 * @returns Array of balances indexed by year (index 0 = end of year 1)
 */
export function projectBySavingsRate(
  income: number,
  currentNW: number,
  savingsRatePct: number,
  returnRate: number,
  maxYears: number,
): number[] {
  const annualSavings = income * (savingsRatePct / 100);
  const r = returnRate / 100;
  let balance = currentNW;
  const result: number[] = [];

  for (let y = 1; y <= maxYears; y++) {
    balance = balance * (1 + r) + annualSavings;
    result.push(Math.round(balance));
  }
  return result;
}

// ─── Pay Strategy Comparison ──────────────────────────────────────────────────

export interface PayStrategyResult {
  /** Contribution invested at the END of each year (classic end-of-year model) */
  payAtEnd: number[];
  /** Contribution invested at the START of each year ("pay yourself first") */
  payFirst: number[];
}

/**
 * Compare two contribution timing strategies for the same savings rate:
 * - "Pay at end": salary arrives, you spend first, invest the surplus at the
 *   end of the year (contribution grows for 0 years).
 * - "Pay yourself first": the savings are invested at the START of the year
 *   (contribution grows for a full extra year).
 *
 * Assumptions:
 * - Annual compounding; balances are one per year for `years` years.
 * - Both strategies invest the same annual amount (income × savings rate).
 *
 * @param income - Annual after-tax income ($)
 * @param currentNW - Current investable net worth ($)
 * @param savingsRatePct - Savings rate as percent (e.g. 30)
 * @param returnRate - Annual return rate as percent (e.g. 7)
 * @param years - Projection horizon
 */
export function projectPayStrategies(
  income: number,
  currentNW: number,
  savingsRatePct: number,
  returnRate: number,
  years: number,
): PayStrategyResult {
  const annualSavings = income * (savingsRatePct / 100);
  const r = returnRate / 100;

  let atEnd = currentNW;
  let atFirst = currentNW;
  const payAtEnd: number[] = [];
  const payFirst: number[] = [];

  for (let y = 1; y <= years; y++) {
    atEnd = atEnd * (1 + r) + annualSavings;
    atFirst = (atFirst + annualSavings) * (1 + r);
    payAtEnd.push(Math.round(atEnd));
    payFirst.push(Math.round(atFirst));
  }

  return { payAtEnd, payFirst };
}

// ─── Rate → Retirement Years Mapping ──────────────────────────────────────────

export interface RateToRetirementRow {
  /** Savings rate as a decimal (e.g. 0.30) */
  rate: number;
  /** Annual amount saved at this rate ($) */
  annualSavings: number;
  /** Annual expenses at this rate ($) */
  annualExpenses: number;
  /** FIRE number = expenses / 0.04 ($) */
  fireNumber: number;
  /** Years to reach the FIRE number */
  years: number;
}

/**
 * Map an arbitrary list of savings rates to years-to-FIRE, FIRE number and
 * the associated annual savings/expense figures. Builds on the same 4% SWR
 * model as `yearsToFIREBySavingsRate` but accepts caller-supplied rates.
 *
 * Assumptions:
 * - Annual compounding at `returnRate`.
 * - Expenses = income × (1 − rate); FIRE number = expenses / 0.04.
 *
 * @param income - Annual after-tax income ($)
 * @param currentNW - Current net worth ($)
 * @param returnRate - Annual return rate as percent (e.g. 7)
 * @param rates - Savings rates as decimals (e.g. [0.2, 0.5, 0.8])
 */
export function rateToRetirementYears(
  income: number,
  currentNW: number,
  returnRate: number,
  rates: number[],
): RateToRetirementRow[] {
  return rates.map(rate => {
    const clamped = Math.max(0, Math.min(0.99, rate));
    const annualSavings = income * clamped;
    const annualExpenses = income * (1 - clamped);
    const fireNumber = annualExpenses / SWR;
    return {
      rate: clamped,
      annualSavings,
      annualExpenses,
      fireNumber,
      years: yearsToFIREFromNW(currentNW, annualSavings, fireNumber, returnRate),
    };
  });
}

// ─── Take-Home Pay Breakdown ──────────────────────────────────────────────────

export interface TakeHomeBreakdown {
  /** Annual gross income ($) */
  grossIncome: number;
  /** Superannuation Guarantee contribution (12% of gross) ($) */
  superGuarantee: number;
  /** Simple marginal-rate income tax estimate ($) */
  taxEstimate: number;
  /** Compulsory HELP/HECS repayment — 0 when no HELP debt ($) */
  helpRepayment: number;
  /** Take-home after tax + HELP ($) */
  netTakeHome: number;
  /** netTakeHome / grossIncome as a decimal */
  takeHomeRate: number;
}

/**
 * Break down gross income into SG, income tax (marginal-rate estimate), HELP
 * repayment (when a HELP debt exists) and net take-home pay.
 *
 * Assumptions:
 * - Tax is a simplified estimate at a single marginal rate (no brackets,
 *   offsets or Medicare levy).
 * - HELP repayments use the 2026-27 ATO threshold table via calcHELPRepayment.
 * - SG rate from SUPER_RULES.sgRate (12%).
 *
 * @param grossIncome - Annual gross income ($)
 * @param marginalRate - Marginal tax rate as a decimal (e.g. 0.32)
 * @param hasHELPDebt - Whether an outstanding HELP/HECS debt exists
 */
export function takeHomeBreakdown(
  grossIncome: number,
  marginalRate: number,
  hasHELPDebt: boolean,
): TakeHomeBreakdown {
  const superGuarantee = grossIncome * SUPER_RULES.sgRate;
  const taxEstimate = Math.max(0, grossIncome * marginalRate);
  const helpRepayment = hasHELPDebt ? calcHELPRepayment(grossIncome) : 0;
  const netTakeHome = Math.max(0, grossIncome - taxEstimate - helpRepayment);
  return {
    grossIncome,
    superGuarantee,
    taxEstimate,
    helpRepayment,
    netTakeHome,
    takeHomeRate: grossIncome > 0 ? netTakeHome / grossIncome : 0,
  };
}

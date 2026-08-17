/**
 * Investment Comparison — Financial Engine
 * Compare up to 4 investment scenarios with different tax treatments and fees.
 */

import { CGT_DISCOUNT_INDIVIDUAL } from '../../data/constants';

export type TaxTreatment = 'marginal' | 'super' | 'tax-free';

export interface ScenarioParams {
  label: string;
  initial: number;
  monthlyContribution: number;
  annualReturn: number;   // percent
  mer: number;            // percent annual fee
  taxTreatment: TaxTreatment;
  marginalRate: number;   // decimal (e.g. 0.32)
}

export interface ScenarioYearRow {
  year: number;
  balance: number;
  totalContributions: number;
  totalFeesPaid: number;
}

export interface ScenarioResult {
  label: string;
  color: string;
  finalBalance: number;
  totalContributions: number;
  totalFeesPaid: number;
  afterTaxFinalBalance: number;
  yearly: ScenarioYearRow[];
}

const SCENARIO_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];

/**
 * Run a single investment scenario with monthly compounding.
 *
 * Tax treatment:
 * - marginal: growth taxed at marginalRate each month
 * - super: growth taxed at 15%
 * - tax-free: no tax on growth (e.g. offset account, TFSA)
 *
 * @param params - ScenarioParams
 * @param years - Projection horizon
 * @param colorIndex - Index for chart color assignment
 */
export function runScenario(
  params: ScenarioParams,
  years: number,
  colorIndex = 0,
): ScenarioResult {
  const {
    label,
    initial,
    monthlyContribution,
    annualReturn,
    mer,
    taxTreatment,
    marginalRate,
  } = params;

  const netAnnualReturn = annualReturn - mer;
  void netAnnualReturn; // netAnnualReturn derived below per-month

  const taxRate =
    taxTreatment === 'marginal' ? marginalRate :
    taxTreatment === 'super' ? 0.15 :
    0;

  let balance = initial;
  let totalContributions = initial;
  let totalFeesPaid = 0;
  const yearly: ScenarioYearRow[] = [];

  for (let m = 1; m <= years * 12; m++) {
    // Monthly growth (after MER, before tax)
    const grossGrowth = balance * (annualReturn / 100 / 12);
    const merCost = balance * (mer / 100 / 12);
    const netGrowth = grossGrowth - merCost;
    const taxOnGrowth = netGrowth > 0 ? netGrowth * taxRate : 0;
    const afterTaxGrowth = netGrowth - taxOnGrowth;

    balance += afterTaxGrowth + monthlyContribution;
    totalContributions += monthlyContribution;
    totalFeesPaid += merCost;

    if (m % 12 === 0) {
      yearly.push({
        year: m / 12,
        balance: Math.round(balance),
        totalContributions: Math.round(totalContributions),
        totalFeesPaid: Math.round(totalFeesPaid),
      });
    }
  }

  // After-tax final balance (no further CGT for super/tax-free; marginal has tax on growth already applied)
  const afterTaxFinalBalance = balance;

  return {
    label,
    color: SCENARIO_COLORS[colorIndex % SCENARIO_COLORS.length],
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalFeesPaid: Math.round(totalFeesPaid),
    afterTaxFinalBalance: Math.round(afterTaxFinalBalance),
    yearly,
  };
}

/**
 * Run all scenarios.
 */
export function runAllScenarios(
  scenarios: ScenarioParams[],
  years: number,
): ScenarioResult[] {
  return scenarios.map((s, i) => runScenario(s, years, i));
}

// ─── Crash Stress Test ────────────────────────────────────────────────────────

/**
 * Apply a one-off market crash (e.g. -30%) to a yearly balance series at a
 * chosen year (1-indexed). Values at/after the crash year are reduced by the
 * crash percentage; the series is returned unchanged if the crash year is out
 * of range.
 *
 * @param series - Yearly balances (one entry per year)
 * @param crashYear - 1-indexed year in which the crash occurs
 * @param crashPct - Crash size as a positive percentage (e.g. 30 for -30%)
 */
export function applyCrashToSeries(
  series: number[],
  crashYear: number,
  crashPct: number,
): number[] {
  const year = Math.floor(crashYear);
  const factor = 1 - Math.max(0, Math.min(100, crashPct)) / 100;
  if (year < 1 || year > series.length) return [...series];
  return series.map((v, i) => (i + 1 >= year ? v * factor : v));
}

// ─── MER Fee Drag ─────────────────────────────────────────────────────────────

export interface FeeDragResult {
  /** Yearly balances with the lower MER */
  lowFeeSeries: number[];
  /** Yearly balances with the higher MER */
  highFeeSeries: number[];
  /** Cumulative value lost to the fee gap, per year */
  difference: number[];
  /** Final value lost to the fee gap */
  finalLoss: number;
  /** finalLoss as a percentage of the low-fee final balance */
  lostPct: number;
}

/**
 * Quantify the drag of management fees by running the same portfolio at two
 * different MERs. Uses the same monthly-compounding model as `runScenario`
 * but with no tax (pure fee comparison).
 *
 * Assumptions:
 * - Monthly compounding; contributions at the end of each month.
 * - MER is deducted monthly from the balance; growth is net of MER.
 *
 * @param initial - Starting balance ($)
 * @param monthlyContribution - Monthly contribution ($)
 * @param annualGrowthPct - Gross annual return as % (e.g. 8)
 * @param mer1 - Lower annual MER as % (e.g. 0.1)
 * @param mer2 - Higher annual MER as % (e.g. 1.0)
 * @param years - Projection horizon
 */
export function feeDrag(
  initial: number,
  monthlyContribution: number,
  annualGrowthPct: number,
  mer1: number,
  mer2: number,
  years: number,
): FeeDragResult {
  const lowFeeSeries: number[] = [];
  const highFeeSeries: number[] = [];
  const difference: number[] = [];

  for (const mer of [mer1, mer2]) {
    const series: number[] = [];
    let balance = initial;
    for (let m = 1; m <= years * 12; m++) {
      const grossGrowth = balance * (annualGrowthPct / 100 / 12);
      const merCost = balance * (mer / 100 / 12);
      balance += grossGrowth - merCost + monthlyContribution;
      if (m % 12 === 0) series.push(Math.round(balance));
    }
    if (lowFeeSeries.length === 0) lowFeeSeries.push(...series);
    else highFeeSeries.push(...series);
  }

  for (let i = 0; i < lowFeeSeries.length; i++) {
    difference.push(Math.round(lowFeeSeries[i] - highFeeSeries[i]));
  }

  const finalLoss = lowFeeSeries.length > 0
    ? Math.round(lowFeeSeries[lowFeeSeries.length - 1] - highFeeSeries[highFeeSeries.length - 1])
    : 0;
  const finalLow = lowFeeSeries[lowFeeSeries.length - 1] ?? 0;

  return {
    lowFeeSeries,
    highFeeSeries,
    difference,
    finalLoss,
    lostPct: finalLow > 0 ? (finalLoss / finalLow) * 100 : 0,
  };
}

// ─── CGT-Adjusted Disposal Value ──────────────────────────────────────────────

/**
 * Estimate the after-tax value of disposing of an investment, applying the
 * Australian 50% CGT discount (individuals holding > 12 months) to the
 * capital gain.
 *
 * Assumptions:
 * - Taxable gain = final balance − total contributions (no cost base
 *   adjustments).
 * - Tax payable = gain × marginalRate × (1 − discount).
 *
 * @param initial - Initial investment / opening cost base ($)
 * @param totalContributions - Cumulative contributions incl. initial ($)
 * @param finalBalance - Balance before disposal tax ($)
 * @param marginalRate - Marginal tax rate as a decimal (e.g. 0.32)
 * @param discount - CGT discount as a decimal (default 0.50 for individuals)
 */
export function cgtAdjustedFinalValue(
  initial: number,
  totalContributions: number,
  finalBalance: number,
  marginalRate: number,
  discount: number = CGT_DISCOUNT_INDIVIDUAL,
): number {
  const contributions = Math.max(initial, totalContributions);
  const gain = Math.max(0, finalBalance - contributions);
  const tax = gain
    * Math.max(0, Math.min(1, marginalRate))
    * (1 - Math.max(0, Math.min(1, discount)));
  return Math.round(finalBalance - tax);
}

export { SCENARIO_COLORS };

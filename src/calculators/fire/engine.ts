/**
 * FIRE Calculator Suite — Financial Engine
 * Classic FIRE, Coast FIRE, Barista FIRE, Lean vs Fat, Super Bridge.
 * Pure functions, no React, no side effects.
 */

import { projectGrowth, yearsToTarget } from '../../utils/financial';
import { SUPER_RULES } from '../../data/super-rules';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuperBridgeParams {
  currentAge: number;
  earlyRetirementAge: number;
  preservationAge: number;     // default 60 (born after 1 July 1964)
  nonSuperBalance: number;
  superBalance: number;
  annualSavingsNonSuper: number;
  annualSuperContribs: number;
  annualExpenses: number;
  nonSuperReturn: number;     // % pa
  superReturn: number;        // % pa
  /**
   * Share (0–1) of annualSuperContribs that is concessional (pre-tax).
   * When set, the 15% contributions tax is applied to the concessional
   * portion. When omitted, contributions enter super untaxed (legacy behaviour).
   */
  concessionalShareOfContribs?: number;
}

export interface SuperBridgeYearRow {
  age: number;
  nonSuperBalance: number;
  superBalance: number;
  phase: 'accumulation' | 'bridge' | 'retirement';
}

export interface SuperBridgeResult {
  nonSuperSufficientToBridge: boolean;
  shortfallAtPreservation: number;
  yearly: SuperBridgeYearRow[];
  ageNonSuperRunsOut: number | null;
}

export interface LeanFatRow {
  expenses: number;
  fireNumber: number;
  yearsToFIRE: number;
}

export interface ReturnScenario {
  label: string;
  /** One annual return (as % — e.g. 7 or -15) for each year of the simulation */
  returns: number[];
}

export interface SequenceRiskYearRow {
  year: number;
  balance: number;
}

export interface SequenceRiskScenarioResult {
  label: string;
  /** Balance after the final year of the sequence */
  endingBalance: number;
  /** Lowest balance observed during the simulation */
  minBalance: number;
  yearly: SequenceRiskYearRow[];
}

export interface PercentileFanPoint {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface InflationAdjustedResult {
  /** Nominal (unadjusted) balances, one per year */
  nominal: number[];
  /** Real (deflated to today's dollars) balances, one per year */
  real: number[];
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * FIRE number = annual expenses / withdrawal rate.
 */
export function calculateFIRENumber(
  annualExpenses: number,
  withdrawalRate: number,
): number {
  if (withdrawalRate <= 0) return Infinity;
  return annualExpenses / withdrawalRate;
}

/**
 * Years required to reach the FIRE number from current investments.
 */
export function yearsToFIRE(
  currentInvestments: number,
  annualSavings: number,
  targetAmount: number,
  returnRate: number,
): number {
  return yearsToTarget(currentInvestments, annualSavings, targetAmount, returnRate);
}

/**
 * Project annual savings trajectory (array of balances, one per year).
 */
export function projectSavings(
  current: number,
  annualAddition: number,
  returnRate: number,
  years: number,
): number[] {
  return projectGrowth(current, annualAddition, returnRate, years);
}

/**
 * Coast FIRE number — amount needed today such that compound growth alone reaches target.
 *
 * @param targetAmount - FIRE number (total needed at retirement)
 * @param returnRate - Annual return as % (e.g. 7)
 * @param yearsToRetirement - Years until retirement
 */
export function coastFIRENumber(
  targetAmount: number,
  returnRate: number,
  yearsToRetirement: number,
): number {
  if (yearsToRetirement <= 0) return targetAmount;
  return targetAmount / Math.pow(1 + returnRate / 100, yearsToRetirement);
}

/**
 * Build a lean vs fat FIRE comparison table.
 */
export function leanVsFatTable(
  currentInvestments: number,
  annualSavings: number,
  returnRate: number,
  withdrawalRate: number,
  expenseLevels: number[],
): LeanFatRow[] {
  return expenseLevels.map(expenses => {
    const fireNumber = calculateFIRENumber(expenses, withdrawalRate);
    const years = yearsToFIRE(currentInvestments, annualSavings, fireNumber, returnRate);
    return {
      expenses,
      fireNumber: Math.round(fireNumber),
      yearsToFIRE: years,
    };
  });
}

/**
 * Calculate Australian Super Bridge strategy.
 *
 * Phase 1: currentAge → earlyRetirementAge (accumulation)
 * Phase 2: earlyRetirementAge → preservationAge (draw from non-super; super grows untouched)
 * Phase 3: preservationAge → 90 (draw from super first, then non-super)
 */
export function calculateSuperBridge(
  params: SuperBridgeParams,
): SuperBridgeResult {
  const {
    currentAge,
    earlyRetirementAge,
    preservationAge,
    nonSuperBalance,
    superBalance,
    annualSavingsNonSuper,
    annualSuperContribs,
    annualExpenses,
    nonSuperReturn,
    superReturn,
    concessionalShareOfContribs,
  } = params;

  const nonSuperR = nonSuperReturn / 100;
  const superR = superReturn / 100;
  // Net super contribution after the 15% tax on the concessional share (if split provided)
  const netSuperContrib = concessionalShareOfContribs !== undefined
    ? netSuperContribution(annualSuperContribs, concessionalShareOfContribs)
    : annualSuperContribs;
  const yearly: SuperBridgeYearRow[] = [];

  let ns = nonSuperBalance;
  let sup = superBalance;
  let ageNonSuperRunsOut: number | null = null;

  for (let age = currentAge; age <= 90; age++) {
    let phase: SuperBridgeYearRow['phase'];

    if (age < earlyRetirementAge) {
      // Accumulation: both grow, save into both
      phase = 'accumulation';
      ns = ns * (1 + nonSuperR) + annualSavingsNonSuper;
      sup = sup * (1 + superR) + netSuperContrib;
    } else if (age < preservationAge) {
      // Bridge: draw from non-super, super grows untouched
      phase = 'bridge';
      ns = ns * (1 + nonSuperR) - annualExpenses;
      sup = sup * (1 + superR);
      if (ns < 0 && ageNonSuperRunsOut === null) {
        ageNonSuperRunsOut = age;
      }
      ns = Math.max(0, ns);
    } else {
      // Retirement: draw from super (then non-super if super runs out)
      phase = 'retirement';
      sup = sup * (1 + superR);
      if (sup >= annualExpenses) {
        sup -= annualExpenses;
      } else {
        const remaining = annualExpenses - sup;
        sup = 0;
        ns = ns * (1 + nonSuperR) - remaining;
        if (ns < 0 && ageNonSuperRunsOut === null) {
          ageNonSuperRunsOut = age;
        }
        ns = Math.max(0, ns);
      }
    }

    yearly.push({
      age,
      nonSuperBalance: Math.round(ns),
      superBalance: Math.round(Math.max(0, sup)),
      phase,
    });
  }

  // Check non-super at preservation age
  const atPreservation = yearly.find(r => r.age === preservationAge);
  const nonSuperAtPreservation = atPreservation?.nonSuperBalance ?? 0;

  return {
    nonSuperSufficientToBridge: ageNonSuperRunsOut === null || ageNonSuperRunsOut >= preservationAge,
    shortfallAtPreservation: Math.max(0, -nonSuperAtPreservation),
    yearly,
    ageNonSuperRunsOut,
  };
}

/**
 * Re-export preservation age from super rules for use in UI.
 */
export const PRESERVATION_AGE = SUPER_RULES.preservationAge;

// ─── Sequence-of-Returns Risk ─────────────────────────────────────────────────

/**
 * Simulate a portfolio in drawdown under different annual return sequences,
 * exposing sequence-of-returns risk (the same average return can produce very
 * different outcomes depending on when the bad years land).
 *
 * Assumptions:
 * - Annual compounding; the monthly drawdown is converted to an annual
 *   withdrawal (× 12) taken at the END of each year.
 * - Returns are interpreted as annual percentages (e.g. -15 → -15%).
 * - Balances are floored at zero.
 *
 * @param initialBalance - Portfolio balance at the start ($)
 * @param monthlyDrawdown - Amount withdrawn each month during drawdown ($)
 * @param years - Length of the drawdown simulation
 * @param scenarios - Named return sequences; shorter sequences are padded
 *   with the last return, longer ones truncated
 */
export function simulateSequenceRisk(
  initialBalance: number,
  monthlyDrawdown: number,
  years: number,
  scenarios: ReturnScenario[],
): SequenceRiskScenarioResult[] {
  const annualDrawdown = monthlyDrawdown * 12;

  return scenarios.map(scenario => {
    let balance = Math.max(0, initialBalance);
    let minBalance = balance;
    const yearly: SequenceRiskYearRow[] = [];

    for (let y = 1; y <= years; y++) {
      const rawReturn = scenario.returns[y - 1] ?? scenario.returns[scenario.returns.length - 1] ?? 0;
      balance = balance * (1 + rawReturn / 100) - annualDrawdown;
      balance = Math.max(0, balance);
      minBalance = Math.min(minBalance, balance);
      yearly.push({ year: y, balance: Math.round(balance) });
    }

    return {
      label: scenario.label,
      endingBalance: Math.round(balance),
      minBalance: Math.round(minBalance),
      yearly,
    };
  });
}

/**
 * Build a percentile fan (p10/p25/p50/p75/p90 per year) from a set of scenario
 * trajectories. The output is structurally compatible with MonteCarloFanChart.
 *
 * @param scenarios - Named trajectories sharing the same year count
 */
export function fanFromScenarioYearlies(
  scenarios: { label: string; yearly: SequenceRiskYearRow[] }[],
): PercentileFanPoint[] {
  if (scenarios.length === 0) return [];

  const years = scenarios[0].yearly.length;
  const points: PercentileFanPoint[] = [];

  for (let y = 0; y < years; y++) {
    const values = scenarios
      .map(s => s.yearly[y]?.balance ?? 0)
      .sort((a, b) => a - b);
    points.push({
      year: y + 1,
      p10: percentile(values, 0.10),
      p25: percentile(values, 0.25),
      p50: percentile(values, 0.50),
      p75: percentile(values, 0.75),
      p90: percentile(values, 0.90),
    });
  }
  return points;
}

/** Linear-interpolated percentile of a sorted ascending array. */
function percentile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const pos = (sortedValues.length - 1) * q;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  if (lower === upper) return Math.round(sortedValues[lower]);
  const weight = pos - lower;
  return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}

// ─── Inflation-Adjusted Projections ───────────────────────────────────────────

/**
 * Project a portfolio with contributions while also deflating each year's
 * balance by cumulative inflation — letting users see the "real" purchasing
 * power trajectory next to the nominal one.
 *
 * Assumptions:
 * - Annual compounding with contributions at the END of each year.
 * - A single constant inflation rate applied cumulatively (CPI-style).
 *
 * @param initialBalance - Starting balance ($)
 * @param annualContribution - Added at the end of each year ($)
 * @param annualGrowthNominalPct - Nominal annual growth as % (e.g. 8)
 * @param inflationRatePct - Annual inflation as % (e.g. 3)
 * @param years - Projection horizon
 */
export function inflationAdjustedSeries(
  initialBalance: number,
  annualContribution: number,
  annualGrowthNominalPct: number,
  inflationRatePct: number,
  years: number,
): InflationAdjustedResult {
  const nominal: number[] = [];
  const real: number[] = [];

  if (years <= 0) return { nominal, real };

  const r = annualGrowthNominalPct / 100;
  const inf = inflationRatePct / 100;
  let balance = initialBalance;

  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + r) + annualContribution;
    nominal.push(Math.round(balance));
    real.push(Math.round(balance / Math.pow(1 + inf, y)));
  }

  return { nominal, real };
}

/**
 * Project a Coast FIRE portfolio from today to retirement age with no further
 * contributions — one balance per year.
 *
 * @param currentInvestments - Current invested balance ($)
 * @param annualGrowthPct - Annual return as % (e.g. 7)
 * @param yearsToRetirement - Years of coasting
 */
export function projectCoastToRetirement(
  currentInvestments: number,
  annualGrowthPct: number,
  yearsToRetirement: number,
): number[] {
  return projectGrowth(currentInvestments, 0, annualGrowthPct, yearsToRetirement);
}

// ─── Super Contribution Split ─────────────────────────────────────────────────

/**
 * Net super contribution after the 15% contributions tax, given the share of
 * the total contribution that is concessional (pre-tax).
 *
 * Assumptions:
 * - Concessional (salary sacrifice / deductible) contributions are taxed at
 *   SUPER_RULES.taxRateInSuper (15%) on the way in.
 * - Non-concessional (post-tax) contributions are not taxed on entry.
 *
 * @param annualSuperContribs - Total annual super contribution ($)
 * @param concessionalShare - Share of the contribution that is concessional (0–1)
 */
export function netSuperContribution(
  annualSuperContribs: number,
  concessionalShare: number,
): number {
  const share = Math.max(0, Math.min(1, concessionalShare));
  return annualSuperContribs * (1 - SUPER_RULES.taxRateInSuper * share);
}

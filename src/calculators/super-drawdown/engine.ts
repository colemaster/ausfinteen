/**
 * Superannuation Retirement Drawdown & Centrelink Age Pension Means Test Engine
 * Implements Schedule 7 SISR minimum drawdowns, 0% ECPI tax rate, TBC indexation,
 * and dual Means Test (Assets Test + Deeming Income Test) for Singles and Couples.
 */

import { getMinimumDrawdownRate } from '../../data/super-rules';
import { SUPER_RULES } from '../../data/super-rules';

export interface SuperDrawdownYearRow {
  age: number;
  startingBalance: number;
  drawdownAmount: number;
  minimumRequiredDrawdown: number;
  investmentEarnings: number;
  agePensionAmount: number;
  totalIncome: number;
  endingBalance: number;
  isSolvent: boolean;
}

export interface AgePensionInputs {
  age: number;
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
  financialAssets: number;        // Super + bank deposits + shares
  otherAssessableAssets: number;  // Cars, contents, holiday home (excl. primary residence)
  otherFortnightlyIncome: number; // Part-time work or annuities
  hasYoungerExemptSpouse?: boolean;
  youngerSpouseSuperBalance?: number;
}

export interface AgePensionResult {
  eligibleForAgePension: boolean;
  annualAgePension: number;
  fortnightlyAgePension: number;
  assetsTestReduction: number;
  incomeTestReduction: number;
  determiningTest: 'assets' | 'income' | 'none';
  deemedAnnualIncome: number;
  maxAnnualPension: number;
}

export interface RetirementPlanParams {
  currentAge: number;
  retirementAge: number;
  superBalanceAtRetirement: number;
  desiredAnnualIncome: number;
  expectedAnnualReturn: number;    // e.g. 0.065 (6.5%)
  inflationRate: number;           // e.g. 0.025 (2.5%)
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
  otherAssessableAssets: number;
  projectionYears?: number;
  /**
   * Lump sum withdrawn from super at retirement (e.g. to pay down a
   * mortgage). The remaining balance runs the account-based pension.
   */
  lumpSumWithdrawal?: number;
}

export interface RetirementPlanResult {
  sustainableYears: number;
  exhaustionAge: number | null;
  lifetimeAgePensionReceived: number;
  totalDrawdownPaid: number;
  bequestValueAtAge95: number;
  isFullySustainableTo100: boolean;
  /** Lump sum withdrawn at retirement (defaults to 0) */
  lumpSumWithdrawn: number;
  /** Highest projected super balance across the schedule */
  maxProjectedBalance: number;
  schedule: SuperDrawdownYearRow[];
}

export interface TransferBalanceCapCheck {
  /** Current general transfer balance cap ($) */
  cap: number;
  /** True when projectedBalance exceeds the cap */
  overCap: boolean;
  /** Amount over the cap ($, 0 when not exceeded) */
  excess: number;
}

export interface PercentileFanPoint {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

// ─── Centrelink Age Pension Constants ─────────────────────────────────────────
export const AGE_PENSION_CONSTANTS = {
  qualifyingAge: 67,
  maxSingleFortnightly: 1200.90,       // incl. Energy & Pension supplement
  maxCoupleCombinedFortnightly: 1810.40,
  singleFreeIncomeFortnightly: 212,
  coupleFreeIncomeFortnightly: 372,
  deemingThresholdSingle: 62600,
  deemingThresholdCouple: 103800,
  deemingRateTier1: 0.0125, // 1.25%
  deemingRateTier2: 0.0325, // 3.25%
  assetsThresholds: {
    singleHomeowner: { lower: 314000, upper: 704500 },
    coupleHomeowner: { lower: 470000, upper: 1057000 },
    singleNonHomeowner: { lower: 566000, upper: 956500 },
    coupleNonHomeowner: { lower: 722000, upper: 1309000 },
  },
  assetsTaperRateFortnightly: 3.0, // $3.00 reduction per $1,000 assets over lower threshold
  incomeTaperRate: 0.50,          // 50c reduction per $1 income over free area
};

/**
 * Calculate Centrelink Age Pension entitlement using current dual Means Test.
 */
export function calculateAgePension(inputs: AgePensionInputs): AgePensionResult {
  const {
    age,
    relationshipStatus,
    isHomeowner,
    financialAssets,
    otherAssessableAssets,
    otherFortnightlyIncome,
    hasYoungerExemptSpouse = false,
    youngerSpouseSuperBalance = 0,
  } = inputs;

  if (age < AGE_PENSION_CONSTANTS.qualifyingAge) {
    return {
      eligibleForAgePension: false,
      annualAgePension: 0,
      fortnightlyAgePension: 0,
      assetsTestReduction: 0,
      incomeTestReduction: 0,
      determiningTest: 'none',
      deemedAnnualIncome: 0,
      maxAnnualPension: 0,
    };
  }

  const isSingle = relationshipStatus === 'single';
  const maxFortnightly = isSingle
    ? AGE_PENSION_CONSTANTS.maxSingleFortnightly
    : (AGE_PENSION_CONSTANTS.maxCoupleCombinedFortnightly / 2);
  const maxAnnual = maxFortnightly * 26;

  // Assessable assets calculation (younger spouse super in accumulation is 100% exempt!)
  const exemptAssets = hasYoungerExemptSpouse ? youngerSpouseSuperBalance : 0;
  const assessableFinancial = Math.max(0, financialAssets - exemptAssets);
  const totalAssessableAssets = assessableFinancial + otherAssessableAssets;

  // 1. Assets Test
  let assetLower = 0;
  let assetUpper = 0;
  if (isSingle) {
    const limits = isHomeowner
      ? AGE_PENSION_CONSTANTS.assetsThresholds.singleHomeowner
      : AGE_PENSION_CONSTANTS.assetsThresholds.singleNonHomeowner;
    assetLower = limits.lower;
    assetUpper = limits.upper;
  } else {
    const limits = isHomeowner
      ? AGE_PENSION_CONSTANTS.assetsThresholds.coupleHomeowner
      : AGE_PENSION_CONSTANTS.assetsThresholds.coupleNonHomeowner;
    assetLower = limits.lower;
    assetUpper = limits.upper;
  }

  let assetsTestFortnightly = maxFortnightly;
  let assetsTestReduction = 0;
  if (totalAssessableAssets > assetLower) {
    const excess = totalAssessableAssets - assetLower;
    assetsTestReduction = (excess / 1000) * AGE_PENSION_CONSTANTS.assetsTaperRateFortnightly;
    assetsTestFortnightly = Math.max(0, maxFortnightly - assetsTestReduction);
  }

  // 2. Deeming & Income Test
  const deemingThreshold = isSingle
    ? AGE_PENSION_CONSTANTS.deemingThresholdSingle
    : AGE_PENSION_CONSTANTS.deemingThresholdCouple;

  let deemedAnnual = 0;
  if (assessableFinancial <= deemingThreshold) {
    deemedAnnual = assessableFinancial * AGE_PENSION_CONSTANTS.deemingRateTier1;
  } else {
    deemedAnnual =
      deemingThreshold * AGE_PENSION_CONSTANTS.deemingRateTier1 +
      (assessableFinancial - deemingThreshold) * AGE_PENSION_CONSTANTS.deemingRateTier2;
  }

  const deemedFortnightly = deemedAnnual / 26;
  const totalFortnightlyIncome = deemedFortnightly + otherFortnightlyIncome;
  const freeIncome = isSingle
    ? AGE_PENSION_CONSTANTS.singleFreeIncomeFortnightly
    : AGE_PENSION_CONSTANTS.coupleFreeIncomeFortnightly;

  let incomeTestFortnightly = maxFortnightly;
  let incomeTestReduction = 0;
  if (totalFortnightlyIncome > freeIncome) {
    const excessIncome = totalFortnightlyIncome - freeIncome;
    incomeTestReduction = excessIncome * AGE_PENSION_CONSTANTS.incomeTaperRate;
    incomeTestFortnightly = Math.max(0, maxFortnightly - incomeTestReduction);
  }

  // Final entitlement is the lower of Assets Test and Income Test
  const finalFortnightly = Math.min(assetsTestFortnightly, incomeTestFortnightly);
  const determiningTest =
    finalFortnightly === 0 && (totalAssessableAssets >= assetUpper)
      ? 'assets'
      : assetsTestFortnightly < incomeTestFortnightly
      ? 'assets'
      : 'income';

  return {
    eligibleForAgePension: finalFortnightly > 0,
    annualAgePension: Math.round(finalFortnightly * 26),
    fortnightlyAgePension: Math.round(finalFortnightly * 100) / 100,
    assetsTestReduction: Math.round(assetsTestReduction),
    incomeTestReduction: Math.round(incomeTestReduction),
    determiningTest,
    deemedAnnualIncome: Math.round(deemedAnnual),
    maxAnnualPension: Math.round(maxAnnual),
  };
}

/**
 * Simulate Account-Based Pension drawdowns with Centrelink Age Pension integration.
 */
export function simulateRetirementPlan(params: RetirementPlanParams): RetirementPlanResult {
  const {
    retirementAge,
    superBalanceAtRetirement,
    desiredAnnualIncome,
    expectedAnnualReturn,
    inflationRate,
    relationshipStatus,
    isHomeowner,
    otherAssessableAssets,
    projectionYears = 35,
    lumpSumWithdrawal = 0,
  } = params;

  const lumpSum = Math.max(0, lumpSumWithdrawal);
  let currentBalance = Math.max(0, superBalanceAtRetirement - lumpSum);
  let lifetimePension = 0;
  let totalDrawdowns = 0;
  let exhaustionAge: number | null = null;
  let sustainableYears = 0;
  let maxProjectedBalance = currentBalance;

  const schedule: SuperDrawdownYearRow[] = [];
  const startAge = retirementAge;

  for (let i = 0; i < projectionYears; i++) {
    const age = startAge + i;
    const isSolvent = currentBalance > 0;

    // Adjust target income for inflation
    const targetIncome = desiredAnnualIncome * Math.pow(1 + inflationRate, i);

    // Calculate Age Pension for the current asset level
    const pensionResult = calculateAgePension({
      age,
      relationshipStatus,
      isHomeowner,
      financialAssets: currentBalance,
      otherAssessableAssets,
      otherFortnightlyIncome: 0,
    });

    const agePension = isSolvent || age >= AGE_PENSION_CONSTANTS.qualifyingAge
      ? pensionResult.annualAgePension
      : 0;
    lifetimePension += agePension;

    // Minimum statutory drawdown rule
    const minRate = getMinimumDrawdownRate(age);
    const minRequired = currentBalance * minRate;

    // Actual drawdown needed to meet lifestyle target
    const deficitAfterPension = Math.max(0, targetIncome - agePension);
    const actualDrawdown = Math.max(minRequired, deficitAfterPension);
    const cappedDrawdown = Math.min(currentBalance, actualDrawdown);

    totalDrawdowns += cappedDrawdown;

    // Calculate investment earnings on remaining balance (0% tax in pension phase)
    const investmentEarnings = Math.max(0, (currentBalance - cappedDrawdown) * expectedAnnualReturn);
    const endingBalance = Math.max(0, currentBalance - cappedDrawdown + investmentEarnings);

    if (isSolvent && endingBalance <= 0 && exhaustionAge === null) {
      exhaustionAge = age;
    }

    if (isSolvent) {
      sustainableYears++;
    }

    schedule.push({
      age,
      startingBalance: Math.round(currentBalance),
      drawdownAmount: Math.round(cappedDrawdown),
      minimumRequiredDrawdown: Math.round(minRequired),
      investmentEarnings: Math.round(investmentEarnings),
      agePensionAmount: Math.round(agePension),
      totalIncome: Math.round(cappedDrawdown + agePension),
      endingBalance: Math.round(endingBalance),
      isSolvent,
    });

    currentBalance = endingBalance;
    maxProjectedBalance = Math.max(maxProjectedBalance, currentBalance);
  }

  const bequestValue = schedule.find(s => s.age === 95)?.endingBalance ?? 0;

  return {
    sustainableYears,
    exhaustionAge,
    lifetimeAgePensionReceived: Math.round(lifetimePension),
    totalDrawdownPaid: Math.round(totalDrawdowns),
    bequestValueAtAge95: Math.round(bequestValue),
    isFullySustainableTo100: exhaustionAge === null,
    lumpSumWithdrawn: Math.round(lumpSum),
    maxProjectedBalance: Math.round(maxProjectedBalance),
    schedule,
  };
}

// ─── Transfer Balance Cap Warning ─────────────────────────────────────────────

/**
 * Check a projected super balance against the general Transfer Balance Cap.
 * Balances above the cap are not eligible for tax-free pension treatment and
 * must be moved out of the retirement phase.
 *
 * Assumptions:
 * - Uses SUPER_RULES.transferBalanceCap ($1.9M general cap).
 *
 * @param projectedBalance - Projected super balance ($)
 * @param age - Member age (reserved for future age-based cap indexation)
 */
export function transferBalanceCapCheck(
  projectedBalance: number,
  age: number,
): TransferBalanceCapCheck {
  void age;
  const cap = SUPER_RULES.transferBalanceCap;
  const excess = Math.max(0, projectedBalance - cap);
  return {
    cap,
    overCap: excess > 0,
    excess,
  };
}

// ─── Market Sequence Simulation ───────────────────────────────────────────────

/**
 * Deterministic pseudo-random generator (mulberry32). Produces the same
 * sequence for the same seed — essential for shareable, reproducible plans.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate `count` annual return sequences of length `years` from a normal
 * distribution (Box–Muller transform over a seeded PRNG). Returns are
 * decimals (e.g. 0.07 for +7%).
 *
 * @param years - Length of each sequence
 * @param count - Number of sequences
 * @param meanReturn - Mean annual return as a decimal (e.g. 0.065)
 * @param volatility - Annualised volatility as a decimal (e.g. 0.12)
 * @param seed - Seed for reproducible sequences
 */
export function generateReturnSequences(
  years: number,
  count: number,
  meanReturn: number,
  volatility: number,
  seed: number,
): number[][] {
  const rand = mulberry32(seed);
  const sequences: number[][] = [];

  for (let s = 0; s < count; s++) {
    const seq: number[] = [];
    for (let y = 0; y < years; y++) {
      // Box–Muller
      const u1 = Math.max(rand(), 1e-12);
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      seq.push(meanReturn + z * volatility);
    }
    sequences.push(seq);
  }
  return sequences;
}

/**
 * Run a single drawdown trajectory against a given sequence of annual returns
 * (decimals, e.g. [0.08, -0.05, ...]). Mirrors `simulateRetirementPlan` but
 * replaces the constant return with the sequence; the Age Pension is excluded
 * so the fan chart isolates market-sequence risk on the super balance.
 *
 * Assumptions:
 * - Target income is indexed by `inflationRate` each year.
 * - Drawdown is at least the Schedule 7 minimum and is capped by the balance.
 * - Returns apply to the post-drawdown balance; negative returns reduce it.
 * - Balances floor at zero.
 *
 * @returns Ending balance per year (length = projectionYears)
 */
export function simulateDrawdownSequence(
  params: RetirementPlanParams,
  annualReturns: number[],
): number[] {
  const {
    retirementAge,
    desiredAnnualIncome,
    inflationRate,
    projectionYears = 35,
    lumpSumWithdrawal = 0,
  } = params;

  let balance = Math.max(0, params.superBalanceAtRetirement - Math.max(0, lumpSumWithdrawal));
  const balances: number[] = [];

  for (let i = 0; i < projectionYears; i++) {
    if (balance <= 0) {
      balances.push(0);
      continue;
    }
    const age = retirementAge + i;
    const targetIncome = desiredAnnualIncome * Math.pow(1 + inflationRate, i);
    const minRequired = balance * getMinimumDrawdownRate(age);
    const drawdown = Math.min(balance, Math.max(minRequired, targetIncome));
    const growthRate = annualReturns[i] ?? 0;
    const earnings = (balance - drawdown) * growthRate;
    balance = Math.max(0, balance - drawdown + earnings);
    balances.push(Math.round(balance));
  }

  return balances;
}

/**
 * Build a Monte Carlo fan (p10/p25/p50/p75/p90 per year) from many drawdown
 * trajectories — feed the output straight into MonteCarloFanChart.
 *
 * @param params - Retirement plan parameters
 * @param returnSequences - One array of annual returns per simulation
 */
export function monteCarloDrawdownFan(
  params: RetirementPlanParams,
  returnSequences: number[][],
): PercentileFanPoint[] {
  if (returnSequences.length === 0) return [];

  const trajectories = returnSequences.map(seq => simulateDrawdownSequence(params, seq));
  const years = trajectories[0].length;
  const fan: PercentileFanPoint[] = [];

  for (let y = 0; y < years; y++) {
    const values = trajectories
      .map(t => t[y] ?? 0)
      .sort((a, b) => a - b);
    fan.push({
      year: y + 1,
      p10: percentile(values, 0.10),
      p25: percentile(values, 0.25),
      p50: percentile(values, 0.50),
      p75: percentile(values, 0.75),
      p90: percentile(values, 0.90),
    });
  }
  return fan;
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

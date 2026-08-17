/**
 * Superannuation Retirement Drawdown & Centrelink Age Pension Means Test Engine
 * Implements Schedule 7 SISR minimum drawdowns, 0% ECPI tax rate, TBC indexation,
 * and dual Means Test (Assets Test + Deeming Income Test) for Singles and Couples.
 */

import { getMinimumDrawdownRate } from '../../data/super-rules';

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
}

export interface RetirementPlanResult {
  sustainableYears: number;
  exhaustionAge: number | null;
  lifetimeAgePensionReceived: number;
  totalDrawdownPaid: number;
  bequestValueAtAge95: number;
  isFullySustainableTo100: boolean;
  schedule: SuperDrawdownYearRow[];
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
  } = params;

  let currentBalance = superBalanceAtRetirement;
  let lifetimePension = 0;
  let totalDrawdowns = 0;
  let exhaustionAge: number | null = null;
  let sustainableYears = 0;

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
  }

  const bequestValue = schedule.find(s => s.age === 95)?.endingBalance ?? 0;

  return {
    sustainableYears,
    exhaustionAge,
    lifetimeAgePensionReceived: Math.round(lifetimePension),
    totalDrawdownPaid: Math.round(totalDrawdowns),
    bequestValueAtAge95: Math.round(bequestValue),
    isFullySustainableTo100: exhaustionAge === null,
    schedule,
  };
}

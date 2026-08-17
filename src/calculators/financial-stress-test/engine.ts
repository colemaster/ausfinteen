/**
 * Emergency Fund Runway, HISA vs Offset Arbitrage, & Stress Testing Engine
 * Implements pre-tax yield arbitrage, JobSeeker LAWP waiting period, APRA +300 bps shocks,
 * and 100-point 5-pillar Financial Health & Fragility Score.
 */

import { getCombinedMarginalRate } from '../../data/tax-brackets';

export interface StressTestParams {
  grossAnnualIncome: number;
  monthlyNetIncome: number;
  monthlyEssentialExpenses: number;    // Rent/mortgage, utilities, food, transport, insurance
  monthlyDiscretionaryExpenses: number;// Dining out, entertainment, shopping
  liquidCashSavings: number;           // HISA / bank accounts
  mortgageOffsetBalance: number;
  mortgageDebtBalance: number;
  currentMortgageInterestRate: number; // e.g. 0.062 (6.2%)
  hisaInterestRate: number;            // e.g. 0.0525 (5.25%)
  hasPrivateHospitalCover: boolean;
  relationshipStatus: 'single' | 'couple';
  dependentsCount: number;
  hasIncomeProtectionInsurance: boolean;
}

export interface StressScenarioImpact {
  scenarioName: string;
  monthlyDeficitOrSurplus: number;
  survivingMonths: number;
  isFatal: boolean;
  notes: string;
}

export interface FinancialHealthScoreBreakdown {
  runwayScore: number;          // /25
  debtServiceScore: number;     // /25
  savingsRateScore: number;     // /20
  rateShockScore: number;       // /15
  safetyNetScore: number;       // /15
  totalScore: number;           // /100
  rating: 'Invincible' | 'Resilient' | 'Moderate' | 'Vulnerable' | 'Critical';
}

export interface StressTestResult {
  emergencyRunwayMonths: number;
  bareBonesRunwayMonths: number; // If discretionary spending cut to $0
  preTaxEquivalentOffsetYield: number;
  hisaNetReturnAfterTax: number;
  offsetArbitrageAdvantagePerYear: number;
  jobSeekerLAWPWeeks: number;
  scenarios: {
    jobLossScenario: StressScenarioImpact;
    apraRateShockPlus300bps: StressScenarioImpact;
    inflationSurgeScenario: StressScenarioImpact;
    largeEmergencyExpenseScenario: StressScenarioImpact;
  };
  healthScore: FinancialHealthScoreBreakdown;
}

/**
 * Calculate the Centrelink Liquid Assets Waiting Period (LAWP) in weeks.
 */
export function calcJobSeekerLAWP(liquidAssets: number, isSingle: boolean, hasDependents: boolean): number {
  const threshold = (isSingle && !hasDependents) ? 5500 : 11000;
  const maxThreshold = (isSingle && !hasDependents) ? 11500 : 23000;

  if (liquidAssets <= threshold) return 0;
  if (liquidAssets >= maxThreshold) return 13; // Max 13 weeks waiting period

  const excess = liquidAssets - threshold;
  const unit = (isSingle && !hasDependents) ? 500 : 1000;
  return Math.min(13, Math.ceil(excess / unit));
}

/**
 * Run full emergency fund stress test and financial fragility evaluation.
 */
export function runFinancialStressTest(params: StressTestParams): StressTestResult {
  const {
    grossAnnualIncome,
    monthlyNetIncome,
    monthlyEssentialExpenses,
    monthlyDiscretionaryExpenses,
    liquidCashSavings,
    mortgageOffsetBalance,
    mortgageDebtBalance,
    currentMortgageInterestRate,
    hisaInterestRate,
    hasPrivateHospitalCover,
    relationshipStatus,
    dependentsCount,
    hasIncomeProtectionInsurance,
  } = params;

  const totalLiquid = liquidCashSavings + mortgageOffsetBalance;
  const totalMonthlyExpenses = monthlyEssentialExpenses + monthlyDiscretionaryExpenses;
  const monthlySavings = Math.max(0, monthlyNetIncome - totalMonthlyExpenses);
  const savingsRate = monthlyNetIncome > 0 ? monthlySavings / monthlyNetIncome : 0;

  // 1. Runway Calculation
  const emergencyRunwayMonths = totalMonthlyExpenses > 0
    ? totalLiquid / totalMonthlyExpenses
    : 99;
  const bareBonesRunwayMonths = monthlyEssentialExpenses > 0
    ? totalLiquid / monthlyEssentialExpenses
    : 99;

  // 2. HISA vs Offset Pre-tax Yield Arbitrage
  const combinedMTR = getCombinedMarginalRate(grossAnnualIncome);
  const preTaxEquivalentOffsetYield = currentMortgageInterestRate / Math.max(0.01, 1 - combinedMTR);
  const hisaNetReturnAfterTax = hisaInterestRate * (1 - combinedMTR);
  const netRateDifference = currentMortgageInterestRate - hisaNetReturnAfterTax;
  const offsetArbitrageAdvantagePerYear = Math.round(liquidCashSavings * netRateDifference);

  // 3. Centrelink JobSeeker LAWP
  const jobSeekerLAWPWeeks = calcJobSeekerLAWP(
    totalLiquid,
    relationshipStatus === 'single',
    dependentsCount > 0
  );

  // 4. Stress Scenarios
  // A. Job Loss (0% income, living on essential expenses only)
  const jobLossSurplus = -monthlyEssentialExpenses;
  const jobLossMonths = monthlyEssentialExpenses > 0 ? totalLiquid / monthlyEssentialExpenses : 99;
  const jobLossScenario: StressScenarioImpact = {
    scenarioName: 'Sudden Job Loss (0% Income)',
    monthlyDeficitOrSurplus: Math.round(jobLossSurplus),
    survivingMonths: Math.round(jobLossMonths * 10) / 10,
    isFatal: jobLossMonths < 3,
    notes: hasIncomeProtectionInsurance
      ? 'Covered by Income Protection policy after waiting period.'
      : `Liquid funds last ${Math.round(jobLossMonths)} months under bare-bones spending.`,
  };

  // B. APRA +300 bps (+3.0%) Interest Rate Shock
  const extraAnnualInterest = (mortgageDebtBalance - mortgageOffsetBalance) * 0.03;
  const extraMonthlyInterest = Math.max(0, extraAnnualInterest / 12);
  const rateShockNetCashflow = monthlyNetIncome - totalMonthlyExpenses - extraMonthlyInterest;
  const rateShockScenario: StressScenarioImpact = {
    scenarioName: 'APRA +300 bps Interest Rate Hike',
    monthlyDeficitOrSurplus: Math.round(rateShockNetCashflow),
    survivingMonths: rateShockNetCashflow >= 0 ? 99 : Math.round(totalLiquid / Math.abs(rateShockNetCashflow)),
    isFatal: rateShockNetCashflow < 0 && totalLiquid < Math.abs(rateShockNetCashflow) * 6,
    notes: rateShockNetCashflow >= 0
      ? 'Monthly cashflow remains positive despite +$300bps rate hike.'
      : `Deficit of $${Math.round(Math.abs(rateShockNetCashflow))}/mo caused by rate rise.`,
  };

  // C. Inflation Shock (+10% on essential living expenses)
  const extraMonthlyInflation = monthlyEssentialExpenses * 0.10;
  const inflationSurplus = monthlyNetIncome - (totalMonthlyExpenses + extraMonthlyInflation);
  const inflationSurvivingMonths = inflationSurplus >= 0 ? 99 : Math.round(totalLiquid / Math.abs(inflationSurplus));
  const inflationSurgeScenario: StressScenarioImpact = {
    scenarioName: '10% Inflation Surge on Essentials',
    monthlyDeficitOrSurplus: Math.round(inflationSurplus),
    survivingMonths: inflationSurvivingMonths,
    isFatal: inflationSurvivingMonths < 6,
    notes: inflationSurplus >= 0
      ? 'Budget easily absorbs $+' + Math.round(extraMonthlyInflation) + '/mo inflation surge.'
      : 'Requires trimming discretionary spending to maintain savings.',
  };

  // D. Large Unplanned Emergency Expense ($10,000 car/medical shock)
  const emergencyAmount = 10000;
  const remainingAfterShock = totalLiquid - emergencyAmount;
  const largeEmergencyExpenseScenario: StressScenarioImpact = {
    scenarioName: '$10,000 Sudden Emergency Expense',
    monthlyDeficitOrSurplus: monthlySavings,
    survivingMonths: totalMonthlyExpenses > 0 ? Math.max(0, remainingAfterShock) / totalMonthlyExpenses : 99,
    isFatal: remainingAfterShock < 0,
    notes: remainingAfterShock >= 0
      ? `Buffer absorbs $10k shock with $${Math.round(remainingAfterShock).toLocaleString()} liquid reserves remaining.`
      : 'Insufficient cash reserves to fund a $10,000 emergency expense without debt!',
  };

  // 5. 100-Point 5-Pillar Score
  let runwayScore = 0;
  if (bareBonesRunwayMonths >= 12) runwayScore = 25;
  else if (bareBonesRunwayMonths >= 6) runwayScore = 20;
  else if (bareBonesRunwayMonths >= 3) runwayScore = 12;
  else if (bareBonesRunwayMonths >= 1) runwayScore = 5;

  let debtServiceScore = 25;
  if (mortgageDebtBalance > 0 && monthlyNetIncome > 0) {
    const dtiRatio = (monthlyEssentialExpenses / monthlyNetIncome);
    if (dtiRatio <= 0.30) debtServiceScore = 25;
    else if (dtiRatio <= 0.40) debtServiceScore = 18;
    else if (dtiRatio <= 0.50) debtServiceScore = 10;
    else debtServiceScore = 2;
  }

  let savingsRateScore = 0;
  if (savingsRate >= 0.35) savingsRateScore = 20;
  else if (savingsRate >= 0.20) savingsRateScore = 15;
  else if (savingsRate >= 0.10) savingsRateScore = 10;
  else if (savingsRate > 0) savingsRateScore = 5;

  let rateShockScore = rateShockNetCashflow >= 0 ? 15 : (totalLiquid >= Math.abs(rateShockNetCashflow) * 12 ? 10 : 2);

  let safetyNetScore = 0;
  if (hasPrivateHospitalCover) safetyNetScore += 7;
  if (hasIncomeProtectionInsurance) safetyNetScore += 8;

  const totalScore = runwayScore + debtServiceScore + savingsRateScore + rateShockScore + safetyNetScore;

  let rating: 'Invincible' | 'Resilient' | 'Moderate' | 'Vulnerable' | 'Critical' = 'Moderate';
  if (totalScore >= 90) rating = 'Invincible';
  else if (totalScore >= 75) rating = 'Resilient';
  else if (totalScore >= 55) rating = 'Moderate';
  else if (totalScore >= 35) rating = 'Vulnerable';
  else rating = 'Critical';

  return {
    emergencyRunwayMonths: Math.round(emergencyRunwayMonths * 10) / 10,
    bareBonesRunwayMonths: Math.round(bareBonesRunwayMonths * 10) / 10,
    preTaxEquivalentOffsetYield: Math.round(preTaxEquivalentOffsetYield * 1000) / 10,
    hisaNetReturnAfterTax: Math.round(hisaNetReturnAfterTax * 1000) / 10,
    offsetArbitrageAdvantagePerYear,
    jobSeekerLAWPWeeks,
    scenarios: {
      jobLossScenario,
      apraRateShockPlus300bps: rateShockScenario,
      inflationSurgeScenario,
      largeEmergencyExpenseScenario,
    },
    healthScore: {
      runwayScore,
      debtServiceScore,
      savingsRateScore,
      rateShockScore,
      safetyNetScore,
      totalScore,
      rating,
    },
  };
}

/**
 * Emergency Fund Runway, HISA vs Offset Arbitrage, & Stress Testing Engine
 * Implements pre-tax yield arbitrage, JobSeeker LAWP waiting period, APRA +300 bps shocks,
 * and 100-point 5-pillar Financial Health & Fragility Score.
 */

import { getCombinedMarginalRate } from '../../data/tax-brackets';
import { monthlyRepayment } from '../../utils/financial';

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

export interface ReverseStressResult {
  maxRate: number;             // highest annual rate % the borrower survives
  maxRateIncreasePts: number;  // percentage points above currentRate
  monthlyRepaymentAtMax: number;
  surplusAtMax: number;        // monthly income − expenses − repayment at maxRate
  survivesAnyRise: boolean;
  capped: boolean;             // true when the search ceiling was hit without failing
  ceiling: number;             // rate % at which the search stops
}

/**
 * Reverse stress test: find the maximum interest rate rise the borrower can
 * survive, given monthly income and expenses (excluding the mortgage
 * repayment, which is computed for each candidate rate).
 *
 * @param monthlyIncome - Monthly after-tax income (AUD)
 * @param monthlyExpenses - Monthly expenses excluding mortgage repayment (AUD)
 * @param loan - Outstanding mortgage balance (AUD)
 * @param currentRate - Current annual rate as a percentage (e.g. 6.2)
 * @param loanTermYears - Remaining loan term in years (default 30)
 * @param bufferPct - Additional buffer on the repayment (e.g. 3 for +3%)
 * @param ceilingPct - Search ceiling above currentRate in percentage points (default 20)
 *
 * Assumptions:
 * - P&I repayments, monthly compounding, rate held at each candidate level.
 * - Borrower survives a rate if income ≥ expenses + repayment × (1 + buffer).
 * - Binary search over [currentRate, currentRate + ceilingPct].
 */
export function maxSurvivableRate(
  monthlyIncome: number,
  monthlyExpenses: number,
  loan: number,
  currentRate: number,
  loanTermYears = 30,
  bufferPct = 0,
  ceilingPct = 20,
): ReverseStressResult {
  const ceiling = currentRate + ceilingPct;
  const surplus = (rate: number): number => {
    const repayment = monthlyRepayment(loan, rate, loanTermYears) * (1 + bufferPct / 100);
    return monthlyIncome - monthlyExpenses - repayment;
  };

  // Cannot even survive at the current rate
  if (surplus(currentRate) < 0) {
    return {
      maxRate: currentRate,
      maxRateIncreasePts: 0,
      monthlyRepaymentAtMax: Math.round(monthlyRepayment(loan, currentRate, loanTermYears)),
      surplusAtMax: Math.round(surplus(currentRate)),
      survivesAnyRise: false,
      capped: false,
      ceiling,
    };
  }

  // Survives everywhere up to the ceiling
  if (surplus(ceiling) >= 0) {
    return {
      maxRate: ceiling,
      maxRateIncreasePts: Math.round((ceiling - currentRate) * 100) / 100,
      monthlyRepaymentAtMax: Math.round(monthlyRepayment(loan, ceiling, loanTermYears)),
      surplusAtMax: Math.round(surplus(ceiling)),
      survivesAnyRise: true,
      capped: true,
      ceiling,
    };
  }

  // Binary search for the highest survivable rate (surplus is monotone falling)
  let lo = currentRate;
  let hi = ceiling;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (surplus(mid) >= 0) lo = mid;
    else hi = mid;
  }

  return {
    maxRate: Math.round(lo * 100) / 100,
    maxRateIncreasePts: Math.round((lo - currentRate) * 100) / 100,
    monthlyRepaymentAtMax: Math.round(monthlyRepayment(loan, lo, loanTermYears)),
    surplusAtMax: Math.round(surplus(lo)),
    survivesAnyRise: true,
    capped: false,
    ceiling,
  };
}

export interface CumulativeScenarioInput {
  monthlyNetIncome: number;
  monthlyEssentialExpenses: number;
  monthlyDiscretionaryExpenses: number;
  mortgageDebtBalance: number;
  mortgageOffsetBalance: number;
  currentMortgageInterestRate: number;  // decimal (e.g. 0.062)
  liquidCashSavings: number;
  /** Interest rate rise in percentage points (e.g. 2 for +2%). */
  rateRisePct: number;
  /** Months of total job loss applied to the scenario (0 = no job loss). */
  jobLossMonths: number;
  /** Expense shock as % of total monthly expenses (e.g. 10 for +10%). */
  expenseShockPct: number;
  /** Repayment buffer as % of the mortgage repayment (e.g. 3 for +3%). */
  bufferPct: number;
}

export interface CumulativeScenarioResult {
  effectiveRate: number;          // current + rise (decimal)
  extraMonthlyInterest: number;
  expenseShockMonthly: number;
  repaymentBufferMonthly: number;
  monthlySurplusAfterShocks: number;
  isFatal: boolean;
  survivingMonths: number;        // liquid ÷ monthly burn while income is lost
  notes: string;
}

/**
 * Apply cumulative scenario presets (rate rise + job loss + expense shock +
 * repayment buffer) to a borrower's monthly cashflow.
 *
 * Assumptions:
 * - `monthlyEssentialExpenses` already includes the current mortgage
 *   repayment (consistent with runFinancialStressTest), so a rate rise only
 *   adds the incremental interest on the rate rise and the optional buffer —
 *   it does not re-price the full repayment.
 * - During job-loss months income is $0; runway = liquid funds ÷ monthly burn.
 * - Offset balance fully offsets interest for the incremental calculation.
 */
export function applyCumulativeScenarios(input: CumulativeScenarioInput): CumulativeScenarioResult {
  const effectiveRate = input.currentMortgageInterestRate + input.rateRisePct / 100;
  const netDebt = Math.max(0, input.mortgageDebtBalance - input.mortgageOffsetBalance);
  const baseRepayment = monthlyRepayment(netDebt, input.currentMortgageInterestRate * 100, 30);
  const repaymentBufferMonthly = baseRepayment * (input.bufferPct / 100);
  const extraMonthlyInterest = Math.max(0, netDebt * (input.rateRisePct / 100) / 12);

  const totalExpenses = input.monthlyEssentialExpenses + input.monthlyDiscretionaryExpenses;
  const expenseShockMonthly = totalExpenses * (input.expenseShockPct / 100);

  const income = input.jobLossMonths > 0 ? 0 : input.monthlyNetIncome;
  const outgoings =
    totalExpenses +
    extraMonthlyInterest +
    repaymentBufferMonthly +
    expenseShockMonthly;
  const monthlySurplusAfterShocks = income - outgoings;

  const totalLiquid = input.liquidCashSavings + input.mortgageOffsetBalance;
  const burn = Math.max(0, outgoings - income);
  const survivingMonths =
    input.jobLossMonths > 0
      ? burn > 0
        ? Math.round((totalLiquid / burn) * 10) / 10
        : 99
      : monthlySurplusAfterShocks >= 0
        ? 99
        : Math.round((totalLiquid / Math.abs(monthlySurplusAfterShocks)) * 10) / 10;

  const isFatal =
    (input.jobLossMonths > 0 && burn > totalLiquid) ||
    (input.jobLossMonths === 0 && monthlySurplusAfterShocks < 0 && totalLiquid < Math.abs(monthlySurplusAfterShocks) * 6);

  const parts: string[] = [];
  if (input.rateRisePct > 0) parts.push(`+${input.rateRisePct}% rate rise (${(effectiveRate * 100).toFixed(1)}%)`);
  if (input.jobLossMonths > 0) parts.push(`${input.jobLossMonths}-month job loss`);
  if (input.expenseShockPct > 0) parts.push(`+${input.expenseShockPct}% expense shock`);
  if (input.bufferPct > 0) parts.push(`+${input.bufferPct}% repayment buffer`);
  const summary = parts.length > 0 ? parts.join(' + ') : 'No shocks applied';

  return {
    effectiveRate,
    extraMonthlyInterest: Math.round(extraMonthlyInterest),
    expenseShockMonthly: Math.round(expenseShockMonthly),
    repaymentBufferMonthly: Math.round(repaymentBufferMonthly),
    monthlySurplusAfterShocks: Math.round(monthlySurplusAfterShocks),
    isFatal,
    survivingMonths,
    notes: isFatal
      ? `Fatal under: ${summary}. Runway exhausted in ${survivingMonths === 99 ? 'forever' : `${survivingMonths} months`}.`
      : `Survives under: ${summary}${survivingMonths === 99 ? ' — cashflow stays positive.' : ` — reserves last ${survivingMonths} months.`}`,
  };
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

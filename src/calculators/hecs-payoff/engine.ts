/**
 * HECS-HELP Loan Payoff vs Investing vs Offset vs HISA Financial Engine
 * Implements the 2024-25 19-tier legacy system and the 2026-27 3-tier
 * marginal system ($69,528 threshold), min(CPI, WPI) indexation cap,
 * retrospective indexation adjustments (2023/2024), voluntary payoff comparison,
 * and APRA borrowing capacity impact.
 *
 * Compulsory marginal rates are sourced from HELP_REPAYMENT_THRESHOLDS_2026_27
 * in src/data/constants.ts (the single source of truth) — never hardcoded.
 */

import {
  HELP_DEBT_REDUCTION_2025,
  calcHELPRepayment,
} from '../../data/constants';
import { getCombinedMarginalRate } from '../../data/tax-brackets';

export interface HECSYearRow {
  year: number;
  startingBalance: number;
  salary: number;
  compulsoryRepayment: number;
  voluntaryRepayment: number;
  indexationAmount: number;
  endingBalance: number;
  offsetBalance: number;
  etfBalance: number;
  hisaBalance: number;
  netWealthDifference: number;
}

export interface HECSPayoffParams {
  currentDebt: number;
  annualIncome: number;
  incomeGrowthRate: number;      // e.g. 0.03 for 3% p.a.
  indexationRate: number;        // e.g. 0.028 for 2.8% min(CPI, WPI)
  lumpSumAvailable: number;      // e.g. 10000
  monthlyVoluntaryPayment: number;
  mortgageRate: number;          // e.g. 0.062 for 6.2%
  etfExpectedReturn: number;     // e.g. 0.08 for 8.0%
  hisaRate?: number;             // e.g. 0.05 for 5.0%
  useMarginal2025System: boolean; // 2026-27 marginal system vs 2024 tier system
  projectionYears?: number;
}

export interface HECSPayoffResult {
  compulsoryPayoffYears: number;
  totalIndexationCompulsoryOnly: number;
  totalRepaidCompulsoryOnly: number;
  voluntaryPayoffYears: number;
  totalIndexationWithVoluntary: number;
  totalRepaidWithVoluntary: number;
  yearsSaved: number;
  interestIndexationSaved: number;
  apraBorrowingCapacityImpact: number; // reduction in home loan borrowing capacity
  finalWealthVoluntaryPayoff: number;
  finalWealthMortgageOffset: number;
  finalWealthETFInvesting: number;
  finalWealthHISA: number;
  hisaNetRateAfterTax: number;
  optimalStrategy: 'voluntary_payoff' | 'mortgage_offset' | 'invest_etf' | 'hisa_savings';
  schedule: HECSYearRow[];
}



/**
 * Calculate compulsory HELP repayment under the 2026-27 3-tier marginal system
 * ($69,528 threshold). Delegated directly to calcHELPRepayment in src/data/constants.ts
 * for exact statutory ATO compliance without bracket rounding discrepancies.
 */
export function calcMarginalHECSRepayment(repaymentIncome: number): number {
  if (repaymentIncome <= 0 || isNaN(repaymentIncome)) return 0;
  return calcHELPRepayment(repaymentIncome);
}

/**
 * Calculate compulsory HECS repayment under the 2024-25 19-tier system.
 */
export function calcLegacyTierHECSRepayment(repaymentIncome: number): number {
  if (repaymentIncome <= 0 || isNaN(repaymentIncome) || repaymentIncome < 54435) return 0;
  if (repaymentIncome <= 62850) return repaymentIncome * 0.010;
  if (repaymentIncome <= 66620) return repaymentIncome * 0.020;
  if (repaymentIncome <= 70618) return repaymentIncome * 0.025;
  if (repaymentIncome <= 74855) return repaymentIncome * 0.030;
  if (repaymentIncome <= 79346) return repaymentIncome * 0.035;
  if (repaymentIncome <= 84107) return repaymentIncome * 0.040;
  if (repaymentIncome <= 89154) return repaymentIncome * 0.045;
  if (repaymentIncome <= 94503) return repaymentIncome * 0.050;
  if (repaymentIncome <= 100174) return repaymentIncome * 0.055;
  if (repaymentIncome <= 106185) return repaymentIncome * 0.060;
  if (repaymentIncome <= 112556) return repaymentIncome * 0.065;
  if (repaymentIncome <= 119309) return repaymentIncome * 0.070;
  if (repaymentIncome <= 126467) return repaymentIncome * 0.075;
  if (repaymentIncome <= 134056) return repaymentIncome * 0.080;
  if (repaymentIncome <= 142100) return repaymentIncome * 0.085;
  if (repaymentIncome <= 150626) return repaymentIncome * 0.090;
  if (repaymentIncome <= 159663) return repaymentIncome * 0.095;
  return repaymentIncome * 0.100;
}

export function calcHECSRepayment(income: number, useMarginal = true): number {
  if (income <= 0 || isNaN(income)) return 0;
  return useMarginal ? calcMarginalHECSRepayment(income) : calcLegacyTierHECSRepayment(income);
}

/**
 * Run full simulation comparing HECS payoff vs Offset vs ETF vs HISA.
 */
export function simulateHECSPayoff(params: HECSPayoffParams): HECSPayoffResult {
  const {
    currentDebt: rawDebt,
    annualIncome: rawIncome,
    incomeGrowthRate,
    indexationRate,
    lumpSumAvailable: rawLumpSum,
    monthlyVoluntaryPayment: rawMonthlyVoluntary,
    mortgageRate,
    etfExpectedReturn,
    hisaRate = 0.05,
    useMarginal2025System,
    projectionYears = 20,
  } = params;

  const currentDebt = Math.max(0, rawDebt);
  const annualIncome = Math.max(0, rawIncome);
  const lumpSumAvailable = Math.max(0, rawLumpSum);
  const monthlyVoluntaryPayment = Math.max(0, rawMonthlyVoluntary);
  const yearsToProject = Math.max(1, projectionYears);

  // 1. Calculate borrowing capacity impact (APRA standard ~9.5x annual repayment)
  // Only applies if the borrower currently has an outstanding HELP debt.
  const initialAnnualRepayment = currentDebt > 0 ? calcHECSRepayment(annualIncome, useMarginal2025System) : 0;
  const apraBorrowingCapacityImpact = Math.round(initialAnnualRepayment * 9.5);

  // 2. Compulsory Only Simulation
  let compDebt = currentDebt;
  let compIncome = annualIncome;
  let compYears = 0;
  let compTotalIndexation = 0;
  let compTotalRepaid = 0;

  if (currentDebt > 0) {
    for (let yr = 1; yr <= 50; yr++) {
      if (compDebt <= 0) break;
      compYears = yr;
      const repayment = Math.min(compDebt, calcHECSRepayment(compIncome, useMarginal2025System));
      compTotalRepaid += repayment;
      const balanceAfterRepayment = Math.max(0, compDebt - repayment);
      const indexation = balanceAfterRepayment > 0 ? balanceAfterRepayment * indexationRate : 0;
      compTotalIndexation += indexation;
      compDebt = balanceAfterRepayment + indexation;
      compIncome *= (1 + incomeGrowthRate);
    }
  }

  // 3. Multi-Scenario Simulation Over Projection Years
  const initialLumpSumApplied = Math.min(currentDebt, lumpSumAvailable);
  let volDebt = Math.max(0, currentDebt - initialLumpSumApplied);
  let volTotalIndexation = 0;
  let volTotalRepaid = initialLumpSumApplied;
  let volYears = (currentDebt === 0 || initialLumpSumApplied >= currentDebt) ? 0 : 0;
  let volPaidOff = volDebt <= 0;

  let simIncome = annualIncome;
  let offsetBalance = lumpSumAvailable;
  let etfBalance = lumpSumAvailable;
  let hisaBalance = lumpSumAvailable;
  let postPayoffInvestmentWealth = 0;

  const schedule: HECSYearRow[] = [];

  for (let yr = 1; yr <= yearsToProject; yr++) {
    const startBal = volDebt;
    const annualVoluntary = monthlyVoluntaryPayment * 12;
    const compulsory = calcHECSRepayment(simIncome, useMarginal2025System);
    const totalRepay = Math.min(volDebt, compulsory + annualVoluntary);

    // Attribute payment between compulsory and voluntary up to remaining debt
    const compulsoryPaid = Math.min(compulsory, totalRepay);
    const voluntaryPaid = totalRepay - compulsoryPaid;

    volTotalRepaid += totalRepay;

    const afterRepayment = Math.max(0, volDebt - totalRepay);
    const indexation = afterRepayment > 0 ? afterRepayment * indexationRate : 0;
    volTotalIndexation += indexation;
    volDebt = afterRepayment + indexation;

    if (!volPaidOff && volDebt <= 0) {
      volYears = yr;
      volPaidOff = true;
    }

    // Cashflow freed up once HECS is paid off
    // If debt cleared this year, only excess cashflow is freed; in subsequent years, full amount is freed
    const freedCashflow = volPaidOff
      ? (startBal > 0 ? (compulsory + annualVoluntary) - totalRepay : (compulsory + annualVoluntary))
      : 0;

    postPayoffInvestmentWealth = (postPayoffInvestmentWealth + freedCashflow) * (1 + etfExpectedReturn);

    // Alternative 1: Mortgage Offset (investing lump sum + monthly voluntary payments)
    offsetBalance = (offsetBalance + annualVoluntary) * (1 + mortgageRate);

    // Alternative 2: ASX ETF Investing (investing lump sum + monthly voluntary payments)
    etfBalance = (etfBalance + annualVoluntary) * (1 + etfExpectedReturn);

    // Alternative 3: HISA Savings (investing lump sum + monthly voluntary payments, taxed at marginal tax rate)
    const marginalTaxRate = getCombinedMarginalRate(simIncome);
    const netHisaRate = Math.max(0, hisaRate * (1 - marginalTaxRate));
    hisaBalance = (hisaBalance + annualVoluntary) * (1 + netHisaRate);

    schedule.push({
      year: yr,
      startingBalance: Math.round(startBal),
      salary: Math.round(simIncome),
      compulsoryRepayment: Math.round(compulsoryPaid),
      voluntaryRepayment: Math.round(voluntaryPaid),
      indexationAmount: Math.round(indexation),
      endingBalance: Math.round(volDebt),
      offsetBalance: Math.round(offsetBalance),
      etfBalance: Math.round(etfBalance),
      hisaBalance: Math.round(hisaBalance),
      netWealthDifference: Math.round(etfBalance - offsetBalance),
    });

    simIncome *= (1 + incomeGrowthRate);
  }

  // If voluntary debt wasn't paid off within projectionYears, simulate forward to find true payoff year (up to 50)
  if (!volPaidOff && volDebt > 0) {
    let extendDebt = volDebt;
    let extendIncome = simIncome;
    for (let yr = yearsToProject + 1; yr <= 50; yr++) {
      const compulsory = calcHECSRepayment(extendIncome, useMarginal2025System);
      const totalRepay = Math.min(extendDebt, compulsory + monthlyVoluntaryPayment * 12);
      volTotalRepaid += totalRepay;
      const after = Math.max(0, extendDebt - totalRepay);
      const idx = after > 0 ? after * indexationRate : 0;
      volTotalIndexation += idx;
      extendDebt = after + idx;
      if (extendDebt <= 0) {
        volYears = yr;
        volPaidOff = true;
        break;
      }
      extendIncome *= (1 + incomeGrowthRate);
    }
    if (!volPaidOff) {
      volYears = 50;
    }
  }

  // Calculate after-tax HISA yield for initial year
  const initialMTR = getCombinedMarginalRate(annualIncome);
  const hisaNetRateAfterTax = Math.round(hisaRate * (1 - initialMTR) * 1000) / 10;

  // Determine optimal strategy
  const finalVol = postPayoffInvestmentWealth;
  const finalOffset = offsetBalance;
  const finalETF = etfBalance;
  const finalHISA = hisaBalance;

  let optimalStrategy: 'voluntary_payoff' | 'mortgage_offset' | 'invest_etf' | 'hisa_savings' = 'invest_etf';
  const highest = Math.max(finalVol, finalOffset, finalETF, finalHISA);
  if (highest === finalETF) {
    optimalStrategy = 'invest_etf';
  } else if (highest === finalOffset) {
    optimalStrategy = 'mortgage_offset';
  } else if (highest === finalVol) {
    optimalStrategy = 'voluntary_payoff';
  } else {
    optimalStrategy = 'hisa_savings';
  }

  return {
    compulsoryPayoffYears: compYears,
    totalIndexationCompulsoryOnly: Math.round(compTotalIndexation),
    totalRepaidCompulsoryOnly: Math.round(compTotalRepaid),
    voluntaryPayoffYears: volYears,
    totalIndexationWithVoluntary: Math.round(volTotalIndexation),
    totalRepaidWithVoluntary: Math.round(volTotalRepaid),
    yearsSaved: Math.max(0, compYears - volYears),
    interestIndexationSaved: Math.max(0, Math.round(compTotalIndexation - volTotalIndexation)),
    apraBorrowingCapacityImpact,
    finalWealthVoluntaryPayoff: Math.round(finalVol),
    finalWealthMortgageOffset: Math.round(finalOffset),
    finalWealthETFInvesting: Math.round(finalETF),
    finalWealthHISA: Math.round(finalHISA),
    hisaNetRateAfterTax,
    optimalStrategy,
    schedule,
  };
}

// ─── Retrospective Indexation Reform ──────────────────────────────────────────

export interface RetrospectiveCreditResult {
  originalEnding: number;
  reformedEnding: number;
  originalIndexation: number;
  reformedIndexation: number;
  creditSaved: number;
}

/**
 * Calculate retrospective HELP indexation adjustments from 1 June 2023.
 * Prior to reform: 7.1% (2023) and 4.7% (2024) CPI indexation.
 * Reformed: 3.2% (2023) and 4.0% (2024) capped at lower of CPI and WPI.
 */
export function calcRetrospectiveIndexationCredit(debt2023: number): RetrospectiveCreditResult {
  const d = Math.max(0, debt2023);
  const old2023Rate = 0.071;
  const old2024Rate = 0.047;
  const reformed2023Rate = 0.032;
  const reformed2024Rate = 0.040;

  const originalEnding = d * (1 + old2023Rate) * (1 + old2024Rate);
  const reformedEnding = d * (1 + reformed2023Rate) * (1 + reformed2024Rate);

  const originalIndexation = Math.round(originalEnding - d);
  const reformedIndexation = Math.round(reformedEnding - d);
  const creditSaved = Math.max(0, originalIndexation - reformedIndexation);

  return {
    originalEnding: Math.round(originalEnding),
    reformedEnding: Math.round(reformedEnding),
    originalIndexation,
    reformedIndexation,
    creditSaved,
  };
}

/**
 * Apply the Australian Universities Accord one-off 20% HELP debt reduction.
 */
export function applyAccordDebtReduction(currentDebt: number): {
  reducedDebt: number;
  amountReduced: number;
} {
  const debt = Math.max(0, currentDebt);
  const amountReduced = Math.round(debt * HELP_DEBT_REDUCTION_2025);
  const reducedDebt = Math.max(0, debt - amountReduced);
  return { reducedDebt, amountReduced };
}

// ─── Indexation Projections ───────────────────────────────────────────────────

/**
 * Project a HELP debt year-by-year given a fixed annual repayment, applying
 * indexation to the remaining balance each year (the min(CPI, WPI) cap is
 * expressed through the caller-supplied indexation rate).
 *
 * Assumptions:
 * - Repayment happens before indexation in each year.
 * - Indexation applies only while a balance remains; balances floor at zero.
 *
 * @param currentDebt - Starting HELP debt ($)
 * @param annualRepayment - Fixed annual repayment ($)
 * @param indexationRate - Annual indexation as a decimal (e.g. 0.028)
 * @param years - Projection horizon
 * @returns Ending debt per year
 */
export function projectDebtWithIndexation(
  currentDebt: number,
  annualRepayment: number,
  indexationRate: number,
  years: number,
): number[] {
  if (years <= 0) return [];
  const series: number[] = [];
  let debt = Math.max(0, currentDebt);

  for (let y = 1; y <= years; y++) {
    debt = Math.max(0, debt - Math.max(0, annualRepayment));
    debt = debt > 0 ? debt * (1 + indexationRate) : 0;
    series.push(Math.round(debt));
  }
  return series;
}

// ─── Pay Down Faster vs Invest Surplus ────────────────────────────────────────

export interface PaydownVsInvestRow {
  year: number;
  /** Debt remaining when the surplus is used to pay down */
  paydownDebt: number;
  /** Debt remaining when the surplus is invested instead */
  investDebt: number;
  /** Investment wealth when the surplus is invested */
  investWealth: number;
}

export interface PaydownVsInvestResult {
  rows: PaydownVsInvestRow[];
  /** Debt remaining after `years` if paying down */
  finalDebtIfPaydown: number;
  /** Debt remaining after `years` if investing (indexation still applies) */
  finalDebtIfInvest: number;
  /** Investment wealth after `years` if investing */
  finalWealthIfInvest: number;
  /**
   * Net position advantage of investing: invest wealth minus the extra debt
   * left behind. Positive = investing wins; negative = pay down wins.
   */
  netAdvantageInvest: number;
}

/**
 * Compare two uses of a monthly surplus when a HELP debt exists:
 * - Pay down faster: every dollar reduces the debt and avoids indexation.
 * - Invest the surplus: debt stays and keeps compounding with indexation
 *   while the surplus grows at the investment return.
 *
 * Assumptions:
 * - No compulsory repayments modelled — this isolates the surplus decision.
 * - Annual compounding for both the debt (indexation) and the investment.
 *
 * @param currentDebt - Starting HELP debt ($)
 * @param monthlySurplus - Monthly surplus cash available ($)
 * @param indexationRate - HELP indexation as a decimal (e.g. 0.028)
 * @param investReturnRate - Expected investment return as a decimal (e.g. 0.08)
 * @param years - Comparison horizon
 */
export function comparePaydownVsInvest(
  currentDebt: number,
  monthlySurplus: number,
  indexationRate: number,
  investReturnRate: number,
  years: number,
): PaydownVsInvestResult {
  const safeDebt = Math.max(0, currentDebt);
  const safeSurplus = Math.max(0, monthlySurplus);
  const annualSurplus = safeSurplus * 12;

  if (years <= 0) {
    return {
      rows: [],
      finalDebtIfPaydown: safeDebt,
      finalDebtIfInvest: safeDebt,
      finalWealthIfInvest: 0,
      netAdvantageInvest: 0,
    };
  }

  let paydownDebt = safeDebt;
  let investDebt = safeDebt;
  let investWealth = 0;
  const rows: PaydownVsInvestRow[] = [];

  for (let y = 1; y <= years; y++) {
    paydownDebt = Math.max(0, paydownDebt - annualSurplus) * (1 + indexationRate);
    investDebt = investDebt * (1 + indexationRate);
    investWealth = (investWealth + annualSurplus) * (1 + investReturnRate);
    rows.push({
      year: y,
      paydownDebt: Math.round(paydownDebt),
      investDebt: Math.round(investDebt),
      investWealth: Math.round(investWealth),
    });
  }

  const finalDebtIfPaydown = Math.round(paydownDebt);
  const finalDebtIfInvest = Math.round(investDebt);
  const finalWealthIfInvest = Math.round(investWealth);

  return {
    rows,
    finalDebtIfPaydown,
    finalDebtIfInvest,
    finalWealthIfInvest,
    netAdvantageInvest: finalWealthIfInvest - (finalDebtIfInvest - finalDebtIfPaydown),
  };
}

// ─── Compulsory vs Voluntary Split ────────────────────────────────────────────

export interface RepaymentSplitRow {
  year: number;
  /** Compulsory repayment via PAYG (marginal 2025 system) ($) */
  compulsory: number;
  /** Voluntary repayment from the monthly surplus ($) */
  voluntary: number;
  /** Indexation added to the remaining balance ($) */
  indexation: number;
  /** Net reduction in debt for the year ($) */
  netReduction: number;
  /** Ending debt balance ($) */
  endingBalance: number;
}

/**
 * Build a year-by-year breakdown of compulsory repayments, voluntary
 * repayments and indexation on a HELP debt — the inputs to the
 * compulsory-vs-voluntary split visual.
 *
 * Assumptions:
 * - Compulsory repayments use the 2026-27 marginal system at the (growing)
 *   income each year.
 * - Voluntary payments are made monthly (annualised); both are capped by the
 *   remaining balance; indexation applies to the balance after repayments.
 *
 * @param currentDebt - Starting HELP debt ($)
 * @param annualIncome - Starting annual income ($)
 * @param incomeGrowthRate - Annual income growth as a decimal (e.g. 0.035)
 * @param indexationRate - HELP indexation as a decimal (e.g. 0.028)
 * @param monthlyVoluntaryPayment - Voluntary monthly repayment ($)
 * @param years - Projection horizon
 */
export function repaymentSplitSchedule(
  currentDebt: number,
  annualIncome: number,
  incomeGrowthRate: number,
  indexationRate: number,
  monthlyVoluntaryPayment: number,
  years: number,
): RepaymentSplitRow[] {
  let debt = Math.max(0, currentDebt);
  if (debt <= 0 || years <= 0) return [];
  let income = Math.max(0, annualIncome);
  const rows: RepaymentSplitRow[] = [];

  for (let yr = 1; yr <= years; yr++) {
    const compulsory = calcHECSRepayment(income, true);
    const voluntary = Math.max(0, monthlyVoluntaryPayment) * 12;
    const totalRepay = Math.min(debt, compulsory + voluntary);
    const compulsoryPaid = Math.min(compulsory, totalRepay);
    const voluntaryPaid = totalRepay - compulsoryPaid;

    const afterRepayment = Math.max(0, debt - totalRepay);
    const indexation = afterRepayment > 0 ? afterRepayment * indexationRate : 0;
    debt = afterRepayment + indexation;

    rows.push({
      year: yr,
      compulsory: Math.round(compulsoryPaid),
      voluntary: Math.round(voluntaryPaid),
      indexation: Math.round(indexation),
      netReduction: Math.round(totalRepay - indexation),
      endingBalance: Math.round(debt),
    });

    income *= (1 + incomeGrowthRate);
    if (debt <= 0) break;
  }
  return rows;
}

// ─── Indexation Scenario Comparison ───────────────────────────────────────────

export interface IndexationScenarioRow {
  /** Annual indexation rate as a decimal (e.g. 0.028) */
  indexationRate: number;
  /** Years to pay off the debt with voluntary payments */
  payoffYears: number;
  /** Total indexation paid over the payoff period ($) */
  totalIndexation: number;
  /** Total repayments (compulsory + voluntary + lump sum) ($) */
  totalRepaid: number;
}

/**
 * Compare how different indexation (CPI/WPI) scenarios change HELP payoff time
 * and total indexation paid. Re-runs the voluntary-payoff simulation loop for
 * each rate while keeping repayments identical.
 *
 * Assumptions:
 * - Compulsory repayments use the 2026-27 marginal system.
 * - Income grows at `incomeGrowthRate`; the voluntary payment is fixed.
 *
 * @param currentDebt - Starting HELP debt ($)
 * @param annualIncome - Starting annual income ($)
 * @param incomeGrowthRate - Annual income growth as a decimal
 * @param lumpSumAvailable - Immediate lump sum applied to the debt ($)
 * @param monthlyVoluntaryPayment - Voluntary monthly repayment ($)
 * @param indexationRates - Indexation rates to compare (decimals)
 */
export function compareIndexationScenarios(
  currentDebt: number,
  annualIncome: number,
  incomeGrowthRate: number,
  lumpSumAvailable: number,
  monthlyVoluntaryPayment: number,
  indexationRates: number[],
): IndexationScenarioRow[] {
  const safeDebt = Math.max(0, currentDebt);
  if (safeDebt === 0) {
    return indexationRates.map(rate => ({
      indexationRate: rate,
      payoffYears: 0,
      totalIndexation: 0,
      totalRepaid: 0,
    }));
  }

  const safeLumpSum = Math.min(safeDebt, Math.max(0, lumpSumAvailable));
  const safeMonthlyVoluntary = Math.max(0, monthlyVoluntaryPayment);

  return indexationRates.map(rate => {
    let debt = Math.max(0, safeDebt - safeLumpSum);
    let income = Math.max(0, annualIncome);
    let totalIndexation = 0;
    let totalRepaid = safeLumpSum;
    let payoffYears = 0;
    let paidOff = safeLumpSum >= safeDebt;

    for (let yr = 1; yr <= 50 && !paidOff; yr++) {
      const compulsory = calcHECSRepayment(income, true);
      const totalRepay = Math.min(debt, compulsory + safeMonthlyVoluntary * 12);
      totalRepaid += totalRepay;
      const afterRepayment = Math.max(0, debt - totalRepay);
      const indexation = afterRepayment > 0 ? afterRepayment * rate : 0;
      totalIndexation += indexation;
      debt = afterRepayment + indexation;
      if (debt <= 0) {
        payoffYears = yr;
        paidOff = true;
      }
      income *= (1 + incomeGrowthRate);
    }

    return {
      indexationRate: rate,
      payoffYears: paidOff ? payoffYears : 50,
      totalIndexation: Math.round(totalIndexation),
      totalRepaid: Math.round(totalRepaid),
    };
  });
}

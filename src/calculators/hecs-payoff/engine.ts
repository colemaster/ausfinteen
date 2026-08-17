/**
 * HECS-HELP Loan Payoff vs Investing vs Offset Financial Engine
 * Implements 2024-25 19-tier system and 2025-27 4-tier marginal system ($67k threshold),
 * min(CPI, WPI) indexation cap, voluntary payoff comparison, and APRA borrowing capacity impact.
 */

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
  netWealthDifference: number;
}

export interface HECSPayoffParams {
  currentDebt: number;
  annualIncome: number;
  incomeGrowthRate: number;      // e.g. 0.03 for 3% p.a.
  indexationRate: number;        // e.g. 0.032 for 3.2% min(CPI, WPI)
  lumpSumAvailable: number;      // e.g. 10000
  monthlyVoluntaryPayment: number;
  mortgageRate: number;          // e.g. 0.062 for 6.2%
  etfExpectedReturn: number;     // e.g. 0.08 for 8.0%
  useMarginal2025System: boolean; // 2025+ marginal system vs 2024 tier system
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
  optimalStrategy: 'voluntary_payoff' | 'mortgage_offset' | 'invest_etf';
  schedule: HECSYearRow[];
}

/**
 * Calculate compulsory HECS repayment under the 2025-26+ 4-tier marginal system ($67,000 threshold).
 */
export function calcMarginalHECSRepayment(repaymentIncome: number): number {
  if (repaymentIncome <= 67000) return 0;
  if (repaymentIncome <= 125000) {
    return (repaymentIncome - 67000) * 0.15;
  }
  if (repaymentIncome <= 180000) {
    const tier1 = (125000 - 67000) * 0.15; // 8,700
    const tier2 = (repaymentIncome - 125000) * 0.20;
    return tier1 + tier2;
  }
  const tier1 = (125000 - 67000) * 0.15; // 8,700
  const tier2 = (180000 - 125000) * 0.20; // 11,000
  const tier3 = (repaymentIncome - 180000) * 0.25;
  return tier1 + tier2 + tier3;
}

/**
 * Calculate compulsory HECS repayment under the 2024-25 19-tier system.
 */
export function calcLegacyTierHECSRepayment(repaymentIncome: number): number {
  if (repaymentIncome < 54435) return 0;
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
  return useMarginal ? calcMarginalHECSRepayment(income) : calcLegacyTierHECSRepayment(income);
}

/**
 * Run full simulation comparing HECS payoff vs Offset vs ETF.
 */
export function simulateHECSPayoff(params: HECSPayoffParams): HECSPayoffResult {
  const {
    currentDebt,
    annualIncome,
    incomeGrowthRate,
    indexationRate,
    lumpSumAvailable,
    monthlyVoluntaryPayment,
    mortgageRate,
    etfExpectedReturn,
    useMarginal2025System,
    projectionYears = 20,
  } = params;

  // 1. Calculate borrowing capacity impact (APRA standard ~9.5x annual repayment)
  const initialAnnualRepayment = calcHECSRepayment(annualIncome, useMarginal2025System);
  const apraBorrowingCapacityImpact = Math.round(initialAnnualRepayment * 9.5);

  // 2. Compulsory Only Simulation
  let compDebt = currentDebt;
  let compIncome = annualIncome;
  let compYears = 0;
  let compTotalIndexation = 0;
  let compTotalRepaid = 0;

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

  // 3. Multi-Scenario Simulation Over Projection Years
  let volDebt = Math.max(0, currentDebt - lumpSumAvailable);
  let volTotalIndexation = 0;
  let volTotalRepaid = lumpSumAvailable;
  let volYears = lumpSumAvailable >= currentDebt ? 0 : projectionYears;
  let volPaidOff = lumpSumAvailable >= currentDebt;

  let simIncome = annualIncome;
  let offsetBalance = lumpSumAvailable;
  let etfBalance = lumpSumAvailable;
  let postPayoffInvestmentWealth = 0;

  const schedule: HECSYearRow[] = [];

  for (let yr = 1; yr <= projectionYears; yr++) {
    const startBal = volDebt;
    const annualVoluntary = monthlyVoluntaryPayment * 12;
    const compulsory = calcHECSRepayment(simIncome, useMarginal2025System);
    const totalRepay = Math.min(volDebt, compulsory + annualVoluntary);

    const repaymentAmount = volDebt > 0 ? totalRepay : 0;
    volTotalRepaid += repaymentAmount;

    const afterRepayment = Math.max(0, volDebt - repaymentAmount);
    const indexation = afterRepayment > 0 ? afterRepayment * indexationRate : 0;
    volTotalIndexation += indexation;
    volDebt = afterRepayment + indexation;

    if (!volPaidOff && volDebt <= 0) {
      volYears = yr;
      volPaidOff = true;
    }

    // Cashflow freed up once HECS is paid off
    const freedCashflow = volPaidOff ? (compulsory + annualVoluntary) : 0;
    postPayoffInvestmentWealth = (postPayoffInvestmentWealth + freedCashflow) * (1 + etfExpectedReturn);

    // Alternative 1: Mortgage Offset (investing lump sum + monthly voluntary payments)
    offsetBalance = (offsetBalance + annualVoluntary) * (1 + mortgageRate);

    // Alternative 2: ASX ETF Investing (investing lump sum + monthly voluntary payments)
    etfBalance = (etfBalance + annualVoluntary) * (1 + etfExpectedReturn);

    schedule.push({
      year: yr,
      startingBalance: Math.round(startBal),
      salary: Math.round(simIncome),
      compulsoryRepayment: Math.round(compulsory),
      voluntaryRepayment: Math.round(volDebt > 0 ? Math.min(startBal, annualVoluntary) : 0),
      indexationAmount: Math.round(indexation),
      endingBalance: Math.round(volDebt),
      offsetBalance: Math.round(offsetBalance),
      etfBalance: Math.round(etfBalance),
      netWealthDifference: Math.round(etfBalance - (offsetBalance)),
    });

    simIncome *= (1 + incomeGrowthRate);
  }

  // Determine optimal strategy
  const finalVol = postPayoffInvestmentWealth;
  const finalOffset = offsetBalance;
  const finalETF = etfBalance;

  let optimalStrategy: 'voluntary_payoff' | 'mortgage_offset' | 'invest_etf' = 'invest_etf';
  if (finalOffset > finalETF && finalOffset > finalVol) {
    optimalStrategy = 'mortgage_offset';
  } else if (finalVol > finalETF && finalVol > finalOffset) {
    optimalStrategy = 'voluntary_payoff';
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
    optimalStrategy,
    schedule,
  };
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
 * @param indexationRate - Annual indexation as a decimal (e.g. 0.032)
 * @param years - Projection horizon
 * @returns Ending debt per year
 */
export function projectDebtWithIndexation(
  currentDebt: number,
  annualRepayment: number,
  indexationRate: number,
  years: number,
): number[] {
  const series: number[] = [];
  let debt = Math.max(0, currentDebt);

  for (let y = 1; y <= years; y++) {
    debt = Math.max(0, debt - annualRepayment);
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
 * @param monthlySurplus - Monthly surplus cash available ($)
 * @param indexationRate - HELP indexation as a decimal (e.g. 0.032)
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
  const annualSurplus = monthlySurplus * 12;
  let paydownDebt = Math.max(0, currentDebt);
  let investDebt = Math.max(0, currentDebt);
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
 * - Compulsory repayments use the 2025+ marginal system at the (growing)
 *   income each year.
 * - Voluntary payments are made monthly (annualised); both are capped by the
 *   remaining balance; indexation applies to the balance after repayments.
 *
 * @param currentDebt - Starting HELP debt ($)
 * @param annualIncome - Starting annual income ($)
 * @param incomeGrowthRate - Annual income growth as a decimal (e.g. 0.035)
 * @param indexationRate - HELP indexation as a decimal (e.g. 0.032)
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
  let income = annualIncome;
  const rows: RepaymentSplitRow[] = [];

  for (let yr = 1; yr <= years; yr++) {
    const compulsory = calcHECSRepayment(income, true);
    const voluntary = monthlyVoluntaryPayment * 12;
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
  /** Annual indexation rate as a decimal (e.g. 0.025) */
  indexationRate: number;
  /** Years to pay off the debt with voluntary payments */
  payoffYears: number;
  /** Total indexation paid over the payoff period ($) */
  totalIndexation: number;
  /** Total repayments (compulsory + voluntary + lump sum) ($) */
  totalRepaid: number;
}

/**
 * Compare how different indexation (CPI) scenarios change HELP payoff time
 * and total indexation paid. Re-runs the voluntary-payoff simulation loop for
 * each rate while keeping repayments identical.
 *
 * Assumptions:
 * - Compulsory repayments use the 2025+ marginal system.
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
  return indexationRates.map(rate => {
    let debt = Math.max(0, currentDebt - lumpSumAvailable);
    let income = annualIncome;
    let totalIndexation = 0;
    let totalRepaid = lumpSumAvailable;
    let payoffYears = 0;
    let paidOff = lumpSumAvailable >= currentDebt;

    for (let yr = 1; yr <= 50 && !paidOff; yr++) {
      const compulsory = calcHECSRepayment(income, true);
      const totalRepay = Math.min(debt, compulsory + monthlyVoluntaryPayment * 12);
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

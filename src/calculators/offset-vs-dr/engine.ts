/**
 * Offset vs Debt Recycling — Financial Engine
 * Pure functions, no React, no side effects.
 * All monetary values operate in AUD dollars; cents precision via Math.round.
 *
 * margTax parameters are PERCENTAGES (e.g. 47 for 47%) — divided by 100 internally.
 */

import { monthlyRepayment } from '../../utils/financial';
import type { OffsetResult, DRResult } from './types';

export { monthlyRepayment };

export interface ExtraRepaymentResult {
  totalInterest: number;
  interestSaved: number;
  monthsToPayoff: number;
  yearsToPayoff: string;
  totalExtraPaid: number;
  extraRepaymentMonthly: number;
  yearly: OffsetResult['yearly'];
}

/**
 * Model a P&I home loan with a constant monthly extra repayment on top of the
 * scheduled payment (extra goes entirely to principal).
 *
 * @param loan - Loan principal (AUD)
 * @param rate - Annual interest rate as a percentage (e.g. 5.7)
 * @param years - Loan term in years
 * @param extraMonthly - Extra principal repayment each month (AUD)
 *
 * Assumptions:
 * - Monthly compounding; scheduled P&I payment plus a fixed extra payment.
 * - Base interest (no extra) calculated separately to derive interestSaved.
 * - Total extra paid = extraMonthly × months until payoff.
 */
export function runExtraRepayment(
  loan: number,
  rate: number,
  years: number,
  extraMonthly: number,
): ExtraRepaymentResult {
  const r = rate / 100 / 12;
  const n = years * 12;
  const payment = monthlyRepayment(loan, rate, years);
  let balance = loan;
  let totalInterest = 0;
  let months = 0;
  const yearly: ExtraRepaymentResult['yearly'] = [];

  for (let m = 1; m <= n && balance > 0; m++) {
    const interest = balance * r;
    const principalPaid = Math.min(balance, payment - interest + Math.max(0, extraMonthly));
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    months = m;
    if (m % 12 === 0 || balance <= 0) {
      yearly.push({
        year: Math.ceil(m / 12),
        balance: Math.round(balance),
        totalInterest: Math.round(totalInterest),
        netWealth: Math.round(extraMonthly * m - balance),
      });
    }
    if (balance <= 0) break;
  }

  // Base interest (no extra repayment)
  let baseBal = loan;
  let baseInterest = 0;
  for (let m = 1; m <= n && baseBal > 0; m++) {
    const int = baseBal * r;
    baseBal = Math.max(0, baseBal - (payment - int));
    baseInterest += int;
  }

  return {
    totalInterest: Math.round(totalInterest),
    interestSaved: Math.round(baseInterest - totalInterest),
    monthsToPayoff: months,
    yearsToPayoff: (months / 12).toFixed(1),
    totalExtraPaid: Math.round(extraMonthly * months),
    extraRepaymentMonthly: extraMonthly,
    yearly,
  };
}

export interface SplitOutcome {
  netWealth: number;          // portfolio + offset − total debt
  netWealthAfterCGT: number;  // netWealth with CGT on portfolio gains
  offsetBalance: number;
  portfolioValue: number;
  homeLoanBalance: number;
  investLoanBalance: number;
  totalDebt: number;
}

export interface SplitComparisonResult {
  years: number;
  offsetFraction: number;   // 0..1 share of surplus to offset
  allOffset: SplitOutcome;
  allDR: SplitOutcome;
  split: SplitOutcome;
  bestNetWealthAfterCGT: number;
  bestStrategy: 'All Offset' | 'All Debt Recycling' | 'Split';
}

/**
 * Split-strategy comparison: monthly surplus allocated between a mortgage
 * offset account and a debt-recycling investment (ETF), each month.
 *
 * @param loan - Home loan principal (AUD)
 * @param rate - Home loan rate as % (offset rate assumed equal to loan rate)
 * @param years - Loan term in years
 * @param surplusMonthly - Monthly surplus available (AUD)
 * @param offsetFraction - Fraction of surplus to offset (0 = all DR, 1 = all offset)
 * @param etfReturn - Total annual ETF return as %
 * @param divYield - Dividend yield as %
 * @param margTax - Marginal tax rate as PERCENTAGE (e.g. 47 for 47%)
 * @param cgtDiscount - CGT discount as PERCENTAGE (e.g. 50 for 50%)
 *
 * Assumptions:
 * - Monthly compounding; scheduled P&I payment on the home loan.
 * - Offset earns the loan rate tax-free (offset rate = loan rate).
 * - DR: surplus repays non-deductible home loan while an equal amount is
 *   borrowed into the investment loan and invested — total debt unchanged by
 *   recycling, exactly like runDebtRecycling. Investment interest is
 *   tax-deductible at margTax (refund credited to the offset account each
 *   month); dividends taxed at margTax; CGT discounted on disposal at year
 *   `years`.
 */
export function splitComparison(
  loan: number,
  rate: number,
  years: number,
  surplusMonthly: number,
  offsetFraction: number,
  etfReturn: number,
  divYield: number,
  margTaxPct: number,
  cgtDiscountPct: number,
): SplitComparisonResult {
  const margTax = margTaxPct / 100;
  const cgtDiscount = cgtDiscountPct / 100;
  const r = rate / 100 / 12;
  const n = years * 12;
  const payment = monthlyRepayment(loan, rate, years);
  const growthOnlyMonthly = (etfReturn - divYield) / 100 / 12;
  const monthlyDivGross = divYield / 100 / 12;
  const frac = Math.min(1, Math.max(0, offsetFraction));

  function simulate(offsetShare: number): SplitOutcome {
    let homeLoan = loan;
    let offset = 0;
    let investLoan = 0;
    let portfolio = 0;
    let costBase = 0;

    for (let m = 1; m <= n; m++) {
      const homeInt = homeLoan > 0 ? Math.max(0, homeLoan - offset) * r : 0;
      const investInt = investLoan > 0 ? investLoan * r : 0;

      if (homeLoan > 0) {
        homeLoan = Math.max(0, homeLoan - Math.min(homeLoan, payment - homeInt));
      }

      const toOffset = surplusMonthly * offsetShare;
      const toDR = surplusMonthly * (1 - offsetShare);
      offset += toOffset;
      if (toDR > 0) {
        homeLoan = Math.max(0, homeLoan - toDR);
        investLoan += toDR;
        portfolio += toDR;
        costBase += toDR;
      }

      offset += investInt * margTax; // tax refund on investment interest

      const growth = portfolio * growthOnlyMonthly;
      const divGross = portfolio * monthlyDivGross;
      portfolio += growth + divGross * (1 - margTax);
    }

    const unrealisedGain = Math.max(0, portfolio - costBase);
    const cgt = unrealisedGain * (1 - cgtDiscount) * margTax;
    const netWealth = portfolio + offset - homeLoan - investLoan;
    return {
      netWealth: Math.round(netWealth),
      netWealthAfterCGT: Math.round(netWealth - cgt),
      offsetBalance: Math.round(offset),
      portfolioValue: Math.round(portfolio),
      homeLoanBalance: Math.round(homeLoan),
      investLoanBalance: Math.round(investLoan),
      totalDebt: Math.round(homeLoan + investLoan),
    };
  }

  const allOffset = simulate(1);
  const allDR = simulate(0);
  const split = simulate(frac);

  let bestStrategy: SplitComparisonResult['bestStrategy'];
  const best = Math.max(allOffset.netWealthAfterCGT, allDR.netWealthAfterCGT, split.netWealthAfterCGT);
  if (split.netWealthAfterCGT === best && split.netWealthAfterCGT > Math.max(allOffset.netWealthAfterCGT, allDR.netWealthAfterCGT)) {
    bestStrategy = 'Split';
  } else if (allDR.netWealthAfterCGT >= allOffset.netWealthAfterCGT) {
    bestStrategy = 'All Debt Recycling';
  } else {
    bestStrategy = 'All Offset';
  }

  return {
    years,
    offsetFraction: frac,
    allOffset,
    allDR,
    split,
    bestNetWealthAfterCGT: best,
    bestStrategy,
  };
}

/**
 * Model a P&I home loan with an offset account.
 *
 * @param loan - Loan principal (AUD)
 * @param rate - Annual interest rate as a percentage (e.g. 5.7)
 * @param years - Loan term in years
 * @param offsetAmt - Amount parked in offset account (held constant)
 * @returns OffsetResult with year-by-year data and summary metrics
 *
 * Assumptions:
 * - Monthly compounding, monthly P&I repayments.
 * - Offset balance is constant (no growth, no withdrawals).
 * - Base interest (no offset) calculated separately to derive interestSaved.
 */
export function runOffset(
  loan: number,
  rate: number,
  years: number,
  offsetAmt: number,
): OffsetResult {
  const r = rate / 100 / 12;
  const n = years * 12;
  const payment = monthlyRepayment(loan, rate, years);
  let balance = loan;
  let totalInterest = 0;
  let months = 0;
  const yearly: OffsetResult['yearly'] = [];

  for (let m = 1; m <= n && balance > 0; m++) {
    const effectiveBal = Math.max(0, balance - offsetAmt);
    const interest = effectiveBal * r;
    const principalPaid = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    months = m;
    if (m % 12 === 0 || balance <= 0) {
      yearly.push({
        year: Math.ceil(m / 12),
        balance: Math.round(balance),
        totalInterest: Math.round(totalInterest),
        netWealth: Math.round(offsetAmt - balance),
      });
    }
    if (balance <= 0) break;
  }

  // Calculate base interest (no offset) to compute interestSaved
  let baseBal = loan;
  let baseInterest = 0;
  for (let m = 1; m <= n && baseBal > 0; m++) {
    const int = baseBal * r;
    baseBal = Math.max(0, baseBal - (payment - int));
    baseInterest += int;
  }

  return {
    totalInterest: Math.round(totalInterest),
    interestSaved: Math.round(baseInterest - totalInterest),
    monthsToPayoff: months,
    yearsToPayoff: (months / 12).toFixed(1),
    offsetValue: offsetAmt,
    yearly,
  };
}

/**
 * Model debt recycling: convert home loan equity into a tax-deductible investment loan.
 *
 * @param investLoanType - 'io' (interest-only, default) or 'pi' (principal & interest)
 *
 * Assumptions when IO: investment loan balance stays constant; interest tax-deductible throughout.
 * Assumptions when PI: investment loan amortises over term; deduction decreases as balance falls.
 */
export function runDebtRecycling(
  loan: number,
  rate: number,
  years: number,
  investAmt: number,
  etfReturn: number,
  divYield: number,
  margTaxPct: number,
  cgtDiscount: number,
  investLoanType: 'io' | 'pi' = 'io',
): DRResult {
  const margTax = margTaxPct / 100;
  const cgtDiscountDecimal = cgtDiscount / 100;

  const r = rate / 100 / 12;
  const n = years * 12;
  const payment = monthlyRepayment(loan, rate, years);
  const investPayment = investLoanType === 'pi' ? monthlyRepayment(investAmt, rate, years) : 0;
  const growthOnly = (etfReturn - divYield) / 100 / 12;
  const monthlyDiv = divYield / 100 / 12;

  let homeLoanBal = loan - investAmt;
  let investLoanBal = investAmt;
  let portfolioValue = investAmt;
  let totalHomeLoanInterest = 0;
  let totalInvestLoanInterest = 0;
  let totalTaxDeductions = 0;
  const totalCostBase = investAmt;
  const yearly: DRResult['yearly'] = [];

  for (let m = 1; m <= n; m++) {
    const homeInt = homeLoanBal > 0 ? homeLoanBal * r : 0;
    const investInt = investLoanBal > 0 ? investLoanBal * r : 0;
    const taxDeduction = investInt * margTax;

    const growth = portfolioValue * growthOnly;
    const dividends = portfolioValue * monthlyDiv;
    portfolioValue += growth + dividends;

    if (homeLoanBal > 0) {
      const pp = Math.min(homeLoanBal, payment - homeInt);
      homeLoanBal = Math.max(0, homeLoanBal - pp);
    }

    if (investLoanType === 'pi' && investLoanBal > 0) {
      const investPrincipal = Math.min(investLoanBal, investPayment - investInt);
      investLoanBal = Math.max(0, investLoanBal - investPrincipal);
    }

    totalHomeLoanInterest += homeInt;
    totalInvestLoanInterest += investInt;
    totalTaxDeductions += taxDeduction;

    if (m % 12 === 0) {
      const unrealisedGain = portfolioValue - totalCostBase;
      const cgtIfSold =
        unrealisedGain > 0
          ? unrealisedGain * (1 - cgtDiscountDecimal) * margTax
          : 0;
      yearly.push({
        year: m / 12,
        homeLoanBal: Math.round(homeLoanBal),
        investLoanBal: Math.round(investLoanBal),
        portfolioValue: Math.round(portfolioValue),
        totalInterestPaid: Math.round(
          totalHomeLoanInterest + totalInvestLoanInterest,
        ),
        taxDeductions: Math.round(totalTaxDeductions),
        netWealth: Math.round(portfolioValue - homeLoanBal - investLoanBal),
        netWealthAfterCGT: Math.round(
          portfolioValue - cgtIfSold - homeLoanBal - investLoanBal,
        ),
      });
    }
  }

  const unrealisedGain = portfolioValue - totalCostBase;
  const cgtIfSold =
    unrealisedGain > 0
      ? unrealisedGain * (1 - cgtDiscountDecimal) * margTax
      : 0;

  return {
    totalInterest: Math.round(
      totalHomeLoanInterest + totalInvestLoanInterest,
    ),
    taxDeductions: Math.round(totalTaxDeductions),
    netInterestCost: Math.round(
      totalHomeLoanInterest + totalInvestLoanInterest - totalTaxDeductions,
    ),
    portfolioValue: Math.round(portfolioValue),
    cgtIfSold: Math.round(cgtIfSold),
    netWealthPostCGT: Math.round(
      portfolioValue - cgtIfSold - investLoanBal,
    ),
    yearly,
  };
}

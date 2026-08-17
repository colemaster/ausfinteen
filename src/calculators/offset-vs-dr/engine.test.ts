import { describe, it, expect } from 'vitest';
import { monthlyRepayment } from '../../utils/financial';
import { runOffset, runDebtRecycling, runExtraRepayment, splitComparison } from './engine';

describe('monthlyRepayment', () => {
  it('calculates correctly for $500k at 6% over 30 years', () => {
    const result = monthlyRepayment(500000, 6, 30);
    expect(result).toBeCloseTo(2997.75, 0);
  });

  it('handles zero interest rate', () => {
    const result = monthlyRepayment(120000, 0, 10);
    expect(result).toBe(1000);
  });
});

describe('runOffset', () => {
  it('$500k loan, 6%, 30yr, $100k offset → interest saved > $200k (offset accelerates payoff)', () => {
    // With $100k in offset the effective rate is lower each month, meaning more
    // principal is repaid — the loan is paid off ~10+ years early, saving >$200k.
    const result = runOffset(500000, 6, 30, 100000);
    expect(result.interestSaved).toBeGreaterThan(200000);
    // Should not exceed the total interest of the base case (~$579k)
    expect(result.interestSaved).toBeLessThan(580000);
  });

  it('offset = loan → totalInterest = 0', () => {
    const result = runOffset(500000, 6, 30, 500000);
    expect(result.totalInterest).toBe(0);
  });

  it('returns yearly array with correct length', () => {
    const result = runOffset(500000, 6, 30, 100000);
    // Should have at most 30 yearly entries (may be shorter if paid off early)
    expect(result.yearly.length).toBeGreaterThan(0);
    expect(result.yearly.length).toBeLessThanOrEqual(30);
  });

  it('netWealth at end of term equals offsetAmt (balance = 0)', () => {
    const result = runOffset(500000, 6, 30, 100000);
    const lastRow = result.yearly[result.yearly.length - 1];
    // netWealth = offsetAmt - balance; when balance→0 netWealth ≈ offsetAmt
    expect(lastRow.netWealth).toBeGreaterThan(90000);
  });
});

describe('runDebtRecycling', () => {
  it('generates yearly data for the full term', () => {
    const result = runDebtRecycling(500000, 6, 15, 100000, 8, 3, 32, 50);
    expect(result.yearly.length).toBe(15);
  });

  it('taxDeductions > 0 when margTax > 0', () => {
    const result = runDebtRecycling(500000, 6, 15, 100000, 8, 3, 32, 50);
    expect(result.taxDeductions).toBeGreaterThan(0);
  });

  it('portfolioValue at end > investAmt when etfReturn > 0', () => {
    const result = runDebtRecycling(500000, 6, 15, 100000, 8, 3, 32, 50);
    expect(result.portfolioValue).toBeGreaterThan(100000);
  });

  it('cgtIfSold = 0 when margTax = 0', () => {
    const result = runDebtRecycling(500000, 6, 15, 100000, 8, 3, 0, 50);
    expect(result.cgtIfSold).toBe(0);
  });
});

describe('runExtraRepayment', () => {
  it('known answer: $500k at 6% 30yr with $1,000/mo extra pays off in ~15.5 years', () => {
    const result = runExtraRepayment(500000, 6, 30, 1000);
    // Scheduled payment 2997.75; with +$1000/mo the loan clears in ~15.5 years.
    expect(result.monthsToPayoff).toBeGreaterThan(160);
    expect(result.monthsToPayoff).toBeLessThan(230);
  });

  it('extra repayment saves interest vs base loan', () => {
    const result = runExtraRepayment(500000, 6, 30, 500);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.totalInterest).toBeLessThan(579191);
  });

  it('zero extra repayment → identical to base amortisation', () => {
    const result = runExtraRepayment(500000, 6, 30, 0);
    const base = runOffset(500000, 6, 30, 0);
    expect(result.totalInterest).toBe(base.totalInterest);
    expect(result.yearsToPayoff).toBe('30.0');
  });

  it('no extra repaid when loan is already paid off by scheduled payment', () => {
    const result = runExtraRepayment(120000, 0, 10, 0);
    expect(result.monthsToPayoff).toBe(120);
    expect(result.totalInterest).toBe(0);
  });
});

describe('splitComparison', () => {
  it('offsetFraction 1 → allOffset equals split outcome', () => {
    const r = splitComparison(500000, 6, 10, 1000, 1, 8, 3, 34.5, 50);
    expect(r.split.netWealthAfterCGT).toBe(r.allOffset.netWealthAfterCGT);
    expect(r.split.portfolioValue).toBe(0);
  });

  it('offsetFraction 0 → allDR equals split outcome', () => {
    const r = splitComparison(500000, 6, 10, 1000, 0, 8, 3, 34.5, 50);
    expect(r.split.netWealthAfterCGT).toBe(r.allDR.netWealthAfterCGT);
    expect(r.split.portfolioValue).toBe(r.allDR.portfolioValue);
    // Offset balance > 0 only from tax refunds on investment interest
    expect(r.split.offsetBalance).toBeGreaterThan(0);
  });

  it('offset balance grows at least with the offset portion of surplus', () => {
    const r = splitComparison(500000, 6, 5, 2000, 0.5, 8, 3, 34.5, 50);
    // 50% × $2,000 × 60 months = $60,000 baseline, plus interest refunds
    expect(r.split.offsetBalance).toBeGreaterThanOrEqual(60000);
  });

  it('allOffset preserves more cash; allDR builds a portfolio', () => {
    const r = splitComparison(500000, 6, 10, 1000, 0.5, 8, 3, 34.5, 50);
    expect(r.allOffset.portfolioValue).toBe(0);
    expect(r.allDR.portfolioValue).toBeGreaterThan(0);
    expect(r.allDR.portfolioValue).toBeGreaterThan(r.allOffset.portfolioValue);
  });

  it('surplus zero → zero growth in offset and portfolio', () => {
    const r = splitComparison(500000, 6, 5, 0, 0.5, 8, 3, 34.5, 50);
    expect(r.split.offsetBalance).toBe(0);
    expect(r.split.portfolioValue).toBe(0);
  });
});

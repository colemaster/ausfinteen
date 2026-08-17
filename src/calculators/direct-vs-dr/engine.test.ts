import { describe, it, expect } from 'vitest';
import { runDirectInvest, runDebtRecyclingStandalone, findBreakevenReturn, cgtAfterSell } from './engine';

describe('findBreakevenReturn', () => {
  it('returns correct breakeven for 6% mortgage at 47% tax', () => {
    // 6 * (1 - 0.47) = 3.18
    expect(findBreakevenReturn(6, 47)).toBeCloseTo(3.18, 1);
  });

  it('returns full rate at 0% tax', () => {
    expect(findBreakevenReturn(6, 0)).toBe(6);
  });
});

describe('runDirectInvest', () => {
  it('final value > initial investment with positive return', () => {
    const result = runDirectInvest(100000, 8, 3, 0.32, 0.5, 10);
    expect(result.finalValue).toBeGreaterThan(100000);
  });

  it('generates yearly array of correct length', () => {
    const result = runDirectInvest(100000, 8, 3, 0.32, 0.5, 10);
    expect(result.yearly.length).toBe(10);
  });

  it('no CGT when portfolio value stays at cost base (0% return)', () => {
    const result = runDirectInvest(100000, 0, 0, 0.32, 0.5, 5);
    expect(result.cgtIfSold).toBe(0);
  });

  it('net wealth after CGT is less than final value when gain > 0', () => {
    const result = runDirectInvest(100000, 8, 3, 0.32, 0.5, 10);
    expect(result.netWealthAfterCGT).toBeLessThan(result.finalValue);
  });
});

describe('runDebtRecyclingStandalone', () => {
  it('generates yearly array of correct length', () => {
    const result = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10);
    expect(result.yearly.length).toBe(10);
  });

  it('totalInterestPaid > 0', () => {
    const result = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10);
    expect(result.totalInterestPaid).toBeGreaterThan(0);
  });

  it('totalTaxDeductions > 0 when margTax > 0', () => {
    const result = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10);
    expect(result.totalTaxDeductions).toBeGreaterThan(0);
  });

  it('DR net interest cost is less than gross interest (tax deductions reduce cost)', () => {
    // Breakeven = 6 * (1 - 0.32) = 4.08%
    // The value of DR is that the effective borrowing cost is reduced by the tax deduction
    const dr = runDebtRecyclingStandalone(100000, 10, 3, 6, 0.32, 0.5, 20);
    // Net interest cost must be less than gross interest paid
    expect(dr.netInterestCost).toBeLessThan(dr.totalInterestPaid);
    // Specifically, deductions = grossInterest * margTax
    expect(dr.totalTaxDeductions).toBeCloseTo(dr.totalInterestPaid * 0.32, 0);
  });

  it('recycleFraction = 1 matches the original immediate-recycle behaviour', () => {
    const full = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10);
    const recycled = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10, 1);
    expect(recycled.finalValue).toBe(full.finalValue);
    expect(recycled.netWealthAfterCGT).toBe(full.netWealthAfterCGT);
  });

  it('slower recycle fraction (0.25/yr) delays capital and pays less interest over 5 years', () => {
    const slow = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 5, 0.25);
    const fast = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 5, 1);
    // Average borrowed balance is lower (25k→100k ramp vs flat 100k) → less interest
    expect(slow.totalInterestPaid).toBeLessThan(fast.totalInterestPaid);
    // Final portfolio lags because capital is converted gradually
    expect(slow.finalValue).toBeLessThan(fast.finalValue);
  });

  it('fully recycles by the end of the term when fraction < 1', () => {
    // 10 years at 0.25/yr → fully recycled at start of year 4 (25k×4 = 100k)
    const dr = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 10, 0.25);
    // Net wealth = portfolio − 100k loan − CGT; portfolio must exceed 100k
    expect(dr.finalValue).toBeGreaterThan(100000);
  });

  it('zero recycle fraction → nothing is invested or borrowed', () => {
    const dr = runDebtRecyclingStandalone(100000, 8, 3, 6, 0.32, 0.5, 5, 0);
    expect(dr.totalInterestPaid).toBe(0);
    expect(dr.finalValue).toBe(0);
  });
});

describe('cgtAfterSell', () => {
  it('known answer: $150k gain, 50% discount, 32% tax → CGT $24,000', () => {
    const r = cgtAfterSell(250000, 100000, 5, 0.32);
    expect(r.taxableGain).toBe(75000);
    expect(r.cgtPayable).toBe(24000);
    expect(r.proceedsAfterCgt).toBe(226000);
  });

  it('no discount when held under 12 months (full gain taxable)', () => {
    const r = cgtAfterSell(250000, 100000, 0.5, 0.32);
    expect(r.discountAmount).toBe(0);
    expect(r.taxableGain).toBe(150000);
    expect(r.cgtPayable).toBe(48000);
  });

  it('zero CGT when value at or below cost base', () => {
    const r = cgtAfterSell(80000, 100000, 5, 0.32);
    expect(r.taxableGain).toBe(0);
    expect(r.cgtPayable).toBe(0);
    expect(r.proceedsAfterCgt).toBe(80000);
  });

  it('zero CGT at zero marginal rate', () => {
    const r = cgtAfterSell(250000, 100000, 5, 0);
    expect(r.cgtPayable).toBe(0);
    expect(r.proceedsAfterCgt).toBe(250000);
  });
});

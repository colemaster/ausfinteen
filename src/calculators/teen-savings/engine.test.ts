import { describe, it, expect } from 'vitest';
import { savingsWithMonthlyCompound, savingsWithSimpleInterest } from './engine';

describe('savingsWithMonthlyCompound', () => {
  it('projects 12 months of growth with monthly deposits at 5.25% p.a.', () => {
    const res = savingsWithMonthlyCompound(1500, 5.25, 12, 50);
    // Total deposited: 1500 + 600 = 2100
    expect(res.totalDeposited).toBeCloseTo(2100, 5);
    // Monthly rate 0.004375 — compound effect should exceed simple interest
    expect(res.endingBalance).toBeGreaterThan(2100 + 2100 * (5.25 / 100) / 2);
    expect(res.interestEarned).toBeCloseTo(res.endingBalance - 2100, 5);
  });

  it('produces interest slightly higher than the simple-interest baseline', () => {
    const compound = savingsWithMonthlyCompound(1500, 5.25, 12, 50);
    const simple = savingsWithSimpleInterest(1500, 5.25, 12, 50);
    expect(compound.interestEarned).toBeGreaterThan(simple.interestEarned);
  });

  it('matches simple interest for one month (no compounding effect)', () => {
    const compound = savingsWithMonthlyCompound(1000, 12, 1, 0);
    const expected = 1000 * (0.12 / 12);
    expect(compound.interestEarned).toBeCloseTo(expected, 5);
    expect(compound.endingBalance).toBeCloseTo(1000 + expected, 5);
  });

  it('guards zero rate, zero balance and zero months', () => {
    const zeroRate = savingsWithMonthlyCompound(1000, 0, 12, 50);
    expect(zeroRate.endingBalance).toBeCloseTo(1600, 5);
    expect(zeroRate.interestEarned).toBe(0);

    const zeroBalance = savingsWithMonthlyCompound(0, 5, 12, 50);
    expect(zeroBalance.endingBalance).toBeGreaterThan(600);
    expect(zeroBalance.interestEarned).toBeGreaterThan(0);

    const zeroMonths = savingsWithMonthlyCompound(1000, 5, 0, 0);
    expect(zeroMonths.months).toBe(1);
  });
});

describe('savingsWithSimpleInterest', () => {
  it('pays interest on the average balance for the period', () => {
    const res = savingsWithSimpleInterest(1000, 6, 12, 100);
    // Average balance 1000 + 600 = 1600; 6% for 12 months
    expect(res.interestEarned).toBeCloseTo(96, 5);
    expect(res.endingBalance).toBeCloseTo(1000 + 1200 + 96, 5);
  });

  it('handles a partial-year projection', () => {
    const res = savingsWithSimpleInterest(1000, 6, 6, 0);
    expect(res.interestEarned).toBeCloseTo(30, 5);
  });

  it('handles zero balance and guards month count', () => {
    expect(savingsWithSimpleInterest(0, 6, 12, 0).endingBalance).toBe(0);
    expect(savingsWithSimpleInterest(1000, 6, -2, 0).months).toBe(1);
  });
});
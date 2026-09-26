import { describe, it, expect } from 'vitest';
import { savingsWithMonthlyCompound, savingsWithSimpleInterest, calcMonthsToReachGoal } from './engine';

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

describe('calcMonthsToReachGoal', () => {
  it('calculates time to reach $500 Mojo buffer with $100 monthly deposits', () => {
    // Starting $150, target $500, deposit $100/mo, 5.80% rate
    const res = calcMonthsToReachGoal(150, 500, 100, 5.80);
    expect(res.monthsToReach).toBe(4);
    expect(res.weeksToReach).toBe(17);
    expect(res.finalBalance).toBeGreaterThanOrEqual(500);
    expect(res.totalDeposited).toBe(400);
    expect(res.interestEarned).toBeGreaterThan(0);
  });

  it('returns 0 months if starting balance is already at or above target', () => {
    const res = calcMonthsToReachGoal(500, 500, 50, 5.00);
    expect(res.monthsToReach).toBe(0);
    expect(res.weeksToReach).toBe(0);
    expect(res.finalBalance).toBe(500);
    expect(res.interestEarned).toBe(0);
  });

  it('calculates time to reach $5,000 first car goal at 5.75%', () => {
    // Starting $500, target $5,000, deposit $200/mo, 5.75% rate
    const res = calcMonthsToReachGoal(500, 5000, 200, 5.75);
    expect(res.monthsToReach).toBeGreaterThan(15);
    expect(res.monthsToReach).toBeLessThan(24);
    expect(res.finalBalance).toBeGreaterThanOrEqual(5000);
    expect(res.interestEarned).toBeGreaterThan(100);
  });

  it('handles zero deposit and zero rate gracefully', () => {
    const res = calcMonthsToReachGoal(100, 500, 0, 0);
    expect(res.monthsToReach).toBe(Infinity);
  });

  it('returns Infinity when zero deposit and zero starting balance cannot grow', () => {
    const res = calcMonthsToReachGoal(0, 500, 0, 5.00);
    expect(res.monthsToReach).toBe(Infinity);
    expect(res.weeksToReach).toBe(Infinity);
  });

  it('returns Infinity when goal is unreachable within maxMonths', () => {
    const res = calcMonthsToReachGoal(1, 10_000_000, 0.01, 0.01);
    expect(res.monthsToReach).toBe(Infinity);
    expect(res.weeksToReach).toBe(Infinity);
  });
});
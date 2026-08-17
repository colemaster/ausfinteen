import { describe, it, expect } from 'vitest';
import {
  calcMarginalHECSRepayment,
  calcLegacyTierHECSRepayment,
  simulateHECSPayoff,
} from './engine';

describe('HECS-HELP Calculation Engine', () => {
  it('correctly applies 2025-26 marginal repayment thresholds', () => {
    // Under $67,000 threshold -> 0%
    expect(calcMarginalHECSRepayment(60000)).toBe(0);
    expect(calcMarginalHECSRepayment(67000)).toBe(0);

    // $80,000 income -> ($80,000 - $67,000) * 15% = $1,950
    expect(calcMarginalHECSRepayment(80000)).toBeCloseTo(1950, 1);

    // $135,000 income -> Tier 1 (8,700) + ($135,000 - $125,000) * 20% = 8,700 + 2,000 = 10,700
    expect(calcMarginalHECSRepayment(135000)).toBeCloseTo(10700, 1);

    // $200,000 income -> Tier 1 (8,700) + Tier 2 (11,000) + ($200,000 - $180,000) * 25% = 19,700 + 5,000 = 24,700
    expect(calcMarginalHECSRepayment(200000)).toBeCloseTo(24700, 1);
  });

  it('correctly calculates legacy 2024-25 tiered repayments', () => {
    expect(calcLegacyTierHECSRepayment(50000)).toBe(0);
    // $60,000 in 2024 is tier 1 (1.0%) -> $600
    expect(calcLegacyTierHECSRepayment(60000)).toBeCloseTo(600, 1);
    // $100,000 in 2024 is tier 9 (5.5%) -> $5,500
    expect(calcLegacyTierHECSRepayment(100000)).toBeCloseTo(5500, 1);
  });

  it('simulates full payoff schedule and borrowing capacity impact', () => {
    const result = simulateHECSPayoff({
      currentDebt: 35000,
      annualIncome: 95000,
      incomeGrowthRate: 0.03,
      indexationRate: 0.035,
      lumpSumAvailable: 5000,
      monthlyVoluntaryPayment: 300,
      mortgageRate: 0.062,
      etfExpectedReturn: 0.08,
      useMarginal2025System: true,
      projectionYears: 15,
    });

    expect(result.apraBorrowingCapacityImpact).toBeGreaterThan(30000);
    expect(result.schedule.length).toBe(15);
    expect(result.totalRepaidCompulsoryOnly).toBeGreaterThan(35000);
    expect(result.voluntaryPayoffYears).toBeLessThanOrEqual(result.compulsoryPayoffYears);
  });
});

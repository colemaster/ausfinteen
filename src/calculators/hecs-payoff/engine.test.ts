import { describe, it, expect } from 'vitest';
import {
  calcMarginalHECSRepayment,
  calcLegacyTierHECSRepayment,
  simulateHECSPayoff,
  projectDebtWithIndexation,
  comparePaydownVsInvest,
  repaymentSplitSchedule,
  compareIndexationScenarios,
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

describe('projectDebtWithIndexation', () => {
  it('known answer: repayment before indexation', () => {
    // 10000 - 2000 = 8000, then 8000 * 1.05 = 8400
    expect(projectDebtWithIndexation(10000, 2000, 0.05, 1)).toEqual([8400]);
  });

  it('debt clears to zero and stays zero', () => {
    const series = projectDebtWithIndexation(5000, 10000, 0.05, 5);
    expect(series[0]).toBe(0);
    expect(series[4]).toBe(0);
  });

  it('zero years returns empty array', () => {
    expect(projectDebtWithIndexation(10000, 1000, 0.05, 0)).toEqual([]);
  });

  it('higher indexation keeps debt higher', () => {
    const low = projectDebtWithIndexation(50000, 5000, 0.02, 10);
    const high = projectDebtWithIndexation(50000, 5000, 0.06, 10);
    expect(high[9]).toBeGreaterThan(low[9]);
  });
});

describe('comparePaydownVsInvest', () => {
  it('investing wins when investment return exceeds indexation', () => {
    const result = comparePaydownVsInvest(30000, 500, 0.032, 0.08, 15);
    expect(result.rows).toHaveLength(15);
    expect(result.netAdvantageInvest).toBeGreaterThan(0);
    expect(result.finalWealthIfInvest).toBeGreaterThan(result.finalDebtIfInvest - result.finalDebtIfPaydown);
  });

  it('paying down wins when indexation exceeds investment return and debt persists', () => {
    const result = comparePaydownVsInvest(100000, 500, 0.06, 0.02, 15);
    expect(result.finalDebtIfPaydown).toBeLessThan(result.finalDebtIfInvest);
    expect(result.netAdvantageInvest).toBeLessThan(0);
  });

  it('known answer: zero returns and zero indexation, one year', () => {
    const result = comparePaydownVsInvest(10000, 100, 0, 0, 1);
    // paydown: 10000 - 1200 = 8800; invest: debt 10000, wealth 1200
    expect(result.finalDebtIfPaydown).toBe(8800);
    expect(result.finalDebtIfInvest).toBe(10000);
    expect(result.finalWealthIfInvest).toBe(1200);
    // net advantage = 1200 - (10000 - 8800) = 0
    expect(result.netAdvantageInvest).toBe(0);
  });

  it('zero debt is handled safely', () => {
    const result = comparePaydownVsInvest(0, 500, 0.032, 0.08, 5);
    expect(result.finalDebtIfPaydown).toBe(0);
  });
});

describe('repaymentSplitSchedule', () => {
  it('compulsory + voluntary + indexation reconcile to the ending balance', () => {
    const rows = repaymentSplitSchedule(40000, 90000, 0.035, 0.032, 300, 10);
    for (const row of rows) {
      const prev = row.year === 1 ? 40000 : rows[row.year - 2].endingBalance;
      expect(row.endingBalance).toBeCloseTo(prev - row.compulsory - row.voluntary + row.indexation, -0.5);
    }
  });

  it('stops early when the debt is cleared', () => {
    const rows = repaymentSplitSchedule(5000, 90000, 0.035, 0.032, 1000, 10);
    expect(rows.length).toBeLessThan(10);
    expect(rows[rows.length - 1].endingBalance).toBe(0);
  });

  it('no voluntary payment means only compulsory repayments', () => {
    const rows = repaymentSplitSchedule(100000, 90000, 0, 0.032, 0, 5);
    expect(rows.every(r => r.voluntary === 0)).toBe(true);
    expect(rows.every(r => r.compulsory > 0)).toBe(true);
  });
});

describe('compareIndexationScenarios', () => {
  it('higher indexation -> more total indexation paid', () => {
    const rows = compareIndexationScenarios(40000, 90000, 0.035, 5000, 300, [0.02, 0.05]);
    expect(rows).toHaveLength(2);
    expect(rows[1].totalIndexation).toBeGreaterThan(rows[0].totalIndexation);
  });

  it('lower indexation never results in a longer payoff', () => {
    const rows = compareIndexationScenarios(40000, 90000, 0.035, 5000, 300, [0.02, 0.032, 0.05]);
    expect(rows[2].payoffYears).toBeGreaterThanOrEqual(rows[0].payoffYears);
  });

  it('very high indexation can prevent payoff within the window', () => {
    const rows = compareIndexationScenarios(120000, 60000, 0.02, 0, 50, [0.20]);
    expect(rows[0].payoffYears).toBe(50);
  });
});

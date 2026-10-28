import { describe, it, expect } from 'vitest';
import {
  calcMarginalHECSRepayment,
  calcLegacyTierHECSRepayment,
  calcHECSRepayment,
  simulateHECSPayoff,
  projectDebtWithIndexation,
  comparePaydownVsInvest,
  repaymentSplitSchedule,
  compareIndexationScenarios,
  calcRetrospectiveIndexationCredit,
  applyAccordDebtReduction,
} from './engine';

describe('HECS-HELP Calculation Engine', () => {
  it('correctly applies 2026-27 marginal repayment thresholds', () => {
    // Under $69,528 threshold -> 0%
    expect(calcMarginalHECSRepayment(60000)).toBe(0);
    expect(calcMarginalHECSRepayment(69528)).toBe(0);

    // Edge case: zero or negative income
    expect(calcMarginalHECSRepayment(0)).toBe(0);
    expect(calcMarginalHECSRepayment(-5000)).toBe(0);

    // $80,000 income -> ($80,000 - $69,528) * 15% = $1,570.80
    expect(calcMarginalHECSRepayment(80000)).toBeCloseTo(1570.80, 2);

    // $135,000 income -> Band 1 (9,028.35) + ($135,000 - $129,717) * 17% = 9,028.35 + 898.11 = 9,926.46
    expect(calcMarginalHECSRepayment(135000)).toBeCloseTo(9926.46, 2);

    // $200,000 income -> flat 10% of total repayment income = $20,000.00
    expect(calcMarginalHECSRepayment(200000)).toBe(20000);
  });

  it('correctly calculates legacy 2024-25 tiered repayments', () => {
    expect(calcLegacyTierHECSRepayment(50000)).toBe(0);
    expect(calcLegacyTierHECSRepayment(0)).toBe(0);
    expect(calcLegacyTierHECSRepayment(-1000)).toBe(0);
    // $60,000 in 2024 is tier 1 (1.0%) -> $600
    expect(calcLegacyTierHECSRepayment(60000)).toBeCloseTo(600, 1);
    // $100,000 in 2024 is tier 9 (5.5%) -> $5,500
    expect(calcLegacyTierHECSRepayment(100000)).toBeCloseTo(5500, 1);
  });

  it('calcHECSRepayment switches between marginal and legacy correctly', () => {
    // Under 2026-27 marginal, $60k pays $0
    expect(calcHECSRepayment(60000, true)).toBe(0);
    // Under legacy 2024-25, $60k pays $600
    expect(calcHECSRepayment(60000, false)).toBeCloseTo(600, 1);
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
      hisaRate: 0.05,
      useMarginal2025System: true,
      projectionYears: 15,
    });

    expect(result.apraBorrowingCapacityImpact).toBeGreaterThan(30000);
    expect(result.schedule.length).toBe(15);
    expect(result.totalRepaidCompulsoryOnly).toBeGreaterThan(35000);
    expect(result.voluntaryPayoffYears).toBeLessThanOrEqual(result.compulsoryPayoffYears);
    expect(result.finalWealthHISA).toBeGreaterThan(0);
    expect(result.hisaNetRateAfterTax).toBeGreaterThan(0);
    expect(['voluntary_payoff', 'invest_etf', 'mortgage_offset', 'hisa_savings']).toContain(result.optimalStrategy);
  });

  it('handles zero current debt gracefully with zero borrowing penalty', () => {
    const result = simulateHECSPayoff({
      currentDebt: 0,
      annualIncome: 90000,
      incomeGrowthRate: 0.03,
      indexationRate: 0.028,
      lumpSumAvailable: 5000,
      monthlyVoluntaryPayment: 300,
      mortgageRate: 0.06,
      etfExpectedReturn: 0.08,
      useMarginal2025System: true,
      projectionYears: 10,
    });

    expect(result.compulsoryPayoffYears).toBe(0);
    expect(result.voluntaryPayoffYears).toBe(0);
    expect(result.totalIndexationCompulsoryOnly).toBe(0);
    expect(result.totalRepaidCompulsoryOnly).toBe(0);
    expect(result.apraBorrowingCapacityImpact).toBe(0);
    expect(result.schedule).toHaveLength(10);
    expect(result.schedule[0].endingBalance).toBe(0);
  });

  it('handles lump sum exceeding debt without over-allocating repayments', () => {
    const result = simulateHECSPayoff({
      currentDebt: 3000,
      annualIncome: 80000,
      incomeGrowthRate: 0.03,
      indexationRate: 0.028,
      lumpSumAvailable: 10000,
      monthlyVoluntaryPayment: 200,
      mortgageRate: 0.06,
      etfExpectedReturn: 0.08,
      useMarginal2025System: true,
      projectionYears: 5,
    });

    expect(result.voluntaryPayoffYears).toBe(0);
    expect(result.totalRepaidWithVoluntary).toBe(3000); // capped at starting debt
    expect(result.schedule[0].startingBalance).toBe(0);
  });
});

describe('Retrospective Indexation & Accord Debt Reduction', () => {
  it('calculates retrospective 2023-2024 indexation credits accurately', () => {
    // $30,000 debt:
    // Original: 30,000 * 1.071 * 1.047 = 33,640.11 -> indexation = 3,640
    // Reformed: 30,000 * 1.032 * 1.040 = 32,198.40 -> indexation = 2,198
    // Saved: 3,640 - 2,198 = 1,442
    const retro = calcRetrospectiveIndexationCredit(30000);
    expect(retro.originalEnding).toBe(33640);
    expect(retro.reformedEnding).toBe(32198);
    expect(retro.creditSaved).toBe(1442);
  });

  it('handles zero or negative debt for retrospective indexation', () => {
    const zero = calcRetrospectiveIndexationCredit(0);
    expect(zero.creditSaved).toBe(0);
    expect(zero.originalEnding).toBe(0);

    const neg = calcRetrospectiveIndexationCredit(-1000);
    expect(neg.creditSaved).toBe(0);
  });

  it('applies 20% Universities Accord debt reduction', () => {
    const { reducedDebt, amountReduced } = applyAccordDebtReduction(40000);
    expect(amountReduced).toBe(8000);
    expect(reducedDebt).toBe(32000);
  });

  it('handles zero debt for 20% Accord debt reduction', () => {
    const { reducedDebt, amountReduced } = applyAccordDebtReduction(0);
    expect(amountReduced).toBe(0);
    expect(reducedDebt).toBe(0);
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

  it('zero years returns empty rows and zero net advantage', () => {
    const result = comparePaydownVsInvest(20000, 200, 0.03, 0.07, 0);
    expect(result.rows).toEqual([]);
    expect(result.netAdvantageInvest).toBe(0);
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

  it('returns empty array if debt is zero or years is zero', () => {
    expect(repaymentSplitSchedule(0, 90000, 0.03, 0.028, 200, 10)).toEqual([]);
    expect(repaymentSplitSchedule(30000, 90000, 0.03, 0.028, 200, 0)).toEqual([]);
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

  it('handles zero starting debt in indexation scenario comparison', () => {
    const rows = compareIndexationScenarios(0, 90000, 0.03, 0, 200, [0.025, 0.05]);
    expect(rows).toHaveLength(2);
    expect(rows[0].payoffYears).toBe(0);
    expect(rows[0].totalIndexation).toBe(0);
    expect(rows[0].totalRepaid).toBe(0);
  });
});

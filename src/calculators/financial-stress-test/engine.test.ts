import { describe, it, expect } from 'vitest';
import { runFinancialStressTest, calcJobSeekerLAWP, maxSurvivableRate, applyCumulativeScenarios } from './engine';

describe('Financial Stress Testing & Runway Engine', () => {
  it('correctly calculates JobSeeker Liquid Assets Waiting Period (LAWP)', () => {
    // Single with < $5,500 has 0 weeks wait
    expect(calcJobSeekerLAWP(4000, true, false)).toBe(0);
    // Single with > $11,500 has max 13 weeks wait
    expect(calcJobSeekerLAWP(15000, true, false)).toBe(13);
  });

  it('correctly computes pre-tax equivalent offset yield arbitrage', () => {
    const res = runFinancialStressTest({
      grossAnnualIncome: 120000,
      monthlyNetIncome: 7200,
      monthlyEssentialExpenses: 3800,
      monthlyDiscretionaryExpenses: 1200,
      liquidCashSavings: 20000,
      mortgageOffsetBalance: 40000,
      mortgageDebtBalance: 450000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.0525,
      hasPrivateHospitalCover: true,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: true,
    });

    // Offset yield is tax-free, pre-tax equivalent must exceed nominal mortgage rate
    expect(res.preTaxEquivalentOffsetYield).toBeGreaterThan(6.2);
    expect(res.emergencyRunwayMonths).toBeGreaterThan(10);
    expect(res.healthScore.totalScore).toBeGreaterThan(60);
    expect(res.scenarios.apraRateShockPlus300bps).toBeDefined();
  });
});

describe('maxSurvivableRate (reverse stress test)', () => {
  it('known answer: $8k income, $4k expenses, $400k loan at 6% → survives around 11.3%', () => {
    // Repayment at R: monthlyRepayment(400000, R, 30) must stay <= $4,000.
    // At 11.0% -> ~$3,809; at 11.5% -> ~$3,950.
    const r = maxSurvivableRate(8000, 4000, 400000, 6, 30);
    expect(r.maxRate).toBeGreaterThan(10.5);
    expect(r.maxRate).toBeLessThan(13);
    expect(r.survivesAnyRise).toBe(true);
  });

  it('already underwater at current rate → no rise survivable', () => {
    const r = maxSurvivableRate(5000, 5500, 400000, 6, 30);
    expect(r.survivesAnyRise).toBe(false);
    expect(r.maxRateIncreasePts).toBe(0);
    expect(r.surplusAtMax).toBeLessThan(0);
  });

  it('no loan → capped at the search ceiling', () => {
    const r = maxSurvivableRate(8000, 3000, 0, 6, 30);
    expect(r.capped).toBe(true);
    expect(r.maxRate).toBe(26);
  });

  it('repayment buffer reduces the survivable rate', () => {
    const noBuffer = maxSurvivableRate(8000, 4000, 400000, 6, 30, 0);
    const buffered = maxSurvivableRate(8000, 4000, 400000, 6, 30, 5);
    expect(buffered.maxRate).toBeLessThan(noBuffer.maxRate);
  });

  it('empty-flag sanity: surplus falls as rate rises', () => {
    const r = maxSurvivableRate(8000, 4000, 400000, 6, 30);
    expect(r.monthlyRepaymentAtMax).toBeGreaterThan(0);
    expect(r.surplusAtMax).toBeGreaterThanOrEqual(0);
  });
});

describe('applyCumulativeScenarios', () => {
  const base = {
    monthlyNetIncome: 7200,
    monthlyEssentialExpenses: 3800,
    monthlyDiscretionaryExpenses: 1200,
    mortgageDebtBalance: 480000,
    mortgageOffsetBalance: 45000,
    currentMortgageInterestRate: 0.062,
    liquidCashSavings: 25000,
  };

  it('no shocks → cashflow unchanged, survives with 99-month runway', () => {
    const r = applyCumulativeScenarios({ ...base, rateRisePct: 0, jobLossMonths: 0, expenseShockPct: 0, bufferPct: 0 });
    expect(r.isFatal).toBe(false);
    expect(r.survivingMonths).toBe(99);
  });

  it('rate +2% and expense shock +10% reduce monthly surplus cumulatively', () => {
    const r = applyCumulativeScenarios({ ...base, rateRisePct: 2, jobLossMonths: 0, expenseShockPct: 10, bufferPct: 0 });
    // Extra interest = (480k-45k) x 0.02 / 12 = $725; expense shock = 5,000 x 0.1 = $500
    expect(r.extraMonthlyInterest).toBeCloseTo(725, 0);
    expect(r.expenseShockMonthly).toBeCloseTo(500, 0);
    expect(r.monthlySurplusAfterShocks).toBe(7200 - 5000 - 725 - 500);
  });

  it('job loss months → income $0, runway = liquid ÷ burn', () => {
    const r = applyCumulativeScenarios({ ...base, rateRisePct: 0, jobLossMonths: 6, expenseShockPct: 0, bufferPct: 0 });
    // TotalLiquid 70,000 ÷ burn ~7,665/mo ≈ 9.1 months — not fatal, but runway is finite
    expect(r.isFatal).toBe(false);
    expect(r.survivingMonths).toBeLessThan(99);
    expect(r.survivingMonths).toBeGreaterThan(5);
    expect(r.monthlySurplusAfterShocks).toBeLessThan(0);
  });

  it('repayment buffer scales the buffer line item', () => {
    const r = applyCumulativeScenarios({ ...base, rateRisePct: 0, jobLossMonths: 0, expenseShockPct: 0, bufferPct: 3 });
    expect(r.repaymentBufferMonthly).toBeGreaterThan(0);
  });

  it('zero debt and zero expenses → survives, no fatal flag', () => {
    const r = applyCumulativeScenarios({
      monthlyNetIncome: 5000,
      monthlyEssentialExpenses: 0,
      monthlyDiscretionaryExpenses: 0,
      mortgageDebtBalance: 0,
      mortgageOffsetBalance: 0,
      currentMortgageInterestRate: 0.062,
      liquidCashSavings: 1000,
      rateRisePct: 2,
      jobLossMonths: 0,
      expenseShockPct: 10,
      bufferPct: 0,
    });
    expect(r.isFatal).toBe(false);
  });
});

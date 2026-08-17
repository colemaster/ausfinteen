import { describe, it, expect } from 'vitest';
import { runFinancialStressTest, calcJobSeekerLAWP } from './engine';

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

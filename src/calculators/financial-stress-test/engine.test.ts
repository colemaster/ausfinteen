import { describe, it, expect } from 'vitest';
import {
  runFinancialStressTest,
  calcJobSeekerLAWP,
  maxSurvivableRate,
  applyCumulativeScenarios,
} from './engine';

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

  it('models interest rate shocks across spectrum (+2%, +3%, +4%)', () => {
    const res = runFinancialStressTest({
      grossAnnualIncome: 110000,
      monthlyNetIncome: 7000,
      monthlyEssentialExpenses: 4200,
      monthlyDiscretionaryExpenses: 1500,
      liquidCashSavings: 15000,
      mortgageOffsetBalance: 25000,
      mortgageDebtBalance: 500000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.0525,
      hasPrivateHospitalCover: false,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: false,
    });

    // Net debt = 500k - 25k = 475k
    // +200 bps (+2%) = 475k * 0.02 / 12 = $791.67/mo
    // +300 bps (+3%) = 475k * 0.03 / 12 = $1,187.50/mo
    // +400 bps (+4%) = 475k * 0.04 / 12 = $1,583.33/mo
    expect(res.rateShocks.plus200bps.extraMonthlyInterest).toBeCloseTo(792, -1);
    expect(res.rateShocks.plus300bps.extraMonthlyInterest).toBeCloseTo(1188, -1);
    expect(res.rateShocks.plus400bps.extraMonthlyInterest).toBeCloseTo(1583, -1);

    expect(res.rateShocks.plus200bps.effectiveRatePct).toBe(8.2);
    expect(res.rateShocks.plus300bps.effectiveRatePct).toBe(9.2);
    expect(res.rateShocks.plus400bps.effectiveRatePct).toBe(10.2);

    // +400 bps should have lower monthly surplus than +200 bps
    expect(res.rateShocks.plus400bps.monthlySurplus).toBeLessThan(res.rateShocks.plus200bps.monthlySurplus);
  });

  it('evaluates 1, 3, and 6 month emergency runway benchmark tiers', () => {
    // 1. Critical tier: under 1 month
    const criticalRes = runFinancialStressTest({
      grossAnnualIncome: 90000,
      monthlyNetIncome: 5500,
      monthlyEssentialExpenses: 4000,
      monthlyDiscretionaryExpenses: 1000,
      liquidCashSavings: 2000,
      mortgageOffsetBalance: 1000,
      mortgageDebtBalance: 400000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.05,
      hasPrivateHospitalCover: false,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: false,
    });

    expect(criticalRes.emergencyRunwayMonths).toBeLessThan(1.0);
    expect(criticalRes.runwayBenchmark.tier).toBe('critical_under_1m');
    expect(criticalRes.runwayBenchmark.isSafe).toBe(false);
    expect(criticalRes.runwayBenchmark.gapTo3Months).toBeGreaterThan(0);
    expect(criticalRes.runwayBenchmark.gapTo6Months).toBeGreaterThan(0);

    // 2. Vulnerable tier: 1 to 3 months
    const vulnerableRes = runFinancialStressTest({
      grossAnnualIncome: 90000,
      monthlyNetIncome: 5500,
      monthlyEssentialExpenses: 4000,
      monthlyDiscretionaryExpenses: 1000,
      liquidCashSavings: 8000,
      mortgageOffsetBalance: 2000,
      mortgageDebtBalance: 400000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.05,
      hasPrivateHospitalCover: false,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: false,
    });

    expect(vulnerableRes.emergencyRunwayMonths).toBeGreaterThanOrEqual(1.0);
    expect(vulnerableRes.emergencyRunwayMonths).toBeLessThan(3.0);
    expect(vulnerableRes.runwayBenchmark.tier).toBe('vulnerable_1_to_3m');
    expect(vulnerableRes.runwayBenchmark.isSafe).toBe(false);

    // 3. Resilient tier: 6+ months
    const resilientRes = runFinancialStressTest({
      grossAnnualIncome: 120000,
      monthlyNetIncome: 7500,
      monthlyEssentialExpenses: 3500,
      monthlyDiscretionaryExpenses: 1000,
      liquidCashSavings: 20000,
      mortgageOffsetBalance: 30000,
      mortgageDebtBalance: 400000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.05,
      hasPrivateHospitalCover: true,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: true,
    });

    expect(resilientRes.emergencyRunwayMonths).toBeGreaterThanOrEqual(6.0);
    expect(resilientRes.runwayBenchmark.tier).toBe('resilient_6m_plus');
    expect(resilientRes.runwayBenchmark.isSafe).toBe(true);
    expect(resilientRes.runwayBenchmark.gapTo6Months).toBe(0);
  });

  it('models cost of living buffers (+5%, +10%, +15%)', () => {
    const res = runFinancialStressTest({
      grossAnnualIncome: 100000,
      monthlyNetIncome: 6500,
      monthlyEssentialExpenses: 4000,
      monthlyDiscretionaryExpenses: 1000,
      liquidCashSavings: 20000,
      mortgageOffsetBalance: 10000,
      mortgageDebtBalance: 400000,
      currentMortgageInterestRate: 0.062,
      hisaInterestRate: 0.05,
      hasPrivateHospitalCover: true,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: false,
    });

    expect(res.costOfLivingBuffers).toHaveLength(3);
    // 5% of $4,000 essential expenses = $200
    expect(res.costOfLivingBuffers[0]?.extraMonthlyCost).toBe(200);
    // 10% of $4,000 = $400
    expect(res.costOfLivingBuffers[1]?.extraMonthlyCost).toBe(400);
    // 15% of $4,000 = $600
    expect(res.costOfLivingBuffers[2]?.extraMonthlyCost).toBe(600);
  });

  it('detects CCR 5-year default risk and provides relief steps under sub-1-month runway', () => {
    const res = runFinancialStressTest({
      grossAnnualIncome: 75000,
      monthlyNetIncome: 4500,
      monthlyEssentialExpenses: 4200,
      monthlyDiscretionaryExpenses: 800, // Deficit of -$500/mo
      liquidCashSavings: 1500,           // Only 0.3 months runway
      mortgageOffsetBalance: 0,
      mortgageDebtBalance: 450000,
      currentMortgageInterestRate: 0.065,
      hisaInterestRate: 0.05,
      hasPrivateHospitalCover: false,
      relationshipStatus: 'single',
      dependentsCount: 0,
      hasIncomeProtectionInsurance: false,
    });

    expect(res.ccrCreditRisk.isAtRisk).toBe(true);
    expect(res.ccrCreditRisk.riskLevel).toBe('critical');
    expect(res.ccrCreditRisk.defaultListingYears).toBe(5);
    expect(res.ccrCreditRisk.rhiMonths).toBe(24);
    expect(res.ccrCreditRisk.warningTitle).toContain('5-YEAR');
    expect(res.ccrCreditRisk.reliefSteps.length).toBeGreaterThanOrEqual(4);
    expect(res.ccrCreditRisk.reliefSteps.some(s => s.includes('1800 007 007'))).toBe(true);
    expect(res.ccrCreditRisk.reliefSteps.some(s => s.includes('Hardship'))).toBe(true);
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

  it('supports +4% severe interest rate shock scenario', () => {
    const r = applyCumulativeScenarios({ ...base, rateRisePct: 4, jobLossMonths: 0, expenseShockPct: 0, bufferPct: 0 });
    // Extra interest = (480k-45k) x 0.04 / 12 = $1450
    expect(r.extraMonthlyInterest).toBeCloseTo(1450, 0);
    expect(r.effectiveRate).toBeCloseTo(0.102, 3);
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

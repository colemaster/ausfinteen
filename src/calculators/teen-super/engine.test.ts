import { describe, it, expect } from 'vitest';
import {
  superComparison,
  compoundGrowthWithFees,
  teenMarginalRate,
  isUnder18SuperEligible,
  modelCasualSuperCompounding,
  SUPER_COMPARISON_ASSUMPTIONS,
} from './engine';
import { SUPER_RULES } from '@/data/super-rules';

describe('isUnder18SuperEligible (SGAA 1992 s 27(1)(a))', () => {
  it('exempts under-18 workers working 30 hours or fewer per week', () => {
    expect(isUnder18SuperEligible(15, 0)).toBe(false);
    expect(isUnder18SuperEligible(15, 15)).toBe(false);
    expect(isUnder18SuperEligible(16, 25)).toBe(false);
    expect(isUnder18SuperEligible(17, 30)).toBe(false);
  });

  it('mandates employer SG for under-18 workers working MORE than 30 hours per week', () => {
    expect(isUnder18SuperEligible(15, 30.5)).toBe(true);
    expect(isUnder18SuperEligible(16, 31)).toBe(true);
    expect(isUnder18SuperEligible(17, 38)).toBe(true);
  });

  it('mandates employer SG for workers aged 18 and over regardless of hours worked', () => {
    expect(isUnder18SuperEligible(18, 1)).toBe(true);
    expect(isUnder18SuperEligible(18, 10)).toBe(true);
    expect(isUnder18SuperEligible(19, 15)).toBe(true);
    expect(isUnder18SuperEligible(25, 0)).toBe(true);
  });
});

describe('modelCasualSuperCompounding ($50/wk casual compounding over 45 years)', () => {
  it('models $50/wk compounding from age 15 to 60 (45-year horizon)', () => {
    const res = modelCasualSuperCompounding(50, 15, 60, 0.085, 0.005);
    expect(res.startAge).toBe(15);
    expect(res.preservationAge).toBe(60);
    expect(res.compoundingYears).toBe(45);
    expect(res.totalContributionsPaid).toBe(50 * 52 * 45); // $117,000
    expect(res.netReturnRate).toBeCloseTo(0.08, 4);

    // FV at 8% net over 45 years should exceed $1.1M
    expect(res.futureValueWithFees).toBeGreaterThan(1100000);
    expect(res.futureValueWithFees).toBeLessThan(1200000);

    // Compounding generates more than 9x the total deposits
    expect(res.compoundingMultiplier).toBeGreaterThan(9);

    // Without fees (8.5% gross), balance exceeds $1.3M -> significant fee drag loss
    expect(res.futureValueNoFees).toBeGreaterThan(1300000);
    expect(res.feeDragLoss).toBeGreaterThan(200000);
    expect(res.feeDragPct).toBeGreaterThan(15);
  });

  it('scales proportionally with weekly contribution amounts', () => {
    const res25 = modelCasualSuperCompounding(25, 15, 60);
    const res50 = modelCasualSuperCompounding(50, 15, 60);
    expect(res50.futureValueWithFees).toBeCloseTo(res25.futureValueWithFees * 2, -2);
    expect(res50.totalContributionsPaid).toBe(res25.totalContributionsPaid * 2);
  });

  it('handles edge cases: zero weekly contribution and zero compounding years', () => {
    const zeroWeekly = modelCasualSuperCompounding(0, 15, 60);
    expect(zeroWeekly.futureValueWithFees).toBe(0);
    expect(zeroWeekly.totalContributionsPaid).toBe(0);
    expect(zeroWeekly.compoundingMultiplier).toBe(0);

    const zeroYears = modelCasualSuperCompounding(50, 60, 60);
    expect(zeroYears.compoundingYears).toBe(0);
    expect(zeroYears.futureValueWithFees).toBe(0);
    expect(zeroYears.totalContributionsPaid).toBe(0);
  });
});

// Figures verified 18 October 2026 against ATO 2026-27 rates and thresholds.
describe('superComparison', () => {
  it('invests 85 cents per pre-tax dollar via super vs 68 cents outside at a 32% marginal rate', () => {
    const res = superComparison(1000, 0.32);
    expect(res.superTaxRate).toBe(SUPER_RULES.taxRateInSuper);
    expect(res.perDollarSuper).toBeCloseTo(0.85, 5);
    expect(res.perDollarOutside).toBeCloseTo(0.68, 5);
    expect(res.superAdvantage).toBeGreaterThan(0);
  });

  it('uses the default employer SG rate of 12%', () => {
    const res = superComparison(50000, 0.30);
    expect(res.employerSgContribution).toBeCloseTo(50000 * SUPER_RULES.sgRate, 0);
  });

  it('favours outside investing when the personal rate is zero (teen under tax-free threshold)', () => {
    const res = superComparison(1000, 0);
    expect(res.outsideTaxRate).toBe(0);
    expect(res.perDollarOutside).toBe(1);
    expect(res.superAdvantage).toBeLessThan(0);
  });

  it('flags Division 293 for high incomes', () => {
    expect(superComparison(300000, 0.47).division293Applies).toBe(true);
    expect(superComparison(50000, 0.30).division293Applies).toBe(false);
  });

  it('flags Division 293 at the $250,000 income + SG threshold', () => {
    // income + employer SG (12%) crosses $250,000 between these two incomes
    expect(superComparison(223214, 0.47).division293Applies).toBe(false);
    expect(superComparison(223215, 0.47).division293Applies).toBe(true);
    expect(SUPER_RULES.division293Threshold).toBe(250000);
  });

  it('handles zero income and clamps extreme personal rates', () => {
    const zero = superComparison(0, 0.32);
    expect(zero.futureValueSuper).toBe(0);
    expect(zero.futureValueOutside).toBe(0);

    const clamped = superComparison(1000, 0.99);
    expect(clamped.outsideTaxRate).toBe(0.47);
    expect(clamped.perDollarOutside).toBeCloseTo(0.53, 5);
  });

  it('computes future values consistent with the documented growth assumption', () => {
    const res = superComparison(1000, 0.32);
    const { growthRate, yearsTo60 } = SUPER_COMPARISON_ASSUMPTIONS;
    const r = growthRate / 12;
    const n = yearsTo60 * 12;
    const factor = 12 * ((Math.pow(1 + r, n) - 1) / r);
    expect(res.futureValueSuper).toBe(Math.round(factor * 1000 * 0.85));
    expect(res.futureValueOutside).toBe(Math.round(factor * 1000 * 0.68));
  });

  it('supports custom horizons (e.g. 45 years from age 15 to 60)', () => {
    const res45 = superComparison(1000, 0.32, SUPER_RULES.sgRate, 45, 0.08);
    expect(res45.yearsTo60).toBe(45);
    expect(res45.growthRate).toBe(0.08);
    expect(res45.futureValueSuper).toBeGreaterThan(superComparison(1000, 0.32).futureValueSuper);
  });
});

describe('compoundGrowthWithFees', () => {
  it('applies a 2% fee drag on a 12% return over one year', () => {
    const res = compoundGrowthWithFees(100, 1, 0.12, 0.02);
    // Net 10% p.a. monthly-compounded on $100/mo deposits
    expect(res.netReturnRate).toBeCloseTo(0.10, 5);
    expect(res.futureValueWithFees).toBeCloseTo(1256.56, 0);
    expect(res.futureValueNoFees).toBeCloseTo(1268.25, 0);
    expect(res.feeDragLoss).toBeGreaterThan(0);
  });

  it('defaults to a 0.5% MER', () => {
    const res = compoundGrowthWithFees(200, 30, 0.085);
    expect(res.feeRate).toBe(0.005);
    expect(res.futureValueWithFees).toBeLessThan(res.futureValueNoFees);
    expect(res.feeDragPct).toBeGreaterThan(0);
  });

  it('returns no fee loss when the fee rate is zero', () => {
    const res = compoundGrowthWithFees(100, 10, 0.08, 0);
    expect(res.feeDragLoss).toBe(0);
    expect(res.futureValueWithFees).toBe(res.futureValueNoFees);
  });

  it('handles zero contributions and zero years', () => {
    expect(compoundGrowthWithFees(0, 10, 0.08).futureValueWithFees).toBe(0);
    expect(compoundGrowthWithFees(100, 0, 0.08).futureValueWithFees).toBe(0);
  });
});

describe('teenMarginalRate', () => {
  it('returns the combined marginal rate including Medicare', () => {
    expect(teenMarginalRate(120000)).toBeCloseTo(0.32, 5);
    expect(teenMarginalRate(10000)).toBe(0);
  });
});
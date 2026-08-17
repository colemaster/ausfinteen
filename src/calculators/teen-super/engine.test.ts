import { describe, it, expect } from 'vitest';
import {
  superComparison,
  compoundGrowthWithFees,
  teenMarginalRate,
  SUPER_COMPARISON_ASSUMPTIONS,
} from './engine';
import { SUPER_RULES } from '@/data/super-rules';

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
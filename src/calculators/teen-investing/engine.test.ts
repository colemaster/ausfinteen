import { describe, it, expect } from 'vitest';
import {
  etfGrowthWithFees,
  cgtAfterDiscount,
  afterTaxSaleValue,
  realReturn,
  nominalVsRealGrowth,
} from './engine';
import { CGT_DISCOUNT_INDIVIDUAL } from '@/data/constants';

describe('etfGrowthWithFees', () => {
  it('computes fee drag for a simple one-year case', () => {
    const res = etfGrowthWithFees(10000, 1, 10, 1);
    expect(res.netReturnRate).toBe(9);
    expect(res.futureValueGross).toBe(11000);
    expect(res.futureValueNet).toBe(10900);
    expect(res.feeDragLoss).toBe(100);
  });

  it('grows the fee drag loss over longer horizons', () => {
    const res = etfGrowthWithFees(10000, 30, 8.5, 0.5);
    expect(res.feeDragLoss).toBeGreaterThan(0);
    expect(res.futureValueNet).toBeLessThan(res.futureValueGross);
  });

  it('handles zero years and zero initial capital', () => {
    expect(etfGrowthWithFees(0, 10, 8.5, 0.5).futureValueNet).toBe(0);
    expect(etfGrowthWithFees(10000, 0, 8.5, 0.5).futureValueNet).toBe(10000);
  });
});

describe('cgtAfterDiscount', () => {
  it('applies the 50% discount and marginal rate', () => {
    expect(cgtAfterDiscount(10000, 0.32)).toBe(1600);
  });

  it('honours a custom discount and clamps rates', () => {
    expect(cgtAfterDiscount(10000, 0.32, 0.25)).toBe(2400);
    expect(cgtAfterDiscount(10000, 0.99)).toBe(2350); // clamped to 47% x 50%
  });

  it('returns zero for a loss or zero gain', () => {
    expect(cgtAfterDiscount(0, 0.32)).toBe(0);
    expect(cgtAfterDiscount(-500, 0.32)).toBe(0);
  });

  it('uses the CGT_DISCOUNT_INDIVIDUAL constant by default', () => {
    expect(CGT_DISCOUNT_INDIVIDUAL).toBe(0.50);
  });
});

describe('afterTaxSaleValue', () => {
  it('computes the after-tax sale value for a one-year holding', () => {
    const res = afterTaxSaleValue(10000, 1, 10, 1, 0.32);
    // FV after MER = $10,900; gain $900; CGT = 900 x 0.32 x 0.5 = $144
    expect(res).toBe(10756);
  });

  it('pays no CGT for zero marginal rate (teen under tax-free threshold)', () => {
    const res = afterTaxSaleValue(10000, 10, 8.5, 0.5, 0);
    const { futureValueNet } = etfGrowthWithFees(10000, 10, 8.5, 0.5);
    expect(res).toBe(futureValueNet);
  });

  it('returns the initial amount for zero years', () => {
    expect(afterTaxSaleValue(5000, 0, 8.5, 0.5, 0.32)).toBe(5000);
  });
});

describe('realReturn & nominalVsRealGrowth', () => {
  it('converts a nominal return to a real return', () => {
    // (1.085 / 1.03) - 1 = 5.34%
    expect(realReturn(8.5, 3)).toBeCloseTo(5.3398, 3);
  });

  it('produces a real value below the nominal value with positive inflation', () => {
    const res = nominalVsRealGrowth(10000, 10, 8.5, 3);
    expect(res.realRatePct).toBeLessThan(res.nominalRatePct);
    expect(res.futureValueReal).toBeLessThan(res.futureValueNominal);
  });

  it('handles zero inflation (real equals nominal)', () => {
    const res = nominalVsRealGrowth(10000, 5, 8, 0);
    expect(res.realRatePct).toBeCloseTo(8, 5);
    expect(res.futureValueReal).toBe(res.futureValueNominal);
  });
});
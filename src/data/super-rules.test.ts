import { describe, it, expect } from 'vitest';
import {
  calcDivision293Tax,
  calcDivision296Tax,
  getMinimumDrawdownRate,
  isDivision293,
  maxAdditionalSacrifice,
  SUPER_RULES,
} from './super-rules';

describe('2026-27 superannuation rates and thresholds (verified 18 October 2026)', () => {
  it('uses the 12.0% SG rate for 2025-26 and 2026-27', () => {
    expect(SUPER_RULES.sgRate).toBe(0.12);
  });

  it('matches the indexed contributions caps', () => {
    expect(SUPER_RULES.concessionalCap).toBe(32500);
    expect(SUPER_RULES.nonConcessionalCap).toBe(130000);
    expect(SUPER_RULES.bringForwardCap).toBe(390000);       // 3-year, TSB < $1.84M
    expect(SUPER_RULES.bringForwardCap2Year).toBe(260000);  // 2-year, TSB $1.84M–<$1.97M
  });

  it('matches the general transfer balance cap and defined benefit income cap', () => {
    expect(SUPER_RULES.transferBalanceCap).toBe(2100000);   // current from 1 July 2026
    expect(SUPER_RULES.transferBalanceCap2027).toBe(2100000);
    expect(SUPER_RULES.transferBalanceCap2026).toBe(2000000);
    expect(SUPER_RULES.definedBenefitIncomeCap).toBe(131250);
  });

  it('matches the non-concessional bring-forward total super balance tiers', () => {
    expect(SUPER_RULES.totalSuperBalanceNCCThreshold).toBe(1840000);
    expect(SUPER_RULES.totalSuperBalanceNCCUpperThreshold).toBe(1970000);
  });

  it('keeps the Division 293 threshold at $250,000', () => {
    expect(SUPER_RULES.division293Threshold).toBe(250000);
    expect(SUPER_RULES.division293Rate).toBe(0.15);
    expect(isDivision293(200000, 50000)).toBe(false);  // exactly at the threshold
    expect(isDivision293(200001, 50000)).toBe(true);
  });

  it('limits Division 293 tax to the concessional contributions', () => {
    // $260k income + $32.5k contributions: excess over $250k is $42.5k, capped at $32.5k
    const res = calcDivision293Tax(260000, 32500);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(32500 * 0.15, 2);
    expect(calcDivision293Tax(217500, 32500)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('calculates carry-forward eligibility and the under-18 hours rule', () => {
    expect(SUPER_RULES.carryForwardYears).toBe(5);
    expect(SUPER_RULES.carryForwardBalanceThreshold).toBe(500000);
    expect(SUPER_RULES.under18WeeklyHoursThreshold).toBe(30);
  });

  it('keeps the 3% low-balance fee cap for balances under $6,000', () => {
    expect(SUPER_RULES.lowBalanceFeeCap).toBe(0.03);
    expect(SUPER_RULES.lowBalanceThreshold).toBe(6000);
  });

  it('keeps preservation age 60 and Age Pension age 67', () => {
    expect(SUPER_RULES.preservationAge).toBe(60);
    expect(SUPER_RULES.agePensionAge).toBe(67);
  });

  it('caps salary sacrifice at the concessional cap less employer SG', () => {
    expect(maxAdditionalSacrifice(100000)).toBeCloseTo(32500 - 12000, 2);
    expect(maxAdditionalSacrifice(300000)).toBe(0);
  });
});

describe('minimum drawdown rates (Schedule 7 SISR, normal rates from 2023-24)', () => {
  it.each([
    [56, 0.04],
    [60, 0.04],
    [64, 0.04],
    [65, 0.05],
    [74, 0.05],
    [75, 0.06],
    [79, 0.06],
    [80, 0.07],
    [84, 0.07],
    [85, 0.09],
    [89, 0.09],
    [90, 0.11],
    [94, 0.11],
    [95, 0.14],
    [101, 0.14],
  ])('age %i → %f', (age, rate) => {
    expect(getMinimumDrawdownRate(age)).toBe(rate);
  });
});

describe('Division 296 tax on large balances (from 1 July 2026)', () => {
  it('does not apply at or below $3M', () => {
    expect(calcDivision296Tax(3000000, 200000)).toEqual({ applies: false, taxPayable: 0 });
    expect(calcDivision296Tax(1500000, 100000)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('does not apply with zero or negative earnings', () => {
    expect(calcDivision296Tax(5000000, 0)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('applies 15% to the realised earnings share above $3M', () => {
    // $4M balance, $400k realised earnings: share above $3M = 25% → 400000 × 0.25 × 0.15 = $15,000
    const res = calcDivision296Tax(4000000, 400000);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(15000, 2);
  });

  it('adds a further 10% on the share above $10M', () => {
    // $12M balance, $1.2M earnings:
    // base: 1.2M × (9/12) × 0.15 = $135,000; upper: 1.2M × (2/12) × 0.10 = $20,000
    const res = calcDivision296Tax(12000000, 1200000);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(155000, 2);
  });

  it('matches legislated thresholds and rates', () => {
    expect(SUPER_RULES.division296Threshold).toBe(3000000);
    expect(SUPER_RULES.division296UpperThreshold).toBe(10000000);
    expect(SUPER_RULES.division296Rate).toBe(0.15);
    expect(SUPER_RULES.division296UpperAdditionalRate).toBe(0.10);
  });
});

import { describe, it, expect } from 'vitest';
import { calcDivision296Tax, SUPER_RULES } from './super-rules';

describe('Division 296 tax on large balances (from 1 July 2026)', () => {
  it('does not apply at or below $3M', () => {
    expect(calcDivision296Tax(3000000, 200000)).toEqual({ applies: false, taxPayable: 0 });
    expect(calcDivision296Tax(1500000, 100000)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('does not apply with zero or negative earnings', () => {
    expect(calcDivision296Tax(5000000, 0)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('applies 15% to the earnings share above $3M', () => {
    // $4M balance, $400k earnings: share above $3M = 25% → 400000 × 0.25 × 0.15 = $15,000
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

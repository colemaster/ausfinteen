import { describe, it, expect } from 'vitest';
import { suburbYieldSummary } from './suburb-metrics';

describe('suburbYieldSummary', () => {
  it('known answer: $650k price, $500/wk rent → 4.00% gross yield', () => {
    const r = suburbYieldSummary({ medianPrice: 650000, weeklyRent: 500 });
    expect(r.grossYieldPct).toBeCloseTo(4.0, 1);
    expect(r.annualRent).toBe(26000);
    expect(r.monthlyRent).toBeCloseTo(2166.67, 0);
  });

  it('net yield is below gross yield once costs are deducted', () => {
    const r = suburbYieldSummary({
      medianPrice: 650000,
      weeklyRent: 500,
      managementFeePct: 7,
      vacancyPct: 3,
      annualHoldingCosts: 2500,
    });
    // Gross rent $26,000 − 10% (mgmt+vacancy) − $2,500 = $20,900 → 3.22%
    expect(r.netYieldPct).toBeLessThan(r.grossYieldPct);
    expect(r.netYieldPct).toBeCloseTo(3.22, 1);
  });

  it('price-to-rent ratio is 25 for $650k / $26k rent', () => {
    const r = suburbYieldSummary({ medianPrice: 650000, weeklyRent: 500 });
    expect(r.priceToRentRatio).toBeCloseTo(25, 0);
  });

  it('zero rent → zero yields and zero ratio (division-by-zero guard)', () => {
    const r = suburbYieldSummary({ medianPrice: 650000, weeklyRent: 0 });
    expect(r.grossYieldPct).toBe(0);
    expect(r.netYieldPct).toBe(0);
    expect(r.priceToRentRatio).toBe(0);
  });

  it('zero price → zero yields (division-by-zero guard)', () => {
    const r = suburbYieldSummary({ medianPrice: 0, weeklyRent: 500 });
    expect(r.grossYieldPct).toBe(0);
  });

  it('produces 9 display rows covering price, rent, yields, ratio and costs', () => {
    const r = suburbYieldSummary({ medianPrice: 650000, weeklyRent: 500 });
    expect(r.rows).toHaveLength(9);
    expect(r.rows.some(row => row.metric === 'Gross rental yield')).toBe(true);
  });
});
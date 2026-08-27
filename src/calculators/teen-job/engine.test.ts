import { describe, it, expect } from 'vitest';
import {
  getJuniorRatePct,
  netPayWithAllowances,
  penaltyRateBreakdown,
  type AwardName,
} from './engine';

describe('getJuniorRatePct', () => {
  it('maps under-16 workers to the youngest junior band (fast food 40%)', () => {
    expect(getJuniorRatePct(15, 'fast_food').pct).toBe(0.40);
  });

  it('maps 16-year-olds to the 50% retail band', () => {
    expect(getJuniorRatePct(16, 'retail').pct).toBe(0.50);
  });

  it('maps 17-year-olds to the 60% hospitality band', () => {
    expect(getJuniorRatePct(17, 'hospitality').pct).toBe(0.60);
  });

  it('maps 20-year-olds to the pharmacy 90% band', () => {
    expect(getJuniorRatePct(20, 'pharmacy').pct).toBe(0.90);
  });

  it('maps 21+ workers to the adult (100%) rate', () => {
    expect(getJuniorRatePct(21, 'fast_food').pct).toBe(1.00);
    expect(getJuniorRatePct(30, 'hospitality').pct).toBe(1.00);
  });

  it('handles the fitness award banding (under 17 = 55%, 18 = 75%)', () => {
    expect(getJuniorRatePct(16, 'fitness').pct).toBe(0.55);
    expect(getJuniorRatePct(18, 'fitness').pct).toBe(0.75);
  });
});

describe('netPayWithAllowances', () => {
  it('applies the junior rate and pays no tax under the $350/wk threshold', () => {
    const res = netPayWithAllowances(16, 20.40, 12, 'fast_food');
    // 50% junior rate -> $10.20/hr x 12h = $122.40/wk
    expect(res.juniorPct).toBe(0.50);
    expect(res.effectiveHourlyRate).toBeCloseTo(10.20, 2);
    expect(res.grossWeekly).toBeCloseTo(122.40, 2);
    expect(res.taxWithheldWeekly).toBe(0);
    expect(res.netWeekly).toBeCloseTo(122.40, 2);
    expect(res.annualGross).toBeCloseTo(6364.80, 1);
    // Under 18 with only 12 hours/week -> no super
    expect(res.isSuperEligible).toBe(false);
    expect(res.superWeekly).toBe(0);
  });

  it('withholds 15% above the $350 weekly threshold', () => {
    const res = netPayWithAllowances(18, 27.80, 22, 'retail');
    // 70% junior rate -> $19.46/hr x 22h = $428.12
    expect(res.grossWeekly).toBeCloseTo(428.12, 2);
    expect(res.taxWithheldWeekly).toBeCloseTo((428.12 - 350) * 0.15, 2);
    expect(res.netWeekly).toBeCloseTo(428.12 - (428.12 - 350) * 0.15, 2);
    // 18yo -> super always paid
    expect(res.isSuperEligible).toBe(true);
    expect(res.superWeekly).toBeCloseTo(428.12 * 0.12, 2);
  });

  it('pays super for under-18s working more than 30 hours/week', () => {
    const res = netPayWithAllowances(16, 20, 32, 'fast_food');
    expect(res.isSuperEligible).toBe(true);
    expect(res.superWeekly).toBeGreaterThan(0);
  });

  it('includes allowances and penalty multipliers in gross pay', () => {
    const res = netPayWithAllowances(17, 20, 8, 'retail', {
      weeklyAllowances: 15.5,
      penaltyMultiplier: 1.25,
    });
    // 60% x $20 x 1.25 = $15/hr x 8h = $120 + $15.50 allowance
    expect(res.effectiveHourlyRate).toBeCloseTo(15, 2);
    expect(res.grossWeekly).toBeCloseTo(135.50, 2);
  });

  it('withholds 15% from the first dollar when the tax-free threshold is not claimed', () => {
    const res = netPayWithAllowances(15, 17.20, 8, 'fast_food', { claimsTaxFreeThreshold: false });
    expect(res.taxWithheldWeekly).toBeCloseTo(res.grossWeekly * 0.15, 2);
  });

  it('handles zero hours and zero hourly rate without NaN', () => {
    const zero = netPayWithAllowances(16, 0, 0, 'retail');
    expect(zero.grossWeekly).toBe(0);
    expect(zero.netWeekly).toBe(0);
    expect(zero.superWeekly).toBe(0);
    expect(Number.isNaN(zero.effectiveHourlyRate)).toBe(false);
  });

  it('accepts every award name without throwing', () => {
    const awards: AwardName[] = ['fast_food', 'retail', 'hospitality', 'pharmacy', 'fitness'];
    awards.forEach(a => {
      const res = netPayWithAllowances(17, 20, 10, a);
      expect(res.grossWeekly).toBeGreaterThan(0);
    });
  });
});

describe('penaltyRateBreakdown', () => {
  it('produces one row per shift type with the correct multipliers', () => {
    const rows = penaltyRateBreakdown(20.4);
    expect(rows).toHaveLength(6);
    const sat = rows.find(r => r.type === 'saturday');
    const phPerm = rows.find(r => r.type === 'public_holiday_perm');
    const phCasual = rows.find(r => r.type === 'public_holiday_casual');
    expect(sat?.multiplier).toBe(1.25);
    expect(sat?.effectiveRate).toBeCloseTo(25.5, 2);
    expect(phPerm?.multiplier).toBe(2.50);
    expect(phPerm?.effectiveRate).toBeCloseTo(51.0, 2);
    expect(phCasual?.multiplier).toBe(2.75);
    expect(phCasual?.effectiveRate).toBeCloseTo(56.1, 2);
  });

  it('returns all-zero effective rates for a zero base rate', () => {
    const rows = penaltyRateBreakdown(0);
    rows.forEach(r => expect(r.effectiveRate).toBe(0));
  });
});
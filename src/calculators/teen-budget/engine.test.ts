import { describe, it, expect } from 'vitest';
import { splitPaycheck, adjustSplitKeepingTotal, convertPaycheckPeriod } from './engine';

describe('splitPaycheck', () => {
  it('splits $500 at 50/30/20', () => {
    const res = splitPaycheck(500, 50, 30, 20);
    expect(res.needs).toBeCloseTo(250, 5);
    expect(res.wants).toBeCloseTo(150, 5);
    expect(res.savings).toBeCloseTo(100, 5);
  });

  it('normalises percentages that do not sum to 100', () => {
    const res = splitPaycheck(500, 50, 30, 15); // sums to 95
    expect(res.needs).toBeCloseTo(263.16, 1);
    expect(res.wants).toBeCloseTo(157.89, 1);
    expect(res.savings).toBeCloseTo(78.95, 1);
    expect(res.needs + res.wants + res.savings).toBeCloseTo(500, 5);
  });

  it('handles zero amount and all-zero percentages', () => {
    expect(splitPaycheck(0, 50, 30, 20)).toEqual({ needs: 0, wants: 0, savings: 0 });
    expect(splitPaycheck(500, 0, 0, 0)).toEqual({ needs: 0, wants: 0, savings: 0 });
  });
});

describe('adjustSplitKeepingTotal', () => {
  it('redistributes the change proportionally to keep the total at 100', () => {
    const res = adjustSplitKeepingTotal({ needs: 50, wants: 30, savings: 20 }, 'needs', 60);
    // remaining 40 split 30:20 -> wants 24, savings 16
    expect(res.needs).toBe(60);
    expect(res.wants).toBeCloseTo(24, 5);
    expect(res.savings).toBeCloseTo(16, 5);
    expect(res.needs + res.wants + res.savings).toBeCloseTo(100, 5);
  });

  it('clamps the changed bucket to 0-100', () => {
    const res = adjustSplitKeepingTotal({ needs: 50, wants: 30, savings: 20 }, 'needs', 120);
    expect(res.needs).toBe(100);
    expect(res.wants).toBe(0);
    expect(res.savings).toBe(0);
  });

  it('leaves the split unchanged when the other buckets are zero', () => {
    const res = adjustSplitKeepingTotal({ needs: 100, wants: 0, savings: 0 }, 'needs', 80);
    expect(res).toEqual({ needs: 80, wants: 0, savings: 0 });
  });
});

describe('convertPaycheckPeriod', () => {
  it('converts between weekly, fortnightly and monthly', () => {
    expect(convertPaycheckPeriod(200, 'weekly', 'fortnightly')).toBeCloseTo(400, 5);
    expect(convertPaycheckPeriod(200, 'weekly', 'monthly')).toBeCloseTo(200 * 52 / 12, 5);
    expect(convertPaycheckPeriod(400, 'fortnightly', 'weekly')).toBeCloseTo(200, 5);
  });

  it('is identity for the same period and handles zero', () => {
    expect(convertPaycheckPeriod(150, 'monthly', 'monthly')).toBe(150);
    expect(convertPaycheckPeriod(0, 'weekly', 'monthly')).toBe(0);
  });
});
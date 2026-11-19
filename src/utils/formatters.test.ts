import { describe, it, expect } from 'vitest';
import {
  formatCompact,
  formatCurrency,
  formatPercent,
  formatPct,
  formatYears,
  formatDiff,
  clamp,
} from './formatters';

describe('formatters', () => {
  it('formats AUD currency integers and optional decimals', () => {
    expect(formatCurrency(925000)).toBe('$925,000');
    expect(formatCurrency(-1250)).toBe('-$1,250');
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency(2.5, 2)).toBe('$2.50');
    expect(formatCurrency(-1234.5, 2)).toBe('-$1,234.50');
  });

  it('formats compact AUD values', () => {
    expect(formatCompact(1_234_567)).toBe('$1.23M');
    expect(formatCompact(12_345)).toBe('$12k');
    expect(formatCompact(500)).toBe('$500');
    expect(formatCompact(-2_500_000)).toBe('-$2.50M');
    expect(formatCompact(null)).toBe('—');
  });

  it('formats percentages, years, diffs, and clamps values', () => {
    expect(formatPercent(0.475)).toBe('47.5%');
    expect(formatPct(5.75, 2)).toBe('5.75%');
    expect(formatYears(12.34)).toBe('12.3 yrs');
    expect(formatDiff(50000)).toBe('+$50,000');
    expect(formatDiff(-20000)).toBe('-$20,000');
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

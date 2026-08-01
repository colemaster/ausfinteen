import { describe, it, expect } from 'vitest';
import {
  buildGrowthSeries,
  computePortfolioStats,
  TOP_10_ASX_ETFS,
  BEST_3_ETF_PORTFOLIOS,
} from '@/data/asx-etf-data';

describe('buildGrowthSeries', () => {
  it('compounds $10k through a single year of known return', () => {
    const etfs = [TOP_10_ASX_ETFS.find(e => e.code === 'VAS')!];
    const series = buildGrowthSeries(etfs, 2024, 2025);
    // VAS 2024 = 11.40%, 2025 = 10.65%
    const expected = 10000 * 1.114 * 1.1065;
    expect(series).toHaveLength(2);
    expect(series[1].VAS).toBe(Math.round(expected));
  });

  it('skips years with no data rather than emitting garbage', () => {
    const etfs = [TOP_10_ASX_ETFS.find(e => e.code === 'VGS')!]; // starts 2020
    const series = buildGrowthSeries(etfs, 2016, 2021);
    expect(series[0].VGS).toBeUndefined();
    expect(series[4].VGS).toBe(Math.round(10000 * 1.048)); // first year with data (2020: +4.8%)
  });

  it('produces an increasing series for a positive-return fund', () => {
    const etfs = [TOP_10_ASX_ETFS.find(e => e.code === 'NDQ')!];
    const series = buildGrowthSeries(etfs, 2016, 2019);
    const values = series.map(p => p.NDQ as number);
    expect(values[values.length - 1]).toBeGreaterThan(10000);
  });

  it('handles empty ETF list', () => {
    expect(buildGrowthSeries([], 2020, 2021)).toHaveLength(2);
  });
});

describe('computePortfolioStats', () => {
  it('computes weighted MER correctly for a 50/50 split', () => {
    const stats = computePortfolioStats(
      [
        { code: 'VAS', pct: 50 },
        { code: 'VGS', pct: 50 },
      ],
      TOP_10_ASX_ETFS
    );
    // VAS 0.07%, VGS 0.18% → 0.125%
    expect(stats.weightedMer).toBeCloseTo(0.125, 5);
  });

  it('computes weighted 1Y return for the Balanced Starter portfolio', () => {
    const balanced = BEST_3_ETF_PORTFOLIOS.find(p => p.id === 'balanced')!;
    const stats = computePortfolioStats(balanced.allocations, TOP_10_ASX_ETFS);
    const expected =
      (TOP_10_ASX_ETFS.find(e => e.code === 'VAS')!.trailing['1Y']! * 40 +
        TOP_10_ASX_ETFS.find(e => e.code === 'VGS')!.trailing['1Y']! * 30 +
        TOP_10_ASX_ETFS.find(e => e.code === 'A200')!.trailing['1Y']! * 30) /
      100;
    expect(stats.weighted1Y).toBeCloseTo(expected, 5);
  });

  it('treats a fund with null trailing as weightless for that period', () => {
    // A200 has no 10Y data; 5Y is present so weighted 5Y is non-null
    const stats = computePortfolioStats([{ code: 'A200', pct: 100 }], TOP_10_ASX_ETFS);
    expect(stats.weighted5Y).toBeCloseTo(7.91, 5);
  });

  it('all three portfolios are fully weighted (MER non-null)', () => {
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const stats = computePortfolioStats(p.allocations, TOP_10_ASX_ETFS);
      expect(stats.weightedMer).not.toBeNull();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  buildGrowthSeries,
  computePortfolioStats,
  TOP_10_ASX_ETFS,
  STARTER_ETFS,
  ALL_POPULAR_ASX_ETFS,
  ASX_ETF_REGISTRY,
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

  it('builds series for starter ETFs like DHHF', () => {
    const dhhf = STARTER_ETFS.find(e => e.code === 'DHHF')!;
    const series = buildGrowthSeries([dhhf], 2023, 2025);
    expect(series).toHaveLength(3);
    expect(series[2].DHHF).toBeGreaterThan(10000);
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

  it('computes weighted returns and MER for the Aussie Core + Global portfolio (VAS 40% + VGS 60%)', () => {
    const core = BEST_3_ETF_PORTFOLIOS.find(p => p.id === 'aussie-core-global')!;
    const stats = computePortfolioStats(core.allocations, ALL_POPULAR_ASX_ETFS);
    const vas = ALL_POPULAR_ASX_ETFS.find(e => e.code === 'VAS')!;
    const vgs = ALL_POPULAR_ASX_ETFS.find(e => e.code === 'VGS')!;

    const expected1Y = (vas.trailing['1Y']! * 40 + vgs.trailing['1Y']! * 60) / 100;
    const expectedMer = (vas.mer * 40 + vgs.mer * 60) / 100;
    const expectedYield = (vas.dividendYield * 40 + vgs.dividendYield * 60) / 100;

    expect(stats.weighted1Y).toBeCloseTo(expected1Y, 5);
    expect(stats.weightedMer).toBeCloseTo(expectedMer, 5);
    expect(stats.weightedYield).toBeCloseTo(expectedYield, 5);
    expect(stats.weighted10Y).not.toBeNull();
  });

  it('computes stats for the All-in-One Diversified portfolio (DHHF 100%)', () => {
    const allInOne = BEST_3_ETF_PORTFOLIOS.find(p => p.id === 'all-in-one')!;
    const stats = computePortfolioStats(allInOne.allocations, ALL_POPULAR_ASX_ETFS);
    expect(stats.weightedMer).toBeCloseTo(0.19, 2);
    expect(stats.weightedYield).toBeCloseTo(2.65, 2);
    expect(stats.weighted1Y).toBeCloseTo(11.2, 1);
  });

  it('computes stats for the Tech & Growth Tilt portfolio (VGS 50% + NDQ 25% + QUAL 25%)', () => {
    const techTilt = BEST_3_ETF_PORTFOLIOS.find(p => p.id === 'tech-growth')!;
    const stats = computePortfolioStats(techTilt.allocations, ALL_POPULAR_ASX_ETFS);
    // VGS (0.18*50) + NDQ (0.48*25) + QUAL (0.40*25) = 9 + 12 + 10 = 31 / 100 = 0.31%
    expect(stats.weightedMer).toBeCloseTo(0.31, 2);
    expect(stats.weighted5Y).toBeGreaterThan(12);
  });

  it('treats a fund with null trailing as weightless for that period', () => {
    // A200 has no 10Y data; 5Y is present so weighted 5Y is non-null
    const stats = computePortfolioStats([{ code: 'A200', pct: 100 }], TOP_10_ASX_ETFS);
    expect(stats.weighted5Y).toBeCloseTo(7.95, 5);
  });

  it('all three starter portfolios are fully weighted (MER non-null)', () => {
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const stats = computePortfolioStats(p.allocations, ALL_POPULAR_ASX_ETFS);
      expect(stats.weightedMer).not.toBeNull();
      expect(stats.weightedYield).not.toBeNull();
      expect(stats.weighted1Y).not.toBeNull();
    });
  });

  it('all portfolio variants resolve with valid weighted stats', () => {
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      p.variants?.forEach(variant => {
        const stats = computePortfolioStats(variant.allocations, ALL_POPULAR_ASX_ETFS);
        expect(stats.weightedMer).toBeGreaterThan(0);
        expect(stats.weightedYield).toBeGreaterThan(0);
      });
    });
  });
});

describe('ASX ETF Registry, MERs & Trailing Returns Audit', () => {
  it('contains all 9 required core ETFs in ASX_ETF_REGISTRY', () => {
    const requiredCodes = ['A200', 'VAS', 'VGS', 'BGBL', 'IVV', 'NDQ', 'DHHF', 'VDHG', 'QUAL'];
    requiredCodes.forEach(code => {
      expect(ASX_ETF_REGISTRY[code]).toBeDefined();
      expect(ASX_ETF_REGISTRY[code].code).toBe(code);
    });
  });

  it('verifies exact Management Expense Ratios (MERs) per latest 2026 factsheets', () => {
    expect(ASX_ETF_REGISTRY['A200'].mer).toBe(0.04); // Betashares Australia 200
    expect(ASX_ETF_REGISTRY['VAS'].mer).toBe(0.07);  // Vanguard Australian Shares
    expect(ASX_ETF_REGISTRY['VGS'].mer).toBe(0.18);  // Vanguard MSCI Int Shares
    expect(ASX_ETF_REGISTRY['BGBL'].mer).toBe(0.08); // Betashares Global Shares
    expect(ASX_ETF_REGISTRY['IVV'].mer).toBe(0.03);  // iShares Core S&P 500
    expect(ASX_ETF_REGISTRY['NDQ'].mer).toBe(0.48);  // Betashares NASDAQ 100
    expect(ASX_ETF_REGISTRY['DHHF'].mer).toBe(0.19); // Betashares Diversified All Growth
    expect(ASX_ETF_REGISTRY['VDHG'].mer).toBe(0.27); // Vanguard Diversified High Growth
    expect(ASX_ETF_REGISTRY['QUAL'].mer).toBe(0.40); // VanEck MSCI Int Quality
  });

  it('verifies trailing returns benchmarks (including A200 5Y ~7.95%)', () => {
    // A200 5Y trailing return ~7.95%
    expect(ASX_ETF_REGISTRY['A200'].trailing['5Y']).toBeCloseTo(7.95, 2);
    expect(ASX_ETF_REGISTRY['VAS'].trailing['5Y']).toBeCloseTo(7.57, 2);
    expect(ASX_ETF_REGISTRY['VGS'].trailing['5Y']).toBeCloseTo(14.95, 2);
    expect(ASX_ETF_REGISTRY['NDQ'].trailing['10Y']).toBeCloseTo(20.48, 2);
    expect(ASX_ETF_REGISTRY['QUAL'].trailing['5Y']).toBeCloseTo(11.60, 2);
    expect(ASX_ETF_REGISTRY['DHHF'].trailing['5Y']).toBeCloseTo(10.85, 2);
    expect(ASX_ETF_REGISTRY['VDHG'].trailing['5Y']).toBeCloseTo(9.42, 2);
  });

  it('verifies asset allocations for diversified and equity funds', () => {
    // DHHF is 100% all-growth equity
    expect(ASX_ETF_REGISTRY['DHHF'].assetAllocation).toEqual({
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Growth / 0% Defensive (100% all-equity globally diversified across ~8,000 stocks)',
    });

    // VDHG has 90% growth / 10% defensive split
    expect(ASX_ETF_REGISTRY['VDHG'].assetAllocation).toEqual({
      growthPct: 90,
      defensivePct: 10,
      summary: '90% Growth (equities) / 10% Defensive (global and Australian bonds) with automatic rebalancing',
    });

    // Equity index funds are 100% growth
    ['VAS', 'VGS', 'A200', 'BGBL', 'IVV', 'NDQ', 'QUAL'].forEach(code => {
      expect(ASX_ETF_REGISTRY[code].assetAllocation?.growthPct).toBe(100);
      expect(ASX_ETF_REGISTRY[code].assetAllocation?.defensivePct).toBe(0);
    });
  });

  it('verifies distribution yields and payment frequencies are positive and valid', () => {
    const validFrequencies = ['Quarterly', 'Semi-Annual', 'Annual'];
    Object.values(ASX_ETF_REGISTRY).forEach(etf => {
      expect(etf.dividendYield).toBeGreaterThan(0);
      expect(validFrequencies).toContain(etf.payFrequency);
      expect(etf.url).toMatch(/^https:\/\//);
      expect(etf.topHoldings.length).toBeGreaterThanOrEqual(4);
    });
  });
});

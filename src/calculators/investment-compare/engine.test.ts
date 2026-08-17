import { describe, it, expect } from 'vitest';
import {
  runScenario,
  runAllScenarios,
  applyCrashToSeries,
  feeDrag,
  cgtAdjustedFinalValue,
} from './engine';

const baseParams = {
  label: 'Test',
  initial: 100000,
  monthlyContribution: 1000,
  annualReturn: 8,
  mer: 0.2,
  taxTreatment: 'marginal' as const,
  marginalRate: 0.32,
};

describe('runScenario', () => {
  it('tax-free grows faster than marginal for same return', () => {
    const marginal = runScenario(baseParams, 10);
    const taxFree = runScenario({ ...baseParams, taxTreatment: 'tax-free' }, 10);
    expect(taxFree.finalBalance).toBeGreaterThan(marginal.finalBalance);
  });

  it('higher MER reduces final value', () => {
    const lowMER = runScenario({ ...baseParams, mer: 0.1 }, 10);
    const highMER = runScenario({ ...baseParams, mer: 1.5 }, 10);
    expect(lowMER.finalBalance).toBeGreaterThan(highMER.finalBalance);
  });

  it('generates yearly array of correct length', () => {
    const result = runScenario(baseParams, 15);
    expect(result.yearly.length).toBe(15);
  });

  it('monthly contributions compound — final > initial + contributions', () => {
    const result = runScenario(baseParams, 10);
    const totalContributions = 100000 + 1000 * 12 * 10;
    expect(result.finalBalance).toBeGreaterThan(totalContributions);
  });

  it('super tax (15%) produces balance between marginal and tax-free', () => {
    const marginal = runScenario(baseParams, 10);
    const super_ = runScenario({ ...baseParams, taxTreatment: 'super' }, 10);
    const taxFree = runScenario({ ...baseParams, taxTreatment: 'tax-free' }, 10);
    expect(super_.finalBalance).toBeGreaterThan(marginal.finalBalance);
    expect(super_.finalBalance).toBeLessThan(taxFree.finalBalance);
  });
});

describe('runAllScenarios', () => {
  it('returns one result per scenario', () => {
    const results = runAllScenarios([baseParams, { ...baseParams, label: 'B' }], 5);
    expect(results).toHaveLength(2);
  });

  it('assigns different colors to different scenarios', () => {
    const results = runAllScenarios([
      baseParams,
      { ...baseParams, label: 'B' },
      { ...baseParams, label: 'C' },
    ], 5);
    expect(results[0].color).not.toBe(results[1].color);
  });
});

describe('applyCrashToSeries', () => {
  it('reduces the crash year and all later years by the crash pct', () => {
    const series = [1000, 1100, 1210, 1331];
    const crashed = applyCrashToSeries(series, 2, 30);
    expect(crashed[0]).toBe(1000);
    expect(crashed[1]).toBe(770);   // 1100 * 0.7
    expect(crashed[2]).toBe(847);   // 1210 * 0.7
    expect(crashed[3]).toBeCloseTo(931.7, 10);
  });

  it('returns the original series when crash year is out of range', () => {
    const series = [100, 200, 300];
    expect(applyCrashToSeries(series, 0, 30)).toEqual(series);
    expect(applyCrashToSeries(series, 10, 30)).toEqual(series);
  });

  it('does not mutate the input series', () => {
    const series = [100, 200];
    const crashed = applyCrashToSeries(series, 1, 50);
    expect(series).toEqual([100, 200]);
    expect(crashed).not.toBe(series);
  });

  it('handles a zero crash pct as a no-op', () => {
    expect(applyCrashToSeries([100, 200], 1, 0)).toEqual([100, 200]);
  });
});

describe('feeDrag', () => {
  it('high MER always underperforms low MER', () => {
    const result = feeDrag(50000, 1000, 8, 0.1, 1.0, 20);
    expect(result.lowFeeSeries).toHaveLength(20);
    expect(result.highFeeSeries).toHaveLength(20);
    expect(result.finalLoss).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) {
      expect(result.lowFeeSeries[i]).toBeGreaterThan(result.highFeeSeries[i]);
    }
  });

  it('zero fee gap produces zero loss', () => {
    const result = feeDrag(50000, 1000, 8, 0.5, 0.5, 10);
    expect(result.finalLoss).toBe(0);
    expect(result.difference.every(d => d === 0)).toBe(true);
  });

  it('known answer: 10% return, no contributions, 1 year (monthly compounding)', () => {
    const result = feeDrag(100000, 0, 10, 0, 1, 1);
    // low: 100000 * (1 + 0.10/12)^12 ≈ 110471
    expect(result.lowFeeSeries[0]).toBeCloseTo(110471, 0);
    expect(result.highFeeSeries[0]).toBeLessThan(110471);
    expect(result.lostPct).toBeGreaterThan(0);
  });
});

describe('cgtAdjustedFinalValue', () => {
  it('50% discount: tax only on half the gain at marginal rate', () => {
    const after = cgtAdjustedFinalValue(0, 50000, 100000, 0.32);
    // gain 50000, taxable 25000, tax 8000 -> 92000
    expect(after).toBe(92000);
  });

  it('no gain means no tax', () => {
    expect(cgtAdjustedFinalValue(0, 100000, 100000, 0.32)).toBe(100000);
  });

  it('no discount (e.g. <12 months) taxes the full gain', () => {
    const after = cgtAdjustedFinalValue(0, 50000, 100000, 0.32, 0);
    // gain 50000 fully taxable -> tax 16000 -> 84000
    expect(after).toBe(84000);
  });

  it('uses the larger of initial and contributions as cost base', () => {
    const after = cgtAdjustedFinalValue(10000, 50000, 100000, 0.32);
    expect(after).toBe(92000);
  });
});

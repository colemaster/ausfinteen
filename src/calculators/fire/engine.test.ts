import { describe, it, expect } from 'vitest';
import {
  calculateFIRENumber,
  coastFIRENumber,
  yearsToFIRE,
  calculateSuperBridge,
  leanVsFatTable,
  simulateSequenceRisk,
  fanFromScenarioYearlies,
  inflationAdjustedSeries,
  projectCoastToRetirement,
  netSuperContribution,
} from './engine';

describe('calculateFIRENumber', () => {
  it('$80k expenses at 4% → $2,000,000', () => {
    expect(calculateFIRENumber(80000, 0.04)).toBe(2000000);
  });

  it('returns Infinity for 0% withdrawal rate', () => {
    expect(calculateFIRENumber(80000, 0)).toBe(Infinity);
  });
});

describe('coastFIRENumber', () => {
  it('$2M target, 7% return, 25 years → approx $369k', () => {
    const result = coastFIRENumber(2000000, 7, 25);
    expect(result).toBeGreaterThan(350000);
    expect(result).toBeLessThan(400000);
  });

  it('0 years to retirement → returns targetAmount', () => {
    expect(coastFIRENumber(2000000, 7, 0)).toBe(2000000);
  });
});

describe('yearsToFIRE', () => {
  it('$500k current, $50k savings, $2M target, 7% return → reasonable value', () => {
    const years = yearsToFIRE(500000, 50000, 2000000, 7);
    expect(years).toBeGreaterThan(0);
    expect(years).toBeLessThan(25);
  });

  it('already at target → 0 years', () => {
    expect(yearsToFIRE(2000000, 50000, 2000000, 7)).toBe(0);
  });
});

describe('leanVsFatTable', () => {
  it('generates a row per expense level', () => {
    const rows = leanVsFatTable(200000, 50000, 7, 0.04, [40000, 60000, 80000]);
    expect(rows).toHaveLength(3);
  });

  it('higher expenses → higher FIRE number and more years', () => {
    const rows = leanVsFatTable(200000, 50000, 7, 0.04, [40000, 80000]);
    expect(rows[1].fireNumber).toBeGreaterThan(rows[0].fireNumber);
    expect(rows[1].yearsToFIRE).toBeGreaterThanOrEqual(rows[0].yearsToFIRE);
  });
});

describe('calculateSuperBridge', () => {
  it('generates yearly rows from currentAge to 90', () => {
    const result = calculateSuperBridge({
      currentAge: 35,
      earlyRetirementAge: 50,
      preservationAge: 60,
      nonSuperBalance: 200000,
      superBalance: 200000,
      annualSavingsNonSuper: 40000,
      annualSuperContribs: 30000,
      annualExpenses: 80000,
      nonSuperReturn: 7,
      superReturn: 7,
    });
    expect(result.yearly.length).toBe(90 - 35 + 1);
  });

  it('non-super runs out before 60 when balance is very low', () => {
    const result = calculateSuperBridge({
      currentAge: 50,
      earlyRetirementAge: 50,
      preservationAge: 60,
      nonSuperBalance: 100000,  // only 100k to last 10 years at 80k/pa
      superBalance: 500000,
      annualSavingsNonSuper: 0,
      annualSuperContribs: 0,
      annualExpenses: 80000,
      nonSuperReturn: 7,
      superReturn: 7,
    });
    expect(result.nonSuperSufficientToBridge).toBe(false);
  });

  it('concessional split applies 15% tax to the concessional share of contributions', () => {
    // 50% concessional of $30k -> net 30k * (1 - 0.15 * 0.5) = 27,750
    const withSplit = calculateSuperBridge({
      currentAge: 35,
      earlyRetirementAge: 50,
      preservationAge: 60,
      nonSuperBalance: 200000,
      superBalance: 200000,
      annualSavingsNonSuper: 0,
      annualSuperContribs: 30000,
      annualExpenses: 0,
      nonSuperReturn: 0,
      superReturn: 0,
      concessionalShareOfContribs: 0.5,
    });
    const withoutSplit = calculateSuperBridge({
      currentAge: 35,
      earlyRetirementAge: 50,
      preservationAge: 60,
      nonSuperBalance: 200000,
      superBalance: 200000,
      annualSavingsNonSuper: 0,
      annualSuperContribs: 30000,
      annualExpenses: 0,
      nonSuperReturn: 0,
      superReturn: 0,
    });
    const withYear1 = withSplit.yearly[0].superBalance;
    const withoutYear1 = withoutSplit.yearly[0].superBalance;
    expect(withYear1).toBe(withoutYear1 - Math.round(30000 * 0.15 * 0.5));
  });
});

describe('simulateSequenceRisk', () => {
  const scenarios = [
    { label: 'Steady', returns: [7, 7, 7, 7, 7] },
    { label: 'Early Crash', returns: [-30, 7, 7, 7, 7] },
    { label: 'Late Crash', returns: [7, 7, 7, 7, -30] },
  ];

  it('returns one result per scenario with yearly rows', () => {
    const results = simulateSequenceRisk(500000, 2000, 5, scenarios);
    expect(results).toHaveLength(3);
    expect(results[0].yearly).toHaveLength(5);
    expect(results[0].yearly[0].year).toBe(1);
  });

  it('steady sequence: known-answer balance after year 1', () => {
    const results = simulateSequenceRisk(100000, 1000, 3, [{ label: 'S', returns: [10] }]);
    // 100000 * 1.10 - 12000 = 98000
    expect(results[0].yearly[0].balance).toBe(98000);
  });

  it('an early crash hurts the ending balance more than a late crash (sequence risk)', () => {
    const results = simulateSequenceRisk(500000, 2000, 5, scenarios);
    const early = results.find(r => r.label === 'Early Crash')!;
    const late = results.find(r => r.label === 'Late Crash')!;
    expect(early.endingBalance).toBeLessThan(late.endingBalance);
  });

  it('clamps balances at zero and tracks min balance', () => {
    const results = simulateSequenceRisk(50000, 10000, 10, [{ label: 'Big Draw', returns: [-50, -50] }]);
    expect(results[0].minBalance).toBe(0);
    expect(results[0].endingBalance).toBe(0);
  });

  it('pads short return sequences with the last return', () => {
    const results = simulateSequenceRisk(100000, 0, 3, [{ label: 'Pad', returns: [10] }]);
    // 100000 * 1.1^3
    expect(results[0].endingBalance).toBe(Math.round(100000 * 1.1 ** 3));
  });

  it('handles zero years gracefully', () => {
    const results = simulateSequenceRisk(100000, 1000, 0, [{ label: 'S', returns: [7] }]);
    expect(results[0].yearly).toHaveLength(0);
    expect(results[0].endingBalance).toBe(100000);
  });
});

describe('fanFromScenarioYearlies', () => {
  it('computes percentile bands across scenarios per year', () => {
    const yearlyA = [{ year: 1, balance: 100 }, { year: 2, balance: 200 }];
    const yearlyB = [{ year: 1, balance: 300 }, { year: 2, balance: 400 }];
    const fan = fanFromScenarioYearlies([{ label: 'A', yearly: yearlyA }, { label: 'B', yearly: yearlyB }]);
    expect(fan).toHaveLength(2);
    expect(fan[0].p50).toBe(200);
    expect(fan[0].p10).toBe(120);
    expect(fan[0].p90).toBe(280);
    expect(fan[1].p75).toBe(350);
  });

  it('returns empty array for no scenarios', () => {
    expect(fanFromScenarioYearlies([])).toEqual([]);
  });
});

describe('inflationAdjustedSeries', () => {
  it('nominal grows, real balances are deflated by cumulative inflation', () => {
    const result = inflationAdjustedSeries(100000, 0, 10, 5, 3);
    expect(result.nominal).toHaveLength(3);
    expect(result.real).toHaveLength(3);
    expect(result.nominal[0]).toBe(110000);
    // 110000 / 1.05 = 104761.9...
    expect(result.real[0]).toBe(Math.round(110000 / 1.05));
  });

  it('real value stays below nominal when inflation > 0', () => {
    const result = inflationAdjustedSeries(500000, 30000, 8, 3, 20);
    for (let i = 0; i < result.nominal.length; i++) {
      expect(result.real[i]).toBeLessThanOrEqual(result.nominal[i]);
    }
  });

  it('zero inflation means real equals nominal', () => {
    const result = inflationAdjustedSeries(500000, 30000, 8, 0, 5);
    expect(result.real).toEqual(result.nominal);
  });

  it('returns empty arrays for zero years', () => {
    const result = inflationAdjustedSeries(100000, 0, 7, 3, 0);
    expect(result.nominal).toEqual([]);
    expect(result.real).toEqual([]);
  });
});

describe('projectCoastToRetirement', () => {
  it('projects balances with no contributions', () => {
    const proj = projectCoastToRetirement(200000, 10, 3);
    expect(proj).toHaveLength(3);
    expect(proj[0]).toBe(220000);
  });

  it('zero years returns empty array', () => {
    expect(projectCoastToRetirement(200000, 7, 0)).toEqual([]);
  });
});

describe('netSuperContribution', () => {
  it('100% concessional -> 15% tax applied', () => {
    expect(netSuperContribution(30000, 1)).toBe(25500);
  });

  it('100% non-concessional -> no tax', () => {
    expect(netSuperContribution(30000, 0)).toBe(30000);
  });

  it('50% split -> half the tax', () => {
    expect(netSuperContribution(30000, 0.5)).toBeCloseTo(27750, 5);
  });

  it('clamps shares outside 0–1', () => {
    expect(netSuperContribution(30000, 2)).toBe(25500);
    expect(netSuperContribution(30000, -1)).toBe(30000);
  });
});

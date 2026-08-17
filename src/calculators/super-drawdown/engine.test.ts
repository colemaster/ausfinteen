import { describe, it, expect } from 'vitest';
import {
  calculateAgePension,
  simulateRetirementPlan,
  transferBalanceCapCheck,
  generateReturnSequences,
  simulateDrawdownSequence,
  monteCarloDrawdownFan,
} from './engine';

describe('Superannuation Drawdown & Age Pension Engine', () => {
  it('correctly calculates zero pension before age 67', () => {
    const res = calculateAgePension({
      age: 65,
      relationshipStatus: 'single',
      isHomeowner: true,
      financialAssets: 200000,
      otherAssessableAssets: 20000,
      otherFortnightlyIncome: 0,
    });
    expect(res.eligibleForAgePension).toBe(false);
    expect(res.annualAgePension).toBe(0);
  });

  it('calculates full Age Pension for single homeowner with modest assets', () => {
    const res = calculateAgePension({
      age: 68,
      relationshipStatus: 'single',
      isHomeowner: true,
      financialAssets: 150000,
      otherAssessableAssets: 20000,
      otherFortnightlyIncome: 0,
    });
    expect(res.eligibleForAgePension).toBe(true);
    expect(res.fortnightlyAgePension).toBeCloseTo(1200.90, 1);
  });

  it('applies asset test taper rate when assets exceed lower threshold', () => {
    const res = calculateAgePension({
      age: 70,
      relationshipStatus: 'single',
      isHomeowner: true,
      financialAssets: 450000, // $136k over $314k threshold -> reduction of 136 * $3 = $408/fn
      otherAssessableAssets: 0,
      otherFortnightlyIncome: 0,
    });
    expect(res.eligibleForAgePension).toBe(true);
    expect(res.fortnightlyAgePension).toBeLessThan(1200.90);
    expect(res.fortnightlyAgePension).toBeGreaterThan(700);
  });

  it('simulates 30-year retirement drawdown schedule with sustainability checks', () => {
    const sim = simulateRetirementPlan({
      currentAge: 60,
      retirementAge: 65,
      superBalanceAtRetirement: 800000,
      desiredAnnualIncome: 65000,
      expectedAnnualReturn: 0.06,
      inflationRate: 0.025,
      relationshipStatus: 'single',
      isHomeowner: true,
      otherAssessableAssets: 25000,
      projectionYears: 30,
    });

    expect(sim.schedule.length).toBe(30);
    expect(sim.totalDrawdownPaid).toBeGreaterThan(500000);
    expect(sim.lifetimeAgePensionReceived).toBeGreaterThan(0);
  });

  it('lump sum withdrawal reduces the starting pension balance', () => {
    const sim = simulateRetirementPlan({
      currentAge: 60,
      retirementAge: 65,
      superBalanceAtRetirement: 800000,
      desiredAnnualIncome: 65000,
      expectedAnnualReturn: 0.06,
      inflationRate: 0.025,
      relationshipStatus: 'single',
      isHomeowner: true,
      otherAssessableAssets: 25000,
      projectionYears: 10,
      lumpSumWithdrawal: 200000,
    });
    expect(sim.lumpSumWithdrawn).toBe(200000);
    expect(sim.schedule[0].startingBalance).toBe(600000);
    expect(sim.maxProjectedBalance).toBeLessThanOrEqual(600000 + sim.schedule[0].investmentEarnings);
  });

  it('defaults to zero lump sum when omitted (backwards compatible)', () => {
    const sim = simulateRetirementPlan({
      currentAge: 60,
      retirementAge: 65,
      superBalanceAtRetirement: 800000,
      desiredAnnualIncome: 65000,
      expectedAnnualReturn: 0.06,
      inflationRate: 0.025,
      relationshipStatus: 'single',
      isHomeowner: true,
      otherAssessableAssets: 25000,
      projectionYears: 5,
    });
    expect(sim.lumpSumWithdrawn).toBe(0);
    expect(sim.schedule[0].startingBalance).toBe(800000);
  });
});

describe('transferBalanceCapCheck', () => {
  it('flags balances above the $1.9M cap', () => {
    const check = transferBalanceCapCheck(2500000, 65);
    expect(check.overCap).toBe(true);
    expect(check.excess).toBe(600000);
    expect(check.cap).toBe(1900000);
  });

  it('returns no excess at or below the cap', () => {
    expect(transferBalanceCapCheck(1900000, 65).overCap).toBe(false);
    expect(transferBalanceCapCheck(1500000, 65).excess).toBe(0);
  });

  it('handles zero balance', () => {
    const check = transferBalanceCapCheck(0, 65);
    expect(check.overCap).toBe(false);
    expect(check.excess).toBe(0);
  });
});

describe('generateReturnSequences', () => {
  it('is deterministic for the same seed', () => {
    const a = generateReturnSequences(10, 5, 0.07, 0.12, 42);
    const b = generateReturnSequences(10, 5, 0.07, 0.12, 42);
    expect(a).toEqual(b);
  });

  it('produces the requested shape', () => {
    const seq = generateReturnSequences(20, 30, 0.06, 0.12, 1);
    expect(seq).toHaveLength(30);
    expect(seq[0]).toHaveLength(20);
  });

  it('produces sequences whose mean approximates the requested mean', () => {
    const seq = generateReturnSequences(1000, 40, 0.07, 0.12, 7);
    const flat = seq.flat();
    const mean = flat.reduce((s, v) => s + v, 0) / flat.length;
    expect(Math.abs(mean - 0.07)).toBeLessThan(0.01);
  });

  it('different seeds produce different sequences', () => {
    const a = generateReturnSequences(5, 1, 0.07, 0.12, 1);
    const b = generateReturnSequences(5, 1, 0.07, 0.12, 2);
    expect(a[0]).not.toEqual(b[0]);
  });
});

describe('simulateDrawdownSequence', () => {
  const params = {
    currentAge: 60,
    retirementAge: 65,
    superBalanceAtRetirement: 1000000,
    desiredAnnualIncome: 60000,
    expectedAnnualReturn: 0.06,
    inflationRate: 0.025,
    relationshipStatus: 'single' as const,
    isHomeowner: true,
    otherAssessableAssets: 0,
    projectionYears: 10,
  };

  it('returns one balance per year', () => {
    const balances = simulateDrawdownSequence(params, Array(10).fill(0.06));
    expect(balances).toHaveLength(10);
  });

  it('constant positive returns keep the balance positive over 10 years', () => {
    const balances = simulateDrawdownSequence(params, Array(10).fill(0.08));
    expect(balances[9]).toBeGreaterThan(0);
  });

  it('a bad sequence can exhaust the balance (sequence risk)', () => {
    const badReturns = [-0.30, -0.25, -0.20, ...Array(7).fill(0.05)];
    const balances = simulateDrawdownSequence(params, badReturns);
    expect(balances[9]).toBeLessThan(500000);
  });

  it('floor balances at zero after exhaustion', () => {
    const balances = simulateDrawdownSequence(params, Array(10).fill(-0.50));
    expect(balances[0]).toBeGreaterThanOrEqual(0);
    expect(balances[9]).toBe(0);
  });

  it('respects the lump sum withdrawal', () => {
    const balances = simulateDrawdownSequence({ ...params, lumpSumWithdrawal: 400000 }, Array(5).fill(0.06));
    const noLump = simulateDrawdownSequence(params, Array(5).fill(0.06));
    expect(balances[0]).toBeLessThan(noLump[0]);
  });
});

describe('monteCarloDrawdownFan', () => {
  const params = {
    currentAge: 60,
    retirementAge: 65,
    superBalanceAtRetirement: 1000000,
    desiredAnnualIncome: 60000,
    expectedAnnualReturn: 0.06,
    inflationRate: 0.025,
    relationshipStatus: 'single' as const,
    isHomeowner: true,
    otherAssessableAssets: 0,
    projectionYears: 10,
  };

  it('builds percentile bands ordered p10 ≤ p50 ≤ p90 each year', () => {
    const sequences = generateReturnSequences(10, 40, 0.06, 0.12, 99);
    const fan = monteCarloDrawdownFan(params, sequences);
    expect(fan).toHaveLength(10);
    for (const point of fan) {
      expect(point.p10).toBeLessThanOrEqual(point.p50);
      expect(point.p50).toBeLessThanOrEqual(point.p90);
    }
  });

  it('returns empty for no sequences', () => {
    expect(monteCarloDrawdownFan(params, [])).toEqual([]);
  });

  it('identical sequences collapse to a single line', () => {
    const flat = Array(10).fill(0.06);
    const fan = monteCarloDrawdownFan(params, [flat, flat, flat]);
    expect(fan[0].p10).toBe(fan[0].p90);
  });
});

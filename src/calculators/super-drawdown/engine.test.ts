import { describe, it, expect } from 'vitest';
import { calculateAgePension, simulateRetirementPlan } from './engine';

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
});

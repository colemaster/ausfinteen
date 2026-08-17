import { describe, it, expect } from 'vitest';
import {
  yearsToFIREFromNW,
  yearsToFIREBySavingsRate,
  projectBySavingsRate,
  projectPayStrategies,
  rateToRetirementYears,
  takeHomeBreakdown,
} from './engine';

describe('yearsToFIREFromNW', () => {
  it('returns 0 when already at FIRE number', () => {
    expect(yearsToFIREFromNW(2000000, 50000, 2000000, 7)).toBe(0);
  });

  it('returns 0 when net worth exceeds FIRE number', () => {
    expect(yearsToFIREFromNW(3000000, 50000, 2000000, 7)).toBe(0);
  });

  it('higher savings rate reduces years to FIRE', () => {
    const lowSavings = yearsToFIREFromNW(0, 20000, 500000, 7);
    const highSavings = yearsToFIREFromNW(0, 80000, 500000, 7);
    expect(highSavings).toBeLessThan(lowSavings);
  });

  it('higher return rate reduces years to FIRE', () => {
    const lowReturn = yearsToFIREFromNW(0, 50000, 1000000, 4);
    const highReturn = yearsToFIREFromNW(0, 50000, 1000000, 10);
    expect(highReturn).toBeLessThan(lowReturn);
  });

  it('caps at 100 for zero savings and zero return', () => {
    expect(yearsToFIREFromNW(0, 0, 1000000, 0)).toBe(100);
  });

  it('starting net worth accelerates timeline', () => {
    const fromZero = yearsToFIREFromNW(0, 50000, 1000000, 7);
    const fromHalf = yearsToFIREFromNW(500000, 50000, 1000000, 7);
    expect(fromHalf).toBeLessThan(fromZero);
  });
});

describe('yearsToFIREBySavingsRate', () => {
  it('returns 17 rows (10% to 90% in 5% steps)', () => {
    const result = yearsToFIREBySavingsRate(150000, 200000, 7, 30);
    expect(result.rows).toHaveLength(17);
  });

  it('higher savings rate rows always have fewer years', () => {
    const result = yearsToFIREBySavingsRate(150000, 0, 7, 30);
    const { rows } = result;
    // Each successive step should have equal or fewer years
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].years).toBeLessThanOrEqual(rows[i - 1].years);
    }
  });

  it('currentRow matches the nearest 5%-step to currentSavingsRate', () => {
    const result = yearsToFIREBySavingsRate(150000, 200000, 7, 30);
    expect(Math.round(result.currentRow.rate * 100)).toBe(30);
  });

  it('currentRow clamps to 10% minimum', () => {
    const result = yearsToFIREBySavingsRate(150000, 200000, 7, 5);
    expect(Math.round(result.currentRow.rate * 100)).toBe(10);
  });

  it('50% savings rate on $150k should reach FIRE in under 25 years from $0', () => {
    const result = yearsToFIREBySavingsRate(150000, 0, 7, 50);
    const row50 = result.rows.find(r => Math.round(r.rate * 100) === 50)!;
    expect(row50.years).toBeLessThan(25);
  });

  it('FIRE number is correctly derived as expenses / 0.04', () => {
    const result = yearsToFIREBySavingsRate(100000, 0, 7, 40);
    // At 40% savings rate: expenses = 100000 * 0.60 = 60000; FIRE = 60000/0.04 = 1,500,000
    const row40 = result.rows.find(r => Math.round(r.rate * 100) === 40)!;
    expect(row40.fireNumber).toBeCloseTo(1500000, -2);
    expect(row40.annualExpenses).toBeCloseTo(60000, 0);
  });
});

describe('projectBySavingsRate', () => {
  it('generates correct number of years', () => {
    const proj = projectBySavingsRate(100000, 0, 30, 7, 20);
    expect(proj).toHaveLength(20);
  });

  it('balance grows each year with positive return and savings', () => {
    const proj = projectBySavingsRate(100000, 0, 30, 7, 10);
    for (let i = 1; i < proj.length; i++) {
      expect(proj[i]).toBeGreaterThan(proj[i - 1]);
    }
  });

  it('50% savings rate grows faster than 10%', () => {
    const proj10 = projectBySavingsRate(100000, 0, 10, 7, 20);
    const proj50 = projectBySavingsRate(100000, 0, 50, 7, 20);
    expect(proj50[19]).toBeGreaterThan(proj10[19]);
  });
});

describe('projectPayStrategies', () => {
  it('pay-first always beats pay-at-end for the same savings rate', () => {
    const result = projectPayStrategies(100000, 0, 30, 7, 20);
    expect(result.payAtEnd).toHaveLength(20);
    expect(result.payFirst).toHaveLength(20);
    for (let i = 0; i < 20; i++) {
      expect(result.payFirst[i]).toBeGreaterThan(result.payAtEnd[i]);
    }
  });

  it('known-answer: year 1 balances differ by one year of growth', () => {
    const result = projectPayStrategies(100000, 0, 30, 10, 1);
    // pay-at-end: 30000; pay-first: 30000 * 1.10 = 33000
    expect(result.payAtEnd[0]).toBe(30000);
    expect(result.payFirst[0]).toBe(33000);
  });

  it('zero savings rate leaves both strategies equal', () => {
    const result = projectPayStrategies(100000, 5000, 0, 7, 5);
    expect(result.payFirst).toEqual(result.payAtEnd);
  });
});

describe('rateToRetirementYears', () => {
  it('returns a row per supplied rate', () => {
    const rows = rateToRetirementYears(100000, 0, 7, [0.2, 0.5, 0.8]);
    expect(rows).toHaveLength(3);
  });

  it('higher rate -> higher savings, lower expenses, fewer years', () => {
    const rows = rateToRetirementYears(100000, 0, 7, [0.2, 0.8]);
    expect(rows[1].annualSavings).toBeGreaterThan(rows[0].annualSavings);
    expect(rows[1].annualExpenses).toBeLessThan(rows[0].annualExpenses);
    expect(rows[1].years).toBeLessThanOrEqual(rows[0].years);
  });

  it('FIRE number = expenses / 0.04 at 50% rate on $100k', () => {
    const rows = rateToRetirementYears(100000, 0, 7, [0.5]);
    expect(rows[0].annualExpenses).toBe(50000);
    expect(rows[0].fireNumber).toBe(1250000);
  });

  it('clamps rates to a sane 0–0.99 range', () => {
    const rows = rateToRetirementYears(100000, 0, 7, [2, -1]);
    expect(rows[0].rate).toBe(0.99);
    expect(rows[1].rate).toBe(0);
  });
});

describe('takeHomeBreakdown', () => {
  it('no HELP debt -> zero repayment', () => {
    const b = takeHomeBreakdown(100000, 0.32, false);
    expect(b.helpRepayment).toBe(0);
    expect(b.superGuarantee).toBeCloseTo(12000, 0);
    expect(b.taxEstimate).toBe(32000);
    expect(b.netTakeHome).toBe(68000);
  });

  it('with HELP debt -> ATO 2026-27 repayment applied', () => {
    const b = takeHomeBreakdown(80000, 0.32, true);
    // 2026-27: $75,001–$80,000 tier = 2.0% -> 80000 * 0.02 = 1600
    expect(b.helpRepayment).toBe(1600);
    expect(b.netTakeHome).toBe(80000 - 25600 - 1600);
  });

  it('takeHomeRate is net/gross', () => {
    const b = takeHomeBreakdown(50000, 0.16, false);
    expect(b.takeHomeRate).toBeCloseTo(0.84, 5);
  });

  it('zero income is safe', () => {
    const b = takeHomeBreakdown(0, 0.32, true);
    expect(b.netTakeHome).toBe(0);
    expect(b.takeHomeRate).toBe(0);
  });
});

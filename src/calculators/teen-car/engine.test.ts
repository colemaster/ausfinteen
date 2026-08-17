import { describe, it, expect } from 'vitest';
import { evVsPetrolRunningCost, firstCarTotalCostOfOwnership } from './engine';

describe('evVsPetrolRunningCost', () => {
  it('computes the annual comparison with defaults (15000km, 10% fast charging)', () => {
    const res = evVsPetrolRunningCost({});
    // Petrol: 150 * 6.5 * 1.97 = 1920.75
    expect(res.petrolAnnual).toBeCloseTo(1920.75, 2);
    // EV blended: (0.32*90 + 0.68*10)/100 = 0.356; 150 * 15.5 * 0.356 = 827.70
    expect(res.evAnnual).toBeCloseTo(827.7, 2);
    expect(res.savingsAnnual).toBeCloseTo(1093.05, 2);
    expect(res.savingsPct).toBeCloseTo(56.9, 0);
  });

  it('all-100% public fast charging almost erases the savings', () => {
    const res = evVsPetrolRunningCost({ publicFastSharePct: 100 });
    // 150 * 15.5 * 0.68 = 1581
    expect(res.evAnnual).toBeCloseTo(1581, 2);
    expect(res.publicSharePct).toBe(100);
    expect(res.homeSharePct).toBe(0);
    expect(res.savingsAnnual).toBeCloseTo(339.75, 2);
  });

  it('100% home charging gives the cheapest EV running cost', () => {
    const res = evVsPetrolRunningCost({ publicFastSharePct: 0 });
    // 150 * 15.5 * 0.32 = 744
    expect(res.evAnnual).toBeCloseTo(744, 2);
    expect(res.evPer100km).toBeCloseTo(4.96, 2);
  });

  it('clamps the public share to 0-100', () => {
    expect(evVsPetrolRunningCost({ publicFastSharePct: -20 }).publicSharePct).toBe(0);
    expect(evVsPetrolRunningCost({ publicFastSharePct: 140 }).publicSharePct).toBe(100);
  });

  it('handles zero km driven', () => {
    const res = evVsPetrolRunningCost({ kmPerYear: 0 });
    expect(res.petrolAnnual).toBe(0);
    expect(res.evAnnual).toBe(0);
    expect(res.savingsPct).toBe(0);
  });
});

describe('firstCarTotalCostOfOwnership', () => {
  it('combines purchase price and 5 years of running costs', () => {
    const res = firstCarTotalCostOfOwnership(8000, 3200, 5);
    expect(res.tcoOverYears).toBe(24000); // 8000 + 3200*5
    expect(res.costPerWeek).toBeCloseTo(92.31, 1);
    expect(res.costPerMonth).toBeCloseTo(400, 1);
    expect(res.runningCostsShare).toBeCloseTo(0.6667, 3);
  });

  it('defaults to 5 years and guards zero/negative years', () => {
    const res = firstCarTotalCostOfOwnership(8000, 3200);
    expect(res.years).toBe(5);
    expect(firstCarTotalCostOfOwnership(8000, 3200, 0).years).toBe(1);
    expect(firstCarTotalCostOfOwnership(8000, 3200, -2).years).toBe(1);
  });

  it('handles zero purchase price and zero running costs', () => {
    expect(firstCarTotalCostOfOwnership(0, 3200, 5).tcoOverYears).toBe(16000);
    expect(firstCarTotalCostOfOwnership(8000, 0, 5).tcoOverYears).toBe(8000);
    const zero = firstCarTotalCostOfOwnership(0, 0, 5);
    expect(zero.tcoOverYears).toBe(0);
    expect(zero.runningCostsShare).toBe(0);
  });
});
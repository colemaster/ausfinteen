import { describe, it, expect } from 'vitest';
import { evVsPetrolRunningCost, firstCarTotalCostOfOwnership } from './engine';

describe('evVsPetrolRunningCost (2026-27 parameters)', () => {
  it('computes the annual comparison with 2026-27 defaults (15,000km, 7.5L/100km @ $2.38/L vs 15kWh/100km @ 28c/kWh home, 10% fast)', () => {
    const res = evVsPetrolRunningCost({});
    // Petrol: 150 * 7.5 * 2.38 = 2677.50
    expect(res.petrolAnnual).toBeCloseTo(2677.5, 2);
    expect(res.petrolPer100km).toBeCloseTo(17.85, 2);
    expect(res.petrolPerKm).toBeCloseTo(0.1785, 4);

    // EV blended: (0.28*90 + 0.65*10)/100 = 0.317; 150 * 15.0 * 0.317 = 713.25
    expect(res.evAnnual).toBeCloseTo(713.25, 2);
    expect(res.evPer100km).toBeCloseTo(4.755, 3);
    expect(res.evPerKm).toBeCloseTo(0.04755, 5);

    // Savings
    expect(res.savingsAnnual).toBeCloseTo(1964.25, 2);
    expect(res.savingsPct).toBeCloseTo(73.36, 1);
    expect(res.savingsWeekly).toBeCloseTo(37.77, 1);
    expect(res.savings5Year).toBeCloseTo(9821.25, 2);
  });

  it('all-100% public fast charging significantly reduces fuel savings', () => {
    const res = evVsPetrolRunningCost({ publicFastSharePct: 100 });
    // 150 * 15.0 * 0.65 = 1462.50
    expect(res.evAnnual).toBeCloseTo(1462.5, 2);
    expect(res.publicSharePct).toBe(100);
    expect(res.homeSharePct).toBe(0);
    expect(res.savingsAnnual).toBeCloseTo(1215.0, 2);
  });

  it('100% home charging gives the cheapest EV running cost', () => {
    const res = evVsPetrolRunningCost({ publicFastSharePct: 0 });
    // 150 * 15.0 * 0.28 = 630.00
    expect(res.evAnnual).toBeCloseTo(630, 2);
    expect(res.evPer100km).toBeCloseTo(4.2, 2);
    expect(res.evPerKm).toBeCloseTo(0.042, 3);
    expect(res.savingsAnnual).toBeCloseTo(2047.5, 2);
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
    expect(res.savingsWeekly).toBe(0);
    expect(res.savings5Year).toBe(0);
  });
});

describe('firstCarTotalCostOfOwnership', () => {
  it('combines purchase price, running costs and depreciation over 5 years', () => {
    const res = firstCarTotalCostOfOwnership(8000, 3200, 5);
    expect(res.tcoOverYears).toBe(24000); // 8000 + 3200*5
    expect(res.costPerWeek).toBeCloseTo(92.31, 1);
    expect(res.costPerMonth).toBeCloseTo(400, 1);
    expect(res.runningCostsShare).toBeCloseTo(0.6667, 3);

    // Depreciation checks
    expect(res.depreciationRate).toBe(0.15);
    // 8000 * (1 - 0.15)^5 = 8000 * 0.4437 = 3550
    expect(res.estimatedResaleValue).toBe(3550);
    expect(res.totalDepreciation).toBe(4450); // 8000 - 3550
    expect(res.depreciationAnnual).toBe(890); // 4450 / 5
    expect(res.totalRunningCosts).toBe(16000); // 3200 * 5
    expect(res.netEconomicCost).toBe(20450); // 4450 + 16000
    expect(res.netCostPerWeek).toBeCloseTo(78.65, 1);
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
    expect(zero.totalDepreciation).toBe(0);
    expect(zero.estimatedResaleValue).toBe(0);
  });

  it('enforces residual scrap floor for heavily depreciated older cars', () => {
    // A $2,000 beater over 8 years would theoretically drop below $500, but floor is $1,000
    const res = firstCarTotalCostOfOwnership(2000, 3000, 8);
    expect(res.estimatedResaleValue).toBe(1000);
    expect(res.totalDepreciation).toBe(1000);
  });
});

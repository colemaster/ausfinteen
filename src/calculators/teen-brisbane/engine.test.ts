import { describe, it, expect } from 'vitest';
import { fiftyCentFareSavings } from './engine';

describe('fiftyCentFareSavings', () => {
  it('computes weekly/monthly/yearly savings for a student commute', () => {
    // 10 trips/wk (to & from school/uni, 5 days) at old $4.15 peak fare
    const res = fiftyCentFareSavings({ tripsPerWeek: 10, oldAverageFare: 4.15, newFare: 0.5 });
    expect(res.oldWeeklyCost).toBeCloseTo(41.5, 5);
    expect(res.newWeeklyCost).toBeCloseTo(5, 5);
    expect(res.savedWeekly).toBeCloseTo(36.5, 5);
    expect(res.savedMonthly).toBeCloseTo(158.17, 1);
    expect(res.savedYearly).toBeCloseTo(1898, 0);
    expect(res.savingsPct).toBeCloseTo(87.95, 1);
  });

  it('defaults to the 2026 permanent $0.50 fare', () => {
    const res = fiftyCentFareSavings({ tripsPerWeek: 8, oldAverageFare: 3.2, newFare: 0.5 });
    expect(res.newFare).toBe(0.5);
    expect(res.savedYearly).toBeCloseTo(8 * 2.7 * 52, 2);
  });

  it('handles zero trips and zero fares', () => {
    const zeroTrips = fiftyCentFareSavings({ tripsPerWeek: 0, oldAverageFare: 4, newFare: 0.5 });
    expect(zeroTrips.savedWeekly).toBe(0);
    expect(zeroTrips.savingsPct).toBe(0);

    const zeroFare = fiftyCentFareSavings({ tripsPerWeek: 4, oldAverageFare: 4, newFare: 0 });
    expect(zeroFare.savedWeekly).toBeCloseTo(16, 5);
  });

  it('rounds and clamps trips per week', () => {
    expect(fiftyCentFareSavings({ tripsPerWeek: 4.6, oldAverageFare: 4, newFare: 0.5 }).tripsPerWeek).toBe(5);
    expect(fiftyCentFareSavings({ tripsPerWeek: -3, oldAverageFare: 4, newFare: 0.5 }).tripsPerWeek).toBe(0);
  });
});
import { describe, it, expect } from 'vitest';
import { TEEN_SAVINGS_ACCOUNTS, JUNIOR_AWARD_RATES } from '@/data/teen-finance-data';

describe('Landing Page Cyber-Finance Hero Visuals & Widgets', () => {
  describe('CompoundRocket Math & Projections', () => {
    it('proves that starting at 15 beats double contributions starting at 25', () => {
      const WEEKS_PER_YEAR = 52;
      const MONTHS_PER_YEAR = 12;
      const START_AGE = 15;
      const HISA_END_AGE = 18;
      const LATE_START_AGE = 25;
      const END_AGE = 60;
      const HISA_ANNUAL = 0.058;
      const ETF_ANNUAL = 0.08;

      const earlyWeekly = 25;
      const lateWeekly = 50;

      const monthlyEarly = (earlyWeekly * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
      const monthlyLate = (lateWeekly * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;

      const totalMonths = (END_AGE - START_AGE) * MONTHS_PER_YEAR;
      const hisaMonths = (HISA_END_AGE - START_AGE) * MONTHS_PER_YEAR;
      const lateOffsetMonths = (LATE_START_AGE - START_AGE) * MONTHS_PER_YEAR;

      const rHisa = HISA_ANNUAL / MONTHS_PER_YEAR;
      const rEtf = ETF_ANNUAL / MONTHS_PER_YEAR;

      let early = 0;
      let late = 0;

      for (let m = 1; m <= totalMonths; m += 1) {
        const r = m <= hisaMonths ? rHisa : rEtf;
        early = early * (1 + r) + monthlyEarly;
        if (m > lateOffsetMonths) {
          late = late * (1 + rEtf) + monthlyLate;
        }
      }

      // Early starter total out of pocket
      const earlyDeposits = earlyWeekly * WEEKS_PER_YEAR * (END_AGE - START_AGE);
      // Late starter total out of pocket
      const lateDeposits = lateWeekly * WEEKS_PER_YEAR * (END_AGE - LATE_START_AGE);

      expect(early).toBeGreaterThan(late);
      expect(earlyDeposits).toBeLessThan(lateDeposits);
      expect(lateDeposits - earlyDeposits).toBe(32500); // Deposited $32,500 less
      expect(early - late).toBeGreaterThan(50000); // Wins by > $50k
    });

    it('identifies ages when milestone targets ($10k, $50k, $100k) are reached', () => {
      const WEEKS_PER_YEAR = 52;
      const MONTHS_PER_YEAR = 12;
      const START_AGE = 15;
      const HISA_END_AGE = 18;
      const END_AGE = 60;
      const HISA_ANNUAL = 0.058;
      const ETF_ANNUAL = 0.08;

      const monthlyEarly = (25 * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
      const totalMonths = (END_AGE - START_AGE) * MONTHS_PER_YEAR;
      const hisaMonths = (HISA_END_AGE - START_AGE) * MONTHS_PER_YEAR;

      const rHisa = HISA_ANNUAL / MONTHS_PER_YEAR;
      const rEtf = ETF_ANNUAL / MONTHS_PER_YEAR;

      let balance = 0;
      let age10k: number | null = null;
      let age50k: number | null = null;
      let age100k: number | null = null;

      for (let m = 1; m <= totalMonths; m += 1) {
        const r = m <= hisaMonths ? rHisa : rEtf;
        balance = balance * (1 + r) + monthlyEarly;
        const currentAge = START_AGE + m / MONTHS_PER_YEAR;

        if (balance >= 10000 && age10k === null) age10k = currentAge;
        if (balance >= 50000 && age50k === null) age50k = currentAge;
        if (balance >= 100000 && age100k === null) age100k = currentAge;
      }

      expect(age10k).toBeDefined();
      expect(age10k!).toBeLessThan(23); // Reaches $10k before 23
      expect(age50k!).toBeLessThan(35); // Reaches $50k before 35
      expect(age100k!).toBeLessThan(42); // Reaches $100k before 42
    });
  });

  describe('HisaShowdown Calculations', () => {
    it('correctly ranks the top 5 youth HISA accounts with BOQ at the top', () => {
      const sorted = [...TEEN_SAVINGS_ACCOUNTS].sort((a, b) => b.maxRate - a.maxRate);
      const top5 = sorted.slice(0, 5);

      expect(top5.length).toBe(5);
      expect(top5[0].bank).toContain('BOQ');
      expect(top5[0].maxRate).toBe(5.80);
      expect(top5[0].baseRate).toBe(0.05);
    });

    it('computes annual surplus vs standard 0.01% transaction accounts', () => {
      const balance = 2000;
      const topRate = 5.80;
      const big4Rate = 0.0001; // 0.01%

      const topInterest = (balance * topRate) / 100;
      const deadInterest = balance * big4Rate;
      const annualSurplus = topInterest - deadInterest;

      expect(topInterest).toBe(116.0);
      expect(deadInterest).toBe(0.2);
      expect(annualSurplus).toBeCloseTo(115.8, 1);
    });
  });

  describe('PenaltyPayBooster Calculations', () => {
    it('calculates the Sunday penalty rate gap between General Retail and Fast Food Level 1', () => {
      const adultBase = JUNIOR_AWARD_RATES.retail.adultBaseRate; // $27.81
      expect(adultBase).toBe(27.81);

      const retailSundayRate = adultBase * 1.75;
      const fastFoodSundayRate = adultBase * 1.50;

      const sundayGap = retailSundayRate - fastFoodSundayRate;
      expect(sundayGap).toBeCloseTo(adultBase * 0.25, 2);
      expect(sundayGap).toBeCloseTo(6.9525, 2);
    });

    it('calculates junior 16yo retail shift and annual penalty surplus accurately', () => {
      const adultBase = 27.81;
      const juniorPct = 0.50;
      const juniorBase16 = Math.round(adultBase * juniorPct * 100) / 100; // $13.91

      const sundayRate16 = juniorBase16 * 1.75; // $24.3425/hr
      const weekdayRate16 = juniorBase16 * 1.25; // $17.3875/hr

      const hours = 6;
      const sundayShiftPay = sundayRate16 * hours;
      const weekdayShiftPay = weekdayRate16 * hours;

      const perShiftSurplus = sundayShiftPay - weekdayShiftPay;
      const annualSurplus50Wks = perShiftSurplus * 50;

      expect(sundayShiftPay).toBeCloseTo(146.055, 2);
      expect(weekdayShiftPay).toBeCloseTo(104.325, 2);
      expect(perShiftSurplus).toBeCloseTo(41.73, 2);
      expect(annualSurplus50Wks).toBeGreaterThan(2000); // Over $2,000 extra a year!
    });
  });
});

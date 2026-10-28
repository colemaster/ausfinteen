import { describe, it, expect } from 'vitest';
import {
  calculateStampDuty,
  calcQldHomeConcession,
} from './stamp-duty-tables';
import {
  getStateFHBOverview,
  estimateStampDuty,
} from '../calculators/house-affordability/stamp-duty';

describe('Stamp Duty Tables & Calculations — All 8 States and Territories (2026-27)', () => {
  describe('Zero and negative price handling', () => {
    it('returns zero duty and zero net cost for price <= 0', () => {
      const res0 = calculateStampDuty(0, 'VIC', false);
      expect(res0.dutyPayable).toBe(0);
      expect(res0.fullDuty).toBe(0);
      expect(res0.concessionApplied).toBe(false);

      const resNeg = calculateStampDuty(-50000, 'NSW', true);
      expect(resNeg.dutyPayable).toBe(0);
    });
  });

  describe('1. Queensland (QLD)', () => {
    it('established home FHB <= $700,000 receives full exemption ($0 duty)', () => {
      const res = calculateStampDuty(650000, 'QLD', true, false);
      expect(res.dutyPayable).toBe(0);
      expect(res.concessionApplied).toBe(true);
      expect(res.concessionSaving).toBe(res.fullDuty);
      expect(res.fullDuty).toBeGreaterThan(20000);
    });

    it('established home FHB between $700,000 and $800,000 receives sliding scale concession', () => {
      // At $750,000:
      // Home concession duty = $10,150 + (750k - 540k) * 0.045 = $19,600
      // Deduction = $8,675 (bracket $750k-$759.9k)
      // Duty payable = $19,600 - $8,675 = $10,925
      const res = calculateStampDuty(750000, 'QLD', true, false);
      expect(res.dutyPayable).toBe(10925);
      expect(res.concessionApplied).toBe(true);
      expect(res.fullDuty).toBe(26775); // $17,325 + ($750k - $540k) * 0.045
      expect(res.concessionSaving).toBe(26775 - 10925);
    });

    it('established home FHB >= $800,000 pays standard general duty', () => {
      const res = calculateStampDuty(850000, 'QLD', true, false);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
    });

    it('new build FHB gets uncapped exemption under Duties Act 2001 s 92A/92B ($0 duty with no price cap)', () => {
      const res800k = calculateStampDuty(800000, 'QLD', true, true);
      expect(res800k.dutyPayable).toBe(0);
      expect(res800k.concessionApplied).toBe(true);

      const res1_2M = calculateStampDuty(1200000, 'QLD', true, true);
      expect(res1_2M.dutyPayable).toBe(0);
      expect(res1_2M.concessionApplied).toBe(true);
    });

    it('provides $30,000 FHOG for new builds <= $750,000', () => {
      const res = calculateStampDuty(700000, 'QLD', true, true);
      expect(res.fhogAmount).toBe(30000);

      // Above $750k cap, no FHOG
      const resAbove = calculateStampDuty(800000, 'QLD', true, true);
      expect(resAbove.fhogAmount).toBe(0);
    });

    it('vacant land FHB receives full exemption <= $350k and concession <= $500k', () => {
      const resLandExempt = calculateStampDuty(320000, 'QLD', true, false, false, true);
      expect(resLandExempt.dutyPayable).toBe(0);
      expect(resLandExempt.concessionApplied).toBe(true);

      const resLandConcession = calculateStampDuty(425000, 'QLD', true, false, false, true);
      expect(resLandConcession.dutyPayable).toBeGreaterThan(0);
      expect(resLandConcession.dutyPayable).toBeLessThan(resLandConcession.fullDuty);
      expect(resLandConcession.concessionApplied).toBe(true);
    });

    it('applies 8% foreign purchaser surcharge (AFAD)', () => {
      const res = calculateStampDuty(1000000, 'QLD', false, false, true);
      expect(res.foreignSurcharge).toBe(80000);
    });

    it('calculates QLD home concession formula correctly', () => {
      expect(calcQldHomeConcession(300000)).toBe(3000);
      expect(calcQldHomeConcession(500000)).toBe(3500 + 150000 * 0.035);
      expect(calcQldHomeConcession(750000)).toBe(19600);
      expect(calcQldHomeConcession(1100000)).toBe(30850 + 100000 * 0.0575);
    });
  });

  describe('2. New South Wales (NSW)', () => {
    it('FHB receives full exemption up to $800,000 under FHBAS', () => {
      const res750k = calculateStampDuty(750000, 'NSW', true);
      expect(res750k.dutyPayable).toBe(0);
      expect(res750k.concessionApplied).toBe(true);

      const res800k = calculateStampDuty(800000, 'NSW', true);
      expect(res800k.dutyPayable).toBe(0);
      expect(res800k.concessionApplied).toBe(true);
    });

    it('FHB receives sliding scale concession between $800,000 and $1,000,000', () => {
      // NSW Duties Act 1997 s 78A:
      // Duty on $800,000 is $30,187
      // Duty on $900,000 is $34,687
      // Concession discount = ((1M - 900k) / 200k) * 30,187 = 0.5 * 30,187 = $15,093.5
      // Duty payable = $34,687 - $15,093.5 = $19,593.5 -> $19,594
      const res = calculateStampDuty(900000, 'NSW', true);
      expect(res.dutyPayable).toBe(19594);
      expect(res.concessionApplied).toBe(true);
      expect(res.concessionSaving).toBe(res.fullDuty - res.dutyPayable);
    });

    it('FHB >= $1,000,000 pays standard general duty', () => {
      const res = calculateStampDuty(1050000, 'NSW', true);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
    });

    it('provides $10,000 FHOG for new homes <= $600,000', () => {
      const res = calculateStampDuty(550000, 'NSW', true, true);
      expect(res.fhogAmount).toBe(10000);

      const resOver = calculateStampDuty(650000, 'NSW', true, true);
      expect(resOver.fhogAmount).toBe(0);
    });

    it('applies 9% foreign purchaser surcharge (highest nationally)', () => {
      const res = calculateStampDuty(1000000, 'NSW', false, false, true);
      expect(res.foreignSurcharge).toBe(90000);
    });

    it('correctly calculates 2026-27 indexed premium bracket over $3,870,000', () => {
      const res = calculateStampDuty(4000000, 'NSW', false);
      // $194,137 + (4,000,000 - 3,870,000) * 0.07 = 194,137 + 9,100 = 203,237
      expect(res.dutyPayable).toBe(203237);
    });
  });

  describe('3. Victoria (VIC)', () => {
    it('FHB receives full exemption up to $600,000', () => {
      const res = calculateStampDuty(580000, 'VIC', true);
      expect(res.dutyPayable).toBe(0);
      expect(res.concessionApplied).toBe(true);
    });

    it('FHB receives sliding scale concession between $600,000 and $750,000', () => {
      // At $675,000: fraction = 75k / 150k = 0.5
      const res = calculateStampDuty(675000, 'VIC', true);
      expect(res.dutyPayable).toBe(Math.round(res.fullDuty * 0.5));
      expect(res.concessionApplied).toBe(true);
    });

    it('FHB > $750,000 pays full standard duty', () => {
      const res = calculateStampDuty(800000, 'VIC', true);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
    });

    it('provides $10,000 FHOG for new homes <= $750,000', () => {
      const res = calculateStampDuty(700000, 'VIC', true, true);
      expect(res.fhogAmount).toBe(10000);
    });

    it('applies 8% foreign purchaser surcharge', () => {
      const res = calculateStampDuty(1000000, 'VIC', false, false, true);
      expect(res.foreignSurcharge).toBe(80000);
    });
  });

  describe('4. Western Australia (WA)', () => {
    it('FHB receives full exemption up to $450,000 under FHOR', () => {
      const res = calculateStampDuty(420000, 'WA', true);
      expect(res.dutyPayable).toBe(0);
      expect(res.concessionApplied).toBe(true);
    });

    it('FHB receives concessional rate ($15.01 per $100 over $450k) up to $600,000', () => {
      // At $500,000: (500,000 - 450,000) * 0.1501 = 50,000 * 0.1501 = $7,505
      const res = calculateStampDuty(500000, 'WA', true);
      expect(res.dutyPayable).toBe(7505);
      expect(res.concessionApplied).toBe(true);
      expect(res.concessionSaving).toBe(res.fullDuty - 7505);

      // At $600,000: (600,000 - 450,000) * 0.1501 = 150,000 * 0.1501 = $22,515 (matches full duty)
      const res600k = calculateStampDuty(600000, 'WA', true);
      expect(res600k.dutyPayable).toBe(22515);
      expect(res600k.dutyPayable).toBe(res600k.fullDuty);
    });

    it('FHB > $600,000 pays standard general duty', () => {
      const res = calculateStampDuty(650000, 'WA', true);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
    });

    it('provides $10,000 FHOG for new homes <= $750,000', () => {
      const res = calculateStampDuty(650000, 'WA', true, true);
      expect(res.fhogAmount).toBe(10000);
    });

    it('applies 7% foreign purchaser surcharge', () => {
      const res = calculateStampDuty(1000000, 'WA', false, false, true);
      expect(res.foreignSurcharge).toBe(70000);
    });
  });

  describe('5. South Australia (SA)', () => {
    it('new build FHB gets uncapped stamp duty exemption ($0 duty with NO price cap)', () => {
      const res800k = calculateStampDuty(800000, 'SA', true, true);
      expect(res800k.dutyPayable).toBe(0);
      expect(res800k.concessionApplied).toBe(true);
      expect(res800k.fhogAmount).toBe(15000); // Uncapped FHOG

      const res1_5M = calculateStampDuty(1500000, 'SA', true, true);
      expect(res1_5M.dutyPayable).toBe(0);
      expect(res1_5M.concessionApplied).toBe(true);
      expect(res1_5M.fhogAmount).toBe(15000);
    });

    it('established home FHB does NOT receive duty relief (pays standard duty)', () => {
      const res = calculateStampDuty(600000, 'SA', true, false);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
      expect(res.dutyPayable).toBeGreaterThan(25000);
    });

    it('applies 7% foreign purchaser surcharge', () => {
      const res = calculateStampDuty(1000000, 'SA', false, false, true);
      expect(res.foreignSurcharge).toBe(70000);
    });
  });

  describe('6. Tasmania (TAS)', () => {
    it('FHB receives 50% discount on property transfer duty up to $750,000', () => {
      const res = calculateStampDuty(600000, 'TAS', true);
      expect(res.dutyPayable).toBe(Math.round(res.fullDuty * 0.5));
      expect(res.concessionApplied).toBe(true);
      expect(res.concessionSaving).toBe(Math.round(res.fullDuty * 0.5));
    });

    it('FHB > $750,000 pays standard general duty', () => {
      const res = calculateStampDuty(800000, 'TAS', true);
      expect(res.dutyPayable).toBe(res.fullDuty);
      expect(res.concessionApplied).toBe(false);
    });

    it('provides $20,000 FHOG for new homes <= $750,000', () => {
      const res = calculateStampDuty(650000, 'TAS', true, true);
      expect(res.fhogAmount).toBe(20000);
    });

    it('applies 8% foreign purchaser surcharge', () => {
      const res = calculateStampDuty(1000000, 'TAS', false, false, true);
      expect(res.foreignSurcharge).toBe(80000);
    });
  });

  describe('7. Australian Capital Territory (ACT)', () => {
    it('Home Buyer Concession Scheme gives full exemption ($0 duty) with no price cap', () => {
      const res800k = calculateStampDuty(800000, 'ACT', true);
      expect(res800k.dutyPayable).toBe(0);
      expect(res800k.concessionApplied).toBe(true);

      const res1_5M = calculateStampDuty(1500000, 'ACT', true);
      expect(res1_5M.dutyPayable).toBe(0);
      expect(res1_5M.concessionApplied).toBe(true);
    });

    it('non-FHB pays standard general duty', () => {
      const res = calculateStampDuty(800000, 'ACT', false);
      expect(res.dutyPayable).toBeGreaterThan(15000);
      expect(res.concessionApplied).toBe(false);
    });

    it('FHOG is $0 in the ACT (abolished)', () => {
      const res = calculateStampDuty(600000, 'ACT', true, true);
      expect(res.fhogAmount).toBe(0);
    });

    it('applies 8% foreign purchaser surcharge', () => {
      const res = calculateStampDuty(1000000, 'ACT', false, false, true);
      expect(res.foreignSurcharge).toBe(80000);
    });
  });

  describe('8. Northern Territory (NT)', () => {
    it('calculates statutory polynomial formula for properties <= $525,000 with 15*V term', () => {
      // V = 500: (0.06571441 * 500^2) + (15 * 500) = 16,428.60 + 7,500 = $23,929
      const res500k = calculateStampDuty(500000, 'NT', false);
      expect(res500k.dutyPayable).toBe(23929);

      // At $525,000: (0.06571441 * 525^2) + (15 * 525) = 18,112.53 + 7,875 = $25,988
      const res525k = calculateStampDuty(525000, 'NT', false);
      expect(res525k.dutyPayable).toBe(25988);
    });

    it('calculates flat 4.95% rate for properties between $525,000 and $3,000,000', () => {
      const res600k = calculateStampDuty(600000, 'NT', false);
      // 600,000 * 0.0495 = 29,700
      expect(res600k.dutyPayable).toBe(29700);

      const res1M = calculateStampDuty(1000000, 'NT', false);
      // 1,000,000 * 0.0495 = 49,500
      expect(res1M.dutyPayable).toBe(49500);
    });

    it('calculates 5.75% flat rate for properties $3,000,000 - $5,000,000', () => {
      const res3_5M = calculateStampDuty(3500000, 'NT', false);
      // 3,500,000 * 0.0575 = 201,250
      expect(res3_5M.dutyPayable).toBe(201250);
    });

    it('new build / house & land package FHB gets 100% HLPE duty exemption & $50,000 HomeGrown grant', () => {
      const res = calculateStampDuty(650000, 'NT', true, true);
      expect(res.dutyPayable).toBe(0);
      expect(res.concessionApplied).toBe(true);
      expect(res.fhogAmount).toBe(50000);
      expect(res.netCost).toBe(-50000); // 0 duty - $50k grant
    });

    it('established home FHB pays standard conveyance duty (no concession)', () => {
      const res = calculateStampDuty(500000, 'NT', true, false);
      expect(res.dutyPayable).toBe(23929);
      expect(res.concessionApplied).toBe(false);
    });

    it('foreign purchaser surcharge is 0% in NT', () => {
      const res = calculateStampDuty(1000000, 'NT', false, false, true);
      expect(res.foreignSurcharge).toBe(0);
    });
  });

  describe('House Affordability Stamp Duty Helpers', () => {
    it('returns structured overview for all 8 states', () => {
      const states = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;
      for (const s of states) {
        const overview = getStateFHBOverview(s);
        expect(overview.state).toBe(s);
        expect(overview.stateName).toBeTruthy();
        expect(overview.summary).toBeTruthy();
      }
    });

    it('estimateStampDuty matches calculateStampDuty', () => {
      const res1 = estimateStampDuty(650000, 'QLD', true, false);
      const res2 = calculateStampDuty(650000, 'QLD', true, false);
      expect(res1).toEqual(res2);
    });
  });
});

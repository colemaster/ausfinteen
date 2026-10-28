import { describe, it, expect } from 'vitest';
import {
  TAX_BRACKETS_2026_27,
  TAX_BRACKETS_2027_28,
  FOREIGN_RESIDENT_TAX_BRACKETS_2026_27,
  WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27,
  MEDICARE_LEVY_RATE,
  MEDICARE_LEVY_REDUCTION,
  MEDICARE_LEVY_SURCHARGE,
  PRIVATE_HEALTH_INSURANCE_REBATE_2026_27,
  LOW_INCOME_TAX_OFFSET,
  STATUTORY_TAX_FREE_THRESHOLD,
  EFFECTIVE_TAX_FREE_THRESHOLD_2026_27,
  EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_LITO_ONLY,
  EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_WITH_WATO,
  PART_YEAR_RESIDENT_THRESHOLDS,
  calcPartYearTaxFreeThreshold,
  DIVISION_6AA_RATES,
  calcDivision6AATax,
  calcMinorTotalTax,
  calcIncomeTax,
  calcLITO,
  calcMedicareLevy,
  calcMedicareLevySurcharge,
  getMarginalRate,
  getCombinedMarginalRate,
  calcNetTax,
  getEffectiveRate,
} from './tax-brackets';

describe('ATO Tax Brackets 2026-27 (Resident)', () => {
  it('has legislated Stage 3 tax brackets with 15% second tier', () => {
    expect(TAX_BRACKETS_2026_27).toHaveLength(5);

    // Tier 1: 0 - 18,200 (0%)
    expect(TAX_BRACKETS_2026_27[0]).toEqual({
      min: 0,
      max: 18200,
      rate: 0,
      baseTax: 0,
    });

    // Tier 2: 18,201 - 45,000 (15%)
    expect(TAX_BRACKETS_2026_27[1]).toEqual({
      min: 18201,
      max: 45000,
      rate: 0.15,
      baseTax: 0,
    });

    // Tier 3: 45,001 - 135,000 (30%, base $4,020)
    expect(TAX_BRACKETS_2026_27[2]).toEqual({
      min: 45001,
      max: 135000,
      rate: 0.30,
      baseTax: 4020,
    });

    // Tier 4: 135,001 - 190,000 (37%, base $31,020)
    expect(TAX_BRACKETS_2026_27[3]).toEqual({
      min: 135001,
      max: 190000,
      rate: 0.37,
      baseTax: 31020,
    });

    // Tier 5: 190,001+ (45%, base $51,370)
    expect(TAX_BRACKETS_2026_27[4]).toEqual({
      min: 190001,
      max: Infinity,
      rate: 0.45,
      baseTax: 51370,
    });
  });

  it('calculates correct base taxes across bracket thresholds', () => {
    // Tier 2 max: 45,000 -> (45,000 - 18,200) * 0.15 = 4,020
    expect((45000 - 18200) * 0.15).toBe(4020);

    // Tier 3 max: 135,000 -> 4,020 + (135,000 - 45,000) * 0.30 = 31,020
    expect(4020 + (135000 - 45000) * 0.30).toBe(31020);

    // Tier 4 max: 190,000 -> 31,020 + (190,000 - 135,000) * 0.37 = 51,370
    expect(31020 + (190000 - 135000) * 0.37).toBe(51370);
  });

  it('calculates gross income tax correctly at boundary points', () => {
    expect(calcIncomeTax(0)).toBe(0);
    expect(calcIncomeTax(18200)).toBe(0);
    expect(calcIncomeTax(18201)).toBeCloseTo(0.15, 2);
    expect(calcIncomeTax(45000)).toBe(4020);
    expect(calcIncomeTax(45001)).toBeCloseTo(4020.30, 2);
    expect(calcIncomeTax(100000)).toBe(4020 + (100000 - 45000) * 0.30); // 20,520
    expect(calcIncomeTax(135000)).toBe(31020);
    expect(calcIncomeTax(135001)).toBeCloseTo(31020.37, 2);
    expect(calcIncomeTax(190000)).toBe(51370);
    expect(calcIncomeTax(190001)).toBeCloseTo(51370.45, 2);
    expect(calcIncomeTax(200000)).toBe(51370 + (200000 - 190000) * 0.45); // 55,870
  });
});

describe('ATO Tax Brackets 2027-28 Preview', () => {
  it('has legislated 14% rate on second tier with recomputed base taxes', () => {
    expect(TAX_BRACKETS_2027_28).toHaveLength(5);

    // Tier 2: 18,201 - 45,000 is 14%
    expect(TAX_BRACKETS_2027_28[1].rate).toBe(0.14);

    // Derived base taxes:
    // (45,000 - 18,200) * 0.14 = 3,752
    expect(TAX_BRACKETS_2027_28[2].baseTax).toBe(3752);
    // 3,752 + (135,000 - 45,000) * 0.30 = 30,752
    expect(TAX_BRACKETS_2027_28[3].baseTax).toBe(30752);
    // 30,752 + (190,000 - 135,000) * 0.37 = 51,102
    expect(TAX_BRACKETS_2027_28[4].baseTax).toBe(51102);
  });

  it('calculates 2027-28 tax with $268 tax cut over 2026-27 for incomes >= $45,000', () => {
    const tax26_45k = calcIncomeTax(45000, TAX_BRACKETS_2026_27);
    const tax27_45k = calcIncomeTax(45000, TAX_BRACKETS_2027_28);
    // 26,800 * (15% - 14%) = 26,800 * 1% = $268 tax cut
    expect(tax26_45k - tax27_45k).toBe(268);

    const tax26_100k = calcIncomeTax(100000, TAX_BRACKETS_2026_27);
    const tax27_100k = calcIncomeTax(100000, TAX_BRACKETS_2027_28);
    expect(tax26_100k - tax27_100k).toBe(268);
  });
});

describe('Foreign Resident & Working Holiday Maker (WHM) Brackets', () => {
  it('foreign residents: 30% from $1, no tax-free threshold, no Medicare', () => {
    expect(FOREIGN_RESIDENT_TAX_BRACKETS_2026_27).toEqual([
      { min: 0,      max: 135000,   rate: 0.30, baseTax: 0 },
      { min: 135001, max: 190000,   rate: 0.37, baseTax: 40500 },
      { min: 190001, max: Infinity, rate: 0.45, baseTax: 60850 },
    ]);

    expect(calcIncomeTax(50000, FOREIGN_RESIDENT_TAX_BRACKETS_2026_27)).toBe(15000);
    expect(calcIncomeTax(135000, FOREIGN_RESIDENT_TAX_BRACKETS_2026_27)).toBe(40500);
    expect(calcIncomeTax(150000, FOREIGN_RESIDENT_TAX_BRACKETS_2026_27)).toBe(40500 + 15000 * 0.37);
  });

  it('working holiday makers: 15% on first $45,000 then standard resident rates', () => {
    expect(WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27).toEqual([
      { min: 0,      max: 45000,    rate: 0.15, baseTax: 0 },
      { min: 45001,  max: 135000,   rate: 0.30, baseTax: 6750 },
      { min: 135001, max: 190000,   rate: 0.37, baseTax: 33750 },
      { min: 190001, max: Infinity, rate: 0.45, baseTax: 54100 },
    ]);

    expect(calcIncomeTax(30000, WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27)).toBe(4500);
    expect(calcIncomeTax(45000, WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27)).toBe(6750);
    expect(calcIncomeTax(100000, WORKING_HOLIDAY_MAKER_TAX_BRACKETS_2026_27)).toBe(6750 + 55000 * 0.30);
  });
});

describe('Low Income Tax Offset (LITO)', () => {
  it('provides max $700 offset up to $37,500', () => {
    expect(calcLITO(0)).toBe(0);
    expect(calcLITO(18200)).toBe(700);
    expect(calcLITO(37500)).toBe(700);
  });

  it('phases out at 5c/$1 between $37,500 and $45,000 (leaves $325 at $45,000)', () => {
    // At $40,000: 700 - (40,000 - 37,500) * 0.05 = 700 - 125 = 575
    expect(calcLITO(40000)).toBe(575);
    // At $45,000: 700 - 7,500 * 0.05 = 325
    expect(calcLITO(45000)).toBe(325);
  });

  it('phases out at 1.5c/$1 between $45,000 and $66,667 (reaches $0 above $66,667)', () => {
    // At $55,000: 325 - (55,000 - 45,000) * 0.015 = 325 - 150 = 175
    expect(calcLITO(55000)).toBe(175);
    // At $66,667: 325 - (66,667 - 45,000) * 0.015 = 325 - 325.005 -> 0
    expect(calcLITO(66667)).toBe(0);
    expect(calcLITO(70000)).toBe(0);
  });

  it('confirms effective zero-tax threshold is $22,866 in 2026-27', () => {
    expect(LOW_INCOME_TAX_OFFSET.zeroTaxThreshold).toBe(22866);

    // At $22,866:
    // Gross tax = (22,866 - 18,200) * 0.15 = 4,666 * 0.15 = $699.90
    // LITO = $700 -> Net income tax = $0
    // Medicare: 22,866 <= 28,011 -> Medicare = $0
    // Net total tax = $0
    const grossTax22866 = calcIncomeTax(22866);
    const lito22866 = calcLITO(22866);
    expect(grossTax22866).toBeLessThan(lito22866);
    expect(calcNetTax(22866)).toBe(0);

    // At $22,867:
    // Gross tax = 4,667 * 0.15 = $700.05
    // LITO = $700 -> Net income tax = $0.05
    const netTax22867 = calcNetTax(22867);
    expect(netTax22867).toBeCloseTo(0.05, 2);
  });
});

describe('Medicare Levy & Reductions', () => {
  it('individual: 0% levy up to $28,011, 10% shade-in to $35,013, full 2% above', () => {
    expect(MEDICARE_LEVY_RATE).toBe(0.02);
    expect(MEDICARE_LEVY_REDUCTION.threshold).toBe(28011);
    expect(MEDICARE_LEVY_REDUCTION.phaseOutThreshold).toBe(35013);

    expect(calcMedicareLevy(28011)).toBe(0);

    // Shade-in: $30,000 -> (30,000 - 28,011) * 0.10 = 198.90 (vs full 2% = 600)
    expect(calcMedicareLevy(30000)).toBeCloseTo(198.90, 2);

    // At phaseOutThreshold: $35,013 -> min(700.26, 700.20) = 700.20
    expect(calcMedicareLevy(35013)).toBeCloseTo(700.20, 2);

    // Above $35,013: full 2%
    expect(calcMedicareLevy(50000)).toBe(1000);
    expect(calcMedicareLevy(100000)).toBe(2000);
  });

  it('supports SAPTO thresholds ($44,268 single / $55,335 phase-out; family $61,623 / $77,028)', () => {
    // Single SAPTO
    expect(calcMedicareLevy(44268, { isSapto: true })).toBe(0);
    expect(calcMedicareLevy(50000, { isSapto: true })).toBeCloseTo((50000 - 44268) * 0.10, 2);
    expect(calcMedicareLevy(60000, { isSapto: true })).toBe(1200);

    // Family SAPTO
    expect(calcMedicareLevy(61623, { isSapto: true, isFamily: true })).toBe(0);
    expect(calcMedicareLevy(70000, { isSapto: true, isFamily: true })).toBeCloseTo((70000 - 61623) * 0.10, 2);
    expect(calcMedicareLevy(80000, { isSapto: true, isFamily: true })).toBe(1600);
  });

  it('supports family low-income threshold ($47,243 + $4,339/child)', () => {
    // Family with 0 children: $47,243
    expect(calcMedicareLevy(47243, { isFamily: true })).toBe(0);

    // Family with 2 children: $47,243 + 2 * 4,339 = $55,921
    expect(calcMedicareLevy(55921, { isFamily: true, dependants: 2 })).toBe(0);
    expect(calcMedicareLevy(58000, { isFamily: true, dependants: 2 })).toBeCloseTo((58000 - 55921) * 0.10, 2);
  });

  it('Medicare Levy Surcharge: single $105k/$123k/$164k and family $210k/$246k/$328k with dependant bonus', () => {
    expect(MEDICARE_LEVY_SURCHARGE.thresholds).toEqual({
      tier1: 105000,
      tier2: 123000,
      tier3: 164000,
    });
    expect(MEDICARE_LEVY_SURCHARGE.familyThresholds).toEqual({
      tier1: 210000,
      tier2: 246000,
      tier3: 328000,
    });
    expect(MEDICARE_LEVY_SURCHARGE.familyChildBonus).toBe(1500);
    expect(MEDICARE_LEVY_SURCHARGE.maxExcess).toEqual({
      single: 750,
      family: 1500,
    });
    expect(MEDICARE_LEVY_SURCHARGE.rates).toEqual({
      tier1: 0.010,
      tier2: 0.0125,
      tier3: 0.015,
    });

    // With hospital cover -> 0 MLS
    expect(calcMedicareLevySurcharge(150000, true)).toBe(0);

    // Single without hospital cover
    expect(calcMedicareLevySurcharge(100000, false)).toBe(0);
    expect(calcMedicareLevySurcharge(110000, false)).toBe(110000 * 0.01);
    expect(calcMedicareLevySurcharge(130000, false)).toBe(130000 * 0.0125);
    expect(calcMedicareLevySurcharge(180000, false)).toBe(180000 * 0.015);

    // Family without hospital cover (boolean flag)
    expect(calcMedicareLevySurcharge(200000, false, true)).toBe(0);
    expect(calcMedicareLevySurcharge(220000, false, true)).toBe(220000 * 0.01);
    expect(calcMedicareLevySurcharge(260000, false, true)).toBe(260000 * 0.0125);
    expect(calcMedicareLevySurcharge(350000, false, true)).toBe(350000 * 0.015);

    // Family with dependent children (+$1,500 for each child after the first)
    // 3 children -> 2 children after first -> +$3,000 to thresholds
    // Tier 1 becomes $213,000, Tier 2 becomes $249,000, Tier 3 becomes $331,000
    expect(calcMedicareLevySurcharge(212000, false, { isFamily: true, dependants: 3 })).toBe(0);
    expect(calcMedicareLevySurcharge(215000, false, { isFamily: true, dependants: 3 })).toBe(215000 * 0.01);
  });

  it('defines Private Health Insurance Rebate tiers, rates and complying hospital cover rules', () => {
    // Income tiers aligned with MLS
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.incomeTiers.base).toEqual({
      singleMax: 105000,
      familyMax: 210000,
    });
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.incomeTiers.tier1).toEqual({
      singleMax: 123000,
      familyMax: 246000,
    });
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.incomeTiers.tier2).toEqual({
      singleMax: 164000,
      familyMax: 328000,
    });
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.incomeTiers.tier3).toEqual({
      singleMin: 164001,
      familyMin: 328001,
    });

    // Rebate rates for under 65
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.rates.base.under65).toBeCloseTo(0.24608, 4);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.rates.tier1.under65).toBeCloseTo(0.16405, 4);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.rates.tier2.under65).toBeCloseTo(0.08202, 4);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.rates.tier3.under65).toBe(0);

    // Complying cover rules to avoid MLS
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.complyingCoverRules.maxSingleExcess).toBe(750);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.complyingCoverRules.maxFamilyExcess).toBe(1500);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.complyingCoverRules.extrasOnlyQualifies).toBe(false);
    expect(PRIVATE_HEALTH_INSURANCE_REBATE_2026_27.complyingCoverRules.overseasCoverQualifies).toBe(false);
  });
});

describe('Division 6AA Minor Unearned Income Tax', () => {
  it('applies statutory thresholds: $416 nil, 66% to $1,307, 45% flat above $1,307', () => {
    expect(DIVISION_6AA_RATES).toEqual({
      taxFreeLimit: 416,
      threshold66: 1307,
      shadeInRate: 0.66,
      topRate: 0.45,
    });

    // <= $416: $0 tax
    expect(calcDivision6AATax(0)).toBe(0);
    expect(calcDivision6AATax(416)).toBe(0);

    // $417 - $1,307: 66% of excess over $416
    expect(calcDivision6AATax(417)).toBeCloseTo(1 * 0.66, 2);
    expect(calcDivision6AATax(1000)).toBeCloseTo((1000 - 416) * 0.66, 2);
    expect(calcDivision6AATax(1307)).toBeCloseTo((1307 - 416) * 0.66, 2); // 588.06

    // Over $1,307: 45% flat on total unearned income
    expect(calcDivision6AATax(1308)).toBeCloseTo(1308 * 0.45, 2);
    expect(calcDivision6AATax(2000)).toBe(2000 * 0.45); // 900
    expect(calcDivision6AATax(10000)).toBe(10000 * 0.45); // 4500
  });
});

describe('Marginal and Combined Marginal Rates', () => {
  it('returns exact statutory marginal rate across all brackets', () => {
    expect(getMarginalRate(0)).toBe(0);
    expect(getMarginalRate(18200)).toBe(0);
    expect(getMarginalRate(18201)).toBe(0.15);
    expect(getMarginalRate(45000)).toBe(0.15);
    expect(getMarginalRate(45001)).toBe(0.30);
    expect(getMarginalRate(135000)).toBe(0.30);
    expect(getMarginalRate(135001)).toBe(0.37);
    expect(getMarginalRate(190000)).toBe(0.37);
    expect(getMarginalRate(190001)).toBe(0.45);
    expect(getMarginalRate(300000)).toBe(0.45);
  });

  it('returns combined marginal rate including Medicare levy and shade-in rate', () => {
    // Under Medicare threshold ($28,011)
    expect(getCombinedMarginalRate(25000)).toBe(0.15);

    // In Medicare shade-in zone ($28,011 - $35,013): 15% + 10% = 25%
    expect(getCombinedMarginalRate(30000)).toBe(0.15 + 0.10);

    // In normal 15% bracket above Medicare phase-out: 15% + 2% = 17%
    expect(getCombinedMarginalRate(40000)).toBe(0.15 + 0.02);

    // In 30% bracket: 30% + 2% = 32%
    expect(getCombinedMarginalRate(45001)).toBe(0.30 + 0.02);
    expect(getCombinedMarginalRate(100000)).toBe(0.30 + 0.02);

    // In 37% bracket: 37% + 2% = 39%
    expect(getCombinedMarginalRate(150000)).toBe(0.37 + 0.02);

    // In 45% bracket: 45% + 2% = 47%
    expect(getCombinedMarginalRate(250000)).toBe(0.45 + 0.02);
  });

  it('effective rate is total net tax divided by taxable income', () => {
    expect(getEffectiveRate(0)).toBe(0);
    expect(getEffectiveRate(20000)).toBe(0);
    expect(getEffectiveRate(100000)).toBeCloseTo(calcNetTax(100000) / 100000, 4);
    expect(getEffectiveRate(100000)).toBeLessThan(getMarginalRate(100000));
  });
});

describe('Tax-Free Threshold Constants & Minor Total Tax', () => {
  it('exports correct statutory ($18,200) and effective ($22,866) thresholds', () => {
    expect(STATUTORY_TAX_FREE_THRESHOLD).toBe(18200);
    expect(EFFECTIVE_TAX_FREE_THRESHOLD_2026_27).toBe(22866);
    expect(EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_LITO_ONLY).toBe(23200);
    expect(EFFECTIVE_TAX_FREE_THRESHOLD_2027_28_WITH_WATO).toBe(24985);
    expect(calcNetTax(STATUTORY_TAX_FREE_THRESHOLD)).toBe(0);
    expect(calcNetTax(EFFECTIVE_TAX_FREE_THRESHOLD_2026_27)).toBe(0);
    expect(calcNetTax(EFFECTIVE_TAX_FREE_THRESHOLD_2026_27 + 1)).toBeGreaterThan(0);
  });

  it('calculates part-year tax-free threshold accurately under ITAA 1986 s 18', () => {
    expect(PART_YEAR_RESIDENT_THRESHOLDS).toEqual({
      base: 13464,
      variable: 4736,
    });

    // 12 months -> full $18,200
    expect(calcPartYearTaxFreeThreshold(12)).toBe(18200);
    expect(calcPartYearTaxFreeThreshold(14)).toBe(18200);

    // 1 month -> 13,464 + 4,736 * (1/12) = 13,464 + 394.67 = 13,859
    expect(calcPartYearTaxFreeThreshold(1)).toBe(13859);

    // 5 months (e.g. arrived in February) -> 13,464 + 4,736 * (5/12) = 13,464 + 1,973.33 = 15,437
    expect(calcPartYearTaxFreeThreshold(5)).toBe(15437);

    // 6 months (half year) -> 13,464 + 2,368 = 15,832
    expect(calcPartYearTaxFreeThreshold(6)).toBe(15832);
  });

  it('calcMinorTotalTax correctly isolates earned wages from passive unearned income', () => {
    // Pure earned job income under $22,866: zero tax
    const jobOnly = calcMinorTotalTax(15000, 0);
    expect(jobOnly.earnedTax).toBe(0);
    expect(jobOnly.unearnedTax).toBe(0);
    expect(jobOnly.medicareLevy).toBe(0);
    expect(jobOnly.totalTax).toBe(0);

    // Job wages + minor bank interest ($300, within $416 tax-free threshold)
    const withSmallInterest = calcMinorTotalTax(12000, 300);
    expect(withSmallInterest.earnedTax).toBe(0);
    expect(withSmallInterest.unearnedTax).toBe(0);
    expect(withSmallInterest.totalTax).toBe(0);

    // Job wages + trust distribution in 66% shade-in zone ($1,000 unearned)
    // (1,000 - 416) * 0.66 = 584 * 0.66 = 385.44
    const withTrustShadeIn = calcMinorTotalTax(14000, 1000);
    expect(withTrustShadeIn.earnedTax).toBe(0);
    expect(withTrustShadeIn.unearnedTax).toBeCloseTo(385.44, 2);
    expect(withTrustShadeIn.medicareLevy).toBe(0); // Total $15k < $28,011
    expect(withTrustShadeIn.totalTax).toBeCloseTo(385.44, 2);

    // Large unearned distribution ($5,000) > $1,307: flat 45% on entire unearned amount
    const withLargeUnearned = calcMinorTotalTax(10000, 5000);
    expect(withLargeUnearned.earnedTax).toBe(0);
    expect(withLargeUnearned.unearnedTax).toBe(5000 * 0.45); // 2,250
    expect(withLargeUnearned.medicareLevy).toBe(0);
    expect(withLargeUnearned.totalTax).toBe(2250);
  });
});

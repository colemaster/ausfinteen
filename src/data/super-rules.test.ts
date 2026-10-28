import { describe, it, expect } from 'vitest';
import {
  calcCoContribution,
  calcDivision293Tax,
  calcDivision296Tax,
  calcFhsssMaxRelease,
  calcListo,
  calcLowBalanceCappedFee,
  calcSuperCompoundingProjection,
  getMinimumDrawdownRate,
  getNonConcessionalCap,
  isCarryForwardEligible,
  isDivision293,
  isUnder18SuperEligible,
  maxAdditionalSacrifice,
  SUPER_RULES,
} from './super-rules';

describe('2026-27 superannuation rates and thresholds (verified October 2026)', () => {
  it('uses the 12.0% SG rate for 2025-26 and 2026-27', () => {
    expect(SUPER_RULES.sgRate).toBe(0.12);
  });

  it('matches the indexed contributions caps', () => {
    expect(SUPER_RULES.concessionalCap).toBe(32500);
    expect(SUPER_RULES.nonConcessionalCap).toBe(130000);
    expect(SUPER_RULES.nonConcessionalCap).toBe(SUPER_RULES.concessionalCap * 4);
    expect(SUPER_RULES.bringForwardCap).toBe(390000);       // 3-year, TSB < $1.84M
    expect(SUPER_RULES.bringForwardCap2Year).toBe(260000);  // 2-year, TSB $1.84M–<$1.97M
  });

  it('matches the general transfer balance cap and defined benefit income cap', () => {
    expect(SUPER_RULES.transferBalanceCap).toBe(2100000);   // current from 1 July 2026
    expect(SUPER_RULES.transferBalanceCap2027).toBe(2100000);
    expect(SUPER_RULES.transferBalanceCap2026).toBe(2000000);
    expect(SUPER_RULES.definedBenefitIncomeCap).toBe(131250);
  });

  it('matches the non-concessional bring-forward total super balance tiers', () => {
    expect(SUPER_RULES.totalSuperBalanceNCCThreshold).toBe(1840000);
    expect(SUPER_RULES.totalSuperBalanceNCCUpperThreshold).toBe(1970000);
  });

  it('calculates non-concessional cap and bring-forward years by TSB tier via getNonConcessionalCap', () => {
    // Under $1.84M -> 3-year bring-forward: $390,000
    expect(getNonConcessionalCap(500000)).toEqual({
      cap: 390000,
      bringForwardYears: 3,
      eligible: true,
    });
    expect(getNonConcessionalCap(1839999)).toEqual({
      cap: 390000,
      bringForwardYears: 3,
      eligible: true,
    });

    // Between $1.84M and $1.97M -> 2-year bring-forward: $260,000
    expect(getNonConcessionalCap(1840000)).toEqual({
      cap: 260000,
      bringForwardYears: 2,
      eligible: true,
    });
    expect(getNonConcessionalCap(1969999)).toEqual({
      cap: 260000,
      bringForwardYears: 2,
      eligible: true,
    });

    // Between $1.97M and $2.1M -> 1-year standard cap: $130,000
    expect(getNonConcessionalCap(1970000)).toEqual({
      cap: 130000,
      bringForwardYears: 1,
      eligible: true,
    });
    expect(getNonConcessionalCap(2099999)).toEqual({
      cap: 130000,
      bringForwardYears: 1,
      eligible: true,
    });

    // At or above $2.1M (TBC) -> $0 cap
    expect(getNonConcessionalCap(2100000)).toEqual({
      cap: 0,
      bringForwardYears: 0,
      eligible: false,
    });
    expect(getNonConcessionalCap(3000000)).toEqual({
      cap: 0,
      bringForwardYears: 0,
      eligible: false,
    });
  });

  it('keeps the Division 293 threshold at $250,000', () => {
    expect(SUPER_RULES.division293Threshold).toBe(250000);
    expect(SUPER_RULES.division293Rate).toBe(0.15);
    expect(isDivision293(200000, 50000)).toBe(false);  // exactly at the threshold
    expect(isDivision293(200001, 50000)).toBe(true);
  });

  it('limits Division 293 tax to the concessional contributions', () => {
    // $260k income + $32.5k contributions: excess over $250k is $42.5k, capped at $32.5k
    const res = calcDivision293Tax(260000, 32500);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(32500 * 0.15, 2);
    expect(calcDivision293Tax(217500, 32500)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('calculates carry-forward eligibility and the under-18 hours rule', () => {
    expect(SUPER_RULES.carryForwardYears).toBe(5);
    expect(SUPER_RULES.carryForwardBalanceThreshold).toBe(500000);
    expect(SUPER_RULES.under18WeeklyHoursThreshold).toBe(30);

    expect(isCarryForwardEligible(499999)).toBe(true);
    expect(isCarryForwardEligible(500000)).toBe(false);
    expect(isCarryForwardEligible(750000)).toBe(false);
  });

  it('keeps the 3% low-balance fee cap for balances under $6,000', () => {
    expect(SUPER_RULES.lowBalanceFeeCap).toBe(0.03);
    expect(SUPER_RULES.lowBalanceThreshold).toBe(6000);
  });

  it('keeps preservation age 60 and Age Pension age 67', () => {
    expect(SUPER_RULES.preservationAge).toBe(60);
    expect(SUPER_RULES.agePensionAge).toBe(67);
  });

  it('caps salary sacrifice at the concessional cap less employer SG', () => {
    expect(maxAdditionalSacrifice(100000)).toBeCloseTo(32500 - 12000, 2);
    expect(maxAdditionalSacrifice(300000)).toBe(0);
  });
});

describe('Government Co-contribution rules (2026-27 & baseline parameters)', () => {
  it('defines the correct 2026-27 indexed thresholds and baseline thresholds', () => {
    expect(SUPER_RULES.coContributionMax).toBe(500);
    expect(SUPER_RULES.coContributionMatchRate).toBe(0.50);
    expect(SUPER_RULES.coContributionLowerThreshold).toBe(49293);
    expect(SUPER_RULES.coContributionUpperThreshold).toBe(64293);
    expect(SUPER_RULES.coContributionBaseLowerThreshold).toBe(45400);
    expect(SUPER_RULES.coContributionBaseUpperThreshold).toBe(60400);
    expect(SUPER_RULES.coContributionMinPayment).toBe(20);

    // Structured object mirrors individual properties
    expect(SUPER_RULES.coContribution.maxContribution).toBe(500);
    expect(SUPER_RULES.coContribution.lowerIncomeThreshold).toBe(49293);
    expect(SUPER_RULES.coContribution.upperIncomeThreshold).toBe(64293);
    expect(SUPER_RULES.coContribution.baseLowerIncomeThreshold).toBe(45400);
    expect(SUPER_RULES.coContribution.baseUpperIncomeThreshold).toBe(60400);
  });

  it('awards full 50% match up to $500 for income below or at lower threshold', () => {
    // $1,000 after-tax contribution with income $40,000 -> full $500
    const res = calcCoContribution(40000, 1000);
    expect(res).toEqual({ eligible: true, entitlement: 500 });

    // $600 after-tax contribution -> $300 match
    const resPartial = calcCoContribution(40000, 600);
    expect(resPartial).toEqual({ eligible: true, entitlement: 300 });

    // At exact lower threshold ($49,293)
    const resAtThreshold = calcCoContribution(49293, 1000);
    expect(resAtThreshold).toEqual({ eligible: true, entitlement: 500 });
  });

  it('phases out at ~3.333c per dollar above lower threshold and reaches 0 at or above upper threshold', () => {
    // Income midway between $49,293 and $64,293: ~$56,793
    // Reduction: ($56,793 - $49,293) * (1/30) = 7500 / 30 = $250
    // Entitlement: $500 - $250 = $250
    const resMid = calcCoContribution(56793, 1000);
    expect(resMid.eligible).toBe(true);
    expect(resMid.entitlement).toBeCloseTo(250, 0);

    // At or above upper threshold ($64,293)
    expect(calcCoContribution(64293, 1000)).toEqual({ eligible: false, entitlement: 0 });
    expect(calcCoContribution(70000, 1000)).toEqual({ eligible: false, entitlement: 0 });
  });

  it('supports unindexed baseline thresholds (~$45.4k lower / ~$60.4k upper)', () => {
    // Baseline full entitlement at $45,400
    expect(calcCoContribution(45400, 1000, true)).toEqual({ eligible: true, entitlement: 500 });
    // Baseline phaseout above $60,400
    expect(calcCoContribution(60400, 1000, true)).toEqual({ eligible: false, entitlement: 0 });
    // Baseline midway: $45,400 + 7,500 = $52,900 -> $250 entitlement
    const resMid = calcCoContribution(52900, 1000, true);
    expect(resMid.eligible).toBe(true);
    expect(resMid.entitlement).toBeCloseTo(250, 0);
  });

  it('enforces the ATO $20 minimum payment rule', () => {
    // Very small calculated entitlement (< $20) gets rounded up to $20 minimum
    const res = calcCoContribution(49293, 30); // 50% of $30 = $15 -> ATO minimum $20
    expect(res).toEqual({ eligible: true, entitlement: 20 });
  });

  it('returns ineligible for 0 or negative personal contribution', () => {
    expect(calcCoContribution(30000, 0)).toEqual({ eligible: false, entitlement: 0 });
    expect(calcCoContribution(30000, -100)).toEqual({ eligible: false, entitlement: 0 });
  });
});

describe('Low Income Super Tax Offset (LISTO)', () => {
  it('matches official parameters for 2026-27 and future 2027-28', () => {
    expect(SUPER_RULES.listoIncomeThreshold).toBe(37000);
    expect(SUPER_RULES.listoMaxAmount).toBe(500);
    expect(SUPER_RULES.listoRate).toBe(0.15);
    expect(SUPER_RULES.listoMinPayment).toBe(10);
    expect(SUPER_RULES.listoFutureIncomeThreshold2027).toBe(45000);
    expect(SUPER_RULES.listoFutureMaxAmount2027).toBe(810);

    expect(SUPER_RULES.listo.incomeThreshold).toBe(37000);
    expect(SUPER_RULES.listo.maxAmount).toBe(500);
    expect(SUPER_RULES.listo.rate).toBe(0.15);
  });

  it('calculates 15% refund up to $500 for incomes up to $37,000', () => {
    // $30,000 income with $3,600 concessional super (12% SG)
    // 15% of $3,600 = $540 -> capped at $500
    expect(calcListo(30000, 3600)).toEqual({ eligible: true, entitlement: 500 });

    // $25,000 income with $2,000 concessional super
    // 15% of $2,000 = $300
    expect(calcListo(25000, 2000)).toEqual({ eligible: true, entitlement: 300 });

    // Exactly at threshold ($37,000)
    expect(calcListo(37000, 3000)).toEqual({ eligible: true, entitlement: 450 });
  });

  it('returns ineligible for income above $37,000 or zero contributions', () => {
    expect(calcListo(37001, 3000)).toEqual({ eligible: false, entitlement: 0 });
    expect(calcListo(50000, 5000)).toEqual({ eligible: false, entitlement: 0 });
    expect(calcListo(30000, 0)).toEqual({ eligible: false, entitlement: 0 });
  });

  it('enforces the ATO $10 minimum payment rule', () => {
    // 15% of $50 = $7.50 -> rounded up to $10 minimum
    expect(calcListo(20000, 50)).toEqual({ eligible: true, entitlement: 10 });
  });
});

describe('First Home Super Saver Scheme (FHSSS) parameters', () => {
  it('matches statutory annual and lifetime release limits', () => {
    expect(SUPER_RULES.fhsssAnnualCap).toBe(15000);
    expect(SUPER_RULES.fhsssLifetimeCap).toBe(50000);
    expect(SUPER_RULES.fhsss.annualLimit).toBe(15000);
    expect(SUPER_RULES.fhsss.lifetimeLimit).toBe(50000);
  });

  it('calculates FHSSS max release amount with 85% concessional and 100% non-concessional', () => {
    // $30,000 concessional (accumulated over 2+ years) + $10,000 non-concessional
    // Concessional: 30,000 * 0.85 = 25,500
    // Non-concessional: 10,000 * 1.00 = 10,000
    // Total = 35,500
    const res = calcFhsssMaxRelease(30000, 10000);
    expect(res.concessionalReleasable).toBe(25500);
    expect(res.nonConcessionalReleasable).toBe(10000);
    expect(res.totalReleasableContributions).toBe(35500);
    expect(res.isCappedByLifetimeLimit).toBe(false);

    // Capped by $50,000 lifetime limit
    // $40,000 concessional + $20,000 non-concessional = $60,000 nominal
    // Pro-rata to $50,000 (ratio = 50k / 60k = 5/6)
    // Capped concessional = 33,333.33 * 0.85 = 28,333.33
    // Capped non-concessional = 16,666.67
    const cappedRes = calcFhsssMaxRelease(40000, 20000);
    expect(cappedRes.isCappedByLifetimeLimit).toBe(true);
    expect(cappedRes.totalReleasableContributions).toBeCloseTo(28333.33 + 16666.67, 1);
  });
});

describe('Payday Super legislation (from 1 July 2026)', () => {
  it('matches legislated start date and payment window requirements', () => {
    expect(SUPER_RULES.paydaySuperStartDate).toBe('2026-07-01');
    expect(SUPER_RULES.paydaySuperDueBusinessDays).toBe(7);
    expect(SUPER_RULES.paydaySuperNewFundDueBusinessDays).toBe(20);
    expect(SUPER_RULES.paydaySuperFundAllocationDays).toBe(3);
    expect(SUPER_RULES.paydaySuperBaseEarnings).toBe('Qualifying Earnings (QE)');

    expect(SUPER_RULES.paydaySuper.startDate).toBe('2026-07-01');
    expect(SUPER_RULES.paydaySuper.label).toBe('1 July 2026');
    expect(SUPER_RULES.paydaySuper.paymentDueBusinessDays).toBe(7);
    expect(SUPER_RULES.paydaySuper.newFundDueBusinessDays).toBe(20);
    expect(SUPER_RULES.paydaySuper.fundAllocationDays).toBe(3);
    expect(SUPER_RULES.paydaySuper.baseEarnings).toBe('Qualifying Earnings (QE)');
  });
});

describe('Young worker protections: ILBA, PMIF under-25 insurance, low-balance fee cap', () => {
  it('defines the 16-month inactivity and $6,000 threshold for Inactive Low-Balance Accounts (ILBA)', () => {
    expect(SUPER_RULES.inactiveLowBalanceThreshold).toBe(6000);
    expect(SUPER_RULES.inactiveLowBalanceMonths).toBe(16);
  });

  it('defines the age 25 threshold for opt-in insurance under PMIF Act 2019', () => {
    expect(SUPER_RULES.pmifUnder25InsuranceExemptionAge).toBe(25);
  });

  it('evaluates under-18 super eligibility correctly via isUnder18SuperEligible', () => {
    // 18+ workers always qualify regardless of hours worked
    expect(isUnder18SuperEligible(18, 2)).toBe(true);
    expect(isUnder18SuperEligible(19, 0)).toBe(true);
    expect(isUnder18SuperEligible(25, 38)).toBe(true);

    // Under-18 workers only qualify if they work MORE than 30 hours in the calendar week
    expect(isUnder18SuperEligible(15, 10)).toBe(false);
    expect(isUnder18SuperEligible(16, 25)).toBe(false);
    expect(isUnder18SuperEligible(17, 30)).toBe(false); // exactly 30 does not exceed
    expect(isUnder18SuperEligible(17, 30.5)).toBe(true);
    expect(isUnder18SuperEligible(15, 35)).toBe(true);
  });

  it('calculates low-balance fee caps and rebates correctly via calcLowBalanceCappedFee', () => {
    // $1,000 balance with $80 proposed annual fee: 3% cap is $30, rebate is $50
    const res = calcLowBalanceCappedFee(1000, 80);
    expect(res).toEqual({ cappedFee: 30, feeRebate: 50, isCapped: true });

    // $500 balance with $10 proposed fee (<= 3% = $15): not capped
    expect(calcLowBalanceCappedFee(500, 10)).toEqual({ cappedFee: 10, feeRebate: 0, isCapped: false });

    // Balance >= $6,000 ($10,000): cap does not apply
    expect(calcLowBalanceCappedFee(10000, 150)).toEqual({ cappedFee: 150, feeRebate: 0, isCapped: false });

    // Zero or negative balance
    expect(calcLowBalanceCappedFee(0, 50)).toEqual({ cappedFee: 0, feeRebate: 0, isCapped: false });
  });

  it('projects long-term super compounding accurately via calcSuperCompoundingProjection', () => {
    // Case 1: Single $1,200 lump sum at age 16 compounding at 8.5% over 44 years with $0 weekly contributions
    const lumpSumProj = calcSuperCompoundingProjection(1200, 0, 0.085, 44);
    expect(lumpSumProj.totalContributions).toBe(1200);
    expect(lumpSumProj.futureValue).toBeGreaterThan(40000);
    expect(lumpSumProj.futureValue).toBeLessThan(46000);

    // Case 2: $50/week starting at age 18 to 60 (42 years) at 8.5% p.a.
    const regularProj = calcSuperCompoundingProjection(0, 50, 0.085, 42);
    expect(regularProj.totalContributions).toBe(50 * 52 * 42);
    expect(regularProj.futureValue).toBeGreaterThan(1000000);
    expect(regularProj.totalInterest).toBe(regularProj.futureValue - regularProj.totalContributions);
  });
});

describe('minimum drawdown rates (Schedule 7 SISR, normal rates from 2023-24)', () => {
  it.each([
    [56, 0.04],
    [60, 0.04],
    [64, 0.04],
    [65, 0.05],
    [74, 0.05],
    [75, 0.06],
    [79, 0.06],
    [80, 0.07],
    [84, 0.07],
    [85, 0.09],
    [89, 0.09],
    [90, 0.11],
    [94, 0.11],
    [95, 0.14],
    [101, 0.14],
  ])('age %i → %f', (age, rate) => {
    expect(getMinimumDrawdownRate(age)).toBe(rate);
  });
});

describe('Division 296 tax on large balances (from 1 July 2026)', () => {
  it('does not apply at or below $3M', () => {
    expect(calcDivision296Tax(3000000, 200000)).toEqual({ applies: false, taxPayable: 0 });
    expect(calcDivision296Tax(1500000, 100000)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('does not apply with zero or negative earnings', () => {
    expect(calcDivision296Tax(5000000, 0)).toEqual({ applies: false, taxPayable: 0 });
  });

  it('applies 15% to the realised earnings share above $3M', () => {
    // $4M balance, $400k realised earnings: share above $3M = 25% → 400000 × 0.25 × 0.15 = $15,000
    const res = calcDivision296Tax(4000000, 400000);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(15000, 2);
  });

  it('adds a further 10% on the share above $10M', () => {
    // $12M balance, $1.2M earnings:
    // base: 1.2M × (9/12) × 0.15 = $135,000; upper: 1.2M × (2/12) × 0.10 = $20,000
    const res = calcDivision296Tax(12000000, 1200000);
    expect(res.applies).toBe(true);
    expect(res.taxPayable).toBeCloseTo(155000, 2);
  });

  it('matches legislated thresholds and rates', () => {
    expect(SUPER_RULES.division296Threshold).toBe(3000000);
    expect(SUPER_RULES.division296UpperThreshold).toBe(10000000);
    expect(SUPER_RULES.division296Rate).toBe(0.15);
    expect(SUPER_RULES.division296UpperAdditionalRate).toBe(0.10);
  });
});

import { describe, it, expect } from 'vitest';
import {
  etfGrowthWithFees,
  cgtAfterDiscount,
  afterTaxSaleValue,
  realReturn,
  nominalVsRealGrowth,
  dcaGrowthWithFees,
  projectLumpSumComparison,
  calculateFrankingCredit,
  calculateMinorDivision6AATax,
  compareMicroPlatformCosts,
  simulateDrpGrowth,
} from './engine';
import { CGT_DISCOUNT_INDIVIDUAL } from '@/data/constants';

describe('etfGrowthWithFees', () => {
  it('computes fee drag for a simple one-year case', () => {
    const res = etfGrowthWithFees(10000, 1, 10, 1);
    expect(res.netReturnRate).toBe(9);
    expect(res.futureValueGross).toBe(11000);
    expect(res.futureValueNet).toBe(10900);
    expect(res.feeDragLoss).toBe(100);
  });

  it('grows the fee drag loss over longer horizons', () => {
    const res = etfGrowthWithFees(10000, 30, 8.5, 0.5);
    expect(res.feeDragLoss).toBeGreaterThan(0);
    expect(res.futureValueNet).toBeLessThan(res.futureValueGross);
  });

  it('handles zero years and zero initial capital', () => {
    expect(etfGrowthWithFees(0, 10, 8.5, 0.5).futureValueNet).toBe(0);
    expect(etfGrowthWithFees(10000, 0, 8.5, 0.5).futureValueNet).toBe(10000);
  });
});

describe('cgtAfterDiscount', () => {
  it('applies the 50% discount and marginal rate', () => {
    expect(cgtAfterDiscount(10000, 0.32)).toBe(1600);
  });

  it('honours a custom discount and clamps rates', () => {
    expect(cgtAfterDiscount(10000, 0.32, 0.25)).toBe(2400);
    expect(cgtAfterDiscount(10000, 0.99)).toBe(2350); // clamped to 47% x 50%
  });

  it('returns zero for a loss or zero gain', () => {
    expect(cgtAfterDiscount(0, 0.32)).toBe(0);
    expect(cgtAfterDiscount(-500, 0.32)).toBe(0);
  });

  it('uses the CGT_DISCOUNT_INDIVIDUAL constant by default', () => {
    expect(CGT_DISCOUNT_INDIVIDUAL).toBe(0.50);
  });
});

describe('afterTaxSaleValue', () => {
  it('computes the after-tax sale value for a one-year holding', () => {
    const res = afterTaxSaleValue(10000, 1, 10, 1, 0.32);
    // FV after MER = $10,900; gain $900; CGT = 900 x 0.32 x 0.5 = $144
    expect(res).toBe(10756);
  });

  it('pays no CGT for zero marginal rate (teen under tax-free threshold)', () => {
    const res = afterTaxSaleValue(10000, 10, 8.5, 0.5, 0);
    const { futureValueNet } = etfGrowthWithFees(10000, 10, 8.5, 0.5);
    expect(res).toBe(futureValueNet);
  });

  it('returns the initial amount for zero years', () => {
    expect(afterTaxSaleValue(5000, 0, 8.5, 0.5, 0.32)).toBe(5000);
  });
});

describe('realReturn & nominalVsRealGrowth', () => {
  it('converts a nominal return to a real return', () => {
    // (1.085 / 1.03) - 1 = 5.34%
    expect(realReturn(8.5, 3)).toBeCloseTo(5.3398, 3);
  });

  it('produces a real value below the nominal value with positive inflation', () => {
    const res = nominalVsRealGrowth(10000, 10, 8.5, 3);
    expect(res.realRatePct).toBeLessThan(res.nominalRatePct);
    expect(res.futureValueReal).toBeLessThan(res.futureValueNominal);
  });

  it('handles zero inflation (real equals nominal)', () => {
    const res = nominalVsRealGrowth(10000, 5, 8, 0);
    expect(res.realRatePct).toBeCloseTo(8, 5);
    expect(res.futureValueReal).toBe(res.futureValueNominal);
  });
});

describe('dcaGrowthWithFees', () => {
  it('calculates 1-year weekly DCA at zero return correctly', () => {
    const res = dcaGrowthWithFees(25, 'weekly', 1, 0, 0, 0);
    expect(res.totalInvested).toBe(1300); // 25 * 52
    expect(res.futureValueGross).toBe(1300);
    expect(res.futureValueNet).toBe(1300);
    expect(res.compoundGrowthNet).toBe(0);
    expect(res.feeDragLoss).toBe(0);
  });

  it('calculates 50-year compound growth for $25/week at 8% return', () => {
    const res = dcaGrowthWithFees(25, 'weekly', 50, 8, 0, 0);
    expect(res.totalInvested).toBe(65000); // 25 * 52 * 50
    expect(res.futureValueNet).toBeGreaterThan(850000);
    expect(res.compoundGrowthNet).toBe(res.futureValueNet - res.totalInvested);
  });

  it('calculates fee drag caused by ongoing MER', () => {
    const res = dcaGrowthWithFees(50, 'monthly', 30, 8.5, 0.5, 0);
    expect(res.feeDragLoss).toBeGreaterThan(0);
    expect(res.futureValueNet).toBeLessThan(res.futureValueGross);
  });

  it('calculates inflation-adjusted real purchasing power', () => {
    const res = dcaGrowthWithFees(50, 'fortnightly', 20, 8, 0.1, 2.5);
    expect(res.futureValueReal).toBeLessThan(res.futureValueNet);
  });

  it('handles zero years safely', () => {
    const res = dcaGrowthWithFees(100, 'monthly', 0, 8, 0.1, 2.5, 5000);
    expect(res.totalInvested).toBe(5000);
    expect(res.futureValueNet).toBe(5000);
    expect(res.compoundGrowthNet).toBe(0);
  });
});

describe('projectLumpSumComparison', () => {
  it('projects $10k over 5, 10, 20, 30 years comparing Cash 4.5%, Balanced 6.5%, High-Growth ETF 9.0%', () => {
    const res = projectLumpSumComparison(10000, 4.5, 6.5, 9.0, [5, 10, 20, 30]);

    expect(res.horizons).toHaveLength(4);

    // 5 Years: Cash 4.5% -> $12,462, Balanced 6.5% -> $13,701, High Growth 9.0% -> $15,386
    const h5 = res.horizons.find(h => h.years === 5)!;
    expect(h5.cashSavings).toBe(12462);
    expect(h5.balancedFund).toBe(13701);
    expect(h5.highGrowthEtf).toBe(15386);
    expect(h5.growthDifference).toBe(15386 - 12462);
    expect(h5.multipleOverCash).toBeCloseTo(1.23, 2);

    // 10 Years: Cash -> $15,530, Balanced -> $18,771, High Growth -> $23,674
    const h10 = res.horizons.find(h => h.years === 10)!;
    expect(h10.cashSavings).toBe(15530);
    expect(h10.balancedFund).toBe(18771);
    expect(h10.highGrowthEtf).toBe(23674);
    expect(h10.multipleOverCash).toBeCloseTo(1.52, 2);

    // 20 Years: Cash -> $24,117, Balanced -> $35,236, High Growth -> $56,044
    const h20 = res.horizons.find(h => h.years === 20)!;
    expect(h20.cashSavings).toBe(24117);
    expect(h20.balancedFund).toBe(35236);
    expect(h20.highGrowthEtf).toBe(56044);
    expect(h20.multipleOverCash).toBeCloseTo(2.32, 2);

    // 30 Years: Cash -> $37,453, Balanced -> $66,144, High Growth -> $132,677
    const h30 = res.horizons.find(h => h.years === 30)!;
    expect(h30.cashSavings).toBe(37453);
    expect(h30.balancedFund).toBe(66144);
    expect(h30.highGrowthEtf).toBe(132677);
    expect(h30.growthDifference).toBe(95224); // +$95,224 gain!
    expect(h30.multipleOverCash).toBeCloseTo(3.54, 2); // 3.54x cash savings!
  });

  it('calculates the Rule of 72 doubling times accurately', () => {
    const res = projectLumpSumComparison(10000, 4.5, 6.5, 9.0);
    expect(res.ruleOf72.cashYears).toBe(16.0); // 72 / 4.5 = 16
    expect(res.ruleOf72.balancedYears).toBe(11.1); // 72 / 6.5 = 11.08 -> 11.1
    expect(res.ruleOf72.highGrowthYears).toBe(8.0); // 72 / 9.0 = 8.0
  });

  it('generates a 31-point yearly progression series from year 0 to 30', () => {
    const res = projectLumpSumComparison(10000, 4.5, 6.5, 9.0);
    expect(res.yearly).toHaveLength(31);
    expect(res.yearly[0]).toEqual({
      year: 0,
      cashSavings: 10000,
      balancedFund: 10000,
      highGrowthEtf: 10000,
    });
    expect(res.yearly[30].cashSavings).toBe(37453);
    expect(res.yearly[30].highGrowthEtf).toBe(132677);
  });

  it('handles zero or negative initial capital gracefully', () => {
    const res = projectLumpSumComparison(0, 4.5, 6.5, 9.0);
    expect(res.horizons[0].cashSavings).toBe(0);
    expect(res.horizons[0].highGrowthEtf).toBe(0);
    expect(res.horizons[0].multipleOverCash).toBe(0);
  });
});

describe('calculateFrankingCredit & Division 67 ATO Cash Refunds', () => {
  it('calculates 100% cash refund for taxpayers in the 0% marginal tax bracket', () => {
    // $700 cash dividend fully franked at 30% company tax rate
    const res = calculateFrankingCredit(700, 100, 30, 0);

    expect(res.frankingCredit).toBe(300); // 700 * (30/70) = 300
    expect(res.grossDividend).toBe(1000);
    expect(res.taxOnGrossDividend).toBe(0);
    expect(res.taxPayableOrRefund).toBe(-300); // negative = refund
    expect(res.cashRefund).toBe(300);
    expect(res.taxPayable).toBe(0);
    expect(res.netCashInPocket).toBe(1000); // $700 cash dividend + $300 ATO refund!
    expect(res.effectiveYieldMultiplier).toBeCloseTo(1.4286, 3); // 42.86% cash boost
  });

  it('calculates zero top-up tax for median bracket matching company tax (30%)', () => {
    const res = calculateFrankingCredit(700, 100, 30, 30);

    expect(res.frankingCredit).toBe(300);
    expect(res.grossDividend).toBe(1000);
    expect(res.taxOnGrossDividend).toBe(300);
    expect(res.taxPayableOrRefund).toBe(0);
    expect(res.cashRefund).toBe(0);
    expect(res.taxPayable).toBe(0);
    expect(res.netCashInPocket).toBe(700);
    expect(res.effectiveYieldMultiplier).toBe(1);
  });

  it('calculates top-up tax payable for top marginal tax bracket (47%)', () => {
    const res = calculateFrankingCredit(700, 100, 30, 47);

    expect(res.frankingCredit).toBe(300);
    expect(res.grossDividend).toBe(1000);
    expect(res.taxOnGrossDividend).toBe(470);
    expect(res.taxPayableOrRefund).toBe(170); // top-up tax payable
    expect(res.cashRefund).toBe(0);
    expect(res.taxPayable).toBe(170);
    expect(res.netCashInPocket).toBe(530); // 700 - 170
  });

  it('handles partially franked dividends (e.g. 70% franked)', () => {
    const res = calculateFrankingCredit(700, 70, 30, 0);
    expect(res.frankingCredit).toBe(210); // 300 * 0.70
    expect(res.grossDividend).toBe(910);
    expect(res.cashRefund).toBe(210);
  });

  it('handles zero dividend or zero franking percentage', () => {
    const res = calculateFrankingCredit(0, 100, 30, 0);
    expect(res.frankingCredit).toBe(0);
    expect(res.netCashInPocket).toBe(0);

    const unfranked = calculateFrankingCredit(500, 0, 30, 0);
    expect(unfranked.frankingCredit).toBe(0);
    expect(unfranked.cashRefund).toBe(0);
    expect(unfranked.netCashInPocket).toBe(500);
  });
});

describe('calculateMinorDivision6AATax', () => {
  it('applies 0% tax when unearned income is under the $416 threshold', () => {
    const res = calculateMinorDivision6AATax(350, 150);
    expect(res.isPenaltyBracket).toBe(false);
    expect(res.taxPayable).toBe(0);
    expect(res.excessFrankingRefund).toBe(150); // full franking credit refunded
  });

  it('triggers the 66% shade-in penalty between $417 and $1,307', () => {
    // $1,000 unearned income: ($1,000 - $416) * 66% = $584 * 0.66 = $385.44
    const res = calculateMinorDivision6AATax(1000, 100);
    expect(res.isPenaltyBracket).toBe(true);
    expect(res.taxPayable).toBeCloseTo(285.44, 2); // $385.44 tax - $100 franking credit offset
  });

  it('triggers the top 47% rate on income exceeding $1,307', () => {
    // $2,000 unearned income: $2,000 * 47% = $940 tax
    const res = calculateMinorDivision6AATax(2000, 300);
    expect(res.isPenaltyBracket).toBe(true);
    expect(res.taxPayable).toBe(640); // 940 - 300
  });
});

describe('compareMicroPlatformCosts & The Flat Fee Trap', () => {
  it('identifies $0 fee structures on Betashares Direct and CMC Invest', () => {
    const res = compareMicroPlatformCosts(500, 12, 100);

    const betashares = res.find(p => p.platformId === 'betashares-direct')!;
    expect(betashares.annualFeeTotal).toBe(0);
    expect(betashares.annualFeeDragPct).toBe(0);
    expect(betashares.holdingModel).toBe('Custodial');
    expect(betashares.supportsMinorBareTrust).toBe(true);

    const cmc = res.find(p => p.platformId === 'cmc-invest')!;
    expect(cmc.annualFeeTotal).toBe(0);
    expect(cmc.annualFeeDragPct).toBe(0);
    expect(cmc.holdingModel).toBe('CHESS');
    expect(cmc.supportsMinorBareTrust).toBe(true);
  });

  it('exposes the devastating fee drag of monthly flat fees on small balances ($300)', () => {
    const res = compareMicroPlatformCosts(300, 12, 100);

    const raiz = res.find(p => p.platformId === 'raiz-standard')!;
    // $4.50/mo * 12 = $54/yr on a $300 balance = 18.0% annual fee drag!
    expect(raiz.annualFeeTotal).toBe(54);
    expect(raiz.annualFeeDragPct).toBe(18.0);

    const spaceship = res.find(p => p.platformId === 'spaceship-voyager')!;
    // $3/mo * 12 = $36 + 0.25% of $300 = $36.75 -> 12.25% fee drag!
    expect(spaceship.annualFeeTotal).toBeGreaterThan(36);
    expect(spaceship.annualFeeDragPct).toBeGreaterThan(12);
  });

  it('compares CommSec Pocket and Stake ASX per-trade models', () => {
    const res = compareMicroPlatformCosts(2000, 12, 100);

    const pocket = res.find(p => p.platformId === 'commsec-pocket')!;
    expect(pocket.annualFeeTotal).toBe(24); // 12 * $2
    expect(pocket.holdingModel).toBe('CHESS');

    const stake = res.find(p => p.platformId === 'stake-asx')!;
    expect(stake.annualFeeTotal).toBe(36); // 12 * $3
    expect(stake.holdingModel).toBe('CHESS');
  });
});

describe('simulateDrpGrowth & CGT Parcel Tracking', () => {
  it('demonstrates compounding acceleration and cost base accumulation over 10 years', () => {
    // $10,000 initial, 10 years, 5% capital growth, 4% dividend yield (9% total), quarterly payouts
    const res = simulateDrpGrowth(10000, 10, 5.0, 4.0, 70, 4);

    expect(res.years).toBe(10);
    expect(res.initialInvestment).toBe(10000);
    expect(res.estimatedParcelsAcquired).toBe(40); // 10 years * 4 quarters
    expect(res.finalValueWithDrp).toBeGreaterThan(res.finalValueWithoutDrp);
    expect(res.drpAdvantage).toBeGreaterThan(0);
    expect(res.totalDividendsReinvested).toBeGreaterThan(0);
    expect(res.accumulatedCostBase).toBe(10000 + res.totalDividendsReinvested);
    expect(res.totalFrankingCreditsReceived).toBeGreaterThan(0);
  });

  it('handles zero years gracefully', () => {
    const res = simulateDrpGrowth(10000, 0, 5, 4);
    expect(res.finalValueWithDrp).toBe(10000);
    expect(res.drpAdvantage).toBe(0);
    expect(res.estimatedParcelsAcquired).toBe(0);
  });
});

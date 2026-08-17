import { describe, it, expect } from 'vitest';
import { calculateCGT, cgtOnDisposal, carryForwardLosses } from './engine';

describe('Capital Gains Tax & 6-Year Exemption Engine', () => {
  it('correctly applies 50% CGT discount for assets held over 12 months', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 10000,
      salePrice: 20000,
      ownershipMonths: 24,
      costBaseElements: {
        purchasePrice: 10000,
        incidentalAcquisitionCosts: 50,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 50,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 90000,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
    });

    expect(res.discountEligible).toBe(true);
    expect(res.grossCapitalGain).toBe(9900);
    expect(res.netTaxableCapitalGain).toBe(4950);
  });

  it('correctly applies s 102-5 loss offsetting BEFORE 50% discount', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 20000,
      salePrice: 40000,
      ownershipMonths: 18,
      costBaseElements: {
        purchasePrice: 20000,
        incidentalAcquisitionCosts: 0,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 0,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 6000,
      priorYearCarriedForwardLosses: 4000,
      regularTaxableIncome: 100000,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
    });

    // Gross gain = 20,000. Total losses = 10,000. Gain after losses = 10,000.
    // 50% discount on 10,000 = 5,000 taxable gain.
    expect(res.lossesOffsetApplied).toBe(10000);
    expect(res.netGainBeforeDiscount).toBe(10000);
    expect(res.netTaxableCapitalGain).toBe(5000);
  });

  it('correctly applies Section 118-145 6-Year Absence Rule for former main residence', () => {
    const res = calculateCGT({
      assetType: 'property',
      purchasePrice: 600000,
      salePrice: 900000,
      ownershipMonths: 60,
      costBaseElements: {
        purchasePrice: 600000,
        incidentalAcquisitionCosts: 25000,
        capitalImprovementsRenovations: 15000,
        titleAndSellingCosts: 20000,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 110000,
      isMainResidence: true,
      wasRentedOut: true,
      rentedMonths: 48, // 4 years rented out <= 6 years (72 months)
      electedSixYearExemption: true,
    });

    expect(res.isFullyExemptUnderSixYearRule).toBe(true);
    expect(res.grossCapitalGain).toBe(0);
    expect(res.cgtTaxPayable).toBe(0);
  });
});

describe('cgtOnDisposal — workflow model', () => {
  it('known answer: rented >6yrs, gain 90k, losses 50k, discount → 20k taxable', () => {
    const res = cgtOnDisposal(
      500000,
      900000,
      {
        buyCosts: 0,
        sellCosts: 0,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 120000,
        monthsRented: 96,
        totalMonthsOwned: 96,
      },
      { currentYearLosses: 30000, carriedForwardLosses: 20000 },
    );
    // cost base 500k → gain 400k; apportionment (96−72)/96 = 0.25 → 100k taxable
    expect(res.grossCapitalGain).toBe(400000);
    expect(res.taxableCapitalGain).toBe(100000);
    expect(res.currentYearLossesApplied).toBe(30000);
    expect(res.carriedForwardLossesApplied).toBe(20000);
    expect(res.gainAfterLosses).toBe(50000);
    expect(res.discountEligible).toBe(true);
    expect(res.netTaxableCapitalGain).toBe(25000);
    expect(res.isMainResidenceFullyExempt).toBe(false);
  });

  it('100% exempt under 6-year rule when rented ≤ 72 months', () => {
    const res = cgtOnDisposal(
      500000,
      800000,
      {
        buyCosts: 20000,
        sellCosts: 15000,
        capitalWorksClaimed: 5000,
        incomeProducedWhileRented: 120000,
        monthsRented: 48,
        totalMonthsOwned: 96,
      },
    );
    expect(res.isMainResidenceFullyExempt).toBe(true);
    expect(res.taxableCapitalGain).toBe(0);
    expect(res.netTaxableCapitalGain).toBe(0);
    expect(res.atoReferences.some(r => r.includes('118-145'))).toBe(true);
  });

  it('partial exemption formula (rented − 72)/total when rented > 6 years', () => {
    const res = cgtOnDisposal(
      500000,
      900000,
      {
        buyCosts: 20000,
        sellCosts: 20000,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 200000,
        monthsRented: 120,
        totalMonthsOwned: 240,
      },
    );
    // apportionment = (120 − 72) / 240 = 0.20
    expect(res.isMainResidenceFullyExempt).toBe(false);
    expect(res.taxableApportionmentPercentage).toBe(20);
    // gain = 900000 − 540000 = 360000; taxable = 72000; 50% discount → 36000
    expect(res.taxableCapitalGain).toBe(72000);
    expect(res.netTaxableCapitalGain).toBe(36000);
  });

  it('Div 43 capital works clawback reduces the cost base', () => {
    const res = cgtOnDisposal(
      400000,
      600000,
      {
        buyCosts: 10000,
        sellCosts: 10000,
        capitalWorksClaimed: 20000,
        incomeProducedWhileRented: 50000,
        monthsRented: 36,
        totalMonthsOwned: 60,
      },
    );
    // cost base = 400000 + 10000 + 10000 − 20000 = 400000 → gain = 200000
    expect(res.adjustedCostBase).toBe(400000);
    expect(res.grossCapitalGain).toBe(200000);
    expect(res.capitalWorksClawbackApplied).toBe(20000);
  });

  it('losses applied before discount, carried-forward losses remain available', () => {
    const res = cgtOnDisposal(
      100000,
      300000,
      {
        buyCosts: 0,
        sellCosts: 0,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 50000,
        monthsRented: 84,
        totalMonthsOwned: 84,
      },
      { currentYearLosses: 20000, carriedForwardLosses: 150000 },
    );
    // gain 200k; apportionment (84−72)/84 = 0.142857 → 28,571 taxable
    expect(res.currentYearLossesApplied).toBe(20000);
    expect(res.carriedForwardLossesApplied).toBe(8571);
    expect(res.remainingCarriedForwardLosses).toBe(141429);
    expect(res.netTaxableCapitalGain).toBe(0);
  });

  it('discount always eligible once taxable (rented >72 months implies >12 owned)', () => {
    const res = cgtOnDisposal(
      100000,
      200000,
      {
        buyCosts: 0,
        sellCosts: 0,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 100000,
        monthsRented: 96,
        totalMonthsOwned: 96,
      },
    );
    expect(res.discountEligible).toBe(true);
    expect(res.cgtDiscountAmount).toBe(12500);
    expect(res.netTaxableCapitalGain).toBe(12500);
  });

  it('edge: sale below cost base → zero gain', () => {
    const res = cgtOnDisposal(
      500000,
      450000,
      {
        buyCosts: 5000,
        sellCosts: 5000,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 50000,
        monthsRented: 120,
        totalMonthsOwned: 120,
      },
    );
    expect(res.grossCapitalGain).toBe(0);
    expect(res.netTaxableCapitalGain).toBe(0);
  });

  it('atoReferences include loss-ordering and discount sections when applied', () => {
    const res = cgtOnDisposal(
      100000,
      300000,
      {
        buyCosts: 0,
        sellCosts: 0,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 50000,
        monthsRented: 96,
        totalMonthsOwned: 96,
      },
      { currentYearLosses: 10000 },
    );
    expect(res.atoReferences.some(r => r.includes('102-5'))).toBe(true);
    expect(res.atoReferences.some(r => r.includes('Division 115'))).toBe(true);
  });
});

describe('carryForwardLosses', () => {
  it('net gain after current-year losses and carried-forward losses', () => {
    const res = carryForwardLosses(100000, 20000, 30000);
    expect(res.netGainAfterLosses).toBe(50000);
    expect(res.remainingCarriedForwardLosses).toBe(0);
    expect(res.hasNetCapitalGain).toBe(true);
  });

  it('unused carried-forward losses stay available', () => {
    const res = carryForwardLosses(50000, 0, 80000);
    expect(res.netGainAfterLosses).toBe(0);
    expect(res.remainingCarriedForwardLosses).toBe(30000);
    expect(res.hasNetCapitalGain).toBe(false);
  });

  it('current-year net loss carried forward when losses exceed gains', () => {
    const res = carryForwardLosses(10000, 40000, 0);
    expect(res.netGainAfterLosses).toBe(0);
    expect(res.netCapitalLossCarriedForward).toBe(30000);
    expect(res.hasNetCapitalGain).toBe(false);
  });

  it('edge: all zeros', () => {
    const res = carryForwardLosses(0, 0, 0);
    expect(res.netGainAfterLosses).toBe(0);
    expect(res.hasNetCapitalGain).toBe(false);
  });

  it('edge: carried-forward losses preserved when year is a net loss', () => {
    const res = carryForwardLosses(5000, 15000, 20000);
    expect(res.netCapitalLossCarriedForward).toBe(10000);
    expect(res.remainingCarriedForwardLosses).toBe(20000);
  });
});

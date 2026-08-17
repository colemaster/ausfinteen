import { describe, it, expect } from 'vitest';
import { calculateCGT } from './engine';

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

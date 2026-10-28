import { describe, it, expect } from 'vitest';
import { calculateCGT, cgtOnDisposal, carryForwardLosses, calcDivision6AATax } from './engine';

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

describe('Division 6AA Minor (Under 18) Capital Gains & Unearned Income Rules', () => {
  it('applies nil tax for unearned gains at or below the $416 threshold', () => {
    const res = calcDivision6AATax(400);
    expect(res.tax).toBe(0);
    expect(res.medicareLevy).toBe(0);
    expect(res.totalTax).toBe(0);
    expect(res.effectiveRate).toBe(0);
    expect(res.bracketDescription).toContain('within $416');
  });

  it('applies 66% shade-in rate for unearned gains between $417 and $1,307', () => {
    // $1,000 unearned income: (1000 - 416) * 0.66 = 584 * 0.66 = 385.44 base tax
    // Medicare: 1000 * 0.02 = 20. Total = 405.44 -> 405
    const res = calcDivision6AATax(1000);
    expect(res.tax).toBe(385);
    expect(res.medicareLevy).toBe(20);
    expect(res.totalTax).toBe(405);
    expect(res.effectiveRate).toBe(40.5);
    expect(res.bracketDescription).toContain('66% shade-in');
  });

  it('applies top marginal rate (45% + 2% Medicare = 47%) for unearned gains exceeding $1,307', () => {
    // $10,000 unearned capital gain: 10000 * 0.45 = 4500 tax + 200 Medicare = 4700 total (47%)
    const res = calcDivision6AATax(10000);
    expect(res.tax).toBe(4500);
    expect(res.medicareLevy).toBe(200);
    expect(res.totalTax).toBe(4700);
    expect(res.effectiveRate).toBe(47);
  });

  it('correctly applies Division 6AA penalty tax to gifted / trust capital gains for minors', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 10000,
      salePrice: 30000,
      ownershipMonths: 18,
      costBaseElements: {
        purchasePrice: 10000,
        incidentalAcquisitionCosts: 50,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 50,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 0,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
      taxpayerEntity: 'minor_unearned', // Gifted or trust distribution
    });

    // Gross gain = 30000 - 10100 = 19900
    // 50% discount applies under Div 115 -> Net taxable gain = 9950
    // Net taxable gain > 1307 -> 45% base tax ($4,478) + 2% Medicare ($199) = $4,677
    expect(res.discountEligible).toBe(true);
    expect(res.grossCapitalGain).toBe(19900);
    expect(res.netTaxableCapitalGain).toBe(9950);
    expect(res.isDivision6AAApplied).toBe(true);
    expect(res.cgtTaxPayable).toBe(4677); // ~47% of 9950
    expect(res.marginalRateApplied).toBe(47);
  });

  it('distinguishes personal exertion savings (excepted income) from gifted assets for minors', () => {
    // Minor invested their own job wages (personal exertion)
    const resExcepted = calculateCGT({
      assetType: 'shares',
      purchasePrice: 10000,
      salePrice: 30000,
      ownershipMonths: 18,
      costBaseElements: {
        purchasePrice: 10000,
        incidentalAcquisitionCosts: 50,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 50,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 0,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
      taxpayerEntity: 'minor_excepted', // Own job earnings (s 102AE(2))
    });

    // Net taxable gain = 9950. Taxable income = 9950 <= $18,200 adult tax-free threshold!
    // Resulting CGT payable = $0!
    expect(resExcepted.isDivision6AAApplied).toBe(false);
    expect(resExcepted.netTaxableCapitalGain).toBe(9950);
    expect(resExcepted.cgtTaxPayable).toBe(0); // Saves $4,677 compared to minor_unearned!
  });
});

describe('Cost Base Calculation: 5 Elements and Holding Costs', () => {
  it('incorporates Element 3 holding costs to reduce gross capital gain', () => {
    const res = calculateCGT({
      assetType: 'property',
      purchasePrice: 300000,
      salePrice: 420000,
      ownershipMonths: 36,
      costBaseElements: {
        purchasePrice: 300000,
        incidentalAcquisitionCosts: 15000, // Element 2: stamp duty & conveyancing
        holdingCosts: 25000,               // Element 3: non-deductible rates, land tax, loan interest (s 110-25(4))
        capitalImprovementsRenovations: 20000, // Element 4: renovations
        titleAndSellingCosts: 10000,       // Element 5: selling fees
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 100000,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
    });

    // Cost base = 300k + 15k + 25k + 20k + 10k = 370k
    // Gross gain = 420k - 370k = 50k
    // 50% discount = 25k net taxable gain
    expect(res.adjustedCostBase).toBe(370000);
    expect(res.holdingCostsApplied).toBe(25000);
    expect(res.grossCapitalGain).toBe(50000);
    expect(res.netTaxableCapitalGain).toBe(25000);
  });

  it('holding costs cannot create or increase a capital loss (s 110-55(4))', () => {
    const res = calculateCGT({
      assetType: 'property',
      purchasePrice: 300000,
      salePrice: 310000,
      ownershipMonths: 24,
      costBaseElements: {
        purchasePrice: 300000,
        incidentalAcquisitionCosts: 5000,
        holdingCosts: 20000, // With holding costs: 325k. Without holding costs (reduced cost base): 305k
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 0,
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

    // Sale price (310k) is below cost base with holding (325k) but above reduced cost base (305k)
    // Gross gain is clamped to 0; holding costs cannot create a capital loss!
    expect(res.grossCapitalGain).toBe(0);
    expect(res.netTaxableCapitalGain).toBe(0);
    expect(res.reducedCostBase).toBe(305000);
  });

  it('cgtOnDisposal workflow model reflects Element 3 holding costs in ATO references', () => {
    const res = cgtOnDisposal(
      400000,
      600000,
      {
        buyCosts: 20000,
        sellCosts: 15000,
        holdingCosts: 30000,
        capitalWorksClaimed: 0,
        incomeProducedWhileRented: 0,
        monthsRented: 0,
        totalMonthsOwned: 36,
      },
    );

    // Adjusted cost base = 400k + 20k + 15k + 30k = 465k
    // Gross gain = 600k - 465k = 135k
    expect(res.adjustedCostBase).toBe(465000);
    expect(res.holdingCostsApplied).toBe(30000);
    expect(res.grossCapitalGain).toBe(135000);
    expect(res.atoReferences.some(r => r.includes('110-25(4)'))).toBe(true);
  });
});

describe('Entity Specific CGT Rules: Super Funds, Companies & Non-Residents', () => {
  it('applies 33.33% discount and flat 15% rate for complying superannuation funds', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 50000,
      salePrice: 110000,
      ownershipMonths: 24,
      costBaseElements: {
        purchasePrice: 50000,
        incidentalAcquisitionCosts: 0,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 0,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 0,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
      taxpayerEntity: 'super_fund',
    });

    // Gross gain = 60000
    // 33.33% discount (1/3) = 20000 discount -> Net taxable gain = 40000 (2/3)
    // Complying super rate = 15% flat -> 40000 * 0.15 = 6000 tax (effective rate 10% on gross gain)
    expect(res.discountPercentage).toBe(33);
    expect(res.cgtDiscount50PercentAmount).toBe(20000);
    expect(res.netTaxableCapitalGain).toBe(40000);
    expect(res.cgtTaxPayable).toBe(6000);
    expect(res.effectiveCGTRateOnGrossGain).toBe(10);
  });

  it('companies are NOT eligible for CGT discount (0% discount, 25% tax)', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 50000,
      salePrice: 110000,
      ownershipMonths: 24,
      costBaseElements: {
        purchasePrice: 50000,
        incidentalAcquisitionCosts: 0,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 0,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 0,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
      taxpayerEntity: 'company',
    });

    expect(res.discountEligible).toBe(false);
    expect(res.discountPercentage).toBe(0);
    expect(res.cgtDiscount50PercentAmount).toBe(0);
    expect(res.netTaxableCapitalGain).toBe(60000);
    expect(res.cgtTaxPayable).toBe(15000); // 25% of 60000
  });

  it('foreign tax residents are ineligible for the 50% CGT discount', () => {
    const res = calculateCGT({
      assetType: 'shares',
      purchasePrice: 50000,
      salePrice: 110000,
      ownershipMonths: 24,
      costBaseElements: {
        purchasePrice: 50000,
        incidentalAcquisitionCosts: 0,
        capitalImprovementsRenovations: 0,
        titleAndSellingCosts: 0,
        division43CapitalWorksClaimed: 0,
      },
      currentYearCapitalLosses: 0,
      priorYearCarriedForwardLosses: 0,
      regularTaxableIncome: 0,
      isMainResidence: false,
      wasRentedOut: false,
      rentedMonths: 0,
      electedSixYearExemption: false,
      isAustralianTaxResident: false,
    });

    expect(res.discountEligible).toBe(false);
    expect(res.netTaxableCapitalGain).toBe(60000);
  });
});

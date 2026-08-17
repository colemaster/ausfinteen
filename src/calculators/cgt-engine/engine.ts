/**
 * Australian Capital Gains Tax (CGT) & 6-Year Main Residence Engine
 * Implements Division 115 50% discount, Section 102-5 loss ordering,
 * Section 118-145 6-year rule, Section 118-192 market value reset, and Division 43 clawback.
 */

import { calcIncomeTax, calcMedicareLevy, getCombinedMarginalRate } from '../../data/tax-brackets';

export interface CGTCostBaseElements {
  purchasePrice: number;              // Element 1: Acquisition price
  incidentalAcquisitionCosts: number; // Element 2: Stamp duty, conveyancing, inspection
  capitalImprovementsRenovations: number; // Element 4: Substantial improvements
  titleAndSellingCosts: number;       // Element 5: Agent commission, marketing, legal fees
  division43CapitalWorksClaimed: number; // Div 43 depreciation claimed (clawback from cost base)
}

export interface CGTPropertyParams {
  assetType: 'property' | 'shares' | 'crypto' | 'other';
  purchasePrice: number;
  salePrice: number;
  ownershipMonths: number;
  costBaseElements: CGTCostBaseElements;
  currentYearCapitalLosses: number;
  priorYearCarriedForwardLosses: number;
  regularTaxableIncome: number;
  // 6-Year Rule & Main Residence Specifics
  isMainResidence: boolean;
  wasRentedOut: boolean;
  rentedMonths: number;
  marketValueWhenFirstRented?: number;
  electedSixYearExemption: boolean;
}

export interface CGTResult {
  grossCapitalGain: number;
  adjustedCostBase: number;
  netGainBeforeDiscount: number;
  lossesOffsetApplied: number;
  remainingCarriedForwardLosses: number;
  discountEligible: boolean;
  cgtDiscount50PercentAmount: number;
  netTaxableCapitalGain: number;
  taxWithoutCapitalGain: number;
  taxWithCapitalGain: number;
  cgtTaxPayable: number;
  effectiveCGTRateOnGrossGain: number;
  marginalRateApplied: number;
  // 6-Year Rule Details
  isFullyExemptUnderSixYearRule: boolean;
  taxableApportionmentPercentage: number;
}

/**
 * Calculate Australian Capital Gains Tax according to ATO ITAA 1997 statutory rules.
 */
export function calculateCGT(params: CGTPropertyParams): CGTResult {
  const {
    purchasePrice,
    salePrice,
    ownershipMonths,
    costBaseElements,
    currentYearCapitalLosses,
    priorYearCarriedForwardLosses,
    regularTaxableIncome,
    isMainResidence,
    wasRentedOut,
    rentedMonths,
    marketValueWhenFirstRented,
    electedSixYearExemption,
  } = params;

  // 1. Determine Effective Starting Cost Base (s 118-192 Market Value Reset check)
  let effectiveAcquisitionPrice = purchasePrice;
  if (isMainResidence && wasRentedOut && marketValueWhenFirstRented && marketValueWhenFirstRented > 0) {
    effectiveAcquisitionPrice = marketValueWhenFirstRented;
  }

  // 2. Compute Adjusted Cost Base with Div 43 Clawback (s 110-45)
  const adjustedCostBase =
    effectiveAcquisitionPrice +
    costBaseElements.incidentalAcquisitionCosts +
    costBaseElements.capitalImprovementsRenovations +
    costBaseElements.titleAndSellingCosts -
    costBaseElements.division43CapitalWorksClaimed;

  // 3. Gross Gain Calculation
  const unadjustedGain = Math.max(0, salePrice - adjustedCostBase);

  // 4. Section 118-145 6-Year Absence Rule Apportionment
  let isFullyExempt = false;
  let taxableApportionment = 1.0;

  if (isMainResidence) {
    if (!wasRentedOut) {
      isFullyExempt = true;
      taxableApportionment = 0;
    } else if (electedSixYearExemption && rentedMonths <= 72) {
      // 72 months = 6 years full exemption
      isFullyExempt = true;
      taxableApportionment = 0;
    } else if (electedSixYearExemption && rentedMonths > 72) {
      // Excess beyond 6 years is taxable
      const excessMonths = rentedMonths - 72;
      taxableApportionment = excessMonths / Math.max(1, ownershipMonths);
    } else if (!electedSixYearExemption) {
      taxableApportionment = rentedMonths / Math.max(1, ownershipMonths);
    }
  }

  const grossCapitalGain = isFullyExempt ? 0 : unadjustedGain * taxableApportionment;

  // 5. Section 102-5 Loss Ordering Rule
  // Losses MUST be offset against gross gains BEFORE applying the 50% discount
  const totalAvailableLosses = currentYearCapitalLosses + priorYearCarriedForwardLosses;
  const lossesOffsetApplied = Math.min(grossCapitalGain, totalAvailableLosses);
  const gainAfterLosses = Math.max(0, grossCapitalGain - lossesOffsetApplied);
  const remainingCarriedForwardLosses = totalAvailableLosses - lossesOffsetApplied;

  // 6. Division 115 50% CGT Discount (held > 12 months = > 365 days / 12 months)
  const discountEligible = ownershipMonths >= 12 && gainAfterLosses > 0;
  const cgtDiscount50PercentAmount = discountEligible ? gainAfterLosses * 0.5 : 0;
  const netTaxableCapitalGain = discountEligible ? gainAfterLosses * 0.5 : gainAfterLosses;

  // 7. Income Tax & Medicare Impact
  const baseTax = calcIncomeTax(regularTaxableIncome) + calcMedicareLevy(regularTaxableIncome);
  const totalTaxableWithGain = regularTaxableIncome + netTaxableCapitalGain;
  const totalTax = calcIncomeTax(totalTaxableWithGain) + calcMedicareLevy(totalTaxableWithGain);
  const cgtTaxPayable = Math.max(0, totalTax - baseTax);

  const effectiveCGTRateOnGrossGain = grossCapitalGain > 0 ? cgtTaxPayable / grossCapitalGain : 0;
  const marginalRateApplied = getCombinedMarginalRate(regularTaxableIncome);

  return {
    grossCapitalGain: Math.round(grossCapitalGain),
    adjustedCostBase: Math.round(adjustedCostBase),
    netGainBeforeDiscount: Math.round(gainAfterLosses),
    lossesOffsetApplied: Math.round(lossesOffsetApplied),
    remainingCarriedForwardLosses: Math.round(remainingCarriedForwardLosses),
    discountEligible,
    cgtDiscount50PercentAmount: Math.round(cgtDiscount50PercentAmount),
    netTaxableCapitalGain: Math.round(netTaxableCapitalGain),
    taxWithoutCapitalGain: Math.round(baseTax),
    taxWithCapitalGain: Math.round(totalTax),
    cgtTaxPayable: Math.round(cgtTaxPayable),
    effectiveCGTRateOnGrossGain: Math.round(effectiveCGTRateOnGrossGain * 1000) / 10,
    marginalRateApplied: Math.round(marginalRateApplied * 1000) / 10,
    isFullyExemptUnderSixYearRule: isFullyExempt,
    taxableApportionmentPercentage: Math.round(taxableApportionment * 1000) / 10,
  };
}

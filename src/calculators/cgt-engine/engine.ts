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

// ─── CGT on Disposal (workflow model) ─────────────────────────────────────────

export interface CGTDisposalCosts {
  buyCosts: number;                   // stamp duty, conveyancing, inspection
  sellCosts: number;                  // agent commission, marketing, legal
  capitalWorksClaimed: number;        // Div 43 depreciation claimed (clawback)
  incomeProducedWhileRented: number;  // rent received over the period; > 0 ⇒ rented out
  monthsRented: number;
  totalMonthsOwned: number;
}

export interface CGTDisposalLosses {
  currentYearLosses?: number;
  carriedForwardLosses?: number;
}

export interface CGTDisposalResult {
  grossProceeds: number;
  adjustedCostBase: number;
  capitalWorksClawbackApplied: number;
  grossCapitalGain: number;
  isMainResidenceFullyExempt: boolean;
  taxableApportionmentPercentage: number;
  taxableCapitalGain: number;
  currentYearLossesApplied: number;
  carriedForwardLossesApplied: number;
  remainingCarriedForwardLosses: number;
  gainAfterLosses: number;
  discountEligible: boolean;
  cgtDiscountAmount: number;
  netTaxableCapitalGain: number;
  atoReferences: string[];
}

/** Number of months in the 6-year main-residence absence rule (s 118-145). */
export const SIX_YEAR_RULE_MONTHS = 72;

/**
 * CGT on disposal of a property (workflow model: buy → improve → rent → sell).
 * Implements:
 * - Section 118-145 6-year main-residence absence rule — 100% exempt while the
 *   rented period stays within 6 years (72 months); partial exemption
 *   (rentedMonths − 72) / totalMonthsOwned beyond that
 * - Division 43 (s 110-45) capital-works clawback from the cost base
 * - Section 102-5 capital-loss ordering — losses offset gains BEFORE the
 *   Division 115 50% discount
 * - Division 115 50% CGT discount for assets held ≥ 12 months
 *
 * @param acquired - Original purchase price (AUD)
 * @param disposed - Disposal / sale price (AUD)
 * @param costs - Cost-base and occupancy details
 * @param losses - Optional capital losses (current year + carried forward)
 * @returns CGTDisposalResult with ATO section references for the output notes
 *
 * Assumptions:
 * - Property was the owner's main residence before first being rented out
 * - No second main residence nominated during the absence
 * - Partial exemption formula (rented − 72) / totalMonths, clamped to [0, 1]
 */
export function cgtOnDisposal(
  acquired: number,
  disposed: number,
  costs: CGTDisposalCosts,
  losses: CGTDisposalLosses = {},
): CGTDisposalResult {
  const {
    buyCosts,
    sellCosts,
    capitalWorksClaimed,
    incomeProducedWhileRented,
    monthsRented,
    totalMonthsOwned,
  } = costs;

  const atoReferences: string[] = [];

  // Div 43 clawback (s 110-45): capital works claimed reduces the cost base
  const clawback = Math.max(0, capitalWorksClaimed);
  const adjustedCostBase = acquired + buyCosts + sellCosts - clawback;
  if (clawback > 0) {
    atoReferences.push('Division 43 (ITAA 1997 s 110-45): capital-works deductions claimed are subtracted from the cost base');
  }

  const grossCapitalGain = Math.max(0, disposed - adjustedCostBase);

  // Section 118-145 6-year rule
  const rentedOut = incomeProducedWhileRented > 0;
  const sixYearExempt = rentedOut && monthsRented <= SIX_YEAR_RULE_MONTHS;
  let isFullyExempt = !rentedOut || sixYearExempt;
  let apportionment = 1;

  if (rentedOut && monthsRented > SIX_YEAR_RULE_MONTHS) {
    isFullyExempt = false;
    apportionment = Math.min(
      1,
      Math.max(0, (monthsRented - SIX_YEAR_RULE_MONTHS) / Math.max(1, totalMonthsOwned)),
    );
    atoReferences.push(
      'Section 118-145 (ITAA 1997): 6-year absence rule exceeded — partial exemption of ' +
        `${(apportionment * 100).toFixed(1)}% of the gain is taxable ((${monthsRented} − 72) / ${totalMonthsOwned} months)`,
    );
  } else if (rentedOut) {
    atoReferences.push(
      'Section 118-145 (ITAA 1997): rented within the 6-year (72 month) absence period — 100% main-residence exemption applies',
    );
  }

  if (grossCapitalGain <= 0 && atoReferences.length === 0) {
    atoReferences.push('No capital gain — disposal at or below the adjusted cost base');
  }
  if (grossCapitalGain > 0 && !rentedOut && atoReferences.length === 0) {
    atoReferences.push(
      'Non-main-residence asset — full capital gain taxable, no residence exemption applies',
    );
  }

  const taxableCapitalGain = isFullyExempt ? 0 : grossCapitalGain * apportionment;

  // Section 102-5 loss ordering: losses BEFORE the 50% discount
  const currentYearLossesApplied = Math.min(losses.currentYearLosses ?? 0, taxableCapitalGain);
  const remainingAfterCurrent = taxableCapitalGain - currentYearLossesApplied;
  const carriedForwardLossesApplied = Math.min(
    losses.carriedForwardLosses ?? 0,
    remainingAfterCurrent,
  );
  const gainAfterLosses = Math.max(0, remainingAfterCurrent - carriedForwardLossesApplied);
  const remainingCarriedForwardLosses = Math.max(
    0,
    (losses.carriedForwardLosses ?? 0) - carriedForwardLossesApplied,
  );
  if (currentYearLossesApplied + carriedForwardLossesApplied > 0) {
    atoReferences.push(
      'Section 102-5 (ITAA 1997): capital losses offset the gain before the Division 115 discount',
    );
  }

  // Division 115 50% discount (held ≥ 12 months)
  const discountEligible = totalMonthsOwned >= 12 && gainAfterLosses > 0;
  const cgtDiscountAmount = discountEligible ? gainAfterLosses * 0.5 : 0;
  const netTaxableCapitalGain = gainAfterLosses - cgtDiscountAmount;
  if (discountEligible) {
    atoReferences.push('Division 115 (ITAA 1997): 50% CGT discount applied — held 12+ months as an individual');
  }

  return {
    grossProceeds: Math.round(disposed),
    adjustedCostBase: Math.round(adjustedCostBase),
    capitalWorksClawbackApplied: Math.round(clawback),
    grossCapitalGain: Math.round(grossCapitalGain),
    isMainResidenceFullyExempt: isFullyExempt,
    taxableApportionmentPercentage: Math.round(apportionment * 1000) / 10,
    taxableCapitalGain: Math.round(taxableCapitalGain),
    currentYearLossesApplied: Math.round(currentYearLossesApplied),
    carriedForwardLossesApplied: Math.round(carriedForwardLossesApplied),
    remainingCarriedForwardLosses: Math.round(remainingCarriedForwardLosses),
    gainAfterLosses: Math.round(gainAfterLosses),
    discountEligible,
    cgtDiscountAmount: Math.round(cgtDiscountAmount),
    netTaxableCapitalGain: Math.round(netTaxableCapitalGain),
    atoReferences,
  };
}

// ─── Carry-Forward Loss Netting ───────────────────────────────────────────────

export interface CarryForwardResult {
  currentYearGains: number;
  currentYearLosses: number;
  carriedForwardLosses: number;
  netGainAfterLosses: number;
  netCapitalLossCarriedForward: number;
  remainingCarriedForwardLosses: number;
  hasNetCapitalGain: boolean;
}

/**
 * Net current-year gains and losses with carried-forward losses (s 102-5).
 *
 * @param currentYearGains - Sum of current-year capital gains before losses
 * @param currentYearLosses - Sum of current-year capital losses
 * @param carriedForward - Capital losses carried forward from prior years
 * @returns CarryForwardResult — net gain after all losses, plus any loss balance
 *   to carry into future years
 *
 * Assumptions:
 * - Current-year losses offset current-year gains first, then carried-forward losses
 * - Any remaining net loss (current year) is carried forward to future years
 * - Unused carried-forward losses remain available indefinitely (ATO rule)
 * - The 50% discount is applied AFTER netting (handled downstream)
 */
export function carryForwardLosses(
  currentYearGains: number,
  currentYearLosses: number,
  carriedForward: number,
): CarryForwardResult {
  const netYear = currentYearGains - currentYearLosses;

  if (netYear > 0) {
    const lossesApplied = Math.min(carriedForward, netYear);
    return {
      currentYearGains,
      currentYearLosses,
      carriedForwardLosses: carriedForward,
      netGainAfterLosses: netYear - lossesApplied,
      netCapitalLossCarriedForward: 0,
      remainingCarriedForwardLosses: carriedForward - lossesApplied,
      hasNetCapitalGain: netYear - lossesApplied > 0,
    };
  }

  return {
    currentYearGains,
    currentYearLosses,
    carriedForwardLosses: carriedForward,
    netGainAfterLosses: 0,
    netCapitalLossCarriedForward: -netYear,
    remainingCarriedForwardLosses: carriedForward,
    hasNetCapitalGain: false,
  };
}

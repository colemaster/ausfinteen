/**
 * Australian Capital Gains Tax (CGT) & 6-Year Main Residence Engine
 * Implements Division 115 50% discount, Section 102-5 loss ordering,
 * Section 118-145 6-year rule, Section 118-192 market value reset, Division 43 clawback,
 * 5-Element Cost Base (s 110-25 & s 110-55), and Division 6AA Minor Unearned Tax.
 */

import { calcIncomeTax, calcMedicareLevy, getCombinedMarginalRate } from '../../data/tax-brackets';

export interface CGTCostBaseElements {
  purchasePrice: number;              // Element 1: Acquisition price (s 110-25(2))
  incidentalAcquisitionCosts: number; // Element 2: Stamp duty, conveyancing, inspection, brokerage (s 110-25(3))
  holdingCosts?: number;              // Element 3: Non-deductible rates, land tax, interest (s 110-25(4))
  capitalImprovementsRenovations: number; // Element 4: Substantial improvements (s 110-25(5))
  titleAndSellingCosts: number;       // Element 5: Agent commission, marketing, legal fees (s 110-25(6))
  division43CapitalWorksClaimed: number; // Div 43 depreciation claimed (clawback from cost base, s 110-45)
}

export type TaxpayerEntity =
  | 'individual'
  | 'minor_unearned'
  | 'minor_excepted'
  | 'super_fund'
  | 'company';

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
  // Entity & Minor options
  taxpayerEntity?: TaxpayerEntity;
  isAustralianTaxResident?: boolean;
}

export interface CGTResult {
  grossCapitalGain: number;
  adjustedCostBase: number;
  reducedCostBase: number;
  netGainBeforeDiscount: number;
  lossesOffsetApplied: number;
  remainingCarriedForwardLosses: number;
  discountEligible: boolean;
  discountPercentage: number;
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
  // Minor & Division 6AA details
  isDivision6AAApplied?: boolean;
  division6AAPenaltyTax?: number;
  division6AAExplanation?: string;
  holdingCostsApplied?: number;
}

export interface Division6AAResult {
  eligibleIncome: number;
  tax: number;
  medicareLevy: number;
  totalTax: number;
  effectiveRate: number;
  bracketDescription: string;
}

/**
 * Calculate Division 6AA tax on eligible (unearned) income of a minor (under 18).
 * ITAA 1936 Part III Division 6AA & Income Tax Rates Act 1986 Schedule 11.
 *
 * Thresholds (FY 2024-25 through FY 2026-27):
 * - $0 to $416: Nil tax (tax-free limit)
 * - $417 to $1,307: 66% shade-in rate on excess over $416
 * - Over $1,307: 45% flat rate on entire eligible taxable income (+ 2% Medicare = 47%)
 */
export function calcDivision6AATax(eligibleIncome: number, includeMedicare = true): Division6AAResult {
  const income = Math.max(0, eligibleIncome);
  let baseTax = 0;
  let bracketDescription = 'Nil tax (within $416 tax-free threshold)';

  if (income <= 416) {
    baseTax = 0;
    bracketDescription = 'Nil tax (within $416 tax-free threshold)';
  } else if (income <= 1307) {
    baseTax = (income - 416) * 0.66;
    bracketDescription = `66% shade-in rate on excess over $416 ($${Math.round(income - 416).toLocaleString()})`;
  } else {
    baseTax = income * 0.45;
    bracketDescription = 'Top marginal rate (45%) on entire unearned gain';
  }

  const medicareLevy = includeMedicare && income > 416 ? income * 0.02 : 0;
  const totalTax = baseTax + medicareLevy;
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

  return {
    eligibleIncome: Math.round(income),
    tax: Math.round(baseTax),
    medicareLevy: Math.round(medicareLevy),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    bracketDescription,
  };
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
    taxpayerEntity = 'individual',
    isAustralianTaxResident = true,
  } = params;

  const holdingCosts = Math.max(0, costBaseElements.holdingCosts ?? 0);

  // 1. Determine Effective Starting Cost Base (s 118-192 Market Value Reset check)
  let effectiveAcquisitionPrice = purchasePrice;
  if (isMainResidence && wasRentedOut && marketValueWhenFirstRented && marketValueWhenFirstRented > 0) {
    effectiveAcquisitionPrice = marketValueWhenFirstRented;
  }

  // 2. Compute Adjusted Cost Base with Div 43 Clawback (s 110-45) & Holding Costs (s 110-25(4))
  const adjustedCostBase =
    effectiveAcquisitionPrice +
    costBaseElements.incidentalAcquisitionCosts +
    costBaseElements.capitalImprovementsRenovations +
    costBaseElements.titleAndSellingCosts +
    holdingCosts -
    costBaseElements.division43CapitalWorksClaimed;

  // Reduced cost base for capital loss purposes excludes Element 3 (s 110-55(4))
  const reducedCostBase =
    effectiveAcquisitionPrice +
    costBaseElements.incidentalAcquisitionCosts +
    costBaseElements.capitalImprovementsRenovations +
    costBaseElements.titleAndSellingCosts -
    costBaseElements.division43CapitalWorksClaimed;

  // 3. Gross Gain Calculation
  // ATO rule: holding costs can reduce gains to zero, but cannot create a capital loss (s 110-55(4))
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
      taxableApportionment = Math.min(1.0, excessMonths / Math.max(1, ownershipMonths));
    } else if (!electedSixYearExemption) {
      taxableApportionment = Math.min(1.0, rentedMonths / Math.max(1, ownershipMonths));
    }
  }

  taxableApportionment = Math.min(1.0, Math.max(0, taxableApportionment));
  const grossCapitalGain = isFullyExempt ? 0 : unadjustedGain * taxableApportionment;

  // 5. Section 102-5 Loss Ordering Rule
  // Losses MUST be offset against gross gains BEFORE applying the discount
  const totalAvailableLosses = currentYearCapitalLosses + priorYearCarriedForwardLosses;
  const lossesOffsetApplied = Math.min(grossCapitalGain, totalAvailableLosses);
  const gainAfterLosses = Math.max(0, grossCapitalGain - lossesOffsetApplied);
  const remainingCarriedForwardLosses = totalAvailableLosses - lossesOffsetApplied;

  // 6. Division 115 CGT Discount (held >= 12 months = >= 365 days)
  let discountRate = 0;
  if (ownershipMonths >= 12 && gainAfterLosses > 0) {
    if (taxpayerEntity === 'company' || !isAustralianTaxResident) {
      discountRate = 0;
    } else if (taxpayerEntity === 'super_fund') {
      discountRate = 1 / 3; // 33.33% discount for complying super funds
    } else {
      // Individual or Minor (under 18)
      discountRate = 0.50; // 50% discount
    }
  }

  const discountEligible = discountRate > 0;
  const cgtDiscount50PercentAmount = discountEligible ? gainAfterLosses * discountRate : 0;
  const netTaxableCapitalGain = discountEligible ? gainAfterLosses * (1 - discountRate) : gainAfterLosses;

  // 7. Income Tax & Medicare Impact based on Taxpayer Entity
  let baseTax = 0;
  let totalTax = 0;
  let cgtTaxPayable = 0;
  let isDivision6AAApplied = false;
  let division6AAPenaltyTax = 0;
  let division6AAExplanation = '';
  let marginalRateApplied = 0;

  if (taxpayerEntity === 'minor_unearned') {
    // Unearned capital gains from gifted assets or trusts trigger Division 6AA penalty tax
    const div6aa = calcDivision6AATax(netTaxableCapitalGain, true);
    isDivision6AAApplied = true;
    division6AAPenaltyTax = div6aa.totalTax;
    division6AAExplanation = div6aa.bracketDescription;

    baseTax = calcIncomeTax(regularTaxableIncome) + calcMedicareLevy(regularTaxableIncome);
    cgtTaxPayable = div6aa.totalTax;
    totalTax = baseTax + cgtTaxPayable;
    marginalRateApplied = netTaxableCapitalGain > 1307 ? 47 : netTaxableCapitalGain > 416 ? 66 : 0;
  } else if (taxpayerEntity === 'super_fund') {
    // Complying super fund: 15% flat rate
    baseTax = regularTaxableIncome * 0.15;
    cgtTaxPayable = Math.round(netTaxableCapitalGain * 0.15);
    totalTax = baseTax + cgtTaxPayable;
    marginalRateApplied = 15;
  } else if (taxpayerEntity === 'company') {
    // Company: 25% flat rate (base rate entity)
    baseTax = regularTaxableIncome * 0.25;
    cgtTaxPayable = Math.round(netTaxableCapitalGain * 0.25);
    totalTax = baseTax + cgtTaxPayable;
    marginalRateApplied = 25;
  } else {
    // Adult individual or minor_excepted (personal exertion / deceased estate)
    baseTax = calcIncomeTax(regularTaxableIncome) + calcMedicareLevy(regularTaxableIncome);
    const totalTaxableWithGain = regularTaxableIncome + netTaxableCapitalGain;
    totalTax = calcIncomeTax(totalTaxableWithGain) + calcMedicareLevy(totalTaxableWithGain);
    cgtTaxPayable = Math.max(0, totalTax - baseTax);
    marginalRateApplied = getCombinedMarginalRate(regularTaxableIncome) * 100;
  }

  const effectiveCGTRateOnGrossGain = grossCapitalGain > 0 ? (cgtTaxPayable / grossCapitalGain) * 100 : 0;

  return {
    grossCapitalGain: Math.round(grossCapitalGain),
    adjustedCostBase: Math.round(adjustedCostBase),
    reducedCostBase: Math.round(reducedCostBase),
    netGainBeforeDiscount: Math.round(gainAfterLosses),
    lossesOffsetApplied: Math.round(lossesOffsetApplied),
    remainingCarriedForwardLosses: Math.round(remainingCarriedForwardLosses),
    discountEligible,
    discountPercentage: Math.round(discountRate * 100),
    cgtDiscount50PercentAmount: Math.round(cgtDiscount50PercentAmount),
    netTaxableCapitalGain: Math.round(netTaxableCapitalGain),
    taxWithoutCapitalGain: Math.round(baseTax),
    taxWithCapitalGain: Math.round(totalTax),
    cgtTaxPayable: Math.round(cgtTaxPayable),
    effectiveCGTRateOnGrossGain: Math.round(effectiveCGTRateOnGrossGain * 10) / 10,
    marginalRateApplied: Math.round(marginalRateApplied * 10) / 10,
    isFullyExemptUnderSixYearRule: isFullyExempt,
    taxableApportionmentPercentage: Math.round(taxableApportionment * 1000) / 10,
    isDivision6AAApplied,
    division6AAPenaltyTax: Math.round(division6AAPenaltyTax),
    division6AAExplanation,
    holdingCostsApplied: Math.round(holdingCosts),
  };
}

// ─── CGT on Disposal (workflow model) ─────────────────────────────────────────

export interface CGTDisposalCosts {
  buyCosts: number;                   // stamp duty, conveyancing, inspection
  sellCosts: number;                  // agent commission, marketing, legal
  holdingCosts?: number;              // non-deductible rates, land tax, interest (Element 3)
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
  holdingCostsApplied: number;
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
 * - Element 3 (s 110-25(4)) holding costs reduction of gross capital gains
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
    holdingCosts = 0,
    capitalWorksClaimed,
    incomeProducedWhileRented,
    monthsRented,
    totalMonthsOwned,
  } = costs;

  const atoReferences: string[] = [];

  // Div 43 clawback (s 110-45): capital works claimed reduces the cost base
  const clawback = Math.max(0, capitalWorksClaimed);
  const holding = Math.max(0, holdingCosts);
  const adjustedCostBase = acquired + buyCosts + sellCosts + holding - clawback;
  if (clawback > 0) {
    atoReferences.push('Division 43 (ITAA 1997 s 110-45): capital-works deductions claimed are subtracted from the cost base');
  }
  if (holding > 0) {
    atoReferences.push('Element 3 (ITAA 1997 s 110-25(4)): non-deductible holding costs (rates, interest, land tax) reduce gross capital gains');
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
    holdingCostsApplied: Math.round(holding),
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

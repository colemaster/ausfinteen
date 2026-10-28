/**
 * Teen Investing Engine — fee drag, tax-aware (CGT discount) ETF outcomes and
 * inflation-adjusted (real) return maths for Australian teen investors.
 *
 * CGT rules: individuals get a 50% discount on capital gains from assets held
 * more than 12 months (CGT_DISCOUNT_INDIVIDUAL from '@/data/constants').
 */

import { CGT_DISCOUNT_INDIVIDUAL } from '@/data/constants';

export interface FeeDragGrowthResult {
  grossReturnRate: number; // p.a. before fees (%)
  merRate: number;         // p.a. management fee (%)
  netReturnRate: number;   // gross - MER (%)
  futureValueGross: number;
  futureValueNet: number;
  feeDragLoss: number;
}

/**
 * Compound a lump sum at a gross annual return less an ongoing management
 * expense ratio (MER). Fee drag is modelled as return - MER each year.
 */
export function etfGrowthWithFees(
  initial: number,
  years: number,
  returnRatePct: number,
  merPct: number
): FeeDragGrowthResult {
  const safeInitial = Math.max(initial, 0);
  const safeYears = Math.max(years, 0);
  const netReturnRate = returnRatePct - merPct;
  const grossFactor = Math.pow(1 + returnRatePct / 100, safeYears);
  const netFactor = Math.pow(1 + netReturnRate / 100, safeYears);
  const futureValueGross = safeInitial * grossFactor;
  const futureValueNet = safeInitial * netFactor;
  return {
    grossReturnRate: returnRatePct,
    merRate: merPct,
    netReturnRate,
    futureValueGross: Math.round(futureValueGross),
    futureValueNet: Math.round(futureValueNet),
    feeDragLoss: Math.round(futureValueGross - futureValueNet),
  };
}

/**
 * Capital gains tax payable on a gain using the 50% CGT discount for assets
 * held longer than 12 months.
 *
 * @param capitalGain - Taxable capital gain before discount (AUD)
 * @param marginalRate - Investor's marginal tax rate (decimal, incl. Medicare)
 * @param discount - CGT discount fraction (default 0.50)
 */
export function cgtAfterDiscount(
  capitalGain: number,
  marginalRate: number,
  discount: number = CGT_DISCOUNT_INDIVIDUAL
): number {
  if (capitalGain <= 0) return 0;
  const safeRate = Math.min(Math.max(marginalRate, 0), 0.47);
  const safeDiscount = Math.min(Math.max(discount, 0), 1);
  return capitalGain * safeRate * (1 - safeDiscount);
}

/**
 * After-tax value of selling an ETF holding: compounds the initial investment
 * at the net (post-MER) return, then applies CGT with the 50% discount to the
 * capital gain on disposal.
 *
 * Assumption: the entire gain is a capital gain (distributions reinvested), so
 * the discounted CGT is applied to the full gain for simplicity.
 */
export function afterTaxSaleValue(
  initial: number,
  years: number,
  returnRatePct: number,
  merPct: number,
  marginalRate: number,
  discount: number = CGT_DISCOUNT_INDIVIDUAL
): number {
  const { futureValueNet } = etfGrowthWithFees(initial, years, returnRatePct, merPct);
  const gain = futureValueNet - initial;
  const cgt = cgtAfterDiscount(gain, marginalRate, discount);
  return futureValueNet - cgt;
}

/**
 * Convert a nominal return into a real (inflation-adjusted) return.
 *
 * @param nominalRatePct - Nominal annual return (%)
 * @param inflationRatePct - Expected annual inflation (%)
 */
export function realReturn(nominalRatePct: number, inflationRatePct: number): number {
  const nominal = nominalRatePct / 100;
  const inflation = inflationRatePct / 100;
  if (1 + inflation === 0) return 0;
  return ((1 + nominal) / (1 + inflation) - 1) * 100;
}

export interface RealVsNominalGrowthResult {
  nominalRatePct: number;
  inflationRatePct: number;
  realRatePct: number;
  futureValueNominal: number;
  futureValueReal: number;
}

/**
 * Future value of a lump sum in both nominal and real (inflation-adjusted)
 * dollars so teens can see "that's $X in today's money".
 */
export function nominalVsRealGrowth(
  initial: number,
  years: number,
  nominalRatePct: number,
  inflationRatePct: number
): RealVsNominalGrowthResult {
  const realRate = realReturn(nominalRatePct, inflationRatePct);
  const futureValueNominal = initial * Math.pow(1 + nominalRatePct / 100, years);
  const futureValueReal = initial * Math.pow(1 + realRate / 100, years);
  return {
    nominalRatePct,
    inflationRatePct,
    realRatePct: realRate,
    futureValueNominal: Math.round(futureValueNominal),
    futureValueReal: Math.round(futureValueReal),
  };
}

export type ContributionFrequency = 'weekly' | 'fortnightly' | 'monthly';

export interface DcaGrowthResult {
  frequency: ContributionFrequency;
  regularContribution: number;
  years: number;
  totalInvested: number;
  futureValueGross: number;
  futureValueNet: number;
  compoundGrowthNet: number;
  feeDragLoss: number;
  futureValueReal: number;
}

/**
 * Dollar-Cost Averaging (DCA) Growth Calculator with ongoing MER fee drag
 * and optional inflation-adjusted (real) purchasing power projection.
 *
 * Models regular weekly, fortnightly, or monthly ETF contributions over time,
 * factoring in market return and the annual management expense ratio (MER).
 */
export function dcaGrowthWithFees(
  regularContribution: number,
  frequency: ContributionFrequency,
  years: number,
  annualReturnPct: number,
  merPct: number = 0,
  inflationPct: number = 0,
  initialLumpSum: number = 0
): DcaGrowthResult {
  const safeYears = Math.max(0, years);
  const safeContribution = Math.max(0, regularContribution);
  const safeInitial = Math.max(0, initialLumpSum);

  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'fortnightly' ? 26 : 12;
  const totalPeriods = Math.round(safeYears * periodsPerYear);
  const totalInvested = Math.round(safeInitial + safeContribution * totalPeriods);

  if (totalPeriods === 0) {
    return {
      frequency,
      regularContribution: safeContribution,
      years: safeYears,
      totalInvested,
      futureValueGross: safeInitial,
      futureValueNet: safeInitial,
      compoundGrowthNet: 0,
      feeDragLoss: 0,
      futureValueReal: safeInitial,
    };
  }

  const grossPeriodicRate = (annualReturnPct / 100) / periodsPerYear;
  const netReturnPct = annualReturnPct - merPct;
  const netPeriodicRate = (netReturnPct / 100) / periodsPerYear;

  // Gross Future Value
  let fvGross = 0;
  if (grossPeriodicRate === 0) {
    fvGross = safeInitial + safeContribution * totalPeriods;
  } else {
    const fvLumpGross = safeInitial * Math.pow(1 + grossPeriodicRate, totalPeriods);
    const fvAnnuityGross = safeContribution * ((Math.pow(1 + grossPeriodicRate, totalPeriods) - 1) / grossPeriodicRate);
    fvGross = fvLumpGross + fvAnnuityGross;
  }

  // Net Future Value (after MER fee drag)
  let fvNet = 0;
  if (netPeriodicRate === 0) {
    fvNet = safeInitial + safeContribution * totalPeriods;
  } else {
    const fvLumpNet = safeInitial * Math.pow(1 + netPeriodicRate, totalPeriods);
    const fvAnnuityNet = safeContribution * ((Math.pow(1 + netPeriodicRate, totalPeriods) - 1) / netPeriodicRate);
    fvNet = fvLumpNet + fvAnnuityNet;
  }

  // Real Future Value (after MER and inflation)
  const realAnnualRate = realReturn(netReturnPct, inflationPct);
  const realPeriodicRate = (realAnnualRate / 100) / periodsPerYear;
  let fvReal = 0;
  if (realPeriodicRate === 0) {
    fvReal = safeInitial + safeContribution * totalPeriods;
  } else {
    const fvLumpReal = safeInitial * Math.pow(1 + realPeriodicRate, totalPeriods);
    const fvAnnuityReal = safeContribution * ((Math.pow(1 + realPeriodicRate, totalPeriods) - 1) / realPeriodicRate);
    fvReal = fvLumpReal + fvAnnuityReal;
  }

  const roundedGross = Math.round(fvGross);
  const roundedNet = Math.round(fvNet);
  const feeDrag = Math.max(0, roundedGross - roundedNet);
  const compoundGrowth = Math.max(0, roundedNet - totalInvested);

  return {
    frequency,
    regularContribution: safeContribution,
    years: safeYears,
    totalInvested,
    futureValueGross: roundedGross,
    futureValueNet: roundedNet,
    compoundGrowthNet: compoundGrowth,
    feeDragLoss: feeDrag,
    futureValueReal: Math.round(fvReal),
  };
}

export interface HorizonComparison {
  years: number;
  cashSavings: number;      // e.g. 4.5% p.a.
  balancedFund: number;     // e.g. 6.5% p.a.
  highGrowthEtf: number;    // e.g. 9.0% p.a.
  growthDifference: number; // highGrowthEtf - cashSavings
  multipleOverCash: number; // highGrowthEtf / cashSavings
}

export interface CompoundProjectionYearPoint {
  year: number;
  cashSavings: number;
  balancedFund: number;
  highGrowthEtf: number;
}

export interface CompoundProjectionComparison {
  initial: number;
  cashRatePct: number;
  balancedRatePct: number;
  highGrowthRatePct: number;
  horizons: HorizonComparison[];
  yearly: CompoundProjectionYearPoint[];
  ruleOf72: {
    cashYears: number;
    balancedYears: number;
    highGrowthYears: number;
  };
}

/**
 * $10,000 compound growth projection over 5, 10, 20, 30 years comparing
 * cash savings (4.5%), balanced fund (6.5%), and high-growth equity ETFs (9.0%).
 *
 * Models the compound acceleration of equities versus low-volatility bank cash,
 * demonstrating why long-horizon investors build generational wealth through shares.
 */
export function projectLumpSumComparison(
  initial: number = 10000,
  cashRatePct: number = 4.5,
  balancedRatePct: number = 6.5,
  highGrowthRatePct: number = 9.0,
  horizons: number[] = [5, 10, 20, 30]
): CompoundProjectionComparison {
  const safeInitial = Math.max(0, initial);
  const maxYears = Math.max(...horizons, 30);

  const horizonResults: HorizonComparison[] = horizons.map(yrs => {
    const cash = safeInitial * Math.pow(1 + cashRatePct / 100, yrs);
    const balanced = safeInitial * Math.pow(1 + balancedRatePct / 100, yrs);
    const highGrowth = safeInitial * Math.pow(1 + highGrowthRatePct / 100, yrs);
    const roundedCash = Math.round(cash);
    const roundedHighGrowth = Math.round(highGrowth);
    return {
      years: yrs,
      cashSavings: roundedCash,
      balancedFund: Math.round(balanced),
      highGrowthEtf: roundedHighGrowth,
      growthDifference: roundedHighGrowth - roundedCash,
      multipleOverCash: roundedCash > 0 ? Number((roundedHighGrowth / roundedCash).toFixed(2)) : 0,
    };
  });

  const yearly: CompoundProjectionYearPoint[] = [];
  for (let y = 0; y <= maxYears; y++) {
    yearly.push({
      year: y,
      cashSavings: Math.round(safeInitial * Math.pow(1 + cashRatePct / 100, y)),
      balancedFund: Math.round(safeInitial * Math.pow(1 + balancedRatePct / 100, y)),
      highGrowthEtf: Math.round(safeInitial * Math.pow(1 + highGrowthRatePct / 100, y)),
    });
  }

  return {
    initial: safeInitial,
    cashRatePct,
    balancedRatePct,
    highGrowthRatePct,
    horizons: horizonResults,
    yearly,
    ruleOf72: {
      cashYears: cashRatePct > 0 ? Number((72 / cashRatePct).toFixed(1)) : 0,
      balancedYears: balancedRatePct > 0 ? Number((72 / balancedRatePct).toFixed(1)) : 0,
      highGrowthYears: highGrowthRatePct > 0 ? Number((72 / highGrowthRatePct).toFixed(1)) : 0,
    },
  };
}

/**
 * Result of Franking Credit calculation (Part 3-6 & Division 67 ITAA 1997)
 */
export interface FrankingCreditResult {
  cashDividend: number;
  frankingPercentage: number;
  companyTaxRatePct: number;
  marginalTaxRatePct: number;
  frankingCredit: number;
  grossDividend: number;
  taxOnGrossDividend: number;
  taxPayableOrRefund: number; // positive = top-up tax payable, negative = cash refund from ATO
  cashRefund: number;         // positive cash refund amount (0 if tax payable)
  taxPayable: number;         // positive tax payable amount (0 if refund)
  netCashInPocket: number;    // cashDividend + cashRefund - taxPayable
  effectiveYieldMultiplier: number; // netCashInPocket / cashDividend
}

/**
 * Calculate Australian dividend imputation credits (franking credits) and
 * ATO cash refunds under ITAA 1997 Division 67.
 *
 * For taxpayers in the 0% tax bracket (e.g. students or low-income earners with
 * total income <= $18,200), excess franking credits are refunded 100% as CASH
 * by the ATO!
 */
export function calculateFrankingCredit(
  cashDividend: number,
  frankingPercentagePct: number = 100,
  companyTaxRatePct: number = 30,
  marginalTaxRatePct: number = 0
): FrankingCreditResult {
  const safeCash = Math.max(0, cashDividend);
  const safeFranking = Math.min(Math.max(0, frankingPercentagePct), 100) / 100;
  const safeCorpRate = Math.min(Math.max(0, companyTaxRatePct), 50) / 100;
  const safeMarginal = Math.min(Math.max(0, marginalTaxRatePct), 100) / 100;

  let frankingCredit = 0;
  if (safeCorpRate < 1) {
    frankingCredit = safeCash * safeFranking * (safeCorpRate / (1 - safeCorpRate));
  }
  const roundedCredit = Math.round(frankingCredit * 100) / 100;
  const grossDividend = Math.round((safeCash + roundedCredit) * 100) / 100;
  const taxOnGross = Math.round(grossDividend * safeMarginal * 100) / 100;
  const taxPayableOrRefund = Math.round((taxOnGross - roundedCredit) * 100) / 100;

  const cashRefund = taxPayableOrRefund < 0 ? Math.abs(taxPayableOrRefund) : 0;
  const taxPayable = taxPayableOrRefund > 0 ? taxPayableOrRefund : 0;
  const netCashInPocket = Math.round((safeCash + cashRefund - taxPayable) * 100) / 100;
  const effectiveYieldMultiplier = safeCash > 0 ? Number((netCashInPocket / safeCash).toFixed(4)) : 1;

  return {
    cashDividend: safeCash,
    frankingPercentage: frankingPercentagePct,
    companyTaxRatePct,
    marginalTaxRatePct,
    frankingCredit: roundedCredit,
    grossDividend,
    taxOnGrossDividend: taxOnGross,
    taxPayableOrRefund,
    cashRefund,
    taxPayable,
    netCashInPocket,
    effectiveYieldMultiplier,
  };
}

/**
 * Result of ATO Division 6AA unearned income tax on minors under 18
 */
export interface MinorDivision6AAResult {
  grossUnearnedIncome: number;
  frankingCredit: number;
  taxPayable: number;
  excessFrankingRefund: number;
  netCashBenefit: number;
  isPenaltyBracket: boolean;
}

/**
 * Assess unearned income (dividends, interest, trust distributions) earned by minors
 * under Division 6AA of the ITAA 1936.
 *
 * Rules:
 *  - $0 to $416: Tax-free (0% tax; franking credits fully refunded)
 *  - $417 to $1,307: 66% shade-in rate on excess over $416
 *  - Over $1,307: 47% (45% top marginal rate + 2% Medicare levy)
 */
export function calculateMinorDivision6AATax(
  grossUnearnedIncome: number,
  frankingCredit: number = 0
): MinorDivision6AAResult {
  const safeIncome = Math.max(0, grossUnearnedIncome);
  const safeCredit = Math.max(0, frankingCredit);

  let tax = 0;
  let isPenalty = false;

  if (safeIncome <= 416) {
    tax = 0;
  } else if (safeIncome <= 1307) {
    tax = (safeIncome - 416) * 0.66;
    isPenalty = true;
  } else {
    tax = safeIncome * 0.47;
    isPenalty = true;
  }

  const roundedTax = Math.round(tax * 100) / 100;
  const netTaxAfterOffset = Math.round((roundedTax - safeCredit) * 100) / 100;

  const taxPayable = netTaxAfterOffset > 0 ? netTaxAfterOffset : 0;
  const excessFrankingRefund = netTaxAfterOffset < 0 ? Math.abs(netTaxAfterOffset) : 0;
  const netCashBenefit = Math.round((safeIncome - roundedTax) * 100) / 100;

  return {
    grossUnearnedIncome: safeIncome,
    frankingCredit: safeCredit,
    taxPayable,
    excessFrankingRefund,
    netCashBenefit,
    isPenaltyBracket: isPenalty,
  };
}

/**
 * Platform cost analysis and fee drag across major Australian micro-investing and retail brokers
 */
export interface PlatformCostResult {
  platformId: string;
  name: string;
  holdingModel: 'CHESS' | 'Custodial';
  brokeragePerTrade: number;
  monthlyFee: number;
  annualFeeTotal: number;
  annualFeeDragPct: number;
  supportsMinorBareTrust: boolean;
  minTrade: number;
  fractionalUnits: boolean;
}

/**
 * Compare annual fee costs and percentage fee drag across Australian micro-investing
 * and low-cost share platforms, demonstrating the "Flat Monthly Fee Trap" on small balances.
 */
export function compareMicroPlatformCosts(
  balance: number,
  tradesPerYear: number = 12,
  _averageTradeAmount: number = 100
): PlatformCostResult[] {
  const safeBalance = Math.max(balance, 1);
  const safeTrades = Math.max(0, tradesPerYear);

  const platforms = [
    {
      platformId: 'betashares-direct',
      name: 'Betashares Direct',
      holdingModel: 'Custodial' as const,
      brokeragePerTrade: 0,
      monthlyFee: 0,
      supportsMinorBareTrust: true,
      minTrade: 10,
      fractionalUnits: true,
      calcAnnualCost: () => 0,
    },
    {
      platformId: 'cmc-invest',
      name: 'CMC Invest',
      holdingModel: 'CHESS' as const,
      brokeragePerTrade: 0, // $0 for 1 buy/day <= $1,000
      monthlyFee: 0,
      supportsMinorBareTrust: true,
      minTrade: 500,
      fractionalUnits: false,
      calcAnnualCost: () => 0,
    },
    {
      platformId: 'commsec-pocket',
      name: 'CommSec Pocket',
      holdingModel: 'CHESS' as const,
      brokeragePerTrade: 2.0,
      monthlyFee: 0,
      supportsMinorBareTrust: false, // 18+ only
      minTrade: 50,
      fractionalUnits: false,
      calcAnnualCost: () => safeTrades * 2.0,
    },
    {
      platformId: 'stake-asx',
      name: 'Stake (ASX)',
      holdingModel: 'CHESS' as const,
      brokeragePerTrade: 3.0,
      monthlyFee: 0,
      supportsMinorBareTrust: false, // 18+ only
      minTrade: 500,
      fractionalUnits: false,
      calcAnnualCost: () => safeTrades * 3.0,
    },
    {
      platformId: 'pearler-shares',
      name: 'Pearler Shares',
      holdingModel: 'CHESS' as const,
      brokeragePerTrade: 6.5,
      monthlyFee: 0,
      supportsMinorBareTrust: true,
      minTrade: 500,
      fractionalUnits: false,
      calcAnnualCost: () => safeTrades * 6.5,
    },
    {
      platformId: 'pearler-headstart',
      name: 'Pearler Headstart (Kids)',
      holdingModel: 'Custodial' as const,
      brokeragePerTrade: 0,
      monthlyFee: 2.0,
      supportsMinorBareTrust: true,
      minTrade: 5,
      fractionalUnits: true,
      calcAnnualCost: () => 2.0 * 12,
    },
    {
      platformId: 'spaceship-voyager',
      name: 'Spaceship Voyager',
      holdingModel: 'Custodial' as const,
      brokeragePerTrade: 0,
      monthlyFee: safeBalance >= 100 ? 3.0 : 0,
      supportsMinorBareTrust: true,
      minTrade: 5,
      fractionalUnits: true,
      calcAnnualCost: () => {
        const sub = safeBalance >= 100 ? 3.0 * 12 : 0;
        const mgmt = safeBalance * 0.0025; // ~0.25% average
        return sub + mgmt;
      },
    },
    {
      platformId: 'raiz-standard',
      name: 'Raiz (Standard)',
      holdingModel: 'Custodial' as const,
      brokeragePerTrade: 0,
      monthlyFee: 4.5,
      supportsMinorBareTrust: true,
      minTrade: 5,
      fractionalUnits: true,
      calcAnnualCost: () => {
        if (safeBalance < 20000) {
          return 4.5 * 12; // $54/yr
        }
        return safeBalance * 0.00275;
      },
    },
  ];

  return platforms.map(p => {
    const annualFeeTotal = Math.round(p.calcAnnualCost() * 100) / 100;
    const annualFeeDragPct = Number(((annualFeeTotal / safeBalance) * 100).toFixed(2));
    return {
      platformId: p.platformId,
      name: p.name,
      holdingModel: p.holdingModel,
      brokeragePerTrade: p.brokeragePerTrade,
      monthlyFee: p.monthlyFee,
      annualFeeTotal,
      annualFeeDragPct,
      supportsMinorBareTrust: p.supportsMinorBareTrust,
      minTrade: p.minTrade,
      fractionalUnits: p.fractionalUnits,
    };
  });
}

/**
 * Result of DRP Compounding & Cost Base Tracking Simulation
 */
export interface DRPGrowthResult {
  years: number;
  initialInvestment: number;
  finalValueWithDrp: number;
  finalValueWithoutDrp: number;
  drpAdvantage: number;
  totalDividendsReinvested: number;
  estimatedParcelsAcquired: number;
  accumulatedCostBase: number;
  totalFrankingCreditsReceived: number;
}

/**
 * Simulate the compounding effect of a Dividend Reinvestment Plan (DRP) vs receiving
 * cash distributions, including the acquisition of distinct CGT parcels and cost base tracking.
 */
export function simulateDrpGrowth(
  initialInvestment: number,
  years: number,
  capitalGrowthPct: number = 5.0,
  dividendYieldPct: number = 4.0,
  frankingPct: number = 70,
  distributionFrequencyPerYear: number = 4
): DRPGrowthResult {
  const safeInitial = Math.max(0, initialInvestment);
  const safeYears = Math.max(0, years);
  const periods = Math.round(safeYears * distributionFrequencyPerYear);

  if (periods === 0 || safeInitial === 0) {
    return {
      years: safeYears,
      initialInvestment: safeInitial,
      finalValueWithDrp: safeInitial,
      finalValueWithoutDrp: safeInitial,
      drpAdvantage: 0,
      totalDividendsReinvested: 0,
      estimatedParcelsAcquired: 0,
      accumulatedCostBase: safeInitial,
      totalFrankingCreditsReceived: 0,
    };
  }

  const periodGrowth = (capitalGrowthPct / 100) / distributionFrequencyPerYear;
  const periodYield = (dividendYieldPct / 100) / distributionFrequencyPerYear;

  let valDrp = safeInitial;
  let totalReinvested = 0;
  let totalFranking = 0;

  let valWithoutDrp = safeInitial;
  let cumulativeCashDividends = 0;

  for (let p = 0; p < periods; p++) {
    valDrp *= (1 + periodGrowth);
    valWithoutDrp *= (1 + periodGrowth);

    const divDrp = valDrp * periodYield;
    const divWithout = valWithoutDrp * periodYield;

    const frankingCredit = divDrp * (frankingPct / 100) * (0.30 / 0.70);
    totalFranking += frankingCredit;

    totalReinvested += divDrp;
    valDrp += divDrp;

    cumulativeCashDividends += divWithout;
  }

  const roundedDrp = Math.round(valDrp);
  const roundedWithoutDrp = Math.round(valWithoutDrp + cumulativeCashDividends);
  const drpAdvantage = Math.max(0, roundedDrp - roundedWithoutDrp);

  return {
    years: safeYears,
    initialInvestment: safeInitial,
    finalValueWithDrp: roundedDrp,
    finalValueWithoutDrp: roundedWithoutDrp,
    drpAdvantage,
    totalDividendsReinvested: Math.round(totalReinvested),
    estimatedParcelsAcquired: periods,
    accumulatedCostBase: Math.round(safeInitial + totalReinvested),
    totalFrankingCreditsReceived: Math.round(totalFranking),
  };
}

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
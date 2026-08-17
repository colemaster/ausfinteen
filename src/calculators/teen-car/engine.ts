/**
 * Teen Car Engine — EV vs petrol annual running costs and total cost of
 * ownership for a first car in Brisbane, QLD.
 *
 * Data sources: car-data.ts (Brisbane fuel prices, EV charging rates) and
 * teen-finance-data.ts (teen car cost defaults).
 */

import { EV_VS_PETROL_DEFAULTS } from '@/data/car-data';

export interface EvVsPetrolParams {
  kmPerYear: number;
  petrolLPer100km: number;
  petrolPricePerLitre: number;
  evKwhPer100km: number;
  homeOffPeakPricePerKwh: number;
  publicFastPricePerKwh: number;
  /** % of EV charging done on public fast chargers (0-100); the rest is home charging. */
  publicFastSharePct: number;
}

export interface EvVsPetrolResult {
  petrolAnnual: number;
  petrolPer100km: number;
  homeSharePct: number;
  publicSharePct: number;
  evBlendedPricePerKwh: number;
  evAnnual: number;
  evPer100km: number;
  savingsAnnual: number;
  savingsPct: number;
}

/**
 * Compare annual fuel/charging costs between a petrol car and an EV given a
 * home-vs-public charging split. The blended EV rate weights the home
 * (off-peak) tariff and the public fast-charger rate by the charging split.
 *
 * Assumptions:
 * - `publicFastSharePct` is the share of charging done at public DC fast
 *   chargers; the remainder is charged at the home off-peak rate.
 * - Fuel prices are Brisbane averages from car-data.ts.
 */
export function evVsPetrolRunningCost(params: Partial<EvVsPetrolParams>): EvVsPetrolResult {
  const p: EvVsPetrolParams = { ...EV_VS_PETROL_DEFAULTS, ...params };

  const hundredKmPerYear = p.kmPerYear / 100;
  const petrolAnnual = hundredKmPerYear * p.petrolLPer100km * p.petrolPricePerLitre;
  const petrolPer100km = p.petrolLPer100km * p.petrolPricePerLitre;

  const publicSharePct = Math.min(Math.max(p.publicFastSharePct, 0), 100);
  const homeSharePct = 100 - publicSharePct;
  const evBlendedPricePerKwh =
    (p.homeOffPeakPricePerKwh * homeSharePct + p.publicFastPricePerKwh * publicSharePct) / 100;
  const evAnnual = hundredKmPerYear * p.evKwhPer100km * evBlendedPricePerKwh;
  const evPer100km = p.evKwhPer100km * evBlendedPricePerKwh;

  const savingsAnnual = petrolAnnual - evAnnual;
  const savingsPct = petrolAnnual > 0 ? (savingsAnnual / petrolAnnual) * 100 : 0;

  return {
    petrolAnnual,
    petrolPer100km,
    homeSharePct,
    publicSharePct,
    evBlendedPricePerKwh,
    evAnnual,
    evPer100km,
    savingsAnnual,
    savingsPct,
  };
}

export interface CarTcoResult {
  purchasePrice: number;
  annualRunningCosts: number;
  years: number;
  tcoOverYears: number;   // purchase + running costs over the period
  costPerWeek: number;
  costPerMonth: number;
  runningCostsShare: number; // % of TCO that is running costs
}

/**
 * Total cost of ownership of a first car: purchase price plus all running
 * costs (rego, CTP, insurance, fuel, servicing, repairs) over a period.
 * The classic teen trap is buying cheap and paying dearly to run it.
 */
export function firstCarTotalCostOfOwnership(
  purchasePrice: number,
  annualRunningCosts: number,
  years: number = 5
): CarTcoResult {
  const safePrice = Math.max(purchasePrice, 0);
  const safeRunning = Math.max(annualRunningCosts, 0);
  const safeYears = Math.max(years, 1);
  const tcoOverYears = safePrice + safeRunning * safeYears;
  const weeks = safeYears * 52;
  return {
    purchasePrice: safePrice,
    annualRunningCosts: safeRunning,
    years: safeYears,
    tcoOverYears: Math.round(tcoOverYears),
    costPerWeek: Math.round((tcoOverYears / weeks) * 100) / 100,
    costPerMonth: Math.round((tcoOverYears / (safeYears * 12)) * 100) / 100,
    runningCostsShare: tcoOverYears > 0 ? (safeRunning * safeYears) / tcoOverYears : 0,
  };
}
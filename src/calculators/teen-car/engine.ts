/**
 * Teen Car Engine — EV vs petrol annual running costs, depreciation, and total cost of
 * ownership for a first car in Brisbane, QLD (2026-27 parameters).
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
  petrolPerKm: number;
  homeSharePct: number;
  publicSharePct: number;
  evBlendedPricePerKwh: number;
  evAnnual: number;
  evPer100km: number;
  evPerKm: number;
  savingsAnnual: number;
  savingsPct: number;
  savingsWeekly: number;
  savings5Year: number;
}

/**
 * Compare annual fuel/charging costs between a petrol car and an EV given a
 * home-vs-public charging split. The blended EV rate weights the home
 * (off-peak) tariff and the public fast-charger rate by the charging split.
 *
 * Assumptions (2026-27):
 * - Petrol: $2.38/L ULP 91 Brisbane average, 7.5 L/100km hatchback
 * - EV: 15.0 kWh/100km compact EV, 28c/kWh home off-peak, 65c/kWh public DC fast
 */
export function evVsPetrolRunningCost(params: Partial<EvVsPetrolParams>): EvVsPetrolResult {
  const p: EvVsPetrolParams = { ...EV_VS_PETROL_DEFAULTS, ...params };

  const hundredKmPerYear = p.kmPerYear / 100;
  const petrolAnnual = hundredKmPerYear * p.petrolLPer100km * p.petrolPricePerLitre;
  const petrolPer100km = p.petrolLPer100km * p.petrolPricePerLitre;
  const petrolPerKm = petrolPer100km / 100;

  const publicSharePct = Math.min(Math.max(p.publicFastSharePct, 0), 100);
  const homeSharePct = 100 - publicSharePct;
  const evBlendedPricePerKwh =
    (p.homeOffPeakPricePerKwh * homeSharePct + p.publicFastPricePerKwh * publicSharePct) / 100;
  const evAnnual = hundredKmPerYear * p.evKwhPer100km * evBlendedPricePerKwh;
  const evPer100km = p.evKwhPer100km * evBlendedPricePerKwh;
  const evPerKm = evPer100km / 100;

  const savingsAnnual = petrolAnnual - evAnnual;
  const savingsPct = petrolAnnual > 0 ? (savingsAnnual / petrolAnnual) * 100 : 0;
  const savingsWeekly = savingsAnnual / 52;
  const savings5Year = savingsAnnual * 5;

  return {
    petrolAnnual,
    petrolPer100km,
    petrolPerKm,
    homeSharePct,
    publicSharePct,
    evBlendedPricePerKwh,
    evAnnual,
    evPer100km,
    evPerKm,
    savingsAnnual,
    savingsPct,
    savingsWeekly,
    savings5Year,
  };
}

export interface CarTcoResult {
  purchasePrice: number;
  annualRunningCosts: number;
  years: number;
  tcoOverYears: number; // gross cash outlay: purchase + running costs over the period
  costPerWeek: number;
  costPerMonth: number;
  runningCostsShare: number; // % of gross TCO that is running costs
  depreciationRate: number;
  estimatedResaleValue: number;
  totalDepreciation: number;
  depreciationAnnual: number;
  totalRunningCosts: number;
  netEconomicCost: number; // true economic cost: totalDepreciation + totalRunningCosts
  netCostPerWeek: number;
  netCostPerMonth: number;
  depreciationShare: number;
}

/**
 * Total cost of ownership of a first car: purchase price plus all running
 * costs (rego, CTP, insurance, fuel, servicing, repairs) and depreciation over a period.
 *
 * Depreciation is modeled using reducing balance depreciation (~15%/yr typical for used cars)
 * with a realistic residual scrap floor of $1,000.
 *
 * The classic teen trap is buying cheap and paying dearly to run it, or financing a $15k+ car
 * where depreciation + loan interest + insurance blows away savings.
 */
export function firstCarTotalCostOfOwnership(
  purchasePrice: number,
  annualRunningCosts: number,
  years: number = 5,
  depreciationRate: number = 0.15
): CarTcoResult {
  const safePrice = Math.max(purchasePrice, 0);
  const safeRunning = Math.max(annualRunningCosts, 0);
  const safeYears = Math.max(years, 1);
  const safeDepRate = Math.min(Math.max(depreciationRate, 0), 1);

  // Reducing balance depreciation with residual floor
  const estimatedResaleValue =
    safePrice === 0
      ? 0
      : Math.max(Math.min(1000, safePrice), Math.round(safePrice * Math.pow(1 - safeDepRate, safeYears)));
  const totalDepreciation = safePrice - estimatedResaleValue;
  const depreciationAnnual = Math.round(totalDepreciation / safeYears);

  const totalRunningCosts = safeRunning * safeYears;
  const tcoOverYears = safePrice + totalRunningCosts;
  const netEconomicCost = totalDepreciation + totalRunningCosts;

  const weeks = safeYears * 52;
  const months = safeYears * 12;

  return {
    purchasePrice: safePrice,
    annualRunningCosts: safeRunning,
    years: safeYears,
    tcoOverYears: Math.round(tcoOverYears),
    costPerWeek: Math.round((tcoOverYears / weeks) * 100) / 100,
    costPerMonth: Math.round((tcoOverYears / months) * 100) / 100,
    runningCostsShare: tcoOverYears > 0 ? totalRunningCosts / tcoOverYears : 0,
    depreciationRate: safeDepRate,
    estimatedResaleValue,
    totalDepreciation,
    depreciationAnnual,
    totalRunningCosts,
    netEconomicCost,
    netCostPerWeek: Math.round((netEconomicCost / weeks) * 100) / 100,
    netCostPerMonth: Math.round((netEconomicCost / months) * 100) / 100,
    depreciationShare: netEconomicCost > 0 ? totalDepreciation / netEconomicCost : 0,
  };
}

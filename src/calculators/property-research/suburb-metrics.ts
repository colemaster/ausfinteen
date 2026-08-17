/**
 * Suburb yield summary — pure functions for rental yield analysis.
 * All monetary values in AUD. Inputs: median price and weekly rent plus
 * optional holding costs for net yield.
 */

export interface SuburbMetrics {
  medianPrice: number;
  weeklyRent: number;
  /** Annual holding costs not covered by tenants (rates, insurance, strata). */
  annualHoldingCosts?: number;
  /** Property management fee as % of annual rent (e.g. 7 for 7%). */
  managementFeePct?: number;
  /** Vacancy allowance as % of annual rent (e.g. 3 for 3%). */
  vacancyPct?: number;
}

export interface SuburbYieldRow {
  metric: string;
  value: string;
}

export interface SuburbYieldSummary {
  grossYieldPct: number;      // annual rent / median price
  netYieldPct: number;        // after management, vacancy and holding costs
  priceToRentRatio: number;   // median price / annual rent
  monthlyRent: number;
  annualRent: number;
  rows: SuburbYieldRow[];     // display-ready rows
}

/**
 * Build a suburb yield summary table from checklist research data.
 *
 * Assumptions:
 * - Weekly rent is market rent for a comparable property.
 * - Gross yield = weekly rent × 52 / median price.
 * - Net yield deducts management fees, vacancy allowance and annual holding
 *   costs from gross rent.
 */
export function suburbYieldSummary(metrics: SuburbMetrics): SuburbYieldSummary {
  const { medianPrice, weeklyRent } = metrics;
  const annualRent = weeklyRent * 52;
  const monthlyRent = (weeklyRent * 52) / 12;
  const grossYieldPct =
    medianPrice > 0 ? (annualRent / medianPrice) * 100 : 0;

  const managementPct = (metrics.managementFeePct ?? 7) / 100;
  const vacancyPct = (metrics.vacancyPct ?? 3) / 100;
  const holdingCosts = metrics.annualHoldingCosts ?? 0;
  const netAnnualRent =
    annualRent * (1 - managementPct - vacancyPct) - holdingCosts;
  const netYieldPct =
    medianPrice > 0 ? (netAnnualRent / medianPrice) * 100 : 0;

  const priceToRentRatio = annualRent > 0 ? medianPrice / annualRent : 0;

  const rows: SuburbYieldRow[] = [
    { metric: 'Median price', value: `$${Math.round(medianPrice).toLocaleString('en-AU')}` },
    { metric: 'Weekly rent', value: `$${weeklyRent.toFixed(0)}/wk` },
    { metric: 'Monthly rent', value: `$${Math.round(monthlyRent).toLocaleString('en-AU')}/mo` },
    { metric: 'Annual rent', value: `$${Math.round(annualRent).toLocaleString('en-AU')}/yr` },
    { metric: 'Gross rental yield', value: `${grossYieldPct.toFixed(2)}%` },
    { metric: 'Net rental yield', value: `${netYieldPct.toFixed(2)}%` },
    { metric: 'Price-to-rent ratio', value: `${priceToRentRatio.toFixed(1)}×` },
    { metric: 'Management + vacancy', value: `${(metrics.managementFeePct ?? 7) + (metrics.vacancyPct ?? 3)}% of rent` },
    { metric: 'Annual holding costs', value: `$${Math.round(holdingCosts).toLocaleString('en-AU')}/yr` },
  ];

  return {
    grossYieldPct: Math.round(grossYieldPct * 100) / 100,
    netYieldPct: Math.round(netYieldPct * 100) / 100,
    priceToRentRatio: Math.round(priceToRentRatio * 10) / 10,
    monthlyRent: Math.round(monthlyRent),
    annualRent: Math.round(annualRent),
    rows,
  };
}

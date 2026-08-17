/**
 * Teen Brisbane Engine — 50-cent public transport fare savings calculator.
 *
 * From 5 August 2024 the QLD government capped public transport fares at
 * $0.50 per trip (Go Card / smart ticketing, Translink) — extended to June
 * 2026 and then made permanent at $0.50. This models the weekly, monthly and
 * yearly savings vs the previous (2023-24) average fare.
 */

export interface FiftyCentFareSavingsParams {
  tripsPerWeek: number;
  /** Old average fare per trip before the $0.50 cap (e.g. $4.15 peak Go Card). */
  oldAverageFare: number;
  newFare: number;
}

export interface FiftyCentFareSavingsResult {
  tripsPerWeek: number;
  newFare: number;
  oldAverageFare: number;
  newWeeklyCost: number;
  oldWeeklyCost: number;
  savedWeekly: number;
  savedMonthly: number;
  savedYearly: number;
  savingsPct: number;
}

/**
 * Compare weekly public transport spend at the old average fare vs the $0.50
 * flat fare. Monthly uses 52/12 weeks; yearly uses 52 weeks.
 */
export function fiftyCentFareSavings(
  params: FiftyCentFareSavingsParams
): FiftyCentFareSavingsResult {
  const trips = Math.max(Math.round(params.tripsPerWeek), 0);
  const newFare = Math.max(params.newFare, 0);
  const oldFare = Math.max(params.oldAverageFare, 0);

  const newWeeklyCost = trips * newFare;
  const oldWeeklyCost = trips * oldFare;
  const savedWeekly = oldWeeklyCost - newWeeklyCost;

  return {
    tripsPerWeek: trips,
    newFare,
    oldAverageFare: oldFare,
    newWeeklyCost,
    oldWeeklyCost,
    savedWeekly,
    savedMonthly: savedWeekly * (52 / 12),
    savedYearly: savedWeekly * 52,
    savingsPct: oldWeeklyCost > 0 ? (savedWeekly / oldWeeklyCost) * 100 : 0,
  };
}
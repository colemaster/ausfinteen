/**
 * Teen Debt Engine — Buy-Now-Pay-Later (BNPL) late-fee cascade modelling and
 * weekly payoff planning for Australian teens.
 *
 * BNPL is advertised as "interest free", but late fees (typically ~$10-15 per
 * missed installment) and a missed-payment cascade can make the true cost
 * substantially higher than the sticker price.
 */

export interface LateFeeStep {
  installment: number;   // 1-based missed installment number
  fee: number;           // Fee charged for this missed installment
  cumulativeFees: number;
}

export interface BnplCascadeResult {
  installmentCount: number;
  missedInstallments: number;
  feePerLatePayment: number;
  escalationRate: number; // multiplier applied to each subsequent missed fee
  totalFees: number;
  totalCost: number;      // purchase price + total fees
  markupPct: number;      // fees as a % of the purchase price
  steps: LateFeeStep[];
}

/**
 * Model the escalating cost of missing BNPL installments.
 *
 * Assumptions:
 * - Each missed installment incurs a late fee; with a cascade (escalation)
 *   the fee grows by `escalationRate` each successive missed installment
 *   (e.g. 1.5x: $15, then $22.50, then $33.75...).
 * - Missed installments beyond the total installment count are clamped.
 * - If no installments are missed, no fees apply.
 */
export function bnplLateFeeCascade(
  purchasePrice: number,
  installmentCount: number,
  missedInstallments: number,
  feePerLatePayment: number = 15,
  escalationRate: number = 1.5
): BnplCascadeResult {
  const safePrice = Math.max(purchasePrice, 0);
  const safeCount = Math.max(Math.round(installmentCount), 1);
  const missed = Math.min(Math.max(Math.round(missedInstallments), 0), safeCount);

  // A zero-priced item has no BNPL plan and can't attract fees.
  if (safePrice === 0) {
    return {
      installmentCount: safeCount,
      missedInstallments: missed,
      feePerLatePayment,
      escalationRate,
      totalFees: 0,
      totalCost: 0,
      markupPct: 0,
      steps: [],
    };
  }

  const steps: LateFeeStep[] = [];
  let cumulativeFees = 0;
  for (let i = 1; i <= missed; i++) {
    const fee = feePerLatePayment * Math.pow(escalationRate, i - 1);
    cumulativeFees += fee;
    steps.push({
      installment: i,
      fee: Math.round(fee * 100) / 100,
      cumulativeFees: Math.round(cumulativeFees * 100) / 100,
    });
  }

  return {
    installmentCount: safeCount,
    missedInstallments: missed,
    feePerLatePayment,
    escalationRate,
    totalFees: Math.round(cumulativeFees * 100) / 100,
    totalCost: Math.round((safePrice + cumulativeFees) * 100) / 100,
    markupPct: safePrice > 0 ? (cumulativeFees / safePrice) * 100 : 0,
    steps,
  };
}

export interface WeeklyPayoffPlan {
  purchasePrice: number;
  payoffWeeks: number;
  weeklyPayment: number;  // Required weekly payment to clear the purchase
  totalPaid: number;      // = purchase price (no interest, no fees if on time)
}

/**
 * Work out the weekly payment required to pay off a BNPL purchase in a chosen
 * number of weeks. Zero or negative week counts are guarded to 1 week.
 */
export function weeklyPayoffPlan(
  purchasePrice: number,
  payoffWeeks: number
): WeeklyPayoffPlan {
  const safePrice = Math.max(purchasePrice, 0);
  const weeks = Math.max(Math.round(payoffWeeks), 1);
  return {
    purchasePrice: safePrice,
    payoffWeeks: weeks,
    weeklyPayment: Math.round((safePrice / weeks) * 100) / 100,
    totalPaid: safePrice,
  };
}
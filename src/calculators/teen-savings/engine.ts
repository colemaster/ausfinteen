/**
 * Teen Savings Engine — compound interest projections for youth savings
 * accounts. Banks advertise a bonus rate p.a. but it is applied monthly,
 * so compounding frequency matters for the 1-year projection.
 */

export interface SavingsProjection {
  startingBalance: number;
  monthlyDeposit: number;
  months: number;
  totalDeposited: number;
  interestEarned: number;
  endingBalance: number;
}

/**
 * Monthly-compounding savings projection with a monthly deposit.
 * The annual rate is converted to a monthly rate (r/12) and applied each
 * month. Zero or negative month counts are guarded to 1 month.
 */
export function savingsWithMonthlyCompound(
  startingBalance: number,
  annualRatePct: number,
  months: number,
  monthlyDeposit: number
): SavingsProjection {
  const balance = Math.max(startingBalance, 0);
  const deposit = Math.max(monthlyDeposit, 0);
  const monthCount = Math.max(Math.round(months), 1);
  const monthlyRate = Math.max(annualRatePct, 0) / 100 / 12;

  let working = balance;
  let interest = 0;
  for (let m = 0; m < monthCount; m++) {
    working += deposit;
    const monthInterest = working * monthlyRate;
    working += monthInterest;
    interest += monthInterest;
  }

  return {
    startingBalance: balance,
    monthlyDeposit: deposit,
    months: monthCount,
    totalDeposited: balance + deposit * monthCount,
    interestEarned: interest,
    endingBalance: working,
  };
}

/**
 * Simple-interest (no monthly compounding) comparison baseline: interest is
 * paid once at the end of the year on the average balance.
 */
export function savingsWithSimpleInterest(
  startingBalance: number,
  annualRatePct: number,
  months: number,
  monthlyDeposit: number
): SavingsProjection {
  const balance = Math.max(startingBalance, 0);
  const deposit = Math.max(monthlyDeposit, 0);
  const monthCount = Math.max(Math.round(months), 1);
  const rate = Math.max(annualRatePct, 0) / 100;

  const totalDeposited = balance + deposit * monthCount;
  const averageBalance = balance + (deposit * monthCount) / 2;
  const interest = averageBalance * rate * (monthCount / 12);

  return {
    startingBalance: balance,
    monthlyDeposit: deposit,
    months: monthCount,
    totalDeposited,
    interestEarned: interest,
    endingBalance: totalDeposited + interest,
  };
}
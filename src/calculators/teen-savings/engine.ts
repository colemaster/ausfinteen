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

export interface GoalProjection {
  targetAmount: number;
  startingBalance: number;
  monthlyDeposit: number;
  annualRatePct: number;
  monthsToReach: number;
  weeksToReach: number;
  totalDeposited: number;
  interestEarned: number;
  finalBalance: number;
}

/**
 * Calculates the number of months required to reach a specific target savings goal
 * with monthly compounding interest and monthly deposits.
 */
export function calcMonthsToReachGoal(
  startingBalance: number,
  targetAmount: number,
  monthlyDeposit: number,
  annualRatePct: number
): GoalProjection {
  const start = Math.max(startingBalance, 0);
  const target = Math.max(targetAmount, start);
  const deposit = Math.max(monthlyDeposit, 0);
  const monthlyRate = Math.max(annualRatePct, 0) / 100 / 12;

  if (start >= target) {
    return {
      targetAmount: target,
      startingBalance: start,
      monthlyDeposit: deposit,
      annualRatePct,
      monthsToReach: 0,
      weeksToReach: 0,
      totalDeposited: 0,
      interestEarned: 0,
      finalBalance: start,
    };
  }

  // If savings cannot grow toward target: zero deposits and zero balance or zero rate
  if (deposit <= 0 && (start <= 0 || monthlyRate <= 0)) {
    return {
      targetAmount: target,
      startingBalance: start,
      monthlyDeposit: 0,
      annualRatePct,
      monthsToReach: Infinity,
      weeksToReach: Infinity,
      totalDeposited: 0,
      interestEarned: 0,
      finalBalance: start,
    };
  }

  let balance = start;
  let months = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  const maxMonths = 1200; // 100-year guard

  while (balance < target && months < maxMonths) {
    months++;
    balance += deposit;
    totalDeposits += deposit;
    const interest = balance * monthlyRate;
    balance += interest;
    totalInterest += interest;
  }

  const reached = balance >= target;
  const weeks = reached ? Math.round((months * 52) / 12) : Infinity;

  return {
    targetAmount: target,
    startingBalance: start,
    monthlyDeposit: deposit,
    annualRatePct,
    monthsToReach: reached ? months : Infinity,
    weeksToReach: weeks,
    totalDeposited: totalDeposits,
    interestEarned: totalInterest,
    finalBalance: balance,
  };
}
/**
 * Teen Savings Engine — compound interest projections, milestone tracking,
 * and criteria evaluation for Australian youth savings accounts (2026-27).
 * Banks advertise a bonus rate p.a. but it is applied monthly,
 * so compounding frequency matters for projections and goal timelines.
 */

import type { TeenSavingsAccount } from '@/data/teen-finance-data';

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

export interface GoalMilestone {
  percent: number;
  label: string;
  badge: string;
  amount: number;
  monthsToReach: number;
  weeksToReach: number;
  projectedDate: string;
  reached: boolean;
  interestEarned: number;
  totalDeposited: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Computes calendar date after adding given months.
 */
export function formatProjectedDate(baseDate: Date, monthsToAdd: number): string {
  if (monthsToAdd === Infinity || isNaN(monthsToAdd)) return 'N/A';
  const d = new Date(baseDate.getTime());
  d.setMonth(d.getMonth() + Math.round(monthsToAdd));
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Calculates goal milestones at 25%, 50%, 75%, and 100% of target amount,
 * including projected calendar date and compound interest benefits.
 */
export function calcGoalMilestones(
  startingBalance: number,
  targetAmount: number,
  monthlyDeposit: number,
  annualRatePct: number,
  baseDate: Date = new Date()
): GoalMilestone[] {
  const tiers = [
    { percent: 25, label: '25% Quarter Foundation', badge: 'Habit Locked' },
    { percent: 50, label: '50% Halfway Milestone', badge: 'Halfway Hero' },
    { percent: 75, label: '75% The Home Stretch', badge: 'Almost There' },
    { percent: 100, label: '100% Goal Smashed! 🎉', badge: 'Champion' },
  ];

  return tiers.map(tier => {
    const tierTarget = Math.round((targetAmount * tier.percent) / 100);
    const proj = calcMonthsToReachGoal(startingBalance, tierTarget, monthlyDeposit, annualRatePct);
    const isReached = startingBalance >= tierTarget;
    const dateStr = isReached ? 'Already Hit!' : formatProjectedDate(baseDate, proj.monthsToReach);

    return {
      percent: tier.percent,
      label: tier.label,
      badge: tier.badge,
      amount: tierTarget,
      monthsToReach: proj.monthsToReach,
      weeksToReach: proj.weeksToReach,
      projectedDate: dateStr,
      reached: isReached,
      interestEarned: proj.interestEarned,
      totalDeposited: proj.totalDeposited,
    };
  });
}

export interface AccountHabits {
  monthlyDeposit: number;
  monthlyDebitCardPurchases: number;
  isBalanceGrowing: boolean;
  monthlyWithdrawals: number;
  userAge: number;
}

export interface AccountQualificationResult {
  bank: string;
  qualifies: boolean;
  effectiveRate: number;
  monthlyInterest: number;
  annualInterestOnBalance: number;
  twelveMonthProjection: SavingsProjection;
  reasons: string[];
  isAgeEligible: boolean;
  hasZeroAccountFees: boolean;
  hasWaiverApplied: boolean;
}

/**
 * Evaluates whether a teenager qualifies for a specific bank's high-interest bonus rate
 * based on their monthly deposit, debit purchases, balance growth, and age.
 */
export function evaluateAccountQualification(
  account: TeenSavingsAccount,
  habits: AccountHabits,
  currentBalance: number
): AccountQualificationResult {
  const reasons: string[] = [];
  const age = habits.userAge;
  const isAgeEligible = age >= account.minAge && age <= account.maxAge;

  if (!isAgeEligible) {
    reasons.push(`Age eligibility is ${account.minAge}–${account.maxAge === 99 ? 'Any' : account.maxAge} (user is ${age})`);
  }

  // Check Under 18 Waiver for BOQ Future Saver
  const isBOQWaiver = account.bank.includes('BOQ') && age >= 14 && age < 18;

  let qualifies = isAgeEligible;

  if (isBOQWaiver) {
    reasons.push('Bonus conditions waived for 14–17 year olds (Automatic 5.80% p.a.)');
  } else {
    // Deposit check
    const minDeposit = account.minMonthlyDeposit ?? 0;
    if (minDeposit > 0 && habits.monthlyDeposit < minDeposit) {
      qualifies = false;
      reasons.push(`Requires at least $${minDeposit}/mo deposit (currently $${habits.monthlyDeposit})`);
    }

    // Card purchases check
    const minPurchases = account.minCardPurchases ?? 0;
    if (minPurchases > 0 && habits.monthlyDebitCardPurchases < minPurchases) {
      qualifies = false;
      reasons.push(`Requires ${minPurchases}+ card purchases/mo (currently ${habits.monthlyDebitCardPurchases})`);
    }

    // Balance growth check
    if (account.requiresBalanceGrowth && !habits.isBalanceGrowing) {
      qualifies = false;
      reasons.push('Requires closing balance to be higher than opening balance each month');
    }

    // Withdrawal count check
    if (account.maxWithdrawals !== undefined && habits.monthlyWithdrawals > account.maxWithdrawals) {
      qualifies = false;
      reasons.push(`Requires ≤${account.maxWithdrawals} withdrawals/mo (currently ${habits.monthlyWithdrawals})`);
    }
  }

  const effectiveRate = qualifies ? account.maxRate : account.baseRate;
  const safeBalance = Math.max(0, currentBalance);
  const monthlyInterest = (safeBalance * (effectiveRate / 100)) / 12;
  const annualInterestOnBalance = (safeBalance * effectiveRate) / 100;
  const twelveMonthProjection = savingsWithMonthlyCompound(
    safeBalance,
    effectiveRate,
    12,
    habits.monthlyDeposit
  );

  return {
    bank: account.bank,
    qualifies,
    effectiveRate,
    monthlyInterest,
    annualInterestOnBalance,
    twelveMonthProjection,
    reasons,
    isAgeEligible,
    hasZeroAccountFees: true, // All genuine youth accounts are $0 monthly fee
    hasWaiverApplied: isBOQWaiver,
  };
}

/**
 * Deposit frequency conversion helper for teen paychecks.
 */
export function convertDepositFrequency(
  amount: number,
  from: 'weekly' | 'fortnightly' | 'monthly'
): {
  weekly: number;
  fortnightly: number;
  monthly: number;
  annual: number;
} {
  const safeAmount = Math.max(0, amount);
  let annual = 0;

  if (from === 'weekly') {
    annual = safeAmount * 52;
  } else if (from === 'fortnightly') {
    annual = safeAmount * 26;
  } else {
    annual = safeAmount * 12;
  }

  return {
    weekly: Math.round((annual / 52) * 100) / 100,
    fortnightly: Math.round((annual / 26) * 100) / 100,
    monthly: Math.round((annual / 12) * 100) / 100,
    annual: Math.round(annual * 100) / 100,
  };
}

export interface SinkingFundItem {
  name: string;
  amount: number;
  description: string;
  essential: boolean;
}

export interface SinkingFundPlan {
  category: 'formal' | 'car' | 'laptop' | 'emergency' | 'driving';
  title: string;
  targetAmount: number;
  items: SinkingFundItem[];
  recommendedRange: { min: number; max: number };
  tip: string;
}

/**
 * Pre-configured practical sinking fund breakdowns for Australian teen milestones.
 */
export function getSinkingFundPlan(category: 'formal' | 'car' | 'laptop' | 'emergency' | 'driving'): SinkingFundPlan {
  switch (category) {
    case 'formal':
      return {
        category: 'formal',
        title: 'Year 12 School Formal Budget',
        targetAmount: 850,
        recommendedRange: { min: 600, max: 1200 },
        tip: 'Hire suits or rent designer dresses through GlamCorner / The Volte to save $200–$400!',
        items: [
          { name: 'Formal Ticket / Venue Entry', amount: 160, description: 'School formal committee ticket fee', essential: true },
          { name: 'Outfit (Dress or Suit Hire/Buy)', amount: 350, description: 'Suit jacket/trousers or formal gown', essential: true },
          { name: 'Shoes & Accessories', amount: 140, description: 'Formal shoes, belt, tie/clutch', essential: true },
          { name: 'Hair, Makeup & Grooming', amount: 120, description: 'Barber fade or hair/makeup appointment', essential: false },
          { name: 'Transport & After-Party', amount: 80, description: 'Rideshare, group transport & photography', essential: false },
        ],
      };

    case 'car':
      return {
        category: 'car',
        title: 'First Used Car Purchase (Cash Only)',
        targetAmount: 5000,
        recommendedRange: { min: 3500, max: 6000 },
        tip: 'The $3,500–$6,000 range buys a reliable Japanese 4-cyl (Corolla, Civic, Yaris, i30) with roadworthy!',
        items: [
          { name: 'Vehicle Cash Purchase Price', amount: 4500, description: 'Private sale or dealer cash price with RWC', essential: true },
          { name: 'Pre-Purchase Mechanical Inspection', amount: 150, description: 'RACQ / RedBook mobile mechanical check', essential: true },
          { name: 'QLD/State Title Transfer Fee', amount: 33, description: 'Transport Department title transfer fee', essential: true },
          { name: 'State Vehicle Stamp Duty', amount: 135, description: '$3 per $100 dutiable value on 4-cyl/hybrid', essential: true },
          { name: 'PPSR Government Register Check', amount: 2, description: 'Official ppsr.gov.au check for finance owing & write-off', essential: true },
          { name: 'Initial Tank of Petrol & Detail', amount: 180, description: 'Full tank of ULP 91 + new wiper blades', essential: false },
        ],
      };

    case 'laptop':
      return {
        category: 'laptop',
        title: 'Senior School (Year 11/12) BYOD Laptop',
        targetAmount: 1400,
        recommendedRange: { min: 1000, max: 2000 },
        tip: 'Use Apple Education or JB Hi-Fi BYOD portal to score 10% educational discount + free gift cards!',
        items: [
          { name: 'Ultrabook Laptop (M2 MacBook / Windows)', amount: 1199, description: 'Education-priced 8GB/16GB 256GB SSD laptop', essential: true },
          { name: 'Protective Drop-Proof Sleeve & Bag', amount: 69, description: 'Cushioned school backpack sleeve', essential: true },
          { name: 'Accidental Damage Protection / AppleCare', amount: 119, description: '2-year warranty against cracked screen/water', essential: false },
          { name: 'USB-C Multiport Hub & Wireless Mouse', amount: 55, description: 'HDMI port + USB ports for school presentations', essential: false },
        ],
      };

    case 'emergency':
      return {
        category: 'emergency',
        title: 'Barefoot Teen Mojo Cushion ($500–$1,000)',
        targetAmount: 1000,
        recommendedRange: { min: 500, max: 1000 },
        tip: 'Keep your Mojo cushion in an account with NO linked debit card so you cannot impulse spend it!',
        items: [
          { name: 'Starter Safety Net (Phase 1)', amount: 500, description: 'Scott Pape Barefoot Step 1 starter buffer', essential: true },
          { name: 'Cracked Phone Screen Repair Buffer', amount: 220, description: 'Immediate cash to fix broken phone without loan', essential: true },
          { name: 'Medical / Dental Gap Buffer', amount: 150, description: 'GP consultation gap or prescription medicines', essential: true },
          { name: 'Emergency Ride / Urgent Travel Buffer', amount: 130, description: 'Emergency ride home safely from anywhere', essential: true },
        ],
      };

    case 'driving':
    default:
      return {
        category: 'driving',
        title: '10 Professional Driving Lessons (3-for-1 Rule)',
        targetAmount: 750,
        recommendedRange: { min: 650, max: 850 },
        tip: 'Under TMR/Transport rules, 10 instructor hours = 30 logbook hours, saving parents 20 hours!',
        items: [
          { name: 'PrepL / Learner Licence Fee', amount: 110, description: 'Online PrepL test + 3-year Learner licence', essential: true },
          { name: '10 x Professional Driving Lessons', amount: 640, description: 'Accredited instructor package ($64/hr avg)', essential: true },
        ],
      };
  }
}

/**
 * Calculates hours and standard 3-hour shifts required to earn a given dollar amount.
 */
export function calcHoursAndShiftsToWork(
  totalCost: number,
  hourlyWage: number,
  shiftHours = 3
): {
  hours: number;
  shifts: number;
  roundedHours: number;
  roundedShifts: number;
} {
  const safeCost = Math.max(0, totalCost);
  const safeWage = Math.max(1, hourlyWage);
  const safeShift = Math.max(1, shiftHours);

  const hours = safeCost / safeWage;
  const shifts = hours / safeShift;

  return {
    hours: Math.round(hours * 10) / 10,
    shifts: Math.round(shifts * 10) / 10,
    roundedHours: Math.ceil(hours),
    roundedShifts: Math.ceil(shifts),
  };
}

/**
 * Calculates the Effective Annual Rate (EAR) given a nominal annual interest rate
 * and compounding frequency (default 12 for monthly compounding).
 * Formula: EAR = (1 + r / n)^n - 1
 */
export function calcEffectiveAnnualRate(
  nominalRatePct: number,
  compoundingPeriodsPerYear: number = 12
): number {
  if (nominalRatePct <= 0 || compoundingPeriodsPerYear <= 0) return 0;
  const r = nominalRatePct / 100;
  const n = compoundingPeriodsPerYear;
  const ear = Math.pow(1 + r / n, n) - 1;
  return ear * 100;
}

/**
 * Calculates real rate of return adjusted for inflation using the exact Fisher equation:
 * (1 + r_nominal) = (1 + r_real) * (1 + inflation)
 * => r_real = ((1 + r_nominal) / (1 + inflation) - 1)
 */
export function calcRealRateOfReturn(
  nominalRatePct: number,
  annualInflationPct: number
): number {
  const nominal = nominalRatePct / 100;
  const inflation = annualInflationPct / 100;
  if (inflation <= -1) return nominalRatePct;
  const realRate = (1 + nominal) / (1 + inflation) - 1;
  return realRate * 100;
}

/**
 * Calculates future purchasing power of a cash balance after inflation.
 * Formula: Real Value = Nominal Balance / (1 + i)^years
 */
export function calcRealPurchasingPower(
  nominalBalance: number,
  annualInflationPct: number,
  years: number
): number {
  const balance = Math.max(nominalBalance, 0);
  const inflation = annualInflationPct / 100;
  const t = Math.max(years, 0);
  if (inflation <= -1) return balance;
  return balance / Math.pow(1 + inflation, t);
}

export interface TermDepositProjection {
  principal: number;
  annualRatePct: number;
  termMonths: number;
  totalInterest: number;
  maturityBalance: number;
  effectiveMonthlyYield: number;
}

/**
 * Calculates maturity value and interest for an Australian fixed Term Deposit.
 * Australian term deposits under 12 months typically pay simple interest at maturity.
 */
export function calcTermDepositReturn(
  principal: number,
  annualRatePct: number,
  termMonths: number
): TermDepositProjection {
  const p = Math.max(principal, 0);
  const r = Math.max(annualRatePct, 0) / 100;
  const months = Math.max(Math.round(termMonths), 1);
  const totalInterest = p * r * (months / 12);
  const maturityBalance = p + totalInterest;
  const effectiveMonthlyYield = months > 0 ? totalInterest / months : 0;

  return {
    principal: p,
    annualRatePct,
    termMonths: months,
    totalInterest,
    maturityBalance,
    effectiveMonthlyYield,
  };
}


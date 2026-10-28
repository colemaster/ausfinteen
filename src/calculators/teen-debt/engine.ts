/**
 * Teen Debt Engine — Buy-Now-Pay-Later (BNPL) late-fee cascade modelling,
 * multi-account snowball stacking, and Comprehensive Credit Reporting (CCR) risk engine
 * for Australian consumers.
 *
 * Statutory Framework:
 * 1. Treasury Laws Amendment (Responsible Buy Now Pay Later and Other Measures) Act 2024:
 *    - Amends the National Consumer Credit Protection Act 2009 (NCCP Act).
 *    - Classifies BNPL products as Low-Cost Credit Contracts (LCCCs).
 *    - Mandatory Australian Credit Licences (ACL) issued by ASIC.
 *    - Scalable unsuitability assessments (ASIC Regulatory Guide 281 / RG 281).
 *    - Statutory fee caps under NCCP Regulation 69G:
 *      * Combined default & non-default: max $200 (Yr 1) / $125 (subsequent yrs) non-default fees
 *        plus max $120/yr default fees per customer.
 *      * Default fees only: max $320 (Yr 1) / $245 (subsequent yrs) default fees per customer.
 *    - Mandatory dispute resolution via Australian Financial Complaints Authority (AFCA on 1800 931 678).
 *    - Mandatory Section 72 hardship variation rights with 21-day statutory written response timeframe.
 *
 * 2. Comprehensive Credit Reporting (CCR) under Privacy Act 1988 Part IIIA:
 *    - 24 Months: Repayment History Information (RHI) records late repayments (0 to X scale).
 *    - 12 Months: Financial Hardship Information (FHI) arrangements ('A' or 'V' flags).
 *    - 5 Years: Overdue Consumer Defaults ($150+ and 60+ days overdue, requiring Section 6Q
 *      demand notice and Section 21D(3)(d) 14-day warning notice) remain on credit files
 *      across Equifax (score 0–1,200), Experian (score 0–1,000), and illion (score 0–1,000).
 *    - 5 Years: Hard credit inquiries and court judgments.
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
  hasCcrDefaultRisk: boolean; // default risk if >= $150 and severely delinquent (60+ days)
  ccrDefaultYears: number;    // 5 years under Privacy Act Part IIIA
  rhiMonths: number;          // 24 months Repayment History Information
  ccrWarningMessage?: string;
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
 * - Statutory CCR Rule: Under Australian law (Privacy Act 1988 Part IIIA Section 6Q & 21D),
 *   debts of $150+ that are 60+ days overdue can be listed as a Credit Default for 5 years.
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
      hasCcrDefaultRisk: false,
      ccrDefaultYears: 5,
      rhiMonths: 24,
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

  const totalFees = Math.round(cumulativeFees * 100) / 100;
  const totalCost = Math.round((safePrice + cumulativeFees) * 100) / 100;

  // CCR Default condition: debt >= $150 and delinquent across all or >= 4 missed installments (~60 days)
  const hasCcrDefaultRisk = totalCost >= 150 && missed >= Math.min(safeCount, 4);
  let ccrWarningMessage: string | undefined;

  if (hasCcrDefaultRisk) {
    ccrWarningMessage =
      'CRITICAL: Unpaid BNPL balance >= $150 with 60+ days delinquency qualifies for formal Credit Default listing on Equifax, Experian, and illion (lasting 5 YEARS on credit file under Privacy Act s6Q/s21D).';
  } else if (missed > 0) {
    ccrWarningMessage =
      'Repayment History Information (RHI) records late payments on your credit file for 24 MONTHS under Comprehensive Credit Reporting (CCR).';
  }

  return {
    installmentCount: safeCount,
    missedInstallments: missed,
    feePerLatePayment,
    escalationRate,
    totalFees,
    totalCost,
    markupPct: safePrice > 0 ? (cumulativeFees / safePrice) * 100 : 0,
    steps,
    hasCcrDefaultRisk,
    ccrDefaultYears: 5,
    rhiMonths: 24,
    ccrWarningMessage,
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

// ---------------------------------------------------------------------------
// 2026-2027 Multi-Account BNPL Snowball & Stacking Engine
// ---------------------------------------------------------------------------

export interface BnplProviderRule {
  id: string;
  provider: string;
  category: string;
  licenceType: string;
  edrScheme: string;
  repaymentSchedule: string;
  monthlyFee: number;
  monthlyFeeDetails: string;
  initialLateFee: number;
  subsequentLateFee: number;
  lateFeeCapDescription: string;
  maxLateFeePerOrder?: number;
  maxLateFeePercent?: number;
  ccrReporting: {
    rhiMonths: number;
    defaultThreshold: number;
    defaultOverdueDays: number;
    defaultRetentionYears: number;
  };
  notes: string;
}

export const BNPL_PROVIDER_RULES: Record<string, BnplProviderRule> = {
  afterpay: {
    id: 'afterpay',
    provider: 'Afterpay',
    category: 'Low-Cost Credit Contract (LCCC) under NCCP Act',
    licenceType: 'Australian Credit Licence (ACL) from ASIC',
    edrScheme: 'AFCA (1800 931 678)',
    repaymentSchedule: '4 fortnightly instalments (equal quarters)',
    monthlyFee: 0,
    monthlyFeeDetails: '$0 account-keeping or monthly fees',
    initialLateFee: 10,
    subsequentLateFee: 7,
    lateFeeCapDescription: 'Capped at 25% of purchase value or $68 maximum per order (orders < $40 capped at a single $10 fee)',
    maxLateFeePerOrder: 68,
    maxLateFeePercent: 25,
    ccrReporting: {
      rhiMonths: 24,
      defaultThreshold: 150,
      defaultOverdueDays: 60,
      defaultRetentionYears: 5,
    },
    notes: 'Orders under $40 attract a single $10 fee. Orders $40+ charge $10 initially, plus $7 after 7 days if still unpaid, capped at min(25%, $68).',
  },
  zip: {
    id: 'zip',
    provider: 'Zip Pay',
    category: 'Revolving Line of Credit / LCCC (up to $1,000)',
    licenceType: 'Australian Credit Licence (ACL) from ASIC',
    edrScheme: 'AFCA (1800 931 678)',
    repaymentSchedule: 'Flexible monthly repayments (minimum $40/mo or 3% of balance)',
    monthlyFee: 9.95,
    monthlyFeeDetails: '$9.95/month account fee (waived if statement balance is $0 by due date)',
    initialLateFee: 15,
    subsequentLateFee: 0,
    lateFeeCapDescription: '$15 late fee if minimum payment not received within 21 days of statement due date; capped under NCCP Reg 69G ($120/yr default fees)',
    maxLateFeePerOrder: 120,
    ccrReporting: {
      rhiMonths: 24,
      defaultThreshold: 150,
      defaultOverdueDays: 60,
      defaultRetentionYears: 5,
    },
    notes: 'Revolving credit account. A monthly $9.95 fee applies whenever a balance is carried past month-end ($119.40/yr, within NCCP Reg 69G $125 non-default fee limit).',
  },
  klarna: {
    id: 'klarna',
    provider: 'Klarna',
    category: 'Low-Cost Credit Contract (LCCC) under NCCP Act',
    licenceType: 'Australian Credit Licence (ACL) from ASIC',
    edrScheme: 'AFCA (1800 931 678)',
    repaymentSchedule: '4 fortnightly instalments (Pay in 4)',
    monthlyFee: 0,
    monthlyFeeDetails: '$0 account-keeping or monthly fees',
    initialLateFee: 3,
    subsequentLateFee: 3,
    lateFeeCapDescription: '$0 on orders < $25; $2/missed payment on orders $25–$59.99 (max $6/order); $3–$5 for orders $50+ (capped at $9–$15 or 25% of purchase)',
    maxLateFeePerOrder: 15,
    maxLateFeePercent: 25,
    ccrReporting: {
      rhiMonths: 24,
      defaultThreshold: 150,
      defaultOverdueDays: 60,
      defaultRetentionYears: 5,
    },
    notes: 'Allows 1 free 7-day payment extension per order in the Klarna app before payment becomes overdue.',
  },
  paypal: {
    id: 'paypal',
    provider: 'PayPal Pay in 4',
    category: 'Low-Cost Credit Contract (LCCC) under NCCP Act',
    licenceType: 'Australian Credit Licence (ACL) from ASIC',
    edrScheme: 'AFCA (1800 931 678)',
    repaymentSchedule: '4 fortnightly instalments (Pay in 4)',
    monthlyFee: 0,
    monthlyFeeDetails: '$0 account-keeping or monthly fees',
    initialLateFee: 0,
    subsequentLateFee: 0,
    lateFeeCapDescription: '$0 late fees charged by PayPal in Australia (abolished Oct 2021). However, bank dishonour fees ($10–$15) apply if auto-debit fails.',
    maxLateFeePerOrder: 0,
    ccrReporting: {
      rhiMonths: 24,
      defaultThreshold: 150,
      defaultOverdueDays: 60,
      defaultRetentionYears: 5,
    },
    notes: 'Zero late fees from PayPal, but missed payments freeze your account, risk bank dishonour charges, and trigger CCR default reporting if unpaid at 60+ days ($150+).',
  },
};

export interface BnplAccountItem {
  id: string;
  name: string;
  provider: string; // 'Afterpay' | 'Zip' | 'Klarna' | 'PayPal Pay in 4' | 'Other'
  balance: number;
  fortnightlyPayment: number;
  feePerLatePayment: number; // typically $0 - $15
  missedPayments: number;
  monthlyFee?: number; // e.g. $9.95 for Zip Pay
  notes?: string;
}

export const DEFAULT_STACKED_ACCOUNTS: BnplAccountItem[] = [
  {
    id: 'afterpay',
    name: 'Afterpay',
    provider: 'Afterpay',
    balance: 240,
    fortnightlyPayment: 60,
    feePerLatePayment: 10,
    missedPayments: 1,
    notes: '$10 initial fee + $7 after 7 days (capped at 25% or $68)',
  },
  {
    id: 'zip',
    name: 'Zip Pay',
    provider: 'Zip Pay',
    balance: 350,
    fortnightlyPayment: 40,
    feePerLatePayment: 15,
    missedPayments: 2,
    monthlyFee: 9.95,
    notes: '$9.95 monthly fee + $15 late fee after 21 days',
  },
  {
    id: 'klarna',
    name: 'Klarna',
    provider: 'Klarna',
    balance: 180,
    fortnightlyPayment: 45,
    feePerLatePayment: 5,
    missedPayments: 1,
    notes: '$3–$5 late fees capped at $15 or 25%',
  },
  {
    id: 'paypal',
    name: 'PayPal Pay in 4',
    provider: 'PayPal Pay in 4',
    balance: 220,
    fortnightlyPayment: 55,
    feePerLatePayment: 0,
    missedPayments: 0,
    notes: '$0 late fees; bank dishonour fee applies if auto-debit fails',
  },
];

export interface StackedBnplAccountResult {
  id: string;
  name: string;
  provider: string;
  balance: number;
  fortnightlyPayment: number;
  missedPayments: number;
  lateFees: number;
  totalOwed: number;
  hasCcrDefaultRisk: boolean;
  hasRhiFlag: boolean;
}

export interface StackedReliefStep {
  step: number;
  title: string;
  badge: string;
  action: string;
  contact?: string;
  details: string;
  isUrgent: boolean;
}

export interface StackedBnplResult {
  accounts: StackedBnplAccountResult[];
  activeAccountsCount: number;
  overdueAccountsCount: number;
  totalOriginalBalance: number;
  totalFortnightlyCommitment: number;
  totalMonthlyCommitment: number;
  totalLateFees: number;
  totalTrueOwed: number;
  cascadingFeePercentage: number;
  hasCcrDefaultRisk: boolean;
  accountsAtDefaultRiskCount: number;
  ccrDefaultYears: number; // 5 years
  rhiMonths: number;        // 24 months
  weeklyBudget: number;
  snowballPayoffWeeks: number;
  avalanchePayoffWeeks: number;
  snowballWeeklyPayment: number;
  avalancheWeeklyPayment: number;
  snowballOrder: string[];
  avalancheOrder: string[];
  reliefSteps: StackedReliefStep[];
}

/**
 * Calculate the cascading cost, multi-account snowball commitment,
 * and Comprehensive Credit Reporting (CCR) risk for stacked BNPL accounts.
 */
export function calculateStackedBnpl(
  accounts: BnplAccountItem[],
  customWeeklyBudget?: number
): StackedBnplResult {
  const processedAccounts: StackedBnplAccountResult[] = accounts.map(acc => {
    const safeBalance = Math.max(0, acc.balance);
    const safeMissed = Math.max(0, acc.missedPayments);
    const safeFee = Math.max(0, acc.feePerLatePayment);

    // Each missed payment incurs a fee ($10-$15), with 1.25x cascade for subsequent misses
    let lateFees = 0;
    for (let i = 1; i <= safeMissed; i++) {
      lateFees += safeFee * Math.pow(1.25, i - 1);
    }
    lateFees = Math.round(lateFees * 100) / 100;
    const totalOwed = Math.round((safeBalance + lateFees) * 100) / 100;

    // Statutory CCR Default Rule: Debt >= $150 and 60+ days overdue (>= 3-4 missed fortnights)
    const hasCcrDefaultRisk = totalOwed >= 150 && safeMissed >= 3;
    const hasRhiFlag = safeMissed >= 1;

    return {
      id: acc.id,
      name: acc.name,
      provider: acc.provider,
      balance: safeBalance,
      fortnightlyPayment: Math.max(0, acc.fortnightlyPayment),
      missedPayments: safeMissed,
      lateFees,
      totalOwed,
      hasCcrDefaultRisk,
      hasRhiFlag,
    };
  });

  const activeAccounts = processedAccounts.filter(a => a.totalOwed > 0);
  const activeAccountsCount = activeAccounts.length;
  const overdueAccountsCount = processedAccounts.filter(a => a.missedPayments > 0).length;

  const totalOriginalBalance = processedAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalFortnightlyCommitment = processedAccounts.reduce((sum, a) => sum + a.fortnightlyPayment, 0);
  const totalMonthlyCommitment = Math.round((totalFortnightlyCommitment * 26) / 12);
  const totalLateFees = processedAccounts.reduce((sum, a) => sum + a.lateFees, 0);
  const totalTrueOwed = processedAccounts.reduce((sum, a) => sum + a.totalOwed, 0);

  const cascadingFeePercentage = totalOriginalBalance > 0
    ? Math.round((totalLateFees / totalOriginalBalance) * 1000) / 10
    : 0;

  const defaultRiskAccounts = processedAccounts.filter(a => a.hasCcrDefaultRisk);
  const accountsAtDefaultRiskCount = defaultRiskAccounts.length;
  const hasCcrDefaultRisk = accountsAtDefaultRiskCount > 0;

  // Payoff calculations
  const baselineWeekly = Math.max(25, Math.ceil(totalFortnightlyCommitment / 2));
  const weeklyBudget = Math.max(10, customWeeklyBudget ?? baselineWeekly);

  const snowballPayoffWeeks = totalTrueOwed > 0 ? Math.ceil(totalTrueOwed / weeklyBudget) : 0;
  // Avalanche prioritises accounts with highest fee rate/CCR default, saving time and late fees
  const avalanchePayoffWeeks = totalTrueOwed > 0
    ? Math.max(1, Math.ceil((totalTrueOwed - totalLateFees * 0.15) / weeklyBudget))
    : 0;

  // Ordering
  // Snowball: Lowest balance first for psychological momentum
  const snowballOrder = [...activeAccounts]
    .sort((a, b) => a.totalOwed - b.totalOwed)
    .map(a => `${a.name} ($${a.totalOwed.toFixed(0)})`);

  // Avalanche: Highest penalty / CCR default risk first
  const avalancheOrder = [...activeAccounts]
    .sort((a, b) => {
      if (a.hasCcrDefaultRisk !== b.hasCcrDefaultRisk) {
        return a.hasCcrDefaultRisk ? -1 : 1;
      }
      return b.lateFees - a.lateFees || b.totalOwed - a.totalOwed;
    })
    .map(a => `${a.name} ($${a.totalOwed.toFixed(0)})`);

  // Relief Steps (Statutory NCCP & National Debt Helpline Roadmap)
  const reliefSteps: StackedReliefStep[] = [
    {
      step: 1,
      title: 'Call National Debt Helpline (Free Financial Counselling)',
      badge: 'Immediate Action',
      action: 'Call 1800 007 007 or visit ndh.org.au for free, confidential, non-judgemental financial counselling.',
      contact: '1800 007 007',
      details: 'Community financial counsellors negotiate multi-creditor repayment moratoriums and fee waivers on your behalf.',
      isUrgent: hasCcrDefaultRisk || overdueAccountsCount >= 2,
    },
    {
      step: 2,
      title: 'Lodge Statutory Hardship Notices (NCCP s72)',
      badge: 'Legal Right',
      action: 'Email or message each BNPL provider (Afterpay, Zip, Klarna, PayPal) requesting hardship assistance.',
      details: 'Under Australian credit law (NCCP s72), providers must review hardship requests, freeze escalating late fees, and provide payment extensions without negative credit reporting during assessment.',
      isUrgent: true,
    },
    {
      step: 3,
      title: 'Revoke Direct Debit Authorities & Lock Card Debits',
      badge: 'Stop Bank Fees',
      action: 'Log into your bank app and cancel continuous card payment authorities or unlink cards from BNPL accounts.',
      details: 'Prevents banks from charging $10-$15 dishonour fees and overdraft penalties when BNPL payments attempt to draw from empty accounts.',
      isUrgent: overdueAccountsCount > 0,
    },
    {
      step: 4,
      title: 'Target Highest Risk Account First (Debt Avalanche)',
      badge: 'CCR Protection',
      action: hasCcrDefaultRisk
        ? `Immediately pay down ${defaultRiskAccounts.map(a => a.name).join(', ')} below $150.`
        : 'Focus excess payments on the highest-fee BNPL account while paying minimums on others.',
      details: 'Debts >= $150 at 60 days overdue trigger permanent 5-year credit defaults on Equifax and Experian files.',
      isUrgent: hasCcrDefaultRisk,
    },
    {
      step: 5,
      title: 'Order Free Credit Reports (Equifax, Experian, illion)',
      badge: 'Audit Credit File',
      action: 'Order free credit reports to audit Repayment History Information (24 months) and verify no false default entries.',
      contact: 'moneysmart.gov.au',
      details: 'Every Australian is legally entitled to a free credit report every 3 months from all major credit reporting bodies.',
      isUrgent: false,
    },
  ];

  return {
    accounts: processedAccounts,
    activeAccountsCount,
    overdueAccountsCount,
    totalOriginalBalance,
    totalFortnightlyCommitment,
    totalMonthlyCommitment,
    totalLateFees,
    totalTrueOwed,
    cascadingFeePercentage,
    hasCcrDefaultRisk,
    accountsAtDefaultRiskCount,
    ccrDefaultYears: 5,
    rhiMonths: 24,
    weeklyBudget,
    snowballPayoffWeeks,
    avalanchePayoffWeeks,
    snowballWeeklyPayment: weeklyBudget,
    avalancheWeeklyPayment: weeklyBudget,
    snowballOrder,
    avalancheOrder,
    reliefSteps,
  };
}

/**
 * Calculate the effective Annual Percentage Rate (APR) equivalent of BNPL late fees.
 * For example, a $15-$30 fee incurred over an 8-week cycle on a $120 item.
 */
export function calculateBnplEffectiveApr(
  purchasePrice: number,
  totalFees: number,
  loanTermWeeks: number = 8
): number {
  if (purchasePrice <= 0 || totalFees <= 0 || loanTermWeeks <= 0) return 0;
  const periodsPerYear = 52 / loanTermWeeks;
  const ratePerPeriod = totalFees / purchasePrice;
  return Math.round(ratePerPeriod * periodsPerYear * 1000) / 10;
}

/**
 * Estimate the reduction in home loan / mortgage borrowing capacity caused by an open BNPL facility.
 * Under APRA prudential standards and bank serviceability benchmarks (~3% monthly deemed commitment
 * on revolving credit, assessed at buffered interest rates), Australian lenders assess the total
 * approved credit limit as an ongoing commitment even if the balance is $0.
 *
 * Each $1,000 of open BNPL/credit limit reduces home loan borrowing power by approximately $12,500.
 */
export function estimateMortgageCapacityReduction(creditLimit: number): number {
  const safeLimit = Math.max(0, creditLimit);
  return Math.round(safeLimit * 12.5);
}

export interface ProviderFeeCalculationResult {
  lateFees: number;
  monthlyFees: number;
  totalFees: number;
  isCapped: boolean;
  capReason?: string;
  notes: string;
}

/**
 * Calculate provider-specific late fees incorporating published Australian fee schedules and statutory caps:
 * - Afterpay: $10 initial fee + $7 after 7 days, capped at min(25% of price, $68) (orders <$40 capped at $10 max)
 * - Zip Pay: $15 late fee if not paid within 21 days; $9.95 monthly fee if balance remains past due date
 * - Klarna: $3–$5 late fees ($0 on <$25, $2 on $25-$59.99), capped at $6–$15 or 25% of purchase
 * - PayPal Pay in 4: $0 late fees from PayPal (bank dishonour fees may apply separately)
 */
export function calculateProviderAccurateLateFees(
  providerKey: 'afterpay' | 'zip' | 'klarna' | 'paypal' | string,
  purchasePrice: number,
  missedInstallments: number,
  daysOverdue: number = 14
): ProviderFeeCalculationResult {
  const safePrice = Math.max(0, purchasePrice);
  const safeMissed = Math.max(0, Math.round(missedInstallments));

  if (safePrice === 0 || safeMissed === 0) {
    return {
      lateFees: 0,
      monthlyFees: 0,
      totalFees: 0,
      isCapped: false,
      notes: 'No fees incurred (payments made on time).',
    };
  }

  const key = providerKey.toLowerCase();

  if (key.includes('afterpay')) {
    // Orders < $40: maximum single late fee of $10
    if (safePrice < 40) {
      const maxByPct = Math.min(10, safePrice * 0.25);
      const fee = Math.min(10, Math.round(maxByPct * 100) / 100);
      return {
        lateFees: fee,
        monthlyFees: 0,
        totalFees: fee,
        isCapped: true,
        capReason: 'Afterpay orders under $40 are capped at a single $10 late fee (or 25% of order value).',
        notes: 'Single $10 maximum late fee applied for order under $40.',
      };
    }

    // Orders >= $40: $10 initial fee + $7 after 7 days per missed payment
    let uncappedFees = 0;
    for (let i = 1; i <= safeMissed; i++) {
      uncappedFees += 10;
      if (daysOverdue > 7 || i < safeMissed) {
        uncappedFees += 7; // second $7 fee if overdue > 7 days
      }
    }

    const maxByPct = safePrice * 0.25;
    const maxFee = Math.min(maxByPct, 68);
    const finalFee = Math.min(uncappedFees, maxFee);
    const isCapped = finalFee < uncappedFees;

    return {
      lateFees: Math.round(finalFee * 100) / 100,
      monthlyFees: 0,
      totalFees: Math.round(finalFee * 100) / 100,
      isCapped,
      capReason: isCapped
        ? maxByPct < 68
          ? `Afterpay late fee capped at 25% of purchase price ($${maxByPct.toFixed(2)})`
          : 'Afterpay late fee capped at $68 maximum per order'
        : undefined,
      notes: '$10 initial fee + $7 after 7 days per missed installment.',
    };
  }

  if (key.includes('zip')) {
    // Zip Pay: $15 late fee if minimum payment not received within 21 days
    // Plus $9.95 monthly account fee for each month an unpaid balance remains
    const monthlyFee = 9.95;
    const lateFeePerMiss = 15;
    const uncappedLateFees = safeMissed * lateFeePerMiss;
    // Statutory cap under NCCP Reg 69G: max $120/year default fees
    const cappedLateFees = Math.min(uncappedLateFees, 120);

    return {
      lateFees: cappedLateFees,
      monthlyFees: monthlyFee,
      totalFees: Math.round((cappedLateFees + monthlyFee) * 100) / 100,
      isCapped: cappedLateFees < uncappedLateFees,
      capReason: cappedLateFees < uncappedLateFees ? 'Capped at statutory $120/yr default fee limit (NCCP Reg 69G)' : undefined,
      notes: '$15 late fee per missed cycle + $9.95 monthly account-keeping fee.',
    };
  }

  if (key.includes('klarna')) {
    // Klarna:
    // Orders < $25: $0 late fee
    // Orders $25 - $59.99: $2 per missed installment (max $6 total per order)
    // Orders $50+: $3 - $5 per missed installment (max $15 or 25% of order)
    if (safePrice < 25) {
      return {
        lateFees: 0,
        monthlyFees: 0,
        totalFees: 0,
        isCapped: true,
        capReason: 'Klarna charges $0 late fees for orders under $25.',
        notes: '$0 late fees for micro-orders.',
      };
    }

    if (safePrice < 60) {
      const uncapped = safeMissed * 2;
      const finalFee = Math.min(uncapped, 6);
      return {
        lateFees: finalFee,
        monthlyFees: 0,
        totalFees: finalFee,
        isCapped: finalFee < uncapped,
        capReason: finalFee < uncapped ? 'Capped at $6 maximum for orders under $60' : undefined,
        notes: '$2 per missed installment (max $6/order).',
      };
    }

    // $60+
    const uncapped = safeMissed * 5; // $3 - $5 tier
    const maxByPct = safePrice * 0.25;
    const maxFee = Math.min(maxByPct, 15);
    const finalFee = Math.min(uncapped, maxFee);

    return {
      lateFees: finalFee,
      monthlyFees: 0,
      totalFees: finalFee,
      isCapped: finalFee < uncapped,
      capReason: finalFee < uncapped ? `Capped at Klarna $15 limit or 25% ($${maxFee.toFixed(2)})` : undefined,
      notes: '$3 to $5 per missed installment (capped at 25% or $15/order).',
    };
  }

  if (key.includes('paypal')) {
    // PayPal Pay in 4 charges $0 late fees in Australia
    return {
      lateFees: 0,
      monthlyFees: 0,
      totalFees: 0,
      isCapped: false,
      notes: '$0 late fees charged by PayPal in Australia. Note: Bank dishonour fee ($10–$15) may be charged by your bank if direct debit fails.',
    };
  }

  // Fallback generic
  const uncapped = safeMissed * 15;
  return {
    lateFees: uncapped,
    monthlyFees: 0,
    totalFees: uncapped,
    isCapped: false,
    notes: 'Generic $15 fee per missed payment.',
  };
}



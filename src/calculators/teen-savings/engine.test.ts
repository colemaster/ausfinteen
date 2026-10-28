import { describe, it, expect } from 'vitest';
import {
  savingsWithMonthlyCompound,
  savingsWithSimpleInterest,
  calcMonthsToReachGoal,
  calcGoalMilestones,
  evaluateAccountQualification,
  convertDepositFrequency,
  getSinkingFundPlan,
  calcHoursAndShiftsToWork,
  calcEffectiveAnnualRate,
  calcRealRateOfReturn,
  calcRealPurchasingPower,
  calcTermDepositReturn,
} from './engine';
import { TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';

describe('savingsWithMonthlyCompound', () => {
  it('projects 12 months of growth with monthly deposits at 5.25% p.a.', () => {
    const res = savingsWithMonthlyCompound(1500, 5.25, 12, 50);
    expect(res.totalDeposited).toBeCloseTo(2100, 5);
    expect(res.endingBalance).toBeGreaterThan(2100 + 2100 * (5.25 / 100) / 2);
    expect(res.interestEarned).toBeCloseTo(res.endingBalance - 2100, 5);
  });

  it('produces interest slightly higher than the simple-interest baseline', () => {
    const compound = savingsWithMonthlyCompound(1500, 5.25, 12, 50);
    const simple = savingsWithSimpleInterest(1500, 5.25, 12, 50);
    expect(compound.interestEarned).toBeGreaterThan(simple.interestEarned);
  });

  it('matches simple interest for one month (no compounding effect)', () => {
    const compound = savingsWithMonthlyCompound(1000, 12, 1, 0);
    const expected = 1000 * (0.12 / 12);
    expect(compound.interestEarned).toBeCloseTo(expected, 5);
    expect(compound.endingBalance).toBeCloseTo(1000 + expected, 5);
  });

  it('guards zero rate, zero balance and zero months', () => {
    const zeroRate = savingsWithMonthlyCompound(1000, 0, 12, 50);
    expect(zeroRate.endingBalance).toBeCloseTo(1600, 5);
    expect(zeroRate.interestEarned).toBe(0);

    const zeroBalance = savingsWithMonthlyCompound(0, 5, 12, 50);
    expect(zeroBalance.endingBalance).toBeGreaterThan(600);
    expect(zeroBalance.interestEarned).toBeGreaterThan(0);

    const zeroMonths = savingsWithMonthlyCompound(1000, 5, 0, 0);
    expect(zeroMonths.months).toBe(1);
  });
});

describe('savingsWithSimpleInterest', () => {
  it('pays interest on the average balance for the period', () => {
    const res = savingsWithSimpleInterest(1000, 6, 12, 100);
    expect(res.interestEarned).toBeCloseTo(96, 5);
    expect(res.endingBalance).toBeCloseTo(1000 + 1200 + 96, 5);
  });

  it('handles a partial-year projection', () => {
    const res = savingsWithSimpleInterest(1000, 6, 6, 0);
    expect(res.interestEarned).toBeCloseTo(30, 5);
  });

  it('handles zero balance and guards month count', () => {
    expect(savingsWithSimpleInterest(0, 6, 12, 0).endingBalance).toBe(0);
    expect(savingsWithSimpleInterest(1000, 6, -2, 0).months).toBe(1);
  });
});

describe('calcMonthsToReachGoal', () => {
  it('calculates time to reach $500 Mojo buffer with $100 monthly deposits', () => {
    const res = calcMonthsToReachGoal(150, 500, 100, 5.80);
    expect(res.monthsToReach).toBe(4);
    expect(res.weeksToReach).toBe(17);
    expect(res.finalBalance).toBeGreaterThanOrEqual(500);
    expect(res.totalDeposited).toBe(400);
    expect(res.interestEarned).toBeGreaterThan(0);
  });

  it('returns 0 months if starting balance is already at or above target', () => {
    const res = calcMonthsToReachGoal(500, 500, 50, 5.00);
    expect(res.monthsToReach).toBe(0);
    expect(res.weeksToReach).toBe(0);
    expect(res.finalBalance).toBe(500);
    expect(res.interestEarned).toBe(0);
  });

  it('calculates time to reach $5,000 first car goal at 5.75%', () => {
    const res = calcMonthsToReachGoal(500, 5000, 200, 5.75);
    expect(res.monthsToReach).toBeGreaterThan(15);
    expect(res.monthsToReach).toBeLessThan(24);
    expect(res.finalBalance).toBeGreaterThanOrEqual(5000);
    expect(res.interestEarned).toBeGreaterThan(100);
  });

  it('handles zero deposit and zero rate gracefully', () => {
    const res = calcMonthsToReachGoal(100, 500, 0, 0);
    expect(res.monthsToReach).toBe(Infinity);
  });

  it('returns Infinity when zero deposit and zero starting balance cannot grow', () => {
    const res = calcMonthsToReachGoal(0, 500, 0, 5.00);
    expect(res.monthsToReach).toBe(Infinity);
    expect(res.weeksToReach).toBe(Infinity);
  });

  it('returns Infinity when goal is unreachable within maxMonths', () => {
    const res = calcMonthsToReachGoal(1, 10_000_000, 0.01, 0.01);
    expect(res.monthsToReach).toBe(Infinity);
    expect(res.weeksToReach).toBe(Infinity);
  });
});

describe('calcGoalMilestones', () => {
  it('calculates 4 milestone steps (25%, 50%, 75%, 100%) for a $1,000 emergency fund', () => {
    const milestones = calcGoalMilestones(100, 1000, 50, 5.50, new Date('2026-10-01'));
    expect(milestones.length).toBe(4);

    expect(milestones[0].percent).toBe(25);
    expect(milestones[0].amount).toBe(250);
    expect(milestones[0].monthsToReach).toBeGreaterThan(0);
    expect(milestones[0].projectedDate).toMatch(/[A-Z][a-z]{2} 202[6-9]/);

    expect(milestones[1].percent).toBe(50);
    expect(milestones[1].amount).toBe(500);
    expect(milestones[1].monthsToReach).toBeGreaterThan(milestones[0].monthsToReach);

    expect(milestones[2].percent).toBe(75);
    expect(milestones[2].amount).toBe(750);

    expect(milestones[3].percent).toBe(100);
    expect(milestones[3].amount).toBe(1000);
    expect(milestones[3].badge).toBe('Champion');
  });

  it('marks early milestones as reached when starting balance exceeds them', () => {
    const milestones = calcGoalMilestones(600, 1000, 50, 5.50);
    expect(milestones[0].reached).toBe(true); // 250
    expect(milestones[1].reached).toBe(true); // 500
    expect(milestones[2].reached).toBe(false); // 750
    expect(milestones[3].reached).toBe(false); // 1000
    expect(milestones[0].projectedDate).toBe('Already Hit!');
  });
});

describe('evaluateAccountQualification', () => {
  const boq = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('BOQ'))!;
  const newcastle = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Newcastle'))!;
  const gsb = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Great Southern Bank'))!;
  const ing = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('ING'))!;
  const westpacSpendSave = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Westpac Life'))!;

  it('verifies BOQ Future Saver gives 5.80% under 18 waiver without deposit or card hurdles at age 15', () => {
    const habits = {
      monthlyDeposit: 0,
      monthlyDebitCardPurchases: 0,
      isBalanceGrowing: false,
      monthlyWithdrawals: 0,
      userAge: 15,
    };
    const evalRes = evaluateAccountQualification(boq, habits, 2000);
    expect(evalRes.qualifies).toBe(true);
    expect(evalRes.effectiveRate).toBe(5.80);
    expect(evalRes.hasWaiverApplied).toBe(true);
    expect(evalRes.hasZeroAccountFees).toBe(true);
  });

  it('requires deposit and card purchases for BOQ Future Saver once turning 18', () => {
    const habitsUnderTarget = {
      monthlyDeposit: 50,
      monthlyDebitCardPurchases: 2,
      isBalanceGrowing: true,
      monthlyWithdrawals: 0,
      userAge: 18,
    };
    // BOQ requires $1,000 deposit + 5 card purchases at 18+
    const boqAdult = { ...boq, minMonthlyDeposit: 1000, minCardPurchases: 5 };
    const evalRes = evaluateAccountQualification(boqAdult, habitsUnderTarget, 2000);
    expect(evalRes.qualifies).toBe(false);
    expect(evalRes.effectiveRate).toBe(boq.baseRate);
    expect(evalRes.reasons.length).toBeGreaterThanOrEqual(1);
  });

  it('verifies Newcastle Permanent Smart Saver qualifies with balance growth and <=2 withdrawals', () => {
    const habits = {
      monthlyDeposit: 50,
      monthlyDebitCardPurchases: 0,
      isBalanceGrowing: true,
      monthlyWithdrawals: 1,
      userAge: 16,
    };
    const evalRes = evaluateAccountQualification(newcastle, habits, 3000);
    expect(evalRes.qualifies).toBe(true);
    expect(evalRes.effectiveRate).toBe(5.75);
    expect(evalRes.hasZeroAccountFees).toBe(true);
  });

  it('disqualifies Newcastle Permanent if withdrawals exceed 2 per month', () => {
    const habits = {
      monthlyDeposit: 50,
      monthlyDebitCardPurchases: 0,
      isBalanceGrowing: true,
      monthlyWithdrawals: 3,
      userAge: 16,
    };
    const evalRes = evaluateAccountQualification(newcastle, habits, 3000);
    expect(evalRes.qualifies).toBe(false);
    expect(evalRes.effectiveRate).toBe(0.05);
  });

  it('verifies Great Southern Bank Youth eSaver gives 5.50% unconditionally up to age 17', () => {
    const habits = {
      monthlyDeposit: 0,
      monthlyDebitCardPurchases: 0,
      isBalanceGrowing: false,
      monthlyWithdrawals: 5,
      userAge: 15,
    };
    const evalRes = evaluateAccountQualification(gsb, habits, 1500);
    expect(evalRes.qualifies).toBe(true);
    expect(evalRes.effectiveRate).toBe(5.50);
  });

  it('evaluates ING Savings Maximiser requiring $1,000 deposit and 5 card purchases', () => {
    const lowHabits = {
      monthlyDeposit: 100,
      monthlyDebitCardPurchases: 2,
      isBalanceGrowing: true,
      monthlyWithdrawals: 0,
      userAge: 18,
    };
    const lowRes = evaluateAccountQualification(ing, lowHabits, 1000);
    expect(lowRes.qualifies).toBe(false);
    expect(lowRes.effectiveRate).toBe(0.01);

    const goodHabits = {
      monthlyDeposit: 1000,
      monthlyDebitCardPurchases: 5,
      isBalanceGrowing: true,
      monthlyWithdrawals: 0,
      userAge: 18,
    };
    const goodRes = evaluateAccountQualification(ing, goodHabits, 1000);
    expect(goodRes.qualifies).toBe(true);
    expect(goodRes.effectiveRate).toBe(5.50);
  });

  it('enforces age boundary on Westpac Spend & Save (18-40 only)', () => {
    const teenHabits = {
      monthlyDeposit: 500,
      monthlyDebitCardPurchases: 25,
      isBalanceGrowing: true,
      monthlyWithdrawals: 0,
      userAge: 16,
    };
    const evalRes = evaluateAccountQualification(westpacSpendSave, teenHabits, 1000);
    expect(evalRes.qualifies).toBe(false);
    expect(evalRes.isAgeEligible).toBe(false);

    const adultHabits = { ...teenHabits, userAge: 19 };
    const adultRes = evaluateAccountQualification(westpacSpendSave, adultHabits, 1000);
    expect(adultRes.qualifies).toBe(true);
    expect(adultRes.effectiveRate).toBe(5.75);
  });

  it('confirms all accounts have $0 account keeping fees', () => {
    for (const acct of TEEN_SAVINGS_ACCOUNTS) {
      const res = evaluateAccountQualification(acct, {
        monthlyDeposit: 50,
        monthlyDebitCardPurchases: 5,
        isBalanceGrowing: true,
        monthlyWithdrawals: 0,
        userAge: 16,
      }, 1000);
      expect(res.hasZeroAccountFees).toBe(true);
    }
  });
});

describe('convertDepositFrequency', () => {
  it('converts weekly deposit into fortnightly, monthly and annual equivalents', () => {
    const res = convertDepositFrequency(25, 'weekly');
    expect(res.weekly).toBe(25);
    expect(res.annual).toBe(1300);
    expect(res.fortnightly).toBe(50);
    expect(res.monthly).toBeCloseTo((1300 / 12), 1);
  });

  it('converts fortnightly deposit accurately', () => {
    const res = convertDepositFrequency(100, 'fortnightly');
    expect(res.annual).toBe(2600);
    expect(res.weekly).toBe(50);
  });

  it('converts monthly deposit accurately', () => {
    const res = convertDepositFrequency(120, 'monthly');
    expect(res.annual).toBe(1440);
    expect(res.weekly).toBeCloseTo(27.69, 1);
  });
});

describe('getSinkingFundPlan', () => {
  it('returns school formal sinking fund with recommended $600-$1,200 range', () => {
    const plan = getSinkingFundPlan('formal');
    expect(plan.category).toBe('formal');
    expect(plan.recommendedRange.min).toBe(600);
    expect(plan.recommendedRange.max).toBe(1200);
    expect(plan.items.length).toBeGreaterThanOrEqual(4);
    const sum = plan.items.reduce((acc, it) => acc + it.amount, 0);
    expect(sum).toBe(plan.targetAmount);
  });

  it('returns first car sinking fund with recommended $3,500-$6,000 range', () => {
    const plan = getSinkingFundPlan('car');
    expect(plan.category).toBe('car');
    expect(plan.recommendedRange.min).toBe(3500);
    expect(plan.recommendedRange.max).toBe(6000);
    expect(plan.items.some(i => i.name.includes('Inspection'))).toBe(true);
    expect(plan.items.some(i => i.name.includes('Stamp Duty'))).toBe(true);
  });

  it('returns laptop sinking fund with recommended $1,000-$2,000 range', () => {
    const plan = getSinkingFundPlan('laptop');
    expect(plan.category).toBe('laptop');
    expect(plan.recommendedRange.min).toBe(1000);
    expect(plan.recommendedRange.max).toBe(2000);
    expect(plan.items.some(i => i.name.includes('Laptop'))).toBe(true);
  });

  it('returns emergency fund sinking fund with recommended $500-$1,000 range', () => {
    const plan = getSinkingFundPlan('emergency');
    expect(plan.category).toBe('emergency');
    expect(plan.recommendedRange.min).toBe(500);
    expect(plan.recommendedRange.max).toBe(1000);
    expect(plan.items.some(i => i.name.includes('Screen Repair'))).toBe(true);
  });
});

describe('calcHoursAndShiftsToWork', () => {
  it('calculates hours and 3-hour casual shifts for a $140 purchase at $14.00/hr', () => {
    const res = calcHoursAndShiftsToWork(140, 14, 3);
    expect(res.hours).toBe(10);
    expect(res.shifts).toBeCloseTo(3.33, 1);
    expect(res.roundedShifts).toBe(4);
  });

  it('guards minimum wage to avoid division by zero', () => {
    const res = calcHoursAndShiftsToWork(100, 0, 3);
    expect(res.hours).toBe(100);
    expect(res.shifts).toBeCloseTo(33.3, 1);
  });
});

describe('calcEffectiveAnnualRate', () => {
  it('converts 5.50% p.a. monthly compound to EAR', () => {
    // (1 + 0.055/12)^12 - 1 = 5.64078%
    const ear = calcEffectiveAnnualRate(5.50, 12);
    expect(ear).toBeCloseTo(5.6408, 3);
    expect(ear).toBeGreaterThan(5.50);
  });

  it('converts 5.80% p.a. monthly compound (BOQ) to EAR', () => {
    // (1 + 0.058/12)^12 - 1 = 5.9566%
    const ear = calcEffectiveAnnualRate(5.80, 12);
    expect(ear).toBeCloseTo(5.9566, 3);
  });

  it('guards zero and negative inputs', () => {
    expect(calcEffectiveAnnualRate(0, 12)).toBe(0);
    expect(calcEffectiveAnnualRate(-5, 12)).toBe(0);
    expect(calcEffectiveAnnualRate(5.5, 0)).toBe(0);
  });
});

describe('calcRealRateOfReturn', () => {
  it('calculates real rate using Fisher equation for 5.5% HISA with 3.0% CPI', () => {
    // (1.055 / 1.030) - 1 = 2.427%
    const realRate = calcRealRateOfReturn(5.50, 3.00);
    expect(realRate).toBeCloseTo(2.427, 2);
  });

  it('shows negative real rate for 0.01% checking account with 3.0% CPI', () => {
    // (1.0001 / 1.030) - 1 ≈ -2.903%
    const realRate = calcRealRateOfReturn(0.01, 3.00);
    expect(realRate).toBeLessThan(-2.8);
  });
});

describe('calcRealPurchasingPower', () => {
  it('projects 10-year inflation decay on $5,000 checking account at 3% inflation', () => {
    // 5000 / (1.03)^10 = 3720.47
    const purchasingPower = calcRealPurchasingPower(5000, 3.0, 10);
    expect(purchasingPower).toBeCloseTo(3720.47, 1);
  });

  it('guards zero and negative inputs', () => {
    expect(calcRealPurchasingPower(0, 3.0, 5)).toBe(0);
    expect(calcRealPurchasingPower(1000, 3.0, 0)).toBe(1000);
  });
});

describe('calcTermDepositReturn', () => {
  it('calculates 12-month fixed term deposit on $10,000 at 4.80%', () => {
    const res = calcTermDepositReturn(10000, 4.80, 12);
    expect(res.principal).toBe(10000);
    expect(res.totalInterest).toBeCloseTo(480, 2);
    expect(res.maturityBalance).toBeCloseTo(10480, 2);
    expect(res.effectiveMonthlyYield).toBeCloseTo(40, 2);
  });

  it('calculates 6-month term deposit on $5,000 at 5.00%', () => {
    const res = calcTermDepositReturn(5000, 5.00, 6);
    expect(res.totalInterest).toBeCloseTo(125, 2);
    expect(res.maturityBalance).toBeCloseTo(5125, 2);
    expect(res.effectiveMonthlyYield).toBeCloseTo(20.83, 1);
  });

  it('guards negative principal and rate', () => {
    const res = calcTermDepositReturn(-1000, -5, 12);
    expect(res.principal).toBe(0);
    expect(res.totalInterest).toBe(0);
    expect(res.maturityBalance).toBe(0);
  });
});


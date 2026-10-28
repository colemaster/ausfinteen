import { describe, it, expect } from 'vitest';
import {
  bnplLateFeeCascade,
  weeklyPayoffPlan,
  calculateStackedBnpl,
  DEFAULT_STACKED_ACCOUNTS,
  calculateBnplEffectiveApr,
  estimateMortgageCapacityReduction,
  calculateProviderAccurateLateFees,
  BNPL_PROVIDER_RULES,
  type BnplAccountItem,
} from './engine';

describe('bnplLateFeeCascade', () => {
  it('charges a single flat late fee for one missed installment', () => {
    const res = bnplLateFeeCascade(120, 4, 1, 15, 1);
    expect(res.totalFees).toBe(15);
    expect(res.totalCost).toBe(135);
    expect(res.markupPct).toBeCloseTo(12.5, 5);
    expect(res.steps).toHaveLength(1);
    expect(res.hasCcrDefaultRisk).toBe(false);
    expect(res.rhiMonths).toBe(24);
  });

  it('escalates fees across multiple missed installments (cascade)', () => {
    const res = bnplLateFeeCascade(120, 4, 2, 15, 1.5);
    // $15 + $22.50 = $37.50
    expect(res.steps[0]).toEqual({ installment: 1, fee: 15, cumulativeFees: 15 });
    expect(res.steps[1]?.fee).toBe(22.5);
    expect(res.totalFees).toBe(37.5);
    expect(res.totalCost).toBe(157.5);
    expect(res.markupPct).toBeCloseTo(31.25, 5);
  });

  it('returns zero fees when no installments are missed', () => {
    const res = bnplLateFeeCascade(200, 4, 0);
    expect(res.totalFees).toBe(0);
    expect(res.totalCost).toBe(200);
    expect(res.markupPct).toBe(0);
    expect(res.steps).toHaveLength(0);
    expect(res.hasCcrDefaultRisk).toBe(false);
  });

  it('clamps missed installments to the installment count', () => {
    const res = bnplLateFeeCascade(100, 4, 9);
    expect(res.missedInstallments).toBe(4);
    expect(res.steps).toHaveLength(4);
  });

  it('handles zero purchase price and zero fees per late payment', () => {
    expect(bnplLateFeeCascade(0, 4, 2, 15).totalCost).toBe(0);
    const zeroFee = bnplLateFeeCascade(100, 4, 2, 0);
    expect(zeroFee.totalFees).toBe(0);
    expect(zeroFee.totalCost).toBe(100);
  });

  it('triggers CCR default risk when debt >= $150 and maximum missed installments reached', () => {
    const res = bnplLateFeeCascade(250, 4, 4, 15, 1.5);
    expect(res.hasCcrDefaultRisk).toBe(true);
    expect(res.ccrDefaultYears).toBe(5);
    expect(res.ccrWarningMessage).toContain('5 YEARS');
  });

  it('does not trigger CCR default risk if total cost is under $150 statutory threshold', () => {
    const res = bnplLateFeeCascade(80, 4, 4, 10, 1.0);
    expect(res.totalCost).toBe(120); // under $150 threshold
    expect(res.hasCcrDefaultRisk).toBe(false);
  });
});

describe('weeklyPayoffPlan', () => {
  it('computes the weekly payment to clear a purchase in X weeks', () => {
    const res = weeklyPayoffPlan(120, 4);
    expect(res.weeklyPayment).toBe(30);
    expect(res.totalPaid).toBe(120);
    expect(res.payoffWeeks).toBe(4);
  });

  it('guards zero and negative week counts', () => {
    expect(weeklyPayoffPlan(120, 0).payoffWeeks).toBe(1);
    expect(weeklyPayoffPlan(120, 0).weeklyPayment).toBe(120);
    expect(weeklyPayoffPlan(120, -3).payoffWeeks).toBe(1);
  });

  it('handles a zero purchase price', () => {
    const res = weeklyPayoffPlan(0, 8);
    expect(res.weeklyPayment).toBe(0);
    expect(res.totalPaid).toBe(0);
  });
});

describe('calculateStackedBnpl (Multi-Account BNPL Snowball & CCR Risks)', () => {
  it('models 4 stacked BNPL accounts (Afterpay, Zip, Klarna, PayPal Pay in 4)', () => {
    const res = calculateStackedBnpl(DEFAULT_STACKED_ACCOUNTS, 100);

    expect(res.activeAccountsCount).toBe(4);
    expect(res.totalOriginalBalance).toBe(240 + 350 + 180 + 220); // 990
    expect(res.totalFortnightlyCommitment).toBe(60 + 40 + 45 + 55); // 200
    expect(res.totalMonthlyCommitment).toBe(Math.round((200 * 26) / 12)); // 433

    // Late fees should be accumulated from accounts with missed payments
    expect(res.totalLateFees).toBeGreaterThan(0);
    expect(res.totalTrueOwed).toBeGreaterThan(res.totalOriginalBalance);
    expect(res.ccrDefaultYears).toBe(5);
    expect(res.rhiMonths).toBe(24);
  });

  it('detects CCR 5-year default risk when account >= $150 is 3+ fortnights overdue', () => {
    const accounts: BnplAccountItem[] = [
      {
        id: 'zip',
        name: 'Zip Pay',
        provider: 'Zip Pay',
        balance: 350,
        fortnightlyPayment: 40,
        feePerLatePayment: 15,
        missedPayments: 3, // >= 3 missed payments triggers CCR default warning
      },
      {
        id: 'afterpay',
        name: 'Afterpay',
        provider: 'Afterpay',
        balance: 100,
        fortnightlyPayment: 25,
        feePerLatePayment: 10,
        missedPayments: 0,
      },
    ];

    const res = calculateStackedBnpl(accounts);
    expect(res.hasCcrDefaultRisk).toBe(true);
    expect(res.accountsAtDefaultRiskCount).toBe(1);
    expect(res.accounts[0]?.hasCcrDefaultRisk).toBe(true);
    expect(res.accounts[1]?.hasCcrDefaultRisk).toBe(false);
  });

  it('produces valid Snowball and Avalanche payoff orders', () => {
    const res = calculateStackedBnpl(DEFAULT_STACKED_ACCOUNTS, 80);

    expect(res.snowballOrder.length).toBe(4);
    expect(res.avalancheOrder.length).toBe(4);
    expect(res.snowballPayoffWeeks).toBeGreaterThan(0);
    expect(res.avalanchePayoffWeeks).toBeGreaterThan(0);
    expect(res.avalanchePayoffWeeks).toBeLessThanOrEqual(res.snowballPayoffWeeks);
  });

  it('generates statutory relief roadmap with NDH 1800 007 007 and NCCP s72 hardship', () => {
    const res = calculateStackedBnpl(DEFAULT_STACKED_ACCOUNTS);

    expect(res.reliefSteps.length).toBeGreaterThanOrEqual(5);
    const ndhStep = res.reliefSteps.find(s => s.contact === '1800 007 007');
    expect(ndhStep).toBeDefined();
    expect(ndhStep?.title).toContain('National Debt Helpline');

    const hardshipStep = res.reliefSteps.find(s => s.title.includes('Hardship'));
    expect(hardshipStep).toBeDefined();
    expect(hardshipStep?.details).toContain('NCCP');
  });

  it('handles empty or all-zero accounts cleanly', () => {
    const res = calculateStackedBnpl([]);
    expect(res.activeAccountsCount).toBe(0);
    expect(res.totalOriginalBalance).toBe(0);
    expect(res.totalTrueOwed).toBe(0);
    expect(res.hasCcrDefaultRisk).toBe(false);
    expect(res.snowballPayoffWeeks).toBe(0);
  });
});

describe('calculateBnplEffectiveApr', () => {
  it('calculates annualized percentage rate for late fees over an 8-week period', () => {
    // $15 fee on $120 purchase over 8 weeks: (15 / 120) * (52 / 8) * 100 = 12.5% * 6.5 = 81.25 -> 81.3%
    const apr = calculateBnplEffectiveApr(120, 15, 8);
    expect(apr).toBeCloseTo(81.3, 1);
  });

  it('reflects high APR exceeding 200% when multiple late fees accumulate on a small order', () => {
    // $37.50 fees on $100 purchase over 8 weeks: (37.50 / 100) * 6.5 * 100 = 243.8%
    const apr = calculateBnplEffectiveApr(100, 37.5, 8);
    expect(apr).toBeGreaterThan(200);
  });

  it('returns 0 for zero or negative values', () => {
    expect(calculateBnplEffectiveApr(0, 15)).toBe(0);
    expect(calculateBnplEffectiveApr(100, 0)).toBe(0);
    expect(calculateBnplEffectiveApr(100, 15, 0)).toBe(0);
  });
});

describe('estimateMortgageCapacityReduction', () => {
  it('estimates ~12.5x borrowing capacity reduction based on open credit limit', () => {
    // $1,000 BNPL credit limit -> ~$12,500 reduction
    expect(estimateMortgageCapacityReduction(1000)).toBe(12500);
    // $2,000 limit -> $25,000 reduction
    expect(estimateMortgageCapacityReduction(2000)).toBe(25000);
  });

  it('handles zero or negative limits safely', () => {
    expect(estimateMortgageCapacityReduction(0)).toBe(0);
    expect(estimateMortgageCapacityReduction(-500)).toBe(0);
  });
});

describe('BNPL_PROVIDER_RULES', () => {
  it('defines rules and regulatory metadata for Afterpay, Zip, Klarna, and PayPal', () => {
    expect(BNPL_PROVIDER_RULES.afterpay).toBeDefined();
    expect(BNPL_PROVIDER_RULES.zip).toBeDefined();
    expect(BNPL_PROVIDER_RULES.klarna).toBeDefined();
    expect(BNPL_PROVIDER_RULES.paypal).toBeDefined();

    // Verify statutory ACL & AFCA compliance
    Object.values(BNPL_PROVIDER_RULES).forEach(rule => {
      expect(rule.licenceType).toContain('ACL');
      expect(rule.edrScheme).toContain('AFCA');
      expect(rule.ccrReporting.rhiMonths).toBe(24);
      expect(rule.ccrReporting.defaultThreshold).toBe(150);
      expect(rule.ccrReporting.defaultOverdueDays).toBe(60);
      expect(rule.ccrReporting.defaultRetentionYears).toBe(5);
    });
  });

  it('accurately encodes provider-specific fee caps and account fees', () => {
    // Afterpay: $10 initial, $7 subsequent, capped at 25% or $68, $0 account fee
    expect(BNPL_PROVIDER_RULES.afterpay.monthlyFee).toBe(0);
    expect(BNPL_PROVIDER_RULES.afterpay.initialLateFee).toBe(10);
    expect(BNPL_PROVIDER_RULES.afterpay.subsequentLateFee).toBe(7);
    expect(BNPL_PROVIDER_RULES.afterpay.maxLateFeePerOrder).toBe(68);
    expect(BNPL_PROVIDER_RULES.afterpay.maxLateFeePercent).toBe(25);

    // Zip Pay: $9.95 monthly fee, $15 late fee
    expect(BNPL_PROVIDER_RULES.zip.monthlyFee).toBe(9.95);
    expect(BNPL_PROVIDER_RULES.zip.initialLateFee).toBe(15);
    expect(BNPL_PROVIDER_RULES.zip.maxLateFeePerOrder).toBe(120);

    // Klarna: $3–$5 late fees, $0 monthly fee
    expect(BNPL_PROVIDER_RULES.klarna.monthlyFee).toBe(0);
    expect(BNPL_PROVIDER_RULES.klarna.initialLateFee).toBe(3);

    // PayPal Pay in 4: $0 late fees in Australia
    expect(BNPL_PROVIDER_RULES.paypal.monthlyFee).toBe(0);
    expect(BNPL_PROVIDER_RULES.paypal.initialLateFee).toBe(0);
    expect(BNPL_PROVIDER_RULES.paypal.maxLateFeePerOrder).toBe(0);
  });
});

describe('calculateProviderAccurateLateFees', () => {
  describe('Afterpay', () => {
    it('applies a maximum single $10 fee (or 25%) on orders under $40', () => {
      const resUnder40 = calculateProviderAccurateLateFees('afterpay', 30, 2, 14);
      expect(resUnder40.lateFees).toBe(7.5); // 25% of $30 is $7.50
      expect(resUnder40.isCapped).toBe(true);
    });

    it('charges $10 initial plus $7 after 7 days on orders >= $40', () => {
      // 1 missed payment overdue > 7 days: $10 + $7 = $17
      const res = calculateProviderAccurateLateFees('afterpay', 100, 1, 14);
      expect(res.lateFees).toBe(17);
      expect(res.isCapped).toBe(false);
    });

    it('enforces 25% purchase price cap on medium orders', () => {
      // $120 purchase, 3 missed payments overdue: uncapped would be (10+7)*3 = $51.
      // Capped at 25% of $120 = $30.
      const res = calculateProviderAccurateLateFees('afterpay', 120, 3, 14);
      expect(res.lateFees).toBe(30);
      expect(res.isCapped).toBe(true);
      expect(res.capReason).toContain('25%');
    });

    it('enforces $68 absolute maximum cap on large orders', () => {
      // $500 purchase: 25% is $125. Uncapped 4 missed payments overdue = 17 * 4 = $68.
      // 5 missed payments would be 85, capped at $68.
      const res = calculateProviderAccurateLateFees('afterpay', 500, 5, 14);
      expect(res.lateFees).toBe(68);
      expect(res.isCapped).toBe(true);
      expect(res.capReason).toContain('$68');
    });
  });

  describe('Zip Pay', () => {
    it('applies $15 late fee per missed payment and $9.95 monthly account fee', () => {
      const res = calculateProviderAccurateLateFees('zip', 350, 2, 30);
      expect(res.lateFees).toBe(30);
      expect(res.monthlyFees).toBe(9.95);
      expect(res.totalFees).toBe(39.95);
    });

    it('respects the NCCP Reg 69G $120 statutory default fee cap', () => {
      const res = calculateProviderAccurateLateFees('zip', 800, 10, 60);
      expect(res.lateFees).toBe(120);
      expect(res.isCapped).toBe(true);
    });
  });

  describe('Klarna', () => {
    it('charges $0 late fees on orders under $25', () => {
      const res = calculateProviderAccurateLateFees('klarna', 20, 2);
      expect(res.lateFees).toBe(0);
      expect(res.isCapped).toBe(true);
    });

    it('charges $2 per missed installment on orders $25–$59.99, capped at $6', () => {
      const res1 = calculateProviderAccurateLateFees('klarna', 50, 2);
      expect(res1.lateFees).toBe(4);

      const resCapped = calculateProviderAccurateLateFees('klarna', 50, 4);
      expect(resCapped.lateFees).toBe(6);
      expect(resCapped.isCapped).toBe(true);
    });

    it('charges $3–$5 per miss on orders $60+, capped at $15 or 25%', () => {
      const res = calculateProviderAccurateLateFees('klarna', 100, 2);
      expect(res.lateFees).toBe(10); // 2 * $5

      const resCapped = calculateProviderAccurateLateFees('klarna', 100, 4);
      expect(resCapped.lateFees).toBe(15);
      expect(resCapped.isCapped).toBe(true);
    });
  });

  describe('PayPal Pay in 4', () => {
    it('charges $0 late fees in Australia', () => {
      const res = calculateProviderAccurateLateFees('paypal', 250, 3);
      expect(res.lateFees).toBe(0);
      expect(res.monthlyFees).toBe(0);
      expect(res.totalFees).toBe(0);
      expect(res.notes).toContain('$0 late fees');
    });
  });

  describe('edge cases', () => {
    it('returns zero fees for zero purchase price or zero missed payments', () => {
      expect(calculateProviderAccurateLateFees('afterpay', 0, 2).totalFees).toBe(0);
      expect(calculateProviderAccurateLateFees('zip', 100, 0).totalFees).toBe(0);
    });
  });
});


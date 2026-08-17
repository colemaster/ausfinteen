import { describe, it, expect } from 'vitest';
import { calculateAffordability, rateScenarioTable, monthlyBufferCheck, monthsToDeposit } from './engine';
import { calculateStampDuty } from '../../data/stamp-duty-tables';

describe('calculateStampDuty', () => {
  it('VIC FHB at $550k → stamp duty = $0 (full exemption < $600k)', () => {
    const result = calculateStampDuty(550000, 'VIC', true);
    expect(result.dutyPayable).toBe(0);
    expect(result.concessionApplied).toBe(true);
  });

  it('VIC non-FHB at $800k → stamp duty > $30k', () => {
    const result = calculateStampDuty(800000, 'VIC', false);
    expect(result.dutyPayable).toBeGreaterThan(30000);
  });

  it('NSW FHB at $750k → stamp duty = $0 (full exemption < $800k)', () => {
    const result = calculateStampDuty(750000, 'NSW', true);
    expect(result.dutyPayable).toBe(0);
  });
});

describe('calculateAffordability', () => {
  const baseParams = {
    grossIncome: 250000,
    partnerIncome: 0,
    existingMonthlyDebts: 0,
    deposit: 150000,
    propertyPrice: 850000,
    state: 'VIC' as const,
    firstHomeBuyer: false,
    isNewHome: false,
    rate: 5.7,
    loanTerm: 30,
  };

  it('LVR > 90% → LMI > 0', () => {
    const result = calculateAffordability({
      ...baseParams,
      propertyPrice: 500000,
      deposit: 40000, // LVR = 92%
    });
    expect(result.lmi).toBeGreaterThan(0);
  });

  it('LVR <= 80% → LMI = 0', () => {
    const result = calculateAffordability({
      ...baseParams,
      propertyPrice: 500000,
      deposit: 110000, // LVR = 78%
    });
    expect(result.lmi).toBe(0);
  });

  it('borrowing capacity increases with income', () => {
    const low = calculateAffordability({ ...baseParams, grossIncome: 80000 });
    const high = calculateAffordability({ ...baseParams, grossIncome: 200000 });
    expect(high.borrowingCapacity).toBeGreaterThan(low.borrowingCapacity);
  });

  it('stress test generates 4 rows with increasing repayments', () => {
    const result = calculateAffordability(baseParams);
    expect(result.stressTest).toHaveLength(4);
    expect(result.stressTest[1].monthlyRepayment).toBeGreaterThan(
      result.stressTest[0].monthlyRepayment,
    );
  });

  it('monthly cost breakdown total > monthly repayment', () => {
    const result = calculateAffordability(baseParams);
    expect(result.monthlyCostBreakdown.total).toBeGreaterThan(
      result.monthlyCostBreakdown.principalAndInterest,
    );
  });
});

describe('rateScenarioTable', () => {
  const rates = [5.5, 6, 6.5, 7];

  it('returns one row per rate, in order', () => {
    const rows = rateScenarioTable(700000, 150000, 30, rates);
    expect(rows).toHaveLength(4);
    expect(rows.map(r => r.rate)).toEqual([5.5, 6, 6.5, 7]);
  });

  it('higher rate → higher repayment and higher total interest', () => {
    const rows = rateScenarioTable(700000, 150000, 30, rates);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].monthlyRepayment).toBeGreaterThan(rows[i - 1].monthlyRepayment);
      expect(rows[i].totalInterest).toBeGreaterThan(rows[i - 1].totalInterest);
    }
  });

  it('known answer: $550k loan at 6% over 30yr → ~$3,297/mo, ~$637k interest', () => {
    const [row] = rateScenarioTable(700000, 150000, 30, [6]);
    // monthlyRepayment(550000, 6, 30) = 3297.53
    expect(row.monthlyRepayment).toBeCloseTo(3297.53, 0);
    expect(row.totalInterest).toBeCloseTo(3297.53 * 360 - 550000, -2);
  });

  it('deposit >= price → zero repayment and interest', () => {
    const [row] = rateScenarioTable(500000, 600000, 30, [6]);
    expect(row.monthlyRepayment).toBe(0);
    expect(row.totalInterest).toBe(0);
  });

  it('empty rates array → empty result', () => {
    expect(rateScenarioTable(700000, 150000, 30, [])).toEqual([]);
  });
});

describe('monthlyBufferCheck', () => {
  it('buffered check passes when income comfortably covers costs', () => {
    const r = monthlyBufferCheck(700000, 150000, 30, 6, 150000, 0, 10);
    expect(r.affordableWithBuffer).toBe(true);
    expect(r.surplus).toBeGreaterThan(0);
  });

  it('fails when income is below the buffered requirement', () => {
    const r = monthlyBufferCheck(700000, 150000, 30, 6, 45000, 0, 10);
    // $3,750/mo income vs ~$4,085 required (mortgage $3,298 + holding $417 + 10%)
    expect(r.affordableWithBuffer).toBe(false);
    expect(r.surplus).toBeLessThan(0);
  });

  it('requiredIncome scales with buffer %', () => {
    const noBuffer = monthlyBufferCheck(700000, 150000, 30, 6, 120000, 0, 0);
    const buffered = monthlyBufferCheck(700000, 150000, 30, 6, 120000, 0, 20);
    expect(buffered.requiredIncome).toBeGreaterThan(noBuffer.requiredIncome);
  });

  it('zero price → zero mortgage cost', () => {
    const r = monthlyBufferCheck(0, 0, 30, 6, 50000, 0, 10);
    expect(r.monthlyMortgage).toBe(0);
  });
});

describe('monthsToDeposit', () => {
  it('known answer: save $40k at $1,000/mo with 0% return → 40 months', () => {
    expect(monthsToDeposit(40000, 1000, 0)).toBe(40);
  });

  it('positive return reaches target faster than 0% return', () => {
    const plain = monthsToDeposit(40000, 1000, 0);
    const invested = monthsToDeposit(40000, 1000, 8);
    expect(invested).toBeLessThan(plain);
  });

  it('target already met → 0 months', () => {
    expect(monthsToDeposit(0, 1000, 5)).toBe(0);
  });

  it('zero saving with target → capped at maxMonths', () => {
    expect(monthsToDeposit(40000, 0, 5)).toBe(600);
    expect(monthsToDeposit(40000, 0, 5, 12)).toBe(12);
  });
});

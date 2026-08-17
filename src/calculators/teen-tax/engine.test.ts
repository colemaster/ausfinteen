import { describe, it, expect } from 'vitest';
import { afterSchoolJobTax, tfnWithholding, payslipBreakdown } from './engine';

describe('afterSchoolJobTax', () => {
  it('known answer: 10 hrs/wk at $20/hr → $10,400/yr, no tax', () => {
    const result = afterSchoolJobTax(10, 20);
    expect(result.weeklyGross).toBe(200);
    expect(result.annualGross).toBe(10400);
    // Below $18,200 tax-free threshold → no income tax or Medicare
    expect(result.incomeTax).toBe(0);
    expect(result.medicareLevy).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.netWeekly).toBeCloseTo(200, 1);
  });

  it('known answer: 20 hrs/wk at $22/hr → $22,880/yr taxed above threshold', () => {
    const result = afterSchoolJobTax(20, 22);
    expect(result.annualGross).toBe(22880);
    // Income tax = (22880 − 18200) × 16% = 748.80 → 749
    expect(result.incomeTax).toBe(749);
    // Medicare: below $27,222 low-income threshold → $0 levy
    expect(result.medicareLevy).toBe(0);
  });

  it('medicare levy shade-in applies between $27,222 and $34,027', () => {
    const result = afterSchoolJobTax(25, 25);
    // $32,500/yr → shade-in: min(32500×2%, (32500−27222)×10%) = min(650, 527.8)
    expect(result.annualGross).toBe(32500);
    expect(result.medicareLevy).toBe(528);
  });

  it('income tax + medicare + HELP = total tax', () => {
    const result = afterSchoolJobTax(30, 25, { includeHELP: true });
    expect(result.totalTax).toBe(
      result.incomeTax + result.medicareLevy + result.helpRepayment,
    );
  });

  it('HELP repayment applies 0–10% rate to income when enabled', () => {
    const noHelp = afterSchoolJobTax(25, 25);
    const withHelp = afterSchoolJobTax(25, 25, { includeHELP: true });
    expect(noHelp.helpRepayment).toBe(0);
    // $32,500/yr → HELP rate 0% (below $67,000) → still zero
    expect(withHelp.helpRepayment).toBe(0);
    expect(withHelp.helpRate).toBe(0);
  });

  it('HELP rate 2% at $75k+ annual income', () => {
    const result = afterSchoolJobTax(40, 38, { includeHELP: true });
    // 40 × 38 × 52 = $79,040 → $75,001–$80,000 bracket = 2%
    expect(result.helpRate).toBe(0.02);
    expect(result.helpRepayment).toBeCloseTo(79040 * 0.02, 0);
  });

  it('medicare can be excluded', () => {
    const withMedicare = afterSchoolJobTax(25, 30);
    const withoutMedicare = afterSchoolJobTax(25, 30, { includeMedicare: false });
    expect(withoutMedicare.medicareLevy).toBe(0);
    expect(withoutMedicare.totalTax).toBeLessThan(withMedicare.totalTax);
  });

  it('effective rate is between 0 and marginal rate', () => {
    const result = afterSchoolJobTax(30, 28);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(result.marginalRate);
  });

  it('edge: zero hours → zero everything', () => {
    const result = afterSchoolJobTax(0, 20);
    expect(result.annualGross).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.netWeekly).toBe(0);
  });

  it('edge: custom weeks per year respected', () => {
    const result = afterSchoolJobTax(10, 20, { weeksPerYear: 40 });
    expect(result.annualGross).toBe(8000);
  });
});

describe('tfnWithholding', () => {
  it('claim exemption under $18,200 → 0% withheld, no refund', () => {
    const result = tfnWithholding(10000, true);
    expect(result.exemptionEligible).toBe(true);
    expect(result.withholdingRate).toBe(0);
    expect(result.annualWithheld).toBe(0);
    expect(result.estimatedRefund).toBe(0);
  });

  it('no exemption → 47% withheld with full refund at lodgement', () => {
    const result = tfnWithholding(10000, false);
    expect(result.withholdingRate).toBe(0.47);
    expect(result.annualWithheld).toBe(4700);
    // Actual tax = 0 → refund = 4700
    expect(result.estimatedRefund).toBe(4700);
    expect(result.taxOwingAtLodgement).toBe(0);
  });

  it('exemption invalid above $18,200 → falls back to 47%', () => {
    const result = tfnWithholding(25000, true);
    expect(result.exemptionEligible).toBe(false);
    expect(result.withholdingRate).toBe(0.47);
    expect(result.annualWithheld).toBeCloseTo(11750, 0);
  });

  it('weekly withheld = annual / 52', () => {
    const result = tfnWithholding(26000, false);
    expect(result.weeklyWithheld).toBeCloseTo(235, 0);
  });

  it('edge: zero income → zero withholding', () => {
    const result = tfnWithholding(0, false);
    expect(result.annualWithheld).toBe(0);
    expect(result.estimatedRefund).toBe(0);
  });
});

describe('payslipBreakdown', () => {
  it('rows cover gross, PAYG, super and net pay', () => {
    const result = payslipBreakdown(15, 20);
    const keys = result.rows.map(r => r.key);
    expect(keys).toContain('gross');
    expect(keys).toContain('payg');
    expect(keys).toContain('super');
    expect(keys).toContain('net');
  });

  it('super does not reduce net pay (employer contribution)', () => {
    const result = payslipBreakdown(15, 20);
    // Gross $300/wk, under threshold → no PAYG, super $36, net = $300
    expect(result.grossWeekly).toBeCloseTo(300, 1);
    expect(result.superWeekly).toBeCloseTo(36, 1);
    expect(result.netWeekly).toBeCloseTo(300, 1);
  });

  it('super excluded when opted out', () => {
    const result = payslipBreakdown(15, 20, { includeSuper: false });
    expect(result.superWeekly).toBe(0);
    expect(result.rows.some(r => r.key === 'super')).toBe(false);
  });

  it('custom SG rate respected', () => {
    const result = payslipBreakdown(10, 20, { sgRate: 0.15 });
    expect(result.superWeekly).toBeCloseTo(30, 1);
  });

  it('claimExemption toggle controls PAYG withholding', () => {
    // 8 hrs/wk at $20 = $160/wk = $8,320/yr — under the $18,200 threshold
    const claimed = payslipBreakdown(8, 20, { claimExemption: true });
    const notClaimed = payslipBreakdown(8, 20, { claimExemption: false });
    expect(claimed.taxWithheldWeekly).toBe(0);
    expect(notClaimed.taxWithheldWeekly).toBeGreaterThan(0);
    expect(notClaimed.taxWithheldWeekly).toBeCloseTo((8320 * 0.47) / 52, 0);
  });

  it('edge: zero hours → empty payslip values', () => {
    const result = payslipBreakdown(0, 0);
    expect(result.grossWeekly).toBe(0);
    expect(result.netWeekly).toBe(0);
  });
});

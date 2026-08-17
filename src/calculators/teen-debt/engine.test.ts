import { describe, it, expect } from 'vitest';
import { bnplLateFeeCascade, weeklyPayoffPlan } from './engine';

describe('bnplLateFeeCascade', () => {
  it('charges a single flat late fee for one missed installment', () => {
    const res = bnplLateFeeCascade(120, 4, 1, 15, 1);
    expect(res.totalFees).toBe(15);
    expect(res.totalCost).toBe(135);
    expect(res.markupPct).toBeCloseTo(12.5, 5);
    expect(res.steps).toHaveLength(1);
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
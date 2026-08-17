import { describe, it, expect } from 'vitest';
import { calcIncomeTax } from '../../data/tax-brackets';
import {
  calculateSuperSacrifice,
  calculateNegativeGearing,
  calculateTaxBreakdown,
  calculateDRTaxBenefit,
  taxWithHELP,
  div293Exposure,
  marginalRateBrackets,
} from './engine';

describe('calculateTaxBreakdown', () => {
  it('$100k income → approx $24,967 total (income tax + medicare)', () => {
    const result = calculateTaxBreakdown(100000, false);
    // Income tax at $100k (Stage 3): $4288 + (100000 - 45000) * 0.30 = $4288 + $16500 = $20788 (approx)
    // Medicare: 100000 * 0.02 = $2000
    // Total ≈ $22788
    expect(result.total).toBeGreaterThan(20000);
    expect(result.total).toBeLessThan(30000);
    expect(result.medicareLevy).toBe(2000);
  });

  it('marginal rate at $100k is 30%', () => {
    const result = calculateTaxBreakdown(100000, false);
    expect(result.marginalRate).toBe(0.30);
  });

  it('effective rate is less than marginal rate', () => {
    const result = calculateTaxBreakdown(100000, false);
    expect(result.effectiveRate).toBeLessThan(result.marginalRate);
  });

  it('HELP repayment is 0 when not included', () => {
    const result = calculateTaxBreakdown(100000, false);
    expect(result.helpRepayment).toBe(0);
  });

  it('HELP repayment > 0 for income above threshold when included', () => {
    const result = calculateTaxBreakdown(100000, true);
    expect(result.helpRepayment).toBeGreaterThan(0);
  });

  it('after-tax income = taxableIncome - total', () => {
    const result = calculateTaxBreakdown(120000, false);
    expect(result.afterTaxIncome).toBe(120000 - result.total);
  });
});

describe('calculateSuperSacrifice', () => {
  it('tax saving > 0 for additional sacrifice at 37% marginal rate', () => {
    // $150k salary: SG = $18k, maxAdditional = $12k, sacrifice $10k → saving > 0
    const result = calculateSuperSacrifice({
      grossSalary: 150000,
      currentSuperBalance: 200000,
      sgRate: 0.12,
      additionalSacrifice: 10000,
      unusedCarryForward: 0,
      age: 35,
      retirementAge: 60,
      superReturn: 7,
    });
    expect(result.taxSaving).toBeGreaterThan(0);
    expect(result.actualSacrifice).toBe(10000);
  });

  it('Division 293 applies when income + contribs > $250k', () => {
    const result = calculateSuperSacrifice({
      grossSalary: 300000,
      currentSuperBalance: 100000,
      sgRate: 0.12,
      additionalSacrifice: 0,
      unusedCarryForward: 0,
      age: 40,
      retirementAge: 60,
      superReturn: 7,
    });
    // SG = $36k, income + contribs > $250k → Div 293 applies
    expect(result.isDiv293).toBe(true);
  });

  it('projected super increases with years to retirement', () => {
    const result35 = calculateSuperSacrifice({
      grossSalary: 120000,
      currentSuperBalance: 100000,
      sgRate: 0.12,
      additionalSacrifice: 5000,
      unusedCarryForward: 0,
      age: 35,
      retirementAge: 60,
      superReturn: 7,
    });
    const result45 = calculateSuperSacrifice({
      grossSalary: 120000,
      currentSuperBalance: 100000,
      sgRate: 0.12,
      additionalSacrifice: 5000,
      unusedCarryForward: 0,
      age: 45,
      retirementAge: 60,
      superReturn: 7,
    });
    expect(result35.projectedSuperAtRetirement).toBeGreaterThan(
      result45.projectedSuperAtRetirement,
    );
  });
});

describe('calculateNegativeGearing', () => {
  it('produces tax refund when property is negatively geared', () => {
    const result = calculateNegativeGearing({
      propertyValue: 650000,
      rentalIncomeWeekly: 450,
      mortgageRate: 6.0,
      lvr: 80,
      councilRates: 2000,
      insurance: 1500,
      pmFeeRate: 0.07,
      maintenance: 2000,
      depreciation: 8000,
      margTax: 0.47,
    });
    expect(result.taxRefund).toBeGreaterThan(0);
    expect(result.isPositivelyGeared).toBe(false);
  });

  it('correctly computes annual mortgage interest', () => {
    const result = calculateNegativeGearing({
      propertyValue: 500000,
      rentalIncomeWeekly: 600,
      mortgageRate: 6.0,
      lvr: 80,
      councilRates: 0,
      insurance: 0,
      pmFeeRate: 0,
      maintenance: 0,
      depreciation: 0,
      margTax: 0.32,
    });
    // Loan = 400000, interest = 400000 * 0.06 = 24000
    expect(result.mortgageInterest).toBe(24000);
  });
});

describe('calculateDRTaxBenefit', () => {
  it('cumulative deduction scales with years', () => {
    const rows = calculateDRTaxBenefit(200000, 6, 0.47, [1, 5, 10]);
    expect(rows[2].cumulative).toBe(rows[0].cumulative * 10);
  });

  it('effective after-tax rate = rate * (1 - margTax)', () => {
    const rows = calculateDRTaxBenefit(200000, 6, 0.47, [1]);
    expect(rows[0].effectiveAfterTaxRate).toBeCloseTo(6 * 0.53, 5);
  });
});

describe('taxWithHELP', () => {
  it('known answer: $80k income with HELP debt → HELP rate 2%', () => {
    const result = taxWithHELP(80000, 20000);
    // $75,001–$80,000 bracket → 2% of $80,000 = $1,600
    expect(result.helpRate).toBe(0.02);
    expect(result.helpRepayment).toBe(1600);
  });

  it('income tax + medicare + HELP = total', () => {
    const result = taxWithHELP(120000, 15000);
    expect(result.total).toBe(result.incomeTax + result.medicareLevy + result.helpRepayment);
  });

  it('no HELP debt → zero repayment even above threshold', () => {
    const result = taxWithHELP(120000, 0);
    expect(result.helpRepayment).toBe(0);
    expect(result.helpRate).toBe(0);
    expect(result.total).toBe(result.incomeTax + result.medicareLevy);
  });

  it('after-tax income = taxable income - total', () => {
    const result = taxWithHELP(95000, 30000);
    expect(result.afterTaxIncome).toBe(95000 - result.total);
  });

  it('marginal rate with HELP = combined marginal + HELP rate', () => {
    const result = taxWithHELP(150000, 10000);
    // $150k: marginal 37% + medicare 2% + HELP 9% ($145,001–$150,000 → 9%)
    expect(result.marginalRateWithHELP).toBeCloseTo(0.37 + 0.02 + 0.09, 5);
  });

  it('edge: zero income → zero tax', () => {
    const result = taxWithHELP(0, 5000);
    expect(result.total).toBe(0);
    expect(result.afterTaxIncome).toBe(0);
  });

  it('edge: maximum HELP rate is 10% at $160k+', () => {
    const result = taxWithHELP(200000, 40000);
    expect(result.helpRate).toBe(0.10);
  });
});

describe('div293Exposure', () => {
  it('known answer: $240k income + $30k contribs → $20k excess × 15% = $3,000', () => {
    const result = div293Exposure(240000, 30000);
    expect(result.applies).toBe(true);
    expect(result.excess).toBe(20000);
    expect(result.taxableContributions).toBe(20000);
    expect(result.extraTax).toBe(3000);
  });

  it('excess capped at concessional contributions', () => {
    const result = div293Exposure(260000, 10000);
    expect(result.taxableContributions).toBe(10000);
    expect(result.extraTax).toBe(1500);
  });

  it('no exposure below threshold', () => {
    const result = div293Exposure(180000, 25000);
    expect(result.applies).toBe(false);
    expect(result.extraTax).toBe(0);
    expect(result.totalIncome).toBe(205000);
  });

  it('boundary: exactly at threshold → no exposure', () => {
    const result = div293Exposure(220000, 30000);
    expect(result.applies).toBe(false);
  });

  it('custom threshold respected', () => {
    const result = div293Exposure(260000, 10000, 300000);
    expect(result.applies).toBe(false);
  });

  it('produces a message in both states', () => {
    const yes = div293Exposure(260000, 15000);
    const no = div293Exposure(100000, 10000);
    expect(yes.message.length).toBeGreaterThan(0);
    expect(yes.message).toContain('extra 15%');
    expect(no.message).toContain('below');
  });
});

describe('marginalRateBrackets', () => {
  it('known answer: $100k → $42,288 + $16,500 in 30% bracket', () => {
    const rows = marginalRateBrackets(100000, false);
    const b30 = rows.find(r => r.key === 'bracket-45001');
    expect(b30?.rate).toBe(0.30);
    expect(b30?.tax).toBeCloseTo(16500, 2);
    const total = rows.find(r => r.kind === 'total');
    expect(total?.tax).toBeCloseTo(20787.84 + 2000, 0);
  });

  it('bracket taxes sum to calcIncomeTax(income)', () => {
    const rows = marginalRateBrackets(135000, false);
    const bracketTax = rows
      .filter(r => r.kind === 'bracket')
      .reduce((acc, r) => acc + r.tax, 0);
    expect(bracketTax).toBeCloseTo(calcIncomeTax(135000), 0);
  });

  it('includes medicare row and a grand total', () => {
    const rows = marginalRateBrackets(80000, false);
    const medicare = rows.find(r => r.kind === 'medicare');
    expect(medicare?.tax).toBe(1600);
    expect(rows[rows.length - 1]?.kind).toBe('total');
  });

  it('appends HELP row only when requested', () => {
    const without = marginalRateBrackets(100000, false);
    const withHelp = marginalRateBrackets(100000, true);
    expect(without.some(r => r.kind === 'help')).toBe(false);
    expect(withHelp.some(r => r.kind === 'help')).toBe(true);
  });

  it('edge: income below tax-free threshold has zero bracket tax', () => {
    const rows = marginalRateBrackets(10000, false);
    const bracketTax = rows
      .filter(r => r.kind === 'bracket')
      .reduce((acc, r) => acc + r.tax, 0);
    expect(bracketTax).toBe(0);
  });

  it('edge: zero income returns only medicare + total rows', () => {
    const rows = marginalRateBrackets(0, true);
    expect(rows.filter(r => r.kind === 'bracket').length).toBe(0);
    expect(rows[rows.length - 1]?.tax).toBe(0);
  });
});

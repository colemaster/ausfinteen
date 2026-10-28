import { describe, it, expect } from 'vitest';
import {
  afterSchoolJobTax,
  tfnWithholding,
  payslipBreakdown,
  calcDivision6AATax,
  calcWeeklyPAYGWithholding,
  calcCentsPerKmDeduction,
  calcWFHFixedRateDeduction,
  calcInstantAssetWriteOff,
  EFFECTIVE_TAX_FREE_THRESHOLD,
  CENTS_PER_KM_RATE,
  WFH_FIXED_RATE_HOURLY,
  STANDARD_DEDUCTION_2026_27,
  SUBSTANTIATION_THRESHOLD_NO_RECEIPTS,
  LAUNDRY_THRESHOLD_NO_RECEIPTS,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
} from './engine';

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
    // Income tax = (22880 − 18200) × 15% = 702
    expect(result.incomeTax).toBe(702);
    // Medicare: below $28,011 low-income threshold → $0 levy
    expect(result.medicareLevy).toBe(0);
  });

  it('medicare levy shade-in applies between $28,011 and $35,013', () => {
    const result = afterSchoolJobTax(25, 25);
    // $32,500/yr → shade-in: min(32500×2%, (32500−28011)×10%) = min(650, 448.9)
    expect(result.annualGross).toBe(32500);
    expect(result.medicareLevy).toBe(449);
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

  it('HELP rate 15% at $75k+ annual income (2026-27) — marginal band', () => {
    const result = afterSchoolJobTax(40, 38, { includeHELP: true });
    // 40 × 38 × 52 = $79,040 → marginal: ($79,040 − $69,528) × 15% = $1,426.8
    expect(result.helpRate).toBe(0.15);
    expect(result.helpRepayment).toBeCloseTo((79040 - 69528) * 0.15, 0);
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

describe('Division 6AA minor unearned income logic', () => {
  it('nil tax on unearned income up to $416', () => {
    const zero = calcDivision6AATax(0);
    expect(zero.taxPayable).toBe(0);
    expect(zero.isExempt).toBe(true);
    expect(zero.bracket).toBe('exempt');

    const atLimit = calcDivision6AATax(416);
    expect(atLimit.taxPayable).toBe(0);
    expect(atLimit.isExempt).toBe(true);
    expect(atLimit.bracket).toBe('exempt');
  });

  it('66% shade-in rate applies between $417 and $1,307 on excess over $416', () => {
    // $500 unearned: (500 - 416) * 0.66 = 84 * 0.66 = $55.44
    const res500 = calcDivision6AATax(500);
    expect(res500.bracket).toBe('shade_in');
    expect(res500.isExempt).toBe(false);
    expect(res500.taxPayable).toBeCloseTo(55.44, 2);

    // $1,000 unearned: (1000 - 416) * 0.66 = 584 * 0.66 = $385.44
    const res1000 = calcDivision6AATax(1000);
    expect(res1000.bracket).toBe('shade_in');
    expect(res1000.taxPayable).toBeCloseTo(385.44, 2);

    // Exactly at $1,307 upper threshold: (1307 - 416) * 0.66 = 891 * 0.66 = $588.06
    const res1307 = calcDivision6AATax(1307);
    expect(res1307.bracket).toBe('shade_in');
    expect(res1307.taxPayable).toBeCloseTo(588.06, 2);
  });

  it('flat 45% rate applies on entire unearned income above $1,307', () => {
    // $1,308 unearned: 1308 * 45% = $588.60
    const res1308 = calcDivision6AATax(1308);
    expect(res1308.bracket).toBe('top_rate');
    expect(res1308.taxPayable).toBeCloseTo(588.60, 2);

    // $2,000 unearned: 2000 * 45% = $900.00
    const res2000 = calcDivision6AATax(2000);
    expect(res2000.bracket).toBe('top_rate');
    expect(res2000.taxPayable).toBe(900);

    // $5,000 unearned: 5000 * 45% = $2,250.00
    const res5000 = calcDivision6AATax(5000);
    expect(res5000.bracket).toBe('top_rate');
    expect(res5000.taxPayable).toBe(2250);
  });
});

describe('LITO & 2026-27 Effective Tax-Free Threshold ($22,866)', () => {
  it('effective threshold constant is $22,866', () => {
    expect(EFFECTIVE_TAX_FREE_THRESHOLD).toBe(22866);
  });

  it('reports LITO offset and taxAfterOffsets = 0 under $22,866', () => {
    // 15 hrs/wk @ $25/hr = $375/wk = $19,500/yr (between $18,200 and $22,866)
    const result = afterSchoolJobTax(15, 25);
    expect(result.annualGross).toBe(19500);
    expect(result.incomeTax).toBe(195); // (19500 - 18200) * 0.15 = 195
    expect(result.lito).toBe(700);
    expect(result.taxAfterOffsets).toBe(0);
    expect(result.isUnderEffectiveThreshold).toBe(true);
  });

  it('includeLITO option applies LITO to totalTax and netTakeHome', () => {
    const withoutLito = afterSchoolJobTax(15, 25, { includeLITO: false });
    const withLito = afterSchoolJobTax(15, 25, { includeLITO: true });

    expect(withoutLito.totalTax).toBe(195);
    expect(withLito.totalTax).toBe(0);
    expect(withLito.netAnnual).toBe(19500);
  });

  it('known answer at $25,000 income: LITO reduces tax by $700', () => {
    // 20 hrs/wk @ $24.03846/hr ≈ $25,000/yr
    const result = afterSchoolJobTax(20, 24.0384615, { includeLITO: true });
    expect(result.annualGross).toBeCloseTo(25000, 0);
    // Gross tax = (25000 - 18200) * 0.15 = 1020
    expect(result.incomeTax).toBeCloseTo(1020, 0);
    expect(result.lito).toBe(700);
    // Net tax = 1020 - 700 = 320
    expect(result.taxAfterOffsets).toBeCloseTo(320, 0);
    expect(result.totalTax).toBeCloseTo(320, 0);
    expect(result.isUnderEffectiveThreshold).toBe(false);
  });
});

describe('Weekly PAYG withholding calculation (calcWeeklyPAYGWithholding)', () => {
  it('returns $0 for weekly gross <= $350 when claiming tax-free threshold', () => {
    expect(calcWeeklyPAYGWithholding(200, { claimTaxFreeThreshold: true })).toBe(0);
    expect(calcWeeklyPAYGWithholding(350, { claimTaxFreeThreshold: true })).toBe(0);
  });

  it('withholds 15% on excess over $350 when claiming tax-free threshold', () => {
    // $500 weekly: (500 - 350) * 0.15 = 150 * 0.15 = $22.50
    expect(calcWeeklyPAYGWithholding(500, { claimTaxFreeThreshold: true })).toBe(22.50);
    // $600 weekly: (600 - 350) * 0.15 = 250 * 0.15 = $37.50
    expect(calcWeeklyPAYGWithholding(600, { claimTaxFreeThreshold: true })).toBe(37.50);
  });

  it('withholds 15% from dollar 1 when not claiming tax-free threshold', () => {
    // $200 weekly: 200 * 0.15 = $30.00
    expect(calcWeeklyPAYGWithholding(200, { claimTaxFreeThreshold: false })).toBe(30);
    // $500 weekly: 500 * 0.15 = $75.00
    expect(calcWeeklyPAYGWithholding(500, { claimTaxFreeThreshold: false })).toBe(75);
  });

  it('withholds 47% top marginal rate when no TFN is quoted', () => {
    // $500 weekly: 500 * 0.47 = $235.00
    expect(calcWeeklyPAYGWithholding(500, { hasTFN: false })).toBe(235);
  });

  it('under-16/under-18 exemption: $0 withheld without TFN when earning <= $350/wk', () => {
    // Under 16 legacy option
    expect(calcWeeklyPAYGWithholding(300, { hasTFN: false, isUnder16: true })).toBe(0);
    expect(calcWeeklyPAYGWithholding(350, { hasTFN: false, isUnder16: true })).toBe(0);
    // Above $350/wk without TFN falls back to 47%
    expect(calcWeeklyPAYGWithholding(400, { hasTFN: false, isUnder16: true })).toBe(188);

    // Under 18 NAT 3092 Question 1 exemption
    expect(calcWeeklyPAYGWithholding(300, { hasTFN: false, isUnder18: true })).toBe(0);
    expect(calcWeeklyPAYGWithholding(350, { hasTFN: false, isUnder18: true })).toBe(0);
    expect(calcWeeklyPAYGWithholding(400, { hasTFN: false, isUnder18: true })).toBe(188);
  });

  it('payslipBreakdown uses standard PAYG withholding with hasTFN / threshold options', () => {
    // 20 hrs/wk @ $25/hr = $500/wk gross
    const withThreshold = payslipBreakdown(20, 25, { hasTFN: true, claimTaxFreeThreshold: true });
    expect(withThreshold.grossWeekly).toBe(500);
    expect(withThreshold.taxWithheldWeekly).toBe(22.50);
    expect(withThreshold.netWeekly).toBe(477.50);

    const withoutThreshold = payslipBreakdown(20, 25, { hasTFN: true, claimTaxFreeThreshold: false });
    expect(withoutThreshold.taxWithheldWeekly).toBe(75);
    expect(withoutThreshold.netWeekly).toBe(425);

    const noTFN = payslipBreakdown(20, 25, { hasTFN: false });
    expect(noTFN.taxWithheldWeekly).toBe(235);
    expect(noTFN.netWeekly).toBe(265);
  });
});

describe('Work-related vehicle deduction (cents-per-km rate 91c/km)', () => {
  it('applies 2026-27 rate of 91c/km', () => {
    expect(CENTS_PER_KM_RATE).toBe(0.91);
    const result = calcCentsPerKmDeduction(100);
    expect(result.deduction).toBe(91);
    expect(result.isCapped).toBe(false);
  });

  it('caps vehicle deduction at 5,000 kilometres ($4,550)', () => {
    const atCap = calcCentsPerKmDeduction(5000);
    expect(atCap.deduction).toBe(4550);
    expect(atCap.isCapped).toBe(false);

    const overCap = calcCentsPerKmDeduction(6500);
    expect(overCap.cappedKm).toBe(5000);
    expect(overCap.deduction).toBe(4550);
    expect(overCap.isCapped).toBe(true);
  });

  it('handles zero or negative kilometres safely', () => {
    expect(calcCentsPerKmDeduction(0).deduction).toBe(0);
    expect(calcCentsPerKmDeduction(-50).deduction).toBe(0);
  });
});

describe('Working From Home (WFH) Fixed Rate Deduction (PCG 2023/1)', () => {
  it('applies ATO PCG 2023/1 rate of 70c per hour', () => {
    expect(WFH_FIXED_RATE_HOURLY).toBe(0.70);
    const result = calcWFHFixedRateDeduction(100);
    expect(result.hoursWorked).toBe(100);
    expect(result.ratePerHour).toBe(0.70);
    expect(result.deduction).toBe(70.00);
  });

  it('lists covered bundled items and separate claimable depreciation', () => {
    const result = calcWFHFixedRateDeduction(500);
    expect(result.deduction).toBe(350.00);
    expect(result.coveredExpenses).toHaveLength(4);
    expect(result.coveredExpenses.some(e => e.includes('Energy'))).toBe(true);
    expect(result.coveredExpenses.some(e => e.includes('Internet'))).toBe(true);
    expect(result.coveredExpenses.some(e => e.includes('Mobile phone'))).toBe(true);
    expect(result.coveredExpenses.some(e => e.includes('Stationery'))).toBe(true);

    expect(result.separateClaimableItems.some(i => i.includes('Decline in value'))).toBe(true);
    expect(result.substantiationRequirement).toContain('Continuous record of all actual hours');
  });

  it('handles zero or negative hours safely', () => {
    expect(calcWFHFixedRateDeduction(0).deduction).toBe(0);
    expect(calcWFHFixedRateDeduction(-40).deduction).toBe(0);
  });
});

describe('Small Business Instant Asset Write-Off (s 328-180 ITAA 1997)', () => {
  it('allows 100% write-off for assets under $20,000 threshold for small businesses', () => {
    expect(INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27).toBe(20000);

    // Sole trader buying $2,500 camera equipment with 100% business use
    const result = calcInstantAssetWriteOff(2500, 1.0, 45000);
    expect(result.isEligibleTurnover).toBe(true);
    expect(result.isUnderThreshold).toBe(true);
    expect(result.canWriteOffImmediately).toBe(true);
    expect(result.immediateDeduction).toBe(2500);
    expect(result.firstYearPoolDepreciation).toBe(0);
  });

  it('pro-rates immediate deduction for business use percentage', () => {
    // $3,000 laptop used 80% for freelance design
    const result = calcInstantAssetWriteOff(3000, 0.8, 60000);
    expect(result.businessDeductibleCost).toBe(2400);
    expect(result.immediateDeduction).toBe(2400);
  });

  it('allocates assets $20,000 or over to simplified depreciation pool (15% in year 1)', () => {
    // Commercial equipment costing $25,000 (100% business use)
    const result = calcInstantAssetWriteOff(25000, 1.0, 80000);
    expect(result.isUnderThreshold).toBe(false);
    expect(result.canWriteOffImmediately).toBe(false);
    expect(result.immediateDeduction).toBe(0);
    expect(result.firstYearPoolDepreciation).toBe(3750); // 15% of $25,000
  });

  it('disallows instant write-off when turnover exceeds $10M cap', () => {
    const result = calcInstantAssetWriteOff(5000, 1.0, 12000000);
    expect(result.isEligibleTurnover).toBe(false);
    expect(result.canWriteOffImmediately).toBe(false);
    expect(result.immediateDeduction).toBe(0);
  });
});

describe('Statutory Deduction Thresholds & Rules', () => {
  it('verifies $300 substantiation threshold without receipts', () => {
    expect(SUBSTANTIATION_THRESHOLD_NO_RECEIPTS).toBe(300);
  });

  it('verifies $150 laundry allowance threshold without receipts', () => {
    expect(LAUNDRY_THRESHOLD_NO_RECEIPTS).toBe(150);
  });

  it('verifies $1,000 standard deduction under 2026-27 tax reforms', () => {
    expect(STANDARD_DEDUCTION_2026_27).toBe(1000);
  });
});

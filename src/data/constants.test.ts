import { describe, expect, it } from 'vitest';
import {
  HELP_REPAYMENT_THRESHOLDS_2026_27,
  HELP_INDEXATION_RATE_2026,
  HELP_INDEXATION_CAP_2026,
  HELP_MINIMUM_REPAYMENT_THRESHOLD_2026_27,
  HELP_FIRST_MARGINAL_RATE_2026_27,
  HELP_DEBT_REDUCTION_2025,
  HELP_LOAN_LIMIT_2026,
  HELP_LOAN_LIMIT_2027,
  HELP_LOAN_LIMITS,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
  SSAF_PART_TIME_CAP_2026,
  SSAF_PART_TIME_CAP_2027,
  SSAF_CAPS,
  SSAF_DETAILED_CAPS,
  CSP_STUDENT_CONTRIBUTION_BANDS_2026,
  CSP_STUDENT_CONTRIBUTION_BANDS_2027,
  CSP_STUDENT_CONTRIBUTION_BANDS,
  HECS_BANDS_2027,
  STANDARD_DEDUCTION_2026_27,
  WFH_FIXED_RATE_HOURLY,
  CENTS_PER_KM_2026_27,
  CENTS_PER_KM_MAX_KM,
  CENTS_PER_KM_MAX_DEDUCTION_2026_27,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD,
  INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER,
  YOUTH_ALLOWANCE_INCOME_FREE_FORTNIGHT,
  STUDENT_INCOME_BANK_MAX_ACCUMULATION,
  STUDENT_INCOME_BANK_OPERATIONAL_CAP,
  APPRENTICE_INCOME_BANK_MAX_ACCUMULATION,
  YOUTH_ALLOWANCE_CONSTANTS_2026_27,
  RBA_CASH_RATE_TARGET,
  RBA_CASH_RATE_SEPT_2026,
  RBA_MONETARY_POLICY,
  LONG_TERM_INFLATION_TARGET,
  LONG_TERM_ASX_REAL_RETURN,
  LONG_TERM_ASX_NOMINAL_RETURN,
  MACRO_ECONOMIC_BENCHMARKS,
  calcHELPRepayment,
  calcHELPRate,
  getHELPBracket,
  TAX_FREE_THRESHOLD,
  CGT_DISCOUNT_INDIVIDUAL,
  CGT_DISCOUNT_SUPER,
  CGT_DISCOUNT_COMPANY,
  APRA_SERVICEABILITY_BUFFER,
  PAYDAY_SUPER_FROM,
  SUPER_CO_CONTRIBUTION_2026_27,
  NATIONAL_MINIMUM_WAGE_2026,
  TFN_WITHHOLDING_RATE,
  UNDER_18_TFN_EXEMPTION_THRESHOLDS,
  MINOR_BANK_INTEREST_THRESHOLDS,
} from './constants';

describe('src/data/constants.ts — Statutory Indexation, Deductions & Student Limits', () => {
  describe('HELP/HECS Debt Repayments & Reforms', () => {
    it('sets minimum repayment threshold to $69,528 with 15% initial marginal rate', () => {
      expect(HELP_MINIMUM_REPAYMENT_THRESHOLD_2026_27).toBe(69528);
      expect(HELP_FIRST_MARGINAL_RATE_2026_27).toBe(0.15);
      expect(HELP_REPAYMENT_THRESHOLDS_2026_27[0].max).toBe(69528);
      expect(HELP_REPAYMENT_THRESHOLDS_2026_27[0].rate).toBe(0);
      expect(HELP_REPAYMENT_THRESHOLDS_2026_27[1].min).toBe(69529);
      expect(HELP_REPAYMENT_THRESHOLDS_2026_27[1].rate).toBe(0.15);
    });

    it('sets HELP indexation rate and cap to 2.8% for 2026', () => {
      expect(HELP_INDEXATION_RATE_2026).toBe(0.028);
      expect(HELP_INDEXATION_CAP_2026).toBe(0.028);
    });

    it('sets 2025 one-off HELP debt reduction to 20%', () => {
      expect(HELP_DEBT_REDUCTION_2025).toBe(0.20);
    });

    it('correctly calculates compulsory repayments under the marginal scheme', () => {
      // Income at or below $69,528 -> 0
      expect(calcHELPRepayment(50000)).toBe(0);
      expect(calcHELPRepayment(69528)).toBe(0);

      // Income in first marginal band ($69,529 - $129,717): 15% on excess over $69,528
      // Example: $80,000 -> (80,000 - 69,528) * 0.15 = $1,570.80
      expect(calcHELPRepayment(80000)).toBeCloseTo(1570.80, 2);

      // Top of first band: $129,717 -> (129,717 - 69,528) * 0.15 = $9,028.35
      expect(calcHELPRepayment(129717)).toBeCloseTo(9028.35, 2);

      // Income in second band ($129,718 - $186,050): $9,028.35 + 17% on excess over $129,717
      // Example: $150,000 -> 9028.35 + (150,000 - 129,717) * 0.17 = 9028.35 + 3448.11 = 12476.46
      expect(calcHELPRepayment(150000)).toBeCloseTo(12476.46, 2);

      // Income above $186,051: flat 10% of total repayment income
      expect(calcHELPRepayment(200000)).toBe(20000);
    });

    it('correctly returns marginal rates via calcHELPRate and brackets via getHELPBracket', () => {
      expect(calcHELPRate(50000)).toBe(0);
      expect(calcHELPRate(80000)).toBe(0.15);
      expect(calcHELPRate(150000)).toBe(0.17);
      expect(calcHELPRate(200000)).toBe(0.10);

      const bZero = getHELPBracket(50000);
      expect(bZero?.rate).toBe(0);
      const bTier1 = getHELPBracket(80000);
      expect(bTier1?.rate).toBe(0.15);
      expect(bTier1?.min).toBe(69529);
    });
  });

  describe('HELP Loan Limits & SSAF Statutory Caps', () => {
    it('verifies 2026 loan limits ($129,883 general / $186,544 priority)', () => {
      expect(HELP_LOAN_LIMIT_2026.general).toBe(129883);
      expect(HELP_LOAN_LIMIT_2026.medicineDentistryVetAviation).toBe(186544);
      expect(HELP_LOAN_LIMITS[2026].general).toBe(129883);
      expect(HELP_LOAN_LIMITS[2026].medicineDentistryVetAviation).toBe(186544);
    });

    it('verifies 2027 loan limits ($134,558 general / $193,259 priority)', () => {
      expect(HELP_LOAN_LIMIT_2027.general).toBe(134558);
      expect(HELP_LOAN_LIMIT_2027.medicineDentistryVetAviation).toBe(193259);
      expect(HELP_LOAN_LIMITS[2027].general).toBe(134558);
      expect(HELP_LOAN_LIMITS[2027].medicineDentistryVetAviation).toBe(193259);
    });

    it('verifies SSAF statutory maximum caps ($373 in 2026, $386 in 2027; part-time 75% caps)', () => {
      expect(SSAF_CAP_2026).toBe(373);
      expect(SSAF_CAP_2027).toBe(386);
      expect(SSAF_PART_TIME_CAP_2026).toBe(279.75);
      expect(SSAF_PART_TIME_CAP_2027).toBe(289.50);
      expect(SSAF_CAPS[2026]).toBe(373);
      expect(SSAF_CAPS[2027]).toBe(386);
      expect(SSAF_DETAILED_CAPS[2026].fullTime).toBe(373);
      expect(SSAF_DETAILED_CAPS[2026].partTime).toBe(279.75);
      expect(SSAF_DETAILED_CAPS[2027].fullTime).toBe(386);
      expect(SSAF_DETAILED_CAPS[2027].partTime).toBe(289.50);
    });

    it('verifies Commonwealth Supported Places (CSP) contribution bands for 2026 and 2027', () => {
      // 2026 CSP student contribution bands
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2026.band1EducationNursing).toBe(4738);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2026.band2AlliedHealthEngineeringScience).toBe(9537);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2026.band3MedicineDentistryVet).toBe(13558);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2026.band4LawCommerceEconomics).toBe(17399);

      // 2027 CSP student contribution bands
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2027.band1EducationNursing).toBe(4908);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2027.band2AlliedHealthEngineeringScience).toBe(9880);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2027.band3MedicineDentistryVet).toBe(14046);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS_2027.band4LawCommerceEconomics).toBe(18025);

      // Calendar year map
      expect(CSP_STUDENT_CONTRIBUTION_BANDS[2026]).toEqual(CSP_STUDENT_CONTRIBUTION_BANDS_2026);
      expect(CSP_STUDENT_CONTRIBUTION_BANDS[2027]).toEqual(CSP_STUDENT_CONTRIBUTION_BANDS_2027);

      // Deprecated alias compatibility
      expect(HECS_BANDS_2027.cluster1LowBandEducationNursing).toBe(4908);
      expect(HECS_BANDS_2027.cluster2AlliedHealthEngineeringScience).toBe(9880);
      expect(HECS_BANDS_2027.cluster4MedicineDentistryVet).toBe(14046);
      expect(HECS_BANDS_2027.cluster1LawCommerce).toBe(18025);
    });
  });

  describe('ATO Deductions & Write-offs', () => {
    it('verifies WFH fixed rate of 70c/hr per PCG 2023/1', () => {
      expect(WFH_FIXED_RATE_HOURLY).toBe(0.70);
    });

    it('verifies motor vehicle cents-per-km rate of 91c/km and 5,000 km cap ($4,550 max)', () => {
      expect(CENTS_PER_KM_2026_27).toBe(0.91);
      expect(CENTS_PER_KM_MAX_KM).toBe(5000);
      expect(CENTS_PER_KM_MAX_DEDUCTION_2026_27).toBe(4550);
      expect(CENTS_PER_KM_MAX_KM * CENTS_PER_KM_2026_27).toBe(4550);
    });

    it('verifies standard work-related deduction of $1,000', () => {
      expect(STANDARD_DEDUCTION_2026_27).toBe(1000);
    });

    it('verifies small business instant asset write-off $20,000 threshold (< $10M turnover)', () => {
      expect(INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27).toBe(20000);
      expect(INSTANT_ASSET_WRITE_OFF_THRESHOLD).toBe(20000);
      expect(INSTANT_ASSET_WRITE_OFF_MAX_TURNOVER).toBe(10000000);
    });
  });

  describe('Youth Allowance & Student Income Support', () => {
    it('verifies personal income free area is $539/fortnight', () => {
      expect(YOUTH_ALLOWANCE_INCOME_FREE_FORTNIGHT).toBe(539);
      expect(YOUTH_ALLOWANCE_CONSTANTS_2026_27.personalIncomeFreeAreaFortnightly).toBe(539);
    });

    it('verifies Student Income Bank statutory cap is $12,000 and operational cap is $13,500', () => {
      expect(STUDENT_INCOME_BANK_MAX_ACCUMULATION).toBe(12000);
      expect(STUDENT_INCOME_BANK_OPERATIONAL_CAP).toBe(13500);
      expect(YOUTH_ALLOWANCE_CONSTANTS_2026_27.studentIncomeBankStatutoryCap).toBe(12000);
      expect(YOUTH_ALLOWANCE_CONSTANTS_2026_27.studentIncomeBankOperationalCap).toBe(13500);
    });

    it('verifies apprentice income bank cap is $1,000 and student start up loan is $1,349', () => {
      expect(APPRENTICE_INCOME_BANK_MAX_ACCUMULATION).toBe(1000);
      expect(YOUTH_ALLOWANCE_CONSTANTS_2026_27.studentStartUpLoanPerHalfYear).toBe(1349);
    });
  });

  describe('Macroeconomic & Investment Benchmarks', () => {
    it('verifies RBA cash rate target is 4.35%', () => {
      expect(RBA_CASH_RATE_TARGET).toBe(0.0435);
      expect(RBA_CASH_RATE_SEPT_2026).toBe(0.0435);
      expect(RBA_MONETARY_POLICY.currentCashRate).toBe(0.0435);
    });

    it('verifies long-term inflation target midpoint is 2.5% (2.0%–3.0% band)', () => {
      expect(LONG_TERM_INFLATION_TARGET).toBe(0.025);
      expect(RBA_MONETARY_POLICY.targetMidpoint).toBe(0.025);
      expect(RBA_MONETARY_POLICY.targetRangeMin).toBe(0.020);
      expect(RBA_MONETARY_POLICY.targetRangeMax).toBe(0.030);
    });

    it('verifies long-term ASX real return benchmark is 7.5% and nominal return is 10.0%', () => {
      expect(LONG_TERM_ASX_REAL_RETURN).toBe(0.075);
      expect(LONG_TERM_ASX_NOMINAL_RETURN).toBe(0.100);
      expect(MACRO_ECONOMIC_BENCHMARKS.asxRealReturnBenchmark).toBe(0.075);
      expect(MACRO_ECONOMIC_BENCHMARKS.asxNominalReturnBenchmark).toBe(0.100);
    });
  });

  describe('Other Essential Core Constants', () => {
    it('verifies tax-free threshold, CGT discounts, and super co-contribution', () => {
      expect(TAX_FREE_THRESHOLD).toBe(18200);
      expect(CGT_DISCOUNT_INDIVIDUAL).toBe(0.50);
      expect(CGT_DISCOUNT_SUPER).toBeCloseTo(1 / 3, 4);
      expect(CGT_DISCOUNT_COMPANY).toBe(0);
      expect(APRA_SERVICEABILITY_BUFFER).toBe(0.03);
      expect(PAYDAY_SUPER_FROM).toBe('1 July 2026');
      expect(SUPER_CO_CONTRIBUTION_2026_27.maxContribution).toBe(500);
      expect(SUPER_CO_CONTRIBUTION_2026_27.lowerThreshold).toBe(49293);
      expect(SUPER_CO_CONTRIBUTION_2026_27.upperThreshold).toBe(64293);
      expect(NATIONAL_MINIMUM_WAGE_2026.hourly).toBe(26.44);
    });

    it('verifies No-TFN withholding rate and under-18 TFN declaration and bank interest thresholds', () => {
      expect(TFN_WITHHOLDING_RATE).toBe(0.47);
      expect(UNDER_18_TFN_EXEMPTION_THRESHOLDS).toEqual({
        weekly: 350,
        fortnightly: 700,
        monthly: 1517,
        annual: 18200,
      });
      expect(MINOR_BANK_INTEREST_THRESHOLDS).toEqual({
        under16WithDob: 420,
        standardWithoutTFN: 120,
      });
    });
  });
});

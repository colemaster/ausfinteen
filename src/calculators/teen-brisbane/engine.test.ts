import { describe, it, expect } from 'vitest';
import {
  fiftyCentFareSavings,
  calculateSsafCost,
  checkQceEligibility,
  checkAtarEligibility,
  calculateQtacSelectionRank,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
  SSAF_PART_TIME_CAP_2026,
  SSAF_PART_TIME_CAP_2027,
  QTAC_DATES_2026_2027,
  type QceSubjectInput,
  type SeniorSubjectForAtar,
} from './engine';

describe('fiftyCentFareSavings', () => {
  it('computes weekly/monthly/yearly savings for a student commute', () => {
    // 10 trips/wk (to & from school/uni, 5 days) at old $4.15 peak fare
    const res = fiftyCentFareSavings({ tripsPerWeek: 10, oldAverageFare: 4.15, newFare: 0.5 });
    expect(res.oldWeeklyCost).toBeCloseTo(41.5, 5);
    expect(res.newWeeklyCost).toBeCloseTo(5, 5);
    expect(res.savedWeekly).toBeCloseTo(36.5, 5);
    expect(res.savedMonthly).toBeCloseTo(158.17, 1);
    expect(res.savedYearly).toBeCloseTo(1898, 0);
    expect(res.savingsPct).toBeCloseTo(87.95, 1);
  });

  it('defaults to the 2026 permanent $0.50 fare', () => {
    const res = fiftyCentFareSavings({ tripsPerWeek: 8, oldAverageFare: 3.2, newFare: 0.5 });
    expect(res.newFare).toBe(0.5);
    expect(res.savedYearly).toBeCloseTo(8 * 2.7 * 52, 2);
  });

  it('handles zero trips and zero fares', () => {
    const zeroTrips = fiftyCentFareSavings({ tripsPerWeek: 0, oldAverageFare: 4, newFare: 0.5 });
    expect(zeroTrips.savedWeekly).toBe(0);
    expect(zeroTrips.savingsPct).toBe(0);

    const zeroFare = fiftyCentFareSavings({ tripsPerWeek: 4, oldAverageFare: 4, newFare: 0 });
    expect(zeroFare.savedWeekly).toBeCloseTo(16, 5);
  });

  it('rounds and clamps trips per week', () => {
    expect(fiftyCentFareSavings({ tripsPerWeek: 4.6, oldAverageFare: 4, newFare: 0.5 }).tripsPerWeek).toBe(5);
    expect(fiftyCentFareSavings({ tripsPerWeek: -3, oldAverageFare: 4, newFare: 0.5 }).tripsPerWeek).toBe(0);
  });
});

describe('SSAF Statutory Fee Caps and SA-HELP Calculation', () => {
  it('verifies statutory 2026 and 2027 fee caps', () => {
    expect(SSAF_CAP_2026).toBe(373);
    expect(SSAF_CAP_2027).toBe(386);
    expect(SSAF_PART_TIME_CAP_2026).toBe(279.75);
    expect(SSAF_PART_TIME_CAP_2027).toBe(289.50);
  });

  it('calculates full-time 2026 SSAF with SA-HELP deferral ($0 upfront cash)', () => {
    const res = calculateSsafCost({ year: 2026, isFullTime: true, useSaHelp: true });
    expect(res.maxAnnualCap).toBe(373);
    expect(res.upfrontPayable).toBe(0);
    expect(res.deferredToSaHelp).toBe(373);
    expect(res.weeklyBudgetImpact).toBe(0);
    expect(res.saHelpNote).toContain('Deferred 100%');
  });

  it('calculates full-time 2027 SSAF upfront without SA-HELP', () => {
    const res = calculateSsafCost({ year: 2027, isFullTime: true, useSaHelp: false });
    expect(res.maxAnnualCap).toBe(386);
    expect(res.upfrontPayable).toBe(386);
    expect(res.deferredToSaHelp).toBe(0);
    expect(res.weeklyBudgetImpact).toBeCloseTo(386 / 52, 2);
  });

  it('calculates part-time SSAF for 2026 and 2027', () => {
    const pt2026 = calculateSsafCost({ year: 2026, isFullTime: false, useSaHelp: false });
    expect(pt2026.maxAnnualCap).toBe(279.75);

    const pt2027 = calculateSsafCost({ year: 2027, isFullTime: false, useSaHelp: false });
    expect(pt2027.maxAnnualCap).toBe(289.50);
  });
});

describe('QTAC Key Admissions Dates (2026-2027)', () => {
  it('contains official 18 Dec ATAR release and 23 Dec & 14 Jan offer rounds', () => {
    expect(QTAC_DATES_2026_2027.atarReleaseDateShort).toBe('18 Dec 2026');
    expect(QTAC_DATES_2026_2027.atarReleaseDate).toContain('18 December 2026');
    expect(QTAC_DATES_2026_2027.decemberOfferRound).toBe('23 December 2026');
    expect(QTAC_DATES_2026_2027.januaryMajorOfferRound).toBe('14 January 2027');
    expect(QTAC_DATES_2026_2027.januaryMajorOfferRoundShort).toBe('14 Jan 2027');
    expect(QTAC_DATES_2026_2027.changeOfPreferenceRound1).toBe('21 December 2026');
    expect(QTAC_DATES_2026_2027.changeOfPreferenceRound2).toBe('7 January 2027');
  });
});

describe('QCE 20-Credit & Core Rule Checker (checkQceEligibility)', () => {
  it('confirms eligibility when student achieves 20+ credits, 12 Core, literacy, numeracy, and integrity', () => {
    const subjects: QceSubjectInput[] = [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'B', isLiteracy: true },
      { id: '2', title: 'Mathematical Methods', type: 'General', unitsPassed: 4, grade: 'A', isNumeracy: true },
      { id: '3', title: 'Physics', type: 'General', unitsPassed: 4, grade: 'B' },
      { id: '4', title: 'Chemistry', type: 'General', unitsPassed: 4, grade: 'B' },
      { id: '5', title: 'Modern History', type: 'General', unitsPassed: 4, grade: 'B' },
      { id: '6', title: 'Digital Solutions', type: 'General', unitsPassed: 4, grade: 'A' },
    ];

    const result = checkQceEligibility({
      subjects,
      academicIntegrityCourseCompleted: true,
    });

    expect(result.totalCreditsEarned).toBe(24);
    expect(result.coreCreditsEarned).toBe(24);
    expect(result.hasMet20Credits).toBe(true);
    expect(result.hasMet12CoreCredits).toBe(true);
    expect(result.hasMetLiteracy).toBe(true);
    expect(result.hasMetNumeracy).toBe(true);
    expect(result.hasMetAcademicIntegrity).toBe(true);
    expect(result.isQceEligible).toBe(true);
    expect(result.shortfallCredits).toBe(0);
  });

  it('rejects eligibility if student has 20 credits but lacks 12 Core credits', () => {
    // 2 core subjects (8 credits), plus 12 short course/other non-core credits
    const subjects: QceSubjectInput[] = [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'C', isLiteracy: true },
      { id: '2', title: 'General Maths', type: 'General', unitsPassed: 4, grade: 'C', isNumeracy: true },
      { id: '3', title: 'Short Course Literacy', type: 'Short-Course', unitsPassed: 1, grade: 'C' },
      { id: '4', title: 'Short Course Numeracy', type: 'Short-Course', unitsPassed: 1, grade: 'C' },
      { id: '5', title: 'Other Recognised', type: 'Other-Recognised', unitsPassed: 10, grade: 'Competent' },
    ];

    const result = checkQceEligibility({
      subjects,
      academicIntegrityCourseCompleted: true,
    });

    expect(result.totalCreditsEarned).toBe(20);
    expect(result.coreCreditsEarned).toBe(8); // Only the 2 General subjects (units >= 3) count as Core
    expect(result.hasMet20Credits).toBe(true);
    expect(result.hasMet12CoreCredits).toBe(false);
    expect(result.isQceEligible).toBe(false);
    expect(result.shortfallCoreCredits).toBe(4);
  });

  it('rejects eligibility if student fails to complete the August 2026 Academic Integrity course', () => {
    const subjects: QceSubjectInput[] = [
      { id: '1', title: 'English', type: 'General', unitsPassed: 4, grade: 'B', isLiteracy: true },
      { id: '2', title: 'General Maths', type: 'General', unitsPassed: 4, grade: 'B', isNumeracy: true },
      { id: '3', title: 'Biology', type: 'General', unitsPassed: 4, grade: 'B' },
      { id: '4', title: 'Business', type: 'General', unitsPassed: 4, grade: 'B' },
      { id: '5', title: 'Drama', type: 'General', unitsPassed: 4, grade: 'A' },
    ];

    const result = checkQceEligibility({
      subjects,
      academicIntegrityCourseCompleted: false, // Incomplete!
    });

    expect(result.totalCreditsEarned).toBe(20);
    expect(result.coreCreditsEarned).toBe(20);
    expect(result.hasMetAcademicIntegrity).toBe(false);
    expect(result.isQceEligible).toBe(false);
    expect(result.feedbackMessages).toContain('Must complete the mandatory 1-hour QCAA Academic Integrity Course via myQCE (August 2026 rule).');
  });

  it('supports VET Certificate III Core credits (up to 8 credits)', () => {
    const subjects: QceSubjectInput[] = [
      { id: '1', title: 'Essential English', type: 'Applied', unitsPassed: 4, grade: 'C', isLiteracy: true },
      { id: '2', title: 'Essential Maths', type: 'Applied', unitsPassed: 4, grade: 'C', isNumeracy: true },
      { id: '3', title: 'Sport & Recreation', type: 'Applied', unitsPassed: 4, grade: 'B' },
      { id: '4', title: 'Certificate III in Early Childhood', type: 'VET-Cert-III', unitsPassed: 8, grade: 'Competent' },
    ];

    const result = checkQceEligibility({
      subjects,
      academicIntegrityCourseCompleted: true,
    });

    expect(result.totalCreditsEarned).toBe(20);
    expect(result.coreCreditsEarned).toBe(20);
    expect(result.isQceEligible).toBe(true);
  });
});

describe('QTAC ATAR Best-5 Rule Checker (checkAtarEligibility)', () => {
  it('calculates ATAR from 5 General subjects (Option A)', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 78.0, isEnglishSubject: true },
      { id: '2', title: 'Maths Methods', type: 'General', grade: 'A', scaledScore: 88.0 },
      { id: '3', title: 'Physics', type: 'General', grade: 'B', scaledScore: 82.0 },
      { id: '4', title: 'Chemistry', type: 'General', grade: 'B', scaledScore: 80.0 },
      { id: '5', title: 'Digital Solutions', type: 'General', grade: 'A', scaledScore: 86.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.isEligible).toBe(true);
    expect(result.englishPassed).toBe(true);
    expect(result.eligibleSubjectCombination).toBe('5-General');
    expect(result.best5Subjects).toHaveLength(5);
    expect(result.estimatedAggregate).toBe(414);
    expect(result.estimatedAtar).toBeGreaterThan(90.0);
  });

  it('allows 4 General + 1 Applied subject in the best 5 (Option B)', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 75.0, isEnglishSubject: true },
      { id: '2', title: 'General Maths', type: 'General', grade: 'B', scaledScore: 72.0 },
      { id: '3', title: 'Biology', type: 'General', grade: 'B', scaledScore: 70.0 },
      { id: '4', title: 'Business', type: 'General', grade: 'B', scaledScore: 68.0 },
      { id: '5', title: 'Tourism (Applied)', type: 'Applied', grade: 'A', scaledScore: 80.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.isEligible).toBe(true);
    expect(result.eligibleSubjectCombination).toBe('4-General-plus-1-Applied');
    expect(result.best5Subjects.map(s => s.title)).toContain('Tourism (Applied)');
    expect(result.estimatedAggregate).toBe(365);
    expect(result.estimatedAtar).toBe(80.0);
  });

  it('allows 4 General + 1 completed VET Cert III (Option C)', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 74.0, isEnglishSubject: true },
      { id: '2', title: 'General Maths', type: 'General', grade: 'B', scaledScore: 70.0 },
      { id: '3', title: 'Modern History', type: 'General', grade: 'B', scaledScore: 71.0 },
      { id: '4', title: 'Drama', type: 'General', grade: 'A', scaledScore: 82.0 },
      { id: '5', title: 'Cert III in Fitness', type: 'VET-Cert-III', grade: 'Competent', scaledScore: 76.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.isEligible).toBe(true);
    expect(result.eligibleSubjectCombination).toBe('4-General-plus-1-VET');
    expect(result.best5Subjects.map(s => s.title)).toContain('Cert III in Fitness');
  });

  it('strictly enforces MAX ONE Applied subject rule when student has 4 General + 2 Applied', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 75.0, isEnglishSubject: true },
      { id: '2', title: 'General Maths', type: 'General', grade: 'B', scaledScore: 70.0 },
      { id: '3', title: 'Geography', type: 'General', grade: 'B', scaledScore: 68.0 },
      { id: '4', title: 'Legal Studies', type: 'General', grade: 'B', scaledScore: 65.0 },
      { id: '5', title: 'Tourism (Applied)', type: 'Applied', grade: 'A', scaledScore: 82.0 },
      { id: '6', title: 'Hospitality (Applied)', type: 'Applied', grade: 'A', scaledScore: 80.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.isEligible).toBe(true);
    expect(result.eligibleSubjectCombination).toBe('4-General-plus-1-Applied');
    // Only the highest scoring Applied subject (Tourism 82.0) should be included!
    expect(result.best5Subjects.map(s => s.title)).toContain('Tourism (Applied)');
    expect(result.best5Subjects.map(s => s.title)).not.toContain('Hospitality (Applied)');
    expect(result.best5Subjects).toHaveLength(5);
  });

  it('rejects eligibility when student has only 3 General subjects and 2 Applied subjects', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 75.0, isEnglishSubject: true },
      { id: '2', title: 'General Maths', type: 'General', grade: 'B', scaledScore: 70.0 },
      { id: '3', title: 'Biology', type: 'General', grade: 'B', scaledScore: 68.0 },
      { id: '4', title: 'Tourism (Applied)', type: 'Applied', grade: 'A', scaledScore: 80.0 },
      { id: '5', title: 'Hospitality (Applied)', type: 'Applied', grade: 'A', scaledScore: 78.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.isEligible).toBe(false);
    expect(result.eligibleSubjectCombination).toBe('Ineligible');
    expect(result.feedback).toContain('Rule reminder: QTAC allows a maximum of ONE Applied subject or VET qualification to count toward your ATAR.');
  });

  it('rejects eligibility when student fails English (< C grade)', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'D', scaledScore: 45.0, isEnglishSubject: true }, // Failed English
      { id: '2', title: 'Maths Methods', type: 'General', grade: 'A', scaledScore: 90.0 },
      { id: '3', title: 'Physics', type: 'General', grade: 'A', scaledScore: 88.0 },
      { id: '4', title: 'Chemistry', type: 'General', grade: 'A', scaledScore: 86.0 },
      { id: '5', title: 'Digital Solutions', type: 'General', grade: 'A', scaledScore: 92.0 },
      { id: '6', title: 'Modern History', type: 'General', grade: 'A', scaledScore: 85.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.englishPassed).toBe(false);
    expect(result.isEligible).toBe(false);
    expect(result.feedback[0]).toContain('An approved English subject must be passed with a grade of C or higher');
  });

  it('verifies English satisfies prerequisite (grade C) but drops out of top 5 when 5 other General subjects score higher', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'C', scaledScore: 62.0, isEnglishSubject: true },
      { id: '2', title: 'Maths Methods', type: 'General', grade: 'A', scaledScore: 92.0 },
      { id: '3', title: 'Specialist Mathematics', type: 'General', grade: 'A', scaledScore: 90.0 },
      { id: '4', title: 'Physics', type: 'General', grade: 'A', scaledScore: 88.0 },
      { id: '5', title: 'Chemistry', type: 'General', grade: 'B', scaledScore: 82.0 },
      { id: '6', title: 'Digital Solutions', type: 'General', grade: 'A', scaledScore: 85.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    expect(result.englishPassed).toBe(true);
    expect(result.isEligible).toBe(true);
    expect(result.eligibleSubjectCombination).toBe('5-General');
    expect(result.best5Subjects).toHaveLength(5);
    // English should NOT be in the best 5 because 5 other subjects had higher scaled scores!
    expect(result.best5Subjects.map(s => s.title)).not.toContain('English');
    expect(result.best5Subjects.map(s => s.title)).toEqual([
      'Maths Methods',
      'Specialist Mathematics',
      'Physics',
      'Digital Solutions',
      'Chemistry',
    ]);
    expect(result.feedback.some(f => f.includes('English prerequisite met') && f.includes('not need to be in your Best 5'))).toBe(true);
  });

  it('disallows combining General Maths and Essential Maths in the best 5 under QTAC subject exclusion rules', () => {
    const subjects: SeniorSubjectForAtar[] = [
      { id: '1', title: 'English', type: 'General', grade: 'B', scaledScore: 78.0, isEnglishSubject: true },
      { id: '2', title: 'General Mathematics', type: 'General', grade: 'B', scaledScore: 74.0 },
      { id: '3', title: 'Biology', type: 'General', grade: 'B', scaledScore: 70.0 },
      { id: '4', title: 'Business', type: 'General', grade: 'B', scaledScore: 68.0 },
      // Essential Mathematics is an Applied course in the same learning area as General Mathematics
      { id: '5', title: 'Essential Mathematics', type: 'Applied', grade: 'A', scaledScore: 80.0 },
    ];

    const result = checkAtarEligibility({ subjects });
    // Since Essential Maths is incompatible with General Maths, it cannot form 4 General + Essential Maths.
    // The student only has 4 General subjects, so they need 1 valid Applied or VET subject.
    expect(result.isEligible).toBe(false);
    expect(result.eligibleSubjectCombination).toBe('Ineligible');
    expect(result.feedback.some(f => f.includes('QTAC Incompatible Subject Rule'))).toBe(true);
  });
});

describe('QTAC Selection Rank & Institutional Adjustments', () => {
  it('applies UQ subject adjustments capped at +5.0 points', () => {
    // Maths Methods (+2), Specialist Maths (+2), Physics (+2) = 6 points raw, but UQ cap is 5.0
    const res = calculateQtacSelectionRank({
      rawAtar: 85.0,
      mathsMethodsPassed: true,
      specialistMathsPassed: true,
      physicsPassed: true,
      institution: 'UQ',
    });

    expect(res.subjectBonusPoints).toBe(6.0);
    expect(res.totalRawBonusPoints).toBe(6.0);
    expect(res.institutionCap).toBe(5.0);
    expect(res.effectiveBonusPoints).toBe(5.0);
    expect(res.selectionRank).toBe(90.0);
    expect(res.institutionName).toContain('University of Queensland');
  });

  it('applies Griffith University adjustments with +6.0 cap including Chemistry', () => {
    const res = calculateQtacSelectionRank({
      rawAtar: 80.0,
      mathsMethodsPassed: true,
      chemistryPassed: true,
      ruralRegionalApplicant: true,
      institution: 'GRIFFITH',
    });

    // Maths Methods (+2) + Chemistry (+2) + Rural (+2) = +6.0
    expect(res.subjectBonusPoints).toBe(4.0);
    expect(res.ruralBonusPoints).toBe(2.0);
    expect(res.institutionCap).toBe(6.0);
    expect(res.effectiveBonusPoints).toBe(6.0);
    expect(res.selectionRank).toBe(86.0);
  });

  it('applies Educational Access Scheme (EAS / Low-SES) up to 5 points', () => {
    const res = calculateQtacSelectionRank({
      rawAtar: 70.0,
      easCategoriesCount: 4, // 4 EAS categories = +4.0
      ruralRegionalApplicant: false,
      institution: 'QUT',
    });

    expect(res.easBonusPoints).toBe(4.0);
    expect(res.effectiveBonusPoints).toBe(4.0);
    expect(res.selectionRank).toBe(74.0);
    expect(res.institutionName).toContain('Queensland University of Technology');
  });

  it('caps selection rank at maximum 99.95', () => {
    const res = calculateQtacSelectionRank({
      rawAtar: 98.0,
      mathsMethodsPassed: true,
      specialistMathsPassed: true,
      institution: 'UQ',
    });

    expect(res.effectiveBonusPoints).toBe(4.0);
    expect(res.selectionRank).toBe(99.95);
  });

  it('supports regional universities (UniSC, UniSQ, CQU, JCU)', () => {
    const uniSqRes = calculateQtacSelectionRank({
      rawAtar: 62.0,
      ruralRegionalApplicant: true,
      mathsMethodsPassed: true,
      institution: 'UniSQ',
    });
    expect(uniSqRes.institutionCap).toBe(6.0);
    expect(uniSqRes.selectionRank).toBe(66.0);

    const jcuRes = calculateQtacSelectionRank({
      rawAtar: 78.0,
      ruralRegionalApplicant: true,
      chemistryPassed: true,
      institution: 'JCU',
    });
    expect(jcuRes.subjectBonusPoints).toBe(2.0);
    expect(jcuRes.selectionRank).toBe(82.0);
  });
});

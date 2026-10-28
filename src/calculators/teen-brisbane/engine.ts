/**
 * Teen Brisbane Engine — 50-cent public transport fare savings, QCE 20-credit tracking,
 * best-5 ATAR eligibility, QTAC selection ranks, and tertiary SSAF fee caps for 2026/2027.
 *
 * Statutory and Official References:
 * - Queensland Curriculum and Assessment Authority (QCAA): QCE 20 credits, Core 12 credits,
 *   Literacy/Numeracy requirements, and the August 2026 Academic Integrity course mandate.
 * - Queensland Tertiary Admissions Centre (QTAC): ATAR best-5 subject rule (max 1 Applied or
 *   completed VET Cert III+), 18 Dec 2026 ATAR release, 23 Dec 2026 & 14 Jan 2027 offer rounds.
 * - Dept of Education SSAF caps: $373 in 2026, $386 in 2027 (with SA-HELP loan deferral).
 * - Translink Queensland: $0.50 flat-rate fare across all SEQ zones (made permanent in 2026).
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. PUBLIC TRANSPORT (50c TRANSIT SAVINGS)
// ═══════════════════════════════════════════════════════════════════════════

export interface FiftyCentFareSavingsParams {
  tripsPerWeek: number;
  /** Old average fare per trip before the $0.50 cap (e.g. $4.15 peak Go Card). */
  oldAverageFare: number;
  newFare: number;
}

export interface FiftyCentFareSavingsResult {
  tripsPerWeek: number;
  newFare: number;
  oldAverageFare: number;
  newWeeklyCost: number;
  oldWeeklyCost: number;
  savedWeekly: number;
  savedMonthly: number;
  savedYearly: number;
  savingsPct: number;
}

/**
 * Compare weekly public transport spend at the old average fare vs the $0.50
 * flat fare. Monthly uses 52/12 weeks; yearly uses 52 weeks.
 */
export function fiftyCentFareSavings(
  params: FiftyCentFareSavingsParams
): FiftyCentFareSavingsResult {
  const trips = Math.max(Math.round(params.tripsPerWeek), 0);
  const newFare = Math.max(params.newFare, 0);
  const oldFare = Math.max(params.oldAverageFare, 0);

  const newWeeklyCost = trips * newFare;
  const oldWeeklyCost = trips * oldFare;
  const savedWeekly = oldWeeklyCost - newWeeklyCost;

  return {
    tripsPerWeek: trips,
    newFare,
    oldAverageFare: oldFare,
    newWeeklyCost,
    oldWeeklyCost,
    savedWeekly,
    savedMonthly: savedWeekly * (52 / 12),
    savedYearly: savedWeekly * 52,
    savingsPct: oldWeeklyCost > 0 ? (savedWeekly / oldWeeklyCost) * 100 : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. STATUTORY PARAMETERS: SSAF & QTAC DATES (2026 - 2027)
// ═══════════════════════════════════════════════════════════════════════════

/** Student Services & Amenities Fee (SSAF) full-time cap for 2026 ($373 max) */
export const SSAF_CAP_2026 = 373;
/** Student Services & Amenities Fee (SSAF) full-time cap for 2027 ($386 max) */
export const SSAF_CAP_2027 = 386;

/** SSAF part-time (75%) cap for 2026 ($279.75) */
export const SSAF_PART_TIME_CAP_2026 = 279.75;
/** SSAF part-time (75%) cap for 2027 ($289.50) */
export const SSAF_PART_TIME_CAP_2027 = 289.50;

/** Key QTAC admissions and offer dates for 2026-2027 */
export const QTAC_DATES_2026_2027 = {
  applicationsOpen: '4 August 2026',
  earlyBirdDeadline: '30 September 2026',
  standardFeeStartDate: '1 October 2026',
  seniorExternalExams: '12 October – 18 November 2026',
  atarReleaseDate: '18 December 2026 (9:00 AM)',
  atarReleaseDateShort: '18 Dec 2026',
  changeOfPreferenceRound1: '21 December 2026',
  decemberOfferRound: '23 December 2026',
  changeOfPreferenceRound2: '7 January 2027',
  januaryMajorOfferRound: '14 January 2027',
  januaryMajorOfferRoundShort: '14 Jan 2027',
  subsequentOfferRounds: ['21 Jan 2027', '28 Jan 2027', '4 Feb 2027', '11 Feb 2027'],
} as const;

export interface SsafCalculationParams {
  year: 2026 | 2027;
  isFullTime: boolean;
  useSaHelp: boolean;
}

export interface SsafCalculationResult {
  year: 2026 | 2027;
  maxAnnualCap: number;
  upfrontPayable: number;
  deferredToSaHelp: number;
  weeklyBudgetImpact: number;
  saHelpNote: string;
}

/**
 * Calculate Student Services and Amenities Fee (SSAF) and SA-HELP loan impact.
 */
export function calculateSsafCost(params: SsafCalculationParams): SsafCalculationResult {
  const cap = params.year === 2026
    ? (params.isFullTime ? SSAF_CAP_2026 : SSAF_PART_TIME_CAP_2026)
    : (params.isFullTime ? SSAF_CAP_2027 : SSAF_PART_TIME_CAP_2027);

  const upfront = params.useSaHelp ? 0 : cap;
  const deferred = params.useSaHelp ? cap : 0;
  const weekly = upfront / 52;

  const saHelpNote = params.useSaHelp
    ? `Deferred 100% to your SA-HELP loan (accumulates onto your HECS debt with 0% real interest; $0 cash out-of-pocket).`
    : `Paying upfront: $${cap.toFixed(2)} charged directly by university/institution across semesters.`;

  return {
    year: params.year,
    maxAnnualCap: cap,
    upfrontPayable: upfront,
    deferredToSaHelp: deferred,
    weeklyBudgetImpact: weekly,
    saHelpNote,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. QUEENSLAND CERTIFICATE OF EDUCATION (QCE) 20-CREDIT CHECKER
// ═══════════════════════════════════════════════════════════════════════════

export type QceSubjectType =
  | 'General'
  | 'Applied'
  | 'VET-Cert-II'
  | 'VET-Cert-III'
  | 'VET-Cert-IV'
  | 'Short-Course'
  | 'Other-Recognised';

export interface QceSubjectInput {
  id: string;
  title: string;
  type: QceSubjectType;
  /** Units completed with passing grade (e.g. 1, 2, 3, 4 units) */
  unitsPassed: number;
  /** Grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'Competent' | 'Not-Yet-Competent' */
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'Competent' | 'Not-Yet-Competent';
  /** Whether this subject satisfies the Literacy requirement (English, Literature, EAL, Essential English, Short Course Literacy) */
  isLiteracy?: boolean;
  /** Whether this subject satisfies the Numeracy requirement (General Maths, Methods, Specialist, Essential Maths, Short Course Numeracy) */
  isNumeracy?: boolean;
}

export interface QceEligibilityParams {
  subjects: QceSubjectInput[];
  /** Mandatory QCAA Academic Integrity Course completed via myQCE (August 2026 rule) */
  academicIntegrityCourseCompleted: boolean;
}

export interface QceEligibilityResult {
  totalCreditsEarned: number;
  coreCreditsEarned: number;
  hasMet20Credits: boolean;
  hasMet12CoreCredits: boolean;
  hasMetLiteracy: boolean;
  hasMetNumeracy: boolean;
  hasMetAcademicIntegrity: boolean;
  isQceEligible: boolean;
  shortfallCredits: number;
  shortfallCoreCredits: number;
  literacySubjectName?: string;
  numeracySubjectName?: string;
  feedbackMessages: string[];
}

/**
 * Checks whether a student's senior school subjects satisfy the Queensland Certificate
 * of Education (QCE) requirements:
 * 1. At least 20 credits at a standard of pass (grade C or Competent).
 * 2. At least 12 credits must come from completed Core courses.
 * 3. Literacy requirement met (grade C or Competent in at least 1 unit).
 * 4. Numeracy requirement met (grade C or Competent in at least 1 unit).
 * 5. Completion of mandatory 1-hour QCAA Academic Integrity Course (August 2026).
 */
export function checkQceEligibility(params: QceEligibilityParams): QceEligibilityResult {
  let totalCredits = 0;
  let coreCredits = 0;
  let hasLiteracy = false;
  let hasNumeracy = false;
  let literacySub: string | undefined;
  let numeracySub: string | undefined;

  for (const sub of params.subjects) {
    const isPassing = sub.grade === 'A' || sub.grade === 'B' || sub.grade === 'C' || sub.grade === 'Competent';
    if (!isPassing) continue;

    let creditsForSubject = 0;
    let isCore = false;

    switch (sub.type) {
      case 'General':
      case 'Applied':
        // Standard General & Applied subjects: 1 credit per unit passed (up to 4 credits for units 1-4)
        creditsForSubject = Math.min(Math.max(sub.unitsPassed, 0), 4);
        // Completed course (3 or 4 units) counts towards Core credits
        isCore = sub.unitsPassed >= 3;
        break;

      case 'VET-Cert-II':
        creditsForSubject = Math.min(Math.max(sub.unitsPassed, 0), 4);
        isCore = true;
        break;

      case 'VET-Cert-III':
      case 'VET-Cert-IV':
        // Up to 8 credits for completed Certificate III or IV
        creditsForSubject = Math.min(Math.max(sub.unitsPassed, 0), 8);
        isCore = true;
        break;

      case 'Short-Course':
        // 1 credit for short courses (Literacy, Numeracy, Career Education)
        creditsForSubject = Math.min(Math.max(sub.unitsPassed, 0), 1);
        isCore = false; // Short courses do not count towards the 12 Core credits
        break;

      case 'Other-Recognised':
        creditsForSubject = Math.max(sub.unitsPassed, 0);
        isCore = false;
        break;
    }

    totalCredits += creditsForSubject;
    if (isCore) {
      coreCredits += creditsForSubject;
    }

    if (sub.isLiteracy && !hasLiteracy && creditsForSubject > 0) {
      hasLiteracy = true;
      literacySub = sub.title;
    }

    if (sub.isNumeracy && !hasNumeracy && creditsForSubject > 0) {
      hasNumeracy = true;
      numeracySub = sub.title;
    }
  }

  const hasMet20Credits = totalCredits >= 20;
  const hasMet12CoreCredits = coreCredits >= 12;
  const hasMetAcademicIntegrity = params.academicIntegrityCourseCompleted;
  const isQceEligible = hasMet20Credits && hasMet12CoreCredits && hasLiteracy && hasNumeracy && hasMetAcademicIntegrity;

  const feedbackMessages: string[] = [];

  if (!hasMet20Credits) {
    feedbackMessages.push(`Needs ${20 - totalCredits} more credit(s) to reach the 20-credit QCE threshold.`);
  } else {
    feedbackMessages.push(`Achieved ${totalCredits}/20 QCE credits.`);
  }

  if (!hasMet12CoreCredits) {
    feedbackMessages.push(`Needs ${12 - coreCredits} more credit(s) from completed Core courses (currently ${coreCredits}/12).`);
  } else {
    feedbackMessages.push(`Met the 12 Core credits rule (${coreCredits}/12 achieved).`);
  }

  if (!hasLiteracy) {
    feedbackMessages.push('Missing Literacy requirement (requires at least 1 unit passed in an approved English/Literacy subject).');
  }

  if (!hasNumeracy) {
    feedbackMessages.push('Missing Numeracy requirement (requires at least 1 unit passed in an approved Mathematics/Numeracy subject).');
  }

  if (!hasMetAcademicIntegrity) {
    feedbackMessages.push('Must complete the mandatory 1-hour QCAA Academic Integrity Course via myQCE (August 2026 rule).');
  }

  if (isQceEligible) {
    feedbackMessages.push('🎉 Congratulations! All Queensland Certificate of Education (QCE) criteria met.');
  }

  return {
    totalCreditsEarned: totalCredits,
    coreCreditsEarned: coreCredits,
    hasMet20Credits,
    hasMet12CoreCredits,
    hasMetLiteracy: hasLiteracy,
    hasMetNumeracy: hasNumeracy,
    hasMetAcademicIntegrity,
    isQceEligible,
    shortfallCredits: Math.max(0, 20 - totalCredits),
    shortfallCoreCredits: Math.max(0, 12 - coreCredits),
    literacySubjectName: literacySub,
    numeracySubjectName: numeracySub,
    feedbackMessages,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATAR BEST-5 SUBJECT ELIGIBILITY & AGGREGATE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

export interface SeniorSubjectForAtar {
  id: string;
  title: string;
  type: 'General' | 'Applied' | 'VET-Cert-III' | 'VET-Cert-IV' | 'Diploma' | 'Short-Course' | 'Other';
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'Competent' | 'Not-Yet-Competent';
  /** True if this is English, Literature, EAL, English & Literature Ext, or Essential English */
  isEnglishSubject?: boolean;
  /** Scaled score or estimated subject result out of 100 */
  scaledScore: number;
}

export interface AtarEligibilityParams {
  subjects: SeniorSubjectForAtar[];
}

export interface AtarEligibilityResult {
  isEligible: boolean;
  englishPassed: boolean;
  eligibleSubjectCombination: '5-General' | '4-General-plus-1-Applied' | '4-General-plus-1-VET' | 'Ineligible';
  best5Subjects: SeniorSubjectForAtar[];
  estimatedAggregate: number; // Max 500 (sum of best 5 scaled scores)
  estimatedAtar: number;
  feedback: string[];
}

/**
 * Estimates ATAR percentile from aggregate score (0-500) based on typical QTAC scaling curve.
 */
export function aggregateToEstimatedAtar(aggregate: number): number {
  if (aggregate <= 150) return Math.max(30.0, +(aggregate * 0.2).toFixed(2));
  if (aggregate >= 485) return 99.95;
  if (aggregate >= 460) return +(98.0 + ((aggregate - 460) / 25) * 1.95).toFixed(2);
  if (aggregate >= 415) return +(92.0 + ((aggregate - 415) / 45) * 6.0).toFixed(2);
  if (aggregate >= 365) return +(80.0 + ((aggregate - 365) / 50) * 12.0).toFixed(2);
  if (aggregate >= 315) return +(70.0 + ((aggregate - 315) / 50) * 10.0).toFixed(2);
  if (aggregate >= 250) return +(55.0 + ((aggregate - 250) / 65) * 15.0).toFixed(2);
  return +(30.0 + ((aggregate - 150) / 100) * 25.0).toFixed(2);
}

/**
 * Helper to determine if two subjects are in the same excluded study area under QTAC rules.
 * QTAC rule: A student cannot combine a General and an Applied/Essential subject from the
 * same subject area (e.g. General Mathematics & Essential Mathematics, or English & Essential English).
 */
export function areSubjectsIncompatible(s1: SeniorSubjectForAtar, s2: SeniorSubjectForAtar): boolean {
  const norm1 = s1.title.toLowerCase();
  const norm2 = s2.title.toLowerCase();

  const isMath1 = norm1.includes('math');
  const isMath2 = norm2.includes('math');
  if (isMath1 && isMath2) {
    const isEssential1 = norm1.includes('essential');
    const isEssential2 = norm2.includes('essential');
    if ((isEssential1 && !isEssential2) || (!isEssential1 && isEssential2)) {
      return true;
    }
  }

  const isEng1 = norm1.includes('english') || norm1.includes('literature');
  const isEng2 = norm2.includes('english') || norm2.includes('literature');
  if (isEng1 && isEng2) {
    const isEssentialEng1 = norm1.includes('essential');
    const isEssentialEng2 = norm2.includes('essential');
    if ((isEssentialEng1 && !isEssentialEng2) || (!isEssentialEng1 && isEssentialEng2)) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates ATAR eligibility and calculates best-5 subjects based on QTAC rules:
 * 1. Prerequisite: Pass an approved English subject with grade C or higher in Units 3 & 4.
 * 2. Combination: Must be either:
 *    - 5 General subjects (Units 3 & 4)
 *    - 4 General subjects + 1 Applied subject (Units 3 & 4)
 *    - 4 General subjects + 1 completed VET Certificate III or higher.
 * 3. Max ONE Applied or ONE completed VET qualification may count towards the best 5.
 * 4. Short courses and VET Cert I/II do NOT count towards ATAR aggregate.
 * 5. Cannot combine General and Applied subjects from the same subject area (e.g. General Maths + Essential Maths).
 */
export function checkAtarEligibility(params: AtarEligibilityParams): AtarEligibilityResult {
  const passingEnglish = params.subjects.find(
    s => s.isEnglishSubject && (s.grade === 'A' || s.grade === 'B' || s.grade === 'C')
  );
  const englishPassed = !!passingEnglish;

  // Filter passed subjects eligible for ATAR (grade C or Competent)
  const passedEligible = params.subjects.filter(
    s => s.grade === 'A' || s.grade === 'B' || s.grade === 'C' || s.grade === 'Competent'
  );

  const generalSubjects = passedEligible
    .filter(s => s.type === 'General')
    .sort((a, b) => b.scaledScore - a.scaledScore);

  const appliedSubjects = passedEligible
    .filter(s => s.type === 'Applied')
    .sort((a, b) => b.scaledScore - a.scaledScore);

  const vetSubjects = passedEligible
    .filter(s => s.type === 'VET-Cert-III' || s.type === 'VET-Cert-IV' || s.type === 'Diploma')
    .sort((a, b) => b.scaledScore - a.scaledScore);

  // Evaluate candidate combinations:
  // Option A: 5 General subjects
  let optA: SeniorSubjectForAtar[] | null = null;
  let scoreA = -1;
  if (generalSubjects.length >= 5) {
    optA = generalSubjects.slice(0, 5);
    scoreA = optA.reduce((sum, s) => sum + s.scaledScore, 0);
  }

  // Option B: 4 General + 1 Applied (must not be mutually exclusive with the 4 General subjects)
  let optB: SeniorSubjectForAtar[] | null = null;
  let scoreB = -1;
  let appliedExcludedDueToConflict = false;
  if (generalSubjects.length >= 4 && appliedSubjects.length >= 1) {
    const top4General = generalSubjects.slice(0, 4);
    const validApplied = appliedSubjects.find(app => !top4General.some(gen => areSubjectsIncompatible(gen, app)));
    if (validApplied) {
      optB = [...top4General, validApplied];
      scoreB = optB.reduce((sum, s) => sum + s.scaledScore, 0);
    } else {
      appliedExcludedDueToConflict = true;
    }
  }

  // Option C: 4 General + 1 VET Cert III+
  let optC: SeniorSubjectForAtar[] | null = null;
  let scoreC = -1;
  if (generalSubjects.length >= 4 && vetSubjects.length >= 1) {
    optC = [...generalSubjects.slice(0, 4), vetSubjects[0]];
    scoreC = optC.reduce((sum, s) => sum + s.scaledScore, 0);
  }

  let bestCombination: '5-General' | '4-General-plus-1-Applied' | '4-General-plus-1-VET' | 'Ineligible' = 'Ineligible';
  let best5: SeniorSubjectForAtar[] = [];
  let bestScore = 0;

  if (scoreA >= scoreB && scoreA >= scoreC && optA) {
    bestCombination = '5-General';
    best5 = optA;
    bestScore = scoreA;
  } else if (scoreB >= scoreA && scoreB >= scoreC && optB) {
    bestCombination = '4-General-plus-1-Applied';
    best5 = optB;
    bestScore = scoreB;
  } else if (optC) {
    bestCombination = '4-General-plus-1-VET';
    best5 = optC;
    bestScore = scoreC;
  }

  const isEligible = englishPassed && bestCombination !== 'Ineligible';
  const feedback: string[] = [];

  if (!englishPassed) {
    feedback.push('⚠️ An approved English subject must be passed with a grade of C or higher in Units 3 & 4 for ATAR eligibility.');
  }

  if (bestCombination === 'Ineligible') {
    feedback.push('⚠️ Does not meet the QTAC Best-5 rule: requires either 5 General subjects, or 4 General + 1 Applied/Cert III.');
    if (generalSubjects.length < 4) {
      feedback.push(`Currently have only ${generalSubjects.length} passed General subject(s). At least 4 General subjects are required.`);
    }
    if (appliedSubjects.length > 1 && generalSubjects.length < 4) {
      feedback.push('Rule reminder: QTAC allows a maximum of ONE Applied subject or VET qualification to count toward your ATAR.');
    }
    if (appliedExcludedDueToConflict) {
      feedback.push('⚠️ QTAC Incompatible Subject Rule: Essential/Applied subjects cannot be counted alongside General subjects from the same subject area (e.g. General Maths + Essential Maths).');
    }
  } else {
    feedback.push(`Eligible for QTAC ATAR calculation via ${bestCombination.replace(/-/g, ' ')} pathway.`);
    if (appliedSubjects.length > 1) {
      feedback.push(`Note: You took ${appliedSubjects.length} Applied subjects; only the highest scoring eligible one (${best5.find(s => s.type === 'Applied')?.title}) was included in your Best 5.`);
    }
    const isEnglishInBest5 = best5.some(s => s.isEnglishSubject);
    if (englishPassed && !isEnglishInBest5 && passingEnglish) {
      feedback.push(`✓ English prerequisite met with ${passingEnglish.title} (Grade ${passingEnglish.grade}). English does not need to be in your Best 5 aggregate because you had 5 higher-scaling subjects.`);
    }
  }

  const estimatedAtar = isEligible ? aggregateToEstimatedAtar(bestScore) : 0;

  return {
    isEligible,
    englishPassed,
    eligibleSubjectCombination: bestCombination,
    best5Subjects: best5,
    estimatedAggregate: +bestScore.toFixed(1),
    estimatedAtar,
    feedback,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. QTAC SELECTION RANK & BONUS ADJUSTMENT CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

export type QldUniversityCode =
  | 'UQ'
  | 'QUT'
  | 'GRIFFITH'
  | 'UniSC'
  | 'UniSQ'
  | 'ACU'
  | 'CQU'
  | 'JCU'
  | 'Bond'
  | 'Other';

export interface QtacAdjustmentParams {
  rawAtar: number;
  mathsMethodsPassed?: boolean;
  specialistMathsPassed?: boolean;
  physicsPassed?: boolean;
  chemistryPassed?: boolean;
  lotePassed?: boolean;
  easCategoriesCount?: number; // Up to 5 points for Educational Access Scheme / SES
  ruralRegionalApplicant?: boolean; // Up to 2 points for regional/rural Queensland
  institution?: QldUniversityCode;
}

export interface QtacAdjustmentResult {
  rawAtar: number;
  subjectBonusPoints: number;
  easBonusPoints: number;
  ruralBonusPoints: number;
  totalRawBonusPoints: number;
  institutionCap: number;
  effectiveBonusPoints: number;
  selectionRank: number;
  institutionName: string;
  guaranteedOffersSummary: string;
  notes: string[];
}

export const QLD_UNI_ADJUSTMENT_CAPS: Record<QldUniversityCode, { cap: number; name: string; summary: string }> = {
  UQ: {
    cap: 5.0,
    name: 'University of Queensland (UQ)',
    summary: 'UQ Guaranteed ATAR Scheme (guaranteed admission if published threshold met); max 5 adjustment points.',
  },
  QUT: {
    cap: 5.0,
    name: 'Queensland University of Technology (QUT)',
    summary: 'QUT Year 12 Offer Guarantee (published ranks for early placement); max 5 adjustment points.',
  },
  GRIFFITH: {
    cap: 6.0,
    name: 'Griffith University',
    summary: 'Griffith Guaranteed Admission Scheme; up to +6 adjustment points (includes Logan/Gold Coast priority).',
  },
  UniSC: {
    cap: 5.0,
    name: 'University of the Sunshine Coast (UniSC)',
    summary: 'UniSC Early Offer Guarantee (principal recommendation + ATAR); +3 local area bonus ranks.',
  },
  UniSQ: {
    cap: 6.0,
    name: 'University of Southern Queensland (UniSQ)',
    summary: 'UniSQ Accelerated Entry Guarantee; up to +4 regional bonus points (Toowoomba, Ipswich, Darling Downs).',
  },
  ACU: {
    cap: 5.0,
    name: 'Australian Catholic University (ACU Banyo)',
    summary: 'ACU Guarantee (Year 11 early offers); Access ACU provides up to +5 adjustment points.',
  },
  CQU: {
    cap: 5.0,
    name: 'CQUniversity (CQU Brisbane & Regional)',
    summary: "Principal's Recommendation Scheme; up to +5 points with +2 rural/regional access bonus.",
  },
  JCU: {
    cap: 5.0,
    name: 'James Cook University (JCU)',
    summary: 'JCU Early Offer Program; rural/regional medical pathway (no UCAT required; +2 to +4 regional bonus).',
  },
  Bond: {
    cap: 5.0,
    name: 'Bond University (Private)',
    summary: 'Bond Early Offer Program (direct application; 2-year accelerated degrees; holistic interview review).',
  },
  Other: {
    cap: 5.0,
    name: 'Queensland Tertiary Provider',
    summary: 'Standard Queensland QTAC selection rank adjustment rules (typically max 5 points).',
  },
};

/**
 * Calculates effective QTAC selection rank with subject bonus points, Educational Access Scheme (EAS),
 * and regional/rural adjustments, capped per university guidelines.
 */
export function calculateQtacSelectionRank(params: QtacAdjustmentParams): QtacAdjustmentResult {
  const raw = Math.min(99.95, Math.max(0, params.rawAtar));
  const institutionKey = params.institution || 'UQ';
  const instConfig = QLD_UNI_ADJUSTMENT_CAPS[institutionKey];

  let subjectBonus = 0;
  if (params.mathsMethodsPassed) subjectBonus += 2.0;
  if (params.specialistMathsPassed) subjectBonus += 2.0;
  if (params.physicsPassed) subjectBonus += 2.0;
  if (params.chemistryPassed && (institutionKey === 'GRIFFITH' || institutionKey === 'JCU')) {
    subjectBonus += 2.0;
  }
  if (params.lotePassed) subjectBonus += 2.0;

  const easBonus = Math.min(5.0, Math.max(0, (params.easCategoriesCount || 0) * 1.0));
  const ruralBonus = params.ruralRegionalApplicant ? 2.0 : 0.0;

  const totalRaw = subjectBonus + easBonus + ruralBonus;
  const effectiveBonus = Math.min(instConfig.cap, totalRaw);
  const selectionRank = Math.min(99.95, +(raw + effectiveBonus).toFixed(2));

  const notes: string[] = [
    `Raw ATAR: ${raw.toFixed(2)}`,
    `Subject adjustments: +${subjectBonus.toFixed(1)} rank points (Maths Methods, Specialist, Physics, LOTE).`,
    `EAS (SES / Disadvantage): +${easBonus.toFixed(1)} rank points.`,
    `Regional / Rural: +${ruralBonus.toFixed(1)} rank points.`,
    `Institution cap: maximum +${instConfig.cap.toFixed(1)} adjustment points applied for ${instConfig.name}.`,
    `Effective Selection Rank: ${selectionRank.toFixed(2)}`,
  ];

  return {
    rawAtar: raw,
    subjectBonusPoints: subjectBonus,
    easBonusPoints: easBonus,
    ruralBonusPoints: ruralBonus,
    totalRawBonusPoints: totalRaw,
    institutionCap: instConfig.cap,
    effectiveBonusPoints: effectiveBonus,
    selectionRank,
    institutionName: instConfig.name,
    guaranteedOffersSummary: instConfig.summary,
    notes,
  };
}

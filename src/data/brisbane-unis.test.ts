import { describe, it, expect } from 'vitest';
import {
  DETAILED_BRISBANE_UNIS,
  BRISBANE_UNIS,
  QLD_UNIVERSITIES,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
  TRANSLINK_SEQ_POLICY,
  TRANSLINK_50C_FLAT_FARE,
  TRANSLINK_CAR_VS_TRANSIT_COMPARISON,
  QLD_TAFE,
  QLD_HIGH_SCHOOLS,
} from '@/data/brisbane-data';

describe('Brisbane Tertiary Institutions Dataset (2026/2027)', () => {
  it('should include all 7 major South East Queensland tertiary institutions', () => {
    expect(DETAILED_BRISBANE_UNIS).toHaveLength(7);
    const codes = DETAILED_BRISBANE_UNIS.map(u => u.code);
    expect(codes).toContain('UQ');
    expect(codes).toContain('QUT');
    expect(codes).toContain('GRIFFITH');
    expect(codes).toContain('UniSC');
    expect(codes).toContain('UniSQ');
    expect(codes).toContain('ACU');
    expect(codes).toContain('TAFE');
  });

  it('should have complete enrollment and demographic data for each institution', () => {
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.enrollments.total).toBeGreaterThan(10000);
      expect(uni.enrollments.undergrad).toBeGreaterThan(0);
      expect(uni.enrollments.domesticPct + uni.enrollments.internationalPct).toEqual(100);
      expect(uni.enrollments.femalePct + uni.enrollments.malePct).toEqual(100);
      expect(uni.enrollments.firstInFamilyPct).toBeGreaterThan(0);
    });
  });

  it('should contain 10 high-demand courses per institution', () => {
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.top10Courses).toHaveLength(10);
      uni.top10Courses.forEach(course => {
        expect(course.title).toBeTruthy();
        expect(course.duration).toBeTruthy();
        expect(course.cspBandFee).toBeGreaterThan(0);
        expect(course.medianGraduateSalary).toBeGreaterThan(50000);
      });
    });
  });

  it('should have verified 2025/2026 QILT graduate metrics matching official parameters', () => {
    const uniMap = new Map(DETAILED_BRISBANE_UNIS.map(u => [u.code, u]));

    // Official 2025/2026 QILT GOS undergraduate median salaries
    expect(uniMap.get('UniSQ')?.qiltMetrics.medianGraduateSalary).toBe(87100); // UniSQ #1 in Australia / QLD
    expect(uniMap.get('UQ')?.qiltMetrics.medianGraduateSalary).toBe(78000);
    expect(uniMap.get('GRIFFITH')?.qiltMetrics.medianGraduateSalary).toBe(77800);
    expect(uniMap.get('QUT')?.qiltMetrics.medianGraduateSalary).toBe(77000);
    expect(uniMap.get('ACU')?.qiltMetrics.medianGraduateSalary).toBe(76900);
    expect(uniMap.get('UniSC')?.qiltMetrics.medianGraduateSalary).toBe(74500);
    expect(uniMap.get('TAFE')?.qiltMetrics.medianGraduateSalary).toBe(71500);

    // UniSC #1 in QLD for student experience ratings
    expect(uniMap.get('UniSC')?.qiltMetrics.overallSatisfactionPct).toBe(88.7);
    // ACU #1 in Australia for graduate employer satisfaction
    expect(uniMap.get('ACU')?.qiltMetrics.overallSatisfactionPct).toBe(86.2);

    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.qiltMetrics.fullTimeEmpPct).toBeGreaterThan(80);
      expect(uni.qiltMetrics.medianGraduateSalary).toBeGreaterThanOrEqual(70000);
      expect(uni.qiltMetrics.overallSatisfactionPct).toBeGreaterThanOrEqual(80);
    });
  });

  it('should contain guaranteed early offer programs for all tertiary institutions', () => {
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.earlyOfferScheme.name).toBeTruthy();
      expect(uni.earlyOfferScheme.criteria).toBeTruthy();
      expect(uni.earlyOfferScheme.deadline).toBeTruthy();
      expect(uni.earlyOfferScheme.guaranteedRanks).toBeTruthy();
    });
  });

  it('should contain 2026/2027 recent news and campus transit information', () => {
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.campuses.length).toBeGreaterThan(0);
      expect(uni.recentNews.length).toBeGreaterThanOrEqual(3);
      uni.campuses.forEach(c => {
        expect(c.transitTip).toBeTruthy();
      });
    });
  });

  it('should maintain backward compatibility with BRISBANE_UNIS array', () => {
    expect(BRISBANE_UNIS).toHaveLength(7);
  });
});

describe('Statutory SSAF Caps (2026-2027)', () => {
  it('should define official statutory SSAF caps of $373 (2026) and $386 (2027)', () => {
    expect(SSAF_CAP_2026).toBe(373);
    expect(SSAF_CAP_2027).toBe(386);
  });

  it('should reflect 2026 and 2027 SSAF caps in detailed university fee structures', () => {
    const publicUnis = DETAILED_BRISBANE_UNIS.filter(u => u.code !== 'TAFE');
    publicUnis.forEach(uni => {
      expect(uni.feesAndFinancials.ssafAnnual).toBe(SSAF_CAP_2026);
      expect(uni.feesAndFinancials.ssafAnnual2027).toBe(SSAF_CAP_2027);
    });
  });
});

describe('TransLink South East Queensland 50c Flat Fare Policy', () => {
  it('should enforce permanent statutory 50-cent flat fare', () => {
    expect(TRANSLINK_50C_FLAT_FARE).toBe(0.50);
    expect(TRANSLINK_SEQ_POLICY.flatFareAUD).toBe(0.50);
    expect(TRANSLINK_SEQ_POLICY.statutoryPermanent).toBe(true);
  });

  it('should cover all SEQ public transit modes including regional urban buses', () => {
    expect(TRANSLINK_SEQ_POLICY.modesIncluded).toHaveLength(5);
    const modeStr = TRANSLINK_SEQ_POLICY.modesIncluded.join(' ');
    expect(modeStr).toContain('Buses');
    expect(modeStr).toContain('Queensland Rail');
    expect(modeStr).toContain('G:link Light Rail');
    expect(modeStr).toContain('Ferries');
    expect(modeStr).toContain('Regional urban bus');
  });

  it('should provide contactless Smart Ticketing payment methods and free transfers', () => {
    expect(TRANSLINK_SEQ_POLICY.transferRules.freeTransferWindowMinutes).toBe(60);
    const methods = TRANSLINK_SEQ_POLICY.smartTicketingPaymentMethods.join(' ');
    expect(methods).toContain('Visa');
    expect(methods).toContain('Mastercard');
    expect(methods).toContain('Apple Pay');
    expect(methods).toContain('Go Card');
  });

  it('should detail regional bus network expansion across 9 major Queensland regional hubs', () => {
    expect(TRANSLINK_SEQ_POLICY.regionalBusNetworks.length).toBeGreaterThanOrEqual(8);
    const regStr = TRANSLINK_SEQ_POLICY.regionalBusNetworks.join(' ');
    expect(regStr).toContain('Cairns');
    expect(regStr).toContain('Townsville');
    expect(regStr).toContain('Toowoomba');
    expect(regStr).toContain('Mackay');
    expect(regStr).toContain('Rockhampton');
    expect(regStr).toContain('Bundaberg');
    expect(regStr).toContain('Gladstone');
    expect(regStr).toContain('Hervey Bay');
  });

  it('should verify Smart Ticketing rules and Amex discontinuation date of 15 Dec 2025', () => {
    expect(TRANSLINK_SEQ_POLICY.smartTicketingRules.supportedCards).toContain('Visa');
    expect(TRANSLINK_SEQ_POLICY.smartTicketingRules.supportedCards).toContain('Mastercard');
    expect(TRANSLINK_SEQ_POLICY.smartTicketingRules.discontinuationDateAmex).toBe('2025-12-15');
    expect(TRANSLINK_SEQ_POLICY.smartTicketingRules.goldenRule).toContain('exact same physical card or device');
  });

  it('should verify primary school weekend free travel and weekday concession rules', () => {
    expect(TRANSLINK_SEQ_POLICY.concessionRules.primaryAndChildDetails.fareWeekend).toBe(0.00);
    expect(TRANSLINK_SEQ_POLICY.concessionRules.primaryAndChildDetails.fareWeekday).toBe(0.50);
    expect(TRANSLINK_SEQ_POLICY.concessionRules.primaryAndChildDetails.weekendTravel).toContain('Free travel');
    expect(TRANSLINK_SEQ_POLICY.concessionRules.primaryAndChildDetails.weekendTravel).toContain('positive balance');
    expect(TRANSLINK_SEQ_POLICY.concessionRules.primaryAndChildDetails.schoolHolidaysNote).toContain('50c flat concession fare');
  });

  it('should compute economic comparison: $240/yr 50c transit vs $4,000–$6,000/yr car operating costs', () => {
    expect(TRANSLINK_CAR_VS_TRANSIT_COMPARISON.dailyCommuteTransit.dailyCost).toBe(1.00);
    expect(TRANSLINK_CAR_VS_TRANSIT_COMPARISON.dailyCommuteTransit.annualCost48Weeks).toBe(240.00);
    expect(TRANSLINK_CAR_VS_TRANSIT_COMPARISON.carAnnualRunningCosts.subtotalOperating).toBeGreaterThanOrEqual(4000);
    expect(TRANSLINK_CAR_VS_TRANSIT_COMPARISON.annualSavings.baselineSavings).toBeGreaterThanOrEqual(4000);
    expect(TRANSLINK_CAR_VS_TRANSIT_COMPARISON.annualSavings.summary).toContain('saving young adults and students over $3,500 to $5,500');
  });
});

describe('TAFE Queensland 2026/2027 Vocational Offerings', () => {
  it('should offer 30+ fee-free course offerings', () => {
    expect(QLD_TAFE.feeFreeCourses2026.length).toBeGreaterThanOrEqual(30);
  });

  it('should offer Free Apprenticeships for Under 25s across priority industries', () => {
    expect(QLD_TAFE.freeApprenticeshipCoursesU25.length).toBeGreaterThanOrEqual(20);
    expect(QLD_TAFE.freeApprenticeships.industries.length).toBeGreaterThanOrEqual(8);
    expect(QLD_TAFE.freeApprenticeships.note).toContain('30 June 2027');
  });
});

describe('Queensland Universities (QLD_UNIVERSITIES Dataset)', () => {
  it('should include all 9 key Queensland universities: UQ, QUT, Griffith, UniSC, UniSQ, ACU, Bond, CQU, JCU', () => {
    const abbreviations = QLD_UNIVERSITIES.map(u => u.abbreviation);
    expect(abbreviations).toContain('UQ');
    expect(abbreviations).toContain('QUT');
    expect(abbreviations).toContain('Griffith');
    expect(abbreviations).toContain('UniSC');
    expect(abbreviations).toContain('UniSQ');
    expect(abbreviations).toContain('ACU');
    expect(abbreviations).toContain('Bond');
    expect(abbreviations).toContain('CQU');
    expect(abbreviations).toContain('JCU');
  });

  it('should have verified 2025/2026 QILT GOS salaries for all 9 universities', () => {
    const map = new Map(QLD_UNIVERSITIES.map(u => [u.abbreviation, u]));

    expect(map.get('UniSQ')?.qiltSalary).toBe(87100);
    expect(map.get('CQU')?.qiltSalary).toBe(83500);
    expect(map.get('JCU')?.qiltSalary).toBe(78500);
    expect(map.get('UQ')?.qiltSalary).toBe(78000);
    expect(map.get('Griffith')?.qiltSalary).toBe(77800);
    expect(map.get('QUT')?.qiltSalary).toBe(77000);
    expect(map.get('ACU')?.qiltSalary).toBe(76900);
    expect(map.get('UniSC')?.qiltSalary).toBe(74500);
    expect(map.get('Bond')?.qiltSalary).toBe(74000);
  });

  it('should verify student satisfaction ratings and early offer schemes for all 9 universities', () => {
    const keyUnis = ['UQ', 'QUT', 'Griffith', 'UniSC', 'UniSQ', 'ACU', 'Bond', 'CQU', 'JCU'];
    keyUnis.forEach(abbr => {
      const uni = QLD_UNIVERSITIES.find(u => u.abbreviation === abbr);
      expect(uni).toBeDefined();
      expect(uni?.qiltStudentSatisfaction).toBeGreaterThanOrEqual(80);
      expect(uni?.earlyOfferProgram).toBeTruthy();
    });

    // Bond #1 in Australia for student experience
    const bond = QLD_UNIVERSITIES.find(u => u.abbreviation === 'Bond');
    expect(bond?.qiltStudentSatisfaction).toBe(89.5);

    // UniSC #1 in QLD for public university student experience
    const unisc = QLD_UNIVERSITIES.find(u => u.abbreviation === 'UniSC');
    expect(unisc?.qiltStudentSatisfaction).toBe(88.7);
  });

  it('should reflect statutory SSAF caps for public universities and $0 for Bond', () => {
    const publicUnis = ['UQ', 'QUT', 'Griffith', 'UniSC', 'UniSQ', 'ACU', 'CQU', 'JCU'];
    publicUnis.forEach(abbr => {
      const uni = QLD_UNIVERSITIES.find(u => u.abbreviation === abbr);
      expect(uni?.ssaf2026).toBe(373);
      expect(uni?.ssaf2027).toBe(386);
    });

    const bond = QLD_UNIVERSITIES.find(u => u.abbreviation === 'Bond');
    expect(bond?.ssaf2026).toBe(0);
    expect(bond?.ssaf2027).toBe(0);
  });
});

describe('Queensland High Schools Dataset (QLD_HIGH_SCHOOLS)', () => {
  it('should contain at least 100 high schools with 100% complete ICSEA data', () => {
    expect(QLD_HIGH_SCHOOLS.length).toBeGreaterThanOrEqual(100);
    QLD_HIGH_SCHOOLS.forEach(school => {
      expect(school.name).toBeTruthy();
      expect(school.suburb).toBeTruthy();
      expect(school.yearLevels).toBeTruthy();
      expect(school.website).toBeTruthy();
      expect(school.indicativeICSEA).toBeDefined();
      expect(school.indicativeICSEA).toBeGreaterThanOrEqual(800);
      expect(school.indicativeICSEA).toBeLessThanOrEqual(1300);
    });
  });

  it('should feature verified selective-entry schools and top Better Education performers', () => {
    const schoolMap = new Map(QLD_HIGH_SCHOOLS.map(s => [s.name, s]));

    // QASMT #1 performing school
    const qasmt = schoolMap.get('Queensland Academy for Science Mathematics & Technology (QASMT)');
    expect(qasmt).toBeDefined();
    expect(qasmt?.indicativeICSEA).toBe(1185);
    expect(qasmt?.betterEducationRank).toBe(1);
    expect(qasmt?.betterEducationScore).toBe(100);

    // QAHS (Gold Coast Health Sciences)
    const qahs = schoolMap.get('Queensland Academy for Health Sciences (QAHS)');
    expect(qahs).toBeDefined();
    expect(qahs?.indicativeICSEA).toBe(1170);
    expect(qahs?.betterEducationScore).toBe(100);

    // Brisbane Girls Grammar
    const bggs = schoolMap.get('Brisbane Girls Grammar School');
    expect(bggs?.indicativeICSEA).toBe(1206);
    expect(bggs?.betterEducationScore).toBe(100);
    expect(bggs?.medianATAR).toBe(96.2);

    // Brisbane Grammar
    const bgs = schoolMap.get('Brisbane Grammar School');
    expect(bgs?.indicativeICSEA).toBe(1212);
    expect(bgs?.betterEducationScore).toBe(100);

    // Brisbane State High
    const bshs = schoolMap.get('Brisbane State High School');
    expect(bshs?.indicativeICSEA).toBe(1145);
    expect(bshs?.betterEducationScore).toBe(100);

    // Ormiston College
    const ormiston = schoolMap.get('Ormiston College');
    expect(ormiston?.betterEducationRank).toBe(5);
    expect(ormiston?.betterEducationScore).toBe(99);
  });
});

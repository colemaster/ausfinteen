import { describe, it, expect } from 'vitest';
import { DETAILED_BRISBANE_UNIS, BRISBANE_UNIS } from '@/data/brisbane-data';

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

  it('should have valid QILT graduate metrics for all institutions', () => {
    DETAILED_BRISBANE_UNIS.forEach(uni => {
      expect(uni.qiltMetrics.fullTimeEmpPct).toBeGreaterThan(80);
      expect(uni.qiltMetrics.medianGraduateSalary).toBeGreaterThan(65000);
      expect(uni.qiltMetrics.overallSatisfactionPct).toBeGreaterThan(80);
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

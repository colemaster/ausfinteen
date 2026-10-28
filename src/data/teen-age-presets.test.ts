import { describe, it, expect } from 'vitest';
import {
  AGE_PRESETS,
  getAgePreset,
  SUPPORTED_PRESET_AGES,
} from './teen-age-presets';
import { applyStoredAgePreset, resetStoredProfile } from '@/context/TeenProfileContext';

describe('Teen Age Presets Data Audit (Ages 14–20)', () => {
  const REQUIRED_AGES = [14, 15, 16, 17, 18, 19, 20] as const;

  it('contains entries for all required age brackets (14, 15, 16, 17, 18, 19, 20)', () => {
    for (const age of REQUIRED_AGES) {
      const preset = AGE_PRESETS[age];
      expect(preset, `Preset for age ${age} should exist`).toBeDefined();
      expect(preset.age).toBe(age);
      expect(preset.label).toBeTruthy();
      expect(preset.stageName).toBeTruthy();
      expect(preset.jobTitle).toBeTruthy();
      expect(preset.tagline).toBeTruthy();
      expect(preset.stageDescription).toBeTruthy();
      expect(preset.legalRightsSummary).toBeTruthy();
      expect(preset.superRuleExplanation).toBeTruthy();
      expect(preset.taxExplanation).toBeTruthy();
    }
  });

  it('declares SUPPORTED_PRESET_AGES matching [14, 15, 16, 17, 18, 19, 20]', () => {
    expect(SUPPORTED_PRESET_AGES).toEqual([14, 15, 16, 17, 18, 19, 20]);
  });

  describe('Fair Work 2026–27 Junior Award Rates & Realism', () => {
    const ADULT_BASE_RATE = 27.81;
    const CASUAL_LOADING = 1.25;

    it('validates 14yo Under-16 junior award rate (40% + 25% casual)', () => {
      const preset = AGE_PRESETS[14];
      const expectedBase = Math.round(ADULT_BASE_RATE * 0.40 * 100) / 100; // $11.12
      const expectedCasual = Math.round(expectedBase * CASUAL_LOADING * 100) / 100; // $13.90
      expect(preset.hourlyRate).toBe(expectedCasual);
      expect(preset.hoursPerWeek).toBeLessThanOrEqual(12); // Under QLD/VIC school-term cap
      expect(preset.claimsTaxFreeThreshold).toBe(true);
    });

    it('validates 15yo Under-16 junior award rate (40% + 25% casual)', () => {
      const preset = AGE_PRESETS[15];
      expect(preset.hourlyRate).toBe(13.90);
      expect(preset.hoursPerWeek).toBe(8);
      expect(preset.savingsGoalTarget).toBeGreaterThanOrEqual(500); // $500 Mojo buffer
    });

    it('validates 16yo 50% junior rate (25.1% birthday pay rise)', () => {
      const preset = AGE_PRESETS[16];
      expect(preset.hourlyRate).toBe(17.39);
      // Verify +25.1% increase over 15yo rate
      const raisePct = (preset.hourlyRate - AGE_PRESETS[15].hourlyRate) / AGE_PRESETS[15].hourlyRate;
      expect(raisePct).toBeGreaterThan(0.24);
      expect(preset.hoursPerWeek).toBe(12);
    });

    it('validates 17yo 60% junior rate ($20.86/hr casual)', () => {
      const preset = AGE_PRESETS[17];
      expect(preset.hourlyRate).toBe(20.86);
      expect(preset.hoursPerWeek).toBe(15);
      expect(preset.savingsGoalName).toContain('Insurance');
    });

    it('validates 18yo 70% junior rate ($24.34/hr casual)', () => {
      const preset = AGE_PRESETS[18];
      expect(preset.hourlyRate).toBe(24.34);
      expect(preset.hoursPerWeek).toBe(20);
      expect(preset.superRuleExplanation).toContain('EXPIRES');
    });

    it('validates 19yo 80% junior rate ($27.81/hr casual)', () => {
      const preset = AGE_PRESETS[19];
      expect(preset.hourlyRate).toBe(27.81);
      expect(preset.hoursPerWeek).toBe(22);
      expect(preset.taxExplanation).toContain('HECS');
    });

    it('validates 20yo 90% junior rate ($31.29/hr casual)', () => {
      const preset = AGE_PRESETS[20];
      expect(preset.hourlyRate).toBe(31.29);
      expect(preset.hoursPerWeek).toBe(28);
    });
  });

  describe('Typical Weekly Budgets & Living Expense Benchmarks', () => {
    for (const age of REQUIRED_AGES) {
      it(`verifies mathematical consistency of weekly cashflow for age ${age}`, () => {
        const { typicalBudget, hoursPerWeek, hourlyRate } = AGE_PRESETS[age];
        const calculatedGross = Math.round(hoursPerWeek * hourlyRate * 100) / 100;
        expect(typicalBudget.grossIncome).toBeCloseTo(calculatedGross, 1);

        // Net income equals gross minus estimated tax
        expect(typicalBudget.netIncome).toBeCloseTo(typicalBudget.grossIncome - typicalBudget.estimatedTax, 1);

        // Total expenses sum itemized expenses
        const itemizedSum = Object.values(typicalBudget.typicalExpenses).reduce((a, b) => a + b, 0);
        expect(typicalBudget.totalEstimatedExpenses).toBeCloseTo(itemizedSum, 1);

        // Surplus is net minus expenses
        expect(typicalBudget.estimatedWeeklySurplus).toBeCloseTo(
          typicalBudget.netIncome - typicalBudget.totalEstimatedExpenses,
          1
        );
        expect(typicalBudget.estimatedWeeklySurplus).toBeGreaterThan(0);
      });
    }

    it('verifies statutory superannuation rules by age', () => {
      // Under 18: working <=30h/wk has $0 compulsory super
      expect(AGE_PRESETS[14].typicalBudget.superGuarantee).toBe(0);
      expect(AGE_PRESETS[15].typicalBudget.superGuarantee).toBe(0);
      expect(AGE_PRESETS[16].typicalBudget.superGuarantee).toBe(0);
      expect(AGE_PRESETS[17].typicalBudget.superGuarantee).toBe(0);

      // 18+: compulsory 12% super applies on every dollar
      const preset18 = AGE_PRESETS[18];
      expect(preset18.typicalBudget.superGuarantee).toBeCloseTo(preset18.typicalBudget.grossIncome * 0.12, 1);

      const preset19 = AGE_PRESETS[19];
      expect(preset19.typicalBudget.superGuarantee).toBeCloseTo(preset19.typicalBudget.grossIncome * 0.12, 1);

      const preset20 = AGE_PRESETS[20];
      expect(preset20.typicalBudget.superGuarantee).toBeCloseTo(preset20.typicalBudget.grossIncome * 0.12, 1);
    });

    it('verifies tax withholding threshold logic', () => {
      // 14-17yo earning below $350/wk ($18,200/yr) pay $0 PAYG tax
      expect(AGE_PRESETS[14].typicalBudget.estimatedTax).toBe(0);
      expect(AGE_PRESETS[15].typicalBudget.estimatedTax).toBe(0);
      expect(AGE_PRESETS[16].typicalBudget.estimatedTax).toBe(0);
      expect(AGE_PRESETS[17].typicalBudget.estimatedTax).toBe(0);

      // 18yo earning $486.80/wk has tax withheld
      expect(AGE_PRESETS[18].typicalBudget.estimatedTax).toBeGreaterThan(0);
      // 19yo earning $611.82/wk has tax withheld
      expect(AGE_PRESETS[19].typicalBudget.estimatedTax).toBeGreaterThan(0);
      // 20yo earning $876.12/wk has tax withheld
      expect(AGE_PRESETS[20].typicalBudget.estimatedTax).toBeGreaterThan(0);
    });
  });

  describe('Milestones, Checklists & Warning Flags Quality', () => {
    for (const age of REQUIRED_AGES) {
      it(`provides rich practical guidance for age ${age}`, () => {
        const preset = AGE_PRESETS[age];

        // Milestones
        expect(preset.milestones.length).toBeGreaterThanOrEqual(4);
        for (const m of preset.milestones) {
          expect(m.title).toBeTruthy();
          expect(m.description.length).toBeGreaterThan(25);
          expect(m.badge).toBeTruthy();
        }

        // Action checklist
        expect(preset.checklist.length).toBeGreaterThanOrEqual(5);
        for (const c of preset.checklist) {
          expect(c.task).toBeTruthy();
          expect(c.detail.length).toBeGreaterThan(25);
        }

        // Warning flags
        expect(preset.warningFlags.length).toBeGreaterThanOrEqual(3);
        for (const w of preset.warningFlags) {
          expect(w.title).toBeTruthy();
          expect(['high', 'medium', 'info']).toContain(w.severity);
          expect(w.warning.length).toBeGreaterThan(20);
          expect(w.solution.length).toBeGreaterThan(20);
        }

        // Recommended modules
        expect(preset.recommendedModules.length).toBeGreaterThanOrEqual(3);
      });
    }

    it('specifically covers age-defining legal and life milestones', () => {
      // 14yo: TFN application and 5%+ bank account
      expect(AGE_PRESETS[14].milestones.some(m => m.title.includes('TFN'))).toBe(true);
      expect(AGE_PRESETS[14].warningFlags.some(w => w.title.includes('Division 6AA'))).toBe(true);

      // 15yo: Medicare card independence
      expect(AGE_PRESETS[15].milestones.some(m => m.title.includes('Medicare'))).toBe(true);
      expect(AGE_PRESETS[15].checklist.some(c => c.task.includes('Medicare'))).toBe(true);

      // 16yo: Learner licence and 100 logbook hours
      expect(AGE_PRESETS[16].milestones.some(m => m.title.includes('L-Plates'))).toBe(true);
      expect(AGE_PRESETS[16].warningFlags.some(w => w.title.includes('Logbook'))).toBe(true);

      // 17yo: P-Plates and Year 12 ATAR/QTAC
      expect(AGE_PRESETS[17].milestones.some(m => m.title.includes('P-Plates'))).toBe(true);
      expect(AGE_PRESETS[17].warningFlags.some(w => w.title.includes('CTP'))).toBe(true);

      // 18yo: Compulsory 12% Super Guarantee and AEC voting
      expect(AGE_PRESETS[18].milestones.some(m => m.title.includes('Super'))).toBe(true);
      expect(AGE_PRESETS[18].milestones.some(m => m.title.includes('AEC'))).toBe(true);
      expect(AGE_PRESETS[18].warningFlags.some(w => w.title.includes('BNPL'))).toBe(true);

      // 19yo: HECS-HELP and rental bond lodgement
      expect(AGE_PRESETS[19].milestones.some(m => m.title.includes('HECS'))).toBe(true);
      expect(AGE_PRESETS[19].milestones.some(m => m.title.includes('Rental Bond'))).toBe(true);
      expect(AGE_PRESETS[19].warningFlags.some(w => w.title.includes('Rental Bond'))).toBe(true);
    });
  });

  describe('getAgePreset Helper & Context Integration', () => {
    it('returns requested preset when age exists', () => {
      const p14 = getAgePreset(14);
      expect(p14.age).toBe(14);
      const p19 = getAgePreset(19);
      expect(p19.age).toBe(19);
    });

    it('falls back to 15yo preset when unknown age requested', () => {
      const fallback = getAgePreset(99);
      expect(fallback.age).toBe(15);
    });

    it('integrates seamlessly with TeenProfileContext applyStoredAgePreset for all ages', () => {
      resetStoredProfile();

      // Test 14yo preset application
      const profile14 = applyStoredAgePreset(14);
      expect(profile14.age).toBe(14);
      expect(profile14.hourlyRate).toBe(13.90);
      expect(profile14.hoursPerWeek).toBe(5);

      // Test 17yo preset application
      const profile17 = applyStoredAgePreset(17);
      expect(profile17.age).toBe(17);
      expect(profile17.hourlyRate).toBe(20.86);
      expect(profile17.hoursPerWeek).toBe(15);

      // Test 19yo preset application
      const profile19 = applyStoredAgePreset(19);
      expect(profile19.age).toBe(19);
      expect(profile19.hourlyRate).toBe(27.81);
      expect(profile19.hoursPerWeek).toBe(22);

      // Test 20yo preset application
      const profile20 = applyStoredAgePreset(20);
      expect(profile20.age).toBe(20);
      expect(profile20.hourlyRate).toBe(31.29);
      expect(profile20.hoursPerWeek).toBe(28);
    });
  });
});

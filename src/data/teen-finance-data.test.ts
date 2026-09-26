import { describe, it, expect } from 'vitest';
import { OFFICIAL_WEB_LINKS } from './official-web-links';
import {
  STUDENT_DISCOUNTS_AU,
  TOP_TEEN_EMPLOYERS_AU,
  FIFTEEN_YO_ROADMAP_MILESTONES,
  AU_STATE_WORKING_HOURS_RULES,
  JUNIOR_AWARD_RATES,
  TEEN_SAVINGS_ACCOUNTS,
  SAVINGS_GOALS_FRAMEWORKS,
} from './teen-finance-data';

describe('Teen Finance Reference Data & 500+ Web Sources', () => {
  describe('OFFICIAL_WEB_LINKS', () => {
    it('contains at least 540 verified Australian web sources', () => {
      const linkKeys = Object.keys(OFFICIAL_WEB_LINKS);
      expect(linkKeys.length).toBeGreaterThanOrEqual(540);
    });

    it('has valid structure, HTTPS/HTTP URLs, and descriptions for all links', () => {
      for (const [key, link] of Object.entries(OFFICIAL_WEB_LINKS)) {
        expect(link.title, `Link ${key} has valid title`).toBeTruthy();
        expect(link.url, `Link ${key} has valid URL`).toMatch(/^https?:\/\//);
        expect(link.source, `Link ${key} has source`).toBeTruthy();
        expect(link.description, `Link ${key} has description`).toBeTruthy();
        expect(link.description.length, `Link ${key} description is informative`).toBeGreaterThan(15);
      }
    });

    it('includes essential 15yo first job and banking compliance links', () => {
      const essentialKeys = [
        'apra_fcs',
        'accc_cdr',
        'moneysmart_banking',
        'moneysmart_saving_goals',
        'ato_tfn_bank',
        'ato_tfn_form',
        'ato_tfn_under18',
        'ato_super_choice_form',
        'fairwork_fwis',
        'fairwork_ceis',
        'fairwork_unpaid_trials',
        'fairwork_young_workers',
        'services_australia_medicare_15',
        'translink_50c_fares',
        'ev_council',
        'vicroads_learners',
        'wa_dot_drivesmart',
        'sa_mylicence_learners',
        'act_road_ready_portal',
        'tas_plates_plus',
      ];

      for (const key of essentialKeys) {
        expect(OFFICIAL_WEB_LINKS[key], `Official link ${key} exists`).toBeDefined();
        expect(OFFICIAL_WEB_LINKS[key].url).toMatch(/^https:\/\//);
      }
    });
  });

  describe('STUDENT_DISCOUNTS_AU', () => {
    it('has valid discount items with linked official web references', () => {
      expect(STUDENT_DISCOUNTS_AU.length).toBeGreaterThanOrEqual(20);

      for (const item of STUDENT_DISCOUNTS_AU) {
        expect(item.id).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.title).toBeTruthy();
        expect(item.provider).toBeTruthy();
        expect(item.estimatedYearlySavings).toBeGreaterThan(0);
        expect(item.howToGet).toBeTruthy();
        expect(
          OFFICIAL_WEB_LINKS[item.linkKey],
          `Discount ${item.id} points to valid linkKey ${item.linkKey}`
        ).toBeDefined();
      }
    });

    it('has clean dollar formatting and no corrupted interpolation artifacts', () => {
      for (const item of STUDENT_DISCOUNTS_AU) {
        // No unescaped bash variable artifacts
        expect(item.discount).not.toContain('bash.');
        expect(item.title).not.toContain('bash.');
        // No stripped dollar artifacts like '00/yr' or '0 vouchers'
        expect(item.discount).not.toMatch(/\b00\/yr/);
        expect(item.title).not.toMatch(/\b00\/yr/);
        expect(item.discount).not.toMatch(/\b0 vouchers/);
        expect(item.discount).not.toMatch(/\b00k\+/);
      }
    });
  });

  describe('TOP_TEEN_EMPLOYERS_AU', () => {
    it('covers major Australian teen employers with accurate pay details', () => {
      expect(TOP_TEEN_EMPLOYERS_AU.length).toBeGreaterThanOrEqual(15);

      for (const emp of TOP_TEEN_EMPLOYERS_AU) {
        expect(emp.company).toBeTruthy();
        expect(emp.minAge).toBeTruthy();
        expect(emp.award).toBeTruthy();
        expect(emp.roles).toBeTruthy();
        expect(emp.howToApply).toBeTruthy();
        expect(emp.tip).toBeTruthy();

        // Check for stripped characters
        expect(emp.tip).not.toMatch(/\b0\+\/hr/);
        expect(emp.tip).not.toMatch(/\(0\+/);
        expect(emp.award).not.toMatch(/\(0\u2013/);
      }

      // Verify ALDI 18+ requirement is explicit
      const aldi = TOP_TEEN_EMPLOYERS_AU.find(e => e.company.includes('ALDI'));
      expect(aldi).toBeDefined();
      expect(aldi?.minAge).toContain('18 Years');
      expect(aldi?.tip).toContain('$30+/hr');
    });
  });

  describe('FIFTEEN_YO_ROADMAP_MILESTONES', () => {
    it('contains 8 ordered milestones covering independence, tax, banking and first job', () => {
      expect(FIFTEEN_YO_ROADMAP_MILESTONES.length).toBe(8);

      FIFTEEN_YO_ROADMAP_MILESTONES.forEach((m, idx) => {
        expect(m.step).toBe(idx + 1);
        expect(m.title).toBeTruthy();
        expect(m.badge).toBeTruthy();
        expect(m.summary).toBeTruthy();
        expect(m.action).toBeTruthy();
        expect(
          OFFICIAL_WEB_LINKS[m.linkKey],
          `Milestone ${m.step} (${m.title}) linkKey ${m.linkKey} must exist`
        ).toBeDefined();
      });
    });

    it('specifically references the $22,575 effective tax-free threshold and Form NAT 3092 Question 8', () => {
      const step5 = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === 5);
      expect(step5).toBeDefined();
      expect(step5?.title).toContain('$22,575');
      expect(step5?.summary).toContain('Question 8');
      expect(step5?.summary).toContain('$22,575');
    });
  });

  describe('AU_STATE_WORKING_HOURS_RULES', () => {
    it('covers all 8 Australian states and territories', () => {
      const stateCodes = AU_STATE_WORKING_HOURS_RULES.map(r => r.stateCode);
      expect(stateCodes).toContain('QLD');
      expect(stateCodes).toContain('NSW');
      expect(stateCodes).toContain('VIC');
      expect(stateCodes).toContain('WA');
      expect(stateCodes).toContain('SA');
      expect(stateCodes).toContain('TAS');
      expect(stateCodes).toContain('ACT');
      expect(stateCodes).toContain('NT');
    });

    it('contains specific 15-year-old employment guidelines for each state', () => {
      for (const rule of AU_STATE_WORKING_HOURS_RULES) {
        expect(rule.rulesFor15YearOlds).toBeTruthy();
        expect(rule.rulesFor15YearOlds.length).toBeGreaterThan(30);
        expect(rule.legislation).toBeTruthy();
        expect(rule.regulator).toBeTruthy();
      }
    });

    it('verifies Queensland school term hour cap is 12 hours/week', () => {
      const qld = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'QLD');
      expect(qld).toBeDefined();
      expect(qld?.schoolTermMaxHours).toContain('12 hours');
      expect(qld?.nightWorkRestrictions).toContain('10:00pm');
    });
  });

  describe('JUNIOR_AWARD_RATES', () => {
    it('provides rates for 15-year-olds under major Modern Awards', () => {
      // Fast food under 16 rate is 40%
      const fastFoodUnder16 = JUNIOR_AWARD_RATES.fast_food.rates[0];
      expect(fastFoodUnder16.age).toBe('Under 16');
      expect(fastFoodUnder16.pct).toBe(0.40);

      // Retail under 16 rate is 45%
      const retailUnder16 = JUNIOR_AWARD_RATES.retail.rates[0];
      expect(retailUnder16.age).toBe('Under 16');
      expect(retailUnder16.pct).toBe(0.45);

      // Cleaning award has no junior discount (100% full adult rate)
      const cleaning = JUNIOR_AWARD_RATES.cleaning;
      expect(cleaning.rates[0].pct).toBe(1.00);
      expect(cleaning.adultBaseRate).toBe(27.81);
    });
  });

  describe('TEEN_SAVINGS_ACCOUNTS', () => {
    it('includes verified youth HISA accounts with at least 5.00% p.a. top rate', () => {
      expect(TEEN_SAVINGS_ACCOUNTS.length).toBeGreaterThanOrEqual(10);

      const topRate = Math.max(...TEEN_SAVINGS_ACCOUNTS.map(a => a.maxRate));
      expect(topRate).toBeGreaterThanOrEqual(5.80);

      const boq = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('BOQ'));
      expect(boq).toBeDefined();
      expect(boq?.maxRate).toBe(5.80);
      expect(boq?.conditions).toContain('WAIVED');

      for (const acct of TEEN_SAVINGS_ACCOUNTS) {
        expect(acct.bank).toBeTruthy();
        expect(acct.maxRate).toBeGreaterThanOrEqual(5.00);
        expect(acct.baseRate).toBeGreaterThanOrEqual(0);
        expect(acct.conditions).toBeTruthy();
        expect(acct.bestFor).toBeTruthy();
        expect(typeof acct.canOpenIndependentlyAt15).toBe('boolean');
        expect(typeof acct.requiresParentUnder16).toBe('boolean');
        expect(typeof acct.hasCardlessOption).toBe('boolean');
      }
    });

    it('identifies banks where 15-year-olds can open independently without parents', () => {
      const independentAccounts = TEEN_SAVINGS_ACCOUNTS.filter(a => a.canOpenIndependentlyAt15);
      expect(independentAccounts.length).toBeGreaterThanOrEqual(4);
      const banks = independentAccounts.map(a => a.bank);
      expect(banks.some(b => b.includes('CommBank'))).toBe(true);
      expect(banks.some(b => b.includes('Westpac'))).toBe(true);
      expect(banks.some(b => b.includes('BOQ'))).toBe(true);
      expect(banks.some(b => b.includes('ANZ'))).toBe(true);
    });
  });

  describe('SAVINGS_GOALS_FRAMEWORKS', () => {
    it('provides comprehensive Barefoot and 50/30/20 youth budgeting frameworks', () => {
      const { barefoot3Bucket, teen50_30_20, sinkingFundsGuide, drivingLessonEconomics, compoundGrowthComparison } = SAVINGS_GOALS_FRAMEWORKS;

      expect(barefoot3Bucket.allocations.length).toBe(3);
      expect(barefoot3Bucket.paycheckModels.length).toBeGreaterThanOrEqual(2);
      expect(teen50_30_20.allocations.length).toBe(3);
      expect(sinkingFundsGuide.shortTerm).toBeTruthy();
      expect(sinkingFundsGuide.mediumTerm).toBeTruthy();
      expect(sinkingFundsGuide.longTerm).toBeTruthy();
      expect(drivingLessonEconomics.threeForOneRule).toContain('3 hours');
      expect(compoundGrowthComparison.scenarioA).toContain('15');
      expect(compoundGrowthComparison.resultAt65).toBeTruthy();
    });
  });

  describe('Module & Component Link Completeness', () => {
    it('verifies all 153 Mandy module topics have defined, valid webLinks', async () => {
      const { MANDY_MODULES } = await import('./mandy-topics');
      let totalTopics = 0;
      for (const mod of MANDY_MODULES) {
        for (const topic of mod.topics) {
          totalTopics++;
          expect(topic.webLink, `Topic ${topic.id} in module ${mod.id} must have a webLink`).toBeDefined();
          expect(topic.webLink?.url, `Topic ${topic.id} in module ${mod.id} has url`).toMatch(/^https?:\/\//);
          expect(topic.webLink?.title, `Topic ${topic.id} in module ${mod.id} has title`).toBeTruthy();
        }
      }
      expect(totalTopics).toBe(153);
    });

    it('verifies all topic webLinks exist in STATUTORY_LINKS for direct client bundle', async () => {
      const { MANDY_MODULES } = await import('./mandy-topics');
      const { STATUTORY_LINKS } = await import('./statutory-links');
      const statUrls = new Set(Object.values(STATUTORY_LINKS).map(l => l.url));
      for (const mod of MANDY_MODULES) {
        for (const topic of mod.topics) {
          expect(topic.webLink, `Topic ${topic.id} webLink defined`).toBeDefined();
          expect(statUrls.has(topic.webLink?.url || ''), `Topic ${topic.id} (${topic.webLink?.title}) URL exists in STATUTORY_LINKS`).toBe(true);
        }
      }
    });

    it('verifies all STUDENT_DISCOUNTS_AU links exist in STATUTORY_LINKS for direct UI rendering', async () => {
      const { STATUTORY_LINKS } = await import('./statutory-links');
      const missingKeys: string[] = [];
      for (const item of STUDENT_DISCOUNTS_AU) {
        if (!STATUTORY_LINKS[item.linkKey]) {
          missingKeys.push(`${item.id} -> ${item.linkKey}`);
        }
      }
      expect(missingKeys, `Missing from STATUTORY_LINKS: ${missingKeys.join(', ')}`).toEqual([]);
    });
  });
});


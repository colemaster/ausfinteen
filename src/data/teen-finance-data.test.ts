import { describe, it, expect } from 'vitest';
import { OFFICIAL_WEB_LINKS } from './official-web-links';
import {
  STUDENT_DISCOUNTS_AU,
  STUDENT_SAVINGS_SUMMARY,
  TOP_TEEN_EMPLOYERS_AU,
  FIFTEEN_YO_ROADMAP_MILESTONES,
  AU_STATE_WORKING_HOURS_RULES,
  JUNIOR_AWARD_RATES,
  TEEN_SAVINGS_ACCOUNTS,
  SAVINGS_GOALS_FRAMEWORKS,
  MINIMUM_SHIFT_LENGTHS,
  TEEN_ID_CHECKLIST_15YO,
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

    it('verifies student discounts exceed $3,000/year across tech, transport, entertainment and food', () => {
      // Calculate total savings across all items
      const totalSavings = STUDENT_DISCOUNTS_AU.reduce((sum, item) => sum + item.estimatedYearlySavings, 0);
      expect(totalSavings).toBeGreaterThanOrEqual(10000);

      // Verify category coverage
      const categories = new Set(STUDENT_DISCOUNTS_AU.map(i => i.category));
      expect(categories.has('Tech & Hardware')).toBe(true);
      expect(categories.has('Transport')).toBe(true);
      expect(categories.has('Cinema & Entertainment')).toBe(true);
      expect(categories.has('Food & Retail')).toBe(true);
      expect(categories.has('Phone & Internet')).toBe(true);
      expect(categories.has('Music & Streaming')).toBe(true);

      // Verify Tech & Hardware savings alone exceed $2,500/year
      const techSavings = STUDENT_DISCOUNTS_AU
        .filter(i => i.category === 'Tech & Hardware')
        .reduce((sum, i) => sum + i.estimatedYearlySavings, 0);
      expect(techSavings).toBeGreaterThanOrEqual(2500);

      // Verify structured summary constant verifies $3,000+ benchmark
      expect(STUDENT_SAVINGS_SUMMARY.minimumAnnualSavingsPotential).toBe(3000);
      expect(STUDENT_SAVINGS_SUMMARY.typicalAnnualSavings).toBeGreaterThanOrEqual(3000);
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

    it('verifies 15yo roadmap milestones cover 100-point ID, Medicare privacy, and shift rules', () => {
      const step1 = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === 1);
      expect(step1?.summary).toContain('100-point ID');
      expect(step1?.action).toContain('Australia Post');

      const step3 = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === 3);
      expect(step3?.summary).toContain('Medicare card');
      expect(step3?.summary).toContain('MS011');
      expect(step3?.summary).toContain('confidential medical privacy');

      const step4 = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === 4);
      expect(step4?.summary).toContain('3-hour minimum');
      expect(step4?.summary).toContain('1.5-hr Retail');
      expect(step4?.summary).toContain('QLD Form CE1');
    });
  });

  describe('TEEN_ID_CHECKLIST_15YO & 100-Point Verification', () => {
    it('contains primary, secondary photo, and supporting ID categories summing to 100+ points', () => {
      expect(TEEN_ID_CHECKLIST_15YO.length).toBeGreaterThanOrEqual(3);

      const primary = TEEN_ID_CHECKLIST_15YO.find(i => i.type.includes('Primary'));
      expect(primary).toBeDefined();
      expect(primary?.points).toBe(70);
      expect(primary?.examples).toContain('Birth Certificate');

      const secondary = TEEN_ID_CHECKLIST_15YO.find(i => i.type.includes('Secondary'));
      expect(secondary).toBeDefined();
      expect(secondary?.points).toBe(40);
      expect(secondary?.examples).toContain('Student ID');

      // Primary (70) + Secondary (40) easily exceeds the 100-point statutory requirement
      expect((primary?.points || 0) + (secondary?.points || 0)).toBeGreaterThanOrEqual(100);

      const supporting = TEEN_ID_CHECKLIST_15YO.find(i => i.type.includes('Supporting'));
      expect(supporting).toBeDefined();
      expect(supporting?.points).toBe(25);
    });
  });

  describe('MINIMUM_SHIFT_LENGTHS & Shift Exception Rules', () => {
    it('covers all major Modern Awards and includes retail 1.5-hr secondary school exception', () => {
      expect(MINIMUM_SHIFT_LENGTHS.length).toBeGreaterThanOrEqual(10);

      const retail = MINIMUM_SHIFT_LENGTHS.find(m => m.award.includes('General Retail'));
      expect(retail).toBeDefined();
      expect(retail?.note).toContain('1.5-hour minimum shift');
      expect(retail?.note).toContain('Clause 11.3 / 15.7');
      expect(retail?.casualMin).toContain('3 Hours');

      const fastFood = MINIMUM_SHIFT_LENGTHS.find(m => m.award.includes('Fast Food'));
      expect(fastFood?.casualMin).toContain('3 Hours');

      const restaurant = MINIMUM_SHIFT_LENGTHS.find(m => m.award.includes('Restaurant'));
      expect(restaurant?.casualMin).toContain('2 Hours');

      const hairBeauty = MINIMUM_SHIFT_LENGTHS.find(m => m.award.includes('Hair and Beauty'));
      expect(hairBeauty?.casualMin).toContain('3 Hours');
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

    it('verifies Queensland school term hour cap is 12 hours/week and Form CE1 parent consent', () => {
      const qld = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'QLD');
      expect(qld).toBeDefined();
      expect(qld?.schoolTermMaxHours).toContain('12 hours');
      expect(qld?.nightWorkRestrictions).toContain('10:00pm');
      expect(qld?.parentConsentDetails).toContain('Form CE1');
      expect(qld?.parentConsentDetails).toContain('Child Employment Act 2006');
    });

    it('verifies Victoria child employment licensing and under-15 limits', () => {
      const vic = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'VIC');
      expect(vic).toBeDefined();
      expect(vic?.legislation).toContain('Child Employment Act 2003');
      expect(vic?.regulator).toContain('Wage Inspectorate Victoria');
      expect(vic?.schoolDayMaxHours).toContain('3 hours');
      expect(vic?.schoolTermMaxHours).toContain('12 hours');
      expect(vic?.nightWorkRestrictions).toContain('9:00pm');
      expect(vic?.keyRule).toContain('employer licence');
    });

    it('verifies NSW child protection, industrial relations, and compulsory schooling', () => {
      const nsw = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'NSW');
      expect(nsw).toBeDefined();
      expect(nsw?.legislation).toContain('Children and Young Persons (Care and Protection) Act 1998');
      expect(nsw?.legislation).toContain('Industrial Relations (Child Employment) Act 2006');
      expect(nsw?.regulator).toContain("Office of the Children's Guardian");
    });

    it('verifies WA Children and Community Services Act Part 7 and parental permission', () => {
      const wa = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'WA');
      expect(wa).toBeDefined();
      expect(wa?.legislation).toContain('Children and Community Services Act 2004');
      expect(wa?.regulator).toContain('Wageline');
      expect(wa?.parentConsentDetails).toContain('Wageline Parental Permission Form');
      expect(wa?.parentConsentDetails).toContain('$120,000');
    });

    it('verifies SA Section 74 education protection and $10,000 penalty', () => {
      const sa = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'SA');
      expect(sa).toBeDefined();
      expect(sa?.legislation).toContain("Education and Children's Services Act 2019");
      expect(sa?.keyRule).toContain('$10,000');
    });

    it('verifies Tasmania Section 247 education protection and 100 penalty units', () => {
      const tas = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'TAS');
      expect(tas).toBeDefined();
      expect(tas?.legislation).toContain('Education Act 2016');
      expect(tas?.keyRule).toContain('100 penalty units');
    });

    it('verifies ACT Chapter 21 light work 10h/week cap for under-15s', () => {
      const act = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'ACT');
      expect(act).toBeDefined();
      expect(act?.legislation).toContain('Children and Young People Act 2008');
      expect(act?.schoolTermMaxHours).toContain('10 hours');
      expect(act?.keyRule).toContain('10 hrs/week');
    });

    it('verifies NT Section 203 night curfew under Care and Protection of Children Act', () => {
      const nt = AU_STATE_WORKING_HOURS_RULES.find(r => r.stateCode === 'NT');
      expect(nt).toBeDefined();
      expect(nt?.legislation).toContain('Care and Protection of Children Act 2007');
      expect(nt?.legislation).toContain('s 203');
      expect(nt?.nightWorkRestrictions).toContain('10:00pm and 6:00am');
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

    it('verifies Level 1 adult base rates and junior percentage tiers across 10 Modern Awards', () => {
      // 1. Fast Food Award [MA000003]
      expect(JUNIOR_AWARD_RATES.fast_food.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.fast_food.rates.find(r => r.age === 'Under 16')?.pct).toBe(0.40);
      expect(JUNIOR_AWARD_RATES.fast_food.rates.find(r => r.age === '16 years')?.pct).toBe(0.50);
      expect(JUNIOR_AWARD_RATES.fast_food.rates.find(r => r.age === '17 years')?.pct).toBe(0.60);
      expect(JUNIOR_AWARD_RATES.fast_food.rates.find(r => r.age === '18 years')?.pct).toBe(0.70);
      expect(JUNIOR_AWARD_RATES.fast_food.rates.find(r => r.age === '19 years')?.pct).toBe(0.80);

      // 2. General Retail Award [MA000004]
      expect(JUNIOR_AWARD_RATES.retail.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.retail.rates.find(r => r.age === 'Under 16')?.pct).toBe(0.45);
      expect(JUNIOR_AWARD_RATES.retail.rates.find(r => r.age === '16 years')?.pct).toBe(0.50);
      expect(JUNIOR_AWARD_RATES.retail.rates.find(r => r.age === '17 years')?.pct).toBe(0.60);

      // 3. Restaurant Industry Award [MA000119]
      expect(JUNIOR_AWARD_RATES.restaurant.adultBaseRate).toBe(26.44);
      expect(JUNIOR_AWARD_RATES.restaurant.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.50);
      expect(JUNIOR_AWARD_RATES.restaurant.rates.find(r => r.age === '17 years')?.pct).toBe(0.60);

      // 4. Hospitality Industry Award [MA000009]
      expect(JUNIOR_AWARD_RATES.hospitality.adultBaseRate).toBe(26.44);
      expect(JUNIOR_AWARD_RATES.hospitality.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.50);

      // 5. Registered and Licensed Clubs Award [MA000058]
      expect(JUNIOR_AWARD_RATES.clubs.adultBaseRate).toBe(26.44);
      expect(JUNIOR_AWARD_RATES.clubs.rates.find(r => r.age === 'Under 18')?.pct).toBe(0.60);
      expect(JUNIOR_AWARD_RATES.clubs.rates.find(r => r.age === '18 years')?.pct).toBe(0.70);
      expect(JUNIOR_AWARD_RATES.clubs.note).toContain('liquor');

      // 6. Pharmacy Industry Award [MA000012]
      expect(JUNIOR_AWARD_RATES.pharmacy.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.pharmacy.rates.find(r => r.age === 'Under 16')?.pct).toBe(0.45);

      // 7. Fitness Industry Award [MA000094]
      expect(JUNIOR_AWARD_RATES.fitness.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.fitness.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.55);

      // 8. Hair and Beauty Industry Award [MA000005]
      expect(JUNIOR_AWARD_RATES.hair_beauty.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.hair_beauty.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.50);
      expect(JUNIOR_AWARD_RATES.hair_beauty.rates.find(r => r.age === '17 years')?.pct).toBe(0.75);
      expect(JUNIOR_AWARD_RATES.hair_beauty.rates.find(r => r.age === '18+ years')?.pct).toBe(1.00);

      // 9. Cleaning Services Award [MA000022]
      expect(JUNIOR_AWARD_RATES.cleaning.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.cleaning.rates[0].pct).toBe(1.00); // 100% full adult rate for cleaners
      expect(JUNIOR_AWARD_RATES.cleaning.rates.find(r => r.age.includes('Under 16 (Trolley'))?.pct).toBe(0.45);

      // 10. Amusement, Events and Recreation Award [MA000080]
      expect(JUNIOR_AWARD_RATES.amusement.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.amusement.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.55);

      // 11. Broadcasting, Recorded Entertainment and Cinemas Award [MA000091]
      expect(JUNIOR_AWARD_RATES.cinema.adultBaseRate).toBe(27.81);
      expect(JUNIOR_AWARD_RATES.cinema.rates.find(r => r.age === 'Under 17')?.pct).toBe(0.45);
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
      expect(boq?.maxAge).toBe(35);

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

    it('verifies specific parameters for core youth HISA products', () => {
      // BOQ Future Saver (up to 35yo, waived under 18)
      const boq = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('BOQ'));
      expect(boq?.maxRate).toBe(5.80);
      expect(boq?.baseRate).toBe(0.05);
      expect(boq?.minAge).toBe(14);
      expect(boq?.maxAge).toBe(35);
      expect(boq?.canOpenIndependentlyAt15).toBe(true);

      // Newcastle Permanent Smart Saver (Under 25s)
      const newcastle = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Newcastle'));
      expect(newcastle?.maxRate).toBe(5.75);
      expect(newcastle?.maxAge).toBe(25);
      expect(newcastle?.requiresBalanceGrowth).toBe(true);
      expect(newcastle?.canOpenIndependentlyAt15).toBe(true);

      // Great Southern Bank Youth eSaver (Condition-Free up to $5,000)
      const gsb = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Great Southern Bank'));
      expect(gsb?.maxRate).toBe(5.50);
      expect(gsb?.baseRate).toBe(5.50);
      expect(gsb?.minMonthlyDeposit).toBe(0);
      expect(gsb?.maxBalanceCap).toBe(5000);

      // Macquarie Bank Savings Account (flat 5.00%, open from 12yo independently)
      const macquarie = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Macquarie'));
      expect(macquarie?.maxRate).toBe(5.00);
      expect(macquarie?.baseRate).toBe(5.00);
      expect(macquarie?.minAge).toBe(12);
      expect(macquarie?.canOpenIndependentlyAt15).toBe(true);
      expect(macquarie?.requiresParentUnder16).toBe(false);

      // Westpac Bump (Under 18) and Westpac Life Spend & Save (18–40)
      const bump = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Bump'));
      expect(bump?.maxRate).toBe(5.05);
      expect(bump?.maxAge).toBe(17);
      expect(bump?.canOpenIndependentlyAt15).toBe(true);

      const westpacLife = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('Westpac Life'));
      expect(westpacLife?.maxRate).toBe(5.75);
      expect(westpacLife?.minAge).toBe(18);
      expect(westpacLife?.maxAge).toBe(40);
      expect(westpacLife?.minCardPurchases).toBe(20);

      // ING Savings Maximiser
      const ing = TEEN_SAVINGS_ACCOUNTS.find(a => a.bank.includes('ING'));
      expect(ing?.maxRate).toBe(5.50);
      expect(ing?.minMonthlyDeposit).toBe(1000);
      expect(ing?.minCardPurchases).toBe(5);
    });

    it('identifies banks where 15-year-olds can open independently without parents', () => {
      const independentAccounts = TEEN_SAVINGS_ACCOUNTS.filter(a => a.canOpenIndependentlyAt15);
      expect(independentAccounts.length).toBeGreaterThanOrEqual(5);
      const banks = independentAccounts.map(a => a.bank);
      expect(banks.some(b => b.includes('CommBank'))).toBe(true);
      expect(banks.some(b => b.includes('Westpac'))).toBe(true);
      expect(banks.some(b => b.includes('BOQ'))).toBe(true);
      expect(banks.some(b => b.includes('ANZ'))).toBe(true);
      expect(banks.some(b => b.includes('Macquarie'))).toBe(true);
      expect(banks.some(b => b.includes('Newcastle'))).toBe(true);
      expect(banks.some(b => b.includes('Great Southern Bank'))).toBe(true);
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
    it('verifies all Mandy module topics have defined, valid webLinks', async () => {
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
      expect(totalTopics).toBeGreaterThanOrEqual(153);
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


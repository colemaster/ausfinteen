import { describe, it, expect } from 'vitest';
import { dealingWithDebtModule } from './dealing-with-debt';
import { STATUTORY_LINKS } from '../statutory-links';

describe('Dealing with Debt Module (BNPL, Credit Scores & Statutory Hardship)', () => {
  it('defines correct module metadata and route', () => {
    expect(dealingWithDebtModule.id).toBe('dealing-with-debt');
    expect(dealingWithDebtModule.title).toBe('Dealing with Debt');
    expect(dealingWithDebtModule.emoji).toBe('💥');
    expect(dealingWithDebtModule.route).toBe('/dealing-with-debt');
    expect(dealingWithDebtModule.description).toContain('Buy Now Pay Later');
    expect(dealingWithDebtModule.description).toContain('credit score');
  });

  it('contains 14 comprehensive, fully formed topic guides with verified statutory links', () => {
    expect(dealingWithDebtModule.topics.length).toBe(14);

    const statUrls = new Set(Object.values(STATUTORY_LINKS).map((l) => l.url));

    for (const [index, topic] of dealingWithDebtModule.topics.entries()) {
      const expectedId = `dd-${index + 1}`;
      expect(topic.id).toBe(expectedId);
      expect(topic.moduleId).toBe('dealing-with-debt');
      expect(topic.moduleTitle).toContain('Dealing with Debt');

      // Question formatting
      expect(topic.question.length).toBeGreaterThan(15);
      expect(topic.question).toMatch(/^\d+\.\s/);

      // Deep actionable answers
      expect(topic.answer.length).toBeGreaterThan(200);

      // Action steps
      expect(topic.actionStep).toBeDefined();
      expect(topic.actionStep!.length).toBeGreaterThan(25);

      // Statutory Web Links
      expect(topic.webLink).toBeDefined();
      expect(topic.webLink?.url).toMatch(/^https:\/\//);
      expect(topic.webLink?.title).toBeTruthy();
      expect(statUrls.has(topic.webLink!.url)).toBe(true);
    }
  });

  it('covers 2026-2027 BNPL reforms, fee structures for Afterpay/Zip/Klarna/PayPal, and AFCA in Topic dd-1', () => {
    const t1 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-1');
    expect(t1).toBeDefined();
    expect(t1?.answer).toContain('Low Cost Credit Contracts');
    expect(t1?.answer).toContain('Australian Credit Licences');
    expect(t1?.answer).toContain('AFCA');
    expect(t1?.answer).toContain('1800 931 678');
    // Provider fee structures
    expect(t1?.answer).toContain('Afterpay: $10 initial late fee, followed by $7 after 7 days');
    expect(t1?.answer).toContain('capped at 25% of purchase value or $68 maximum per order');
    expect(t1?.answer).toContain('Zip Pay: $9.95 monthly account fee');
    expect(t1?.answer).toContain('$15 late fee');
    expect(t1?.answer).toContain('Klarna: $3 to $5 late fees');
    expect(t1?.answer).toContain('PayPal Pay in 4: $0 late fees from PayPal');
    expect(t1?.answer).toContain('Regulation 69G');
  });

  it('covers CCR 24-month rolling RHI and 3 bureaus in Topic dd-2', () => {
    const t2 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-2');
    expect(t2).toBeDefined();
    expect(t2?.answer).toContain('Comprehensive Credit Reporting');
    expect(t2?.answer).toContain('Equifax');
    expect(t2?.answer).toContain('Experian');
    expect(t2?.answer).toContain('Illion');
    expect(t2?.answer).toContain('24 months');
    expect(t2?.answer).toContain('Repayment History Information');
    expect(t2?.answer).toContain('Financial Hardship Information');
  });

  it('details credit default statutory criteria ($150, 60 days, Section 6Q/21D, 5-year record) in Topic dd-3', () => {
    const t3 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-3');
    expect(t3).toBeDefined();
    expect(t3?.answer).toContain('Privacy Act 1988');
    expect(t3?.answer).toContain('$150');
    expect(t3?.answer).toContain('60 days overdue');
    expect(t3?.answer).toContain('5 years');
    expect(t3?.answer).toContain('Section 6Q');
    expect(t3?.answer).toContain('Section 21D(3)(d)');
    expect(t3?.answer).toContain('Paid Default');
  });

  it('provides verified contact details and statutory scope for NDH, Mob Strong, and AFCA in Topic dd-6', () => {
    const t6 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-6');
    expect(t6).toBeDefined();
    // National Debt Helpline
    expect(t6?.answer).toContain('National Debt Helpline');
    expect(t6?.answer).toContain('1800 007 007');
    expect(t6?.answer).toContain('ndh.org.au');
    // Mob Strong Debt Help
    expect(t6?.answer).toContain('Mob Strong Debt Help');
    expect(t6?.answer).toContain('1800 808 488');
    expect(t6?.answer).toContain('Financial Rights Legal Centre');
    // AFCA
    expect(t6?.answer).toContain('Australian Financial Complaints Authority');
    expect(t6?.answer).toContain('1800 931 678');
    expect(t6?.answer).toContain('$631,500');
    expect(t6?.answer).toContain('$1,263,000');
  });

  it('details Section 72 National Credit Code hardship rights, 21-day timeline, s89A stay, and 12-month FHI in Topic dd-7', () => {
    const t7 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-7');
    expect(t7).toBeDefined();
    expect(t7?.answer).toContain('Section 72 of the National Credit Code');
    expect(t7?.answer).toContain('21 days');
    expect(t7?.answer).toContain('AFCA');
    expect(t7?.answer).toContain('Section 89A');
    expect(t7?.answer).toContain('Financial Hardship Information');
    expect(t7?.answer).toContain('12 months');
    expect(t7?.actionStep).toContain('Section 72 of the National Credit Code');
  });

  it('covers payday loans SACC fee caps and 400%+ APR in Topic dd-10', () => {
    const t10 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-10');
    expect(t10).toBeDefined();
    expect(t10?.answer).toContain('Small Amount Credit Contracts');
    expect(t10?.answer).toContain('20% establishment fee');
    expect(t10?.answer).toContain('4% monthly fee');
    expect(t10?.answer).toContain('400%');
  });

  it('warns against Part IX debt agreements and Criminal Code s400 money muling in Topic dd-11', () => {
    const t11 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-11');
    expect(t11).toBeDefined();
    expect(t11?.answer).toContain('Bankruptcy Act 1966');
    expect(t11?.answer).toContain('National Personal Insolvency Index');
    expect(t11?.answer).toContain('Credit Repair');
    expect(t11?.answer).toContain('Money Mule');
    expect(t11?.answer).toContain('Division 400 of the Criminal Code Act 1995');
    expect(t11?.answer).toContain('25 years imprisonment');
  });

  it('covers HELP student loan indexation cap and marginal repayment brackets in Topic dd-14', () => {
    const t14 = dealingWithDebtModule.topics.find((t) => t.id === 'dd-14');
    expect(t14).toBeDefined();
    expect(t14?.answer).toContain('$69,528');
    expect(t14?.answer).toContain('CPI');
    expect(t14?.answer).toContain('WPI');
    expect(t14?.answer).toContain('$129,883');
  });
});

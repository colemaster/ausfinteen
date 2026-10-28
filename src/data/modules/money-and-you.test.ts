import { describe, it, expect } from 'vitest';
import { moneyAndYouModule } from './money-and-you';
import { STATUTORY_LINKS } from '../statutory-links';

describe('Money & You Module (Behavioral Finance & Teen Psychology)', () => {
  it('defines correct module metadata and route', () => {
    expect(moneyAndYouModule.id).toBe('money-and-you');
    expect(moneyAndYouModule.title).toBe('Money & You');
    expect(moneyAndYouModule.emoji).toBe('🤠');
    expect(moneyAndYouModule.route).toBe('/money-and-you');
    expect(moneyAndYouModule.description).toContain('doom spending');
    expect(moneyAndYouModule.description).toContain('ASIC INFO 269');
  });

  it('contains 18 comprehensive, fully formed topic guides', () => {
    expect(moneyAndYouModule.topics.length).toBe(18);

    const statUrls = new Set(Object.values(STATUTORY_LINKS).map((l) => l.url));

    for (const [index, topic] of moneyAndYouModule.topics.entries()) {
      const expectedId = `my-${index + 1}`;
      expect(topic.id).toBe(expectedId);
      expect(topic.moduleId).toBe('money-and-you');
      expect(topic.moduleTitle).toContain('Money & You');

      // Question quality
      expect(topic.question.length).toBeGreaterThan(15);
      expect(topic.question).toMatch(/^\d+\.\s/);

      // Deep, actionable answers
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

  it('covers Dr. Brad Klontz Money Scripts in Topic 1', () => {
    const t1 = moneyAndYouModule.topics.find((t) => t.id === 'my-1');
    expect(t1).toBeDefined();
    expect(t1?.answer).toContain('Dr. Brad Klontz');
    expect(t1?.answer).toContain('Money Avoidance');
    expect(t1?.answer).toContain('Money Worship');
    expect(t1?.answer).toContain('Money Status');
    expect(t1?.answer).toContain('Money Vigilance');
  });

  it('covers financial mental health, cognitive tunneling, and Barefoot Mojo buffer in Topic 2', () => {
    const t2 = moneyAndYouModule.topics.find((t) => t.id === 'my-2');
    expect(t2).toBeDefined();
    expect(t2?.answer).toContain('amygdala');
    expect(t2?.answer).toContain('tunneling');
    expect(t2?.answer).toContain('Barefoot Investor');
    expect(t2?.answer).toContain('Mojo Safety Buffer');
  });

  it('empowers teens against Money Dysmorphia & Gen Z Doom Spending in Topic 3', () => {
    const t3 = moneyAndYouModule.topics.find((t) => t.id === 'my-3');
    expect(t3).toBeDefined();
    expect(t3?.answer).toContain('Money dysmorphia');
    expect(t3?.answer).toContain('Doom Spending');
    expect(t3?.answer).toContain('Reverse Buy');
    expect(t3?.actionStep).toContain('Future Freedom');
  });

  it('incorporates ASIC INFO 269 and finfluencer regulatory guidance in Topic 4', () => {
    const t4 = moneyAndYouModule.topics.find((t) => t.id === 'my-4');
    expect(t4).toBeDefined();
    expect(t4?.answer).toContain('ASIC');
    expect(t4?.answer).toContain('INFO 269');
    expect(t4?.answer).toContain('Corporations Act 2001');
    expect(t4?.answer).toContain('AFSL');
    expect(t4?.answer).toContain('dealing by arranging');
    expect(t4?.answer).toContain('5 years imprisonment');
    expect(t4?.webLink?.title).toContain('INFO 269');
  });

  it('provides battle-tested scripts to resist peer pressure and overcome FOMO in Topic 5', () => {
    const t5 = moneyAndYouModule.topics.find((t) => t.id === 'my-5');
    expect(t5).toBeDefined();
    expect(t5?.answer).toContain('Casual Goal Pivot');
    expect(t5?.answer).toContain('Firm Boundary');
    expect(t5?.answer).toContain('Workaround');
    expect(t5?.answer).toContain('Goal Blame');
    expect(t5?.answer).toContain('JOMO');
  });

  it('teaches delayed gratification, the 72-hour rule, and cost-per-wear math in Topic 6', () => {
    const t6 = moneyAndYouModule.topics.find((t) => t.id === 'my-6');
    expect(t6).toBeDefined();
    expect(t6?.answer).toContain('72-Hour Anti-Impulse Protocol');
    expect(t6?.answer).toContain('Hours-Worked Rule');
    expect(t6?.answer).toContain('Cost-Per-Wear');
    expect(t6?.answer).toContain('dopamine');
  });

  it('compares Barefoot Buckets with Up Bank digital micro-wallets and locked savers in Topic 7', () => {
    const t7 = moneyAndYouModule.topics.find((t) => t.id === 'my-7');
    expect(t7).toBeDefined();
    expect(t7?.answer).toContain('Blow (60%)');
    expect(t7?.answer).toContain('Mojo (20%)');
    expect(t7?.answer).toContain('Grow (20%)');
    expect(t7?.answer).toContain('Up Bank');
    expect(t7?.answer).toContain('Automated Pay Splitting');
    expect(t7?.answer).toContain('Locked Savers');
  });

  it('builds genuine financial confidence and tackles comparison culture in Topic 8', () => {
    const t8 = moneyAndYouModule.topics.find((t) => t.id === 'my-8');
    expect(t8).toBeDefined();
    expect(t8?.answer).toContain('Morgan Housel');
    expect(t8?.answer).toContain('The Psychology of Money');
    expect(t8?.answer).toContain('BNPL');
  });

  it('explains needs vs wants and the inverted teen budgeting superpower in Topic 9', () => {
    const t9 = moneyAndYouModule.topics.find((t) => t.id === 'my-9');
    expect(t9).toBeDefined();
    expect(t9?.answer).toContain('Inverted Teen 50/30/20 Rule');
    expect(t9?.answer).toContain('50% to Future Wealth');
  });

  it('maintains critical statutory coverage for money muling, task scams, cyber security, CDR, and consumer rights', () => {
    const t10 = moneyAndYouModule.topics.find((t) => t.id === 'my-10');
    expect(t10?.answer).toContain('Part 10.2 Division 400 of the Commonwealth Criminal Code Act 1995');
    expect(t10?.answer).toContain('25 years imprisonment');

    const t11 = moneyAndYouModule.topics.find((t) => t.id === 'my-11');
    expect(t11?.answer).toContain('Telegram or WhatsApp');

    const t12 = moneyAndYouModule.topics.find((t) => t.id === 'my-12');
    expect(t12?.answer).toContain('7726');

    const t13 = moneyAndYouModule.topics.find((t) => t.id === 'my-13');
    expect(t13?.answer).toContain('Consumer Data Right');

    const t14 = moneyAndYouModule.topics.find((t) => t.id === 'my-14');
    expect(t14?.answer).toContain('myID');

    const t15 = moneyAndYouModule.topics.find((t) => t.id === 'my-15');
    expect(t15?.answer).toContain('Australian Consumer Law');

    const t16 = moneyAndYouModule.topics.find((t) => t.id === 'my-16');
    expect(t16?.answer).toContain('Broke Millennial');

    const t17 = moneyAndYouModule.topics.find((t) => t.id === 'my-17');
    expect(t17?.answer).toContain('4.35%');

    const t18 = moneyAndYouModule.topics.find((t) => t.id === 'my-18');
    expect(t18?.answer).toContain('Westpac Life');
  });
});

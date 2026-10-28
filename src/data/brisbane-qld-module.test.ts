import { describe, it, expect } from 'vitest';
import { brisbaneQldModule } from './modules/brisbane-qld';
import { BRISBANE_SUBURBS, QLD_TEEN_RULES, BRISBANE_WEEKLY_BUDGET } from './brisbane-data';

describe('Brisbane QLD Location Module (2026-2027)', () => {
  it('should define the module metadata correctly', () => {
    expect(brisbaneQldModule.id).toBe('brisbane-qld');
    expect(brisbaneQldModule.title).toBe('Brisbane, QLD');
    expect(brisbaneQldModule.emoji).toBe('🏙️');
    expect(brisbaneQldModule.route).toBe('/brisbane-qld');
    expect(brisbaneQldModule.topics.length).toBe(17);
  });

  it('should have valid topic IDs and required fields for all 17 topics', () => {
    brisbaneQldModule.topics.forEach((t, i) => {
      expect(t.id).toBe(`bq-${i + 1}`);
      expect(t.moduleId).toBe('brisbane-qld');
      expect(t.question).toBeTruthy();
      expect(t.answer).toBeTruthy();
      expect(t.actionStep).toBeTruthy();
      expect(t.webLink).toBeDefined();
      expect(t.webLink?.url).toMatch(/^https?:\/\//);
    });
  });

  it('should include 2026-2027 living cost and student budget benchmarks (bq-1)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-1')!;
    expect(t.answer).toContain('$286/week');
    expect(t.answer).toContain('50¢');
    expect(t.answer).toContain('middle-ring');
  });

  it('should accurately detail RTA tenancy laws, 4-week bond cap, and 12-month property cap (bq-4)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-4')!;
    expect(t.answer).toContain('4 weeks rent');
    expect(t.answer).toContain('Residential Tenancies Authority');
    expect(t.answer).toContain('10 days');
    expect(t.answer).toContain('Form 2');
    expect(t.answer).toContain('12 months');
    expect(t.answer).toContain('PROPERTY');
    expect(t.answer).toContain('Rent Bidding Banned');
    expect(t.answer).toContain('Form 9');
  });

  it('should cover QLD statutory rules for teens including super, CTP, and 50c fares (bq-6)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-6')!;
    expect(t.answer).toContain('PrepL');
    expect(t.answer).toContain('100 logbook hours');
    expect(t.answer).toContain('50¢');
    expect(t.answer).toContain('American Express was discontinued');
    expect(t.answer).toContain('CTP');
    expect(t.answer).toContain('12% superannuation');
    expect(t.answer).toContain('30 hours');
  });

  it('should provide comprehensive Smart Ticketing and transit navigation rules (bq-7)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-7')!;
    expect(t.answer).toContain('Card Clash');
    expect(t.answer).toContain('Amex Discontinued');
    expect(t.answer).toContain('December 2025');
    expect(t.answer).toContain('Separate Device Account Tokens');
    expect(t.answer).toContain('60-Minute Transfer Window');
    expect(t.answer).toContain('Airtrain Exception');
    expect(t.answer).toContain('Brisbane Metro');
    expect(t.answer).toContain('Cross River Rail');
  });

  it('should incorporate the updated 2032 Delivery Plan Olympic infrastructure hubs (bq-11)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-11')!;
    expect(t.answer).toContain('Victoria Park Stadium');
    expect(t.answer).toContain('63,000-seat');
    expect(t.answer).toContain('Gabba');
    expect(t.answer).toContain('permanently scrapped');
    expect(t.answer).toContain('Brisbane Arena');
    expect(t.answer).toContain('Woolloongabba');
    expect(t.answer).toContain('QSAC Scrapped');
    expect(t.answer).toContain('Centenary Pool');
    expect(t.answer).toContain('Bowen Hills');
    expect(t.answer).toContain('Northshore Hamilton');
  });

  it('should provide sharehouse legal rights and contract distinctions (bq-15)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-15')!;
    expect(t.answer).toContain('Form 18a');
    expect(t.answer).toContain('joint and several liability');
    expect(t.answer).toContain('Form 18b');
    expect(t.answer).toContain('Form 2');
    expect(t.answer).toContain('Form 1a');
    expect(t.answer).toContain('Form 4');
    expect(t.answer).toContain('Subletting Rules');
  });

  it('should provide SEQ transit navigation for Brisbane Metro, Cross River Rail & CityCats (bq-16)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-16')!;
    expect(t.answer).toContain('Brisbane Metro (M1 & M2)');
    expect(t.answer).toContain('Cross River Rail');
    expect(t.answer).toContain('CityCats');
    expect(t.answer).toContain('NightLink');
    expect(t.answer).toContain('Skygate');
  });

  it('should detail inner vs middle ring rental market dynamics and 100-point applications (bq-17)', () => {
    const t = brisbaneQldModule.topics.find(x => x.id === 'bq-17')!;
    expect(t.answer).toContain('Inner Ring');
    expect(t.answer).toContain('Middle Ring');
    expect(t.answer).toContain('Outer Ring');
    expect(t.answer).toContain('100-Point Tenant Application Pack');
    expect(t.answer).toContain('0.7%–0.9%');
  });
});

describe('Brisbane Suburbs and Teen Rules Datasets', () => {
  it('should maintain backward compatibility for BRISBANE_SUBURBS with St Lucia first', () => {
    expect(BRISBANE_SUBURBS.length).toBeGreaterThanOrEqual(18);
    expect(BRISBANE_SUBURBS[0].suburb).toBe('St Lucia');
  });

  it('should categorize suburbs across inner, middle, and outer rings', () => {
    const inner = BRISBANE_SUBURBS.filter(s => s.ring?.includes('Inner'));
    const middle = BRISBANE_SUBURBS.filter(s => s.ring?.includes('Middle'));
    const outer = BRISBANE_SUBURBS.filter(s => s.ring?.includes('Outer'));

    expect(inner.length).toBeGreaterThanOrEqual(5);
    expect(middle.length).toBeGreaterThanOrEqual(5);
    expect(outer.length).toBeGreaterThanOrEqual(3);
  });

  it('should include key QLD statutory rules in QLD_TEEN_RULES', () => {
    const titles = QLD_TEEN_RULES.map(r => r.title);
    expect(titles.some(t => t.includes('Rental bond'))).toBe(true);
    expect(titles.some(t => t.includes('Rent increases'))).toBe(true);
    expect(titles.some(t => t.includes('Rent bidding'))).toBe(true);
    expect(titles.some(t => t.includes('50c flat fares'))).toBe(true);
    expect(titles.some(t => t.includes('Smart Ticketing'))).toBe(true);
    expect(titles.some(t => t.includes('QLD rego'))).toBe(true);
    expect(titles.some(t => t.includes('Learner licence'))).toBe(true);
    expect(titles.some(t => t.includes('Super for under 18s'))).toBe(true);
  });

  it('should have realistic 2026-27 weekly budget benchmarks', () => {
    const rent = BRISBANE_WEEKLY_BUDGET.find(b => b.category.includes('Rent'))!;
    const pt = BRISBANE_WEEKLY_BUDGET.find(b => b.category.includes('Public transport'))!;

    expect(rent.weekly).toBe(250);
    expect(pt.weekly).toBe(5);
    expect(pt.note).toContain('Visa/Mastercard');
    expect(pt.note).toContain('Amex discontinued');
  });
});

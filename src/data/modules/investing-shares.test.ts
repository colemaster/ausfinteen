import { describe, it, expect } from 'vitest';
import { investingSharesModule } from './investing-shares';
import { STATUTORY_LINKS } from '../statutory-links';

describe('Investing & Shares Module (investing-shares.ts)', () => {
  it('has valid metadata, id, title, and route', () => {
    expect(investingSharesModule.id).toBe('investing-shares');
    expect(investingSharesModule.title).toBe('Investing & Shares');
    expect(investingSharesModule.route).toBe('/investing-shares');
    expect(investingSharesModule.emoji).toBe('⚡️');
    expect(investingSharesModule.description).toContain('ASX');
  });

  it('contains at least 19 comprehensive topics', () => {
    expect(investingSharesModule.topics.length).toBeGreaterThanOrEqual(19);
  });

  it('preserves existing topic IDs is-1 through is-15 and sequences new topics', () => {
    for (let i = 1; i <= 19; i++) {
      const topic = investingSharesModule.topics.find(t => t.id === `is-${i}`);
      expect(topic, `Topic is-${i} must exist`).toBeDefined();
      expect(topic?.moduleId).toBe('investing-shares');
      expect(topic?.question).toBeTruthy();
      expect(topic?.answer).toBeTruthy();
      expect(topic?.actionStep).toBeTruthy();
      expect(topic?.webLink).toBeDefined();
    }
  });

  it('has valid statutory web links that exist in STATUTORY_LINKS for every topic', () => {
    const validUrls = new Set(Object.values(STATUTORY_LINKS).map(l => l.url));
    for (const topic of investingSharesModule.topics) {
      expect(topic.webLink?.url).toBeDefined();
      expect(topic.webLink?.url).toMatch(/^https?:\/\//);
      expect(validUrls.has(topic.webLink!.url)).toBe(true);
    }
  });

  it('covers CHESS sponsorship and the Australian share registry ecosystem accurately', () => {
    const topic8 = investingSharesModule.topics.find(t => t.id === 'is-8');
    expect(topic8?.answer).toContain('HIN');
    expect(topic8?.answer).toContain('Computershare');
    expect(topic8?.answer).toContain('Custodial');

    const topic19 = investingSharesModule.topics.find(t => t.id === 'is-19');
    expect(topic19?.answer).toContain('Computershare');
    expect(topic19?.answer).toContain('MUFG Corporate Markets');
    expect(topic19?.answer).toContain('Boardroom');
    expect(topic19?.answer).toContain('Automic');
  });

  it('covers Franking credits, 30% imputation math and Division 67 ATO cash refunds', () => {
    const topic16 = investingSharesModule.topics.find(t => t.id === 'is-16');
    expect(topic16?.answer).toContain('Division 67');
    expect(topic16?.answer).toContain('30%');
    expect(topic16?.answer).toContain('NAT 4105');
    expect(topic16?.answer).toContain('$416');
  });

  it('covers DRP mechanics and CGT cost base tracking requirements', () => {
    const topic17 = investingSharesModule.topics.find(t => t.id === 'is-17');
    expect(topic17?.answer).toContain('DRP');
    expect(topic17?.answer).toContain('VWAP');
    expect(topic17?.answer).toContain('cost base');
    expect(topic17?.answer).toContain('Sharesight');
  });

  it('covers micro-investing platforms and warns against the flat monthly fee trap', () => {
    const topic7 = investingSharesModule.topics.find(t => t.id === 'is-7');
    expect(topic7?.answer).toContain('Betashares Direct');
    expect(topic7?.answer).toContain('CommSec Pocket');
    expect(topic7?.answer).toContain('Stake');
    expect(topic7?.answer).toContain('Pearler');

    const topic18 = investingSharesModule.topics.find(t => t.id === 'is-18');
    expect(topic18?.answer).toContain('Flat Monthly Fee Trap');
    expect(topic18?.answer).toContain('Raiz');
    expect(topic18?.answer).toContain('fee drag');
  });
});

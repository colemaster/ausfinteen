import { describe, it, expect } from 'vitest';
import { careersEmploymentModule } from './careers-employment';
import { STATUTORY_LINKS } from '../statutory-links';

describe('Careers & Employment Module (careers-employment.ts)', () => {
  it('has valid metadata, id, title, and route', () => {
    expect(careersEmploymentModule.id).toBe('careers-employment');
    expect(careersEmploymentModule.title).toBe('Careers & Employment');
    expect(careersEmploymentModule.route).toBe('/careers-employment');
    expect(careersEmploymentModule.emoji).toBe('💼');
    expect(careersEmploymentModule.description).toContain('Modern Awards');
  });

  it('contains at least 22 comprehensive topics', () => {
    expect(careersEmploymentModule.topics.length).toBeGreaterThanOrEqual(22);
  });

  it('preserves existing topic IDs ce-1 through ce-14 and sequences new topics', () => {
    for (let i = 1; i <= 22; i++) {
      const topic = careersEmploymentModule.topics.find(t => t.id === `ce-${i}`);
      expect(topic, `Topic ce-${i} must exist`).toBeDefined();
      expect(topic?.moduleId).toBe('careers-employment');
      expect(topic?.question).toBeTruthy();
      expect(topic?.answer).toBeTruthy();
      expect(topic?.actionStep).toBeTruthy();
      expect(topic?.webLink).toBeDefined();
    }
  });

  it('has valid statutory web links that exist in STATUTORY_LINKS for every topic', () => {
    const validUrls = new Set(Object.values(STATUTORY_LINKS).map(l => l.url));
    for (const topic of careersEmploymentModule.topics) {
      expect(topic.webLink?.url).toBeDefined();
      expect(topic.webLink?.url).toMatch(/^https?:\/\//);
      expect(validUrls.has(topic.webLink!.url)).toBe(true);
    }
  });

  it('covers the 6 key youth awards and accurate 2026-27 base rates', () => {
    const topic1 = careersEmploymentModule.topics.find(t => t.id === 'ce-1');
    expect(topic1?.answer).toContain('$27.81');
    expect(topic1?.answer).toContain('MA000003');
    expect(topic1?.answer).toContain('MA000004');

    const topic15 = careersEmploymentModule.topics.find(t => t.id === 'ce-15');
    expect(topic15?.answer).toContain('MA000003'); // Fast Food
    expect(topic15?.answer).toContain('MA000004'); // Retail
    expect(topic15?.answer).toContain('MA000119'); // Restaurant
    expect(topic15?.answer).toContain('MA000009'); // Hospitality
    expect(topic15?.answer).toContain('MA000012'); // Pharmacy
    expect(topic15?.answer).toContain('MA000094'); // Fitness
  });

  it('details penalty rates (Saturday, Sunday, Public Holiday 225%/250%/275%) and casual loading', () => {
    const topic16 = careersEmploymentModule.topics.find(t => t.id === 'ce-16');
    expect(topic16?.answer).toContain('125%');
    expect(topic16?.answer).toContain('150%');
    expect(topic16?.answer).toContain('175%');
    expect(topic16?.answer).toContain('225%');
    expect(topic16?.answer).toContain('250%');
    expect(topic16?.answer).toContain('275%');
  });

  it('details the Retail Clause 11.3 1.5-hour student shift concession', () => {
    const topic19 = careersEmploymentModule.topics.find(t => t.id === 'ce-19');
    expect(topic19?.answer).toContain('Clause 11.3');
    expect(topic19?.answer).toContain('3:00pm and 6:30pm');
    expect(topic19?.answer).toContain('parent or guardian');
  });

  it('details Queensland Child Employment Act 2006 and Form CE1 requirements', () => {
    const topic17 = careersEmploymentModule.topics.find(t => t.id === 'ce-17');
    expect(topic17?.answer).toContain('Child Employment Act 2006');
    expect(topic17?.answer).toContain('Form CE1');
    expect(topic17?.answer).toContain('12 hours');
    expect(topic17?.answer).toContain('10:00pm');
  });

  it('covers the liquor service full adult rate exception', () => {
    const topic20 = careersEmploymentModule.topics.find(t => t.id === 'ce-20');
    expect(topic20?.answer).toContain('MA000119');
    expect(topic20?.answer).toContain('MA000009');
    expect(topic20?.answer).toContain('100%');
    expect(topic20?.answer).toContain('RSA');
  });

  it('provides negotiation scripts and casual conversion / right to disconnect', () => {
    const topic21 = careersEmploymentModule.topics.find(t => t.id === 'ce-21');
    expect(topic21?.answer).toContain('Pay Rise');
    expect(topic21?.answer).toContain('3-Hour Minimum');

    const topic22 = careersEmploymentModule.topics.find(t => t.id === 'ce-22');
    expect(topic22?.answer).toContain('Casual Conversion');
    expect(topic22?.answer).toContain('Right to Disconnect');
  });
});

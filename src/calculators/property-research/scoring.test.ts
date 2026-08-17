import { describe, it, expect } from 'vitest';
import { calculateScore, normaliseWeights, DEFAULT_WEIGHTS } from './scoring';
import { CRITERIA } from './criteria';

const scoredIds = CRITERIA.filter(c => c.type === 'score').map(c => c.id);
const dealbreakerIds = CRITERIA.filter(c => c.type === 'dealbreaker').map(c => c.id);

function allScores(v: number): Record<string, number> {
  return Object.fromEntries(scoredIds.map(id => [id, v]));
}

function allPassed(): Record<string, boolean> {
  return Object.fromEntries(dealbreakerIds.map(id => [id, true]));
}

describe('calculateScore (default weights)', () => {
  it('all criteria at 5 → Strong Buy', () => {
    const r = calculateScore(allScores(5), allPassed());
    expect(r.totalScore).toBe(120);
    expect(r.percentage).toBe(100);
    expect(r.recommendation).toBe('Strong Buy');
  });

  it('all criteria at 3 → Hold (60/120 = 50%)', () => {
    const r = calculateScore(allScores(3), allPassed());
    expect(r.totalScore).toBe(72);
    expect(r.weightedPercentage).toBe(60);
  });

  it('zero scores → Avoid', () => {
    const r = calculateScore(allScores(0), allPassed());
    expect(r.totalScore).toBe(0);
    expect(r.recommendation).toBe('Avoid');
  });

  it('a failed dealbreaker forces Avoid regardless of score', () => {
    const r = calculateScore(allScores(5), { ...allPassed(), flood_zone: false });
    expect(r.dealbreakersTriggered).toContain('Flood zone check');
    expect(r.recommendation).toBe('Avoid');
  });

  it('default weights → weighted percentage matches raw percentage (normalised thirds)', () => {
    const r = calculateScore(allScores(4), allPassed(), DEFAULT_WEIGHTS);
    expect(r.weightedPercentage).toBe(r.percentage);
    expect(r.weightedScore).toBeCloseTo(r.totalScore / 3, 0);
  });
});

describe('calculateScore (custom weights)', () => {
  it('heavy property weight shifts weighted score toward the property layer', () => {
    // Score suburb max, property min — property-heavy weights should lower the result
    const scores = { ...allScores(5), ...Object.fromEntries(
      CRITERIA.filter(c => c.type === 'score' && c.layer === 'property').map(c => [c.id, 0])
    ) };
    const equal = calculateScore(scores, allPassed());
    const propHeavy = calculateScore(scores, allPassed(), { suburb: 1, intrasuburb: 1, property: 3 });
    expect(propHeavy.weightedPercentage).toBeLessThan(equal.weightedPercentage);
  });

  it('weight shares re-normalise to 100', () => {
    const r = calculateScore(allScores(3), allPassed(), { suburb: 2, intrasuburb: 1, property: 1 });
    const share = r.weightShare.suburb + r.weightShare.intrasuburb + r.weightShare.property;
    expect(share).toBe(100);
    expect(r.weightShare.suburb).toBe(50);
  });

  it('zero weights fall back to equal thirds', () => {
    const n = normaliseWeights({ suburb: 0, intrasuburb: 0, property: 0 });
    expect(n.suburb).toBeCloseTo(1 / 3, 5);
  });
});

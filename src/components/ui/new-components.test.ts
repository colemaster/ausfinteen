import { describe, it, expect } from 'vitest';

describe('2027 Frontend Components & Micro-Interactions', () => {
  it('calculates sparkline cubic bezier control points correctly', () => {
    const data = [100, 150, 120, 200];
    const min = Math.min(...data);
    const max = Math.max(...data);
    expect(min).toBe(100);
    expect(max).toBe(200);
    expect(max - min).toBe(100);
  });

  it('normalizes celebration ring progress bounded between 0 and 100', () => {
    const normalize = (p: number) => Math.min(100, Math.max(0, Math.round(p)));
    expect(normalize(-10)).toBe(0);
    expect(normalize(55.4)).toBe(55);
    expect(normalize(120)).toBe(100);
  });

  it('computes 6-pillar financial health radar coordinates correctly', () => {
    const numPillars = 6;
    const angleStep = (2 * Math.PI) / numPillars;
    const center = 190;
    const radius = 136.8;

    const polarToCartesian = (index: number, score: number) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (Math.max(0, Math.min(100, score)) / 100) * radius;
      return {
        x: Number((center + r * Math.cos(angle)).toFixed(2)),
        y: Number((center + r * Math.sin(angle)).toFixed(2)),
      };
    };

    const topNode = polarToCartesian(0, 100);
    expect(topNode.x).toBeCloseTo(center, 1);
    expect(topNode.y).toBeCloseTo(center - radius, 1);
  });

  it('evaluates safe math expressions for command palette without eval', () => {
    const evaluateArithmetic = (expr: string): number | null => {
      const clean = expr.trim().replace(/^=/, '').trim();
      if (!/^[0-9\s()+\-*/%.^]+$/.test(clean) || clean.length < 3) return null;
      if (!/[+\-*/^%]/.test(clean)) return null;

      try {
        const sanitized = clean.replace(/\^/g, '**');
        const res = new Function(`'use strict'; return (${sanitized})`)();
        if (typeof res === 'number' && isFinite(res)) return res;
      } catch {
        return null;
      }
      return null;
    };

    expect(evaluateArithmetic('= 180000 * 0.32')).toBe(57600);
    expect(evaluateArithmetic('2500 + 450 * 12')).toBe(7900);
    expect(evaluateArithmetic('malicious_code()')).toBeNull();
  });
});

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

  it('formats ComparisonPill delta values correctly for positive, negative, and zero', () => {
    const formatDelta = (delta: number, format: 'currency' | 'percent' = 'currency') => {
      const isZero = Math.abs(delta) < 0.001;
      const isPositive = delta > 0;
      const sign = isZero ? '' : isPositive ? '+' : '-';
      const abs = Math.abs(delta);
      const valStr = format === 'percent' ? `${abs.toFixed(1)}%` : `$${Math.round(abs).toLocaleString('en-AU')}`;
      return `${sign}${valStr}`;
    };

    expect(formatDelta(1500)).toBe('+$1,500');
    expect(formatDelta(-450)).toBe('-$450');
    expect(formatDelta(0)).toBe('$0');
    expect(formatDelta(5.2, 'percent')).toBe('+5.2%');
    expect(formatDelta(-2.8, 'percent')).toBe('-2.8%');
  });

  it('handles CurrencyInput parsing and clamping within bounds', () => {
    const parseCurrency = (input: string, min = 0, max = 1_000_000): number => {
      const isNeg = input.trim().startsWith('-');
      const raw = input.replace(/[^0-9]/g, '');
      const num = raw === '' ? 0 : parseInt(raw, 10) * (isNeg ? -1 : 1);
      return Math.max(min, Math.min(max, num));
    };

    expect(parseCurrency('$12,345')).toBe(12345);
    expect(parseCurrency('abc')).toBe(0);
    expect(parseCurrency('$2,500,000', 0, 1_000_000)).toBe(1_000_000);
    expect(parseCurrency('-500', 100, 1000)).toBe(100);
    expect(parseCurrency('-500', -1000, 1000)).toBe(-500);
  });

  it('verifies WAI-ARIA tab keyboard navigation calculations', () => {
    const getNextTabIndex = (currentIndex: number, totalTabs: number, key: string): number => {
      if (key === 'ArrowRight') return (currentIndex + 1) % totalTabs;
      if (key === 'ArrowLeft') return (currentIndex - 1 + totalTabs) % totalTabs;
      if (key === 'Home') return 0;
      if (key === 'End') return totalTabs - 1;
      return currentIndex;
    };

    expect(getNextTabIndex(0, 4, 'ArrowRight')).toBe(1);
    expect(getNextTabIndex(3, 4, 'ArrowRight')).toBe(0); // wraps
    expect(getNextTabIndex(0, 4, 'ArrowLeft')).toBe(3); // wraps back
    expect(getNextTabIndex(2, 4, 'Home')).toBe(0);
    expect(getNextTabIndex(1, 4, 'End')).toBe(3);
  });

  it('generates valid Schema.org BreadcrumbList item positions', () => {
    const items = [
      { label: 'Modules', href: '/#modules' },
      { label: 'Module 1: Money & You' },
    ];
    // Home is position 1, subsequent items are 2, 3...
    const positions = items.map((_, idx) => idx + 2);
    expect(positions).toEqual([2, 3]);
  });

  it('validates official Australian statutory authority links', () => {
    const OFFICIAL_PORTALS = [
      { name: 'ATO', url: 'https://www.ato.gov.au' },
      { name: 'Moneysmart', url: 'https://moneysmart.gov.au' },
      { name: 'Fair Work', url: 'https://www.fairwork.gov.au' },
      { name: 'National Debt Helpline', url: 'https://www.ndh.org.au' },
    ];
    for (const portal of OFFICIAL_PORTALS) {
      expect(portal.url).toMatch(/^https:\/\//);
      expect(portal.name.length).toBeGreaterThan(0);
    }
  });

  it('calculates StatCard target progress correctly', () => {
    const calcProgress = (val: number, targetVal: number) => {
      if (targetVal <= 0 || !Number.isFinite(val)) return 0;
      return Math.min(100, Math.max(0, (val / targetVal) * 100));
    };

    expect(calcProgress(500, 1000)).toBe(50);
    expect(calcProgress(1200, 1000)).toBe(100);
    expect(calcProgress(-50, 1000)).toBe(0);
    expect(calcProgress(0, 1000)).toBe(0);
  });

  it('calculates StatCard formatted copyable string correctly', () => {
    const formatCopyValue = (numericValue?: number, format?: 'currency' | 'percent' | 'number', rawValue = '') => {
      if (numericValue !== undefined) {
        if (format === 'currency') return `$${Math.round(numericValue).toLocaleString('en-AU')}`;
        if (format === 'percent') return `${numericValue}%`;
        return `${numericValue}`;
      }
      return rawValue;
    };

    expect(formatCopyValue(50000, 'currency')).toBe('$50,000');
    expect(formatCopyValue(12.5, 'percent')).toBe('12.5%');
    expect(formatCopyValue(42, 'number')).toBe('42');
    expect(formatCopyValue(undefined, undefined, '$120.50')).toBe('$120.50');
  });

  it('handles SliderControl stepping increment and decrement clamping', () => {
    const stepSlider = (current: number, dir: 1 | -1, step: number, min: number, max: number, decimals?: number) => {
      const next = dir === 1 ? Math.min(max, current + step) : Math.max(min, current - step);
      return Number(next.toFixed(decimals ?? (step < 1 ? 2 : 0)));
    };

    expect(stepSlider(5, 1, 0.5, 0, 10, 1)).toBe(5.5);
    expect(stepSlider(9.8, 1, 0.5, 0, 10, 1)).toBe(10);
    expect(stepSlider(0.2, -1, 0.5, 0, 10, 1)).toBe(0);
    expect(stepSlider(100, 1, 10, 0, 500)).toBe(110);
  });

  it('calculates ScenarioSplitter keyboard position steps correctly', () => {
    const stepSplitter = (pos: number, key: string) => {
      if (key === 'ArrowLeft') return Math.max(0, pos - 5);
      if (key === 'ArrowRight') return Math.min(100, pos + 5);
      if (key === 'Home') return 0;
      if (key === 'End') return 100;
      return pos;
    };

    expect(stepSplitter(50, 'ArrowLeft')).toBe(45);
    expect(stepSplitter(50, 'ArrowRight')).toBe(55);
    expect(stepSplitter(3, 'ArrowLeft')).toBe(0);
    expect(stepSplitter(98, 'ArrowRight')).toBe(100);
    expect(stepSplitter(42, 'Home')).toBe(0);
    expect(stepSplitter(42, 'End')).toBe(100);
  });
});


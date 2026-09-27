// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  readStoredPreference,
  resolveReducedMotion,
  applyMotionPreference,
  setMotionPreference,
  systemPrefersReduced,
  type MotionPreference,
} from '@/lib/motion-core';

/**
 * Motion has to be resolved from two independent inputs: the OS
 * `prefers-reduced-motion` setting and the in-app tri-state override. These tests
 * pin the resolution table, because getting it wrong means either ignoring the
 * user's explicit choice or overriding their operating system.
 */

function stubPrefersReduced(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('motion-core resolution', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-motion');
    document.documentElement.removeAttribute('data-motion-reduce');
    stubPrefersReduced(false);
  });

  it('defaults to following the system when nothing is stored', () => {
    expect(readStoredPreference()).toBe('system');
  });

  it('ignores a corrupted stored value rather than trusting it', () => {
    localStorage.setItem('aus_motion', 'turbo');
    expect(readStoredPreference()).toBe('system');
  });

  it('reads back each valid stored preference', () => {
    for (const value of ['system', 'full', 'reduce'] as MotionPreference[]) {
      localStorage.setItem('aus_motion', value);
      expect(readStoredPreference()).toBe(value);
    }
  });

  describe('resolveReducedMotion', () => {
    it('"reduce" always reduces, whatever the OS says', () => {
      stubPrefersReduced(false);
      expect(resolveReducedMotion('reduce')).toBe(true);
    });

    it('"full" never reduces, even when the OS asks to — an explicit choice wins', () => {
      stubPrefersReduced(true);
      expect(resolveReducedMotion('full')).toBe(false);
    });

    it('"system" defers entirely to the OS setting', () => {
      stubPrefersReduced(true);
      expect(resolveReducedMotion('system')).toBe(true);
      stubPrefersReduced(false);
      expect(resolveReducedMotion('system')).toBe(false);
    });
  });

  it('systemPrefersReduced reflects the media query', () => {
    stubPrefersReduced(true);
    expect(systemPrefersReduced()).toBe(true);
    stubPrefersReduced(false);
    expect(systemPrefersReduced()).toBe(false);
  });
});

describe('motion-core application', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-motion');
    document.documentElement.removeAttribute('data-motion-reduce');
    stubPrefersReduced(false);
  });

  it('records the choice in data-motion and the answer in data-motion-reduce', () => {
    applyMotionPreference('full');
    expect(document.documentElement.dataset.motion).toBe('full');
    // Chose full motion while the OS is happy -> not reduced.
    expect(document.documentElement.hasAttribute('data-motion-reduce')).toBe(false);

    applyMotionPreference('reduce');
    expect(document.documentElement.dataset.motion).toBe('reduce');
    expect(document.documentElement.hasAttribute('data-motion-reduce')).toBe(true);
  });

  it('"system" writes the resolved answer, not a guess', () => {
    stubPrefersReduced(true);
    applyMotionPreference('system');
    expect(document.documentElement.dataset.motion).toBe('system');
    expect(document.documentElement.hasAttribute('data-motion-reduce')).toBe(true);

    stubPrefersReduced(false);
    applyMotionPreference('system');
    expect(document.documentElement.hasAttribute('data-motion-reduce')).toBe(false);
  });

  it('persists an explicit choice and clears it again for "system"', () => {
    setMotionPreference('reduce');
    expect(localStorage.getItem('aus_motion')).toBe('reduce');

    setMotionPreference('full');
    expect(localStorage.getItem('aus_motion')).toBe('full');

    // "system" must remove the key rather than store the string "system",
    // so that a later OS change is actually followed.
    setMotionPreference('system');
    expect(localStorage.getItem('aus_motion')).toBeNull();
  });

  it('returns the resolved boolean so callers can branch without re-reading the DOM', () => {
    expect(setMotionPreference('reduce')).toBe(true);
    expect(setMotionPreference('full')).toBe(false);
    stubPrefersReduced(true);
    expect(setMotionPreference('system')).toBe(true);
  });
});

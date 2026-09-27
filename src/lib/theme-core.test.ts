// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInitialAccent,
  getInitialContrast,
  getInitialFontScale,
  getInitialTheme,
  getCurrentTheme,
  setAccent,
  setContrast,
  setFontScale,
  setTheme,
  toggleTheme,
  applyDataAttribute,
  updateUrlParam,
} from '@/lib/theme-core';

/**
 * The appearance logic was previously locked inside React `useState`, which meant the Navbar
 * had to be a React island and React was on every page's critical path. It now lives in
 * `@/lib/theme-core` and is shared by the React hooks and the vanilla Navbar script, so it is
 * the single source of truth for appearance and needs coverage of its own.
 */

/** Force `prefers-color-scheme` so the OS-preference fallback is deterministic. */
function stubPrefersDark(dark: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('dark') ? dark : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('theme-core readers', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.removeAttribute('data-scale');
    document.documentElement.removeAttribute('data-contrast');
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('prefers an explicit ?theme= URL param over localStorage', () => {
    localStorage.setItem('theme', 'light');
    window.history.replaceState(null, '', '/?theme=dark');
    expect(getInitialTheme()).toBe('dark');
  });

  it('falls back to localStorage, then to the system preference', () => {
    localStorage.setItem('theme', 'light');
    expect(getInitialTheme()).toBe('light');

    // With no URL param and nothing stored, the OS preference decides. Stub
    // matchMedia so the assertion does not depend on the test environment's default.
    localStorage.clear();
    stubPrefersDark(false);
    expect(getInitialTheme()).toBe('light');

    stubPrefersDark(true);
    expect(getInitialTheme()).toBe('dark');
  });

  it('reads accent, scale and contrast from the URL, defaulting sensibly', () => {
    expect(getInitialAccent()).toBe('default');
    expect(getInitialFontScale()).toBe('sm');
    expect(getInitialContrast()).toBe('normal');

    window.history.replaceState(null, '', '/?accent=violet&scale=lg&contrast=high');
    expect(getInitialAccent()).toBe('violet');
    expect(getInitialFontScale()).toBe('lg');
    expect(getInitialContrast()).toBe('high');
  });

  it('ignores invalid appearance values rather than trusting the URL', () => {
    window.history.replaceState(null, '', '/?accent=neon&scale=huge&contrast=off');
    expect(getInitialAccent()).toBe('default');
    expect(getInitialFontScale()).toBe('sm');
    expect(getInitialContrast()).toBe('normal');
  });

  it('getCurrentTheme reads the DOM, which is the runtime source of truth', () => {
    document.documentElement.classList.add('dark');
    expect(getCurrentTheme()).toBe('dark');
    document.documentElement.classList.remove('dark');
    expect(getCurrentTheme()).toBe('light');
  });
});

describe('theme-core writers', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.removeAttribute('data-scale');
    document.documentElement.removeAttribute('data-contrast');
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('setTheme toggles the html class and persists the choice', () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggleTheme flips the current theme and returns the new one', () => {
    setTheme('dark');
    expect(toggleTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(toggleTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setAccent writes the data attribute and shareable URL param', () => {
    setAccent('amber');
    expect(document.documentElement.dataset.accent).toBe('amber');
    expect(new URLSearchParams(window.location.search).get('accent')).toBe('amber');
  });

  it('resetting accent to default clears both attribute and URL param', () => {
    setAccent('amber');
    setAccent('default');
    expect(document.documentElement.dataset.accent).toBeUndefined();
    expect(new URLSearchParams(window.location.search).get('accent')).toBeNull();
  });

  it('font scale and contrast follow the same set/clear convention', () => {
    setFontScale('lg');
    expect(document.documentElement.dataset.scale).toBe('lg');
    expect(new URLSearchParams(window.location.search).get('scale')).toBe('lg');

    setFontScale('sm');
    expect(document.documentElement.dataset.scale).toBeUndefined();
    expect(new URLSearchParams(window.location.search).get('scale')).toBeNull();

    setContrast('high');
    expect(document.documentElement.dataset.contrast).toBe('high');
    setContrast('normal');
    expect(document.documentElement.dataset.contrast).toBeUndefined();
  });

  it('updateUrlParam(null) removes the key instead of writing "null"', () => {
    updateUrlParam('scale', 'md');
    expect(new URLSearchParams(window.location.search).get('scale')).toBe('md');
    updateUrlParam('scale', null);
    expect(new URLSearchParams(window.location.search).get('scale')).toBeNull();
  });

  it('applyDataAttribute deletes the attribute when given null', () => {
    applyDataAttribute('accent', 'rose');
    expect(document.documentElement.dataset.accent).toBe('rose');
    applyDataAttribute('accent', null);
    expect(document.documentElement.hasAttribute('data-accent')).toBe(false);
  });
});

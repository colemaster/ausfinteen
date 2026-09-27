/**
 * Framework-free theme / accent / font-scale / contrast logic.
 *
 * This module deliberately has **no React import** so it can be consumed from three
 * places without dragging a framework across the boundary:
 *   - `src/hooks/useTheme.tsx` (React hooks, thin wrappers over these functions)
 *   - `src/components/astro/Navbar.astro` (vanilla island script)
 *   - anything else that only needs to read or mutate the current appearance.
 *
 * Keeping one implementation matters: previously the appearance logic existed only
 * inside React state, which meant the Navbar had to be a React island. Now the Navbar
 * can be static markup and the React runtime can stay off the critical path.
 */

export type Theme = 'dark' | 'light';
export type Accent = 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'default';
export type FontScale = 'sm' | 'md' | 'lg';
export type Contrast = 'normal' | 'high';

export const ACCENT_OPTIONS: { value: Accent; label: string; swatch: string }[] = [
  { value: 'emerald', label: 'Emerald', swatch: '#059669' },
  { value: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { value: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { value: 'rose', label: 'Rose', swatch: '#e11d48' },
  { value: 'cyan', label: 'Cyan', swatch: '#0891b2' },
  { value: 'default', label: 'Default', swatch: 'oklch(0.6 0.1 250)' },
];

export const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg'];

/* ------------------------------------------------------------------ readers */

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

export function getInitialAccent(): Accent {
  if (typeof window === 'undefined') return 'default';
  try {
    const urlAccent = new URLSearchParams(window.location.search).get('accent');
    if (
      urlAccent === 'emerald' ||
      urlAccent === 'violet' ||
      urlAccent === 'amber' ||
      urlAccent === 'rose' ||
      urlAccent === 'cyan' ||
      urlAccent === 'default'
    ) {
      return urlAccent;
    }
  } catch {}
  return 'default';
}

export function getInitialFontScale(): FontScale {
  if (typeof window === 'undefined') return 'sm';
  try {
    const urlScale = new URLSearchParams(window.location.search).get('scale');
    if (urlScale === 'sm' || urlScale === 'md' || urlScale === 'lg') return urlScale;
  } catch {}
  return 'sm';
}

export function getInitialContrast(): Contrast {
  if (typeof window === 'undefined') return 'normal';
  try {
    const urlContrast = new URLSearchParams(window.location.search).get('contrast');
    if (urlContrast === 'normal' || urlContrast === 'high') return urlContrast;
  } catch {}
  return 'normal';
}

/** Current theme as reflected on `<html class>`, which is the source of truth at runtime. */
export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/* ------------------------------------------------------------------ writers */

/**
 * Persist a preference via URL search params only (history.replaceState).
 * Pass null to remove the param (used when a preference is back at its default).
 */
export function updateUrlParam(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    window.history.replaceState(null, '', url);
  } catch {}
}

export function applyDataAttribute(key: 'accent' | 'scale' | 'contrast', value: string | null): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (value === null) {
    delete el.dataset[key];
  } else {
    el.dataset[key] = value;
  }
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Toggle between dark and light, animating via the View Transitions API when the
 * browser supports it and the user has not asked for reduced motion.
 */
export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => applyThemeClass(next);

  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    try {
      if (prefersReducedMotion()) {
        apply();
        return next;
      }
      const transition = (
        document as unknown as { startViewTransition: (fn: () => void) => { finished?: Promise<void> } }
      ).startViewTransition(apply);
      if (transition && transition.finished) {
        transition.finished.catch(() => {});
      }
      return next;
    } catch {
      apply();
      return next;
    }
  }

  apply();
  return next;
}

export function setTheme(theme: Theme): void {
  applyThemeClass(theme);
}

export function setAccent(accent: Accent): void {
  applyDataAttribute('accent', accent === 'default' ? null : accent);
  updateUrlParam('accent', accent === 'default' ? null : accent);
}

export function setFontScale(scale: FontScale): void {
  applyDataAttribute('scale', scale === 'sm' ? null : scale);
  updateUrlParam('scale', scale === 'sm' ? null : scale);
}

export function setContrast(contrast: Contrast): void {
  applyDataAttribute('contrast', contrast === 'normal' ? null : contrast);
  updateUrlParam('contrast', contrast === 'normal' ? null : contrast);
}

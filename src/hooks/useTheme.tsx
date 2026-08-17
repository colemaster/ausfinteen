import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

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

function getInitialTheme(): Theme {
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

function getInitialAccent(): Accent {
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

function getInitialFontScale(): FontScale {
  if (typeof window === 'undefined') return 'sm';
  try {
    const urlScale = new URLSearchParams(window.location.search).get('scale');
    if (urlScale === 'sm' || urlScale === 'md' || urlScale === 'lg') return urlScale;
  } catch {}
  return 'sm';
}

function getInitialContrast(): Contrast {
  if (typeof window === 'undefined') return 'normal';
  try {
    const urlContrast = new URLSearchParams(window.location.search).get('contrast');
    if (urlContrast === 'normal' || urlContrast === 'high') return urlContrast;
  } catch {}
  return 'normal';
}

/**
 * Persist a preference via URL search params only (history.replaceState).
 * Pass null to remove the param (used when a preference is back at its default).
 */
function updateUrlParam(key: string, value: string | null): void {
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

function applyDataAttribute(key: 'accent' | 'scale' | 'contrast', value: string | null): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (value === null) {
    delete el.dataset[key];
  } else {
    el.dataset[key] = value;
  }
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('theme', next);
      } catch {}
      setTheme(next);
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      try {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
          applyTheme();
          return;
        }
        const transition = (document as unknown as { startViewTransition: (fn: () => void) => { finished?: Promise<void> } }).startViewTransition(applyTheme);
        if (transition && transition.finished) {
          transition.finished.catch(() => {});
        }
        return;
      } catch {
        applyTheme();
        return;
      }
    }

    applyTheme();
  }, [theme]);

  return [theme, toggle];
}

export function useAccent(): [Accent, (accent: Accent) => void] {
  const [accent, setAccentState] = useState<Accent>(getInitialAccent);

  useEffect(() => {
    applyDataAttribute('accent', accent === 'default' ? null : accent);
  }, [accent]);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    updateUrlParam('accent', next === 'default' ? null : next);
  }, []);

  return [accent, setAccent];
}

export function useFontScale(): [FontScale, (scale: FontScale) => void] {
  const [scale, setScaleState] = useState<FontScale>(getInitialFontScale);

  useEffect(() => {
    applyDataAttribute('scale', scale === 'sm' ? null : scale);
  }, [scale]);

  const setScale = useCallback((next: FontScale) => {
    setScaleState(next);
    updateUrlParam('scale', next === 'sm' ? null : next);
  }, []);

  return [scale, setScale];
}

export function useContrast(): [Contrast, (contrast: Contrast) => void] {
  const [contrast, setContrastState] = useState<Contrast>(getInitialContrast);

  useEffect(() => {
    applyDataAttribute('contrast', contrast === 'normal' ? null : contrast);
  }, [contrast]);

  const setContrast = useCallback((next: Contrast) => {
    setContrastState(next);
    updateUrlParam('contrast', next === 'normal' ? null : next);
  }, []);

  return [contrast, setContrast];
}

export function AccentSwitcher() {
  const [accent, setAccent] = useAccent();
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Accent colour">
      {ACCENT_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={accent === option.value}
          onClick={() => setAccent(option.value)}
          className={cn(
            'h-5 w-5 shrink-0 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            accent === option.value
              ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background'
              : 'ring-1 ring-inset ring-border/60'
          )}
          style={{ backgroundColor: option.swatch }}
        />
      ))}
    </div>
  );
}

export function FontScaleControl() {
  const [scale, setScale] = useFontScale();
  const sizes: FontScale[] = ['sm', 'md', 'lg'];
  const index = sizes.indexOf(scale);
  const decrease = () => {
    if (index > 0) setScale(sizes[index - 1]);
  };
  const increase = () => {
    if (index < sizes.length - 1) setScale(sizes[index + 1]);
  };
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Font size">
      <button
        type="button"
        onClick={decrease}
        disabled={scale === 'sm'}
        aria-label="Decrease font size"
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        A−
      </button>
      <button
        type="button"
        onClick={increase}
        disabled={scale === 'lg'}
        aria-label="Increase font size"
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        A+
      </button>
    </div>
  );
}
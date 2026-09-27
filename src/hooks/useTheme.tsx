import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  ACCENT_OPTIONS,
  getInitialTheme,
  getInitialAccent,
  getInitialFontScale,
  getInitialContrast,
  toggleTheme as coreToggleTheme,
  setAccent as coreSetAccent,
  setFontScale as coreSetFontScale,
  setContrast as coreSetContrast,
  type Theme,
  type Accent,
  type FontScale,
  type Contrast,
} from '@/lib/theme-core';

export type { Theme, Accent, FontScale, Contrast };
export { ACCENT_OPTIONS };

/**
 * React bindings over the framework-free appearance core in `@/lib/theme-core`.
 *
 * The actual state lives in the DOM (`<html>` class + `data-*` attributes), so this
 * hook is intentionally thin — it just keeps React trees in sync with what the vanilla
 * Navbar island also mutates. Logic lives in the core so the two cannot drift.
 */
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
    setTheme(coreToggleTheme());
  }, []);

  return [theme, toggle];
}

export function useAccent(): [Accent, (accent: Accent) => void] {
  const [accent, setAccentState] = useState<Accent>(getInitialAccent);

  useEffect(() => {
    if (accent !== 'default') {
      document.documentElement.dataset.accent = accent;
    } else {
      delete document.documentElement.dataset.accent;
    }
  }, [accent]);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    coreSetAccent(next);
  }, []);

  return [accent, setAccent];
}

export function useFontScale(): [FontScale, (scale: FontScale) => void] {
  const [scale, setScaleState] = useState<FontScale>(getInitialFontScale);

  useEffect(() => {
    if (scale !== 'sm') {
      document.documentElement.dataset.scale = scale;
    } else {
      delete document.documentElement.dataset.scale;
    }
  }, [scale]);

  const setFontScale = useCallback((next: FontScale) => {
    setScaleState(next);
    coreSetFontScale(next);
  }, []);

  return [scale, setFontScale];
}

export function useContrast(): [Contrast, (contrast: Contrast) => void] {
  const [contrast, setContrastState] = useState<Contrast>(getInitialContrast);

  useEffect(() => {
    if (contrast !== 'normal') {
      document.documentElement.dataset.contrast = contrast;
    } else {
      delete document.documentElement.dataset.contrast;
    }
  }, [contrast]);

  const setContrast = useCallback((next: Contrast) => {
    setContrastState(next);
    coreSetContrast(next);
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
          data-accent-value={option.value}
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

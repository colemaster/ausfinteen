import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Theme = 'dark' | 'light';

/**
 * Theme hook: reads/writes dark|light via URL param `?theme=`.
 * Falls back to system preference. Applies `dark` class to <html>.
 *
 * The toggle is wrapped in a same-document View Transition (falling back to a
 * plain flip when unsupported or under prefers-reduced-motion) so the theme
 * change cross-fades smoothly — a 2030 platform-native technique.
 */
export function useTheme(): [Theme, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTheme = (): Theme => {
    const param = searchParams.get('theme');
    if (param === 'dark' || param === 'light') return param;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    const p = new URLSearchParams(searchParams);
    p.set('theme', theme);
    setSearchParams(p, { replace: true });
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduced) {
      setTheme(next);
      return;
    }
    // Snap the OLD theme to the root for the outgoing frame, then commit.
    document.startViewTransition(() => {
      setTheme(next);
    });
  };

  return [theme, toggle];
}
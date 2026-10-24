import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function resolve(): boolean {
  if (typeof window === 'undefined') return false;
  const root = document.documentElement;
  // The in-app tri-state override wins over the OS setting.
  if (root.dataset.motion === 'reduce') return true;
  if (root.dataset.motion === 'full') return false;
  return typeof window.matchMedia === 'function' ? window.matchMedia(QUERY).matches : false;
}

/**
 * Reduced-motion preference without a component animation runtime.
 *
 * Several UI components only needed a boolean to decide whether to run a
 * canvas/confetti effect. Importing Motion's `useReducedMotion` for that pulled
 * the entire library into the page bundle. This hook subscribes to the OS media
 * query and to the app's `data-motion` attribute instead.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(resolve);

  useEffect(() => {
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null;
    const sync = () => setReduced(resolve());

    media?.addEventListener('change', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion', 'data-motion-reduce'],
    });

    sync();
    return () => {
      media?.removeEventListener('change', sync);
      observer.disconnect();
    };
  }, []);

  return reduced;
}

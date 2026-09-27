import { Suspense, lazy, useSyncExternalStore } from 'react';
import { loadSonner } from '@/lib/toast';

const SonnerToaster = lazy(() => loadSonner().then((m) => ({ default: m.Toaster })));

const subscribeToTheme = (onStoreChange: () => void): (() => void) => {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

const getThemeSnapshot = (): 'dark' | 'light' => {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const getServerSnapshot = (): 'dark' | 'light' => 'dark';

/**
 * Minimal React host for the Sonner toast viewport.
 *
 * Deliberately separate from `OverlayHost`: a toast is triggered by an ordinary interaction
 * (saving a goal, toggling a setting) and should not have to download the command palette,
 * `motion` and the search index to render. This host is mounted the first time `toast(...)` is
 * actually called — see `ensureToastHost` in `src/lib/overlay-loader.ts`.
 */
export function ToastHost() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);
  // Sonner renders into a fixed-position portal, so suspending on null has no
  // layout cost while keeping the toast library out of the critical path.
  return (
    <Suspense fallback={null}>
      <SonnerToaster theme={theme} />
    </Suspense>
  );
}

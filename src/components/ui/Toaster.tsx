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

export function Toaster() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);
  // Sonner renders into a fixed-position portal, so suspending on null has no
  // layout cost while keeping the toast library out of the critical path.
  return (
    <Suspense fallback={null}>
      <SonnerToaster theme={theme} />
    </Suspense>
  );
}

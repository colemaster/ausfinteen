import { useSyncExternalStore } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

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
  return <SonnerToaster theme={theme} />;
}

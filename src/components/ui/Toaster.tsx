import { useSyncExternalStore } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

const subscribeToTheme = (onStoreChange: () => void): (() => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

const getThemeSnapshot = (): 'dark' | 'light' =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export function Toaster() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeSnapshot);
  return <SonnerToaster theme={theme} />;
}

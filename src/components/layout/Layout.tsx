import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation, useNavigationType } from '@/lib/router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const KeyboardShortcutsModal = lazy(() => import('@/components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

export function Layout({ children }: { children?: ReactNode }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigationType = useNavigationType();

  // Scroll progress without React re-renders: write to the DOM node directly.
  // Respects prefers-reduced-motion by leaving the bar at 0-width (hidden).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bar = progressRef.current;
    if (!bar) return;

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      bar.style.width = `${height > 0 ? Math.min(1, scrollTop / height) * 100 : 0}%`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll to top on PUSH/REPLACE navigations so users never land mid-page.
  // POP (browser back/forward) keeps native scroll restoration instead.
  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, navigationType]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Skip link for keyboard + screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:font-bold focus:text-xs"
      >
        Skip to main content
      </a>

      {/* Scroll progress bar — fixed, 3px, gradient; 0-width under reduced motion */}
      <div
        ref={progressRef}
        className="fixed top-0 left-0 z-50 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-warning transition-[width] duration-150 ease-out"
        style={{ width: '0%' }}
        aria-hidden="true"
      />
      {/* The Navbar component handles the .glass-nav internal styling */}
      <Navbar />
      <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Ambient floating aura background orbs (clipped to their own layer so
            page-level dropdowns/overlays are never clipped) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="aura-orb-1" />
          <div className="aura-orb-2" />
        </div>
        <main id="main-content" tabIndex={-1} className="relative z-10 focus:outline-none">
          {children ?? <Outlet />}
        </main>
      </div>
      <Footer />
      <Suspense fallback={null}>
        <CommandPalette />
        <KeyboardShortcutsModal />
      </Suspense>
    </div>
  );
}
import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { TeenProfileProvider } from '@/context/TeenProfileContext';
import { useNavigate } from '@/lib/router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const KeyboardShortcutsModal = lazy(() => import('@/components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
};

export function AppShell({ children }: { children?: ReactNode }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Single global keydown listener: g→h/g→p sequences, ? (shortcuts),
  // / (focus search) and Esc (close everything).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let gPressedAt = 0;
    const G_WINDOW_MS = 1200;

    const onKeyDown = (e: KeyboardEvent) => {
      // Esc always closes everything, even while typing in an input
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-command-palette'));
        document.dispatchEvent(new CustomEvent('close-shortcuts-modal'));
        return;
      }

      // Never hijack keys while the user is typing in a field
      if (isTypingTarget(e.target)) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-shortcuts-modal'));
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('site-search-input');
        if (input instanceof HTMLInputElement) input.focus();
        return;
      }

      const key = e.key.toLowerCase();

      // 'g' then 'h' (home) / 'g' then 'p' (profile)
      if (key === 'g') {
        gPressedAt = Date.now();
        return;
      }
      if (gPressedAt > 0 && Date.now() - gPressedAt <= G_WINDOW_MS) {
        gPressedAt = 0;
        if (key === 'h') navigate('/');
        else if (key === 'p') navigate('/profile');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  // Scroll progress bar directly updated without React re-renders
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  return (
    <TeenProfileProvider>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
          {/* Accessible skip link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:font-bold focus:text-xs"
          >
            Skip to main content
          </a>

          {/* 2030 Top gradient progress indicator */}
          <div
            ref={progressRef}
            className="fixed top-0 left-0 z-50 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-amber-400 transition-[width] duration-150 ease-out"
            style={{ width: '0%' }}
            aria-hidden="true"
          />

          {/* Glassmorphic Navigation Bar */}
          <Navbar />

          {/* Page Content Container with Ambient Chromatic Aura */}
          <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="aura-orb-1" />
              <div className="aura-orb-2" />
            </div>
            <main id="main-content" tabIndex={-1} className="relative z-10 focus:outline-none">
              {children}
            </main>
          </div>

          {/* Footer */}
          <Footer />

          {/* Overlays & Global Toast Notifications */}
          <Suspense fallback={null}>
            <CommandPalette />
            <KeyboardShortcutsModal />
          </Suspense>
          <Toaster />
        </div>
      </ErrorBoundary>
    </TeenProfileProvider>
  );
}

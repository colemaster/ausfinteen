import { lazy, Suspense, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const CommandPalette = lazy(() => import('@/components/ui/CommandPalette').then(m => ({ default: m.CommandPalette })));

export function Layout() {
  const progressRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Scroll progress bar — fixed, 3px, gradient; 0-width under reduced motion */}
      <div
        ref={progressRef}
        className="fixed top-0 left-0 z-50 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-warning transition-[width] duration-150 ease-out"
        style={{ width: '0%' }}
        aria-hidden="true"
      />
      {/* The Navbar component handles the .glass-nav internal styling */}
      <Navbar />
      <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 scroll-fade-in overflow-hidden">
        {/* Ambient floating aura background orbs */}
        <div className="aura-orb-1" aria-hidden="true" />
        <div className="aura-orb-2" aria-hidden="true" />
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
      <Footer />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
    </div>
  );
}

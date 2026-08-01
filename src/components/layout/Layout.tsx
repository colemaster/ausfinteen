import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const CommandPalette = lazy(() => import('@/components/ui/CommandPalette').then(m => ({ default: m.CommandPalette })));

/**
 * Returns scroll progress in [0, 1]. Respects prefers-reduced-motion by
 * staying at 0 (bar renders 0-width and stays hidden).
 */
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      setProgress(height > 0 ? Math.min(1, scrollTop / height) : 0);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
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

  return progress;
}

export function Layout() {
  const progress = useScrollProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Scroll progress bar — fixed, 3px, gradient; 0-width under reduced motion */}
      <div
        className="fixed top-0 left-0 z-50 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-warning transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
      {/* The Navbar component handles the .glass-nav internal styling */}
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 scroll-fade-in overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
    </div>
  );
}

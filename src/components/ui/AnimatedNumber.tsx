import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type AnimatedNumberFormat =
  | 'currency'
  | 'percent'
  | 'number'
  | ((v: number) => string);

export interface AnimatedNumberProps {
  value: number;
  format?: AnimatedNumberFormat;
  duration?: number;
  className?: string;
}

/** Resolve the shared `data-motion` preference without importing a runtime. */
function motionIsReduced(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  if (root.dataset.motion === 'reduce' || root.dataset.motionReduce !== undefined) return true;
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Count-up number animation.
 *
 * Previously built on Motion's `useSpring` + `useTransform`, which dragged the
 * whole animation runtime into every StatCard (and therefore every page) for a
 * single interpolated string. This version is a ~40-line rAF tween that writes
 * directly to one text node, starts only when the number scrolls into view, and
 * degrades to the final value for reduced-motion users.
 */
export function AnimatedNumber({
  value,
  format = 'number',
  duration = 1000,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);
  const current = useRef(0);
  const [display, setDisplay] = useState(0);

  const formatter = useMemo(() => {
    if (typeof format === 'function') return format;
    if (format === 'currency') {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }).format;
    }
    if (format === 'percent') {
      return (v: number) =>
        new Intl.NumberFormat('en-AU', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(v / 100);
    }
    return new Intl.NumberFormat('en-AU').format;
  }, [format]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (motionIsReduced() || duration <= 0) {
      current.current = value;
      setDisplay(value);
      return;
    }

    const run = (from: number) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      const start = performance.now();
      const delta = value - from;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const next = from + delta * easeOutCubic(progress);
        current.current = next;
        setDisplay(next);
        if (progress < 1) {
          frame.current = requestAnimationFrame(tick);
        } else {
          current.current = value;
          setDisplay(value);
          frame.current = null;
        }
      };

      frame.current = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      run(current.current);
      return () => {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
      };
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || started) return;
        started = true;
        observer.disconnect();
        run(current.current);
      },
      { rootMargin: '-10px' },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)} data-numeric="">
      {formatter(display)}
    </span>
  );
}

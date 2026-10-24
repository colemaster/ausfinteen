import { useEffect, useId, useRef } from 'react';

interface InteractiveGridPatternProps {
  glowSize?: number;
  glowColor?: string;
}

/**
 * Ambient grid + cursor-following light beam.
 *
 * The beam position is written straight to CSS variables on the container, so
 * pointer movement never re-renders the SVG or the surrounding tree. The old
 * version called `setState` on every rAF tick.
 */
export function InteractiveGridPattern({
  glowSize = 450,
  glowColor = 'radial-gradient(circle, oklch(0.65 0.15 250 / 0.15) 0%, oklch(0.7 0.15 70 / 0.05) 45%, transparent 70%)',
}: InteractiveGridPatternProps) {
  const patternId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    let frame: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--beam-x', `${lastX - rect.left}px`);
        node.style.setProperty('--beam-y', `${lastY - rect.top}px`);
        node.style.setProperty('--beam-opacity', '1');
      });
    };

    const handleMouseLeave = () => {
      node.style.setProperty('--beam-opacity', '0');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* 2030 OKLCH Ambient Aura Orbs */}
      <div className="aura-orb-1" />
      <div className="aura-orb-2" />

      {/* Cyber Grid SVG */}
      <svg className="absolute inset-0 h-full w-full stroke-foreground/20 opacity-[0.18] dark:opacity-[0.25]">
        <defs>
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="0" r="1.5" className="fill-primary/60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Dynamic Mouse Light Beam Spotlight */}
      <div
        className="grid-beam absolute rounded-full"
        style={{
          width: `${glowSize}px`,
          height: `${glowSize}px`,
          background: glowColor.includes('gradient')
            ? glowColor
            : `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

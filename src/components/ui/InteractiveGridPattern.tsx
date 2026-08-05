import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface InteractiveGridPatternProps {
  glowSize?: number;
  glowColor?: string;
}

export function InteractiveGridPattern({
  glowSize = 450,
  glowColor = 'radial-gradient(circle, oklch(0.65 0.15 250 / 0.15) 0%, oklch(0.7 0.15 70 / 0.05) 45%, transparent 70%)',
}: InteractiveGridPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

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
      <svg className="absolute inset-0 w-full h-full opacity-[0.18] dark:opacity-[0.25] stroke-foreground/20">
        <defs>
          <pattern
            id="cyber-grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="0" r="1.5" className="fill-primary/60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid-pattern)" />
      </svg>

      {/* Dynamic Mouse Light Beam Spotlight */}
      {!reducedMotion && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: `${glowSize}px`,
            height: `${glowSize}px`,
            background: glowColor.includes('gradient') ? glowColor : `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            opacity: mousePos.x >= 0 ? 1 : 0,
            filter: 'blur(30px)',
          }}
        />
      )}
    </div>
  );
}

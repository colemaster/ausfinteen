import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AmbientLiquidityCanvasProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

/**
 * 2027 Ambient Liquidity Field Canvas
 * Renders buttery-smooth, hardware-accelerated ambient glowing particles
 * using TypedArrays for zero-GC memory churn, with automatic pause on scroll or tab hidden.
 */
export function AmbientLiquidityCanvas({
  className,
  particleCount = 24,
  interactive = true,
}: AmbientLiquidityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId: number | null = null;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Fast particle buffer layout: [x, y, vx, vy, radius, phase, baseAlpha]
    const STRIDE = 7;
    const particles = new Float32Array(particleCount * STRIDE);
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Initialize particle positions
      for (let i = 0; i < particleCount; i++) {
        const idx = i * STRIDE;
        particles[idx] = Math.random() * width;
        particles[idx + 1] = Math.random() * height;
        particles[idx + 2] = (Math.random() - 0.5) * 0.35;
        particles[idx + 3] = (Math.random() - 0.5) * 0.35;
        particles[idx + 4] = 40 + Math.random() * 80;
        particles[idx + 5] = Math.random() * Math.PI * 2;
        particles[idx + 6] = 0.04 + Math.random() * 0.08;
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isVisible || document.hidden) {
        rafId = null;
        return;
      }

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth mouse lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x += (-9999 - mouse.x) * 0.08;
        mouse.y += (-9999 - mouse.y) * 0.08;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const idx = i * STRIDE;
        let x = particles[idx];
        let y = particles[idx + 1];
        const vx = particles[idx + 2];
        const vy = particles[idx + 3];
        const radius = particles[idx + 4];
        let phase = particles[idx + 5];
        const baseAlpha = particles[idx + 6];

        // Harmonic floating oscillation
        phase += delta * 0.6;
        particles[idx + 5] = phase;

        x += vx + Math.sin(phase) * 0.2;
        y += vy + Math.cos(phase) * 0.2;

        // Interactive cursor repulsion
        if (mouse.active) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 160;
          if (distSq < maxDist * maxDist && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 25 * delta;
            x += (dx / dist) * force;
            y += (dy / dist) * force;
          }
        }

        // Boundary wrapping
        if (x < -radius) x = width + radius;
        if (x > width + radius) x = -radius;
        if (y < -radius) y = height + radius;
        if (y > height + radius) y = -radius;

        particles[idx] = x;
        particles[idx + 1] = y;

        // Radial gradient particle
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(16, 185, 129, ${baseAlpha.toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(59, 130, 246, ${(baseAlpha * 0.5).toFixed(3)})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    // Pause RAF when not in viewport
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    });
    io.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || !container) return;
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isVisible && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };

    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    rafId = requestAnimationFrame(render);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      io.disconnect();
      if (interactive) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, interactive, reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className={cn(
          'absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--primary),transparent_70%)]',
          className
        )}
      />
    );
  }

  return (
    <div ref={containerRef} className={cn('absolute inset-0 overflow-hidden pointer-events-none -z-10', className)}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

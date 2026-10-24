import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  /** Add specular depth layer (specular edge + inner shadow). */
  depth?: boolean;
}

/**
 * Cursor-tracked spotlight card.
 *
 * Writes the pointer position straight to two CSS custom properties on the
 * element instead of `setState` on every mousemove — the old version re-rendered
 * the whole card subtree ~60 times a second while the pointer moved. The glow is
 * a `::before` layer driven entirely by the compositor.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'oklch(0.65 0.15 250 / 0.16)',
  depth = false,
  ...props
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || frame.current !== null) return;
    const { clientX, clientY } = event;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--glow-x', `${clientX - rect.left}px`);
      node.style.setProperty('--glow-y', `${clientY - rect.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        'cursor-glow card-container group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-(--motion-base) ease-(--ease-out) hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl backdrop-blur-xl',
        depth && 'card-specular soft-inset-shadow',
        className
      )}
      style={{ '--glow-color': spotlightColor } as React.CSSProperties}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

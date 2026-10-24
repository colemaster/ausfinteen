import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { BorderBeam } from './BorderBeam';

interface HolographicTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  showBeam?: boolean;
}

/**
 * 3D pointer-tilt card.
 *
 * The tilt is driven by three CSS custom properties written from a single
 * requestAnimationFrame, so React never re-renders while the pointer moves and
 * the browser can keep the transform on the compositor. Pointer-coarse devices
 * and reduced-motion users get a static card.
 */
export function HolographicTiltCard({
  children,
  className,
  glowColor = 'oklch(0.65 0.15 250)',
  showBeam = true,
  onAnimationStart: _onAnimationStart,
  onDrag: _onDrag,
  onDragStart: _onDragStart,
  onDragEnd: _onDragEnd,
  ...props
}: HolographicTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = cardRef.current;
    if (!node || event.pointerType === 'touch' || frame.current !== null) return;
    const { clientX, clientY } = event;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const rect = node.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      node.style.setProperty('--tilt-x', `${((y - rect.height / 2) / (rect.height / 2)) * -8}deg`);
      node.style.setProperty('--tilt-y', `${((x - rect.width / 2) / (rect.width / 2)) * 8}deg`);
      node.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
      node.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
      node.style.setProperty('--glare-o', '1');
    });
  };

  const handlePointerLeave = () => {
    const node = cardRef.current;
    if (!node) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    node.style.setProperty('--tilt-x', '0deg');
    node.style.setProperty('--tilt-y', '0deg');
    node.style.setProperty('--glare-o', '0');
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ '--glow-color': glowColor } as React.CSSProperties}
      className={cn(
        'tilt-card group relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl transition-[border-color,box-shadow] duration-(--motion-base) ease-(--ease-out) hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/15 focus-within:ring-2 focus-within:ring-primary/20',
        className
      )}
      {...props}
    >
      {/* Specular radial glare — position from CSS vars, opacity handled in CSS. */}
      <div className="tilt-glare pointer-events-none absolute -inset-px z-10" aria-hidden="true" />

      {/* Animated Border Beam */}
      {showBeam && <BorderBeam size={250} duration={12} delay={0} />}

      {/* Card Content with 3D Depth Layer */}
      <div className="tilt-depth relative z-20">{children}</div>
    </div>
  );
}

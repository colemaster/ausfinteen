import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { BorderBeam } from './BorderBeam';

interface HolographicTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  showBeam?: boolean;
}

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
  const reducedMotion = useReducedMotion() ?? false;
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - height / 2) / (height / 2)) * -10;
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 10;
    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;

    setTransform({ rotateX, rotateY, glareX, glareY, opacity: 1 });
  };

  const handlePointerLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={reducedMotion ? {} : { rotateX: transform.rotateX, rotateY: transform.rotateY }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={cn(
        'relative rounded-3xl border border-border bg-card/85 backdrop-blur-xl p-6 shadow-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden group',
        className
      )}
      {...props}
    >
      {/* Specular Radial Glare */}
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            opacity: transform.opacity,
            background: `radial-gradient(600px circle at ${transform.glareX}% ${transform.glareY}%, color-mix(in oklab, ${glowColor} 20%, transparent), transparent 40%)`,
          }}
        />
      )}

      {/* Animated Border Beam */}
      {showBeam && <BorderBeam size={250} duration={12} delay={0} />}

      {/* Card Content with 3D Depth Layer */}
      <div style={{ transform: reducedMotion ? 'none' : 'translateZ(20px)' }} className="relative z-20">
        {children}
      </div>
    </motion.div>
  );
}

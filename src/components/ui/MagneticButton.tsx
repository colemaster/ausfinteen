import { useRef, type ReactNode, type PointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  title?: string;
}

/**
 * 2030 magnetic hover button — element springs toward the cursor within a
 * bounded radius (transform only, GPU-composited). Steps back to centre on
 * pointer leave. Reduced-motion users get a static button.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  type = 'button',
  ariaLabel,
  title,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 18, mass: 0.4 });
  const reducedMotion = useReducedMotion() ?? false;

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={reducedMotion ? undefined : { x: sx, y: sy }}
      className={cn('relative inline-flex items-center justify-center', className)}
    >
      {children}
    </motion.button>
  );
}
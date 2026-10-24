import { useRef, type ReactNode, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
}

/**
 * Magnetic hover button: the element drifts toward the cursor within a bounded
 * radius. Position is written to CSS variables from a single rAF, so the motion
 * stays on the compositor and no React render happens on pointer move.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  type = 'button',
  ariaLabel,
  title,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const frame = useRef<number | null>(null);

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const node = ref.current;
    if (disabled || !node || e.pointerType === 'touch' || frame.current !== null) return;
    const { clientX, clientY } = e;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const rect = node.getBoundingClientRect();
      const relX = clientX - (rect.left + rect.width / 2);
      const relY = clientY - (rect.top + rect.height / 2);
      node.style.setProperty('--mag-x', `${relX * strength}px`);
      node.style.setProperty('--mag-y', `${relY * strength}px`);
    });
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    node.style.setProperty('--mag-x', '0px');
    node.style.setProperty('--mag-y', '0px');
  };

  const handleClick = () => {
    if (disabled) return;
    sound.playClick();
    onClick?.();
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn(
        'magnetic-button relative inline-flex items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-(--motion-fast) ease-(--ease-out) active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
    >
      {children}
    </button>
  );
}

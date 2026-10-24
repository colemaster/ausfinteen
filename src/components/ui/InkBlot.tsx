import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * Organic decorative ink-blot.
 *
 * CSS-drawn amorphous blob that drifts slowly behind copy. Use one per hero
 * section or section heading; more than 2–3 per viewport adds paint cost.
 * Colours derive from the OKLCH accent preset.
 */
export function InkBlot({
  className = '',
  size = 'md',
  color = 'emerald',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'violet' | 'amber' | 'cyan';
}): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        `ink-blot ink-blot-${size} ink-blot-${color}`,
        className
      )}
    />
  );
}

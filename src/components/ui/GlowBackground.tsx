import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ambient mesh-glow background.
 *
 * Renders two compositor-only gradient orbs that drift slowly behind hero
 * copy and section headings. Pointer-events-none so it never intercepts
 * interaction; collapses to static under reduced motion via the global CSS
 * motion layer. Colours are derived from the current OKLCH accent so the
 * background always harmonises with the selected accent preset.
 */
export function GlowBackground({
  className = '',
  count = 2,
}: {
  className?: string;
  count?: 1 | 2 | 3;
}): ReactElement {
  const orbs: ReactElement[] = [];

  if (count >= 1) {
    orbs.push(
      <div
        key="orb-a"
        aria-hidden="true"
        className={cn('mesh-glow-sm top-[-10%] left-[5%] dark:opacity-70', className)}
      />
    );
  }
  if (count >= 2) {
    orbs.push(
      <div
        key="orb-b"
        aria-hidden="true"
        className="mesh-glow-md bottom-[-10%] right-[5%] dark:opacity-60"
      />
    );
  }
  if (count >= 3) {
    orbs.push(
      <div
        key="orb-c"
        aria-hidden="true"
        className="mesh-glow-lg top-[10%] right-[-10%] dark:opacity-50"
      />
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        className
      )}
      aria-hidden="true"
    >
      {orbs}
    </div>
  );
}

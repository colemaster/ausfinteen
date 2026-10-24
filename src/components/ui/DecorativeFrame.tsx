import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * Decorative frame with a rotating gradient border and specular inner edge.
 *
 * Wraps hero art, callout cards or stat widgets. The gradient border is a
 * pure-CSS conic gradient that rotates without touching layout; the specular
 * inner edge gives the content a lit-from-above look.
 */
export function DecorativeFrame({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl card-depth card-specular',
        className
      )}
    >
      <div className="gradient-border-inner p-[1px]">
        <div
          className={cn(
            'relative z-10 rounded-[calc(2rem_-_1px)] bg-card p-6 shadow-xl',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

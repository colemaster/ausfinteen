import React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, string> = {
  primary: 'from-primary to-primary/60',
  success: 'from-success to-success/60',
  warning: 'from-warning to-warning/60',
  danger: 'from-danger to-danger/60',
};

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  showLabel?: boolean;
  /** Gradient accent tone. */
  tone?: Tone;
}

export function Progress({
  value,
  className,
  showLabel = false,
  tone = 'primary',
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/60 ring-1 ring-inset ring-border/40">
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            'relative h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out',
            TONES[tone],
            'after:absolute after:inset-0 after:rounded-full after:bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0))]'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
          {Math.round(clampedValue)}%
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  showLabel?: boolean;
}

export function Progress({ value, className, showLabel = false, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full w-full flex-1 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-in-out"
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {Math.round(clampedValue)}%
        </div>
      )}
    </div>
  );
}

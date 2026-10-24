import React from 'react';
import { ResponsiveContainer, type ResponsiveContainerProps } from './index';
import { cn } from '@/lib/utils';

export interface DeferredChartProps extends Omit<ResponsiveContainerProps, 'children'> {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  chartClassName?: string;
  minHeight?: number | string;
  children: React.ReactNode;
}

/**
 * DeferredChart wrapper with zero-reflow layout stability,
 * accessible titles, and smooth container rendering.
 */
export const DeferredChart = React.forwardRef<HTMLDivElement, DeferredChartProps>(
  function DeferredChart(
    {
      title,
      subtitle,
      badge,
      headerRight,
      className,
      chartClassName,
      height = 280,
      width = '100%',
      minHeight,
      children,
      ...props
    },
    ref
  ) {
    const hasHeader = Boolean(title || subtitle || badge || headerRight);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 backdrop-blur-sm shadow-xs transition-colors',
          className
        )}
      >
        {hasHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border/40 pb-3">
            <div>
              {title && (
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
                  {badge}
                </div>
              )}
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        )}

        <div
          className={cn('w-full relative', chartClassName)}
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          }}
        >
          <ResponsiveContainer width={width} height={height} {...props}>
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

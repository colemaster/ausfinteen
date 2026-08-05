import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';

type StatColor = 'blue' | 'green' | 'red' | 'purple' | 'cyan' | 'amber';
type Trend = 'up' | 'down' | 'flat';

interface StatCardProps {
  label: string;
  value: string; // Deprecated, kept for backward compatibility if needed
  numericValue?: number; // New optional numeric value for animation
  color?: StatColor;
  subtext?: string;
  format?: 'currency' | 'percent' | 'number';
  /** Direction of the trend indicator arrow. */
  trend?: Trend;
  /** Optional percentage delta rendered next to the trend arrow (e.g. 2.5 -> "+2.5%"). */
  delta?: number;
}

const ACCENTS: Record<StatColor, { gradient: string; value: string }> = {
  blue: {
    gradient: 'from-primary/80 via-primary/30 to-transparent',
    value: 'text-primary',
  },
  green: {
    gradient: 'from-success/80 via-success/30 to-transparent',
    value: 'text-success',
  },
  red: {
    gradient: 'from-danger/80 via-danger/30 to-transparent',
    value: 'text-danger',
  },
  purple: {
    gradient: 'from-violet-500/80 via-violet-500/30 to-transparent',
    value: 'text-violet-500',
  },
  cyan: {
    gradient: 'from-cyan-500/80 via-cyan-500/30 to-transparent',
    value: 'text-cyan-500',
  },
  amber: {
    gradient: 'from-amber-500/80 via-amber-500/30 to-transparent',
    value: 'text-amber-500',
  },
};

const TREND_ICON: Record<Trend, typeof ArrowUpRight> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

export const StatCard = React.memo(function StatCard({
  label,
  value,
  numericValue,
  color = 'blue',
  subtext,
  format,
  trend,
  delta,
}: StatCardProps) {
  const accent = ACCENTS[color];
  const TrendIcon = trend ? TREND_ICON[trend] : null;
  const trendClass =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-danger'
        : 'text-muted-foreground';

  return (
    <div className="card-container relative overflow-hidden rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden="true"
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent.gradient)}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {TrendIcon && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
              trendClass
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {delta !== undefined && `${delta > 0 ? '+' : ''}${delta}%`}
          </span>
        )}
      </div>
      <div
        className={cn(
          'mt-1.5 text-2xl @sm:text-3xl font-bold font-mono tabular-nums tracking-tight',
          accent.value
        )}
      >
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} format={format} />
        ) : (
          value
        )}
      </div>
      {subtext && (
        <div className="mt-1.5 text-xs font-medium text-muted-foreground">
          {subtext}
        </div>
      )}
    </div>
  );
});


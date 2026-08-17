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
  /** Secondary line below the value (alias for `subtext`; takes precedence). */
  sub?: string;
  /** Compact padding + smaller value for dense stat grids. */
  dense?: boolean;
  /** Mini progress bar under the value (progress derived from the numeric value). */
  target?: { value: number; label?: string };
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
  sub,
  dense = false,
  target,
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

  const subLine = sub !== undefined ? sub : subtext;

  const targetProgress = (() => {
    if (!target) return undefined;
    const raw =
      numericValue !== undefined
        ? numericValue
        : parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(raw) || target.value <= 0) return 0;
    return Math.min(100, Math.max(0, (raw / target.value) * 100));
  })();

  return (
    <div
      className={cn(
        'card-container relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        dense ? 'px-4 py-3' : 'px-5 py-4'
      )}
    >
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
          'font-bold font-mono tabular-nums tracking-tight',
          dense ? 'mt-1 text-xl' : 'mt-1.5 text-2xl @sm:text-3xl',
          accent.value
        )}
      >
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} format={format} />
        ) : (
          value
        )}
      </div>
      {subLine && (
        <div className="mt-1.5 text-xs font-medium text-muted-foreground">
          {subLine}
        </div>
      )}
      {targetProgress !== undefined && (
        <div className="mt-2.5">
          <div
            role="progressbar"
            aria-valuenow={Math.round(targetProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={target?.label ?? `${label} progress`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60 ring-1 ring-inset ring-border/40"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-[width] duration-500 ease-out"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
          {target?.label && (
            <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-muted-foreground">
              <span>{target.label}</span>
              <span>{Math.round(targetProgress)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
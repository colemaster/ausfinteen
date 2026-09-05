import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';
import { ComparisonPill } from './ComparisonPill';

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
  /** Optional format for delta ('percent' | 'currency' | 'number'). Defaults to 'percent'. */
  deltaFormat?: 'currency' | 'percent' | 'number';
  /** If true, negative delta is marked as good (e.g. expense, tax). */
  deltaInverse?: boolean;
  /** Optional sparkline trend history array (e.g. [100, 120, 150, 140, 190]) */
  sparklineData?: number[];
}

const ACCENTS: Record<StatColor, { gradient: string; value: string; stroke: string }> = {
  blue: {
    gradient: 'from-primary/80 via-primary/30 to-transparent',
    value: 'text-primary',
    stroke: 'var(--primary)',
  },
  green: {
    gradient: 'from-success/80 via-success/30 to-transparent',
    value: 'text-success',
    stroke: '#10b981',
  },
  red: {
    gradient: 'from-danger/80 via-danger/30 to-transparent',
    value: 'text-danger',
    stroke: '#ef4444',
  },
  purple: {
    gradient: 'from-violet-500/80 via-violet-500/30 to-transparent',
    value: 'text-violet-500',
    stroke: '#8b5cf6',
  },
  cyan: {
    gradient: 'from-cyan-500/80 via-cyan-500/30 to-transparent',
    value: 'text-cyan-500',
    stroke: '#06b6d4',
  },
  amber: {
    gradient: 'from-amber-500/80 via-amber-500/30 to-transparent',
    value: 'text-amber-500',
    stroke: '#f59e0b',
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
  deltaFormat,
  deltaInverse,
  sparklineData,
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
        'card-container relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md select-none',
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
        {delta !== undefined ? (
          <ComparisonPill
            delta={delta}
            format={deltaFormat || 'percent'}
            inverse={deltaInverse}
            size="xs"
          />
        ) : TrendIcon ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
              trendClass
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
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

        {/* Optional Micro-Sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="w-20 sm:w-24 shrink-0 pb-1">
            <Sparkline
              data={sparklineData}
              height={26}
              strokeColor={accent.stroke}
              interactive={false}
            />
          </div>
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
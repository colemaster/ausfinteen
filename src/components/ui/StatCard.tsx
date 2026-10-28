import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, Copy, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';
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
  /** Optional badge or chip displayed in the card header */
  badge?: React.ReactNode;
  /** Optional tag label (alias for badge) */
  tag?: string;
  /** If true, renders a subtle click-to-copy button on hover/focus */
  copyable?: boolean;
  /** Accent border position: 'left' (default), 'top', or 'both' */
  accentSide?: 'left' | 'top' | 'both';
  /** Additional custom classes */
  className?: string;
}

const ACCENTS: Record<StatColor, { gradient: string; leftGradient: string; value: string; stroke: string; glow: string; badge: string }> = {
  blue: {
    gradient: 'from-primary/90 via-primary/40 to-transparent',
    leftGradient: 'from-primary via-primary/70 to-primary/20',
    value: 'text-primary',
    stroke: 'var(--primary)',
    glow: 'hover:border-primary/40 hover:shadow-primary/10',
    badge: 'bg-primary/10 text-primary border-primary/25',
  },
  green: {
    gradient: 'from-success/90 via-success/40 to-transparent',
    leftGradient: 'from-success via-success/70 to-success/20',
    value: 'text-success',
    stroke: '#10b981',
    glow: 'hover:border-success/40 hover:shadow-success/10',
    badge: 'bg-success/10 text-success border-success/25',
  },
  red: {
    gradient: 'from-danger/90 via-danger/40 to-transparent',
    leftGradient: 'from-danger via-danger/70 to-danger/20',
    value: 'text-danger',
    stroke: '#ef4444',
    glow: 'hover:border-danger/40 hover:shadow-danger/10',
    badge: 'bg-danger/10 text-danger border-danger/25',
  },
  purple: {
    gradient: 'from-violet-500/90 via-violet-500/40 to-transparent',
    leftGradient: 'from-violet-500 via-violet-500/70 to-violet-500/20',
    value: 'text-violet-500',
    stroke: '#8b5cf6',
    glow: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    badge: 'bg-violet-500/10 text-violet-500 border-violet-500/25',
  },
  cyan: {
    gradient: 'from-cyan-500/90 via-cyan-500/40 to-transparent',
    leftGradient: 'from-cyan-500 via-cyan-500/70 to-cyan-500/20',
    value: 'text-cyan-500',
    stroke: '#06b6d4',
    glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    badge: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/25',
  },
  amber: {
    gradient: 'from-amber-500/90 via-amber-500/40 to-transparent',
    leftGradient: 'from-amber-500 via-amber-500/70 to-amber-500/20',
    value: 'text-amber-500',
    stroke: '#f59e0b',
    glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
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
  badge,
  tag,
  copyable = false,
  accentSide = 'both',
  className,
}: StatCardProps) {
  const [copied, setCopied] = useState(false);
  const accent = ACCENTS[color ?? 'blue'] ?? ACCENTS.blue;
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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    let textToCopy = value;
    if (numericValue !== undefined) {
      if (format === 'currency') {
        textToCopy = `$${Math.round(numericValue).toLocaleString('en-AU')}`;
      } else if (format === 'percent') {
        textToCopy = `${numericValue}%`;
      } else {
        textToCopy = `${numericValue}`;
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      sound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showTopAccent = accentSide === 'top' || accentSide === 'both';
  const showLeftAccent = accentSide === 'left' || accentSide === 'both';

  return (
    <div
      className={cn(
        'card-container group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg select-none',
        accent.glow,
        showLeftAccent ? (dense ? 'pl-5 pr-4 py-3' : 'pl-6 pr-5 py-4') : (dense ? 'px-4 py-3' : 'px-5 py-4'),
        className
      )}
    >
      {/* Top Luminescent Border Gradient */}
      {showTopAccent && (
        <div
          aria-hidden="true"
          className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90', accent.gradient)}
        />
      )}

      {/* Left-Accent Border Gradient */}
      {showLeftAccent && (
        <div
          aria-hidden="true"
          className={cn('absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b rounded-l-2xl', accent.leftGradient)}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </span>
          {(badge || tag) && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0',
                accent.badge
              )}
            >
              {badge ?? tag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
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

          {/* Copyable Value Button */}
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy ${label} value`}
              title={copied ? 'Copied to clipboard!' : `Copy ${label}`}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
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
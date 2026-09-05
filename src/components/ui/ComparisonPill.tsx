import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

export type ComparisonVariant = 'auto' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface ComparisonPillProps {
  delta: number;
  format?: 'currency' | 'percent' | 'number';
  label?: string;
  inverse?: boolean; // If true, negative is good (e.g. debt, tax paid, cost)
  variant?: ComparisonVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ComparisonPill = React.memo(function ComparisonPill({
  delta,
  format = 'currency',
  label,
  inverse = false,
  variant = 'auto',
  size = 'sm',
  className,
}: ComparisonPillProps) {
  const isZero = Math.abs(delta) < 0.001;
  const isPositive = delta > 0;

  // Determine sentiment
  const isGood = inverse ? !isPositive && !isZero : isPositive && !isZero;

  let activeVariant: Exclude<ComparisonVariant, 'auto'> = 'neutral';
  if (variant === 'auto') {
    if (!isZero) {
      activeVariant = isGood ? 'success' : 'danger';
    }
  } else {
    activeVariant = variant;
  }

  const variantStyles: Record<Exclude<ComparisonVariant, 'auto'>, { bg: string; text: string; border: string }> = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
    },
    danger: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
    },
    info: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-500/30',
    },
    neutral: {
      bg: 'bg-muted/50',
      text: 'text-muted-foreground',
      border: 'border-border/60',
    },
  };

  const currentStyle = variantStyles[activeVariant];

  const formattedValue = (() => {
    const abs = Math.abs(delta);
    if (format === 'currency') {
      return formatCurrency(abs);
    }
    if (format === 'percent') {
      return `${abs.toFixed(1)}%`;
    }
    return abs.toLocaleString('en-AU');
  })();

  const sign = isZero ? '' : isPositive ? '+' : '-';

  const sizeClasses: Record<string, { pill: string; text: string; icon: string }> = {
    xs: { pill: 'px-1.5 py-0.5 gap-1', text: 'text-[10px]', icon: 'h-2.5 w-2.5' },
    sm: { pill: 'px-2 py-0.5 gap-1', text: 'text-xs', icon: 'h-3.5 w-3.5' },
    md: { pill: 'px-2.5 py-1 gap-1.5', text: 'text-sm font-semibold', icon: 'h-4 w-4' },
  };

  const currentSize = sizeClasses[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-mono font-medium tabular-nums transition-colors',
        currentStyle.bg,
        currentStyle.text,
        currentStyle.border,
        currentSize.pill,
        className
      )}
      aria-label={`${label ? label + ': ' : ''}${sign}${formattedValue}`}
    >
      {isZero ? (
        <Minus className={currentSize.icon} aria-hidden="true" />
      ) : isPositive ? (
        <ArrowUpRight className={currentSize.icon} aria-hidden="true" />
      ) : (
        <ArrowDownRight className={currentSize.icon} aria-hidden="true" />
      )}
      <span className={currentSize.text}>
        {sign}
        {formattedValue}
      </span>
      {label && <span className="font-sans text-[10px] text-muted-foreground ml-0.5">{label}</span>}
    </span>
  );
});

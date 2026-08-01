import { memo } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

type StatColor = 'blue' | 'green' | 'red' | 'purple' | 'cyan' | 'amber';

interface StatCardProps {
  label: string;
  value: string; // Deprecated, kept for backward compatibility if needed
  numericValue?: number; // New optional numeric value for animation
  color?: StatColor;
  subtext?: string;
  format?: 'currency' | 'percent' | 'number';
}

const BORDER_COLORS: Record<StatColor, string> = {
  blue: 'border-l-blue-500 ',
  green: 'border-l-green-500 ',
  red: 'border-l-red-500 ',
  purple: 'border-l-violet-500 ',
  cyan: 'border-l-cyan-500 ',
  amber: 'border-l-amber-500 ',
};

const VALUE_COLORS: Record<StatColor, string> = {
  blue: 'text-[var(--primary)] ',
  green: 'text-[var(--success)] ',
  red: 'text-[var(--danger)] ',
  purple: 'text-violet-600 ',
  cyan: 'text-cyan-600 ',
  amber: 'text-amber-600 ',
};

export const StatCard = memo(function StatCard({ label, value, numericValue, color = 'blue', subtext, format }: StatCardProps) {
  return (
    <div className={`bg-card border-l-4 ${BORDER_COLORS[color]} rounded-xl px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-y border-r border-border`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${VALUE_COLORS[color]}`}>
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} format={format} />
        ) : (
          value
        )}
      </div>
      {subtext && (
        <div className="text-xs text-muted-foreground mt-1.5 font-medium">{subtext}</div>
      )}
    </div>
  );
});

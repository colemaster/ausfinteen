import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface TickerItem {
  label: string;
  value: string;
}

interface TickerMarqueeProps {
  items: TickerItem[];
  className?: string;
  speed?: string;
}

/**
 * 2030 finance ticker — a CSS-only infinite marquee (compositor-friendly,
 * zero JS) of key money facts. Duplicates content once for a seamless loop,
 * pauses on hover, and respects prefers-reduced-motion via the global kill-switch.
 */
export const TickerMarquee = memo(function TickerMarquee({
  items,
  className,
  speed = '40s',
}: TickerMarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        'relative overflow-hidden whitespace-nowrap select-none',
        'mask-fade-edges',
        className
      )}
      role="marquee"
      aria-label="Live money facts ticker"
    >
      <div className="inline-flex items-center gap-4 pr-4 animate-ticker will-change-transform" style={{ animationDuration: speed }}>
        {doubled.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground"
          >
            <span className="text-muted-foreground/60">{item.label}</span>
            <span className="font-mono text-foreground bg-primary/10 border border-primary/20 rounded-md px-1.5 py-0.5">
              {item.value}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
});
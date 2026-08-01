import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  /** Compact variant for tight layouts. */
  size?: 'sm' | 'md';
  /** Stretch tabs to fill the full container width (mobile-friendly). */
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  fullWidth = false,
}: TabsProps) {
  const pillId = useId();

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/40 p-1',
        fullWidth ? 'w-full' : 'mx-auto w-fit sm:mx-0'
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative whitespace-nowrap rounded-lg font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              fullWidth && 'flex-1',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-pill-${pillId}`}
                className="absolute inset-0 rounded-lg border border-border/60 bg-card shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { useId, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  /** Compact variant for tight layouts. */
  size?: 'sm' | 'md';
  /** Stretch tabs to fill the full container width (mobile-friendly). */
  fullWidth?: boolean;
  'aria-label'?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  fullWidth = false,
  'aria-label': ariaLabel = 'Navigation tabs',
}: TabsProps) {
  const pillId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleSelect(id: string) {
    if (id !== activeTab) {
      onChange(id);
      sound.playClick();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      handleSelect(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/40 p-1',
        fullWidth ? 'w-full' : 'mx-auto w-fit sm:mx-0'
      )}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[idx] = el; }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleSelect(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
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
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

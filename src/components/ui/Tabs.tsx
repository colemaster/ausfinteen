import { useLayoutEffect, useRef } from 'react';
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
  className?: string;
  sticky?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  fullWidth = false,
  'aria-label': ariaLabel = 'Navigation tabs',
  className,
  sticky = false,
}: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  /**
   * Sliding active pill without a layout-animation library.
   *
   * The previous implementation used Motion's `layoutId`, which pulled the
   * entire ~42 KB (gzip) motion runtime onto every calculator page just to move
   * a 2 px-high highlight 40 px to the right. Measuring the active button and
   * writing a transform is a single layout read per change and lets the browser
   * composite the movement on the GPU.
   */
  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeButton = tabRefs.current[activeIndex];

    const sync = () => {
      const button = tabRefs.current[activeIndex];
      if (!button) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.opacity = '1';
      pill.style.width = `${button.offsetWidth}px`;
      pill.style.height = `${button.offsetHeight}px`;
      pill.style.transform = `translate3d(${button.offsetLeft}px, ${button.offsetTop}px, 0)`;
    };

    sync();

    if (!activeButton || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(sync);
    observer.observe(list);
    observer.observe(activeButton);
    return () => observer.disconnect();
  }, [activeTab, tabs, size]);

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
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'relative flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 transition-all',
        sticky && 'sticky top-16 z-20 backdrop-blur-xl bg-background/85 shadow-md',
        fullWidth ? 'w-full' : 'mx-auto w-fit sm:mx-0',
        className
      )}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 rounded-lg border border-border/60 bg-card opacity-0 shadow-sm transition-[transform,width,height,opacity] duration-(--motion-medium) ease-(--ease-out)"
      />
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

import React, { useTransition } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';
import { ACCENT_OPTIONS, type Accent } from '@/hooks/useTheme';

export interface AccentColorPickerProps {
  className?: string;
  showLabel?: boolean;
}

export function AccentColorPicker({ className, showLabel = true }: AccentColorPickerProps) {
  const [currentAccent, setCurrentAccent] = React.useState<Accent>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.dataset.accent as Accent) || 'default';
    }
    return 'default';
  });

  const [, startTransition] = useTransition();

  const handleSelectAccent = (accentValue: Accent) => {
    sound.playClick();

    const applyAccent = () => {
      if (accentValue === 'default') {
        delete document.documentElement.dataset.accent;
      } else {
        document.documentElement.dataset.accent = accentValue;
      }
      setCurrentAccent(accentValue);
      try {
        const url = new URL(window.location.href);
        if (accentValue === 'default') {
          url.searchParams.delete('accent');
        } else {
          url.searchParams.set('accent', accentValue);
        }
        window.history.replaceState(null, '', url);
      } catch {}
    };

    // Modern View Transitions fallback
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        startTransition(() => {
          applyAccent();
        });
      });
    } else {
      startTransition(() => {
        applyAccent();
      });
    }
  };

  return (
    <div className={cn('flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/80 shadow-xs select-none', className)}>
      {showLabel && <span className="text-xs font-semibold text-muted-foreground px-1.5">Theme:</span>}
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Color Accent Picker">
        {ACCENT_OPTIONS.map((option) => {
          const isSelected = currentAccent === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              onClick={() => handleSelectAccent(option.value)}
              className="relative flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              style={{ backgroundColor: option.swatch }}
            >
              {isSelected && (
                <motion.div
                  layoutId="accent-picker-ring"
                  className="absolute -inset-1 rounded-full border-2 border-foreground"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

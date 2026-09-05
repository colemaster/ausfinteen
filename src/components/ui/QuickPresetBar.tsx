import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

export interface ScenarioPreset<T> {
  id: string;
  label: string;
  badge?: string;
  description?: string;
  values: Partial<T>;
}

export interface QuickPresetBarProps<T> {
  presets: ScenarioPreset<T>[];
  activePresetId?: string;
  onSelect: (preset: ScenarioPreset<T>) => void;
  title?: string;
  className?: string;
}

export function QuickPresetBar<T>({
  presets,
  activePresetId,
  onSelect,
  title = 'Quick Personas & Scenarios',
  className,
}: QuickPresetBarProps<T>) {
  function handleSelect(preset: ScenarioPreset<T>) {
    onSelect(preset);
    sound.playClick();
  }

  return (
    <div className={cn('rounded-2xl border border-border/70 bg-card/60 p-3.5 sm:p-4 backdrop-blur-sm', className)}>
      <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>{title}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(preset)}
              className={cn(
                'group relative flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-primary/60 bg-primary/10 shadow-sm'
                  : 'border-border/60 bg-background/80 hover:border-border hover:bg-muted/40 hover:shadow-sm'
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-xs font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  )}
                >
                  {preset.label}
                </span>
                {preset.badge && (
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground">
                    {preset.badge}
                  </span>
                )}
              </div>
              {preset.description && (
                <span className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                  {preset.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

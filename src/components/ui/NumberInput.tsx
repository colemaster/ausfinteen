import { memo } from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export const NumberInput = memo(function NumberInput({
  label, value, onChange, min, max, step = 1, prefix, suffix, placeholder,
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium group-focus-within:text-foreground transition-colors">
        {label}
      </label>
      <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 focus-within:border-primary transition-all duration-200 shadow-sm">
        {prefix && (
          <span className="px-3 py-2 text-sm text-muted-foreground font-medium bg-muted/50 border-r border-input select-none h-full flex items-center">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value === 0 && !placeholder ? '' : value}
          placeholder={placeholder ?? '0'}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-sm font-semibold text-foreground min-w-0 py-2.5",
            prefix ? "pl-3" : "pl-3",
            suffix ? "pr-3" : "pr-3",
            "font-mono"
          )}
        />
        {suffix && (
          <span className="px-3 py-2 text-sm text-muted-foreground font-medium bg-muted/50 border-l border-input select-none h-full flex items-center">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
});

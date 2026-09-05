import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

export interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  subtext?: string;
  quickIncrements?: number[];
  allowReset?: boolean;
  defaultValue?: number;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput = React.memo(function CurrencyInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100_000_000,
  subtext,
  quickIncrements = [1000, 5000, 10000],
  allowReset = true,
  defaultValue,
  disabled = false,
  className,
}: CurrencyInputProps) {
  const [localStr, setLocalStr] = useState(value.toLocaleString('en-AU'));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(value.toLocaleString('en-AU'));
    }
  }, [value, isFocused]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isNeg = e.target.value.trim().startsWith('-');
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10) * (isNeg ? -1 : 1);
    const clamped = Math.max(min, Math.min(max, num));
    setLocalStr(raw === '' ? '' : clamped.toLocaleString('en-AU'));
    onChange(clamped);
  }

  function handleBump(delta: number) {
    const next = Math.max(min, Math.min(max, value + delta));
    onChange(next);
    setLocalStr(next.toLocaleString('en-AU'));
    sound.playClick();
  }

  function handleReset() {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
      setLocalStr(defaultValue.toLocaleString('en-AU'));
      sound.playClick();
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {allowReset && defaultValue !== undefined && value !== defaultValue && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title="Reset to default"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground font-mono font-bold text-sm">
          $
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={localStr}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setLocalStr(value.toLocaleString('en-AU'));
          }}
          onChange={handleInputChange}
          className={cn(
            'w-full rounded-xl border border-border/70 bg-card py-2.5 pl-8 pr-3 font-mono text-sm font-semibold tabular-nums text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label={label}
        />
      </div>

      {subtext && (
        <div className="text-[11px] text-muted-foreground leading-tight">
          {subtext}
        </div>
      )}

      {quickIncrements && quickIncrements.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              type="button"
              disabled={disabled || value + inc > max}
              onClick={() => handleBump(inc)}
              className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="mr-0.5 h-2.5 w-2.5" />
              <span>${(inc >= 1000 ? `${inc / 1000}k` : inc)}</span>
            </button>
          ))}
          {quickIncrements.map((inc) => (
            <button
              key={`neg-${inc}`}
              type="button"
              disabled={disabled || value - inc < min}
              onClick={() => handleBump(-inc)}
              className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="mr-0.5 h-2.5 w-2.5" />
              <span>${(inc >= 1000 ? `${inc / 1000}k` : inc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

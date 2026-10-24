import React, { useId, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  convertPeriod,
  withPeriodSuffix,
  type PaymentPeriod,
} from './PaymentPeriodToggle';
import { sound } from '@/lib/sound-synthesizer';

interface SliderPreset {
  label: string;
  value: number;
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  /**
   * Display period for the value. When set (and different from `basePeriod`),
   * the value pill and min/max labels show the converted values while
   * `value`/`onChange` stay in engine (base) units.
   */
  period?: PaymentPeriod;
  /** When provided together with `period`, renders a compact period picker. */
  onPeriodChange?: (p: PaymentPeriod) => void;
  /** Engine unit the stored `value` is denominated in. Defaults to 'monthly'. */
  basePeriod?: PaymentPeriod;
  /** Quick-set chips under the slider; the active chip is highlighted. */
  presets?: SliderPreset[];
  /** Optional interactive info tooltip rendered next to label. */
  tooltip?: ReactNode;
  /** Show increment/decrement stepper buttons next to display pill. Defaults to true. */
  showSteppers?: boolean;
}

const THUMB_CLASSES =
  '[&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:transition-all';

export const SliderControl = React.memo(function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix = '',
  prefix = '',
  decimals,
  period,
  onPeriodChange,
  basePeriod = 'monthly',
  presets,
  tooltip,
  showSteppers = true,
}: SliderControlProps) {
  const sliderId = useId();
  const convert = (v: number) =>
    period && period !== basePeriod ? convertPeriod(v, period, basePeriod) : v;
  const displayValue = convert(value);

  const display =
    decimals !== undefined
      ? displayValue.toFixed(decimals)
      : step < 1
        ? displayValue.toFixed(1)
        : displayValue.toFixed(0);

  const displaySuffix = withPeriodSuffix(suffix, period);
  const minDisplay = convert(min);
  const maxDisplay = convert(max);

  const pct = max - min === 0 ? 0 : ((value - min) / (max - min)) * 100;

  const handleStep = (direction: -1 | 1) => {
    const next = direction === 1 ? Math.min(max, value + step) : Math.max(min, value - step);
    const rounded = Number(next.toFixed(decimals ?? (step < 1 ? 2 : 0)));
    onChange(rounded);
    sound.playClick();
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={sliderId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
            {label}
          </label>
          {tooltip && <div className="shrink-0">{tooltip}</div>}
          {period && onPeriodChange && (
            <select
              aria-label={`${label} period`}
              value={period}
              onChange={(e) => onPeriodChange(e.target.value as PaymentPeriod)}
              className="cursor-pointer rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showSteppers && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label={`Decrease ${label}`}
                disabled={value <= min}
                onClick={() => handleStep(-1)}
                className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                aria-label={`Increase ${label}`}
                disabled={value >= max}
                onClick={() => handleStep(1)}
                className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
          <div className="inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-gradient-to-b from-primary/15 to-primary/5 px-2.5 py-0.5 text-primary shadow-xs">
            <span className="text-xs font-bold font-mono tabular-nums">
              {prefix}
              {display}
              {displaySuffix}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex h-5 items-center">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${prefix}${display}${displaySuffix}`}
          aria-orientation="horizontal"
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 cursor-pointer appearance-none rounded-full bg-muted/80 outline-none transition-all hover:bg-muted focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-primary/30 hover:[&::-webkit-slider-thumb]:scale-115 active:[&::-webkit-slider-thumb]:scale-95 hover:[&::-moz-range-thumb]:scale-115 active:[&::-moz-range-thumb]:scale-95 ${THUMB_CLASSES}`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
        <span>
          {prefix}
          {minDisplay}
          {displaySuffix}
        </span>
        <span>
          {prefix}
          {maxDisplay}
          {displaySuffix}
        </span>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {presets.map((preset) => {
            const isActive =
              Math.abs(value - preset.value) < (step > 0 ? step / 2 : 0.001);
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  onChange(preset.value);
                  sound.playClick();
                }}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all duration-150 outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'border-primary/50 bg-primary/20 text-primary shadow-xs'
                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
import { cn } from '@/lib/utils';
import {
  convertPeriod,
  withPeriodSuffix,
  type PaymentPeriod,
} from './PaymentPeriodToggle';

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
  /**
   * Display period for the value. When set (and different from `basePeriod`),
   * the input shows the value converted to this period while `value`/`onChange`
   * always stay in engine (base) units.
   */
  period?: PaymentPeriod;
  /** When provided together with `period`, renders a compact period picker. */
  onPeriodChange?: (p: PaymentPeriod) => void;
  /** Engine unit the stored `value` is denominated in. Defaults to 'monthly'. */
  basePeriod?: PaymentPeriod;
  /** Render − / + stepper buttons that clamp to min/max and snap to step. */
  stepButtons?: boolean;
}

function snapToStep(v: number, step: number, min?: number): number {
  const base = min === undefined ? 0 : min;
  return Math.round((v - base) / step) * step + base;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
  period,
  onPeriodChange,
  basePeriod = 'monthly',
  stepButtons = false,
}: NumberInputProps) {
  const displayValue =
    period && period !== basePeriod ? convertPeriod(value, period, basePeriod) : value;
  const displaySuffix = withPeriodSuffix(suffix, period);

  const handleChange = (raw: string) => {
    const parsed = parseFloat(raw) || 0;
    if (period && period !== basePeriod) {
      onChange(convertPeriod(parsed, basePeriod, period));
    } else {
      onChange(parsed);
    }
  };

  const handleStep = (dir: 1 | -1) => {
    const next = snapToStep(value + dir * step, step, min);
    const clamped = Math.min(
      max === undefined ? next : max,
      Math.max(min === undefined ? next : min, next)
    );
    onChange(clamped);
  };

  return (
    <div className="group flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors group-focus-within:text-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-border bg-background shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
        {prefix && (
          <span className="flex h-full shrink-0 select-none items-center self-stretch rounded-l-xl border-r border-border/60 bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
            {prefix}
          </span>
        )}
        {stepButtons && (
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => handleStep(-1)}
            className="flex h-full shrink-0 select-none items-center self-stretch border-r border-border/60 bg-muted/40 px-2.5 text-sm font-bold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            −
          </button>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue === 0 && !placeholder ? '' : displayValue}
          placeholder={placeholder ?? '0'}
          aria-label={label}
          onChange={(e) => handleChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm font-semibold tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {stepButtons && (
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => handleStep(1)}
            className="flex h-full shrink-0 select-none items-center self-stretch border-l border-border/60 bg-muted/40 px-2.5 text-sm font-bold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            +
          </button>
        )}
        {displaySuffix && (
          <span
            className={cn(
              'flex h-full shrink-0 select-none items-center self-stretch border-l border-border/60 bg-muted/40 px-3 text-sm font-medium text-muted-foreground',
              period && onPeriodChange ? '' : 'rounded-r-xl'
            )}
          >
            {displaySuffix}
          </span>
        )}
        {period && onPeriodChange && (
          <select
            aria-label={`${label} period`}
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as PaymentPeriod)}
            className="h-full shrink-0 cursor-pointer self-stretch rounded-r-xl border-l border-border/60 bg-muted/40 px-1.5 text-[11px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        )}
      </div>
    </div>
  );
}
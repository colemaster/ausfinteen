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
}: NumberInputProps) {
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
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value === 0 && !placeholder ? '' : value}
          placeholder={placeholder ?? '0'}
          aria-label={label}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm font-semibold tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="flex h-full shrink-0 select-none items-center self-stretch rounded-r-xl border-l border-border/60 bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

import { memo } from 'react';

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
}

export const SliderControl = memo(function SliderControl({
  label, value, onChange, min, max, step, suffix = '', prefix = '', decimals,
}: SliderControlProps) {
  const display = decimals !== undefined
    ? value.toFixed(decimals)
    : step < 1 ? value.toFixed(1) : value.toFixed(0);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </label>
        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          <span className="text-xs font-bold font-mono">
            {prefix}{display}{suffix}
          </span>
        </div>
      </div>
      <div className="relative flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-1.5 appearance-none bg-secondary rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--primary),0.5)] [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95"
        />
        {/* Fill track logic could be added here if needed, but modern CSS accent or simple background is enough for now */}
        <div 
          className="absolute h-1.5 bg-primary rounded-full pointer-events-none"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
    </div>
  );
});

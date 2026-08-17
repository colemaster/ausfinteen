import { NavLink } from '@/lib/router';
import { memo } from 'react';

/**
 * Read-only display for a field whose value is sourced from the Portfolio view.
 * Replaces NumberInput/SliderControl when portfolio has a non-zero value for the field.
 */
export const PortfolioField = memo(function PortfolioField({ label, value, prefix, suffix, decimals = 0 }: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const formatted = value.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
        {label}
        <NavLink
          to="/portfolio"
          className="text-[9px] font-normal normal-case tracking-normal text-[var(--primary)] hover:text-[var(--primary)]"
        >
          ↗ Portfolio
        </NavLink>
      </label>
      <div className="flex items-center gap-1 bg-[var(--background)] border border-dashed border-[var(--border)] rounded-md px-3 py-2 cursor-not-allowed">
        {prefix && (
          <span className="text-sm text-[var(--muted-foreground)] font-mono select-none">{prefix}</span>
        )}
        <span className="flex-1 text-sm font-semibold font-mono text-[var(--muted-foreground)]">
          {formatted}
        </span>
        {suffix && (
          <span className="text-sm text-[var(--muted-foreground)] font-mono select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
});

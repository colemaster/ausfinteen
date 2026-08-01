import { useState, memo } from 'react';

interface AssumptionsProps {
  items: string[];
  title?: string;
}

export const Assumptions = memo(function Assumptions({ items, title = 'Assumptions & Limitations' }: AssumptionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--background)] hover:bg-[var(--background)] transition-colors text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {title}
        </span>
        <span className="text-[var(--muted-foreground)] text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-[var(--background)]">
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                <span className="text-slate-300 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

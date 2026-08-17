import { useState, memo, useRef, useEffect } from 'react';

interface AssumptionsProps {
  items: string[];
  title?: string;
  /** Grid columns on md+ (2-4) for dense assumption lists. Default: single column. */
  columns?: number;
  /** Show a 'Copy assumptions' button (navigator.clipboard, try/catch guarded). */
  copyable?: boolean;
}

export const Assumptions = memo(function Assumptions({
  items,
  title = 'Assumptions & Limitations',
  columns,
  copyable = true,
}: AssumptionsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(items.map(item => `• ${item}`).join('\n'));
      setCopied(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const gridCols =
    columns !== undefined && columns > 1
      ? columns === 2
        ? 'md:grid-cols-2'
        : columns === 3
          ? 'md:grid-cols-3'
          : 'md:grid-cols-4'
      : '';

  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="flex w-full items-center justify-between gap-2 bg-[var(--background)] pr-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex flex-1 items-center justify-between gap-2 px-4 py-3 text-left transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {title}
          </span>
          <span className="text-[var(--muted-foreground)] text-sm">{open ? '▲' : '▼'}</span>
        </button>
        {copyable && items.length > 0 && (
          <button
            type="button"
            aria-label="Copy assumptions"
            onClick={handleCopy}
            className="shrink-0 rounded-md border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] transition-colors hover:border-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 py-3 bg-[var(--background)]">
          <ul className={gridCols ? `grid grid-cols-1 gap-x-6 gap-y-1.5 ${gridCols}` : 'space-y-1.5'}>
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
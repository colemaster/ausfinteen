import { useState, memo } from 'react';

export interface ConceptDef {
  term: string;
  definition: string;
  link?: string;
  linkLabel?: string;
}

interface AboutCalcProps {
  concepts: ConceptDef[];
  defaultOpen?: boolean;
  title?: string;
}

/**
 * Collapsible info panel shown at the top of each tool.
 * Explains key terms in plain English, each with a link to a reputable free source.
 */
export const AboutCalc = memo(function AboutCalc({ concepts, defaultOpen = false, title = 'About this calculator' }: AboutCalcProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[var(--background)] hover:bg-[var(--background)] transition-colors text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {title}
        </span>
        <span className="text-[var(--muted-foreground)] text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 py-4 bg-[var(--background)] divide-y divide-slate-100 dark:divide-[var(--border)]">
          {concepts.map(c => (
            <div key={c.term} className="py-3 first:pt-0 last:pb-0">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-1">
                {c.term}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-1">
                {c.definition}
              </p>
              {c.link && (
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--primary)] hover:text-[var(--primary)] inline-flex items-center gap-0.5"
              >
                Learn more — {c.linkLabel} ↗
              </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

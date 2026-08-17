import { Link } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface ModulePrevNextProps {
  /** The current module's MANDY_MODULES id (or 'brisbane-qld' for the location module). */
  currentId: string;
  /** Render a Home / Module / Sub-tab breadcrumb trail above the pager. Default true. */
  showBreadcrumbs?: boolean;
  /** Optional third crumb label (e.g. the currently active sub-tab). */
  subTabLabel?: string;
}

/**
 * "Keep learning" pager linking the previous + next module, so the guide
 * flows module 1 → 2 → ... → 11 instead of dead-ending at each page.
 */
export function ModulePrevNext({ currentId, showBreadcrumbs = true, subTabLabel }: ModulePrevNextProps) {
  const idx = MANDY_MODULES.findIndex(m => m.id === currentId);
  if (idx === -1) return null;

  const current = MANDY_MODULES[idx];
  const prev = MANDY_MODULES[idx === 0 ? MANDY_MODULES.length - 1 : idx - 1];
  const next = MANDY_MODULES[idx === MANDY_MODULES.length - 1 ? 0 : idx + 1];

  return (
    <nav aria-label="Continue your money journey" className="calculator-section">
      {showBreadcrumbs && (
        <div aria-label="Breadcrumb" className="mb-3 text-xs">
          <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground/50">/</li>
            <li>
              <Link to={current.route} className="hover:text-foreground transition-colors">
                {current.title}
              </Link>
            </li>
            {subTabLabel && (
              <>
                <li aria-hidden="true" className="text-muted-foreground/50">/</li>
                <li aria-current="page" className="font-bold text-foreground">
                  {subTabLabel}
                </li>
              </>
            )}
          </ol>
        </div>
      )}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <Link
              to={prev.route}
              className="group flex items-center gap-2.5 min-w-0 flex-1 rounded-xl p-2.5 -m-2.5 hover:bg-muted/50 transition-colors"
            >
              <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/15 border border-primary/10 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                {prev.emoji}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ArrowLeft className="w-3 h-3" /> Prev Module
                </span>
                <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}

          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            11-module journey
          </span>

          {next ? (
            <Link
              to={next.route}
              className="group flex items-center gap-2.5 min-w-0 flex-1 justify-end rounded-xl p-2.5 -m-2.5 hover:bg-muted/50 transition-colors"
            >
              <span className="min-w-0 text-right">
                <span className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Next Module <ArrowRight className="w-3 h-3" />
                </span>
                <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {next.title}
                </span>
              </span>
              <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/15 border border-primary/10 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                {next.emoji}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      </div>
    </nav>
  );
}
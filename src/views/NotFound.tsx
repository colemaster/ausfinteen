import { Link } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Compass, Home, Search, Calculator } from 'lucide-react';

export function NotFound() {
  usePageTitle('Page Not Found');

  const openCommandPalette = () => {
    document.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <div className="space-y-8 py-12 max-w-3xl mx-auto text-center">
      <div className="space-y-3">
        <div className="text-5xl font-black bg-gradient-to-r from-primary via-violet-500 to-amber-500 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          That money page doesn't exist 🥴
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          The link may be out of date — but your money journey isn't over. Jump back to a real-world module
          below, or head to the home page.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-xs hover:border-primary/40 transition-all"
          >
            <Search className="w-4 h-4" />
            Open My Profile
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Try one of these
        </span>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:border-primary/40 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-primary" />
            Landing page
          </Link>
          <Link
            to="/calculators"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:border-primary/40 transition-all"
          >
            <Calculator className="w-3.5 h-3.5 text-primary" />
            All Calculators
          </Link>
          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:border-primary/40 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            Search the site
            <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-muted border border-border">Ctrl K</kbd>
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Tip: press{' '}
          <kbd className="font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">Ctrl K</kbd>{' '}
          anywhere to jump straight to a page or calculator.
        </p>
      </div>

      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {MANDY_MODULES.slice(0, 4).map(m => (
          <Link
            key={m.id}
            to={m.route}
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all"
          >
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/15 border border-primary/10 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              {m.emoji}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {m.title}
              </span>
              <span className="block text-[11px] text-muted-foreground truncate">{m.topics.length} Q&A guides</span>
            </span>
            <Compass className="w-4 h-4 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

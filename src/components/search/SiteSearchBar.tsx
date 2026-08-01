import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ExternalLink, ArrowRight, X, Calculator, FileText, LayoutGrid } from 'lucide-react';
import { searchSite, POPULAR_SEARCHES, type SearchHit, type SearchResultType } from '@/lib/site-search';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 120;
const TYPE_ICONS: Record<SearchResultType, typeof FileText> = {
  topic: Sparkles,
  tool: Calculator,
  module: LayoutGrid,
  weblink: FileText,
};

const TYPE_STYLES: Record<SearchResultType, string> = {
  topic: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  tool: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  module: 'bg-primary/10 text-primary',
  weblink: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

function Highlighted({ text, indices }: { text: string; indices?: [number, number][] }) {
  if (!indices || indices.length === 0) return <>{text}</>;
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach(([start, end], i) => {
    const s = Math.max(start, cursor);
    if (s > cursor) parts.push(<span key={`p${i}`}>{text.slice(cursor, s)}</span>);
    if (end >= s) parts.push(<mark key={`m${i}`} className="rounded-[3px] bg-amber-200/70 text-foreground px-0.5 dark:bg-amber-500/30">{text.slice(s, end + 1)}</mark>);
    cursor = Math.max(cursor, end + 1);
  });
  if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

function hitTitleMatch(hit: SearchHit) {
  return hit.matches.find(m => m.field === 'title');
}

function hitSubtitleMatch(hit: SearchHit) {
  return hit.matches.find(m => m.field === 'subtitle');
}

export function SiteSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debounced]);

  // Close on outside click
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const { groups, total } = useMemo(() => searchSite(debounced), [debounced]);
  const flatHits = useMemo(() => groups.flatMap(g => g.hits), [groups]);

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQuery('');
    setDebounced('');
    if (hit.type === 'weblink') {
      window.open(hit.route, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(hit.topicId ? `${hit.route}?topic=${hit.topicId}` : hit.route);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || flatHits.length === 0) {
      if (e.key === 'ArrowDown') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatHits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flatHits[activeIndex];
      if (hit) go(hit);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (debounced.trim().length >= 2 || query.trim().length === 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="site-search-results"
          aria-label="Search all money guides"
          placeholder="Search 160+ money guides — e.g. 'HECS', 'penalty rates', 'first car'…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full h-14 pl-12 pr-11 rounded-2xl bg-card/95 backdrop-blur border border-border text-sm text-foreground placeholder:text-muted-foreground/70 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebounced('');
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!query && (
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md border border-border bg-muted/60 text-[10px] font-bold text-muted-foreground">
            ␣ Enter
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="site-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl z-50 animate-scale-in"
        >
          {/* Idle state: popular searches */}
          {query.trim().length === 0 && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Popular Money Questions
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      setOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-muted/40 text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Or type anything — searches all modules, Q&A guides, calculators and official resources. Typos welcome.
              </p>
            </div>
          )}

          {/* Results state */}
          {query.trim().length >= 2 && groups.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <div className="text-3xl">🤔</div>
              <p className="text-sm font-bold text-foreground">No matches for “{debounced}”</p>
              <p className="text-xs text-muted-foreground">
                Try a shorter word, a different spelling, or one of the popular searches above.
              </p>
            </div>
          )}

          {groups.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {total} result{total === 1 ? '' : 's'} found
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  ↑↓ navigate · Enter open · Esc close
                </span>
              </div>

              {groups.map(group => (
                <div key={group.type} className="py-1">
                  <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {group.label}
                  </div>
                  {group.hits.map(hit => {
                    const idx = flatHits.indexOf(hit);
                    const Icon = TYPE_ICONS[hit.type];
                    const titleMatch = hitTitleMatch(hit);
                    const subMatch = hitSubtitleMatch(hit);
                    return (
                      <button
                        key={hit.id}
                        type="button"
                        role="option"
                        aria-selected={idx === activeIndex}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => go(hit)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors',
                          idx === activeIndex ? 'bg-primary/5' : 'hover:bg-muted/40'
                        )}
                      >
                        <span className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', TYPE_STYLES[hit.type])}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-foreground leading-snug">
                            {hit.emoji ? <span className="mr-1">{hit.emoji}</span> : null}
                            <Highlighted text={hit.title} indices={titleMatch?.indices} />
                          </span>
                          <span className="block text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                            <Highlighted text={hit.subtitle} indices={subMatch?.indices} />
                          </span>
                        </span>
                        {hit.type === 'weblink' ? (
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

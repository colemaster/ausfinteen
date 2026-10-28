import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@/lib/router';
import {
  Search,
  Sparkles,
  ExternalLink,
  ArrowRight,
  X,
  Calculator,
  FileText,
  LayoutGrid,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Percent,
  Coins,
  Compass,
} from 'lucide-react';
import {
  POPULAR_SEARCHES,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
} from '@/lib/search-storage';
import type { SearchHit, SearchResultType } from '@/lib/site-search';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 120;

// Defined at module scope so React Compiler does not bail out on dynamic imports inside components
const loadSiteSearch = () => import('@/lib/site-search');

export type SearchFilterCategory =
  | 'All'
  | 'Calculators'
  | 'Awards & Pay'
  | 'Tax'
  | 'Super'
  | 'Schools & Unis';

const FILTER_CATEGORIES: { id: SearchFilterCategory; label: string; icon: typeof Calculator }[] = [
  { id: 'All', label: 'All', icon: Compass },
  { id: 'Calculators', label: 'Calculators', icon: Calculator },
  { id: 'Awards & Pay', label: 'Awards & Pay', icon: Briefcase },
  { id: 'Tax', label: 'Tax', icon: Percent },
  { id: 'Super', label: 'Super', icon: Coins },
  { id: 'Schools & Unis', label: 'Schools & Unis', icon: GraduationCap },
];

const TYPE_ICONS: Record<SearchResultType, typeof FileText> = {
  topic: Sparkles,
  tool: Calculator,
  module: LayoutGrid,
  weblink: FileText,
};

const TYPE_STYLES: Record<SearchResultType, string> = {
  topic: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
  tool: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  module: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  weblink: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20',
};

const TYPE_BADGE_LABELS: Record<SearchResultType, string> = {
  tool: 'Calculator',
  topic: 'Q&A Guide',
  module: 'Module',
  weblink: 'Official',
};

const KBD_CLASS =
  'inline-flex items-center justify-center min-w-5 px-1.5 h-5 rounded-md border border-border bg-muted/70 font-mono text-[10px] font-bold text-muted-foreground shadow-xs';

function Highlighted({ text, indices }: { text: string; indices?: [number, number][] }) {
  if (!indices || indices.length === 0) return <>{text}</>;
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach(([start, end], i) => {
    const s = Math.max(start, cursor);
    if (s > cursor) parts.push(<span key={`p${i}`}>{text.slice(cursor, s)}</span>);
    if (end >= s) {
      parts.push(
        <mark
          key={`m${i}`}
          className="rounded-[3px] bg-primary/25 dark:bg-primary/30 text-primary-foreground font-semibold px-0.5 ring-1 ring-primary/30"
        >
          {text.slice(s, end + 1)}
        </mark>
      );
    }
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

function matchesCategory(hit: SearchHit, category: SearchFilterCategory): boolean {
  if (category === 'All') return true;
  const content = `${hit.title} ${hit.subtitle} ${hit.route}`.toLowerCase();

  switch (category) {
    case 'Calculators':
      return (
        hit.type === 'tool' ||
        hit.route.includes('/calculators') ||
        /calculator|simulator|engine|optimizer|payoff|drawdown|splitter/i.test(content)
      );
    case 'Awards & Pay':
      return (
        hit.route.includes('/careers-employment') ||
        /award|pay|rate|wage|salary|penalty|payslip|overtime|shift|job|resume|interview/i.test(content)
      );
    case 'Tax':
      return (
        hit.route.includes('/tax-guide') ||
        hit.route.includes('/cgt-engine') ||
        /tax|payg|threshold|return|cgt|capital gains|medicare|deduction|ato/i.test(content)
      );
    case 'Super':
      return (
        hit.route.includes('/super-retirement') ||
        hit.route.includes('/super-drawdown') ||
        /super|retirement|pension|drawdown|sisr|concessional|fund/i.test(content)
      );
    case 'Schools & Unis':
      return (
        hit.route.includes('/hecs-payoff') ||
        /school|uni|university|hecs|student|teen|youth|15yo|fifteen|tafe|apprentice|concession/i.test(
          content
        )
      );
    default:
      return true;
  }
}

export function SiteSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<SearchFilterCategory>('All');
  const [recent, setRecent] = useState<string[]>(() => getRecentSearches());
  const [searchResults, setSearchResults] = useState<{
    groups: { type: SearchResultType; label: string; hits: SearchHit[] }[];
    total: number;
  }>({ groups: [], total: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  // Preload search engine on user intent without inline import in event handlers
  const handlePreload = () => {
    void loadSiteSearch();
  };

  // Refresh session search history whenever dropdown opens
  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debounced, selectedCategory]);

  // Dynamically query Fuse.js engine
  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResults({ groups: [], total: 0 });
      return;
    }
    let cancelled = false;
    loadSiteSearch().then(({ searchSite }) => {
      if (!cancelled) {
        setSearchResults(searchSite(debounced));
      }
    });
    return () => {
      cancelled = true;
    };
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

  // Filter groups and hits by selected category
  const filteredGroups = useMemo(() => {
    if (selectedCategory === 'All') return searchResults.groups;
    return searchResults.groups
      .map(group => ({
        ...group,
        hits: group.hits.filter(h => matchesCategory(h, selectedCategory)),
      }))
      .filter(group => group.hits.length > 0);
  }, [searchResults.groups, selectedCategory]);

  const flatHits = useMemo(() => filteredGroups.flatMap(g => g.hits), [filteredGroups]);
  const filteredTotal = flatHits.length;

  const go = (hit: SearchHit) => {
    if (query.trim()) {
      addRecentSearch(query);
      setRecent(getRecentSearches());
    }
    setOpen(false);
    setQuery('');
    setDebounced('');
    if (hit.type === 'weblink') {
      window.open(hit.route, '_blank', 'noopener,noreferrer');
      return;
    }
    const targetRoute = hit.route.includes('?topic=')
      ? hit.route
      : hit.topicId
        ? `${hit.route}?topic=${hit.topicId}`
        : hit.route;
    navigate(targetRoute);
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
  const activeHit = flatHits[activeIndex];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input — sleek gradient-framed glass shell */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-primary/50 via-violet-500/50 to-amber-500/50 focus-within:from-primary focus-within:via-violet-500 focus-within:to-amber-500 shadow-lg shadow-primary/5 transition-all duration-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id="site-search-input"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="site-search-results"
          aria-activedescendant={open && activeHit ? `site-search-option-${activeHit.id}` : undefined}
          aria-label="Search all money guides"
          placeholder="Search 150+ money guides — e.g. 'HECS', 'penalty rates', 'first car'…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            handlePreload();
          }}
          onMouseEnter={handlePreload}
          onKeyDown={onKeyDown}
          className="w-full h-14 sm:h-16 pl-12 pr-16 rounded-[14px] bg-card/85 backdrop-blur-xl text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebounced('');
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!query && (
          <kbd
            aria-hidden
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-lg border border-border bg-card/80 text-[10px] font-bold text-muted-foreground shadow-xs"
            title={isMac ? 'Press ⌘K to open the command palette' : 'Press Ctrl+K to open the command palette'}
          >
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        )}
      </div>

      {/* Dropdown / Search Modal Menu */}
      {showDropdown && (
        <div
          id="site-search-results"
          role="listbox"
          aria-label="Search results"
          className="animate-slide-down-in absolute top-full left-0 right-0 mt-2 max-h-[72vh] overflow-y-auto rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/50 z-50 divide-y divide-border/40"
        >
          {/* Category Filter Chips Bar */}
          <div className="p-3 bg-muted/30 border-b border-border/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {FILTER_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all duration-200',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/20 ring-1 ring-primary'
                        : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Idle state: recent searches + popular searches */}
          {query.trim().length === 0 && (
            <div className="p-4 space-y-4">
              {recent.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Recent Searches
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-danger hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setQuery(s);
                          setOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-[1.02] transition-all"
                      >
                        <RotateCcw className="w-3 h-3 opacity-70" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
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
                        addRecentSearch(s);
                        setRecent(getRecentSearches());
                        setQuery(s);
                        setOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/80 bg-muted/40 text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:scale-[1.02] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-1">
                Searches 150+ guides, modern award penalty rates, tax brackets, superannuation rules, and official resources. Typos welcome.
              </p>
            </div>
          )}

          {/* No-results state */}
          {query.trim().length >= 2 && filteredTotal === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="text-3xl">🤔</div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  No matches for “{debounced}”
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCategory !== 'All' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="text-primary hover:underline font-semibold"
                    >
                      Clear category filter to search all
                    </button>
                  ) : (
                    'Try a shorter word, a different spelling, or one of these popular searches:'
                  )}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {POPULAR_SEARCHES.slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      addRecentSearch(s);
                      setRecent(getRecentSearches());
                      setQuery(s);
                      setOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-muted/40 text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {filteredGroups.length > 0 && (
            <>
              <div className="sticky top-0 z-10 px-4 py-2 border-b border-border/60 bg-card/95 backdrop-blur-xl flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {filteredTotal} result{filteredTotal === 1 ? '' : 's'} found
                  {selectedCategory !== 'All' && ` (${selectedCategory})`}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {filteredTotal > 6 ? 'Showing top matches' : 'Best matches first'}
                </span>
              </div>

              {filteredGroups.map(group => (
                <div key={group.type} className="py-1">
                  <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    <span className="inline-block w-1.5 h-3 rounded-full bg-gradient-to-b from-primary to-amber-500" />
                    {group.label}
                  </div>
                  {group.hits.map(hit => {
                    const idx = flatHits.indexOf(hit);
                    const Icon = TYPE_ICONS[hit.type];
                    const titleMatch = hitTitleMatch(hit);
                    const subMatch = hitSubtitleMatch(hit);
                    const isSelected = idx === activeIndex;

                    return (
                      <button
                        key={hit.id}
                        id={`site-search-option-${hit.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => go(hit)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors group',
                          isSelected
                            ? 'bg-gradient-to-r from-primary/15 via-primary/5 to-transparent'
                            : 'hover:bg-muted/40'
                        )}
                      >
                        <span className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', TYPE_STYLES[hit.type])}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground leading-snug">
                              {hit.emoji ? (
                                <span className="mr-1" aria-hidden="true">
                                  {hit.emoji}
                                </span>
                              ) : null}
                              <Highlighted text={hit.title} indices={titleMatch?.indices} />
                            </span>
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide',
                                TYPE_STYLES[hit.type]
                              )}
                            >
                              {TYPE_BADGE_LABELS[hit.type]}
                            </span>
                          </span>
                          <span className="block text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                            <Highlighted text={hit.subtitle} indices={subMatch?.indices} />
                          </span>
                        </span>
                        {hit.type === 'weblink' ? (
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5" />
                        ) : (
                          <ArrowRight
                            className={cn(
                              'w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1.5 transition-transform',
                              isSelected ? 'opacity-100 translate-x-0.5 text-primary' : 'opacity-0'
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Footer shortcut hints */}
              <div className="sticky bottom-0 px-4 py-2 border-t border-border/60 bg-card/95 backdrop-blur-xl flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    <kbd className={KBD_CLASS}>↑</kbd>
                    <kbd className={KBD_CLASS}>↓</kbd>
                  </span>
                  to select
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className={KBD_CLASS}>↵</kbd>
                  to open
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className={KBD_CLASS}>esc</kbd>
                  to close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

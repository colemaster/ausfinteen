import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useNavigate } from '@/lib/router';
import {
  Search,
  Calculator,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
  LayoutGrid,
  Home,
  User,
  Keyboard,
  Moon,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Percent,
  Coins,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import {
  searchSite,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  ALL_TOOLS,
  type SearchHit,
  type SearchResultType,
} from '@/lib/site-search';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

export type PaletteCategoryFilter =
  | 'All'
  | 'Calculators'
  | 'Awards & Pay'
  | 'Tax'
  | 'Super'
  | 'Schools & Unis';

const FILTER_CATEGORIES: { id: PaletteCategoryFilter; label: string; icon: LucideIcon }[] = [
  { id: 'All', label: 'All', icon: Compass },
  { id: 'Calculators', label: 'Calculators', icon: Calculator },
  { id: 'Awards & Pay', label: 'Awards & Pay', icon: Briefcase },
  { id: 'Tax', label: 'Tax', icon: Percent },
  { id: 'Super', label: 'Super', icon: Coins },
  { id: 'Schools & Unis', label: 'Schools & Unis', icon: GraduationCap },
];

const TYPE_ICONS: Record<SearchResultType, typeof FileText> = {
  tool: Calculator,
  topic: Sparkles,
  module: LayoutGrid,
  weblink: ExternalLink,
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

type CommandCategory = 'Quick Actions' | 'Go To' | 'Open Calculator';

interface PaletteCommand {
  id: string;
  label: string;
  subtitle: string;
  keywords: string;
  category: CommandCategory;
  icon: LucideIcon;
  run: () => void;
}

/**
 * Safely evaluates basic arithmetic expressions without eval()
 */
function evaluateMathExpression(expr: string): number | null {
  const clean = expr.trim().replace(/^=/, '').trim();
  // Only allow digits, spaces, parentheses, and math operators +, -, *, /, %, ^, .
  if (!/^[0-9\s()+\-*/%.^]+$/.test(clean) || clean.length < 3) return null;
  if (!/[+\-*/^%]/.test(clean)) return null;

  try {
    const sanitized = clean.replace(/\^/g, '**');
    // Function constructor limited strictly to arithmetic
    const result = new Function(`'use strict'; return (${sanitized})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
  } catch {
    // Ignore invalid expression
  }
  return null;
}

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
          className="rounded-[3px] bg-primary/25 dark:bg-primary/30 text-primary-foreground font-semibold px-0.5"
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

function matchesCategory(
  item: { title: string; subtitle: string; route?: string; type?: string; keywords?: string },
  category: PaletteCategoryFilter
): boolean {
  if (category === 'All') return true;
  const content = `${item.title} ${item.subtitle} ${item.route || ''} ${item.keywords || ''}`.toLowerCase();

  switch (category) {
    case 'Calculators':
      return item.type === 'tool' || (item.route?.includes('/calculators') ?? false) || /calculator|simulator|engine|optimizer|payoff|drawdown|splitter/i.test(content);
    case 'Awards & Pay':
      return (item.route?.includes('/careers-employment') ?? false) || /award|pay|rate|wage|salary|penalty|payslip|overtime|shift|job|resume|interview/i.test(content);
    case 'Tax':
      return (item.route?.includes('/tax-guide') ?? false) || (item.route?.includes('/cgt-engine') ?? false) || /tax|payg|threshold|return|cgt|capital gains|medicare|deduction|ato/i.test(content);
    case 'Super':
      return (item.route?.includes('/super-retirement') ?? false) || (item.route?.includes('/super-drawdown') ?? false) || /super|retirement|pension|drawdown|sisr|concessional|fund/i.test(content);
    case 'Schools & Unis':
      return (item.route?.includes('/hecs-payoff') ?? false) || /school|uni|university|hecs|student|teen|youth|15yo|fifteen|tafe|apprentice|concession/i.test(content);
    default:
      return true;
  }
}

type PaletteItem =
  | { kind: 'command'; command: PaletteCommand }
  | { kind: 'hit'; hit: SearchHit; groupType: SearchResultType; groupLabel: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<PaletteCategoryFilter>('All');
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  // Global Keyboard Listener (Cmd+K / Ctrl+K) + open/close custom events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sound.playClick();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => {
      sound.playClick();
      setOpen(true);
    };

    const handleCustomClose = () => {
      setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('open-command-palette', handleCustomOpen);
    document.addEventListener('close-command-palette', handleCustomClose);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('open-command-palette', handleCustomOpen);
      document.removeEventListener('close-command-palette', handleCustomClose);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [open]);

  // Math Evaluation
  const mathResult = useMemo(() => evaluateMathExpression(query), [query]);

  // Commands (categorised; shown when idle or fuzzy-filtered while typing)
  const commands = useMemo<PaletteCommand[]>(() => {
    const quick: PaletteCommand[] = [
      {
        id: 'toggle-theme',
        label: 'Toggle dark / light theme',
        subtitle: 'Switch between light and dark mode',
        keywords: 'dark light theme mode appearance colour color',
        category: 'Quick Actions',
        icon: Moon,
        run: () => document.dispatchEvent(new CustomEvent('toggle-theme-request')),
      },
      {
        id: 'scroll-top',
        label: 'Scroll to top',
        subtitle: 'Jump back to the top of the page',
        keywords: 'scroll top up beginning',
        category: 'Quick Actions',
        icon: ArrowUp,
        run: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
      {
        id: 'scroll-bottom',
        label: 'Scroll to bottom',
        subtitle: 'Jump to the end of the page',
        keywords: 'scroll bottom down end',
        category: 'Quick Actions',
        icon: ArrowDown,
        run: () =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          }),
      },
      {
        id: 'go-home',
        label: 'Go to Landing',
        subtitle: 'Back to the AusFinance Suite home page',
        keywords: 'home landing start index',
        category: 'Go To',
        icon: Home,
        run: () => navigate('/'),
      },
      {
        id: 'go-profile',
        label: 'Go to My Profile',
        subtitle: 'Hourly rate, goals & teen profile settings',
        keywords: 'profile settings teen my profile',
        category: 'Go To',
        icon: User,
        run: () => navigate('/profile'),
      },
      {
        id: 'go-calculators',
        label: 'Go to Calculators Hub',
        subtitle: 'Browse every calculator in one place',
        keywords: 'calculators hub all browse',
        category: 'Go To',
        icon: LayoutGrid,
        run: () => navigate('/calculators'),
      },
      {
        id: 'open-shortcuts',
        label: 'Keyboard shortcuts help',
        subtitle: 'Show the keyboard shortcuts cheat sheet',
        keywords: 'shortcuts keys hotkeys help cheat sheet',
        category: 'Go To',
        icon: Keyboard,
        run: () => document.dispatchEvent(new CustomEvent('toggle-shortcuts-modal')),
      },
    ];

    const calcCommands: PaletteCommand[] = ALL_TOOLS.map(tool => ({
      // Several tools share a route (e.g. the careers-employment page hosts
      // four calculators), so a route-only key left stale duplicate rows in
      // the palette after filtering.
      id: `calc-${tool.name}`,
      label: `Open calculator: ${tool.name}`,
      subtitle: tool.description,
      keywords: `${tool.description} calculator tool`,
      category: 'Open Calculator',
      icon: Calculator,
      run: () => navigate(tool.route),
    }));

    return [...quick, ...calcCommands];
  }, [navigate]);

  // Fuzzy-filter commands against query
  const visibleCommands = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filteredByQuery =
      terms.length === 0
        ? commands
        : commands.filter(c => {
            const hay = `${c.label} ${c.subtitle} ${c.keywords}`.toLowerCase();
            return terms.every(t => hay.includes(t));
          });

    if (selectedCategory === 'All') return filteredByQuery;
    return filteredByQuery.filter(c =>
      matchesCategory(
        { title: c.label, subtitle: c.subtitle, keywords: c.keywords },
        selectedCategory
      )
    );
  }, [commands, query, selectedCategory]);

  // Fuzzy Search
  const { groups } = useMemo(() => searchSite(query), [query]);

  // Flat, category-filtered list
  const items = useMemo<PaletteItem[]>(() => {
    const arr: PaletteItem[] = visibleCommands.map(c => ({ kind: 'command', command: c }));
    for (const group of groups) {
      for (const hit of group.hits) {
        if (
          matchesCategory(
            { title: hit.title, subtitle: hit.subtitle, route: hit.route, type: hit.type },
            selectedCategory
          )
        ) {
          arr.push({ kind: 'hit', hit, groupType: group.type, groupLabel: group.label });
        }
      }
    }
    return arr;
  }, [visibleCommands, groups, selectedCategory]);

  const sectionOf = (item: PaletteItem): string =>
    item.kind === 'command' ? `command:${item.command.category}` : `hit:${item.groupType}`;

  const sectionLabel = (item: PaletteItem): string =>
    item.kind === 'command' ? item.command.category : item.groupLabel;

  const runCommand = (action: () => void) => {
    sound.playClick();
    setOpen(false);
    action();
  };

  const selectHit = (hit: SearchHit) => {
    sound.playClick();
    if (query.trim()) {
      addRecentSearch(query);
      setRecent(getRecentSearches());
    }
    setOpen(false);
    if (hit.type === 'weblink') {
      window.open(hit.route, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(hit.topicId ? `${hit.route}?topic=${hit.topicId}` : hit.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0 && mathResult === null) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sound.playTick();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sound.playTick();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mathResult !== null && items.length === 0) {
        sound.playSuccess();
        void navigator.clipboard.writeText(String(mathResult));
        setOpen(false);
        return;
      }
      const item = items[activeIndex];
      if (!item) return;
      if (item.kind === 'command') {
        runCommand(item.command.run);
      } else {
        selectHit(item.hit);
      }
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-12 bg-black/60 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command Center"
            className="animate-pop-in relative w-full max-w-2xl rounded-3xl bg-card/95 backdrop-blur-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            {/* Top Search Input */}
            <div className="flex items-center px-4 border-b border-border/80 h-16 shrink-0 bg-muted/20">
              <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-label="Search or calculate"
                placeholder="Search calculators, topics, commands, or calculate (e.g. 95000 * 0.12)..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveIndex(0);
                  }}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips Bar */}
            <div className="px-3 py-2 bg-muted/40 border-b border-border/60">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playTick();
                        setSelectedCategory(cat.id);
                        setActiveIndex(0);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all duration-200',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs ring-1 ring-primary'
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

            {/* Results / Commands Body */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Recent Searches (idle state only) */}
              {query.trim().length === 0 && recent.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-danger hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3">
                    {recent.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setQuery(r);
                          setActiveIndex(0);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Math Result Preview */}
              {mathResult !== null && (
                <div className="p-3 mb-2 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-primary tracking-wider block">
                        Inline Math Calculation
                      </span>
                      <span className="font-mono text-lg font-extrabold text-foreground">
                        = {mathResult.toLocaleString('en-AU', { maximumFractionDigits: 4 })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSuccess();
                      void navigator.clipboard.writeText(String(mathResult));
                      setOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                  >
                    Copy Result
                  </button>
                </div>
              )}

              {/* Commands & Search Results */}
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const Icon =
                    item.kind === 'command' ? item.command.icon : TYPE_ICONS[item.hit.type];
                  const label = item.kind === 'command' ? item.command.label : item.hit.title;
                  const subtitle =
                    item.kind === 'command' ? item.command.subtitle : item.hit.subtitle;
                  const isActive = idx === activeIndex;
                  const newSection = idx === 0 || sectionOf(item) !== sectionOf(items[idx - 1]);
                  const key = item.kind === 'command' ? item.command.id : item.hit.id;

                  const titleMatch =
                    item.kind === 'hit' ? item.hit.matches.find(m => m.field === 'title') : undefined;
                  const subMatch =
                    item.kind === 'hit'
                      ? item.hit.matches.find(m => m.field === 'subtitle')
                      : undefined;

                  return (
                    <Fragment key={key}>
                      {newSection && (
                        <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                          {sectionLabel(item)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.kind === 'command') {
                            runCommand(item.command.run);
                          } else {
                            selectHit(item.hit);
                          }
                        }}
                        onMouseEnter={() => {
                          sound.playTick();
                          setActiveIndex(idx);
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2.5 rounded-2xl text-left transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/20'
                            : 'text-foreground hover:bg-muted/60'
                        )}
                      >
                        <span
                          className={cn(
                            'p-1.5 rounded-xl shrink-0 mt-0.5',
                            item.kind === 'hit' ? TYPE_STYLES[item.hit.type] : 'bg-muted text-foreground'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            {item.kind === 'hit' && item.hit.emoji && <span>{item.hit.emoji}</span>}
                            <span>
                              {item.kind === 'hit' ? (
                                <Highlighted text={label} indices={titleMatch?.indices} />
                              ) : (
                                label
                              )}
                            </span>
                            {item.kind === 'hit' && (
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ml-auto shrink-0',
                                  TYPE_STYLES[item.hit.type]
                                )}
                              >
                                {TYPE_BADGE_LABELS[item.hit.type]}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-normal text-muted-foreground truncate mt-0.5">
                            {item.kind === 'hit' ? (
                              <Highlighted text={subtitle} indices={subMatch?.indices} />
                            ) : (
                              subtitle
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          className={cn(
                            'w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 transition-all',
                            isActive ? 'opacity-100 translate-x-0.5 text-primary' : 'opacity-40'
                          )}
                        />
                      </button>
                    </Fragment>
                  );
                })
              ) : query.trim().length > 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-bold text-foreground">No matches found for “{query}”</p>
                  <p className="text-xs text-muted-foreground">
                    Try typing an expression like{' '}
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded-sm">= 95000 * 0.12</code> or clear category filters.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer Keybindings */}
            <div className="px-4 py-2.5 bg-muted/40 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono shadow-xs">
                    ↑↓
                  </kbd>{' '}
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono shadow-xs">
                    ↵
                  </kbd>{' '}
                  to open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono shadow-xs">
                    esc
                  </kbd>{' '}
                  to close
                </span>
              </div>
              <span className="hidden sm:inline font-semibold">
                {isMac ? '⌘K' : 'Ctrl+K'} anywhere to open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

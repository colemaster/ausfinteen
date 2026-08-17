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
import { motion, AnimatePresence } from 'motion/react';

const TYPE_ICONS: Record<SearchResultType, typeof FileText> = {
  tool: Calculator,
  topic: Sparkles,
  module: LayoutGrid,
  weblink: ExternalLink,
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

type PaletteItem =
  | { kind: 'command'; command: PaletteCommand }
  | { kind: 'hit'; hit: SearchHit; groupType: SearchResultType; groupLabel: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
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
        run: () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }),
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
      id: `calc-${tool.route}`,
      label: `Open calculator: ${tool.name}`,
      subtitle: tool.description,
      keywords: `${tool.description} calculator tool`,
      category: 'Open Calculator',
      icon: Calculator,
      run: () => navigate(tool.route),
    }));

    return [...quick, ...calcCommands];
  }, [navigate]);

  // Fuzzy-filter commands against the query (all commands when idle)
  const visibleCommands = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return commands;
    return commands.filter(c => {
      const hay = `${c.label} ${c.subtitle} ${c.keywords}`.toLowerCase();
      return terms.every(t => hay.includes(t));
    });
  }, [commands, query]);

  // Fuzzy Search
  const { groups } = useMemo(() => searchSite(query), [query]);

  // Flat, section-aware list: commands first, then grouped search hits
  const items = useMemo<PaletteItem[]>(() => {
    const arr: PaletteItem[] = visibleCommands.map(c => ({ kind: 'command', command: c }));
    for (const group of groups) {
      for (const hit of group.hits) {
        arr.push({ kind: 'hit', hit, groupType: group.type, groupLabel: group.label });
      }
    }
    return arr;
  }, [visibleCommands, groups]);

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
    addRecentSearch(query);
    setRecent(getRecentSearches());
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
        navigator.clipboard.writeText(String(mathResult));
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/60 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Center"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10"
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
                placeholder="Type a calculator, topic, or math expression (e.g. 150000 * 0.12)..."
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
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results / Commands Body */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Recent Searches (idle state only) */}
              {query.trim().length === 0 && recent.length > 0 && (
                <div className="mb-1">
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
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border bg-muted/40 text-foreground hover:border-primary/50 hover:text-primary transition-all"
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
                    <div className="p-2 rounded-xl bg-primary text-white">
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
                    onClick={() => {
                      sound.playSuccess();
                      navigator.clipboard.writeText(String(mathResult));
                      setOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
                  >
                    Copy Result
                  </button>
                </div>
              )}

              {/* Commands & Search Results (section headers + flat keyboard nav) */}
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const Icon = item.kind === 'command' ? item.command.icon : TYPE_ICONS[item.hit.type];
                  const label = item.kind === 'command' ? item.command.label : item.hit.title;
                  const subtitle = item.kind === 'command' ? item.command.subtitle : item.hit.subtitle;
                  const isActive = idx === activeIndex;
                  const newSection = idx === 0 || sectionOf(item) !== sectionOf(items[idx - 1]);
                  const key = item.kind === 'command' ? item.command.id : item.hit.id;
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
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-muted/60'
                        )}
                      >
                        <span className="p-1.5 rounded-xl bg-muted shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-foreground" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            {item.kind === 'hit' && item.hit.emoji && <span>{item.hit.emoji}</span>}
                            <span>{label}</span>
                          </div>
                          <div className="text-[11px] font-normal text-muted-foreground truncate mt-0.5">
                            {subtitle}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-60" />
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
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded-sm">= 95000 * 0.12</code>
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer Keybindings */}
            <div className="px-4 py-2.5 bg-muted/30 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono">↵</kbd> Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono">Esc</kbd> Dismiss
                </span>
              </div>
              <span className="hidden sm:inline font-semibold">
                {isMac ? '⌘K' : 'Ctrl+K'} anywhere to open
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

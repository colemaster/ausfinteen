import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from '@/lib/router';
import {
  Search,
  Calculator,
  Sparkles,
  ExternalLink,
  ArrowRight,
  X,
  FileText,
  LayoutGrid,
  Zap,
  GraduationCap,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { searchSite, type SearchHit, type SearchResultType } from '@/lib/site-search';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TYPE_ICONS: Record<SearchResultType, typeof FileText> = {
  tool: Calculator,
  topic: Sparkles,
  module: LayoutGrid,
  weblink: ExternalLink,
};

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

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  // Global Keyboard Listener (Cmd+K / Ctrl+K)
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

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Math Evaluation
  const mathResult = useMemo(() => evaluateMathExpression(query), [query]);

  // Fuzzy Search
  const { groups } = useMemo(() => searchSite(query), [query]);
  const flatHits = useMemo(() => groups.flatMap(g => g.hits), [groups]);

  const selectHit = (hit: SearchHit) => {
    sound.playClick();
    setOpen(false);
    if (hit.type === 'weblink') {
      window.open(hit.route, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(hit.topicId ? `${hit.route}?topic=${hit.topicId}` : hit.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatHits.length === 0 && mathResult === null) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sound.playTick();
      setActiveIndex(i => Math.min(i + 1, flatHits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sound.playTick();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mathResult !== null && flatHits.length === 0) {
        sound.playSuccess();
        navigator.clipboard.writeText(String(mathResult));
        setOpen(false);
        return;
      }
      const hit = flatHits[activeIndex];
      if (hit) selectHit(hit);
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
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/40">
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

              {/* Grouped Results */}
              {groups.length > 0 ? (
                groups.map(group => (
                  <div key={group.type} className="py-2">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      {group.label}
                    </div>
                    {group.hits.map(hit => {
                      const idx = flatHits.indexOf(hit);
                      const Icon = TYPE_ICONS[hit.type];
                      return (
                        <button
                          key={hit.id}
                          type="button"
                          onClick={() => selectHit(hit)}
                          onMouseEnter={() => {
                            sound.playTick();
                            setActiveIndex(idx);
                          }}
                          className={cn(
                            'w-full flex items-start gap-3 px-3 py-2.5 rounded-2xl text-left transition-all',
                            idx === activeIndex
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-foreground hover:bg-muted/60'
                          )}
                        >
                          <span className="p-1.5 rounded-xl bg-muted shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-foreground" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              {hit.emoji && <span>{hit.emoji}</span>}
                              <span>{hit.title}</span>
                            </div>
                            <div className="text-[11px] font-normal text-muted-foreground truncate mt-0.5">
                              {hit.subtitle}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : query.trim().length === 0 ? (
                /* Default Quick Links */
                <div className="p-4 space-y-4">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Featured High-Demand Calculators
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { title: 'HECS-HELP Simulator', icon: GraduationCap, route: '/hecs-payoff', desc: '2025-27 marginal system & offset arbitrage' },
                      { title: 'Super Drawdown & Pension', icon: Coins, route: '/super-drawdown', desc: 'Schedule 7 SISR & Age Pension means test' },
                      { title: 'EV Novated Lease vs Loan', icon: Zap, route: '/ev-novated-lease', desc: '100% FBT exemption & GST $6,334 savings' },
                      { title: 'CGT & 6-Year Rule Engine', icon: FileText, route: '/cgt-engine', desc: '50% discount, loss ordering & Div 43 clawback' },
                      { title: 'Emergency Stress Tester', icon: ShieldAlert, route: '/financial-stress-test', desc: 'Runway, APRA +300bps shock & yield arbitrage' },
                    ].map(calc => (
                      <button
                        key={calc.route}
                        onClick={() => {
                          sound.playClick();
                          setOpen(false);
                          navigate(calc.route);
                        }}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-left transition-all group"
                      >
                        <div className="p-2 rounded-xl bg-card border border-border shrink-0 group-hover:scale-105 transition-transform">
                          <calc.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {calc.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {calc.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-bold text-foreground">No matches found for “{query}”</p>
                  <p className="text-xs text-muted-foreground">Try typing an expression like <code className="font-mono bg-muted px-1.5 py-0.5 rounded-sm">= 95000 * 0.12</code></p>
                </div>
              )}
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

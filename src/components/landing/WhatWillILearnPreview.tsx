import { useState, useRef, useEffect } from 'react';
import { Link } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { Sparkles, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

function ModuleSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = MANDY_MODULES.find(m => m.id === value) ?? MANDY_MODULES[1];

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveIdx(Math.max(0, MANDY_MODULES.findIndex(m => m.id === value)));
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, MANDY_MODULES.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const m = MANDY_MODULES[activeIdx];
      if (m) select(m.id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose a module"
        className="flex items-center gap-2 w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border hover:border-primary/40 hover:bg-muted transition-all"
      >
        <span className="text-lg leading-none">{selected.emoji}</span>
        <span className="text-xs font-bold text-foreground truncate max-w-44">{selected.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Modules"
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-80 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/40 z-50 p-1.5"
        >
          {MANDY_MODULES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="option"
              data-idx={i}
              aria-selected={m.id === value}
              onClick={() => select(m.id)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                i === activeIdx ? 'bg-primary/10' : ''
              } ${m.id === value ? 'bg-primary/5' : ''}`}
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 via-purple-500/10 to-amber-500/15 border border-primary/10 flex items-center justify-center text-base shrink-0">
                {m.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-foreground truncate">{m.title}</span>
                <span className="block text-[10px] text-muted-foreground truncate">{m.topics.length} topics</span>
              </span>
              {m.id === value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WhatWillILearnPreview({ compact = false }: { compact?: boolean }) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('careers-employment');
  const selectedModule = MANDY_MODULES.find(m => m.id === selectedModuleId) || MANDY_MODULES[1];

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 calculator-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>What Will I Learn Preview</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Select a module to see exact real-world questions answered inside!
          </p>
        </div>

        <ModuleSelector value={selectedModuleId} onChange={setSelectedModuleId} />
      </div>

      <div className={cn('grid grid-cols-1 gap-3', compact ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {selectedModule.topics.map(t => (
          <div key={t.id} className="p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs space-y-1">
            <span className="font-bold text-foreground block">{t.question}</span>
            <p className="text-muted-foreground line-clamp-2">{t.answer}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <Link
          to={selectedModule.route}
          onClick={() => sound.playClick()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
        >
          <span>Open Full {selectedModule.title} Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

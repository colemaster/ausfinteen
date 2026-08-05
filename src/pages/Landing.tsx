import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { Badge } from '@/components/ui/Badge';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { InteractiveGridPattern } from '@/components/ui/InteractiveGridPattern';
import { HolographicTiltCard } from '@/components/ui/HolographicTiltCard';
import { ScenarioSplitterWidget } from '@/components/ui/ScenarioSplitterWidget';
import { Sparkles, ArrowRight, Zap, ChevronDown, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { SiteSearchBar } from '@/components/search/SiteSearchBar';

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

export function Landing() {
  const { applyAgePreset, profile } = useTeenProfile();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('careers-employment');
  const selectedModule = MANDY_MODULES.find(m => m.id === selectedModuleId) || MANDY_MODULES[1];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/25 via-purple-500/15 to-amber-500/25 p-8 sm:p-14 text-center sm:text-left shadow-2xl">
        <InteractiveGridPattern glowSize={500} glowColor="oklch(0.65 0.18 250 / 0.25)" />
        <BorderBeam size={280} duration={14} colorFrom="#3b82f6" colorTo="#a855f7" />

        {/* Radial glows + sheen */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-amber-500/25 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-64 rounded-full bg-purple-500/20 blur-[110px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Real-World Money Guide for Young Aussies 🤠</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-none">
              In the know about your <span className="text-primary bg-gradient-to-r from-primary via-violet-500 to-amber-500 bg-clip-text text-transparent">dough</span>.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Everything you need to know about your money before you tackle the real world—from your first job payslip, $18,200 tax-free threshold, 12.5% super guarantee, and car costs to budgeting your first paycheck and living in Brisbane.
            </p>

            {/* Site-wide search */}
            <div className="pt-3 flex flex-col items-center sm:items-start gap-2">
              <SiteSearchBar />
              <span className="text-[11px] text-muted-foreground/80">
                🔍 Search every module, Q&A guide, calculator and official resource — fuzzy & typo-tolerant.
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Link
                to="/careers-employment"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-violet-500 to-purple-500 text-primary-foreground font-bold text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore First Job Pay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/profile"
                className="px-6 py-3.5 rounded-2xl bg-card/80 border border-border text-foreground font-bold text-sm hover:bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all backdrop-blur"
              >
                Set Up My Profile ({profile.age}yo)
              </Link>
            </div>

            {/* Quick Age Toggle Pills in Hero */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Instant Persona Presets:
              </span>
              {[15, 16, 17, 18].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => applyAgePreset(a)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    profile.age === a
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card/80 hover:bg-card hover:border-primary/40 border-border text-foreground'
                  }`}
                >
                  {a}yo Preset
                </button>
              ))}
            </div>
          </div>

          {/* Hero 3D Graphic Asset Card */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <HolographicTiltCard showBeam={false} className="border-primary/30">
              <img
                src="/assets/aus_teen_hero.jpg"
                alt="AusTeen Money 2030 Graphic Illustration"
                className="w-full h-auto object-cover rounded-2xl"
                loading="eager"
              />
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  2030 Interactive Edition
                </span>
                <span className="text-primary">Australia-First 🇦🇺</span>
              </div>
            </HolographicTiltCard>
          </div>
        </div>
      </section>

      {/* 2030 Interactive Scenario Splitter Widget */}
      <section className="calculator-section">
        <ScenarioSplitterWidget />
      </section>

      {/* 11 Mandy Money Modules Grid */}
      <section className="space-y-6 calculator-section">
        <div className="text-center sm:text-left space-y-1">
          <Badge variant="warning">
            11 Real-World Modules
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            160+ Money Questions Answered
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click any module to dive into interactive calculators, step-by-step guides, and official Australian web resources.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MANDY_MODULES.map(module => (
            <motion.div key={module.id} variants={fadeInUp}>
              <Link
                to={module.route}
                className="block group rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
              >
                <HolographicTiltCard showBeam={false} className="h-full space-y-3 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {module.graphicUrl ? (
                        <img
                          src={module.graphicUrl}
                          alt={module.title}
                          className="w-12 h-12 rounded-2xl object-cover border border-primary/20 shadow-md group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 via-purple-500/10 to-amber-500/20 border border-primary/10 flex items-center justify-center text-2xl group-hover:scale-105 group-hover:border-primary/30 transition-all shadow-inner">
                          {module.emoji}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {module.topics.length} topics
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Explore Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </HolographicTiltCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* "What Will I Learn?" Topic Selector */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            <span>Open Full {selectedModule.title} Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

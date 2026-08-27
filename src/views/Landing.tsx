import { useEffect, useRef, useState } from 'react';
import { Link } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { Badge } from '@/components/ui/Badge';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { InteractiveGridPattern } from '@/components/ui/InteractiveGridPattern';
import { HolographicTiltCard } from '@/components/ui/HolographicTiltCard';
import { ScenarioSplitterWidget } from '@/components/ui/ScenarioSplitterWidget';
import {
  Sparkles,
  ArrowRight,
  Zap,
  ChevronDown,
  Check,
  GraduationCap,
  Coins,
  FileText,
  ShieldAlert,
  Calculator,
  LayoutGrid,
  Filter,
} from 'lucide-react';
import { motion, useReducedMotion, LayoutGroup } from 'motion/react';
import { fadeInUp, staggerContainer, fastStagger } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useUrlParams } from '@/hooks/useUrlParams';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatCurrency } from '@/utils/formatters';
import { TAX_BRACKETS_2026_27, getCombinedMarginalRate } from '@/data/tax-brackets';
import { SUPER_RULES } from '@/data/super-rules';
import { QLD_STAMP_DUTY } from '@/data/stamp-duty-tables';
import { HELP_REPAYMENT_THRESHOLDS_2026_27 } from '@/data/constants';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { SiteSearchBar } from '@/components/search/SiteSearchBar';
import { SmartImage } from '@/components/ui/SmartImage';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TickerMarquee, type TickerItem } from '@/components/ui/TickerMarquee';
import { usePageTitle } from '@/hooks/usePageTitle';
import { sound } from '@/lib/sound-synthesizer';

// ─── Landing enhancements: module categories, fast paths, featured calculators ───

type ModuleCategory = 'money-basics' | 'jobs-tax' | 'cars' | 'investing' | 'super' | 'calculators';

const MODULE_CATEGORIES: Record<string, ModuleCategory[]> = {
  'money-and-you': ['money-basics'],
  'careers-employment': ['jobs-tax', 'calculators'],
  'super-retirement': ['super', 'calculators'],
  'tax-guide': ['jobs-tax', 'calculators'],
  'teen-budgeting': ['money-basics', 'calculators'],
  'spending-saving': ['money-basics'],
  'investing-shares': ['investing', 'calculators'],
  'interest-products': ['money-basics', 'calculators'],
  'dealing-with-debt': ['money-basics', 'calculators'],
  'car-driving': ['cars', 'calculators'],
  'brisbane-qld': ['money-basics', 'calculators'],
};

const CATEGORY_FILTERS: ReadonlyArray<{ id: ModuleCategory | 'all'; label: string }> = [
  { id: 'all', label: '✨ All' },
  { id: 'money-basics', label: '💰 Money Basics' },
  { id: 'jobs-tax', label: '🧾 Jobs & Tax' },
  { id: 'cars', label: '🚗 Cars' },
  { id: 'investing', label: '📈 Investing' },
  { id: 'super', label: '⭐️ Super' },
  { id: 'calculators', label: '🧮 Calculators' },
];

const FAST_PATHS: ReadonlyArray<{
  id: string;
  emoji: string;
  title: string;
  desc: string;
  route: string;
  tag: string;
}> = [
  {
    id: '15yo-roadmap',
    emoji: '🧭',
    title: '15yo Roadmap',
    desc: 'Free TFN via AusPost, 5.0%+ HISA, Medicare at 15, and L-plate prep.',
    route: '/careers-employment?tab=roadmap',
    tag: '15yo Milestone',
  },
  {
    id: 'first-job',
    emoji: '🎓',
    title: 'First Job & Resume',
    desc: '1-page teen resume builder, Junior Award rates, and 3-hour minimum shifts.',
    route: '/careers-employment?tab=resume',
    tag: 'First Job',
  },
  {
    id: 'first-paycheck',
    emoji: '💵',
    title: 'First Paycheck',
    desc: 'Split your first pay with the 50/30/20 rule and Barefoot\'s 3 buckets.',
    route: '/teen-budgeting?topic=tb-4',
    tag: 'Budgeting',
  },
  {
    id: 'buying-car',
    emoji: '🚗',
    title: 'L-Plates & Driving',
    desc: 'PrepL practice, 100 logbook hours strategy, and first car true costs.',
    route: '/car-driving?tab=licence',
    tag: 'Driving',
  },
  {
    id: 'youth-hisa',
    emoji: '🧬',
    title: '5.0%+ Youth HISA',
    desc: 'Compare top fee-free youth savings accounts & APRA $250k protection.',
    route: '/interest-products?topic=ip-1',
    tag: 'High Interest',
  },
  {
    id: 'student-perks',
    emoji: '🌎',
    title: 'Student Discounts',
    desc: '50c public transport fares, Apple Education, and UNiDAYS discounts.',
    route: '/spending-saving?topic=ss-8',
    tag: 'Concessions',
  },
];

const FEATURED_CALCULATORS: ReadonlyArray<{
  id: string;
  emoji: string;
  title: string;
  route: string;
  statValue: number;
  statFormat: 'currency' | 'percent' | 'number';
  statLabel: string;
  subtext: string;
}> = [
  {
    id: 'tax-savings',
    emoji: '🧾',
    title: 'Tax Savings',
    route: '/tax-guide',
    statValue: Math.round(getCombinedMarginalRate(45001) * 100),
    statFormat: 'percent',
    statLabel: 'Combined marginal rate',
    subtext: `${formatCurrency(TAX_BRACKETS_2026_27[2].min)}+: 30¢ bracket + 2% Medicare levy`,
  },
  {
    id: 'offset-vs-dr',
    emoji: '🏠',
    title: 'Offset vs Debt Recycling',
    route: '/careers-employment',
    statValue: Math.round(SUPER_RULES.sgRate * 100),
    statFormat: 'percent',
    statLabel: 'Super Guarantee',
    subtext: 'Salary-sacrifice vs offset tax arbitrage',
  },
  {
    id: 'house-affordability',
    emoji: '🔑',
    title: 'House Affordability',
    route: '/car-driving',
    statValue: QLD_STAMP_DUTY.firstHomeBuyer.grantAmount ?? 0,
    statFormat: 'currency',
    statLabel: 'QLD First Home Grant',
    subtext: `FHOG on new homes under ${formatCurrency(QLD_STAMP_DUTY.firstHomeBuyer.grantPriceCapNew)}`,
  },
  {
    id: 'savings-rate',
    emoji: '💰',
    title: 'Savings Rate',
    route: '/teen-budgeting',
    statValue: TAX_BRACKETS_2026_27[0].max,
    statFormat: 'currency',
    statLabel: 'Tax-free threshold',
    subtext: 'First $18,200 earned each year is 100% tax-free',
  },
];

const LIVE_FIGURES: ReadonlyArray<{
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
  caption: string;
}> = [
  {
    value: Math.round(SUPER_RULES.sgRate * 100),
    prefix: '',
    suffix: '%',
    decimals: 0,
    label: 'Super Guarantee',
    caption: 'Compulsory employer super (2026-27)',
  },
  {
    value: TAX_BRACKETS_2026_27[0].max,
    prefix: '$',
    suffix: '',
    decimals: 0,
    label: 'Tax-Free Threshold',
    caption: 'First dollars earned are tax-free',
  },
  {
    value: HELP_REPAYMENT_THRESHOLDS_2026_27[0].max,
    prefix: '$',
    suffix: '',
    decimals: 0,
    label: 'HELP Threshold',
    caption: 'Compulsory HECS repayments start here',
  },
  {
    value: Math.round(TAX_BRACKETS_2026_27[2].rate * 100),
    prefix: '',
    suffix: '%',
    decimals: 0,
    label: '30¢ Bracket',
    caption: `From ${formatCurrency(TAX_BRACKETS_2026_27[2].min)} (2026-27)`,
  },
  {
    value: QLD_STAMP_DUTY.firstHomeBuyer.grantAmount ?? 0,
    prefix: '$',
    suffix: '',
    decimals: 0,
    label: 'QLD First Home Grant',
    caption: `New homes under ${formatCurrency(QLD_STAMP_DUTY.firstHomeBuyer.grantPriceCapNew)}`,
  },
];

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

function HeroLiveFigure({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      setIdx(i => (i + 1) % LIVE_FIGURES.length);
    }, 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const fig = LIVE_FIGURES[idx];

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-primary/25 bg-card/70 backdrop-blur-md px-4 py-3 shadow-lg shadow-primary/5">
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Live Money Pulse · 2026-27
        </span>
        <div className="flex items-baseline gap-2">
          <OdometerCounter
            value={fig.value}
            prefix={fig.prefix}
            suffix={fig.suffix}
            decimals={fig.decimals}
            durationMs={900}
            className="text-2xl text-primary"
          />
          <span className="text-xs font-bold text-foreground truncate">{fig.label}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{fig.caption}</p>
      </div>
    </div>
  );
}

function CategoryChips({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <LayoutGroup id="landing-category-chips">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible"
        role="tablist"
        aria-label="Filter modules by category"
      >
        {CATEGORY_FILTERS.map(filter => {
          const active = filter.id === value;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                sound.playClick();
                onChange(filter.id);
              }}
              className={cn(
                'relative shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                active
                  ? 'border-primary/50 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              )}
            >
              {active && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-primary/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function CompactToggle({ compact, onChange }: { compact: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={compact}
      aria-label="Compact view"
      title="Compact view — fewer, tighter cards (shareable via ?compact=1)"
      onClick={() => {
        sound.playClick();
        onChange(!compact);
      }}
      className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      <span>Compact view</span>
      <span
        className={cn(
          'relative inline-flex h-4 w-7 items-center rounded-full p-0.5 transition-colors',
          compact ? 'bg-primary' : 'bg-muted border border-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200',
            compact ? 'translate-x-3' : 'translate-x-0'
          )}
        />
      </span>
    </button>
  );
}

export function Landing() {
  usePageTitle('AusFinance Suite — 2030 Australian Personal Finance Intelligence & Calculators');
  const { applyAgePreset, profile } = useTeenProfile();
  const reduceMotion = useReducedMotion();
  const [{ cat, compact }, setParams] = useUrlParams<{ cat: string; compact: boolean }>({ cat: 'all', compact: false });
  const [selectedModuleId, setSelectedModuleId] = useState<string>('careers-employment');
  const selectedModule = MANDY_MODULES.find(m => m.id === selectedModuleId) || MANDY_MODULES[1];

  const filteredModules =
    cat === 'all'
      ? MANDY_MODULES
      : MANDY_MODULES.filter(m => MODULE_CATEGORIES[m.id]?.includes(cat as ModuleCategory) ?? false);

  const tickerItems: TickerItem[] = [
    { label: 'HELP 2026-27 Threshold', value: '$69,528' },
    { label: 'Super Guarantee', value: '12.0%' },
    { label: 'Tax-Free Threshold', value: '$18,200' },
    { label: 'EV FBT Exemption', value: '100% Pre-Tax' },
    { label: 'HISA Top Rates', value: '5.0%+ p.a.' },
    { label: 'APRA Guarantee', value: '$250k FCS' },
    { label: 'Translink Flat Fare', value: '50c' },
    { label: 'First-Home Grant (QLD)', value: '$30,000' },
    { label: 'ASX 200 Return', value: '~9% p.a.' },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/25 via-purple-500/15 to-amber-500/25 p-8 sm:p-14 text-center sm:text-left shadow-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <InteractiveGridPattern glowSize={500} glowColor="oklch(0.65 0.18 250 / 0.25)" />
          <div className="absolute inset-0">
            <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-amber-500/25 blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-64 rounded-full bg-purple-500/20 blur-[110px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        </div>
        <BorderBeam size={280} duration={14} colorFrom="#3b82f6" colorTo="#a855f7" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Australian Personal Finance & Tax Suite (2030 Edition) 🇦🇺</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-none">
              Master your <span className="text-primary bg-gradient-to-r from-primary via-violet-500 to-amber-500 bg-clip-text text-transparent">wealth & taxes</span>.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Statutory-accurate Australian calculators and real-world guides — from the 2025 Universities Accord HECS reforms and EV novated leasing to Super drawdowns, Age Pension deeming, and property CGT.
            </p>

            {/* Site-wide search */}
            <div className="pt-3 flex flex-col items-center sm:items-start gap-2">
              <SiteSearchBar />
              <span className="text-[11px] text-muted-foreground/80">
                🔍 Instant fuzzy search across all 20+ calculators, 160+ guide topics, and official ATO resources (Press ⌘K).
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <MagneticButton
                strength={0.25}
                ariaLabel="Explore All Calculators"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-violet-500 to-purple-500 text-primary-foreground font-bold text-sm hover:opacity-90 hover:shadow-xl hover:shadow-primary/25 transition-shadow shadow-md gap-2 cursor-pointer"
              >
                <Link to="/calculators" onClick={() => sound.playClick()} className="inline-flex items-center gap-2">
                  <span>⚡️ Explore All 20+ Calculators</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton
                strength={0.2}
                ariaLabel="Set Up My Profile"
                className="px-6 py-3.5 rounded-2xl bg-card/80 border border-border text-foreground font-bold text-sm hover:bg-card hover:border-primary/40 transition-all backdrop-blur cursor-pointer"
              >
                <Link to="/profile" onClick={() => sound.playClick()} className="inline-flex items-center gap-2">
                  My Profile ({profile.age}yo)
                </Link>
              </MagneticButton>
            </div>

            {/* Quick Age Toggle Pills in Hero */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Persona Presets:
              </span>
              {[15, 16, 17, 18].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    applyAgePreset(a);
                  }}
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

            {/* Hero Live Money Pulse (odometer-style) */}
            <div className="pt-4 max-w-md mx-auto sm:mx-0">
              <HeroLiveFigure reduceMotion={reduceMotion} />
            </div>
          </div>

          {/* Hero 3D Graphic Asset Card */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <HolographicTiltCard showBeam={false} className="border-primary/30">
              <SmartImage
                src="/assets/aus_teen_hero.jpg"
                alt="AusTeen Money Graphic Illustration"
                className="w-full h-auto object-cover rounded-2xl"
                loading="eager"
                width={1376}
                height={768}
                fetchPriority="high"
              />
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  2026-2027 Australian Edition
                </span>
                <span className="text-primary font-bold">100% Free & Privacy-First 🛡️</span>
              </div>
            </HolographicTiltCard>
          </div>
        </div>
      </section>

      {/* Quick-Start Fast Paths */}
      <section className="space-y-5 calculator-section">
        <div className="text-center sm:text-left space-y-1">
          <Badge variant="info">Quick-Start Fast Paths</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Start Your Money Journey in 4 Clicks
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Curated journeys that deep-link straight into the right calculator or guide.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {FAST_PATHS.map(fp => (
            <motion.div key={fp.id} variants={fadeInUp}>
              <Link
                to={fp.route}
                onClick={() => sound.playClick()}
                className="group block h-full p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{fp.emoji}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {fp.tag}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {fp.title}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{fp.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  Start now
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Calculators Grid */}
      <section className="space-y-5 calculator-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <Badge variant="success">Most Popular Calculators</Badge>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Quick Wins, Pre-Checked
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Live stats pulled straight from our 2026-27 ATO data engine.
            </p>
          </div>
          <Link
            to="/calculators"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0 justify-center"
          >
            <span>All Calculators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div
          variants={fastStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURED_CALCULATORS.map(calc => (
            <motion.div key={calc.id} variants={fadeInUp} className="h-full">
              <Link
                to={calc.route}
                onClick={() => sound.playClick()}
                className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <SpotlightCard className="h-full p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{calc.emoji}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {calc.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{calc.subtext}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-border/60">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {calc.statLabel}
                    </span>
                    <AnimatedNumber
                      value={calc.statValue}
                      format={calc.statFormat}
                      className="text-2xl font-mono font-bold text-primary tabular-nums"
                    />
                  </div>
                </SpotlightCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 2026 Top Calculators Bento Showcase */}
      <section className="space-y-6 calculator-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <Badge variant="default">
              Next-Gen Financial Engines
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              High-Demand Australian Modeling Tools
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Statutory-accurate simulations incorporating Universities Accord, Stage 3 tax cuts, and FBT exemptions.
            </p>
          </div>

          <Link
            to="/calculators"
            onClick={() => sound.playClick()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
          >
            <span>View All 20+ Calculators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            compact ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {[
            {
              title: 'HECS-HELP vs Investing',
              route: '/hecs-payoff',
              emoji: '🎓',
              icon: GraduationCap,
              badge: '2025 Accord $67k',
              desc: 'Simulate voluntary payoff vs Mortgage Offset vs ASX ETFs with min(CPI, WPI) indexation cap.',
            },
            {
              title: 'Super Drawdown & Pension',
              route: '/super-drawdown',
              emoji: '⭐️',
              icon: Coins,
              badge: 'Schedule 7 SISR',
              desc: 'Model 0% ECPI tax-free pension drawdowns, deeming rates, and Centrelink Age Pension means tests.',
            },
            {
              title: 'EV Novated Lease vs Loan',
              route: '/ev-novated-lease',
              emoji: '⚡️',
              icon: Zap,
              badge: '100% FBT Exemption',
              desc: 'FBTAA s 8A exemption, $6,334 max GST credit, ATO PCG 2024/2 home charging, and 5-year TCO.',
            },
            {
              title: 'CGT & 6-Year Exemption',
              route: '/cgt-engine',
              emoji: '🏡',
              icon: FileText,
              badge: 'ITAA 1997 s 118-145',
              desc: '50% discount for assets held >12 mos, s 102-5 loss ordering, and Div 43 capital works clawback.',
            },
            {
              title: 'Emergency Runway & Stress',
              route: '/financial-stress-test',
              emoji: '🛡️',
              icon: ShieldAlert,
              badge: 'APRA +300 bps Shock',
              desc: 'HISA vs Offset pre-tax yield arbitrage, JobSeeker LAWP 13-week wait, and 100-point Health Score.',
            },
            {
              title: 'Browse Full Toolkit',
              route: '/calculators',
              emoji: '🧮',
              icon: Calculator,
              badge: 'All Tools Hub',
              desc: 'Access all tax, super, stamp duty tables for all 8 states, and budgeting tools in one dashboard.',
            },
          ].map(tool => (
            <Link
              key={tool.route}
              to={tool.route}
              onClick={() => sound.playClick()}
              className="group p-5 rounded-3xl bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 hover:-translate-y-1"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.emoji} {tool.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                <span>Launch Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2030 Interactive Scenario Splitter Widget */}
      <section className="calculator-section">
        <ScenarioSplitterWidget />
      </section>

      {/* 2030 CSS Money-Facts Ticker */}
      <section aria-label="Real-world money facts ticker">
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm px-2 py-2.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 pl-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
              <Zap className="w-3 h-3 text-amber-500" />
              Money Pulse
            </span>
            <TickerMarquee items={tickerItems} speed="42s" className="flex-1" />
          </div>
        </div>
      </section>

      {/* 11 Mandy Money Modules Grid */}
      <section className="space-y-6 calculator-section">
        <div className="flex items-start justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <Badge variant="warning">
              11 Real-World Learning Modules
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              160+ Money Questions Answered
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Click any module to dive into interactive calculators, step-by-step guides, and official Australian web resources.
            </p>
          </div>

          <CompactToggle compact={compact} onChange={v => setParams({ compact: v })} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 hidden sm:block" aria-hidden="true" />
            <CategoryChips value={cat} onChange={id => setParams({ cat: id })} />
          </div>
          <p className="text-[11px] text-muted-foreground text-center sm:text-left" aria-live="polite">
            Showing {filteredModules.length} of {MANDY_MODULES.length} modules
            {cat !== 'all' && ' — filtered by category'} · filter is shareable via ?cat= URL param
          </p>
        </div>

        <motion.div
          key={cat}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={cn(
            'grid grid-cols-1 gap-4',
            compact ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {filteredModules.map(module => (
            <motion.div key={module.id} variants={fadeInUp}>
              <Link
                to={module.route}
                onClick={() => sound.playClick()}
                className="block group rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
              >
                <HolographicTiltCard
                  showBeam={false}
                  className={cn('h-full rounded-3xl', compact ? 'space-y-2 p-4' : 'space-y-3')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {module.graphicUrl ? (
                        <SmartImage
                          src={module.graphicUrl}
                          alt={module.title}
                          className={cn(
                            'rounded-2xl object-cover border border-primary/20 shadow-md group-hover:scale-110 transition-transform duration-300',
                            compact ? 'w-9 h-9' : 'w-12 h-12'
                          )}
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <span className={cn(
                          'rounded-2xl bg-gradient-to-br from-primary/15 via-purple-500/10 to-amber-500/20 border border-primary/10 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/30 transition-all shadow-inner',
                          compact ? 'w-9 h-9 text-xl' : 'w-12 h-12 text-2xl'
                        )}>
                          {module.emoji}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {module.topics.length} topics
                    </span>
                  </div>
                  <h3 className={cn('font-bold text-foreground group-hover:text-primary transition-colors', compact ? 'text-base' : 'text-lg')}>
                    {module.title}
                  </h3>
                  <p className={cn('text-xs text-muted-foreground leading-relaxed', compact && 'line-clamp-2')}>
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
    </div>
  );
}

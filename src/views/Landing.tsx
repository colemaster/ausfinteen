import { lazy, Suspense } from 'react';
import { Link } from '@/lib/router';
import { NAV_MODULES } from '@/data/nav-modules';
import { Badge } from '@/components/ui/Badge';
import { HolographicTiltCard } from '@/components/ui/HolographicTiltCard';
import { SmartImage } from '@/components/ui/SmartImage';
import { ScenarioSplitterWidget } from '@/components/ui/ScenarioSplitterWidget';
import {
  ArrowRight,
  Zap,
  GraduationCap,
  Coins,
  FileText,
  ShieldAlert,
  Calculator,
  LayoutGrid,
  Filter,
} from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { fadeInUp, staggerContainer, fastStagger } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useUrlParams } from '@/hooks/useUrlParams';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatCurrency } from '@/utils/formatters';
import { TAX_BRACKETS_2026_27, getCombinedMarginalRate } from '@/data/tax-brackets';
import { SUPER_RULES } from '@/data/super-rules';
import { QLD_STAMP_DUTY } from '@/data/stamp-duty-tables';
import { TickerMarquee, type TickerItem } from '@/components/ui/TickerMarquee';
import { usePageTitle } from '@/hooks/usePageTitle';
import { sound } from '@/lib/sound-synthesizer';
import { prefetchRoute } from '@/utils/prefetch';

// Above-the-fold components — eagerly loaded for instant FCP/LCP
import { Hero15yo } from '@/components/landing/Hero15yo';
import { ParallaxHeroArt } from '@/components/landing/ParallaxHeroArt';
import { LiveMoneyCounters } from '@/components/landing/LiveMoneyCounters';
import { StatsBand } from '@/components/landing/StatsBand';
import { AgeJourneyRail } from '@/components/landing/AgeJourneyRail';
import { FirstPaycheckWidget } from '@/components/landing/FirstPaycheckWidget';

// Below-the-fold components — lazy-loaded for ~300+ KB savings on initial bundle
const StartHereQuiz       = lazy(() => import('@/components/landing/StartHereQuiz').then(m => ({ default: m.StartHereQuiz })));
const HisaShowdown        = lazy(() => import('@/components/landing/HisaShowdown').then(m => ({ default: m.HisaShowdown })));
const PenaltyPayBooster   = lazy(() => import('@/components/landing/PenaltyPayBooster').then(m => ({ default: m.PenaltyPayBooster })));
const FiftyCentWins       = lazy(() => import('@/components/landing/FiftyCentWins').then(m => ({ default: m.FiftyCentWins })));
const CompoundRocket      = lazy(() => import('@/components/landing/CompoundRocket').then(m => ({ default: m.CompoundRocket })));
const SchoolSpotlight     = lazy(() => import('@/components/landing/SchoolSpotlight').then(m => ({ default: m.SchoolSpotlight })));
const UniPathways         = lazy(() => import('@/components/landing/UniPathways').then(m => ({ default: m.UniPathways })));
const JourneyMap          = lazy(() => import('@/components/landing/JourneyMap').then(m => ({ default: m.JourneyMap })));
const TopicSpotlight      = lazy(() => import('@/components/landing/TopicSpotlight').then(m => ({ default: m.TopicSpotlight })));
const WhatWillILearnPreview = lazy(() => import('@/components/landing/WhatWillILearnPreview').then(m => ({ default: m.WhatWillILearnPreview })));
const MoneyMyths          = lazy(() => import('@/components/landing/MoneyMyths').then(m => ({ default: m.MoneyMyths })));
const ScamShield          = lazy(() => import('@/components/landing/ScamShield').then(m => ({ default: m.ScamShield })));
const TrustStrip          = lazy(() => import('@/components/landing/TrustStrip').then(m => ({ default: m.TrustStrip })));
const SeoFaq              = lazy(() => import('@/components/landing/SeoFaq').then(m => ({ default: m.SeoFaq })));

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
                'relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {active && (
                <motion.span
                  layoutId="activeCategoryChip"
                  className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
      onClick={() => {
        sound.playClick();
        onChange(!compact);
      }}
      aria-label={compact ? 'Switch to detailed card view' : 'Switch to compact grid view'}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all',
        compact
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">
        {compact ? 'Compact View' : 'Detailed View'}
      </span>
    </button>
  );
}

export function Landing() {
  usePageTitle('AusFinance Suite — 2030 Australian Personal Finance Intelligence & Calculators');
  const [{ cat, compact }, setParams] = useUrlParams<{ cat: string; compact: boolean }>({ cat: 'all', compact: false });

  const filteredModules =
    cat === 'all'
      ? NAV_MODULES
      : NAV_MODULES.filter(m => MODULE_CATEGORIES[m.id]?.includes(cat as ModuleCategory) ?? false);

  const tickerItems: TickerItem[] = [
    { label: 'HELP 2026-27 Threshold', value: '$69,528' },
    { label: 'Super Guarantee', value: '12.0%' },
    { label: 'Tax-Free Threshold', value: '$18,200' },
    { label: 'EV FBT Exemption', value: '100% Pre-Tax' },
    { label: 'HISA Top Rates', value: '5.80% p.a.' },
    { label: 'APRA Guarantee', value: '$250k FCS' },
    { label: 'Translink Flat Fare', value: '50c' },
    { label: 'First-Home Grant (QLD)', value: '$30,000' },
    { label: 'ASX 200 Return', value: '~9% p.a.' },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* 15yo-first Hero */}
      <Hero15yo>
        <ParallaxHeroArt />
      </Hero15yo>

      {/* Live 15yo money counters */}
      <section className="calculator-section" aria-label="Live money figures for teens">
        <LiveMoneyCounters />
      </section>

      {/* Live stats marquee */}
      <StatsBand />

      {/* Start-here recommender */}
      <section className="calculator-section" aria-label="Find your starting point">
        <Suspense fallback={null}><StartHereQuiz /></Suspense>
      </section>

      {/* 15→18 journey rail */}
      <section className="calculator-section" aria-label="Your journey from 15 to 18">
        <AgeJourneyRail />
      </section>

      {/* First paycheck calculator */}
      <section className="calculator-section" aria-label="First paycheck calculator">
        <FirstPaycheckWidget />
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
                onMouseEnter={() => prefetchRoute(fp.route)}
                onClick={() => sound.playClick()}
                className="group block h-full p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden="true">{fp.emoji}</span>
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
            onMouseEnter={() => prefetchRoute('/calculators')}
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
                onMouseEnter={() => prefetchRoute(calc.route)}
                onClick={() => sound.playClick()}
                className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <SpotlightCard className="h-full p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" aria-hidden="true">{calc.emoji}</span>
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

      {/* Youth money widgets: HISA showdown, penalty pay, 50c fares, compounding */}
      <section className="calculator-section" aria-label="Youth savings and pay boosters">
        <Suspense fallback={null}><HisaShowdown /></Suspense>
      </section>

      <section className="calculator-section" aria-label="Weekend penalty pay booster">
        <Suspense fallback={null}><PenaltyPayBooster /></Suspense>
      </section>

      <section className="calculator-section" aria-label="50 cent fare savings">
        <Suspense fallback={null}><FiftyCentWins /></Suspense>
      </section>

      <section className="calculator-section" aria-label="Compound growth from 15">
        <Suspense fallback={null}><CompoundRocket /></Suspense>
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
            onMouseEnter={() => prefetchRoute('/calculators')}
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
              badge: '2026 Accord $69.5k',
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
              onMouseEnter={() => prefetchRoute(tool.route)}
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

      {/* Schools, uni pathways, year map, topic spotlight */}
      <section className="calculator-section" aria-label="Find your high school">
        <Suspense fallback={null}><SchoolSpotlight /></Suspense>
      </section>

      <section className="calculator-section" aria-label="University pathways and QTAC dates">
        <Suspense fallback={null}><UniPathways /></Suspense>
      </section>

      <section className="calculator-section" aria-label="Your money year map">
        <Suspense fallback={null}><JourneyMap /></Suspense>
      </section>

      <section className="calculator-section" aria-label="Featured money guides">
        <Suspense fallback={null}><TopicSpotlight /></Suspense>
      </section>

      {/* 11 Mandy Money Modules Grid */}
      <section className="space-y-6 calculator-section">
        <div className="flex items-start justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <Badge variant="warning">
              11 Real-World Learning Modules
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              150+ Money Questions Answered
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
            Showing {filteredModules.length} of {NAV_MODULES.length} modules
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
                onMouseEnter={() => prefetchRoute(module.route)}
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
                      {module.topicsCount} topics
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

      {/* "What Will I Learn?" Topic Selector — Lazy Loaded */}
      <Suspense fallback={null}>
        <WhatWillILearnPreview compact={compact} />
      </Suspense>

      {/* Money myths, scam shield, trust, FAQ */}
      <section className="calculator-section" aria-label="Money myths debunked">
        <Suspense fallback={null}><MoneyMyths /></Suspense>
      </section>

      <section className="calculator-section" aria-label="Scam defence quiz">
        <Suspense fallback={null}><ScamShield /></Suspense>
      </section>

      <Suspense fallback={null}><TrustStrip /></Suspense>

      <section className="calculator-section" aria-label="Frequently asked questions">
        <Suspense fallback={null}><SeoFaq /></Suspense>
      </section>
    </div>
  );
}

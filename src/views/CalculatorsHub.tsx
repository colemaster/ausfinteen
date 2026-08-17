import { useState } from 'react';
import { Link } from '@/lib/router';
import {
  GraduationCap,
  Coins,
  Zap,
  FileText,
  ShieldAlert,
  TrendingUp,
  CreditCard,
  Building,
  PiggyBank,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';

interface CalcCard {
  id: string;
  title: string;
  category: 'tax_super' | 'property' | 'investing' | 'debt_budget' | 'stress';
  badge: string;
  badgeColor: string;
  description: string;
  route: string;
  icon: typeof GraduationCap;
  stats: string;
}

const CALCULATORS_LIST: CalcCard[] = [
  {
    id: 'hecs-payoff',
    title: 'HECS-HELP Payoff vs Investing Simulator',
    category: 'tax_super',
    badge: '2025 Accord System',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    description: 'Model $67k marginal repayment threshold, min(CPI, WPI) indexation cap, offset & ASX ETF wealth comparison, and APRA borrowing hit.',
    route: '/hecs-payoff',
    icon: GraduationCap,
    stats: 'Marginal $67k cap • min(CPI, WPI)',
  },
  {
    id: 'super-drawdown',
    title: 'Super Drawdown & Age Pension Optimizer',
    category: 'tax_super',
    badge: 'Schedule 7 SISR',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: 'Calculate 0% ECPI tax-free pension drawdowns, deeming rates (1.25%/3.25%), and Centrelink Age Pension dual means test.',
    route: '/super-drawdown',
    icon: Coins,
    stats: '4%-14% drawdowns • Dual means test',
  },
  {
    id: 'ev-novated-lease',
    title: 'EV Novated Lease vs Cash vs Car Loan',
    category: 'tax_super',
    badge: '100% FBT Exempt',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    description: 'Treasury Electric Car Discount (FBTAA s 8A), $6,334 max GST credit, ATO PCG 2024/2 home charging (4.2c/km), and 5-year TCO.',
    route: '/ev-novated-lease',
    icon: Zap,
    stats: 'Under $91,387 LCT • 100% pre-tax',
  },
  {
    id: 'cgt-engine',
    title: 'Capital Gains Tax & 6-Year Rule Engine',
    category: 'property',
    badge: 'ITAA 1997 Div 115',
    badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
    description: 'Calculate 50% CGT discount, s 102-5 loss ordering, s 118-145 6-year main residence absence rule, and Div 43 clawback.',
    route: '/cgt-engine',
    icon: FileText,
    stats: '50% discount • 6-year absence rule',
  },
  {
    id: 'financial-stress-test',
    title: 'Emergency Runway & Stress Tester',
    category: 'stress',
    badge: 'APRA +300 bps Shock',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    description: 'Simulate JobSeeker LAWP 13-week waiting period, APRA +300 bps rate shock, and HISA vs Offset pre-tax yield arbitrage.',
    route: '/financial-stress-test',
    icon: ShieldAlert,
    stats: '100-pt Health Score • Yield arbitrage',
  },
  {
    id: 'teen-tax',
    title: 'Tax Guide & $18,200 Threshold',
    category: 'tax_super',
    badge: 'Stage 3 Rates',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    description: 'Calculate net take-home pay, PAYG withholding, Medicare levy shade-in thresholds ($27,222), and LITO offsets.',
    route: '/tax-guide',
    icon: Building,
    stats: '$18.2k tax-free • $27.2k Medicare',
  },
  {
    id: 'investing-shares',
    title: 'Compound Growth & ASX ETF Centre',
    category: 'investing',
    badge: 'ASX Top 10 ETFs',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    description: 'Explore VAS, VGS, IVV, A200, MER fee drag over 30 years, and dividend reinvestment plan (DRP) compounding.',
    route: '/investing-shares',
    icon: TrendingUp,
    stats: '0.04% - 0.07% MER • DRP compounding',
  },
  {
    id: 'car-driving',
    title: 'First Car TCO & EV vs Petrol Calculator',
    category: 'debt_budget',
    badge: 'All 8 States Duty',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: 'Calculate 2-year total cost of ownership including QLD PrepL licence fees, comprehensive insurance, rego, and fuel cycles.',
    route: '/car-driving',
    icon: CreditCard,
    stats: 'Rego + CTP + Insurance • Petrol cycles',
  },
  {
    id: 'teen-budgeting',
    title: 'Barefoot 3-Bucket & 50/30/20 Budgeting',
    category: 'debt_budget',
    badge: 'Barefoot System',
    badgeColor: 'bg-primary/10 text-primary border-primary/30',
    description: 'Automate your paycheck into Blow (60%), Mojo (20% safety net), and Grow (20% wealth goal) sub-accounts.',
    route: '/teen-budgeting',
    icon: PiggyBank,
    stats: '50/30/20 • Mojo emergency buffer',
  },
];

export function CalculatorsHub() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = CALCULATORS_LIST.filter(c => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-card border border-border shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Australian Personal Finance Engine Suite (2024–2027)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Financial Modeling & Calculator Suite
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          High-precision, statutory-compliant calculators for Australian taxes, superannuation, HECS debt, EV novated leasing, property stamp duty, capital gains, and emergency stress testing.
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search calculators (e.g. HECS, FBT, CGT, Age Pension, Offset)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'tax_super', label: 'Tax & Super' },
              { id: 'property', label: 'Property & CGT' },
              { id: 'investing', label: 'Investing' },
              { id: 'stress', label: 'Runway & Health' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(tab.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  activeCategory === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              to={card.route}
              onClick={() => sound.playClick()}
              className="group p-6 rounded-3xl bg-card border border-border hover:border-primary/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="text-[10px] font-mono text-foreground/80">{card.stats}</span>
                <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  Launch <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

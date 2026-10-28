import { spendingSavingModule as moduleData } from '@/data/modules/spending-saving';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import { StudentDiscountOptimizer } from '@/components/teen/StudentDiscountOptimizer';
import { SavingsGoalsPlanner } from '@/components/teen/SavingsGoalsPlanner';
import { Smartphone, ShieldCheck, ShoppingBag, Home, Coins, Store } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePageTitle } from '@/hooks/usePageTitle';

export function SpendingSavingRealWorld() {
  usePageTitle('Spending, Saving & Real World Money');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-primary/20 p-6 sm:p-10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
          <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
            Module 6 • Real World Money
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          {moduleData.description}
        </p>
      </div>

      {/* Interactive Student Discount & Subscription Optimizer */}
      <StudentDiscountOptimizer />

      {/* Interactive Teen Savings Goals & Sinking Funds Planner */}
      <SavingsGoalsPlanner />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">SIM-Only Plans ($15–$28/mo)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ditch $85/mo lock-in contracts. Boost Mobile has full Telstra coverage, while Everyday Mobile gives 10% off monthly groceries!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Medicare Card at 15</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Australian teens can claim their own green Medicare card via Form MS011 for 100% free confidential bulk-billing GP visits.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
            <Home className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Sharehouse Moving Buffer</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Budget $2,500–$3,500 upfront for 4 weeks bond (RTA capped), 2 weeks advance rent, connection fees, and Splitwise tracking.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Beat Grocery Inflation</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Master the unit pricing rule ($/100g), buy ALDI baseline staples (15–25% cheaper), and buy brand staples only at 50% off.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Youth Allowance Income Bank</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn $539/fn before tapers. Bank up to $13,500 in unused credits so university holiday work spikes never reduce your payments.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">5.0%+ HISA & APRA Guarantee</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            BOQ, Newcastle Perm, and Up offer 5.35%–5.80% high-yield interest, 100% government guaranteed up to $250k under the FCS.
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Spending, Saving & Real World?" />
      </div>

      <ModulePrevNext currentId="spending-saving" />
      <PrintShareFAB />
    </div>
  );
}

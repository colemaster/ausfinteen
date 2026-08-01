import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Smartphone, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SpendingSavingRealWorld() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'spending-saving')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-primary/20 p-6 sm:p-10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
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

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Tech & Phone Plans</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Avoid 36-month lock-in contracts. Buy phone refurbished & use a $25/mo SIM-only plan.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Medicare Card at 15</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You can get your own green Medicare card at age 15 to access bulk-billing doctors for free!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">SMART Savings Goals</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Specific, Measurable, Achievable, Relevant, Time-bound goals turn "save more" into a plan you can follow.
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Spending, Saving & Real World?" />
      </div>
    </div>
  );
}

import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenSavingsAccountFinder } from '@/calculators/teen-savings/TeenSavingsAccountFinder';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { Dna, Landmark, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePageTitle } from '@/hooks/usePageTitle';

export function InterestFinancialProducts() {
  usePageTitle('Interest & Financial Products · 5%+ HISA');
  const moduleData = MANDY_MODULES.find(m => m.id === 'interest-products')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-primary/20 p-6 sm:p-10 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="warning" className="text-xs font-bold uppercase tracking-wider">
            Module 8 • Interest & Banking
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          {moduleData.description}
        </p>
      </div>

      {/* Interactive Tool */}
      <TeenSavingsAccountFinder />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Compound Interest</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interest calculated on your principal PLUS your previous interest. Over time, your savings accelerate!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 w-fit">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">5%+ High Yield Accounts</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Aussies under 18 get access to top bonus rates (e.g. Great Southern Bank Youth Saver 5.25%).
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Dna className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Zero Monthly Fees</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Never pay monthly account keeping fees—all youth transaction accounts in AU are $0 fee.
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Interest & Financial Products?" />
      </div>

      <ModulePrevNext currentId="interest-products" />
    </div>
  );
}

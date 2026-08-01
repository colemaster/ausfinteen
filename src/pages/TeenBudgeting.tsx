import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { FirstPaycheckSplitter } from '@/calculators/teen-budget/FirstPaycheckSplitter';
import { Wallet, PieChart, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function TeenBudgeting() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'teen-budgeting')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-primary/20 p-6 sm:p-10 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
            Module 5 • Paycheck & Budgeting
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
      <FirstPaycheckSplitter />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
            <PieChart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Teen 50/30/20 Rule</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            50% Future/Save, 30% Fun/Wants, 20% Needs/Admin. High savings rates at home build wealth fast!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">4-Bucket System</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every dollar has a job! Spend Account, Save Account, Emergency Account, and Big Goal Account.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Pay Yourself First</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automate your savings transfers so money moves to your savings account the minute pay lands!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Budgeting & Paychecks?" />
      </div>
    </div>
  );
}

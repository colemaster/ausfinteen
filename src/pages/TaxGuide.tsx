import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenTaxCalculator } from '@/calculators/teen-tax/TeenTaxCalculator';
import { DollarSign, ShieldCheck, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function TaxGuide() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'tax-guide')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-primary/20 p-6 sm:p-10 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
            Module 4 • Tax & Tax Returns
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
      <TeenTaxCalculator />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">$18,200 Tax-Free</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The first $18,200 you earn each financial year is completely tax-free for Australian residents.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Stage 3 Brackets</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Australia uses progressive tax steps—you only pay higher tax rates on dollars inside that tier.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">myTax Returns</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Lodge online between July 1 and October 31 via myGov to claim work deductions & tax refunds!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Tax & Tax Returns?" />
    </div>
  );
}

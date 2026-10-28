import { interestProductsModule as moduleData } from '@/data/modules/interest-products';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenSavingsAccountFinder } from '@/calculators/teen-savings/TeenSavingsAccountFinder';
import { BankingInfrastructureGuide } from '@/components/teen/BankingInfrastructureGuide';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import { Landmark, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePageTitle } from '@/hooks/usePageTitle';

export function InterestFinancialProducts() {
  usePageTitle('Interest & Financial Products · 5%+ HISA & Banking Infrastructure');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-primary/20 p-6 sm:p-10 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
          <Badge variant="warning" className="text-xs font-bold uppercase tracking-wider">
            Module 8 • Interest & Banking Infrastructure
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
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Compound Interest Mechanics</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interest calculated daily on principal plus accumulated gains. Saving $50/mo from age 15 creates massive long-term wealth acceleration!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">APRA $250k FCS Guarantee</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Statutory government protection under the Banking Act 1959 up to $250,000 per depositor per ADI, with a 7-day reimbursement guarantee.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Modern Rails: PayID, Osko & PayTo</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instant 24/7 transfers, Confirmation of Payee scam defense, and real-time in-app pause/cancel authority for subscriptions.
          </p>
        </Card>
      </div>

      {/* Banking Infrastructure & Regulatory Safeguards Guide */}
      <div className="calculator-section">
        <BankingInfrastructureGuide />
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Interest & Financial Products?" />
      </div>

      <ModulePrevNext currentId="interest-products" />
      <PrintShareFAB />
    </div>
  );
}

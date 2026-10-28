import { dealingWithDebtModule as moduleData } from '@/data/modules/dealing-with-debt';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { BNPLDebtTrapVisualizer } from '@/calculators/teen-debt/BNPLDebtTrapVisualizer';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import {
  Flame,
  AlertOctagon,
  ShieldAlert,
  PhoneCall,
  Scale,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { usePageTitle } from '@/hooks/usePageTitle';

export function DealingWithDebt() {
  usePageTitle('Dealing With Debt · BNPL & Credit Scores');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/20 via-red-500/10 to-primary/20 p-6 sm:p-10 border border-rose-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
              <Badge variant="danger" className="text-xs font-bold uppercase tracking-wider">
                Module 9 • Dealing with Debt
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {moduleData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {moduleData.description}
            </p>
          </div>
          <div className="md:col-span-4 hidden md:flex justify-center">
            <div className="float-slow relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
              <SmartImage
                src="/assets/graphics/popmart_debt.jpg"
                alt="Debt Smasher Superhero 3D Popmart Toy"
                className="relative w-36 h-36 rounded-2xl object-cover border-2 border-rose-500/40 shadow-xl"
                loading="lazy"
                width={144}
                height={144}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tool */}
      <BNPLDebtTrapVisualizer />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">2026–27 BNPL Reforms</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            BNPL providers must hold Australian Credit Licences (ACL), assess unsuitability, cap fees, and report to credit bureaus.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Mortgage & CCR Impact</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Open BNPL limits slash home loan borrowing capacity by $25k–$50k. Overdue defaults ($150+) stay on record for 5 years!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Payday Loans (400%+ APR)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            SACCs and wage-advance apps charge predatory compounding fees and trigger automatic mortgage declines.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-bold text-foreground">100% Free Help & Hardship</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Call National Debt Helpline (1800 007 007) or Mob Strong (1800 808 488). Exercise Section 72 NCC hardship rights!
          </p>
        </Card>
      </div>

      {/* Statutory Hardship & Free Dispute Resolution Hub */}
      <Card variant="glass" className="p-6 sm:p-8 space-y-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="text-xs font-semibold">
                100% Free • Independent • Non-Judgemental
              </Badge>
              <Badge variant="outline" className="text-xs">
                Statutory Consumer Rights
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <PhoneCall className="w-6 h-6 text-emerald-500" />
              Immediate Financial Distress & Dispute Hotlines
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            You do NOT have to face debt collectors, mounting BNPL fees, or unpaid bills alone. Australian law guarantees free counselling and binding dispute resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* National Debt Helpline */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  National Financial Counselling
                </span>
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">National Debt Helpline</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Free, independent, government-funded community financial counselling. Counsellors negotiate payment moratoriums, fee freezes, and stop collector harassment.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <a
                href="tel:1800007007"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-sm transition"
              >
                <PhoneCall className="w-4 h-4" />
                1800 007 007 (Free Call)
              </a>
              <a
                href="https://ndh.org.au"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition py-1"
              >
                <span>ndh.org.au (Live Chat 9am–8pm AEST)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Mob Strong Debt Help */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  First Nations Legal & Financial
                </span>
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Mob Strong Debt Help</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dedicated, culturally safe legal and financial advice service for Aboriginal and Torres Strait Islander peoples nationwide, run by Financial Rights Legal Centre.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <a
                href="tel:1800808488"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-sm transition"
              >
                <PhoneCall className="w-4 h-4" />
                1800 808 488 (Free Call)
              </a>
              <a
                href="https://financialrights.org.au/mob-strong-debt-help/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition py-1"
              >
                <span>financialrights.org.au (Mon–Fri 9:30–4:30)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* AFCA */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3 flex flex-col justify-between hover:border-primary/40 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Binding Dispute Resolution
                </span>
                <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">AFCA (External Disputes)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Independent ombudsman scheme legally binding on banks and BNPL providers. Resolves unfair lending, wrongful defaults, and compensation claims up to $631,500.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <a
                href="tel:1800931678"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary font-bold text-sm transition"
              >
                <PhoneCall className="w-4 h-4" />
                1800 931 678 (Free Call)
              </a>
              <a
                href="https://www.afca.org.au"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition py-1"
              >
                <span>afca.org.au (Online Complaint Portal)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 72 NCC & Scam Warning Dual Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="font-bold text-sm text-foreground">
                Section 72 National Credit Code (NCC) Hardship Rights
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you submit a hardship notice (by phone or email), creditors have a statutory <strong className="text-foreground">21-day deadline</strong> to respond in writing. Under Section 89A, lenders are legally barred from taking enforcement action or repossessing property while your notice is active. Financial Hardship Information (FHI) drops off credit files in 12 months with <strong className="text-foreground">zero credit score penalty</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h4 className="font-bold text-sm text-foreground">
                Cyber Defense: Avoid "Money Mule" Quick-Cash Traps
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never let anyone transfer funds through your bank account in exchange for a "cut". Under <strong className="text-foreground">Commonwealth Criminal Code Act 1995 Division 400</strong>, money laundering carries penalties of up to <strong className="text-foreground">25 years imprisonment</strong> (s400.3) for intentional or reckless conduct, plus permanent sector-wide bank account blacklisting.
            </p>
          </div>
        </div>
      </Card>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Dealing with Debt?" />
      </div>

      <ModulePrevNext currentId="dealing-with-debt" />
      <PrintShareFAB />
    </div>
  );
}

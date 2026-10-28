import { taxGuideModule as moduleData } from '@/data/modules/tax-guide';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenTaxCalculator } from '@/calculators/teen-tax/TeenTaxCalculator';
import { FirstTaxReturnGuide } from '@/components/teen/FirstTaxReturnGuide';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import { DollarSign, ShieldCheck, FileCheck, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { usePageTitle } from '@/hooks/usePageTitle';

export function TaxGuide() {
  usePageTitle('Tax & Tax Returns · $18.2k Tax-Free');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-primary/20 p-6 sm:p-10 border border-emerald-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
              <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
                Module 4 • Tax & Tax Returns
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
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
              <SmartImage
                src="/assets/graphics/popmart_tax.jpg"
                alt="$18,200 Tax Free Threshold 3D Popmart Vinyl Figure"
                className="relative w-36 h-36 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
                loading="lazy"
                width={144}
                height={144}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tool */}
      <TeenTaxCalculator />

      {/* 15yo First Tax Return Walkthrough */}
      <FirstTaxReturnGuide />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">$18,200 Tax-Free</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The first $18,200 is 100% tax-free. With LITO, you pay $0 net income tax on earnings up to $22,866!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Stage 3 Brackets</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            15% from $18,201 to $45k, 30% to $135k, 37% to $190k, and 45% above. You only pay the higher rate on dollars inside each tier.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Medicare & Surcharge</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            2.0% standard levy with full exemption up to $28,011. Earners over $105k without hospital cover pay 1.0%–1.5% MLS.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">myTax Lodgement</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Lodge free online between July 1 and October 31 via myGov to claim work deductions & get your tax refund!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Tax & Tax Returns?" />
      </div>

      <ModulePrevNext currentId="tax-guide" />
      <PrintShareFAB />
    </div>
  );
}

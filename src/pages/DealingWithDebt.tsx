import { motion } from 'motion/react';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { BNPLDebtTrapVisualizer } from '@/calculators/teen-debt/BNPLDebtTrapVisualizer';
import { Flame, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';

export function DealingWithDebt() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'dealing-with-debt')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/20 via-red-500/10 to-primary/20 p-6 sm:p-10 border border-rose-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">{moduleData.emoji}</span>
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
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative group"
            >
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
              <SmartImage
                src="/assets/graphics/popmart_debt.jpg"
                alt="Debt Smasher Superhero 3D Popmart Toy"
                className="relative w-36 h-36 rounded-2xl object-cover border-2 border-rose-500/40 shadow-xl"
                loading="lazy"
                width={144}
                height={144}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Interactive Tool */}
      <BNPLDebtTrapVisualizer />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">BNPL & Late Fees</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Afterpay and Zip split payments but charge steep late fees ($10–$15/wk) if you miss a payment date.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Credit Score (0-1200)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your credit rating tracks your repayment reliability. Defaults stay on your record for 5 years!
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Payday Loans Warning</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Payday loans charge setup & monthly fees equaling over 400% interest rates. Avoid at all costs!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Dealing with Debt?" />
      </div>
    </div>
  );
}

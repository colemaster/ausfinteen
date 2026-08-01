import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenSuperCalculator } from '@/calculators/teen-super/TeenSuperCalculator';
import { Star, ShieldAlert, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SuperRetirement() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'super-retirement')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-primary/20 p-6 sm:p-10 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="warning" className="text-xs font-bold uppercase tracking-wider">
            Module 3 • Superannuation Guide
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
      <TeenSuperCalculator />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">12% Employer Super</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your employer pays 12% on top of your wage into your super fund to invest for your future.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Under 18 30-Hour Rule</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Under 18 workers receive super in any calendar week where they work MORE than 30 hours.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Super Stapling</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your super fund stays stapled to you when changing jobs—stopping multiple account fees!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Super & Retirement?" />
    </div>
  );
}

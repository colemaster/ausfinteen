import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { MoneyMindsetQuiz } from '@/components/shared/MoneyMindsetQuiz';
import { Badge } from '@/components/ui/Badge';

export function MoneyAndYou() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'money-and-you')!;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-primary/20 p-6 sm:p-10 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="warning" className="text-xs font-bold uppercase tracking-wider">
            Module 1 • Money Psychology & Identity
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Build a healthy money mindset, protect your mental health with an emergency Mojo buffer, set up your myGov digital identity, and know your ACCC consumer rights.
        </p>
      </div>

      {/* Interactive Money Mindset Quiz */}
      <MoneyMindsetQuiz />

      {/* Topic Accordion */}
      <TopicGuideAccordion topics={moduleData.topics} title="Money & You Q&A Library" />
    </div>
  );
}

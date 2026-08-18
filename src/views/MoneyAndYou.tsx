import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { FifteenYearOldRoadmap } from '@/components/teen/FifteenYearOldRoadmap';
import { MoneyMindsetQuiz } from '@/components/shared/MoneyMindsetQuiz';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { Badge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { usePageTitle } from '@/hooks/usePageTitle';

export function MoneyAndYou() {
  usePageTitle('Money & You · Mindset & Identity');
  const moduleData = MANDY_MODULES.find(m => m.id === 'money-and-you')!;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-primary/20 p-6 sm:p-10 border border-amber-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">{moduleData.emoji}</span>
              <Badge variant="warning" className="text-xs font-bold uppercase tracking-wider">
                Module 1 • Money Psychology & Identity
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {moduleData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Build a healthy money mindset, protect your mental health with an emergency Mojo buffer, set up your myGov digital identity, and know your ACCC consumer rights.
            </p>
          </div>
          <div className="md:col-span-4 hidden md:flex justify-center">
            <SmartImage
              src="/assets/graphics/popmart_mascot.jpg"
              alt="Issy Koala Star Mascot 3D Popmart Toy"
              className="w-36 h-36 rounded-2xl object-cover border-2 border-amber-500/30 shadow-xl hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={144}
              height={144}
            />
          </div>
        </div>
      </div>

      {/* 15-Year-Old Australian Independence Roadmap */}
      <FifteenYearOldRoadmap />

      {/* Interactive Money Mindset Quiz */}
      <MoneyMindsetQuiz />

      {/* Topic Accordion */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="Money & You Q&A Library" />
      </div>

      <ModulePrevNext currentId="money-and-you" />
    </div>
  );
}

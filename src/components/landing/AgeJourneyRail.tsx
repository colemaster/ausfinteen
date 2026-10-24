import type { ComponentType } from 'react';
import { ArrowRight, Briefcase, Car, Check, GraduationCap, Sparkles, Wallet } from 'lucide-react';
import { Link } from '@/lib/router';
import { sound } from '@/lib/sound-synthesizer';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { cn } from '@/lib/utils';

interface AgeJourneyStep {
  age: number;
  title: string;
  emoji: string;
  Icon: ComponentType<{ className?: string }>;
  hourlyRate: string;
  milestones: [string, string];
  tag: string;
  href: string;
}

const AGE_JOURNEY_STEPS: AgeJourneyStep[] = [
  {
    age: 15,
    title: '15yo First Job & TFN',
    emoji: '🍔',
    Icon: Briefcase,
    hourlyRate: '13.90',
    milestones: ['First casual shifts (~8 hrs/wk)', 'Build a $500 Mojo buffer in 5.80% HISA'],
    tag: '100% Tax-Free',
    href: '/teen-budgeting?age=15',
  },
  {
    age: 16,
    title: '16yo Ls & 25% Pay Rise',
    emoji: '🛒',
    Icon: Car,
    hourlyRate: '17.39',
    milestones: ['Learner licence prep + 100 logbook hrs', 'First-car savings goal ($3,500 target)'],
    tag: '+25% Award Rate',
    href: '/teen-budgeting?age=16',
  },
  {
    age: 17,
    title: '17yo Senior Shifts',
    emoji: '☕',
    Icon: Wallet,
    hourlyRate: '20.86',
    milestones: ['Senior rostered shifts (~15 hrs/wk)', 'Rego, CTP & green P-plate fund'],
    tag: 'Senior Casual',
    href: '/teen-budgeting?age=17',
  },
  {
    age: 18,
    title: '18yo Adult Super & Rates',
    emoji: '🎓',
    Icon: GraduationCap,
    hourlyRate: '24.34',
    milestones: ['Adult wage rates on every roster', '12% Super Guarantee paid on every dollar'],
    tag: '12% SG Paid',
    href: '/teen-budgeting?age=18',
  },
];

export function AgeJourneyRail() {
  const { profile, applyAgePreset } = useTeenProfile();

  return (
    <section aria-label="Teen money journey by age" className="relative space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            Milestone Architecture
          </span>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Your Money Timeline: Age 15 → 18
          </h2>
        </div>
        <span className="hidden sm:inline-block font-mono text-xs text-muted-foreground">
          Click any card to personalize calculations
        </span>
      </div>

      <div
        role="list"
        className="reveal-stagger -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {AGE_JOURNEY_STEPS.map((step) => {
          const isActive = profile.age === step.age;
          const { Icon } = step;

          return (
            <div key={step.age} role="listitem" className="shrink-0 snap-start">
              <Link
                to={step.href}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => {
                  sound.playClick();
                  applyAgePreset(step.age);
                }}
                className={cn(
                  'group relative flex h-full w-64 flex-col justify-between rounded-2xl border p-4.5 transition-all duration-300 backdrop-blur-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  'sm:w-full',
                  isActive
                    ? 'border-primary bg-gradient-to-b from-primary/15 via-card to-card shadow-xl shadow-primary/15 ring-1 ring-primary/40 -translate-y-1'
                    : 'border-border/80 bg-card/70 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-primary/10',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span aria-hidden="true" className="text-3xl leading-none">
                      {step.emoji}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm">
                        <Check className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
                        Active Preset
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                        <Icon className="h-3 w-3" aria-hidden="true" />
                        {step.age}yo
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-base font-extrabold text-foreground transition-colors group-hover:text-primary">
                    {step.title}
                  </h3>

                  <div className="mt-1 flex items-baseline gap-1 font-mono text-xs text-muted-foreground">
                    <span className="text-lg font-extrabold text-primary">${step.hourlyRate}</span>
                    <span>/hr Fast Food junior casual</span>
                  </div>

                  <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-2.5">
                    {step.milestones.map((milestone) => (
                      <li
                        key={milestone}
                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-border/50 pt-2 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary">
                    {step.tag}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>Explore {step.age}yo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

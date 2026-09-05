import type { ComponentType } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Briefcase, Car, Check, GraduationCap, Wallet } from 'lucide-react';
import { Link } from '@/lib/router';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { sound } from '@/lib/sound-synthesizer';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { cn } from '@/lib/utils';

interface AgeJourneyStep {
  age: number;
  title: string;
  emoji: string;
  Icon: ComponentType<{ className?: string }>;
  /** Fast Food junior casual hourly rate (base + 25% casual loading). */
  hourlyRate: string;
  milestones: [string, string];
  href: string;
}

const AGE_JOURNEY_STEPS: AgeJourneyStep[] = [
  {
    age: 15,
    title: '15yo First Job',
    emoji: '🍔',
    Icon: Briefcase,
    hourlyRate: '13.90',
    milestones: ['First casual shifts (~8 hrs/wk)', 'Start a $500 safety buffer'],
    href: '/teen-budgeting?age=15',
  },
  {
    age: 16,
    title: '16yo Ls & Pay Rise',
    emoji: '🛒',
    Icon: Car,
    hourlyRate: '17.39',
    milestones: ['Learner licence + more hours (~12 hrs/wk)', 'First-car deposit goal ($3,500)'],
    href: '/teen-budgeting?age=16',
  },
  {
    age: 17,
    title: '17yo Senior Hustle',
    emoji: '☕',
    Icon: Wallet,
    hourlyRate: '20.86',
    milestones: ['Senior shifts with responsibility (~15 hrs/wk)', 'Rego, CTP & insurance sinking fund'],
    href: '/teen-budgeting?age=17',
  },
  {
    age: 18,
    title: '18yo Adult Rates',
    emoji: '🎓',
    Icon: GraduationCap,
    hourlyRate: '24.34',
    milestones: ['Adult pay rates kick in (~20 hrs/wk)', 'Super guarantee paid on every shift'],
    href: '/teen-budgeting?age=18',
  },
];

/**
 * AgeJourneyRail — horizontal scroll-snap rail of the four teen age presets.
 *
 * Clicking a card applies the matching preset via `applyAgePreset(age)` (plus
 * a tactile `sound.playClick()`) and deep-links to the teen budgeting guide
 * with a shareable `?age=` param. The card matching `profile.age` renders in
 * its active state.
 *
 * Motion: `staggerContainer` + `fadeInUp` scroll-triggered entrance, skipped
 * when the user prefers reduced motion. Mobile-first: 240px snap cards with
 * a trailing peek at 375px viewport width.
 */
export function AgeJourneyRail() {
  const { profile, applyAgePreset } = useTeenProfile();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section aria-label="Teen money journey by age">
      <motion.div
        variants={staggerContainer}
        initial={reducedMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        role="list"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {AGE_JOURNEY_STEPS.map(step => {
          const isActive = profile.age === step.age;
          const { Icon } = step;
          return (
            <motion.div key={step.age} variants={fadeInUp} role="listitem" className="shrink-0 snap-start">
              <Link
                to={step.href}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => {
                  sound.playClick();
                  applyAgePreset(step.age);
                }}
                className={cn(
                  'group flex h-full w-60 flex-col rounded-2xl border bg-card p-4 transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  'sm:w-full',
                  isActive
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span aria-hidden="true" className="text-2xl leading-none">
                    {step.emoji}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {step.age}yo
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  <span className="text-base font-bold text-primary">${step.hourlyRate}</span>/hr{' '}
                  <span className="font-sans">Fast Food junior casual</span>
                </p>

                <ul className="mt-2 space-y-1.5">
                  {step.milestones.map(milestone => (
                    <li
                      key={milestone}
                      className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-3 inline-flex items-center gap-1 pt-1 text-[11px] font-bold text-primary opacity-80 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                  Open my {step.age}yo budget
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

import { useMemo, useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Car,
  GraduationCap,
  PiggyBank,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from '@/lib/router';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { cn } from '@/lib/utils';

/** Q1 — teen age band. `18+` maps to the age-18 preset. */
type AgeOption = 15 | 16 | 17 | 18;
type GoalId = 'first-job' | 'license-car' | 'uni' | 'saving' | 'investing' | 'scams';
type SituationId = 'at-school' | 'working' | 'both';

interface OptionDef<T extends string | number> {
  value: T;
  label: string;
  hint: string;
  Icon: ComponentType<{ className?: string }>;
}

const AGE_OPTIONS: readonly OptionDef<AgeOption>[] = [
  { value: 15, label: '15', hint: 'First shifts', Icon: Sparkles },
  { value: 16, label: '16', hint: 'Ls + pay rise', Icon: Car },
  { value: 17, label: '17', hint: 'Senior hustle', Icon: Briefcase },
  { value: 18, label: '18+', hint: 'Adult rates', Icon: GraduationCap },
];

const GOAL_OPTIONS: readonly OptionDef<GoalId>[] = [
  { value: 'first-job', label: 'First job', hint: 'TFN, pay, payslips', Icon: Briefcase },
  { value: 'license-car', label: 'Licence + car', hint: 'PrepL, Ls, costs', Icon: Car },
  { value: 'uni', label: 'Uni path', hint: 'HECS, QTAC, unis', Icon: GraduationCap },
  { value: 'saving', label: 'Saving', hint: 'HISA, Mojo buffer', Icon: PiggyBank },
  { value: 'investing', label: 'Investing', hint: 'ETFs, compounding', Icon: TrendingUp },
  { value: 'scams', label: 'Avoid scams', hint: 'Jobs, SMS, tasks', Icon: ShieldAlert },
];

const SITUATION_OPTIONS: readonly OptionDef<SituationId>[] = [
  { value: 'at-school', label: 'At school', hint: 'Study first', Icon: GraduationCap },
  { value: 'working', label: 'Working', hint: 'Earning shifts', Icon: Briefcase },
  { value: 'both', label: 'Both', hint: 'School + shifts', Icon: Sparkles },
];

const STEP_LABELS = ['Age', 'Goal', 'Situation'] as const;
const RESULT_STEP = 3;

interface Decision {
  moduleId: string;
  reason: string;
}

/**
 * Small goal × situation decision map. `moduleId` is resolved against
 * `MANDY_MODULES` at render time so routes/titles always stay in sync
 * with the source of truth — never hardcoded here.
 */
const GOAL_DECISIONS: Record<GoalId, Decision> = {
  'first-job': {
    moduleId: 'careers-employment',
    reason: 'Sort your TFN, junior pay rates and first payslip before day one.',
  },
  'license-car': {
    moduleId: 'car-driving',
    reason: 'Nail PrepL and your Ls, then budget the real $5k+/yr cost of a first car.',
  },
  uni: {
    moduleId: 'brisbane-qld',
    reason: 'Compare SEQ unis, HECS-HELP bands and QTAC dates before you apply.',
  },
  saving: {
    moduleId: 'spending-saving',
    reason: 'Grow a $500 Mojo buffer in a 5%+ youth HISA with zero fees.',
  },
  investing: {
    moduleId: 'investing-shares',
    reason: 'Start with low-cost index ETFs and let compounding do the heavy lifting.',
  },
  scams: {
    moduleId: 'money-and-you',
    reason: 'Spot job, task and SMS scams before they touch your pay.',
  },
};

/** Situation tweaks: earners get paycheck-splitting guidance instead. */
function resolveDecision(goal: GoalId, situation: SituationId, age: AgeOption): Decision {
  if (goal === 'saving' && situation !== 'at-school') {
    return {
      moduleId: 'teen-budgeting',
      reason: 'Split every paycheck into Blow / Mojo / Grow automatically on payday.',
    };
  }
  if (goal === 'investing') {
    return {
      moduleId: 'investing-shares',
      reason:
        age >= 18
          ? 'Open your own CHESS-sponsored account and start a low-cost ETF portfolio.'
          : 'Start via a parent-run minor trust in growth ETFs — compounding starts now.',
    };
  }
  if (goal === 'first-job' && situation === 'working') {
    return {
      moduleId: 'careers-employment',
      reason: 'Check your penalty rates, 3-hour minimums and payslip line by line.',
    };
  }
  return GOAL_DECISIONS[goal];
}

function OptionGrid<T extends string | number>({
  options,
  selected,
  onSelect,
  labelledBy,
  columns = 'grid-cols-2',
}: {
  options: readonly OptionDef<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  labelledBy: string;
  columns?: string;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className={cn('grid gap-2', columns)}>
      {options.map(({ value, label, hint, Icon }) => {
        const active = selected === value;
        return (
          <button
            key={String(value)}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(value)}
            className={cn(
              'flex min-w-0 flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              active
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
            )}
          >
            <span className="flex w-full items-center gap-2">
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
              <span className="truncate text-sm font-bold text-foreground">{label}</span>
            </span>
            <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * StartHereQuiz — 3-question pathfinder (age → goal → situation).
 *
 * Q1 applies the matching teen preset via `applyAgePreset` so the rest of
 * the page personalises instantly; the result card (route + reason) is
 * resolved from `MANDY_MODULES` through a small goal × situation map.
 */
export function StartHereQuiz() {
  const { applyAgePreset } = useTeenProfile();
  const reducedMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<AgeOption | null>(null);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [situation, setSituation] = useState<SituationId | null>(null);

  const recommendation = useMemo(() => {
    if (age === null || goal === null || situation === null) return null;
    const decision = resolveDecision(goal, situation, age);
    const module = MANDY_MODULES.find(m => m.id === decision.moduleId) ?? MANDY_MODULES[0];
    if (!module) return null;
    return { module, reason: decision.reason };
  }, [age, goal, situation]);

  const canContinue = step === 0 ? age !== null : step === 1 ? goal !== null : situation !== null;

  const handleRetake = () => {
    setStep(0);
    setAge(null);
    setGoal(null);
    setSituation(null);
  };

  const stepHeadingId = `start-here-step-${step}-heading`;

  return (
    <section aria-label="Find your starting path" className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {/* Progress dots */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Start here · {step < RESULT_STEP ? `Step ${step + 1} of 3` : 'Your path'}
          </p>
          <div className="flex items-center gap-1.5" role="list" aria-label="Quiz progress">
            {STEP_LABELS.map((label, i) => {
              const done = step > i || step === RESULT_STEP;
              const current = step === i;
              return (
                <span
                  key={label}
                  role="listitem"
                  aria-label={`${label}: ${done ? 'complete' : current ? 'current' : 'upcoming'}`}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    done ? 'w-6 bg-primary' : current ? 'w-6 bg-primary/50' : 'w-2 bg-muted',
                  )}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {step === 0 && (
              <div className="mt-4">
                <h3 id={stepHeadingId} className="text-base font-extrabold text-foreground">
                  How old are you?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  We tune pay rates, licence steps and super rules to your age.
                </p>
                <div className="mt-3">
                  <OptionGrid
                    options={AGE_OPTIONS}
                    selected={age}
                    labelledBy={stepHeadingId}
                    columns="grid-cols-2 sm:grid-cols-4"
                    onSelect={value => {
                      setAge(value);
                      applyAgePreset(value);
                      setStep(1);
                    }}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-4">
                <h3 id={stepHeadingId} className="text-base font-extrabold text-foreground">
                  What&apos;s your #1 money goal?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Pick the one that matters most right now.</p>
                <div className="mt-3">
                  <OptionGrid
                    options={GOAL_OPTIONS}
                    selected={goal}
                    labelledBy={stepHeadingId}
                    onSelect={value => {
                      setGoal(value);
                      setStep(2);
                    }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-4">
                <h3 id={stepHeadingId} className="text-base font-extrabold text-foreground">
                  What&apos;s your situation?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">We&apos;ll shape the advice around your week.</p>
                <div className="mt-3">
                  <OptionGrid
                    options={SITUATION_OPTIONS}
                    selected={situation}
                    labelledBy={stepHeadingId}
                    columns="grid-cols-3"
                    onSelect={value => {
                      setSituation(value);
                      setStep(RESULT_STEP);
                    }}
                  />
                </div>
              </div>
            )}

            {step === RESULT_STEP && recommendation && (
              <div className="mt-4" aria-live="polite">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Recommended for you</p>
                <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                    <span aria-hidden="true">{recommendation.module.emoji}</span>
                    {recommendation.module.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">{recommendation.reason}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {recommendation.module.description}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={recommendation.module.route}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      Start my path
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        {step < RESULT_STEP && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(s => Math.min(RESULT_STEP, s + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

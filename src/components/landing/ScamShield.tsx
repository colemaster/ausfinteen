import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Home,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { CelebrationRing } from '@/components/ui/CelebrationRing';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface QuizOption {
  id: string;
  label: string;
}

interface QuizQuestion {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  threatBadge: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  scenario: string;
  prompt: string;
  options: readonly [QuizOption, QuizOption, QuizOption];
  safeIndex: 0 | 1 | 2;
  whySafe: string;
  redFlag: string;
  statutoryNotice: string;
}

/**
 * Five red-flag scenarios, updated for 2026-27 youth threat intelligence.
 * Exactly one option per question is the safe response.
 */
const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'easy-cash-job',
    icon: Briefcase,
    eyebrow: 'The “Easy Cash” Job',
    threatBadge: 'Money Muling Offence',
    severity: 'CRITICAL',
    scenario:
      'A stranger on Instagram, TikTok or Snapchat offers you $400 a week to “receive payments and forward them on”. No interview, no ABN, just your bank details and fast transfers.',
    prompt: 'What do you do?',
    options: [
      { id: 'mule-yes', label: 'Share your account details — easy money for ten minutes’ work.' },
      { id: 'mule-fee', label: 'Ask them to pay you first, then you’ll forward the rest.' },
      { id: 'mule-safe', label: 'Say no, cut contact, and report the approach to your bank and Scamwatch.' },
    ],
    safeIndex: 2,
    whySafe:
      'This is money muling: letting criminals wash stolen funds through your account. It is a criminal money-laundering offence under the Criminal Code Act 1995 that leads to frozen accounts, bank blacklisting, and a criminal record.',
    redFlag: 'Red flags: unsolicited social DM, no formal interview, paid merely to receive and transfer funds.',
    statutoryNotice: 'Criminal Code Act 1995 s 400.9 · AFP & AUSTRAC Monitored',
  },
  {
    id: 'task-scam',
    icon: ClipboardList,
    eyebrow: 'The Task-Scam Deposit',
    threatBadge: 'Advance-Fee Task Trap',
    severity: 'HIGH',
    scenario:
      'A “marketing agency” recruited on WhatsApp or Telegram promises $150/day for liking videos and rating apps — but first you must deposit $99 to “unlock withdrawals and VIP tasks”.',
    prompt: 'What do you do?',
    options: [
      { id: 'task-pay', label: 'Pay the $99 — it’s a small entrance fee for big daily earnings.' },
      { id: 'task-safe', label: 'Walk away immediately. Legitimate employers never charge you money to get paid.' },
      { id: 'task-bigger', label: 'Pay extra to unlock the “VIP tier” with even higher promised returns.' },
    ],
    safeIndex: 1,
    whySafe:
      'Fake job scams dangle small early bait balances, then demand upfront deposits in crypto or PayID to unlock earnings. The job never existed — all deposits go straight to scammers’ overseas wallets.',
    redFlag: 'Red flags: recruited on encrypted chats, demands upfront deposits, tasks resemble automated busywork.',
    statutoryNotice: 'Scamwatch / NASC Priority Threat Notice #402',
  },
  {
    id: 'romance-crypto',
    icon: MessageSquare,
    eyebrow: 'The Deepfake Romance',
    threatBadge: 'AI Deepfake & Crypto DM',
    severity: 'HIGH',
    scenario:
      'A match on a dating app quickly moves to WhatsApp. They send an AI-generated video message to prove they are real, then offer an exclusive insider tip on a high-yield crypto platform.',
    prompt: 'What do you do?',
    options: [
      { id: 'romance-invest', label: 'Start with a small $50 crypto transfer to test if the platform works.' },
      { id: 'romance-safe', label: 'Block and report. Never accept financial advice or send crypto to anyone met online.' },
      { id: 'romance-meet', label: 'Insist on meeting in person before sending any cryptocurrency.' },
    ],
    safeIndex: 1,
    whySafe:
      'Catfishing combined with fake crypto dashboards is one of the highest-loss scams in Australia. In 2026, generative AI video clones are used to fake identity. No regulated Aussie broker operates via WhatsApp DMs.',
    redFlag: 'Red flags: moves communication off-app fast, claims guaranteed crypto yield, uses pre-recorded video snippets.',
    statutoryNotice: 'ASIC Warning · Unlicensed Offshore Dealing',
  },
  {
    id: 'rental-fee',
    icon: Home,
    eyebrow: 'The Upfront Rental Fee',
    threatBadge: 'Sight-Unseen Rental Fraud',
    severity: 'CRITICAL',
    scenario:
      'A cheap inner-city student apartment demands a $600 “holding deposit” via instant transfer before any physical inspection. The “agent” claims high competition and promises bond forms later.',
    prompt: 'What do you do?',
    options: [
      { id: 'rent-pay', label: 'Transfer the $600 deposit now to lock down the bargain before others.' },
      { id: 'rent-cash', label: 'Offer cash on the day and skip the paperwork to move in faster.' },
      { id: 'rent-safe', label: 'Refuse to pay without an in-person inspection, and verify that bond is lodged with the state authority (RTA).' },
    ],
    safeIndex: 2,
    whySafe:
      'In Queensland, tenancy bonds must legally be lodged directly with the Residential Tenancies Authority (RTA) — never paid into a landlord’s personal account sight-unseen. High artificial urgency plus private wire equals rental fraud.',
    redFlag: 'Red flags: no physical inspection, below-market rent, pressure tactics, bond directed to personal account.',
    statutoryNotice: 'Residential Tenancies and Rooming Accommodation Act 2008 (Qld)',
  },
  {
    id: 'lend-account',
    icon: Users,
    eyebrow: '“Borrow My Account?”',
    threatBadge: 'PayID Account Exploitation',
    severity: 'CRITICAL',
    scenario:
      'A friend or classmate asks to “borrow” your bank account: “My pay needs somewhere to land — I’ll shout you $50. If PayID shows a name mismatch, just ignore the warning.”',
    prompt: 'What do you do?',
    options: [
      { id: 'mate-yes', label: 'Say yes — it’s just a friend, and an extra $50 helps with weekend expenses.' },
      { id: 'mate-ignore', label: 'Agree, but ask them to make sure the bank transfer description looks normal.' },
      { id: 'mate-safe', label: 'Say no, keep strict personal custody of your account, and never override PayID confirmation warnings.' },
    ],
    safeIndex: 2,
    whySafe:
      'Lending your bank account — even to a trusted friend — makes you legally liable for proceeds of crime under Australia’s AML/CTF laws. Confirmation of Payee exists precisely to flag stolen account routes. Banks will blacklist both accounts.',
    redFlag: 'Red flags: third-party payment through your account, offer of a cut, advising you to ignore PayID warnings.',
    statutoryNotice: 'Anti-Money Laundering & Counter-Terrorism Financing Act 2006',
  },
] as const;

type Tier = 'At risk' | 'Sharp' | 'Scam-proof';

function tierForScore(score: number): { tier: Tier; blurb: string } {
  if (score >= 5) {
    return {
      tier: 'Scam-proof',
      blurb: 'Flawless 5/5! You identified every predatory pattern — including money-mule and advance-fee traps.',
    };
  }
  if (score >= 3) {
    return {
      tier: 'Sharp',
      blurb: 'Strong security awareness. Review the missed scenarios — scammers only need one vulnerability to exploit.',
    };
  }
  return {
    tier: 'At risk',
    blurb: 'High risk of social media exploitation. Reset the quiz, review the statutory red flags, and lock in the safe moves.',
  };
}

export interface ScamShieldProps {
  className?: string;
}

export function ScamShield({ className }: ScamShieldProps) {
  const reducedMotion = useReducedMotionSafe();
  const [answers, setAnswers] = useState<Readonly<Record<string, number>>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const answeredCount = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const score = QUESTIONS.filter((q) => answers[q.id] === q.safeIndex).length;
  const allDone = answeredCount === QUESTIONS.length;
  const { tier, blurb } = tierForScore(score);
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const triggerCelebration = useCallback((fullCelebration: boolean) => {
    if (reducedMotion) return;

    if (fullCelebration) {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'],
      });
      sound.playGoalCelebration?.();
    } else {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
      sound.playSuccess();
    }
  }, [reducedMotion]);

  function handleSelect(questionId: string, optionIndex: number): void {
    if (answers[questionId] !== undefined) return;

    const question = QUESTIONS.find((q) => q.id === questionId);
    const isCorrect = question?.safeIndex === optionIndex;

    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));

    if (isCorrect) {
      const isLastQuestion = answeredCount + 1 === QUESTIONS.length;
      triggerCelebration(isLastQuestion && score + 1 === QUESTIONS.length);
    } else {
      sound.playClick();
    }

    if (answeredCount + 1 === QUESTIONS.length) {
      setShowResult(true);
    }
  }

  function handleReset(): void {
    sound.playClick();
    setAnswers({});
    setShowResult(false);
  }

  return (
    <section
      aria-labelledby="scam-shield-heading"
      className={cn(
        'reveal-up relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-5 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-rose-500/20 dark:shadow-[0_0_50px_-15px_rgba(244,63,94,0.12)]',
        className,
      )}
    >
      {/* Decorative cybernetic glow meshes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
      />

      {/* Header */}
      <div className="relative mb-5 flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-600 ring-1 ring-rose-500/30 shadow-inner dark:from-rose-500/30 dark:to-orange-500/10 dark:text-rose-400"
        >
          <ShieldAlert className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              <Zap className="h-3 w-3" />
              Youth Cyber Defense
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              2026 Scamwatch Intelligence
            </span>
          </div>
          <h2
            id="scam-shield-heading"
            className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            Can You Spot the Scam?
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Five real-world traps actively targeting 15–24 year-olds across Instagram, TikTok, Snapchat &amp; dating apps. Choose the safe move for each scenario.
          </p>
        </div>
      </div>

      {/* Real-time score & progress bar */}
      <div
        aria-live="polite"
        className="relative mb-6 flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/40 p-3.5 shadow-inner backdrop-blur-sm"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold text-foreground sm:text-sm">
              Shield Defense Score:{' '}
              <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {score}
              </span>
              <span className="text-muted-foreground font-mono"> / {QUESTIONS.length}</span>
            </p>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {answeredCount}/{QUESTIONS.length} Verified
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={answeredCount}
            aria-label="Quiz progress"
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60"
          >
            <div
              style={{ width: `${progressPct}%` }}
              className="bar-fill h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
        </div>
      </div>

      {/* Quiz questions list with 3D tilt reaction */}
      <ol className="space-y-4">
        {QUESTIONS.map((q, qIndex) => {
          const selected = answers[q.id];
          const locked = selected !== undefined;
          const isCorrect = selected === q.safeIndex;
          const Icon = q.icon;

          return (
            <li
              key={q.id}
              className={cn(
                'reveal-up relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:p-5',
                !locked && 'hover:-translate-y-0.5',
                locked
                  ? isCorrect
                    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-md shadow-emerald-500/5 dark:border-emerald-500/30'
                    : 'border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-card to-card shadow-md shadow-rose-500/5 dark:border-rose-500/30'
                  : 'border-border/80 bg-card/70 hover:border-primary/40 hover:bg-card hover:shadow-lg',
              )}
            >
              <fieldset
                role="radiogroup"
                aria-labelledby={`${q.id}-legend`}
                aria-describedby={locked ? `${q.id}-feedback` : undefined}
                className="m-0 border-0 p-0"
              >
                <legend id={`${q.id}-legend`} className="contents">
                  <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Case {qIndex + 1} · {q.eyebrow}
                      </span>
                    </span>

                    {/* Threat Category Badge Pill */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border',
                        q.severity === 'CRITICAL'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      )}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {q.threatBadge}
                    </span>
                  </div>

                  <span className="block text-sm font-medium leading-relaxed text-foreground/90">
                    {q.scenario}
                  </span>
                  <span className="mt-2 block text-sm font-bold text-foreground">
                    {q.prompt}
                  </span>
                </legend>

                {/* Option cards */}
                <div className="mt-3.5 space-y-2.5">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = selected === oIndex;
                    const isSafe = oIndex === q.safeIndex;
                    const inputId = `${q.id}-opt-${oIndex}`;

                    return (
                      <label
                        key={opt.id}
                        htmlFor={inputId}
                        className={cn(
                          'relative flex min-h-[46px] cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs sm:text-sm transition-all duration-200',
                          'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/60',
                          !locked &&
                            'border-border/80 bg-card/60 hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm',
                          locked && isSafe
                            ? 'border-emerald-500 bg-emerald-500/15 font-semibold text-foreground shadow-sm shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-950/50'
                            : locked && isSelected
                              ? 'border-rose-500 bg-rose-500/15 font-semibold text-foreground shadow-sm shadow-rose-500/10 dark:border-rose-400 dark:bg-rose-950/50'
                              : locked && 'opacity-60 cursor-default border-border/40 bg-muted/20',
                        )}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={isSelected}
                          disabled={locked}
                          onChange={() => handleSelect(q.id, oIndex)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-default"
                        />
                        <span className="flex flex-1 items-start justify-between gap-2 leading-snug">
                          <span className="flex-1">{opt.label}</span>
                          {locked && isSafe && (
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              <span className="hidden sm:inline">SAFE</span>
                            </span>
                          )}
                          {locked && isSelected && !isSafe && (
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <XCircle className="h-4 w-4 shrink-0" />
                              <span className="hidden sm:inline">SCAM</span>
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Feedback Reveal Panel */}
              {locked && (
                <div
                  id={`${q.id}-feedback`}
                  role="status"
                  className={cn(
                    'animate-pop-in mt-3.5 overflow-hidden rounded-xl border p-3.5 text-xs sm:text-sm leading-relaxed',
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-100'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-100',
                  )}
                >
                  <div className="flex items-start gap-2 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300">
                          Excellent Instincts — Safe Choice!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-700 dark:text-rose-300">
                          High Danger — Correct Action: “{q.options[q.safeIndex]?.label}”
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-1 pl-6 text-muted-foreground">{q.whySafe}</p>

                  <div className="mt-2.5 flex flex-col gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {q.redFlag}
                    </span>
                    <span className="font-mono text-[10px] opacity-75">
                      {q.statutoryNotice}
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Quiz Finish & Celebration Results Tier */}
      {showResult && allDone && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'animate-scale-in mt-6 overflow-hidden rounded-2xl border p-5 text-center sm:p-6 shadow-xl',
            tier === 'Scam-proof'
              ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-card to-card dark:border-emerald-500/30'
              : tier === 'Sharp'
                ? 'border-sky-500/40 bg-gradient-to-b from-sky-500/15 via-card to-card dark:border-sky-500/30'
                : 'border-rose-500/40 bg-gradient-to-b from-rose-500/15 via-card to-card dark:border-rose-500/30',
          )}
        >
          {tier === 'Scam-proof' ? (
            <div className="flex flex-col items-center gap-2">
              <CelebrationRing
                progress={100}
                size={140}
                colorTheme="emerald"
                label="5 / 5 — Scam-Proof"
                sublabel="Zero Vulnerabilities"
              />
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg mt-1">
                <Sparkles className="h-5 w-5" />
                <span>Certified Scam-Proof Instincts</span>
              </div>
              <p className="max-w-md text-xs sm:text-sm text-muted-foreground">{blurb}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg',
                  tier === 'Sharp' ? 'bg-sky-600' : 'bg-rose-600',
                )}
              >
                <ShieldCheck className="h-7 w-7" />
              </span>
              <p className="font-mono text-sm font-extrabold text-foreground">
                Score: {score} / {QUESTIONS.length} Correct
              </p>
              <p className="text-lg font-extrabold text-foreground">{tier}</p>
              <p className="max-w-md text-xs sm:text-sm text-muted-foreground">{blurb}</p>
            </div>
          )}

          {/* Emergency contacts card */}
          <div className="mx-auto mt-4 max-w-lg rounded-xl border border-border/80 bg-muted/30 p-3.5 text-left text-xs leading-relaxed text-muted-foreground">
            <span className="block font-bold text-foreground mb-1">
              🚨 If You Suspect an Approach or Shared Details:
            </span>
            Call your bank fraud line immediately to freeze compromised accounts, report the approach to{' '}
            <strong className="text-foreground">Scamwatch (scamwatch.gov.au)</strong>, and contact{' '}
            <strong className="text-foreground">IDCARE on 1800 595 160</strong> for free Australian identity theft triage.
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Scam Defense Quiz</span>
          </button>
        </div>
      )}

      <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
        Current as at September 2026 · Sourced from Scamwatch &amp; National Anti-Scam Centre (NASC) · General educational simulation
      </p>
    </section>
  );
}

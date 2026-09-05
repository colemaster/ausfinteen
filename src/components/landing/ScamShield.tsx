import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
  Users,
  XCircle,
} from 'lucide-react';
import { CelebrationRing } from '@/components/ui/CelebrationRing';
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
  scenario: string;
  prompt: string;
  options: readonly [QuizOption, QuizOption, QuizOption];
  safeIndex: 0 | 1 | 2;
  whySafe: string;
  redFlag: string;
}

/**
 * Five red-flag scenarios, current as at September 2026.
 * Exactly one option per question is the safe response.
 */
const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'easy-cash-job',
    icon: Briefcase,
    eyebrow: 'The “easy cash” job',
    scenario:
      'A stranger on social media offers you $400 a week to “receive payments and forward them on”. No interview, no ABN, just your bank details and fast transfers.',
    prompt: 'What do you do?',
    options: [
      { id: 'mule-yes', label: 'Share your account details — easy money for ten minutes’ work.' },
      { id: 'mule-fee', label: 'Ask them to pay you first, then you’ll forward the rest.' },
      { id: 'mule-safe', label: 'Say no, cut contact, and report the approach to your bank and Scamwatch.' },
    ],
    safeIndex: 2,
    whySafe:
      'This is money muling: letting criminals wash stolen funds through your account. It is a money-laundering offence that can mean a criminal record, frozen funds and your bank closing your account.',
    redFlag: 'Red flags: unsolicited “job”, no interview, paid to use your own bank account.',
  },
  {
    id: 'task-scam',
    icon: ClipboardList,
    eyebrow: 'The task-scam deposit',
    scenario:
      'A “marketing agency” found on WhatsApp promises $150 a day for liking videos and rating products — but first you must deposit $99 to “unlock withdrawals”.',
    prompt: 'What do you do?',
    options: [
      { id: 'task-pay', label: 'Pay the $99 — it’s a small entrance fee for big daily earnings.' },
      { id: 'task-safe', label: 'Walk away. Real employers never ask you to pay to get paid.' },
      { id: 'task-bigger', label: 'Pay extra to unlock the “VIP tier” with even higher returns.' },
    ],
    safeIndex: 1,
    whySafe:
      'Task scams dangle small early payouts, then demand deposits, “top-ups” or crypto to keep earning. The job never existed — deposits go straight to scammers and fake dashboards show fantasy balances.',
    redFlag: 'Red flags: recruited on WhatsApp/Telegram, pay-to-earn, crypto top-ups, too-good daily returns.',
  },
  {
    id: 'mygov-sms',
    icon: MessageSquare,
    eyebrow: 'The fake myGov SMS',
    scenario:
      'SMS: “myGov: you have a $1,240 refund pending. Verify within 24h: mygov-refunds-au.link/login”. The link looks almost official and threatens to cancel your refund.',
    prompt: 'What do you do?',
    options: [
      { id: 'sms-tap', label: 'Tap the link and log in quickly before the refund expires.' },
      { id: 'sms-safe', label: 'Don’t tap. Open the myGov app or type my.gov.au yourself to check.' },
      { id: 'sms-reply', label: 'Reply “YES” then call back the number in the message.' },
    ],
    safeIndex: 1,
    whySafe:
      'myGov never sends links asking you to log in by SMS, and agencies never pressure you with 24-hour threats. Always navigate to myGov yourself; forward the scam SMS to the ATO on 0477 862 636 and report it to Scamwatch.',
    redFlag: 'Red flags: link in SMS, urgency/threats, lookalike domain, refund you never claimed.',
  },
  {
    id: 'rental-fee',
    icon: Home,
    eyebrow: 'The upfront-fee rental',
    scenario:
      'A cheap inner-city listing demands a $600 “holding deposit” by bank transfer before any inspection. The “agent” says ten others want it and bond paperwork comes later.',
    prompt: 'What do you do?',
    options: [
      { id: 'rent-pay', label: 'Transfer the deposit now to secure it — bargains go fast.' },
      { id: 'rent-cash', label: 'Offer cash on the day and skip the paperwork to move faster.' },
      { id: 'rent-safe', label: 'Refuse to pay before inspecting; verify the agent and that bond goes to the state bond authority.' },
    ],
    safeIndex: 2,
    whySafe:
      'Legitimate rentals let you inspect first and lodge bond with your state bond authority (e.g. RTA, NSW Fair Trading, Consumer Affairs Victoria) — never into a private account sight unseen. Pressure plus upfront transfer equals a rental scam.',
    redFlag: 'Red flags: no inspection, below-market rent, pressure, bond to a personal account.',
  },
  {
    id: 'lend-account',
    icon: Users,
    eyebrow: '“Borrow my account?”',
    scenario:
      'A mate asks to “borrow” your bank account for a weekend: “My pay needs somewhere to land — I’ll shout you $50. Also, can you confirm the PayID name? Just ignore it.”',
    prompt: 'What do you do?',
    options: [
      { id: 'mate-yes', label: 'Say yes — it’s just a mate, and $50 is $50.' },
      { id: 'mate-ignore', label: 'Say yes but tell them to use a different name on the transfer.' },
      { id: 'mate-safe', label: 'Say no, keep control of your account, and check every PayID name before paying.' },
    ],
    safeIndex: 2,
    whySafe:
      'Lending your account — even to a friend — is still money muling, with the same criminal and account-closure consequences. PayID’s confirmation-of-payee name check exists to catch mismatches: if the displayed name doesn’t match who you expect, stop and verify another way.',
    redFlag: 'Red flags: “just borrow your account”, a cut for doing nothing, “ignore the name mismatch”.',
  },
] as const;

type Tier = 'At risk' | 'Sharp' | 'Scam-proof';

function tierForScore(score: number): { tier: Tier; blurb: string } {
  if (score >= 5) {
    return {
      tier: 'Scam-proof',
      blurb: 'Perfect 5/5. You spotted every red flag — including the money-mule trap.',
    };
  }
  if (score >= 3) {
    return {
      tier: 'Sharp',
      blurb: 'Solid instincts. Review the ones you missed — scammers only need one “yes”.',
    };
  }
  return {
    tier: 'At risk',
    blurb: 'Scammers would love your kindness. Replay the quiz and lock in the safe moves.',
  };
}

export interface ScamShieldProps {
  className?: string;
}

/**
 * ScamShield — interactive 5-question scam red-flag quiz.
 *
 * Keyboard access uses native radio inputs inside a `radiogroup` per
 * question; selection locks the question and reveals instant feedback.
 * Facts current as at September 2026 (Scamwatch / NASC guidance).
 */
export function ScamShield({ className }: ScamShieldProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [answers, setAnswers] = useState<Readonly<Record<string, number>>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const answeredCount = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const score = QUESTIONS.filter((q) => answers[q.id] === q.safeIndex).length;
  const allDone = answeredCount === QUESTIONS.length;
  const { tier, blurb } = tierForScore(score);
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  function handleSelect(questionId: string, optionIndex: number): void {
    if (answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (answeredCount + 1 === QUESTIONS.length) {
      setShowResult(true);
    }
  }

  function handleReset(): void {
    setAnswers({});
    setShowResult(false);
  }

  const entrance = reducedMotion
    ? { opacity: 1, y: 0 }
    : undefined;

  return (
    <motion.section
      aria-labelledby="scam-shield-heading"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={entrance ?? { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6',
        'dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white dark:bg-rose-500"
        >
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Scam shield quiz
          </p>
          <h2
            id="scam-shield-heading"
            className="mt-0.5 text-xl font-bold leading-tight text-slate-900 sm:text-2xl dark:text-white"
          >
            Can you spot the scam?
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Five real-world traps. Pick the safe move each time — facts current as at September 2026.
          </p>
        </div>
      </div>

      {/* Running score + progress */}
      <div
        aria-live="polite"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950"
      >
        <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Score: <span className="font-mono">{score} / {QUESTIONS.length}</span>
            <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {answeredCount} of {QUESTIONS.length} answered
            </span>
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={answeredCount}
            aria-label="Quiz progress"
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <ol className="space-y-4">
        {QUESTIONS.map((q, qIndex) => {
          const selected = answers[q.id];
          const locked = selected !== undefined;
          const Icon = q.icon;
          return (
            <motion.li
              key={q.id}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-32px' }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: reducedMotion ? 0 : qIndex * 0.05 }}
              className={cn(
                'rounded-2xl border p-3 sm:p-4',
                locked
                  ? selected === q.safeIndex
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
                    : 'border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40',
              )}
            >
              <fieldset
                role="radiogroup"
                aria-labelledby={`${q.id}-legend`}
                aria-describedby={locked ? `${q.id}-feedback` : undefined}
                className="m-0 border-0 p-0"
              >
                <legend id={`${q.id}-legend`} className="contents">
                  <span className="mb-1 flex items-center gap-2">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Q{qIndex + 1} · {q.eyebrow}
                    </span>
                  </span>
                  <span className="block text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                    {q.scenario}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-white">
                    {q.prompt}
                  </span>
                </legend>

                <div className="mt-2.5 space-y-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = selected === oIndex;
                    const isSafe = oIndex === q.safeIndex;
                    const inputId = `${q.id}-opt-${oIndex}`;
                    return (
                      <label
                        key={opt.id}
                        htmlFor={inputId}
                        className={cn(
                          'flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                          'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900',
                          !locked && 'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-950/30',
                          locked && isSafe
                            ? 'border-emerald-500 bg-emerald-100/70 font-semibold text-emerald-950 dark:border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-100'
                            : locked && isSelected
                              ? 'border-rose-500 bg-rose-100/70 font-semibold text-rose-950 dark:border-rose-500 dark:bg-rose-900/40 dark:text-rose-100'
                              : 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                          locked && !isSelected && !isSafe && 'opacity-70',
                          locked && 'cursor-default',
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
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-default"
                        />
                        <span className="flex flex-1 items-start gap-1.5 leading-snug">
                          <span className="flex-1">{opt.label}</span>
                          {locked && isSafe && (
                            <CheckCircle2 aria-label="Correct — safe choice" className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {locked && isSelected && !isSafe && (
                            <XCircle aria-label="Incorrect choice" className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {locked && (
                <motion.div
                  id={`${q.id}-feedback`}
                  role="status"
                  initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    'mt-2.5 overflow-hidden rounded-xl border px-3 py-2.5 text-sm leading-relaxed',
                    selected === q.safeIndex
                      ? 'border-emerald-200 bg-white text-slate-700 dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-200'
                      : 'border-rose-200 bg-white text-slate-700 dark:border-rose-800 dark:bg-slate-900 dark:text-slate-200',
                  )}
                >
                  <p className="flex items-start gap-1.5 font-semibold">
                    {selected === q.safeIndex ? (
                      <>
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300">Safe move. {q.whySafe}</span>
                      </>
                    ) : (
                      <>
                        <XCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-700 dark:text-rose-300">
                          Not safe — the right call was: “{q.options[q.safeIndex]?.label}”
                        </span>
                      </>
                    )}
                  </p>
                  {selected !== q.safeIndex && (
                    <p className="mt-1 pl-5 text-slate-600 dark:text-slate-300">{q.whySafe}</p>
                  )}
                  <p className="mt-1.5 flex items-start gap-1.5 pl-0 text-xs text-slate-500 dark:text-slate-400">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{q.redFlag}</span>
                  </p>
                </motion.div>
              )}
            </motion.li>
          );
        })}
      </ol>

      {/* Result tier */}
      {showResult && allDone && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'mt-5 rounded-2xl border p-4 text-center sm:p-5',
            tier === 'Scam-proof'
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : tier === 'Sharp'
                ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40'
                : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40',
          )}
        >
          {tier === 'Scam-proof' ? (
            <div className="flex flex-col items-center gap-2">
              <CelebrationRing
                progress={100}
                size={140}
                colorTheme="emerald"
                label="5 / 5 — Scam-proof"
                sublabel="Every red flag spotted"
              />
              <p className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">
                Scam-proof
              </p>
              <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">{blurb}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-white',
                  tier === 'Sharp' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-rose-600 dark:bg-rose-500',
                )}
              >
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                {score} / {QUESTIONS.length}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{tier}</p>
              <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">{blurb}</p>
            </div>
          )}

          <div className="mx-auto mt-3 max-w-md rounded-xl bg-white/70 px-3 py-2.5 text-left text-xs leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700">
            Scammed or unsure? Contact your bank immediately, report to Scamwatch (scamwatch.gov.au) and
            IDCARE (idcare.org) if identity details were shared. Money muling can mean a criminal record
            and account closure — never lend your account, and always check the PayID name matches.
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-900"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Try again
          </button>
        </motion.div>
      )}

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        General education only, not financial or legal advice. Scam patterns and agency guidance per the
        National Anti-Scam Centre / Scamwatch, current as at September 2026.
      </p>
    </motion.section>
  );
}

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, BadgeCheck, RotateCw } from 'lucide-react';

type MythSource = 'ATO' | 'Fair Work' | 'APRA' | 'RTA';

interface MythFact {
  id: string;
  myth: string;
  fact: string;
  source: MythSource;
}

/**
 * Six common Australian money myths, each paired with a short
 * September-2026-accurate fact and the authority that backs it.
 */
const MYTHS: ReadonlyArray<MythFact> = [
  {
    id: 'super-old-people',
    myth: '“Super is only for old people.”',
    fact: 'Employers must pay 12% Super Guarantee on your ordinary-time earnings (12% since 1 July 2025), landing each payday under Payday Super from 1 July 2026. A median sub-$5k teen balance left invested for ~40 years can compound into tens of thousands by preservation age 60.',
    source: 'ATO',
  },
  {
    id: 'no-tax-under-18',
    myth: '“Under 18s pay no tax.”',
    fact: 'Wages get the $18,200 tax-free threshold, but a minor’s unearned income over $416 is taxed at Division 6AA penalty rates up to 45%. Quote no TFN and payers must withhold 47% from the top dollar.',
    source: 'ATO',
  },
  {
    id: 'help-free-money',
    myth: '“HELP is free money.”',
    fact: 'HELP debt was indexed 2.8% on 1 June 2026, so balances grow even while you study. Compulsory repayments start at $69,528 repayment income in 2026–27 — 15¢ in the dollar above that.',
    source: 'ATO',
  },
  {
    id: 'bnpl-harmless',
    myth: '“Buy now, pay later is harmless.”',
    fact: 'Missed BNPL instalments stack late fees that can quickly exceed the original purchase, and major providers now feed repayment history into Australia’s credit reporting system. That footprint can count against future car or home loan applications.',
    source: 'APRA',
  },
  {
    id: 'money-muling',
    myth: '“Money muling is easy cash.”',
    fact: 'Letting someone funnel cash through your account is money muling — a money-laundering offence that can bring a criminal record and frozen funds. Banks routinely shut down mule accounts, leaving you blacklisted from opening new ones.',
    source: 'APRA',
  },
  {
    id: 'renting-deposit',
    myth: '“Renting needs a 20% deposit.”',
    fact: 'You don’t need a 20% deposit to rent — you need bond plus advance rent. In Queensland general tenancies, the RTA caps bond at 4 weeks rent and it must be lodged with the RTA, not handed to the landlord.',
    source: 'RTA',
  },
];

interface MythCardProps {
  entry: MythFact;
  flipped: boolean;
  reducedMotion: boolean;
  onToggle: (id: string) => void;
}

function MythCard({ entry, flipped, reducedMotion, onToggle }: MythCardProps) {
  const faceBase =
    'flex h-full w-full flex-col justify-between gap-3 rounded-2xl border p-4 text-left sm:p-5';

  const front = (
    <span className={`${faceBase} border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900`}>
      <span className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
          Myth
        </span>
        <span className="block text-base font-bold leading-snug text-slate-900 dark:text-white">
          {entry.myth}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
        Tap to reveal the fact
      </span>
    </span>
  );

  const back = (
    <span className={`${faceBase} border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50`}>
      <span className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white dark:bg-emerald-500 dark:text-emerald-950">
          <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
          Fact
        </span>
        <span className="block text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          {entry.fact}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
          Source: {entry.source}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
          Flip back
        </span>
      </span>
    </span>
  );

  return (
    <button
      type="button"
      onClick={() => onToggle(entry.id)}
      aria-pressed={flipped}
      aria-label={`${flipped ? 'Fact' : 'Myth'}: ${entry.myth} Activate to ${flipped ? 'show the myth' : 'reveal the fact'}.`}
      className="relative min-h-[280px] w-full rounded-2xl text-left shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-h-[260px] dark:focus-visible:ring-offset-slate-950"
      style={{ perspective: '1200px' }}
    >
      {reducedMotion ? (
        flipped ? back : front
      ) : (
        <motion.span
          className="relative block h-full min-h-[inherit] w-full"
          style={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <span
            aria-hidden={flipped}
            className="absolute inset-0 block"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {front}
          </span>
          <span
            aria-hidden={!flipped}
            className="absolute inset-0 block"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {back}
          </span>
        </motion.span>
      )}
    </button>
  );
}

export interface MoneyMythsProps {
  className?: string;
}

/**
 * MoneyMyths — six tap-to-flip myth-vs-fact cards for the landing page.
 *
 * Each card is a keyboard-accessible button (`aria-pressed` reflects
 * flipped state). Motion users get a `rotateY` 3D flip; users who prefer
 * reduced motion get a simple front/back swap with no animation.
 */
export function MoneyMyths({ className }: MoneyMythsProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [flippedIds, setFlippedIds] = useState<ReadonlySet<string>>(() => new Set());

  const handleToggle = useCallback((id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <section
      aria-labelledby="money-myths-heading"
      className={`w-full ${className ?? ''}`}
    >
      <div className="mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Myth vs fact
        </p>
        <h2
          id="money-myths-heading"
          className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white"
        >
          Money myths, busted
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
          Tap any card to flip it. Facts current as at September 2026.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MYTHS.map((entry) => (
          <MythCard
            key={entry.id}
            entry={entry}
            flipped={flippedIds.has(entry.id)}
            reducedMotion={reducedMotion}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}

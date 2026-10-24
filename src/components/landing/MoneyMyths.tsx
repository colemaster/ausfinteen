import { useCallback, useState } from 'react';
import { AlertTriangle, BadgeCheck, RotateCw, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

type MythSource = 'ATO' | 'Fair Work' | 'APRA' | 'RTA';

interface MythFact {
  id: string;
  myth: string;
  fact: string;
  source: MythSource;
  tag: string;
}

const MYTHS: ReadonlyArray<MythFact> = [
  {
    id: 'super-old-people',
    myth: '“Super is only for people close to retirement.”',
    fact: 'Employers must pay 12% Super Guarantee on your ordinary earnings (12% since 1 July 2025), credited directly each payday under Payday Super from 1 July 2026. A modest $5,000 teen balance invested for ~42 years can compound into upwards of $100,000+ by age 60.',
    source: 'ATO',
    tag: '12% Super Guarantee',
  },
  {
    id: 'no-tax-under-18',
    myth: '“Teens and under-18s don’t pay any tax.”',
    fact: 'Wages get the standard $18,200 tax-free threshold, but unearned investment income over $416 without an excepted trust is taxed at Division 6AA penalty rates up to 45%. Quoting no TFN also forces employers to withhold 47% from the top dollar.',
    source: 'ATO',
    tag: '$18,200 Threshold',
  },
  {
    id: 'help-free-money',
    myth: '“HELP/HECS is free money you can ignore.”',
    fact: 'HELP balances index annually on 1 June based on the lower of CPI or WPI (2.8% on 1 June 2026). Under the 2026 Universities Accord, compulsory repayments begin at $69,528 repayment income — deducting 15¢ in the dollar above that threshold.',
    source: 'ATO',
    tag: '$69,528 HELP Cap',
  },
  {
    id: 'bnpl-harmless',
    myth: '“Buy Now, Pay Later doesn’t affect credit or loans.”',
    fact: 'Missed BNPL instalments incur compounding late fees, and major Australian providers now report repayment histories into comprehensive credit reporting (CCR). A missed $20 payment can impair your ability to secure a car or home loan years later.',
    source: 'APRA',
    tag: 'Credit File Risk',
  },
  {
    id: 'money-muling',
    myth: '“Letting someone transfer money through my account is harmless.”',
    fact: 'Letting strangers funnel funds through your account is money muling — a criminal money-laundering felony under Criminal Code Act 1995. Banks immediately freeze funds and report your details to AUSTRAC, leaving you blacklisted across Australian banks.',
    source: 'APRA',
    tag: 'AML/CTF Felony',
  },
  {
    id: 'renting-deposit',
    myth: '“You need a 20% mortgage deposit before renting.”',
    fact: 'You don’t need a home mortgage deposit to rent. In Queensland, general tenancy bonds are capped by law at 4 weeks rent and must strictly be lodged with the RTA (Residential Tenancies Authority), never transferred into a private landlord’s personal account.',
    source: 'RTA',
    tag: 'RTA Bond Rules',
  },
];

interface MythCardProps {
  entry: MythFact;
  flipped: boolean;
  onToggle: (id: string) => void;
}

function MythCard({ entry, flipped, onToggle }: MythCardProps) {
  const faceBase =
    'flex h-full w-full flex-col justify-between gap-3.5 rounded-2xl border p-5 text-left shadow-lg backdrop-blur-md transition-all duration-300';

  const front = (
    <span className={cn(faceBase, 'border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 hover:border-rose-500/40 hover:shadow-xl dark:border-rose-500/20')}>
      <span className="space-y-2.5">
        <span className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            Common Myth
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
            {entry.tag}
          </span>
        </span>
        <span className="block text-base font-extrabold leading-snug text-foreground">
          {entry.myth}
        </span>
      </span>
      <span className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs font-bold text-muted-foreground group-hover:text-primary">
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
          Click to reveal verified fact
        </span>
        <span className="text-[10px] opacity-75 font-mono">Source: {entry.source}</span>
      </span>
    </span>
  );

  const back = (
    <span className={cn(faceBase, 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-card to-card text-foreground shadow-xl dark:border-emerald-500/30')}>
      <span className="space-y-2.5">
        <span className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
            Statutory Fact
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-card/60 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {entry.source} Verified
          </span>
        </span>
        <span className="block text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium">
          {entry.fact}
        </span>
      </span>
      <span className="flex items-center justify-between border-t border-emerald-500/20 pt-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <span className="flex items-center gap-1.5">
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
          Flip card
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">2026-27 Accurate</span>
      </span>
    </span>
  );

  return (
    <button
      type="button"
      onClick={() => {
        sound.playClick();
        onToggle(entry.id);
      }}
      aria-pressed={flipped}
      aria-label={`${flipped ? 'Fact' : 'Myth'}: ${entry.myth} Activate to ${flipped ? 'show the myth' : 'reveal the fact'}.`}
      className="group relative min-h-[280px] w-full rounded-2xl text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-h-[260px]"
      style={{ perspective: '1200px' }}
    >
      <span
        className="flip-3d relative block h-full min-h-[inherit] w-full"
        data-flipped={flipped}
      >
        <span
          aria-hidden={flipped}
          className="flip-face absolute inset-0 block"
        >
          {front}
        </span>
        <span
          aria-hidden={!flipped}
          className="flip-face flip-face-back absolute inset-0 block"
        >
          {back}
        </span>
      </span>
    </button>
  );
}

export interface MoneyMythsProps {
  className?: string;
}

export function MoneyMyths({ className }: MoneyMythsProps) {
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
      className={cn('relative w-full space-y-5', className)}
    >
      <div className="text-center sm:text-left space-y-1">
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">
          <Sparkles className="h-3 w-3" />
          Australian Reality Check
        </span>
        <h2
          id="money-myths-heading"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground"
        >
          6 Common Australian Money Myths Debunked
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Click any card to flip and reveal statutory guidance sourced straight from the ATO, APRA, Fair Work and the RTA.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MYTHS.map((entry) => (
          <MythCard
            key={entry.id}
            entry={entry}
            flipped={flippedIds.has(entry.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}

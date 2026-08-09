import { useMemo } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialHealthScoreProps {
  age: number;
  hasSuper: boolean;
  savings: number;
  savingsTarget: number;
  hoursWk: number;
  claimsTaxFree: boolean;
}

/**
 * 2030 Futuristic Teen Financial Health Score Wheel Component
 * Calculates a dynamic score (0-100) based on super, savings ratio, tax threshold, and job activity.
 */
export function FinancialHealthScore({
  hasSuper,
  savings,
  savingsTarget,
  hoursWk,
  claimsTaxFree,
}: FinancialHealthScoreProps) {
  const { score, breakdown, badgeLabel } = useMemo(() => {
    let currentScore = 40; // baseline for having a profile
    const items: { label: string; points: number; max: number }[] = [];

    // Job activity
    if (hoursWk >= 8) {
      currentScore += 20;
      items.push({ label: 'Active Job / Paycheck Stream', points: 20, max: 20 });
    } else if (hoursWk > 0) {
      currentScore += 10;
      items.push({ label: 'Part-Time Job Stream', points: 10, max: 20 });
    } else {
      items.push({ label: 'Job Stream', points: 0, max: 20 });
    }

    // Super fund
    if (hasSuper) {
      currentScore += 15;
      items.push({ label: 'Super Fund Stapled (12% SG)', points: 15, max: 15 });
    } else {
      items.push({ label: 'Super Fund Stapled', points: 0, max: 15 });
    }

    // Savings progress
    const ratio = savingsTarget > 0 ? Math.min(1, savings / savingsTarget) : 0;
    const savingsPoints = Math.round(ratio * 15);
    currentScore += savingsPoints;
    items.push({ label: 'Savings Goal Target Progress', points: savingsPoints, max: 15 });

    // Tax threshold
    if (claimsTaxFree) {
      currentScore += 10;
      items.push({ label: '$18,200 Tax-Free Threshold Claimed', points: 10, max: 10 });
    } else {
      items.push({ label: 'Tax-Free Threshold Claimed', points: 0, max: 10 });
    }

    let rank = 'Bronze Finance Teen 🥉';
    if (currentScore >= 90) rank = 'Apex Teen Wealth Master 🏆';
    else if (currentScore >= 75) rank = 'Barefoot Gold Investor 🥇';
    else if (currentScore >= 60) rank = 'Silver Finance Saver 🥈';

    return { score: Math.min(100, currentScore), breakdown: items, badgeLabel: rank };
  }, [hasSuper, savings, savingsTarget, hoursWk, claimsTaxFree]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 shadow-xl space-y-6">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2030 AI Financial Health Score</span>
          </div>
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{badgeLabel}</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Your real-time score measures your job setup, tax threshold claims, super stapling, and savings goal progress.
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/40"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              className="text-primary transition-all duration-1000 ease-out"
              fill="transparent"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black font-mono tracking-tight text-foreground">{score}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Out of 100</span>
          </div>
        </div>
      </div>

      {/* Breakdown Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className={cn('w-4 h-4', item.points > 0 ? 'text-success' : 'text-muted-foreground/50')} />
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <span className="font-mono font-bold text-primary">+{item.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

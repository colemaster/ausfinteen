import { useState, useMemo } from 'react';
import { ShieldCheck, Sparkles, Activity, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CelebrationRing } from './CelebrationRing';
import { FinancialHealthRadar, type RadarPillar } from './FinancialHealthRadar';

interface FinancialHealthScoreProps {
  age?: number;
  hasSuper: boolean;
  savings: number;
  savingsTarget: number;
  hoursWk: number;
  claimsTaxFree: boolean;
  hasTFN?: boolean;
  hasMedicare?: boolean;
}

/**
 * 2027 Teen Financial Health Score & 6-Pillar Radar Benchmark Component
 * Computes dynamic score (0-100) and displays both celebration ring & radar spider chart.
 */
export function FinancialHealthScore({
  hasSuper,
  savings,
  savingsTarget,
  hoursWk,
  claimsTaxFree,
  hasTFN = true,
  hasMedicare = true,
}: FinancialHealthScoreProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'radar'>('overview');

  const { score, breakdown, badgeLabel, pillars } = useMemo(() => {
    let currentScore = 30; // baseline for having a profile
    const items: { label: string; points: number; max: number }[] = [];

    // Job activity & award rates (Pillar 1)
    let jobPts = 0;
    if (hoursWk >= 8) {
      jobPts = 20;
      items.push({ label: 'Active Casual Job Stream (Award Protected)', points: 20, max: 20 });
    } else if (hoursWk > 0) {
      jobPts = 10;
      items.push({ label: 'Part-Time Job Stream', points: 10, max: 20 });
    } else {
      items.push({ label: 'Job Stream', points: 0, max: 20 });
    }
    currentScore += jobPts;

    // Super fund (Pillar 4)
    let superPts = 0;
    if (hasSuper) {
      superPts = 15;
      items.push({ label: 'Super Fund Stapled (12% SG + 3% Fee Cap)', points: 15, max: 15 });
    } else {
      items.push({ label: 'Super Fund Stapled', points: 0, max: 15 });
    }
    currentScore += superPts;

    // Savings progress & HISA (Pillar 2 & 5)
    const ratio = savingsTarget > 0 ? Math.min(1, savings / savingsTarget) : 0;
    const savingsPoints = Math.round(ratio * 15);
    currentScore += savingsPoints;
    items.push({ label: 'Savings Goal Target Progress (5.0%+ HISA)', points: savingsPoints, max: 15 });

    // Tax threshold & Medicare (Pillar 3)
    let taxPts = 0;
    if (claimsTaxFree) {
      taxPts += 10;
      items.push({ label: '$18,200 Tax-Free Threshold Claimed', points: 10, max: 10 });
    } else {
      items.push({ label: 'Tax-Free Threshold Claimed', points: 0, max: 10 });
    }
    if (hasTFN) taxPts += 5;
    if (hasMedicare) taxPts += 5;
    currentScore += (hasTFN ? 5 : 0) + (hasMedicare ? 5 : 0);

    let rank = 'Bronze Starter Saver 🥉';
    if (currentScore >= 85) rank = 'Apex Teen Wealth Master 🏆';
    else if (currentScore >= 70) rank = 'Barefoot Gold Achiever 🥇';
    else if (currentScore >= 55) rank = 'Silver Smart Saver 🥈';

    const normalizedScore = Math.min(100, Math.max(0, currentScore));

    const computedPillars: RadarPillar[] = [
      { key: 'awards', label: 'Work & Awards', score: hoursWk > 0 ? 85 : 40, benchmark: 60, description: 'Knowledge of Modern Awards, 3hr min shifts, and penalty rates.' },
      { key: 'banking', label: '5.0%+ HISA', score: savings > 500 ? 90 : 50, benchmark: 45, description: 'High-interest savings account with zero fees and APRA FCS guarantee.' },
      { key: 'tax', label: 'TFN & Medicare', score: claimsTaxFree ? 85 : 45, benchmark: 50, description: 'Claiming $18,200 threshold, lodging myTax, and Medicare transfer at 15.' },
      { key: 'super', label: 'Super 12% SG', score: hasSuper ? 85 : 30, benchmark: 40, description: '12% SG super stapling, low-balance fee cap, and ETF compounding.' },
      { key: 'budget', label: '50/30/20 & Mojo', score: Math.round(ratio * 90) || 50, benchmark: 55, description: 'Barefoot 3-bucket allocation, $500 Mojo buffer, and Pay Yourself First.' },
      { key: 'defense', label: 'Scam Immunity', score: 95, benchmark: 50, description: 'Zero BNPL traps, PayID verification, and money muling defense.' },
    ];

    return {
      score: normalizedScore,
      breakdown: items,
      badgeLabel: rank,
      pillars: computedPillars,
    };
  }, [hasSuper, savings, savingsTarget, hoursWk, claimsTaxFree, hasTFN, hasMedicare]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 shadow-xl space-y-6 select-none">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Controls & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2027 AI Financial Health Diagnostic</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{badgeLabel}</h3>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/80 border border-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer',
              viewMode === 'overview'
                ? 'bg-card text-primary shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Score Wheel</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer',
              viewMode === 'radar'
                ? 'bg-card text-primary shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>6-Pillar Radar</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'overview' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground max-w-sm text-center sm:text-left leading-relaxed">
              Your real-time score measures job activity, tax threshold claims, super stapling, and savings goal progress compared against Australian youth benchmarks.
            </p>

            <CelebrationRing
              progress={score}
              size={136}
              strokeWidth={10}
              colorTheme={score >= 80 ? 'emerald' : score >= 60 ? 'primary' : 'amber'}
              label="Overall Score"
              sublabel="Out of 100"
            />
          </div>

          {/* Breakdown Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={cn('w-4 h-4', item.points > 0 ? 'text-emerald-500' : 'text-muted-foreground/50')} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <span className="font-mono font-bold text-primary">+{item.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <FinancialHealthRadar pillars={pillars} size={360} />
        </div>
      )}
    </div>
  );
}

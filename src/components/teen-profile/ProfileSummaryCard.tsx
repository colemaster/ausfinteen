import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ArrowUpRight,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { Link } from '@/lib/router';
import { sound } from '@/lib/sound-synthesizer';
import { shareNative } from '@/lib/share-state';
import confetti from 'canvas-confetti';

interface ProfileSummaryCardProps {
  className?: string;
  showQuickActions?: boolean;
}

export function ProfileSummaryCard({ className = '', showQuickActions = true }: ProfileSummaryCardProps) {
  const {
    profile,
    weeklyGrossIncome,
    annualGrossIncome,
    weeklyNetPay,
    weeklySuperContribution,
    superEligible,
    resetProfile,
  } = useTeenProfile();

  const [copied, setCopied] = useState<boolean>(false);

  const goalRatio =
    profile.savingsGoalTarget > 0
      ? Math.min(100, Math.round((profile.currentSavings / profile.savingsGoalTarget) * 100))
      : 0;

  const handleCopySummary = () => {
    sound.playClick();
    const summaryText = `--- AusFinTools Teen Financial Profile ---
Name: ${profile.name} (${profile.age}yo)
Location: ${profile.location}
Roster: ${profile.hoursPerWeek} hrs/wk @ $${profile.hourlyRate.toFixed(2)}/hr
Weekly Gross: $${weeklyGrossIncome.toFixed(2)}/wk | Net: $${weeklyNetPay.toFixed(2)}/wk
Annual Gross: $${annualGrossIncome.toFixed(2)}/yr
Super (12% SG): $${weeklySuperContribution.toFixed(2)}/wk (${superEligible ? 'Eligible' : 'Under 30h/wk junior'})
Goal: ${profile.savingsGoalName} ($${profile.currentSavings.toLocaleString()} / $${profile.savingsGoalTarget.toLocaleString()} - ${goalRatio}% reached)
Tax-Free Claimed: ${profile.claimsTaxFreeThreshold ? 'Yes ($18.2k threshold)' : 'No'}
Generated via AusFinTools.`;

    navigator.clipboard.writeText(summaryText);
    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.4 },
        disableForReducedMotion: true,
      });
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = async () => {
    sound.playClick();
    await shareNative({
      title: `${profile.name}'s Real-World Finance Profile`,
      text: `Check out my Australian teen financial independence profile on AusFinTools!`,
    });
  };

  return (
    <Card
      variant="glass"
      className={`relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 backdrop-blur-xl p-6 shadow-xl space-y-5 ${className}`}
    >
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {profile.name.charAt(0).toUpperCase() || '🤠'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                {profile.name}
              </h3>
              <Badge variant="default" className="text-[10px]">
                {profile.age} Years Old
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 text-primary" />
              <span>{profile.location}</span>
              <span>•</span>
              <span>{profile.hoursPerWeek}h/wk @ ${profile.hourlyRate.toFixed(2)}/hr</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30'
            }`}
            title="Copy profile summary"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Share profile"
            aria-label="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Financial Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
            <Wallet className="w-3.5 h-3.5" /> Take-Home Pay
          </span>
          <div className="text-xl font-black font-mono text-foreground">
            ${weeklyNetPay.toFixed(2)}
          </div>
          <span className="text-[10px] text-muted-foreground">per week (cash in hand)</span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Annual Gross
          </span>
          <div className="text-xl font-black font-mono text-foreground">
            ${annualGrossIncome.toFixed(0)}
          </div>
          <span className="text-[10px] text-muted-foreground">projected 52 weeks</span>
        </div>

        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Super (12% SG)
          </span>
          <div className="text-xl font-black font-mono text-foreground">
            ${weeklySuperContribution.toFixed(2)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {superEligible ? 'Paid automatically' : 'Under 30h/wk rules'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
          <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-1">
            <PiggyBank className="w-3.5 h-3.5" /> Savings Stash
          </span>
          <div className="text-xl font-black font-mono text-foreground">
            ${profile.currentSavings.toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-foreground">ready in bank</span>
        </div>
      </div>

      {/* Active Goal Mini Progress Bar */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-primary" />
            <span>Target Goal: <strong>{profile.savingsGoalName}</strong></span>
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ${profile.currentSavings.toLocaleString()} / ${profile.savingsGoalTarget.toLocaleString()} ({goalRatio}%)
          </span>
        </div>

        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-700 ease-out"
            style={{ width: `${goalRatio}%` }}
          />
        </div>
      </div>

      {/* Quick Action Navigation Links */}
      {showQuickActions && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
            >
              <span>Edit Full Money Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/teen-budgeting"
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              50/30/20 Budget
            </Link>
          </div>

          <button
            type="button"
            onClick={resetProfile}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Settings</span>
          </button>
        </div>
      )}
    </Card>
  );
}

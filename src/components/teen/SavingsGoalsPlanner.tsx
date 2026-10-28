import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { SAVINGS_GOALS_FRAMEWORKS } from '@/data/teen-finance-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  PlusCircle,
  RotateCcw,
  Trophy,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';
import {
  calcGoalMilestones,
  getSinkingFundPlan,
  calcHoursAndShiftsToWork,
  convertDepositFrequency,
  type SinkingFundPlan,
} from '@/calculators/teen-savings/engine';

interface GoalPreset {
  id: string;
  name: string;
  category: 'Short-Term' | 'Medium-Term' | 'Long-Term';
  target: number;
  icon: string;
  description: string;
  tip: string;
  sinkingPlanCategory?: 'formal' | 'car' | 'laptop' | 'emergency' | 'driving';
  recommendedRange: { min: number; max: number };
}

const PRESET_GOALS: GoalPreset[] = [
  {
    id: 'mojo_500',
    name: '$500 Mojo Safety Cushion',
    category: 'Short-Term',
    target: 500,
    icon: '🛡️',
    description: "Scott Pape's foundational emergency buffer stored in a separate HISA with NO debit card.",
    tip: 'Funded in ~15 to 23 weeks on an 8–12 hr/wk teen paycheck.',
    sinkingPlanCategory: 'emergency',
    recommendedRange: { min: 500, max: 1000 },
  },
  {
    id: 'emergency_1000',
    name: '$1,000 Complete Teen Safety Net',
    category: 'Short-Term',
    target: 1000,
    icon: '🛟',
    description: 'Comprehensive emergency fund covering unexpected cracked screens, medical gaps, and travel.',
    tip: 'Having $1,000 cash buffer stops you from borrowing money or tapping high-interest credit.',
    sinkingPlanCategory: 'emergency',
    recommendedRange: { min: 500, max: 1000 },
  },
  {
    id: 'formal_850',
    name: 'Year 12 School Formal Fund',
    category: 'Medium-Term',
    target: 850,
    icon: '👔',
    description: 'All-inclusive formal package: venue ticket, suit or dress hire/purchase, shoes & grooming.',
    tip: 'Save $18/week over 12 months, and consider outfit rental (GlamCorner/The Volte) to save $300+!',
    sinkingPlanCategory: 'formal',
    recommendedRange: { min: 600, max: 1200 },
  },
  {
    id: 'laptop_byod_1400',
    name: 'Year 11/12 BYOD Study Laptop',
    category: 'Medium-Term',
    target: 1400,
    icon: '💻',
    description: 'MacBook Air or Windows ultrabook + drop-proof case using student education discounts.',
    tip: 'Save $27/week over 12 months. Apple & JB Hi-Fi BYOD portals offer 10% educational savings!',
    sinkingPlanCategory: 'laptop',
    recommendedRange: { min: 1000, max: 2000 },
  },
  {
    id: 'driving_lessons_750',
    name: '10 Professional Driving Lessons (3-for-1)',
    category: 'Medium-Term',
    target: 750,
    icon: '🚗',
    description: 'Under QLD/NSW rules, 10 instructor hours equal 30 logbook hours, saving parents 20 hours!',
    tip: 'Save $20/week over 9 months to book your 10 lessons before booking the practical driving test.',
    sinkingPlanCategory: 'driving',
    recommendedRange: { min: 650, max: 850 },
  },
  {
    id: 'car_fund_5000',
    name: 'Reliable First Used Car (Zero Debt!)',
    category: 'Long-Term',
    target: 5000,
    icon: '🚘',
    description: 'A reliable used 4-cyl cash car (Corolla, Civic, Yaris, i30) bought 100% in cash without debt.',
    tip: 'The $3,500–$6,000 range buys roadworthy Japanese reliability without predatory 14% car loans.',
    sinkingPlanCategory: 'car',
    recommendedRange: { min: 3500, max: 6000 },
  },
  {
    id: 'car_onroad_sinking_2500',
    name: '1st Year Car On-Road Sinking Fund',
    category: 'Long-Term',
    target: 2500,
    icon: '⛽️',
    description: 'Essential sinking fund for comprehensive insurance, annual rego, CTP green slip, and servicing.',
    tip: 'Never buy a car without having this fund ready — otherwise rego renewal turns into a crisis.',
    sinkingPlanCategory: 'car',
    recommendedRange: { min: 2000, max: 3500 },
  },
];

const POPULAR_RATES = [
  { label: 'BOQ Future Saver (5.80%)', rate: 5.80 },
  { label: 'Newcastle Perm (5.75%)', rate: 5.75 },
  { label: 'Great Southern Bank (5.50%)', rate: 5.50 },
  { label: 'ING Youth Saver (5.50%)', rate: 5.50 },
  { label: 'Up Bank Savers (5.35%)', rate: 5.35 },
  { label: 'ANZ Plus (5.10%)', rate: 5.10 },
  { label: 'CommBank Youthsaver (5.05%)', rate: 5.05 },
  { label: 'Westpac Bump (5.05%)', rate: 5.05 },
];

const MODERN_AWARD_WAGES = [
  { label: 'Fast Food 15yo Casual ($13.90/hr)', wage: 13.90 },
  { label: 'Retail 15yo Casual ($15.64/hr)', wage: 15.64 },
  { label: 'Fast Food 16yo Casual ($17.39/hr)', wage: 17.39 },
  { label: 'Fast Food 17yo Casual ($20.86/hr)', wage: 20.86 },
  { label: 'Hospitality 15-16yo Casual ($16.53/hr)', wage: 16.53 },
  { label: 'General Cleaner Any Age ($34.76/hr)', wage: 34.76 },
];

type Frequency = 'weekly' | 'fortnightly' | 'monthly';

const SAVINGS_PLANNER_STORAGE_KEY = 'pft_savings_planner_state_v2';

export function SavingsGoalsPlanner() {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('mojo_500');
  const [customTarget, setCustomTarget] = useState<number>(500);
  const [depositAmount, setDepositAmount] = useState<number>(25);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [currentSavings, setCurrentSavings] = useState<number>(100);
  const [hisaRate, setHisaRate] = useState<number>(5.50);
  const [itemPrice, setItemPrice] = useState<number>(140);
  const [juniorWage, setJuniorWage] = useState<number>(13.90);
  const [showSinkingBreakdown, setShowSinkingBreakdown] = useState<boolean>(true);

  // Restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVINGS_PLANNER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedGoalId) setSelectedGoalId(parsed.selectedGoalId);
        if (typeof parsed.customTarget === 'number') setCustomTarget(parsed.customTarget);
        if (typeof parsed.depositAmount === 'number') setDepositAmount(parsed.depositAmount);
        if (parsed.frequency) setFrequency(parsed.frequency);
        if (typeof parsed.currentSavings === 'number') setCurrentSavings(parsed.currentSavings);
        if (typeof parsed.hisaRate === 'number') setHisaRate(parsed.hisaRate);
        if (typeof parsed.itemPrice === 'number') setItemPrice(parsed.itemPrice);
        if (typeof parsed.juniorWage === 'number') setJuniorWage(parsed.juniorWage);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        SAVINGS_PLANNER_STORAGE_KEY,
        JSON.stringify({
          selectedGoalId,
          customTarget,
          depositAmount,
          frequency,
          currentSavings,
          hisaRate,
          itemPrice,
          juniorWage,
        })
      );
    } catch {
      // ignore
    }
  }, [selectedGoalId, customTarget, depositAmount, frequency, currentSavings, hisaRate, itemPrice, juniorWage]);

  const activeGoal = useMemo(() => {
    return PRESET_GOALS.find(g => g.id === selectedGoalId) || {
      id: 'custom',
      name: 'Custom Savings Goal',
      category: 'Medium-Term' as const,
      target: customTarget,
      icon: '🎯',
      description: 'Personalized savings target for your own financial independence goal.',
      tip: 'Break big numbers into weekly targets to harness momentum.',
      recommendedRange: { min: 100, max: 20000 },
    };
  }, [selectedGoalId, customTarget]);

  const targetAmount = selectedGoalId === 'custom' ? customTarget : activeGoal.target;

  // Normalized deposit amounts
  const normalizedDeposits = useMemo(() => {
    return convertDepositFrequency(depositAmount, frequency);
  }, [depositAmount, frequency]);

  // Sinking fund plan if available
  const sinkingPlan = useMemo<SinkingFundPlan | null>(() => {
    if (activeGoal.sinkingPlanCategory) {
      return getSinkingFundPlan(activeGoal.sinkingPlanCategory);
    }
    return null;
  }, [activeGoal]);

  // Progress metrics
  const progressRatio = targetAmount > 0 ? (currentSavings / targetAmount) : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));
  const remainingDollars = Math.max(0, targetAmount - currentSavings);

  // Goal Milestones (25%, 50%, 75%, 100%)
  const milestones = useMemo(() => {
    return calcGoalMilestones(
      currentSavings,
      targetAmount,
      normalizedDeposits.monthly,
      hisaRate
    );
  }, [currentSavings, targetAmount, normalizedDeposits.monthly, hisaRate]);

  // Quick action deposits
  const handleAddSavings = useCallback((amount: number) => {
    sound.playClick();
    const next = Math.max(0, currentSavings + amount);
    setCurrentSavings(next);

    if (next >= targetAmount && currentSavings < targetAmount) {
      sound.playGoalCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.4 },
          disableForReducedMotion: true,
        });
      } catch {}
    }
  }, [currentSavings, targetAmount]);

  const handleSetPercent = useCallback((pct: number) => {
    sound.playClick();
    const next = Math.round((targetAmount * pct) / 100);
    setCurrentSavings(next);

    if (pct >= 100) {
      sound.playGoalCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.4 },
          disableForReducedMotion: true,
        });
      } catch {}
    }
  }, [targetAmount]);

  const handleResetSavings = useCallback(() => {
    sound.playClick();
    setCurrentSavings(0);
  }, []);

  // Overall timeline projection
  const finalMilestone = milestones[3]; // 100% milestone

  // Hours worked conversion
  const hoursConversion = useMemo(() => {
    return calcHoursAndShiftsToWork(itemPrice, juniorWage, 3);
  }, [itemPrice, juniorWage]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Savings Goals & Sinking Funds Planner</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Plan realistic Australian youth targets: First Car ($3,500–$6,000), School Formal ($600–$1,200), BYOD Laptop ($1,000–$2,000), and Mojo Emergency Buffer ($500–$1,000).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            2026-27 Benchmarks
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            HISA Compounding
          </Badge>
        </div>
      </div>

      {/* Preset Goal Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground block">
            Select a Proven Australian Teen Milestone:
          </label>
          <span className="text-[11px] text-muted-foreground">
            Target Range: ${activeGoal.recommendedRange.min.toLocaleString()} – ${activeGoal.recommendedRange.max.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_GOALS.map(goal => (
            <button
              key={goal.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedGoalId(goal.id);
                setCustomTarget(goal.target);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedGoalId === goal.id
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40'
                  : 'border-border bg-card hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-lg">{goal.icon}</span>
                <Badge variant={selectedGoalId === goal.id ? 'success' : 'outline'} className="text-[9px]">
                  ${goal.target.toLocaleString()}
                </Badge>
              </div>
              <h4 className="font-bold text-xs text-foreground leading-snug">{goal.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedGoalId('custom');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedGoalId === 'custom'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-lg">🎯</span>
              <Badge variant={selectedGoalId === 'custom' ? 'success' : 'outline'} className="text-[9px]">
                Custom
              </Badge>
            </div>
            <h4 className="font-bold text-xs text-foreground leading-snug">Custom Sinking Fund</h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              Set any custom target amount (gaming console, holiday trip, festival tickets).
            </p>
          </button>
        </div>
      </div>

      {/* Sinking Fund Breakdown Accordion */}
      {sinkingPlan && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">
                Realistic {sinkingPlan.title} Sinking Fund Breakdown (${sinkingPlan.targetAmount.toLocaleString()})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSinkingBreakdown(!showSinkingBreakdown)}
              className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              {showSinkingBreakdown ? (
                <>Hide Items <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>View Breakdown <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          {showSinkingBreakdown && (
            <div className="space-y-2 pt-1 border-t border-primary/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {sinkingPlan.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{item.name}</span>
                        {item.essential ? (
                          <Badge variant="outline" className="text-[9px] text-emerald-600 dark:text-emerald-400">
                            Essential
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-muted-foreground">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="font-bold font-mono text-foreground shrink-0">${item.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><strong>Pro Tip:</strong> {sinkingPlan.tip}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Goal Progress Bar & Milestone Animation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border border-emerald-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-foreground">
              {activeGoal.name}: <span className="font-mono text-emerald-600 dark:text-emerald-400">${currentSavings.toLocaleString()}</span> of <span className="font-mono">${targetAmount.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={progressPercent === 100 ? 'success' : 'default'} className="text-[10px]">
              {progressPercent === 100 ? '🎉 100% Goal Reached!' : `${progressPercent}% Saved ($${remainingDollars.toLocaleString()} remaining)`}
            </Badge>
          </div>
        </div>

        {/* Multi-Segment Motion Progress Bar with Milestone Ticks */}
        <div className="relative">
          <div className="relative h-4 w-full rounded-full bg-muted/70 overflow-hidden border border-emerald-500/30 p-0.5">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                progressPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-emerald-500 to-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone markers at 25%, 50%, 75%, 100% */}
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1 px-1">
            <span className={progressPercent >= 0 ? 'text-primary font-bold' : ''}>0%</span>
            <span className={progressPercent >= 25 ? 'text-primary font-bold' : ''}>25%</span>
            <span className={progressPercent >= 50 ? 'text-primary font-bold' : ''}>50%</span>
            <span className={progressPercent >= 75 ? 'text-primary font-bold' : ''}>75%</span>
            <span className={progressPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>100% 🎯</span>
          </div>
        </div>

        {/* Four Milestone Progress Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                m.reached
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-foreground'
                  : 'bg-card/70 border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold">{m.badge}</span>
                {m.reached ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <span className="font-mono">{m.projectedDate}</span>
                )}
              </div>
              <div className="text-xs font-bold font-mono text-foreground">${m.amount.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">
                {m.reached ? 'Unlocked! 🌟' : m.weeksToReach === Infinity ? 'Need deposits' : `In ~${m.weeksToReach} wks`}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Deposit Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Actions:
            </span>
            <button
              type="button"
              onClick={() => handleAddSavings(20)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3 text-emerald-500" />
              +$20 Pocket Cash
            </button>
            <button
              type="button"
              onClick={() => handleAddSavings(50)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3 text-emerald-500" />
              +$50 Paycheck
            </button>
            <button
              type="button"
              onClick={() => handleAddSavings(100)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3 text-emerald-500" />
              +$100 Weekend
            </button>
            <button
              type="button"
              onClick={() => handleSetPercent(50)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
            >
              Halfway (50%)
            </button>
            <button
              type="button"
              onClick={() => handleSetPercent(100)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-all font-bold"
            >
              Hit Goal (100%)
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetSavings}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-all px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Savings</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <NumberInput
          label="Target Goal Amount ($)"
          value={targetAmount}
          onChange={v => {
            setSelectedGoalId('custom');
            setCustomTarget(v);
          }}
          min={50}
          max={50000}
          step={50}
          prefix="$"
        />
        <NumberInput
          label="Current Savings Already Set Aside ($)"
          value={currentSavings}
          onChange={v => setCurrentSavings(v)}
          min={0}
          max={50000}
          step={25}
          prefix="$"
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-muted-foreground block">Regular Savings Deposit</label>
            <div className="flex items-center gap-1">
              {(['weekly', 'fortnightly', 'monthly'] as Frequency[]).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFrequency(freq);
                  }}
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border transition-all ${
                    frequency === freq
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {freq === 'weekly' ? 'Wk' : freq === 'fortnightly' ? 'Fn' : 'Mo'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${depositAmount}/{frequency === 'weekly' ? 'wk' : frequency === 'fortnightly' ? 'fn' : 'mo'}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              (~${normalizedDeposits.monthly.toFixed(0)}/month)
            </span>
          </div>
          <SliderControl
            label={`Savings per ${frequency}`}
            value={depositAmount}
            onChange={v => setDepositAmount(v)}
            min={5}
            max={frequency === 'monthly' ? 1000 : frequency === 'fortnightly' ? 500 : 250}
            step={5}
            prefix="$"
            suffix={`/${frequency === 'weekly' ? 'wk' : frequency === 'fortnightly' ? 'fn' : 'mo'}`}
          />
        </div>
      </div>

      {/* Account Interest Rate Selector */}
      <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-semibold text-muted-foreground">Select Youth Savings Account Interest Rate:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {hisaRate.toFixed(2)}% p.a. Monthly Compounding
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_RATES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                sound.playClick();
                setHisaRate(item.rate);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                hisaRate === item.rate
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-muted/60 border-border text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Projection Cards */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground">Timeline to Reach {activeGoal.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Target Date: <strong className="text-foreground">{finalMilestone.projectedDate}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Time Required"
            value={finalMilestone.weeksToReach === 0 ? 'Goal Reached!' : finalMilestone.weeksToReach === Infinity ? 'Needs Deposit' : `${finalMilestone.weeksToReach} Weeks`}
            color="green"
            subtext={finalMilestone.monthsToReach === 0 ? 'Funded' : finalMilestone.monthsToReach === Infinity ? 'Increase deposit' : `~${finalMilestone.monthsToReach} Calendar Months`}
          />
          <StatCard
            label="Cash Deposited"
            value={`$${finalMilestone.totalDeposited.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
            color="blue"
            subtext="From your wages"
          />
          <StatCard
            label="Free Bank Interest"
            value={`+$${finalMilestone.interestEarned.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
            color="purple"
            subtext={`Earned at ${hisaRate.toFixed(2)}%`}
          />
          <StatCard
            label="Final Balance"
            value={`$${(currentSavings + finalMilestone.totalDeposited + finalMilestone.interestEarned).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
            color="amber"
            subtext="100% Cash in bank"
          />
        </div>

        <div className="p-3 rounded-xl bg-card border border-border text-xs flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block mb-0.5">Strategy Tip:</span>
            {activeGoal.tip}
          </div>
        </div>
      </div>

      {/* Compounding Magic: Age 15 vs Age 25 */}
      <Card variant="glass" className="p-5 space-y-3 border-purple-500/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <h3 className="font-bold text-sm text-foreground">The Mathematical Magic of Starting at Age 15 (15yo vs 25yo Comparison)</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {SAVINGS_GOALS_FRAMEWORKS.compoundGrowthComparison.moral}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-card border border-emerald-500/40 space-y-1.5">
            <Badge variant="success" className="text-[10px]">Investor A (Starts at 15)</Badge>
            <p className="text-muted-foreground text-[11px]">
              Contributes <strong>$30/week</strong> from age 15 to 25 (10 years). Total cash invested: <strong>$15,600</strong>. Stops adding cash at 25 and lets it compound at 8.0% p.a. until age 65.
            </p>
            <div className="pt-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Ending Balance at 65: $518k-$584k!
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <Badge variant="outline" className="text-[10px]">Investor B (Waits until 25)</Badge>
            <p className="text-muted-foreground text-[11px]">
              Waits 10 years and contributes <strong>$30/week</strong> from age 25 to 65 (40 years continuous). Total cash invested: <strong>$62,400 (4X MORE CASH!)</strong>.
            </p>
            <div className="pt-1 text-foreground font-bold text-sm">
              Ending Balance at 65: ~$458,000
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-500/10 text-[11px] text-purple-900 dark:text-purple-200 font-medium">
          💡 Investor A finishes with over <strong>$126,000 MORE wealth</strong> while contributing <strong>$46,800 LESS cash</strong>. Time in the market is the ultimate financial superpower!
        </div>
      </Card>

      {/* Hours Worked Psychology Converter */}
      <Card variant="glass" className="p-5 space-y-3 border-amber-500/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-foreground">The "Hours Worked" Rule: Crush Impulse Shopping</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Convert any shopping impulse into physical hours standing on shift before you tap your debit card:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label="Item Price Tag ($)"
            value={itemPrice}
            onChange={v => setItemPrice(v)}
            min={10}
            max={5000}
            step={10}
            prefix="$"
          />
          <div>
            <NumberInput
              label="Your Hourly Casual Wage ($/hr)"
              value={juniorWage}
              onChange={v => setJuniorWage(v)}
              min={10}
              max={50}
              step={0.5}
              prefix="$"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {MODERN_AWARD_WAGES.map((aw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setJuniorWage(aw.wage);
                  }}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all ${
                    juniorWage === aw.wage
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {aw.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-foreground block">
              Physical Work Required: <span className="text-amber-600 dark:text-amber-400 font-mono text-base">{hoursConversion.hours} hours</span> (~{hoursConversion.roundedShifts} x 3-hour casual shifts)
            </span>
            <span className="text-[11px] text-muted-foreground">
              Ask yourself: "Is this item worth {hoursConversion.hours} hours of dishwashing or burger-flipping on shift?"
            </span>
          </div>
          <div className="shrink-0 text-right">
            <Badge variant="warning" className="text-[10px]">
              {itemPrice >= 100 ? 'Apply 7-Day Wishlist' : 'Apply 24h Cooling Off'}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="pt-2 flex flex-wrap gap-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_saving_goals} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_budget} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.barefoot_teen_buckets} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_prepl} />
      </div>
    </Card>
  );
}

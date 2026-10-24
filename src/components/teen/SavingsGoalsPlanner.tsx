import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { SAVINGS_GOALS_FRAMEWORKS, OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
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
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';

interface GoalPreset {
  id: string;
  name: string;
  category: 'Short-Term' | 'Medium-Term' | 'Long-Term';
  target: number;
  icon: string;
  description: string;
  tip: string;
}

const PRESET_GOALS: GoalPreset[] = [
  {
    id: 'mojo_500',
    name: '$500 Mojo Safety Cushion',
    category: 'Short-Term',
    target: 500,
    icon: '🛡️',
    description: 'Scott Pape\'s foundational emergency buffer stored in a separate HISA with NO debit card.',
    tip: 'Funded in ~15 to 23 weeks on an 8–12 hr/wk teen paycheck.',
  },
  {
    id: 'driving_lessons_700',
    name: '10 Professional Driving Lessons (3-for-1)',
    category: 'Medium-Term',
    target: 700,
    icon: '🚗',
    description: 'Under QLD/NSW rules, 10 instructor hours equal 30 logbook hours. Total cost: $700-$850.',
    tip: 'Save $18/week over 9 months to book your 10 lessons before turning 17.',
  },
  {
    id: 'laptop_byod_1200',
    name: 'Senior School BYOD Laptop / iPad',
    category: 'Medium-Term',
    target: 1200,
    icon: '💻',
    description: 'MacBook Air or Windows ultrabook for Year 11–12 studies using Apple/JB Hi-Fi student discounts.',
    tip: 'Save $25/week over 12 months, and check student discounts to save an extra $150–$250.',
  },
  {
    id: 'car_fund_5000',
    name: 'Reliable First Used Car (Zero Debt!)',
    category: 'Long-Term',
    target: 5000,
    icon: '🚘',
    description: 'A reliable used car costs $4,000-$7,000. Buy 100% in cash without predatory 14% car loans.',
    tip: 'Save $50/week for 2 years while living at home with $0 rent to buy outright.',
  },
  {
    id: 'car_onroad_sinking_2500',
    name: '1st Year Car On-Road Sinking Fund',
    category: 'Long-Term',
    target: 2500,
    icon: '⛽️',
    description: 'Crucial buffer for $2,500-$3,500 first-year running costs (comprehensive insurance, QLD rego & CTP, and first service).',
    tip: 'Never buy a car without having this fund ready — otherwise rego renewal turns into a crisis.',
  },
];

const SAVINGS_PLANNER_STORAGE_KEY = 'pft_savings_planner_state';

export function SavingsGoalsPlanner() {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('mojo_500');
  const [customTarget, setCustomTarget] = useState<number>(500);
  const [weeklyDeposit, setWeeklyDeposit] = useState<number>(25);
  const [currentSavings, setCurrentSavings] = useState<number>(100);
  const [itemPrice, setItemPrice] = useState<number>(140);
  const [juniorWage, setJuniorWage] = useState<number>(13.90);

  // Restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVINGS_PLANNER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedGoalId) setSelectedGoalId(parsed.selectedGoalId);
        if (typeof parsed.customTarget === 'number') setCustomTarget(parsed.customTarget);
        if (typeof parsed.weeklyDeposit === 'number') setWeeklyDeposit(parsed.weeklyDeposit);
        if (typeof parsed.currentSavings === 'number') setCurrentSavings(parsed.currentSavings);
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
          weeklyDeposit,
          currentSavings,
          itemPrice,
          juniorWage,
        })
      );
    } catch {
      // ignore
    }
  }, [selectedGoalId, customTarget, weeklyDeposit, currentSavings, itemPrice, juniorWage]);

  const activeGoal = useMemo(() => {
    return PRESET_GOALS.find(g => g.id === selectedGoalId) || {
      id: 'custom',
      name: 'Custom Savings Goal',
      category: 'Medium-Term' as const,
      target: customTarget,
      icon: '🎯',
      description: 'Personalized savings target for your own financial independence goal.',
      tip: 'Break big numbers into weekly targets to harness momentum.',
    };
  }, [selectedGoalId, customTarget]);

  const targetAmount = selectedGoalId === 'custom' ? customTarget : activeGoal.target;

  // Progress metrics
  const progressRatio = targetAmount > 0 ? (currentSavings / targetAmount) : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));
  const remainingDollars = Math.max(0, targetAmount - currentSavings);

  // Quick action deposits
  const handleAddSavings = (amount: number) => {
    sound.playClick();
    const next = Math.max(0, currentSavings + amount);
    setCurrentSavings(next);

    if (next >= targetAmount && currentSavings < targetAmount) {
      sound.playGoalCelebration();
      try {
        confetti({
          particleCount: 60,
          spread: 75,
          origin: { y: 0.4 },
          disableForReducedMotion: true,
        });
      } catch {}
    }
  };

  const handleSetPercent = (pct: number) => {
    sound.playClick();
    const next = Math.round((targetAmount * pct) / 100);
    setCurrentSavings(next);
  };

  const handleResetSavings = () => {
    sound.playClick();
    setCurrentSavings(0);
  };

  // Projection maths (5.50% p.a. monthly compound rate)
  const ratePct = 5.50;
  const monthlyRate = ratePct / 100 / 12;
  const monthlyDeposit = (weeklyDeposit * 52) / 12;

  const timeline = useMemo(() => {
    const start = Math.max(currentSavings, 0);
    const target = Math.max(targetAmount, start);
    if (start >= target) {
      return { months: 0, weeks: 0, interest: 0, totalSaved: start };
    }
    if (monthlyDeposit === 0) {
      return { months: Infinity, weeks: Infinity, interest: 0, totalSaved: start };
    }

    let bal = start;
    let m = 0;
    let interestTotal = 0;
    while (bal < target && m < 600) {
      m++;
      bal += monthlyDeposit;
      const int = bal * monthlyRate;
      bal += int;
      interestTotal += int;
    }

    const reached = bal >= target;
    const weeks = reached ? Math.round((m * 52) / 12) : Infinity;
    return { months: reached ? m : Infinity, weeks, interest: interestTotal, totalSaved: bal };
  }, [currentSavings, targetAmount, monthlyDeposit, monthlyRate]);

  // Hours worked conversion
  const hoursRequired = useMemo(() => {
    return (itemPrice / Math.max(juniorWage, 1)).toFixed(1);
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
            Master SMART youth savings targets, 3-for-1 driving lesson economics, and compound interest growth! (Average Aussie teen savings: ~$4,769 in 2026)
          </p>
        </div>
        <Badge variant="success">
          Barefoot & Sinking Funds
        </Badge>
      </div>

      {/* Preset Goal Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground block">Select a Proven Teen Milestone Goal:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                <span className="text-base">{goal.icon}</span>
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
              <span className="text-base">🎯</span>
              <Badge variant={selectedGoalId === 'custom' ? 'success' : 'outline'} className="text-[9px]">
                Custom
              </Badge>
            </div>
            <h4 className="font-bold text-xs text-foreground leading-snug">Custom Sinking Fund</h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              Set any custom target amount (gaming console, formal outfit, holiday trip).
            </p>
          </button>
        </div>
      </div>

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

          {/* Milestone markers at 25%, 50%, 75% */}
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1 px-1">
            <span className={progressPercent >= 0 ? 'text-primary font-bold' : ''}>0%</span>
            <span className={progressPercent >= 25 ? 'text-primary font-bold' : ''}>25%</span>
            <span className={progressPercent >= 50 ? 'text-primary font-bold' : ''}>50%</span>
            <span className={progressPercent >= 75 ? 'text-primary font-bold' : ''}>75%</span>
            <span className={progressPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>100% 🎯</span>
          </div>
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
              +$100 Full Shift
            </button>
            <button
              type="button"
              onClick={() => handleSetPercent(50)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
            >
              Halfway (50%)
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
          max={20000}
          step={25}
          prefix="$"
        />
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Weekly Paycheck Savings ($/wk)</label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${weeklyDeposit}/wk
            </span>
            <span className="text-[11px] text-muted-foreground">
              (~${monthlyDeposit.toFixed(0)}/month)
            </span>
          </div>
          <SliderControl
            label="Weekly Deposit Amount"
            value={weeklyDeposit}
            onChange={v => setWeeklyDeposit(v)}
            min={5}
            max={200}
            step={5}
            prefix="$"
            suffix="/wk"
          />
        </div>
      </div>

      {/* Results Projection Cards */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground">Timeline to Reach {activeGoal.name}</h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Compounding at 5.50% p.a. Youth HISA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Time Required"
            value={timeline.weeks === 0 ? 'Goal Reached!' : timeline.weeks === Infinity ? 'Needs Deposit' : `${timeline.weeks} Weeks`}
            color="green"
            subtext={timeline.months === 0 ? 'Funded' : timeline.months === Infinity ? 'Increase weekly savings' : `~${timeline.months} Calendar Months`}
          />
          <StatCard
            label="Cash Deposited"
            value={`$${Math.max(targetAmount - currentSavings - timeline.interest, 0).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
            color="blue"
            subtext="From your weekly shifts"
          />
          <StatCard
            label="Free Bank Interest"
            value={`+$${timeline.interest.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
            color="purple"
            subtext="Earned on deposits"
          />
          <StatCard
            label="Final Balance"
            value={`$${timeline.totalSaved.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`}
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
            max={2000}
            step={10}
            prefix="$"
          />
          <NumberInput
            label="Your 15yo Casual Hourly Wage ($/hr)"
            value={juniorWage}
            onChange={v => setJuniorWage(v)}
            min={10}
            max={35}
            step={0.5}
            prefix="$"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-foreground block">
              Physical Work Required: <span className="text-amber-600 dark:text-amber-400 font-mono text-base">{hoursRequired} hours</span> on shift!
            </span>
            <span className="text-[11px] text-muted-foreground">
              Ask yourself: "Is this item worth {hoursRequired} hours of washing dishes or making burgers?"
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

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Badge } from '@/components/ui/Badge';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Lock,
  Check,
  X,
  Building,
  ArrowRightLeft,
  ShieldAlert,
} from 'lucide-react';
import {
  savingsWithMonthlyCompound,
  savingsWithSimpleInterest,
  calcMonthsToReachGoal,
  calcGoalMilestones,
  evaluateAccountQualification,
  calcEffectiveAnnualRate,
  type AccountHabits,
} from './engine';
import { formatCurrency } from '@/utils/formatters';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';

type AgeFilter = 'all' | '15yo' | '16-17' | '18+';

interface SavingsGoalPreset {
  balance: number;
  deposit: number;
  goal: number;
  age: AgeFilter;
}

const SAVINGS_PRESETS: ScenarioPreset<SavingsGoalPreset>[] = [
  {
    id: 'mojo',
    label: '$500 Mojo Safety Net',
    badge: 'Barefoot Step 1',
    description: 'Foundational emergency fund ($500–$1,000) stored with NO debit card linked',
    values: { balance: 150, deposit: 50, goal: 500, age: '15yo' },
  },
  {
    id: 'formal',
    label: '$850 School Formal',
    badge: 'Formal Package',
    description: 'Full formal package: ticket, suit/dress hire, and shoes ($600–$1,200 range)',
    values: { balance: 200, deposit: 60, goal: 850, age: '16-17' },
  },
  {
    id: 'uni-tech',
    label: '$1,400 BYOD Laptop',
    badge: 'Study Tech',
    description: 'MacBook Air or Windows PC for Year 11/12 with student discount ($1,000–$2,000)',
    values: { balance: 400, deposit: 100, goal: 1400, age: '16-17' },
  },
  {
    id: 'car-fund',
    label: '$5,000 First Car Fund',
    badge: 'First Car',
    description: 'Reliable cash purchase for your first Japanese 4-cyl ($3,500–$6,000 range)',
    values: { balance: 800, deposit: 150, goal: 5000, age: '16-17' },
  },
];

export function TeenSavingsAccountFinder() {
  const [savingsBalance, setSavingsBalance] = useState<number>(1500);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50);
  const [monthlyCompounding, setMonthlyCompounding] = useState<boolean>(true);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('15yo');
  const [goalTarget, setGoalTarget] = useState<number>(500);
  const [activePreset, setActivePreset] = useState<string | undefined>('mojo');
  const [selectedBankName, setSelectedBankName] = useState<string | null>(null);

  // Dynamic Monthly Bonus Qualification Habits
  const [userAge, setUserAge] = useState<number>(15);
  const [cardPurchases, setCardPurchases] = useState<number>(0);
  const [isBalanceGrowing, setIsBalanceGrowing] = useState<boolean>(true);
  const [monthlyWithdrawals, setMonthlyWithdrawals] = useState<number>(0);

  const habits: AccountHabits = useMemo(() => ({
    monthlyDeposit,
    monthlyDebitCardPurchases: cardPurchases,
    isBalanceGrowing,
    monthlyWithdrawals,
    userAge,
  }), [monthlyDeposit, cardPurchases, isBalanceGrowing, monthlyWithdrawals, userAge]);

  const handleApplyPreset = (preset: ScenarioPreset<SavingsGoalPreset>) => {
    sound.playClick();
    setActivePreset(preset.id);
    if (preset.values.balance !== undefined) setSavingsBalance(preset.values.balance);
    if (preset.values.deposit !== undefined) setMonthlyDeposit(preset.values.deposit);
    if (preset.values.goal !== undefined) setGoalTarget(preset.values.goal);
    if (preset.values.age !== undefined) {
      setAgeFilter(preset.values.age);
      if (preset.values.age === '15yo') setUserAge(15);
      else if (preset.values.age === '16-17') setUserAge(16);
      else if (preset.values.age === '18+') setUserAge(18);
    }
  };

  const handleReset = useCallback(() => {
    sound.playClick();
    setActivePreset(undefined);
    setSavingsBalance(1500);
    setMonthlyDeposit(50);
    setMonthlyCompounding(true);
    setAgeFilter('15yo');
    setUserAge(15);
    setCardPurchases(0);
    setIsBalanceGrowing(true);
    setMonthlyWithdrawals(0);
    setGoalTarget(500);
    setSelectedBankName(null);
  }, []);

  // Filter accounts based on selected age bracket
  const filteredAccounts = useMemo(() => {
    return TEEN_SAVINGS_ACCOUNTS.filter(a => {
      if (ageFilter === '15yo') return a.minAge <= 15 && a.maxAge >= 15;
      if (ageFilter === '16-17') return a.minAge <= 17 && a.maxAge >= 16;
      if (ageFilter === '18+') return a.minAge <= 18 && a.maxAge >= 18;
      return true;
    });
  }, [ageFilter]);

  // Evaluated accounts with dynamic qualification
  const evaluatedAccounts = useMemo(() => {
    return filteredAccounts.map(account => {
      const evaluation = evaluateAccountQualification(account, habits, savingsBalance);
      return {
        account,
        evaluation,
      };
    });
  }, [filteredAccounts, habits, savingsBalance]);

  // Determine active selected account or best qualifying account
  const activeSelectedAccount = useMemo(() => {
    if (selectedBankName) {
      const match = evaluatedAccounts.find(ea => ea.account.bank === selectedBankName);
      if (match) return match;
    }
    // Default to the highest effective rate among evaluated accounts
    return evaluatedAccounts.reduce((prev, curr) => {
      return curr.evaluation.effectiveRate > prev.evaluation.effectiveRate ? curr : prev;
    }, evaluatedAccounts[0]);
  }, [selectedBankName, evaluatedAccounts]);

  const projectionRate = activeSelectedAccount ? activeSelectedAccount.evaluation.effectiveRate : 5.50;

  // 12-Month Projection
  const projection = useMemo(() => {
    const months = 12;
    return monthlyCompounding
      ? savingsWithMonthlyCompound(savingsBalance, projectionRate, months, monthlyDeposit)
      : savingsWithSimpleInterest(savingsBalance, projectionRate, months, monthlyDeposit);
  }, [savingsBalance, monthlyDeposit, monthlyCompounding, projectionRate]);

  // Target Savings Goal Projection
  const goalProjection = useMemo(() => {
    return calcMonthsToReachGoal(savingsBalance, goalTarget, monthlyDeposit, projectionRate);
  }, [savingsBalance, goalTarget, monthlyDeposit, projectionRate]);

  // Goal Milestones
  const goalMilestones = useMemo(() => {
    return calcGoalMilestones(savingsBalance, goalTarget, monthlyDeposit, projectionRate);
  }, [savingsBalance, goalTarget, monthlyDeposit, projectionRate]);

  const handleGoalButtonClick = (target: number) => {
    sound.playClick();
    setGoalTarget(target);
    if (savingsBalance >= target) {
      sound.playGoalCelebration();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.4 },
          disableForReducedMotion: true,
        });
      } catch {}
    }
  };

  const summaryText = useMemo(() => {
    return [
      '--- High-Yield Teen Savings Account Summary (2026-27) ---',
      `Selected Bank: ${activeSelectedAccount?.account.bank ?? 'Top Youth Account'}`,
      `Starting Balance: ${formatCurrency(savingsBalance)} | Monthly Deposit: ${formatCurrency(monthlyDeposit)}/mo`,
      `Effective Youth Rate: ${projectionRate.toFixed(2)}% p.a. (${activeSelectedAccount?.evaluation.qualifies ? 'Bonus rate conditions met' : 'Base rate applied'})`,
      `Monthly Bonus Criteria Status: ${activeSelectedAccount?.evaluation.reasons.join(', ') || 'All requirements satisfied'}`,
      `12-Month Projected Total: ${formatCurrency(projection.endingBalance)} (Interest Earned: +${formatCurrency(projection.interestEarned)})`,
      `Target Goal ($${goalTarget.toLocaleString()}): Reached in ${goalProjection.monthsToReach} months (~${goalProjection.weeksToReach} weeks)`,
      `APRA Protected: Yes (up to $250,000 AUD per depositor) | Monthly Account Keeping Fees: $0`,
      `Calculated via AusFinTools Teen Savings Finder`,
    ].join('\n');
  }, [activeSelectedAccount, savingsBalance, monthlyDeposit, projectionRate, projection, goalTarget, goalProjection]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">High-Yield Teen Savings Finder & Goal Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare verified Australian 5%+ youth savings accounts: BOQ Future Saver (5.80%), Newcastle Perm (5.75%), Great Southern Bank (5.50%), ING Youth Saver (5.50%), and Westpac. Check dynamic bonus criteria and zero fees!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            2026-27 AU Bank Rates
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            APRA $250k Protected
          </Badge>
        </div>
      </div>

      {/* Quick Savings Presets */}
      <QuickPresetBar
        presets={SAVINGS_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Practical Teen Savings Goal Benchmarks"
      />

      {/* Age Eligibility Filter Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground block">Filter by Age Eligibility:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAgeFilter('15yo');
              setUserAge(15);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              ageFilter === '15yo'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            🎯 Age 15 (First Job)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAgeFilter('16-17');
              setUserAge(16);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              ageFilter === '16-17'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            Ages 16–17
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAgeFilter('18+');
              setUserAge(18);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              ageFilter === '18+'
                ? 'bg-purple-500 text-white border-purple-500 shadow-xs'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            Ages 18+ (Adult)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAgeFilter('all');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              ageFilter === 'all'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            All Accounts ({TEEN_SAVINGS_ACCOUNTS.length})
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Qualification Habit Checker */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-primary" />
            Your Monthly Banking Habits & Qualification Profile
          </span>
          <Badge variant="outline" className="text-[10px]">
            Age: {userAge} Years Old
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            label="Current Savings Balance ($)"
            value={savingsBalance}
            onChange={v => setSavingsBalance(v)}
            min={0}
            max={50000}
            step={50}
            prefix="$"
          />

          <NumberInput
            label="Monthly Deposit from Pay ($/mo)"
            value={monthlyDeposit}
            onChange={v => setMonthlyDeposit(v)}
            min={0}
            max={2000}
            step={10}
            prefix="$"
          />

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Monthly Debit Card Purchases
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 2, 5, 20].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCardPurchases(count);
                  }}
                  className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                    cardPurchases === count
                      ? 'bg-primary text-white border-primary'
                      : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {count === 0 ? '0' : count === 20 ? '20+' : count === 5 ? '5+' : count}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">
              {cardPurchases === 0 ? 'No debit card purchases' : `${cardPurchases}+ card taps/mo`}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Grow Balance Month-on-Month?
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsBalanceGrowing(true);
                }}
                className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                  isBalanceGrowing
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                }`}
              >
                Yes (Grow)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsBalanceGrowing(false);
                }}
                className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                  !isBalanceGrowing
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                }`}
              >
                No (Withdraw)
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">
              {isBalanceGrowing ? 'Balance increases each month' : 'Net withdrawals occur'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Savings Goal Timeline Planner */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/20 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Interactive Savings Goal Timeline Simulator</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleGoalButtonClick(500)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                goalTarget === 500 ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $500 Mojo Buffer
            </button>
            <button
              type="button"
              onClick={() => handleGoalButtonClick(850)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                goalTarget === 850 ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $850 Formal Package
            </button>
            <button
              type="button"
              onClick={() => handleGoalButtonClick(1400)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                goalTarget === 1400 ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $1,400 Laptop
            </button>
            <button
              type="button"
              onClick={() => handleGoalButtonClick(5000)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                goalTarget === 5000 ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $5,000 First Car
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Target Goal</div>
            <div className="text-lg font-bold font-mono text-foreground">${goalTarget.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Time to Reach</div>
            <div className="text-lg font-bold font-mono text-primary">
              {goalProjection.monthsToReach === 0
                ? 'Goal Reached! 🎉'
                : goalProjection.monthsToReach === Infinity
                ? 'Needs Deposit'
                : `${goalProjection.monthsToReach} mo (~${goalProjection.weeksToReach} wks)`}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Your Deposits</div>
            <div className="text-lg font-bold font-mono text-foreground">
              ${goalProjection.totalDeposited.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Compound Interest</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +${goalProjection.interestEarned.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Milestone Milestones Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {goalMilestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-center transition-all ${
                m.reached
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-foreground'
                  : 'bg-card/70 border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="font-bold">{m.badge}</span>
                <span className="font-mono">{m.projectedDate}</span>
              </div>
              <div className="text-xs font-bold font-mono text-foreground">${m.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          💡 Simulated at <strong>{projectionRate.toFixed(2)}% p.a.</strong> ({activeSelectedAccount?.account.bank ?? 'Top Youth Account'}). Every dollar deposited grows month-on-month with compound interest, adding free money to your balance!
        </p>
      </div>

      {/* 12-Month Growth Projection Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                12-Month Projection at {projectionRate.toFixed(2)}% p.a.
              </h3>
              {monthlyCompounding && projectionRate > 0 && (
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {calcEffectiveAnnualRate(projectionRate, 12).toFixed(2)}% EAR
                </Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMonthlyCompounding(!monthlyCompounding);
            }}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              monthlyCompounding
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {monthlyCompounding ? 'Monthly Compounding (Standard)' : 'Simple Interest Baseline'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Balance in 12 mo</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${projection.endingBalance.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Interest Earned</div>
            <div className="text-lg font-bold font-mono text-foreground">
              ${projection.interestEarned.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Your Deposits</div>
            <div className="text-lg font-bold font-mono text-foreground">
              ${projection.totalDeposited.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Compounding Bonus</div>
            <div className="text-lg font-bold font-mono text-foreground">
              +${(projection.interestEarned - savingsWithSimpleInterest(savingsBalance, projectionRate, 12, monthlyDeposit).interestEarned).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            All accounts feature <strong>$0 Monthly Account Keeping Fees</strong> and are protected by the Australian Government APRA Guarantee up to $250,000.
          </span>
        </div>
      </div>

      {/* Account Comparison List with Dynamic Qualification */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Comparing {evaluatedAccounts.length} accounts for {ageFilter === '15yo' ? '15-year-olds' : ageFilter === '16-17' ? '16–17 year olds' : ageFilter === '18+' ? '18+ adults' : 'all ages'}:
          </span>
          <span>Click any card to simulate that account's rate</span>
        </div>

        {evaluatedAccounts.map(({ account, evaluation }) => {
          const isSelected = activeSelectedAccount?.account.bank === account.bank;
          const qualifies = evaluation.qualifies;

          return (
            <div
              key={account.bank}
              onClick={() => {
                sound.playClick();
                setSelectedBankName(account.bank);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/40'
                  : 'border-border bg-card/80 hover:bg-muted/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground">{account.bank}</h3>

                    {qualifies ? (
                      <Badge variant="success" className="text-[9px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {evaluation.hasWaiverApplied ? 'Under 18 Waiver Active' : 'Bonus Rate Unlocked'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Base Rate Only
                      </Badge>
                    )}

                    <Badge variant="outline" className="text-[9px] text-muted-foreground">
                      $0 Fees
                    </Badge>

                    {account.canOpenIndependentlyAt15 && (
                      <Badge variant="outline" className="text-[9px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        Independent at 15
                      </Badge>
                    )}

                    {account.requiresParentUnder16 && (
                      <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 dark:text-amber-400">
                        Parent Co-Sign &lt;16
                      </Badge>
                    )}

                    {account.hasCardlessOption && (
                      <Badge variant="outline" className="text-[9px]">
                        Cardless Mojo
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Conditions: {account.conditions}
                  </p>

                  {!qualifies && evaluation.reasons.length > 0 && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <X className="w-3 h-3 shrink-0" />
                      <span>{evaluation.reasons.join(' • ')}</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-base font-black ${qualifies ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {evaluation.effectiveRate.toFixed(2)}% p.a.
                  </span>
                  <span className="text-xs text-muted-foreground block font-medium">
                    +${evaluation.annualInterestOnBalance.toFixed(2)} interest/yr
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2 mt-2">
                <span>Best for: {account.bestFor}</span>
                <span className="font-mono text-[10px]">
                  Ages {account.minAge}–{account.maxAge === 99 ? 'Any' : account.maxAge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 15-Year-Old Golden Banking Rules & Tips */}
      <Card variant="glass" className="p-5 space-y-3 border-amber-500/30">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-foreground">15-Year-Old Banking Tips & Golden Security Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1. Independent Banking at 15
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              At 15 in Australia, you can open fee-free transaction and savings accounts in your own name without parent co-signing at CBA, Westpac, BOQ, ANZ Plus, and Great Southern Bank. Bring 100 points of ID (Birth Certificate + School Photo ID + Medicare).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              2. Quote Your TFN Under s 202D
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Under Tax Administration Act s 202D, banks seize 47% tax on savings interest without a TFN. Under 16s are exempt up to $420/yr interest; at 16–17 the threshold plunges to just $120/yr. Always quote your TFN!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-500" />
              3. The 2-Account Psychological Friction Rule
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Keep a transaction account with Visa/Mastercard Debit for daily Blow (lunch, transport). Keep your Mojo ($500) and Grow savings in a high-interest account with NO card linked to stop impulse tap-and-go buys.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              4. Digital Wallets & Tokenization (13+)
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Teens 13+ can link debit cards to Apple Pay or Google Wallet. Digital wallets use encrypted hardware Device Account Numbers (DPAN) with Face ID/Touch ID, protecting you against card skimming and loss.
            </p>
          </div>
        </div>
      </Card>

      {/* Term Deposits vs High-Interest Savings (HISA) Guide Card */}
      <Card variant="glass" className="p-5 space-y-3 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Term Deposits vs High-Interest Savings (HISA)</h3>
          </div>
          <Badge variant="outline" className="text-[10px]">
            APRA APS 210 Liquidity Rules
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Youth High-Interest Savings (HISA)
            </span>
            <ul className="text-muted-foreground text-[11px] space-y-1 leading-relaxed list-disc list-inside">
              <li><strong>At-Call Liquidity:</strong> Withdraw or transfer cash instantly 24/7 via PayID with zero lock-in penalties.</li>
              <li><strong>Paycheck Compounding:</strong> Add regular savings ($25, $50, $200/mo) from every wage to compound interest monthly.</li>
              <li><strong>Top Yields:</strong> Up to 5.50%–5.80% p.a. with low/waived hurdles for teens under 18.</li>
              <li><strong>Best for:</strong> Emergency Mojo cushion ($500), first car sinking funds, and regular paychecks.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-500" />
              Fixed Term Deposits (1–24 Months)
            </span>
            <ul className="text-muted-foreground text-[11px] space-y-1 leading-relaxed list-disc list-inside">
              <li><strong>Rate Lock Certainty:</strong> Guarantees your interest rate (e.g. 4.50%–5.20% p.a.) if RBA cuts rates ahead.</li>
              <li><strong>31-Day Notice Rule:</strong> Under APRA APS 210, you must give 31 days' advance notice to break early, plus forfeit 20%–50%+ of interest!</li>
              <li><strong>Lump Sum Only:</strong> Requires $1,000+ upfront deposit; you cannot add monthly savings midway.</li>
              <li><strong>Best for:</strong> Static cash sums (e.g. car sale proceeds or gift) that you will not touch for 6–12 months.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Cyber Scam Defense & PayID Protection Card */}
      <Card variant="glass" className="p-5 space-y-3 border-rose-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm text-foreground">Anti-Scam Defense & Cyber Shield (ACCC Scamwatch)</h3>
          </div>
          <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-600 dark:text-rose-400">
            Criminal Code Div 400 Warning
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Confirmation of Payee & PayID
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              When transferring funds, Confirmation of Payee and NameCheck verify the recipient's real legal name before money leaves your account. If the bank warns "No Match", abort immediately! PayID is always 100% free — "PayID Business Account" fee requests are scams.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Remote Access Scam Trap (AnyDesk)
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Never install AnyDesk or TeamViewer for anyone claiming to be from your bank's "fraud team". Banks NEVER ask you to download remote screen software, NEVER ask for 2FA SMS security codes, and NEVER have "safe holding accounts" for you to transfer money into.
            </p>
          </div>
        </div>
      </Card>

      {/* APRA FCS Notice Card */}
      <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Australian Government $250,000 Deposit Guarantee (APRA FCS)
          </span>
          <Badge variant="success" className="text-[10px]">100% Protected</Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Under the Banking Act 1959, your deposits in any APRA-regulated Australian bank or credit union are legally guaranteed by the Federal Government up to $250,000 AUD per depositor per ADI.
        </p>
        <p className="text-rose-600 dark:text-rose-400 font-medium text-[11px] pt-1 border-t border-border/50 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Scam Warning: Never let online strangers or TikTok "employers" transfer money through your account. "Money muling" is a federal money-laundering crime under Criminal Code Act 1995 carrying up to 10–25 years imprisonment!
        </p>
      </div>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Youth Savings Analysis"
      />

      <div className="pt-2 flex flex-wrap gap-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.apra_fcs} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn_bank} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_banking} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_saving_goals} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_compound} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.scamwatch_au} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.acsc_cyber_safety} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_young_workers} />
      </div>
    </Card>
  );
}

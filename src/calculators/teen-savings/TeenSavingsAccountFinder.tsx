import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, TrendingUp, Target, ShieldCheck, CheckCircle2, AlertTriangle, Smartphone, Lock } from 'lucide-react';
import { savingsWithMonthlyCompound, savingsWithSimpleInterest, calcMonthsToReachGoal } from './engine';

type AgeFilter = 'all' | '15yo' | '16-17' | '18+';

export function TeenSavingsAccountFinder() {
  const [savingsBalance, setSavingsBalance] = useState<number>(1500);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50);
  const [meetsConditions, setMeetsConditions] = useState<boolean>(true);
  const [monthlyCompounding, setMonthlyCompounding] = useState<boolean>(true);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('15yo');
  const [goalTarget, setGoalTarget] = useState<number>(500);

  // Filter accounts based on selected age bracket
  const filteredAccounts = useMemo(() => {
    return TEEN_SAVINGS_ACCOUNTS.filter(a => {
      if (ageFilter === '15yo') return a.minAge <= 15 && a.maxAge >= 15;
      if (ageFilter === '16-17') return a.minAge <= 17 && a.maxAge >= 16;
      if (ageFilter === '18+') return a.minAge <= 18 && a.maxAge >= 18;
      return true;
    });
  }, [ageFilter]);

  // Best bonus rate across the filtered accounts
  const bestBonusRate = Math.max(...filteredAccounts.map(a => a.maxRate), 5.00);
  const bestBaseRate = Math.max(...filteredAccounts.map(a => a.baseRate), 0.05);
  const projectionRate = meetsConditions ? bestBonusRate : bestBaseRate;

  // 12-Month Projection
  const projection = useMemo(() => {
    const months = 12;
    return monthlyCompounding
      ? savingsWithMonthlyCompound(savingsBalance, projectionRate, months, monthlyDeposit)
      : savingsWithSimpleInterest(savingsBalance, projectionRate, months, monthlyDeposit);
  }, [savingsBalance, monthlyDeposit, monthlyCompounding, projectionRate]);

  // Target Savings Goal Projection (using calcMonthsToReachGoal)
  const goalProjection = useMemo(() => {
    return calcMonthsToReachGoal(savingsBalance, goalTarget, monthlyDeposit, projectionRate);
  }, [savingsBalance, goalTarget, monthlyDeposit, projectionRate]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">High-Yield Teen Savings Finder & Goal Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare top Australian 5%+ youth savings accounts, filter by 15-year-old eligibility, and track your goal timelines!
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

      {/* Age Eligibility Filter Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground block">Filter by Age Eligibility:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setAgeFilter('15yo')}
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
            onClick={() => setAgeFilter('16-17')}
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
            onClick={() => setAgeFilter('18+')}
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
            onClick={() => setAgeFilter('all')}
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

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Current Savings Balance ($)"
            value={savingsBalance}
            onChange={v => setSavingsBalance(v)}
            min={0}
            max={50000}
            step={50}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <NumberInput
            label="Monthly Deposit from Paycheck ($)"
            value={monthlyDeposit}
            onChange={v => setMonthlyDeposit(v)}
            min={0}
            max={2000}
            step={10}
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block font-medium">Monthly Bonus Conditions Met?</label>
          <button
            type="button"
            onClick={() => setMeetsConditions(!meetsConditions)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
              meetsConditions
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                : 'bg-rose-500 text-white border-rose-500 shadow-xs'
            }`}
          >
            {meetsConditions ? `YES (Bonus ${bestBonusRate.toFixed(2)}% Unlocked!)` : 'NO (Base Rate Only)'}
          </button>
        </div>
      </div>

      {/* Interactive Savings Goal Timeline Planner */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/20 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Interactive Savings Goal Timeline</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setGoalTarget(500)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                goalTarget === 500 ? 'bg-primary text-white border-primary' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $500 Mojo Buffer
            </button>
            <button
              type="button"
              onClick={() => setGoalTarget(700)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                goalTarget === 700 ? 'bg-primary text-white border-primary' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $700 10 Ls Lessons
            </button>
            <button
              type="button"
              onClick={() => setGoalTarget(1200)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                goalTarget === 1200 ? 'bg-primary text-white border-primary' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              $1,200 Laptop
            </button>
            <button
              type="button"
              onClick={() => setGoalTarget(5000)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                goalTarget === 5000 ? 'bg-primary text-white border-primary' : 'bg-card border-border text-foreground hover:bg-muted'
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
                ? 'Goal Reached!'
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

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          💡 At <strong>${monthlyDeposit}/month</strong> in a <strong>{projectionRate.toFixed(2)}% p.a.</strong> account, your savings grow by compounding every month. The sooner you start funding your goal, the more free interest your bank adds to your balance!
        </p>
      </div>

      {/* 12-month projection */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground">12-Month Projection at {projectionRate.toFixed(2)}% p.a.</h3>
          </div>
          <button
            type="button"
            onClick={() => setMonthlyCompounding(!monthlyCompounding)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              monthlyCompounding
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {monthlyCompounding ? 'Monthly Compounding' : 'Simple Interest'}
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
        <p className="text-[11px] text-muted-foreground">
          Youth savings accounts pay bonus interest monthly — that's why the interest compounds. Every extra dollar deposited today earns interest <strong>for the rest of the year</strong>, so it's worth hitting the bank's deposit-conditions every single month.
        </p>
      </div>

      {/* Account Comparison List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Showing {filteredAccounts.length} accounts for {ageFilter === '15yo' ? '15-year-olds' : ageFilter === '16-17' ? '16–17 year olds' : ageFilter === '18+' ? '18+ adults' : 'all ages'}:</span>
          <span>Ranked by Top Bonus Rate</span>
        </div>

        {filteredAccounts.map(account => {
          const effectiveRate = meetsConditions ? account.maxRate : account.baseRate;
          const annualInterest = (savingsBalance * effectiveRate) / 100;

          return (
            <div key={account.bank} className="p-4 rounded-2xl border border-border bg-card/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground">{account.bank}</h3>
                    {account.canOpenIndependentlyAt15 && (
                      <Badge variant="success" className="text-[9px]">
                        Independent at 15 (No Parent)
                      </Badge>
                    )}
                    {account.requiresParentUnder16 && (
                      <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 dark:text-amber-400">
                        Parent Co-Sign &lt;16
                      </Badge>
                    )}
                    {account.hasCardlessOption && (
                      <Badge variant="outline" className="text-[9px]">
                        Cardless Mojo Buffer
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Conditions: {account.conditions}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-base font-black ${meetsConditions ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {effectiveRate.toFixed(2)}% p.a.
                  </span>
                  <span className="text-xs text-muted-foreground block font-medium">
                    +${annualInterest.toFixed(2)} interest/yr
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                <span>Best for: {account.bestFor}</span>
                <span className="font-mono text-[10px]">Ages {account.minAge}–{account.maxAge === 99 ? 'Any' : account.maxAge}</span>
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
          Scam Warning: Never let online strangers transfer money through your account. "Money muling" is a serious criminal money-laundering offence carrying up to 10–25 years imprisonment!
        </p>
      </div>

      <div className="pt-2 flex flex-wrap gap-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.apra_fcs} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn_bank} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_banking} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_saving_goals} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_young_workers} />
      </div>
    </Card>
  );
}

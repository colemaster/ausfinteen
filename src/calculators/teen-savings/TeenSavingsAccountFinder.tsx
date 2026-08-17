import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, TrendingUp } from 'lucide-react';
import { savingsWithMonthlyCompound, savingsWithSimpleInterest } from './engine';

export function TeenSavingsAccountFinder() {
  const [savingsBalance, setSavingsBalance] = useState<number>(1500);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50);
  const [meetsConditions, setMeetsConditions] = useState<boolean>(true);
  const [monthlyCompounding, setMonthlyCompounding] = useState<boolean>(true);

  // Best bonus rate across the featured accounts (default: GSB Youth Saver 5.25%)
  const bestBonusRate = Math.max(...TEEN_SAVINGS_ACCOUNTS.map(a => a.maxRate));

  const projection = useMemo(() => {
    const months = 12;
    return monthlyCompounding
      ? savingsWithMonthlyCompound(savingsBalance, bestBonusRate, months, monthlyDeposit)
      : savingsWithSimpleInterest(savingsBalance, bestBonusRate, months, monthlyDeposit);
  }, [savingsBalance, monthlyDeposit, monthlyCompounding, bestBonusRate]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">High-Yield Teen Savings Finder & Bonus Interest Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare top Australian 5%+ youth savings accounts and see how meeting monthly deposit rules unlocks bonus interest!
          </p>
        </div>
        <Badge variant="success">
          2025-26 AU Bank Rates
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Current Savings Balance ($)"
            value={savingsBalance}
            onChange={v => setSavingsBalance(v)}
            min={100}
            max={50000}
            step={100}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <NumberInput
            label="Monthly Deposit ($)"
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
            {meetsConditions ? 'YES (Bonus 5.25% Unlocked!)' : 'NO (Base 0.05% Rate Only)'}
          </button>
        </div>
      </div>

      {/* 12-month projection */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground">12-Month Projection at {bestBonusRate.toFixed(2)}% p.a.</h3>
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
              +${(projection.interestEarned - savingsWithSimpleInterest(savingsBalance, bestBonusRate, 12, monthlyDeposit).interestEarned).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Youth savings accounts pay bonus interest monthly — that's why the interest compounds. Every extra dollar of
          deposit today earns interest <strong>for the rest of the year</strong>, so it's worth hitting the bank's
          deposit-conditions every single month.
        </p>
      </div>

      {/* Account Comparison List */}
      <div className="space-y-3">
        {TEEN_SAVINGS_ACCOUNTS.map(account => {
          const effectiveRate = meetsConditions ? account.maxRate : account.baseRate;
          const annualInterest = (savingsBalance * effectiveRate) / 100;

          return (
            <div key={account.bank} className="p-4 rounded-2xl border border-border bg-card/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{account.bank}</h3>
                  <p className="text-[11px] text-muted-foreground">Conditions: {account.conditions}</p>
                </div>
                <div className="text-right">
                  <span className={`text-base font-black ${meetsConditions ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {effectiveRate.toFixed(2)}% p.a.
                  </span>
                  <span className="text-xs text-muted-foreground block font-medium">
                    +${annualInterest.toFixed(2)} interest/yr
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_budget} />
      </div>
    </Card>
  );
}

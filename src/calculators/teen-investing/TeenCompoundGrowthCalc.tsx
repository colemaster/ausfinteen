import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, TrendingUp, Percent } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { realReturn } from './engine';

export function TeenCompoundGrowthCalc() {
  const { profile } = useTeenProfile();

  const [weeklyInvestment, setWeeklyInvestment] = useState<number>(15);
  const [startAge, setStartAge] = useState<number>(profile.age);
  const [etfReturnRate, setEtfReturnRate] = useState<number>(8.5);
  const [showRealTerms, setShowRealTerms] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(2.5);

  const monthsTo30 = (30 - startAge) * 12;
  const monthlyEtfRate = etfReturnRate / 100 / 12;
  const monthlyBankRate = 0.045 / 12; // 4.5% bank savings rate

  const fvEtf30 = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, monthsTo30) - 1) / monthlyEtfRate);
  const fvBank30 = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyBankRate, monthsTo30) - 1) / monthlyBankRate);

  const totalCashDeposited = weeklyInvestment * 52 * (30 - startAge);
  const etfCompoundInterest = fvEtf30 - totalCashDeposited;

  // Real (inflation-adjusted) outcomes
  const etfRealRate = realReturn(etfReturnRate, inflationRate);
  const monthlyEtfRealRate = etfRealRate / 100 / 12;
  const bankRealRate = realReturn(4.5, inflationRate);
  const monthlyBankRealRate = bankRealRate / 100 / 12;
  const fvEtfReal = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRealRate, monthsTo30) - 1) / monthlyEtfRealRate);
  const fvBankReal = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyBankRealRate, monthsTo30) - 1) / monthlyBankRealRate);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Share Market & ETF Compound Growth Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            See how investing just a few dollars a week in ASX 200 index ETFs starting at age {startAge} compounds into serious wealth!
          </p>
        </div>
        <Badge variant="success">
          ASX 200 ETF 8.5% Historical Return
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Weekly Micro-Investment ($)"
            value={weeklyInvestment}
            onChange={v => setWeeklyInvestment(v)}
            min={5}
            max={200}
            step={5}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <SliderControl
            label="Starting Age"
            value={startAge}
            onChange={v => setStartAge(v)}
            min={15}
            max={25}
            step={1}
            suffix=" yrs"
          />
        </div>

        <div className="space-y-4">
          <SliderControl
            label="Assumed ETF Annual Return"
            value={etfReturnRate}
            onChange={v => setEtfReturnRate(v)}
            min={4}
            max={12}
            step={0.5}
            suffix="% / yr"
          />
        </div>
      </div>

      {/* Nominal vs Real toggle */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Nominal vs Real (Inflation-Adjusted) Returns</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowRealTerms(!showRealTerms)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showRealTerms
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            {showRealTerms ? 'Showing Real ($ today) Terms' : 'Show Real Terms'}
          </button>
        </div>
        {showRealTerms && (
          <div className="animate-fade-in">
            <SliderControl
              label="Assumed Inflation Rate (RBA target 2-3%)"
              value={inflationRate}
              onChange={v => setInflationRate(v)}
              min={0}
              max={6}
              step={0.5}
              suffix="% / yr"
            />
            <p className="text-[11px] text-muted-foreground">
              At {inflationRate}% inflation, your {etfReturnRate}% nominal ETF return is really a{' '}
              <strong className="font-mono">{etfRealRate.toFixed(2)}%</strong> real return — future dollars converted to today's
              purchasing power.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Total Cash Saved By Age 30"
          value={`$${Math.round(totalCashDeposited).toLocaleString()}`}
          color="blue"
          subtext={`$${weeklyInvestment}/wk for ${30 - startAge} years`}
        />
        <StatCard
          label="Bank Savings Account at Age 30"
          value={`$${Math.round(showRealTerms ? fvBankReal : fvBank30).toLocaleString()}`}
          color="amber"
          subtext={showRealTerms ? `At 4.5% nominal (${bankRealRate.toFixed(1)}% real)` : 'At 4.5% interest rate'}
        />
        <StatCard
          label="ASX ETF Portfolio at Age 30"
          value={`$${Math.round(showRealTerms ? fvEtfReal : fvEtf30).toLocaleString()}`}
          color="green"
          subtext={
            showRealTerms
              ? `Nominal $${Math.round(fvEtf30).toLocaleString()} in today's money`
              : `+$${Math.round(etfCompoundInterest).toLocaleString()} in free compound growth!`
          }
        />
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Micro-Investing Magic:</span>
          Investing <strong>${weeklyInvestment}/week</strong> in an index ETF starting at age {startAge} gives you an extra <strong>${Math.round(fvEtf30 - fvBank30).toLocaleString()}</strong> compared to leaving it in a bank account!
        </div>
      </div>
    </Card>
  );
}

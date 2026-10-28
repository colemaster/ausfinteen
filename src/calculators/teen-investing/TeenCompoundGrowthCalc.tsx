import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { Sparkles, TrendingUp, Percent, Coins, ShieldCheck, Zap } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { realReturn, projectLumpSumComparison } from './engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from '@/components/charts';
import { ChartContainer, useReducedMotion } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface CompoundPreset {
  weeklyInvestment: number;
  startAge: number;
  etfReturnRate: number;
}

const PRESETS: ScenarioPreset<CompoundPreset>[] = [
  {
    id: 'spare-change',
    label: 'Spare Change ($10/wk)',
    badge: '$10/wk',
    description: 'Invest $10/week from age 16 at 8.5% historical ASX 200 return',
    values: { weeklyInvestment: 10, startAge: 16, etfReturnRate: 8.5 },
  },
  {
    id: 'weekend-job',
    label: 'Weekend Job ($25/wk)',
    badge: '$25/wk',
    description: 'Invest $25/week from age 15 to build early compound momentum',
    values: { weeklyInvestment: 25, startAge: 15, etfReturnRate: 8.5 },
  },
  {
    id: 'super-saver',
    label: 'Super Saver ($50/wk)',
    badge: '$50/wk',
    description: 'Invest $50/week from age 17 at 9.0% total return',
    values: { weeklyInvestment: 50, startAge: 17, etfReturnRate: 9.0 },
  },
];

interface LumpSumPreset {
  initial: number;
  cashRate: number;
  balancedRate: number;
  highGrowthRate: number;
}

const LUMP_SUM_PRESETS: ScenarioPreset<LumpSumPreset>[] = [
  {
    id: 'standard-benchmarks',
    label: 'Standard Benchmarks ($10k)',
    badge: '4.5% vs 6.5% vs 9.0%',
    description: 'Classic cash savings (4.5%), balanced fund (6.5%), and high-growth equity ETF (9.0%)',
    values: { initial: 10000, cashRate: 4.5, balancedRate: 6.5, highGrowthRate: 9.0 },
  },
  {
    id: 'starter-five-k',
    label: 'First Job Savings ($5,000)',
    badge: '$5,000 Seed',
    description: 'See how $5,000 saved from school work or casual shifts snowballs over 5 to 30 years',
    values: { initial: 5000, cashRate: 4.5, balancedRate: 6.5, highGrowthRate: 9.0 },
  },
  {
    id: 'tech-growth-heavy',
    label: 'Growth Tilt (10.5% ETF)',
    badge: '10.5% Growth',
    description: 'Compare higher-risk tech-tilted equity ETF (10.5%) against balanced and cash',
    values: { initial: 10000, cashRate: 4.5, balancedRate: 6.5, highGrowthRate: 10.5 },
  },
];

const LUMP_CHART_CONFIG = {
  highGrowthEtf: { label: 'High-Growth Equity ETF (9.0%)', color: 'var(--chart-2)' },
  balancedFund: { label: 'Balanced Fund (6.5%)', color: 'var(--chart-1)' },
  cashSavings: { label: 'Cash Savings (4.5%)', color: 'var(--chart-3)' },
};

function formatCompactDollar(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${Math.round(v)}`;
}

export function TeenCompoundGrowthCalc() {
  const { profile } = useTeenProfile();
  const reduced = useReducedMotion();

  // Mode: 'weekly' (DCA / micro-investing) vs 'lump-sum' ($10k comparison across 5, 10, 20, 30 yrs)
  const [calcMode, setCalcMode] = useState<'weekly' | 'lump-sum'>('weekly');

  // Weekly micro-investing state
  const [weeklyInvestment, setWeeklyInvestment] = useState<number>(15);
  const [startAge, setStartAge] = useState<number>(profile.age);
  const [etfReturnRate, setEtfReturnRate] = useState<number>(8.5);
  const [showRealTerms, setShowRealTerms] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [activeWeeklyPreset, setActiveWeeklyPreset] = useState<string | undefined>(undefined);

  // Lump sum 5, 10, 20, 30 year state
  const [lumpSumInitial, setLumpSumInitial] = useState<number>(10000);
  const [cashRate, setCashRate] = useState<number>(4.5);
  const [balancedRate, setBalancedRate] = useState<number>(6.5);
  const [highGrowthRate, setHighGrowthRate] = useState<number>(9.0);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);
  const [activeLumpPreset, setActiveLumpPreset] = useState<string | undefined>('standard-benchmarks');

  const handleApplyWeeklyPreset = useCallback((preset: ScenarioPreset<CompoundPreset>) => {
    setActiveWeeklyPreset(preset.id);
    if (!preset.values) return;
    if (preset.values.weeklyInvestment !== undefined) setWeeklyInvestment(preset.values.weeklyInvestment);
    if (preset.values.startAge !== undefined) setStartAge(preset.values.startAge);
    if (preset.values.etfReturnRate !== undefined) setEtfReturnRate(preset.values.etfReturnRate);
  }, []);

  const handleApplyLumpPreset = useCallback((preset: ScenarioPreset<LumpSumPreset>) => {
    setActiveLumpPreset(preset.id);
    if (!preset.values) return;
    if (preset.values.initial !== undefined) setLumpSumInitial(preset.values.initial);
    if (preset.values.cashRate !== undefined) setCashRate(preset.values.cashRate);
    if (preset.values.balancedRate !== undefined) setBalancedRate(preset.values.balancedRate);
    if (preset.values.highGrowthRate !== undefined) setHighGrowthRate(preset.values.highGrowthRate);
  }, []);

  const handleReset = useCallback(() => {
    if (calcMode === 'weekly') {
      setActiveWeeklyPreset(undefined);
      setWeeklyInvestment(15);
      setStartAge(profile.age);
      setEtfReturnRate(8.5);
      setShowRealTerms(false);
    } else {
      setActiveLumpPreset('standard-benchmarks');
      setLumpSumInitial(10000);
      setCashRate(4.5);
      setBalancedRate(6.5);
      setHighGrowthRate(9.0);
      setSelectedHorizon(30);
    }
  }, [calcMode, profile.age]);

  // Weekly calculations
  const monthsTo30 = (30 - startAge) * 12;
  const monthlyEtfRate = etfReturnRate / 100 / 12;
  const monthlyBankRate = 0.045 / 12; // 4.5% bank savings rate

  const fvEtf30 = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, monthsTo30) - 1) / monthlyEtfRate);
  const fvBank30 = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyBankRate, monthsTo30) - 1) / monthlyBankRate);

  const totalCashDeposited = weeklyInvestment * 52 * (30 - startAge);
  const etfCompoundInterest = fvEtf30 - totalCashDeposited;

  // Real (inflation-adjusted) outcomes for weekly
  const etfRealRate = realReturn(etfReturnRate, inflationRate);
  const monthlyEtfRealRate = etfRealRate / 100 / 12;
  const bankRealRate = realReturn(4.5, inflationRate);
  const monthlyBankRealRate = bankRealRate / 100 / 12;
  const fvEtfReal = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRealRate, monthsTo30) - 1) / monthlyEtfRealRate);
  const fvBankReal = (weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyBankRealRate, monthsTo30) - 1) / monthlyBankRealRate);

  // Lump sum 5, 10, 20, 30 projection
  const lumpComparison = useMemo(() => {
    return projectLumpSumComparison(
      lumpSumInitial,
      cashRate,
      balancedRate,
      highGrowthRate,
      [5, 10, 20, 30]
    );
  }, [lumpSumInitial, cashRate, balancedRate, highGrowthRate]);

  const activeHorizonData = useMemo(() => {
    return (
      lumpComparison.horizons.find(h => h.years === selectedHorizon) ??
      lumpComparison.horizons[lumpComparison.horizons.length - 1]
    );
  }, [lumpComparison, selectedHorizon]);

  const summaryText = useMemo(() => {
    if (calcMode === 'weekly') {
      return [
        '--- Teen Compound Growth Simulator Summary ---',
        `Weekly Contribution: $${weeklyInvestment}/wk (Starts at age ${startAge}, Return: ${etfReturnRate}%)`,
        `Total Cash Deposited by Age 30: $${Math.round(totalCashDeposited).toLocaleString()}`,
        `Bank Savings Account at Age 30 (4.5%): $${Math.round(fvBank30).toLocaleString()}`,
        `ASX ETF Portfolio at Age 30 (${etfReturnRate}%): $${Math.round(fvEtf30).toLocaleString()} (+$${Math.round(etfCompoundInterest).toLocaleString()} in compound growth)`,
        `At Age 60 (45 yrs): $${Math.round((weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, 45 * 12) - 1) / monthlyEtfRate)).toLocaleString()}`,
        'Calculated via AusFinTools Teen Investing Guide',
      ].join('\n');
    }

    const lines = [
      '--- $10,000 Compound Growth Projection: Cash vs Balanced vs High-Growth Equity ETFs ---',
      `Initial Investment: $${lumpSumInitial.toLocaleString()}`,
      `Benchmark Rates: Cash Savings ${cashRate}%, Balanced Fund ${balancedRate}%, High-Growth ETF ${highGrowthRate}%`,
    ];
    lumpComparison.horizons.forEach(h => {
      lines.push(
        `${h.years} Years: Cash $${h.cashSavings.toLocaleString()} | Balanced $${h.balancedFund.toLocaleString()} | High-Growth ETF $${h.highGrowthEtf.toLocaleString()} (+${h.growthDifference >= 0 ? '$' : '-$'}${Math.abs(h.growthDifference).toLocaleString()} gain, ${h.multipleOverCash}x Cash)`
      );
    });
    lines.push(
      `Rule of 72 Doubling Time: High-Growth doubles every ${lumpComparison.ruleOf72.highGrowthYears} yrs vs ${lumpComparison.ruleOf72.cashYears} yrs in cash.`
    );
    lines.push('Calculated via AusFinTools Teen Investing Suite');
    return lines.join('\n');
  }, [
    calcMode,
    weeklyInvestment,
    startAge,
    etfReturnRate,
    totalCashDeposited,
    fvBank30,
    fvEtf30,
    etfCompoundInterest,
    monthlyEtfRate,
    lumpSumInitial,
    cashRate,
    balancedRate,
    highGrowthRate,
    lumpComparison,
  ]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Share Market & ETF Compound Growth Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare regular weekly micro-investing or explore how a $10,000 starter lump sum compounds over 5, 10, 20, and 30 years!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            {calcMode === 'weekly' ? 'ASX 200 ETF 8.5% Historical' : '$10k Growth Benchmark'}
          </Badge>
          <CalculatorActions
            onReset={handleReset}
            summaryText={summaryText}
            summaryTitle="Teen Compound Growth"
          />
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/60 border border-border rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setCalcMode('weekly')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            calcMode === 'weekly'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Weekly Micro-Investing ($/wk)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode('lump-sum')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            calcMode === 'lump-sum'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Coins className="w-3.5 h-3.5" />
          $10,000 Lump Sum Comparison (5–30 Yrs)
        </button>
      </div>

      {calcMode === 'weekly' ? (
        <>
          <QuickPresetBar
            presets={PRESETS}
            activePresetId={activeWeeklyPreset}
            onSelect={handleApplyWeeklyPreset}
            title="Weekly Savings Targets"
          />

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
              numericValue={Math.round(totalCashDeposited)}
              format="currency"
              color="blue"
              subtext={`$${weeklyInvestment}/wk for ${30 - startAge} years`}
            />
            <StatCard
              label="Bank Savings Account at Age 30"
              value={`$${Math.round(showRealTerms ? fvBankReal : fvBank30).toLocaleString()}`}
              numericValue={Math.round(showRealTerms ? fvBankReal : fvBank30)}
              format="currency"
              color="amber"
              subtext={showRealTerms ? `At 4.5% nominal (${bankRealRate.toFixed(1)}% real)` : 'At 4.5% interest rate'}
            />
            <StatCard
              label="ASX ETF Portfolio at Age 30"
              value={`$${Math.round(showRealTerms ? fvEtfReal : fvEtf30).toLocaleString()}`}
              numericValue={Math.round(showRealTerms ? fvEtfReal : fvEtf30)}
              format="currency"
              color="green"
              subtext={
                showRealTerms
                  ? `Nominal $${Math.round(fvEtf30).toLocaleString()} in today's money`
                  : `+$${Math.round(etfCompoundInterest).toLocaleString()} in free compound growth!`
              }
            />
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-primary/10 to-emerald-500/10 border border-primary/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">The 10-Year Head Start (Age 15 vs Age 25)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you invest just <strong>${weeklyInvestment}/week</strong> from age 15 to 60 (45 years) at {etfReturnRate}% p.a.:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-card border border-emerald-500/30">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">⭐ Started at Age 15 (45 Years)</span>
                <div className="font-mono text-base font-extrabold text-foreground">
                  ${Math.round((weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, 45 * 12) - 1) / monthlyEtfRate)).toLocaleString()}
                </div>
                <span className="text-[10px] text-muted-foreground">Total cash put in: ${(weeklyInvestment * 52 * 45).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-bold text-muted-foreground block mb-1">Started at Age 25 (35 Years)</span>
                <div className="font-mono text-base font-extrabold text-foreground">
                  ${Math.round((weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, 35 * 12) - 1) / monthlyEtfRate)).toLocaleString()}
                </div>
                <span className="text-[10px] text-muted-foreground">Total cash put in: ${(weeklyInvestment * 52 * 35).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[11px] text-foreground font-medium">
              🚀 By starting at 15 instead of 25, an extra ${(weeklyInvestment * 52 * 10).toLocaleString()} of deposits snowballs into an extra <strong className="text-emerald-500 font-mono">+${Math.round(((weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, 45 * 12) - 1) / monthlyEtfRate)) - ((weeklyInvestment * 52 / 12) * ((Math.pow(1 + monthlyEtfRate, 35 * 12) - 1) / monthlyEtfRate))).toLocaleString()}</strong> at retirement!
            </p>
          </div>
        </>
      ) : (
        /* Lump Sum 5, 10, 20, 30 Year Comparison View */
        <div className="space-y-6">
          <QuickPresetBar
            presets={LUMP_SUM_PRESETS}
            activePresetId={activeLumpPreset}
            onSelect={handleApplyLumpPreset}
            title="Comparison Benchmarks"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <NumberInput
                label="Starter Lump Sum"
                value={lumpSumInitial}
                onChange={v => {
                  setActiveLumpPreset(undefined);
                  setLumpSumInitial(v);
                }}
                min={1000}
                max={500000}
                step={1000}
                prefix="$"
              />
            </div>
            <div className="space-y-2">
              <SliderControl
                label="Cash Savings Rate"
                value={cashRate}
                onChange={v => {
                  setActiveLumpPreset(undefined);
                  setCashRate(v);
                }}
                min={1}
                max={8}
                step={0.25}
                suffix="%"
              />
            </div>
            <div className="space-y-2">
              <SliderControl
                label="Balanced Fund Rate"
                value={balancedRate}
                onChange={v => {
                  setActiveLumpPreset(undefined);
                  setBalancedRate(v);
                }}
                min={3}
                max={10}
                step={0.25}
                suffix="%"
              />
            </div>
            <div className="space-y-2">
              <SliderControl
                label="High-Growth Equity ETF"
                value={highGrowthRate}
                onChange={v => {
                  setActiveLumpPreset(undefined);
                  setHighGrowthRate(v);
                }}
                min={5}
                max={14}
                step={0.25}
                suffix="%"
              />
            </div>
          </div>

          {/* Horizon Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1">Select Horizon:</span>
            {[5, 10, 20, 30].map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedHorizon(yr)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all',
                  selectedHorizon === yr
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                )}
              >
                {yr} Years
              </button>
            ))}
          </div>

          {/* Highlight Cards for Selected Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Cash Savings ({cashRate}%)</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-foreground">
                ${activeHorizonData.cashSavings.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gain: +${(activeHorizonData.cashSavings - lumpSumInitial).toLocaleString()} in interest.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Balanced Fund ({balancedRate}%)</span>
                <Coins className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-foreground">
                ${activeHorizonData.balancedFund.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gain: +${(activeHorizonData.balancedFund - lumpSumInitial).toLocaleString()} from diversified growth & defensive mix.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">High-Growth Equity ETF ({highGrowthRate}%)</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ${activeHorizonData.highGrowthEtf.toLocaleString()}
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                🚀 +${activeHorizonData.growthDifference.toLocaleString()} more than cash ({activeHorizonData.multipleOverCash}x multiple!)
              </p>
            </div>
          </div>

          {/* Interactive Line Chart */}
          <div className="bg-background/60 border border-border rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">30-Year Compounding Acceleration Curves</h3>
                <p className="text-[11px] text-muted-foreground">
                  Watch how a {highGrowthRate}% equity return widens the wealth chasm over bank savings ({cashRate}%) as compound interest snowballs.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" /> High-Growth ETF ({highGrowthRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-blue-500">
                  <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" /> Balanced ({balancedRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block" /> Cash ({cashRate}%)
                </span>
              </div>
            </div>

            <ChartContainer config={LUMP_CHART_CONFIG} className="h-[280px] w-full">
              <LineChart data={lumpComparison.yearly} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickFormatter={v => `Yr ${v}`} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompactDollar} tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Line
                  type="monotone"
                  dataKey="highGrowthEtf"
                  name="High-Growth Equity ETF"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={!reduced}
                  animationDuration={900}
                />
                <Line
                  type="monotone"
                  dataKey="balancedFund"
                  name="Balanced Fund"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reduced}
                  animationDuration={900}
                />
                <Line
                  type="monotone"
                  dataKey="cashSavings"
                  name="Cash Savings"
                  stroke="var(--chart-3)"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={!reduced}
                  animationDuration={900}
                />
              </LineChart>
            </ChartContainer>
          </div>

          {/* 4-Horizon Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-background/60">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3 font-bold text-foreground">Time Horizon</th>
                  <th className="p-3 font-bold text-amber-600 dark:text-amber-400 text-right">Cash Savings ({cashRate}%)</th>
                  <th className="p-3 font-bold text-blue-600 dark:text-blue-400 text-right">Balanced Fund ({balancedRate}%)</th>
                  <th className="p-3 font-bold text-emerald-600 dark:text-emerald-400 text-right">High-Growth ETF ({highGrowthRate}%)</th>
                  <th className="p-3 font-bold text-foreground text-right">Extra Wealth vs Cash</th>
                  <th className="p-3 font-bold text-foreground text-right">Multiple</th>
                </tr>
              </thead>
              <tbody>
                {lumpComparison.horizons.map(h => (
                  <tr
                    key={h.years}
                    className={cn(
                      'border-b border-border/60 transition-colors',
                      selectedHorizon === h.years ? 'bg-primary/5 font-bold' : 'hover:bg-muted/30'
                    )}
                  >
                    <td className="p-3 font-bold text-foreground flex items-center gap-1.5">
                      {h.years} Years
                      {selectedHorizon === h.years && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground">${h.cashSavings.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-blue-600 dark:text-blue-400">${h.balancedFund.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">${h.highGrowthEtf.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +${h.growthDifference.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {h.multipleOverCash}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rule of 72 Doubling Time Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cash ({cashRate}%) Doubling Time</div>
              <div className="text-lg font-bold font-mono text-foreground">{lumpComparison.ruleOf72.cashYears} Years</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Money doubles only ~1.9x in 30 years</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Balanced ({balancedRate}%) Doubling Time</div>
              <div className="text-lg font-bold font-mono text-foreground">{lumpComparison.ruleOf72.balancedYears} Years</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Money doubles ~2.7x in 30 years</p>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1">High-Growth ({highGrowthRate}%) Doubling Time</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{lumpComparison.ruleOf72.highGrowthYears} Years</div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Money doubles ~3.8x — expanding {lumpSumInitial.toLocaleString()} into {lumpComparison.horizons[3]?.highGrowthEtf.toLocaleString()}!</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

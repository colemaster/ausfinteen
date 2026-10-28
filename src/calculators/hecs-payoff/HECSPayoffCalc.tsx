import { useState, useMemo, useCallback } from 'react';
import {
  simulateHECSPayoff,
  calcHECSRepayment,
  comparePaydownVsInvest,
  compareIndexationScenarios,
  repaymentSplitSchedule,
  calcRetrospectiveIndexationCredit,
  applyAccordDebtReduction,
} from './engine';
import {
  HELP_INDEXATION_RATE_2026,
  HELP_DEBT_REDUCTION_2025,
  HELP_LOAN_LIMITS,
  SSAF_DETAILED_CAPS,
  CSP_STUDENT_CONTRIBUTION_BANDS,
} from '../../data/constants';
import { getCombinedMarginalRate } from '../../data/tax-brackets';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from '@/components/charts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import {
  GraduationCap,
  Download,
  Share2,
  Sparkles,
  X,
  Gauge,
  PiggyBank,
  Home,
  TrendingUp,
  Info,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { toast } from '@/lib/toast';

const SPLIT_CONFIG = {
  compulsory: { label: 'Compulsory', color: 'var(--chart-2)' },
  voluntary: { label: 'Voluntary', color: 'var(--chart-1)' },
  indexation: { label: 'Indexation', color: 'var(--chart-5)' },
} satisfies ChartConfig;

const PAYDOWN_CONFIG = {
  investWealth: { label: 'Investment Wealth', color: 'var(--chart-2)' },
  extraDebt: { label: 'Extra Debt Kept', color: 'var(--chart-5)' },
} satisfies ChartConfig;

interface HecsPreset {
  debt: number;
  income: number;
  lumpSum: number;
  monthlyVoluntary: number;
}

const HECS_PRESETS: ScenarioPreset<HecsPreset>[] = [
  {
    id: 'graduate',
    label: 'Fresh Graduate',
    badge: '$35k Debt • $68k Salary',
    description: 'Under the $69,528 threshold: $0 compulsory repayments under 2026-27 rules!',
    values: { debt: 35000, income: 68000, lumpSum: 0, monthlyVoluntary: 0 },
  },
  {
    id: 'established',
    label: 'Mid-Career Accelerate',
    badge: 'Voluntary Boost',
    description: '$42k debt, $95k salary ($3,821/yr compulsory), $250/mo extra to beat indexation',
    values: { debt: 42000, income: 95000, lumpSum: 5000, monthlyVoluntary: 250 },
  },
  {
    id: 'double-degree',
    label: 'Double Degree / Law / Med',
    badge: '$75k+ Debt',
    description: 'Higher salary trajectory ($145k), large loan balance, evaluating ETF vs Offset payoff',
    values: { debt: 75000, income: 145000, lumpSum: 10000, monthlyVoluntary: 500 },
  },
  {
    id: 'debt-sprint',
    label: 'Final Debt Sprint',
    badge: '$16k Remaining',
    description: 'Near payoff: deciding between clearing the loan or keeping cash in 5% HISA',
    values: { debt: 16000, income: 88000, lumpSum: 4000, monthlyVoluntary: 350 },
  },
];

export function HECSPayoffCalc() {
  // State
  const [currentDebt, setCurrentDebt] = useState<number>(38500);
  const [annualIncome, setAnnualIncome] = useState<number>(88000);
  const [lumpSumAvailable, setLumpSumAvailable] = useState<number>(5000);
  const [monthlyVoluntary, setMonthlyVoluntary] = useState<number>(250);
  const [mortgageRate, setMortgageRate] = useState<number>(6.2);
  const [etfReturn, setEtfReturn] = useState<number>(8.0);
  const [hisaRate, setHisaRate] = useState<number>(5.0);
  const [useMarginal, setUseMarginal] = useState<boolean>(true);
  const [indexationRate, setIndexationRate] = useState<number>(Number((HELP_INDEXATION_RATE_2026 * 100).toFixed(1))); // 2.8%
  const [investComparisonMode, setInvestComparisonMode] = useState<'etf' | 'hisa' | 'offset'>('etf');
  const [appliedDebtCut, setAppliedDebtCut] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showRetroModal, setShowRetroModal] = useState<boolean>(false);
  const [showCapsModal, setShowCapsModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<HecsPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.debt !== undefined) setCurrentDebt(preset.values.debt);
    if (preset.values.income !== undefined) setAnnualIncome(preset.values.income);
    if (preset.values.lumpSum !== undefined) setLumpSumAvailable(preset.values.lumpSum);
    if (preset.values.monthlyVoluntary !== undefined) setMonthlyVoluntary(preset.values.monthlyVoluntary);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setCurrentDebt(38500);
    setAnnualIncome(88000);
    setLumpSumAvailable(5000);
    setMonthlyVoluntary(250);
    setMortgageRate(6.2);
    setEtfReturn(8.0);
    setHisaRate(5.0);
    setUseMarginal(true);
    setIndexationRate(Number((HELP_INDEXATION_RATE_2026 * 100).toFixed(1)));
    setInvestComparisonMode('etf');
    setAppliedDebtCut(false);
  }, []);

  const handleToggleDebtCut = () => {
    sound.playClick();
    if (!appliedDebtCut) {
      const { reducedDebt, amountReduced } = applyAccordDebtReduction(currentDebt);
      setCurrentDebt(reducedDebt);
      setAppliedDebtCut(true);
      toast.success(`Applied 20% Universities Accord cut: Saved ${formatCurrency(amountReduced)}!`);
    } else {
      const restoredDebt = Math.round(currentDebt / (1 - HELP_DEBT_REDUCTION_2025));
      setCurrentDebt(restoredDebt);
      setAppliedDebtCut(false);
      toast.info('Reverted 20% debt cut preview.');
    }
  };

  const incomeGrowthRate = 3.5;
  const projectionYears = 15;

  // Calculation
  const result = useMemo(() => {
    return simulateHECSPayoff({
      currentDebt,
      annualIncome,
      incomeGrowthRate: incomeGrowthRate / 100,
      indexationRate: indexationRate / 100,
      lumpSumAvailable,
      monthlyVoluntaryPayment: monthlyVoluntary,
      mortgageRate: mortgageRate / 100,
      etfExpectedReturn: etfReturn / 100,
      hisaRate: hisaRate / 100,
      useMarginal2025System: useMarginal,
      projectionYears,
    });
  }, [
    currentDebt,
    annualIncome,
    incomeGrowthRate,
    indexationRate,
    lumpSumAvailable,
    monthlyVoluntary,
    mortgageRate,
    etfReturn,
    hisaRate,
    useMarginal,
  ]);

  // Indexation scenario comparison
  const indexationScenarios = useMemo(
    () => compareIndexationScenarios(
      currentDebt,
      annualIncome,
      incomeGrowthRate / 100,
      lumpSumAvailable,
      monthlyVoluntary,
      [0.025, 0.028, 0.032, 0.040, 0.050],
    ),
    [currentDebt, annualIncome, incomeGrowthRate, lumpSumAvailable, monthlyVoluntary],
  );

  // Retrospective indexation savings
  const retroSavings = useMemo(
    () => calcRetrospectiveIndexationCredit(currentDebt),
    [currentDebt],
  );

  // User marginal tax rate for HISA calculations
  const combinedMTR = useMemo(() => getCombinedMarginalRate(annualIncome), [annualIncome]);
  const hisaNetRate = useMemo(() => hisaRate * (1 - combinedMTR), [hisaRate, combinedMTR]);

  // Effective rate for surplus comparison based on active mode
  const effectiveInvestRate = useMemo(() => {
    if (investComparisonMode === 'offset') return mortgageRate / 100;
    if (investComparisonMode === 'hisa') return hisaNetRate / 100;
    return etfReturn / 100;
  }, [investComparisonMode, mortgageRate, hisaNetRate, etfReturn]);

  // Pay down faster vs invest surplus
  const paydownVsInvest = useMemo(
    () => comparePaydownVsInvest(currentDebt, monthlyVoluntary, indexationRate / 100, effectiveInvestRate, projectionYears),
    [currentDebt, monthlyVoluntary, indexationRate, effectiveInvestRate, projectionYears],
  );

  const paydownChartData = paydownVsInvest.rows.map(r => ({
    year: `Yr ${r.year}`,
    investWealth: r.investWealth,
    extraDebt: r.investDebt - r.paydownDebt,
  }));

  // Compulsory vs voluntary split visual
  const splitRows = useMemo(
    () => repaymentSplitSchedule(
      currentDebt,
      annualIncome,
      incomeGrowthRate / 100,
      indexationRate / 100,
      monthlyVoluntary,
      projectionYears,
    ),
    [currentDebt, annualIncome, incomeGrowthRate, indexationRate, monthlyVoluntary, projectionYears],
  );

  const initialRepayment = useMemo(() => {
    return currentDebt > 0 ? calcHECSRepayment(annualIncome, useMarginal) : 0;
  }, [annualIncome, useMarginal, currentDebt]);

  const summaryText = useMemo(() => {
    return [
      '--- HECS-HELP Payoff & Voluntary Repayment Summary ---',
      `Current HECS Debt: ${formatCurrency(currentDebt)} | Annual Salary: ${formatCurrency(annualIncome)}`,
      `Compulsory Repayment (2026-27): ${formatCurrency(initialRepayment)}/yr (${annualIncome <= 69528 ? '$0 under $69,528 threshold' : 'marginal tiered'})`,
      `Payoff Horizon: ${result.compulsoryPayoffYears} yrs compulsory vs ${result.voluntaryPayoffYears} yrs voluntary (${result.yearsSaved} yrs saved)`,
      `Total Indexation: ${formatCurrency(result.totalIndexationCompulsoryOnly)} | Total Repaid: ${formatCurrency(result.totalRepaidCompulsoryOnly)}`,
      `15-Year Wealth Outcomes:`,
      `  • Voluntary Payoff + Invest: ${formatCurrency(result.finalWealthVoluntaryPayoff)}`,
      `  • High-Interest Savings (HISA ${hisaRate}%): ${formatCurrency(result.finalWealthHISA)} (${result.hisaNetRateAfterTax}% after-tax)`,
      `  • Mortgage Offset (${mortgageRate}%): ${formatCurrency(result.finalWealthMortgageOffset)}`,
      `  • ASX Index ETF (${etfReturn}%): ${formatCurrency(result.finalWealthETFInvesting)}`,
      `APRA Borrowing Impact: -${formatCurrency(result.apraBorrowingCapacityImpact)} reduction in home borrowing capacity`,
      `Calculated via AusFinTools HECS Engine`,
    ].join('\n');
  }, [currentDebt, annualIncome, initialRepayment, result, hisaRate, mortgageRate, etfReturn]);

  // Export CSV
  const handleExportCSV = () => {
    sound.playClick();
    const headers = [
      'Year',
      'Starting Debt ($)',
      'Salary ($)',
      'Compulsory Repayment ($)',
      'Voluntary Repayment ($)',
      'Indexation ($)',
      'Ending Debt ($)',
      'HISA Wealth ($)',
      'Offset Wealth ($)',
      'ETF Wealth ($)',
    ];
    const rows = result.schedule.map(r => [
      r.year,
      r.startingBalance,
      r.salary,
      r.compulsoryRepayment,
      r.voluntaryRepayment,
      r.indexationAmount,
      r.endingBalance,
      r.hisaBalance,
      r.offsetBalance,
      r.etfBalance,
    ]);
    exportToCSV('HECS_Payoff_vs_Investing_Plan.csv', headers, rows);
    toast.success('HECS schedule exported to CSV!');
  };

  // Share URL
  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = {
      currentDebt,
      annualIncome,
      lumpSumAvailable,
      monthlyVoluntary,
      mortgageRate,
      etfReturn,
      hisaRate,
      indexationRate,
    };
    const hash = await encodePlanToHash(state);
    const url = `${window.location.origin}${window.location.pathname}#plan=${hash}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    setShowShareModal(true);
    toast.success('Shareable link copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              2026–2027 Accord Reforms Ready
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              HECS/HELP Payoff vs Investing Simulator
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compare voluntary debt payoff against High-Interest Savings (HISA), Mortgage Offset (tax-free), and ASX ETFs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleToggleDebtCut}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                appliedDebtCut
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted/70 border-border text-foreground hover:bg-muted'
              }`}
              title="Preview the one-off 20% Universities Accord debt reduction"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {appliedDebtCut ? '20% Debt Cut Active' : 'Preview 20% Cut'}
            </button>
            <button
              onClick={() => setShowRetroModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all border border-border"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              2023–24 Credits
            </button>
            <button
              onClick={() => setShowCapsModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all border border-border"
              title="Official StudyAssist 2026 & 2027 CSP Contribution Bands, Loan Limits & SSAF Caps"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Tertiary Limits
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all border border-border"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={handleSharePlan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Accord Reform Highlight Card */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-foreground">
              Official 2026–27 Marginal Repayment Rules ($69,528 Threshold)
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              No cliff edges: earnings up to <strong>$69,528</strong> pay <strong>$0</strong>. Income between $69,529 and $129,717 repays <strong>15%</strong> of the marginal slice only. Indexation is capped at the lower of CPI and WPI (<strong>{HELP_INDEXATION_RATE_2026 * 100}%</strong> for 2026).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground font-semibold">System:</span>
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold font-mono text-[11px]">
            {useMarginal ? 'Marginal (2026-27)' : 'Legacy Tiers (2024)'}
          </span>
        </div>
      </div>

      {/* Quick Presets */}
      <QuickPresetBar
        presets={HECS_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Student Debt & Career Profiles"
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Compulsory Payoff Time
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            {currentDebt === 0 ? '0 Years' : `${result.compulsoryPayoffYears} Years`}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {currentDebt === 0
              ? 'No debt outstanding'
              : annualIncome <= 69528
              ? 'Income under $69,528 threshold'
              : 'Mandatory PAYG schedule'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Voluntary Payoff Time
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-success font-mono">
            {currentDebt === 0 ? '0 Years' : `${result.voluntaryPayoffYears} Years`}
          </div>
          <span className="text-[10px] text-success font-semibold">
            {currentDebt === 0
              ? 'Debt free'
              : result.yearsSaved > 0
              ? `⚡️ Saves ${result.yearsSaved} Years`
              : 'Matches compulsory'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Indexation Saved
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            <OdometerCounter value={result.interestIndexationSaved} />
          </div>
          <span className="text-[10px] text-muted-foreground">Capped at min(CPI, WPI)</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            APRA Borrowing Impact
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-warning font-mono">
            {result.apraBorrowingCapacityImpact > 0 ? (
              <>-<OdometerCounter value={result.apraBorrowingCapacityImpact} /></>
            ) : (
              '$0'
            )}
          </div>
          <span className="text-[10px] text-warning font-semibold">
            {result.apraBorrowingCapacityImpact > 0 ? '~9.5x annual repayment' : 'No borrowing penalty'}
          </span>
        </div>
      </div>

      {/* Main Interactive Controls & Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>Your Loan & Cashflow Inputs</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[10px] text-muted-foreground font-semibold">Marginal System</span>
              <input
                type="checkbox"
                checked={useMarginal}
                onChange={e => {
                  sound.playClick();
                  setUseMarginal(e.target.checked);
                }}
                className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
              />
            </label>
          </h3>

          {/* Current HECS Debt */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="hecs-debt" className="text-muted-foreground">Current HECS-HELP Debt</label>
              <span className="font-mono text-foreground">${currentDebt.toLocaleString()}</span>
            </div>
            <input
              id="hecs-debt"
              type="range"
              min={0}
              max={120000}
              step={500}
              value={currentDebt}
              onChange={e => {
                sound.playTick();
                setCurrentDebt(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
            {appliedDebtCut && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✨ Includes 20% Universities Accord debt reduction preview
              </p>
            )}
          </div>

          {/* Annual Salary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="hecs-salary" className="text-muted-foreground">Annual Gross Salary</label>
              <span className="font-mono text-foreground">${annualIncome.toLocaleString()}</span>
            </div>
            <input
              id="hecs-salary"
              type="range"
              min={30000}
              max={250000}
              step={1000}
              value={annualIncome}
              onChange={e => {
                sound.playTick();
                setAnnualIncome(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Compulsory annual repayment:</span>
              <span className="font-mono font-bold text-foreground">
                ${initialRepayment.toLocaleString()}/yr
                {annualIncome <= 69528 && currentDebt > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">(Below threshold)</span>
                )}
              </span>
            </div>
          </div>

          {/* Monthly Voluntary Payment */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="hecs-voluntary" className="text-muted-foreground">Monthly Voluntary Payoff</label>
              <span className="font-mono text-foreground">${monthlyVoluntary.toLocaleString()}/mo</span>
            </div>
            <input
              id="hecs-voluntary"
              type="range"
              min={0}
              max={2000}
              step={50}
              value={monthlyVoluntary}
              onChange={e => {
                sound.playTick();
                setMonthlyVoluntary(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Lump Sum Available */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="hecs-lump" className="text-muted-foreground">Immediate Lump Sum Available</label>
              <span className="font-mono text-foreground">${lumpSumAvailable.toLocaleString()}</span>
            </div>
            <input
              id="hecs-lump"
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={lumpSumAvailable}
              onChange={e => {
                sound.playTick();
                setLumpSumAvailable(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Interest & Return Assumptions */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label htmlFor="hecs-hisa-rate" className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-amber-500" />
                HISA Rate
              </label>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  id="hecs-hisa-rate"
                  type="number"
                  step="0.1"
                  value={hisaRate}
                  onChange={e => setHisaRate(Number(e.target.value))}
                  className="w-full p-1.5 rounded-lg bg-muted border border-border text-foreground font-bold"
                />
                <span>%</span>
              </div>
              <span className="text-[9px] text-muted-foreground block">
                {hisaNetRate.toFixed(1)}% after-tax
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="hecs-mortgage-rate" className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Home className="w-3 h-3 text-sky-500" />
                Offset Rate
              </label>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  id="hecs-mortgage-rate"
                  type="number"
                  step="0.1"
                  value={mortgageRate}
                  onChange={e => setMortgageRate(Number(e.target.value))}
                  className="w-full p-1.5 rounded-lg bg-muted border border-border text-foreground font-bold"
                />
                <span>%</span>
              </div>
              <span className="text-[9px] text-muted-foreground block">Tax-free</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="hecs-etf-return" className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                ASX ETF Return
              </label>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  id="hecs-etf-return"
                  type="number"
                  step="0.1"
                  value={etfReturn}
                  onChange={e => setEtfReturn(Number(e.target.value))}
                  className="w-full p-1.5 rounded-lg bg-muted border border-border text-foreground font-bold"
                />
                <span>%</span>
              </div>
              <span className="text-[9px] text-muted-foreground block">Long-term</span>
            </div>

            <div className="space-y-1 col-span-3 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="hecs-indexation" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  HELP Indexation Rate (min(CPI, WPI))
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIndexationRate(2.8)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 font-mono"
                    title="2026 Confirmed Rate"
                  >
                    2.8% (2026)
                  </button>
                  <button
                    onClick={() => setIndexationRate(4.0)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 font-mono"
                    title="2024 Revised WPI Rate"
                  >
                    4.0% (2024)
                  </button>
                  <button
                    onClick={() => setIndexationRate(3.2)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 font-mono"
                    title="2023 Revised WPI Rate"
                  >
                    3.2% (2023)
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="hecs-indexation"
                  type="range"
                  min={0}
                  max={8}
                  step={0.1}
                  value={indexationRate}
                  onChange={e => {
                    sound.playTick();
                    setIndexationRate(Number(e.target.value));
                  }}
                  className="flex-1 accent-primary cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-foreground w-12 text-right">{indexationRate.toFixed(1)}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Official 2026 rate is <strong>2.8%</strong>. Indexation is legislated to take the lower of CPI or WPI.
              </p>
            </div>
          </div>
        </div>

        {/* Wealth Outcome Comparison Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Strategy Recommendation Card */}
          <div className={`p-4 rounded-2xl border ${
            result.optimalStrategy === 'invest_etf'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              : result.optimalStrategy === 'mortgage_offset'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200'
              : result.optimalStrategy === 'hisa_savings'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
              : 'bg-primary/10 border-primary/30 text-primary-foreground'
          }`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 text-primary shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Optimal Math Strategy:{' '}
                  {result.optimalStrategy === 'invest_etf'
                    ? '📈 Invest in Broad Index ETFs (VAS/VGS)'
                    : result.optimalStrategy === 'mortgage_offset'
                    ? '🏡 Park Cash in Mortgage Offset'
                    : result.optimalStrategy === 'hisa_savings'
                    ? '🏦 Build Liquid Buffer in HISA'
                    : '🎓 Clear HECS Debt First'}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {result.optimalStrategy === 'invest_etf' &&
                    `Over ${projectionYears} years, investing surplus cashflow in broad index ETFs compounds to ~$${result.finalWealthETFInvesting.toLocaleString()} vs ~$${result.finalWealthVoluntaryPayoff.toLocaleString()} with early payoff, beating the ${indexationRate}% HECS indexation cap.`}
                  {result.optimalStrategy === 'mortgage_offset' &&
                    `Mortgage offset provides a guaranteed ~${mortgageRate}% tax-free return, creating ~$${result.finalWealthMortgageOffset.toLocaleString()} in interest savings.`}
                  {result.optimalStrategy === 'hisa_savings' &&
                    `High-Interest Savings Account delivers ~$${result.finalWealthHISA.toLocaleString()} in safe, accessible cash reserves at ${result.hisaNetRateAfterTax}% after-tax.`}
                  {result.optimalStrategy === 'voluntary_payoff' &&
                    `Eliminating HECS debt frees up compulsory cashflow early and protects against future indexation surges, compounding to ~$${result.finalWealthVoluntaryPayoff.toLocaleString()}.`}
                </p>
              </div>
            </div>
          </div>

          {/* 4-Way Wealth Projection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-primary" />
                Pay Off HECS
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-foreground">
                <OdometerCounter value={result.finalWealthVoluntaryPayoff} />
              </div>
              <p className="text-[9px] text-muted-foreground">Invest cashflow once loan is $0</p>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-amber-500" />
                HISA Savings
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                <OdometerCounter value={result.finalWealthHISA} />
              </div>
              <p className="text-[9px] text-muted-foreground">Safe liquid cash ({result.hisaNetRateAfterTax}% after-tax)</p>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Home className="w-3 h-3 text-sky-500" />
                Mortgage Offset
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
                <OdometerCounter value={result.finalWealthMortgageOffset} />
              </div>
              <p className="text-[9px] text-muted-foreground">Tax-free interest savings ({mortgageRate}%)</p>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                ASX Index ETF
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                <OdometerCounter value={result.finalWealthETFInvesting} />
              </div>
              <p className="text-[9px] text-muted-foreground">8.0% historical compound return</p>
            </div>
          </div>

          {/* Pay down faster vs invest surplus with comparison toggle */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-foreground">
                Pay Down Faster vs Invest Surplus
              </h4>
              <div className="inline-flex rounded-xl bg-muted p-0.5 text-[10px] font-semibold">
                <button
                  onClick={() => setInvestComparisonMode('etf')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    investComparisonMode === 'etf' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  vs ASX ETF (8%)
                </button>
                <button
                  onClick={() => setInvestComparisonMode('hisa')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    investComparisonMode === 'hisa' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  vs HISA ({hisaNetRate.toFixed(1)}%)
                </button>
                <button
                  onClick={() => setInvestComparisonMode('offset')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    investComparisonMode === 'offset' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  vs Offset ({mortgageRate}%)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Your surplus of <span className="font-mono font-bold text-foreground">${monthlyVoluntary.toLocaleString()}/mo</span> comparing{' '}
              <span className="font-mono font-bold text-foreground">{indexationRate.toFixed(1)}%</span> HECS indexation vs{' '}
              <span className="font-mono font-bold text-foreground">{(effectiveInvestRate * 100).toFixed(1)}%</span> return in{' '}
              <span className="font-semibold text-foreground">
                {investComparisonMode === 'etf' ? 'ASX Index ETFs' : investComparisonMode === 'hisa' ? 'High-Interest Savings (After-Tax)' : 'Mortgage Offset'}
              </span>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">Debt if Paying Down</span>
                <div className="text-sm font-bold font-mono text-success">{formatCurrency(paydownVsInvest.finalDebtIfPaydown)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">Debt if Investing</span>
                <div className="text-sm font-bold font-mono text-danger">{formatCurrency(paydownVsInvest.finalDebtIfInvest)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">Wealth if Investing</span>
                <div className="text-sm font-bold font-mono text-primary">{formatCurrency(paydownVsInvest.finalWealthIfInvest)}</div>
              </div>
              <div className={`p-2.5 rounded-xl border space-y-0.5 ${paydownVsInvest.netAdvantageInvest >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">Net Advantage</span>
                <div className={`text-sm font-bold font-mono ${paydownVsInvest.netAdvantageInvest >= 0 ? 'text-success' : 'text-amber-600 dark:text-amber-400'}`}>
                  {paydownVsInvest.netAdvantageInvest >= 0 ? '+' : ''}{formatCurrency(paydownVsInvest.netAdvantageInvest)}
                </div>
              </div>
            </div>

            <ChartContainer config={PAYDOWN_CONFIG} className="h-[230px] w-full">
              <LineChart data={paydownChartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(projectionYears / 5)} />
                <YAxis tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="investWealth" name="Investment Wealth" stroke="var(--color-investWealth)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="extraDebt" name="Extra Debt Kept" stroke="var(--color-extraDebt)" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
              </LineChart>
            </ChartContainer>
          </div>

          {/* Indexation scenario comparison */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-primary" />
              Indexation Scenario Comparison
            </h4>
            <p className="text-[10px] text-muted-foreground">
              How different inflation/wage outcomes change payoff time and total indexation (same repayments across all).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="text-foreground border-b border-border sticky top-0 bg-card z-10 font-bold shadow-xs">
                  <tr>
                    <th className="py-2 px-2.5">Scenario Rate</th>
                    <th className="py-2 px-2.5">Payoff Time</th>
                    <th className="py-2 px-2.5">Total Indexation</th>
                    <th className="py-2 px-2.5">Total Repaid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {indexationScenarios.map(row => {
                    const pct = Math.round(row.indexationRate * 1000) / 10;
                    const isCurrent = Math.abs(row.indexationRate - indexationRate / 100) < 0.005;
                    return (
                      <tr key={pct} className={isCurrent ? 'bg-primary/10' : ''}>
                        <td className="py-1.5 px-2.5 font-bold">
                          {pct.toFixed(1)}%{isCurrent && <span className="ml-1 text-[9px] text-primary font-semibold">(active)</span>}
                        </td>
                        <td className="py-1.5 px-2.5">{row.payoffYears} yrs</td>
                        <td className="py-1.5 px-2.5 text-amber-500">${row.totalIndexation.toLocaleString()}</td>
                        <td className="py-1.5 px-2.5">${row.totalRepaid.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compulsory vs voluntary repayment split */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <h4 className="text-xs font-bold text-foreground">Compulsory vs Voluntary Repayment Split</h4>
            <p className="text-[10px] text-muted-foreground">
              Year-by-year composition of debt reduction — compulsory (PAYG) and voluntary payments against indexation growth.
            </p>
            <ChartContainer config={SPLIT_CONFIG} className="h-[220px] w-full">
              <BarChart data={splitRows} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(splitRows.length / 5)} />
                <YAxis tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="compulsory" name="Compulsory" stackId="a" fill="var(--color-compulsory)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="voluntary" name="Voluntary" stackId="a" fill="var(--color-voluntary)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="indexation" name="Indexation" stackId="b" fill="var(--color-indexation)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Schedule Table Preview */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <h4 className="text-xs font-bold text-foreground">15-Year Simulation Schedule Preview</h4>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-[11px] text-left">
                <thead className="text-foreground border-b border-border sticky top-0 bg-card z-10 font-bold shadow-xs">
                  <tr>
                    <th className="py-2 px-2.5">Yr</th>
                    <th className="py-2 px-2.5">Salary</th>
                    <th className="py-2 px-2.5">Compulsory</th>
                    <th className="py-2 px-2.5">Debt Remainder</th>
                    <th className="py-2 px-2.5">HISA</th>
                    <th className="py-2 px-2.5">ETF Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {result.schedule.slice(0, 8).map(row => (
                    <tr key={row.year} className="hover:bg-muted/40 transition-colors">
                      <td className="py-1.5 px-2.5 font-bold">{row.year}</td>
                      <td className="py-1.5 px-2.5">${row.salary.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5">${row.compulsoryRepayment.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 text-primary font-semibold">${row.endingBalance.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 text-amber-600 dark:text-amber-400 font-semibold">${row.hisaBalance.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">${row.etfBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Actions */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="HECS Payoff Plan"
      />

      {/* Retrospective Credits Modal */}
      {showRetroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-500" />
                <h3 className="text-sm font-bold text-foreground">2023–2024 Retrospective Credits</h3>
              </div>
              <button
                onClick={() => setShowRetroModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Under the Universities Accord legislation, HELP indexation was backdated to 1 June 2023 to use the lower of CPI and WPI.
            </p>

            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">June 2023 Indexation:</span>
                <span className="font-mono font-bold text-foreground">7.1% CPI ➔ 3.2% WPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">June 2024 Indexation:</span>
                <span className="font-mono font-bold text-foreground">4.7% CPI ➔ 4.0% WPI</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-foreground">Estimated Credit on ${currentDebt.toLocaleString()} Debt:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +{formatCurrency(retroSavings.creditSaved)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              These credits were automatically applied by the ATO directly into your myGov HELP loan account.
            </p>

            <button
              onClick={() => setShowRetroModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tertiary Limits & CSP Bands Modal */}
      {showCapsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Statutory Higher Education Rules &amp; Limits (2026–2027)
                </h3>
              </div>
              <button
                onClick={() => setShowCapsModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Official statutory rates and borrowing caps indexed under the Higher Education Support Act 2003, Department of Education, and StudyAssist.
            </p>

            {/* Combined HELP Loan Borrowing Limits */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                Combined HELP Loan Borrowing Limits (myHELPbalance)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-1">
                  <div className="font-semibold text-muted-foreground">2026 Limits</div>
                  <div className="flex justify-between">
                    <span>General Courses:</span>
                    <span className="font-mono font-bold text-foreground">${HELP_LOAN_LIMITS[2026].general.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medicine / Dentistry / Vet / Aviation:</span>
                    <span className="font-mono font-bold text-primary">${HELP_LOAN_LIMITS[2026].medicineDentistryVetAviation.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-1">
                  <div className="font-semibold text-muted-foreground">2027 Limits</div>
                  <div className="flex justify-between">
                    <span>General Courses:</span>
                    <span className="font-mono font-bold text-foreground">${HELP_LOAN_LIMITS[2027].general.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medicine / Dentistry / Vet / Aviation:</span>
                    <span className="font-mono font-bold text-primary">${HELP_LOAN_LIMITS[2027].medicineDentistryVetAviation.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The HELP loan limit is renewable: repayments made through the ATO restore borrowing capacity for lifelong learning.
              </p>
            </div>

            {/* Commonwealth Supported Places (CSP) Bands */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Commonwealth Supported Places (CSP) Student Contribution Bands (per EFTSL)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="text-muted-foreground border-b border-border font-bold">
                    <tr>
                      <th className="py-1.5 px-2">Band &amp; Discipline Areas</th>
                      <th className="py-1.5 px-2 text-right">2026 Cap</th>
                      <th className="py-1.5 px-2 text-right">2027 Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    <tr>
                      <td className="py-1.5 px-2 font-sans font-medium text-foreground">
                        <strong>Band 1:</strong> Education, Nursing, Teaching, English, Maths, Languages, Agriculture
                      </td>
                      <td className="py-1.5 px-2 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2026].band1EducationNursing.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2027].band1EducationNursing.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-sans font-medium text-foreground">
                        <strong>Band 2:</strong> Allied Health, Computing, Built Env, Science, Engineering, Arts
                      </td>
                      <td className="py-1.5 px-2 text-right text-sky-600 dark:text-sky-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2026].band2AlliedHealthEngineeringScience.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-sky-600 dark:text-sky-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2027].band2AlliedHealthEngineeringScience.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-sans font-medium text-foreground">
                        <strong>Band 3:</strong> Medicine, Dentistry, Veterinary Science
                      </td>
                      <td className="py-1.5 px-2 text-right text-amber-600 dark:text-amber-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2026].band3MedicineDentistryVet.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-amber-600 dark:text-amber-400 font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2027].band3MedicineDentistryVet.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-sans font-medium text-foreground">
                        <strong>Band 4:</strong> Law, Accounting, Economics, Commerce, Communications, Society &amp; Culture
                      </td>
                      <td className="py-1.5 px-2 text-right text-primary font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2026].band4LawCommerceEconomics.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-primary font-bold">
                        ${CSP_STUDENT_CONTRIBUTION_BANDS[2027].band4LawCommerceEconomics.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground">
                1 EFTSL = 1 full-time year (typically 8 single units @ 0.125 EFTSL each).
              </p>
            </div>

            {/* SSAF Caps & Marginal Repayments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                <span className="font-bold text-foreground">Student Amenities (SSAF) Caps</span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2026 Full-Time / Part-Time:</span>
                  <span className="font-mono font-bold text-foreground">${SSAF_DETAILED_CAPS[2026].fullTime} / ${SSAF_DETAILED_CAPS[2026].partTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2027 Full-Time / Part-Time:</span>
                  <span className="font-mono font-bold text-foreground">${SSAF_DETAILED_CAPS[2027].fullTime} / ${SSAF_DETAILED_CAPS[2027].partTime}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Eligible students can defer 100% of SSAF via SA-HELP ($0 upfront).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                <span className="font-bold text-foreground">HELP Indexation &amp; Thresholds</span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2026-27 Repayment Threshold:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$69,528 ($0 below)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marginal Rates:</span>
                  <span className="font-mono font-bold text-foreground">15% | 17% | 10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Indexation Cap:</span>
                  <span className="font-mono font-bold text-primary">Lower of CPI &amp; WPI (2.8%)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCapsModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Share Financial Plan</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: generateSimpleQRCodeSVG(shareUrl, 160) }} />

            <p className="text-xs text-center text-muted-foreground">
              Scan with your phone or copy the direct URL below to share your plan with zero server storage.
            </p>

            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full p-2 rounded-xl bg-muted border border-border text-[11px] font-mono text-foreground select-all"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Copied URL to clipboard!');
                setShowShareModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { runFinancialStressTest, maxSurvivableRate, applyCumulativeScenarios } from './engine';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  ShieldAlert,
  Flame,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  X,
  Gauge,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const SCENARIO_PRESETS = [
  { id: 'none', label: 'No shocks', rateRisePct: 0, jobLossMonths: 0, expenseShockPct: 0 },
  { id: 'rate2', label: 'Rate +2%', rateRisePct: 2, jobLossMonths: 0, expenseShockPct: 0 },
  { id: 'job3', label: 'Job loss 3mo', rateRisePct: 0, jobLossMonths: 3, expenseShockPct: 0 },
  { id: 'expense10', label: 'Expenses +10%', rateRisePct: 0, jobLossMonths: 0, expenseShockPct: 10 },
  { id: 'triple', label: 'Triple whammy', rateRisePct: 2, jobLossMonths: 3, expenseShockPct: 10 },
] as const;

function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-AU')}`;
}

export function FinancialStressTestCalc() {
  const grossSalary = 115000;
  const mortgageRate = 6.2;
  const hisaRate = 5.25;
  const [monthlyNetIncome, setMonthlyNetIncome] = useState<number>(7200);
  const [essentialExpenses, setEssentialExpenses] = useState<number>(3900);
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<number>(1400);
  const [cashSavings, setCashSavings] = useState<number>(25000);
  const [offsetBalance, setOffsetBalance] = useState<number>(45000);
  const [mortgageDebt, setMortgageDebt] = useState<number>(480000);
  const hasHospitalCover = true;
  const hasIncomeProtection = true;
  const relationshipStatus = 'single' as const;
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [bufferPct, setBufferPct] = useState<number>(3);
  const [presetId, setPresetId] = useState<string>('none');

  const result = useMemo(() => {
    return runFinancialStressTest({
      grossAnnualIncome: grossSalary,
      monthlyNetIncome,
      monthlyEssentialExpenses: essentialExpenses,
      monthlyDiscretionaryExpenses: discretionaryExpenses,
      liquidCashSavings: cashSavings,
      mortgageOffsetBalance: offsetBalance,
      mortgageDebtBalance: mortgageDebt,
      currentMortgageInterestRate: mortgageRate / 100,
      hisaInterestRate: hisaRate / 100,
      hasPrivateHospitalCover: hasHospitalCover,
      relationshipStatus,
      dependentsCount: 0,
      hasIncomeProtectionInsurance: hasIncomeProtection,
    });
  }, [
    grossSalary,
    monthlyNetIncome,
    essentialExpenses,
    discretionaryExpenses,
    cashSavings,
    offsetBalance,
    mortgageDebt,
    mortgageRate,
    hisaRate,
    hasHospitalCover,
    hasIncomeProtection,
    relationshipStatus,
  ]);

  const preset = SCENARIO_PRESETS.find(p => p.id === presetId) ?? SCENARIO_PRESETS[0];

  // Reverse stress test: max survivable rate given monthly income vs expenses
  const reverse = useMemo(
    () => maxSurvivableRate(
      monthlyNetIncome,
      essentialExpenses + discretionaryExpenses,
      Math.max(0, mortgageDebt - offsetBalance),
      mortgageRate,
      30,
      bufferPct,
    ),
    [monthlyNetIncome, essentialExpenses, discretionaryExpenses, mortgageDebt, offsetBalance, mortgageRate, bufferPct],
  );

  // Cumulative scenario presets applied to current cashflow
  const cumulative = useMemo(
    () => applyCumulativeScenarios({
      monthlyNetIncome,
      monthlyEssentialExpenses: essentialExpenses,
      monthlyDiscretionaryExpenses: discretionaryExpenses,
      mortgageDebtBalance: mortgageDebt,
      mortgageOffsetBalance: offsetBalance,
      currentMortgageInterestRate: mortgageRate / 100,
      liquidCashSavings: cashSavings,
      rateRisePct: preset.rateRisePct,
      jobLossMonths: preset.jobLossMonths,
      expenseShockPct: preset.expenseShockPct,
      bufferPct,
    }),
    [monthlyNetIncome, essentialExpenses, discretionaryExpenses, mortgageDebt, offsetBalance, mortgageRate, cashSavings, preset, bufferPct],
  );

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Stress Metric', 'Result'];
    const rows = [
      ['Gross Salary', `$${grossSalary}`],
      ['Monthly Net Income', `$${monthlyNetIncome}`],
      ['Total Liquid Reserves (Cash + Offset)', `$${cashSavings + offsetBalance}`],
      ['Emergency Runway (Months)', `${result.emergencyRunwayMonths}`],
      ['Bare-Bones Survival Runway (Months)', `${result.bareBonesRunwayMonths}`],
      ['Pre-Tax Equivalent Offset Yield', `${result.preTaxEquivalentOffsetYield}%`],
      ['HISA Net Return After Tax', `${result.hisaNetReturnAfterTax}%`],
      ['Offset Arbitrage Advantage (Annual)', `$${result.offsetArbitrageAdvantagePerYear}`],
      ['JobSeeker LAWP Waiting Period (Weeks)', `${result.jobSeekerLAWPWeeks}`],
      ['Financial Health Score', `${result.healthScore.totalScore} / 100 (${result.healthScore.rating})`],
    ];
    exportToCSV('Financial_Stress_Test_Report.csv', headers, rows);
    toast.success('Stress test report exported to CSV!');
  };

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = {
      grossSalary,
      monthlyNetIncome,
      essentialExpenses,
      discretionaryExpenses,
      cashSavings,
      offsetBalance,
      mortgageDebt,
    };
    const hash = await encodePlanToHash(state);
    const url = `${window.location.origin}${window.location.pathname}#plan=${hash}`;
    setShareUrl(url);
    setShowShareModal(true);
    navigator.clipboard.writeText(url);
    toast.success('Shareable link copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              APRA +300 bps Shock & LAWP Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Emergency Fund Runway & Stress Tester
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Simulate job loss, inflation spikes, APRA interest rate shocks, and HISA vs Mortgage Offset pre-tax yield arbitrage.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleSharePlan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Plan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Emergency Runway
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            {result.emergencyRunwayMonths} Months
          </div>
          <span className="text-[10px] text-muted-foreground">
            Bare-bones: {result.bareBonesRunwayMonths} Months
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Offset Pre-Tax Yield
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {result.preTaxEquivalentOffsetYield}%
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Beats HISA ({result.hisaNetReturnAfterTax}% after tax)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Financial Health Score
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            {result.healthScore.totalScore} / 100
          </div>
          <span className="text-[10px] text-primary font-bold uppercase">
            Rating: {result.healthScore.rating}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            JobSeeker LAWP
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-500 font-mono">
            {result.jobSeekerLAWPWeeks} Weeks
          </div>
          <span className="text-[10px] text-muted-foreground">Liquid assets waiting period</span>
        </div>
      </div>

      {/* Stress Test Crisis Scenarios Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-500" />
          4-Point Macroeconomic Crisis Simulations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(result.scenarios).map((sc, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                sc.isFatal
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate">{sc.scenarioName}</span>
                {sc.isFatal ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>

              <div className="text-lg font-bold font-mono">
                {sc.monthlyDeficitOrSurplus >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">+${sc.monthlyDeficitOrSurplus}/mo</span>
                ) : (
                  <span className="text-danger">-${Math.abs(sc.monthlyDeficitOrSurplus)}/mo</span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {sc.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reverse Stress Test */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-cyan-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Reverse Stress Test
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Max Surviv</span>
            <div className="text-xl font-extrabold font-mono text-foreground mt-0.5">
              {reverse.maxRate.toFixed(1)}%
            </div>
            <span className="text-[10px] text-muted-foreground">
              +{reverse.maxRateIncreasePts.toFixed(1)} pts above {mortgageRate}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Repayment at Max</span>
            <div className="text-xl font-extrabold font-mono text-foreground mt-0.5">
              ${reverse.monthlyRepaymentAtMax.toLocaleString()}/mo
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Surplus at Max</span>
            <div className={`text-xl font-extrabold font-mono mt-0.5 ${reverse.surplusAtMax >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
              {reverse.surplusAtMax >= 0 ? '+' : '-'}${Math.abs(reverse.surplusAtMax).toLocaleString()}/mo
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Verdict</span>
            <span className={`text-sm font-bold mt-0.5 ${reverse.survivesAnyRise ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
              {reverse.capped
                ? 'Survives every rise'
                : reverse.survivesAnyRise
                  ? 'Survives up to ceiling'
                  : 'Already underwater'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground shrink-0">Repayment Buffer</span>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={bufferPct}
            onChange={e => { sound.playTick(); setBufferPct(Number(e.target.value)); }}
            className="flex-1 accent-primary cursor-pointer"
          />
          <span className="font-mono text-xs text-foreground w-10 text-right">{bufferPct}%</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Highest rate the borrower survives given {formatMoney(monthlyNetIncome)}/mo income, {formatMoney(essentialExpenses + discretionaryExpenses)}/mo expenses and a {formatMoney(Math.max(0, mortgageDebt - offsetBalance))} net mortgage (P&amp;I over 30 yrs, buffer on the repayment).
        </p>
      </div>

      {/* Cumulative Scenario Presets */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Cumulative Scenario Presets
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIO_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => { sound.playClick(); setPresetId(p.id); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${presetId === p.id ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={`p-4 rounded-xl border space-y-2 ${cumulative.isFatal ? 'bg-rose-500/10 border-rose-500/30' : 'bg-muted/40 border-border'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Combined Impact</span>
            {cumulative.isFatal ? (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Monthly Surplus</span>
              <span className={`text-lg font-bold font-mono ${cumulative.monthlySurplusAfterShocks >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
                {cumulative.monthlySurplusAfterShocks >= 0 ? '+' : '-'}${Math.abs(cumulative.monthlySurplusAfterShocks).toLocaleString()}/mo
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Extra Interest</span>
              <span className="text-lg font-bold font-mono text-foreground">${cumulative.extraMonthlyInterest.toLocaleString()}/mo</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Expense Shock</span>
              <span className="text-lg font-bold font-mono text-foreground">${cumulative.expenseShockMonthly.toLocaleString()}/mo</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Runway</span>
              <span className="text-lg font-bold font-mono text-foreground">
                {cumulative.survivingMonths === 99 ? '∞' : `${cumulative.survivingMonths} mo`}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{cumulative.notes}</p>
        </div>
      </div>

      {/* Main Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income & Expenses */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Cashflow & Spending</h3>

          {/* Monthly Net Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-net-income" className="text-muted-foreground">Monthly Net Take-Home Pay</label>
              <span className="font-mono text-foreground">${monthlyNetIncome.toLocaleString()}/mo</span>
            </div>
            <input
              id="stress-net-income"
              type="range"
              min={2500}
              max={25000}
              step={100}
              value={monthlyNetIncome}
              onChange={e => {
                sound.playTick();
                setMonthlyNetIncome(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Essential Expenses */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-essential-exp" className="text-muted-foreground">Essential Expenses (Housing, Food, Utilities)</label>
              <span className="font-mono text-foreground">${essentialExpenses.toLocaleString()}/mo</span>
            </div>
            <input
              id="stress-essential-exp"
              type="range"
              min={1000}
              max={15000}
              step={50}
              value={essentialExpenses}
              onChange={e => {
                sound.playTick();
                setEssentialExpenses(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Discretionary Expenses */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-disc-exp" className="text-muted-foreground">Discretionary Spending (Dining, Shopping, Fun)</label>
              <span className="font-mono text-foreground">${discretionaryExpenses.toLocaleString()}/mo</span>
            </div>
            <input
              id="stress-disc-exp"
              type="range"
              min={0}
              max={8000}
              step={50}
              value={discretionaryExpenses}
              onChange={e => {
                sound.playTick();
                setDiscretionaryExpenses(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Liquid Assets & Debt */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Reserves & Mortgage Debt</h3>

          {/* Cash Savings */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-cash" className="text-muted-foreground">HISA Bank Savings (5.25% p.a.)</label>
              <span className="font-mono text-foreground">${cashSavings.toLocaleString()}</span>
            </div>
            <input
              id="stress-cash"
              type="range"
              min={0}
              max={200000}
              step={2500}
              value={cashSavings}
              onChange={e => {
                sound.playTick();
                setCashSavings(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Offset Balance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-offset" className="text-muted-foreground">Mortgage Offset Account Balance</label>
              <span className="font-mono text-foreground">${offsetBalance.toLocaleString()}</span>
            </div>
            <input
              id="stress-offset"
              type="range"
              min={0}
              max={500000}
              step={5000}
              value={offsetBalance}
              onChange={e => {
                sound.playTick();
                setOffsetBalance(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Mortgage Debt */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="stress-debt" className="text-muted-foreground">Mortgage Loan Balance</label>
              <span className="font-mono text-foreground">${mortgageDebt.toLocaleString()}</span>
            </div>
            <input
              id="stress-debt"
              type="range"
              min={0}
              max={1500000}
              step={25000}
              value={mortgageDebt}
              onChange={e => {
                sound.playTick();
                setMortgageDebt(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Share Stress Test Plan</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: generateSimpleQRCodeSVG(shareUrl, 160) }} />

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

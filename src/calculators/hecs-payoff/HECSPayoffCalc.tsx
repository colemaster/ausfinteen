import { useState, useMemo } from 'react';
import { simulateHECSPayoff, calcHECSRepayment } from './engine';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  GraduationCap,
  Download,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function HECSPayoffCalc() {
  // State
  const [currentDebt, setCurrentDebt] = useState<number>(38500);
  const [annualIncome, setAnnualIncome] = useState<number>(88000);
  const [lumpSumAvailable, setLumpSumAvailable] = useState<number>(5000);
  const [monthlyVoluntary, setMonthlyVoluntary] = useState<number>(250);
  const [mortgageRate, setMortgageRate] = useState<number>(6.2);
  const [etfReturn, setEtfReturn] = useState<number>(8.0);
  const [useMarginal, setUseMarginal] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const incomeGrowthRate = 3.5;
  const indexationRate = 3.2; // min(CPI, WPI)

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
      useMarginal2025System: useMarginal,
      projectionYears: 15,
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
    useMarginal,
  ]);

  const initialRepayment = useMemo(() => {
    return calcHECSRepayment(annualIncome, useMarginal);
  }, [annualIncome, useMarginal]);

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
              2025–2027 Accord Reforms Ready
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              HECS/HELP Payoff vs Investing Simulator
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compare voluntary debt payoff against Mortgage Offset (6.2% tax-free) and ASX ETFs (8.0% growth).
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Compulsory Payoff Time
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            {result.compulsoryPayoffYears} Years
          </div>
          <span className="text-[10px] text-muted-foreground">Without extra payments</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Voluntary Payoff Time
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-success font-mono">
            {result.voluntaryPayoffYears} Years
          </div>
          <span className="text-[10px] text-success font-semibold">
            {result.yearsSaved > 0 ? `⚡️ Saves ${result.yearsSaved} Years` : 'Matches schedule'}
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
            -<OdometerCounter value={result.apraBorrowingCapacityImpact} />
          </div>
          <span className="text-[10px] text-warning font-semibold">~9.5x annual repayment</span>
        </div>
      </div>

      {/* Main Interactive Controls & Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>Your Loan & Cashflow Inputs</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold">2025 Marginal System</span>
              <input
                type="checkbox"
                checked={useMarginal}
                onChange={e => {
                  sound.playClick();
                  setUseMarginal(e.target.checked);
                }}
                className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
              />
            </div>
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
              <span className="font-mono font-bold text-foreground">${initialRepayment.toLocaleString()}/yr</span>
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
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label htmlFor="hecs-mortgage-rate" className="text-[11px] font-semibold text-muted-foreground">Mortgage Offset Rate</label>
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
            </div>

            <div className="space-y-1">
              <label htmlFor="hecs-etf-return" className="text-[11px] font-semibold text-muted-foreground">ASX ETF Return</label>
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
              : 'bg-primary/10 border-primary/30 text-primary-foreground'
          }`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 text-primary shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Optimal Math Strategy: {result.optimalStrategy === 'invest_etf' ? '📈 Invest in ASX ETFs (VAS/VGS)' : result.optimalStrategy === 'mortgage_offset' ? '🏡 Park in Mortgage Offset' : '🎓 Pay off HECS First'}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {result.optimalStrategy === 'invest_etf'
                    ? `Over 15 years, investing voluntary cashflow in broad index ETFs compounds to ~$${result.finalWealthETFInvesting.toLocaleString()} vs ~$${result.finalWealthMortgageOffset.toLocaleString()} in offset, beating the low ${indexationRate}% HECS indexation cap.`
                    : `Mortgage offset provides a guaranteed ~${mortgageRate}% tax-free return, creating ~$${result.finalWealthMortgageOffset.toLocaleString()} in interest savings.`}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Way Wealth Projection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Option A: Pay Off HECS</span>
              <div className="text-lg font-bold font-mono text-foreground">
                <OdometerCounter value={result.finalWealthVoluntaryPayoff} />
              </div>
              <p className="text-[10px] text-muted-foreground">Freed up cashflow invested after loan hits $0</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Option B: Mortgage Offset</span>
              <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
                <OdometerCounter value={result.finalWealthMortgageOffset} />
              </div>
              <p className="text-[10px] text-muted-foreground">Guaranteed tax-free mortgage interest savings</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Option C: ASX ETF (VAS/VGS)</span>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                <OdometerCounter value={result.finalWealthETFInvesting} />
              </div>
              <p className="text-[10px] text-muted-foreground">8.0% historical long-term compound return</p>
            </div>
          </div>

          {/* Schedule Table Preview */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <h4 className="text-xs font-bold text-foreground">15-Year Simulation Amortization Schedule</h4>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-[11px] text-left">
                <thead className="text-muted-foreground border-b border-border/60 sticky top-0 bg-card">
                  <tr>
                    <th className="py-1.5 px-2">Yr</th>
                    <th className="py-1.5 px-2">Salary</th>
                    <th className="py-1.5 px-2">Compulsory</th>
                    <th className="py-1.5 px-2">Debt Remainder</th>
                    <th className="py-1.5 px-2">ETF Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {result.schedule.slice(0, 8).map(row => (
                    <tr key={row.year} className="hover:bg-muted/40 transition-colors">
                      <td className="py-1.5 px-2">{row.year}</td>
                      <td className="py-1.5 px-2">${row.salary.toLocaleString()}</td>
                      <td className="py-1.5 px-2">${row.compulsoryRepayment.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-primary font-semibold">${row.endingBalance.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-emerald-600 dark:text-emerald-400">${row.etfBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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

import { useState, useMemo } from 'react';
import {
  simulateRetirementPlan,
  calculateAgePension,
  generateReturnSequences,
  monteCarloDrawdownFan,
  transferBalanceCapCheck,
} from './engine';
import { MonteCarloFanChart } from '@/components/shared/MonteCarloFanChart';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  Coins,
  Sparkles,
  Download,
  Share2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const MONTE_CARLO_SIMS = 40;
const MONTE_CARLO_VOLATILITY = 0.12;

export function SuperDrawdownCalc() {
  const currentAge = 60;
  const otherAssets = 25000;
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [superBalance, setSuperBalance] = useState<number>(750000);
  const [desiredIncome, setDesiredIncome] = useState<number>(60000);
  const [expectedReturn, setExpectedReturn] = useState<number>(6.5);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [lumpSum, setLumpSum] = useState<number>(0);
  const [relationshipStatus, setRelationshipStatus] = useState<'single' | 'couple'>('single');
  const [isHomeowner, setIsHomeowner] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const simResult = useMemo(() => {
    return simulateRetirementPlan({
      currentAge,
      retirementAge,
      superBalanceAtRetirement: superBalance,
      desiredAnnualIncome: desiredIncome,
      expectedAnnualReturn: expectedReturn / 100,
      inflationRate: inflationRate / 100,
      relationshipStatus,
      isHomeowner,
      otherAssessableAssets: otherAssets,
      projectionYears: 35,
      lumpSumWithdrawal: lumpSum,
    });
  }, [
    currentAge,
    retirementAge,
    superBalance,
    desiredIncome,
    expectedReturn,
    inflationRate,
    relationshipStatus,
    isHomeowner,
    otherAssets,
    lumpSum,
  ]);

  // Monte Carlo market-sequence overlay (seeded for reproducible plans)
  const fanChartData = useMemo(() => {
    const sequences = generateReturnSequences(
      35,
      MONTE_CARLO_SIMS,
      expectedReturn / 100,
      MONTE_CARLO_VOLATILITY,
      42,
    );
    return monteCarloDrawdownFan({
      currentAge,
      retirementAge,
      superBalanceAtRetirement: superBalance,
      desiredAnnualIncome: desiredIncome,
      expectedAnnualReturn: expectedReturn / 100,
      inflationRate: inflationRate / 100,
      relationshipStatus,
      isHomeowner,
      otherAssessableAssets: otherAssets,
      projectionYears: 35,
      lumpSumWithdrawal: lumpSum,
    }, sequences);
  }, [currentAge, retirementAge, superBalance, desiredIncome, expectedReturn, inflationRate, relationshipStatus, isHomeowner, otherAssets, lumpSum]);

  // Transfer Balance Cap warning on the highest projected balance
  const tbcCheck = useMemo(
    () => transferBalanceCapCheck(simResult.maxProjectedBalance, retirementAge),
    [simResult.maxProjectedBalance, retirementAge],
  );

  const pensionAt67 = useMemo(() => {
    return calculateAgePension({
      age: 67,
      relationshipStatus,
      isHomeowner,
      financialAssets: superBalance * 0.9, // Estimated at age 67
      otherAssessableAssets: otherAssets,
      otherFortnightlyIncome: 0,
    });
  }, [relationshipStatus, isHomeowner, superBalance, otherAssets]);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = [
      'Age',
      'Starting Super ($)',
      'Drawdown ($)',
      'Investment Return ($)',
      'Age Pension ($)',
      'Total Annual Income ($)',
      'Ending Super ($)',
    ];
    const rows = simResult.schedule.map(r => [
      r.age,
      r.startingBalance,
      r.drawdownAmount,
      r.investmentEarnings,
      r.agePensionAmount,
      r.totalIncome,
      r.endingBalance,
    ]);
    exportToCSV('Retirement_Drawdown_and_Age_Pension.csv', headers, rows);
    toast.success('Retirement schedule exported to CSV!');
  };

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = {
      currentAge,
      retirementAge,
      superBalance,
      desiredIncome,
      expectedReturn,
      relationshipStatus,
      isHomeowner,
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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              Schedule 7 SISR & Services Australia Means Test
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Super Drawdown & Age Pension Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Calculate tax-free Account-Based Pension drawdowns, deeming rates, and Centrelink Age Pension integration.
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
            Super Longevity
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {simResult.isFullySustainableTo100 ? 'Age 100+ (Perpetual)' : `Age ${simResult.exhaustionAge}`}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {simResult.isFullySustainableTo100 ? 'Zero capital exhaustion risk' : `Funds last ${simResult.sustainableYears} years`}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Age Pension at Age 67
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            <OdometerCounter value={pensionAt67.annualAgePension} />
            <span className="text-xs font-normal text-muted-foreground">/yr</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            ${pensionAt67.fortnightlyAgePension.toFixed(2)} / fortnight
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Determining Means Test
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground capitalize">
            {pensionAt67.determiningTest === 'assets' ? 'Assets Test' : 'Deeming Test'}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {pensionAt67.determiningTest === 'assets' ? 'Asset taper applies' : 'Deemed income applies'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Lifetime Centrelink Pension
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-500 font-mono">
            <OdometerCounter value={simResult.lifetimeAgePensionReceived} />
          </div>
          <span className="text-[10px] text-muted-foreground">Combined safety net received</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Retirement Inputs</h3>

          {/* Relationship & Homeowner Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Relationship</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setRelationshipStatus('single');
                  }}
                  className={`py-1 rounded-lg text-xs font-bold ${relationshipStatus === 'single' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setRelationshipStatus('couple');
                  }}
                  className={`py-1 rounded-lg text-xs font-bold ${relationshipStatus === 'couple' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                >
                  Couple
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Homeownership</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsHomeowner(true);
                  }}
                  className={`py-1 rounded-lg text-xs font-bold ${isHomeowner ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                >
                  Homeowner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsHomeowner(false);
                  }}
                  className={`py-1 rounded-lg text-xs font-bold ${!isHomeowner ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                >
                  Renter
                </button>
              </div>
            </div>
          </div>

          {/* Super Balance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="super-balance" className="text-muted-foreground">Super Balance at Retirement</label>
              <span className="font-mono text-foreground">${superBalance.toLocaleString()}</span>
            </div>
            <input
              id="super-balance"
              type="range"
              min={100000}
              max={2500000}
              step={25000}
              value={superBalance}
              onChange={e => {
                sound.playTick();
                setSuperBalance(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Desired Annual Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="super-income" className="text-muted-foreground">Target Annual Lifestyle Spending</label>
              <span className="font-mono text-foreground">${desiredIncome.toLocaleString()}/yr</span>
            </div>
            <input
              id="super-income"
              type="range"
              min={30000}
              max={150000}
              step={2500}
              value={desiredIncome}
              onChange={e => {
                sound.playTick();
                setDesiredIncome(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Retirement Age */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="super-retire-age" className="text-muted-foreground">Retirement Age</label>
              <span className="font-mono text-foreground">{retirementAge} Years Old</span>
            </div>
            <input
              id="super-retire-age"
              type="range"
              min={55}
              max={75}
              step={1}
              value={retirementAge}
              onChange={e => {
                sound.playTick();
                setRetirementAge(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Lump Sum at Retirement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="super-lump-sum" className="text-muted-foreground">Lump Sum at Retirement (min pension)</label>
              <span className="font-mono text-foreground">${lumpSum.toLocaleString()}</span>
            </div>
            <input
              id="super-lump-sum"
              type="range"
              min={0}
              max={Math.min(500000, Math.max(0, superBalance))}
              step={10000}
              value={lumpSum}
              onChange={e => {
                sound.playTick();
                setLumpSum(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Withdrawn tax-free at retirement; the rest runs the account-based pension. Remaining balance: <span className="font-mono font-bold text-foreground">${Math.max(0, superBalance - lumpSum).toLocaleString()}</span>
            </p>
          </div>

          {/* Return & Inflation */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label htmlFor="super-expected-return" className="text-[11px] font-semibold text-muted-foreground">Super Annual Return (0% Tax)</label>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  id="super-expected-return"
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(Number(e.target.value))}
                  className="w-full p-1.5 rounded-lg bg-muted border border-border text-foreground font-bold"
                />
                <span>%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="super-inflation" className="text-[11px] font-semibold text-muted-foreground">Annual Inflation</label>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  id="super-inflation"
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={e => setInflationRate(Number(e.target.value))}
                  className="w-full p-1.5 rounded-lg bg-muted border border-border text-foreground font-bold"
                />
                <span>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Transfer Balance Cap warning */}
          {tbcCheck.overCap && (
            <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Transfer Balance Cap Warning
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-200/80 leading-relaxed">
                Your projected super balance peaks at{' '}
                <span className="font-mono font-bold">${simResult.maxProjectedBalance.toLocaleString()}</span>, which exceeds
                the general Transfer Balance Cap of{' '}
                <span className="font-mono font-bold">${tbcCheck.cap.toLocaleString()}</span> by{' '}
                <span className="font-mono font-bold">${tbcCheck.excess.toLocaleString()}</span>.
                Amounts above the cap cannot remain in the tax-free pension phase and would need to be moved to accumulation
                phase or withdrawn.
              </p>
            </div>
          )}

          {/* Monte Carlo sequence fan */}
          <MonteCarloFanChart
            data={fanChartData}
            title="Market Sequence Risk — 40 Simulated Return Paths"
            subtitle={`Projected super balance percentiles (10th–90th) across ${MONTE_CARLO_SIMS} seeded Monte Carlo sequences at ${expectedReturn.toFixed(1)}% mean return / ${MONTE_CARLO_VOLATILITY * 100}% volatility`}
            height={280}
          />

          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Retirement Drawdown vs Age Pension Cashflow Mix
            </h4>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-[11px] text-left">
                <thead className="text-muted-foreground border-b border-border/60 sticky top-0 bg-card">
                  <tr>
                    <th className="py-1.5 px-2">Age</th>
                    <th className="py-1.5 px-2">Starting Balance</th>
                    <th className="py-1.5 px-2">ABP Drawdown</th>
                    <th className="py-1.5 px-2">Age Pension</th>
                    <th className="py-1.5 px-2">Total Income</th>
                    <th className="py-1.5 px-2">Ending Super</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {simResult.schedule.map(row => (
                    <tr key={row.age} className={`hover:bg-muted/40 transition-colors ${!row.isSolvent ? 'opacity-40 text-danger' : ''}`}>
                      <td className="py-1.5 px-2 font-bold">{row.age}</td>
                      <td className="py-1.5 px-2">${row.startingBalance.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-primary">${row.drawdownAmount.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-amber-500">${row.agePensionAmount.toLocaleString()}</td>
                      <td className="py-1.5 px-2 font-bold text-foreground">${row.totalIncome.toLocaleString()}</td>
                      <td className="py-1.5 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${row.endingBalance.toLocaleString()}
                      </td>
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
              <h3 className="text-sm font-bold text-foreground">Share Retirement Plan</h3>
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

import { useMemo, useState, useDeferredValue } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { MonteCarloFanChart } from '../../components/shared/MonteCarloFanChart';
import {
  calculateFIRENumber,
  yearsToFIRE,
  projectSavings,
  inflationAdjustedSeries,
  simulateSequenceRisk,
  fanFromScenarioYearlies,
  type ReturnScenario,
} from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { fireTrajectoryConfig } from '@/lib/chart-configs';

interface Props {
  currentAge: number;
  onCurrentAgeChange: (v: number) => void;
  currentInvestments: number;
  onCurrentInvestmentsChange: (v: number) => void;
  investmentsLocked?: boolean;
  annualSavings: number;
  onAnnualSavingsChange: (v: number) => void;
  annualSavingsLocked?: boolean;
  returnRate: number;
  onReturnRateChange: (v: number) => void;
}

const DRAWDOWN_YEARS = 30;

export function ClassicFIRE({
  currentAge, onCurrentAgeChange,
  currentInvestments, onCurrentInvestmentsChange, investmentsLocked,
  annualSavings, onAnnualSavingsChange, annualSavingsLocked,
  returnRate, onReturnRateChange,
}: Props) {
  const [annualExpenses, setAnnualExpenses] = useState(80000);
  const [swr, setSwr] = useState(4);
  const [targetRetirementAge, setTargetRetirementAge] = useState(65);
  const [inflationRate, setInflationRate] = useState(3);
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(true);

  const fireNumber = useMemo(
    () => calculateFIRENumber(annualExpenses, swr / 100),
    [annualExpenses, swr],
  );

  const years = useMemo(
    () => yearsToFIRE(currentInvestments, annualSavings, fireNumber, returnRate),
    [currentInvestments, annualSavings, fireNumber, returnRate],
  );

  const projYears = Math.min(years + 5, 60);
  const trajectory = useMemo(
    () => projectSavings(currentInvestments, annualSavings, returnRate, projYears),
    [currentInvestments, annualSavings, returnRate, projYears],
  );

  const inflationSeries = useMemo(
    () => showInflationAdjusted
      ? inflationAdjustedSeries(currentInvestments, annualSavings, returnRate, inflationRate, projYears)
      : null,
    [showInflationAdjusted, currentInvestments, annualSavings, returnRate, inflationRate, projYears],
  );

  const chartData = trajectory.map((v, i) => ({
    year: `${currentAge + i + 1}`,
    Portfolio: v,
    'Real Portfolio': inflationSeries?.real[i] ?? v,
  }));

  const deferredChartData = useDeferredValue(chartData);

  const progress = fireNumber > 0 ? Math.min(100, (currentInvestments / fireNumber) * 100) : 0;
  const fireAge = currentAge + years;
  const onTrack = fireAge <= targetRetirementAge;

  // Sequence-of-returns risk scenarios starting from the FIRE number
  const sequenceScenarios = useMemo((): ReturnScenario[] => {
    const steady: number[] = Array(DRAWDOWN_YEARS).fill(returnRate);
    const earlyCrash: number[] = [-30, -20, ...Array(DRAWDOWN_YEARS - 2).fill(returnRate)];
    const lateCrash: number[] = [...Array(DRAWDOWN_YEARS - 2).fill(returnRate), -30, -20];
    const volatile: number[] = Array.from({ length: DRAWDOWN_YEARS }, (_, i) =>
      i % 2 === 0 ? returnRate + 8 : returnRate - 8,
    );
    return [
      { label: 'Steady', returns: steady },
      { label: 'Early Crash', returns: earlyCrash },
      { label: 'Late Crash', returns: lateCrash },
      { label: 'Volatile', returns: volatile },
    ];
  }, [returnRate]);

  const sequenceResults = useMemo(
    () => simulateSequenceRisk(fireNumber, annualExpenses / 12, DRAWDOWN_YEARS, sequenceScenarios),
    [fireNumber, annualExpenses, sequenceScenarios],
  );

  const sequenceFan = useMemo(
    () => fanFromScenarioYearlies(sequenceResults),
    [sequenceResults],
  );

  const swrSensitivity = [3, 3.5, 4, 4.5, 5].map(rate => ({
    rate,
    fireNumber: calculateFIRENumber(annualExpenses, rate / 100),
    years: yearsToFIRE(currentInvestments, annualSavings, calculateFIRENumber(annualExpenses, rate / 100), returnRate),
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Current Age" value={currentAge} onChange={v => onCurrentAgeChange(Math.round(v))} min={18} max={70} step={1} />
        <NumberInput label="Target Retirement Age" value={targetRetirementAge} onChange={v => setTargetRetirementAge(Math.round(v))} min={25} max={75} step={1} />
        <NumberInput label="Annual Expenses (Ret.)" value={annualExpenses} onChange={setAnnualExpenses} min={10000} max={500000} step={5000} prefix="$" />
        {investmentsLocked
          ? <PortfolioField label="Current Investments" value={currentInvestments} prefix="$" />
          : <NumberInput label="Current Investments" value={currentInvestments} onChange={onCurrentInvestmentsChange} min={0} max={10000000} step={10000} prefix="$" />
        }
        {annualSavingsLocked
          ? <PortfolioField label="Annual Savings" value={annualSavings} prefix="$" />
          : <NumberInput label="Annual Savings" value={annualSavings} onChange={onAnnualSavingsChange} min={0} max={500000} step={5000} prefix="$" />
        }
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <SliderControl label="Investment Return (pa)" value={returnRate} onChange={onReturnRateChange} min={2} max={15} step={0.5} suffix="%" />
        <SliderControl label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2} max={6} step={0.5} suffix="%" />
        <SliderControl label="Inflation Rate (CPI)" value={inflationRate} onChange={setInflationRate} min={0} max={10} step={0.5} suffix="%" />
        <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] self-end pb-3">
          <input
            type="checkbox"
            checked={showInflationAdjusted}
            onChange={e => setShowInflationAdjusted(e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)] rounded-sm cursor-pointer"
          />
          Show inflation-adjusted
        </label>
      </div>

      {/* Progress bar */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-2">
          <span>Progress to FIRE</span>
          <span className="font-mono font-semibold text-[var(--primary)]">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-[var(--background)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
          <span>{formatCurrency(currentInvestments)}</span>
          <span>FIRE: {formatCompact(fireNumber)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="FIRE Number" value={formatCompact(fireNumber)} color="blue" />
        <StatCard label="Years to FIRE" value={`${years} yrs`} color="green" />
        <StatCard label="FIRE Age" value={`${fireAge}`} color="purple" />
        <StatCard label="Annual Expenses" value={formatCurrency(annualExpenses)} color="cyan" />
      </div>

      {!onTrack && (
        <div className="rounded-xl px-5 py-4 border text-sm font-medium bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400">
          Projected FIRE age ({fireAge}) is later than your target retirement age ({targetRetirementAge}) — currently {Math.max(0, fireAge - targetRetirementAge)} year(s) off track.
        </div>
      )}

      {/* Trajectory Chart */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">
          Portfolio Trajectory {showInflationAdjusted && `— nominal vs real (${inflationRate}% CPI)`}
        </h4>
        <ChartContainer config={fireTrajectoryConfig} className="h-[350px] w-full">
          <AreaChart data={deferredChartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-portfolio)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-portfolio)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={fireNumber} stroke="var(--color-fireTarget)" strokeDasharray="4 4" label={{ value: 'FIRE', fontSize: 10, fill: 'var(--color-fireTarget)' }} />
            <Area type="monotone" dataKey="Portfolio" stroke="var(--color-portfolio)" fill="url(#fillPortfolio)" strokeWidth={2.5} animationDuration={1200} animationEasing="ease-in-out" />
            {showInflationAdjusted && (
              <Area type="monotone" dataKey="Real Portfolio" stroke="var(--chart-5)" strokeDasharray="6 3" fill="none" strokeWidth={2} animationDuration={1200} animationEasing="ease-in-out" />
            )}
          </AreaChart>
        </ChartContainer>
        {showInflationAdjusted && (
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Real line = nominal balance deflated by {inflationRate}% CPI each year (today's purchasing power). Final real value: {formatCompact(inflationSeries?.real[projYears - 1] ?? 0)}.
          </p>
        )}
      </div>

      {/* Sequence-of-returns risk */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">Sequence-of-Returns Risk (30-yr drawdown from FIRE)</h4>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)]">
                {['Scenario', 'Ending Balance', 'Min Balance', 'Outcome'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sequenceResults.map(r => (
                <tr key={r.label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-semibold text-[var(--foreground)]">{r.label}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{formatCompact(r.endingBalance)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCompact(r.minBalance)}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${r.endingBalance > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {r.endingBalance > 0 ? 'Survives' : 'Exhausted'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)]">
          Same average return can produce wildly different outcomes depending on when bad years land — the classic sequence-of-returns risk.
        </p>
        <MonteCarloFanChart
          data={sequenceFan.map(p => ({ ...p, year: p.year }))}
          title="Drawdown Balance Fan (scenario percentiles)"
          subtitle="10th–90th percentile range of the portfolio balance across the 4 return scenarios above"
          height={280}
        />
      </div>

      {/* SWR Sensitivity Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['SWR', 'FIRE Number', 'Years to FIRE'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {swrSensitivity.map(row => (
              <tr key={row.rate} className={`border-b border-slate-100 last:border-0 ${row.rate === swr ? 'bg-[var(--primary)]/10 ' : ''}`}>
                <td className="px-4 py-2 text-[var(--muted-foreground)]">{row.rate}% {row.rate === swr && <span className="text-[var(--primary)]">(current)</span>}</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{formatCompact(row.fireNumber)}</td>
                <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--success)]">{row.years} yrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

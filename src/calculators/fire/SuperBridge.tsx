import { useState, useMemo } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { NumberInput } from '../../components/ui/NumberInput';
import { SliderControl } from '../../components/ui/SliderControl';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { calculateSuperBridge, PRESERVATION_AGE } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { superBridgeConfig } from '@/lib/chart-configs';

interface Props {
  currentAge: number;
  nonSuperBalance: number;
  superBalance: number;
  onSuperBalanceChange: (v: number) => void;
  superBalanceLocked?: boolean;
  returnRate: number;
}

export function SuperBridge({ currentAge, nonSuperBalance, superBalance, onSuperBalanceChange, superBalanceLocked, returnRate }: Props) {
  const [earlyRetirementAge, setEarlyRetirementAge] = useState(50);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [annualSavingsNonSuper, setAnnualSavingsNonSuper] = useState(20000);
  const [annualSuperContribs, setAnnualSuperContribs] = useState(15000);

  const scenarios = [45, 50, 55].map(retireAge => {
    return {
      retireAge,
      result: calculateSuperBridge({
        currentAge,
        earlyRetirementAge: retireAge,
        preservationAge: PRESERVATION_AGE,
        nonSuperBalance,
        superBalance,
        annualSavingsNonSuper,
        annualSuperContribs,
        annualExpenses,
        nonSuperReturn: returnRate,
        superReturn: returnRate,
      }),
    };
  });

  const primary = useMemo(
    () =>
      calculateSuperBridge({
        currentAge,
        earlyRetirementAge,
        preservationAge: PRESERVATION_AGE,
        nonSuperBalance,
        superBalance,
        annualSavingsNonSuper,
        annualSuperContribs,
        annualExpenses,
        nonSuperReturn: returnRate,
        superReturn: returnRate,
      }),
    [currentAge, earlyRetirementAge, nonSuperBalance, superBalance, annualSavingsNonSuper, annualSuperContribs, annualExpenses, returnRate],
  );

  const chartData = primary.yearly
    .filter(r => r.age % 2 === 0 || r.age === currentAge)
    .map(r => ({
      age: r.age,
      'Non-Super': r.nonSuperBalance,
      Super: r.superBalance,
    }));

  const bridgeYears = Math.max(0, PRESERVATION_AGE - earlyRetirementAge);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {superBalanceLocked
          ? <PortfolioField label="Current Super Balance" value={superBalance} prefix="$" />
          : <NumberInput label="Current Super Balance" value={superBalance} onChange={onSuperBalanceChange} min={0} max={5000000} step={10000} prefix="$" />
        }
        <NumberInput label="Annual Super Contribs" value={annualSuperContribs} onChange={setAnnualSuperContribs} min={0} max={50000} step={1000} prefix="$" />
        <SliderControl label="Early Retirement Age" value={earlyRetirementAge} onChange={v => setEarlyRetirementAge(Math.round(v))} min={35} max={59} step={1} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Annual Savings (non-super)" value={annualSavingsNonSuper} onChange={setAnnualSavingsNonSuper} min={0} max={500000} step={5000} prefix="$" />
        <NumberInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} min={10000} max={300000} step={5000} prefix="$" />
      </div>

      {/* Key Answer */}
      <div
        className={`rounded-xl px-5 py-4 border text-sm font-medium ${primary.nonSuperSufficientToBridge ? 'bg-green-50 border-green-200 text-green-700 ' : 'bg-[var(--danger)]/10 border-red-200 text-[var(--danger)] ' }`}
      >
        {primary.nonSuperSufficientToBridge
          ? `Non-super portfolio is sufficient to bridge the ${bridgeYears}-year gap (age ${earlyRetirementAge} to ${PRESERVATION_AGE}).`
          : `Non-super runs out at age ${primary.ageNonSuperRunsOut ?? 'N/A'} — ${bridgeYears - Math.max(0, (primary.ageNonSuperRunsOut ?? 0) - earlyRetirementAge)} years short of preservation age (${PRESERVATION_AGE}).`
        }
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Bridge Years" value={`${bridgeYears} yrs`} color="blue" subtext={`Age ${earlyRetirementAge} → ${PRESERVATION_AGE}`} />
        <StatCard label="Non-Super Draws" value={formatCurrency(annualExpenses * bridgeYears)} color="amber" subtext="Total needed for bridge" />
        <StatCard label="Super at Preservation" value={formatCompact(primary.yearly.find(r => r.age === PRESERVATION_AGE)?.superBalance ?? 0)} color="green" />
        <StatCard label={primary.nonSuperSufficientToBridge ? 'Non-Super Surplus' : 'Shortfall'} value={primary.nonSuperSufficientToBridge
          ? formatCurrency(primary.yearly.find(r => r.age === PRESERVATION_AGE)?.nonSuperBalance ?? 0)
          : formatCurrency(primary.shortfallAtPreservation)}
          color={primary.nonSuperSufficientToBridge ? 'green' : 'red'}
        />
      </div>

      {/* Dual-track chart */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">Balance Over Time</h4>
        <ChartContainer config={superBridgeConfig} className="h-[350px] w-full">
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="fillNonSuper" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-nonSuper)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-nonSuper)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillSuper" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-super)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-super)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine x={earlyRetirementAge} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Retire', fontSize: 9, fill: '#f59e0b' }} />
            <ReferenceLine x={PRESERVATION_AGE} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Preserve', fontSize: 9, fill: '#22c55e' }} />
            <Area type="monotone" dataKey="Super" stackId="1" stroke="var(--color-super)" fill="url(#fillSuper)" strokeWidth={2.5} animationDuration={1200} animationEasing="ease-in-out" />
            <Area type="monotone" dataKey="Non-Super" stackId="1" stroke="var(--color-nonSuper)" fill="url(#fillNonSuper)" strokeWidth={2.5} animationDuration={1200} animationEasing="ease-in-out" />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Scenario comparison table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] px-4 pt-3 pb-1">Retirement Age Scenarios</h4>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['Retire Age', 'Bridge Years', 'Non-Super at 60', 'Sufficient?'].map(h => (
                <th key={h} className="px-4 py-2 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.retireAge} className={`border-b border-slate-100 last:border-0 ${s.retireAge === earlyRetirementAge ? 'bg-[var(--primary)]/10 ' : ''}`}>
                <td className="px-4 py-2 font-semibold text-[var(--foreground)]">Age {s.retireAge}</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{PRESERVATION_AGE - s.retireAge} yrs</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">
                  {formatCompact(s.result.yearly.find(r => r.age === PRESERVATION_AGE)?.nonSuperBalance ?? 0)}
                </td>
                <td className={`px-4 py-2 text-right font-semibold ${s.result.nonSuperSufficientToBridge ? 'text-[var(--success)] ' : 'text-[var(--danger)] '}`}>
                  {s.result.nonSuperSufficientToBridge ? 'Yes' : `No (out at ${s.result.ageNonSuperRunsOut})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

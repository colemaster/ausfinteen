import { useState, useMemo } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { NumberInput } from '../../components/ui/NumberInput';
import { SliderControl } from '../../components/ui/SliderControl';
import { calculateFIRENumber, coastFIRENumber, projectCoastToRetirement } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { fireTrajectoryConfig } from '@/lib/chart-configs';

interface Props {
  currentInvestments: number;
  returnRate: number;
}

export function CoastFIRE({ currentInvestments, returnRate }: Props) {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualExpenses, setAnnualExpenses] = useState(80000);
  const [swr, setSwr] = useState(4);

  const fireNumber = useMemo(
    () => calculateFIRENumber(annualExpenses, swr / 100),
    [annualExpenses, swr],
  );

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const coastNumber = useMemo(
    () => coastFIRENumber(fireNumber, returnRate, yearsToRetirement),
    [fireNumber, returnRate, yearsToRetirement],
  );

  const coastTrajectory = useMemo(
    () => projectCoastToRetirement(currentInvestments, returnRate, yearsToRetirement),
    [currentInvestments, returnRate, yearsToRetirement],
  );

  const chartData = coastTrajectory.map((v, i) => ({
    age: currentAge + i + 1,
    Portfolio: v,
  }));

  const reached = currentInvestments >= coastNumber;
  const gap = coastNumber - currentInvestments;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Current Age" value={currentAge} onChange={v => setCurrentAge(Math.round(v))} min={18} max={70} step={1} />
        <NumberInput label="Target Retirement Age" value={retirementAge} onChange={v => setRetirementAge(Math.round(v))} min={30} max={80} step={1} />
        <NumberInput label="Annual Expenses (Ret.)" value={annualExpenses} onChange={setAnnualExpenses} min={10000} max={500000} step={5000} prefix="$" />
        <SliderControl label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2} max={6} step={0.5} suffix="%" />
      </div>

      <div
        className={`rounded-xl px-5 py-4 border text-sm font-medium ${reached ? 'bg-green-50 border-green-200 text-green-700 ' : 'bg-amber-50 border-amber-200 text-amber-700 ' }`}
      >
        {reached
          ? `You have reached Coast FIRE. Your ${formatCurrency(currentInvestments)} portfolio will grow to ${formatCompact(fireNumber)} by age ${retirementAge} without further contributions.`
          : `You need ${formatCurrency(coastNumber)} to coast to retirement. Current gap: ${formatCurrency(gap)}.`
        }
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Coast FIRE Number" value={formatCompact(coastNumber)} color="blue" subtext={`At ${returnRate}% return over ${yearsToRetirement} yrs`} />
        <StatCard label="FIRE Number (target)" value={formatCompact(fireNumber)} color="green" subtext={`${(annualExpenses / 1000).toFixed(0)}k expenses / ${swr}% SWR`} />
        <StatCard label={reached ? 'Surplus' : 'Gap to Coast'} value={formatCurrency(Math.abs(gap))} color={reached ? 'green' : 'amber'} />
      </div>

      {chartData.length > 0 && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">
            Coast Trajectory — current portfolio growing to age {retirementAge} (no further contributions)
          </h4>
          <ChartContainer config={fireTrajectoryConfig} className="h-[280px] w-full">
            <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="fillCoast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-portfolio)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-portfolio)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine y={fireNumber} stroke="var(--color-fireTarget)" strokeDasharray="4 4" label={{ value: 'FIRE target', fontSize: 10, fill: 'var(--color-fireTarget)' }} />
              <Area type="monotone" dataKey="Portfolio" stroke="var(--color-portfolio)" fill="url(#fillCoast)" strokeWidth={2.5} animationDuration={1200} animationEasing="ease-in-out" />
            </AreaChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}

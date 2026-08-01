import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { fadeInUp } from '@/lib/animations';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { StatCard } from '../../components/ui/StatCard';
import { Assumptions } from '../../components/shared/Assumptions';
import { Disclaimer } from '../../components/shared/Disclaimer';
import { AboutCalc } from '../../components/shared/AboutCalc';
import { yearsToFIREBySavingsRate, projectBySavingsRate } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import {
  LineChart, Line, XAxis, YAxis,
  ReferenceLine, BarChart, Bar, Cell, CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { savingsRateConfig } from '@/lib/chart-configs';
import { usePortfolio } from '../../context/PortfolioContext';

const ASSUMPTIONS = [
  'Annual compounding applied to all projections.',
  'FIRE number = annual expenses / 4% safe withdrawal rate.',
  'Annual expenses = income × (1 − savings rate); no inflation adjustment.',
  'Current net worth is the investable asset base (excludes primary residence).',
  'Savings rate stepped from 10% to 90% in 5% increments.',
];

export function SavingsRate() {
  const { portfolio } = usePortfolio();

  const [incomeOverride, setIncomeOverride] = useState(85000);
  const [currentNWOverride, setCurrentNWOverride] = useState(200000);
  const [returnRate, setReturnRate] = useState(7);
  const [savingsRate, setSavingsRate] = useState(30);

  const portfolioNW = portfolio.savingsBalance + portfolio.etfValue;
  const income = portfolio.grossSalary > 0 ? portfolio.grossSalary : incomeOverride;
  const currentNW = portfolioNW > 0 ? portfolioNW : currentNWOverride;

  const result = useMemo(
    () => yearsToFIREBySavingsRate(income, currentNW, returnRate, savingsRate),
    [income, currentNW, returnRate, savingsRate],
  );

  // Bar chart data — all savings rate rows
  const barData = result.rows.map(r => ({
    rate: `${Math.round(r.rate * 100)}%`,
    years: r.years,
    isCurrent: Math.round(r.rate * 100) === Math.round(savingsRate / 5) * 5,
  }));

  // Trajectory line chart — project current vs +10% savings rate
  const projYears = Math.min(result.currentRow.years + 5, 50);
  const projCurrent = useMemo(
    () => projectBySavingsRate(income, currentNW, savingsRate, returnRate, projYears),
    [income, currentNW, savingsRate, returnRate, projYears],
  );
  const higherRate = Math.min(savingsRate + 10, 90);
  const projHigher = useMemo(
    () => projectBySavingsRate(income, currentNW, higherRate, returnRate, projYears),
    [income, currentNW, higherRate, returnRate, projYears],
  );

  const lineData = Array.from({ length: projYears }, (_, i) => ({
    year: `Yr ${i + 1}`,
    [`${savingsRate}% savings`]: projCurrent[i] ?? 0,
    [`${higherRate}% savings`]: projHigher[i] ?? 0,
  }));

  const currentFireNumber = result.currentRow.fireNumber;
  const currentYears = result.currentRow.years;
  const currentExpenses = result.currentRow.annualExpenses;
  const currentAnnualSavings = income * (savingsRate / 100);

  // Year-saving insight: how many years saved by going to +10%
  const higherRateYears = result.rows.find(
    r => Math.round(r.rate * 100) === Math.round(higherRate / 5) * 5,
  )?.years ?? currentYears;
  const yearsSaved = Math.max(0, currentYears - higherRateYears);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Savings Rate Impact
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Discover how dramatically your savings rate determines when you reach financial independence.
        </p>
      </div>

      <AboutCalc concepts={[
        {
          term: 'What does savings rate mean in FIRE planning?',
          definition: 'Your savings rate is the percentage of your take-home income that you save and invest (not spend). It is the single most powerful lever in FIRE planning: a higher rate both grows your investments faster and shrinks your annual expenses — meaning you need a smaller total portfolio to retire.',
          link: 'https://en.wikipedia.org/wiki/FIRE_movement',
          linkLabel: 'Wikipedia: FIRE movement',
        },
        {
          term: 'What is a FIRE number?',
          definition: 'The total portfolio value needed to retire. Calculated as: annual expenses ÷ safe withdrawal rate (typically 4%). Example: spending $60,000/year → FIRE number = $60,000 ÷ 0.04 = $1,500,000. Once your investments reach this level, they should generate enough return to sustain your lifestyle indefinitely.',
          link: 'https://en.wikipedia.org/wiki/Trinity_study',
          linkLabel: 'Wikipedia: Trinity study (4% rule)',
        },
      ]} />

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {portfolio.grossSalary > 0
          ? <PortfolioField label="Annual After-Tax Income" value={income} prefix="$" />
          : <NumberInput label="Annual After-Tax Income" value={incomeOverride} onChange={setIncomeOverride} min={20000} max={1000000} step={5000} prefix="$" />
        }
        {portfolioNW > 0
          ? <PortfolioField label="Current Net Worth" value={currentNW} prefix="$" />
          : <NumberInput label="Current Net Worth" value={currentNWOverride} onChange={setCurrentNWOverride} min={0} max={10000000} step={10000} prefix="$" />
        }
        <SliderControl
          label="Investment Return (pa)"
          value={returnRate}
          onChange={setReturnRate}
          min={2}
          max={15}
          step={0.5}
          suffix="%"
        />
        <SliderControl
          label="Current Savings Rate"
          value={savingsRate}
          onChange={setSavingsRate}
          min={5}
          max={90}
          step={1}
          suffix="%"
        />
      </div>

      {/* Stat cards */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="text-xs text-[var(--muted-foreground)] bg-[var(--background)] border border-slate-100 rounded-lg px-4 py-3 leading-relaxed">
        <strong className="text-[var(--foreground)]">FIRE Number</strong> = annual expenses ÷ 4% safe withdrawal rate — the portfolio size needed to retire. <strong className="text-[var(--foreground)]">Years to FIRE</strong> assumes you invest your annual savings each year, compounding at the return rate, until your portfolio covers the FIRE number. A higher savings rate shrinks both your FIRE number (lower expenses) and the time to reach it (more savings invested).{' '}
        <a href="https://en.wikipedia.org/wiki/FIRE_movement" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary)]">Wikipedia: FIRE movement ↗</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="FIRE Number" value={formatCompact(currentFireNumber)} color="blue" />
        <StatCard label="Years to FIRE" value={`${currentYears} yrs`} color="green" />
        <StatCard label="Annual Savings" value={formatCurrency(currentAnnualSavings)} color="purple" />
        <StatCard label="Annual Expenses" value={formatCurrency(currentExpenses)} color="amber" />
      </div>

      {/* Insight callout */}
      {yearsSaved > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          Increasing your savings rate from{' '}
          <span className="font-bold">{savingsRate}%</span> to{' '}
          <span className="font-bold">{higherRate}%</span>{' '}
          would save you <span className="font-bold">{yearsSaved} year{yearsSaved !== 1 ? 's' : ''}</span> on your path to FIRE.
        </div>
      )}

      {/* Bar chart — savings rate vs years */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
          Savings Rate vs Years to FIRE
        </h3>
        <p className="text-[10px] text-[var(--muted-foreground)] mb-4">
          Your current rate ({savingsRate}%) is highlighted in blue.
        </p>
        <ChartContainer config={savingsRateConfig} className="h-[250px] w-full">
          <BarChart data={barData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="rate" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} label={{ value: 'Years', angle: -90, position: 'insideLeft', style: { fontSize: 10 }, offset: 8 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="years" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-in-out">
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? 'var(--color-currentSavings)' : 'var(--color-otherSavings)'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Line chart — trajectory */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-4">
          Portfolio Trajectory: {savingsRate}% vs {higherRate}% Savings Rate
        </h3>
        <ChartContainer config={savingsRateConfig} className="h-[350px] w-full">
          <LineChart data={lineData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(projYears / 6) - 1)} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine y={currentFireNumber} stroke="var(--color-fireTarget)" strokeDasharray="4 4" label={{ value: 'FIRE', fontSize: 10, fill: 'var(--color-fireTarget)' }} />
            <Line type="monotone" dataKey={`${savingsRate}% savings`} stroke="var(--color-currentSavings)" strokeWidth={2.5} dot={false} animationDuration={1200} animationEasing="ease-in-out" />
            <Line type="monotone" dataKey={`${higherRate}% savings`} stroke="var(--color-higherSavings)" strokeWidth={2.5} dot={false} strokeDasharray="6 3" animationDuration={1200} animationEasing="ease-in-out" />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Full table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['Savings Rate', 'Annual Savings', 'Annual Expenses', 'FIRE Number', 'Years to FIRE'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map(row => {
              const pct = Math.round(row.rate * 100);
              const isActive = pct === Math.round(savingsRate / 5) * 5;
              return (
                <tr key={pct} className={`border-b border-slate-100 last:border-0 ${isActive ? 'bg-[var(--primary)]/10 ' : ''}`}>
                  <td className="px-4 py-2 font-semibold text-[var(--foreground)]">
                    {pct}%{isActive && <span className="ml-1.5 text-[var(--primary)] text-[10px]">(current)</span>}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--success)]">{formatCurrency(income * row.rate)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.annualExpenses)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{formatCompact(row.fireNumber)}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-[var(--primary)]">{row.years} yrs</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </motion.div>

      <Assumptions items={ASSUMPTIONS} />
      <Disclaimer calculatorName="Savings Rate Impact calculator" />
    </div>
  );
}

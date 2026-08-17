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
import { yearsToFIREBySavingsRate, projectBySavingsRate, projectPayStrategies, rateToRetirementYears, takeHomeBreakdown } from './engine';
import { formatCurrency, formatCompact, formatPercent } from '../../utils/formatters';
import {
  LineChart, Line, XAxis, YAxis,
  ReferenceLine, BarChart, Bar, Cell, CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { savingsRateConfig } from '@/lib/chart-configs';
import { usePortfolio } from '../../context/PortfolioContext';

const ASSUMPTIONS = [
  'Annual compounding applied to all projections.',
  'FIRE number = annual expenses / 4% safe withdrawal rate.',
  'Annual expenses = income × (1 − savings rate); no inflation adjustment.',
  'Current net worth is the investable asset base (excludes primary residence).',
  'Savings rate stepped from 10% to 90% in 5% increments.',
];

const PAY_STRATEGY_CONFIG = {
  payAtEnd: { label: 'Pay at End', color: 'var(--chart-4)' },
  payFirst: { label: 'Pay Yourself First', color: 'var(--chart-2)' },
} satisfies ChartConfig;

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

  // Pay yourself first vs pay at end
  const [marginalRate, setMarginalRate] = useState(32);
  const [hasHELPDebt, setHasHELPDebt] = useState(false);

  const payStrategy = useMemo(
    () => projectPayStrategies(income, currentNW, savingsRate, returnRate, projYears),
    [income, currentNW, savingsRate, returnRate, projYears],
  );
  const payStrategyData = Array.from({ length: projYears }, (_, i) => ({
    year: `Yr ${i + 1}`,
    'Pay at End': payStrategy.payAtEnd[i] ?? 0,
    'Pay Yourself First': payStrategy.payFirst[i] ?? 0,
  }));

  const rateMap = useMemo(
    () => rateToRetirementYears(income, currentNW, returnRate, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9]),
    [income, currentNW, returnRate],
  );

  const takeHome = useMemo(
    () => takeHomeBreakdown(income, marginalRate / 100, hasHELPDebt),
    [income, marginalRate, hasHELPDebt],
  );

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

      {/* Pay yourself first vs pay at end */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
          Pay Yourself First vs Pay at End
        </h3>
        <p className="text-[10px] text-[var(--muted-foreground)] mb-4">
          Same {savingsRate}% savings rate — investing your savings at the start of the year instead of the end gives every dollar an extra year of compounding.
        </p>
        <ChartContainer config={PAY_STRATEGY_CONFIG} className="h-[280px] w-full">
          <LineChart data={payStrategyData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(projYears / 6) - 1)} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="Pay at End" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} animationDuration={1200} animationEasing="ease-in-out" />
            <Line type="monotone" dataKey="Pay Yourself First" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} strokeDasharray="6 3" animationDuration={1200} animationEasing="ease-in-out" />
          </LineChart>
        </ChartContainer>
        <div className="mt-2 text-xs text-[var(--muted-foreground)]">
          Paying yourself first after {projYears} years:{' '}
          <span className="font-mono font-semibold text-[var(--success)]">{formatCurrency(payStrategy.payFirst[projYears - 1] ?? 0)}</span> vs{' '}
          <span className="font-mono font-semibold text-[var(--foreground)]">{formatCurrency(payStrategy.payAtEnd[projYears - 1] ?? 0)}</span> —
          <span className="font-mono font-semibold text-[var(--primary)]"> {formatCurrency((payStrategy.payFirst[projYears - 1] ?? 0) - (payStrategy.payAtEnd[projYears - 1] ?? 0))}</span> more.
        </div>
      </div>

      {/* Take-home pay breakdown */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Take-Home Pay Breakdown</h3>
            <p className="text-[10px] text-[var(--muted-foreground)]">What each dollar of gross income becomes — with a HELP repayment toggle.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SliderControl label="Marginal Tax Rate" value={marginalRate} onChange={setMarginalRate} min={0} max={49} step={1} suffix="%" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
          <input
            type="checkbox"
            checked={hasHELPDebt}
            onChange={e => setHasHELPDebt(e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)] rounded-sm cursor-pointer"
          />
          I have an outstanding HELP/HECS debt (compulsory repayment applies)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Gross Income" value={formatCurrency(takeHome.grossIncome)} color="blue" />
          <StatCard label="Super Guarantee" value={formatCurrency(takeHome.superGuarantee)} color="purple" subtext="12% paid on top" />
          <StatCard label="Tax (est.)" value={formatCurrency(takeHome.taxEstimate)} color="amber" subtext={`${marginalRate}% marginal`} />
          <StatCard label="HELP Repayment" value={formatCurrency(takeHome.helpRepayment)} color="red" subtext={hasHELPDebt ? '2026-27 ATO rates' : 'No HELP debt'} />
        </div>
        <div className="rounded-xl px-4 py-3 border bg-[var(--background)] text-sm">
          Net take-home: <span className="font-mono font-bold text-[var(--success)]">{formatCurrency(takeHome.netTakeHome)}</span>{' '}
          <span className="text-[var(--muted-foreground)]">({formatPercent(takeHome.takeHomeRate)} of gross)</span>
        </div>
      </div>

      {/* Savings rate → retirement years map */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <div className="px-4 pt-3 pb-1">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">Savings Rate → Retirement Years Map</h4>
          <p className="text-[10px] text-[var(--muted-foreground)]">A quick lookup of years-to-FIRE at each savings rate.</p>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['Savings Rate', 'Annual Savings', 'Annual Expenses', 'FIRE Number', 'Years to FIRE'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rateMap.map(row => {
              const pct = Math.round(row.rate * 100);
              const isActive = Math.abs(row.rate - savingsRate / 100) < 0.051;
              return (
                <tr key={pct} className={`border-b border-slate-100 last:border-0 ${isActive ? 'bg-[var(--primary)]/10 ' : ''}`}>
                  <td className="px-4 py-2 font-semibold text-[var(--foreground)]">
                    {pct}%{isActive && <span className="ml-1.5 text-[var(--primary)] text-[10px]">(current)</span>}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--success)]">{formatCurrency(row.annualSavings)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.annualExpenses)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{formatCompact(row.fireNumber)}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-[var(--primary)]">{row.years} yrs</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

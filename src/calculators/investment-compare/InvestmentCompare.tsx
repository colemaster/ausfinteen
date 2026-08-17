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
import { runAllScenarios, SCENARIO_COLORS, applyCrashToSeries, feeDrag, cgtAdjustedFinalValue, type ScenarioParams, type TaxTreatment } from './engine';
import { formatCurrency, formatCompact, formatPct } from '../../utils/formatters';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { buildInvestmentCompareConfig } from '@/lib/chart-configs';
import { usePortfolio } from '../../context/PortfolioContext';

const DEFAULT_SCENARIOS: ScenarioParams[] = [
  { label: 'ETF (Taxable)', initial: 50000, monthlyContribution: 1000, annualReturn: 8, mer: 0.07, taxTreatment: 'marginal', marginalRate: 0.32 },
  { label: 'Super', initial: 50000, monthlyContribution: 1000, annualReturn: 7.5, mer: 0.35, taxTreatment: 'super', marginalRate: 0.32 },
  { label: 'Savings Account', initial: 50000, monthlyContribution: 1000, annualReturn: 4.5, mer: 0, taxTreatment: 'marginal', marginalRate: 0.32 },
];

const TAX_LABELS: Record<TaxTreatment, string> = {
  marginal: 'Marginal Rate',
  super: 'Super (15%)',
  'tax-free': 'Tax-Free',
};

const ASSUMPTIONS = [
  'Monthly compounding applied to all scenarios.',
  'Growth is taxed monthly at the applicable rate (marginal, 15% for super, or 0%).',
  'MER (management expense ratio) is deducted monthly from the balance.',
  'Tax-free assumes no tax on growth (e.g., fully offset account or equivalent).',
  'No withdrawal tax or CGT modelled at the end — all scenarios treated consistently.',
];

export function InvestmentCompare() {
  const { portfolio } = usePortfolio();
  const [scenarios, setScenarios] = useState<ScenarioParams[]>(DEFAULT_SCENARIOS.map(s => ({ ...s })));
  const [years, setYears] = useState(20);
  const [margTaxOverride, setMargTaxOverride] = useState(32);
  const [showStressTest, setShowStressTest] = useState(true);
  const [crashYear, setCrashYear] = useState(10);
  const [crashPct, setCrashPct] = useState(30);
  const [applyCgtOnDisposal, setApplyCgtOnDisposal] = useState(false);

  const sharedMarginalRate = portfolio.margTax > 0 ? portfolio.margTax : margTaxOverride;

  // Portfolio-locked values for scenarios 0–2 (ETF, Super, Savings)
  const portfolioInitials = [portfolio.etfValue, portfolio.superBalance, portfolio.savingsBalance];
  const portfolioMonthly = [portfolio.monthlyEtfContrib, portfolio.monthlySuperContrib, portfolio.monthlySavingsContrib];

  const updateScenario = (i: number, updates: Partial<ScenarioParams>) => {
    setScenarios(prev => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));
  };

  const syncedScenarios = useMemo(
    () => scenarios.map((s, i) => ({
      ...s,
      initial: i < 3 && portfolioInitials[i] > 0 ? portfolioInitials[i] : s.initial,
      monthlyContribution: i < 3 && portfolioMonthly[i] > 0 ? portfolioMonthly[i] : s.monthlyContribution,
      marginalRate: sharedMarginalRate / 100,
    })),
    [scenarios, sharedMarginalRate, portfolioInitials, portfolioMonthly],
  );

  const results = useMemo(
    () => runAllScenarios(syncedScenarios, years),
    [syncedScenarios, years],
  );

  // Build chart data — one entry per year (with optional crash overlay)
  const chartData = useMemo(() => {
    const maxLen = Math.max(...results.map(r => r.yearly.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const row: Record<string, string | number> = { year: `Yr ${i + 1}` };
      results.forEach(r => {
        row[r.label] = r.yearly[i]?.balance ?? 0;
        if (showStressTest) {
          const crashed = applyCrashToSeries(
            r.yearly.map(y => y.balance),
            crashYear,
            crashPct,
          );
          row[`${r.label} (crash)`] = crashed[i] ?? 0;
        }
      });
      return row;
    });
  }, [results, years, showStressTest, crashYear, crashPct]);

  // Crash impact per scenario (final-year balance with the crash applied)
  const crashImpact = useMemo(
    () => results.map(r => {
      const crashedSeries = applyCrashToSeries(
        r.yearly.map(y => y.balance),
        crashYear,
        crashPct,
      );
      const crashedFinal = crashedSeries[crashedSeries.length - 1] ?? 0;
      return {
        label: r.label,
        normalFinal: r.finalBalance,
        crashedFinal,
        loss: r.finalBalance - crashedFinal,
      };
    }),
    [results, crashYear, crashPct],
  );

  // MER fee drag panel (standalone baseline portfolio)
  const feeDragResult = useMemo(
    () => feeDrag(50000, 1000, scenarios[0]?.annualReturn ?? 8, 0.1, 1.0, years),
    [scenarios, years],
  );
  const feeDragData = Array.from({ length: years }, (_, i) => ({
    year: `Yr ${i + 1}`,
    '0.10% MER': feeDragResult.lowFeeSeries[i] ?? 0,
    '1.00% MER': feeDragResult.highFeeSeries[i] ?? 0,
  }));



  const addScenario = () => {
    if (scenarios.length >= 4) return;
    setScenarios(prev => [
      ...prev,
      { label: `Scenario ${prev.length + 1}`, initial: 50000, monthlyContribution: 500, annualReturn: 7, mer: 0.2, taxTreatment: 'marginal', marginalRate: 0.32 },
    ]);
  };

  const removeScenario = (i: number) => {
    setScenarios(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Investment Comparison
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Compare up to 4 investment scenarios with different tax treatments, fees, and return rates.
        </p>
      </div>

      <AboutCalc concepts={[
        {
          term: 'What is MER (Management Expense Ratio)?',
          definition: 'The annual fee charged by an ETF or managed fund, expressed as a % of your balance. A 0.07% MER on $100,000 = $70/year. Even seemingly small fee differences compound dramatically over decades — a 1% higher MER on $100k over 30 years at 8% growth costs roughly $90,000 in lost returns.',
          link: 'https://en.wikipedia.org/wiki/Expense_ratio',
          linkLabel: 'Wikipedia: Expense ratio',
        },
        {
          term: 'What does "super (15%)" tax treatment mean?',
          definition: 'Investment earnings inside a super fund are taxed at a concessional 15% rate, compared to your marginal tax rate outside super. In retirement (pension phase), earnings are 0% tax. This makes super a powerful tax-efficient vehicle for long-term investing, especially for higher earners.',
          link: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/tax-on-contributions',
          linkLabel: 'ATO: Tax on super',
        },
      ]} />

      {/* Shared settings */}
      <div className="grid grid-cols-2 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <SliderControl label="Time Horizon" value={years} onChange={v => setYears(Math.round(v))} min={1} max={40} step={1} suffix=" yrs" />
        {portfolio.margTax > 0
          ? <PortfolioField label="Marginal Tax Rate (shared)" value={sharedMarginalRate} suffix="%" />
          : <SliderControl label="Marginal Tax Rate (shared)" value={margTaxOverride} onChange={setMargTaxOverride} min={0} max={49} step={1} suffix="%" />
        }
        {showStressTest && (
          <>
            <SliderControl label="Crash Year" value={crashYear} onChange={v => setCrashYear(Math.round(v))} min={1} max={Math.max(2, years)} step={1} suffix="" />
            <SliderControl label="Crash Severity" value={crashPct} onChange={setCrashPct} min={5} max={60} step={5} suffix="%" />
          </>
        )}
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map((s, i) => (
          <div key={i} className="bg-[var(--background)] border-2 rounded-xl p-4 space-y-3" style={{ borderColor: SCENARIO_COLORS[i] }}>
            <div className="flex items-center justify-between">
              <input
                value={s.label}
                onChange={e => updateScenario(i, { label: e.target.value })}
                className="text-sm font-bold bg-transparent border-none outline-none text-[var(--foreground)] w-full"
                placeholder="Scenario name"
              />
              {scenarios.length > 1 && i >= DEFAULT_SCENARIOS.length && (
                <button onClick={() => removeScenario(i)} className="text-xs text-red-400 hover:text-[var(--danger)] shrink-0 ml-2">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {i < 3 && portfolioInitials[i] > 0
                ? <PortfolioField label="Initial" value={portfolioInitials[i]} prefix="$" />
                : <NumberInput label="Initial" value={s.initial} onChange={v => updateScenario(i, { initial: v })} min={0} max={5000000} step={1000} prefix="$" />
              }
              {i < 3 && portfolioMonthly[i] > 0
                ? <PortfolioField label="Monthly Contribution" value={portfolioMonthly[i]} prefix="$" />
                : <NumberInput label="Monthly Contribution" value={s.monthlyContribution} onChange={v => updateScenario(i, { monthlyContribution: v })} min={0} max={10000} step={100} prefix="$" />
              }
              <SliderControl label="Annual Return" value={s.annualReturn} onChange={v => updateScenario(i, { annualReturn: v })} min={0} max={20} step={0.5} suffix="%" />
              <SliderControl label="MER" value={s.mer} onChange={v => updateScenario(i, { mer: v })} min={0} max={3} step={0.05} suffix="%" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-medium">Tax Treatment</label>
              <select
                value={s.taxTreatment}
                onChange={e => updateScenario(i, { taxTreatment: e.target.value as TaxTreatment })}
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
              >
                {(Object.entries(TAX_LABELS) as [TaxTreatment, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {scenarios.length < 4 && (
          <button
            onClick={addScenario}
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] hover:border-blue-400 hover:text-[var(--primary)] transition-colors"
          >
            + Add Scenario
          </button>
        )}
      </div>

      {/* Chart */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="text-xs text-[var(--muted-foreground)] bg-[var(--background)] border border-slate-100 rounded-lg px-4 py-3 leading-relaxed">
        Each line shows the <strong className="text-[var(--foreground)]">total portfolio balance</strong> (initial + contributions + compounded growth, minus tax and fees) over your chosen time horizon. Lines that diverge steeply benefit most from either lower fees or preferential tax treatment. <strong className="text-[var(--foreground)]">Final balance</strong> is before any withdrawal tax or CGT.{' '}
        <a href="https://moneysmart.gov.au/saving-and-budgeting/compound-interest" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary)]">MoneySmart: How compound interest works ↗</a>
      </div>
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Portfolio Balance Over Time</h3>
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={showStressTest}
              onChange={e => setShowStressTest(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] rounded-sm cursor-pointer"
            />
            Stress test: -{crashPct}% crash in Yr {crashYear}
          </label>
        </div>
        <ChartContainer config={buildInvestmentCompareConfig(results.map(r => ({ name: r.label })))} className="h-[350px] w-full">
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(years / 6) - 1)} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {results.map(r => (
              <Line key={r.label} type="monotone" dataKey={r.label} stroke={`var(--color-${r.label.replace(/\s+/g, '')})`} strokeWidth={2.5} dot={false} animationDuration={1200} animationEasing="ease-in-out" />
            ))}
            {showStressTest && results.map(r => (
              <Line key={`${r.label}-crash`} type="monotone" dataKey={`${r.label} (crash)`} stroke={`var(--color-${r.label.replace(/\s+/g, '')})`} strokeWidth={1.5} strokeDasharray="5 4" dot={false} opacity={0.7} animationDuration={1200} animationEasing="ease-in-out" />
            ))}
          </LineChart>
        </ChartContainer>
        {showStressTest && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {crashImpact.map(c => (
              <div key={c.label} className="rounded-xl border border-[var(--border)] px-4 py-3 text-xs">
                <div className="font-semibold text-[var(--foreground)] mb-1">{c.label}</div>
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Final (normal)</span>
                  <span className="font-mono">{formatCompact(c.normalFinal)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>After crash</span>
                  <span className="font-mono">{formatCompact(c.crashedFinal)}</span>
                </div>
                <div className="flex justify-between text-[var(--danger)] font-semibold mt-1">
                  <span>Loss</span>
                  <span className="font-mono">-{formatCurrency(c.loss)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MER fee drag */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">MER Fee Drag</h3>
        <p className="text-[10px] text-[var(--muted-foreground)] mb-4">
          Same $50k start, $1k/mo, {scenarios[0]?.annualReturn ?? 8}% return — the only difference is the fee. Over {years} years a 0.9% fee gap costs{' '}
          <span className="font-mono font-semibold text-[var(--danger)]">{formatCurrency(feeDragResult.finalLoss)}</span>{' '}
          ({formatPct(feeDragResult.lostPct)} of the low-fee final balance).
        </p>
        <ChartContainer config={buildInvestmentCompareConfig([{ name: '0.10% MER' }, { name: '1.00% MER' }])} className="h-[280px] w-full">
          <LineChart data={feeDragData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(years / 6) - 1)} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => formatCompact(typeof v === 'number' ? v : 0)} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="0.10% MER" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} animationDuration={1200} animationEasing="ease-in-out" />
            <Line type="monotone" dataKey="1.00% MER" stroke="var(--chart-5)" strokeWidth={2.5} dot={false} strokeDasharray="6 3" animationDuration={1200} animationEasing="ease-in-out" />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {results.map(r => (
          <StatCard
            key={r.label}
            label={r.label}
            value={formatCompact(r.finalBalance)}
            color={(['blue', 'green', 'amber', 'purple'] as const)[results.indexOf(r)]}
            subtext={`Fees: ${formatCurrency(r.totalFeesPaid)}`}
          />
        ))}
      </div>

      {/* Final values table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 pb-1">
          <div>
            <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">Final Values</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={applyCgtOnDisposal}
              onChange={e => setApplyCgtOnDisposal(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] rounded-sm cursor-pointer"
            />
            Apply 50% CGT discount on disposal
          </label>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['Scenario', 'Tax Treatment', `Final Balance (${years} yr)`, ...(applyCgtOnDisposal ? ['After CGT (Disposal)'] : []), 'Total Fees', 'Total Contributions', 'Net Return'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const afterCgt = cgtAdjustedFinalValue(
                syncedScenarios[i].initial,
                r.totalContributions,
                r.finalBalance,
                sharedMarginalRate / 100,
              );
              return (
                <tr key={r.label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-semibold" style={{ color: SCENARIO_COLORS[i] }}>{r.label}</td>
                  <td className="px-4 py-2 text-right text-[var(--muted-foreground)]">{TAX_LABELS[syncedScenarios[i].taxTreatment]}</td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--foreground)]">{formatCurrency(r.finalBalance)}</td>
                  {applyCgtOnDisposal && (
                    <td className="px-4 py-2 text-right font-mono text-[var(--success)]">{formatCurrency(afterCgt)}</td>
                  )}
                  <td className="px-4 py-2 text-right font-mono text-[var(--danger)]">{formatCurrency(r.totalFeesPaid)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(r.totalContributions)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--success)]">
                    {formatPct(((r.finalBalance - r.totalContributions) / r.totalContributions) * 100)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </motion.div>

      <Assumptions items={ASSUMPTIONS} />
      <Disclaimer calculatorName="Investment Comparison calculator" />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { Toggle } from '../../components/ui/Toggle';
import { calculateTaxBreakdown, marginalRateBrackets } from './engine';
import { formatCurrency, formatPct } from '../../utils/formatters';
import { TAX_BRACKETS_2026_27 } from '../../data/tax-brackets';
import { SUPER_RULES } from '../../data/super-rules';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { taxBracketConfig } from '@/lib/chart-configs';

const BRACKET_COLORS = ['#94a3b8', '#38bdf8', '#3b82f6', '#6366f1', '#a855f7'];

export function TaxBracketVis() {
  const [income, setIncome] = useState(100000);
  const [includeHELP, setIncludeHELP] = useState(false);

  const breakdown = useMemo(
    () => calculateTaxBreakdown(income, includeHELP),
    [income, includeHELP],
  );

  // Marginal-rate breakdown table (brackets + medicare + optional HELP)
  const marginalRows = useMemo(
    () => marginalRateBrackets(income, includeHELP),
    [income, includeHELP],
  );

  // Div 293 exposure on employer SG at this income
  const div293 = useMemo(
    () => {
      const contribs = income * SUPER_RULES.sgRate;
      return { income: income + contribs > SUPER_RULES.division293Threshold, contribs };
    },
    [income],
  );

  // Build bracket breakdown chart data
  const bracketData = useMemo(() => {
    const data: { bracket: string; tax: number; rate: string }[] = [];
    let remaining = income;
    TAX_BRACKETS_2026_27.forEach((b, i) => {
      if (remaining <= 0 || income <= b.min) return;
      const inBracket = Math.min(remaining, b.max - b.min + 1);
      const tax = Math.round(inBracket * b.rate);
      if (tax > 0 || b.rate === 0) {
        data.push({
          bracket: i === 0 ? '$0–$18.2k' : i === 1 ? '$18.2–$45k' : i === 2 ? '$45–$135k' : i === 3 ? '$135–$190k' : '$190k+',
          tax,
          rate: `${(b.rate * 100).toFixed(0)}%`,
        });
      }
      remaining -= inBracket;
    });
    return data;
  }, [income]);

  return (
    <div className="space-y-5">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <SliderControl
          label="Taxable Income"
          value={income}
          onChange={v => setIncome(Math.round(v))}
          min={0}
          max={500000}
          step={1000}
          prefix="$"
          decimals={0}
        />
        <Toggle label="Include HELP/HECS repayment" checked={includeHELP} onChange={setIncludeHELP} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Income Tax" value={formatCurrency(breakdown.incomeTax)} color="blue" />
        <StatCard label="Medicare Levy (2%)" value={formatCurrency(breakdown.medicareLevy)} color="amber" />
        {includeHELP && <StatCard label="HELP Repayment" value={formatCurrency(breakdown.helpRepayment)} color="cyan" />}
        <StatCard label="Total Tax + Levies" value={formatCurrency(breakdown.total)} color="red" />
        <StatCard label="After-Tax Income" value={formatCurrency(breakdown.afterTaxIncome)} color="green" />
        <StatCard label="Effective Rate" value={formatPct(breakdown.effectiveRate * 100)} color="purple" subtext={`Marginal: ${formatPct(breakdown.marginalRate * 100)}`} />
      </div>

      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Tax by Bracket</h3>
        <ChartContainer config={taxBracketConfig} className="h-[350px] w-full">
          <BarChart data={bracketData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="bracket" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="tax" name="Tax Payable" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-in-out">
              {bracketData.map((_entry, i) => (
                <Cell key={i} fill={BRACKET_COLORS[i % BRACKET_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Marginal Rate Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)]">
                {['Bracket', 'Rate', 'Taxable Amount', 'Tax', 'Cumulative'].map(h => (
                  <th key={h} className="px-3 py-2 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marginalRows.map(row => {
                const isTotal = row.kind === 'total';
                return (
                  <tr key={row.key} className={`border-b border-[var(--border)] last:border-0 ${isTotal ? 'font-semibold' : ''}`}>
                    <td className="px-3 py-2 text-left text-[var(--muted-foreground)]">{row.label}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.kind === 'bracket' ? formatPct(row.rate * 100) : row.kind === 'total' ? formatPct(row.rate * 100) : row.kind === 'help' ? formatPct(row.rate * 100, 2) : '2%'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.taxableAmount)}</td>
                    <td className={`px-3 py-2 text-right font-mono ${isTotal ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>{formatCurrency(row.tax)}</td>
                    <td className="px-3 py-2 text-right font-mono text-[var(--muted-foreground)]">
                      {row.kind === 'total' ? '—' : formatCurrency(marginalRows.slice(0, marginalRows.indexOf(row) + 1).reduce((a, r) => a + r.tax, 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {includeHELP && (
          <p className="text-[10px] text-[var(--muted-foreground)] mt-2">
            HELP repayment rate at this income: {formatPct((marginalRows.find(r => r.kind === 'help')?.rate ?? 0) * 100)} — based on 2026-27 ATO repayment thresholds.
          </p>
        )}
      </div>

      {div293.income && (
        <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
          <strong>Division 293 risk.</strong> At {formatCurrency(income)} income plus employer SG ({formatCurrency(Math.round(div293.contribs))}), your income + concessional contributions exceed ${(SUPER_RULES.division293Threshold / 1000).toFixed(0)}k — an extra 15% tax applies to concessional super contributions. See the Super Sacrifice tab to model this.
        </div>
      )}

      <p className="text-[10px] text-[var(--muted-foreground)]">Based on 2026-27 ATO Stage 3 tax rates. LMITO ended 30 June 2022.</p>
    </div>
  );
}

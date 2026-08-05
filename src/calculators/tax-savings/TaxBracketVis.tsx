import { useMemo, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { Toggle } from '../../components/ui/Toggle';
import { calculateTaxBreakdown } from './engine';
import { formatCurrency, formatPct } from '../../utils/formatters';
import { TAX_BRACKETS_2026_27 } from '../../data/tax-brackets';
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

      <p className="text-[10px] text-[var(--muted-foreground)]">Based on 2026-27 ATO Stage 3 tax rates. LMITO ended 30 June 2022.</p>
    </div>
  );
}

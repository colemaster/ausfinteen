import { useMemo, useState, useCallback } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { Toggle } from '../../components/ui/Toggle';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
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
} from '@/components/charts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { taxBracketConfig } from '@/lib/chart-configs';

const BRACKET_COLORS = [
  'var(--chart-6, #94a3b8)',
  'var(--chart-5, #38bdf8)',
  'var(--chart-1, #3b82f6)',
  'var(--chart-2, #6366f1)',
  'var(--chart-4, #a855f7)',
];

interface TaxBracketPreset {
  income: number;
  includeHELP: boolean;
}

const TAX_PRESETS: ScenarioPreset<TaxBracketPreset>[] = [
  {
    id: 'graduate',
    label: 'Graduate / Junior',
    badge: '$65k',
    description: 'Starting career salary entering the 30% marginal bracket',
    values: { income: 65000, includeHELP: true },
  },
  {
    id: 'median',
    label: 'Median Aus Full-Time',
    badge: '$85k',
    description: 'Typical Australian full-time salary ($85,000)',
    values: { income: 85000, includeHELP: false },
  },
  {
    id: 'senior',
    label: 'Senior Professional',
    badge: '$140k',
    description: 'Upper tax bracket earning $140,000 before Stage 3 changes',
    values: { income: 140000, includeHELP: false },
  },
  {
    id: 'top-rate',
    label: 'Top Bracket ($200k+)',
    badge: '47% Marginal',
    description: 'Above the $190,000 threshold paying the top 45% + 2% Medicare',
    values: { income: 210000, includeHELP: false },
  },
];

export function TaxBracketVis() {
  const [income, setIncome] = useState(100000);
  const [includeHELP, setIncludeHELP] = useState(false);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<TaxBracketPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.income !== undefined) setIncome(preset.values.income);
    if (preset.values.includeHELP !== undefined) setIncludeHELP(preset.values.includeHELP);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setIncome(100000);
    setIncludeHELP(false);
  }, []);

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
      const prevMax = i === 0 ? 0 : (TAX_BRACKETS_2026_27[i - 1].max ?? 0);
      const span = (b.max ?? Infinity) - prevMax;
      const taxableInBracket = Math.max(0, Math.min(remaining, span));
      const tax = taxableInBracket * b.rate;
      const label =
        b.max === Infinity
          ? `$${Math.round(b.min / 1000)}k+`
          : `$${Math.round(b.min / 1000)}k-$${Math.round(b.max / 1000)}k`;
      if (taxableInBracket > 0 || i === 0) {
        data.push({
          bracket: label,
          tax: Math.round(tax),
          rate: `${(b.rate * 100).toFixed(0)}%`,
        });
      }
      remaining = Math.max(0, remaining - span);
    });
    return data;
  }, [income]);

  const summaryText = useMemo(() => {
    return [
      '--- Australian Income Tax & Bracket Summary (2026-27) ---',
      `Gross Taxable Income: ${formatCurrency(income)}`,
      `Base Income Tax: ${formatCurrency(breakdown.incomeTax)}`,
      `Medicare Levy (2%): ${formatCurrency(breakdown.medicareLevy)}`,
      ...(includeHELP ? [`HELP/HECS Repayment: ${formatCurrency(breakdown.helpRepayment)}`] : []),
      `Total Statutory Tax: ${formatCurrency(breakdown.total)}`,
      `Net Take-Home Income: ${formatCurrency(breakdown.afterTaxIncome)}/yr (${formatCurrency(breakdown.afterTaxIncome / 52)}/wk)`,
      `Effective Tax Rate: ${formatPct(breakdown.effectiveRate * 100)} (Marginal Rate: ${formatPct(breakdown.marginalRate * 100)})`,
      `Calculated via AusFinTools Tax Bracket Engine`,
    ].join('\n');
  }, [income, breakdown, includeHELP]);

  return (
    <div className="space-y-5">
      {/* Presets */}
      <QuickPresetBar
        presets={TAX_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Common Income Profiles"
      />

      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-4">
        <SliderControl
          label="Taxable Income"
          value={income}
          onChange={v => {
            setIncome(v);
            setActivePreset(undefined);
          }}
          min={18200}
          max={500000}
          step={1000}
          prefix="$"
        />
        <div className="flex flex-wrap gap-4 items-center">
          <Toggle
            label="Include HELP / HECS"
            checked={includeHELP}
            onChange={v => {
              setIncludeHELP(v);
              setActivePreset(undefined);
            }}
            description="2026-27 repayment rate based on income"
          />
        </div>
      </div>

      {div293.income && (
        <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
          <strong>Division 293 exposure:</strong> Income ({formatCurrency(income)}) + employer SG ({formatCurrency(div293.contribs)}) exceeds ${(SUPER_RULES.division293Threshold / 1000).toFixed(0)}k. An extra 15% tax applies on concessional super contributions.
        </div>
      )}

      {/* KPI Cards with animated numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Income Tax"
          value={formatCurrency(breakdown.incomeTax)}
          numericValue={breakdown.incomeTax}
          format="currency"
          color="blue"
        />
        <StatCard
          label="Medicare Levy (2%)"
          value={formatCurrency(breakdown.medicareLevy)}
          numericValue={breakdown.medicareLevy}
          format="currency"
          color="amber"
        />
        {includeHELP && (
          <StatCard
            label="HELP Repayment"
            value={formatCurrency(breakdown.helpRepayment)}
            numericValue={breakdown.helpRepayment}
            format="currency"
            color="cyan"
          />
        )}
        <StatCard
          label="Total Tax + Levies"
          value={formatCurrency(breakdown.total)}
          numericValue={breakdown.total}
          format="currency"
          color="red"
          delta={breakdown.total}
          deltaFormat="currency"
          deltaInverse={true}
        />
        <StatCard
          label="After-Tax Income"
          value={formatCurrency(breakdown.afterTaxIncome)}
          numericValue={breakdown.afterTaxIncome}
          format="currency"
          color="green"
          subtext={`≈ ${formatCurrency(breakdown.afterTaxIncome / 52)}/week`}
        />
        <StatCard
          label="Effective Rate"
          value={formatPct(breakdown.effectiveRate * 100)}
          numericValue={breakdown.effectiveRate * 100}
          format="percent"
          color="purple"
          subtext={`Marginal: ${formatPct(breakdown.marginalRate * 100)}`}
        />
      </div>

      {/* Chart */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Tax Paid by Bracket</h3>
        <ChartContainer config={taxBracketConfig} className="h-[300px] w-full">
          <BarChart data={bracketData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="bracket" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="tax" name="Tax Payable" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-in-out">
              {bracketData.map((_entry, i) => (
                <Cell key={i} fill={BRACKET_COLORS[i % BRACKET_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Marginal Rate Breakdown Table with Sticky Header */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Marginal Rate Breakdown</h3>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-[var(--card)] z-10 shadow-xs border-b border-[var(--border)]">
              <tr>
                {['Bracket', 'Rate', 'Taxable Amount', 'Tax', 'Cumulative'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {marginalRows.map(row => {
                const isTotal = row.kind === 'total';
                return (
                  <tr key={row.key} className={`hover:bg-muted/40 transition-colors ${isTotal ? 'font-bold bg-muted/20' : ''}`}>
                    <td className="px-3 py-2.5 text-left text-[var(--foreground)]">{row.label}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold">
                      {row.kind === 'bracket' ? formatPct(row.rate * 100) : row.kind === 'total' ? formatPct(row.rate * 100) : row.kind === 'help' ? formatPct(row.rate * 100, 2) : '2%'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.taxableAmount)}</td>
                    <td className={`px-3 py-2.5 text-right font-mono ${isTotal ? 'text-[var(--danger)] font-bold' : 'text-[var(--foreground)]'}`}>{formatCurrency(row.tax)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[var(--muted-foreground)] font-semibold">
                      {row.kind === 'total' ? '—' : formatCurrency(marginalRows.slice(0, marginalRows.indexOf(row) + 1).reduce((a, r) => a + r.tax, 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Tax Bracket Breakdown"
      />
    </div>
  );
}

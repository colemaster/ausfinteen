import { useMemo, useState, useCallback } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { calculateDRTaxBenefit } from './engine';
import { formatCurrency, formatPct } from '../../utils/formatters';
import { usePortfolio } from '../../context/PortfolioContext';

interface Props {
  investLoanBal: number;
  onInvestLoanBalChange: (v: number) => void;
  rate: number;
  onRateChange: (v: number) => void;
  margTax: number;
  onMargTaxChange: (v: number) => void;
}

interface DRPreset {
  balance: number;
  rate: number;
  tax: number;
}

const DR_PRESETS: ScenarioPreset<DRPreset>[] = [
  {
    id: 'starter',
    label: '$100k Starter Split',
    badge: '32% Bracket',
    description: 'Initial debt recycle split for middle-income investor ($100k at 6.2%)',
    values: { balance: 100000, rate: 6.2, tax: 32 },
  },
  {
    id: 'moderate',
    label: '$250k Family Home Split',
    badge: '39% Bracket',
    description: 'Substantial non-deductible debt transformed into tax deductions',
    values: { balance: 250000, rate: 6.0, tax: 39 },
  },
  {
    id: 'top-tax',
    label: '$500k High Earner',
    badge: '47% Top Rate',
    description: 'Top marginal tax bracket maximizing investment interest deductions',
    values: { balance: 500000, rate: 5.8, tax: 47 },
  },
];

export function DebtRecyclingTax({
  investLoanBal,
  onInvestLoanBalChange,
  rate,
  onRateChange,
  margTax,
  onMargTaxChange,
}: Props) {
  const { portfolio } = usePortfolio();
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<DRPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.balance !== undefined) onInvestLoanBalChange(preset.values.balance);
    if (preset.values.rate !== undefined) onRateChange(preset.values.rate);
    if (preset.values.tax !== undefined) onMargTaxChange(preset.values.tax);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    onInvestLoanBalChange(300000);
    onRateChange(6.0);
    onMargTaxChange(34.5);
  }, [onInvestLoanBalChange, onRateChange, onMargTaxChange]);

  const rows = useMemo(
    () => calculateDRTaxBenefit(investLoanBal, rate, margTax / 100, [1, 5, 10, 15, 20]),
    [investLoanBal, rate, margTax],
  );

  const first = rows[0];

  const summaryText = useMemo(() => {
    return [
      '--- Debt Recycling Tax Benefit Summary ---',
      `Investment Loan: ${formatCurrency(investLoanBal)} | Rate: ${formatPct(rate)}`,
      `Marginal Tax Rate: ${formatPct(margTax)}`,
      `Annual Tax Deduction: ${formatCurrency(first?.annualDeduction ?? 0)}/yr`,
      `Effective After-Tax Interest Rate: ${formatPct(first?.effectiveAfterTaxRate ?? 0)} (saved ${(rate - (first?.effectiveAfterTaxRate ?? 0)).toFixed(2)}%)`,
      `10-Year Cumulative Tax Savings: ${formatCurrency(rows[2]?.cumulative ?? 0)}`,
      `Calculated via AusFinTools Tax Savings Guide`,
    ].join('\n');
  }, [investLoanBal, rate, margTax, first, rows]);

  return (
    <div className="space-y-5">
      {/* Quick Presets */}
      <QuickPresetBar
        presets={DR_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Debt Recycling Scenarios"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {portfolio.mortgageBalance > 0
          ? <PortfolioField label="Investment Loan Balance" value={investLoanBal} prefix="$" />
          : <NumberInput
              label="Investment Loan Balance"
              value={investLoanBal}
              onChange={v => {
                onInvestLoanBalChange(v);
                setActivePreset(undefined);
              }}
              min={10000}
              max={2000000}
              step={10000}
              prefix="$"
            />
        }
        {portfolio.mortgageRate > 0
          ? <PortfolioField label="Interest Rate" value={rate} suffix="%" decimals={1} />
          : <SliderControl
              label="Interest Rate"
              value={rate}
              onChange={v => {
                onRateChange(v);
                setActivePreset(undefined);
              }}
              min={2}
              max={12}
              step={0.1}
              suffix="%"
            />
        }
        {portfolio.margTax > 0
          ? <PortfolioField label="Marginal Tax Rate" value={margTax} suffix="%" decimals={1} />
          : <SliderControl
              label="Marginal Tax Rate"
              value={margTax}
              onChange={v => {
                onMargTaxChange(v);
                setActivePreset(undefined);
              }}
              min={0}
              max={49}
              step={1}
              suffix="%"
            />
        }
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Annual Tax Deduction"
          value={formatCurrency(first?.annualDeduction ?? 0)}
          numericValue={first?.annualDeduction ?? 0}
          format="currency"
          color="purple"
          subtext="Returned at tax time"
        />
        <StatCard
          label="Effective After-Tax Rate"
          value={formatPct(first?.effectiveAfterTaxRate ?? 0)}
          numericValue={first?.effectiveAfterTaxRate ?? 0}
          format="percent"
          color="blue"
          subtext={`vs ${formatPct(rate)} gross`}
        />
        <StatCard
          label="10-Year Cumulative"
          value={formatCurrency(rows[2]?.cumulative ?? 0)}
          numericValue={rows[2]?.cumulative ?? 0}
          format="currency"
          color="green"
          subtext="Deductions over 10 yrs"
        />
      </div>

      {/* Breakdown Table with Sticky Header */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-80">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-[var(--card)] z-10 shadow-xs border-b border-[var(--border)]">
            <tr>
              {['Year', 'Annual Deduction', 'Cumulative Deductions', 'Effective Rate'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map(row => (
              <tr key={row.year} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">Year {row.year}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-violet-600 dark:text-violet-400">{formatCurrency(row.annualDeduction)}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[var(--foreground)]">{formatCurrency(row.cumulative)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[var(--primary)]">{formatPct(row.effectiveAfterTaxRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[var(--muted-foreground)]">
        IO loan assumed constant. Annual deduction = loan × rate × margTax. Based on 2026-27 ATO rates.
      </p>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Debt Recycling Benefit"
      />
    </div>
  );
}

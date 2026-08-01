import { useMemo } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
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

export function DebtRecyclingTax({ investLoanBal, onInvestLoanBalChange, rate, onRateChange, margTax, onMargTaxChange }: Props) {
  const { portfolio } = usePortfolio();

  const rows = useMemo(
    () => calculateDRTaxBenefit(investLoanBal, rate, margTax / 100, [1, 5, 10, 15, 20]),
    [investLoanBal, rate, margTax],
  );

  const first = rows[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {portfolio.mortgageBalance > 0
          ? <PortfolioField label="Investment Loan Balance" value={investLoanBal} prefix="$" />
          : <NumberInput label="Investment Loan Balance" value={investLoanBal} onChange={onInvestLoanBalChange} min={10000} max={2000000} step={10000} prefix="$" />
        }
        {portfolio.mortgageRate > 0
          ? <PortfolioField label="Interest Rate" value={rate} suffix="%" decimals={1} />
          : <SliderControl label="Interest Rate" value={rate} onChange={onRateChange} min={2} max={12} step={0.1} suffix="%" />
        }
        {portfolio.margTax > 0
          ? <PortfolioField label="Marginal Tax Rate" value={margTax} suffix="%" decimals={1} />
          : <SliderControl label="Marginal Tax Rate" value={margTax} onChange={onMargTaxChange} min={0} max={49} step={1} suffix="%" />
        }
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Annual Tax Deduction" value={formatCurrency(first?.annualDeduction ?? 0)} color="purple" />
        <StatCard label="Effective After-Tax Rate" value={formatPct(first?.effectiveAfterTaxRate ?? 0)} color="blue" subtext={`vs ${formatPct(rate)} gross`} />
        <StatCard label="10-Year Cumulative" value={formatCurrency(rows[2]?.cumulative ?? 0)} color="green" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['Year', 'Annual Deduction', 'Cumulative Deductions', 'Effective Rate'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.year} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-[var(--muted-foreground)]">Year {row.year}</td>
                <td className="px-4 py-2 text-right font-mono text-violet-600">{formatCurrency(row.annualDeduction)}</td>
                <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--foreground)]">{formatCurrency(row.cumulative)}</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--primary)]">{formatPct(row.effectiveAfterTaxRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[var(--muted-foreground)]">
        IO loan assumed constant. Annual deduction = loan × rate × margTax. Based on 2024-25 ATO rates.
      </p>
    </div>
  );
}

import { useMemo } from 'react';
import { leanVsFatTable } from './engine';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  currentInvestments: number;
  annualSavings: number;
  returnRate: number;
}

const EXPENSE_LEVELS = [40000, 60000, 80000, 100000, 120000];

export function LeanVsFat({ currentInvestments, annualSavings, returnRate }: Props) {
  const rows = useMemo(
    () => leanVsFatTable(currentInvestments, annualSavings, returnRate, 0.04, EXPENSE_LEVELS),
    [currentInvestments, annualSavings, returnRate],
  );

  const summaryText = useMemo(() => {
    return [
      '--- Lean vs Fat FIRE Comparison Summary ---',
      `Current Investments: ${formatCurrency(currentInvestments)} | Annual Savings: ${formatCurrency(annualSavings)}/yr | Return: ${returnRate}%`,
      ...rows.map(r => `Expenses ${formatCurrency(r.expenses)}/yr -> FIRE Target: ${formatCurrency(r.fireNumber)} (${r.yearsToFIRE} yrs)`),
      `Difference (Lean vs Fat): ${formatCurrency(rows[rows.length - 1].fireNumber - rows[0].fireNumber)} portfolio delta (${rows[rows.length - 1].yearsToFIRE - rows[0].yearsToFIRE} extra years)`,
      `Calculated via AusFinTools Lean vs Fat FIRE Matrix`,
    ].join('\n');
  }, [currentInvestments, annualSavings, returnRate, rows]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[var(--muted-foreground)]">
          Side-by-side comparison at common expense levels. Using 4% SWR, current settings for investments, savings, and return rate.
        </p>
        <div className="shrink-0">
          <CalculatorActions
            summaryText={summaryText}
            summaryTitle="Lean vs Fat FIRE"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-96">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-[var(--card)] z-10 font-bold border-b shadow-xs">
            <tr>
              {['Annual Expenses', 'FIRE Number (4%)', 'Years to FIRE'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-bold border-b border-[var(--border)] first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.expenses} className="border-b border-slate-100 last:border-0 hover:bg-[var(--accent)]/5">
                <td className={`px-4 py-3 font-semibold ${i === 0 ? 'text-[var(--success)] ' : i === rows.length - 1 ? 'text-violet-600 ' : 'text-[var(--foreground)] '}`}>
                  {formatCurrency(row.expenses)}
                  {i === 0 && <span className="ml-2 text-[10px] text-[var(--success)] font-bold">(lean)</span>}
                  {i === rows.length - 1 && <span className="ml-2 text-[10px] text-violet-500 font-bold">(fat)</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--primary)] font-semibold">{formatCurrency(row.fireNumber)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--foreground)]">{row.yearsToFIRE} yrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[var(--background)] rounded-xl px-4 py-3 text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
        The difference between lean ({formatCurrency(EXPENSE_LEVELS[0])} pa) and fat ({formatCurrency(EXPENSE_LEVELS[EXPENSE_LEVELS.length - 1])} pa) FIRE is{' '}
        <span className="font-mono font-semibold text-[var(--foreground)]">
          {formatCurrency(rows[rows.length - 1].fireNumber - rows[0].fireNumber)}
        </span>{' '}
        more in your portfolio and{' '}
        <span className="font-mono font-semibold text-[var(--foreground)]">
          {rows[rows.length - 1].yearsToFIRE - rows[0].yearsToFIRE} extra years
        </span>{' '}
        of work.
      </div>
    </div>
  );
}

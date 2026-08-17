import { useMemo, useState } from 'react';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { StatCard } from '../../components/ui/StatCard';
import { calculateSuperSacrifice, div293Exposure } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import { SUPER_RULES } from '../../data/super-rules';
import { Toggle } from '../../components/ui/Toggle';
import { usePortfolio } from '../../context/PortfolioContext';

interface Props {
  grossSalary: number;
  onGrossSalaryChange: (v: number) => void;
}

export function SuperSalarySacrifice({ grossSalary, onGrossSalaryChange }: Props) {
  const { portfolio } = usePortfolio();

  // Super balance: locked to portfolio when set, user-editable override otherwise
  const [superOverride, setSuperOverride] = useState(200000);
  const currentSuper = portfolio.superBalance > 0 ? portfolio.superBalance : superOverride;

  const [sgRate, setSgRate] = useState(12);
  const [additionalSacrifice, setAdditionalSacrifice] = useState(10000);
  const [unusedCarryForward, setUnusedCarryForward] = useState(0);
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(60);
  const [superReturn, setSuperReturn] = useState(7);
  const [useCarryForward, setUseCarryForward] = useState(false);
  const [includeHELP, setIncludeHELP] = useState(false);
  const [helpDebt, setHelpDebt] = useState(30000);

  const result = useMemo(
    () =>
      calculateSuperSacrifice({
        grossSalary,
        currentSuperBalance: currentSuper,
        sgRate: sgRate / 100,
        additionalSacrifice,
        unusedCarryForward: useCarryForward ? unusedCarryForward : 0,
        age,
        retirementAge,
        superReturn,
        includeHELP,
        helpDebt,
      }),
    [grossSalary, currentSuper, sgRate, additionalSacrifice, unusedCarryForward, useCarryForward, age, retirementAge, superReturn, includeHELP, helpDebt],
  );

  // Div 293 exposure on gross income + employer SG (even without sacrificing)
  const div293ExposurePre = useMemo(
    () => div293Exposure(grossSalary, result.employerSG),
    [grossSalary, result.employerSG],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {portfolio.grossSalary > 0
          ? <PortfolioField label="Gross Salary" value={grossSalary} prefix="$" />
          : <NumberInput label="Gross Salary" value={grossSalary} onChange={onGrossSalaryChange} min={30000} max={1000000} step={5000} prefix="$" />
        }
        {portfolio.superBalance > 0
          ? <PortfolioField label="Current Super Balance" value={currentSuper} prefix="$" />
          : <NumberInput label="Current Super Balance" value={superOverride} onChange={setSuperOverride} min={0} max={5000000} step={10000} prefix="$" />
        }
        <SliderControl label="Employer SG Rate" value={sgRate} onChange={setSgRate} min={9.5} max={15} step={0.5} suffix="%" />
        <NumberInput label="Extra Sacrifice (pa)" value={additionalSacrifice} onChange={setAdditionalSacrifice} min={0} max={30000} step={500} prefix="$" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Current Age" value={age} onChange={v => setAge(Math.round(v))} min={18} max={70} step={1} />
        <NumberInput label="Retirement Age" value={retirementAge} onChange={v => setRetirementAge(Math.round(v))} min={50} max={75} step={1} />
        <SliderControl label="Super Return (pa)" value={superReturn} onChange={setSuperReturn} min={2} max={12} step={0.5} suffix="%" />
        <div className="flex flex-col gap-3">
          <Toggle label="Use carry-forward cap" checked={useCarryForward} onChange={setUseCarryForward} description="Only if total super < $500k" />
          {useCarryForward && (
            <NumberInput label="Unused Cap (carry-fwd)" value={unusedCarryForward} onChange={setUnusedCarryForward} min={0} max={150000} step={1000} prefix="$" />
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <Toggle label="Include HELP/HECS repayment" checked={includeHELP} onChange={setIncludeHELP} description="Reduces take-home; repayment rate 0–10% by income" />
        {includeHELP && (
          <div className="w-48">
            <NumberInput label="HELP Debt" value={helpDebt} onChange={setHelpDebt} min={1000} max={200000} step={5000} prefix="$" />
          </div>
        )}
      </div>

      {div293ExposurePre.applies && (
        <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
          <strong>Division 293 applies — even before sacrificing.</strong> Income ({formatCurrency(grossSalary)}) + employer SG ({formatCurrency(result.employerSG)}) already exceed ${(SUPER_RULES.division293Threshold / 1000).toFixed(0)}k. Extra 15% tax: {formatCurrency(Math.round(div293ExposurePre.extraTax))}. Sacrificing more will increase this.
        </div>
      )}

      {result.isDiv293 && (
        <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
          <strong>Division 293 applies.</strong> An extra 15% tax is payable on your concessional contributions because your income + contributions exceed ${(SUPER_RULES.division293Threshold / 1000).toFixed(0)}k.
          Extra tax: <span className="font-mono">{formatCurrency(result.div293Tax)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Tax Saving This Year" value={formatCurrency(result.taxSaving)} color="green" subtext="vs taking as salary" />
        <StatCard label="Super Tax Paid (15%)" value={formatCurrency(result.taxInSuper)} color="amber" />
        <StatCard label="Employer SG" value={formatCurrency(result.employerSG)} color="blue" subtext={`Max extra: ${formatCurrency(result.maxAdditionalAvailable)}`} />
        <StatCard label={`Projected Super at ${retirementAge}`} value={formatCompact(result.projectedSuperAtRetirement)} color="purple" subtext={`${result.yearsToRetirement} years of growth`} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {['', 'With Sacrifice', 'Without Sacrifice', 'Difference'].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Taxable Income', formatCurrency(grossSalary - result.actualSacrifice), formatCurrency(grossSalary), formatCurrency(-(result.actualSacrifice))],
              ['Income Tax + Medicare', formatCurrency(result.incomeTaxWithSacrifice), formatCurrency(result.incomeTaxWithoutSacrifice), formatCurrency(result.incomeTaxWithSacrifice - result.incomeTaxWithoutSacrifice)],
              ...(includeHELP ? [
                ['HELP Repayment', formatCurrency(result.helpWithSacrifice), formatCurrency(result.helpWithoutSacrifice), formatCurrency(result.helpWithSacrifice - result.helpWithoutSacrifice)],
              ] : []),
              ['Tax in Super (15%)', formatCurrency(result.taxInSuper), '$0', ''],
              ['Net Tax Saving', '', '', formatCurrency(result.taxSaving)],
            ].map(([label, a, b, diff]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-[var(--muted-foreground)]">{label}</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{a}</td>
                <td className="px-4 py-2 text-right font-mono text-[var(--foreground)]">{b}</td>
                <td className={`px-4 py-2 text-right font-mono font-semibold ${diff && !diff.startsWith('$0') ? (diff.startsWith('-') ? 'text-[var(--danger)] ' : 'text-[var(--success)] ') : 'text-[var(--muted-foreground)]'}`}>{diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[var(--muted-foreground)]">Based on 2024-25 ATO rates. Concessional cap: {formatCurrency(SUPER_RULES.concessionalCap)}.</p>
    </div>
  );
}

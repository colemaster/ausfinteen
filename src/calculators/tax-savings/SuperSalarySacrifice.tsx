import { useMemo, useState, useCallback } from 'react';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { StatCard } from '../../components/ui/StatCard';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { calculateSuperSacrifice, div293Exposure } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';
import { SUPER_RULES } from '../../data/super-rules';
import { Toggle } from '../../components/ui/Toggle';
import { usePortfolio } from '../../context/PortfolioContext';

interface Props {
  grossSalary: number;
  onGrossSalaryChange: (v: number) => void;
}

interface SuperSacrificePreset {
  salary: number;
  sacrifice: number;
  useCarry: boolean;
  carryAmount: number;
}

const PRESETS: ScenarioPreset<SuperSacrificePreset>[] = [
  {
    id: 'moderate',
    label: 'Balanced Boost',
    badge: '+$5k/yr',
    description: '$90k salary, sacrificing $5,000/yr to compound retirement tax-free',
    values: { salary: 90000, sacrifice: 5000, useCarry: false, carryAmount: 0 },
  },
  {
    id: 'max-cap',
    label: 'Max Concessional Cap',
    badge: '$30k Total',
    description: '$120k salary, maximizing full $30,000 concessional super contribution',
    values: { salary: 120000, sacrifice: 15600, useCarry: false, carryAmount: 0 },
  },
  {
    id: 'catchup',
    label: '5-Yr Carry-Forward Catchup',
    badge: 'Unused Caps',
    description: 'Using past unused super caps to make a large tax-deductible contribution',
    values: { salary: 135000, sacrifice: 25000, useCarry: true, carryAmount: 30000 },
  },
];

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
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<SuperSacrificePreset>) => {
    setActivePreset(preset.id);
    if (preset.values.salary !== undefined) onGrossSalaryChange(preset.values.salary);
    if (preset.values.sacrifice !== undefined) setAdditionalSacrifice(preset.values.sacrifice);
    if (preset.values.useCarry !== undefined) setUseCarryForward(preset.values.useCarry);
    if (preset.values.carryAmount !== undefined) setUnusedCarryForward(preset.values.carryAmount);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    onGrossSalaryChange(85000);
    setSuperOverride(200000);
    setSgRate(12);
    setAdditionalSacrifice(10000);
    setUnusedCarryForward(0);
    setUseCarryForward(false);
    setAge(35);
    setRetirementAge(60);
    setSuperReturn(7);
    setIncludeHELP(false);
    setHelpDebt(30000);
  }, [onGrossSalaryChange]);

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

  const summaryText = useMemo(() => {
    return [
      '--- Super Salary Sacrifice Summary ---',
      `Gross Salary: ${formatCurrency(grossSalary)} | Super Balance: ${formatCurrency(currentSuper)}`,
      `Employer SG (12%): ${formatCurrency(result.employerSG)} | Salary Sacrificed: ${formatCurrency(result.actualSacrifice)}`,
      `Net Tax Saving This Year: ${formatCurrency(result.taxSaving)} (vs taking as salary)`,
      `Tax Paid in Super (15%): ${formatCurrency(result.taxInSuper)}`,
      `Projected Super at Age ${retirementAge}: ${formatCurrency(result.projectedSuperAtRetirement)} (${result.yearsToRetirement} years compounding at ${superReturn}%)`,
      `Calculated via AusFinTools Tax Savings Guide`,
    ].join('\n');
  }, [grossSalary, currentSuper, result, retirementAge, superReturn]);

  return (
    <div className="space-y-5">
      {/* Quick Presets */}
      <QuickPresetBar
        presets={PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Super Sacrifice Strategies"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        {portfolio.grossSalary > 0
          ? <PortfolioField label="Gross Salary" value={grossSalary} prefix="$" />
          : <NumberInput
              label="Gross Salary"
              value={grossSalary}
              onChange={v => {
                onGrossSalaryChange(v);
                setActivePreset(undefined);
              }}
              min={30000}
              max={1000000}
              step={5000}
              prefix="$"
            />
        }
        {portfolio.superBalance > 0
          ? <PortfolioField label="Current Super Balance" value={currentSuper} prefix="$" />
          : <NumberInput label="Current Super Balance" value={superOverride} onChange={setSuperOverride} min={0} max={5000000} step={10000} prefix="$" />
        }
        <SliderControl label="Employer SG Rate" value={sgRate} onChange={setSgRate} min={9.5} max={15} step={0.5} suffix="%" />
        <NumberInput
          label="Extra Sacrifice (pa)"
          value={additionalSacrifice}
          onChange={v => {
            setAdditionalSacrifice(v);
            setActivePreset(undefined);
          }}
          min={0}
          max={30000}
          step={500}
          prefix="$"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Current Age" value={age} onChange={v => setAge(Math.round(v))} min={18} max={70} step={1} />
        <NumberInput label="Retirement Age" value={retirementAge} onChange={v => setRetirementAge(Math.round(v))} min={50} max={75} step={1} />
        <SliderControl label="Super Return (pa)" value={superReturn} onChange={setSuperReturn} min={2} max={12} step={0.5} suffix="%" />
        <div className="flex flex-col gap-3">
          <Toggle
            label="Use carry-forward cap"
            checked={useCarryForward}
            onChange={v => {
              setUseCarryForward(v);
              setActivePreset(undefined);
            }}
            description="Only if total super < $500k"
          />
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

      {/* KPI summary cards with animations and delta pill */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Tax Saving This Year"
          value={formatCurrency(result.taxSaving)}
          numericValue={result.taxSaving}
          format="currency"
          color="green"
          subtext="vs taking as salary"
          delta={result.taxSaving}
          deltaFormat="currency"
        />
        <StatCard
          label="Super Tax Paid (15%)"
          value={formatCurrency(result.taxInSuper)}
          numericValue={result.taxInSuper}
          format="currency"
          color="amber"
          subtext="Flat concessional rate"
        />
        <StatCard
          label="Employer SG"
          value={formatCurrency(result.employerSG)}
          numericValue={result.employerSG}
          format="currency"
          color="blue"
          subtext={`Max extra: ${formatCurrency(result.maxAdditionalAvailable)}`}
        />
        <StatCard
          label={`Projected Super at ${retirementAge}`}
          value={formatCompact(result.projectedSuperAtRetirement)}
          numericValue={result.projectedSuperAtRetirement}
          format="currency"
          color="purple"
          subtext={`${result.yearsToRetirement} years of growth`}
        />
      </div>

      {/* Breakdown table with sticky high-contrast header */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-96">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-[var(--card)] z-10 shadow-xs border-b border-[var(--border)]">
            <tr>
              {['Component', 'With Sacrifice', 'Without Sacrifice', 'Difference'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {[
              ['Taxable Income', formatCurrency(grossSalary - result.actualSacrifice), formatCurrency(grossSalary), formatCurrency(-(result.actualSacrifice))],
              ['Income Tax + Medicare', formatCurrency(result.incomeTaxWithSacrifice), formatCurrency(result.incomeTaxWithoutSacrifice), formatCurrency(result.incomeTaxWithSacrifice - result.incomeTaxWithoutSacrifice)],
              ...(includeHELP ? [
                ['HELP Repayment', formatCurrency(result.helpWithSacrifice), formatCurrency(result.helpWithoutSacrifice), formatCurrency(result.helpWithSacrifice - result.helpWithoutSacrifice)],
              ] : []),
              ['Tax in Super (15%)', formatCurrency(result.taxInSuper), '$0', ''],
              ['Net Tax Saving', '', '', formatCurrency(result.taxSaving)],
            ].map(([label, a, b, diff]) => (
              <tr key={label} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">{label}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[var(--foreground)]">{a}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[var(--muted-foreground)]">{b}</td>
                <td className={`px-4 py-2.5 text-right font-mono font-bold ${diff && !diff.startsWith('$0') ? (diff.startsWith('-') ? 'text-[var(--danger)]' : 'text-[var(--success)]') : 'text-[var(--muted-foreground)]'}`}>{diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[var(--muted-foreground)]">
        <span>Based on 2026-27 ATO rates. Concessional cap: {formatCurrency(SUPER_RULES.concessionalCap)}.</span>
      </div>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Super Salary Sacrifice"
      />
    </div>
  );
}

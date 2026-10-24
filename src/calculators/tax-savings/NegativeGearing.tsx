import { useMemo, useState, useCallback } from 'react';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { StatCard } from '../../components/ui/StatCard';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { calculateNegativeGearing } from './engine';
import { formatCurrency, formatPct } from '../../utils/formatters';

interface NegativeGearingPreset {
  propertyValue: number;
  rentalIncome: number;
  mortgageRate: number;
  lvr: number;
  councilRates: number;
  insurance: number;
  pmFeeRate: number;
  maintenance: number;
  depreciation: number;
  margTax: number;
}

const NG_PRESETS: ScenarioPreset<NegativeGearingPreset>[] = [
  {
    id: 'unit',
    label: 'Brisbane Growth Unit',
    badge: '$550k',
    description: '$550k unit, $500/wk rent, modern building with $7k depreciation',
    values: {
      propertyValue: 550000,
      rentalIncome: 500,
      mortgageRate: 6.0,
      lvr: 80,
      councilRates: 1800,
      insurance: 1200,
      pmFeeRate: 7,
      maintenance: 1500,
      depreciation: 7000,
      margTax: 39,
    },
  },
  {
    id: 'house',
    label: 'Suburban House',
    badge: '$850k',
    description: '$850k standalone house, higher maintenance, top tax bracket',
    values: {
      propertyValue: 850000,
      rentalIncome: 650,
      mortgageRate: 5.9,
      lvr: 80,
      councilRates: 2600,
      insurance: 2200,
      pmFeeRate: 6.5,
      maintenance: 3500,
      depreciation: 9000,
      margTax: 47,
    },
  },
  {
    id: 'cashflow',
    label: 'High Yield / Positive Cashflow',
    badge: 'Cashflow +',
    description: '$400k regional property with high rental yield and positive cashflow',
    values: {
      propertyValue: 400000,
      rentalIncome: 520,
      mortgageRate: 6.2,
      lvr: 70,
      councilRates: 1600,
      insurance: 1400,
      pmFeeRate: 8,
      maintenance: 1800,
      depreciation: 3000,
      margTax: 32,
    },
  },
];

export function NegativeGearing() {
  const [propertyValue, setPropertyValue] = useState(650000);
  const [rentalIncome, setRentalIncome] = useState(450);
  const [mortgageRate, setMortgageRate] = useState(6.0);
  const [lvr, setLvr] = useState(80);
  const [councilRates, setCouncilRates] = useState(2000);
  const [insurance, setInsurance] = useState(1500);
  const [pmFeeRate, setPmFeeRate] = useState(7);
  const [maintenance, setMaintenance] = useState(2000);
  const [depreciation, setDepreciation] = useState(8000);
  const [margTax, setMargTax] = useState(47);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<NegativeGearingPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.propertyValue !== undefined) setPropertyValue(preset.values.propertyValue);
    if (preset.values.rentalIncome !== undefined) setRentalIncome(preset.values.rentalIncome);
    if (preset.values.mortgageRate !== undefined) setMortgageRate(preset.values.mortgageRate);
    if (preset.values.lvr !== undefined) setLvr(preset.values.lvr);
    if (preset.values.councilRates !== undefined) setCouncilRates(preset.values.councilRates);
    if (preset.values.insurance !== undefined) setInsurance(preset.values.insurance);
    if (preset.values.pmFeeRate !== undefined) setPmFeeRate(preset.values.pmFeeRate);
    if (preset.values.maintenance !== undefined) setMaintenance(preset.values.maintenance);
    if (preset.values.depreciation !== undefined) setDepreciation(preset.values.depreciation);
    if (preset.values.margTax !== undefined) setMargTax(preset.values.margTax);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setPropertyValue(650000);
    setRentalIncome(450);
    setMortgageRate(6.0);
    setLvr(80);
    setCouncilRates(2000);
    setInsurance(1500);
    setPmFeeRate(7);
    setMaintenance(2000);
    setDepreciation(8000);
    setMargTax(47);
  }, []);

  const result = useMemo(
    () =>
      calculateNegativeGearing({
        propertyValue,
        rentalIncomeWeekly: rentalIncome,
        mortgageRate,
        lvr,
        councilRates,
        insurance,
        pmFeeRate: pmFeeRate / 100,
        maintenance,
        depreciation,
        margTax: margTax / 100,
      }),
    [propertyValue, rentalIncome, mortgageRate, lvr, councilRates, insurance, pmFeeRate, maintenance, depreciation, margTax],
  );

  const grossYield = propertyValue > 0 ? (result.rentalIncomeAnnual / propertyValue) * 100 : 0;

  const summaryText = useMemo(() => {
    return [
      '--- Investment Property Negative Gearing Summary ---',
      `Property Value: ${formatCurrency(propertyValue)} | LVR: ${lvr}% (${formatCurrency(propertyValue * (lvr / 100))} loan)`,
      `Gross Rental Income: ${formatCurrency(result.rentalIncomeAnnual)}/yr (${formatPct(grossYield)} yield)`,
      `Total Deductible Expenses: ${formatCurrency(result.totalExpenses)}/yr (Mortgage Interest: ${formatCurrency(result.mortgageInterest)})`,
      `Taxable Outcome: ${result.isPositivelyGeared ? 'Profit' : 'Loss'} of ${formatCurrency(Math.abs(result.taxableLoss))}`,
      `ATO Tax Refund: ${formatCurrency(result.taxRefund)}/yr`,
      `Net Out-of-Pocket Cash Position: ${result.netCashPosition >= 0 ? '+' : ''}${formatCurrency(result.netCashPosition)}/yr (${formatCurrency(result.netCashPosition / 52)}/wk)`,
      `Calculated via AusFinTools Tax Savings Guide`,
    ].join('\n');
  }, [propertyValue, lvr, result, grossYield]);

  return (
    <div className="space-y-5">
      {/* Quick Presets */}
      <QuickPresetBar
        presets={NG_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Investment Property Profiles"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput
          label="Property Value"
          value={propertyValue}
          onChange={v => {
            setPropertyValue(v);
            setActivePreset(undefined);
          }}
          min={100000}
          max={5000000}
          step={10000}
          prefix="$"
        />
        <NumberInput
          label="Rental Income (pw)"
          value={rentalIncome}
          onChange={v => {
            setRentalIncome(v);
            setActivePreset(undefined);
          }}
          min={0}
          max={5000}
          step={10}
          prefix="$"
        />
        <SliderControl
          label="Mortgage Rate"
          value={mortgageRate}
          onChange={v => {
            setMortgageRate(v);
            setActivePreset(undefined);
          }}
          min={2}
          max={12}
          step={0.1}
          suffix="%"
        />
        <SliderControl
          label="LVR"
          value={lvr}
          onChange={v => {
            setLvr(v);
            setActivePreset(undefined);
          }}
          min={10}
          max={95}
          step={5}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Council Rates (pa)" value={councilRates} onChange={setCouncilRates} min={0} max={10000} step={100} prefix="$" />
        <NumberInput label="Insurance (pa)" value={insurance} onChange={setInsurance} min={0} max={10000} step={100} prefix="$" />
        <SliderControl label="Prop. Mgmt Fee" value={pmFeeRate} onChange={setPmFeeRate} min={0} max={15} step={0.5} suffix="%" />
        <NumberInput label="Maintenance (pa)" value={maintenance} onChange={setMaintenance} min={0} max={50000} step={500} prefix="$" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Depreciation (pa)" value={depreciation} onChange={setDepreciation} min={0} max={50000} step={500} prefix="$" />
        <SliderControl
          label="Marginal Tax Rate"
          value={margTax}
          onChange={v => {
            setMargTax(v);
            setActivePreset(undefined);
          }}
          min={0}
          max={49}
          step={1}
          suffix="%"
        />
      </div>

      <div
        className={`rounded-xl px-4 py-3 border text-sm font-medium ${
          result.isPositivelyGeared
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]'
        }`}
      >
        <span className="font-bold">{result.isPositivelyGeared ? 'Positively geared' : 'Negatively geared'}</span>
        {' — '}Gross yield: <span className="font-mono font-bold">{formatPct(grossYield)}</span> pa
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Rental Income (pa)"
          value={formatCurrency(result.rentalIncomeAnnual)}
          numericValue={result.rentalIncomeAnnual}
          format="currency"
          color="green"
          subtext={`≈ ${formatCurrency(rentalIncome)}/wk`}
        />
        <StatCard
          label="Total Expenses (pa)"
          value={formatCurrency(result.totalExpenses)}
          numericValue={result.totalExpenses}
          format="currency"
          color="red"
          subtext={`Interest: ${formatCurrency(result.mortgageInterest)}`}
        />
        <StatCard
          label="Tax Refund"
          value={formatCurrency(result.taxRefund)}
          numericValue={result.taxRefund}
          format="currency"
          color="purple"
          subtext={`Taxable loss: ${formatCurrency(result.taxableLoss)}`}
        />
        <StatCard
          label="Net Cash Position"
          value={formatCurrency(result.netCashPosition)}
          numericValue={result.netCashPosition}
          format="currency"
          color={result.netCashPosition >= 0 ? 'green' : 'amber'}
          subtext="After refund, ex depreciation"
          delta={result.netCashPosition}
          deltaFormat="currency"
        />
      </div>

      <p className="text-[10px] text-[var(--muted-foreground)]">
        Depreciation is a non-cash deduction (included in taxable loss but not in net cash position). Based on 2026-27 ATO rates.
      </p>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Negative Gearing Analysis"
      />
    </div>
  );
}

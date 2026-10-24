import { useState, useMemo, useCallback } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { NumberInput } from '../../components/ui/NumberInput';
import { SliderControl } from '../../components/ui/SliderControl';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { calculateFIRENumber, yearsToFIRE } from './engine';
import { formatCurrency, formatCompact } from '../../utils/formatters';

interface Props {
  currentInvestments: number;
  returnRate: number;
  currentAge: number;
}

interface BaristaPreset {
  annualExpenses: number;
  partTimeIncome: number;
  swr: number;
}

const PRESETS: ScenarioPreset<BaristaPreset>[] = [
  {
    id: 'cafe-consulting',
    label: 'Cafe / Consulting ($30k)',
    badge: 'Standard Semi-Retire',
    description: '$70k lifestyle supported by $30k part-time earnings and portfolio',
    values: { annualExpenses: 70000, partTimeIncome: 30000, swr: 4 },
  },
  {
    id: 'frugal-part-time',
    label: 'Frugal Semi-Retire ($20k)',
    badge: 'Lean Barista',
    description: '$55k lifestyle with 2 days/week casual job at 3.5% conservative SWR',
    values: { annualExpenses: 55000, partTimeIncome: 20000, swr: 3.5 },
  },
  {
    id: 'active-freelancer',
    label: 'Active Freelancer ($45k)',
    badge: 'Upper Barista',
    description: '$85k lifestyle subsidized by $45k enjoyable freelance income',
    values: { annualExpenses: 85000, partTimeIncome: 45000, swr: 4 },
  },
];

export function BaristaFIRE({ currentInvestments, returnRate, currentAge }: Props) {
  const [partTimeIncome, setPartTimeIncome] = useState(30000);
  const [annualExpenses, setAnnualExpenses] = useState(70000);
  const [swr, setSwr] = useState(4);
  const [activePreset, setActivePreset] = useState<string | undefined>(undefined);

  const handleApplyPreset = useCallback((preset: ScenarioPreset<BaristaPreset>) => {
    setActivePreset(preset.id);
    if (!preset.values) return;
    if (preset.values.annualExpenses !== undefined) setAnnualExpenses(preset.values.annualExpenses);
    if (preset.values.partTimeIncome !== undefined) setPartTimeIncome(preset.values.partTimeIncome);
    if (preset.values.swr !== undefined) setSwr(preset.values.swr);
  }, []);

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setAnnualExpenses(70000);
    setPartTimeIncome(30000);
    setSwr(4);
  }, []);

  const annualGap = Math.max(0, annualExpenses - partTimeIncome);
  const baristaFIRENumber = useMemo(
    () => calculateFIRENumber(annualGap, swr / 100),
    [annualGap, swr],
  );

  // For barista, you need portfolio to cover the gap (no ongoing savings once you semi-retire)
  const years = useMemo(
    () => yearsToFIRE(currentInvestments, 0, baristaFIRENumber, returnRate),
    [currentInvestments, baristaFIRENumber, returnRate],
  );

  const fullFIRENumber = useMemo(
    () => calculateFIRENumber(annualExpenses, swr / 100),
    [annualExpenses, swr],
  );

  const saving = fullFIRENumber - baristaFIRENumber;

  const summaryText = useMemo(() => {
    return [
      '--- Barista FIRE Summary ---',
      `Annual Lifestyle Expenses: ${formatCurrency(annualExpenses)} | Part-Time Income: ${formatCurrency(partTimeIncome)}`,
      `Annual Gap Covered by Portfolio: ${formatCurrency(annualGap)} (SWR: ${swr}%)`,
      `Barista FIRE Number: ${formatCurrency(baristaFIRENumber)} (vs Full FIRE: ${formatCurrency(fullFIRENumber)})`,
      `Capital Saved vs Full FIRE: ${formatCurrency(saving)}`,
      `Years to Barista FIRE: ${years} years (at age ${currentAge + years})`,
      `Calculated via AusFinTools Barista FIRE Engine`,
    ].join('\n');
  }, [annualExpenses, partTimeIncome, annualGap, swr, baristaFIRENumber, fullFIRENumber, saving, years, currentAge]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <QuickPresetBar
          presets={PRESETS}
          activePresetId={activePreset}
          onSelect={handleApplyPreset}
          title="Barista FIRE Scenarios"
        />
        <div className="shrink-0">
          <CalculatorActions
            onReset={handleReset}
            summaryText={summaryText}
            summaryTitle="Barista FIRE"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
        <NumberInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} min={10000} max={300000} step={5000} prefix="$" />
        <NumberInput label="Part-Time Income" value={partTimeIncome} onChange={setPartTimeIncome} min={0} max={200000} step={5000} prefix="$" />
        <SliderControl label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2} max={6} step={0.5} suffix="%" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-xs text-amber-700">
        Annual gap the portfolio needs to cover:{' '}
        <span className="font-mono font-bold">{formatCurrency(annualGap)}</span>
        {' '}= expenses ({formatCurrency(annualExpenses)}) - part-time income ({formatCurrency(partTimeIncome)})
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Barista FIRE Number"
          value={formatCompact(baristaFIRENumber)}
          numericValue={baristaFIRENumber}
          format="currency"
          color="blue"
          subtext={`Gap / ${swr}% SWR`}
        />
        <StatCard
          label="Years to Barista FIRE"
          value={`${years} yrs`}
          numericValue={typeof years === 'number' ? years : 0}
          format="number"
          color="green"
          subtext={`Age ${currentAge + (typeof years === 'number' ? years : 0)}`}
        />
        <StatCard
          label="Full FIRE Number"
          value={formatCompact(fullFIRENumber)}
          numericValue={fullFIRENumber}
          format="currency"
          color="purple"
        />
        <StatCard
          label="Saved vs Full FIRE"
          value={formatCurrency(saving)}
          numericValue={saving}
          format="currency"
          color="cyan"
          subtext="Less needed"
        />
      </div>
    </div>
  );
}

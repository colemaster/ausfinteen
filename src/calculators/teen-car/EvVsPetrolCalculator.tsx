import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { EV_VS_PETROL_DEFAULTS } from '@/data/car-data';
import { evVsPetrolRunningCost } from './engine';
import { Zap, Fuel, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from '@/components/charts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/utils/formatters';

interface EvVsPetrolInputs {
  kmPerYear: number;
  petrolLPer100km: number;
  petrolPrice: number;
  evKwhPer100km: number;
  homePrice: number;
  fastPrice: number;
  fastSharePct: number;
}

const PRESETS: ScenarioPreset<EvVsPetrolInputs>[] = [
  {
    id: 'commuter',
    label: 'Brisbane Commuter',
    badge: '15k km/yr',
    description: 'Average Brisbane commute (15,000 km, 7.5L/100km @ $2.38/L vs 15 kWh/100km @ 28c/kWh)',
    values: {
      kmPerYear: 15000,
      petrolLPer100km: 7.5,
      petrolPrice: 2.38,
      evKwhPer100km: 15.0,
      homePrice: 0.28,
      fastPrice: 0.65,
      fastSharePct: 10,
    },
  },
  {
    id: 'suv-vs-ev',
    label: 'Petrol SUV vs EV',
    badge: '$2,600+ Sav/yr',
    description: 'Typical petrol SUV (9.5L/100km @ $2.30/L) vs EV (15 kWh/100km @ 28c/kWh flat) over 15,000 km/yr',
    values: {
      kmPerYear: 15000,
      petrolLPer100km: 9.5,
      petrolPrice: 2.30,
      evKwhPer100km: 15.0,
      homePrice: 0.28,
      fastPrice: 0.65,
      fastSharePct: 0,
    },
  },
  {
    id: 'offpeak-ev',
    label: 'Off-Peak EV Night Tariff',
    badge: 'Max Savings',
    description: 'Night EV tariff (10c/kWh off-peak) vs petrol car (9.5L/100km @ $2.30/L), saving over $3,050/yr',
    values: {
      kmPerYear: 15000,
      petrolLPer100km: 9.5,
      petrolPrice: 2.30,
      evKwhPer100km: 15.0,
      homePrice: 0.10,
      fastPrice: 0.65,
      fastSharePct: 5,
    },
  },
  {
    id: 'student',
    label: 'Student / City Driver',
    badge: '8k km/yr',
    description: 'Light city driving, mostly home off-peak or rooftop solar charging',
    values: {
      kmPerYear: 8000,
      petrolLPer100km: 7.0,
      petrolPrice: 2.38,
      evKwhPer100km: 14.0,
      homePrice: 0.22,
      fastPrice: 0.65,
      fastSharePct: 5,
    },
  },
  {
    id: 'roadtripper',
    label: 'High Mileage / Road Trip',
    badge: '25k km/yr',
    description: 'Highway driving with 35% public DC fast charging and larger energy draw',
    values: {
      kmPerYear: 25000,
      petrolLPer100km: 8.5,
      petrolPrice: 2.45,
      evKwhPer100km: 18.0,
      homePrice: 0.28,
      fastPrice: 0.70,
      fastSharePct: 35,
    },
  },
];

const CHART_CONFIG = {
  annualCost: { label: 'Annual Fuel Cost ($)', color: 'var(--chart-2, #10b981)' },
};

export function EvVsPetrolCalculator() {
  const [kmPerYear, setKmPerYear] = useState<number>(EV_VS_PETROL_DEFAULTS.kmPerYear);
  const [petrolLPer100km, setPetrolLPer100km] = useState<number>(EV_VS_PETROL_DEFAULTS.petrolLPer100km);
  const [petrolPrice, setPetrolPrice] = useState<number>(EV_VS_PETROL_DEFAULTS.petrolPricePerLitre);
  const [evKwhPer100km, setEvKwhPer100km] = useState<number>(EV_VS_PETROL_DEFAULTS.evKwhPer100km);
  const [homePrice, setHomePrice] = useState<number>(EV_VS_PETROL_DEFAULTS.homeOffPeakPricePerKwh);
  const [fastPrice, setFastPrice] = useState<number>(EV_VS_PETROL_DEFAULTS.publicFastPricePerKwh);
  const [fastSharePct, setFastSharePct] = useState<number>(EV_VS_PETROL_DEFAULTS.publicFastSharePct);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<EvVsPetrolInputs>) => {
    setActivePreset(preset.id);
    if (preset.values.kmPerYear !== undefined) setKmPerYear(preset.values.kmPerYear);
    if (preset.values.petrolLPer100km !== undefined) setPetrolLPer100km(preset.values.petrolLPer100km);
    if (preset.values.petrolPrice !== undefined) setPetrolPrice(preset.values.petrolPrice);
    if (preset.values.evKwhPer100km !== undefined) setEvKwhPer100km(preset.values.evKwhPer100km);
    if (preset.values.homePrice !== undefined) setHomePrice(preset.values.homePrice);
    if (preset.values.fastPrice !== undefined) setFastPrice(preset.values.fastPrice);
    if (preset.values.fastSharePct !== undefined) setFastSharePct(preset.values.fastSharePct);
  };

  const handleResetDefaults = useCallback(() => {
    setActivePreset(undefined);
    setKmPerYear(EV_VS_PETROL_DEFAULTS.kmPerYear);
    setPetrolLPer100km(EV_VS_PETROL_DEFAULTS.petrolLPer100km);
    setPetrolPrice(EV_VS_PETROL_DEFAULTS.petrolPricePerLitre);
    setEvKwhPer100km(EV_VS_PETROL_DEFAULTS.evKwhPer100km);
    setHomePrice(EV_VS_PETROL_DEFAULTS.homeOffPeakPricePerKwh);
    setFastPrice(EV_VS_PETROL_DEFAULTS.publicFastPricePerKwh);
    setFastSharePct(EV_VS_PETROL_DEFAULTS.publicFastSharePct);
  }, []);

  const comparison = useMemo(() => {
    return evVsPetrolRunningCost({
      kmPerYear,
      petrolLPer100km,
      petrolPricePerLitre: petrolPrice,
      evKwhPer100km,
      homeOffPeakPricePerKwh: homePrice,
      publicFastPricePerKwh: fastPrice,
      publicFastSharePct: fastSharePct,
    });
  }, [kmPerYear, petrolLPer100km, petrolPrice, evKwhPer100km, homePrice, fastPrice, fastSharePct]);

  const {
    petrolAnnual,
    petrolPer100km,
    petrolPerKm,
    evAnnual,
    evPer100km,
    evPerKm,
    savingsAnnual,
    savingsPct,
    savingsWeekly,
    savings5Year,
  } = comparison;

  const chartData = useMemo(() => {
    return [
      { name: 'Petrol Car', annualCost: Math.round(petrolAnnual), color: 'var(--chart-3, #f59e0b)' },
      { name: 'Electric Car (EV)', annualCost: Math.round(evAnnual), color: 'var(--chart-2, #10b981)' },
    ];
  }, [petrolAnnual, evAnnual]);

  const summaryText = useMemo(() => {
    return [
      '--- EV vs Petrol Annual Fuel Cost Summary (2026-27) ---',
      `Annual Distance: ${kmPerYear.toLocaleString()} km`,
      `Petrol Cost: ${formatCurrency(petrolAnnual)}/yr (${formatCurrency(petrolPer100km)}/100km • ${(petrolPerKm * 100).toFixed(1)}c/km)`,
      `EV Charging Cost: ${formatCurrency(evAnnual)}/yr (${formatCurrency(evPer100km)}/100km • ${(evPerKm * 100).toFixed(1)}c/km blended)`,
      `Weekly Fuel Savings: ${formatCurrency(savingsWeekly)}/wk`,
      `Annual Fuel Savings: ${savingsAnnual >= 0 ? '+' : ''}${formatCurrency(savingsAnnual)}/yr (${savingsPct.toFixed(0)}% cheaper to run)`,
      `5-Year Fuel Savings: ${formatCurrency(savings5Year)}`,
      `Data: 2026-27 Brisbane reference prices ($2.38/L petrol vs 28c/kWh electricity). AusFinTools`,
    ].join('\n');
  }, [
    kmPerYear,
    petrolAnnual,
    petrolPer100km,
    petrolPerKm,
    evAnnual,
    evPer100km,
    evPerKm,
    savingsWeekly,
    savingsAnnual,
    savingsPct,
    savings5Year,
  ]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">EV vs Petrol — Annual Fuel Cost Comparator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            2026-27 benchmarks: $2.38/L petrol vs 28c/kWh electricity (15 kWh/100km EV vs 7.5 L/100km petrol hatchback).
          </p>
        </div>
        <Badge variant="success" className="shrink-0">
          2026-27 Benchmarks
        </Badge>
      </div>

      {/* Preset bar */}
      <QuickPresetBar
        presets={PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Quick Vehicle Driving Profiles"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Petrol inputs */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Fuel className="w-4 h-4" />
            <h3 className="font-bold text-sm text-foreground">Petrol Car</h3>
          </div>
          <SliderControl
            label="Distance driven per year"
            value={kmPerYear}
            onChange={v => {
              setKmPerYear(v);
              setActivePreset(undefined);
            }}
            min={5000}
            max={30000}
            step={1000}
            suffix=" km"
          />
          <SliderControl
            label="Petrol fuel economy"
            value={petrolLPer100km}
            onChange={v => {
              setPetrolLPer100km(v);
              setActivePreset(undefined);
            }}
            min={4}
            max={12}
            step={0.5}
            decimals={1}
            suffix=" L/100km"
          />
          <SliderControl
            label="Petrol price (ULP 91)"
            value={petrolPrice}
            onChange={v => {
              setPetrolPrice(v);
              setActivePreset(undefined);
            }}
            min={1.5}
            max={2.8}
            step={0.01}
            decimals={2}
            prefix="$"
            suffix="/L"
          />
          <p className="text-[11px] text-muted-foreground">
            Typical hatchback: 7.5L/100km. Brisbane ULP 91 benchmark: <strong>$2.38/L</strong> (${(7.5 * petrolPrice).toFixed(2)}/100km).
          </p>
        </div>

        {/* EV inputs */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
            <h3 className="font-bold text-sm text-foreground">Electric Car (EV)</h3>
          </div>
          <SliderControl
            label="EV energy consumption"
            value={evKwhPer100km}
            onChange={v => {
              setEvKwhPer100km(v);
              setActivePreset(undefined);
            }}
            min={10}
            max={25}
            step={0.5}
            decimals={1}
            suffix=" kWh/100km"
          />
          <SliderControl
            label="Home off-peak electricity"
            value={homePrice}
            onChange={v => {
              setHomePrice(v);
              setActivePreset(undefined);
            }}
            min={0.1}
            max={0.5}
            step={0.01}
            decimals={2}
            prefix="$"
            suffix="/kWh"
          />
          <SliderControl
            label="Public fast charger rate"
            value={fastPrice}
            onChange={v => {
              setFastPrice(v);
              setActivePreset(undefined);
            }}
            min={0.4}
            max={1}
            step={0.05}
            decimals={2}
            prefix="$"
            suffix="/kWh"
          />
          <SliderControl
            label="Share of charging done on public fast chargers"
            value={fastSharePct}
            onChange={v => {
              setFastSharePct(v);
              setActivePreset(undefined);
            }}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
        </div>
      </div>

      {/* Visual Fuel Cost Bar Chart */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Running Cost Visual Breakdown</h3>
        <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}/yr`, 'Annual Cost']} />} />
              <Bar dataKey="annualCost" radius={[6, 6, 0, 0]} animationDuration={800}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Results with Comparison Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Petrol cost / year"
          value={`$${Math.round(petrolAnnual).toLocaleString()}`}
          numericValue={Math.round(petrolAnnual)}
          format="currency"
          color="amber"
          subtext={`≈ $${petrolPer100km.toFixed(2)} / 100km (${(petrolPerKm * 100).toFixed(1)}c/km)`}
        />
        <StatCard
          label="EV charging cost / year"
          value={`$${Math.round(evAnnual).toLocaleString()}`}
          numericValue={Math.round(evAnnual)}
          format="currency"
          color="green"
          subtext={`≈ $${evPer100km.toFixed(2)} / 100km (${(evPerKm * 100).toFixed(1)}c/km)`}
        />
        <div className="relative">
          <StatCard
            label="Yearly savings with EV"
            value={`$${Math.round(savingsAnnual).toLocaleString()}`}
            numericValue={Math.round(savingsAnnual)}
            format="currency"
            color={savingsAnnual >= 0 ? 'purple' : 'red'}
            subtext={savingsAnnual >= 0 ? `~${savingsPct.toFixed(0)}% cheaper to run (Save $${Math.round(savingsWeekly)}/wk)` : 'Public fast charging costs more than petrol'}
            delta={savingsAnnual}
            deltaFormat="currency"
          />
        </div>
      </div>

      {/* Multi-Metric Savings Breakdown Panel */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          EV vs Petrol Savings Breakdown & Multi-Year Projection
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
            <span className="text-[11px] text-muted-foreground block">Cost Per 100km</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">${evPer100km.toFixed(2)}</span>
              <span className="text-muted-foreground text-[10px]">vs ${petrolPer100km.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">{(evPer100km / petrolPer100km * 100).toFixed(0)}% of petrol bill</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
            <span className="text-[11px] text-muted-foreground block">Weekly Fuel Outlay</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="font-bold text-foreground text-base">${(evAnnual / 52).toFixed(2)}</span>
              <span className="text-muted-foreground text-[10px]">vs ${(petrolAnnual / 52).toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">+${savingsWeekly.toFixed(2)}/wk in pocket</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
            <span className="text-[11px] text-muted-foreground block">5-Year Fuel Savings</span>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
              ${Math.round(savings5Year).toLocaleString()}
            </div>
            <span className="text-[10px] text-muted-foreground block">Based on {kmPerYear.toLocaleString()} km/yr</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
            <span className="text-[11px] text-muted-foreground block">Pure Home Charging (0% Fast)</span>
            <div className="font-mono font-bold text-foreground text-base">
              ${Math.round((kmPerYear / 100) * evKwhPer100km * homePrice).toLocaleString()}/yr
            </div>
            <span className="text-[10px] text-muted-foreground block">Max savings: ${Math.round(petrolAnnual - ((kmPerYear / 100) * evKwhPer100km * homePrice)).toLocaleString()}/yr</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <Zap className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <span className="font-bold text-sm block">The EV vs Petrol Mathematics (2026-27 Benchmarks):</span>
          <p>
            • <strong>Petrol running costs:</strong> A typical midsize petrol car or SUV consuming <strong>9.5L/100km at $2.30/L</strong> costs <strong>$21.85 per 100km</strong> ($3,278/yr over 15,000 km). Even an efficient hatchback (7.5L/100km @ $2.38/L) costs $17.85 per 100km ($2,678/yr).
          </p>
          <p>
            • <strong>EV electricity charging:</strong> A modern EV draws ~<strong>15 kWh/100km</strong>. At a standard residential flat rate of <strong>28c/kWh</strong> (AER DMO benchmark, matching the ATO Safe Harbour 4.2c/km rate), driving costs just <strong>$4.20 per 100km</strong> ($630/yr). On dedicated off-peak EV night tariffs (<strong>8c–15c/kWh</strong>), that drops to only <strong>~$1.20–$1.50 per 100km</strong> ($225/yr)!
          </p>
          <p>
            • <strong>Annual fuel savings over 15,000 km:</strong> You save <strong>$2,648+ per year</strong> compared to a 9.5L petrol car on flat tariffs, or over <strong>$3,050/yr</strong> on off-peak rates — putting more than <strong>$13,000 to $15,000</strong> back in your pocket over 5 years.
          </p>
          <p className="text-[11px] text-muted-foreground dark:text-emerald-300/80">
            * Note: Public DC ultra-fast charging (~$0.65/kWh = $9.75/100km) erodes part of the savings on road trips, while daytime rooftop solar charging reduces fuel costs to nearly $0.
          </p>
        </div>
      </div>

      {/* Action controls */}
      <CalculatorActions
        onReset={handleResetDefaults}
        summaryText={summaryText}
        summaryTitle="EV vs Petrol Comparison"
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.green_vehicle_guide} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ev_council} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.racq_fuel} />
      </div>
    </Card>
  );
}

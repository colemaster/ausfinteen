import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { EV_VS_PETROL_DEFAULTS } from '@/data/car-data';
import { evVsPetrolRunningCost } from './engine';
import { Zap, Fuel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export function EvVsPetrolCalculator() {
  const [kmPerYear, setKmPerYear] = useState<number>(EV_VS_PETROL_DEFAULTS.kmPerYear);
  const [petrolLPer100km, setPetrolLPer100km] = useState<number>(EV_VS_PETROL_DEFAULTS.petrolLPer100km);
  const [petrolPrice, setPetrolPrice] = useState<number>(EV_VS_PETROL_DEFAULTS.petrolPricePerLitre);
  const [evKwhPer100km, setEvKwhPer100km] = useState<number>(EV_VS_PETROL_DEFAULTS.evKwhPer100km);
  const [homePrice, setHomePrice] = useState<number>(EV_VS_PETROL_DEFAULTS.homeOffPeakPricePerKwh);
  const [fastPrice, setFastPrice] = useState<number>(EV_VS_PETROL_DEFAULTS.publicFastPricePerKwh);
  const [fastSharePct, setFastSharePct] = useState<number>(EV_VS_PETROL_DEFAULTS.publicFastSharePct);

  const comparison = evVsPetrolRunningCost({
    kmPerYear,
    petrolLPer100km,
    petrolPricePerLitre: petrolPrice,
    evKwhPer100km,
    homeOffPeakPricePerKwh: homePrice,
    publicFastPricePerKwh: fastPrice,
    publicFastSharePct: fastSharePct,
  });

  const { petrolAnnual, petrolPer100km, evAnnual, evPer100km, savingsAnnual, savingsPct } = comparison;

  const chartData = useMemo(() => {
    return [
      { name: 'Petrol Car', annualCost: Math.round(petrolAnnual), color: '#f59e0b' },
      { name: 'Electric Car (EV)', annualCost: Math.round(evAnnual), color: '#10b981' },
    ];
  }, [petrolAnnual, evAnnual]);

  const chartConfig = useMemo(() => {
    return {
      annualCost: { label: 'Annual Fuel Cost ($)', color: '#10b981' },
    };
  }, []);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">EV vs Petrol — Annual Fuel Cost Comparator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Brisbane 2026 prices. Compare your yearly fuel bill for a petrol hatch vs an electric car.
          </p>
        </div>
        <Badge variant="success" className="shrink-0">
          Brisbane • 2026
        </Badge>
      </div>

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
            onChange={v => setKmPerYear(v)}
            min={5000}
            max={30000}
            step={1000}
            suffix=" km"
          />
          <SliderControl
            label="Petrol fuel economy"
            value={petrolLPer100km}
            onChange={v => setPetrolLPer100km(v)}
            min={4}
            max={12}
            step={0.5}
            decimals={1}
            suffix=" L/100km"
          />
          <SliderControl
            label="Petrol price (ULP 91)"
            value={petrolPrice}
            onChange={v => setPetrolPrice(v)}
            min={1.5}
            max={2.5}
            step={0.01}
            decimals={2}
            prefix="$"
            suffix="/L"
          />
          <p className="text-[11px] text-muted-foreground">
            Typical small hatch: 6.5L/100km. Brisbane ULP 91 avg: <strong>$1.96/L</strong>.
          </p>
        </div>

        {/* EV inputs */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
            <h3 className="font-bold text-sm text-foreground">Electric Car (EV)</h3>
          </div>
          <SliderControl
            label="EV energy use"
            value={evKwhPer100km}
            onChange={v => setEvKwhPer100km(v)}
            min={10}
            max={25}
            step={1}
            suffix=" kWh/100km"
          />
          <SliderControl
            label="Home off-peak electricity"
            value={homePrice}
            onChange={v => setHomePrice(v)}
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
            onChange={v => setFastPrice(v)}
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
            onChange={v => setFastSharePct(v)}
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
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}/yr`, 'Annual Cost']} />} />
              <Bar dataKey="annualCost" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Petrol cost / year"
          value={`$${Math.round(petrolAnnual).toLocaleString()}`}
          numericValue={Math.round(petrolAnnual)}
          format="currency"
          color="amber"
          subtext={`≈ $${petrolPer100km.toFixed(2)} per 100km`}
        />
        <StatCard
          label="EV charging cost / year"
          value={`$${Math.round(evAnnual).toLocaleString()}`}
          numericValue={Math.round(evAnnual)}
          format="currency"
          color="green"
          subtext={`≈ $${evPer100km.toFixed(2)} per 100km blended`}
        />
        <StatCard
          label="Yearly savings with EV"
          value={`$${Math.round(savingsAnnual).toLocaleString()}`}
          numericValue={Math.round(savingsAnnual)}
          format="currency"
          color={savingsAnnual >= 0 ? 'purple' : 'red'}
          subtext={savingsAnnual >= 0 ? `~${savingsPct.toFixed(0)}% cheaper to run` : 'Public charging costs more than petrol'}
        />
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">The EV maths in Brisbane:</span>
          Home off-peak charging (~$0.30/kWh) makes an EV ~2.5× cheaper to run than petrol. But if you rely on public
          DC fast chargers (~$0.65/kWh), the fuel savings mostly disappear — so EV running costs depend heavily on
          where you charge. A home solar setup makes daytime charging effectively free.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.green_vehicle_guide} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ev_council} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.racq_fuel} />
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { MapPin } from 'lucide-react';
import { BRISBANE_WEEKLY_BUDGET } from '@/data/brisbane-data';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { cn } from '@/lib/utils';

export function BrisbaneBudgetCalculator() {
  const { weeklyNetPay } = useTeenProfile();

  const [items, setItems] = useState<number[]>(BRISBANE_WEEKLY_BUDGET.map(i => i.weekly));

  const updateItem = (index: number, value: number) => {
    setItems(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  const weeklyTotal = items.reduce((s, v) => s + v, 0);
  const monthlyTotal = weeklyTotal * 52 / 12;
  const annualTotal = weeklyTotal * 52;

  const surplus = weeklyNetPay - weeklyTotal;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Brisbane Weekly Budget Calculator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Typical 2026 living costs for a sharehouse-dwelling student or young worker. Adjust every line to your own life!
          </p>
        </div>
        <Badge variant="success" className="shrink-0">
          Brisbane, QLD • 2026 figures
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-5">
          {BRISBANE_WEEKLY_BUDGET.map((item, i) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  {item.category}
                </label>
                <span className="text-xs font-bold text-foreground font-mono">${items[i]}/wk</span>
              </div>
              <SliderControl
                label=""
                value={items[i]}
                onChange={v => updateItem(i, v)}
                min={0}
                max={item.category.startsWith('Rent') ? 800 : 300}
                step={5}
                suffix=""
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Weekly Totals</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Weekly</div>
                <div className="text-lg font-bold font-mono text-foreground">${weeklyTotal.toFixed(0)}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Monthly</div>
                <div className="text-lg font-bold font-mono text-foreground">${monthlyTotal.toFixed(0)}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Yearly</div>
                <div className="text-lg font-bold font-mono text-foreground">${annualTotal.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <NumberInput
                label="Your Weekly Take-Home Pay (from profile)"
                value={weeklyNetPay}
                onChange={() => {}}
                min={0}
                max={2000}
                step={10}
                prefix="$"
              />
              <div
                className={cn(
                  'rounded-xl border p-3.5 text-sm',
                  surplus >= 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                )}
              >
                <span className="font-bold">{surplus >= 0 ? '👍 On track' : '⚠️ Shortfall'}:</span>{' '}
                {surplus >= 0
                  ? `You'd have $${surplus.toFixed(0)}/wk left over after Brisbane living costs.`
                  : `You'd be $${Math.abs(surplus).toFixed(0)}/wk short — pick a cheaper suburb or more shifts.`}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Money-Saving Brisbane Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Get a <strong>concession Go Card</strong> — 50% off all public transport.</li>
              <li>• Shop Aldi or the <strong>West End / Rocklea markets</strong> for cheap fresh produce.</li>
              <li>• Ride the CityCat ferry or walk — it's free with your weekly cap.</li>
              <li>• Hunt for rooms in <strong>Chermside, Annerley or Indooroopilly</strong> (~$250–400/wk).</li>
              <li>• Split utilities & internet fairly — always get bills in writing.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Sharehouse Rent Share"
          value={`$${items[0].toLocaleString()}/wk`}
          color="blue"
          subtext="4 weeks bond = 4 × weekly rent"
        />
        <StatCard
          label="Rental Bond (4 weeks)"
          value={`$${(items[0] * 4).toLocaleString()}`}
          color="purple"
          subtext="Lodged with RTA in QLD"
        />
        <StatCard
          label="Cost vs National Cities"
          value="Cheaper"
          color="green"
          subtext="vs Sydney & Melbourne rents"
        />
      </div>
    </Card>
  );
}

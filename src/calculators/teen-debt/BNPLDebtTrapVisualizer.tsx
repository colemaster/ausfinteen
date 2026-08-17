import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Flame, ShieldAlert, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { bnplLateFeeCascade, weeklyPayoffPlan } from './engine';

export function BNPLDebtTrapVisualizer() {
  const [purchasePrice, setPurchasePrice] = useState<number>(120);
  const [missedPayments, setMissedPayments] = useState<number>(2);
  const [feePerLatePayment, setFeePerLatePayment] = useState<number>(15);
  const [payoffWeeks, setPayoffWeeks] = useState<number>(4);
  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const fortnightInstallment = purchasePrice / 4;
  const cascade = bnplLateFeeCascade(purchasePrice, 4, missedPayments, feePerLatePayment, 1.5);
  const totalLateFees = cascade.totalFees;
  const totalCost = cascade.totalCost;
  const percentageMarkup = cascade.markupPct;
  const payoffPlan = weeklyPayoffPlan(purchasePrice, payoffWeeks);

  // Comparison data for 1-year impact if saved/invested vs BNPL wasted
  const chartData = useMemo(() => {
    return [
      { name: 'Item Price', value: purchasePrice, color: '#3b82f6' },
      { name: 'BNPL Late Fees', value: totalLateFees, color: '#ef4444' },
      { name: 'Total Wasted', value: totalCost, color: '#f59e0b' },
      { name: 'If Invested (1y @ 7%)', value: Math.round(totalCost * 1.07), color: '#10b981' },
    ];
  }, [purchasePrice, totalLateFees, totalCost]);

  const chartConfig = useMemo(() => {
    return {
      value: { label: 'Amount ($)', color: '#3b82f6' },
    };
  }, []);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-foreground">BNPL Debt Trap & Broke Millennial Payoff Engine</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            See how impulse Buy Now Pay Later (Afterpay/Zip) purchases accumulate late fees & compare Debt Snowball vs Avalanche!
          </p>
        </div>
        <Badge variant="danger">
          Debt Trap Warning
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Impulse Item Purchase Price ($)"
            value={purchasePrice}
            onChange={v => setPurchasePrice(v)}
            min={40}
            max={1000}
            step={10}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <SliderControl
            label="Missed Installments"
            value={missedPayments}
            onChange={v => setMissedPayments(v)}
            min={0}
            max={4}
            step={1}
            suffix=" missed"
          />
          <SliderControl
            label="Late Fee per Missed Payment"
            value={feePerLatePayment}
            onChange={v => setFeePerLatePayment(v)}
            min={5}
            max={30}
            step={1}
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block font-medium">Broke Millennial Payoff Strategy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPayoffStrategy('snowball')}
              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-left ${
                payoffStrategy === 'snowball'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Debt Snowball (Smallest First)
            </button>
            <button
              type="button"
              onClick={() => setPayoffStrategy('avalanche')}
              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-left ${
                payoffStrategy === 'avalanche'
                  ? 'bg-purple-500 text-white border-purple-500 shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Debt Avalanche (Highest Interest)
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <CalendarClock className="w-3.5 h-3.5 text-primary" />
              Pay It Off Fast Plan
            </div>
            <SliderControl
              label="Clear the whole purchase in"
              value={payoffWeeks}
              onChange={v => setPayoffWeeks(v)}
              min={1}
              max={8}
              step={1}
              suffix=" wks"
            />
            <p className="text-[11px] text-muted-foreground">
              That's <strong className="font-mono">${payoffPlan.weeklyPayment.toFixed(2)}/wk</strong> — set it as a
              payday auto-transfer and you never touch a late fee.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Bar Comparison Chart */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">True Cost vs Opportunity Cost</h3>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}`, 'Amount']} />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000} fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="4 Fortnightly Installments"
          value={`4x $${fortnightInstallment.toFixed(2)}`}
          numericValue={fortnightInstallment}
          format="currency"
          color="blue"
          subtext="Advertised 'Interest Free'"
        />
        <StatCard
          label="Late Fees Accumulated"
          value={`+$${totalLateFees.toFixed(2)}`}
          numericValue={totalLateFees}
          format="currency"
          color={totalLateFees > 0 ? 'red' : 'green'}
          subtext={`$${feePerLatePayment} base fee, ×1.5 cascade (${percentageMarkup.toFixed(0)}% markup)`}
        />
        <StatCard
          label="True Final Price Paid"
          value={`$${totalCost.toFixed(2)}`}
          numericValue={totalCost}
          format="currency"
          color={totalLateFees > 0 ? 'red' : 'cyan'}
          subtext={`Original item was $${purchasePrice}`}
        />
      </div>

      {/* Missed-payment cascade breakdown */}
      {cascade.steps.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2 animate-fade-in">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Missed-Payment Fee Cascade
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cascade.steps.map(step => (
              <div key={step.installment} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Miss #{step.installment}
                </div>
                <div className="text-sm font-extrabold font-mono text-rose-500">+${step.fee.toFixed(2)}</div>
                <div className="text-[10px] font-mono text-muted-foreground">${step.cumulativeFees.toFixed(2)} total</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Each successive missed installment costs more than the last (1.5× cascade) — that's how a $120 "interest-free"
            impulse buy quietly becomes <strong className="font-mono">${totalCost.toFixed(2)}</strong>.
          </p>
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Credit Rating Impact:</span>
          Under Australian law, BNPL defaults and late payments are reported to credit bureaus (Equifax / Experian). Having defaults on your credit file at 18 makes it significantly harder to rent an apartment, get a mobile plan, or buy a car!
        </div>
      </div>

      <div className="pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_budget} />
      </div>
    </Card>
  );
}

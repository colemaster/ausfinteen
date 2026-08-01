import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Flame, ShieldAlert } from 'lucide-react';

export function BNPLDebtTrapVisualizer() {
  const [purchasePrice, setPurchasePrice] = useState<number>(120);
  const [missedPayments, setMissedPayments] = useState<number>(2);
  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const fortnightInstallment = purchasePrice / 4;
  const totalLateFees = missedPayments * 15;
  const totalCost = purchasePrice + totalLateFees;
  const percentageMarkup = (totalLateFees / purchasePrice) * 100;

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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="4 Fortnightly Installments"
          value={`4x $${fortnightInstallment.toFixed(2)}`}
          color="blue"
          subtext="Advertised 'Interest Free'"
        />
        <StatCard
          label="Late Fees Accumulated"
          value={`+$${totalLateFees.toFixed(2)}`}
          color={totalLateFees > 0 ? 'red' : 'green'}
          subtext={`+$15 per missed fee (${percentageMarkup.toFixed(0)}% markup)`}
        />
        <StatCard
          label="True Final Price Paid"
          value={`$${totalCost.toFixed(2)}`}
          color={totalLateFees > 0 ? 'red' : 'cyan'}
          subtext={`Original item was $${purchasePrice}`}
        />
      </div>

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

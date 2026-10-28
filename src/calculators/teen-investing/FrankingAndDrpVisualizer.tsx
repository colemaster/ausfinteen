import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SliderControl } from '@/components/ui/SliderControl';
import { calculateFrankingCredit, simulateDrpGrowth } from './engine';
import {
  Coins,
  Repeat,
  AlertTriangle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FrankingAndDrpVisualizer() {
  // Franking Credit state
  const [cashDividend, setCashDividend] = useState<number>(700);
  const [marginalTaxBracket, setMarginalTaxBracket] = useState<number>(0);

  // DRP state
  const [drpInitial, setDrpInitial] = useState<number>(10000);
  const [drpYears, setDrpYears] = useState<number>(10);

  const frankingResult = useMemo(() => {
    return calculateFrankingCredit(cashDividend, 100, 30, marginalTaxBracket);
  }, [cashDividend, marginalTaxBracket]);

  const drpResult = useMemo(() => {
    return simulateDrpGrowth(drpInitial, drpYears, 5.0, 4.0, 70, 4);
  }, [drpInitial, drpYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Franking Credits & Cash Refund Visualizer */}
      <Card variant="glass" className="p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-foreground">
                Franking Credits & ATO Cash Refunds (Div 67)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Australia's 30% dividend imputation math and how low earners get 100% cash refunds from the ATO.
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-3">
            <SliderControl
              label="Annual Cash Dividend Received"
              value={cashDividend}
              onChange={setCashDividend}
              min={100}
              max={3000}
              step={50}
              prefix="$"
            />

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Your Marginal Tax Bracket
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { rate: 0, label: '0% (≤$18.2k)', desc: 'Student / Low Earner' },
                  { rate: 16, label: '16% ($18k-$45k)', desc: 'Part-Time' },
                  { rate: 30, label: '30% ($45k-$135k)', desc: 'Median AU' },
                  { rate: 47, label: '47% (>$190k)', desc: 'Top Tier' },
                ].map(b => (
                  <button
                    key={b.rate}
                    onClick={() => setMarginalTaxBracket(b.rate)}
                    className={cn(
                      'p-2 rounded-xl text-left border transition-all text-xs',
                      marginalTaxBracket === b.rate
                        ? 'bg-amber-500/10 border-amber-500/40 text-foreground shadow-sm'
                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    <div className="font-bold">{b.label}</div>
                    <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Math Flow */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">1. Cash Dividend Received:</span>
              <span className="font-bold text-foreground">${frankingResult.cashDividend.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">2. Franking Credit (30% Co. Tax Paid):</span>
              <span className="font-bold text-amber-500">+${frankingResult.frankingCredit.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
              <span className="text-muted-foreground">3. Gross Assessable Dividend:</span>
              <span className="font-bold text-foreground">${frankingResult.grossDividend.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">4. Tax at {frankingResult.marginalTaxRatePct}% Rate:</span>
              <span className="font-bold text-foreground">${frankingResult.taxOnGrossDividend.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
              <span className="font-bold text-foreground">5. ATO Cash Refund (ITAA 1997 Div 67):</span>
              <span className={cn('font-extrabold text-sm', frankingResult.cashRefund > 0 ? 'text-emerald-500' : 'text-foreground')}>
                {frankingResult.cashRefund > 0
                  ? `+$${frankingResult.cashRefund.toFixed(2)} Cash Refund`
                  : frankingResult.taxPayable > 0
                  ? `-$${frankingResult.taxPayable.toFixed(2)} Top-Up Tax`
                  : '$0.00 (Balanced)'}
              </span>
            </div>
          </div>

          {/* Result Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Total Cash in Your Pocket
              </div>
              <div className="text-xl font-extrabold text-foreground">
                ${frankingResult.netCashInPocket.toFixed(2)}
              </div>
            </div>
            <Badge variant="success" className="text-xs px-2.5 py-1">
              {frankingResult.effectiveYieldMultiplier}x Cash Multiplier
            </Badge>
          </div>
        </div>

        {/* Division 6AA Minor Warning */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Minor Trap (Division 6AA ITAA 1936):</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            For under-18s, unearned income (dividends + franking credits) is capped at <strong>$416/year</strong> tax-free.
            Above $416, punitive 66% to 47% penalty rates apply. Choose growth ETFs (IVV, NDQ, VGS) to compound gains untaxed.
          </p>
        </div>
      </Card>

      {/* DRP Compounding & CGT Parcel Tracker */}
      <Card variant="glass" className="p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Repeat className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold text-foreground">
                Dividend Reinvestment Plans (DRP) & CGT Tracking
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Automate compounding with zero brokerage fees, but track your CGT cost base parcels carefully.
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-3">
            <SliderControl
              label="Initial Investment Amount"
              value={drpInitial}
              onChange={setDrpInitial}
              min={2000}
              max={30000}
              step={1000}
              prefix="$"
            />
            <SliderControl
              label="Investment Horizon"
              value={drpYears}
              onChange={setDrpYears}
              min={5}
              max={30}
              step={1}
              suffix=" Years"
            />
          </div>

          {/* Outcomes Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-1">
              <div className="text-[11px] text-muted-foreground">With DRP Compounding:</div>
              <div className="text-lg font-extrabold text-foreground">
                ${drpResult.finalValueWithDrp.toLocaleString()}
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                +${drpResult.drpAdvantage.toLocaleString()} vs cash payouts
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground">Total Reinvested Dividends:</div>
              <div className="text-lg font-extrabold text-foreground">
                ${drpResult.totalDividendsReinvested.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                $0 brokerage fees incurred
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground">Separate CGT Parcels Created:</div>
              <div className="text-lg font-extrabold text-foreground">
                {drpResult.estimatedParcelsAcquired} Parcels
              </div>
              <div className="text-[10px] text-amber-500 font-semibold">
                Each parcel has its own 12mo clock
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground">Accumulated Cost Base:</div>
              <div className="text-lg font-extrabold text-foreground">
                ${drpResult.accumulatedCostBase.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Reduces future CGT on sale
              </div>
            </div>
          </div>

          {/* DRP Rules Callout */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span>4 Essential DRP Rules for Australian Investors:</span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              <li>• <strong>Taxable in Year Received</strong>: Reinvested dividends are assessable income even though no cash hits your bank.</li>
              <li>• <strong>Distinct CGT Parcels</strong>: Each DRP purchase has its own purchase date and cost base.</li>
              <li>• <strong>12-Month Clock</strong>: Each DRP lot must be held for 12 months from payment date to get the 50% CGT discount.</li>
              <li>• <strong>Registry Setup</strong>: Turn on DRP on your share registry (Computershare, MUFG / Link, Boardroom), NOT in your broker app!</li>
            </ul>
          </div>
        </div>

        {/* Registry Checklist */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-primary" />
            <span>Recommended Tracker:</span>
          </span>
          <span className="font-semibold text-foreground">Sharesight or Navexa</span>
        </div>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SliderControl } from '@/components/ui/SliderControl';
import { compareMicroPlatformCosts } from './engine';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MicroInvestingPlatformMatrix() {
  const [balance, setBalance] = useState<number>(500);
  const [tradesPerYear, setTradesPerYear] = useState<number>(12);
  const [filterMode, setFilterMode] = useState<'all' | 'chess' | 'custodial' | 'minors'>('all');

  const platformCosts = useMemo(() => {
    return compareMicroPlatformCosts(balance, tradesPerYear, 100);
  }, [balance, tradesPerYear]);

  const filteredPlatforms = useMemo(() => {
    return platformCosts.filter(p => {
      if (filterMode === 'chess') return p.holdingModel === 'CHESS';
      if (filterMode === 'custodial') return p.holdingModel === 'Custodial';
      if (filterMode === 'minors') return p.supportsMinorBareTrust;
      return true;
    });
  }, [platformCosts, filterMode]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">
              Micro-Investing & Broker Matrix (2026–2027)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare CHESS sponsorship vs Custodial holding models, brokerage costs, and the devastating "Flat Fee Trap".
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
              filterMode === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            All Platforms
          </button>
          <button
            onClick={() => setFilterMode('chess')}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
              filterMode === 'chess'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            CHESS Only (HIN)
          </button>
          <button
            onClick={() => setFilterMode('custodial')}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
              filterMode === 'custodial'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            Custodial / Fractional
          </button>
          <button
            onClick={() => setFilterMode('minors')}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
              filterMode === 'minors'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            Minor Bare Trusts (&lt;18)
          </button>
        </div>
      </div>

      {/* CHESS vs Custodial Holding Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-foreground text-sm">CHESS-Sponsored Model (Gold Standard)</h3>
            <Badge variant="success" className="text-[10px] ml-auto">Direct HIN</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Shares are registered directly in your legal name on the ASX subregister with a unique 10-digit
            <strong> Holder Identification Number (HIN)</strong>. Official records live with registries
            (Computershare, MUFG Corporate Markets, Boardroom, Automic).
          </p>
          <ul className="text-xs space-y-1.5 text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Total Insolvency Protection</strong>: If broker collapses, your shares cannot be touched by creditors.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Direct Corporate Rights</strong>: Direct AGM voting, DRP elections on share registry, free HIN transfer.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Trade-off</strong>: Whole units only (no fractional shares); ASX $500 minimum first-parcel rule.</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-foreground text-sm">Custodial / Omnibus Model</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">Beneficial Owner</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Shares are pooled in the legal name of an institutional custodian (e.g. Citigroup for Betashares Direct,
            J.P. Morgan for Vanguard, DriveWealth for Stake US). You are a beneficial owner on an internal ledger.
          </p>
          <ul className="text-xs space-y-1.5 text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span><strong>Fractional Units</strong>: Invest exact dollar amounts (e.g. $10 into a $200 unit) with zero residual.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span><strong>Automated DCA</strong>: Effortless recurring weekly/monthly auto-invest with $0 or low brokerage.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Trade-off</strong>: No HIN or direct registry login; transferring out can incur high fees or trigger CGT if sold.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Live Fee Drag Simulator & Platform Cost Analysis
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SliderControl
            label="Your Portfolio Balance"
            value={balance}
            onChange={setBalance}
            min={100}
            max={10000}
            step={50}
            prefix="$"
          />
          <SliderControl
            label="Trades / Deposits Per Year"
            value={tradesPerYear}
            onChange={setTradesPerYear}
            min={1}
            max={26}
            step={1}
            suffix=" trades/yr"
          />
        </div>
      </div>

      {/* Flat Fee Trap Warning Banner */}
      {balance < 1000 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-foreground">
              ⚠️ The Flat Monthly Fee Trap on Small Balances:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              On a <strong>${balance.toLocaleString()}</strong> balance, a $4.50/month fee ($54/year on Raiz) equals a massive{' '}
              <strong className="text-rose-500">
                {((54 / balance) * 100).toFixed(1)}% annual fee drag
              </strong>
              ! That wipes out your entire expected annual market return. Stick to zero-subscription platforms (Betashares Direct, CMC Invest) or low per-trade brokers!
            </p>
          </div>
        </div>
      )}

      {/* Platform Comparison Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredPlatforms.map(p => {
          const isZeroFee = p.annualFeeTotal === 0;
          const isHighFeeDrag = p.annualFeeDragPct > 5.0;

          return (
            <div
              key={p.platformId}
              className={cn(
                'p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between',
                isZeroFee
                  ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm'
                  : isHighFeeDrag
                  ? 'bg-rose-500/5 border-rose-500/30'
                  : 'bg-card border-border'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-foreground text-sm">{p.name}</h4>
                  <Badge
                    variant={p.holdingModel === 'CHESS' ? 'success' : 'outline'}
                    className="text-[10px]"
                  >
                    {p.holdingModel}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Brokerage:</span>
                    <span className="font-semibold text-foreground">
                      {p.brokeragePerTrade === 0 ? '$0 on ETFs' : `$${p.brokeragePerTrade.toFixed(2)}/trade`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Monthly Fee:</span>
                    <span className="font-semibold text-foreground">
                      {p.monthlyFee === 0 ? '$0 / mo' : `$${p.monthlyFee.toFixed(2)} / mo`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Min Trade:</span>
                    <span className="font-semibold text-foreground">
                      {p.minTrade === 500 ? '$500 (ASX)' : `$${p.minTrade}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Minor Bare Trust:</span>
                    <span>
                      {p.supportsMinorBareTrust ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" /> 18+ Only
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Annual Cost Outcome */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground">Annual Cost:</span>
                  <div className="text-right">
                    <span className={cn('text-sm font-extrabold', isZeroFee ? 'text-emerald-500' : isHighFeeDrag ? 'text-rose-500' : 'text-foreground')}>
                      ${p.annualFeeTotal.toFixed(2)}/yr
                    </span>
                    <span className={cn('block text-[10px] font-semibold', isHighFeeDrag ? 'text-rose-500' : 'text-muted-foreground')}>
                      ({p.annualFeeDragPct.toFixed(2)}% drag)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

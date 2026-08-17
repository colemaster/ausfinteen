import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SliderControl } from '@/components/ui/SliderControl';
import {
  TOP_10_ASX_ETFS,
  BEST_3_ETF_PORTFOLIOS,
  computePortfolioStats,
  ASX_ETF_DATA_AS_AT,
  type ETFPortfolioOption,
} from '@/data/asx-etf-data';
import { Briefcase, ShieldCheck, Sprout, TrendingUp, ExternalLink, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { afterTaxSaleValue, etfGrowthWithFees } from './engine';

const RISK_COLORS: Record<ETFPortfolioOption['risk'], string> = {
  Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Balanced: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Growth: 'bg-primary/10 text-primary',
  'High Growth': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

const RISK_ICONS: Record<ETFPortfolioOption['risk'], typeof ShieldCheck> = {
  Low: ShieldCheck,
  Balanced: Sprout,
  Growth: TrendingUp,
  'High Growth': TrendingUp,
};

function pct(v: number | null): string {
  return v === null ? '—' : `${v.toFixed(2)}%`;
}

const TEN_YEAR_PROJECTION = 10000; // $10k invested for 10 years
const TEN_YEAR_RETURN = 7.5;       // conservative long-run blended return (%)

export function ETFPortfolioPicker() {
  const [marginalRatePct, setMarginalRatePct] = useState<number>(0);

  const statsByPortfolio = useMemo(() => {
    const map: Record<string, ReturnType<typeof computePortfolioStats>> = {};
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      map[p.id] = computePortfolioStats(p.allocations, TOP_10_ASX_ETFS);
    });
    return map;
  }, []);

  const projectionsByPortfolio = useMemo(() => {
    const map: Record<string, { growth: number; afterTax: number; merPct: number }> = {};
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const stats = statsByPortfolio[p.id];
      const merPct = stats.weightedMer ?? 0;
      const growth = etfGrowthWithFees(TEN_YEAR_PROJECTION, 10, TEN_YEAR_RETURN, merPct);
      const afterTax = afterTaxSaleValue(TEN_YEAR_PROJECTION, 10, TEN_YEAR_RETURN, merPct, marginalRatePct / 100);
      map[p.id] = { growth: growth.futureValueNet, afterTax, merPct };
    });
    return map;
  }, [statsByPortfolio, marginalRatePct]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-bold text-foreground">Best 3 Starter ETF Portfolios</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Model portfolios built from the top-10 ASX ETFs above. Weighted-average returns & costs computed live from the data.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">As at {ASX_ETF_DATA_AS_AT}</Badge>
      </div>

      {/* Marginal rate + fee drag / tax controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <SliderControl
            label="Your marginal tax rate (for CGT on sale)"
            value={marginalRatePct}
            onChange={v => setMarginalRatePct(v)}
            min={0}
            max={45}
            step={1}
            suffix="%"
          />
        </div>
        <div className="rounded-2xl border border-border bg-background/60 p-4 flex items-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <Receipt className="w-3.5 h-3.5 inline-block mr-1 text-amber-500" />
            The table below shows <strong>$10,000 invested for 10 years at a blended {TEN_YEAR_RETURN}% return</strong>:
            first after each portfolio's weighted MER drag, then after CGT using the 50% discount on sale (assets held
            12+ months). Zero marginal rate models a teen under the tax-free threshold.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BEST_3_ETF_PORTFOLIOS.map(portfolio => {
          const stats = statsByPortfolio[portfolio.id];
          const projection = projectionsByPortfolio[portfolio.id];
          const RiskIcon = RISK_ICONS[portfolio.risk];
          return (
            <div key={portfolio.id} className="rounded-2xl border border-border bg-background/60 p-5 space-y-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
                  <RiskIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-wide', RISK_COLORS[portfolio.risk])}>
                  {portfolio.risk}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-foreground">{portfolio.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{portfolio.tagline}</p>
              </div>

              {/* Allocation chips */}
              <div className="flex flex-wrap gap-1.5">
                {portfolio.allocations.map(a => (
                  <span
                    key={a.code}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-border bg-card"
                    title={TOP_10_ASX_ETFS.find(e => e.code === a.code)?.name}
                  >
                    {a.code}
                    <span className="text-muted-foreground font-mono">{a.pct}%</span>
                  </span>
                ))}
              </div>

              {/* Weighted stats */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl border border-border bg-card p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">1Y Return</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats.weighted1Y)}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">5Y (avg)</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats.weighted5Y)}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">MER</div>
                  <div className="text-sm font-bold font-mono text-foreground">{pct(stats.weightedMer)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-card p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">3Y (avg)</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats.weighted3Y)}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Yield</div>
                  <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">{pct(stats.weightedYield)}</div>
                </div>
              </div>

              {/* Fee drag + tax-aware projection columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">$10k → 10yrs (after MER)</div>
                  <div className="text-sm font-bold font-mono text-primary">${projection.growth.toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">@ {projection.merPct.toFixed(2)}% MER</div>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">After-tax sale (50% CGT disc.)</div>
                  <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">${projection.afterTax.toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">@ {marginalRatePct}% MTR</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed mt-auto">{portfolio.note}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground bg-background/60 border border-border rounded-xl px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          Model portfolios for education only — not financial advice.
        </span>
        <span>Returns are weighted averages of the top-10 funds; cash portion treated as growth in the "Balanced Starter" example.</span>
      </div>
    </Card>
  );
}

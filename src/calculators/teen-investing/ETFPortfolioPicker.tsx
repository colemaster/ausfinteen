import { useMemo, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SliderControl } from '@/components/ui/SliderControl';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import {
  ALL_POPULAR_ASX_ETFS,
  BEST_3_ETF_PORTFOLIOS,
  computePortfolioStats,
  ASX_ETF_DATA_AS_AT,
  type ETFPortfolioOption,
} from '@/data/asx-etf-data';
import { Briefcase, ShieldCheck, Sprout, TrendingUp, Zap, ExternalLink, Receipt, Sparkles } from 'lucide-react';
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
  'High Growth': Zap,
};

function pct(v: number | null): string {
  return v === null ? '—' : `${v.toFixed(2)}%`;
}

const TEN_YEAR_PROJECTION = 10000; // $10k invested for 10 years
const TEN_YEAR_RETURN = 8.5;       // Long-run blended Australian/global equity market return (%)

interface TaxBracketPreset {
  marginalRatePct: number;
}

const PRESETS: ScenarioPreset<TaxBracketPreset>[] = [
  {
    id: 'teen-tax-free',
    label: 'Teen Student (0% Tax)',
    badge: 'Tax-Free',
    description: 'Income under $18,200 threshold with zero CGT payable on sale',
    values: { marginalRatePct: 0 },
  },
  {
    id: 'entry-bracket',
    label: 'Casual Job (16% Bracket)',
    badge: '16% Tax',
    description: 'Income between $18,201 and $45,000 paying low-tier tax',
    values: { marginalRatePct: 16 },
  },
  {
    id: 'median-bracket',
    label: 'Full-Time (30% Bracket)',
    badge: '30% Tax',
    description: 'Income between $45,001 and $135,000 in Australia median bracket',
    values: { marginalRatePct: 30 },
  },
];

export function ETFPortfolioPicker() {
  const [marginalRatePct, setMarginalRatePct] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | undefined>(undefined);

  // Per-portfolio variant toggle
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    'all-in-one': 'dhhf',
    'aussie-core-global': 'vas-vgs',
    'tech-growth': 'vgs-ndq-qual',
  });

  const handleSelectVariant = useCallback((portfolioId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [portfolioId]: variantId }));
  }, []);

  const handleApplyPreset = useCallback((preset: ScenarioPreset<TaxBracketPreset>) => {
    setActivePreset(preset.id);
    if (preset.values?.marginalRatePct !== undefined) {
      setMarginalRatePct(preset.values.marginalRatePct);
    }
  }, []);

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setMarginalRatePct(0);
    setSelectedVariants({
      'all-in-one': 'dhhf',
      'aussie-core-global': 'vas-vgs',
      'tech-growth': 'vgs-ndq-qual',
    });
  }, []);

  // Compute active allocations for each portfolio based on chosen variant
  const activeAllocations = useMemo(() => {
    const map: Record<string, ETFPortfolioOption['allocations']> = {};
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const chosenVariantId = selectedVariants[p.id];
      const variant = p.variants?.find(v => v.id === chosenVariantId);
      map[p.id] = variant ? variant.allocations : p.allocations;
    });
    return map;
  }, [selectedVariants]);

  // Live weighted portfolio stats
  const statsByPortfolio = useMemo(() => {
    const map: Record<string, ReturnType<typeof computePortfolioStats>> = {};
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const allocations = activeAllocations[p.id] ?? p.allocations;
      map[p.id] = computePortfolioStats(allocations, ALL_POPULAR_ASX_ETFS);
    });
    return map;
  }, [activeAllocations]);

  // $10,000 10-year projections net of weighted MER & tax
  const projectionsByPortfolio = useMemo(() => {
    const map: Record<string, { growth: number; afterTax: number; merPct: number; feeDragLoss: number }> = {};
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const stats = statsByPortfolio[p.id];
      const merPct = stats?.weightedMer ?? 0;
      const growth = etfGrowthWithFees(TEN_YEAR_PROJECTION, 10, TEN_YEAR_RETURN, merPct);
      const afterTax = afterTaxSaleValue(TEN_YEAR_PROJECTION, 10, TEN_YEAR_RETURN, merPct, marginalRatePct / 100);
      map[p.id] = {
        growth: growth.futureValueNet,
        afterTax,
        merPct,
        feeDragLoss: growth.feeDragLoss,
      };
    });
    return map;
  }, [statsByPortfolio, marginalRatePct]);

  const summaryText = useMemo(() => {
    const lines = [
      '--- 3 Starter ETF Portfolios (2026-2027) ---',
      `Assumed $10,000 invested for 10 years @ ${TEN_YEAR_RETURN}% blended market return (Marginal Tax: ${marginalRatePct}%)`,
    ];
    BEST_3_ETF_PORTFOLIOS.forEach(p => {
      const proj = projectionsByPortfolio[p.id];
      const stats = statsByPortfolio[p.id];
      const allocs = activeAllocations[p.id] ?? p.allocations;
      const allocSummary = allocs.map(a => `${a.code} ${a.pct}%`).join(' + ');
      if (proj && stats) {
        lines.push(
          `${p.name} [${allocSummary}] (${p.risk} Risk, MER: ${pct(stats.weightedMer)}, Yield: ${pct(stats.weightedYield)}): $10k -> $${proj.growth.toLocaleString()} net | After-tax sale: $${proj.afterTax.toLocaleString()}`
        );
      }
    });
    lines.push('Calculated via AusFinTools Teen ETF Suite');
    return lines.join('\n');
  }, [marginalRatePct, projectionsByPortfolio, statsByPortfolio, activeAllocations]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-bold text-foreground">3 Starter ETF Portfolios (2026–2027)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            The 3 foundational ETF strategies for Australian beginners. Live weighted MER, dividend yield, and trailing return benchmarks computed in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="shrink-0">As at {ASX_ETF_DATA_AS_AT}</Badge>
          <CalculatorActions
            onReset={handleReset}
            summaryText={summaryText}
            summaryTitle="Starter ETF Portfolios"
          />
        </div>
      </div>

      <QuickPresetBar
        presets={PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Tax Bracket Scenarios"
      />

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
            Each card shows <strong>$10,000 invested for 10 years at a {TEN_YEAR_RETURN}% blended return</strong>:
            first net of each portfolio's live weighted MER, then after CGT using the 50% discount on sale (assets held
            12+ months). Zero marginal rate models a student under the $18,200 tax-free threshold.
          </p>
        </div>
      </div>

      {/* 3 Portfolio Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {BEST_3_ETF_PORTFOLIOS.map(portfolio => {
          const stats = statsByPortfolio[portfolio.id];
          const projection = projectionsByPortfolio[portfolio.id];
          const RiskIcon = RISK_ICONS[portfolio.risk];
          const currentVariantId = selectedVariants[portfolio.id];
          const allocs = activeAllocations[portfolio.id] ?? portfolio.allocations;

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
                <h3 className="font-bold text-foreground text-base">{portfolio.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{portfolio.tagline}</p>
              </div>

              {/* Interactive Variant Switcher */}
              {portfolio.variants && portfolio.variants.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Strategy Option
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {portfolio.variants.map(variant => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(portfolio.id, variant.id)}
                        className={cn(
                          'flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border text-left transition-all',
                          currentVariantId === variant.id
                            ? 'bg-primary/10 border-primary/50 text-foreground shadow-xs'
                            : 'bg-card border-border text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        <span className="truncate pr-2">{variant.label}</span>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          {variant.badge}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Allocation chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allocs.map(a => {
                  const etfInfo = ALL_POPULAR_ASX_ETFS.find(e => e.code === a.code);
                  return (
                    <span
                      key={a.code}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-border bg-card"
                      title={etfInfo?.name}
                    >
                      <span className="text-primary">{a.code}</span>
                      <span className="text-muted-foreground font-mono">{a.pct}%</span>
                      {etfInfo && (
                        <span className="text-[10px] text-muted-foreground/80 font-normal">({etfInfo.mer}% MER)</span>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Live weighted stats grid */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-card p-2 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Live Weighted MER</div>
                    <div className="text-sm font-bold font-mono text-foreground">{pct(stats?.weightedMer ?? null)}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-2 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Dist. Yield</div>
                    <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats?.weightedYield ?? null)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <div className="rounded-lg border border-border bg-card/60 p-1.5 text-center">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">1Y Ret</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats?.weighted1Y ?? null)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card/60 p-1.5 text-center">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">3Y Ret</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats?.weighted3Y ?? null)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card/60 p-1.5 text-center">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">5Y Ret</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats?.weighted5Y ?? null)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card/60 p-1.5 text-center">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">10Y Ret</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{pct(stats?.weighted10Y ?? null)}</div>
                  </div>
                </div>
              </div>

              {/* 10-Year $10,000 Growth Projections */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">$10k → 10yr (net MER)</div>
                  <div className="text-sm font-bold font-mono text-primary">${projection.growth.toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">Fee drag: -${projection.feeDragLoss.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">After-tax sale</div>
                  <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">${projection.afterTax.toLocaleString()}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">@ {marginalRatePct}% MTR (50% CGT disc)</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed mt-auto pt-2 border-t border-border/60">
                {portfolio.variants?.find(v => v.id === currentVariantId)?.note ?? portfolio.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground bg-background/60 border border-border rounded-xl px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          Model starter portfolios for education only — not financial advice.
        </span>
        <span>Weighted returns & MERs are calculated dynamically from current ASX ETF disclosures. Past performance does not guarantee future results.</span>
      </div>
    </Card>
  );
}

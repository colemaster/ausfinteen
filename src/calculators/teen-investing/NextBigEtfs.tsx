import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NEXT_BIG_ASX_ETF_TRENDS } from '@/data/asx-etf-data';
import { Rocket, TrendingUp, ShieldAlert, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TREND_COLORS = [
  'from-sky-500/10 to-blue-500/5 border-sky-500/30',
  'from-violet-500/10 to-purple-500/5 border-violet-500/30',
  'from-amber-500/10 to-orange-500/5 border-amber-500/30',
  'from-rose-500/10 to-red-500/5 border-rose-500/30',
  'from-emerald-500/10 to-teal-500/5 border-emerald-500/30',
  'from-cyan-500/10 to-teal-500/5 border-cyan-500/30',
];

export function NextBigEtfs() {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Tech' | 'Global' | 'Commodities' | 'Crypto'>('All');

  const filteredTrends = useMemo(() => {
    return NEXT_BIG_ASX_ETF_TRENDS.filter(t => {
      const matchesSearch =
        filterQuery.trim() === '' ||
        t.theme.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.trend.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.examples.some(e => e.toLowerCase().includes(filterQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === 'Tech') {
        return t.theme.includes('AI') || t.theme.includes('S&P') || t.examples.some(e => ['NDQ', 'SEMI', 'HMND', 'VTEK'].includes(e));
      }
      if (selectedCategory === 'Global') {
        return t.theme.includes('Global') || t.theme.includes('S&P') || t.examples.some(e => ['DHHF', 'VGS', 'BGBL', 'IVV'].includes(e));
      }
      if (selectedCategory === 'Commodities') {
        return t.theme.includes('Commodities') || t.examples.some(e => ['CPPR', 'VOLT', 'URNM', 'ACDC', 'OOO'].includes(e));
      }
      if (selectedCategory === 'Crypto') {
        return t.theme.includes('Crypto') || t.theme.includes('Bitcoin') || t.examples.some(e => ['IBTC', 'BTXX', 'EBTC'].includes(e));
      }

      return true;
    });
  }, [filterQuery, selectedCategory]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-bold text-foreground">Next Big Things in ASX ETFs (2026–2027)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Where global capital is flowing and the modern structural themes shaping the ASX ETF universe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> 2026-2027 Edition
          </Badge>
        </div>
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Global', 'Tech', 'Commodities', 'Crypto'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ETF tickers or themes..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrends.map((trend, i) => (
          <div
            key={trend.theme}
            className={cn(
              'rounded-2xl border bg-gradient-to-b p-5 space-y-3 flex flex-col',
              TREND_COLORS[i % TREND_COLORS.length]
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-foreground" />
              <h3 className="font-bold text-foreground text-sm">{trend.theme}</h3>
            </div>

            <p className="text-xs font-semibold text-foreground/90">{trend.trend}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{trend.why}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {trend.examples.map(code => (
                <span key={code} className="px-2 py-0.5 rounded-md bg-background/80 border border-border text-[11px] font-mono font-bold text-foreground">
                  {code}
                </span>
              ))}
            </div>

            <div className="flex items-start gap-1.5 pt-2 border-t border-border/60 mt-auto">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <span className="font-bold">Caution:</span> {trend.caution}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground bg-background/60 border border-border rounded-xl px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          Based on 2026-2027 issuer commentary, ASX ETF market flows and Morningstar/etfinfo reporting.
        </span>
        <span>Thematic ETFs are concentrated and volatile — usually keep them to a small "satellite" slice (e.g. 5–10%) of your portfolio.</span>
      </div>
    </Card>
  );
}

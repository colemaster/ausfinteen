import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NEXT_BIG_ASX_ETF_TRENDS } from '@/data/asx-etf-data';
import { Rocket, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
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
  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-bold text-foreground">Next Big Things in ASX ETFs (2026)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Where global money is flowing and the new launches to watch. Educational trends — not buy recommendations.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">2026 edition</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NEXT_BIG_ASX_ETF_TRENDS.map((trend, i) => (
          <div
            key={trend.theme}
            className={cn(
              'rounded-2xl border bg-gradient-to-b p-5 space-y-3',
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
                <span key={code} className="px-2 py-0.5 rounded-md bg-background/70 border border-border text-[11px] font-mono font-bold text-foreground">
                  {code}
                </span>
              ))}
            </div>

            <div className="flex items-start gap-1.5 pt-1 border-t border-border/60">
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
          Based on 2026-27 issuer commentary, ASX ETF market flows and Morningstar/etfinfo reporting.
        </span>
        <span>Thematic ETFs are concentrated and volatile — usually keep them to a small "satellite" slice of your portfolio.</span>
      </div>
    </Card>
  );
}

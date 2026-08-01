import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TOP_10_ASX_ETFS, ASX_ETF_DATA_AS_AT, type ASXETF } from '@/data/asx-etf-data';
import { asxEtfYieldConfig } from '@/lib/chart-configs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, ExternalLink, CalendarDays, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEAR_START = 2016;
const YEAR_END = 2025;

export function ASXETFExplorer() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['VAS', 'NDQ', 'IVV']);
  const [selectedEtf, setSelectedEtf] = useState<ASXETF>(TOP_10_ASX_ETFS[0]);

  const toggleCode = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const historyData = useMemo(() => {
    const rows: Record<string, number | string>[] = [];
    for (let year = YEAR_START; year <= YEAR_END; year++) {
      const row: Record<string, number | string> = { year: String(year) };
      TOP_10_ASX_ETFS.forEach(etf => {
        if (selectedCodes.includes(etf.code) && etf.annualReturns[String(year)] !== undefined) {
          row[etf.code] = etf.annualReturns[String(year)];
        }
      });
      rows.push(row);
    }
    return rows;
  }, [selectedCodes]);

  const yieldData = useMemo(
    () =>
      TOP_10_ASX_ETFS.map(etf => ({
        code: etf.code,
        dividendYield: etf.dividendYield,
      })),
    []
  );

  const config = useMemo(() => {
    const c: Record<string, { label: string; color: string }> = {};
    selectedCodes.forEach(code => {
      c[code] = { label: code, color: `var(--color-${code.toLowerCase()})` };
    });
    return c;
  }, [selectedCodes]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Top 10 Most Popular ASX ETFs — Historical Performance</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Ranked by funds under management (ASX data). Tap the ticker chips to compare calendar-year total returns.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">As at {ASX_ETF_DATA_AS_AT}</Badge>
      </div>

      {/* Ticker chips */}
      <div className="flex flex-wrap gap-2">
        {TOP_10_ASX_ETFS.map(etf => (
          <button
            key={etf.code}
            type="button"
            onClick={() => toggleCode(etf.code)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
              selectedCodes.includes(etf.code)
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            {etf.code}
          </button>
        ))}
      </div>

      {/* Annual returns chart */}
      <div className="bg-background/60 border border-border rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">Calendar-Year Total Return (%)</h3>
        <p className="text-[11px] text-muted-foreground mb-3">With distributions reinvested. IVV & VTS shown in USD (fund native currency).</p>
        <ChartContainer config={config} className="h-[300px] w-full">
          <LineChart data={historyData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedCodes.map(code => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={`var(--color-${code})`}
                strokeWidth={2.5}
                dot={false}
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>

      {/* ETF selector + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Detail card */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {TOP_10_ASX_ETFS.map(etf => (
              <button
                key={etf.code}
                type="button"
                onClick={() => setSelectedEtf(etf)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all',
                  selectedEtf.code === etf.code
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-card border-border text-muted-foreground hover:border-emerald-500/40'
                )}
              >
                {etf.code}
              </button>
            ))}
          </div>

          <div className="bg-background/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-foreground text-sm">{selectedEtf.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">by {selectedEtf.issuer}</p>
              </div>
              <a
                href={selectedEtf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-border bg-card hover:bg-muted/80 text-foreground transition-all shrink-0"
              >
                PDS <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-semibold">Tracks:</span> {selectedEtf.tracks}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="rounded-xl border border-border bg-card p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">MER</div>
                <div className="text-sm font-bold text-foreground font-mono">{selectedEtf.mer}%</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">FUM</div>
                <div className="text-sm font-bold text-foreground font-mono">${selectedEtf.fum.toFixed(1)}B</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Dist. Yield</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{selectedEtf.dividendYield}%</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Pays</div>
                <div className="text-sm font-bold text-foreground font-mono">{selectedEtf.payFrequency}</div>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-1.5 mb-2">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Trailing Returns</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(selectedEtf.trailing) as [string, number | null][]).map(([period, value]) => (
                  <div key={period} className="text-center">
                    <div className="text-[10px] text-muted-foreground font-semibold">{period}</div>
                    <div className={cn('text-sm font-bold font-mono', (value ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                      {value === null ? '—' : `${value > 0 ? '+' : ''}${value}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dividend yield chart */}
        <div className="bg-background/60 border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <PiggyBank className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Distribution Yield by ETF</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Trailing 12-month distribution yield (%). AU-share ETFs typically pay more income than US-tech ETFs.</p>
          <ChartContainer config={asxEtfYieldConfig} className="h-[260px] w-full">
            <BarChart data={yieldData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="code" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="dividendYield" fill="var(--chart-6)" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Data compiled from the ASX Investment Products report, Morningstar AU, Yahoo Finance AU and issuer PDS documents.
        All figures are historical reference data (as at {ASX_ETF_DATA_AS_AT}) for education only and are not live quotes.
        Past performance is not indicative of future returns — always read the latest PDS before investing.
      </p>
    </Card>
  );
}

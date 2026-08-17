import { useId } from 'react';

export interface FanChartDataPoint {
  year: number | string;
  p10: number;
  p25: number;
  p50: number; // Median
  p75: number;
  p90: number;
}

interface MonteCarloFanChartProps {
  data: FanChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  currencyPrefix?: string;
}

export function MonteCarloFanChart({
  data,
  title = 'Monte Carlo Probability Fan Projection',
  subtitle = 'Projected wealth distributions across 10th, 25th, 50th (median), 75th, and 90th percentiles',
  height = 280,
  currencyPrefix = '$',
}: MonteCarloFanChartProps) {
  const chartId = useId().replace(/:/g, '');

  if (!data || data.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 30, bottom: 35, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Find max value
  const maxVal = Math.max(...data.map(d => d.p90)) * 1.05 || 100000;
  const minVal = 0;

  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Create area paths for p10-p90 band and p25-p75 band
  const top90 = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.p90)}`).join(' ');
  const bottom10 = [...data].reverse().map(d => `L ${getX(data.indexOf(d))} ${getY(d.p10)}`).join(' ');
  const outerBandPath = `${top90} ${bottom10} Z`;

  const top75 = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.p75)}`).join(' ');
  const bottom25 = [...data].reverse().map(d => `L ${getX(data.indexOf(d))} ${getY(d.p25)}`).join(' ');
  const innerBandPath = `${top75} ${bottom25} Z`;

  const medianLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.p50)}`).join(' ');

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => Math.round(maxVal * pct));

  return (
    <div className="w-full rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
      <div>
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          {title}
        </h4>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`gradOuter-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id={`gradInner-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map(tVal => {
            const y = getY(tVal);
            return (
              <g key={tVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {currencyPrefix}{tVal >= 1000000 ? `${(tVal / 1000000).toFixed(1)}M` : `${Math.round(tVal / 1000)}k`}
                </text>
              </g>
            );
          })}

          {/* Outer 10th-90th percentile ribbon */}
          <path d={outerBandPath} fill={`url(#gradOuter-${chartId})`} />

          {/* Inner 25th-75th percentile ribbon */}
          <path d={innerBandPath} fill={`url(#gradInner-${chartId})`} />

          {/* Median line (50th percentile) */}
          <path
            d={medianLine}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* X-axis labels */}
          {data.filter((_, idx) => idx % Math.ceil(data.length / 6) === 0 || idx === data.length - 1).map((d) => {
            const idx = data.indexOf(d);
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-mono"
              >
                Yr {d.year}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-primary/20 border border-primary/40 inline-block"></span>
          <span>10th–90th Percentile Range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-primary/50 inline-block"></span>
          <span>25th–75th Interquartile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-primary inline-block"></span>
          <span className="font-bold text-foreground">50th Percentile (Median)</span>
        </div>
      </div>
    </div>
  );
}

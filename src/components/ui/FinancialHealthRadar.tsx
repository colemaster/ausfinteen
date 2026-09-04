import { useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface RadarPillar {
  key: string;
  label: string;
  score: number; // 0 - 100
  benchmark: number; // 0 - 100
  weight?: number;
  unit?: string;
  description?: string;
}

export interface FinancialHealthRadarProps {
  pillars?: RadarPillar[];
  title?: string;
  userLabel?: string;
  benchmarkLabel?: string;
  size?: number;
  className?: string;
}

const DEFAULT_TEEN_PILLARS: RadarPillar[] = [
  { key: 'awards', label: 'Work & Award Rates', score: 85, benchmark: 60, description: 'Knowledge of Modern Awards, 3hr min shifts, and penalty rates.' },
  { key: 'banking', label: '5.0%+ HISA & Banking', score: 90, benchmark: 45, description: 'High-interest savings account with zero fees and APRA FCS guarantee.' },
  { key: 'tax', label: 'TFN & Tax Return', score: 80, benchmark: 50, description: 'Claiming $18,200 threshold, lodging myTax, and Medicare transfer at 15.' },
  { key: 'super', label: 'Super & Investing', score: 75, benchmark: 40, description: '12% SG super stapling, low-balance fee cap, and ETF compounding.' },
  { key: 'budget', label: '50/30/20 & Mojo', score: 88, benchmark: 55, description: 'Barefoot 3-bucket allocation, $500 Mojo buffer, and Pay Yourself First.' },
  { key: 'defense', label: 'Scam & Debt Immunity', score: 95, benchmark: 50, description: 'Zero BNPL traps, PayID verification, and money muling defense.' },
];

export function FinancialHealthRadar({
  pillars = DEFAULT_TEEN_PILLARS,
  title = '6-Pillar Teen Financial Health Benchmark',
  userLabel = 'Your Score',
  benchmarkLabel = 'AU 15yo Benchmark',
  size = 380,
  className,
}: FinancialHealthRadarProps) {
  const [activePillarKey, setActivePillarKey] = useState<string | null>(null);
  const tableId = useId();
  const gradientId = useId();
  const reducedMotion = useReducedMotion() ?? false;

  const center = size / 2;
  const radius = size * 0.36;
  const numPillars = pillars.length;
  const angleStep = (2 * Math.PI) / numPillars;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Helper to map score (0-100) & index to (x, y)
  const polarToCartesian = (index: number, score: number) => {
    const angle = index * angleStep - Math.PI / 2; // start from 12 o'clock
    const r = (Math.max(0, Math.min(100, score)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate SVG Polygon path string
  const generatePolygonPath = (scores: number[]) => {
    const points = scores.map((s, i) => {
      const { x, y } = polarToCartesian(i, s);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return `M ${points.join(' L ')} Z`;
  };

  const userPath = useMemo(
    () => generatePolygonPath(pillars.map((p) => p.score)),
    [pillars, radius]
  );
  const benchmarkPath = useMemo(
    () => generatePolygonPath(pillars.map((p) => p.benchmark)),
    [pillars, radius]
  );

  const activePillar = useMemo(
    () => pillars.find((p) => p.key === activePillarKey) ?? null,
    [pillars, activePillarKey]
  );

  return (
    <div
      className={cn(
        'relative flex flex-col items-center rounded-3xl border border-border bg-card/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl',
        className
      )}
    >
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">
            Multi-pillar financial independence benchmark for Australian young earners.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            <span className="text-foreground">{userLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 border-t-2 border-dashed border-amber-500" />
            <span className="text-muted-foreground">{benchmarkLabel}</span>
          </div>
        </div>
      </div>

      {/* Interactive Radar SVG */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${title}: Graph comparing your score to the benchmark across ${numPillars} pillars.`}
          aria-describedby={tableId}
          className="overflow-visible select-none max-w-full h-auto"
        >
          <defs>
            {/* OKLCH / Emerald Radial Glow */}
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Web Concentric Polygons */}
          {gridLevels.map((level, lvlIdx) => {
            const levelPoints = pillars.map((_, i) => {
              const { x, y } = polarToCartesian(i, level * 100);
              return `${x},${y}`;
            });
            return (
              <polygon
                key={lvlIdx}
                points={levelPoints.join(' ')}
                fill="none"
                stroke="currentColor"
                strokeDasharray={lvlIdx === gridLevels.length - 1 ? undefined : '3 3'}
                className="text-border/80 stroke-1"
              />
            );
          })}

          {/* Spoke Axes */}
          {pillars.map((_, i) => {
            const outer = polarToCartesian(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                className="text-border/60 stroke-1"
              />
            );
          })}

          {/* Benchmark Target Polygon */}
          <path
            d={benchmarkPath}
            fill="#f59e0b"
            fillOpacity="0.08"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5 4"
            className="transition-all duration-500"
          />

          {/* User Score Polygon (with spring morph animation) */}
          <motion.path
            d={userPath}
            fill={`url(#${gradientId})`}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={reducedMotion ? {} : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Interactive Vertex Nodes */}
          {pillars.map((p, i) => {
            const userPt = polarToCartesian(i, p.score);
            const benchPt = polarToCartesian(i, p.benchmark);
            const labelPt = polarToCartesian(i, 118);
            const isActive = activePillarKey === p.key;

            return (
              <g key={p.key} className="cursor-pointer group">
                {/* Benchmark Diamond */}
                <rect
                  x={benchPt.x - 3}
                  y={benchPt.y - 3}
                  width="6"
                  height="6"
                  transform={`rotate(45 ${benchPt.x} ${benchPt.y})`}
                  className="fill-amber-500 stroke-card stroke-2"
                />

                {/* User Vertex Circle with Keyboard Focus */}
                <circle
                  cx={userPt.x}
                  cy={userPt.y}
                  r={isActive ? 6.5 : 4.5}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: Score ${p.score} out of 100, Benchmark ${p.benchmark}`}
                  onMouseEnter={() => setActivePillarKey(p.key)}
                  onMouseLeave={() => setActivePillarKey(null)}
                  onFocus={() => setActivePillarKey(p.key)}
                  onBlur={() => setActivePillarKey(null)}
                  className={cn(
                    'fill-emerald-500 stroke-card stroke-2 transition-all duration-200 outline-none',
                    'focus-visible:ring-4 focus-visible:ring-emerald-500/50 group-hover:scale-125'
                  )}
                />

                {/* Pillar Axis Label */}
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor={labelPt.x > center + 10 ? 'start' : labelPt.x < center - 10 ? 'end' : 'middle'}
                  dominantBaseline="middle"
                  className={cn(
                    'text-[10px] sm:text-[11px] font-medium transition-colors select-none',
                    isActive ? 'fill-emerald-500 font-bold' : 'fill-muted-foreground'
                  )}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Active Node Floating Tooltip */}
        {activePillar && (
          <div
            className={cn(
              'absolute -bottom-2 pointer-events-none px-3.5 py-2 rounded-xl bg-card',
              'border border-emerald-500/40 shadow-2xl backdrop-blur-md text-xs space-y-1 z-20 animate-fade-in'
            )}
          >
            <div className="font-bold text-foreground">{activePillar.label}</div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-500 font-mono font-bold">
                Your Score: {activePillar.score}/100
              </span>
              <span className="text-amber-500 font-mono">
                Benchmark: {activePillar.benchmark}/100
              </span>
            </div>
            {activePillar.description && (
              <p className="text-[10px] text-muted-foreground">{activePillar.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Accessible HTML Table Fallback for Screen Readers */}
      <table id={tableId} className="sr-only">
        <caption>{title} data breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Financial Pillar</th>
            <th scope="col">{userLabel}</th>
            <th scope="col">{benchmarkLabel}</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {pillars.map((p) => (
            <tr key={p.key}>
              <th scope="row">{p.label}</th>
              <td>{p.score}</td>
              <td>{p.benchmark}</td>
              <td>{p.score >= p.benchmark ? 'Above Benchmark' : 'Below Benchmark'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

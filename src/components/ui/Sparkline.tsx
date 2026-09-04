import { useState, useRef, useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number;
  strokeColor?: string;
  fillGradient?: [string, string];
  strokeWidth?: number;
  showMinMax?: boolean;
  interactive?: boolean;
  className?: string;
  formatValue?: (v: number) => string;
}

/**
 * High-performance 2027 animated SVG Sparkline component
 * Generates smooth Catmull-Rom / cubic bezier curves with gradient fill,
 * interactive hover scrub, and min/max keypoint indicators.
 */
export function Sparkline({
  data,
  width = '100%',
  height = 44,
  strokeColor = 'var(--primary)',
  fillGradient,
  strokeWidth = 2,
  showMinMax = false,
  interactive = true,
  className,
  formatValue = v => `$${Math.round(v).toLocaleString()}`,
}: SparklineProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const innerHeight = Math.max(10, height - paddingY * 2);

  // Map points to 0..100 viewBox space
  const viewBoxWidth = 100;
  const stepX = viewBoxWidth / (data.length - 1);
  const points = data.map((val, idx) => {
    const x = idx * stepX;
    const y = paddingY + innerHeight - ((val - min) / range) * innerHeight;
    return { x, y, val };
  });

  // Construct smooth cubic bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Construct closed area path for fill gradient
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const minPoint = points.reduce((prev, curr) => (curr.val < prev.val ? curr : prev), points[0]);
  const maxPoint = points.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), points[0]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const closestIdx = Math.max(0, Math.min(data.length - 1, Math.round(relativeX * (data.length - 1))));
    setHoverIdx(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoverIdx(null);
  };

  const activePoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className={cn('relative inline-block select-none', className)} style={{ width }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        className="overflow-visible w-full h-auto"
        style={{ height }}
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id={`sparkline-fill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillGradient ? fillGradient[0] : strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={fillGradient ? fillGradient[1] : strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <motion.path
          d={areaD}
          fill={`url(#sparkline-fill-${gradientId})`}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Main curve stroke */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Min / Max indicators */}
        {showMinMax && (
          <>
            <circle cx={minPoint.x} cy={minPoint.y} r="2" fill="var(--danger)" className="animate-pulse" />
            <circle cx={maxPoint.x} cy={maxPoint.y} r="2" fill="var(--success)" className="animate-pulse" />
          </>
        )}

        {/* Interactive Scrub Cursor */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1="0"
              x2={activePoint.x}
              y2={height}
              stroke="currentColor"
              strokeDasharray="2 2"
              strokeWidth="0.75"
              className="text-muted-foreground/60"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3.5"
              fill={strokeColor}
              stroke="var(--card)"
              strokeWidth="1.5"
              className="drop-shadow-sm"
            />
          </g>
        )}
      </svg>

      {/* Floating Hover Tooltip */}
      {activePoint && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-bold font-mono shadow-md pointer-events-none whitespace-nowrap z-20 animate-fade-in"
          style={{ left: `${(activePoint.x / viewBoxWidth) * 100}%` }}
        >
          {formatValue(activePoint.val)}
        </div>
      )}
    </div>
  );
}

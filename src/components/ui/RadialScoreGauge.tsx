import { useId } from 'react';
import { cn } from '@/lib/utils';

interface RadialScoreGaugeProps {
  score: number; // 0 to 100
  label?: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  colorGradient?: [string, string];
  className?: string;
}

export function RadialScoreGauge({
  score,
  label = 'Financial Score',
  sublabel = 'Top 10% Aussie Teen',
  size = 180,
  strokeWidth = 14,
  colorGradient = ['#3b82f6', '#10b981'],
  className,
}: RadialScoreGaugeProps) {
  const gradientId = useId();
  const filterId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference * 0.75; // 270 degree arc

  return (
    <div
      role="meter"
      aria-valuenow={normalizedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${normalizedScore} out of 100`}
      className={cn('relative flex flex-col items-center justify-center select-none', className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-135 transform overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradient[0]} />
              <stop offset="100%" stopColor={colorGradient[1]} />
            </linearGradient>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={colorGradient[1]} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background Arc Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            className="text-muted/30"
          />

          {/* Score arc — CSS transition instead of an animation runtime. */}
          <circle
            className="celebration-arc"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
        </svg>

        {/* Center Content readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="animate-scale-in text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
            {normalizedScore}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {label && (
        <div className="mt-2 text-center">
          <div className="text-xs font-extrabold text-foreground">{label}</div>
          {sublabel && <div className="text-[11px] text-muted-foreground">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}

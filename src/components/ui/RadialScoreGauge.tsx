import { motion, useReducedMotion } from 'motion/react';
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
  const reducedMotion = useReducedMotion() ?? false;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference * 0.75; // 270 degree arc

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-135 transform"
        >
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradient[0]} />
              <stop offset="100%" stopColor={colorGradient[1]} />
            </linearGradient>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colorGradient[1]} floodOpacity="0.6" />
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
            className="text-muted/40"
          />

          {/* Animated Glowing Score Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={reducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter="url(#gauge-glow)"
          />
        </svg>

        {/* Center Content readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground"
          >
            {normalizedScore}
          </motion.span>
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

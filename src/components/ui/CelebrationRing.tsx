import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CelebrationRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorTheme?: 'primary' | 'emerald' | 'amber' | 'violet' | 'cyan';
  autoConfetti?: boolean;
  className?: string;
}

const THEME_GRADIENTS: Record<string, [string, string]> = {
  primary: ['var(--primary)', 'var(--success)'],
  emerald: ['#10b981', '#059669'],
  amber: ['#f59e0b', '#d97706'],
  violet: ['#8b5cf6', '#6d28d9'],
  cyan: ['#06b6d4', '#0891b2'],
};

export function CelebrationRing({
  progress,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  colorTheme = 'primary',
  autoConfetti = true,
  className,
}: CelebrationRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevProgressRef = useRef(progress);
  const reducedMotion = useReducedMotion() ?? false;

  const normalized = Math.min(100, Math.max(0, Math.round(progress)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;
  const isComplete = normalized >= 100;

  useEffect(() => {
    if (isComplete && prevProgressRef.current < 100 && autoConfetti && !reducedMotion && containerRef.current) {
      sound.playGoalCelebration();
      const rect = containerRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x: originX, y: originY },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
        disableForReducedMotion: true,
      });
    }
    prevProgressRef.current = normalized;
  }, [normalized, isComplete, autoConfetti, reducedMotion]);

  const [color1, color2] = THEME_GRADIENTS[colorTheme] || THEME_GRADIENTS.primary;
  const gradientId = `celebration-ring-grad-${colorTheme}-${size}`;

  return (
    <div ref={containerRef} className={cn('relative flex flex-col items-center justify-center select-none', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
            <filter id={`ring-glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40"
          />

          {/* Animated active progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={reducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter={isComplete ? `url(#ring-glow-${gradientId})` : undefined}
          />
        </svg>

        {/* Center label & percentage / check icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-6 h-6 stroke-[3]" />
            </motion.div>
          ) : (
            <>
              <motion.span
                key={normalized}
                initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground"
              >
                {normalized}%
              </motion.span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Progress
              </span>
            </>
          )}
        </div>
      </div>

      {(label || sublabel) && (
        <div className="mt-3 text-center">
          {label && <div className="text-xs font-bold text-foreground">{label}</div>}
          {sublabel && <div className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}

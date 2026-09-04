import React, { useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'motion/react';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

export interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  colors?: string[];
  particleCount?: number;
  playAudio?: boolean;
}

const VARIANT_CLASSES = {
  default: 'bg-card text-foreground border border-border hover:bg-muted/80 shadow-xs',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20',
  outline: 'border border-primary text-primary hover:bg-primary/10',
  ghost: 'hover:bg-muted text-foreground',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 font-bold',
};

export function ConfettiButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
  particleCount = 50,
  playAudio = true,
  onClick,
  ...props
}: ConfettiButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playAudio) {
      sound.playSuccess();
    }

    if (!reducedMotion && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount,
        spread: 60,
        origin: { x: originX, y: originY },
        colors,
        disableForReducedMotion: true,
      });
    }

    onClick?.(e);
  };

  return (
    <motion.button
      ref={btnRef}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      whileTap={reducedMotion ? {} : { scale: 0.96 }}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary cursor-pointer select-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

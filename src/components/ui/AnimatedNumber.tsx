import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useTransform, motion } from 'motion/react';
import { cn } from '@/lib/utils';
export interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'number';
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = 'number',
  duration = 1000,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  const display = useTransform(springValue, (current) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }).format(current);
    }
    if (format === 'percent') {
      return new Intl.NumberFormat('en-AU', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(current / 100);
    }
    return new Intl.NumberFormat('en-AU').format(current);
  });

  return <motion.span ref={ref} className={cn("", className)}>{display}</motion.span>;
}


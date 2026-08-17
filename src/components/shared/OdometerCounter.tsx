import { useEffect, useRef, useState } from 'react';

interface OdometerCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  durationMs?: number;
}

export function OdometerCounter({
  value,
  prefix = '$',
  suffix = '',
  decimals = 0,
  className = '',
  durationMs = 600,
}: OdometerCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startValRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValRef.current + (value - startValRef.current) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, durationMs]);

  const formatted = displayValue.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums font-mono font-bold tracking-tight inline-flex items-baseline ${className}`}>
      {prefix && <span className="opacity-80 mr-0.5">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="opacity-80 ml-0.5">{suffix}</span>}
    </span>
  );
}

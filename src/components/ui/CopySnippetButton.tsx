import { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

export interface CopySnippetButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  showConfetti?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopySnippetButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  showConfetti = false,
  className,
  size = 'sm',
}: CopySnippetButtonProps) {
  const [copied, setCopied] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      sound.playClick();
      setCopied(true);

      if (showConfetti && !reducedMotion && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 30,
          spread: 45,
          origin: { x: originX, y: originY },
          colors: ['#10b981', '#3b82f6', '#8b5cf6'],
          disableForReducedMotion: true,
        });
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-all cursor-pointer select-none rounded-xl border active:scale-[0.96]',
        copied
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
          : 'bg-card border-border hover:bg-muted text-foreground hover:border-primary/40',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        className
      )}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <span key="check" className="animate-pop-in flex items-center gap-1">
          <Check className={cn('shrink-0 text-emerald-500', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          <span>{copiedLabel}</span>
        </span>
      ) : (
        <span key="copy" className="animate-pop-in flex items-center gap-1">
          <Copy className={cn('shrink-0 text-muted-foreground', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          <span>{label}</span>
        </span>
      )}
    </button>
  );
}

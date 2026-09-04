import { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  const reducedMotion = useReducedMotion() ?? false;

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
    <motion.button
      ref={btnRef}
      type="button"
      onClick={handleCopy}
      whileTap={reducedMotion ? {} : { scale: 0.92 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-all cursor-pointer select-none rounded-xl border',
        copied
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
          : 'bg-card border-border hover:bg-muted text-foreground hover:border-primary/40',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        className
      )}
      aria-label={copied ? copiedLabel : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-1"
          >
            <Check className={cn('shrink-0 text-emerald-500', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            <span>{copiedLabel}</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Copy className={cn('shrink-0 text-muted-foreground', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

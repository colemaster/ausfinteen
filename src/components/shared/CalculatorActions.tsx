import React, { useState } from 'react';
import { RotateCcw, Copy, Check } from 'lucide-react';
import { toast } from '@/lib/toast';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

export interface CalculatorActionsProps {
  onReset?: () => void;
  getSummaryText?: () => string;
  summaryText?: string;
  summaryTitle?: string;
  className?: string;
  extraActions?: React.ReactNode;
}

export const CalculatorActions: React.FC<CalculatorActionsProps> = React.memo(
  function CalculatorActions({
    onReset,
    getSummaryText,
    summaryText,
    summaryTitle = 'Calculation Summary',
    className,
    extraActions,
  }) {
    const [copied, setCopied] = useState(false);

    const handleReset = () => {
      if (onReset) {
        onReset();
        sound.playClick();
        toast.info('Reset calculator to default values');
      }
    };

    const handleCopy = async () => {
      const textToCopy = getSummaryText ? getSummaryText() : summaryText;
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        sound.playClick();
        setCopied(true);
        toast.success(`${summaryTitle} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    };

    const hasCopy = Boolean(getSummaryText || summaryText);

    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/50 text-xs text-muted-foreground',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={handleReset}
              className="tactile-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all duration-150 cursor-pointer text-xs font-semibold shadow-xs hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
              title="Reset parameters to Australian defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset to Defaults</span>
            </button>
          )}

          {hasCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'tactile-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer text-xs font-semibold shadow-xs focus-visible:ring-2 focus-visible:ring-ring',
                copied
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-border bg-card hover:bg-muted text-foreground hover:border-primary/40'
              )}
              title="Copy calculation summary to clipboard"
            >
              {copied ? (
                <span key="check" className="animate-pop-in flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </span>
              ) : (
                <span key="copy" className="animate-pop-in flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Copy Summary</span>
                </span>
              )}
            </button>
          )}
        </div>

        {extraActions && (
          <div className="flex items-center gap-2">
            {extraActions}
          </div>
        )}
      </div>
    );
  }
);

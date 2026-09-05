import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface InfoTooltipProps {
  content?: React.ReactNode;
  title?: string;
  term?: string;
  icon?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

const GLOSSARY_TERMS: Record<string, { title: string; content: string }> = {
  hecs: {
    title: 'HECS-HELP Debt & Indexation',
    content: 'Higher Education Loan Program debt is indexed annually on 1 June by the lower of CPI or the Wage Price Index (WPI). Compulsory repayments are deducted via PAYG when your income exceeds the minimum threshold.',
  },
  sg: {
    title: 'Superannuation Guarantee (12.0%)',
    content: 'The statutory minimum percentage of ordinary time earnings your employer must contribute to your superannuation fund. In FY25-26 and FY26-27, the SG rate is 12.0%.',
  },
  cgt: {
    title: '50% CGT Discount',
    content: 'Australian resident individuals holding a capital asset for 12 months or longer receive a 50% discount on the gross capital gain before applying their marginal tax rate.',
  },
  ppsr: {
    title: 'PPSR Check ($2.00)',
    content: 'The Personal Property Securities Register is the official Australian Government register to check if a second-hand vehicle has outstanding finance, is written-off, or has been reported stolen.',
  },
  lvr: {
    title: 'Loan-to-Value Ratio (LVR)',
    content: 'The loan amount as a percentage of property value. Borrowing over 80% LVR typically requires Lenders Mortgage Insurance (LMI) unless eligible for First Home Guarantee schemes.',
  },
  concessional: {
    title: 'Concessional Super Cap',
    content: 'Pre-tax contributions (employer SG, salary sacrifice, personal deductible) taxed at 15% in the fund. Any unused cap can be carried forward for up to 5 years if your total super balance is under $500,000.',
  },
  hisa: {
    title: 'High Interest Savings Account (HISA)',
    content: 'An Australian savings account offering bonus interest rates (typically 5.0%+) when meeting monthly conditions such as minimum deposit and debit card transactions. Covered up to $250k by the APRA FCS guarantee.',
  },
  medicare: {
    title: 'Medicare Levy & Surcharge (MLS)',
    content: 'The standard Medicare Levy is 2.0% of taxable income. An additional MLS of 1.0%–1.5% applies to higher earners without eligible hospital cover with an Australian registered health insurer.',
  },
};

export function InfoTooltip({
  content,
  title,
  term,
  icon = 'help',
  side = 'top',
  className,
  children,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipId = React.useId();

  const glossaryItem = term ? GLOSSARY_TERMS[term.toLowerCase()] : null;
  const activeTitle = title || glossaryItem?.title;
  const activeContent = content || glossaryItem?.content;

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const IconComponent = icon === 'info' ? Info : HelpCircle;

  const sideClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div ref={containerRef} className={cn('relative inline-flex items-center', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children || (
          <IconComponent className="h-3.5 w-3.5 transition-transform hover:scale-110" aria-hidden="true" />
        )}
        <span className="sr-only">{activeTitle || 'More information'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? 4 : side === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 w-64 sm:w-72 rounded-xl border border-border/80 bg-popover/95 p-3 text-left shadow-xl backdrop-blur-md pointer-events-auto',
              sideClasses[side]
            )}
          >
            <div className="flex items-start justify-between gap-2">
              {activeTitle && (
                <div className="text-xs font-bold text-popover-foreground mb-1">
                  {activeTitle}
                </div>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground -mt-0.5 -mr-0.5 p-0.5 rounded-md focus-visible:ring-1 focus-visible:ring-ring sm:hidden"
                aria-label="Close tooltip"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {activeContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

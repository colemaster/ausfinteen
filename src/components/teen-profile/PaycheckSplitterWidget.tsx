import { motion } from 'motion/react';
import { Shield, Sparkles, Wallet, PiggyBank, Receipt } from 'lucide-react';

interface PaycheckSplitterWidgetProps {
  grossWeekly: number;
  taxWeekly: number;
  superWeekly: number;
  netWeekly: number;
  savingsTarget: number;
  currentSavings: number;
  goalName: string;
}

export function PaycheckSplitterWidget({
  grossWeekly,
  taxWeekly,
  superWeekly,
  netWeekly,
  savingsTarget,
  currentSavings,
  goalName,
}: PaycheckSplitterWidgetProps) {
  const taxPct = grossWeekly > 0 ? (taxWeekly / grossWeekly) * 100 : 0;
  const superPct = grossWeekly > 0 ? (superWeekly / grossWeekly) * 100 : 0;
  const netPct = grossWeekly > 0 ? (netWeekly / grossWeekly) * 100 : 100;

  const goalRatio = savingsTarget > 0 ? Math.min(100, (currentSavings / savingsTarget) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/90 backdrop-blur-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Paycheck Allocator</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">Weekly Paycheck Stream Breakdown</h3>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-muted-foreground block">Gross Weekly Pay</span>
          <span className="text-2xl font-black text-primary">${grossWeekly.toFixed(2)}/wk</span>
        </div>
      </div>

      {/* Multi-Segment Motion 13 Animated Progress Bar */}
      <div className="space-y-2">
        <div className="h-6 w-full rounded-xl bg-muted/50 overflow-hidden flex p-1 gap-1 border border-border">
          {/* Net Take-Home (Green Glow) */}
          <motion.div
            className="h-full rounded-lg bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] flex items-center justify-center text-[10px] font-extrabold text-emerald-950"
            initial={{ width: 0 }}
            animate={{ width: `${netPct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            {netPct > 15 && `Take-Home (${netPct.toFixed(0)}%)`}
          </motion.div>

          {/* Tax Withheld (Amber Glow) */}
          {taxWeekly > 0 && (
            <motion.div
              className="h-full rounded-lg bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center text-[10px] font-extrabold text-amber-950"
              initial={{ width: 0 }}
              animate={{ width: `${taxPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              {taxPct > 8 && `Tax`}
            </motion.div>
          )}

          {/* Super Guarantee (Cyan Glow) */}
          {superWeekly > 0 && (
            <motion.div
              className="h-full rounded-lg bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)] flex items-center justify-center text-[10px] font-extrabold text-cyan-950"
              initial={{ width: 0 }}
              animate={{ width: `${superPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              {superPct > 8 && `Super`}
            </motion.div>
          )}
        </div>

        {/* Legend Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <Wallet className="w-3.5 h-3.5" /> Take-Home
            </div>
            <span className="font-mono text-lg font-bold text-foreground">${netWeekly.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
              <Receipt className="w-3.5 h-3.5" /> ATO Tax
            </div>
            <span className="font-mono text-lg font-bold text-foreground">${taxWeekly.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-bold mb-1">
              <Shield className="w-3.5 h-3.5" /> 12% Super
            </div>
            <span className="font-mono text-lg font-bold text-foreground">${superWeekly.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
              <PiggyBank className="w-3.5 h-3.5" /> Goal: {goalName}
            </div>
            <span className="font-mono text-lg font-bold text-foreground">{goalRatio.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

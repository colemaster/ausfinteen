import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PenaltyShiftCalculatorWidget() {
  const [baseRate, setBaseRate] = useState(22.5);
  const [hours, setHours] = useState(6);
  const [shiftType, setShiftType] = useState<'weekday' | 'saturday' | 'sunday' | 'public_holiday'>('saturday');

  const MULTIPLIERS: Record<typeof shiftType, { label: string; rate: number; badge: string; color: string }> = {
    weekday: { label: 'Standard Weekday', rate: 1.0, badge: '100% Base Rate', color: 'text-foreground bg-muted' },
    saturday: { label: 'Saturday Penalty', rate: 1.25, badge: '+25% Penalty', color: 'text-sky-600 bg-sky-500/10 border-sky-500/30' },
    sunday: { label: 'Sunday Penalty', rate: 1.5, badge: '+50% Penalty', color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
    public_holiday: { label: 'Public Holiday', rate: 2.25, badge: '+125% Double Time & a Half', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
  };

  const currentShift = MULTIPLIERS[shiftType];
  const effectiveRate = baseRate * currentShift.rate;
  const totalShiftPay = effectiveRate * hours;
  const bonusEarned = totalShiftPay - baseRate * hours;

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>2030 Penalty Rate Shift Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">Junior Award Penalty Rate Calculator</h3>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-muted-foreground block">Total Shift Earnings</span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalShiftPay.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shift Type Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Select Shift Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(MULTIPLIERS) as Array<typeof shiftType>).map(type => {
            const m = MULTIPLIERS[type];
            const isSelected = shiftType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setShiftType(type)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all relative overflow-hidden',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-md'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeShiftPill"
                    className="absolute inset-0 bg-primary/10 border border-primary/40 rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
                <div className="relative z-10 text-xs font-extrabold">{m.label}</div>
                <div className="relative z-10 text-[10px] text-muted-foreground mt-0.5">{m.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground">Base Hourly Rate</span>
            <span className="font-mono text-foreground">${baseRate.toFixed(2)}/hr</span>
          </div>
          <input
            type="range"
            min="15"
            max="40"
            step="0.5"
            value={baseRate}
            onChange={e => setBaseRate(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground">Shift Duration</span>
            <span className="font-mono text-foreground">{hours} Hours</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Breakdown Callout Card */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>
            Effective Rate: <strong className="font-mono text-foreground">${effectiveRate.toFixed(2)}/hr</strong> ({hours}h shift)
          </span>
        </div>
        {bonusEarned > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>+${bonusEarned.toFixed(2)} Extra Penalty Bonus Earned!</span>
          </div>
        )}
      </div>
    </div>
  );
}

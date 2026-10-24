import { useState } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { sound } from '@/lib/sound-synthesizer';

type ShiftType = 'weekday' | 'weekday_night' | 'saturday' | 'sunday' | 'sunday_casual' | 'public_holiday';

interface ShiftConfig {
  label: string;
  shortLabel: string;
  multiplier: number;
  badge: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const SHIFT_TYPES: Record<ShiftType, ShiftConfig> = {
  weekday: {
    label: 'Standard Weekday Day',
    shortLabel: 'Weekday Day',
    multiplier: 1.0,
    badge: '100% Base Rate',
    description: 'Day shifts between 7:00am and 6:00pm Monday to Friday.',
    colorClass: 'text-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-border',
  },
  weekday_night: {
    label: 'Weekday Evening / Night',
    shortLabel: 'Night Shift',
    multiplier: 1.15,
    badge: '+15% Night Loading',
    description: 'Shifts finishing after 6:00pm or working past 10:00pm (Retail/Fast Food Award).',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
  },
  saturday: {
    label: 'Saturday Ordinary Shift',
    shortLabel: 'Saturday',
    multiplier: 1.25,
    badge: '+25% Saturday Penalty',
    description: 'All Saturday rostered work under Modern Awards.',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
  },
  sunday: {
    label: 'Sunday Penalty (Standard)',
    shortLabel: 'Sunday',
    multiplier: 1.5,
    badge: '+50% Sunday Rate',
    description: 'Permanent/Standard Sunday rate (Time and a half).',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  sunday_casual: {
    label: 'Sunday Casual (Fast Food & Retail)',
    shortLabel: 'Sunday Casual',
    multiplier: 1.75,
    badge: '+75% Double-Dip Casual',
    description: 'Casual Sunday penalty in Fast Food Award (25% casual loading + 50% Sunday penalty).',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
  },
  public_holiday: {
    label: 'Public Holiday (Double Time & a Half)',
    shortLabel: 'Public Holiday',
    multiplier: 2.25,
    badge: '+125% Double Time & a Half',
    description: 'Australia Day, Good Friday, Easter, Anzac Day, King’s Bday, Christmas, Boxing Day.',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
  },
};

const AWARD_AGE_PRESETS = [
  { label: '15yo Casual', rate: 13.90, desc: '$11.12 base + 25%' },
  { label: '16yo Casual', rate: 16.68, desc: '$13.34 base + 25%' },
  { label: '17yo Casual', rate: 19.46, desc: '$15.56 base + 25%' },
  { label: '18yo Casual', rate: 22.23, desc: '$17.78 base + 25%' },
  { label: '21+ Adult Casual', rate: 31.21, desc: '$24.97 base + 25%' },
];

const QUICK_DURATION_PRESETS = [
  { label: '3h After School', hours: 3 },
  { label: '4.5h Evening', hours: 4.5 },
  { label: '6h Weekend', hours: 6 },
  { label: '7.6h Full Shift', hours: 7.6 },
  { label: '9h Long Shift', hours: 9 },
];

export function PenaltyShiftCalculatorWidget() {
  const [baseRate, setBaseRate] = useState<number>(19.46);
  const [hours, setHours] = useState<number>(6);
  const [shiftType, setShiftType] = useState<ShiftType>('saturday');

  const currentShift = SHIFT_TYPES[shiftType];
  const effectiveRate = baseRate * currentShift.multiplier;
  const totalShiftPay = effectiveRate * hours;
  const standardShiftPay = baseRate * hours;
  const penaltyBonusEarned = Math.max(0, totalShiftPay - standardShiftPay);
  const penaltyPercentIncrease = ((currentShift.multiplier - 1.0) * 100);

  // Superannuation 12% (from 1 July 2026 SG rate)
  const superEarned = totalShiftPay * 0.12;

  const handleShiftSelect = (type: ShiftType) => {
    sound.playClick();
    setShiftType(type);
  };

  const handlePresetRate = (rate: number) => {
    sound.playClick();
    setBaseRate(rate);
  };

  const handlePresetHours = (h: number) => {
    sound.playClick();
    setHours(h);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>2026 Fair Work Award Penalty Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">Junior Award Penalty Rate & Shift Calculator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modern Award multipliers for weekends, night shifts, and public holidays with live comparisons vs ordinary weekday pay.
          </p>
        </div>
        <div className="text-right font-mono bg-muted/30 p-3 rounded-2xl border border-border">
          <span className="text-[11px] text-muted-foreground block">Total Shift Gross Pay</span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalShiftPay.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            +${superEarned.toFixed(2)} Super (12% SG)
          </span>
        </div>
      </div>

      {/* Quick Load Award Age Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Quick-Load Legal Award Wage Rates:
        </label>
        <div className="flex flex-wrap gap-2">
          {AWARD_AGE_PRESETS.map(p => {
            const isMatch = Math.abs(baseRate - p.rate) < 0.05;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePresetRate(p.rate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isMatch
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                <span>{p.label}</span>
                <span className="opacity-75 font-mono ml-1.5">${p.rate.toFixed(2)}/h</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shift Type Pills Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          Select Shift Roster Type:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(SHIFT_TYPES) as ShiftType[]).map(type => {
            const m = SHIFT_TYPES[type];
            const isSelected = shiftType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleShiftSelect(type)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all relative overflow-hidden',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-md ring-1 ring-primary/40'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                )}
              >
                <div className="relative z-10 text-xs font-extrabold truncate">{m.shortLabel}</div>
                <div className="relative z-10 text-[10px] text-muted-foreground mt-0.5 font-mono">{m.badge}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          💡 {currentShift.description}
        </p>
      </div>

      {/* Input Sliders & Quick Duration Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
        {/* Base Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Base Hourly Rate
            </span>
            <span className="font-mono text-foreground text-sm font-black">${baseRate.toFixed(2)}/hr</span>
          </div>
          <input
            type="range"
            min="12"
            max="45"
            step="0.25"
            value={baseRate}
            onChange={e => setBaseRate(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>$12.00 (Junior)</span>
            <span>$25.00 (Standard)</span>
            <span>$45.00 (Senior)</span>
          </div>
        </div>

        {/* Shift Duration Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Shift Duration
            </span>
            <span className="font-mono text-foreground text-sm font-black">{hours} Hours</span>
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
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_DURATION_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetHours(preset.hours)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                  hours === preset.hours
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Cards: Baseline vs Penalty Shift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Card 1: Standard Weekday Baseline */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Standard Weekday Baseline
            </span>
            <Badge variant="outline" className="text-[10px]">1.0x Rate</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            ${standardShiftPay.toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {hours} hours at baseline rate of ${baseRate.toFixed(2)}/hr with zero penalty loading.
          </p>
        </div>

        {/* Card 2: This Penalty Shift with Live Dollar Difference */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border-2 border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> {currentShift.shortLabel} Earnings
            </span>
            <Badge variant="success" className="text-[10px]">
              {currentShift.multiplier}x Multiplier
            </Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ${totalShiftPay.toFixed(2)}
            </div>
            {penaltyBonusEarned > 0 && (
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                +${penaltyBonusEarned.toFixed(2)} (+{penaltyPercentIncrease.toFixed(0)}%)
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Effective pay rate jumps to <strong className="text-foreground font-mono">${effectiveRate.toFixed(2)}/hr</strong> for all {hours} hours worked.
          </p>
        </div>
      </div>

      {/* Live Dollar Breakdown Detail Strip */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>
              Shift Breakdown: <strong className="font-mono text-foreground">${standardShiftPay.toFixed(2)} Base</strong>
              {penaltyBonusEarned > 0 && (
                <> + <strong className="font-mono text-emerald-600 dark:text-emerald-400">${penaltyBonusEarned.toFixed(2)} Penalty Bonus</strong></>
              )}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            🛡️ Under Australian tax rules, if you earn under $350/week, your employer withholds <strong>$0 PAYG tax</strong>, so 100% lands in your bank account!
          </p>
        </div>

        {penaltyBonusEarned > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>+${penaltyBonusEarned.toFixed(2)} Extra in Your Pocket!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[11px] shrink-0">
            <span>Standard ordinary hours</span>
          </div>
        )}
      </div>
    </div>
  );
}

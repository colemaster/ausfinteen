import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAgePreset, type AgePreset } from '@/data/teen-age-presets';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldCheck,
  Scale,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Zap,
  Briefcase,
  GraduationCap,
  Car,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';

interface AgeBlueprintSectionProps {
  age: number;
}

export function AgeBlueprintSection({ age }: AgeBlueprintSectionProps) {
  const preset: AgePreset = getAgePreset(age);
  const storageKey = `pft_age_checklist_${preset.age}`;

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      } else {
        setCompletedTasks([]);
      }
    } catch {
      setCompletedTasks([]);
    }
  }, [storageKey]);

  const toggleTask = (taskTitle: string) => {
    sound.playClick();
    const next = completedTasks.includes(taskTitle)
      ? completedTasks.filter(t => t !== taskTitle)
      : [...completedTasks, taskTitle];
    setCompletedTasks(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const resetChecklist = () => {
    sound.playClick();
    setCompletedTasks([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const getAgeIcon = (a: number) => {
    if (a <= 14) return Zap;
    if (a === 15) return Briefcase;
    if (a === 16) return Car;
    if (a === 17) return Scale;
    if (a === 18) return GraduationCap;
    return TrendingUp;
  };

  const AgeIcon = getAgeIcon(preset.age);

  return (
    <div className="space-y-6 animate-fade-in" aria-label={`Age ${preset.age} Financial Blueprint`}>
      {/* Blueprint Header */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <AgeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] font-extrabold uppercase tracking-wider">
                  Age {preset.age} Blueprint
                </Badge>
                <span className="text-xs text-muted-foreground font-semibold">
                  {preset.stageName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                {preset.label}: {preset.jobTitle}
              </h2>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs font-semibold text-muted-foreground">Junior Award Rate</div>
            <div className="text-xl font-extrabold text-primary">
              ${preset.hourlyRate.toFixed(2)}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed max-w-4xl">
          {preset.stageDescription}
        </p>

        {/* 3 Core Legal / Tax / Super Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-500" />
              Employment & Hours
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {preset.legalRightsSummary}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Superannuation Rule
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {preset.superRuleExplanation}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tax & Threshold
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {preset.taxExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Typical Weekly Cashflow Breakdown */}
      <Card className="p-6 sm:p-8 space-y-5 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
              Real-World Weekly Cashflow Model ({preset.hoursPerWeek}h/wk)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Typical Australian teen cashflow for age {preset.age} based on 2026-27 award wages and living expenses.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30 w-fit">
            ${preset.typicalBudget.estimatedWeeklySurplus.toFixed(2)}/wk Potential Surplus
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Weekly Gross Pay</span>
            <div className="text-lg font-extrabold text-foreground mt-0.5">
              ${preset.typicalBudget.grossIncome.toFixed(2)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {preset.hoursPerWeek} hrs @ ${preset.hourlyRate.toFixed(2)}/hr
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Estimated PAYG Tax</span>
            <div className="text-lg font-extrabold text-foreground mt-0.5">
              ${preset.typicalBudget.estimatedTax.toFixed(2)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {preset.typicalBudget.estimatedTax === 0 ? 'Tax-free threshold claimed' : 'PAYG withheld'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-left">
            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Estimated Expenses</span>
            <div className="text-lg font-extrabold text-foreground mt-0.5">
              ${preset.typicalBudget.totalEstimatedExpenses.toFixed(2)}
            </div>
            <span className="text-[10px] text-muted-foreground">Transport, food & phone</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Weekly Surplus</span>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              +${preset.typicalBudget.estimatedWeeklySurplus.toFixed(2)}
            </div>
            <span className="text-[10px] text-muted-foreground">Into savings / investing</span>
          </div>
        </div>

        {/* Expense breakdown pill list */}
        <div className="pt-2 border-t border-border/60">
          <span className="text-xs font-bold text-foreground block mb-2">Estimated Weekly Expense Breakdown:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Transport</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.transport.toFixed(2)}/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Phone & Tech</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.phoneAndTech.toFixed(2)}/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Food & Social</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.foodAndSocial.toFixed(2)}/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Personal / Gym</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.personalAndClothing.toFixed(2)}/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Car / Board</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.carOrBoard.toFixed(2)}/wk</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-[10px] text-muted-foreground">Study / Supplies</div>
              <div className="font-bold text-foreground">${preset.typicalBudget.typicalExpenses.studyOrWorkSupplies.toFixed(2)}/wk</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Age Milestones Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Key Milestones for Age {preset.age}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {preset.milestones.length} Strategic Goals
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {preset.milestones.map((m, idx) => (
            <Card key={idx} className="p-4.5 border-border hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-extrabold uppercase tracking-wider text-primary border-primary/30">
                    {m.badge}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{m.category}</span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1.5">{m.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Checklist & Warning Flags Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Checklist */}
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Age {preset.age} Action Checklist
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedTasks.length} of {preset.checklist.length} actions completed
              </p>
            </div>
            {completedTasks.length > 0 && (
              <button
                type="button"
                onClick={resetChecklist}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Reset completed tasks"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {preset.checklist.map((item, idx) => {
              const isDone = completedTasks.includes(item.task);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleTask(item.task)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-muted/30 hover:bg-muted/50 border-border'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.task}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Warning Flags & Traps */}
        <Card className="p-6 border-border space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Watch Out: Age {preset.age} Warning Flags & Traps
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Crucial Australian legal, tax, and debt traps specific to your age bracket.
            </p>
          </div>

          <div className="space-y-3">
            {preset.warningFlags.map((flag, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  flag.severity === 'high'
                    ? 'bg-red-500/10 border-red-500/25'
                    : flag.severity === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/25'
                    : 'bg-blue-500/10 border-blue-500/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${
                      flag.severity === 'high' ? 'text-red-500' : flag.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    {flag.title}
                  </span>
                  <Badge
                    variant={flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'}
                    className="text-[9px] uppercase tracking-wider font-extrabold"
                  >
                    {flag.severity}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {flag.warning}
                </p>
                <div className="p-2 rounded-xl bg-background/60 border border-border/60 text-[11px] text-foreground/90 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Fix:</strong> {flag.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

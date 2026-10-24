import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FIFTEEN_YO_ROADMAP_MILESTONES, OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Compass,
  RotateCcw,
  CheckCheck,
  Filter,
  Trophy,
} from 'lucide-react';
import { CelebrationRing } from '@/components/ui/CelebrationRing';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pft_15yo_roadmap';

export function FifteenYearOldRoadmap() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'todo' | 'completed'>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToStorage = (steps: number[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    } catch {
      // ignore
    }
  };

  const toggleStep = (stepNumber: number) => {
    const isNowCompleted = !completedSteps.includes(stepNumber);
    const next = isNowCompleted
      ? [...completedSteps, stepNumber]
      : completedSteps.filter(s => s !== stepNumber);

    setCompletedSteps(next);
    saveToStorage(next);

    if (isNowCompleted) {
      sound.playClick();
      if (next.length === FIFTEEN_YO_ROADMAP_MILESTONES.length) {
        sound.playGoalCelebration();
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.35 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
            disableForReducedMotion: true,
          });
        } catch {}
      }
    }
  };

  const handleMarkAll = () => {
    sound.playGoalCelebration();
    const all = FIFTEEN_YO_ROADMAP_MILESTONES.map(m => m.step);
    setCompletedSteps(all);
    saveToStorage(all);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      });
    } catch {}
  };

  const handleReset = () => {
    sound.playClick();
    setCompletedSteps([]);
    saveToStorage([]);
  };

  const totalSteps = FIFTEEN_YO_ROADMAP_MILESTONES.length;
  const countCompleted = completedSteps.length;
  const progressPercent = Math.round((countCompleted / totalSteps) * 100);

  const stageLabel = useMemo(() => {
    if (countCompleted === 0) return 'Get Started: TFN & Bank Account';
    if (countCompleted <= 2) return 'Stage 1: Identity & High-Interest Banking';
    if (countCompleted <= 5) return 'Stage 2: First Job, TFN & 3-Bucket Paycheck';
    if (countCompleted < totalSteps) return 'Stage 3: Driving Logbook & Student Perks';
    return '100% Financial Independence Champion! 🏆';
  }, [countCompleted, totalSteps]);

  const filteredMilestones = useMemo(() => {
    if (filterMode === 'todo') {
      return FIFTEEN_YO_ROADMAP_MILESTONES.filter(m => !completedSteps.includes(m.step));
    }
    if (filterMode === 'completed') {
      return FIFTEEN_YO_ROADMAP_MILESTONES.filter(m => completedSteps.includes(m.step));
    }
    return FIFTEEN_YO_ROADMAP_MILESTONES;
  }, [filterMode, completedSteps]);

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">The 15-Year-Old Australian Independence Roadmap</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Your 8 essential financial independence milestones: TFN, High-Interest Banking, Medicare, First Casual Job, Effective Tax-Free Threshold, Paycheck Automation (60% Blow / 20% Mojo / 20% Grow), Ls Prep, and Student Perks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CelebrationRing
            progress={progressPercent}
            size={76}
            strokeWidth={6}
            colorTheme={progressPercent === 100 ? 'emerald' : 'amber'}
            autoConfetti={true}
          />
        </div>
      </div>

      {/* Interactive Progress Bar & Quick Actions Toolbar */}
      <Card variant="glass" className="p-4 space-y-3 bg-card/80 border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-bold text-foreground">{stageLabel}</span>
            <Badge variant={progressPercent === 100 ? 'success' : 'outline'} className="text-[10px]">
              {countCompleted} of {totalSteps} Complete ({progressPercent}%)
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark All Done</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Animated Multi-Stage Progress Track */}
        <div className="relative h-3 w-full rounded-full bg-muted/60 overflow-hidden border border-border/60">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${
              progressPercent === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-amber-500 to-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Filter:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border text-[10px]">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  filterMode === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                All ({totalSteps})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('todo')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  filterMode === 'todo' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                To-Do ({totalSteps - countCompleted})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('completed')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  filterMode === 'completed' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Completed ({countCompleted})
              </button>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Auto-saved locally
          </span>
        </div>
      </Card>

      {/* 8 Interactive Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMilestones.map(item => {
            const isDone = completedSteps.includes(item.step);
            const linkObj = OFFICIAL_WEB_LINKS[item.linkKey as keyof typeof OFFICIAL_WEB_LINKS];

            return (
              <div
                key={item.step}
                className="animate-scale-in active:scale-[0.99] transition-transform"
              >
                <Card
                  variant="glass"
                  className={`p-5 space-y-3 transition-all cursor-pointer select-none h-full flex flex-col justify-between ${
                    isDone
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                  onClick={() => toggleStep(item.step)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={isDone ? 'success' : 'outline'} className="text-[10px]">
                        {item.badge}
                      </Badge>
                      <div
                        className={`shrink-0 text-foreground ${isDone ? 'animate-pop-in' : ''}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-muted-foreground opacity-90' : 'text-foreground'}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="p-2.5 rounded-xl bg-card border border-border text-[11px] text-foreground font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.action}</span>
                    </div>

                    {linkObj && (
                      <div onClick={e => e.stopPropagation()}>
                        <WebReferenceLink link={linkObj} />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
      </div>
    </div>
  );
}

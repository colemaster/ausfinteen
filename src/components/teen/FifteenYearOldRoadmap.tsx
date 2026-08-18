import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FIFTEEN_YO_ROADMAP_MILESTONES, OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { CheckCircle2, Circle, Sparkles, Compass } from 'lucide-react';

export function FifteenYearOldRoadmap() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pft_15yo_roadmap');
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleStep = (stepNumber: number) => {
    const next = completedSteps.includes(stepNumber)
      ? completedSteps.filter(s => s !== stepNumber)
      : [...completedSteps, stepNumber];
    setCompletedSteps(next);
    try {
      localStorage.setItem('pft_15yo_roadmap', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const progressPercent = Math.round((completedSteps.length / FIFTEEN_YO_ROADMAP_MILESTONES.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">The 15-Year-Old Australian Independence Roadmap</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Your 6 essential financial independence milestones: TFN, High-Interest Banking, Medicare, First Casual Job, Ls Prep, and Student Perks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={progressPercent === 100 ? 'success' : 'outline'}>
            {completedSteps.length} of {FIFTEEN_YO_ROADMAP_MILESTONES.length} Completed ({progressPercent}%)
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 via-primary to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 6 Interactive Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIFTEEN_YO_ROADMAP_MILESTONES.map(item => {
          const isDone = completedSteps.includes(item.step);
          const linkObj = OFFICIAL_WEB_LINKS[item.linkKey as keyof typeof OFFICIAL_WEB_LINKS];

          return (
            <Card
              key={item.step}
              variant="glass"
              className={`p-5 space-y-3 transition-all cursor-pointer select-none ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
              onClick={() => toggleStep(item.step)}
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant={isDone ? 'success' : 'outline'} className="text-[10px]">
                  {item.badge}
                </Badge>
                <div className="shrink-0 text-foreground">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </div>
              </div>

              <div>
                <h3 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border text-[11px] text-foreground font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{item.action}</span>
              </div>

              {linkObj && (
                <div className="pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                  <WebReferenceLink link={linkObj} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

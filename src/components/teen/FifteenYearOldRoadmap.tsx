import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FIFTEEN_YO_ROADMAP_MILESTONES } from '@/data/teen-finance-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
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
  ChevronDown,
  ChevronUp,
  MapPin,
  Copy,
  Check,
  Car,
  Briefcase,
  GraduationCap,
  Scale,
} from 'lucide-react';
import { CelebrationRing } from '@/components/ui/CelebrationRing';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pft_15yo_roadmap';
const SUBTASKS_STORAGE_KEY = 'pft_15yo_roadmap_subtasks';
const STATE_STORAGE_KEY = 'pft_15yo_roadmap_state';

type AustralianState = 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

interface StateStatutoryProfile {
  name: string;
  childEmploymentRule: string;
  drivingAge: string;
  concessionNote: string;
  officialHighlight: string;
}

const STATE_PROFILES: Record<AustralianState, StateStatutoryProfile> = {
  QLD: {
    name: 'Queensland',
    childEmploymentRule: 'Mandatory Form CE1 (Parent’s Consent Form) under Child Employment Act 2006. School term cap: max 12h/week, max 4h on school days. 10pm curfew (6pm–6am for 11–12yo deliveries; safe transport after 6pm).',
    drivingAge: 'PrepL online course from 15 years 11 months ($29.70). Physical Learner licence issued on 16th birthday at TMR.',
    concessionNote: '50c flat public transport fares across Translink (buses, trains, ferries, light rail). Play On! sports vouchers up to $200.',
    officialHighlight: 'QLD Form CE1 & PrepL at 15.9',
  },
  NSW: {
    name: 'New South Wales',
    childEmploymentRule: 'Regulated under Children and Young Persons (Care and Protection) Act 1998 & Industrial Relations (Child Employment) Act 2006. Casual work permitted outside school hours (compulsory until 17). No employer permit required for 15yos in retail/hospitality.',
    drivingAge: 'Driver Knowledge Test (DKT) can be booked at Service NSW from your 16th birthday.',
    concessionNote: 'School Student Concession Opal card for travel to and from school and activities. Active & Creative Kids vouchers.',
    officialHighlight: 'Service NSW DKT at 16 & Opal Concession',
  },
  VIC: {
    name: 'Victoria',
    childEmploymentRule: 'Under Child Employment Act 2003 (amended 2022), 15-year-olds can work in retail and hospitality without an employer licence outside school hours (under-15s require an employer licence from Wage Inspectorate Victoria and WWCC adult supervision).',
    drivingAge: 'Learner permit online knowledge test can be completed on your 16th birthday with VicRoads.',
    concessionNote: 'Victorian Student Pass / Youth Concession Myki offering 50% discount on metropolitan and regional transit.',
    officialHighlight: 'VicRoads Learner Permit at 16',
  },
  WA: {
    name: 'Western Australia',
    childEmploymentRule: 'Children and Community Services Act 2004 (Part 7): 15-year-olds can work outside school hours in retail, food, and delivery without the statutory 13–14 parent permission form (13–14s require mandatory Wageline Parental Permission Form; curfew 10pm–6am).',
    drivingAge: 'Learner’s permit test with Department of Transport (DoT) from age 16.',
    concessionNote: 'Student SmartRider transit card offering 70c student fares during school hours and concession on weekends.',
    officialHighlight: 'WA DoT Learner at 16 & SmartRider',
  },
  SA: {
    name: 'South Australia',
    childEmploymentRule: 'Under Education and Children’s Services Act 2019 s 74 (max $10,000 fine), work must not conflict with school hours or cause fatigue. Full-time work at 15 requires formal school principal exemption.',
    drivingAge: 'Learner’s permit available from 16 years of age at Service SA.',
    concessionNote: 'Student MetroCard provides concession fares on Adelaide Metro buses, trains, and trams.',
    officialHighlight: 'Service SA Learner at 16',
  },
  TAS: {
    name: 'Tasmania',
    childEmploymentRule: 'Education Act 2016 s 247 prohibits employment during school hours without DECYP Secretary authorisation (fine up to 100 penalty units). Youth employment outside school permitted if it does not prejudice educational progress.',
    drivingAge: 'Learner licence available on your 16th birthday with Service Tasmania.',
    concessionNote: 'Student Greencard / Metro Tasmania concession fares for all registered high school students.',
    officialHighlight: 'Service Tasmania Learner at 16',
  },
  ACT: {
    name: 'Australian Capital Territory',
    childEmploymentRule: 'Children and Young People Act 2008 Chapter 21: 15-year-olds are classified as "young persons" (the 10h/week light work cap for under-15s lifts). Shifts must be outside school hours.',
    drivingAge: 'Road Ready pre-learner course available at high schools from 15 years 9 months; Learner licence at 15 years 9 months!',
    concessionNote: 'Transport Canberra student MyWay card with discounted student bus and light rail fares.',
    officialHighlight: 'ACT Learner Licence from 15y 9m',
  },
  NT: {
    name: 'Northern Territory',
    childEmploymentRule: 'Care and Protection of Children Act 2007 (Part 3.2, s 203): Under-15 night curfew 10pm–6am lifts at 15. Compulsory schooling until 17 or Year 12 completion; shifts must be strictly outside school hours.',
    drivingAge: 'Learner licence available from 16 years of age with Motor Vehicle Registry (MVR).',
    concessionNote: 'Free student bus travel on NT public bus networks on school days.',
    officialHighlight: 'MVR NT Learner Licence at 16',
  },
};

export function FifteenYearOldRoadmap() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [completedSubtasks, setCompletedSubtasks] = useState<Record<number, string[]>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'todo' | 'completed'>('all');
  const [selectedState, setSelectedState] = useState<AustralianState>('QLD');
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedSteps = localStorage.getItem(STORAGE_KEY);
      if (savedSteps) {
        setCompletedSteps(JSON.parse(savedSteps));
      }
      const savedSubtasks = localStorage.getItem(SUBTASKS_STORAGE_KEY);
      if (savedSubtasks) {
        setCompletedSubtasks(JSON.parse(savedSubtasks));
      }
      const savedState = localStorage.getItem(STATE_STORAGE_KEY) as AustralianState | null;
      if (savedState && STATE_PROFILES[savedState]) {
        setSelectedState(savedState);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSteps = (steps: number[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    } catch {}
  };

  const saveSubtasks = (subtasks: Record<number, string[]>) => {
    try {
      localStorage.setItem(SUBTASKS_STORAGE_KEY, JSON.stringify(subtasks));
    } catch {}
  };

  const handleSelectState = (state: AustralianState) => {
    sound.playClick();
    setSelectedState(state);
    try {
      localStorage.setItem(STATE_STORAGE_KEY, state);
    } catch {}
  };

  // Toggle master milestone completion
  const toggleStep = (stepNumber: number) => {
    const isNowCompleted = !completedSteps.includes(stepNumber);
    const nextSteps = isNowCompleted
      ? [...completedSteps, stepNumber]
      : completedSteps.filter(s => s !== stepNumber);

    setCompletedSteps(nextSteps);
    saveSteps(nextSteps);

    // Synchronize subtasks
    const milestone = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === stepNumber);
    if (milestone) {
      const updatedSubtasks = { ...completedSubtasks };
      if (isNowCompleted) {
        updatedSubtasks[stepNumber] = [...milestone.checkpoints];
      } else {
        updatedSubtasks[stepNumber] = [];
      }
      setCompletedSubtasks(updatedSubtasks);
      saveSubtasks(updatedSubtasks);
    }

    if (isNowCompleted) {
      sound.playClick();
      if (nextSteps.length === FIFTEEN_YO_ROADMAP_MILESTONES.length) {
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

  // Toggle individual subtask checkpoint
  const toggleCheckpoint = (stepNumber: number, checkpointText: string) => {
    sound.playClick();
    const milestone = FIFTEEN_YO_ROADMAP_MILESTONES.find(m => m.step === stepNumber);
    if (!milestone) return;

    const currentChecked = completedSubtasks[stepNumber] || [];
    const isNowChecked = !currentChecked.includes(checkpointText);
    const nextChecked = isNowChecked
      ? [...currentChecked, checkpointText]
      : currentChecked.filter(t => t !== checkpointText);

    const updatedSubtasks = {
      ...completedSubtasks,
      [stepNumber]: nextChecked,
    };
    setCompletedSubtasks(updatedSubtasks);
    saveSubtasks(updatedSubtasks);

    // If all checkpoints checked, mark parent step complete
    const allChecked = milestone.checkpoints.every(cp => nextChecked.includes(cp));
    if (allChecked && !completedSteps.includes(stepNumber)) {
      const nextSteps = [...completedSteps, stepNumber];
      setCompletedSteps(nextSteps);
      saveSteps(nextSteps);
      if (nextSteps.length === FIFTEEN_YO_ROADMAP_MILESTONES.length) {
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
    } else if (!allChecked && completedSteps.includes(stepNumber)) {
      const nextSteps = completedSteps.filter(s => s !== stepNumber);
      setCompletedSteps(nextSteps);
      saveSteps(nextSteps);
    }
  };

  const handleMarkAll = () => {
    sound.playGoalCelebration();
    const allSteps = FIFTEEN_YO_ROADMAP_MILESTONES.map(m => m.step);
    setCompletedSteps(allSteps);
    saveSteps(allSteps);

    const allSubtasks: Record<number, string[]> = {};
    FIFTEEN_YO_ROADMAP_MILESTONES.forEach(m => {
      allSubtasks[m.step] = [...m.checkpoints];
    });
    setCompletedSubtasks(allSubtasks);
    saveSubtasks(allSubtasks);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      });
    } catch {}
  };

  const handleReset = () => {
    sound.playClick();
    setCompletedSteps([]);
    setCompletedSubtasks({});
    saveSteps([]);
    saveSubtasks({});
  };

  const handleCopySummary = async () => {
    sound.playClick();
    const profile = STATE_PROFILES[selectedState];
    const totalSteps = FIFTEEN_YO_ROADMAP_MILESTONES.length;
    const countCompleted = completedSteps.length;
    const pct = Math.round((countCompleted / totalSteps) * 100);

    const lines = [
      '🚀 The 15-Year-Old Australian Independence Roadmap',
      `State: ${profile.name} (${selectedState})`,
      `Progress: ${countCompleted} of ${totalSteps} Milestones Complete (${pct}%)`,
      '',
      'Milestone Breakdown:',
      ...FIFTEEN_YO_ROADMAP_MILESTONES.map(m => {
        const isDone = completedSteps.includes(m.step);
        const subChecked = (completedSubtasks[m.step] || []).length;
        const totalSub = m.checkpoints.length;
        return `[${isDone ? 'X' : ' '}] Step ${m.step}: ${m.title} (${subChecked}/${totalSub} tasks) [${m.formCode || m.statutoryRef}]`;
      }),
      '',
      `State Statutory Note (${selectedState}):`,
      profile.childEmploymentRule,
      `Driving Age: ${profile.drivingAge}`,
      `Concessions: ${profile.concessionNote}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {}
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

  const activeProfile = STATE_PROFILES[selectedState];

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
            Your 8 essential financial independence milestones: TFN, High-Interest Banking, Medicare, First Casual Job, Effective Tax-Free Threshold ($22,575), Paycheck Automation (60% Blow / 20% Mojo / 20% Grow), Ls Prep, and Student Perks.
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

      {/* State & Territory Selector Pill Bar */}
      <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Select Your State / Territory for Local Statutory Rules:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {(Object.keys(STATE_PROFILES) as AustralianState[]).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => handleSelectState(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedState === st
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* State Statutory Highlights Callout */}
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div>
            <strong className="text-foreground block flex items-center gap-1 mb-0.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span>{activeProfile.name} Work Rules:</span>
            </strong>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {activeProfile.childEmploymentRule}
            </p>
          </div>

          <div>
            <strong className="text-foreground block flex items-center gap-1 mb-0.5">
              <Car className="w-3.5 h-3.5 text-amber-500" />
              <span>Learner Licence Prep:</span>
            </strong>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {activeProfile.drivingAge}
            </p>
          </div>

          <div>
            <strong className="text-foreground block flex items-center gap-1 mb-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
              <span>State Student Perks:</span>
            </strong>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {activeProfile.concessionNote}
            </p>
          </div>
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
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
              title="Copy progress summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
            </button>
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
          const isExpanded = expandedStep === item.step;
          const checkedTasks = completedSubtasks[item.step] || [];
          const taskCount = item.checkpoints?.length || 0;
          const checkedCount = checkedTasks.length;

          return (
            <div
              key={item.step}
              className={`animate-scale-in transition-transform flex flex-col ${
                isExpanded ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <Card
                variant="glass"
                className={`p-5 space-y-3 transition-all select-none h-full flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Badge, Form Code, and Master Checkbox */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={isDone ? 'success' : 'outline'} className="text-[10px]">
                        {item.badge}
                      </Badge>
                      {item.formCode && (
                        <Badge variant="default" className="text-[10px] font-mono">
                          {item.formCode}
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStep(item.step)}
                      className={`shrink-0 cursor-pointer focus:outline-none transition-transform hover:scale-110 ${
                        isDone ? 'text-emerald-500 animate-pop-in' : 'text-muted-foreground hover:text-primary'
                      }`}
                      title={isDone ? 'Mark milestone incomplete' : 'Mark milestone complete'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-muted-foreground opacity-90' : 'text-foreground'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Subtask Completion Badge & Progress */}
                  {taskCount > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-muted-foreground font-medium">
                        Checkpoints: {checkedCount} of {taskCount} done
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            checkedCount === taskCount ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${(checkedCount / taskCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expandable Checklist Drawer */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-border/50 animate-fade-in text-xs">
                      {/* Checkpoints Checklist */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
                          Action Checkpoints:
                        </span>
                        <div className="space-y-1.5">
                          {item.checkpoints.map(cp => {
                            const isCpChecked = checkedTasks.includes(cp);
                            return (
                              <div
                                key={cp}
                                onClick={() => toggleCheckpoint(item.step, cp)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                                  isCpChecked
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                                    : 'bg-card/70 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <div className={`shrink-0 mt-0.5 ${isCpChecked ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  {isCpChecked ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-border" />
                                  )}
                                </div>
                                <span className={`text-[11px] leading-tight ${isCpChecked ? 'line-through opacity-85' : ''}`}>
                                  {cp}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* State-Specific Child Employment Callout for Step 4 */}
                      {item.step === 4 && (
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] space-y-1">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-primary" />
                            <span>{activeProfile.name} Work Rules (Selected State):</span>
                          </span>
                          <p className="text-muted-foreground leading-relaxed">{activeProfile.childEmploymentRule}</p>
                        </div>
                      )}

                      {/* Statutory Tip Callout */}
                      {item.proTip && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pro-Tip:</span>
                          </span>
                          <p className="leading-relaxed">{item.proTip}</p>
                        </div>
                      )}

                      {/* Statutory Reference Tag */}
                      {item.statutoryRef && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Scale className="w-3 h-3 text-muted-foreground" />
                          <span>Statutory Basis: {item.statutoryRef}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Toolbar: Action and Expand Toggle */}
                <div className="space-y-2 pt-2 border-t border-border/40 mt-3">
                  <div className="p-2 rounded-xl bg-card border border-border text-[11px] text-foreground font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{item.action}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedStep(prev => (prev === item.step ? null : item.step))}
                      className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View Details & Checkpoints</span>
                        </>
                      )}
                    </button>

                    {linkObj && (
                      <div onClick={e => e.stopPropagation()}>
                        <WebReferenceLink link={linkObj} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
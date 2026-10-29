import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { MapPin, TramFront, GraduationCap, Sparkles } from 'lucide-react';
import { BRISBANE_WEEKLY_BUDGET } from '@/data/brisbane-data';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { cn } from '@/lib/utils';
import {
  fiftyCentFareSavings,
  calculateSsafCost,
  SSAF_CAP_2026,
  SSAF_CAP_2027,
} from './engine';

export function BrisbaneBudgetCalculator() {
  const { weeklyNetPay } = useTeenProfile();

  const [items, setItems] = useState<number[]>(BRISBANE_WEEKLY_BUDGET.map(i => i.weekly));
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [oldFare, setOldFare] = useState<number>(4.15);

  // Tertiary Student Expenses State
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [studentYear, setStudentYear] = useState<2026 | 2027>(2026);
  const [isFullTime, setIsFullTime] = useState<boolean>(true);
  const [useSaHelp, setUseSaHelp] = useState<boolean>(true);
  const [textbookWeekly, setTextbookWeekly] = useState<number>(12);

  const updateItem = (index: number, value: number) => {
    setItems(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  const ssafResult = calculateSsafCost({
    year: studentYear,
    isFullTime,
    useSaHelp,
  });

  const studentExtraWeekly = isStudent ? (ssafResult.weeklyBudgetImpact + textbookWeekly) : 0;
  const baseWeeklyTotal = items.reduce((s, v) => s + v, 0);
  const weeklyTotal = baseWeeklyTotal + studentExtraWeekly;
  const monthlyTotal = weeklyTotal * 52 / 12;
  const annualTotal = weeklyTotal * 52;

  const surplus = weeklyNetPay - weeklyTotal;
  const fareSavings = fiftyCentFareSavings({ tripsPerWeek, oldAverageFare: oldFare, newFare: 0.5 });

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Brisbane Weekly Budget &amp; Student Living Calculator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Living costs in Brisbane for young workers and tertiary students across UQ, QUT, Griffith, UniSC, UniSQ, ACU &amp; TAFE.
          </p>
        </div>
        <Badge variant="success" className="shrink-0 font-bold">
          Brisbane, QLD • 2026/2027 Figures
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-5">
          {BRISBANE_WEEKLY_BUDGET.map((item, i) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  {item.category}
                </label>
                <span className="text-xs font-bold text-foreground font-mono">${items[i]}/wk</span>
              </div>
              <SliderControl
                label=""
                value={items[i]}
                onChange={v => updateItem(i, v)}
                min={0}
                max={item.category.startsWith('Rent') ? 800 : 300}
                step={5}
                suffix=""
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.note}</p>
            </div>
          ))}

          {/* Tertiary Student Living & SSAF Module */}
          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">University / TAFE Student Costs</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStudent(p => !p)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                {isStudent ? 'Active (Include in budget)' : 'Disabled (Click to enable)'}
              </button>
            </div>

            {isStudent && (
              <div className="space-y-3 pt-2 border-t border-border/60 text-xs">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Academic Year:</span>
                  <div className="flex gap-1.5">
                    {[2026, 2027].map(yr => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setStudentYear(yr as 2026 | 2027)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors',
                          studentYear === yr ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {yr} (SSAF ${yr === 2026 ? SSAF_CAP_2026 : SSAF_CAP_2027})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Study Load:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsFullTime(true)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                        isFullTime ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      Full-Time (100% SSAF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullTime(false)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                        !isFullTime ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      Part-Time (75% SSAF)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">SSAF Fee: ${ssafResult.maxAnnualCap.toFixed(2)}/yr</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {useSaHelp ? 'Deferred via SA-HELP ($0 upfront)' : `$${ssafResult.weeklyBudgetImpact.toFixed(2)}/wk upfront`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseSaHelp(p => !p)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                        useSaHelp ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      )}
                    >
                      {useSaHelp ? '✓ Using SA-HELP' : 'Paying Upfront'}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {ssafResult.saHelpNote}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground font-semibold">Textbooks, Course Packs &amp; Software</span>
                    <span className="font-mono font-bold text-foreground">${textbookWeekly}/wk</span>
                  </div>
                  <SliderControl
                    label=""
                    value={textbookWeekly}
                    onChange={setTextbookWeekly}
                    min={0}
                    max={50}
                    step={2}
                    suffix="/wk"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ≈ ${(textbookWeekly * 52).toFixed(0)}/yr across two academic semesters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Weekly Living Budget Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Weekly</div>
                <div className="text-lg font-bold font-mono text-foreground">${weeklyTotal.toFixed(0)}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Monthly</div>
                <div className="text-lg font-bold font-mono text-foreground">${monthlyTotal.toFixed(0)}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Yearly</div>
                <div className="text-lg font-bold font-mono text-foreground">${annualTotal.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="space-y-2">
              <NumberInput
                label="Your Weekly Net Take-Home Pay / Allowance"
                value={weeklyNetPay}
                onChange={() => {}}
                min={0}
                max={2000}
                step={10}
                prefix="$"
              />
              <div
                className={cn(
                  'rounded-xl border p-3.5 text-sm',
                  surplus >= 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                )}
              >
                <span className="font-bold">{surplus >= 0 ? '👍 Surplus Buffer' : '⚠️ Budget Shortfall'}:</span>{' '}
                {surplus >= 0
                  ? `You have $${surplus.toFixed(0)}/wk left over after Brisbane rent, transport and student costs.`
                  : `You are $${Math.abs(surplus).toFixed(0)}/wk short. Consider picking up 1 additional weekend shift or sharehousing in outer hubs.`}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TramFront className="w-4 h-4" />
              <h3 className="text-sm font-bold text-foreground">50c Translink Concession Transit (2026 Permanent)</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SliderControl
                label="Trips per week (commute)"
                value={tripsPerWeek}
                onChange={v => setTripsPerWeek(v)}
                min={0}
                max={20}
                step={1}
                suffix=" trips"
              />
              <SliderControl
                label="Old fare per trip"
                value={oldFare}
                onChange={v => setOldFare(v)}
                min={1}
                max={8}
                step={0.05}
                decimals={2}
                prefix="$"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Weekly Saving</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${fareSavings.savedWeekly.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Monthly Saving</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${fareSavings.savedMonthly.toFixed(0)}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Yearly Saving</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${fareSavings.savedYearly.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              At the capped $0.50 fare your transit commute costs just{' '}
              <strong className="font-mono text-foreground">${fareSavings.newWeeklyCost.toFixed(2)}/wk</strong> vs{' '}
              <strong className="font-mono text-foreground">${fareSavings.oldWeeklyCost.toFixed(2)}</strong> before — saving{' '}
              {fareSavings.savingsPct.toFixed(0)}% to offset textbook and university expenses.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Brisbane Student Money Tips</span>
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• <strong>SA-HELP:</strong> Defer your SSAF fee ($373 in 2026, $386 in 2027) so zero upfront cash is required upon enrollment.</li>
              <li>• <strong>Concession Go Card:</strong> Ensure your full-time student status is linked on Translink for ongoing 50c fares.</li>
              <li>• <strong>Markets:</strong> Shop at <strong>West End or Rocklea Saturday markets</strong> for fresh produce at half the supermarket price.</li>
              <li>• <strong>RTA 4-Week Bond Rule:</strong> By Queensland law, rental bond cannot exceed 4 weeks rent and must be lodged with the RTA within 10 days.</li>
              <li>• <strong>Affordable Student Suburbs:</strong> Explore Annerley, Salisbury, Moorooka, Chermside, and Toowong for rooms from $220–$280/wk.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Sharehouse Rent Share"
          value={`$${items[0].toLocaleString()}/wk`}
          color="blue"
          subtext="Median room in inner/middle Brisbane"
        />
        <StatCard
          label="Rental Bond (4 weeks)"
          value={`$${(items[0] * 4).toLocaleString()}`}
          color="purple"
          subtext="Lodged with RTA Queensland"
        />
        <StatCard
          label="Public Transport Cap"
          value="$5.00/wk"
          color="green"
          subtext="10 trips @ 50c flat Translink fare"
        />
      </div>
    </Card>
  );
}

import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { AGE_PRESETS, TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import {
  HELP_REPAYMENT_THRESHOLDS_2026_27,
  WEEKS_PER_YEAR,
} from '@/data/constants';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';
import { Briefcase, Bus, GraduationCap, PiggyBank } from 'lucide-react';

export function LiveMoneyCounters(): React.JSX.Element {
  const reduceMotion = useReducedMotionSafe();

  // (1) 15yo Fast Food casual weekly take-home
  const teen15 = AGE_PRESETS[15];
  const weeklyTakeHome: number = teen15.hourlyRate * teen15.hoursPerWeek;

  // (2) $500 Mojo buffer growth at the BOQ youth rate
  const boqAccount =
    TEEN_SAVINGS_ACCOUNTS.find((a) => a.bank.startsWith('BOQ')) ??
    TEEN_SAVINGS_ACCOUNTS[0];
  const mojoPrincipal: number = teen15.savingsGoalTarget;
  const mojoRateDecimal: number = boqAccount.maxRate / 100;
  const mojoBalance1yr: number = mojoPrincipal * (1 + mojoRateDecimal);
  const mojoInterest1yr: number = mojoPrincipal * mojoRateDecimal;

  // (3) Yearly TransLink 50c saving vs a $4 average fare
  const TRANSLINK_FLAT_FARE = 0.5;
  const TRANSLINK_AVG_FARE = 4;
  const TRANSLINK_TRIPS_PER_WEEK = 10;
  const translinkYearlySavings: number =
    (TRANSLINK_AVG_FARE - TRANSLINK_FLAT_FARE) *
    TRANSLINK_TRIPS_PER_WEEK *
    WEEKS_PER_YEAR;

  // (4) HELP 2026-27 first repayment threshold
  const helpThreshold: number = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max;

  const odoDurationMs = reduceMotion ? 0 : 900;
  const animatedDurationMs = reduceMotion ? 0 : 1200;

  const items = [
    {
      badge: '15yo Weekly Shift',
      icon: Briefcase,
      color: 'emerald',
      label: 'Weekly Casual Pay',
      isOdo: true,
      value: weeklyTakeHome,
      decimals: 2,
      subtext: `${teen15.hoursPerWeek}hrs @ $${teen15.hourlyRate.toFixed(2)}/hr ${teen15.jobTitle}`,
      statTag: '100% Tax-Free',
    },
    {
      badge: '5.80% p.a. Youth HISA',
      icon: PiggyBank,
      color: 'teal',
      label: 'Mojo Buffer in 1 Year',
      isOdo: true,
      value: mojoBalance1yr,
      decimals: 0,
      subtext: `$${mojoPrincipal} + $${mojoInterest1yr.toFixed(0)} interest @ ${boqAccount.maxRate.toFixed(2)}% BOQ`,
      statTag: 'Zero Monthly Fees',
    },
    {
      badge: 'Qld 50¢ Transit',
      icon: Bus,
      color: 'cyan',
      label: 'TransLink Saved / Year',
      isOdo: false,
      value: translinkYearlySavings,
      decimals: 0,
      subtext: `50c vs $${TRANSLINK_AVG_FARE} avg × ${TRANSLINK_TRIPS_PER_WEEK} trips/wk`,
      statTag: 'Permanent Fare',
    },
    {
      badge: 'Universities Accord',
      icon: GraduationCap,
      color: 'violet',
      label: '2026–27 HELP Floor',
      isOdo: false,
      value: helpThreshold,
      decimals: 0,
      subtext: 'No compulsory repayments below this income',
      statTag: '$0 Repayments',
    },
  ];

  return (
    <div
      className="reveal-stagger grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4"
      role="list"
      aria-label="Live teen money figures"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            role="listitem"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:border-primary/10"
          >
            {/* Top pill & icon */}
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-colors">
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.badge}</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {item.statTag}
                </span>
              </div>

              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>

              <div className="mt-1 flex items-baseline">
                {item.isOdo ? (
                  <OdometerCounter
                    value={item.value}
                    prefix="$"
                    decimals={item.decimals}
                    durationMs={odoDurationMs}
                    className="tabular-nums font-mono text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
                  />
                ) : (
                  <AnimatedNumber
                    value={item.value}
                    format="currency"
                    duration={animatedDurationMs}
                    className="tabular-nums font-mono text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
                  />
                )}
              </div>
            </div>

            <span className="mt-2 block border-t border-border/60 pt-2 text-[10px] sm:text-[11px] leading-snug text-muted-foreground">
              {item.subtext}
            </span>
          </div>
        );
      })}
    </div>
  );
}

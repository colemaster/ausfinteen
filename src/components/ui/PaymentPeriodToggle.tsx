import { cn } from '@/lib/utils';

export type PaymentPeriod = 'weekly' | 'fortnightly' | 'monthly' | 'annual';

export const PERIODS_PER_YEAR: Record<PaymentPeriod, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  annual: 1,
};

export const PERIOD_LABELS: Record<PaymentPeriod, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  annual: 'Annual',
};

export const PERIOD_SHORT_SUFFIX: Record<PaymentPeriod, string> = {
  weekly: '/wk',
  fortnightly: '/fn',
  monthly: '/mo',
  annual: '/yr',
};

const PERIOD_ORDER: PaymentPeriod[] = ['weekly', 'fortnightly', 'monthly', 'annual'];

interface PaymentPeriodToggleProps {
  value: PaymentPeriod;
  onChange: (period: PaymentPeriod) => void;
  className?: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function PaymentPeriodToggle({
  value,
  onChange,
  className,
  size = 'md',
  fullWidth = false,
}: PaymentPeriodToggleProps) {
  return (
    <div
      role="group"
      aria-label="Payment period"
      className={cn(
        'flex rounded-xl border border-border/60 bg-muted/40 p-1',
        size === 'sm' ? 'gap-0.5' : 'gap-1',
        className
      )}
    >
      {PERIOD_ORDER.map((period) => {
        const isActive = value === period;
        return (
          <button
            key={period}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(period)}
            className={cn(
              'whitespace-nowrap rounded-lg font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring',
              size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs',
              fullWidth && 'flex-1',
              isActive
                ? 'border border-border/60 bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {PERIOD_LABELS[period]}
          </button>
        );
      })}
    </div>
  );
}

export function convertPeriod(
  value: number,
  from: PaymentPeriod,
  to: PaymentPeriod
): number {
  return (value * PERIODS_PER_YEAR[from]) / PERIODS_PER_YEAR[to];
}

const PERIOD_SUFFIX_PATTERN = /(?:\/(?:wk|fn|mo|yr|pa|mth)| per (?:week|fortnight|month|year)| monthly| weekly| annual)$/i;

export function withPeriodSuffix(
  suffix: string | undefined,
  period: PaymentPeriod | undefined
): string | undefined {
  if (!period) return suffix;
  const perPeriod = PERIOD_SHORT_SUFFIX[period];
  if (!suffix) return period === 'annual' ? undefined : perPeriod;
  if (PERIOD_SUFFIX_PATTERN.test(suffix)) {
    return period === 'annual' ? '' : suffix.replace(PERIOD_SUFFIX_PATTERN, perPeriod);
  }
  return period === 'annual' ? suffix : `${suffix}${perPeriod}`;
}

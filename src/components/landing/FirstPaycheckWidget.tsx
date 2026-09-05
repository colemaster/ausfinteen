import { useMemo, useState } from 'react';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { AGE_PRESETS, JUNIOR_AWARD_RATES } from '@/data/teen-finance-data';
import { calcIncomeTax } from '@/data/tax-brackets';
import { SUPER_RULES } from '@/data/super-rules';

type AwardKey = 'fast_food' | 'retail';

const AWARD_OPTIONS: { key: AwardKey; shortLabel: string }[] = [
  { key: 'fast_food', shortLabel: 'Fast Food · MA000003' },
  { key: 'retail', shortLabel: 'Retail · MA000004' },
];

/** 25% casual loading applies on top of the junior base rate. */
const CASUAL_LOADING = 1.25;

/** Annual tax-free threshold — at or under this, estimated tax is $0. */
const TAX_FREE_THRESHOLD = 18_200;

const aud0 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const aud2 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Resolve the junior percentage for an age from the award's rate table.
 * Table layout: [under-16, 16, 17, 18, 19, 20 (≤6 months), …].
 * Age 20 uses the ≤6-months (90%) row as the conservative default —
 * the full adult rate only kicks in after 6 months with the same employer
 * (FWC [2026] FWCFB 75, from 1 Dec 2026).
 */
function juniorPctForAge(awardKey: AwardKey, age: number): number {
  const rates = JUNIOR_AWARD_RATES[awardKey].rates;
  const index = Math.min(Math.max(age - 15, 0), 5);
  return rates[index].pct;
}

export function FirstPaycheckWidget() {
  const [age, setAge] = useState<number>(16);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(
    AGE_PRESETS[16].hoursPerWeek,
  );
  const [award, setAward] = useState<AwardKey>('fast_food');

  const preset = AGE_PRESETS[age];

  const handleAgeChange = (nextAge: number): void => {
    setAge(nextAge);
    const presetHours = AGE_PRESETS[nextAge]?.hoursPerWeek;
    if (presetHours !== undefined) {
      setHoursPerWeek(Math.min(Math.max(presetHours, 3), 25));
    }
  };

  const calc = useMemo(() => {
    const awardData = JUNIOR_AWARD_RATES[award];
    const pct = juniorPctForAge(award, age);
    const hourlyRate = awardData.adultBaseRate * pct * CASUAL_LOADING;
    const weeklyGross = hourlyRate * hoursPerWeek;
    const annualised = weeklyGross * 52;
    const weeklyTax =
      annualised <= TAX_FREE_THRESHOLD
        ? 0
        : calcIncomeTax(annualised) / 52;
    const weeklyTakeHome = Math.max(0, weeklyGross - weeklyTax);
    const superEligible =
      age >= 18 || hoursPerWeek > SUPER_RULES.under18WeeklyHoursThreshold;
    const weeklySuper = superEligible
      ? weeklyGross * SUPER_RULES.sgRate
      : 0;
    return {
      awardName: awardData.name,
      pct,
      hourlyRate,
      weeklyGross,
      annualised,
      weeklyTax,
      weeklyTakeHome,
      fortnightlyTakeHome: weeklyTakeHome * 2,
      superEligible,
      weeklySuper,
    };
  }, [award, age, hoursPerWeek]);

  return (
    <section
      aria-labelledby="first-paycheck-heading"
      className="mx-auto w-full max-w-3xl rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="first-paycheck-heading"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          What could your first paycheck look like?
        </h2>
        <p className="text-sm text-muted-foreground">
          {preset.label} · {preset.jobTitle} ·{' '}
          {aud2.format(calc.hourlyRate)}/hr casual ({calc.pct * 100}% junior
          rate + 25% loading)
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <SliderControl
          label="Age"
          value={age}
          onChange={handleAgeChange}
          min={15}
          max={20}
          step={1}
          suffix=" yrs"
        />
        <SliderControl
          label="Hours per week"
          value={hoursPerWeek}
          onChange={setHoursPerWeek}
          min={3}
          max={25}
          step={1}
          suffix=" hrs/wk"
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="first-paycheck-award"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Award
          </label>
          <select
            id="first-paycheck-award"
            value={award}
            onChange={(e) => setAward(e.target.value as AwardKey)}
            className="w-full cursor-pointer rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            {AWARD_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.shortLabel}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Under-16 junior rate: Retail 45% vs Fast Food 40% of the $27.81/hr
            adult base (2026–27) + 25% casual loading.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Weekly gross"
          value={aud0.format(calc.weeklyGross)}
          numericValue={calc.weeklyGross}
          format="currency"
          color="blue"
          sub={`${aud2.format(calc.hourlyRate)}/hr × ${hoursPerWeek} hrs`}
        />
        <StatCard
          label="Estimated tax / week"
          value={aud0.format(calc.weeklyTax)}
          numericValue={calc.weeklyTax}
          format="currency"
          color="amber"
          sub={
            calc.annualised <= TAX_FREE_THRESHOLD
              ? `Under $18,200/yr (${aud0.format(calc.annualised)}) — $0`
              : '2026–27 resident brackets, no Medicare/LITO'
          }
        />
        <StatCard
          label="Take-home / week"
          value={aud0.format(calc.weeklyTakeHome)}
          numericValue={calc.weeklyTakeHome}
          format="currency"
          color="green"
          sub="Gross minus estimated tax"
        />
        <StatCard
          label="Super / week"
          value={aud0.format(calc.weeklySuper)}
          numericValue={calc.weeklySuper}
          format="currency"
          color="purple"
          sub={
            calc.superEligible
              ? '12% SG paid by your employer'
              : 'Under 18s need 30+ hrs/wk for SG'
          }
        />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        That's about{' '}
        <span className="font-mono font-bold text-foreground">
          {aud0.format(calc.fortnightlyTakeHome)}
        </span>{' '}
        in your pocket each fortnight.
      </p>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Estimate only — junior % from {calc.awardName}. Casual loading 25%.
          Before penalty rates, super &amp; HELP. Not financial advice.
        </p>
        <a
          href="/teen-budgeting"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Split this paycheck →
        </a>
      </div>
    </section>
  );
}

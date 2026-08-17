import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, AGE_PRESETS, JUNIOR_AWARD_RATES, PENALTY_RATES, WORKPLACE_ALLOWANCES } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Calculator, Info } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { netPayWithAllowances, penaltyRateBreakdown, type AwardName } from './engine';
import { FirstJobChecklist } from './FirstJobChecklist';

export function PayslipAnalyzer() {
  const { profile, updateProfile, applyAgePreset } = useTeenProfile();

  const [hourlyRate, setHourlyRate] = useState<number>(profile.hourlyRate);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(profile.hoursPerWeek);
  const [age, setAge] = useState<number>(profile.age);
  const [claimsThreshold, setClaimsThreshold] = useState<boolean>(profile.claimsTaxFreeThreshold);
  const [selectedAward, setSelectedAward] = useState<AwardName>('fast_food');
  const [penaltyType, setPenaltyType] = useState<keyof typeof PENALTY_RATES>('ordinary');
  const [hasMealAllowance, setHasMealAllowance] = useState<boolean>(false);
  const [hasUniformAllowance, setHasUniformAllowance] = useState<boolean>(false);

  const handleAgeChange = (targetAge: number) => {
    setAge(targetAge);
    const preset = AGE_PRESETS[targetAge] || AGE_PRESETS[16];
    setHourlyRate(preset.hourlyRate);
    setHoursPerWeek(preset.hoursPerWeek);
    applyAgePreset(targetAge);
  };

  // Allowance calculation
  const weeklyMealAllowance = hasMealAllowance ? WORKPLACE_ALLOWANCES.mealAllowance : 0;
  const weeklyUniformAllowance = hasUniformAllowance ? WORKPLACE_ALLOWANCES.uniformAllowancePerShift * 3 : 0; // assumed 3 shifts
  const totalAllowances = weeklyMealAllowance + weeklyUniformAllowance;

  const penaltyMultiplier = PENALTY_RATES[penaltyType].multiplier;

  const pay = netPayWithAllowances(age, hourlyRate, hoursPerWeek, selectedAward, {
    claimsTaxFreeThreshold: claimsThreshold,
    weeklyAllowances: totalAllowances,
    penaltyMultiplier,
  });

  const penaltyRows = penaltyRateBreakdown(hourlyRate * pay.juniorPct);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Interactive Payslip & Penalty Rate Calculator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculate your exact gross pay, Saturday/Sunday penalty rates, meal allowances, tax withheld, and super!
          </p>
        </div>
        <Badge variant="success" className="w-fit">
          2025-26 ATO & Fair Work PACT
        </Badge>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground block">Select Age Persona (One-Click Preset)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[15, 16, 17, 18].map(a => (
            <button
              key={a}
              type="button"
              onClick={() => handleAgeChange(a)}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                age === a
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              {a}yo Preset
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Modern Award</label>
            <select
              value={selectedAward}
              onChange={e => setSelectedAward(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(JUNIOR_AWARD_RATES).map(([key, award]) => (
                <option key={key} value={key}>
                  {award.name}
                </option>
              ))}
            </select>
          </div>

          <NumberInput
            label="Base Hourly Pay Rate ($)"
            value={hourlyRate}
            onChange={v => {
              setHourlyRate(v);
              updateProfile({ hourlyRate: v });
            }}
            min={10}
            max={60}
            step={0.5}
            prefix="$"
          />

          <SliderControl
            label="Hours Worked Per Week"
            value={hoursPerWeek}
            onChange={v => {
              setHoursPerWeek(v);
              updateProfile({ hoursPerWeek: v });
            }}
            min={1}
            max={45}
            step={1}
            suffix=" hrs/wk"
          />
        </div>

        {/* Right Inputs: Penalty Rates & Allowances */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Shift Type (Penalty Rate)</label>
            <select
              value={penaltyType}
              onChange={e => setPenaltyType(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(PENALTY_RATES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Allowances Toggles */}
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2 text-xs">
            <span className="font-semibold text-foreground block mb-1">Workplace Allowances</span>
            <div className="flex items-center justify-between">
              <span>Overtime Meal Allowance ($15.50)</span>
              <button
                type="button"
                onClick={() => setHasMealAllowance(!hasMealAllowance)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  hasMealAllowance ? 'bg-emerald-500 text-white' : 'bg-muted border border-border text-muted-foreground'
                }`}
              >
                {hasMealAllowance ? 'ADDED' : 'NO'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Uniform Laundry Allowance ($4.50/wk)</span>
              <button
                type="button"
                onClick={() => setHasUniformAllowance(!hasUniformAllowance)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  hasUniformAllowance ? 'bg-emerald-500 text-white' : 'bg-muted border border-border text-muted-foreground'
                }`}
              >
                {hasUniformAllowance ? 'ADDED' : 'NO'}
              </button>
            </div>
          </div>

          {/* Tax Free Threshold Toggle */}
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Claim $18,200 Tax-Free Threshold?</span>
              <button
                type="button"
                onClick={() => setClaimsThreshold(!claimsThreshold)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  claimsThreshold ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {claimsThreshold ? 'YES (Recommended)' : 'NO'}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {claimsThreshold
                ? 'Under $350/wk ($18,200/yr), $0 tax is withheld from your paycheck!'
                : 'Warning: 16% tax will be withheld from your first dollar earned.'}
            </p>
          </div>
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <StatCard
          label="Effective Hourly Rate"
          value={`$${pay.effectiveHourlyRate.toFixed(2)}/hr`}
          color="blue"
          subtext={`Base $${hourlyRate.toFixed(2)} x ${pay.juniorPct * 100}% junior x ${penaltyMultiplier}x penalty`}
        />
        <StatCard
          label="Weekly Gross Pay"
          value={`$${pay.grossWeekly.toFixed(2)}`}
          color="purple"
          subtext={totalAllowances > 0 ? `Incl. $${totalAllowances.toFixed(2)} allowances` : `$${pay.annualGross.toLocaleString()}/yr`}
        />
        <StatCard
          label="Take-Home Pay (Bank)"
          value={`$${pay.netWeekly.toFixed(2)}`}
          color="green"
          subtext={`Tax withheld: $${pay.taxWithheldWeekly.toFixed(2)}`}
        />
        <StatCard
          label="Super Guarantee (12%)"
          value={`$${pay.superWeekly.toFixed(2)}`}
          color={pay.isSuperEligible ? 'cyan' : 'red'}
          subtext={
            pay.isSuperEligible
              ? 'Paid to your Super Fund'
              : 'Under 18 rule: requires >30h/wk'
          }
        />
      </div>

      {/* Penalty Rate Breakdown */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Full Penalty Rate Breakdown — Base ${hourlyRate.toFixed(2)}/hr ({Math.round(pay.juniorPct * 100)}% junior)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {penaltyRows.map(row => (
            <div
              key={row.type}
              className={`rounded-xl border p-2.5 text-center transition-all ${
                row.type === penaltyType
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className="text-[10px] font-semibold text-muted-foreground leading-tight">{row.label}</div>
              <div className="text-sm font-extrabold font-mono text-foreground mt-1">${row.effectiveRate.toFixed(2)}/hr</div>
              <div className="text-[10px] font-mono text-muted-foreground">×{row.multiplier.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Penalty loadings apply on top of your junior rate. A Sunday fast-food shift at your age pays{' '}
          <span className="font-mono font-bold">${pay.effectiveHourlyRate.toFixed(2)} × 1.50 = ${(pay.effectiveHourlyRate * 1.5).toFixed(2)}/hr</span>.
        </p>
      </div>

      {/* Super Eligibility & Penalty Alert */}
      {!pay.isSuperEligible && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Under 18 Super Guarantee ATO Rule:</span>
            Because you are under 18 and working {hoursPerWeek} hours/week (30 or fewer hours), your employer is not legally required to pay the 12% super guarantee under ATO rules. If you work 31+ hours in any week, super becomes compulsory!
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_payslip} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_awards} />
      </div>

      <FirstJobChecklist />
    </Card>
  );
}

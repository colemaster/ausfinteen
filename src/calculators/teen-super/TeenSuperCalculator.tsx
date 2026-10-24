import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ComparisonPill } from '@/components/ui/ComparisonPill';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { SUPER_CO_CONTRIBUTION_2026_27 } from '@/data/constants';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, Info, ShieldCheck, Scale } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from '@/components/charts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { compoundGrowthWithFees, superComparison, teenMarginalRate } from './engine';
import { SUPER_RULES } from '@/data/super-rules';
import { formatCurrency } from '@/utils/formatters';

// 12.0% statutory SG rate for FY2025-26 and FY2026-27 (ATO, verified 18 Oct 2026)
const SUPER_SG_RATE_2026_27 = SUPER_RULES.sgRate;

interface TeenSuperPreset {
  hours: number;
  rate: number;
  strategy: 'indexed_high_growth' | 'default_mysuper';
}

const TEEN_SUPER_PRESETS: ScenarioPreset<TeenSuperPreset>[] = [
  {
    id: 'part-time-fastfood',
    label: 'Student Casual (15h/wk)',
    badge: 'Under 18 Rule',
    description: '15 hrs/wk at $18.50/hr. Super optional under 30 hrs for minors',
    values: { hours: 15, rate: 18.5, strategy: 'indexed_high_growth' },
  },
  {
    id: 'full-time-gap-year',
    label: 'Gap Year Full-Time (38h/wk)',
    badge: '12% SG Active',
    description: '38 hrs/wk ($24.50/hr) unlocking mandatory 12% employer super',
    values: { hours: 38, rate: 24.5, strategy: 'indexed_high_growth' },
  },
  {
    id: 'hospitality-weekend',
    label: 'Cafe Casual (25h/wk)',
    badge: 'Hospitality Award',
    description: '25 hrs/wk at $26.00/hr weekend casual rates',
    values: { hours: 25, rate: 26.0, strategy: 'indexed_high_growth' },
  },
];

export function TeenSuperCalculator() {
  const { profile } = useTeenProfile();

  const [hoursWk, setHoursWk] = useState<number>(profile.hoursPerWeek);
  const [hourlyPay, setHourlyPay] = useState<number>(profile.hourlyRate);
  const [age] = useState<number>(profile.age);
  const [merPct, setMerPct] = useState<number>(0.5);
  const [fundStrategy, setFundStrategy] = useState<'indexed_high_growth' | 'default_mysuper'>('indexed_high_growth');
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<TeenSuperPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.hours !== undefined) setHoursWk(preset.values.hours);
    if (preset.values.rate !== undefined) setHourlyPay(preset.values.rate);
    if (preset.values.strategy !== undefined) setFundStrategy(preset.values.strategy);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setHoursWk(profile.hoursPerWeek || 15);
    setHourlyPay(profile.hourlyRate || 18.5);
    setMerPct(0.5);
    setFundStrategy('indexed_high_growth');
  }, [profile]);

  const grossWk = hourlyPay * hoursWk;
  const isEligible = age >= 18 || hoursWk > 30;

  const annualSuper = isEligible ? grossWk * 52 * SUPER_SG_RATE_2026_27 : 0;
  
  // 40-year compound super growth (age to 60)
  const returnRate = fundStrategy === 'indexed_high_growth' ? 0.085 : 0.065;
  const years = 60 - age;
  const monthlyContrib = annualSuper / 12;

  const growthWithFees = useMemo(() => {
    return compoundGrowthWithFees(monthlyContrib, years, returnRate, merPct / 100);
  }, [monthlyContrib, years, returnRate, merPct]);

  const decision = useMemo(() => {
    const annualIncome = grossWk * 52;
    const personalRate = teenMarginalRate(annualIncome);
    return superComparison(annualIncome, personalRate, SUPER_RULES.sgRate);
  }, [grossWk]);

  const summaryText = useMemo(() => {
    return [
      '--- Teen Superannuation & Compound Growth Summary ---',
      `Hours Worked: ${hoursWk}h/wk @ $${hourlyPay.toFixed(2)}/hr (Gross: ${formatCurrency(grossWk * 52)}/yr)`,
      `ATO Super Guarantee: ${isEligible ? `Eligible (12% = ${formatCurrency(annualSuper)}/yr)` : 'Exempt (Under 18 working ≤30 hrs/wk)'}`,
      `Strategy: ${fundStrategy === 'indexed_high_growth' ? 'Indexed High Growth (8.5%)' : 'Balanced MySuper (6.5%)'} | Fee Drag (MER): ${merPct}%`,
      `Projected Balance at Age 60: ${formatCurrency(growthWithFees.futureValueWithFees)} (Fee loss: ${formatCurrency(growthWithFees.feeDragLoss)})`,
      `Super Advantage vs Outside: ${decision.superAdvantage >= 0 ? '+' : ''}${formatCurrency(decision.superAdvantage)}`,
      `Calculated via AusFinTools Teen Super Simulator`,
    ].join('\n');
  }, [hoursWk, hourlyPay, grossWk, isEligible, annualSuper, fundStrategy, merPct, growthWithFees, decision]);

  // Build growth projection trajectory over time (after fee drag)
  const netRate = returnRate - merPct / 100;
  const trajectoryData = useMemo(() => {
    const data: { ageLabel: string; balance: number; contributions: number }[] = [];
    let cumulativeContrib = 0;
    for (let y = 0; y <= years; y += 5) {
      const currentN = y * 12;
      const rNet = netRate / 12;
      const val = rNet > 0 ? monthlyContrib * ((Math.pow(1 + rNet, currentN) - 1) / rNet) : monthlyContrib * currentN;
      cumulativeContrib = annualSuper * y;
      data.push({
        ageLabel: `Age ${age + y}`,
        balance: Math.round(val),
        contributions: Math.round(cumulativeContrib),
      });
    }
    return data;
  }, [age, years, monthlyContrib, annualSuper, netRate]);

  const chartConfig = useMemo(() => {
    return {
      balance: { label: 'Total Super Balance ($)', color: '#a855f7' },
      contributions: { label: 'Your Contributions ($)', color: '#3b82f6' },
    };
  }, []);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Super Guarantee & Compound Growth Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculate your 12% Super Guarantee (paid every payday since 1 July 2026), check ATO 30+ hours/week under 18 eligibility, and project compound super at age 60!
          </p>
        </div>
        <Badge variant="success">
          12% SG (2026-27)
        </Badge>
      </div>

      {/* Quick Presets */}
      <QuickPresetBar
        presets={TEEN_SUPER_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Youth & Student Work Personas"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Hourly Rate ($)"
            value={hourlyPay}
            onChange={v => setHourlyPay(v)}
            min={10}
            max={60}
            step={0.5}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <SliderControl
            label="Hours Worked Per Week"
            value={hoursWk}
            onChange={v => setHoursWk(v)}
            min={1}
            max={40}
            step={1}
            suffix=" hrs/wk"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">Barefoot Fund Strategy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFundStrategy('indexed_high_growth')}
              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-left ${
                fundStrategy === 'indexed_high_growth'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Indexed High Growth (8.5%)
            </button>
            <button
              type="button"
              onClick={() => setFundStrategy('default_mysuper')}
              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-left ${
                fundStrategy === 'default_mysuper'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Balanced MySuper (6.5%)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Area Growth Chart */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projected Super Balance Growth to Age 60</h3>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="ageLabel" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={v => [`$${v.toLocaleString()}`, 'Balance']} />} />
              <Area type="monotone" dataKey="balance" stroke="#a855f7" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
              <Area type="monotone" dataKey="contributions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorContrib)" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Weekly Super (12%)"
          value={`$${(isEligible ? grossWk * SUPER_SG_RATE_2026_27 : 0).toFixed(2)}/wk`}
          numericValue={isEligible ? grossWk * SUPER_SG_RATE_2026_27 : 0}
          format="currency"
          color={isEligible ? 'cyan' : 'red'}
          subtext={isEligible ? 'Paid by employer' : 'Requires >30h/wk for under 18s'}
        />
        <StatCard
          label="Annual Super Deposited"
          value={`$${Math.round(annualSuper).toLocaleString()}/yr`}
          numericValue={Math.round(annualSuper)}
          format="currency"
          color="green"
          subtext="Saved tax-effectively at 15%"
        />
        <StatCard
          label="Projected Super Balance at 60"
          value={`$${growthWithFees.futureValueWithFees.toLocaleString()}`}
          numericValue={growthWithFees.futureValueWithFees}
          format="currency"
          color="purple"
          subtext={`After ${merPct.toFixed(1)}% MER fees (loses $${growthWithFees.feeDragLoss.toLocaleString()})`}
        />
      </div>

      {/* Fee Drag Slider */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
        <SliderControl
          label="Super Fund Fee Drag (MER)"
          value={merPct}
          onChange={v => setMerPct(v)}
          min={0}
          max={2}
          step={0.1}
          suffix="% / yr"
        />
        <p className="text-[11px] text-muted-foreground">
          A 0.5% MER on a {fundStrategy === 'indexed_high_growth' ? 'high-growth' : 'balanced'} portfolio costs you{' '}
          <strong className="font-mono">${growthWithFees.feeDragLoss.toLocaleString()}</strong> over {years} years
          ({growthWithFees.feeDragPct.toFixed(1)}% of your no-fee balance). Indexed funds (0.0-0.1%) keep nearly all of it.
        </p>
      </div>

      {/* Super vs Outside Investing Decision */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Super vs Outside Investing — the 15% vs Marginal Tax Decision</h3>
        </div>
        <p className="text-[11px] text-muted-foreground">
          For every <strong>$1 of pre-tax salary</strong>, super keeps {(decision.perDollarSuper * 100).toFixed(0)}c (after 15% contribution tax)
          while investing outside super keeps {(decision.perDollarOutside * 100).toFixed(0)}c (after your {Math.round(decision.outsideTaxRate * 100)}% marginal rate).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Inside Super</div>
            <div className="text-lg font-bold font-mono text-violet-500">${decision.futureValueSuper.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">by age 60 ({decision.yearsTo60} yrs @ 7.5%)</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Outside Super</div>
            <div className="text-lg font-bold font-mono text-foreground">${decision.futureValueOutside.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">same money, after marginal tax</div>
          </div>
          <div className={`rounded-xl border p-3 text-center flex flex-col items-center justify-center ${decision.superAdvantage >= 0 ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1">
              <span>Super Advantage</span>
              <InfoTooltip
                title="Super Tax Concession Advantage"
                content="Contributions and earnings inside super are taxed at a concessional 15% rate instead of your personal marginal tax rate. However, funds are preserved until age 60."
              />
            </div>
            <ComparisonPill
              delta={decision.superAdvantage}
              format="currency"
              size="md"
            />
            <div className="text-[10px] text-muted-foreground mt-1">
              {decision.superAdvantage >= 0 ? 'super wins by this much' : 'outside investing wins by this much'}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {decision.division293Applies
            ? `⚠️ Division 293: income + concessional contributions exceed $${SUPER_RULES.division293Threshold.toLocaleString()} — the extra 15% tax narrows super's advantage.`
            : `With your ${Math.round(decision.outsideTaxRate * 100)}% marginal rate, salary-sacrificing into super beats outside investing on $${decision.annualContributionCompared.toLocaleString()}/yr of pre-tax pay.`}
          {' '}Remember: super is locked away until preservation age (60) — only sacrifice money you won't need before then.
        </p>
      </div>

      {/* ATO Under 18 Rule Info */}
      {!isEligible ? (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">ATO Under 18 Rule:</span>
            Because you work {hoursWk} hours/week (30 or fewer hours), super is not compulsory under ATO rules. If you work 31+ hours in any week, your employer MUST pay 12% super!
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">12% Super Guarantee Active!</span>
            Your employer is paying ${Math.round(annualSuper).toLocaleString()}/yr into your super fund — and since Payday Super started on 1 July 2026 it must reach your fund within 7 business days of each payday. Make sure to complete <strong>ATO Form NAT 13080</strong> to staple your existing fund!
          </div>
        </div>
      )}

      {/* 2026-27 ATO contribution limits & government help */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">2026-27 ATO Super Limits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Concessional Cap (pre-tax)</div>
            <div className="text-base font-bold font-mono text-foreground">${SUPER_RULES.concessionalCap.toLocaleString()}</div>
            <div className="mt-1">Employer SG + salary sacrifice, taxed at 15% on the way in.</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Non-Concessional Cap (after-tax)</div>
            <div className="text-base font-bold font-mono text-foreground">${SUPER_RULES.nonConcessionalCap.toLocaleString()}</div>
            <div className="mt-1">Bring forward up to ${SUPER_RULES.bringForwardCap.toLocaleString()} over 3 years if your balance is under $1.84M.</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Government Co-Contribution</div>
            <div className="text-base font-bold font-mono text-foreground">up to ${SUPER_CO_CONTRIBUTION_2026_27.maxContribution}</div>
            <div className="mt-1">Earn under ${SUPER_CO_CONTRIBUTION_2026_27.upperThreshold.toLocaleString()} and add after-tax money? The ATO kicks in 50c per $1 (10% eligible-income test applies).</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Teen Super Projection"
      />

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_guarantee} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_choice_form} />
      </div>
    </Card>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Toggle } from '@/components/ui/Toggle';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Calculator, ShieldAlert, ReceiptText, CheckCircle2 } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '@/components/charts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { calcIncomeTax, calcLITO, calcMedicareLevy } from '@/data/tax-brackets';
import {
  afterSchoolJobTax,
  payslipBreakdown,
  calcDivision6AATax,
  calcCentsPerKmDeduction,
  EFFECTIVE_TAX_FREE_THRESHOLD,
  CENTS_PER_KM_RATE,
} from './engine';
import { PaySlipPreview } from './PaySlipPreview';
import { formatCurrency } from '@/utils/formatters';

interface TeenTaxPreset {
  annualIncome: number;
  uniform: number;
  laundry: number;
  protectiveGear: number;
  workKm: number;
  rsa: number;
  hours: number;
  rate: number;
}

const TEEN_TAX_PRESETS: ScenarioPreset<TeenTaxPreset>[] = [
  {
    id: 'under-threshold',
    label: 'High School Casual (100% Tax-Free)',
    badge: 'Under $18,200',
    description: '12 hrs/wk at $18.50/hr ($11,544/yr) — 100% tax-free under statutory threshold, full PAYG refund at lodgement',
    values: { annualIncome: 11544, uniform: 80, laundry: 40, protectiveGear: 70, workKm: 0, rsa: 0, hours: 12, rate: 18.5 },
  },
  {
    id: 'uni-casual',
    label: 'Uni Student Casual (LITO Protected)',
    badge: '$27k/yr',
    description: '20 hrs/wk at $26.00/hr ($27,040/yr) — Stage 3 15% rate on excess over $18.2k with $700 LITO offset reducing tax to just ~$626',
    values: { annualIncome: 27040, uniform: 120, laundry: 60, protectiveGear: 0, workKm: 0, rsa: 80, hours: 20, rate: 26.0 },
  },
  {
    id: 'apprentice-fulltime',
    label: 'Apprentice / Full-Time Trainee',
    badge: '$42k/yr',
    description: '38 hrs/wk trade trainee with steel caps, high-vis, tools and work delivery driving (91c/km)',
    values: { annualIncome: 42000, uniform: 180, laundry: 80, protectiveGear: 220, workKm: 1200, rsa: 0, hours: 38, rate: 21.25 },
  },
];

const CHART_CONFIG = {
  value: { label: 'Amount ($)', color: 'var(--chart-2, #10b981)' },
};

export function TeenTaxCalculator() {
  const { profile } = useTeenProfile();

  const [annualEarnedIncome, setAnnualEarnedIncome] = useState<number>(profile.hourlyRate * profile.hoursPerWeek * 52);
  const [uniformExpenses, setUniformExpenses] = useState<number>(100);
  const [laundryExpenses, setLaundryExpenses] = useState<number>(50);
  const [protectiveGearExpenses, setProtectiveGearExpenses] = useState<number>(0);
  const [workKmDriven, setWorkKmDriven] = useState<number>(0);
  const [rsaRcgCourseFees, setRsaRcgCourseFees] = useState<number>(0);
  const [unearnedInterestIncome, setUnearnedInterestIncome] = useState<number>(150);

  // After-school job model: weekly hours × hourly rate → annual estimate
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.hoursPerWeek);
  const [hourlyRate, setHourlyRate] = useState<number>(profile.hourlyRate);
  const [hasTFN, setHasTFN] = useState<boolean>(true);
  const [claimTaxFreeThreshold, setClaimTaxFreeThreshold] = useState<boolean>(profile.claimsTaxFreeThreshold);
  const [includeTeenHELP, setIncludeTeenHELP] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  const handleApplyPreset = (preset: ScenarioPreset<TeenTaxPreset>) => {
    setActivePreset(preset.id);
    if (preset.values.annualIncome !== undefined) setAnnualEarnedIncome(preset.values.annualIncome);
    if (preset.values.uniform !== undefined) setUniformExpenses(preset.values.uniform);
    if (preset.values.laundry !== undefined) setLaundryExpenses(preset.values.laundry);
    if (preset.values.protectiveGear !== undefined) setProtectiveGearExpenses(preset.values.protectiveGear);
    if (preset.values.workKm !== undefined) setWorkKmDriven(preset.values.workKm);
    if (preset.values.rsa !== undefined) setRsaRcgCourseFees(preset.values.rsa);
    if (preset.values.hours !== undefined) setWeeklyHours(preset.values.hours);
    if (preset.values.rate !== undefined) setHourlyRate(preset.values.rate);
  };

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setAnnualEarnedIncome(profile.hourlyRate * profile.hoursPerWeek * 52 || 14430);
    setUniformExpenses(100);
    setLaundryExpenses(50);
    setProtectiveGearExpenses(0);
    setWorkKmDriven(0);
    setRsaRcgCourseFees(0);
    setUnearnedInterestIncome(150);
    setWeeklyHours(profile.hoursPerWeek || 15);
    setHourlyRate(profile.hourlyRate || 18.5);
    setHasTFN(true);
    setClaimTaxFreeThreshold(true);
    setIncludeTeenHELP(false);
  }, [profile]);

  // Car travel deduction at 2026-27 ATO cents-per-km rate (91c/km, max 5,000 km)
  const vehicleDeduction = useMemo(
    () => calcCentsPerKmDeduction(workKmDriven, CENTS_PER_KM_RATE),
    [workKmDriven],
  );

  const totalDeductions = useMemo(
    () => uniformExpenses + laundryExpenses + protectiveGearExpenses + vehicleDeduction.deduction + rsaRcgCourseFees,
    [uniformExpenses, laundryExpenses, protectiveGearExpenses, vehicleDeduction.deduction, rsaRcgCourseFees],
  );

  const taxableEarnedIncome = Math.max(0, annualEarnedIncome - totalDeductions);

  // Income Tax on earned income using official 2026-27 Stage 3 brackets (15% on $18,201-$45,000)
  const grossEarnedTax = useMemo(() => calcIncomeTax(taxableEarnedIncome), [taxableEarnedIncome]);
  const litoOffset = useMemo(() => calcLITO(taxableEarnedIncome), [taxableEarnedIncome]);
  const netEarnedTax = useMemo(() => Math.max(0, grossEarnedTax - litoOffset), [grossEarnedTax, litoOffset]);
  const medicareLevy = useMemo(() => calcMedicareLevy(taxableEarnedIncome), [taxableEarnedIncome]);
  const totalJobTax = useMemo(() => netEarnedTax + medicareLevy, [netEarnedTax, medicareLevy]);

  const isUnderEffectiveThreshold = taxableEarnedIncome <= EFFECTIVE_TAX_FREE_THRESHOLD;

  // Division 6AA Minor Unearned Income Tax Math
  const div6aaResult = useMemo(
    () => calcDivision6AATax(unearnedInterestIncome),
    [unearnedInterestIncome],
  );
  const unearnedTax = div6aaResult.taxPayable;

  const jobTax = useMemo(
    () => afterSchoolJobTax(weeklyHours, hourlyRate, { includeHELP: includeTeenHELP, includeLITO: true }),
    [weeklyHours, hourlyRate, includeTeenHELP],
  );

  const payslip = useMemo(
    () => payslipBreakdown(weeklyHours, hourlyRate, {
      hasTFN,
      claimTaxFreeThreshold,
    }),
    [weeklyHours, hourlyRate, hasTFN, claimTaxFreeThreshold],
  );

  // Annualized PAYG tax withheld on weekly payslips
  const annualWithheldEstimate = payslip.taxWithheldWeekly * 52;
  const estimatedTaxRefund = Math.max(0, annualWithheldEstimate - totalJobTax);

  const netKeepIncome = annualEarnedIncome - totalJobTax;

  const chartData = useMemo(() => {
    return [
      { name: 'After-Tax Take-Home', value: Math.round(netKeepIncome), color: 'var(--chart-2, #10b981)' },
      { name: 'Income Tax Payable', value: Math.round(totalJobTax), color: 'var(--chart-3, #f59e0b)' },
      { name: 'Work Deductions', value: Math.round(totalDeductions), color: 'var(--chart-1, #3b82f6)' },
    ];
  }, [netKeepIncome, totalJobTax, totalDeductions]);

  const summaryText = useMemo(() => {
    return [
      '--- Teen Income Tax & First Tax Return Summary ---',
      `Annual Earned Income: ${formatCurrency(annualEarnedIncome)} (${weeklyHours} hrs/wk @ $${hourlyRate.toFixed(2)}/hr)`,
      `Work Deductions Claimed: ${formatCurrency(totalDeductions)}`,
      `  • Logo Uniforms: ${formatCurrency(uniformExpenses)}`,
      `  • Laundry: ${formatCurrency(laundryExpenses)}`,
      `  • Protective Gear: ${formatCurrency(protectiveGearExpenses)}`,
      `  • Car Travel (${vehicleDeduction.cappedKm} km @ 91c/km): ${formatCurrency(vehicleDeduction.deduction)}`,
      `  • RSA/RCG Training: ${formatCurrency(rsaRcgCourseFees)}`,
      `Taxable Income: ${formatCurrency(taxableEarnedIncome)}`,
      `Gross Tax (15% Stage 3 bracket): ${formatCurrency(grossEarnedTax)}`,
      `Low Income Tax Offset (LITO): -${formatCurrency(litoOffset)}`,
      `Medicare Levy (under $28,011): ${formatCurrency(medicareLevy)}`,
      `Net Assessed Tax Payable: ${formatCurrency(totalJobTax)} (${isUnderEffectiveThreshold ? '100% Tax-Free under $22,866 threshold' : `${((totalJobTax / taxableEarnedIncome) * 100).toFixed(1)}% effective`})`,
      `Weekly Payslip Gross: ${formatCurrency(payslip.grossWeekly)}/wk | Net: ${formatCurrency(payslip.netWeekly)}/wk`,
      `PAYG Tax Withheld: ${formatCurrency(payslip.taxWithheldWeekly)}/wk (${hasTFN ? (claimTaxFreeThreshold ? 'Tax-free threshold claimed' : 'No-threshold') : '47% No-TFN penalty'})`,
      `Estimated Refund at Lodgement: ${formatCurrency(estimatedTaxRefund)}`,
      `Superannuation (12% employer SG): ${formatCurrency(payslip.superWeekly)}/wk (paid on top of wages)`,
      ...(unearnedInterestIncome > 416 ? [`Division 6AA Unearned Minor Tax: ${formatCurrency(unearnedTax)} (${div6aaResult.description})`] : []),
      `Calculated via AusFinTools Teen Tax Engine (2026-27 Stage 3 ATO Rules)`,
    ].join('\n');
  }, [
    annualEarnedIncome,
    weeklyHours,
    hourlyRate,
    totalDeductions,
    uniformExpenses,
    laundryExpenses,
    protectiveGearExpenses,
    vehicleDeduction,
    rsaRcgCourseFees,
    taxableEarnedIncome,
    grossEarnedTax,
    litoOffset,
    medicareLevy,
    totalJobTax,
    isUnderEffectiveThreshold,
    payslip,
    hasTFN,
    claimTaxFreeThreshold,
    estimatedTaxRefund,
    unearnedInterestIncome,
    unearnedTax,
    div6aaResult,
  ]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Tax, Work Deductions & PAYG Refund Calculator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimate your 2026-27 annual tax, work uniform & 91c/km car deductions, payslip PAYG withholding, and ATO Division 6AA unearned rates!
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="success">
            2026-27 Stage 3 (15% Rate)
          </Badge>
          <Badge variant="info">
            Effective ${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} Tax-Free
          </Badge>
        </div>
      </div>

      {/* Quick Presets */}
      <QuickPresetBar
        presets={TEEN_TAX_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Teen Work & Study Tax Scenarios"
      />

      {/* Main Income & Deductions Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Annual Gross Job Income ($)"
            value={annualEarnedIncome}
            onChange={v => setAnnualEarnedIncome(v)}
            min={500}
            max={75000}
            step={500}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="Effective $22,866 Tax-Free Threshold"
                content="Under Stage 3 tax rates, the statutory $18,200 threshold plus the $700 Low Income Tax Offset (LITO ÷ 15%) means you pay $0 tax on earnings up to $22,866!"
              />
            }
          />

          <NumberInput
            label="Compulsory Logo Uniform Expenses ($)"
            value={uniformExpenses}
            onChange={v => setUniformExpenses(v)}
            min={0}
            max={1000}
            step={20}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="Compulsory Uniforms"
                content="Only clothing with your employer's logo permanently attached is deductible (e.g. McDonald's polo, Coles apron). Plain black shirts/pants are NOT claimable."
              />
            }
          />

          <NumberInput
            label="Uniform Laundry Allowance ($)"
            value={laundryExpenses}
            onChange={v => setLaundryExpenses(v)}
            min={0}
            max={150}
            step={10}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="Laundry Allowance"
                content="You can claim up to $150 per year for washing logo uniforms without receipts ($1/load work only, 50c/load mixed with everyday clothes)."
              />
            }
          />

          <NumberInput
            label="Protective Footwear & Safety Gear ($)"
            value={protectiveGearExpenses}
            onChange={v => setProtectiveGearExpenses(v)}
            min={0}
            max={600}
            step={25}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="Protective Gear"
                content="Non-slip shoes for kitchen floors, steel-cap boots, high-vis vests, and sunscreen/sunglasses for outdoor workers."
              />
            }
          />
        </div>

        <div className="space-y-4">
          <NumberInput
            label={`Work Car Travel (${Math.round(CENTS_PER_KM_RATE * 100)}c/km ATO Rate)`}
            value={workKmDriven}
            onChange={v => setWorkKmDriven(v)}
            min={0}
            max={5000}
            step={50}
            suffix="km"
            tooltip={
              <InfoTooltip
                title="91c/km Car Deduction"
                content="Using your personal vehicle for work duties (delivering food, inter-branch travel). Regular commuting between home and work is NOT deductible. Capped at 5,000 km."
              />
            }
          />

          <NumberInput
            label="RSA / RCG / First Aid Course Fees ($)"
            value={rsaRcgCourseFees}
            onChange={v => setRsaRcgCourseFees(v)}
            min={0}
            max={500}
            step={25}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="Workplace Qualifications"
                content="Course fees directly required to maintain or advance in your current job (RSA for hospitality, First Aid for lifeguarding/sports coaching)."
              />
            }
          />

          <NumberInput
            label="Bank Interest & Dividends (Division 6AA Unearned) ($)"
            value={unearnedInterestIncome}
            onChange={v => setUnearnedInterestIncome(v)}
            min={0}
            max={5000}
            step={50}
            prefix="$"
            tooltip={
              <InfoTooltip
                title="ATO Division 6AA Minor Rules"
                content="Minors under 18 pay punitive tax rates (up to 45%–66%) on unearned/passive income over $416 to stop tax avoidance by adult relatives. Wages from your job are 100% exempt!"
              />
            }
          />

          {/* Deductions Summary Callout */}
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 text-xs space-y-1">
            <div className="flex justify-between font-bold text-foreground">
              <span>Total Work Deductions:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">${totalDeductions.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex justify-between">
              <span>Vehicle Claim ({vehicleDeduction.cappedKm} km × 91c/km):</span>
              <span className="font-mono">${vehicleDeduction.deduction.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">
              Note: Starting 2026-27, the ATO provides an automatic $1,000 standard deduction if you do not keep itemized work receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Donut Chart Visualizer */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 font-mono">Gross Income Breakdown</h3>
        <ChartContainer config={CHART_CONFIG} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}/yr`, 'Value']} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Three High-Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        <StatCard
          label="Total Work Deductions"
          value={`$${totalDeductions.toFixed(2)}`}
          numericValue={totalDeductions}
          format="currency"
          color="green"
          subtext={`Uniform, gear + ${vehicleDeduction.cappedKm} km car travel`}
        />
        <StatCard
          label="Job Tax Payable"
          value={`$${totalJobTax.toFixed(2)}`}
          numericValue={totalJobTax}
          format="currency"
          color={totalJobTax === 0 ? 'green' : 'amber'}
          subtext={
            isUnderEffectiveThreshold
              ? `🎉 Under $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} — $0 Net Tax!`
              : medicareLevy > 0
                ? `Gross $${grossEarnedTax.toFixed(0)} − $${litoOffset.toFixed(0)} LITO + $${medicareLevy.toFixed(0)} Medicare`
                : `Gross $${grossEarnedTax.toFixed(0)} − $${litoOffset.toFixed(0)} LITO`
          }
        />
        <StatCard
          label="Div 6AA Minor Tax"
          value={`$${unearnedTax.toFixed(2)}`}
          numericValue={unearnedTax}
          format="currency"
          color={unearnedTax === 0 ? 'green' : 'red'}
          subtext={
            unearnedInterestIncome <= 416
              ? 'Under $416 tax-free minor limit'
              : div6aaResult.bracket === 'shade_in'
                ? '66% shade-in rate on >$416'
                : '45% flat rate on entire amount'
          }
        />
        <StatCard
          label="Est. Refund at Lodgement"
          value={`$${estimatedTaxRefund.toFixed(2)}`}
          numericValue={estimatedTaxRefund}
          format="currency"
          color={estimatedTaxRefund > 0 ? 'purple' : 'blue'}
          subtext={
            estimatedTaxRefund > 0
              ? 'PAYG withheld returned via myTax'
              : 'No refund owing ($0 PAYG withheld)'
          }
        />
      </div>

      {/* Educational Banner: Effective Tax-Free Threshold & Medicare Exemption */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-3 text-emerald-950 dark:text-emerald-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-sm font-bold text-emerald-800 dark:text-emerald-300">
            2026-27 Effective Tax-Free Threshold: ${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} & $28,011 Medicare Exemption
          </strong>
          <p className="leading-relaxed">
            While Australia’s statutory tax-free threshold is $18,200, the <strong>$700 Low Income Tax Offset (LITO)</strong> completely wipes out tax on the first $4,666.67 of earnings in the 15% bracket ($700 ÷ 0.15 = $4,666.67).
            This means you pay <strong>$0 net income tax on total earnings up to ${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')}</strong>!
            Furthermore, under the statutory low-income reduction threshold of <strong>$28,011</strong>, you pay <strong>$0 Medicare levy</strong> (saving 2% compared to standard earners).
            Any PAYG tax your employer withheld will be refunded 100% when you lodge in July/August.
          </p>
        </div>
      </div>

      {/* After-School Job & Weekly Pay Slip Model */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Weekly Pay Slip & PAYG Withholding Simulator
          </h3>
          <Badge variant="info" className="ml-auto">
            ${jobTax.annualGross.toLocaleString('en-AU')}/yr Gross
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberInput
            label="Hours Per Week"
            value={weeklyHours}
            onChange={v => setWeeklyHours(Math.max(0, v))}
            min={0}
            max={40}
            step={0.5}
            suffix="hrs"
          />
          <NumberInput
            label="Hourly Rate ($)"
            value={hourlyRate}
            onChange={v => setHourlyRate(Math.max(0, v))}
            min={0}
            max={60}
            step={0.5}
            prefix="$"
          />
          <div className="col-span-2 flex flex-col justify-center gap-2">
            <Toggle
              label="Quoted TFN to Employer"
              checked={hasTFN}
              onChange={setHasTFN}
              description={
                hasTFN
                  ? 'Quoting your 9-digit TFN stops the punitive 47% No-TFN withholding rate'
                  : 'No TFN provided — employer must withhold 47% on all pay!'
              }
            />
            {hasTFN && (
              <Toggle
                label="Claim Tax-Free Threshold (Question 8 on NAT 3092)"
                checked={claimTaxFreeThreshold}
                onChange={setClaimTaxFreeThreshold}
                description={
                  claimTaxFreeThreshold
                    ? 'Recommended for your primary or only job ($0 withheld on pay under $350/wk)'
                    : 'Select "No" only for a second concurrent job to avoid tax owing'
                }
              />
            )}
            <Toggle
              label="Include HELP/HECS repayment (Uni Students)"
              checked={includeTeenHELP}
              onChange={setIncludeTeenHELP}
              description="Compulsory repayments start at $69,528 repayment income for 2026-27"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PaySlipPreview
            rows={payslip.rows}
            grossWeekly={payslip.grossWeekly}
            netWeekly={payslip.netWeekly}
            superWeekly={payslip.superWeekly}
            annualGross={jobTax.annualGross}
            weeklyHours={weeklyHours}
            hourlyRate={hourlyRate}
            hasTFN={hasTFN}
            claimsTaxFreeThreshold={claimTaxFreeThreshold}
          />
          <div className="grid grid-cols-2 gap-3 content-start">
            <StatCard
              label="Weekly Take-Home"
              value={`$${payslip.netWeekly.toFixed(2)}`}
              numericValue={payslip.netWeekly}
              format="currency"
              color="green"
              subtext={`PAYG Withheld: $${payslip.taxWithheldWeekly.toFixed(2)}/wk`}
            />
            <StatCard
              label="Annual Assessed Tax"
              value={`$${jobTax.totalTax.toLocaleString('en-AU')}`}
              numericValue={jobTax.totalTax}
              format="currency"
              color={jobTax.totalTax === 0 ? 'green' : 'amber'}
              subtext={
                jobTax.annualGross <= EFFECTIVE_TAX_FREE_THRESHOLD
                  ? 'Under $22,866 — $0 tax!'
                  : `${(jobTax.effectiveRate * 100).toFixed(1)}% effective rate`
              }
            />
            <StatCard
              label="Employer Super (12%)"
              value={`$${payslip.superWeekly.toFixed(2)}`}
              numericValue={payslip.superWeekly}
              format="currency"
              color="blue"
              subtext="Paid into super ON TOP of wage"
            />
            <StatCard
              label="Annual Take-Home"
              value={`$${jobTax.netAnnual.toLocaleString('en-AU')}`}
              numericValue={jobTax.netAnnual}
              format="currency"
              color="purple"
              subtext={includeTeenHELP ? `HELP: $${jobTax.helpRepayment.toLocaleString('en-AU')}/yr` : 'No HELP repayment'}
            />
          </div>
        </div>
      </div>

      {/* Division 6AA Warning Callout */}
      {unearnedInterestIncome > 416 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5 text-rose-950 dark:text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">ATO Division 6AA Minor Unearned Income Warning:</strong>
            <p className="leading-relaxed">
              Because your passive investment/interest income of ${unearnedInterestIncome} exceeds the <strong>$416 statutory tax-free threshold</strong> for minors under 18, the ATO assesses <strong>${unearnedTax.toFixed(2)}</strong> in Division 6AA tax.
              {div6aaResult.bracket === 'shade_in' && ' This amount is in the 66% shade-in zone between $417 and $1,307.'}
              {div6aaResult.bracket === 'top_rate' && ' This exceeds $1,307, so the entire amount is taxed at the flat 45% top minor rate.'}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="Teen Tax Summary"
      />

      {/* Reference Links */}
      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_under18} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_minor_income} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_deductions_clothing} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_lito} />
      </div>
    </Card>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { TEEN_CAR_COST_DEFAULTS } from '@/data/teen-finance-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Car, CheckCircle2, Flame, Wrench, TrendingDown, ShieldCheck } from 'lucide-react';
import { firstCarTotalCostOfOwnership } from './engine';
import { formatCurrency } from '@/utils/formatters';

interface FirstCarInputs {
  purchasePrice: number;
  purchaseType: 'cash' | 'loan';
  weeklyFuel: number;
  regoAnnual: number;
  ctpAnnual: number;
  insuranceAnnual: number;
  servicingAnnual: number;
  repairsAnnual: number;
  depreciationRatePct: number;
}

const CAR_PRESETS: ScenarioPreset<FirstCarInputs>[] = [
  {
    id: 'beater',
    label: '$5k First Beater',
    badge: 'Cash • $0 Debt',
    description: 'Affordable runabout bought outright with cash, low third-party fire/theft insurance',
    values: {
      purchasePrice: 5000,
      purchaseType: 'cash',
      weeklyFuel: 45,
      regoAnnual: 450,
      ctpAnnual: 400,
      insuranceAnnual: 850,
      servicingAnnual: 450,
      repairsAnnual: 350,
      depreciationRatePct: 15,
    },
  },
  {
    id: 'reliable-hatch',
    label: '$10k Reliable Hatch',
    badge: 'Smart Saver',
    description: 'Corolla / i30 / Yaris in cash with teen comprehensive insurance & peace of mind',
    values: {
      purchasePrice: 10000,
      purchaseType: 'cash',
      weeklyFuel: 50,
      regoAnnual: 450,
      ctpAnnual: 400,
      insuranceAnnual: 2000,
      servicingAnnual: 450,
      repairsAnnual: 350,
      depreciationRatePct: 15,
    },
  },
  {
    id: 'finance-trap',
    label: '$15k Finance Trap',
    badge: '12.5% Debt Trap',
    description: 'Dealer finance trap showing how $15k balloons with $5.6k interest + mandatory comprehensive',
    values: {
      purchasePrice: 15000,
      purchaseType: 'loan',
      weeklyFuel: 55,
      regoAnnual: 450,
      ctpAnnual: 400,
      insuranceAnnual: 2200,
      servicingAnnual: 450,
      repairsAnnual: 350,
      depreciationRatePct: 15,
    },
  },
];

export function FirstCarCostCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(TEEN_CAR_COST_DEFAULTS.averagePurchasePrice);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'loan'>('cash');
  const [weeklyFuel, setWeeklyFuel] = useState<number>(TEEN_CAR_COST_DEFAULTS.fuelWeekly);
  const [depreciationRatePct, setDepreciationRatePct] = useState<number>(15);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  // Adjustable running costs (2026-27 defaults: Rego+CTP ~$850, Teen Insurance ~$2,000, Tyres/Servicing $800)
  const [regoAnnual, setRegoAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.regoAnnual);
  const [ctpAnnual, setCtpAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.ctpGreenSlipAnnual);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.comprehensiveInsuranceUnder25);
  const [servicingAnnual, setServicingAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.servicingAnnual);
  const [repairsAnnual, setRepairsAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.tiresAndRepairsAnnual);

  const handleApplyPreset = (preset: ScenarioPreset<FirstCarInputs>) => {
    setActivePreset(preset.id);
    if (preset.values.purchasePrice !== undefined) setPurchasePrice(preset.values.purchasePrice);
    if (preset.values.purchaseType !== undefined) setPurchaseType(preset.values.purchaseType);
    if (preset.values.weeklyFuel !== undefined) setWeeklyFuel(preset.values.weeklyFuel);
    if (preset.values.regoAnnual !== undefined) setRegoAnnual(preset.values.regoAnnual);
    if (preset.values.ctpAnnual !== undefined) setCtpAnnual(preset.values.ctpAnnual);
    if (preset.values.insuranceAnnual !== undefined) setInsuranceAnnual(preset.values.insuranceAnnual);
    if (preset.values.servicingAnnual !== undefined) setServicingAnnual(preset.values.servicingAnnual);
    if (preset.values.repairsAnnual !== undefined) setRepairsAnnual(preset.values.repairsAnnual);
    if (preset.values.depreciationRatePct !== undefined) setDepreciationRatePct(preset.values.depreciationRatePct);
  };

  const handleResetDefaults = useCallback(() => {
    setActivePreset(undefined);
    setPurchasePrice(TEEN_CAR_COST_DEFAULTS.averagePurchasePrice);
    setPurchaseType('cash');
    setWeeklyFuel(TEEN_CAR_COST_DEFAULTS.fuelWeekly);
    setRegoAnnual(TEEN_CAR_COST_DEFAULTS.regoAnnual);
    setCtpAnnual(TEEN_CAR_COST_DEFAULTS.ctpGreenSlipAnnual);
    setInsuranceAnnual(TEEN_CAR_COST_DEFAULTS.comprehensiveInsuranceUnder25);
    setServicingAnnual(TEEN_CAR_COST_DEFAULTS.servicingAnnual);
    setRepairsAnnual(TEEN_CAR_COST_DEFAULTS.tiresAndRepairsAnnual);
    setDepreciationRatePct(15);
  }, []);

  const combinedRegoCtp = regoAnnual + ctpAnnual;
  const combinedTyresServicing = servicingAnnual + repairsAnnual;
  const annualFuel = weeklyFuel * 52;
  const annualRunningCosts = combinedRegoCtp + insuranceAnnual + combinedTyresServicing + annualFuel;
  const weeklyRunningCost = annualRunningCosts / 52;

  // Statutory upfront acquisition costs (QLD schedule)
  const ppsrFee = 2.00;
  const tmrTransferFee = 33.65;
  const transferDuty = Math.round(purchasePrice * 0.03); // standard 3.0% for 1-4 cyl
  const totalDayOneStatutoryFees = ppsrFee + tmrTransferFee + transferDuty;
  const totalDayOneCashRequired = purchasePrice + totalDayOneStatutoryFees;

  // Loan trap math (12.5% p.a. dealer/bank finance over 3 years)
  const loanInterestRate = 0.125;
  const loanTermYears = 3;
  const totalLoanInterest = purchaseType === 'loan' ? purchasePrice * loanInterestRate * loanTermYears : 0;
  const totalPurchaseCost = purchasePrice + totalLoanInterest;

  // 5-year total cost of ownership with depreciation
  const tco = useMemo(
    () => firstCarTotalCostOfOwnership(totalPurchaseCost, annualRunningCosts, 5, depreciationRatePct / 100),
    [totalPurchaseCost, annualRunningCosts, depreciationRatePct]
  );

  const weeklyCostWithLoan = weeklyRunningCost + (totalLoanInterest / 156);

  const summaryText = useMemo(() => {
    return [
      '--- First Car Cost & TCO Summary (2026-27) ---',
      `Strategy: ${purchaseType === 'cash' ? 'Cash ($0 Interest)' : `3-Year Dealer Loan (+$${Math.round(totalLoanInterest).toLocaleString()} interest @ 12.5%)`}`,
      `Purchase Price: ${formatCurrency(purchasePrice)} | Total Acquisition Outlay: ${formatCurrency(totalPurchaseCost)}`,
      `Upfront Statutory Fees: ${formatCurrency(totalDayOneStatutoryFees)} (PPSR $2.00 + TMR Transfer $33.65 + QLD Duty ${formatCurrency(transferDuty)}) | Day-1 Cash Needed: ${formatCurrency(totalDayOneCashRequired)}`,
      `Rego + CTP: ${formatCurrency(combinedRegoCtp)}/yr | Teen Insurance: ${formatCurrency(insuranceAnnual)}/yr`,
      `Tyres & Servicing: ${formatCurrency(combinedTyresServicing)}/yr | Fuel: ${formatCurrency(annualFuel)}/yr (${formatCurrency(weeklyFuel)}/wk)`,
      `Total Annual Running Costs: ${formatCurrency(annualRunningCosts)}/yr (${formatCurrency(weeklyRunningCost)}/wk)`,
      `5-Yr Depreciation Loss: ${formatCurrency(tco.totalDepreciation)} (Resale Value: ${formatCurrency(tco.estimatedResaleValue)})`,
      `5-Yr Gross Outlay (TCO): ${formatCurrency(tco.tcoOverYears)} (${(tco.runningCostsShare * 100).toFixed(0)}% running costs)`,
      `5-Yr Net Economic Cost: ${formatCurrency(tco.netEconomicCost)} (${formatCurrency(tco.netCostPerWeek)}/wk)`,
      `Calculated via AusFinTools First Car Simulator`,
    ].join('\n');
  }, [
    purchaseType,
    totalLoanInterest,
    purchasePrice,
    totalPurchaseCost,
    totalDayOneStatutoryFees,
    transferDuty,
    totalDayOneCashRequired,
    combinedRegoCtp,
    insuranceAnnual,
    combinedTyresServicing,
    annualFuel,
    weeklyFuel,
    annualRunningCosts,
    weeklyRunningCost,
    tco,
  ]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-foreground">First Car True Cost & Barefoot Cash Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            2026-27 parameters: Rego + CTP (~$850/yr), Teen Insurance (~$2,000/yr), Servicing/Tyres ($800/yr), Depreciation & Cash vs Loan!
          </p>
        </div>
        <Badge variant="warning">
          PPSR & Car Cost Calculator
        </Badge>
      </div>

      {/* Quick Preset Bar */}
      <QuickPresetBar
        presets={CAR_PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Car Budget Scenarios"
      />

      {/* Purchase Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Car Purchase Price ($)"
            value={purchasePrice}
            onChange={v => {
              setPurchasePrice(v);
              setActivePreset(undefined);
            }}
            min={1000}
            max={25000}
            step={500}
            prefix="$"
            tooltip={<InfoTooltip term="ppsr" />}
          />

          <NumberInput
            label="Weekly Fuel Budget ($)"
            value={weeklyFuel}
            onChange={v => {
              setWeeklyFuel(v);
              setActivePreset(undefined);
            }}
            min={10}
            max={200}
            step={5}
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">Purchase Strategy (Barefoot Warning)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPurchaseType('cash');
                setActivePreset(undefined);
              }}
              className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                purchaseType === 'cash'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              <div className="font-extrabold">Bought In CASH 🤠</div>
              <div className="text-[10px] opacity-90">$0 Interest • Barefoot Rule</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setPurchaseType('loan');
                setActivePreset(undefined);
              }}
              className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                purchaseType === 'loan'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              <div className="font-extrabold">3-Yr Car Finance 💥</div>
              <div className="text-[10px] opacity-90">+12.5% Interest Trap</div>
            </button>
          </div>
        </div>
      </div>

      {/* Running cost sliders */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Wrench className="w-4 h-4" />
            <h3 className="font-bold text-sm text-foreground">Yearly Running Costs (2026-27 Benchmarks)</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            Rego+CTP: ${combinedRegoCtp}/yr • Tyres/Service: ${combinedTyresServicing}/yr
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <SliderControl
            label="Registration (QLD rego)"
            value={regoAnnual}
            onChange={v => {
              setRegoAnnual(v);
              setActivePreset(undefined);
            }}
            min={300}
            max={800}
            step={25}
            prefix="$"
            suffix="/yr"
            tooltip={<InfoTooltip term="rego" />}
          />
          <SliderControl
            label="CTP Green Slip (mandatory Class 1)"
            value={ctpAnnual}
            onChange={v => {
              setCtpAnnual(v);
              setActivePreset(undefined);
            }}
            min={250}
            max={700}
            step={10}
            prefix="$"
            suffix="/yr"
            tooltip={<InfoTooltip term="ctp" />}
          />
          <SliderControl
            label="Comprehensive / Third Party Insurance (~$2,000/yr teen avg)"
            value={insuranceAnnual}
            onChange={v => {
              setInsuranceAnnual(v);
              setActivePreset(undefined);
            }}
            min={300}
            max={3500}
            step={50}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Annual Logbook Servicing & Fluids (~$450/yr)"
            value={servicingAnnual}
            onChange={v => {
              setServicingAnnual(v);
              setActivePreset(undefined);
            }}
            min={150}
            max={1000}
            step={25}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Tyres & Unexpected Repairs (~$350/yr)"
            value={repairsAnnual}
            onChange={v => {
              setRepairsAnnual(v);
              setActivePreset(undefined);
            }}
            min={0}
            max={1200}
            step={25}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Annual Depreciation Rate (%/yr reducing balance)"
            value={depreciationRatePct}
            onChange={v => {
              setDepreciationRatePct(v);
              setActivePreset(undefined);
            }}
            min={5}
            max={25}
            step={1}
            suffix="%"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          QLD rego + CTP averages ~$850/yr. Young drivers under 25 pay ~$2,000/yr for comprehensive insurance. Over 5 years, running costs and depreciation dwarf the car's initial purchase price!
        </p>
      </div>

      {/* Upfront Statutory Acquisition Outlay */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">
              Day-1 Outlay: Purchase Price + Mandatory QLD Government Transfer Fees
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-foreground">
            Day 1 Total: {formatCurrency(totalDayOneCashRequired)}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-background/80 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Car Price (To Seller)</span>
            <span className="font-mono font-bold text-foreground text-sm">{formatCurrency(purchasePrice)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-background/80 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Official PPSR Check</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">$2.00</span>
            <span className="text-[9px] text-muted-foreground block">ppsr.gov.au (avoid $25 ads)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-background/80 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">TMR Vehicle Transfer Fee</span>
            <span className="font-mono font-bold text-foreground text-sm">$33.65</span>
            <span className="text-[9px] text-muted-foreground block">Payable within 14 days</span>
          </div>
          <div className="p-2.5 rounded-xl bg-background/80 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">QLD Transfer Duty (3.0%)</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(transferDuty)}</span>
            <span className="text-[9px] text-muted-foreground block">$3.00 per $100 (4-cyl)</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground pt-0.5">
          *Before driving your car home, mandatory government transfer costs add <strong>{formatCurrency(totalDayOneStatutoryFees)}</strong> on top of the sticker price. Plus, arrange at least Third-Party Property Damage insurance immediately!
        </p>
      </div>

      {/* Results Cards - Upfront & Annual Running Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Total Car Purchase Cost"
          value={`$${totalPurchaseCost.toLocaleString()}`}
          numericValue={totalPurchaseCost}
          format="currency"
          color={purchaseType === 'cash' ? 'green' : 'red'}
          subtext={purchaseType === 'cash' ? 'Bought 100% in cash' : `Includes $${Math.round(totalLoanInterest).toLocaleString()} loan interest!`}
          delta={purchaseType === 'loan' ? Math.round(totalLoanInterest) : undefined}
          deltaFormat="currency"
          deltaInverse={true}
        />
        <StatCard
          label="Annual Running Costs"
          value={`$${Math.round(annualRunningCosts).toLocaleString()}/yr`}
          numericValue={Math.round(annualRunningCosts)}
          format="currency"
          color="blue"
          subtext={`Rego+CTP ($${combinedRegoCtp}) • Ins ($${insuranceAnnual}) • Service ($${combinedTyresServicing})`}
        />
        <StatCard
          label="Weekly Total Car Cost"
          value={`$${weeklyCostWithLoan.toFixed(2)}/wk`}
          numericValue={Math.round(weeklyCostWithLoan)}
          format="currency"
          color="purple"
          subtext="True weekly cash out of your paycheck"
        />
      </div>

      {/* 5-year total cost of ownership & Depreciation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="5-Year Total Cash Outlay (TCO)"
          value={`$${tco.tcoOverYears.toLocaleString()}`}
          numericValue={tco.tcoOverYears}
          format="currency"
          color={tco.runningCostsShare > 0.5 ? 'red' : 'blue'}
          subtext={`Purchase + ${tco.years} years of running costs`}
        />
        <StatCard
          label="5-Year Depreciation Loss"
          value={`$${tco.totalDepreciation.toLocaleString()}`}
          numericValue={tco.totalDepreciation}
          format="currency"
          color="amber"
          subtext={`Resale value in 5 yrs: ≈ $${tco.estimatedResaleValue.toLocaleString()}`}
        />
        <StatCard
          label="5-Year Net Economic Cost"
          value={`$${tco.netEconomicCost.toLocaleString()}`}
          numericValue={tco.netEconomicCost}
          format="currency"
          color="purple"
          subtext={`Depreciation + running costs (≈ $${tco.netCostPerWeek.toFixed(2)}/wk)`}
        />
      </div>

      {/* Detailed Savings & Breakdown Callout */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-primary" />
          5-Year Running Cost & Depreciation Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block">Rego + CTP (5 yrs)</span>
            <span className="font-mono font-bold text-foreground text-sm">${(combinedRegoCtp * 5).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground block">~${combinedRegoCtp}/yr</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block">Insurance (5 yrs)</span>
            <span className="font-mono font-bold text-foreground text-sm">${(insuranceAnnual * 5).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground block">~${insuranceAnnual}/yr under-25</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block">Tyres & Servicing (5 yrs)</span>
            <span className="font-mono font-bold text-foreground text-sm">${(combinedTyresServicing * 5).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground block">~${combinedTyresServicing}/yr ($800)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block">Fuel (5 yrs)</span>
            <span className="font-mono font-bold text-foreground text-sm">${(annualFuel * 5).toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground block">${weeklyFuel}/wk @ $2.38/L</span>
          </div>
        </div>
      </div>

      {/* Barefoot Warning Callout */}
      {purchaseType === 'loan' ? (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
          <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Scott Pape's Car Debt Warning:</span>
            Financing a car at 17-20 adds <strong>${Math.round(totalLoanInterest).toLocaleString()} in dead interest</strong>, locks you into mandatory <strong>$2,000+/yr comprehensive insurance</strong>, and suffers <strong>${tco.totalDepreciation.toLocaleString()} in depreciation</strong>. You blow nearly $14,000 before even paying for petrol. Buy a reliable $5k-$10k used car in CASH!
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Barefoot Cash Strategy Approved!</span>
            By buying outright in cash, you save <strong>${Math.round(purchasePrice * loanInterestRate * loanTermYears).toLocaleString()} in loan interest</strong>, retain the freedom to choose appropriate insurance, and experience minimal depreciation loss. Always do an official $2 PPSR check at <strong>ppsr.gov.au</strong> before handing over any money!
          </div>
        </div>
      )}

      {/* Action controls */}
      <CalculatorActions
        onReset={handleResetDefaults}
        summaryText={summaryText}
        summaryTitle="First Car Cost Summary"
      />

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ppsr_check} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_car} />
      </div>
    </Card>
  );
}

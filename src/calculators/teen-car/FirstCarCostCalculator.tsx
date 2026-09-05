import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { OFFICIAL_WEB_LINKS, TEEN_CAR_COST_DEFAULTS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Car, CheckCircle2, Flame, Wrench } from 'lucide-react';
import { firstCarTotalCostOfOwnership } from './engine';

export function FirstCarCostCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(TEEN_CAR_COST_DEFAULTS.averagePurchasePrice);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'loan'>('cash');
  const [weeklyFuel, setWeeklyFuel] = useState<number>(TEEN_CAR_COST_DEFAULTS.fuelWeekly);

  // Adjustable running costs (defaults from TEEN_CAR_COST_DEFAULTS)
  const [regoAnnual, setRegoAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.regoAnnual);
  const [ctpAnnual, setCtpAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.ctpGreenSlipAnnual);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.comprehensiveInsuranceUnder25);
  const [servicingAnnual, setServicingAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.servicingAnnual);
  const [repairsAnnual, setRepairsAnnual] = useState<number>(TEEN_CAR_COST_DEFAULTS.tiresAndRepairsAnnual);

  const annualRunningCosts = regoAnnual + ctpAnnual + insuranceAnnual + servicingAnnual + repairsAnnual + (weeklyFuel * 52);
  const weeklyRunningCost = annualRunningCosts / 52;

  // Loan trap math (12.5% over 3 years)
  const loanInterestRate = 0.125;
  const loanTermYears = 3;
  const totalLoanInterest = purchaseType === 'loan' ? purchasePrice * loanInterestRate * loanTermYears : 0;
  const totalPurchaseCost = purchasePrice + totalLoanInterest;

  // 5-year total cost of ownership (Barefoot horizon)
  const tco = useMemo(
    () => firstCarTotalCostOfOwnership(totalPurchaseCost, annualRunningCosts, 5),
    [totalPurchaseCost, annualRunningCosts]
  );

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-foreground">First Car True Cost & Barefoot Cash Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculate your true annual running costs (rego, CTP green slip, insurance, fuel) & compare Cash vs Dealer Debt!
          </p>
        </div>
        <Badge variant="warning">
          PPSR & Car Cost Calculator
        </Badge>
      </div>

      {/* Purchase Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Car Purchase Price ($)"
            value={purchasePrice}
            onChange={v => setPurchasePrice(v)}
            min={1000}
            max={25000}
            step={500}
            prefix="$"
            tooltip={<InfoTooltip term="ppsr" />}
          />

          <NumberInput
            label="Weekly Fuel Budget ($)"
            value={weeklyFuel}
            onChange={v => setWeeklyFuel(v)}
            min={10}
            max={200}
            step={5}
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">Purchase Strategy (Barefoot Warning)</label>          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPurchaseType('cash')}
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
              onClick={() => setPurchaseType('loan')}
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
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Wrench className="w-4 h-4" />
          <h3 className="font-bold text-sm text-foreground">Yearly Running Costs (QLD 2026)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <SliderControl
            label="Registration (QLD rego)"
            value={regoAnnual}
            onChange={v => setRegoAnnual(v)}
            min={600}
            max={1200}
            step={10}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="CTP Green Slip (compulsory 3rd party)"
            value={ctpAnnual}
            onChange={v => setCtpAnnual(v)}
            min={400}
            max={900}
            step={10}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Comprehensive Insurance (under 25)"
            value={insuranceAnnual}
            onChange={v => setInsuranceAnnual(v)}
            min={900}
            max={3000}
            step={50}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Servicing & Maintenance"
            value={servicingAnnual}
            onChange={v => setServicingAnnual(v)}
            min={200}
            max={1000}
            step={25}
            prefix="$"
            suffix="/yr"
          />
          <SliderControl
            label="Tires & Unexpected Repairs"
            value={repairsAnnual}
            onChange={v => setRepairsAnnual(v)}
            min={0}
            max={1200}
            step={50}
            prefix="$"
            suffix="/yr"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Running costs often exceed the purchase price over 5 years — see the Total Cost of Ownership below.
        </p>
      </div>

      {/* Results */}
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
          color="blue"
          subtext="Rego, CTP, Insurance, Fuel, Service"
        />
        <StatCard
          label="Weekly Total Car Cost"
          value={`$${(weeklyRunningCost + (totalLoanInterest / 156)).toFixed(2)}/wk`}
          color="purple"
          subtext="True weekly cost out of your paycheck"
        />
      </div>

      {/* 5-year total cost of ownership */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="5-Year Total Cost of Ownership"
          value={`$${tco.tcoOverYears.toLocaleString()}`}
          numericValue={tco.tcoOverYears}
          format="currency"
          color={tco.runningCostsShare > 0.5 ? 'red' : 'blue'}
          subtext={`Purchase + ${tco.years} years of running costs`}
        />
        <StatCard
          label="Running Costs Share of TCO"
          value={`${(tco.runningCostsShare * 100).toFixed(0)}%`}
          numericValue={tco.runningCostsShare}
          format="percent"
          color="purple"
          subtext="The real cost of a car is running it"
        />
        <StatCard
          label="True Weekly Cost (5-yr avg)"
          value={`$${tco.costPerWeek.toFixed(2)}/wk`}
          numericValue={tco.costPerWeek}
          format="currency"
          color="amber"
          subtext={`≈ $${tco.costPerMonth.toFixed(0)}/month out of your paycheck`}
        />
      </div>

      {/* Barefoot Warning Callout */}
      {purchaseType === 'loan' ? (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
          <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Scott Pape's Car Debt Warning:</span>
            Taking out a $4,500 car loan at 17 adds <strong>${Math.round(totalLoanInterest).toLocaleString()} in interest</strong> and forces expensive comprehensive insurance, blowing a permanent hole in your paycheck. Buy second-hand in CASH!
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Barefoot Cash Strategy Approved!</span>
            By saving up and buying your car in cash, you avoid $0 in interest, keep low insurance, and own your vehicle 100% outright! Always do a $2 PPSR check at <strong>ppsr.gov.au</strong> before buying.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ppsr_check} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_car} />
      </div>
    </Card>
  );
}

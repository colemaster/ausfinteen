import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, TEEN_CAR_COST_DEFAULTS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Car, CheckCircle2, Flame } from 'lucide-react';

export function FirstCarCostCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(TEEN_CAR_COST_DEFAULTS.averagePurchasePrice);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'loan'>('cash');
  const [weeklyFuel, setWeeklyFuel] = useState<number>(TEEN_CAR_COST_DEFAULTS.fuelWeekly);

  // Fixed running costs
  const regoAnnual = TEEN_CAR_COST_DEFAULTS.regoAnnual;
  const ctpAnnual = TEEN_CAR_COST_DEFAULTS.ctpGreenSlipAnnual;
  const insuranceAnnual = TEEN_CAR_COST_DEFAULTS.comprehensiveInsuranceUnder25;
  const servicingAnnual = TEEN_CAR_COST_DEFAULTS.servicingAnnual;
  const repairsAnnual = TEEN_CAR_COST_DEFAULTS.tiresAndRepairsAnnual;

  const annualRunningCosts = regoAnnual + ctpAnnual + insuranceAnnual + servicingAnnual + repairsAnnual + (weeklyFuel * 52);
  const weeklyRunningCost = annualRunningCosts / 52;

  // Loan trap math (12.5% over 3 years)
  const loanInterestRate = 0.125;
  const loanTermYears = 3;
  const totalLoanInterest = purchaseType === 'loan' ? purchasePrice * loanInterestRate * loanTermYears : 0;
  const totalPurchaseCost = purchasePrice + totalLoanInterest;

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
          <label className="text-xs font-semibold text-muted-foreground block">Purchase Strategy (Barefoot Warning)</label>
          <div className="grid grid-cols-2 gap-2">
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

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Total Car Purchase Cost"
          value={`$${totalPurchaseCost.toLocaleString()}`}
          color={purchaseType === 'cash' ? 'green' : 'red'}
          subtext={purchaseType === 'cash' ? 'Bought 100% in cash' : `Includes $${Math.round(totalLoanInterest).toLocaleString()} loan interest!`}
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

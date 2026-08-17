import { useMemo } from 'react';
import { motion } from 'motion/react';
import { fadeInUp } from '@/lib/animations';
import { useUrlParams } from '../../hooks/useUrlParams';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { PortfolioField } from '../../components/ui/PortfolioField';
import { StatCard } from '../../components/ui/StatCard';
import { Toggle } from '../../components/ui/Toggle';
import { BarCompare } from '../../components/ui/BarCompare';
import { Assumptions } from '../../components/shared/Assumptions';
import { Disclaimer } from '../../components/shared/Disclaimer';
import { AboutCalc } from '../../components/shared/AboutCalc';
import { calculateAffordability, rateScenarioTable, monthlyBufferCheck, monthsToDeposit, type AustralianState } from './engine';
import { formatCurrency, formatPercent, formatPct } from '../../utils/formatters';
import { usePortfolio } from '../../context/PortfolioContext';

const DEFAULTS = {
  grossIncome: 100000,
  partnerIncome: 0,
  existingMonthlyDebts: 0,
  deposit: 150000,
  propertyPrice: 700000,
  state: 'VIC' as AustralianState,
  firstHomeBuyer: false,
  isNewHome: false,
  rate: 6.0,
  loanTerm: 30,
};

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const ASSUMPTIONS = [
  'APRA serviceability buffer: assessed at rate + 3%.',
  'Borrowing capacity assumes 30% of gross income for housing repayments.',
  'LMI estimate is approximate — actual premiums vary significantly by lender.',
  'Monthly holding costs use default estimates for council rates, insurance, and maintenance.',
  'Stamp duty based on 2024-25 state revenue office rates.',
  'Not modelled: strata levies (set to $0 by default), conveyancing, building inspection fees.',
];

export function HouseAffordability() {
  const { portfolio } = usePortfolio();
  const [params, setParams] = useUrlParams({
    grossIncome: portfolio.grossSalary > 0 ? portfolio.grossSalary : DEFAULTS.grossIncome,
    partnerIncome: DEFAULTS.partnerIncome,
    existingMonthlyDebts: DEFAULTS.existingMonthlyDebts,
    deposit: portfolio.savingsBalance > 0 ? portfolio.savingsBalance : DEFAULTS.deposit,
    propertyPrice: portfolio.propertyValue > 0 ? portfolio.propertyValue : DEFAULTS.propertyPrice,
    state: DEFAULTS.state as string,
    firstHomeBuyer: DEFAULTS.firstHomeBuyer,
    isNewHome: DEFAULTS.isNewHome,
    rate: portfolio.mortgageRate > 0 ? portfolio.mortgageRate : DEFAULTS.rate,
    loanTerm: portfolio.mortgageYearsRemaining > 0 ? portfolio.mortgageYearsRemaining : DEFAULTS.loanTerm,
    bufferPct: 10,
    monthlySaving: 2000,
    depositReturn: 5,
  });

  // Effective values: portfolio wins over URL params when set
  const effectiveGrossIncome = portfolio.grossSalary > 0 ? portfolio.grossSalary : params.grossIncome;
  const effectiveDeposit = portfolio.savingsBalance > 0 ? portfolio.savingsBalance : params.deposit;
  const effectivePropertyPrice = portfolio.propertyValue > 0 ? portfolio.propertyValue : params.propertyPrice;
  const effectiveRate = portfolio.mortgageRate > 0 ? portfolio.mortgageRate : params.rate;
  const effectiveLoanTerm = portfolio.mortgageYearsRemaining > 0 ? portfolio.mortgageYearsRemaining : params.loanTerm;

  const result = useMemo(
    () =>
      calculateAffordability({
        ...params,
        grossIncome: effectiveGrossIncome,
        deposit: effectiveDeposit,
        propertyPrice: effectivePropertyPrice,
        rate: effectiveRate,
        loanTerm: effectiveLoanTerm,
        state: params.state as AustralianState,
      }),
    [params, effectiveGrossIncome, effectiveDeposit, effectivePropertyPrice, effectiveRate, effectiveLoanTerm],
  );

  const affordabilityColor = result.affordabilityRatio <= 0.28
    ? 'green'
    : result.affordabilityRatio <= 0.35
    ? 'amber'
    : 'red';

  // Rate-sensitivity matrix around the current rate
  const sensitivityRates = useMemo(() => {
    const base = [effectiveRate - 1, effectiveRate - 0.5, effectiveRate, effectiveRate + 0.5, effectiveRate + 1];
    return [...new Set(base.map(r => Math.max(2, Math.round(r * 10) / 10)))].sort((a, b) => a - b);
  }, [effectiveRate]);
  const rateMatrix = useMemo(
    () => rateScenarioTable(effectivePropertyPrice, effectiveDeposit, effectiveLoanTerm, sensitivityRates),
    [effectivePropertyPrice, effectiveDeposit, effectiveLoanTerm, sensitivityRates],
  );

  // Monthly buffer affordability check
  const bufferCheck = useMemo(
    () => monthlyBufferCheck(
      effectivePropertyPrice,
      effectiveDeposit,
      effectiveLoanTerm,
      effectiveRate,
      effectiveGrossIncome,
      params.partnerIncome,
      params.bufferPct,
    ),
    [effectivePropertyPrice, effectiveDeposit, effectiveLoanTerm, effectiveRate, effectiveGrossIncome, params.partnerIncome, params.bufferPct],
  );

  // Deposit timeline
  const depositMonths = useMemo(
    () => monthsToDeposit(effectiveDeposit, params.monthlySaving, params.depositReturn),
    [effectiveDeposit, params.monthlySaving, params.depositReturn],
  );

  const breakdownChartData = [
    {
      name: 'Monthly Costs',
      'P&I': result.monthlyCostBreakdown.principalAndInterest,
      'Rates': result.monthlyCostBreakdown.councilRates + result.monthlyCostBreakdown.water,
      'Insurance': result.monthlyCostBreakdown.insurance,
      'Maintenance': result.monthlyCostBreakdown.maintenance,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          House Purchasing Affordability
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          APRA serviceability assessment, stamp duty, LMI, monthly costs and rate stress tests. Based on 2024-25 rates.
        </p>
      </div>

      <AboutCalc concepts={[
        {
          term: 'What is the APRA serviceability buffer?',
          definition: 'APRA (the banking regulator) requires lenders to check you can still afford repayments at your actual interest rate plus 3%. So for a 6% loan, your repayments are assessed at 9%. This stress-tests your ability to keep paying if rates rise.',
          link: 'https://www.apra.gov.au/changes-serviceability-guidance',
          linkLabel: 'APRA: Serviceability guidance',
        },
        {
          term: 'What is Lenders Mortgage Insurance (LMI)?',
          definition: 'Insurance required by the lender when your deposit is less than 20% of the property value (loan-to-value ratio above 80%). LMI protects the lender if you default — not you. It can add thousands to your purchase costs and is typically capitalised into your loan.',
          link: 'https://en.wikipedia.org/wiki/Lenders_mortgage_insurance',
          linkLabel: 'Wikipedia: Lenders mortgage insurance',
        },
        {
          term: 'What is stamp duty?',
          definition: 'A state government tax payable on property transactions. It is calculated as a percentage of the purchase price and varies significantly between states. First home buyers may receive full or partial exemptions. It must be paid upfront and is not part of your mortgage.',
          link: 'https://en.wikipedia.org/wiki/Stamp_duty_in_Australia',
          linkLabel: 'Wikipedia: Stamp duty in Australia',
        },
      ]} />

      {/* Inputs */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">Buyer Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {portfolio.grossSalary > 0
            ? <PortfolioField label="Gross Income" value={effectiveGrossIncome} prefix="$" />
            : <NumberInput label="Gross Income" value={params.grossIncome} onChange={v => setParams({ grossIncome: v })} min={30000} max={2000000} step={5000} prefix="$" />
          }
          <NumberInput label="Partner Income" value={params.partnerIncome} onChange={v => setParams({ partnerIncome: v })} min={0} max={1000000} step={5000} prefix="$" />
          <NumberInput label="Other Monthly Debts" value={params.existingMonthlyDebts} onChange={v => setParams({ existingMonthlyDebts: v })} min={0} max={10000} step={100} prefix="$" suffix="/mo" />
          {portfolio.savingsBalance > 0
            ? <PortfolioField label="Deposit / Savings" value={effectiveDeposit} prefix="$" />
            : <NumberInput label="Deposit / Savings" value={params.deposit} onChange={v => setParams({ deposit: v })} min={0} max={5000000} step={5000} prefix="$" />
          }
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] pt-2">Property Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {portfolio.propertyValue > 0
            ? <PortfolioField label="Property Price" value={effectivePropertyPrice} prefix="$" />
            : <NumberInput label="Property Price" value={params.propertyPrice} onChange={v => setParams({ propertyPrice: v })} min={100000} max={5000000} step={10000} prefix="$" />
          }
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-medium">State</label>
            <select
              value={params.state}
              onChange={e => setParams({ state: e.target.value })}
              className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-semibold text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {portfolio.mortgageRate > 0
            ? <PortfolioField label="Interest Rate" value={effectiveRate} suffix="%" decimals={1} />
            : <SliderControl label="Interest Rate" value={params.rate} onChange={v => setParams({ rate: v })} min={2} max={12} step={0.1} suffix="%" />
          }
          {portfolio.mortgageYearsRemaining > 0
            ? <PortfolioField label="Loan Term" value={effectiveLoanTerm} suffix=" yrs" />
            : <NumberInput label="Loan Term" value={params.loanTerm} onChange={v => setParams({ loanTerm: Math.round(v) })} min={10} max={40} step={1} suffix=" yrs" />
          }
        </div>
        <div className="flex flex-wrap gap-6">
          <Toggle label="First Home Buyer" checked={params.firstHomeBuyer} onChange={v => setParams({ firstHomeBuyer: v })} description="Stamp duty concession may apply" />
          <Toggle label="New Home" checked={params.isNewHome} onChange={v => setParams({ isNewHome: v })} description="Affects FHOG eligibility" />
        </div>
      </div>

      {/* Affordability Banner */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="text-xs text-[var(--muted-foreground)] bg-[var(--background)]/50 border border-slate-100 rounded-lg px-4 py-3 leading-relaxed">
        <strong className="text-[var(--foreground)]">Borrowing capacity</strong> is estimated using the APRA method: your income finances repayments assessed at rate + 3%, capped at 30% of gross income for housing. <strong className="text-[var(--foreground)]">LMI</strong> is added when your deposit is under 20% (LVR above 80%). <strong className="text-[var(--foreground)]">Stamp duty</strong> varies by state and first-home-buyer status.{' '}
        <a href="https://moneysmart.gov.au/home-loans/how-much-can-i-borrow" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary)]">MoneySmart: How much can I borrow ↗</a>
      </div>
      <div className={`rounded-xl px-5 py-4 border ${result.affordableWithDeposit ? 'bg-green-50 border-green-200 ' : 'bg-[var(--danger)]/10 border-red-200 ' }`}
      >
        <p className={`text-sm font-semibold ${result.affordableWithDeposit ? 'text-green-700 ' : 'text-[var(--danger)] '}`}>
          {result.affordableWithDeposit
            ? `Loan of ${formatCurrency(result.loanAmount)} is within estimated borrowing capacity (${formatCurrency(result.borrowingCapacity)}).`
            : `Loan of ${formatCurrency(result.loanAmount)} exceeds estimated borrowing capacity of ${formatCurrency(result.borrowingCapacity)}.`
          }
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          LVR: <span className="font-mono">{formatPct(result.lvr)}</span>
          {' · '}Assessed at: <span className="font-mono">{formatPct(effectiveRate + 3)}%</span> (rate + 3% APRA buffer)
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Borrowing Capacity" value={formatCurrency(result.borrowingCapacity)} color="blue" subtext="At rate + 3% buffer" />
        <StatCard label="Stamp Duty" value={formatCurrency(result.stampDuty.dutyPayable)} color={result.stampDuty.concessionApplied ? 'green' : 'amber'}
          subtext={result.stampDuty.concessionApplied ? `Saved ${formatCurrency(result.stampDuty.concessionSaving)}` : undefined} />
        <StatCard label="LMI Estimate" value={result.lmi > 0 ? formatCurrency(result.lmi) : 'Nil'} color={result.lmi > 0 ? 'red' : 'green'} subtext={result.lvr > 80 ? `LVR ${formatPct(result.lvr)}` : 'LVR ≤ 80%'} />
        <StatCard label="Total Upfront Cost" value={formatCurrency(result.totalUpfrontCost)} color="purple" subtext={`Deposit + duty + LMI`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Monthly Repayment" value={formatCurrency(result.monthlyRepayment)} color="blue" subtext={`${formatCurrency(result.monthlyRepayment * 12)} pa`} />
        <StatCard label="Total Monthly Cost" value={formatCurrency(result.monthlyCostBreakdown.total)} color="cyan" subtext="P&I + rates + insurance" />
        <StatCard label="Affordability Ratio" value={formatPercent(result.affordabilityRatio)} color={affordabilityColor} subtext={result.affordabilityRatio <= 0.28 ? 'Comfortable' : result.affordabilityRatio <= 0.35 ? 'Moderate' : 'Stretched'} />
        {result.stampDuty.fhogAmount > 0 && (
          <StatCard label="FHOG Grant" value={formatCurrency(result.stampDuty.fhogAmount)} color="green" subtext="First Home Owner Grant" />
        )}
      </div>

      {/* Rate Stress Test */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">Rate Stress Test</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)]">
                {['Rate', 'Monthly Repayment', 'Change vs Today', 'Annual Cost'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.stressTest.map(row => (
                <tr key={row.rateIncrease} className={`border-b border-slate-100 last:border-0 ${row.rateIncrease === 0 ? 'bg-[var(--primary)]/10 ' : ''}`}>
                  <td className="px-4 py-2 text-[var(--muted-foreground)] font-mono">
                    {formatPct(row.totalRate)} {row.rateIncrease > 0 ? <span className="text-amber-500">(+{row.rateIncrease}%)</span> : <span className="text-[var(--primary)]">(today)</span>}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--foreground)]">{formatCurrency(row.monthlyRepayment)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${row.monthlyChange > 0 ? 'text-[var(--danger)] ' : 'text-[var(--muted-foreground)]'}`}>
                    {row.monthlyChange > 0 ? `+${formatCurrency(row.monthlyChange)}` : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.annualCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Sensitivity Matrix */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">
          Rate Sensitivity Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--background)]">
                {['Rate', 'Monthly Repayment', 'Total Interest (full term)', 'Interest vs Today'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] font-medium border-b border-[var(--border)] first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rateMatrix.map(row => {
                const isToday = Math.abs(row.rate - effectiveRate) < 0.001;
                const baseInterest = rateMatrix.find(r => Math.abs(r.rate - effectiveRate) < 0.001)?.totalInterest ?? row.totalInterest;
                const diff = row.totalInterest - baseInterest;
                return (
                  <tr key={row.rate} className={`border-b border-slate-100 last:border-0 ${isToday ? 'bg-[var(--primary)]/10 ' : ''}`}>
                    <td className="px-4 py-2 text-[var(--muted-foreground)] font-mono">
                      {formatPct(row.rate)}{isToday && <span className="text-[var(--primary)]"> (today)</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--foreground)]">{formatCurrency(row.monthlyRepayment)}</td>
                    <td className="px-4 py-2 text-right font-mono text-[var(--muted-foreground)]">{formatCurrency(row.totalInterest)}</td>
                    <td className={`px-4 py-2 text-right font-mono ${diff > 0 ? 'text-[var(--danger)]' : diff < 0 ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'}`}>
                      {diff > 0 ? `+${formatCurrency(diff)}` : diff < 0 ? `-${formatCurrency(Math.abs(diff))}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-2">
          Total interest assumes repayments continue for the full term at each rate (monthly compounding P&I).
        </p>
      </div>

      {/* Monthly Buffer Check + Deposit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Monthly Buffer Affordability
          </h3>
          <SliderControl
            label="Buffer on Monthly Cost"
            value={params.bufferPct}
            onChange={v => setParams({ bufferPct: v })}
            min={0}
            max={25}
            step={1}
            suffix="%"
          />
          <div className={`rounded-lg px-4 py-3 border text-xs ${bufferCheck.affordableWithBuffer ? 'bg-green-50 border-green-200 text-green-700 ' : 'bg-[var(--danger)]/10 border-red-200 text-[var(--danger)] '}`}>
            <p className="font-semibold">
              {bufferCheck.affordableWithBuffer
                ? `Monthly income covers the buffered cost with ${formatCurrency(bufferCheck.surplus)} to spare.`
                : `Shortfall of ${formatCurrency(Math.abs(bufferCheck.surplus))}/mo vs the buffered requirement.`}
            </p>
            <p className="mt-1 text-[var(--muted-foreground)]">
              Costs {formatCurrency(bufferCheck.totalMonthlyCost)}/mo (loan {formatCurrency(bufferCheck.monthlyMortgage)} + rates/water/insurance {formatCurrency(bufferCheck.monthlyHoldingCosts)}) + {formatPct(params.bufferPct)} buffer = {formatCurrency(bufferCheck.requiredIncome)} required vs {formatCurrency(bufferCheck.monthlyIncome)} income.
            </p>
          </div>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Deposit Timeline
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="Monthly Saving" value={params.monthlySaving} onChange={v => setParams({ monthlySaving: v })} min={0} max={20000} step={100} prefix="$" suffix="/mo" />
            <SliderControl label="Investment Return" value={params.depositReturn} onChange={v => setParams({ depositReturn: v })} min={0} max={12} step={0.5} suffix="%" />
          </div>
          <div className="rounded-lg bg-[var(--background)] border border-[var(--border)] px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Saving {formatCurrency(params.monthlySaving)}/mo at {formatPct(params.depositReturn)} to reach {formatCurrency(effectiveDeposit)}
            </span>
            <span className="text-sm font-bold font-mono text-[var(--primary)]">
              {depositMonths >= 600 ? '60+ yrs' : depositMonths < 12 ? `${depositMonths} mo` : `${depositMonths} mo (~${(depositMonths / 12).toFixed(1)} yr)`}
            </span>
          </div>
          {depositMonths >= 600 && (
            <p className="text-[10px] text-[var(--danger)]">
              Target not reached within 50 years — increase monthly saving or lower the target.
            </p>
          )}
        </div>
      </div>

      {/* Monthly Cost Breakdown Chart */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">Monthly Cost Breakdown</h3>
        <BarCompare
          data={breakdownChartData}
          keys={[
            { key: 'P&I', label: 'Principal & Interest', color: '#3b82f6' },
            { key: 'Rates', label: 'Council + Water', color: '#22c55e' },
            { key: 'Insurance', label: 'Insurance', color: '#f59e0b' },
            { key: 'Maintenance', label: 'Maintenance', color: '#a855f7' },
          ]}
          xKey="name"
          height={200}
        />
      </div>
      </motion.div>

      <Assumptions items={ASSUMPTIONS} />
      <Disclaimer calculatorName="House Affordability calculator" />
    </div>
  );
}

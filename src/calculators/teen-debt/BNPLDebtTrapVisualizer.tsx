import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { QuickPresetBar, type ScenarioPreset } from '@/components/ui/QuickPresetBar';
import { CalculatorActions } from '@/components/shared/CalculatorActions';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  Flame,
  ShieldAlert,
  CalendarClock,
  Layers,
  PhoneCall,
  FileText,
  AlertTriangle,
  Lock,
  Scale,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from '@/components/charts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  bnplLateFeeCascade,
  weeklyPayoffPlan,
  calculateStackedBnpl,
  DEFAULT_STACKED_ACCOUNTS,
  calculateBnplEffectiveApr,
  estimateMortgageCapacityReduction,
  BNPL_PROVIDER_RULES,
  type BnplAccountItem,
} from './engine';
import { formatCurrency } from '@/utils/formatters';

interface BNPLPreset {
  price: number;
  missed: number;
  fee: number;
  weeks: number;
}

const BNPL_SINGLE_PRESETS: ScenarioPreset<BNPLPreset>[] = [
  {
    id: 'festival',
    label: 'Festival Ticket ($150)',
    badge: '1 Missed Fee',
    description: '$150 ticket with 1 missed fortnightly repayment',
    values: { price: 150, missed: 1, fee: 15, weeks: 4 },
  },
  {
    id: 'sneakers',
    label: 'Limited Sneaker Drop ($280)',
    badge: 'Late Fee Cascade',
    description: '3 missed installments triggering compounding penalty fees',
    values: { price: 280, missed: 3, fee: 15, weeks: 6 },
  },
  {
    id: 'phone-tech',
    label: 'Tech Gear ($450)',
    badge: '5-Yr CCR Default Risk',
    description: '4 missed payments blowing out past statutory $150 default threshold',
    values: { price: 450, missed: 4, fee: 20, weeks: 8 },
  },
];

interface StackedPresetValues {
  accounts: BnplAccountItem[];
  weeklyBudget: number;
}

const STACKED_PRESETS: ScenarioPreset<StackedPresetValues>[] = [
  {
    id: 'spiral-4',
    label: '4-Account Payday Spiral',
    badge: 'Cascading Fees',
    description: 'Stacking Afterpay, Zip, Klarna, and PayPal Pay in 4 with multiple missed fees',
    values: {
      accounts: [
        { id: 'afterpay', name: 'Afterpay', provider: 'Afterpay', balance: 240, fortnightlyPayment: 60, feePerLatePayment: 10, missedPayments: 1 },
        { id: 'zip', name: 'Zip Pay', provider: 'Zip Pay', balance: 350, fortnightlyPayment: 40, feePerLatePayment: 15, missedPayments: 2 },
        { id: 'klarna', name: 'Klarna', provider: 'Klarna', balance: 180, fortnightlyPayment: 45, feePerLatePayment: 5, missedPayments: 1 },
        { id: 'paypal', name: 'PayPal Pay in 4', provider: 'PayPal Pay in 4', balance: 220, fortnightlyPayment: 55, feePerLatePayment: 0, missedPayments: 0 },
      ],
      weeklyBudget: 80,
    },
  },
  {
    id: 'ccr-emergency',
    label: 'Imminent 5-Yr CCR Defaults',
    badge: 'Severe Debt Trap',
    description: 'Multiple accounts exceeding $150 with 3+ missed payments facing Equifax default listings',
    values: {
      accounts: [
        { id: 'afterpay', name: 'Afterpay', provider: 'Afterpay', balance: 300, fortnightlyPayment: 75, feePerLatePayment: 10, missedPayments: 3 },
        { id: 'zip', name: 'Zip Pay', provider: 'Zip Pay', balance: 420, fortnightlyPayment: 45, feePerLatePayment: 15, missedPayments: 3 },
        { id: 'klarna', name: 'Klarna', provider: 'Klarna', balance: 160, fortnightlyPayment: 40, feePerLatePayment: 5, missedPayments: 3 },
        { id: 'paypal', name: 'PayPal Pay in 4', provider: 'PayPal Pay in 4', balance: 250, fortnightlyPayment: 62.5, feePerLatePayment: 0, missedPayments: 1 },
      ],
      weeklyBudget: 90,
    },
  },
  {
    id: 'minor-starter',
    label: '2-Account Starter Stack',
    badge: 'Early Warning',
    description: 'Two low-balance BNPL accounts showing how quickly fortnightly commitments stack',
    values: {
      accounts: [
        { id: 'afterpay', name: 'Afterpay', provider: 'Afterpay', balance: 140, fortnightlyPayment: 35, feePerLatePayment: 10, missedPayments: 1 },
        { id: 'zip', name: 'Zip Pay', provider: 'Zip Pay', balance: 160, fortnightlyPayment: 40, feePerLatePayment: 15, missedPayments: 0 },
      ],
      weeklyBudget: 50,
    },
  },
];

const CHART_CONFIG = {
  value: { label: 'Amount ($)', color: 'var(--chart-1, #3b82f6)' },
};

export function BNPLDebtTrapVisualizer() {
  const [mode, setMode] = useState<'single' | 'stacked'>('stacked');

  // Single purchase state
  const [purchasePrice, setPurchasePrice] = useState<number>(120);
  const [missedPayments, setMissedPayments] = useState<number>(2);
  const [feePerLatePayment, setFeePerLatePayment] = useState<number>(15);
  const [payoffWeeks, setPayoffWeeks] = useState<number>(4);
  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball');
  const [activeSinglePreset, setActiveSinglePreset] = useState<string | undefined>();

  // Multi-account stacked state
  const [stackedAccounts, setStackedAccounts] = useState<BnplAccountItem[]>(DEFAULT_STACKED_ACCOUNTS);
  const [stackedWeeklyBudget, setStackedWeeklyBudget] = useState<number>(75);
  const [activeStackedPreset, setActiveStackedPreset] = useState<string | undefined>('spiral-4');

  // Single calculations
  const fortnightInstallment = purchasePrice / 4;
  const cascade = useMemo(
    () => bnplLateFeeCascade(purchasePrice, 4, missedPayments, feePerLatePayment, 1.5),
    [purchasePrice, missedPayments, feePerLatePayment]
  );
  const totalLateFees = cascade.totalFees;
  const totalCost = cascade.totalCost;
  const percentageMarkup = cascade.markupPct;
  const singleEffectiveApr = useMemo(
    () => calculateBnplEffectiveApr(purchasePrice, totalLateFees, 8),
    [purchasePrice, totalLateFees]
  );
  const payoffPlan = useMemo(() => weeklyPayoffPlan(purchasePrice, payoffWeeks), [purchasePrice, payoffWeeks]);

  // Stacked calculations
  const stackedResult = useMemo(
    () => calculateStackedBnpl(stackedAccounts, stackedWeeklyBudget),
    [stackedAccounts, stackedWeeklyBudget]
  );
  const stackedEstimatedLimit = useMemo(
    () => stackedAccounts.length * 600,
    [stackedAccounts]
  );
  const stackedMortgagePenalty = useMemo(
    () => estimateMortgageCapacityReduction(stackedEstimatedLimit),
    [stackedEstimatedLimit]
  );

  const handleApplySinglePreset = (preset: ScenarioPreset<BNPLPreset>) => {
    setActiveSinglePreset(preset.id);
    if (preset.values.price !== undefined) setPurchasePrice(preset.values.price);
    if (preset.values.missed !== undefined) setMissedPayments(preset.values.missed);
    if (preset.values.fee !== undefined) setFeePerLatePayment(preset.values.fee);
    if (preset.values.weeks !== undefined) setPayoffWeeks(preset.values.weeks);
  };

  const handleApplyStackedPreset = (preset: ScenarioPreset<StackedPresetValues>) => {
    setActiveStackedPreset(preset.id);
    if (preset.values.accounts) setStackedAccounts(preset.values.accounts);
    if (preset.values.weeklyBudget) setStackedWeeklyBudget(preset.values.weeklyBudget);
  };

  const handleUpdateStackedAccount = (id: string, updates: Partial<BnplAccountItem>) => {
    setActiveStackedPreset(undefined);
    setStackedAccounts(prev =>
      prev.map(acc => (acc.id === id ? { ...acc, ...updates } : acc))
    );
  };

  const handleReset = useCallback(() => {
    if (mode === 'single') {
      setActiveSinglePreset(undefined);
      setPurchasePrice(120);
      setMissedPayments(2);
      setFeePerLatePayment(15);
      setPayoffWeeks(4);
      setPayoffStrategy('snowball');
    } else {
      setActiveStackedPreset('spiral-4');
      setStackedAccounts(DEFAULT_STACKED_ACCOUNTS);
      setStackedWeeklyBudget(75);
    }
  }, [mode]);

  // Single Chart Data
  const singleChartData = useMemo(() => {
    return [
      { name: 'Item Price', value: purchasePrice, color: 'var(--chart-1, #3b82f6)' },
      { name: 'BNPL Late Fees', value: totalLateFees, color: 'var(--chart-4, #ef4444)' },
      { name: 'Total Paid', value: totalCost, color: 'var(--chart-3, #f59e0b)' },
      { name: 'If Invested (1y @ 7%)', value: Math.round(totalCost * 1.07), color: 'var(--chart-2, #10b981)' },
    ];
  }, [purchasePrice, totalLateFees, totalCost]);

  // Stacked Chart Data
  const stackedChartData = useMemo(() => {
    return [
      { name: 'Original Principal', value: stackedResult.totalOriginalBalance, color: 'var(--chart-1, #3b82f6)' },
      { name: 'Cascading Late Fees', value: stackedResult.totalLateFees, color: 'var(--chart-4, #ef4444)' },
      { name: 'Total True Owed', value: stackedResult.totalTrueOwed, color: 'var(--chart-3, #f59e0b)' },
    ];
  }, [stackedResult]);

  const summaryText = useMemo(() => {
    if (mode === 'single') {
      return [
        '--- Single BNPL Debt Trap & Late Fee Analysis ---',
        `Original Purchase: ${formatCurrency(purchasePrice)} (4 installments of ${formatCurrency(fortnightInstallment)})`,
        `Missed Payments: ${missedPayments} | Base Late Fee: ${formatCurrency(feePerLatePayment)}`,
        `Total Late Fees Incurred: +${formatCurrency(totalLateFees)} (+${percentageMarkup.toFixed(0)}% price markup)`,
        `Total Cost Paid: ${formatCurrency(totalCost)}`,
        `Payoff Plan: ${formatCurrency(payoffPlan.weeklyPayment)}/wk across ${payoffWeeks} weeks (${payoffStrategy.toUpperCase()} method)`,
        `CCR Default Risk: ${cascade.hasCcrDefaultRisk ? 'YES (5-Year Default Listing on Equifax/Experian)' : 'No'}`,
        `Calculated via AusFinTools BNPL Visualizer`,
      ].join('\n');
    }

    return [
      '--- Multi-Account BNPL Snowball Analysis (3-4 Stacked Accounts) ---',
      `Active Accounts: ${stackedResult.activeAccountsCount} | Total Debt: ${formatCurrency(stackedResult.totalTrueOwed)} (Principal: ${formatCurrency(stackedResult.totalOriginalBalance)} + Late Fees: ${formatCurrency(stackedResult.totalLateFees)})`,
      `Fortnightly Commitment: ${formatCurrency(stackedResult.totalFortnightlyCommitment)}/fn (${formatCurrency(stackedResult.totalMonthlyCommitment)}/mo)`,
      `CCR 5-Year Default Risk: ${stackedResult.hasCcrDefaultRisk ? `CRITICAL - ${stackedResult.accountsAtDefaultRiskCount} account(s) at risk of 5-year default listing` : 'Clear'}`,
      `Debt Payoff: ${formatCurrency(stackedWeeklyBudget)}/week -> Snowball: ${stackedResult.snowballPayoffWeeks} wks | Avalanche: ${stackedResult.avalanchePayoffWeeks} wks`,
      `Relief Steps: National Debt Helpline 1800 007 007 | NCCP s72 Hardship Notices`,
      `Calculated via AusFinTools BNPL Visualizer`,
    ].join('\n');
  }, [
    mode,
    purchasePrice,
    fortnightInstallment,
    missedPayments,
    feePerLatePayment,
    totalLateFees,
    percentageMarkup,
    totalCost,
    payoffPlan,
    payoffWeeks,
    payoffStrategy,
    cascade,
    stackedResult,
    stackedWeeklyBudget,
  ]);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-foreground">
              BNPL Debt Trap & Multi-Account Snowball Visualizer
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Model how Buy Now Pay Later (Afterpay, Zip, Klarna, PayPal Pay in 4) late fees compound, stacking multiple accounts, and trigger 5-year CCR credit defaults.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stackedResult.hasCcrDefaultRisk || cascade.hasCcrDefaultRisk ? (
            <Badge variant="danger" className="animate-pulse">
              5-Year CCR Default Risk!
            </Badge>
          ) : (
            <Badge variant="warning">
              Late Fee Warning
            </Badge>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('stacked')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mode === 'stacked'
              ? 'bg-card text-foreground shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          Multi-Account Snowball (Stacking 3-4 Accounts)
        </button>
        <button
          type="button"
          onClick={() => setMode('single')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mode === 'single'
              ? 'bg-card text-foreground shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          Single Purchase Trap
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: MULTI-ACCOUNT STACKING (3-4 BNPL ACCOUNTS)            */}
      {/* ============================================================== */}
      {mode === 'stacked' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <QuickPresetBar
            presets={STACKED_PRESETS}
            activePresetId={activeStackedPreset}
            onSelect={handleApplyStackedPreset}
            title="Common Australian BNPL Stacking Scenarios"
          />

          {/* Statutory 5-Year CCR Default Warning */}
          {stackedResult.hasCcrDefaultRisk && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>CRITICAL COMPREHENSIVE CREDIT REPORTING (CCR) WARNING</span>
              </div>
              <p className="text-foreground leading-relaxed">
                Under Australian credit legislation (<strong>Privacy Act 1988 Part IIIA</strong>), BNPL providers are licensed credit providers.
                Any unpaid balance of <strong>$150 or more</strong> that is <strong>60+ days overdue</strong> can be formally registered as a <strong>Credit Default</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-card/80 border border-border text-[11px] font-medium space-y-1">
                <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>5-Year Credit Black Mark Impact:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                  <li><strong>Rental Tenancy Rejections:</strong> Property managers search Equifax/NTD; defaults cause automatic application denials.</li>
                  <li><strong>Post-Paid Mobile Plans:</strong> Telcos reject phone contracts or demand $500+ security deposits.</li>
                  <li><strong>First Home Loan Disqualification:</strong> Tier-1 banks (CBA, Westpac, NAB, ANZ) reject home loan applications with active defaults.</li>
                  <li><strong>24-Month RHI:</strong> Even single missed repayments stay on file as Repayment History Information for 2 full years.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Mortgage Borrowing Power Penalty Warning */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Home Loan Borrowing Power Impact: ~${stackedMortgagePenalty.toLocaleString()} Reduction</span>
              </div>
              <Badge variant="warning" className="text-[10px]">APRA 3% Buffer Rule</Badge>
            </div>
            <p className="text-foreground leading-relaxed">
              When assessing home loan affordability, Australian mortgage lenders (Big Four + customer-owned banks) treat your <strong>total approved credit limit</strong> (~${stackedEstimatedLimit.toLocaleString()} across your {stackedAccounts.length} accounts) as an ongoing debt liability—even if your balance is $0! Under APRA serviceability buffers, this slashes your borrowing capacity by approximately <strong>${stackedMortgagePenalty.toLocaleString()}</strong>.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Mortgage underwriters also examine 3–6 months of bank statements. Frequent BNPL debits, payday loans (SACCs), or wage-advance apps (Beforepay/Wagepay) can trigger automatic loan rejections.
            </p>
          </div>

          {/* Stacked KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Total True Debt Owed"
              value={`$${stackedResult.totalTrueOwed.toFixed(2)}`}
              numericValue={stackedResult.totalTrueOwed}
              format="currency"
              color={stackedResult.totalLateFees > 0 ? 'red' : 'blue'}
              subtext={`Original: $${stackedResult.totalOriginalBalance} + $${stackedResult.totalLateFees.toFixed(2)} fees`}
            />
            <StatCard
              label="Fortnightly Commitment"
              value={`$${stackedResult.totalFortnightlyCommitment.toFixed(2)}/fn`}
              numericValue={stackedResult.totalFortnightlyCommitment}
              format="currency"
              color="amber"
              subtext={`~$${stackedResult.totalMonthlyCommitment}/mo out of wage`}
            />
            <StatCard
              label="Cascading Late Fees"
              value={`+$${stackedResult.totalLateFees.toFixed(2)}`}
              numericValue={stackedResult.totalLateFees}
              format="currency"
              color={stackedResult.totalLateFees > 0 ? 'red' : 'green'}
              subtext={`+${stackedResult.cascadingFeePercentage}% dead money markup`}
            />
            <StatCard
              label="CCR 5-Yr Default Risk"
              value={stackedResult.hasCcrDefaultRisk ? `${stackedResult.accountsAtDefaultRiskCount} At Risk` : 'Clear'}
              color={stackedResult.hasCcrDefaultRisk ? 'red' : 'green'}
              subtext={stackedResult.hasCcrDefaultRisk ? '5 years on Equifax credit file' : 'No 60-day defaults pending'}
            />
          </div>

          {/* Account Stacking Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                Active BNPL Accounts ({stackedAccounts.length} Stacked)
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Adjust balance & missed payments per provider
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stackedResult.accounts.map(acc => (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    acc.hasCcrDefaultRisk
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-xs'
                      : acc.missedPayments > 0
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-foreground">{acc.name}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Base: ${acc.fortnightlyPayment}/fn | Late Fee: ${acc.missedPayments > 0 ? acc.lateFees : 0}
                      </span>
                    </div>
                    {acc.hasCcrDefaultRisk ? (
                      <Badge variant="danger" className="text-[10px]">
                        5-Yr Default Risk
                      </Badge>
                    ) : acc.hasRhiFlag ? (
                      <Badge variant="warning" className="text-[10px]">
                        24-Mo RHI Mark
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        On Track
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      label="Balance ($)"
                      value={acc.balance}
                      onChange={v => handleUpdateStackedAccount(acc.id, { balance: v })}
                      min={0}
                      max={2000}
                      step={10}
                      prefix="$"
                    />
                    <SliderControl
                      label="Missed Payments"
                      value={acc.missedPayments}
                      onChange={v => handleUpdateStackedAccount(acc.id, { missedPayments: v })}
                      min={0}
                      max={4}
                      step={1}
                      suffix=" missed"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">True Owed (with late fees):</span>
                    <span className={`font-mono font-bold ${acc.lateFees > 0 ? 'text-rose-500' : 'text-foreground'}`}>
                      ${acc.totalOwed.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payoff Engine: Snowball vs Avalanche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CalendarClock className="w-4 h-4" />
                <span>Debt Freedom Payoff Engine</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Set how much weekly income you can throw at paying down these stacked BNPL accounts without taking on new orders.
              </p>

              <SliderControl
                label="Weekly Debt Payoff Budget"
                value={stackedWeeklyBudget}
                onChange={v => {
                  setStackedWeeklyBudget(v);
                  setActiveStackedPreset(undefined);
                }}
                min={25}
                max={300}
                step={5}
                prefix="$"
                suffix="/week"
              />

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Debt Snowball Method:</span>
                  <span className="font-mono font-bold text-primary">{stackedResult.snowballPayoffWeeks} Weeks</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Order: {stackedResult.snowballOrder.join(' → ')}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Clears the smallest balance first for rapid psychological momentum.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Debt Avalanche Method:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stackedResult.avalanchePayoffWeeks} Weeks</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Order: {stackedResult.avalancheOrder.join(' → ')}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Attacks accounts with 5-year CCR default risk and highest late-fee penalties first to save money.
                </div>
              </div>
            </div>

            {/* Visual breakdown chart */}
            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Total Stacked Debt Breakdown
                </h3>
                <ChartContainer config={CHART_CONFIG} className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stackedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}`, 'Amount']} />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground block mb-0.5">Payday Drain Reality Check:</span>
                Paying ${stackedResult.totalFortnightlyCommitment}/fortnight across 4 accounts leaves less money for rent, groceries, and petrol, frequently leading to next month's debt snowball.
              </div>
            </div>
          </div>

          {/* Statutory Relief Steps & Roadmap */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Statutory BNPL Relief & Hardship Roadmap (NCCP 2026)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stackedResult.reliefSteps.map(step => (
                <div
                  key={step.step}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    step.isUrgent
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Step {step.step}
                    </span>
                    <Badge variant={step.isUrgent ? 'danger' : 'default'} className="text-[10px]">
                      {step.badge}
                    </Badge>
                  </div>
                  <div className="font-bold text-xs text-foreground flex items-center gap-1">
                    {step.step === 1 && <PhoneCall className="w-3.5 h-3.5 text-primary" />}
                    {step.step === 2 && <FileText className="w-3.5 h-3.5 text-primary" />}
                    {step.step === 3 && <Lock className="w-3.5 h-3.5 text-primary" />}
                    {step.title}
                  </div>
                  <p className="text-[11px] text-foreground font-medium leading-relaxed">
                    {step.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {step.details}
                  </p>
                  {step.contact && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold">
                        {step.contact}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: SINGLE PURCHASE TRAP                                  */}
      {/* ============================================================== */}
      {mode === 'single' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <QuickPresetBar
            presets={BNPL_SINGLE_PRESETS}
            activePresetId={activeSinglePreset}
            onSelect={handleApplySinglePreset}
            title="Common BNPL Impulse Traps"
          />

          {/* CCR Warning for single purchase if default risk */}
          {cascade.hasCcrDefaultRisk && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Critical 5-Year Credit Default Risk:</span>
                This unpaid purchase exceeds the Australian statutory $150 threshold and is 60+ days delinquent.
                Under Comprehensive Credit Reporting (CCR), BNPL lenders can list a formal <strong>Credit Default</strong> that stays on your Equifax/Experian credit file for <strong>5 YEARS</strong>, preventing apartment rentals and car loans.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <NumberInput
                label="Original Purchase Amount ($)"
                value={purchasePrice}
                onChange={v => {
                  setPurchasePrice(v);
                  setActiveSinglePreset(undefined);
                }}
                min={20}
                max={2000}
                step={10}
                prefix="$"
              />

              <SliderControl
                label="Missed Fortnightly Installments"
                value={missedPayments}
                onChange={v => {
                  setMissedPayments(v);
                  setActiveSinglePreset(undefined);
                }}
                min={0}
                max={4}
                step={1}
                suffix=" payments"
              />

              <NumberInput
                label="Base Late Fee per Missed Payment ($)"
                value={feePerLatePayment}
                onChange={v => {
                  setFeePerLatePayment(v);
                  setActiveSinglePreset(undefined);
                }}
                min={5}
                max={30}
                step={1}
                prefix="$"
              />
            </div>

            {/* Payoff plan settings */}
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CalendarClock className="w-4 h-4" />
                <span>Payoff & Recovery Strategy</span>
              </div>

              <SliderControl
                label="Payoff Target Timeline"
                value={payoffWeeks}
                onChange={v => {
                  setPayoffWeeks(v);
                  setActiveSinglePreset(undefined);
                }}
                min={1}
                max={12}
                step={1}
                suffix=" weeks"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoffStrategy('snowball')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    payoffStrategy === 'snowball'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  Debt Snowball ⚡️
                </button>
                <button
                  type="button"
                  onClick={() => setPayoffStrategy('avalanche')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    payoffStrategy === 'avalanche'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  Debt Avalanche 📉
                </button>
              </div>

              <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs">
                <div className="font-semibold text-foreground">Weekly Payoff Requirement:</div>
                <div className="text-xl font-black font-mono text-primary mt-0.5">
                  ${payoffPlan.weeklyPayment.toFixed(2)} / week
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Clear in {payoffWeeks} weeks before credit score penalties bite
                </div>
              </div>
            </div>
          </div>

          {/* Visual Chart */}
          <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              True Cost & Opportunity Cost Visualizer
            </h3>
            <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={singleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent formatter={v => [`$${v}`, 'Amount']} />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <StatCard
              label="Fortnightly Installment"
              value={`$${fortnightInstallment.toFixed(2)}`}
              numericValue={fortnightInstallment}
              format="currency"
              color="blue"
              subtext="Base installment (4 payments total)"
            />
            <StatCard
              label="Late Fees Accumulated"
              value={`+$${totalLateFees.toFixed(2)}`}
              numericValue={totalLateFees}
              format="currency"
              color={totalLateFees > 0 ? 'red' : 'green'}
              subtext={`$${feePerLatePayment} base fee (${singleEffectiveApr > 0 ? `~${singleEffectiveApr.toFixed(0)}% APR` : '0% fees'})`}
            />
            <StatCard
              label="True Final Price Paid"
              value={`$${totalCost.toFixed(2)}`}
              numericValue={totalCost}
              format="currency"
              color={totalLateFees > 0 ? 'red' : 'cyan'}
              subtext={`Original item was $${purchasePrice}`}
            />
          </div>

          {/* Missed-payment cascade breakdown */}
          {cascade.steps.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2 animate-fade-in">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missed-Payment Fee Cascade
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cascade.steps.map(step => (
                  <div key={step.installment} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      Miss #{step.installment}
                    </div>
                    <div className="text-sm font-extrabold font-mono text-rose-500">+${step.fee.toFixed(2)}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">${step.cumulativeFees.toFixed(2)} total</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Each successive missed installment costs more than the last (1.5× cascade) — that's how a $120 "interest-free"
                impulse buy quietly becomes <strong className="font-mono">${totalCost.toFixed(2)}</strong>.
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Credit Rating & Home Loan Serviceability Impact:</span>
              Under 2026–2027 Australian credit laws, BNPL late payments and defaults are reported to Equifax, Experian, and Illion. Having open BNPL accounts reduces your future home loan borrowing capacity by tens of thousands of dollars, while payday loans (SACCs) or wage advances cause instant mortgage application declines. Close all short-term credit facilities 3–6 months before applying for property!
            </div>
          </div>
        </div>
      )}

      {/* Major Australian BNPL Provider Fee & Regulatory Breakdown */}
      <div className="space-y-3 pt-2 border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Scale className="w-4 h-4 text-primary" />
            <span>Major Australian BNPL Providers — 2026 Regulatory & Fee Comparison</span>
          </div>
          <Badge variant="outline" className="text-[10px] w-fit">
            ASIC RG 281 & NCCP Reg 69G Caps
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Under the <em>Treasury Laws Amendment (Responsible Buy Now Pay Later and Other Measures) Act 2024</em>,
          all BNPL providers must hold an <strong>Australian Credit Licence (ACL)</strong>, conduct unsuitability checks (RG 281),
          join <strong>AFCA (1800 931 678)</strong>, and report to <strong>CCR (Equifax, Experian, illion)</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(BNPL_PROVIDER_RULES).map(rule => (
            <div
              key={rule.id}
              className="p-3.5 rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{rule.provider}</span>
                <Badge variant={rule.monthlyFee > 0 ? 'warning' : 'outline'} className="text-[10px]">
                  {rule.monthlyFee > 0 ? `$${rule.monthlyFee}/mo` : '$0/mo Fee'}
                </Badge>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Schedule:</strong> {rule.repaymentSchedule}
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Late Fees:</strong>{' '}
                  {rule.initialLateFee === 0 ? (
                    <span className="text-emerald-500 font-semibold">$0 late fee (PayPal)</span>
                  ) : (
                    `$${rule.initialLateFee}${rule.subsequentLateFee > 0 ? ` + $${rule.subsequentLateFee} after 7d` : ''}`
                  )}
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Cap:</strong> {rule.lateFeeCapDescription}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Licence / Scheme:</span>
                  <span className="font-semibold text-foreground">ACL • AFCA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CCR Retention:</span>
                  <span className="font-semibold text-foreground">24mo RHI / 5yr Default</span>
                </div>
                <p className="text-[10px] text-muted-foreground/80 italic pt-0.5">
                  {rule.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <CalculatorActions
        onReset={handleReset}
        summaryText={summaryText}
        summaryTitle="BNPL Debt Analysis"
      />

      <div className="pt-2 flex flex-wrap gap-2.5">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_debt} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ndh_helpline} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.mob_strong_debt} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.afca_financial_disputes} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_budget} />
      </div>
    </Card>
  );
}

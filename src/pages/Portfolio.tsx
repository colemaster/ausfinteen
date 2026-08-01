import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { NumberInput } from '../components/ui/NumberInput';
import { SliderControl } from '../components/ui/SliderControl';
import { Disclaimer } from '../components/shared/Disclaimer';
import { usePortfolio, totalAnnualExpenses, type PortfolioData } from '../context/PortfolioContext';
import { getMarginalRate } from '../data/tax-brackets';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Separator';

function SectionHeader({ num, title, subtitle, colorClass }: {
  num: number; title: string; subtitle: string; colorClass: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-8 h-8 rounded-full ${colorClass} text-[var(--background)] flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-0.5`}>
        {num}
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

const EXPENSE_FIELDS: { key: keyof PortfolioData; label: string }[] = [
  { key: 'expRent',          label: 'Rent / Board' },
  { key: 'expGroceries',     label: 'Groceries & Food' },
  { key: 'expDining',        label: 'Dining Out & Takeaway' },
  { key: 'expUtilities',     label: 'Utilities (electricity/gas/water)' },
  { key: 'expInternet',      label: 'Internet & Phone' },
  { key: 'expTransport',     label: 'Transport (fuel/rego/public)' },
  { key: 'expHealth',        label: 'Health & Medical (incl. insurance)' },
  { key: 'expInsurance',     label: 'Insurance (home/contents/life)' },
  { key: 'expEntertainment', label: 'Entertainment & Subs' },
  { key: 'expClothing',      label: 'Clothing & Care' },
  { key: 'expEducation',     label: 'Education (fees/courses)' },
  { key: 'expChildcare',     label: 'Childcare' },
  { key: 'expTravel',        label: 'Travel & Holidays' },
  { key: 'expGym',           label: 'Gym & Sports' },
  { key: 'expHomeMaint',     label: 'Home Maintenance' },
  { key: 'expPets',          label: 'Pets' },
  { key: 'expMisc',          label: 'Miscellaneous' },
];

export function Portfolio() {
  const { portfolio, setPortfolio } = usePortfolio();

  const suggestedMargTax = useMemo(
    () => portfolio.grossSalary > 0 ? Math.round(getMarginalRate(portfolio.grossSalary) * 100) : null,
    [portfolio.grossSalary],
  );

  const expTotal = useMemo(() => totalAnnualExpenses(portfolio), [portfolio]);

  const set = (key: keyof PortfolioData) => (v: number) =>
    setPortfolio({ [key]: v });

  const filledSectionsCount = [
    portfolio.grossSalary > 0,
    portfolio.savingsBalance > 0 || portfolio.monthlySavingsContrib > 0,
    portfolio.mortgageBalance > 0,
    portfolio.etfValue > 0 || portfolio.monthlyEtfContrib > 0,
    portfolio.superBalance > 0,
    expTotal > 0,
  ].filter(Boolean).length;

  const progressPercentage = (filledSectionsCount / 6) * 100;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      {/* Page header */}
      <div className="pb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
          My Portfolio
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          Enter your current financial holdings. All information stays in your browser — nothing is sent anywhere.
          Once filled in, every calculator below will start with your actual numbers.
        </p>
        
        <div className="mt-6 bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Completion Progress</span>
            <span className="text-sm font-medium text-primary">{filledSectionsCount} of 6 sections</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Section 1 — Income & Tax */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={1} title="Income & Tax" colorClass="bg-primary"
          subtitle="Your gross annual salary and the marginal rate you pay on the last dollar earned."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput
            label="Gross Annual Salary"
            value={portfolio.grossSalary}
            onChange={set('grossSalary')}
            min={0} max={2000000} step={1000}
            prefix="$"
          />
          <div className="flex flex-col gap-2">
            <SliderControl
              label="Marginal Tax Rate"
              value={portfolio.margTax}
              onChange={set('margTax')}
              min={0} max={49} step={1}
              suffix="%"
            />
            {suggestedMargTax !== null && suggestedMargTax !== portfolio.margTax && (
              <button
                onClick={() => setPortfolio({ margTax: suggestedMargTax })}
                className="text-xs text-primary font-medium hover:underline text-left mt-1"
              >
                Suggested rate: {suggestedMargTax}% — click to apply
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Section 2 — Cash & Savings */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={2} title="Cash & Savings" colorClass="bg-[var(--success)]"
          subtitle="Savings accounts, high-yield accounts, term deposits, and how much you save each month."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput
            label="Total Savings Balance"
            value={portfolio.savingsBalance}
            onChange={set('savingsBalance')}
            min={0} max={5000000} step={1000}
            prefix="$"
          />
          <NumberInput
            label="Monthly Savings Contribution"
            value={portfolio.monthlySavingsContrib}
            onChange={set('monthlySavingsContrib')}
            min={0} max={50000} step={100}
            prefix="$"
          />
        </div>
      </Card>

      {/* Section 3 — Property & Mortgage */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={3} title="Property & Mortgage" colorClass="bg-amber-500"
          subtitle="Your primary residence. Leave at zero if renting."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput
            label="Property Value"
            value={portfolio.propertyValue}
            onChange={set('propertyValue')}
            min={0} max={10000000} step={10000}
            prefix="$"
          />
          <NumberInput
            label="Outstanding Mortgage Balance"
            value={portfolio.mortgageBalance}
            onChange={set('mortgageBalance')}
            min={0} max={5000000} step={5000}
            prefix="$"
          />
          <SliderControl
            label="Mortgage Interest Rate"
            value={portfolio.mortgageRate}
            onChange={set('mortgageRate')}
            min={0} max={15} step={0.1}
            suffix="%"
          />
          <SliderControl
            label="Years Remaining on Mortgage"
            value={portfolio.mortgageYearsRemaining}
            onChange={v => setPortfolio({ mortgageYearsRemaining: Math.round(v) })}
            min={0} max={40} step={1}
            suffix=" yrs"
          />
        </div>
      </Card>

      {/* Section 4 — Investments */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={4} title="Investments (ETFs & Shares)" colorClass="bg-violet-500"
          subtitle="Your taxable investment portfolio outside of super. Includes ETFs, individual shares, and managed funds."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NumberInput
            label="Portfolio Value"
            value={portfolio.etfValue}
            onChange={set('etfValue')}
            min={0} max={10000000} step={1000}
            prefix="$"
          />
          <NumberInput
            label="Monthly Contribution"
            value={portfolio.monthlyEtfContrib}
            onChange={set('monthlyEtfContrib')}
            min={0} max={50000} step={100}
            prefix="$"
          />
          <SliderControl
            label="Expected Annual Return"
            value={portfolio.etfReturn}
            onChange={set('etfReturn')}
            min={0} max={20} step={0.5}
            suffix="%"
          />
        </div>
      </Card>

      {/* Section 5 — Superannuation */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={5} title="Superannuation" colorClass="bg-cyan-500"
          subtitle="Your current super balance and monthly contributions (employer SG + any salary sacrifice)."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberInput
            label="Current Super Balance"
            value={portfolio.superBalance}
            onChange={set('superBalance')}
            min={0} max={5000000} step={1000}
            prefix="$"
          />
          <NumberInput
            label="Monthly Contributions (SG + Sac)"
            value={portfolio.monthlySuperContrib}
            onChange={set('monthlySuperContrib')}
            min={0} max={20000} step={100}
            prefix="$"
          />
        </div>
      </Card>

      {/* Section 6 — Living Expenses */}
      <Card variant="default" className="p-6 md:p-8">
        <SectionHeader
          num={6} title="Living Expenses" colorClass="bg-rose-500"
          subtitle="Monthly amounts for each category. Enter what applies to you — leave others at zero. Total annual expenses are used in FIRE and Savings Rate calculations."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {EXPENSE_FIELDS.map(({ key, label }) => (
            <NumberInput
              key={key}
              label={label}
              value={portfolio[key] as number}
              onChange={set(key)}
              min={0} max={50000} step={50}
              prefix="$"
              suffix="/mo"
            />
          ))}
        </div>
        
        <Separator className="my-6" />
        
        {/* Total expenses summary */}
        <div className={`rounded-xl px-5 py-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${ expTotal > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-muted/30 border-border' }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-foreground font-semibold">Monthly Expenses</span>
              {expTotal > 0 && <Badge variant="outline" className="border-rose-500/30 text-rose-600">Total</Badge>}
            </div>
            {expTotal > 0 && (
              <p className="text-xs text-muted-foreground">Annual run rate: {formatCurrency(expTotal)}</p>
            )}
          </div>
          <span className={`font-mono font-bold text-2xl ${expTotal > 0 ? 'text-rose-600 ' : 'text-muted-foreground'}`}>
            {expTotal > 0 ? formatCurrency(expTotal / 12) : '—'}
          </span>
        </div>
        
        {portfolio.grossSalary > 0 && expTotal > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Implied Savings:</span> {formatCurrency(Math.max(0, portfolio.grossSalary - expTotal))} per year 
            <span className="opacity-75"> ({Math.round(Math.max(0, (portfolio.grossSalary - expTotal) / portfolio.grossSalary) * 100)}% pre-tax savings rate)</span>
          </div>
        )}
      </Card>

      {/* Summary — what gets pre-filled */}
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
          What gets pre-filled from your portfolio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground">
          {[
            ['Tax Savings', 'Gross salary, marginal tax rate'],
            ['Savings Rate', 'Salary, expenses, monthly savings'],
            ['FIRE', 'Annual expenses, super balance, monthly savings'],
            ['Investment Comparison', 'ETF balance, monthly contribution, super balance'],
            ['House Affordability', 'Gross income, property value, mortgage rate'],
            ['Property Research', '(property details entered separately)'],
            ['Offset vs Debt Recycling', 'Mortgage balance, rate, years, marginal tax'],
            ['Direct vs Debt Recycling', 'ETF value, mortgage rate, marginal tax'],
          ].map(([tool, fields]) => (
            <div key={tool} className="flex flex-col gap-0.5">
              <span className="text-foreground font-medium">{tool}</span>
              <span className="text-xs">{fields}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-8">
        <NavLink
          to="/tax-savings"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Continue to Tax Savings
          <span aria-hidden className="text-lg">→</span>
        </NavLink>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You can return to update these values at any time — your calculators will automatically sync.
        </p>
      </div>

      <Disclaimer calculatorName="Portfolio" />
    </div>
  );
}

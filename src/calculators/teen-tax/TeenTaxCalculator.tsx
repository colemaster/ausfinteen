import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, MINOR_UNEARNED_TAX_RATES } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Calculator, ShieldAlert } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export function TeenTaxCalculator() {
  const { profile } = useTeenProfile();

  const [annualEarnedIncome, setAnnualEarnedIncome] = useState<number>(profile.hourlyRate * profile.hoursPerWeek * 52);
  const [uniformExpenses, setUniformExpenses] = useState<number>(120);
  const [rsaRcgCourseFees, setRsaRcgCourseFees] = useState<number>(0);
  const [unearnedInterestIncome, setUnearnedInterestIncome] = useState<number>(150);

  const totalDeductions = uniformExpenses + rsaRcgCourseFees;
  const taxableEarnedIncome = Math.max(0, annualEarnedIncome - totalDeductions);

  // Income Tax on earned income ($18,200 threshold)
  let earnedIncomeTax = 0;
  if (taxableEarnedIncome > 18200) {
    earnedIncomeTax = (taxableEarnedIncome - 18200) * 0.16; // 16% Stage 3 rate under $45k
  }

  // Division 6AA Minor Unearned Income Tax Math
  let unearnedTax = 0;
  if (unearnedInterestIncome > MINOR_UNEARNED_TAX_RATES.taxFreeLimit) {
    if (unearnedInterestIncome <= MINOR_UNEARNED_TAX_RATES.threshold66) {
      unearnedTax = (unearnedInterestIncome - 416) * 0.66;
    } else {
      unearnedTax = (1307 - 416) * 0.66 + (unearnedInterestIncome - 1307) * 0.45;
    }
  }

  const netKeepIncome = annualEarnedIncome - earnedIncomeTax;

  const chartData = useMemo(() => {
    return [
      { name: 'After-Tax Pay Keep', value: Math.round(netKeepIncome), color: '#10b981' },
      { name: 'Income Tax', value: Math.round(earnedIncomeTax), color: '#f59e0b' },
      { name: 'Work Deductions', value: Math.round(totalDeductions), color: '#3b82f6' },
    ];
  }, [netKeepIncome, earnedIncomeTax, totalDeductions]);

  const chartConfig = useMemo(() => {
    return {
      value: { label: 'Amount ($)', color: '#10b981' },
    };
  }, []);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen Tax & Work Deductions Calculator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimate your annual tax bill, work-related deductions (uniforms, RSA/RCG), and ATO Division 6AA unearned rates!
          </p>
        </div>
        <Badge variant="success">
          2026-27 Stage 3 ATO Rates
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Annual Earned Job Income ($)"
            value={annualEarnedIncome}
            onChange={v => setAnnualEarnedIncome(v)}
            min={500}
            max={60000}
            step={500}
            prefix="$"
          />

          <NumberInput
            label="Work Uniform & Safety Gear Expenses ($)"
            value={uniformExpenses}
            onChange={v => setUniformExpenses(v)}
            min={0}
            max={1000}
            step={20}
            prefix="$"
          />
        </div>

        <div className="space-y-4">
          <NumberInput
            label="RSA / RCG Course Fees ($)"
            value={rsaRcgCourseFees}
            onChange={v => setRsaRcgCourseFees(v)}
            min={0}
            max={500}
            step={25}
            prefix="$"
          />

          <NumberInput
            label="Bank Interest & Dividends (Unearned Income) ($)"
            value={unearnedInterestIncome}
            onChange={v => setUnearnedInterestIncome(v)}
            min={0}
            max={5000}
            step={50}
            prefix="$"
          />
        </div>
      </div>

      {/* Donut Chart Visualizer */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 font-mono">Gross Income Breakdown</h3>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Total Work Tax Deductions"
          value={`$${totalDeductions.toFixed(2)}`}
          numericValue={totalDeductions}
          format="currency"
          color="green"
          subtext="Uniforms + RSA/RCG courses"
        />
        <StatCard
          label="Job Income Tax Payable"
          value={`$${earnedIncomeTax.toFixed(2)}`}
          numericValue={earnedIncomeTax}
          format="currency"
          color={earnedIncomeTax === 0 ? 'green' : 'amber'}
          subtext={taxableEarnedIncome <= 18200 ? '$18,200 Tax-Free Threshold claimed!' : '16% Stage 3 marginal rate'}
        />
        <StatCard
          label="Div 6AA Unearned Minor Tax"
          value={`$${unearnedTax.toFixed(2)}`}
          numericValue={unearnedTax}
          format="currency"
          color={unearnedTax === 0 ? 'green' : 'red'}
          subtext={unearnedInterestIncome <= 416 ? 'Under $416 tax-free minor limit' : '66% ATO minor unearned rate'}
        />
      </div>

      {unearnedInterestIncome > 416 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2 text-rose-900 dark:text-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">ATO Division 6AA Minor Rule:</span>
            Because unearned investment/interest income exceeds <strong>$416/year</strong> for an under 18 minor, the ATO applies penalty tax rates (66% up to $1,307) to prevent tax avoidance by adult relatives.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_under18} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_minor_income} />
      </div>
    </Card>
  );
}

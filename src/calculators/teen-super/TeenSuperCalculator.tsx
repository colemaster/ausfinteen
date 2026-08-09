import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const SUPER_SG_RATE_2026_27 = 0.12; // 12.0% statutory SG FY 2026-27

export function TeenSuperCalculator() {
  const { profile } = useTeenProfile();

  const [hoursWk, setHoursWk] = useState<number>(profile.hoursPerWeek);
  const [hourlyPay, setHourlyPay] = useState<number>(profile.hourlyRate);
  const [age] = useState<number>(profile.age);
  const [fundStrategy, setFundStrategy] = useState<'indexed_high_growth' | 'default_mysuper'>('indexed_high_growth');

  const grossWk = hourlyPay * hoursWk;
  const isEligible = age >= 18 || hoursWk > 30;

  const annualSuper = isEligible ? grossWk * 52 * SUPER_SG_RATE_2026_27 : 0;
  
  // 40-year compound super growth (age to 60)
  const returnRate = fundStrategy === 'indexed_high_growth' ? 0.085 : 0.065;
  const years = 60 - age;
  const r = returnRate / 12;
  const n = years * 12;
  const monthlyContrib = annualSuper / 12;

  const fvSuper = isEligible && r > 0 ? monthlyContrib * ((Math.pow(1 + r, n) - 1) / r) : 0;

  // Build growth projection trajectory over time
  const trajectoryData = useMemo(() => {
    const data: { ageLabel: string; balance: number; contributions: number }[] = [];
    let cumulativeContrib = 0;
    for (let y = 0; y <= years; y += 5) {
      const currentN = y * 12;
      const val = isEligible && r > 0 ? monthlyContrib * ((Math.pow(1 + r, currentN) - 1) / r) : 0;
      cumulativeContrib = annualSuper * y;
      data.push({
        ageLabel: `Age ${age + y}`,
        balance: Math.round(val),
        contributions: Math.round(cumulativeContrib),
      });
    }
    return data;
  }, [age, years, isEligible, r, monthlyContrib, annualSuper]);

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
            Calculate your 12% Super Guarantee, check ATO 30+ hours/week under 18 eligibility, and project compound super at age 60!
          </p>
        </div>
        <Badge variant="success">
          12% ATO Super Rate (FY26-27)
        </Badge>
      </div>

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
          value={`$${(isEligible ? grossWk * 0.125 : 0).toFixed(2)}/wk`}
          numericValue={isEligible ? grossWk * 0.125 : 0}
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
          value={`$${Math.round(fvSuper).toLocaleString()}`}
          numericValue={Math.round(fvSuper)}
          format="currency"
          color="purple"
          subtext={`Over ${years} years compounding!`}
        />
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
            Your employer is paying ${Math.round(annualSuper).toLocaleString()}/yr into your super fund. Make sure to complete <strong>ATO Form NAT 13080</strong> to staple your existing fund!
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_guarantee} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_choice_form} />
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, SUPER_YOUTH_RULES } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';

export function TeenSuperCalculator() {
  const { profile } = useTeenProfile();

  const [hoursWk, setHoursWk] = useState<number>(profile.hoursPerWeek);
  const [hourlyPay, setHourlyPay] = useState<number>(profile.hourlyRate);
  const [age] = useState<number>(profile.age);
  const [fundStrategy, setFundStrategy] = useState<'indexed_high_growth' | 'default_mysuper'>('indexed_high_growth');

  const grossWk = hourlyPay * hoursWk;
  const isEligible = age >= 18 || hoursWk > 30;

  const annualSuper = isEligible ? grossWk * 52 * SUPER_YOUTH_RULES.superGuaranteeRate : 0;
  
  // 40-year compound super growth (age to 60)
  const returnRate = fundStrategy === 'indexed_high_growth' ? 0.085 : 0.065;
  const years = 60 - age;
  const r = returnRate / 12;
  const n = years * 12;
  const monthlyContrib = annualSuper / 12;

  const fvSuper = isEligible && r > 0 ? monthlyContrib * ((Math.pow(1 + r, n) - 1) / r) : 0;

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
          12% ATO Super Guarantee Rate
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          label="Weekly Super (12%)"
          value={`$${(isEligible ? grossWk * 0.12 : 0).toFixed(2)}/wk`}
          color={isEligible ? 'cyan' : 'red'}
          subtext={isEligible ? 'Paid by employer' : 'Requires >30h/wk for under 18s'}
        />
        <StatCard
          label="Annual Super Deposited"
          value={`$${Math.round(annualSuper).toLocaleString()}/yr`}
          color="green"
          subtext="Saved tax-effectively at 15%"
        />
        <StatCard
          label="Projected Super Balance at 60"
          value={`$${Math.round(fvSuper).toLocaleString()}`}
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

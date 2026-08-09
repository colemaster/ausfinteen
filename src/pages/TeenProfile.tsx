import { useTeenProfile, AU_LOCATIONS } from '@/context/TeenProfileContext';
import { NumberInput } from '@/components/ui/NumberInput';
import { SliderControl } from '@/components/ui/SliderControl';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { FinancialHealthScore } from '@/components/ui/FinancialHealthScore';
import { PaycheckSplitterWidget } from '@/components/teen-profile/PaycheckSplitterWidget';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AGE_PRESETS } from '@/data/teen-finance-data';
import { usePageTitle } from '@/hooks/usePageTitle';
import { User, Briefcase, Target, RefreshCw, Zap, MapPin, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MANDY_MODULES } from '@/data/mandy-topics';

export function TeenProfile() {
  usePageTitle('My Real-World Money Profile');
  const {
    profile,
    updateProfile,
    applyAgePreset,
    resetProfile,
    weeklyGrossIncome,
    annualGrossIncome,
    estimatedTaxWithheldWeekly,
    weeklyNetPay,
    superEligible,
    weeklySuperContribution,
  } = useTeenProfile();

  const recommended = getRecommendedModules(profile.age);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-emerald-500/20 p-6 sm:p-10 border border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
                My Real-World Money Profile
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Hey {profile.name}! 🤠
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              Set up your first job pay, age, and savings goals. All calculators across the site will automatically personalize to your numbers!
            </p>
          </div>
          <button
            type="button"
            onClick={resetProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        {/* Quick Age Presets Bar */}
        <div className="mt-6 pt-5 border-t border-primary/20 space-y-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Age Presets (One-Click Setup):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[15, 16, 17, 18].map(age => {
              const preset = AGE_PRESETS[age];
              const isSelected = profile.age === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => applyAgePreset(age)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                      : 'bg-card/80 hover:bg-card border-border text-foreground'
                  }`}
                >
                  <div className="font-extrabold text-xs">{preset?.label}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    ${preset?.hourlyRate.toFixed(2)}/hr • {preset?.hoursPerWeek}h/wk
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2030 Financial Health Gauge Widget */}
      <FinancialHealthScore
        age={profile.age}
        hasSuper={profile.hasSuperFund}
        savings={profile.currentSavings}
        savingsTarget={profile.savingsGoalTarget}
        hoursWk={profile.hoursPerWeek}
        claimsTaxFree={profile.claimsTaxFreeThreshold}
      />

      {/* Interactive Paycheck Stream Allocator Widget */}
      <PaycheckSplitterWidget
        grossWeekly={weeklyGrossIncome}
        taxWeekly={estimatedTaxWithheldWeekly}
        superWeekly={weeklySuperContribution}
        netWeekly={weeklyNetPay}
        savingsTarget={profile.savingsGoalTarget}
        currentSavings={profile.currentSavings}
        goalName={profile.savingsGoalName}
      />

      {/* Main Income & Profile Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <SpotlightCard className="space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">First Job Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Your Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => updateProfile({ name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Your Location
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AU_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => updateProfile({ location: loc })}
                    className={`px-2.5 py-2 text-[11px] font-bold rounded-xl border text-left transition-all truncate ${
                      profile.location === loc
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card border-border hover:bg-muted text-foreground'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Budgets, transport and property tools personalize to your state and city.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Your Age</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 16, 17, 18].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => applyAgePreset(a)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      profile.age === a
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card border-border hover:bg-muted text-foreground'
                    }`}
                  >
                    {a} yrs old
                  </button>
                ))}
              </div>
            </div>

            <NumberInput
              label="Hourly Pay Rate ($)"
              value={profile.hourlyRate}
              onChange={v => updateProfile({ hourlyRate: v })}
              min={10}
              max={60}
              step={0.5}
              prefix="$"
            />

            <SliderControl
              label="Hours Worked Per Week"
              value={profile.hoursPerWeek}
              onChange={v => updateProfile({ hoursPerWeek: v })}
              min={1}
              max={40}
              step={1}
              suffix=" hrs/wk"
            />
          </div>
        </SpotlightCard>

        {/* Savings Goals & Banking */}
        <SpotlightCard className="space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-foreground">Savings Goals & Emergency Buffer</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Savings Goal Name</label>
              <input
                type="text"
                value={profile.savingsGoalName}
                onChange={e => updateProfile({ savingsGoalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <NumberInput
              label="Target Goal Amount ($)"
              value={profile.savingsGoalTarget}
              onChange={v => updateProfile({ savingsGoalTarget: v })}
              min={500}
              max={20000}
              step={250}
              prefix="$"
            />

            <NumberInput
              label="Current Savings Balance ($)"
              value={profile.currentSavings}
              onChange={v => updateProfile({ currentSavings: v })}
              min={0}
              max={50000}
              step={100}
              prefix="$"
            />

            <NumberInput
              label="Monthly Phone Contract ($)"
              value={profile.phoneContractMonthly}
              onChange={v => updateProfile({ phoneContractMonthly: v })}
              min={0}
              max={150}
              step={5}
              prefix="$"
            />
          </div>
        </SpotlightCard>
      </div>

      {/* Profile Live Calculation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Weekly Gross Pay"
          value={`$${weeklyGrossIncome.toFixed(2)}`}
          numericValue={weeklyGrossIncome}
          format="currency"
          color="blue"
          subtext={`$${annualGrossIncome.toLocaleString()}/yr`}
        />
        <StatCard
          label="Tax Withheld (Weekly)"
          value={`$${estimatedTaxWithheldWeekly.toFixed(2)}`}
          numericValue={estimatedTaxWithheldWeekly}
          format="currency"
          color={estimatedTaxWithheldWeekly === 0 ? 'green' : 'amber'}
          subtext={estimatedTaxWithheldWeekly === 0 ? '$18,200 Tax-Free claimed' : 'PAYG tax sent to ATO'}
        />
        <StatCard
          label="Take-Home Pay (Bank)"
          value={`$${weeklyNetPay.toFixed(2)}`}
          numericValue={weeklyNetPay}
          format="currency"
          color="green"
          subtext="Net earnings every payday"
        />
        <StatCard
          label="12% Super Guarantee"
          value={`$${weeklySuperContribution.toFixed(2)}`}
          numericValue={weeklySuperContribution}
          format="currency"
          color={superEligible ? 'cyan' : 'red'}
          subtext={superEligible ? 'Paid to super fund' : 'Requires >30h/wk for under 18s'}
        />
      </div>

      {/* Personalised Next Steps — guides the teen to their next module */}
      <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-5" aria-labelledby="next-steps-heading">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-500" />
          <h2 id="next-steps-heading" className="text-lg font-bold text-foreground">
            Where Should I Go From Here?
          </h2>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Personalised for age {profile.age}
          </span>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Your numbers are now wired into every calculator on the site. Here's the recommended next step for a{' '}
          {profile.age}-year-old:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommended.map(m => (
            <Link
              key={m.id}
              to={m.route}
              className="group flex flex-col gap-2 p-4 rounded-2xl border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/15 border border-primary/10 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                  {m.emoji}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {m.id === recommended[0].id ? '⭐ Start here' : 'Recommended'}
                </span>
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {m.title}
              </span>
              <span className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{m.description}</span>
              <span className="mt-auto pt-1 flex items-center gap-1.5 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                Explore Module <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function getRecommendedModules(age: number) {
  const byId = (id: string) => MANDY_MODULES.find(m => m.id === id)!;
  if (age < 16) {
    return [byId('money-and-you'), byId('careers-employment'), byId('teen-budgeting'), byId('brisbane-qld')];
  }
  if (age < 18) {
    return [byId('careers-employment'), byId('teen-budgeting'), byId('tax-guide'), byId('car-driving')];
  }
  return [byId('tax-guide'), byId('investing-shares'), byId('super-retirement'), byId('spending-saving')];
}

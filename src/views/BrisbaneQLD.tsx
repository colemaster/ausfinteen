import { brisbaneQldModule as moduleData } from '@/data/modules/brisbane-qld';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { BrisbaneBudgetCalculator } from '@/calculators/teen-brisbane/BrisbaneBudgetCalculator';
import { BrisbaneUniExplorer } from '@/calculators/teen-brisbane/BrisbaneUniExplorer';
import { QldSchoolsYear12 } from '@/calculators/teen-brisbane/QldSchoolsYear12';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { MapPin, Home, Landmark, ExternalLink } from 'lucide-react';
import { useSearchParams } from '@/lib/router';
import {
  HECS_BANDS_2026,
  BRISBANE_SUBURBS,
  QLD_FIRST_HOME_HELP,
  QLD_TEEN_RULES,
  QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS,
} from '@/data/brisbane-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { SmartImage } from '@/components/ui/SmartImage';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Bus, CreditCard, Sparkles, AlertTriangle, ShieldCheck, Coins, Briefcase, HeartPulse, GraduationCap } from 'lucide-react';

const BNE_TABS = ['unis', 'schools', 'firstjob', 'transit', 'realestate', 'help'] as const;
type BneTab = (typeof BNE_TABS)[number];

function readBneTab(searchParams: URLSearchParams): BneTab {
  const raw = searchParams.get('tab');
  return BNE_TABS.includes(raw as BneTab) ? (raw as BneTab) : 'unis';
}

const BRISBANE_WEB_SOURCES = [
  OFFICIAL_WEB_LINKS.translink_50c_fares,
  OFFICIAL_WEB_LINKS.translink_smart_ticketing,
  OFFICIAL_WEB_LINKS.translink_gocard,
  OFFICIAL_WEB_LINKS.qld_school_based,
  OFFICIAL_WEB_LINKS.uq_study,
  OFFICIAL_WEB_LINKS.qut_study,
  OFFICIAL_WEB_LINKS.griffith_study,
  OFFICIAL_WEB_LINKS.unisc_study,
  OFFICIAL_WEB_LINKS.unisq_study,
  OFFICIAL_WEB_LINKS.acu_study,
  OFFICIAL_WEB_LINKS.tafe_qld,
  OFFICIAL_WEB_LINKS.qtac,
  OFFICIAL_WEB_LINKS.qilt_survey,
  OFFICIAL_WEB_LINKS.studyassist_hecs,
  OFFICIAL_WEB_LINKS.qld_rta,
  OFFICIAL_WEB_LINKS.qld_fhog,
  OFFICIAL_WEB_LINKS.qld_boost_to_buy,
  OFFICIAL_WEB_LINKS.qld_rego,
  OFFICIAL_WEB_LINKS.qcaa,
  OFFICIAL_WEB_LINKS.qce_atar,
];

export function BrisbaneQLD() {
  usePageTitle('Brisbane, QLD · Living & Uni Guide');
  const { profile, updateProfile } = useTeenProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readBneTab(searchParams);

  const setTab = (id: string) => {
    if (!BNE_TABS.includes(id as BneTab)) return;
    setSearchParams(
      prev => {
        const cp = new URLSearchParams(prev);
        if (id === 'unis') cp.delete('tab');
        else cp.set('tab', id);
        return cp;
      },
      { replace: true },
    );
  };

  const isBrisbane = profile.location === 'Brisbane, QLD';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-primary/20 p-6 sm:p-10 border border-sky-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
              <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
                Location Module • {moduleData.title}
              </Badge>
              {isBrisbane && (
                <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
                  ✓ Set as My Location
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {moduleData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {moduleData.description}
            </p>
            {!isBrisbane && (
              <button
                type="button"
                onClick={() => updateProfile({ location: 'Brisbane, QLD' })}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                Set My Location to Brisbane, QLD
              </button>
            )}
          </div>
          <div className="md:col-span-4 hidden md:flex justify-center">
            <SmartImage
              src="/assets/graphics/popmart_bne.jpg"
              alt="Brisbane Nights 3D Popmart Toy"
              className="w-36 h-36 rounded-2xl object-cover border-2 border-sky-500/30 shadow-xl hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={144}
              height={144}
            />
          </div>
        </div>
      </div>

      {/* Interactive Budget Tool */}
      <BrisbaneBudgetCalculator />

      {/* Tabs: Unis / Real Estate */}
      <div className="space-y-5">
        <Tabs
          tabs={[
            { id: 'unis', label: '🎓 Brisbane Unis & HECS' },
            { id: 'schools', label: '🏫 Year 12 & Schools' },
            { id: 'firstjob', label: '💼 15yo First Job Deep Analysis' },
            { id: 'transit', label: '🚌 50¢ TransLink Transit' },
            { id: 'realestate', label: '🏠 Real Estate & Renting' },
            { id: 'help', label: '💰 First-Home Help' },
          ]}
          activeTab={tab}
          onChange={setTab}
          sticky={true}
        />

        {tab === 'unis' && (
          <div className="space-y-6">
            <BrisbaneUniExplorer />

            <Card variant="glass" className="p-6 space-y-5">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <h3 className="text-sm font-bold text-foreground mb-2">HECS-HELP Student Contribution Bands (2026/2027)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {HECS_BANDS_2026.map(b => (
                    <div key={b.band} className="rounded-xl border border-border bg-card p-3">
                      <div className="text-[11px] text-muted-foreground font-semibold leading-snug">{b.band}</div>
                      <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{b.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2.5">
                  You never pay upfront — HECS-HELP loans the amount, and you only start repaying once your income passes
                  the marginal HELP repayment threshold ($69,528 in 2026-27). Apply via QTAC in Queensland.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.uq_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qut_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.griffith_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.unisc_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.unisq_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.acu_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.tafe_qld} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qtac} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qilt_survey} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.studyassist_hecs} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'schools' && (
          <QldSchoolsYear12 />
        )}

        {tab === 'firstjob' && (
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.persona.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Verified {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.lastVerified} • {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.legislation} &amp; Modern Awards 2026-27
                  </p>
                </div>
              </div>
              <Badge variant="success" className="font-mono text-xs">
                Form CE1 • 12h Term / 38h Holiday • $22,866 Tax-Free
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.persona.schoolYearLevel} in {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.persona.location} ({QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.persona.legalClassificationQLD}).
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Term / Holiday Cap</div>
                <div className="text-xl font-bold font-mono text-primary">12h / 38h wk</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Max 4h school day • 8h wknd</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">15yo Retail Casual</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$15.64–$21.89</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">$18.77 Thu &gt;6pm/Sat • $31.28 PH</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">52-Wk Cash Model</div>
                <div className="text-xl font-bold font-mono text-foreground">$10,008.80</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">100% Tax-Free (&lt;$22,866 LITO)</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Holiday Super Hack</div>
                <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">&gt;30 hrs / wk</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Unlocks 12% SG on ALL hours</div>
              </div>
            </div>

            {/* 1. QLD Child Employment Act 2006 & Form CE1 */}
            <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>1. QLD Child Employment Act 2006, Mandatory Form CE1 &amp; After-6pm Safety</span>
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Inspectorate: {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.regulator} ({QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.inspectoratePhone})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1.5">
                  <div className="font-bold text-foreground">
                    {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.mandatoryConsentForm.code}: {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.mandatoryConsentForm.officialName} ({QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.mandatoryConsentForm.statutorySection})
                  </div>
                  <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-0.5 leading-relaxed">
                    {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.mandatoryConsentForm.rules.map(rule => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1">
                  <div className="font-bold text-foreground">Statutory Hour Caps, Curfew &amp; Safe Escort</div>
                  <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-0.5">
                    <li><strong>School Term:</strong> Max <strong>{QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.schoolTermMaxWeeklyHours} hrs/week</strong> (max {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.schoolDayMaxDailyHours} hrs on a school day; max {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.nonSchoolDayTermMaxDailyHours} hrs on Sat/Sun).</li>
                    <li><strong>QLD School Holidays:</strong> Max <strong>{QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.schoolHolidaysMaxWeeklyHours} hrs/week</strong> (max {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.schoolHolidaysMaxDailyHours} hrs/day).</li>
                    <li><strong>Night Curfew:</strong> Strict prohibition between <strong>{QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.curfewStart} and {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.curfewEnd}</strong>.</li>
                    <li><strong>Breaks &amp; Shift Gap:</strong> Mandatory {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.mandatoryBreakDurationMinutes}-min rest break after {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.mandatoryBreakAfterContinuousHours} continuous hours; minimum {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.workingHoursLimits.minRestGapBetweenShiftsHours}-hour gap between shifts.</li>
                    <li><strong>Safe Travel Home After 6:00pm:</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldChildEmploymentLaw.safetyAndDutyOfCare.after6pmSafeTransport}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. 8-Award Pay & Shift Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>2. Brisbane 15-Year-Old Casual Award Pay &amp; Shift Matrix (2026-27)</span>
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Includes 25% Casual Loading • 1 Dec 2026 [2026] FWCFB 75 Ready
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="py-2.5 px-3 font-bold text-foreground">Industry &amp; Award</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">15yo %</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">Weekday Casual</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">Thu &gt;6pm / Sat</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">Sunday</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">Public Holiday</th>
                      <th className="py-2.5 px-3 font-bold text-foreground">Min Shift &amp; Key Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.awardPayAndShiftMatrix.map(row => (
                      <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-foreground">{row.awardName}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{row.awardCode} • {row.typicalBrisbaneRoles}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{Math.round(row.juniorPercentageAt15 * 100)}%</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${row.casualWeekdayAt15.toFixed(2)}/hr</td>
                        <td className="py-2.5 px-3 font-mono text-foreground whitespace-nowrap">${row.saturdayCasualAt15.toFixed(2)}/hr</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-600 dark:text-sky-400 whitespace-nowrap">${row.sundayCasualAt15.toFixed(2)}/hr</td>
                        <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">${row.publicHolidayCasualAt15.toFixed(2)}/hr</td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{row.minShiftHours}:</span> {row.studentShiftException}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. 52-Week Cash-Flow & Holiday Super Model */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>3. 52-Week Brisbane Year 9/10 Cash-Flow &amp; The 30-Hour Holiday Super Hack</span>
                </h3>
                <Badge variant="success" className="text-[10px] font-mono">
                  SGAA 1992 s 27(1)(a) • Payday Super
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">40 School Term Weeks (9 hrs/wk)</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolTermRoster.weeklyGrossPay.toFixed(2)}/wk • ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolTermRoster.total40TermWeeksGross.toFixed(2)}/yr
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolTermRoster.shift1} + {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolTermRoster.shift2}.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">6 Holiday Weeks + 30-Hr Super Unlock</div>
                  <div className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
                    ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolHolidaySurge.totalHolidayAndPHGross.toFixed(2)} Pay + ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.annualSummary.superGuaranteeEarned.toFixed(2)} Super
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Working <strong>{QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.schoolHolidaySurge.hoursPerSuperBoostWeek} hrs/wk</strong> in 2 December holiday weeks crosses the <strong>30-hr/wk threshold</strong> under <em>SGAA 1992</em> s 27(1)(a), forcing 12.0% Super on ALL 32 hours!
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">Annual Total &amp; 16th Birthday Jump</div>
                  <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                    ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.annualSummary.totalAnnualGrossIncome.toFixed(2)}/yr ($0 Tax)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    100% tax-free (under ${QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.annualCashflowAndHolidaySuperModel.annualSummary.effectiveTaxFreeThreshold2026_27.toLocaleString()} LITO threshold). Turning 16 boosts Fast Food pay by <strong>+25.1%</strong> ($13.90 → $17.39/hr) and Retail by <strong>+11.2%</strong> ($15.64 → $17.39/hr).
                  </p>
                </div>
              </div>
            </div>

            {/* 4. 8 Brisbane Shopping Hubs on 50c TransLink */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bus className="w-4 h-4 text-sky-500" />
                <span>4. Top 8 Brisbane Teen Hiring Precincts &amp; $1.00 Round-Trip 50¢ TransLink Access</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.brisbaneShoppingHubsAndTransit.map(h => (
                  <div key={h.name} className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                    <div className="font-bold text-foreground leading-snug">{h.name}</div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{h.region} ({h.suburb}) • ${h.roundTripFare.toFixed(2)} round-trip</div>
                    <p className="text-[11px] text-muted-foreground"><strong>Transit:</strong> {h.translinkAccess}</p>
                    <p className="text-[11px] text-muted-foreground"><strong>Employers:</strong> {h.majorTeenEmployers.join(', ')}</p>
                    <p className="text-[10px] text-muted-foreground italic">{h.safetyAndPickupNote}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Year 10 SET Plan, SATs & Healthcare Privacy at 15 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>5. QLD Year 10 SET Plan, 30-Day Work Experience &amp; SATs</span>
                </div>
                <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-1 leading-relaxed">
                  <li><strong>Year 10 SET Plan &amp; myQCE:</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldSchoolAndCareerIntegration.year10SetPlan.summary}</li>
                  <li><strong>30-Day School Work Experience vs Illegal Unpaid Trials:</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldSchoolAndCareerIntegration.workExperienceVsPaidTrials.workExperienceAct}</li>
                  <li><strong>School-Based Apprenticeships &amp; Traineeships (SATs):</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.qldSchoolAndCareerIntegration.schoolBasedApprenticeshipsAndTraineeships.qceCreditsAwarded}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>6. Healthcare Privacy at 15 (Medicare MS011 &amp; 7 Brisbane headspace Hubs)</span>
                </div>
                <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-1 leading-relaxed">
                  <li><strong>Own Green Medicare Card at 15 (Form MS011 &quot;Copy&quot; Hack):</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.healthcarePrivacyAndIdAt15.medicareIndependence.copyVsTransferRule}</li>
                  <li><strong>My Health Record (Age 14+):</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.healthcarePrivacyAndIdAt15.myHealthRecordControl.rule}</li>
                  <li><strong>7 Free Greater Brisbane headspace Centres (Ages 12–25):</strong> {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.healthcarePrivacyAndIdAt15.brisbaneHeadspaceNetwork.map(c => c.centre.replace('headspace ', '')).join(', ')} (plus 24/7 Kids Helpline <strong>1800 55 1800</strong>).</li>
                  <li><strong>135-Pt ID &amp; PrepL at 15y 11m:</strong> Birth Certificate (70) + QLD High School Photo ID (40) + Medicare Card (25) = {QLD_15YO_BRISBANE_FIRST_JOB_DEEP_ANALYSIS.healthcarePrivacyAndIdAt15.id100PointsCombo.totalPoints} pts. Enrol in <strong>PrepL ($29.70)</strong> at 15 years 11 months.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_child_employment_ce1} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_awards} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_minimum_shifts} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.services_australia_medicare_15} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_school_based} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_50c_fares} />
            </div>
          </Card>
        )}

        {tab === 'transit' && (
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-foreground">TransLink 50¢ Transit Revolution & Network Guide</h2>
              </div>
              <Badge variant="success" className="font-mono text-xs">
                Permanent Statutory 50¢ Flat Fares
              </Badge>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Flat Fare / Journey</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$0.50</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">All 8 SEQ Zones</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Daily Round-Trip</div>
                <div className="text-2xl font-bold font-mono text-foreground">$1.00</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">~$240/yr (48 commuter wks)</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Primary Kids Weekends</div>
                <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">100% Free</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Child Go Card (Sat & Sun)</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Net Annual Savings vs Car</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$4,000+</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">~$85–$115/wk cash back</div>
              </div>
            </div>

            {/* Core Pillars: Grid of 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Network Scope */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>1. Permanent Statutory Law & Statewide Scope</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enacted under Queensland transport legislation and state budget frameworks, the <strong>50¢ flat fare</strong> is a permanent statutory policy. A single trip costs 50 cents whether you travel 1 stop in South Bank or 100+ km from Gympie North or Varsity Lakes into Brisbane Central.
                </p>
                <div className="text-[11px] bg-background/80 rounded-xl p-2.5 border border-border space-y-1">
                  <div className="font-semibold text-foreground">Modes & Regions Covered:</div>
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li><strong>South East Queensland:</strong> All buses, QR Citytrain lines, Gold Coast G:link tram, Brisbane CityCats & cross-river ferries, Southern Moreton Bay Islands.</li>
                    <li><strong>9 Regional City Bus Networks:</strong> Cairns, Townsville, Toowoomba, Mackay, Rockhampton, Bundaberg, Gladstone, and Hervey Bay / Maryborough.</li>
                    <li><strong>Exclusions:</strong> Privately operated Brisbane Airtrain and QR long-distance Traveltrains.</li>
                  </ul>
                </div>
              </div>

              {/* Pillar 2: Smart Ticketing */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>2. Smart Ticketing & Contactless Rules</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tap on and tap off at pink validator gates with contactless physical <strong>Visa or Mastercard</strong> debit/credit cards, digital wallets (<strong>Apple Pay, Google Pay, Samsung Pay</strong>), or traditional Go Cards.
                </p>
                <div className="text-[11px] bg-background/80 rounded-xl p-2.5 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Important Smart Ticketing Caveats:</span>
                  </div>
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li><strong>Amex Discontinued:</strong> American Express was officially discontinued from <strong>15 December 2025</strong> across all TransLink card readers.</li>
                    <li><strong>Avoid Card Clash:</strong> Separate your card from your phone case/wallet before tapping.</li>
                    <li><strong>Device Token Matching:</strong> A phone and physical card have different tokens. You must tap ON and tap OFF with the <em>exact same device</em> to prevent two default unfinalised fares.</li>
                    <li><strong>60-Min Transfer Window:</strong> Free transfers between bus, train, tram, and ferry if initiated within 60 minutes of touching off.</li>
                  </ul>
                </div>
              </div>

              {/* Pillar 3: Concessions & Student Travel */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>3. Concessions & Student Travel Rules</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Queensland offers structured travel concessions for children, school students, and university attendees:
                </p>
                <div className="text-[11px] bg-background/80 rounded-xl p-2.5 border border-border space-y-1">
                  <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                    <li><strong>Under 5s:</strong> Travel 100% free at all times with an adult (no card needed).</li>
                    <li><strong>Primary School (5–14):</strong> Travel <strong>100% FREE on weekends</strong> (Sat & Sun year-round) using an orange Child Go Card. <em>Must maintain a positive card balance</em> to open gates. Weekday travel (including school holidays) is standard 50¢.</li>
                    <li><strong>Secondary Students (15–18):</strong> Pay 50¢ on weekdays and travel free on weekends with approved Child Go Card & student ID.</li>
                    <li><strong>Tertiary & Uni Students:</strong> Standard flat 50¢ fare across all zones. Simply tap contactless Visa/Mastercard without needing concession paperwork.</li>
                  </ul>
                </div>
              </div>

              {/* Pillar 4: Transit vs Car Economic Comparison */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <span>4. Economic Showdown: 50¢ Transit vs Private Car</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Operating a car in South East Queensland consumes a massive portion of a young worker's or student's income:
                </p>
                <div className="text-[11px] bg-background/80 rounded-xl p-2.5 border border-border space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">TransLink Commuter</div>
                      <div className="font-mono text-foreground font-semibold">$1.00 / day</div>
                      <div className="text-muted-foreground">$5/wk • $240/yr (48 wks)</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Private Car Running</div>
                      <div className="font-mono text-foreground font-semibold">~$4,880 – $6,380 / yr</div>
                      <div className="text-muted-foreground">Fuel, Rego+CTP, Ins., Maint. + Parking</div>
                    </div>
                  </div>
                  <div className="font-bold text-foreground text-xs pt-1">
                    Net Cash Savings: <span className="text-emerald-600 dark:text-emerald-400 font-mono">+$4,640 to $6,140/yr</span> (~$90/wk surplus)!
                  </div>
                </div>
              </div>
            </div>

            {/* Next Gen Corridors & Airport Hack */}
            <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>🚀 SEQ High-Capacity Corridors & The $1.00 Airport Hack</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">Brisbane Metro (M1 & M2)</div>
                  <p className="text-muted-foreground text-[11px]">
                    Bi-articulated 100% electric transit arriving every 3–5 min. M1 links Eight Mile Plains to Roma St; M2 links RBWH to UQ Lakes (St Lucia) via Eleanor Schonell Bridge.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">Cross River Rail Under River</div>
                  <p className="text-muted-foreground text-[11px]">
                    10.2km rail line with 5.9km twin tunnels and 4 underground stations: Boggo Rd (PA Hospital), Woolloongabba, Albert St (CBD heart), and Roma St interchange.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">The $1.00 Airport Workaround</div>
                  <p className="text-muted-foreground text-[11px]">
                    Airtrain is private and costs $20+. Take a 50¢ train or bus to Toombul/Chermside, transfer to TransLink Bus 590 to Skygate (DFO) for 50¢, and hop on the free terminal shuttle ($1.00 total!).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_50c_fares} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_smart_ticketing} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_gocard} />
            </div>
          </Card>
        )}

        {tab === 'realestate' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Home className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-bold text-foreground">Brisbane Rent, Sharehouses & Suburbs</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Median House Rent</div>
                <div className="text-2xl font-bold font-mono text-foreground">$700/wk</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Median Unit Rent</div>
                <div className="text-2xl font-bold font-mono text-foreground">$600/wk</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Shared Room (5km CBD)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$286/wk</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Vacancy Rate (SQM)</div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">0.8%</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-bold text-foreground">Suburb</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Ring</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Sharehouse Room</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Unit Median</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Commute</th>
                    <th className="py-2 font-bold text-foreground">Vibe</th>
                  </tr>
                </thead>
                <tbody>
                  {BRISBANE_SUBURBS.map(s => (
                    <tr key={s.suburb} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{s.suburb}</td>
                      <td className="py-2.5 pr-3 text-[11px] text-muted-foreground whitespace-nowrap">{s.ring ?? 'Middle'}</td>
                      <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">{s.sharedWeekly}</td>
                      <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">{s.unitWeekly}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{s.commute}</td>
                      <td className="py-2.5 text-muted-foreground">{s.vibe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Figures are 2026-27 medians from CoreLogic, SQM Research (0.7%–0.9% vacancy rate), and the Student Accommodation Council ($286/wk within 5km).
              Under Queensland tenancy legislation, rental bonds are strictly capped at a maximum of 4 weeks rent across all properties (lodged with the RTA within 10 days using Form 2),
              rent increases are limited to once every 12 months attached to the property with mandatory 2 months written notice, and rent bidding is strictly prohibited.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_rta} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_gocard} />
            </div>
          </Card>
        )}

        {tab === 'help' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Landmark className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">First-Home Buyer Help in Queensland</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {QLD_FIRST_HOME_HELP.map(h => (
                <div key={h.name} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="text-[11px] font-bold text-foreground leading-snug">{h.name}</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{h.amount}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{h.note}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Queensland offers the most generous state-level first home owner grant in Australia (up to $30,000 on new
              homes under $750,000) plus stamp duty concessions and the Boost to Buy shared equity scheme. Rules change
              often — check the QLD Revenue Office before relying on any figure.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_fhog} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_boost_to_buy} />
            </div>
          </Card>
        )}
      </div>

      {/* QLD State Rules for Teens */}
      <div className="calculator-section">
        <Card variant="glass" className="p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">QLD State Rules That Matter for Teens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {QLD_TEEN_RULES.map(rule => (
              <div key={rule.title} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{rule.emoji}</span>
                  <h3 className="font-bold text-foreground text-sm">{rule.title}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{rule.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_rego} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_50c_fares} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_smart_ticketing} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_gocard} />
          </div>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Brisbane, QLD?" />
      </div>

      {/* Continue the money journey */}
      <div className="calculator-section">
        <ModulePrevNext currentId="brisbane-qld" />
      </div>

      {/* Web Sources */}
      <div className="calculator-section">
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ExternalLink className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-foreground">Official QLD & Brisbane Sources</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated government and university resources for Brisbane living, uni applications and QLD state rules.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {BRISBANE_WEB_SOURCES.map((link, i) => (
              <WebReferenceLink key={i} link={link} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Based on 2026-27 data (verified 6 November 2026). For education only — not financial advice. Verify rates and rules against official QLD
            Government and university sources.
          </p>
        </Card>
      </div>

      <PrintShareFAB />
    </div>
  );
}

import { carDrivingModule as moduleData } from '@/data/modules/car-driving';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { FirstCarCostCalculator } from '@/calculators/teen-car/FirstCarCostCalculator';
import { EvVsPetrolCalculator } from '@/calculators/teen-car/EvVsPetrolCalculator';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { PrintShareFAB } from '@/components/shared/PrintShareFAB';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  Car,
  CarFront,
  Fuel,
  ParkingCircle,
  ExternalLink,
  GraduationCap,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  FileText,
  Zap,
} from 'lucide-react';
import { useSearchParams } from '@/lib/router';
import {
  QLD_LICENCE_PATH,
  QLD_LICENCE_FEES,
  QLD_STANDARD_PATHWAY_GOV_COST,
  QLD_STANDARD_PATHWAY_5YR_COST,
  QLD_ROAD_RULES_FINES,
  QLD_DRIVING_LESSON_RANGE,
  BRISBANE_FUEL_PRICES,
  BRISBANE_PRICE_CYCLE,
  BRISBANE_FUEL_CYCLE_METRICS,
  QLD_FUEL_REPORTING_SCHEME,
  BRISBANE_PARKING_ZONES,
  BRISBANE_FREE_PARKING_TIPS,
  BRISBANE_OFFSTREET_PARKING,
  OFFICIAL_PPSR_DATA,
  QLD_CTP_PROVIDERS,
  QLD_CTP_CLASS1_BREAKDOWN,
  YOUNG_DRIVER_INSURANCE_PROFILES,
  YOUNG_DRIVER_EXCESS_BREAKDOWN,
  YOUNG_DRIVER_INSURANCE_TIPS,
  EV_CHARGING_TIERS,
  CAR_MAINTENANCE_BENCHMARKS,
  FIRST_CAR_BUYER_CHECKLIST,
  QLD_REGO_CYLINDER_TIERS,
  QLD_VEHICLE_DUTY_RATES,
  ROADSIDE_ASSISTANCE_BENCHMARKS,
} from '@/data/car-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { SmartImage } from '@/components/ui/SmartImage';
import { ModulePrevNext } from '@/components/shared/ModulePrevNext';
import { usePageTitle } from '@/hooks/usePageTitle';

const CAR_TABS = ['licence', 'buying', 'fuel', 'parking'] as const;
type CarTab = (typeof CAR_TABS)[number];

function readCarTab(searchParams: URLSearchParams): CarTab {
  const raw = searchParams.get('tab');
  if (raw === 'car-costs') return 'buying';
  return CAR_TABS.includes(raw as CarTab) ? (raw as CarTab) : 'licence';
}

const CAR_WEB_SOURCES = [
  OFFICIAL_WEB_LINKS.qld_licence_fees,
  OFFICIAL_WEB_LINKS.qld_getting_licence,
  OFFICIAL_WEB_LINKS.qld_hpt,
  OFFICIAL_WEB_LINKS.qld_practical_test,
  OFFICIAL_WEB_LINKS.qld_licence_steps,
  OFFICIAL_WEB_LINKS.bcc_parking,
  OFFICIAL_WEB_LINKS.bcc_council_carparks,
  OFFICIAL_WEB_LINKS.green_vehicle_guide,
  OFFICIAL_WEB_LINKS.racq_fuel,
  OFFICIAL_WEB_LINKS.aip_fuel_prices,
  OFFICIAL_WEB_LINKS.moneysmart_car,
  OFFICIAL_WEB_LINKS.ppsr_check,
];

export function CarDriving() {
  usePageTitle('Cars & Driving · QLD Licence');
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readCarTab(searchParams);

  const setTab = (id: string) => {
    if (!CAR_TABS.includes(id as CarTab)) return;
    setSearchParams(
      prev => {
        const cp = new URLSearchParams(prev);
        if (id === 'licence') cp.delete('tab');
        else cp.set('tab', id);
        return cp;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-primary/20 p-6 sm:p-10 border border-sky-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl" aria-hidden="true">{moduleData.emoji}</span>
              <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
                Module 10 • Cars & Driving
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {moduleData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {moduleData.description}
            </p>
          </div>
          <div className="md:col-span-4 hidden md:flex justify-center">
            <SmartImage
              src="/assets/graphics/popmart_car.jpg"
              alt="Futuristic Electric Car 3D Popmart Toy"
              className="w-36 h-36 rounded-2xl object-cover border-2 border-sky-500/30 shadow-xl hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={144}
              height={144}
            />
          </div>
        </div>
      </div>

      {/* Interactive Tools */}
      <FirstCarCostCalculator />
      <EvVsPetrolCalculator />

      {/* Tabs: Licence / Fuel / Parking */}
      <div className="space-y-5">
        <Tabs
          tabs={[
            { id: 'licence', label: '🪪 QLD Licence Path' },
            { id: 'buying', label: '🛡️ PPSR, CTP & Buying' },
            { id: 'fuel', label: '⛽ Fuel & EVs' },
            { id: 'parking', label: '🅿️ Brisbane Parking' },
          ]}
          activeTab={tab}
          onChange={setTab}
          sticky={true}
        />

        {tab === 'licence' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-foreground">QLD Graduated Licensing Path (Under 25)</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Licence steps timeline */}
            <div className="space-y-0">
              {QLD_LICENCE_PATH.map((step, i) => (
                <div key={step.stage} className="relative pl-6 pb-5 last:pb-0">
                  {i < QLD_LICENCE_PATH.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
                  )}
                  <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-emerald-500/20 border-2 border-emerald-500" />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-foreground text-sm">
                        {step.stage} <span className="text-muted-foreground font-semibold text-xs">({step.plates})</span>
                      </h3>
                      <Badge variant="default" className="text-[10px]">
                        Age {step.minAge}+ • {step.holdTime}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                      <span className="font-semibold text-foreground">Fees:</span> {step.fees}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-1.5">
                      <span className="font-semibold text-foreground">Requirements:</span> {step.requirements}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Restrictions:</span> {step.restrictions}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fees table */}
            <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">QLD Licence Fees (2026-2027 Schedule)</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    Standard Pathway (PrepL → Open 1-yr) = ${QLD_STANDARD_PATHWAY_GOV_COST.toFixed(2)}
                  </Badge>
                  <Badge variant="default" className="text-[10px]">
                    Pathway (with Open 5-yr) = ${QLD_STANDARD_PATHWAY_5YR_COST.toFixed(2)}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Item</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Cost</th>
                      <th className="py-2 font-bold text-foreground">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QLD_LICENCE_FEES.map(f => (
                      <tr key={f.item} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{f.item}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${f.cost.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-muted-foreground">{f.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Add driving lessons at ${QLD_DRIVING_LESSON_RANGE.min}–${QLD_DRIVING_LESSON_RANGE.max}/hr in
                South East Queensland — most learners book around 10 lessons before their practical test. 💡 Pro-tip: In QLD, 1 hour with a qualified driving instructor counts as 3 logbook hours (up to 10 instructor hours = 30 logbook hours!).
              </p>
            </div>

            {/* Road Rules, Camera Fines & Demerits Table */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-bold text-foreground">
                    QLD Road Rules, Camera Fines & Demerit Points (2026-2027 Schedule)
                  </h3>
                </div>
                <Badge variant="danger" className="text-[10px] w-fit">
                  P-Plater Cap: 4 Points / Year
                </Badge>
              </div>

              {/* The 4 Demerit Point Cliff Warning */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️ The 4-Demerit Point Cliff for Young Drivers:</span>
                </div>
                <p className="leading-relaxed">
                  Queensland Learner and Provisional (P1 & P2) drivers have a strict threshold of <strong>4 demerit points in a 1-year period</strong>.
                  A single mobile phone camera fine (<strong>$1,295 + 4 demerit points</strong>), seatbelt camera offence (<strong>$1,295 + 4 points</strong>),
                  or moderate speeding offence (21–30 km/h over: <strong>$777 + 4 points</strong>) instantly triggers an immediate 3-month licence suspension
                  or a 1-year good driving behaviour bond!
                </p>
                <p className="leading-relaxed font-semibold text-rose-600 dark:text-rose-400">
                  ⚡ Year-Round Double Demerits: Queensland applies double demerit points all year round for repeat offences committed within 12 months (e.g. 2nd mobile phone fine = 8 demerit points + $1,295).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Offence</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Fine</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Demerits</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Applies To</th>
                      <th className="py-2 font-bold text-foreground">Note / Rule Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QLD_ROAD_RULES_FINES.map(rf => (
                      <tr key={rf.offence} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{rf.offence}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          ${rf.fine.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-foreground whitespace-nowrap">
                          {rf.demeritPoints > 0 ? `${rf.demeritPoints} ${rf.demeritPoints === 1 ? 'pt' : 'pts'}` : 'Court Disqual.'}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{rf.appliesTo}</td>
                        <td className="py-2.5 text-muted-foreground">{rf.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border text-[11px] text-muted-foreground space-y-1">
                <p>
                  <strong>Zero Alcohol Limit (0.00% BAC):</strong> Learner, P1, and P2 provisional drivers must strictly maintain <strong>0.00% BAC</strong> (supervisors must remain under 0.05% BAC). Any detectable alcohol triggers an immediate 24-hour police suspension, mandatory Magistrates Court appearance, minimum <strong>3 to 9 months licence disqualification</strong>, and up to 14 penalty units ($2,417) in court fines.
                </p>
                <p>
                  <strong>Peer Passenger Restriction (P1 under 25):</strong> Between 11:00 PM and 5:00 AM, you are restricted to a maximum of <strong>1 peer passenger under 21</strong> who is not an immediate family member. Penalty: <strong>$518 fine (3 penalty units @ $172.70) + 3 demerit points</strong>, leaving only a 1-point margin before licence suspension.
                </p>
                <p>
                  <strong>Plate Display Rules:</strong> L and P plates must be clean, undamaged, and visible from 20 metres front and rear. Failing to display plates (or displaying plates when an open licence holder is driving) carries a <strong>$276 fine + 2 demerit points</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_prepl} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.nsw_dkt_practice} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.vic_learner_practice} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_licence_steps} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_licence_fees} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_hpt} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_practical_test} />
            </div>
          </Card>
        )}

        {tab === 'buying' && (
          <div className="space-y-6">
            {/* PPSR Section */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-foreground">Official PPSR Vehicle Check (ppsr.gov.au)</h2>
                </div>
                <Badge variant="success" className="w-fit">
                  Official Gov Fee: $2.00 (GST-Free)
                </Badge>
              </div>

              {/* Scam Warning Alert */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">⚠️ Scam Alert: Beware $25–$35+ Third-Party Markups!</span>
                  <p className="leading-relaxed">
                    {OFFICIAL_PPSR_DATA.thirdPartyWarning} Always check the URL in your browser bar says{' '}
                    <strong className="underline">ppsr.gov.au</strong> before entering your credit card details.
                  </p>
                </div>
              </div>

              {/* What PPSR Checks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {OFFICIAL_PPSR_DATA.whatItChecks.map(check => (
                  <div key={check.factor} className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-foreground">{check.factor}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{check.description}</p>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg">
                      <strong>Risk if skipped:</strong> {check.riskIfNotChecked}
                    </div>
                  </div>
                ))}
              </div>

              {/* Buyer Checklist */}
              <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  🛡️ PPSR First-Car Golden Rules
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {OFFICIAL_PPSR_DATA.buyerChecklist.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ppsr_check} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_car} />
              </div>
            </Card>

            {/* QLD CTP Insurance Section */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-500" />
                  <h2 className="text-lg font-bold text-foreground">QLD Class 1 CTP Insurance (2026-2027)</h2>
                </div>
                <Badge variant="default" className="w-fit">
                  Scheme Band: ${QLD_CTP_CLASS1_BREAKDOWN.class1MinAnnual.toFixed(2)} – ${QLD_CTP_CLASS1_BREAKDOWN.class1MaxAnnual.toFixed(2)}/yr
                </Badge>
              </div>

              {/* Critical Notice */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-3 text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">CTP Covers $0 In Property Damage!</span>
                  <p className="leading-relaxed">{QLD_CTP_CLASS1_BREAKDOWN.criticalCoverageNotice}</p>
                </div>
              </div>

              {/* Providers Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Licensed QLD CTP Underwriters (Class 1 Private)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 pr-3 font-bold text-foreground">Insurer</th>
                        <th className="py-2 pr-3 font-bold text-foreground">Total Annual</th>
                        <th className="py-2 pr-3 font-bold text-foreground">Insurer Base</th>
                        <th className="py-2 pr-3 font-bold text-foreground">Statutory Levies</th>
                        <th className="py-2 font-bold text-foreground">Scheme Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {QLD_CTP_PROVIDERS.map(p => (
                        <tr key={p.name} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{p.name}</td>
                          <td className="py-2.5 pr-3 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                            ${p.annualTotalEstimate.toFixed(2)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                            ${p.insurerBasePortion.toFixed(2)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                            ${p.statutoryLeviesPortion.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-muted-foreground">{p.marketShareNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  {QLD_CTP_CLASS1_BREAKDOWN.racqMarketExitNote}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_rego} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_car} />
              </div>
            </Card>

            {/* QLD Registration & Vehicle Transfer Duty Section */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-bold text-foreground">QLD Registration by Engine Cylinders & Transfer Duty (2026-2027)</h2>
                </div>
                <Badge variant="default" className="w-fit">
                  TMR & QRO Statutory Rates
                </Badge>
              </div>

              {/* Economic Cylinder Warning */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-start gap-3 text-indigo-950 dark:text-indigo-200">
                <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">⚠️ The Cylinder Count Trap: Falcons & Commodores Cost Hundreds More!</span>
                  <p className="leading-relaxed">
                    Queensland calculates annual light vehicle registration based strictly on <strong>cylinder count</strong>, NOT vehicle weight. A 6-cylinder car costs <strong>+$217/year more</strong> in rego than a 4-cylinder hatchback, while a V8 costs <strong>+$453/year more</strong> ($2,265 extra over 5 years!). Furthermore, QLD vehicle registration duty (stamp duty) climbs from 3.0% on 4-cylinders to 3.5% on 6-cylinders and 4.0% on 8-cylinders (hybrids and EVs enjoy a discounted 2.0% rate).
                  </p>
                </div>
              </div>

              {/* Cylinders Rego & Duty Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Engine Cylinders</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Base Rego</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Traffic Fee</th>
                      <th className="py-2 pr-3 font-bold text-foreground">CTP Est.</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Total / yr</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Transfer Duty</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Duty on $5k</th>
                      <th className="py-2 font-bold text-foreground">Duty on $10k</th>
                      <th className="py-2 font-bold text-foreground">Typical Models & Warning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QLD_REGO_CYLINDER_TIERS.map(tier => (
                      <tr key={tier.category} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">
                          <div>{tier.category}</div>
                          <span className="text-[10px] text-muted-foreground font-normal">{tier.cylinders}</span>
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ${tier.registrationFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ${tier.trafficImprovementFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ${tier.ctpClass1Estimate.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          ${tier.totalAnnualRego.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {tier.transferDutyRatePct.toFixed(1)}% (${tier.dutyPer100}/$100)
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ${tier.transferDutyOn5k}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ${tier.transferDutyOn10k}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-[11px] leading-relaxed">
                          <div><span className="font-semibold text-foreground">{tier.examples}</span></div>
                          <div className="text-[10px] text-muted-foreground">{tier.economicWarning}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Transfer Duty Rules Callout */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  📋 QLD Vehicle Transfer Requirements (14-Day Statutory Deadline)
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>
                      <strong>TMR Vehicle Transfer Fee:</strong> A mandatory flat title transfer fee of <strong>${QLD_VEHICLE_DUTY_RATES.transferFee.toFixed(2)}</strong> applies to all private vehicle ownership transfers in addition to stamp duty.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>
                      <strong>14-Day Lodgement Window:</strong> The buyer is legally required to lodge the vehicle transfer application (Form F3520 or online via myaccount.qld.gov.au) within <strong>{QLD_VEHICLE_DUTY_RATES.lodgementDeadlineDays} calendar days</strong> of sale.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>
                      <strong>Dutiable Value:</strong> Transfer duty is calculated on the higher of the actual purchase price or fair market value. Under-declaring purchase price on the transfer paperwork is an offence investigated by the Queensland Revenue Office (QRO).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>
                      <strong>Day-One Outlay Reality:</strong> When buying a $5,000 4-cylinder car, you must budget <strong>$5,185.65 upfront</strong>: $5,000 (car) + $2.00 (PPSR) + $33.65 (TMR transfer) + $150.00 (3% transfer duty), plus immediate insurance cover!
                    </span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Young Driver Insurance (16-20yo) Section */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CarFront className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-bold text-foreground">Young Driver Insurance Quotes (16–20yo QLD)</h2>
                </div>
                <Badge variant="warning" className="w-fit">
                  Provisional Age Inexperience Loading
                </Badge>
              </div>

              {/* Profiles Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Driver Age</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Licence Stage</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Comprehensive / yr</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Third-Party Property / yr</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Typical Excess</th>
                      <th className="py-2 font-bold text-foreground">Risk Guidance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {YOUNG_DRIVER_INSURANCE_PROFILES.map(prof => (
                      <tr key={prof.ageGroup} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{prof.ageGroup}</td>
                        <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{prof.licenceStage}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                          ${prof.comprehensiveRange.min.toLocaleString()} – ${prof.comprehensiveRange.max.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${prof.thirdPartyPropertyRange.min} – ${prof.thirdPartyPropertyRange.max}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ~${prof.typicalTotalExcess.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-muted-foreground">{prof.riskNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stacked Excess Breakdown Card */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  💥 Young Driver Stacked Claim Excess Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-background/80 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Standard Excess</div>
                    <div className="text-base font-bold font-mono text-foreground">${YOUNG_DRIVER_EXCESS_BREAKDOWN.standardExcess}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Under 21 Age Excess</div>
                    <div className="text-base font-bold font-mono text-foreground">+${YOUNG_DRIVER_EXCESS_BREAKDOWN.ageExcessUnder21}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Inexperienced Driver</div>
                    <div className="text-base font-bold font-mono text-foreground">+${YOUNG_DRIVER_EXCESS_BREAKDOWN.inexperiencedDriverExcess}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <div className="text-[10px] text-rose-700 dark:text-rose-300 uppercase font-bold">Total At-Fault Excess</div>
                    <div className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400">
                      ${YOUNG_DRIVER_EXCESS_BREAKDOWN.totalAtFaultExcessEstimate}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  If an 18-year-old P1 driver has an at-fault crash, all three excesses stack together! Make sure you maintain an emergency fund to cover this out-of-pocket amount.
                </p>
              </div>

              {/* Insurance Tips */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  💡 Tips to Cut Insurance Premiums Without Breaking Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {YOUNG_DRIVER_INSURANCE_TIPS.map((tip, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                      <div className="font-bold text-xs text-foreground">{tip.tip}</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed">{tip.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Maintenance Benchmarks: Used Hatchback vs EV */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground">Maintenance Benchmarks: Popular Hatchbacks vs EV</h2>
                </div>
                <Badge variant="default" className="w-fit">
                  Australian Real-World Workshop Rates
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Model & Type</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Service Interval</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Annual Service</th>
                      <th className="py-2 pr-3 font-bold text-foreground">5-Yr Total</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Brakes & Tyres</th>
                      <th className="py-2 font-bold text-foreground">First-Car Insights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAR_MAINTENANCE_BENCHMARKS.map(car => (
                      <tr key={car.model} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">
                          <div>{car.model}</div>
                          <span className="text-[10px] text-muted-foreground font-normal">({car.category})</span>
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{car.serviceInterval}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${car.annualServiceCost.min} – ${car.annualServiceCost.max}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          ~${car.fiveYearMaintenanceTotal.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground text-[11px]">
                          <div><strong>Brakes:</strong> {car.brakesLifespanKm}</div>
                          <div><strong>Tyres:</strong> {car.tyresLifespanKm}</div>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-[11px] leading-relaxed">
                          {car.firstCarBuyerTips}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Roadside Assistance Breakdown */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Roadside Assistance Cover: RACQ & NRMA Benchmarks (~$109–$139/yr)
                  </h3>
                  <Badge variant="success" className="text-[10px] w-fit">
                    Essential Teen Safety Net
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A private commercial tow truck callout across South East Queensland or NSW costs <strong>$200 to $350+</strong>. For just ~$2.10/week ($109/yr), an RACQ Everyday roadside membership provides 24/7 unlimited breakdown attendance, battery jumpstarts, emergency fuel, lockout rescue, and free towing.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {ROADSIDE_ASSISTANCE_BENCHMARKS.map(item => (
                    <div key={`${item.provider}-${item.planName}`} className="rounded-xl border border-border bg-background/60 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{item.provider} — {item.planName}</span>
                        <Badge variant="default" className="text-[10px] font-mono">
                          ${item.annualFee}/yr
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <div><strong>Free Towing:</strong> up to {item.towingDistanceKm} km</div>
                        <div><strong>Attendance:</strong> {item.calloutsPerYear}</div>
                        <div className="text-[10px] pt-1 text-muted-foreground leading-tight">{item.keyFeatures}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* First-Car Buyer 5-Step Checklist */}
            <Card variant="glass" className="p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-foreground">First-Car Buyer Checklist & Inspection Red Flags</h2>
              </div>

              <div className="space-y-4">
                {FIRST_CAR_BUYER_CHECKLIST.map(step => (
                  <div key={step.stepNumber} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        {step.title}
                      </h3>
                      <Badge variant="default" className="text-[10px]">
                        Cost: {step.cost}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 space-y-1">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
                        🚩 Walk-Away Red Flags:
                      </span>
                      <ul className="text-[11px] text-rose-600 dark:text-rose-400 space-y-0.5">
                        {step.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="shrink-0">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'fuel' && (
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Fuel className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Brisbane Fuel Prices & EV Charging Benchmarks</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Retail Petrol Cycle Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">E10 (cheapest petrol)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$2.34/L</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Unleaded 91</div>
                <div className="text-2xl font-bold font-mono text-foreground">$2.38/L</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Premium 98</div>
                <div className="text-2xl font-bold font-mono text-foreground">$2.63/L</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                ⛽ Brisbane Retail Fuel Prices (2026-2027 Cycle Highs & Lows)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Fuel</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Avg $/L</th>
                      <th className="py-2 font-bold text-foreground">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BRISBANE_FUEL_PRICES.map(f => (
                      <tr key={f.fuel} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{f.fuel}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-foreground whitespace-nowrap">${f.pricePerLitre.toFixed(2)}</td>
                        <td className="py-2.5 text-muted-foreground">{f.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5 text-sm text-foreground">
                  ⏱️ Brisbane Fuel Price Cycle Dynamics ({BRISBANE_PRICE_CYCLE.durationRange})
                </span>
                <Badge variant="warning">Annual Commuter Savings: {BRISBANE_PRICE_CYCLE.annualCommuterSavings}</Badge>
              </div>
              <p className="leading-relaxed">{BRISBANE_PRICE_CYCLE.note}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center font-mono">
                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <div className="text-[10px] text-muted-foreground font-sans">Cycle Bottom (Trough)</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{BRISBANE_PRICE_CYCLE.troughRange}</div>
                  <div className="text-[9px] text-muted-foreground font-sans mt-0.5">{BRISBANE_FUEL_CYCLE_METRICS.discountingPhaseDurationWeeks}</div>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <div className="text-[10px] text-muted-foreground font-sans">Price Spike (Peak)</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{BRISBANE_PRICE_CYCLE.peakRange}</div>
                  <div className="text-[9px] text-muted-foreground font-sans mt-0.5">{BRISBANE_FUEL_CYCLE_METRICS.hikePhaseDurationHours}</div>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <div className="text-[10px] text-muted-foreground font-sans">Saving / 50L Tank</div>
                  <div className="text-sm font-bold text-foreground font-mono">${BRISBANE_FUEL_CYCLE_METRICS.savingsPer50LTank.toFixed(2)}</div>
                  <div className="text-[9px] text-muted-foreground font-sans mt-0.5">~50¢/L price spread</div>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <div className="text-[10px] text-muted-foreground font-sans">QLD Price Reporting</div>
                  <div className="text-sm font-bold text-sky-600 dark:text-sky-400">Within {QLD_FUEL_REPORTING_SCHEME.reportingWindowMinutes} mins</div>
                  <div className="text-[9px] text-muted-foreground font-sans mt-0.5">Mandatory real-time law</div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground bg-background/50 p-2.5 rounded-xl border border-border/60">
                <strong>💡 RACQ Fair Fuel Indicator:</strong> {QLD_FUEL_REPORTING_SCHEME.fairFuelIndicatorNotes}
              </div>
            </div>

            {/* EV Charging Tiers Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  ⚡ South East QLD EV Charging Tariffs (Energex Network 2026-2027)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-3 font-bold text-foreground">Charging Tier</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Cost / kWh</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Typical Rate Range</th>
                      <th className="py-2 pr-3 font-bold text-foreground">Provider / Tariff</th>
                      <th className="py-2 font-bold text-foreground">Real-World Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EV_CHARGING_TIERS.map(tier => (
                      <tr key={tier.tier} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{tier.tier}</td>
                        <td className="py-2.5 pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${tier.pricePerKwh.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-muted-foreground whitespace-nowrap">
                          {tier.typicalRateRange}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{tier.sourceOrProvider}</td>
                        <td className="py-2.5 text-muted-foreground">{tier.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold block mb-0.5">💰 Cost Per 100km Comparison:</span>
              Petrol Hatch (7.5L/100km @ $2.38/L): <strong>$17.85/100km</strong>. EV Home Off-Peak (15kWh/100km @ $0.20/kWh): <strong>$3.00/100km</strong> (83% cheaper!). EV Public DC Fast (15kWh/100km @ $0.65/kWh): <strong>$9.75/100km</strong>.
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.racq_fuel} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.aip_fuel_prices} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.green_vehicle_guide} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.ev_council} />
            </div>
          </Card>
        )}

        {tab === 'parking' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ParkingCircle className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-bold text-foreground">Brisbane On-Street Parking Zones</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-bold text-foreground">Zone</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Area</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Weekday $/hr</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Weekend Rates</th>
                    <th className="py-2 pr-3 font-bold text-foreground">Free After 7pm?</th>
                    <th className="py-2 font-bold text-foreground">Zone Details & Limits</th>
                  </tr>
                </thead>
                <tbody>
                  {BRISBANE_PARKING_ZONES.map(z => (
                    <tr key={z.zone} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{z.zone}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{z.area}</td>
                      <td className="py-2.5 pr-3 font-mono font-bold text-foreground whitespace-nowrap">~${z.weekdayHourly.toFixed(2)}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{z.weekendHourly}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{z.freeAfter7pm}</td>
                      <td className="py-2.5 text-muted-foreground">{z.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-border bg-emerald-500/10 p-4 space-y-2">
              <h3 className="text-sm font-bold text-foreground">🎁 Free Parking Golden Rules</h3>
              {BRISBANE_FREE_PARKING_TIPS.map((tip, i) => (
                <p key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Off-street daily max (CBD)</div>
                <div className="text-2xl font-bold font-mono text-foreground">{BRISBANE_OFFSTREET_PARKING.dailyMax}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">{BRISBANE_OFFSTREET_PARKING.note}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Council car parks</div>
                <div className="text-lg font-bold text-foreground leading-tight">King George Sq • Wickham Tce</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">{BRISBANE_OFFSTREET_PARKING.councilCarParks}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.bcc_parking} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.bcc_council_carparks} />
            </div>
          </Card>
        )}
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
            <CarFront className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">P's By 17, Full Licence By 20</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Start Ls at 16, knock out 100 logbook hours, pass HPT + practical, then P1 → P2 → Open. Total gov fees ≈ $543.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Car className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Cash Cars Beat Dealer Loans</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A $4,500 cash car avoids 3 years of 12.5% dealer interest and forced full insurance. Always do a $2 PPSR check first.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2 hover:border-primary/40 hover:shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <PiggyBank className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">EV Only Saves If You Charge At Home</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Home off-peak EV charging is ~2.5× cheaper than petrol; public fast chargers cost about the same as petrol.
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Cars & Driving?" />
      </div>

      {/* Continue the money journey */}
      <ModulePrevNext currentId="car-driving" />

      {/* Web Sources */}
      <div className="calculator-section">
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ExternalLink className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-foreground">Official QLD & Car Sources</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated government and research resources for QLD licensing, car costs, fuel and Brisbane parking.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {CAR_WEB_SOURCES.map((link, i) => (
              <WebReferenceLink key={i} link={link} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Based on 2026 data. For education only — not financial advice. Verify licence fees, test requirements, fuel
            prices and parking rates against official QLD Government and Brisbane City Council sources.
          </p>
        </Card>
      </div>

      <PrintShareFAB />
    </div>
  );
}

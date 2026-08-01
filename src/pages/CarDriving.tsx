import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { FirstCarCostCalculator } from '@/calculators/teen-car/FirstCarCostCalculator';
import { EvVsPetrolCalculator } from '@/calculators/teen-car/EvVsPetrolCalculator';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
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
} from 'lucide-react';
import { useState } from 'react';
import {
  QLD_LICENCE_PATH,
  QLD_LICENCE_FEES,
  QLD_DRIVING_LESSON_RANGE,
  BRISBANE_FUEL_PRICES,
  BRISBANE_PRICE_CYCLE,
  BRISBANE_PARKING_ZONES,
  BRISBANE_FREE_PARKING_TIPS,
  BRISBANE_OFFSTREET_PARKING,
} from '@/data/car-data';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';

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

function sumLicenceFees() {
  return QLD_LICENCE_FEES.reduce((s, f) => s + f.cost, 0);
}

export function CarDriving() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'car-driving')!;
  const [tab, setTab] = useState('licence');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-primary/20 p-6 sm:p-10 border border-sky-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
            Module 10 • Cars & Driving
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          {moduleData.description}
        </p>
      </div>

      {/* Interactive Tools */}
      <FirstCarCostCalculator />
      <EvVsPetrolCalculator />

      {/* Tabs: Licence / Fuel / Parking */}
      <div className="space-y-5">
        <Tabs
          tabs={[
            { id: 'licence', label: '🪪 QLD Licence Path' },
            { id: 'fuel', label: '⛽ Fuel & EVs' },
            { id: 'parking', label: '🅿️ Brisbane Parking' },
          ]}
          activeTab={tab}
          onChange={setTab}
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">QLD Licence Fees (1 July 2026)</h3>
                <Badge variant="warning" className="text-[10px]">
                  Total gov fees ≈ ${sumLicenceFees().toFixed(2)}
                </Badge>
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
                South East Queensland — most learners book around 10 lessons before their practical test. Fees are as
                published by the QLD Government as at 1 July 2026.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_licence_steps} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_licence_fees} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_hpt} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_practical_test} />
            </div>
          </Card>
        )}

        {tab === 'fuel' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Fuel className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Brisbane Fuel Prices & The Price Cycle</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">E10 (cheapest petrol)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$1.94/L</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Unleaded 91</div>
                <div className="text-2xl font-bold font-mono text-foreground">$1.96/L</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Premium 98</div>
                <div className="text-2xl font-bold font-mono text-foreground">$2.21/L</div>
              </div>
            </div>

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

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-0.5">⏱️ The ~{BRISBANE_PRICE_CYCLE.days}-day price cycle:</span>
              {BRISBANE_PRICE_CYCLE.note} Buying just after the peak drops can save ~10–15¢/litre.
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Late July 2026 Brisbane averages from FuelPrice Australia & RACQ. Prices swing on the price cycle, so
              always compare the cheapest stations in your area before filling up. Electric car running costs are
              compared in the EV vs Petrol calculator above.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.racq_fuel} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.aip_fuel_prices} />
              <WebReferenceLink link={OFFICIAL_WEB_LINKS.green_vehicle_guide} />
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
                    <th className="py-2 pr-3 font-bold text-foreground">Free after 7pm?</th>
                    <th className="py-2 font-bold text-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {BRISBANE_PARKING_ZONES.map(z => (
                    <tr key={z.zone} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-bold text-foreground whitespace-nowrap">{z.zone}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{z.area}</td>
                      <td className="py-2.5 pr-3 font-mono font-bold text-foreground whitespace-nowrap">~${z.weekdayHourly.toFixed(2)}</td>
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
        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
            <CarFront className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">P's By 17, Full Licence By 20</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Start Ls at 16, knock out 100 logbook hours, pass HPT + practical, then P1 → P2 → Open. Total gov fees ≈ $543.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Car className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Cash Cars Beat Dealer Loans</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A $4,500 cash car avoids 3 years of 12.5% dealer interest and forced full insurance. Always do a $2 PPSR check first.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
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
      <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Cars & Driving?" />

      {/* Web Sources */}
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
  );
}

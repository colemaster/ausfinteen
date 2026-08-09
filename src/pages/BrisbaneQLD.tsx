import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { BrisbaneBudgetCalculator } from '@/calculators/teen-brisbane/BrisbaneBudgetCalculator';
import { BrisbaneUniExplorer } from '@/calculators/teen-brisbane/BrisbaneUniExplorer';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { MapPin, Home, Landmark, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import {
  HECS_BANDS_2026,
  BRISBANE_SUBURBS,
  QLD_FIRST_HOME_HELP,
  QLD_TEEN_RULES,
} from '@/data/brisbane-data';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { SmartImage } from '@/components/ui/SmartImage';

const BRISBANE_WEB_SOURCES = [
  OFFICIAL_WEB_LINKS.qld_rta,
  OFFICIAL_WEB_LINKS.qld_fhog,
  OFFICIAL_WEB_LINKS.qld_boost_to_buy,
  OFFICIAL_WEB_LINKS.translink_gocard,
  OFFICIAL_WEB_LINKS.qld_rego,
  OFFICIAL_WEB_LINKS.uq_study,
  OFFICIAL_WEB_LINKS.qut_study,
  OFFICIAL_WEB_LINKS.griffith_study,
  OFFICIAL_WEB_LINKS.qtac,
  OFFICIAL_WEB_LINKS.tafe_qld,
];

export function BrisbaneQLD() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'brisbane-qld')!;
  const { profile, updateProfile } = useTeenProfile();
  const [tab, setTab] = useState('unis');

  const isBrisbane = profile.location === 'Brisbane, QLD';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-primary/20 p-6 sm:p-10 border border-sky-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-4xl">{moduleData.emoji}</span>
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
            { id: 'realestate', label: '🏠 Real Estate & Renting' },
            { id: 'help', label: '💰 First-Home Help' },
          ]}
          activeTab={tab}
          onChange={setTab}
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
                  the HELP repayment threshold (~$60k+ in 2026). Apply via QTAC in Queensland.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.uq_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qut_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.griffith_study} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.qtac} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.tafe_qld} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'realestate' && (
          <Card variant="glass" className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Home className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-bold text-foreground">Brisbane Rent, Sharehouses & Suburbs</h2>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Median House Rent</div>
                <div className="text-2xl font-bold font-mono text-foreground">$650/wk</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Median Unit Rent</div>
                <div className="text-2xl font-bold font-mono text-foreground">$570/wk</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Shared Room (5km CBD)</div>
                <div className="text-2xl font-bold font-mono text-foreground">$286/wk</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-bold text-foreground">Suburb</th>
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
              Figures are 2026 medians from CoreLogic, SQM Research and the Student Accommodation Council. Bond is
              capped at 4 weeks rent and must be lodged with the Residential Tenancies Authority (RTA) within 10 days.
              Always check real-time listings before applying.
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
                  <span className="text-xl">{rule.emoji}</span>
                  <h3 className="font-bold text-foreground text-sm">{rule.title}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{rule.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_rego} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.translink_gocard} />
          </div>
        </Card>
      </div>

      {/* Accordion Topics */}
      <div className="calculator-section">
        <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Brisbane, QLD?" />
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
            Based on 2026 data. For education only — not financial advice. Verify rates and rules against official QLD
            Government and university sources.
          </p>
        </Card>
      </div>
    </div>
  );
}

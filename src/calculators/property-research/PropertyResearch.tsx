import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { scaleIn } from '@/lib/animations';
import { CRITERIA, LAYERS, type Layer } from './criteria';
import { calculateScore, getRecommendationColor, getRecommendationBg, type WeightConfig } from './scoring';
import { suburbYieldSummary } from './suburb-metrics';
import { SliderControl } from '../../components/ui/SliderControl';
import { NumberInput } from '../../components/ui/NumberInput';
import { Disclaimer } from '../../components/shared/Disclaimer';
import { Assumptions } from '../../components/shared/Assumptions';
import { AboutCalc } from '../../components/shared/AboutCalc';

const DATA_SOURCES = [
  { label: 'Domain',                  url: 'domain.com.au' },
  { label: 'REA / realestate.com.au', url: 'realestate.com.au' },
  { label: 'SQM Research',            url: 'sqmresearch.com.au' },
  { label: 'CoreLogic',               url: 'corelogic.com.au' },
  { label: 'VicPlan (VIC)',           url: 'planning.vic.gov.au' },
  { label: 'NSW Planning Portal',     url: 'planningportal.nsw.gov.au' },
  { label: 'MySchool',                url: 'myschool.edu.au' },
  { label: 'Microburbs',              url: 'microburbs.com.au' },
  { label: 'ABS Census',              url: 'abs.gov.au/census' },
];

const ASSUMPTIONS = [
  'Dealbreakers (flood zone, bushfire zone) auto-result in Avoid regardless of score.',
  'Scored criteria: 0 = very poor, 3 = average, 5 = excellent.',
  'Maximum scored points: 120 (Suburb 40 + Intra-Suburb 30 + Property 50).',
  'Thresholds: Strong Buy >100, Buy 80-100, Hold 60-80, Caution 40-60, Avoid <40.',
  'Not a substitute for building/pest inspection, strata report, or solicitor review.',
  'Verify all data with current council and state government records.',
];

const SCORE_GUIDE: [string, string, string][] = [
  ['Strong Buy', '>100 pts',            'text-[var(--success)] '],
  ['Buy',        '80\u2013100',         'text-[var(--success)]'],
  ['Hold',       '60\u201380',          'text-amber-600 '],
  ['Caution',    '40\u201360',          'text-orange-600 '],
  ['Avoid',      '<40 or dealbreaker',  'text-[var(--danger)] '],
];

function ScoreButtons({ id, value, onChange }: { id: string; value: number; onChange: (id: string, v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="flex gap-1">
        {[0,1,2,3,4,5].map(v => (
          <button key={v} onClick={() => onChange(id, v)}
            className={`w-8 h-8 text-xs font-bold rounded-md border transition-all ${ value === v ? 'bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-blue-400' }`}>
            {v}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-[var(--muted-foreground)]">{value} / 5</div>
    </div>
  );
}

function DealBreakerButtons({ id, value, onChange }: {
  id: string; value: boolean; onChange: (id: string, v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={() => onChange(id, true)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${ value ? 'bg-green-100 text-green-700 border-green-300 ' : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] ' }`}>Pass</button>
      <button onClick={() => onChange(id, false)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${ !value ? 'bg-red-100 text-[var(--danger)] border-red-300 ' : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] ' }`}>Fail</button>
    </div>
  );
}

function LayerAccordion({ layer, openLayers, onToggle, scores, dealbreakers, onScoreChange, onDealBreakerChange }: {
  layer: typeof LAYERS[0];
  openLayers: Set<Layer>;
  onToggle: (l: Layer) => void;
  scores: Record<string, number>;
  dealbreakers: Record<string, boolean>;
  onScoreChange: (id: string, v: number) => void;
  onDealBreakerChange: (id: string, v: boolean) => void;
}) {
  const criteria = CRITERIA.filter(c => c.layer === layer.id);
  const isOpen = openLayers.has(layer.id);
  const currentScore = criteria.filter(c => c.type === 'score').reduce((s, c) => s + (scores[c.id] ?? 0), 0);
  const hasDealbreaker = criteria.some(c => c.type === 'dealbreaker' && dealbreakers[c.id] === false);

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button onClick={() => onToggle(layer.id)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[var(--background)] hover:bg-[var(--background)] transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--foreground)]">{layer.label}</span>
          {hasDealbreaker && (
            <span className="text-xs font-bold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-0.5 rounded-full border border-red-200">
              DEAL BREAKER
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-bold text-[var(--primary)]">{currentScore} / {layer.maxScore}</span>
          <span className="text-[var(--muted-foreground)] text-sm">{isOpen ? '\u25b2' : '\u25bc'}</span>
        </div>
      </button>
      {isOpen && (
        <div className="divide-y divide-slate-100 dark:divide-[var(--border)]">
          {criteria.map(c => (
            <div key={c.id} className="px-5 py-4 bg-[var(--background)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground)] mb-0.5">
                    {c.label}
                    {c.type === 'dealbreaker' && (
                      <span className="ml-2 text-xs text-[var(--danger)] font-semibold">DEAL BREAKER</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{c.description}</div>
                  {c.dataSource && (
                    <div className="text-xs text-[var(--primary)] mt-0.5">Source: {c.dataSource}</div>
                  )}
                </div>
                {c.type === 'dealbreaker'
                  ? <DealBreakerButtons id={c.id} value={dealbreakers[c.id] ?? true} onChange={onDealBreakerChange} />
                  : <ScoreButtons id={c.id} value={scores[c.id] ?? 0} onChange={onScoreChange} />
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyResearch() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [dealbreakers, setDealbreakers] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CRITERIA.filter(c => c.type === 'dealbreaker').map(c => [c.id, true]))
  );
  const [openLayers, setOpenLayers] = useState<Set<Layer>>(new Set<Layer>(['suburb']));
  const [address, setAddress] = useState('');
  const [weights, setWeights] = useState<WeightConfig>({ suburb: 1, intrasuburb: 1, property: 1 });
  const [yieldInputs, setYieldInputs] = useState({ medianPrice: 650000, weeklyRent: 500, holdingCosts: 2500, mgmtFee: 7, vacancy: 3 });

  const result = useMemo(() => calculateScore(scores, dealbreakers, weights), [scores, dealbreakers, weights]);
  const yieldSummary = useMemo(
    () => suburbYieldSummary({
      medianPrice: yieldInputs.medianPrice,
      weeklyRent: yieldInputs.weeklyRent,
      annualHoldingCosts: yieldInputs.holdingCosts,
      managementFeePct: yieldInputs.mgmtFee,
      vacancyPct: yieldInputs.vacancy,
    }),
    [yieldInputs],
  );

  const toggleLayer = (layer: Layer) =>
    setOpenLayers(prev => {
      const n = new Set(prev);
      if (n.has(layer)) n.delete(layer); else n.add(layer);
      return n;
    });

  const handleReset = () => {
    setScores({});
    setDealbreakers(Object.fromEntries(
      CRITERIA.filter(c => c.type === 'dealbreaker').map(c => [c.id, true])
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          Property Research Tool
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          130-point investment property checklist — suburb, location, and property scoring.
        </p>
      </div>

      <AboutCalc concepts={[
        {
          term: 'What is investment property due diligence?',
          definition: 'Systematic research before purchasing an investment property. This covers suburb-level fundamentals (population growth, vacancy rate, supply/demand), local risk factors (flood zones, zoning, infrastructure), and the physical property (condition, layout, build quality). Skipping any layer significantly increases investment risk.',
          link: 'https://moneysmart.gov.au/property-investment',
          linkLabel: 'MoneySmart (ASIC): Property investment',
        },
        {
          term: 'What is rental yield?',
          definition: 'Annual rental income divided by property value, expressed as a percentage. A $650,000 property renting for $26,000/year has a 4% gross yield. High-yield suburbs often offer better cash flow but lower capital growth; tightly-held growth suburbs often have lower yields.',
          link: 'https://en.wikipedia.org/wiki/Rental_yield',
          linkLabel: 'Wikipedia: Rental yield',
        },
        {
          term: 'What is a deal-breaker in property research?',
          definition: 'A factor that makes a property unsuitable regardless of how well it scores on other criteria. Flood zone and bushfire zone risk are classic examples — even a highly-rated suburb cannot compensate for serious insurance, financing, and resale challenges these issues create.',
          link: 'https://moneysmart.gov.au/property-investment/investment-property',
          linkLabel: 'MoneySmart: Risks of investment property',
        },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — criteria */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-medium block mb-1.5">
              Property address (optional)
            </label>
            <input
              type="text" value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 12 Example St, Suburb VIC 3000"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--ring)] text-[var(--foreground)]"
            />
          </div>

          {LAYERS.map(layer => (
            <LayerAccordion
              key={layer.id} layer={layer}
              openLayers={openLayers} onToggle={toggleLayer}
              scores={scores} dealbreakers={dealbreakers}
              onScoreChange={(id, v) => setScores(p => ({ ...p, [id]: v }))}
              onDealBreakerChange={(id, v) => setDealbreakers(p => ({ ...p, [id]: v }))}
            />
          ))}

          <button onClick={handleReset}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--danger)] transition-colors">
            Reset all scores
          </button>

          <Assumptions items={ASSUMPTIONS} />
          <Disclaimer calculatorName="property research tool" />
        </div>

        {/* Right — score panel */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="space-y-4">
          <div className={`sticky top-20 rounded-xl border-2 p-5 ${getRecommendationBg(result.recommendation)}`}>
            <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] font-medium mb-2">
              {address || 'Your Property'}
            </div>

            <div className="text-center mb-4">
              <div className="text-5xl font-bold font-mono text-[var(--foreground)]">
                {result.totalScore}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-0.5">out of {result.maxScore}</div>
              <div className="mt-1.5 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                  style={{ width: `${result.percentage}%` }} />
              </div>
              <div className="mt-1.5 text-[10px] text-[var(--muted-foreground)] font-mono">
                Weighted: {result.weightedScore} / {result.weightedMax} ({result.weightedPercentage}%)
              </div>
            </div>

            <div className={`text-center text-xl font-bold mb-4 ${getRecommendationColor(result.recommendation)}`}>
              {result.recommendation}
            </div>

            {result.dealbreakersTriggered.length > 0 && (
              <div className="bg-[var(--danger)]/10 border border-red-200 rounded-lg px-3 py-2 mb-4">
                <div className="text-xs font-bold text-[var(--danger)] mb-1">
                  Deal Breakers Triggered:
                </div>
                {result.dealbreakersTriggered.map(d => (
                  <div key={d} className="text-xs text-[var(--danger)]">&bull; {d}</div>
                ))}
              </div>
            )}

            <div className="space-y-2">
{/* Layer weights */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Layer Weights
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                {result.weightShare.suburb}% / {result.weightShare.intrasuburb}% / {result.weightShare.property}%
              </span>
            </div>
            <SliderControl label="Suburb (location & demand)" value={weights.suburb} onChange={v => setWeights(p => ({ ...p, suburb: v }))} min={0} max={3} step={0.5} />
            <SliderControl label="Intra-Suburb (site & street)" value={weights.intrasuburb} onChange={v => setWeights(p => ({ ...p, intrasuburb: v }))} min={0} max={3} step={0.5} />
            <SliderControl label="Property (condition & layout)" value={weights.property} onChange={v => setWeights(p => ({ ...p, property: v }))} min={0} max={3} step={0.5} />
            <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
              Weights re-normalise to 100% (share shown above). Weighted score {result.weightedScore}/{result.weightedMax} ({result.weightedPercentage}%) drives the recommendation; equal weights match the standard 120-point scale.
            </p>
          </div>

          {LAYERS.map(layer => (
                <div key={layer.id} className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {layer.label.split('\u2014 ')[1]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full transition-all"
                        style={{ width: `${Math.round((result.layerScores[layer.id] / layer.maxScore) * 100)}%` }} />
                    </div>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {result.layerScores[layer.id]}/{layer.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1 text-xs text-[var(--muted-foreground)]">
              {SCORE_GUIDE.map(([label, range, cls]) => (
                <div key={label} className="flex justify-between">
                  <span className={`font-medium ${cls}`}>{label}</span>
                  <span>{range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
              Research Sources
            </div>
            <div className="space-y-1.5">
              {DATA_SOURCES.map(s => (
                <div key={s.label} className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--muted-foreground)]">{s.label}</span>
                  <span className="ml-1">&mdash; {s.url}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suburb yield summary */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Suburb Yield Summary
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Median Price" value={yieldInputs.medianPrice} onChange={v => setYieldInputs(p => ({ ...p, medianPrice: v }))} min={0} max={10000000} step={10000} prefix="$" />
              <NumberInput label="Weekly Rent" value={yieldInputs.weeklyRent} onChange={v => setYieldInputs(p => ({ ...p, weeklyRent: v }))} min={0} max={5000} step={10} prefix="$" suffix="/wk" />
              <NumberInput label="Holding Costs / yr" value={yieldInputs.holdingCosts} onChange={v => setYieldInputs(p => ({ ...p, holdingCosts: v }))} min={0} max={50000} step={250} prefix="$" />
              <NumberInput label="Mgmt Fee %" value={yieldInputs.mgmtFee} onChange={v => setYieldInputs(p => ({ ...p, mgmtFee: v }))} min={0} max={15} step={0.5} suffix="%" />
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {yieldSummary.rows.map(row => (
                    <tr key={row.metric} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-1.5 text-[var(--muted-foreground)]">{row.metric}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-semibold text-[var(--foreground)]">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

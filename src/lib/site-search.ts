import Fuse from 'fuse.js';
import { MANDY_MODULES, type TopicGuide } from '@/data/mandy-topics';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';

export type SearchResultType = 'module' | 'topic' | 'tool' | 'weblink';

export interface SearchHit {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  emoji?: string;
  route: string;
  /** When present, deep-links to the exact topic inside the module page */
  topicId?: string;
  /** Which field matched, with [start, end] indices for highlighting */
  matches: { field: 'title' | 'subtitle'; indices: [number, number][] }[];
}

interface SearchDoc {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  emoji?: string;
  route: string;
  topicId?: string;
}

interface ToolEntry {
  name: string;
  description: string;
  route: string;
}

const TEEN_TOOLS: ToolEntry[] = [
  { name: 'Money Mindset Quiz', description: 'Discover your money personality — Barefoot Builder, Broke Millennial Strategist or Mandy Money Planner.', route: '/money-and-you' },
  { name: 'Teen Tax Calculator', description: 'Estimate PAYG tax, net pay and refund for junior award rates on the $18,200 tax-free threshold.', route: '/tax-guide' },
  { name: 'Teen Super Calculator', description: 'See how 12% super and compound growth grow into millions by retirement.', route: '/super-retirement' },
  { name: 'First Paycheck Splitter', description: 'Split your first paycheck with the 50/30/20 rule and Barefoot 3-bucket system.', route: '/teen-budgeting' },
  { name: 'Compound Growth Simulator', description: 'Visualise how regular investing compounds over time for your savings goals.', route: '/investing-shares' },
  { name: 'BNPL Debt Trap Visualizer', description: 'Calculate the true cost of Afterpay and Zip late fees on buy-now-pay-later purchases.', route: '/dealing-with-debt' },
  { name: 'Teen Resume Builder', description: 'Build a professional 1-page teen resume with no prior work experience needed.', route: '/careers-employment' },
  { name: 'STAR Interview Simulator', description: 'Practice answering common first-job interview questions using the STAR method.', route: '/careers-employment' },
  { name: 'Payslip Analyzer', description: 'Check your payslip for gross pay, PAYG tax, super and hours to spot underpayment.', route: '/careers-employment' },
  { name: 'Penalty Rate Calculator', description: 'Work out weekend and public holiday penalty rates under your Modern Award.', route: '/careers-employment' },
  { name: 'Workplace Script Generator', description: 'Copy professional scripts for asking for a pay raise or reporting an underpayment.', route: '/careers-employment' },
  { name: 'First Car Cost Calculator', description: 'Add up the true cost of owning a first car — rego, CTP, insurance, fuel, servicing.', route: '/car-driving' },
  { name: 'EV vs Petrol Calculator', description: 'Compare annual running costs of an electric car vs a petrol car in Brisbane.', route: '/car-driving' },
  { name: 'Brisbane Budget Calculator', description: 'Build a realistic weekly Brisbane student budget from rent to groceries to transport.', route: '/brisbane-qld' },
];

function topicToDoc(topic: TopicGuide): SearchDoc {
  const module = MANDY_MODULES.find(m => m.id === topic.moduleId);
  return {
    type: 'topic',
    id: topic.id,
    title: topic.question,
    subtitle: topic.answer,
    keywords: [
      topic.moduleTitle,
      topic.actionStep ?? '',
      topic.webLink?.title ?? '',
      topic.webLink?.description ?? '',
    ].join(' '),
    emoji: module?.emoji,
    route: module?.route ?? '/',
    topicId: topic.id,
  };
}

const docs: SearchDoc[] = [
  ...MANDY_MODULES.map<SearchDoc>(m => ({
    type: 'module',
    id: m.id,
    title: `${m.emoji} ${m.title}`,
    subtitle: m.description,
    keywords: `${m.title} ${m.topics.length} topics`.toLowerCase(),
    emoji: m.emoji,
    route: m.route,
  })),
  ...MANDY_MODULES.flatMap(m => m.topics.map(topicToDoc)),
  ...TEEN_TOOLS.map<SearchDoc>(t => ({
    type: 'tool',
    id: `tool-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: t.name,
    subtitle: t.description,
    keywords: 'calculator tool interactive'.toLowerCase(),
    route: t.route,
  })),
  ...Object.entries(OFFICIAL_WEB_LINKS).map<SearchDoc>(([key, link]) => ({
    type: 'weblink',
    id: `link-${key}`,
    title: link.title,
    subtitle: `${link.source} — ${link.description}`,
    keywords: `${link.formCode ?? ''} ${link.source}`.toLowerCase(),
    route: link.url,
  })),
];

const fuse = new Fuse<SearchDoc>(docs, {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'keywords', weight: 0.3 },
    { name: 'subtitle', weight: 0.2 },
  ],
  includeMatches: true,
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  useTokenSearch: true,
  minMatchCharLength: 2,
});

const GROUP_ORDER: SearchResultType[] = ['topic', 'tool', 'module', 'weblink'];
const GROUP_LABELS: Record<SearchResultType, string> = {
  topic: 'Q&A Guides',
  tool: 'Calculators & Tools',
  module: 'Modules',
  weblink: 'Official Web Resources',
};

/**
 * Fuzzy search across every module, topic Q&A, calculator and official web link.
 * Returns grouped, relevance-ranked hits with character indices for highlighting.
 */
export function searchSite(query: string, maxPerGroup = 6): { groups: { type: SearchResultType; label: string; hits: SearchHit[] }[]; total: number } {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { groups: [], total: 0 };
  }

  const results = fuse.search(trimmed, { limit: 60 });
  const byGroup = new Map<SearchResultType, SearchHit[]>();
  for (const r of results) {
    const type = r.item.type;
    const hit: SearchHit = {
      type,
      id: r.item.id,
      title: r.item.title,
      subtitle: r.item.subtitle,
      emoji: r.item.emoji,
      route: r.item.route,
      topicId: r.item.topicId,
      matches: (r.matches ?? [])
        .filter(m => (m.key === 'title' || m.key === 'subtitle') && m.indices)
        .map(m => ({
          field: m.key as 'title' | 'subtitle',
          indices: m.indices as [number, number][],
        })),
    };
    const arr = byGroup.get(type) ?? [];
    if (arr.length < maxPerGroup) arr.push(hit);
    byGroup.set(type, arr);
  }

  const groups = GROUP_ORDER
    .filter(t => byGroup.has(t))
    .map(type => ({ type, label: GROUP_LABELS[type], hits: byGroup.get(type)! }));

  const total = results.length;
  return { groups, total };
}

/** Quick autocomplete/suggestion titles for a partial query (used as placeholder suggestions). */
export function autocomplete(query: string, limit = 5): string[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return fuse
    .search(trimmed, { limit })
    .map(r => r.item.title.replace(/^\S+\s/, '').trim())
    .filter((v, i, a) => a.indexOf(v) === i);
}

/** Popular search starters shown before the user types. */
export const POPULAR_SEARCHES = [
  'HECS',
  'penalty rates',
  'super 12%',
  'tax-free threshold',
  'PPSR',
  'BNPL',
  'QLD licence',
  'ETF',
  'Hazard Perception Test',
  'franking credits',
];

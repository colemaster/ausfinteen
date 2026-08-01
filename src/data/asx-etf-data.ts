/**
 * Top 10 Most Popular ASX ETFs — reference data for the Investing & Shares module.
 *
 * Ranking: Funds Under Management (FUM) as published by the ASX in its monthly
 * Investment Products report and summarised by The Motley Fool (Jan 2026).
 *
 * Sources:
 *  - ASX Investment Products report (Dec 2025): https://www.asx.com.au
 *  - Motley Fool Australia "10 most popular ASX ETFs" (30 Jan 2026)
 *  - Morningstar AU / Yahoo Finance AU (annual & trailing returns)
 *  - etfinfo.com.au (MER, AUM, distribution yields, flows)
 *  - Issuer PDSs (Vanguard, Betashares, iShares/BlackRock, VanEck, Dimensional, Magellan)
 *
 * IMPORTANT: Figures are historical reference data as at mid-2026 for education only.
 * They are NOT live quotes and NOT financial advice. Past performance is not
 * indicative of future returns. Always verify against the issuer's current PDS.
 *
 * Units:
 *  - mer  = management expense ratio (%, p.a.)
 *  - fum  = funds under management in AUD billions
 *  - dividendYield = trailing 12-month distribution yield (%)
 *  - annualReturns = calendar-year total return (% , with distributions reinvested)
 *    where 'usd' is true, the series is in USD (the fund's native currency)
 */

export interface ASXETF {
  code: string;
  name: string;
  issuer: string;
  tracks: string;
  mer: number;
  fum: number;
  dividendYield: number;
  payFrequency: 'Quarterly' | 'Semi-Annual' | 'Annual';
  inception: string;
  url: string;
  annualReturns: Record<string, number>;
  usd?: boolean;
  trailing: { '1Y': number | null; '3Y': number | null; '5Y': number | null; '10Y': number | null };
}

export const TOP_10_ASX_ETFS: ASXETF[] = [
  {
    code: 'VAS',
    name: 'Vanguard Australian Shares Index ETF',
    issuer: 'Vanguard',
    tracks: 'S&P/ASX 300 Index (largest ~300 AU-listed companies)',
    mer: 0.07,
    fum: 22.585,
    dividendYield: 3.0,
    payFrequency: 'Quarterly',
    inception: '2009',
    url: 'https://www.vanguard.com.au/personal/invest-with-us/etf',
    annualReturns: {
      '2016': 11.29,
      '2017': 11.80,
      '2018': -3.12,
      '2019': 23.77,
      '2020': 1.86,
      '2021': 17.40,
      '2022': -1.68,
      '2023': 12.01,
      '2024': 11.40,
      '2025': 10.65,
    },
    trailing: { '1Y': 10.65, '3Y': 9.74, '5Y': 10.1, '10Y': 10.07 },
  },
  {
    code: 'VGS',
    name: 'Vanguard MSCI Index International Shares ETF',
    issuer: 'Vanguard',
    tracks: 'MSCI World ex-Australia (~1,300 companies across 23 countries)',
    mer: 0.18,
    fum: 14.192,
    dividendYield: 1.27,
    payFrequency: 'Quarterly',
    inception: '2014',
    url: 'https://www.vanguard.com.au/personal/invest-with-us/etf',
    annualReturns: {
      '2020': 4.8,
      '2021': 26.9,
      '2022': -12.3,
      '2023': 22.3,
      '2024': 27.6,
      '2025': 13.34,
    },
    trailing: { '1Y': 15.31, '3Y': 17.84, '5Y': 13.43, '10Y': 14.12 },
  },
  {
    code: 'IVV',
    name: 'iShares Core S&P 500 ETF',
    issuer: 'iShares (BlackRock)',
    tracks: 'S&P 500 Index (500 largest US companies)',
    mer: 0.04,
    fum: 13.11,
    dividendYield: 0.5,
    payFrequency: 'Quarterly',
    inception: '2012',
    url: 'https://www.ishares.com/au',
    annualReturns: {
      '2016': 12.16,
      '2017': 21.76,
      '2018': -4.47,
      '2019': 31.25,
      '2020': 18.4,
      '2021': 28.76,
      '2022': -18.16,
      '2023': 26.32,
      '2024': 24.93,
      '2025': 17.85,
    },
    usd: true,
    trailing: { '1Y': 8.57, '3Y': 16.6, '5Y': 13.48, '10Y': 15.77 },
  },
  {
    code: 'A200',
    name: 'BetaShares Australia 200 ETF',
    issuer: 'BetaShares',
    tracks: 'Solactive Australia 200 Index (largest 200 AU companies)',
    mer: 0.04,
    fum: 8.88,
    dividendYield: 3.5,
    payFrequency: 'Quarterly',
    inception: '2018',
    url: 'https://www.betashares.com.au/fund/australia-200-etf',
    annualReturns: {
      '2019': 22.86,
      '2020': 1.13,
      '2021': 17.92,
      '2022': -0.55,
      '2023': 12.01,
      '2024': 11.58,
      '2025': 10.3,
    },
    trailing: { '1Y': 10.3, '3Y': 10.75, '5Y': 7.91, '10Y': null },
  },
  {
    code: 'QUAL',
    name: 'VanEck MSCI International Quality ETF',
    issuer: 'VanEck',
    tracks: 'MSCI World ex-Australia Quality (~300 high-ROE developed-market companies)',
    mer: 0.4,
    fum: 8.07,
    dividendYield: 1.9,
    payFrequency: 'Semi-Annual',
    inception: '2014',
    url: 'https://www.vaneck.com.au/etf/equity/qual/snapshot',
    annualReturns: {
      '2020': 20.0,
      '2021': 28.2,
      '2022': -14.0,
      '2023': 20.5,
      '2024': 22.8,
      '2025': 6.5,
    },
    trailing: { '1Y': 3.84, '3Y': null, '5Y': null, '10Y': null },
  },
  {
    code: 'IOZ',
    name: 'iShares Core S&P/ASX 200 ETF',
    issuer: 'iShares (BlackRock)',
    tracks: 'S&P/ASX 200 Accumulation Index (top 200 AU companies, dividends reinvested)',
    mer: 0.05,
    fum: 7.798,
    dividendYield: 3.5,
    payFrequency: 'Quarterly',
    inception: '2010',
    url: 'https://www.ishares.com/au',
    annualReturns: {
      '2020': 0.9,
      '2021': 17.6,
      '2022': -0.4,
      '2023': 12.2,
      '2024': 11.7,
      '2025': 10.2,
    },
    trailing: { '1Y': 10.2, '3Y': null, '5Y': null, '10Y': null },
  },
  {
    code: 'NDQ',
    name: 'BetaShares NASDAQ 100 ETF',
    issuer: 'BetaShares',
    tracks: 'NASDAQ-100 Index (100 largest US-listed non-financial tech companies)',
    mer: 0.48,
    fum: 7.69,
    dividendYield: 1.52,
    payFrequency: 'Semi-Annual',
    inception: '2015',
    url: 'https://www.betashares.com.au/fund/nasdaq-100-etf',
    annualReturns: {
      '2016': 7.12,
      '2017': 21.89,
      '2018': 9.15,
      '2019': 39.59,
      '2020': 34.46,
      '2021': 35.44,
      '2022': -28.41,
      '2023': 53.39,
      '2024': 38.33,
      '2025': 11.35,
    },
    trailing: { '1Y': 9.91, '3Y': 18.9, '5Y': 14.54, '10Y': 20.48 },
  },
  {
    code: 'DACE',
    name: 'Dimensional Australian Core Equity Trust (Active ETF)',
    issuer: 'Dimensional',
    tracks: 'Actively managed — broad ASX portfolio selected by Dimensional analysts',
    mer: 0.28,
    fum: 6.434,
    dividendYield: 3.8,
    payFrequency: 'Semi-Annual',
    inception: '2019',
    url: 'https://www.dimensional.com/au-en',
    annualReturns: {
      '2021': 19.0,
      '2022': -0.5,
      '2023': 12.5,
      '2024': 12.0,
      '2025': 22.67,
    },
    trailing: { '1Y': 22.67, '3Y': null, '5Y': null, '10Y': null },
  },
  {
    code: 'MGOC',
    name: 'Magellan Global Fund — Active ETF',
    issuer: 'Magellan',
    tracks: 'Actively managed — 20–40 of Magellan\'s best-in-class global companies',
    mer: 1.35,
    fum: 6.372,
    dividendYield: 2.0,
    payFrequency: 'Annual',
    inception: '2018',
    url: 'https://www.magellangroup.com.au',
    annualReturns: {
      '2021': 17.0,
      '2022': -24.0,
      '2023': 22.0,
      '2024': 15.0,
      '2025': 12.0,
    },
    trailing: { '1Y': 12.0, '3Y': null, '5Y': null, '10Y': null },
  },
  {
    code: 'VTS',
    name: 'Vanguard US Total Market Shares Index ETF',
    issuer: 'Vanguard',
    tracks: 'CRSP US Total Market Index (~3,700 US companies of every size)',
    mer: 0.03,
    fum: 6.361,
    dividendYield: 1.2,
    payFrequency: 'Quarterly',
    inception: '2013',
    url: 'https://www.vanguard.com.au/personal/invest-with-us/etf',
    annualReturns: {
      '2020': 21.0,
      '2021': 26.0,
      '2022': -19.0,
      '2023': 26.0,
      '2024': 25.0,
      '2025': 14.0,
    },
    usd: true,
    trailing: { '1Y': 14.0, '3Y': null, '5Y': null, '10Y': null },
  },
];

export const ASX_ETF_DATA_AS_AT = 'mid-2026 (see source notes above)';

/** Average annual total return of the top-10 index ETFs (VAS + VGS blend ~ 8.5%) */
export const ASX_ETF_LONG_TERM_AVG_RETURN = 8.5;

export interface GrowthPoint {
  year: string;
  [key: string]: string | number;
}

/**
 * Compounds $10,000 invested at the start of each year through the calendar-year
 * total returns (with distributions reinvested) to build a "growth of $10k" series.
 * Year keys that have no data for an ETF simply don't emit a point for that ETF.
 */
export function buildGrowthSeries(
  etfs: ASXETF[],
  yearStart: number,
  yearEnd: number
): GrowthPoint[] {
  const points: GrowthPoint[] = [];
  const balances: Record<string, number> = {};
  for (let year = yearStart; year <= yearEnd; year++) {
    const point: GrowthPoint = { year: String(year) };
    etfs.forEach(etf => {
      const ret = etf.annualReturns[String(year)];
      if (ret === undefined) return;
      balances[etf.code] = (balances[etf.code] ?? 10000) * (1 + ret / 100);
      point[etf.code] = Math.round(balances[etf.code]);
    });
    points.push(point);
  }
  return points;
}

export interface PortfolioStats {
  weightedMer: number | null;
  weighted1Y: number | null;
  weighted3Y: number | null;
  weighted5Y: number | null;
  weightedYield: number | null;
  weightedFum: number | null;
}

/** Weighted-average stats for an ETF portfolio option (weights sum to 100). */
export function computePortfolioStats(
  allocations: ETFAllocation[],
  allEtfs: ASXETF[]
): PortfolioStats {
  const byCode = new Map(allEtfs.map(e => [e.code, e]));
  let w = 0;
  let mer = 0;
  let yieldSum = 0;
  let fum = 0;
  const trailing: Record<'1Y' | '3Y' | '5Y', { w: number; sum: number }> = {
    '1Y': { w: 0, sum: 0 },
    '3Y': { w: 0, sum: 0 },
    '5Y': { w: 0, sum: 0 },
  };

  allocations.forEach(a => {
    const etf = byCode.get(a.code);
    if (!etf) return;
    w += a.pct;
    mer += etf.mer * a.pct;
    yieldSum += etf.dividendYield * a.pct;
    fum += etf.fum * a.pct;
    (['1Y', '3Y', '5Y'] as const).forEach(p => {
      const v = etf.trailing[p];
      if (v !== null) {
        trailing[p].w += a.pct;
        trailing[p].sum += v * a.pct;
      }
    });
  });

  const avg = (r: { w: number; sum: number }) => (r.w === 0 ? null : r.sum / r.w);
  return {
    weightedMer: w === 0 ? null : mer / w,
    weighted1Y: avg(trailing['1Y']),
    weighted3Y: avg(trailing['3Y']),
    weighted5Y: avg(trailing['5Y']),
    weightedYield: w === 0 ? null : yieldSum / w,
    weightedFum: w === 0 ? null : fum / w,
  };
}

export interface ETFAllocation {
  code: string;
  pct: number;
}

export interface ETFPortfolioOption {
  id: string;
  name: string;
  tagline: string;
  risk: 'Low' | 'Balanced' | 'Growth' | 'High Growth';
  allocations: ETFAllocation[];
  note: string;
}

/**
 * Best 3 starter ETF portfolios, built only from the core index funds above.
 * These are model portfolios for education — not financial advice.
 * Weighted MER and returns are computed in the UI from TOP_10_ASX_ETFS.
 */
export const BEST_3_ETF_PORTFOLIOS: ETFPortfolioOption[] = [
  {
    id: 'balanced',
    name: 'Balanced Starter',
    tagline: 'Simple low-cost core — full ASX + global diversification',
    risk: 'Balanced',
    allocations: [
      { code: 'VAS', pct: 40 },
      { code: 'VGS', pct: 30 },
      { code: 'A200', pct: 30 },
    ],
    note: 'Maximises franking credits via two overlapping ASX funds (VAS + A200) — a common low-cost core.',
  },
  {
    id: 'growth',
    name: 'Global Growth',
    tagline: 'Diversified growth with heavy global + tech exposure',
    risk: 'Growth',
    allocations: [
      { code: 'VAS', pct: 30 },
      { code: 'VGS', pct: 40 },
      { code: 'IVV', pct: 30 },
    ],
    note: '60%+ global exposure. IVV adds US large-cap concentration on top of the MSCI World in VGS.',
  },
  {
    id: 'income',
    name: 'Yield + Quality',
    tagline: 'Dividend income with defensive quality tilt',
    risk: 'Low',
    allocations: [
      { code: 'A200', pct: 40 },
      { code: 'DACE', pct: 25 },
      { code: 'QUAL', pct: 20 },
      { code: 'MGOC', pct: 15 },
    ],
    note: 'Blends franking-credit heavy AU funds with high-ROE international quality. Approx. 2.9% yield.',
  },
];

export interface NextBigEtf {
  theme: string;
  trend: string;
  examples: string[];
  why: string;
  caution: string;
}

/**
 * Forward-looking ETF themes on the ASX (2026 edition).
 * Based on issuer commentary, ASX ETF market flows and Morningstar/etfinfo reporting.
 * These are trends — NOT stock recommendations. High volatility, high risk.
 */
export const NEXT_BIG_ASX_ETF_TRENDS: NextBigEtf[] = [
  {
    theme: 'Global / Offshore exposure',
    trend: 'Investors are diversifying away from the ASX’s narrow, banking-heavy market',
    examples: ['VGS', 'BGBL', 'IWLD', 'VTS'],
    why: 'The Australian ETF market is now worth ~$346b and the fastest-growing bucket is overseas equities. ~80% of the ASX is banks, miners and consumer staples.',
    caution: 'Currency risk: a rising AUD erodes returns on unhedged global funds.',
  },
  {
    theme: 'AI & Robotics',
    trend: 'Thematic funds betting on automation, humanoid robots and AI infrastructure',
    examples: ['RBTZ', 'HMND', 'VTEK', 'SEMI'],
    why: 'New 2026 ASX launches include humanoid-robotics (HMND), global-tech (VTEK, 0.22% MER) and space (RCKT) funds, riding the AI capex supercycle.',
    caution: 'Themes are concentrated and can fall 40%+ in a downturn. Keep to satellite sizing.',
  },
  {
    theme: 'Commodities & Energy Transition',
    trend: 'Copper, lithium, uranium and battery-miner ETF launches surged',
    examples: ['CPPR', 'VOLT', 'URNM', 'ACDC', 'XMET', 'OOO'],
    why: '2026 top performers were energy-transition driven — HGEN +188%, CLNE +133%, OOO +124%, ACDC +108% over 1 year.',
    caution: 'After strong runs these are volatile; commodity cycles can reverse quickly.',
  },
  {
    theme: 'Bitcoin & Crypto',
    trend: 'Spot bitcoin ETFs continue to draw record inflows',
    examples: ['IBTC', 'BTXX', 'EBTC'],
    why: 'Australian investors poured billions into spot crypto ETFs in 2025-26 as institutions and super funds added bitcoin exposure.',
    caution: 'Extreme volatility. Usually <5% of a diversified portfolio.',
  },
  {
    theme: 'Private Equity & Alternatives',
    trend: 'ETFs democratising access to private equity and global unlisted assets',
    examples: ['PEET', 'MONE'],
    why: 'Funds like BetaShares Private Equity (PEET) open up PE/venture returns previously limited to institutions.',
    caution: 'Higher fees, less liquidity, quarterly redemption and gating risks.',
  },
  {
    theme: 'Cheaper S&P 500',
    trend: 'Fee war — the cost of US exposure keeps falling',
    examples: ['V500', 'IVV', 'SPY'],
    why: 'Vanguard launched V500 (S&P 500) at a 0.07% MER, pressuring incumbent IVV (0.04%) — winners are cost-competitive global exposure.',
    caution: 'Low fees matter, but an unhedged US fund still carries FX risk.',
  },
];


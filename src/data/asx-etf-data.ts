/**
 * Top 10 Most Popular ASX ETFs — reference data for the Investing & Shares module.
 *
 * Ranking: Funds Under Management (FUM / AUM) as published by the ASX in its monthly
 * Investment Products report and issuer PDS disclosures (September 2026).
 *
 * Sources:
 *  - ASX Investment Products report (July–August 2026): https://www.asx.com.au
 *  - Morningstar AU / Yahoo Finance AU (annual & trailing returns)
 *  - etfinfo.com.au (MER, AUM, distribution yields, flows)
 *  - Issuer PDSs (Vanguard, Betashares, iShares/BlackRock, VanEck, Dimensional, Vinva)
 *
 * IMPORTANT: Figures are historical reference data as at September 2026 for education only.
 * They are NOT live quotes and NOT financial advice. Past performance is not
 * indicative of future returns. Always verify against the issuer's current PDS.
 *
 * Units:
 *  - mer  = management expense ratio (%, p.a.)
 *  - fum  = funds under management in AUD billions (AUM)
 *  - dividendYield = trailing 12-month distribution yield (%)
 *  - annualReturns = calendar-year total return (%, with distributions reinvested)
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
  topHoldings: string[];
  description: string;
  assetAllocation?: {
    growthPct: number;
    defensivePct: number;
    summary: string;
  };
}

export const TOP_10_ASX_ETFS: ASXETF[] = [
  {
    code: 'VAS',
    name: 'Vanguard Australian Shares Index ETF',
    issuer: 'Vanguard',
    tracks: 'S&P/ASX 300 Index (largest ~300 AU-listed companies)',
    mer: 0.07,
    fum: 26.9,
    dividendYield: 3.01,
    payFrequency: 'Quarterly',
    inception: '2009',
    url: 'https://www.vanguard.com.au/personal/products/en/detail/etf/8205/equity',
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
    trailing: { '1Y': 4.18, '3Y': 11.11, '5Y': 7.57, '10Y': 9.26 },
    topHoldings: [
      'BHP Group Ltd (10.9%)',
      'Commonwealth Bank of Australia (9.9%)',
      'CSL Ltd (5.8%)',
      'Westpac Banking Corp (4.3%)',
      'National Australia Bank Ltd (4.2%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Australian Equities (S&P/ASX 300 index across large, mid, and small cap)',
    },
    description:
      'Australia’s largest ETF, providing broad exposure to the top 300 companies listed on the ASX with significant franked dividend yields.',
  },
  {
    code: 'VGS',
    name: 'Vanguard MSCI Index International Shares ETF',
    issuer: 'Vanguard',
    tracks: 'MSCI World ex-Australia (~1,300 companies across 23 countries)',
    mer: 0.18,
    fum: 18.6,
    dividendYield: 1.28,
    payFrequency: 'Quarterly',
    inception: '2014',
    url: 'https://www.vanguard.com.au/personal/products/en/detail/etf/8212/equity',
    annualReturns: {
      '2020': 4.8,
      '2021': 26.9,
      '2022': -12.3,
      '2023': 22.3,
      '2024': 27.6,
      '2025': 13.34,
    },
    trailing: { '1Y': 10.03, '3Y': 16.25, '5Y': 14.95, '10Y': 13.69 },
    topHoldings: [
      'NVIDIA Corp (5.3%)',
      'Apple Inc (4.8%)',
      'Microsoft Corp (3.0%)',
      'Amazon.com Inc (2.6%)',
      'Alphabet Inc (2.1%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Global Equities (~1,300 companies across 23 developed countries ex-Australia)',
    },
    description:
      'The core unhedged international equities benchmark for Australian investors, offering broad diversification across ~1,300 developed-market companies.',
  },
  {
    code: 'IVV',
    name: 'iShares Core S&P 500 ETF',
    issuer: 'iShares (BlackRock)',
    tracks: 'S&P 500 Index (500 largest US companies)',
    mer: 0.03,
    fum: 14.9,
    dividendYield: 1.09,
    payFrequency: 'Quarterly',
    inception: '2012',
    url: 'https://www.ishares.com/au/individual/en/products/273427/ishares-core-sp-500-etf',
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
    trailing: { '1Y': 9.66, '3Y': 16.76, '5Y': 12.96, '10Y': 15.65 },
    topHoldings: [
      'Microsoft Corp (7.1%)',
      'Apple Inc (6.6%)',
      'NVIDIA Corp (6.1%)',
      'Amazon.com Inc (3.7%)',
      'Meta Platforms Inc (2.4%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% US Large-Cap Equities (500 leading companies tracking the S&P 500 Index)',
    },
    description:
      'Ultra low-cost vehicle tracking the 500 largest US companies (0.03% MER; underlying US vehicle / 0.04% local ASX PDS), acting as a foundational growth engine for global portfolios.',
  },
  {
    code: 'A200',
    name: 'BetaShares Australia 200 ETF',
    issuer: 'BetaShares',
    tracks: 'Solactive Australia 200 Index (largest 200 AU companies)',
    mer: 0.04,
    fum: 11.3,
    dividendYield: 4.29,
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
    trailing: { '1Y': 4.58, '3Y': 11.33, '5Y': 7.95, '10Y': null },
    topHoldings: [
      'BHP Group Ltd (11.8%)',
      'Commonwealth Bank of Australia (10.6%)',
      'Westpac Banking Corp (4.7%)',
      'National Australia Bank Ltd (4.4%)',
      'ANZ Group Holdings Ltd (4.1%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Australian Equities (Solactive Australia 200 Index)',
    },
    description:
      'The lowest-cost Australian equity ETF on the ASX (0.04% MER), targeting the top 200 companies with high dividend yields and franking credits.',
  },
  {
    code: 'QUAL',
    name: 'VanEck MSCI International Quality ETF',
    issuer: 'VanEck',
    tracks: 'MSCI World ex-Australia Quality (~300 high-ROE developed-market companies)',
    mer: 0.4,
    fum: 9.2,
    dividendYield: 1.16,
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
    trailing: { '1Y': 17.9, '3Y': 20.3, '5Y': 11.6, '10Y': 14.5 },
    topHoldings: [
      'NVIDIA Corp (5.8%)',
      'Apple Inc (5.2%)',
      'Microsoft Corp (4.6%)',
      'Meta Platforms Inc (3.9%)',
      'Eli Lilly & Co (3.1%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Global Quality Equities (~300 high-ROE developed market companies)',
    },
    description:
      'Factor-based smart-beta ETF capturing international quality leaders selected for high Return on Equity (ROE), low leverage, and earnings stability.',
  },
  {
    code: 'IOZ',
    name: 'iShares Core S&P/ASX 200 ETF',
    issuer: 'iShares (BlackRock)',
    tracks: 'S&P/ASX 200 Accumulation Index (top 200 AU companies, dividends reinvested)',
    mer: 0.05,
    fum: 9.6,
    dividendYield: 3.31,
    payFrequency: 'Quarterly',
    inception: '2010',
    url: 'https://www.ishares.com/au/individual/en/products/273423/ishares-core-sp-asx-200-etf',
    annualReturns: {
      '2020': 0.9,
      '2021': 17.6,
      '2022': -0.4,
      '2023': 12.2,
      '2024': 11.7,
      '2025': 10.2,
    },
    trailing: { '1Y': 4.3, '3Y': 11.2, '5Y': 7.7, '10Y': 8.9 },
    topHoldings: [
      'BHP Group Ltd (11.0%)',
      'Commonwealth Bank of Australia (10.8%)',
      'CSL Ltd (5.9%)',
      'National Australia Bank Ltd (4.3%)',
      'Westpac Banking Corp (4.2%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Australian Equities (S&P/ASX 200 Accumulation Index)',
    },
    description:
      'BlackRock’s flagship low-cost Australian equity fund benchmarked against the S&P/ASX 200 Accumulation Index.',
  },
  {
    code: 'NDQ',
    name: 'BetaShares NASDAQ 100 ETF',
    issuer: 'BetaShares',
    tracks: 'NASDAQ-100 Index (100 largest US-listed non-financial tech companies)',
    mer: 0.48,
    fum: 9.9,
    dividendYield: 1.5,
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
    trailing: { '1Y': 13.0, '3Y': 19.4, '5Y': 14.2, '10Y': 20.48 },
    topHoldings: [
      'NVIDIA Corp (8.1%)',
      'Apple Inc (7.2%)',
      'Microsoft Corp (5.8%)',
      'Amazon.com Inc (4.7%)',
      'Broadcom Inc (4.5%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% US & Global Tech/Innovation Equities (Nasdaq-100 Index)',
    },
    description:
      'High-growth tech and innovation focus tracking the top 100 non-financial companies listed on the US NASDAQ exchange.',
  },
  {
    code: 'DACE',
    name: 'Dimensional Australian Core Equity Trust (Active ETF)',
    issuer: 'Dimensional',
    tracks: 'Actively managed — broad ASX portfolio selected by Dimensional analysts',
    mer: 0.28,
    fum: 7.0,
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
    trailing: { '1Y': 10.95, '3Y': 12.0, '5Y': 8.52, '10Y': null },
    topHoldings: [
      'BHP Group Ltd (8.9%)',
      'Commonwealth Bank of Australia (7.5%)',
      'CSL Ltd (4.8%)',
      'Woodside Energy Group Ltd (3.1%)',
      'Rio Tinto Ltd (2.9%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Australian Equities tilted towards value, size, and profitability factors',
    },
    description:
      'Dimensional’s actively structured core ETF that tilts systematically toward Australian value, small-cap, and high-profitability factors.',
  },
  {
    code: 'V1AC',
    name: 'Vinva Global Alpha Fund — Active ETF (ex-Magellan MGOC)',
    issuer: 'Vinva',
    tracks: 'Systematic quantitative global equity alpha strategy (transitioned from Magellan Global Fund MGOC, 5 June 2026)',
    mer: 0.89,
    fum: 4.7,
    dividendYield: 2.0,
    payFrequency: 'Annual',
    inception: '2026 (strategy transition; predecessor MGOC 2018)',
    url: 'https://www.asx.com.au/markets/trade-our-cash-market/list-of-etfs',
    annualReturns: {
      '2021': 17.0,
      '2022': -24.0,
      '2023': 22.0,
      '2024': 15.0,
      '2025': 12.0,
    },
    trailing: { '1Y': -5.13, '3Y': 9.35, '5Y': 5.8, '10Y': null },
    topHoldings: [
      'Amazon.com Inc (6.2%)',
      'Microsoft Corp (5.8%)',
      'Taiwan Semiconductor (4.9%)',
      'Meta Platforms Inc (4.5%)',
      'Mastercard Inc (4.1%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Global Equities (quantitative factor long alpha portfolio)',
    },
    description:
      'Former Magellan Global Fund converted 5 June 2026 to Vinva’s systematic alpha strategy (0.89% fee, no performance fee). Pre-transition returns belong to the old Magellan strategy — not indicative of Vinva management.',
  },
  {
    code: 'VTS',
    name: 'Vanguard US Total Market Shares Index ETF',
    issuer: 'Vanguard',
    tracks: 'CRSP US Total Market Index (~4,000 US companies across large, mid, small, micro cap)',
    mer: 0.03,
    fum: 7.2,
    dividendYield: 0.92,
    payFrequency: 'Quarterly',
    inception: '2013',
    url: 'https://www.vanguard.com.au/personal/products/en/detail/etf/8202/equity',
    annualReturns: {
      '2020': 21.0,
      '2021': 26.0,
      '2022': -19.0,
      '2023': 26.0,
      '2024': 25.0,
      '2025': 14.0,
    },
    usd: true,
    trailing: { '1Y': 8.9, '3Y': 16.7, '5Y': 12.1, '10Y': 15.2 },
    topHoldings: [
      'NVIDIA Corp (6.4%)',
      'Apple Inc (6.0%)',
      'Microsoft Corp (4.4%)',
      'Amazon.com Inc (3.2%)',
      'Meta Platforms Inc (2.2%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Total US Stock Market (~4,000 all-cap US equities)',
    },
    description:
      'Cross-listed Vanguard ETF giving ultra-cheap exposure to all ~4,000 investable stocks in the US equity market.',
  },
];

/** Popular starter and all-in-one ETFs referenced across starter portfolios */
export const STARTER_ETFS: ASXETF[] = [
  {
    code: 'DHHF',
    name: 'Betashares Diversified All Growth ETF',
    issuer: 'BetaShares',
    tracks: 'All-Growth multi-asset index (~100% equities across ~8,000 AU, US, developed & emerging companies)',
    mer: 0.19,
    fum: 1.65,
    dividendYield: 2.65,
    payFrequency: 'Quarterly',
    inception: '2020',
    url: 'https://www.betashares.com.au/fund/diversified-all-growth-etf',
    annualReturns: {
      '2021': 20.35,
      '2022': -11.24,
      '2023': 16.82,
      '2024': 18.25,
      '2025': 12.1,
    },
    trailing: { '1Y': 11.2, '3Y': 13.5, '5Y': 10.85, '10Y': null },
    topHoldings: [
      'Betashares Australia 200 ETF [A200] (36.2%)',
      'Vanguard Total Stock Market ETF [VTI] (37.8%)',
      'SPDR Portfolio Developed World ex-US [SPDW] (18.6%)',
      'SPDR Portfolio Emerging Markets [SPEM] (7.4%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% Growth / 0% Defensive (100% all-equity globally diversified across ~8,000 stocks)',
    },
    description:
      'The premier all-in-one equity ETF on the ASX, holding ~100% growth assets across 8,000+ stocks in Australia, the US, developed and emerging markets with zero bonds and automatic rebalancing.',
  },
  {
    code: 'VDHG',
    name: 'Vanguard Diversified High Growth Index ETF',
    issuer: 'Vanguard',
    tracks: '90% Growth Equities (AU + Global) / 10% Defensive Fixed Interest & Bonds',
    mer: 0.27,
    fum: 4.14,
    dividendYield: 3.25,
    payFrequency: 'Quarterly',
    inception: '2017',
    url: 'https://www.vanguard.com.au/personal/products/en/detail/etf/8221/diversified',
    annualReturns: {
      '2018': -3.42,
      '2019': 19.34,
      '2020': 3.52,
      '2021': 16.64,
      '2022': -9.12,
      '2023': 13.91,
      '2024': 15.82,
      '2025': 10.9,
    },
    trailing: { '1Y': 9.85, '3Y': 12.15, '5Y': 9.42, '10Y': null },
    topHoldings: [
      'Vanguard Australian Shares Index Fund (35.8%)',
      'Vanguard International Shares Index Fund (26.7%)',
      'Vanguard Int Shares Index Fund (Hedged) (15.8%)',
      'Vanguard Emerging Markets Shares Index Fund (5.1%)',
      'Global & Australian Aggregate Fixed Interest (9.9%)',
    ],
    assetAllocation: {
      growthPct: 90,
      defensivePct: 10,
      summary: '90% Growth (equities) / 10% Defensive (global and Australian bonds) with automatic rebalancing',
    },
    description:
      'Vanguard’s legendary all-in-one multi-asset portfolio, holding 90% Australian and global shares paired with a 10% bond cushion, auto-rebalancing across 10,000+ securities.',
  },
  {
    code: 'BGBL',
    name: 'Betashares Global Shares ETF',
    issuer: 'BetaShares',
    tracks: 'Solactive GBS Developed Markets ex-Australia Large & Mid Cap Index (~1,500 global stocks)',
    mer: 0.08,
    fum: 5.54,
    dividendYield: 1.25,
    payFrequency: 'Semi-Annual',
    inception: '2023',
    url: 'https://www.betashares.com.au/fund/global-shares-etf',
    annualReturns: {
      '2024': 27.8,
      '2025': 13.5,
    },
    trailing: { '1Y': 10.25, '3Y': 16.45, '5Y': null, '10Y': null },
    topHoldings: [
      'Apple Inc (5.2%)',
      'NVIDIA Corp (5.1%)',
      'Microsoft Corp (4.8%)',
      'Amazon.com Inc (2.9%)',
      'Meta Platforms Inc (2.2%)',
    ],
    assetAllocation: {
      growthPct: 100,
      defensivePct: 0,
      summary: '100% International Developed Markets Equities ex-Australia (ultra-low 0.08% fee)',
    },
    description:
      'BetaShares ultra-low-cost developed-market international equities index fund (0.08% MER), competing directly with VGS for core global exposure.',
  },
];

export const ALL_POPULAR_ASX_ETFS: ASXETF[] = [
  ...TOP_10_ASX_ETFS,
  ...STARTER_ETFS,
];

/**
 * ASX ETF Registry — dictionary keyed by ticker symbol for O(1) lookups.
 * Includes all top 10 FUM ETFs plus popular all-in-one and starter favorites (DHHF, VDHG, BGBL).
 */
export const ASX_ETF_REGISTRY: Record<string, ASXETF> = Object.fromEntries(
  ALL_POPULAR_ASX_ETFS.map(etf => [etf.code, etf])
);

export const ASX_ETF_DATA_AS_AT = 'October 2026 (see source notes above)';

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
  weighted10Y: number | null;
  weightedYield: number | null;
  weightedFum: number | null;
}

/** Weighted-average stats for an ETF portfolio option (weights sum to 100). */
export function computePortfolioStats(
  allocations: ETFAllocation[],
  allEtfs: ASXETF[] = ALL_POPULAR_ASX_ETFS
): PortfolioStats {
  const byCode = new Map(allEtfs.map(e => [e.code, e]));
  ALL_POPULAR_ASX_ETFS.forEach(e => {
    if (!byCode.has(e.code)) byCode.set(e.code, e);
  });

  let w = 0;
  let mer = 0;
  let yieldSum = 0;
  let fum = 0;
  const trailing: Record<'1Y' | '3Y' | '5Y' | '10Y', { w: number; sum: number }> = {
    '1Y': { w: 0, sum: 0 },
    '3Y': { w: 0, sum: 0 },
    '5Y': { w: 0, sum: 0 },
    '10Y': { w: 0, sum: 0 },
  };

  allocations.forEach(a => {
    const etf = byCode.get(a.code);
    if (!etf) return;
    w += a.pct;
    mer += etf.mer * a.pct;
    yieldSum += etf.dividendYield * a.pct;
    fum += etf.fum * a.pct;
    (['1Y', '3Y', '5Y', '10Y'] as const).forEach(p => {
      const v = etf.trailing[p];
      if (v !== null && v !== undefined) {
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
    weighted10Y: avg(trailing['10Y']),
    weightedYield: w === 0 ? null : yieldSum / w,
    weightedFum: w === 0 ? null : fum / w,
  };
}

export interface ETFAllocation {
  code: string;
  pct: number;
}

export interface ETFPortfolioVariant {
  id: string;
  label: string;
  badge: string;
  allocations: ETFAllocation[];
  note: string;
}

export interface ETFPortfolioOption {
  id: string;
  name: string;
  tagline: string;
  risk: 'Low' | 'Balanced' | 'Growth' | 'High Growth';
  allocations: ETFAllocation[];
  variants?: ETFPortfolioVariant[];
  note: string;
}

/**
 * 3 Starter ETF Portfolios (2026-2027) built from core ASX index funds:
 * 1. All-in-One Diversified (DHHF / VDHG)
 * 2. Aussie Core + Global (VAS + VGS or A200 + BGBL)
 * 3. Tech / Growth Tilt (VGS + NDQ + QUAL)
 *
 * Model portfolios for education — not financial advice.
 * Live weighted MER, yields, and trailing returns computed live from current reference data.
 */
export const BEST_3_ETF_PORTFOLIOS: ETFPortfolioOption[] = [
  {
    id: 'all-in-one',
    name: 'All-in-One Diversified',
    tagline: 'Single-ticker set-and-forget — ~8,000 global & AU shares with auto-rebalancing',
    risk: 'High Growth',
    allocations: [
      { code: 'DHHF', pct: 100 },
    ],
    variants: [
      {
        id: 'dhhf',
        label: 'DHHF (100% All-Growth Equities)',
        badge: '100% Equities',
        allocations: [{ code: 'DHHF', pct: 100 }],
        note: 'Betashares DHHF is 100% all-equity (zero bonds) across ~8,000 stocks in Australia, US, Developed ex-US, and Emerging markets. Zero manual rebalancing required.',
      },
      {
        id: 'vdhg',
        label: 'VDHG (90% Equities + 10% Bonds)',
        badge: '90/10 High Growth',
        allocations: [{ code: 'VDHG', pct: 100 }],
        note: 'Vanguard VDHG holds 90% Australian and global shares paired with 10% fixed interest/bonds for automated defensive smoothing.',
      },
    ],
    note: 'The pinnacle of hands-off investing: one ticker automatically rebalances thousands of global and Aussie companies for you with zero manual switching.',
  },
  {
    id: 'aussie-core-global',
    name: 'Aussie Core + Global',
    tagline: 'Classic two-fund foundation — Aussie franking credits + worldwide developed growth',
    risk: 'Balanced',
    allocations: [
      { code: 'VAS', pct: 40 },
      { code: 'VGS', pct: 60 },
    ],
    variants: [
      {
        id: 'vas-vgs',
        label: 'Vanguard Core: VAS (40%) + VGS (60%)',
        badge: '0.14% MER',
        allocations: [
          { code: 'VAS', pct: 40 },
          { code: 'VGS', pct: 60 },
        ],
        note: 'Australia’s most battle-tested two-fund core: 40% ASX 300 for franked income, 60% MSCI World for developed global growth.',
      },
      {
        id: 'a200-bgbl',
        label: 'Ultra Low-Fee Core: A200 (30%) + BGBL (70%)',
        badge: '0.07% MER',
        allocations: [
          { code: 'A200', pct: 30 },
          { code: 'BGBL', pct: 70 },
        ],
        note: 'The lowest MER two-fund combination on the ASX: 0.04% for A200 + 0.08% for BGBL gives a remarkable 0.068% weighted fee.',
      },
    ],
    note: 'The definitive DIY backbone for Australian investors: high franked local dividends paired with worldwide international market leaders.',
  },
  {
    id: 'tech-growth',
    name: 'Tech & Growth Tilt',
    tagline: 'Core international backbone boosted with Nasdaq-100 & quality compounders',
    risk: 'High Growth',
    allocations: [
      { code: 'VGS', pct: 50 },
      { code: 'NDQ', pct: 25 },
      { code: 'QUAL', pct: 25 },
    ],
    variants: [
      {
        id: 'vgs-ndq-qual',
        label: 'Global Core + Tech + Quality (50/25/25)',
        badge: 'Growth Tilt',
        allocations: [
          { code: 'VGS', pct: 50 },
          { code: 'NDQ', pct: 25 },
          { code: 'QUAL', pct: 25 },
        ],
        note: 'Blends broad developed-market diversification with high-conviction tilts toward top 100 non-financial US tech giants (NDQ) and global high-ROE quality businesses (QUAL).',
      },
      {
        id: 'vas-vgs-ndq-qual',
        label: '4-Way All-Rounder (VAS 20% / VGS 40% / NDQ 20% / QUAL 20%)',
        badge: '4-Way Mix',
        allocations: [
          { code: 'VAS', pct: 20 },
          { code: 'VGS', pct: 40 },
          { code: 'NDQ', pct: 20 },
          { code: 'QUAL', pct: 20 },
        ],
        note: 'Includes a 20% Australian dividend anchor while tilting 40% into innovation tech and high-ROE factor compounders.',
      },
    ],
    note: 'Optimised for long-horizon accumulators seeking secular growth in AI, technology, and compounding quality companies.',
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
    examples: ['DHHF', 'VGS', 'BGBL', 'IWLD', 'VTS'],
    why: 'The Australian ETF market is now worth ~$346b and the fastest-growing bucket is overseas equities and all-in-one global diversified funds. ~80% of the ASX is banks, miners and consumer staples.',
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

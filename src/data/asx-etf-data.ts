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
    trailing: { '1Y': 14.96, '3Y': 17.84, '5Y': 13.43, '10Y': 14.12 },
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
    trailing: { '1Y': 17.85, '3Y': 15.0, '5Y': 14.13, '10Y': 15.73 },
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
    trailing: { '1Y': 11.35, '3Y': 24.41, '5Y': 17.86, '10Y': 22.45 },
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

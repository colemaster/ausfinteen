/**
 * Cars & Driving — Brisbane, QLD reference data.
 *
 * Sources (verified 5 Sept 2026):
 *  - Queensland Government / TMR (licence fees as at 1 July 2026, licence steps, tests, P1/P2 restrictions)
 *  - AIP weekly petrol/diesel reports + Brisbane retail charts (Aug 2026), RACQ quarterly fuel reports, ACCC price cycles
 *  - Green Vehicle Guide (typical L/100km & kWh/100km)
 *  - Ergon/Energex residential tariffs + QCA (EV charging costs)
 *  - Brisbane City Council (parking zones, meter fees, free parking, council car parks)
 *  - Parkhound / Ray White (off-street daily parking averages)
 *
 * All figures are historical reference data as at Aug–Sept 2026 for education only,
 * NOT live quotes and NOT financial advice. Verify against official sources.
 */

export interface QldLicenceStep {
  stage: string;
  plates: string;
  minAge: number;
  holdTime: string;
  fees: string;
  requirements: string;
  restrictions: string;
}

/** QLD graduated licensing pathway (under-25 driver, the standard teen route) — fees as at 1 July 2026 (qld.gov.au) */
export const QLD_LICENCE_PATH: QldLicenceStep[] = [
  {
    stage: 'Learner (L)',
    plates: 'L plates',
    minAge: 16,
    holdTime: '12 months minimum',
    fees: 'PrepL $29.70 + learner licence $80.15 (3 yrs)',
    requirements: 'Pass PrepL online road rules test at 16. Under 25s complete 100 logbook hours (10 at night) via logbook app, submit 12 business days before test, 3-for-1 instructor bonus max 10 hrs.',
    restrictions: 'Must be supervised by an open-licence driver (1yr open licence), display L plates, 0.00 BAC.',
  },
  {
    stage: 'Provisional P1 (Red P)',
    plates: 'Red P plates',
    minAge: 17,
    holdTime: '12 months',
    fees: 'HPT $42.70 + practical test $69.40 + P1 licence $94.65 (1 yr)',
    requirements: 'Hold Ls 12 months, finish 100 logbook hours, pass hazard perception test + practical driving test (Q-SAFE).',
    restrictions: 'Under 25: total phone ban, max 1 peer passenger 11pm–5am, no high-powered vehicles, 0.00 BAC. No general night-driving curfew (11pm–5am ban only after a demerit suspension).',
  },
  {
    stage: 'Provisional P2 (Green P)',
    plates: 'Green P plates',
    minAge: 18,
    holdTime: '12–24 months (age dependent)',
    fees: 'P2 licence $132.00 (2 yrs) — $94.65 (1 yr) option also available',
    requirements: 'Hold P1 for 12 months with a clean record. No extra test needed.',
    restrictions: 'Hands-free phone OK, no passenger limits, no high-powered vehicles (under 25), 0.00 BAC.',
  },
  {
    stage: 'Open Licence',
    plates: 'No plates',
    minAge: 20,
    holdTime: 'Unrestricted',
    fees: 'Open licence $94.65 (1 yr) / $132.00 (2 yrs) / $163.25 (3 yrs) / $188.95 (4 yrs) / $212.00 (5 yrs)',
    requirements: 'Hold P2 for the required period (min. age 20 for under-25 starters).',
    restrictions: 'Normal road rules apply. No special conditions. GIR 3.4% indexation 2026-27.',
  },
];

export interface QldLicenceFee {
  item: string;
  cost: number; // AUD as at 1 July 2026
  note: string;
}

/** QLD licence test & licence fees as at 1 July 2026 (qld.gov.au/transport/licensing/driver-licensing/fees, ~3.4% indexation; verified 5 Sept 2026) */
export const QLD_LICENCE_FEES: QldLicenceFee[] = [
  { item: 'PrepL online road rules test', cost: 29.70, note: 'Sit at home / online via TMR — 30 Qs, 90% pass' },
  { item: 'Written road rules (knowledge) test', cost: 29.70, note: 'If not doing PrepL' },
  { item: 'Learner licence (3 years)', cost: 80.15, note: 'Issued from age 16, incl. logbook $25.90 if required' },
  { item: 'Replacement learner licence / logbook', cost: 37.40, note: 'Lost / damaged card; logbook replacement $25.90, exemption $51.45' },
  { item: 'Hazard Perception Test (HPT)', cost: 42.70, note: 'Online, valid 12 months, 12-month access after paying' },
  { item: 'Practical driving test (all classes)', cost: 69.40, note: 'Booked through TMR (Q-SAFE); interstate transfer $87.05' },
  { item: 'P1 provisional licence (1 year)', cost: 94.65, note: 'Red P stage — $132.00/2yrs, $163.25/3yrs options' },
  { item: 'P2 provisional licence (2 years)', cost: 132.00, note: 'Green P stage — $94.65/1yr, $188.95/4yrs, $212.00/5yrs options' },
  { item: 'Open licence (1 year)', cost: 94.65, note: 'Full licence; 5-yr $212.00. Fees set by start date of new period, GIR 3.4% 2026-27.' },
];

/** Typical driving lesson cost in South East Queensland (per hour) */
export const QLD_DRIVING_LESSON_RANGE = { min: 65, max: 95 };

/** Typical lessons a new learner books before the practical test */
export const TYPICAL_LESSON_COUNT = 10;

export interface BrisbaneFuelPrice {
  fuel: string;
  pricePerLitre: number; // avg $/L 2026
  note: string;
}

/** Brisbane average retail fuel prices, Aug–Sept 2026 (AIP weekly reports + Brisbane retail chart; RACQ) */
export const BRISBANE_FUEL_PRICES: BrisbaneFuelPrice[] = [
  { fuel: 'E10', pricePerLitre: 1.98, note: 'Cheapest ethanol-blend petrol — ~3–4c below ULP 91' },
  { fuel: 'Unleaded 91', pricePerLitre: 2.02, note: 'Standard regular unleaded petrol (AIP Brisbane avg w/e 16 Aug 2026: 202.2c/L)' },
  { fuel: 'Premium 95', pricePerLitre: 2.16, note: 'For performance engines requiring 95 RON min (+12–15c over 91)' },
  { fuel: 'Premium 98', pricePerLitre: 2.25, note: 'High-octane premium petrol (+20–25c over 91)' },
  { fuel: 'Diesel', pricePerLitre: 2.53, note: 'Late-Aug 2026 spike (AIP Brisbane avg w/e 30 Aug 2026: 252.8c/L) — normally only +5–15c over ULP' },
  { fuel: 'LPG', pricePerLitre: 1.16, note: 'Rare — requires dedicated LPG dual-fuel conversion' },
];

/** Brisbane fuel price cycle: long ~35–45 day "sawtooth" (ACCC 2025 avg 6.5 weeks — longest in Aus; RACQ). Fill up at the trough. */
export const BRISBANE_PRICE_CYCLE = {
  days: 40,
  note: 'Brisbane operates on an extended ~35-to-45 day "sawtooth" price cycle (ACCC 2025 average 6.5 weeks — the longest in Australia). Fill up at the trough or use live fuel apps (FuelRadar, PetrolSpy, RACQ Fair Fuel) to avoid peak pricing.',
};

export interface EvVsPetrolDefaults {
  kmPerYear: number;
  petrolLPer100km: number;
  petrolPricePerLitre: number;
  evKwhPer100km: number;
  homeOffPeakPricePerKwh: number;
  publicFastPricePerKwh: number;
  publicFastSharePct: number; // % of EV charging done at public fast chargers
}

/** Default Sept 2026 assumptions for the EV vs Petrol comparator */
export const EV_VS_PETROL_DEFAULTS: EvVsPetrolDefaults = {
  kmPerYear: 15000,
  petrolLPer100km: 6.5, // typical small hatchback
  petrolPricePerLitre: 2.02, // Brisbane ULP 91 retail avg, Aug 2026 (AIP)
  evKwhPer100km: 16.0, // typical compact EV (Green Vehicle Guide 2026: Atto 3 14.8, Model Y 14.6)
  homeOffPeakPricePerKwh: 0.30, // flat-tariff equivalent; TOU overnight plans run 7–12c/kWh, standard flat 27–30c
  publicFastPricePerKwh: 0.65, // DC public fast charger rate ($/kWh; range 40–85c by speed/network)
  publicFastSharePct: 10, // 90% home charging / 10% public fast charging
};

export interface BrisbaneParkingZone {
  zone: string;
  area: string;
  weekdayHourly: number; // indicative $/hr weekday
  freeAfter7pm: string;
  note: string;
}

/** Brisbane on-street parking zones (Brisbane City Council, meter terms Feb 2026) */
export const BRISBANE_PARKING_ZONES: BrisbaneParkingZone[] = [
  {
    zone: 'Zone 1',
    area: 'Brisbane CBD',
    weekdayHourly: 6.85,
    freeAfter7pm: 'Free Sat & Sun all zones; Mon–Fri only in 4hr+ meters (≤3hr meters paid to midnight)',
    note: 'Most expensive, mostly 2-hour limits. Weeknights 7pm–midnight $3.70/hr; weekends 7am–7pm $3.70/hr.',
  },
  {
    zone: 'Zone 2',
    area: 'City fringe (Spring Hill, Fortitude Valley, South Bank)',
    weekdayHourly: 4.95,
    freeAfter7pm: 'Free Sat & Sun; Mon–Fri only in 4hr+ meters',
    note: 'Cheaper than the CBD, still close to the city. Nights/weekends $3.45/hr in ≤3hr meters.',
  },
  {
    zone: 'Zone 3',
    area: 'Suburbs across Brisbane',
    weekdayHourly: 3.45,
    freeAfter7pm: 'Free after 7pm all week (to 10pm) + Sat/Sun',
    note: 'Cheapest on-street rates. Great for park-and-ride. Check every sign — fines are $90+.',
  },
];

/** Free parking golden rules (Brisbane City Council) */
export const BRISBANE_FREE_PARKING_TIPS = [
  'Free 15-minute parking in 7,500+ on-street spaces — just register at the meter or PayStay app.',
  'Free after 7pm: Saturday & Sunday in all zones; Mon–Fri in Zone 1 & 2 where the limit is 4 hours or more.',
  'Zone 3 (suburbs) is free after 7pm Monday–Friday in all metered areas.',
  'Check every sign — rules differ per meter and fines are steep ($90+).',
];

/** Indicative off-street (car park) daily rates in the Brisbane CBD (Parkhound / Ray White 2026) */
export const BRISBANE_OFFSTREET_PARKING = {
  dailyMax: '$78–83',
  note: 'Brisbane CBD private operators (Secure, Wilson) charge Australia\'s most expensive drive-up daily parking (~$79.83/day average). Council car parks are far cheaper (max ~$49 to 6pm).',
  councilCarParks: 'King George Square: early bird $28, max $49 to 6pm ($64 overnight). Wickham Terrace: early bird $26, max $49 ($55 overnight), evenings after 4pm $6 flat, weekends $6 flat. 15 min free in both.',
};

/**
 * Cars & Driving — Brisbane, QLD reference data.
 *
 * Sources (2026):
 *  - Queensland Government / TMR (licence fees as at 1 July 2026, licence steps, tests, P1/P2 restrictions)
 *  - FuelPrice Australia / RACQ / AIP (Brisbane retail fuel averages, late July 2026)
 *  - Green Vehicle Guide (typical L/100km & kWh/100km)
 *  - AEMO (residential electricity tariffs) & Electric Vehicle Council (EV charging costs)
 *  - Brisbane City Council (parking zones, meter fees, free parking, council car parks)
 *  - Parkhound / Ray White (off-street daily parking averages)
 *
 * All figures are historical reference data as at mid-2026 for education only,
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

/** QLD graduated licensing pathway (under-25 driver, the standard teen route) */
export const QLD_LICENCE_PATH: QldLicenceStep[] = [
  {
    stage: 'Learner (L)',
    plates: 'L plates',
    minAge: 16,
    holdTime: '12 months minimum',
    fees: 'PrepL $29.70 + learner licence $80.15 (3 yrs)',
    requirements: 'Pass PrepL online road rules test at 16. Under 25s complete 100 logbook hours (10 at night).',
    restrictions: 'Must be supervised by an open-licence driver, display L plates, 0.00 blood alcohol.',
  },
  {
    stage: 'Provisional P1 (Red P)',
    plates: 'Red P plates',
    minAge: 17,
    holdTime: '12 months',
    fees: 'HPT $42.70 + practical test $69.40 + P1 licence $94.65 (1 yr)',
    requirements: 'Hold Ls 12 months, finish 100 logbook hours, pass hazard perception test + practical driving test.',
    restrictions: 'Under 25: total phone ban, max 1 peer passenger 11pm–5am, no high-powered vehicles, 0.00 BAC.',
  },
  {
    stage: 'Provisional P2 (Green P)',
    plates: 'Green P plates',
    minAge: 18,
    holdTime: '12–24 months (age dependent)',
    fees: 'P2 licence $132.00 (2 yrs)',
    requirements: 'Hold P1 for 12 months with a clean record. No extra test needed.',
    restrictions: 'Hands-free phone OK, no passenger limits, no high-powered vehicles (under 25), 0.00 BAC.',
  },
  {
    stage: 'Open Licence',
    plates: 'No plates',
    minAge: 20,
    holdTime: 'Unrestricted',
    fees: 'Open licence $94.65 (1 yr) onwards',
    requirements: 'Hold P2 for the required period (min. age 20 for under-25 starters).',
    restrictions: 'Normal road rules apply. No special conditions.',
  },
];

export interface QldLicenceFee {
  item: string;
  cost: number; // AUD as at 1 July 2026
  note: string;
}

/** QLD licence test & licence fees as at 1 July 2026 (qld.gov.au) */
export const QLD_LICENCE_FEES: QldLicenceFee[] = [
  { item: 'PrepL online road rules test', cost: 29.70, note: 'Sit at home / online via TMR' },
  { item: 'Written road rules (knowledge) test', cost: 29.70, note: 'If not doing PrepL' },
  { item: 'Learner licence (3 years)', cost: 80.15, note: 'Issued from age 16' },
  { item: 'Replacement learner licence', cost: 37.40, note: 'Lost / damaged card' },
  { item: 'Hazard Perception Test (HPT)', cost: 42.70, note: 'Online, valid 12 months' },
  { item: 'Practical driving test (all classes)', cost: 69.40, note: 'Booked through TMR' },
  { item: 'P1 provisional licence (1 year)', cost: 94.65, note: 'Red P stage' },
  { item: 'P2 provisional licence (2 years)', cost: 132.00, note: 'Green P stage' },
  { item: 'Open licence (1 year)', cost: 94.65, note: 'Full licence' },
];

/** Typical driving lesson cost in South East Queensland (per hour) */
export const QLD_DRIVING_LESSON_RANGE = { min: 60, max: 90 };

/** Typical lessons a new learner books before the practical test */
export const TYPICAL_LESSON_COUNT = 10;

export interface BrisbaneFuelPrice {
  fuel: string;
  pricePerLitre: number; // avg $/L late July 2026
  note: string;
}

/** Brisbane average retail fuel prices, late July 2026 (FuelPrice Australia / RACQ) */
export const BRISBANE_FUEL_PRICES: BrisbaneFuelPrice[] = [
  { fuel: 'E10', pricePerLitre: 1.94, note: 'Cheapest petrol — most cars can run it' },
  { fuel: 'Unleaded 91', pricePerLitre: 1.96, note: 'Standard petrol' },
  { fuel: 'Premium 95', pricePerLitre: 2.14, note: 'For engines that need 95+' },
  { fuel: 'Premium 98', pricePerLitre: 2.21, note: 'High-performance engines' },
  { fuel: 'Diesel', pricePerLitre: 2.37, note: 'Mostly 4WDs & vans' },
  { fuel: 'LPG', pricePerLitre: 1.15, note: 'Rare — needs an LPG conversion' },
];

/** Brisbane fuel price cycle: prices swing over ~23 days (RACQ / FuelPrice Australia) */
export const BRISBANE_PRICE_CYCLE = {
  days: 23,
  note: 'Fill up just after the price peak drops — stations undercut each other for a few days.',
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

/** Default 2026 assumptions for the EV vs Petrol comparator */
export const EV_VS_PETROL_DEFAULTS: EvVsPetrolDefaults = {
  kmPerYear: 15000,
  petrolLPer100km: 6.5, // typical small hatch
  petrolPricePerLitre: 1.96, // Brisbane ULP 91 avg
  evKwhPer100km: 16, // typical EV (Green Vehicle Guide)
  homeOffPeakPricePerKwh: 0.30, // QLD residential off-peak
  publicFastPricePerKwh: 0.65, // DC fast charger rate
  publicFastSharePct: 10, // most charging done at home
};

export interface BrisbaneParkingZone {
  zone: string;
  area: string;
  weekdayHourly: number; // indicative $/hr weekday
  freeAfter7pm: string;
  note: string;
}

/** Brisbane on-street parking zones (Brisbane City Council) */
export const BRISBANE_PARKING_ZONES: BrisbaneParkingZone[] = [
  {
    zone: 'Zone 1',
    area: 'Brisbane CBD',
    weekdayHourly: 6.85,
    freeAfter7pm: 'Free Sat & Sun all zones; Mon–Fri in 4hr+ meters',
    note: 'Most expensive, mostly 2-hour limits. Shortest stays.',
  },
  {
    zone: 'Zone 2',
    area: 'City fringe (Spring Hill, Fortitude Valley, South Bank)',
    weekdayHourly: 4.95,
    freeAfter7pm: 'Free Sat & Sun; Mon–Fri in 4hr+ meters',
    note: 'Cheaper than the CBD, still close to the city.',
  },
  {
    zone: 'Zone 3',
    area: 'Suburbs across Brisbane',
    weekdayHourly: 3.45,
    freeAfter7pm: 'Free after 7pm all week + Sat/Sun',
    note: 'Cheapest on-street rates. Great for park-and-ride.',
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
  note: 'Brisbane CBD now has Australia\'s most expensive daily parking (~$79.83/day average).',
  councilCarParks: 'King George Square & Wickham Terrace: 15 min free, early bird ~$26–28, night rates ~$10–15.',
};

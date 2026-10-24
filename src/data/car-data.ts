/**
 * Cars & Driving — Brisbane, QLD reference data.
 *
 * Verified 18 October 2026 against:
 *  - Queensland Government / TMR (qld.gov.au): licence fees (1 July 2026 schedule),
 *    graduated licensing steps, registration fees & CTP (1 Oct 2026 schedule)
 *  - Brisbane City Council (brisbane.qld.gov.au): parking zones, meter terms, free parking
 *  - Fuel: Brisbane daily averages (FuelRadar, Fuel Daddy, fuelprice.io), BP terminal gate
 *    prices (17 Oct 2026), RACQ quarterly reports, ACCC price-cycle reporting
 *  - AER Default Market Offer 2026-27 (Energex residential tariff) for EV home charging
 *  - Green Vehicle Guide (typical L/100km & kWh/100km)
 *  - RACQ / iSelect (roadside assistance, under-25 insurance, running costs)
 *
 * All figures are historical reference data as at 18 Oct 2026 for education only,
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

/** QLD graduated licensing pathway (under-25 driver, the standard teen route) — fees as at 1 July 2026 (qld.gov.au, verified 18 Oct 2026) */
export const QLD_LICENCE_PATH: QldLicenceStep[] = [
  {
    stage: 'Learner (L)',
    plates: 'L plates',
    minAge: 16,
    holdTime: '12 months minimum',
    fees: 'PrepL $29.70 + learner licence $80.15 (3 yrs)',
    requirements: 'Pass the PrepL online road rules test at 16. Under 25s complete 100 logbook hours (10 at night) via the logbook app and lodge it 12+ business days before the test. Up to 10 hours of professional lessons count 3-for-1 (max 30 logbook hours).',
    restrictions: 'Must be supervised by a driver with an open licence (held 1+ year), display L plates, 0.00 BAC.',
  },
  {
    stage: 'Provisional P1 (Red P)',
    plates: 'Red P plates',
    minAge: 17,
    holdTime: '12 months',
    fees: 'HPT $42.70 + practical test $69.40 + P1 licence $94.65 (1 yr)',
    requirements: 'Hold Ls 12 months and finish 100 logbook hours. Sit the Hazard Perception Test (available after 6 months on Ls, valid 12 months) then the Q-SAFE practical driving test.',
    restrictions: 'Under 25: no mobile-phone use at all (even hands-free), no more than 1 passenger under 21 (other than immediate family) 11pm–5am, no high-powered vehicles (power-to-weight >130kW/t for cars built from 1 Jan 2010), 0.00 BAC. No general night curfew — an 11pm–5am ban applies only after a demerit suspension.',
  },
  {
    stage: 'Provisional P2 (Green P)',
    plates: 'Green P plates',
    minAge: 18,
    holdTime: '2 years if issued before 25',
    fees: 'P2 licence $132.00 (2 yrs) — $94.65 (1 yr) option also available',
    requirements: 'Hold P1 for 12 months with a clean record. No extra test needed.',
    restrictions: 'Hands-free phone OK (no hand-held), no passenger limits, no high-powered vehicles (under 25), 0.00 BAC.',
  },
  {
    stage: 'Open Licence',
    plates: 'No plates',
    minAge: 20,
    holdTime: 'Unrestricted',
    fees: 'Open licence $94.65 (1 yr) / $132.00 (2 yrs) / $163.25 (3 yrs) / $188.95 (4 yrs) / $212.00 (5 yrs)',
    requirements: 'Hold P2 for the required period (minimum open-licence age 20 for under-25 starters; 1 year if P2 was issued at 25+).',
    restrictions: 'Normal road rules apply. No special conditions. Renewal fees indexed annually — schedule as at 1 July 2026.',
  },
];

export interface QldLicenceFee {
  item: string;
  cost: number; // AUD as at 1 July 2026
  note: string;
}

/** QLD licence test & licence fees as at 1 July 2026 (qld.gov.au/transport/licensing/driver-licensing/fees; verified 18 Oct 2026) */
export const QLD_LICENCE_FEES: QldLicenceFee[] = [
  { item: 'PrepL online road rules test', cost: 29.70, note: 'Sit online from age 15y11m — 30 questions, 90% to pass' },
  { item: 'Written road rules (knowledge) test', cost: 29.70, note: 'In-person alternative to PrepL' },
  { item: 'Learner licence (3 years)', cost: 80.15, note: 'Issued from age 16 with photo card' },
  { item: 'Replacement learner licence / logbook', cost: 37.40, note: 'Replacement card $37.40; logbook $25.90; logbook exemption $51.45; high-powered vehicle exemption application $51.45' },
  { item: 'Hazard Perception Test (HPT)', cost: 42.70, note: 'Available after 6 months on Ls; result valid 12 months' },
  { item: 'Practical driving test (all classes)', cost: 69.40, note: 'Q-SAFE on-road test, booked through TMR' },
  { item: 'P1 provisional licence (1 year)', cost: 94.65, note: 'Red P stage — $132.00 (2 yrs) and $163.25 (3 yrs) options' },
  { item: 'P2 provisional licence (2 years)', cost: 132.00, note: 'Green P stage — $94.65 (1 yr), $188.95 (4 yrs) and $212.00 (5 yrs) options' },
  { item: 'Open licence (1 year)', cost: 94.65, note: 'Full licence — 5-yr $212.00. Fee set by licence period; schedule as at 1 July 2026' },
];

/** QLD light-vehicle registration & CTP cost components (qld.gov.au/transport/registration/fees/cost — fees as at 1 Oct 2026) */
export const QLD_REGO_CTP_COSTS = {
  registrationFourCylinder: 385.45,
  registrationEvOrUpToThreeCylinders: 303.10,
  trafficImprovementFee: 67.25,
  ctpClass1Min: 411.80,
  ctpClass1Max: 427.80,
  transferFee: 33.65,
  latePaymentFee: 76.65,
};

/** Typical driving lesson cost in South East Queensland (per hour), Oct 2026 — most schools $75–$90/hr (median ~$85); 10-lesson blocks from ~$850 (drivingschoolnearme.com.au) */
export const QLD_DRIVING_LESSON_RANGE = { min: 75, max: 95 };

/** Typical lessons a new learner books before the practical test (~10-lesson blocks ≈ $850) */
export const TYPICAL_LESSON_COUNT = 10;

export interface FirstCarCostDefaults {
  averagePurchasePrice: number;
  regoAnnual: number;
  ctpAnnual: number;
  comprehensiveInsuranceUnder25: number;
  servicingAnnual: number;
  tiresAndRepairsAnnual: number;
  fuelWeekly: number;
  roadsideAssistanceAnnual: number;
}

/**
 * First-car running-cost defaults for QLD under-25 drivers (Oct 2026) — the single
 * source of truth for the teen-car calculator defaults (moved out of teen-finance-data.ts).
 */
export const FIRST_CAR_COST_DEFAULTS: FirstCarCostDefaults = {
  averagePurchasePrice: 4500, // typical teen first-car budget (used small hatch)
  regoAnnual:
    QLD_REGO_CTP_COSTS.registrationFourCylinder + QLD_REGO_CTP_COSTS.trafficImprovementFee, // $452.70 (4-cyl, excl. CTP)
  ctpAnnual: (QLD_REGO_CTP_COSTS.ctpClass1Min + QLD_REGO_CTP_COSTS.ctpClass1Max) / 2, // $419.80 (midpoint of Class 1 CTP)
  comprehensiveInsuranceUnder25: 1650, // under-25 comprehensive quotes $1,532–$2,178 (iSelect, Oct 2026)
  servicingAnnual: 450, // annual logbook service + fluid changes for a used hatch
  tiresAndRepairsAnnual: 350, // tyres amortised over life + minor repairs
  fuelWeekly: 50, // ~15,000 km/yr @ 7.0L/100km @ $2.38/L ULP 91 ≈ $49.66/wk (Oct 2026)
  roadsideAssistanceAnnual: 109, // RACQ Everyday roadside assistance (racq.com.au, Oct 2026)
};

export interface BrisbaneFuelPrice {
  fuel: string;
  pricePerLitre: number; // avg $/L 2026
  note: string;
}

/** Brisbane average retail fuel prices, mid-Oct 2026 (FuelRadar & Fuel Daddy dailies; BP terminal gate prices 17 Oct 2026; RACQ quarterly) */
export const BRISBANE_FUEL_PRICES: BrisbaneFuelPrice[] = [
  { fuel: 'E10', pricePerLitre: 2.34, note: 'Cheapest ethanol blend — usually 2–5c under ULP 91 (BP Brisbane terminal 17 Oct 2026: 225.3c vs 228.9c)' },
  { fuel: 'Unleaded 91', pricePerLitre: 2.38, note: 'Brisbane daily average 237.7c on 18 Oct 2026 (FuelRadar); RACQ Sept-quarter avg 199.2c — the gap is the long price cycle' },
  { fuel: 'Premium 95', pricePerLitre: 2.50, note: 'For engines requiring 95 RON min — ~12–15c over 91 (Fuel Daddy Brisbane avg U95: 255.0c, 5–18 Oct 2026)' },
  { fuel: 'Premium 98', pricePerLitre: 2.63, note: 'Brisbane ULP 98 average $2.63/L on 18 Oct 2026 (fuelprice.io)' },
  { fuel: 'Diesel', pricePerLitre: 2.66, note: 'Brisbane diesel ~265.5c on 18 Oct 2026 (FuelRadar) — well above the RACQ Sept-quarter average of 242c' },
  { fuel: 'LPG', pricePerLitre: 1.15, note: 'Australia average ~115c/L (Oct 2026) — scarce; needs an LPG/dedicated-gas car or conversion' },
];

/** Brisbane fuel price cycle — historically a long ~6.5-week "sawtooth" (ACCC), but regular cycles have been largely absent since Feb 2026. Fill at the trough or use live fuel apps. */
export const BRISBANE_PRICE_CYCLE = {
  days: 45,
  note: 'Brisbane historically runs an extended ~6.5-week "sawtooth" price cycle (ACCC — among the longest in Australia), but regular cycles have been largely absent since Feb 2026: prices instead drifted from a trough of ~176.5c/L (21 Jul) to a high of ~239.9c/L (13 Oct 2026). Use live fuel apps (FuelRadar, PetrolSpy, RACQ Fair Fuel) to find today\'s cheapest.',
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

/** Default Oct 2026 assumptions for the EV vs Petrol comparator */
export const EV_VS_PETROL_DEFAULTS: EvVsPetrolDefaults = {
  kmPerYear: 15000,
  petrolLPer100km: 6.5, // typical small hatchback
  petrolPricePerLitre: 2.38, // Brisbane ULP 91 daily avg 237.7c/L, 18 Oct 2026 (FuelRadar)
  evKwhPer100km: 16.0, // typical compact EV (Green Vehicle Guide: BYD Atto 3 WLTP 16.0)
  homeOffPeakPricePerKwh: 0.28, // AER Default Market Offer 2026-27: Energex flat residential 27.97c/kWh (TOU overnight windows can be lower)
  publicFastPricePerKwh: 0.65, // DC public fast charging ~40–85c/kWh; ~60c at Evie/Chargefox 50–150kW hubs (Oct 2026)
  publicFastSharePct: 10, // 90% home charging / 10% public fast charging
};

export interface BrisbaneParkingZone {
  zone: string;
  area: string;
  weekdayHourly: number; // indicative $/hr weekday
  freeAfter7pm: string;
  note: string;
}

/** Brisbane on-street parking zones (Brisbane City Council rates as at Oct 2026) */
export const BRISBANE_PARKING_ZONES: BrisbaneParkingZone[] = [
  {
    zone: 'Zone 1',
    area: 'Brisbane CBD',
    weekdayHourly: 6.85,
    freeAfter7pm: 'Free all day Sat & Sun; Mon–Fri free after 7pm only in 4hr+ meters (≤3hr meters paid to midnight)',
    note: 'Most expensive, mostly 2-hour limits. Evening/weekend rate $3.70/hr; 4hr+ meters discounted to $4.50/hr (capped $18.25/day).',
  },
  {
    zone: 'Zone 2',
    area: 'City fringe (Spring Hill, Fortitude Valley, South Bank)',
    weekdayHourly: 4.95,
    freeAfter7pm: 'Free all day Sat & Sun; Mon–Fri free after 7pm only in 4hr+ meters',
    note: 'Cheaper than the CBD, still close to the city. Nights/weekends $3.45/hr; 4hr+ meters capped $16.75 weekday / $10.75 other times.',
  },
  {
    zone: 'Zone 3',
    area: 'Suburbs across Brisbane',
    weekdayHourly: 3.45,
    freeAfter7pm: 'Free after 7pm all week (metered until 10pm) + all day Sat/Sun',
    note: 'Cheapest on-street rates, metered 7am–10pm weekdays. 4hr+ meters discounted to $2.45/hr (capped $13.25). Check every sign — fines are $90+.',
  },
];

/** Free parking golden rules (Brisbane City Council) */
export const BRISBANE_FREE_PARKING_TIPS = [
  'Free 15-minute parking in 7,500+ on-street spaces — just register at the meter or in the PayStay app.',
  'Free all day Saturday & Sunday in all zones; free after 7pm Mon–Fri in Zone 1 & 2 where the limit is 4 hours or more.',
  'Zone 3 (suburbs) is free after 7pm every weeknight in all metered areas.',
  'Check every sign — rules differ per meter and fines are steep ($90+).',
];

/** Indicative off-street (car park) daily rates in the Brisbane CBD (Parkhound / Ray White 2026) */
export const BRISBANE_OFFSTREET_PARKING = {
  dailyMax: '$78–83',
  note: 'Brisbane CBD private operators (Secure, Wilson) charge Australia\'s most expensive drive-up daily parking (~$79.83/day average). Council car parks are far cheaper (max ~$49 to 6pm).',
  councilCarParks: 'King George Square: early bird $28, max $49 to 6pm ($64 overnight). Wickham Terrace: early bird $26, max $49 ($55 overnight), evenings after 4pm $6 flat, weekends $6 flat. 15 min free in both.',
};

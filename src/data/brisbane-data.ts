/**
 * Brisbane, QLD — reference data for the "Brisbane, QLD" location module.
 *
 * Sources (2026):
 *  - CoreLogic / SQM Research / ProperEasy (Brisbane median rents, early 2026)
 *  - Student Accommodation Council National Survey 2026 (median shared rent $286/wk within 5km of CBD)
 *  - amberstudent.com / studyau.au student cost-of-living guides (2026)
 *  - TransLink (concession Go Card fares & weekly caps)
 *  - Queensland Revenue Office (First Home Owner Grant $30k, transfer duty concessions)
 *  - RTA Queensland (4-week max bond, no rent threshold since 30 Sep 2024)
 *  - StudyAssist / UQ / QUT / Griffith (CSP fee bands, guaranteed ATAR)
 *  - QLD TMR / MAIC (rego = registration + traffic improvement fee + CTP)
 *
 * All figures are historical reference data as at mid-2026 for education only,
 * NOT live quotes and NOT financial advice. Verify against official sources.
 */

export interface BudgetItem {
  category: string;
  emoji: string;
  weekly: number; // weekly cost in AUD
  note: string;
}

/** Typical weekly living costs for a student / young adult in Brisbane (sharehouse) */
export const BRISBANE_WEEKLY_BUDGET: BudgetItem[] = [
  { category: 'Rent (sharehouse room)', emoji: '🏠', weekly: 280, note: 'Median shared room within 5km of CBD ≈ $286/wk (2026)' },
  { category: 'Groceries & food', emoji: '🛒', weekly: 100, note: 'Aldi/Woolies deals; West End & Rocklea markets' },
  { category: 'Public transport (concession Go Card)', emoji: '🚌', weekly: 25, note: 'Weekly student cap ≈ $25' },
  { category: 'Phone + internet', emoji: '📱', weekly: 15, note: 'Budget SIM plans from $15/mo' },
  { category: 'Utilities (electricity, water, gas share)', emoji: '💡', weekly: 25, note: 'Split between sharehouse housemates' },
  { category: 'Eating out & coffee', emoji: '☕', weekly: 50, note: 'Lunch $15-25, coffee $4-6' },
  { category: 'Entertainment & misc', emoji: '🎬', weekly: 35, note: 'South Bank, uni clubs, free events' },
];

export const BRISBANE_BUDGET_TOTAL_WEEKLY = BRISBANE_WEEKLY_BUDGET.reduce((s, i) => s + i.weekly, 0);

export interface BrisbaneUni {
  code: string;
  name: string;
  campuses: string;
  strength: string;
  cspBand: string; // typical annual student contribution for a CSP
  atar: string; // typical guaranteed ATAR range
  scholarships: string;
  url: string;
}

/** Main Brisbane tertiary institutions for school leavers */
export const BRISBANE_UNIS: BrisbaneUni[] = [
  {
    code: 'UQ',
    name: 'University of Queensland',
    campuses: 'St Lucia (main) + Herston, Gatton',
    strength: 'Australia\'s top research university — law, medicine, engineering, science.',
    cspBand: '≈ $9,690–$16,030/yr',
    atar: '72–99.5 (varies by degree)',
    scholarships: 'Academic excellence & equity scholarships',
    url: 'https://study.uq.edu.au',
  },
  {
    code: 'QUT',
    name: 'Queensland University of Technology',
    campuses: 'Gardens Point + Kelvin Grove (both inner-city)',
    strength: 'Real-world, industry-linked degrees — nursing, business, IT, creative industries.',
    cspBand: '≈ $9,314–$16,992/yr',
    atar: '70–85 (varies by degree)',
    scholarships: 'Vice-Chancellor\'s scholarships & equity support',
    url: 'https://www.qut.edu.au/study',
  },
  {
    code: 'GRIFFITH',
    name: 'Griffith University',
    campuses: 'Nathan + South Bank (Brisbane), plus Gold Coast & Logan',
    strength: 'Great practical degrees — health, music/arts (South Bank), business, science.',
    cspBand: '≈ $9,314–$16,992/yr',
    atar: '68–88 (varies by degree)',
    scholarships: 'Griffith Remarkable & equity scholarships',
    url: 'https://www.griffith.edu.au/study',
  },
  {
    code: 'TAFE',
    name: 'TAFE Queensland',
    campuses: 'South Bank, Kangaroo Point, Mt Gravatt + across QLD',
    strength: 'Hands-on diplomas, certificates & apprenticeships — cheaper, faster, job-ready.',
    cspBand: 'From ~$0 (some) – $5,000/yr',
    atar: 'No ATAR required',
    scholarships: 'Concession & VET Student Loans',
    url: 'https://tafeqld.edu.au',
  },
];

/** HECS-HELP student contribution fee bands (2026, per StudyAssist) */
export const HECS_BANDS_2026 = [
  { band: 'Band 1 — Humanities, education', fee: 4627, label: '≈ $4,627/yr' },
  { band: 'Band 2 — Science, engineering, health', fee: 9314, label: '≈ $9,314/yr' },
  { band: 'Band 3 — Law, commerce, arts', fee: 16992, label: '≈ $16,992/yr' },
  { band: 'Medicine, dentistry, veterinary', fee: 13241, label: '≈ $13,241/yr' },
];

/** Median weekly rents by Brisbane suburb (early 2026) */
export interface SuburbRent {
  suburb: string;
  sharedWeekly: string; // room in sharehouse
  unitWeekly: string; // 1-2 bed unit median
  commute: string;
  vibe: string;
}

export const BRISBANE_SUBURBS: SuburbRent[] = [
  { suburb: 'St Lucia', sharedWeekly: '$350–500', unitWeekly: '$550+', commute: 'Bus/ferry 15 min', vibe: 'UQ student hub' },
  { suburb: 'Toowong', sharedWeekly: '$280–400', unitWeekly: '$480–620', commute: 'Train 10 min', vibe: 'Convenient, safe' },
  { suburb: 'South Bank / West End', sharedWeekly: '$380–520', unitWeekly: '$650–700', commute: 'Walk/bus 10 min', vibe: 'Trendy, riverside' },
  { suburb: 'Fortitude Valley', sharedWeekly: '$400–600', unitWeekly: '$600+', commute: 'Train 5 min', vibe: 'Nightlife district' },
  { suburb: 'Indooroopilly', sharedWeekly: '$280–400', unitWeekly: '$470–580', commute: 'Train 20 min', vibe: 'Affordable, family-friendly' },
  { suburb: 'Chermside', sharedWeekly: '$250–350', unitWeekly: '$420–520', commute: 'Bus 30 min', vibe: 'Suburban value' },
  { suburb: 'Kelvin Grove', sharedWeekly: '$330–450', unitWeekly: '$520+', commute: 'Bus 15 min', vibe: 'QUT creative campus' },
  { suburb: 'Annerley', sharedWeekly: '$240–350', unitWeekly: '$430–520', commute: 'Bus 25 min', vibe: 'Budget south-side option' },
];

/** QLD first home buyer help (2026) */
export const QLD_FIRST_HOME_HELP = [
  { name: 'First Home Owner Grant', amount: '$30,000', note: 'New homes under $750,000 (contracts from 1 July 2026)' },
  { name: 'First Home Transfer Duty Concession', amount: 'Up to 100% off', note: 'Full or partial stamp duty reduction on your first home' },
  { name: 'Boost to Buy shared equity', amount: 'Gov up to 30%', note: '2% deposit; government co-invests on new homes' },
  { name: 'First Home Guarantee', amount: '5% deposit', note: 'Federal scheme — no LMI with just 5% down' },
];

/** QLD teen-specific state rules */
export interface QLDRule {
  title: string;
  emoji: string;
  detail: string;
}

export const QLD_TEEN_RULES: QLDRule[] = [
  {
    title: 'Rental bond = max 4 weeks',
    emoji: '🔑',
    detail: 'In Queensland your bond is capped at 4 weeks rent (no rent threshold since Sep 2024). The agent must lodge it with the RTA within 10 days.',
  },
  {
    title: 'Concession Go Card = 50% off',
    emoji: '🚌',
    detail: 'Full-time students get a concession Go Card: half-price fares, a weekly fare cap (~$25), free transfers within 1 hour, and travel-free after 9 paid journeys per week.',
  },
  {
    title: 'QLD rego = 3 parts',
    emoji: '🚗',
    detail: 'Queensland rego combines the registration fee, traffic improvement fee, and CTP insurance. CTP is priced on your car class (not your age) — QLD has the lowest CTP in mainland Australia.',
  },
  {
    title: 'Learner licence from 16',
    emoji: '🪪',
    detail: 'You can get your Ls at 16 in Queensland (no log-book hour requirement, unlike some states). Hold Ls for 12 months, then pass the driving test for your P1.',
  },
  {
    title: 'Super for under 18s',
    emoji: '⭐️',
    detail: 'Same ATO rule nationwide: under 18, employers must pay 12% super only if you work more than 30 hours in a calendar week. Over 18, super is on all hours.',
  },
  {
    title: 'Public holidays',
    emoji: '🎉',
    detail: 'QLD public holidays (Easter, Ekka Show Day in August, Christmas) earn penalty rates of +125% to +150% for casuals — a great weekend pay boost.',
  },
];

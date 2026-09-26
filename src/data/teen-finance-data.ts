/**
 * Official Australian Teen Financial Reference Data (2026-27)
 * Sources: ATO, Fair Work Ombudsman, Moneysmart, Services Australia, APRA, ACCC, PPSR, SafeWork Australia, RTBA, RBO, RTA, RACQ
 */

export { type WebLink, STATUTORY_LINKS as OFFICIAL_WEB_LINKS, STATUTORY_LINKS } from "./statutory-links";

export interface AgePreset {
  age: number;
  label: string;
  jobTitle: string;
  hourlyRate: number;
  hoursPerWeek: number;
  claimsTaxFreeThreshold: boolean;
  savingsGoalName: string;
  savingsGoalTarget: number;
  currentSavings: number;
}

/**
 * Age presets use the 2026-27 effective junior award rate for the worker's
 * age band (Fast Food / Retail Level 1 adult base $27.81/hr from 1 July 2026,
 * junior % applied: under 16 = 40%, 16 = 50%, 17 = 60%, 18 = 70%).
 * Note: from 1 December 2026 the FWC ([2026] FWCFB 75) phases 18-20s up to
 * the full adult rate after 6 months with the same employer (Retail, Fast
 * Food & Pharmacy awards). Under-18 rates are unchanged.
 */
export const AGE_PRESETS: Record<number, AgePreset> = {
  15: {
    age: 15,
    label: '15yo First Job',
    jobTitle: 'Fast Food / Retail Junior (Casual)',
    hourlyRate: 13.90, // $11.12 base + 25% casual loading ($13.90/hr)
    hoursPerWeek: 8,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Mojo Safety Buffer ($500)',
    savingsGoalTarget: 500,
    currentSavings: 150,
  },
  16: {
    age: 16,
    label: '16yo Part-Timer',
    jobTitle: 'Supermarket Service Assistant',
    hourlyRate: 17.39, // $13.91 base + 25% casual loading ($17.39/hr)
    hoursPerWeek: 12,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Car Deposit & Driving Lessons',
    savingsGoalTarget: 3500,
    currentSavings: 850,
  },
  17: {
    age: 17,
    label: '17yo Senior Student',
    jobTitle: 'Cafe / Bakery Front-of-House',
    hourlyRate: 20.86, // $16.69 base + 25% casual loading ($20.86/hr)
    hoursPerWeek: 15,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Car Rego, CTP & Insurance Sinking Fund',
    savingsGoalTarget: 4500,
    currentSavings: 1800,
  },
  18: {
    age: 18,
    label: '18yo School Leaver',
    jobTitle: 'Junior Sports Referee / Retail Level 1',
    hourlyRate: 24.34, // $19.47 base + 25% casual loading ($24.34/hr, moves to $34.76 after 6mo per FWCFB 75)
    hoursPerWeek: 20,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Emergency Buffer ($2,000) & Index ETFs',
    savingsGoalTarget: 6000,
    currentSavings: 3200,
  },
  19: {
    age: 19,
    label: '19yo Uni / TAFE Student',
    jobTitle: 'Customer Service & Admin Team',
    hourlyRate: 27.81, // $22.25 base + 25% casual loading ($27.81/hr)
    hoursPerWeek: 22,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Uni Laptop, Textbooks & Rental Bond Fund',
    savingsGoalTarget: 8000,
    currentSavings: 4500,
  },
  20: {
    age: 20,
    label: '20yo Young Adult',
    jobTitle: 'Shift Supervisor / Department Coordinator',
    hourlyRate: 34.76, // $27.81 adult base + 25% casual loading ($34.76/hr)
    hoursPerWeek: 28,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Home Deposit & ETF Portfolio',
    savingsGoalTarget: 15000,
    currentSavings: 7800,
  },
};

/**
 * ATO Division 6AA Minor Unearned Income Tax Rates (FY 2024–27).
 * Source: ATO — ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old
 */
export const MINOR_UNEARNED_TAX_RATES = {
  taxFreeLimit: 416,
  threshold66: 1307,
  shadeInRate: 0.66,
  topRate: 0.45,
} as const;

/**
 * Centrelink Youth Allowance & Student Assistance Rates (Jan 2026 indexation = Sept 2026 current; source: Services Australia).
 * Student personal income test: $539/fn free, then 50c per $ ($539–$646) and 60c above $646.
 * Verified 5 Sept 2026.
 */
export const CENTRELINK_YOUTH_ALLOWANCE_RATES = {
  singleUnder18AtHome: 418.90,
  single18PlusAtHome: 482.40,
  singleAwayFromHome: 677.20,
  incomeFreeFortnight: 539,
  incomeTaperUpperFortnight: 646,
  taperRateLow: 0.50,
  taperRateHigh: 0.60,
  studentStartUpLoan: 1349,
  abstudyAwayFromHome: 677.20,
  abstudyAway22Plus: 799.70,
  incomeBankCap: 13500,
  parentalIncomeFree: 66722,
} as const;


/**
 * Junior Award Percentage Rates under Modern Awards (2026-27).
 * Adult base rates reflect the 2026-27 Fair Work Commission Annual Wage Review (from 1 July 2026).
 * From 1 December 2026 the FWC ([2026] FWCFB 75) phases 18-20s up to the full adult rate
 * after 6 months with the same employer (Retail, Fast Food & Pharmacy awards). Under-18 rates are unchanged.
 */
export const JUNIOR_AWARD_RATES = {
  fast_food: {
    code: 'MA000003',
    name: 'Fast Food Industry Award 2020 [MA000003]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $11.12/hr (Casual: $13.90/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months with employer)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: '3-hour minimum shift for casuals. 25% casual loading. Saturday: 125% perm / 150% casual; Sunday Level 1: 150%; Public Holiday: 250% casual.',
  },
  retail: {
    code: 'MA000004',
    name: 'General Retail Industry Award 2020 [MA000004]',
    adultBaseRate: 27.81, // Level 1, 2026-27 ($1,056.80/wk)
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr (Casual: $15.64/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months with employer)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Junior rates apply to Levels 1–3 only; Levels 4+ always adult rate. 3-hour minimum shift. Saturday: 150% casual; Sunday: 175% casual; Public Holiday: 250% casual.',
  },
  restaurant: {
    code: 'MA000119',
    name: 'Restaurant Industry Award 2020 [MA000119]',
    adultBaseRate: 26.44, // Level 1 Introductory / Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: '2-hour minimum shift for casuals. Saturday: 150% casual; Sunday (Intro–Level 2): 150% casual (Level 3+: 175%); Public Holiday: 250% casual.',
  },
  hospitality: {
    code: 'MA000009',
    name: 'Hospitality Industry (General) Award 2020 [MA000009]',
    adultBaseRate: 26.44, // Level 1 Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: '2-hour minimum shift for casuals. Saturday: 150% casual; Sunday: 175% casual; Public Holiday: 250% casual.',
  },
  clubs: {
    code: 'MA000058',
    name: 'Registered and Licensed Clubs Award 2020 [MA000058]',
    adultBaseRate: 26.44, // Level 1 Adult Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: 'Liquor service exception: juniors serving liquor MUST be paid 100% full adult rate regardless of age. 2-hour minimum casual shift.',
  },
  pharmacy: {
    code: 'MA000012',
    name: 'Community Pharmacy Award 2020 [MA000012]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr (Casual: $15.64/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Junior rates apply to Levels 1–2 only. Sunday work attracts a high 200% perm / 225% casual multiplier.',
  },
  fitness: {
    code: 'MA000094',
    name: 'Fitness Industry Award 2020 [MA000094]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 17', pct: 0.55, label: '55% of Adult Rate — $15.30/hr (Casual: $19.13/hr)' },
      { age: '17 years', pct: 0.65, label: '65% of Adult Rate — $18.08/hr (Casual: $22.60/hr)' },
      { age: '18 years', pct: 0.75, label: '75% of Adult Rate — $20.86/hr (Casual: $26.08/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $23.64/hr (Casual: $29.55/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: '3-hour minimum shift for casuals. Pool lifeguards, gym instructors and reception staff.',
  },
  hair_beauty: {
    code: 'MA000005',
    name: 'Hair and Beauty Industry Award 2020 [MA000005]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $11.12/hr (Casual: $13.90/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate — $25.03/hr (Casual: $31.29/hr)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Salon assistants and junior styling crew. 3-hour minimum shift for casuals.',
  },
  cleaning: {
    code: 'MA000022',
    name: 'Cleaning Services Award 2020 [MA000022]',
    adultBaseRate: 27.81, // Full adult rate applies to standard cleaners regardless of age!
    rates: [
      { age: 'Under 16 (General Cleaner)', pct: 1.00, label: '100% Adult Rate — $27.81/hr (No Junior Scale for Cleaners!)' },
      { age: '16–20 years (General Cleaner)', pct: 1.00, label: '100% Adult Rate — $27.81/hr (Casual: $34.76/hr)' },
      { age: 'Under 16 (Trolley Collector)', pct: 0.50, label: '50% — $13.91/hr (Shopping Trolley Collection only)' },
      { age: '16–17 (Trolley Collector)', pct: 0.60, label: '60% — $16.69/hr (Shopping Trolley Collection only)' },
      { age: '18+ (Trolley Collector)', pct: 1.00, label: '100% Adult Rate — $27.81/hr' },
    ],
    note: 'IMPORTANT: General cleaning staff have NO junior rates — any teen working as a cleaner receives 100% full adult wages ($27.81/hr base / $34.76/hr casual)!',
  },
  amusement: {
    code: 'MA000080',
    name: 'Amusement, Events and Recreation Award 2020 [MA000080]',
    adultBaseRate: 27.81, // Grade 1, 2026-27
    rates: [
      { age: 'Under 17', pct: 0.55, label: '55% of Adult Rate — $15.30/hr (Casual: $19.13/hr)' },
      { age: '17 years', pct: 0.65, label: '65% of Adult Rate — $18.08/hr (Casual: $22.60/hr)' },
      { age: '18 years', pct: 0.75, label: '75% of Adult Rate — $20.86/hr (Casual: $26.08/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $23.64/hr (Casual: $29.55/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Theme parks, sports stadiums, bowling alleys, and entertainment centers. 3-hour minimum casual shift.',
  },
  children_services: {
    code: 'MA000120',
    name: 'Children\'s Services Award 2010 [MA000120]',
    adultBaseRate: 27.81, // Support Worker Level 1 (2026-27)
    rates: [
      { age: 'Under 17', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '17 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '18 years', pct: 0.90, label: '90% of Adult Rate — $25.03/hr (Casual: $31.29/hr)' },
      { age: '19+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'After school care (OSHC) assistants, holiday camp leaders, and junior childcare support staff. 2-hour minimum casual shift.',
  },
  storage_wholesale: {
    code: 'MA000084',
    name: 'Storage Services and Wholesale Award 2020 [MA000084]',
    adultBaseRate: 27.08, // Storeworker Grade 1 (2026-27)
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $10.83/hr (Casual: $13.54/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.54/hr (Casual: $16.93/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.25/hr (Casual: $20.31/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.96/hr (Casual: $23.70/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $21.66/hr (Casual: $27.08/hr)' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate — $24.37/hr (Casual: $30.46/hr)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.08/hr (Casual: $33.85/hr)' },
    ],
    note: 'Warehouse junior storeworkers, order picking, and wholesale logistics assistants. 4-hour minimum casual shift.',
  },
};

/** Penalty Rate Multipliers under Australian Awards */
export const PENALTY_RATES = {
  ordinary: { label: 'Ordinary Weekday Shift', multiplier: 1.00, icon: '📅' },
  saturday: { label: 'Saturday Shift (+25% to +50%)', multiplier: 1.25, icon: '⚡️' },
  sunday: { label: 'Sunday Shift (+50% to +75%)', multiplier: 1.50, icon: '🔥' },
  public_holiday_perm: { label: 'Public Holiday (permanent, 225%–250% total)', multiplier: 2.50, icon: '🎉' },
  public_holiday_casual: { label: 'Public Holiday (casual, 250%–275% incl. loading)', multiplier: 2.75, icon: '🎉' },
  night_shift: { label: 'Night / Evening Loading (+15%)', multiplier: 1.15, icon: '🌙' },
};

/** Allowances (indexed 1 July 2026 — award-specific, check PACT) */
export const WORKPLACE_ALLOWANCES = {
  mealAllowance: 18.15,
  uniformAllowancePerShift: 1.85,
  travelAllowancePerKm: 0.98,
};

/** Car Cost Defaults for 16-20yo Drivers (QLD 2026-27, source: qld.gov.au / RACQ) */
export const TEEN_CAR_COST_DEFAULTS = {
  averagePurchasePrice: 4500,
  ppsrCheckFee: 2.00,                      // Official PPSR register check at ppsr.gov.au
  qldTransferFee: 33.10,                   // TMR vehicle title transfer fee
  qldStampDutyPer100: 3.00,                // 1-4 cyl/hybrid/EV ($3 per $100 dutiable value)
  regoAnnual: 453.00,                      // QLD 4-cyl: rego $385.45 + traffic improvement fee $67.25 (1 Jul 2026)
  ctpGreenSlipAnnual: 418.00,              // QLD CTP Class 1 scheme average ($411.80-$424.80, 2026-27)
  comprehensiveInsuranceUnder25: 1650.00,  // Under-25 young driver comprehensive policy avg ($1,400-$2,000)
  thirdPartyPropertyUnder25: 520.00,       // Third-party property damage only (for low-value cash cars)
  fuelWeekly: 48.70,                       // ~$46-$56/wk based on ~13,500km/yr at 6.8L/100km @ $2.02/L (Brisbane ULP 91, Aug 2026)
  servicingAnnual: 450.00,                 // Annual logbook minor service + fluid changes
  tiresAndRepairsAnnual: 350.00,           // Tyres ($400-$600 set amortised over 3-4 yrs) + minor repairs
  roadsideAssistanceAnnual: 125.00,        // RACQ Standard Roadside Cover
};

export interface TeenSavingsAccount {
  bank: string;
  maxRate: number;
  baseRate: number;
  conditions: string;
  maxAge: number;
  minAge: number;
  bestFor: string;
  canOpenIndependentlyAt15: boolean;
  requiresParentUnder16: boolean;
  hasCardlessOption: boolean;
}

/** High Yield Teen Savings Account Comparison (2026-27 verified rates) */
export const TEEN_SAVINGS_ACCOUNTS: TeenSavingsAccount[] = [
  {
    bank: 'BOQ Future Saver (Under 18 Waiver)',
    maxRate: 5.80,
    baseRate: 0.05,
    conditions: 'Criteria WAIVED for ages 14–17! Automatic 5.80% p.a. without deposit or card transaction hurdles up to $50,000.',
    maxAge: 35,
    minAge: 14,
    bestFor: 'Top rate for 14–17 year olds with >$5k wanting zero monthly hurdles',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Newcastle Permanent Smart Saver (Under 25s)',
    maxRate: 5.75,
    baseRate: 0.05,
    conditions: 'Grow balance by any amount + ≤2 withdrawals per calendar month (up to $50k)',
    maxAge: 25,
    minAge: 0,
    bestFor: 'Highest rate under 25 with simple monthly growth hurdle',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Great Southern Bank Youth eSaver',
    maxRate: 5.50,
    baseRate: 5.50,
    conditions: '100% condition-free: flat 5.50% p.a. on balances up to $5,000 (1.00% above $5k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Best starter account for balances up to $5,000 with 0 conditions',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'ING Savings Maximiser (Orange Everyday Youth)',
    maxRate: 5.49,
    baseRate: 0.05,
    conditions: 'Deposit $1,000+ from external bank + 5 settled card purchases + grow balance (up to $100k; verify live rate — last confirmed 5.49% May 2026)',
    maxAge: 99,
    minAge: 15,
    bestFor: 'High $100k balance limit for working teens with regular paychecks',
    canOpenIndependentlyAt15: false,
    requiresParentUnder16: true,
    hasCardlessOption: false,
  },
  {
    bank: 'AMP Bank GO Save (No Conditions)',
    maxRate: 5.25,
    baseRate: 5.25,
    conditions: 'Zero conditions — 5.25% to $50k, then 4.75% to $250k (tiers narrowed Aug 2026; was 5.10% to $500k)',
    maxAge: 99,
    minAge: 13,
    bestFor: 'Unconditional rate for balances up to $50k',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'ANZ Plus (Growth Saver)',
    maxRate: 5.10,
    baseRate: 0.10,
    conditions: 'Grow balance by $100+ in the calendar month (excluding interest) on balances up to $250k',
    maxAge: 99,
    minAge: 15,
    bestFor: 'Visual multi-goal savers, automatic round-ups, and modern app UX',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Westpac Bump Savings',
    maxRate: 5.05,
    baseRate: 1.75,
    conditions: 'Grow balance each month + 1 deposit, balance >$0 (3.30% bonus, up to $30k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Big Four bank branch access, cash deposit Smart ATMs, 1.75% base rate',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Westpac Life (18–29 Spend & Save)',
    maxRate: 5.75,
    baseRate: 0.10,
    conditions: 'Grow balance month-on-month + ≥1 deposit + 20 settled debit purchases per month (up to $150k; otherwise 5.00%/0.10%)',
    maxAge: 29,
    minAge: 18,
    bestFor: 'Top Big Four rate once you turn 18 and can hit the monthly card-spend hurdle',
    canOpenIndependentlyAt15: false,
    requiresParentUnder16: false,
    hasCardlessOption: false,
  },
  {
    bank: 'CommBank Youthsaver',
    maxRate: 5.05,
    baseRate: 2.15,
    conditions: 'Deposit ≥$0.01 and ensure closing balance is higher than opening balance (up to $50k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Australia’s #1 teen banking app with NameCheck scam protection',
    canOpenIndependentlyAt15: true,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Up Bank (Savers)',
    maxRate: 5.35,
    baseRate: 0.00,
    conditions: 'Make 5 settled card purchases per month and make no withdrawal from that Saver (balances up to $250k combined across Savers; Flow fallback 2.00%)',
    maxAge: 99,
    minAge: 16,
    bestFor: 'Ages 16+ wanting automated round-ups, custom save targets, and gamified app design',
    canOpenIndependentlyAt15: false,
    requiresParentUnder16: false,
    hasCardlessOption: true,
  },
  {
    bank: 'Macquarie Bank Savings Account',
    maxRate: 5.00,
    baseRate: 5.00,
    conditions: 'Zero conditions — flat 5.00% ongoing to $2m (4-mo 5.35% welcome offer ended 14 Sept 2026). Earns 5.00% on everyday spending balance too!',
    maxAge: 99,
    minAge: 12,
    bestFor: 'Earn 5.00% on spending account, $0 international fees, refunds all domestic ATM fees',
    canOpenIndependentlyAt15: false,
    requiresParentUnder16: true,
    hasCardlessOption: true,
  },
];

/**
 * Australian State & Territory Working Age & School Hours Rules for 15-Year-Olds.
 * Sources: Fair Work Ombudsman, State Child Employment Acts across all 8 jurisdictions.
 */
export interface StateWorkingHoursRule {
  state: string;
  stateCode: 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  legislation: string;
  regulator: string;
  minAgeGeneral: string;
  minAgeLightOrDelivery: string;
  parentConsentMandatory: boolean;
  parentConsentDetails: string;
  schoolTermMaxHours: string;
  schoolDayMaxHours: string;
  nonSchoolDayMaxHours?: string;
  holidayMaxHours: string;
  nightWorkRestrictions: string;
  mandatoryRestBreaks: string;
  rulesFor15YearOlds: string;
  keyRule: string;
}

export const AU_STATE_WORKING_HOURS_RULES: StateWorkingHoursRule[] = [
  {
    state: 'Queensland (QLD)',
    stateCode: 'QLD',
    legislation: 'Child Employment Act 2006 & Child Employment Regulation 2016',
    regulator: 'Office of Industrial Relations / Business Queensland',
    minAgeGeneral: '13 years (retail, fast food, hospitality)',
    minAgeLightOrDelivery: '11 years (supervised delivery of newspapers & pamphlets)',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory signed parent\'s consent form (chief-executive approved form under s10(3) — the old "Form 1" number is deprecated) required before starting work; must state school hours and be updated if school hours change.',
    schoolTermMaxHours: 'Max 12 hours per week during school terms',
    schoolDayMaxHours: 'Max 4 hours on a school day',
    nonSchoolDayMaxHours: 'Max 8 hours on a non-school day (weekend)',
    holidayMaxHours: 'Max 38 hours per week in school holidays (max 8 hrs/day)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am',
    mandatoryRestBreaks: '1-hour rest pause after 4 continuous hours; minimum 12-hour break between shifts',
    rulesFor15YearOlds: 'Under QLD law, 15-year-olds who have not completed Year 10 are classified as "school-aged children" and subject to the 12 hr/week term cap, 4 hr school-day limit, approved parent consent form, and 10pm curfew.',
    keyRule: 'School attendance is compulsory; employers cannot roster students during school hours. The approved parent\'s consent form is legally mandatory for all workers under 16.',
  },
  {
    state: 'Victoria (VIC)',
    stateCode: 'VIC',
    legislation: 'Child Employment Act 2003 (as amended) & Education and Training Reform Act 2006',
    regulator: 'Workforce Inspectorate Victoria (Wage Inspectorate)',
    minAgeGeneral: '15 years without permit/licence (13–14 requires Child Employment Licence)',
    minAgeLightOrDelivery: '13–14 years for light work (retail, food, delivery) with employer licence; under 13 entertainment only',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for under-15 Child Employment Licence; optional standard HR consent once 15.',
    schoolTermMaxHours: 'Max 12 hours per week during school terms (for under 15)',
    schoolDayMaxHours: 'Max 3 hours on a school day (for under 15)',
    nonSchoolDayMaxHours: 'Max 6 hours on a non-school day (for under 15)',
    holidayMaxHours: 'Max 30 hours per week in school holidays (max 6 hrs/day for under 15; 38 hrs/wk for 15+)',
    nightWorkRestrictions: 'Strict curfew: No work between 9:00pm and 6:00am (for under 15)',
    mandatoryRestBreaks: '30-minute rest break after 3 continuous hours; minimum 12-hour break between shifts for under-15s',
    rulesFor15YearOlds: 'At 15, teens are no longer classified as "children" under the Child Employment Act; employers do not need a licence for retail/hospitality. However, school is compulsory until 17 so work during school hours is prohibited.',
    keyRule: 'Under Child Employment Act 2003, at 15 you can work in retail or hospitality without an employer permit. Under-15s require an employer licence and direct WWCC adult supervision.',
  },
  {
    state: 'New South Wales (NSW)',
    stateCode: 'NSW',
    legislation: 'Industrial Relations (Child Employment) Act 2006 & Education Act 1990',
    regulator: 'NSW Industrial Relations / Office of the Children\'s Guardian',
    minAgeGeneral: 'No statutory minimum age for retail/hospitality (Modern Awards apply)',
    minAgeLightOrDelivery: 'Office of Children\'s Guardian authority required for entertainment, modelling & door-to-door sales',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard employer HR onboarding practice for under-16s; legally mandatory in entertainment and door-to-door sales.',
    schoolTermMaxHours: 'No strict statutory hour cap; compulsory schooling until 17 (work cannot interfere with education)',
    schoolDayMaxHours: 'Max 4 hours on a school day (under 15 guideline); strictly outside school hours (8:30am–3:30pm)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Cannot work after 9:00pm on school nights (under 15); safe travel home required for late shifts',
    mandatoryRestBreaks: '1-hour rest break after 4 hours of work; minimum 12-hour break between shifts (under 15 guidelines)',
    rulesFor15YearOlds: '15-year-olds can work in retail, supermarkets, and cafes outside school hours under Modern Awards (e.g. Retail or Fast Food Award). Must not work during official school hours.',
    keyRule: 'Work must not interfere with education or health. Compulsory schooling applies until 17; employers must ensure shifts end with safe transport home.',
  },
  {
    state: 'Western Australia (WA)',
    stateCode: 'WA',
    legislation: 'Children and Community Services Act 2004 (Part 7) & School Education Act 1999',
    regulator: 'Department of Energy, Mines, Industry Regulation and Safety (DEMIRS) / Wageline',
    minAgeGeneral: '15 years for general retail, food services & hospitality',
    minAgeLightOrDelivery: '13–14 years for light work (shops, cafes, trolley collection, pamphlet delivery); 10–12 for paper rounds only',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written Wageline Parental Permission Form for 13–14 year olds before starting work; fines up to $120k for non-compliance.',
    schoolTermMaxHours: 'No work during school hours; max 12–16 hrs/week recommended outside school times',
    schoolDayMaxHours: 'Outside school hours only (after 3:30pm; between 6:00am and 10:00pm)',
    nonSchoolDayMaxHours: 'Standard award limits (between 6:00am and 10:00pm)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for 13–14 year olds',
    mandatoryRestBreaks: 'Modern award meal and rest break rules apply; shifts must end with safe travel arrangements',
    rulesFor15YearOlds: '15-year-olds can work in retail, hospitality, and fast food outside school hours without the statutory 13–14 parent permission form. School attendance is compulsory until end of year turned 17.',
    keyRule: 'Parental permission form is legally mandatory for 13–14 year olds under s 190. 15-year-olds can work retail and hospitality freely outside school hours.',
  },
  {
    state: 'South Australia (SA)',
    stateCode: 'SA',
    legislation: 'Education and Children\'s Services Act 2019 (s 74) & Work Health and Safety Act 2012',
    regulator: 'SafeWork SA / Department for Education',
    minAgeGeneral: 'No statutory minimum age (businesses set hiring policies, typically 14 or 15)',
    minAgeLightOrDelivery: 'No statutory minimum age for light work',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard employer onboarding practice for minors; formal exemption from school principal required for full-time work at 15.',
    schoolTermMaxHours: 'Cannot work during school hours; work must not render child unfit for school/education',
    schoolDayMaxHours: 'Outside school hours only (afternoons/evenings)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'No work that compromises sleep, health, safety, or school fitness (s 74 offence)',
    mandatoryRestBreaks: 'Standard Modern Award rest and meal break schedules apply',
    rulesFor15YearOlds: '15-year-olds can work part-time/casual shifts in retail and hospitality outside school hours. Full-time employment (30+ hrs/wk) requires a formal school exemption from the school principal.',
    keyRule: 'Section 74 of the Education and Children\'s Services Act 2019 makes it an offence (max $10,000 fine) to employ a school-aged child during school hours or if it causes school fatigue.',
  },
  {
    state: 'Tasmania (TAS)',
    stateCode: 'TAS',
    legislation: 'Education Act 2016 & Work Health and Safety Act 2012',
    regulator: 'WorkSafe Tasmania / Department for Education, Children and Young People (DECYP)',
    minAgeGeneral: 'No statutory minimum age (employer policy applies, typically 14 or 15)',
    minAgeLightOrDelivery: 'No statutory minimum age for light work',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard onboarding policy for under-16/18 employees; formal DECYP exemption needed for full-time work before 18.',
    schoolTermMaxHours: 'Work must not conflict with school attendance (compulsory until 18 or Year 12 / Cert III)',
    schoolDayMaxHours: 'Outside school hours only (after 3:30pm)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Modern Award late-night conditions; WorkSafe guidelines require safe transport home after dark',
    mandatoryRestBreaks: 'Modern Award break schedules apply (e.g. 10-min paid rest per 4 hrs, 30-min unpaid meal per 5+ hrs)',
    rulesFor15YearOlds: '15-year-olds are eligible for casual/part-time roles in supermarkets, fast food, and retail outside school hours. Education is compulsory until 18 unless in approved full-time vocational training.',
    keyRule: 'Under Education Act 2016, employment during school hours is unlawful without DECYP exemption. Work outside school must not interfere with education or wellbeing.',
  },
  {
    state: 'Australian Capital Territory (ACT)',
    stateCode: 'ACT',
    legislation: 'Children and Young People Act 2008 (Chapter 21) & Education Act 2004',
    regulator: 'Access Canberra / ACT Community Services Directorate',
    minAgeGeneral: '15 years ("young person" — no hour caps outside school)',
    minAgeLightOrDelivery: 'Under 15 ("child" — restricted to light work, max 10 hrs/wk, max 6 days/wk)',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for children under 15; employer must notify Director-General within 7 days for regular work.',
    schoolTermMaxHours: 'Max 10 hours per week of light work for under-15s; no statutory cap for 15+ outside school hours',
    schoolDayMaxHours: 'Outside school hours only (max 6 days in any week for under-15s)',
    nonSchoolDayMaxHours: 'Outside school hours; subject to 10 hr/wk total cap for under-15s',
    holidayMaxHours: 'Max 10 hours per week for under-15s; max 38 hours per week for 15+ under Modern Awards',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for children under 15',
    mandatoryRestBreaks: 'Modern award rest and meal breaks; safe travel home required for late evening shifts',
    rulesFor15YearOlds: 'Under ACT law, 15-year-olds are classified as "young persons" rather than "children", meaning the 10 hr/week light work cap does not apply. They can work award hours outside compulsory school hours.',
    keyRule: 'Children under 15 are restricted to 10 hrs/week of light work with mandatory parental consent. 15-year-olds can work general award hours outside school times.',
  },
  {
    state: 'Northern Territory (NT)',
    stateCode: 'NT',
    legislation: 'Care and Protection of Children Act 2007 (Part 5.3) & Education Act 2015',
    regulator: 'Territory Families, Housing and Communities / NT WorkSafe',
    minAgeGeneral: '15 years for general employment without child employment permit restrictions',
    minAgeLightOrDelivery: 'Under 15 subject to Part 5.3 child employment protections and parent consent',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for workers under 15; must be retained by employer.',
    schoolTermMaxHours: 'Work must not interfere with school attendance or education (compulsory until 17)',
    schoolDayMaxHours: 'Outside school hours only',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for children under 15',
    mandatoryRestBreaks: 'Minimum 12 continuous hours of rest between consecutive shifts for under-15s',
    rulesFor15YearOlds: 'At 15, Part 5.3 child employment restrictions lift. 15-year-olds who have completed Year 10 can transition to full-time work or work casual/part-time award hours outside school times.',
    keyRule: 'Under Care and Protection of Children Act 2007, under-15s cannot work 10pm–6am, must have 12-hour rest between shifts, and require written parent consent. 15-year-olds work under standard Modern Awards.',
  },
];

/** Minimum Shift Lengths Under Australian Modern Awards */
export const MINIMUM_SHIFT_LENGTHS = [
  { award: 'Fast Food Industry Award [MA000003]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'If sent home early, employer must still pay the full 3 hours.' },
  { award: 'General Retail Industry Award [MA000004]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to supermarkets, department stores, fashion & hardware.' },
  { award: 'Restaurant Industry Award [MA000119]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to cafes, restaurants and takeaway outlets.' },
  { award: 'Hospitality Industry Award [MA000009]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to hotels, resorts, event catering and function centres.' },
  { award: 'Registered and Licensed Clubs Award [MA000058]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to sporting, RSL, and community clubs.' },
  { award: 'Community Pharmacy Award [MA000012]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to pharmacy assistants and shop floor crew.' },
  { award: 'Fitness Industry Award [MA000094]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to pool lifeguards, gym receptionists, and swim instructors.' },
  { award: 'Cleaning Services Award [MA000022]', casualMin: '2–3 Hours', partTimeMin: '3 Hours', note: 'Cleaners get 100% full adult rates ($27.81/hr) regardless of age!' },
  { award: 'Amusement & Events Award [MA000080]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to theme parks, bowling alleys, and sports grounds.' },
];

/** Legal Meal & Rest Break Entitlements Under Modern Awards */
export const MEAL_AND_REST_BREAKS = [
  { shiftLength: 'Under 4 Hours', restPause: 'None required', mealBreak: 'None', isPaid: 'N/A' },
  { shiftLength: '4 to 5 Hours', restPause: '1 × 10-minute rest break', mealBreak: 'None', isPaid: '10-min break is 100% PAID by employer' },
  { shiftLength: '5 to 7 Hours', restPause: '1 × 10-minute rest break', mealBreak: '1 × 30-to-60 minute meal break', isPaid: 'Rest break is PAID; meal break is UNPAID' },
  { shiftLength: '7 to 10 Hours', restPause: '2 × 10-minute rest breaks', mealBreak: '1 × 30-to-60 minute meal break', isPaid: 'Both 10-min breaks are PAID; meal break is UNPAID' },
];

/** 100-Point Identification Checklist for 15-Year-Olds (Bank Accounts, TFN & Medicare) */
export const TEEN_ID_CHECKLIST_15YO = [
  { type: 'Primary ID (70 Points)', examples: 'Australian Birth Certificate, Australian Passport, Australian Citizenship Certificate', note: 'Most important document for 15yos' },
  { type: 'Secondary Photo ID (40 Points)', examples: 'Current High School Student ID Card (with photo), Proof of Age Card, Learner Driver Licence', note: 'Must have your photo and full legal name' },
  { type: 'Supporting Documents (25 Points each)', examples: 'Medicare Card (as a dependant or own card), Bank Debit Card, Letter from School Principal, Youth Transport Concession Card', note: 'Shows your current address or relationship' },
];

/** Top Australian Employers for 15-Year-Old First Job Seekers */
export const TOP_TEEN_EMPLOYERS_AU = [
  {
    company: "McDonald's Australia",
    minAge: "14 Years (15 in WA)",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Crew Member (Kitchen, Front Counter, Drive-Thru, Delivery)",
    howToApply: "Apply online via McDonald's Careers (Maccas Careers portal) or drop in a resume to store manager",
    tip: "Structured national training modules, flexible shifts around school timetable, and automatic super on 30+ hr weeks.",
  },
  {
    company: "Coles Supermarkets",
    minAge: "15 Years (14 in QLD/SA/ACT with parent consent)",
    award: "General Retail Industry Award [MA000004]",
    roles: "Customer Service, Checkout Operator, Dairy/Freezer, Online Order Fulfillment (Click & Collect)",
    howToApply: "Apply via Coles Careers online portal; set up job alerts for local suburban supermarkets",
    tip: "5% staff discount card (Coles Group) applies after probation period; consistent weekly weekend shifts available.",
  },
  {
    company: "Woolworths Supermarkets",
    minAge: "15 Years",
    award: "General Retail Industry Award [MA000004]",
    roles: "Checkout Team Member, Fresh Produce, Grocery Replenishment, Night Fill",
    howToApply: "Apply via Woolworths Careers (WOW Careers) online talent community",
    tip: "Team member discount card (5% off groceries, 10% off BIG W) provided to all permanent and casual staff.",
  },
  {
    company: "ALDI Supermarkets (18+ Strictly)",
    minAge: "18 Years (STRICT REQUIREMENT)",
    award: "ALDI Enterprise Agreement / Retail Award [MA000004]",
    roles: "Retail Assistant, Store Associate",
    howToApply: "Apply online via ALDI Careers portal (applicants must be at least 18 years old)",
    tip: "CRITICAL YOUTH RULE: ALDI requires workers to be 18+ due to operating electric power pallet jacks, hydraulic balers, and selling packaged liquor. In exchange, ALDI starts workers on market-leading adult wages ($30+/hr). Teenagers should apply to Coles, Woolworths, or IGA instead!",
  },
  {
    company: "KFC Australia (Collins Foods / Restaurant Brands)",
    minAge: "14 Years (15 in WA)",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Team Member (Customer Service, Cook, Drive-Thru)",
    howToApply: "Apply online via KFC Careers or local franchise operator portal",
    tip: "Fast-paced team environment with heavy weekend hours; uniform and laundry allowances apply.",
  },
  {
    company: "Hungry Jack's Australia",
    minAge: "14 Years (15 in WA)",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Crew Member (Front Counter, Flame Grill Cook, Drive-Thru)",
    howToApply: "Apply via Hungry Jack's Careers website or apply directly in restaurant",
    tip: "Reliable shifts for high schoolers with clear pathways to shift supervisor positions by age 17–18.",
  },
  {
    company: "Domino's Pizza",
    minAge: "14–15 Years (In-store) / 18 Years (Delivery Driver)",
    award: "Fast Food Industry Award [MA000003]",
    roles: "In-store Pizza Maker, Customer Service / Delivery Driver (e-bike 16+, car 18+)",
    howToApply: "Apply online via Domino's Jobs portal or directly to local franchise manager",
    tip: "In-store team members prepare pizzas, box orders, and take counter orders. E-bike delivery requires age 16+ and car delivery requires age 18+ with provisional driver licence.",
  },
  {
    company: "Subway Australia",
    minAge: "14–15 Years",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Sandwich Artist, Food Preparation, Cashier",
    howToApply: "Drop a resume in-store during quiet mid-afternoon hours (2pm–4pm) and ask to meet the franchise owner",
    tip: "Calmer pace than burger drive-thrus; excellent for learning food hygiene standards and customer dialogue.",
  },
  {
    company: "Target Australia & Kmart (Wesfarmers Group)",
    minAge: "15 Years (16 in some departments)",
    award: "General Retail Industry Award [MA000004]",
    roles: "Store Team Member (Apparel, Home, Register Operator, Online Pick)",
    howToApply: "Apply online via Kmart Careers / Target Careers portal",
    tip: "Wesfarmers team member discount card applies across Kmart, Target, Bunnings, and Officeworks.",
  },
  {
    company: "Bunnings Warehouse",
    minAge: "15–16 Years",
    award: "General Retail Industry Award [MA000004]",
    roles: "Team Member (Registers, Nursery, Customer Service, Stock Replenishment)",
    howToApply: "Apply online via Bunnings Careers portal",
    tip: "Outstanding positive workplace culture, paid training modules, and strong team member discount.",
  },
  {
    company: "Boost Juice (Retail Zoo)",
    minAge: "14–15 Years",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Juice Bar Crew Member, Blender Operator, Cashier",
    howToApply: "Apply online via Boost Juice Careers or in person with positive, energetic attitude",
    tip: "Upbeat, high-energy environment. Emphasise enthusiasm, speed, and customer smile in your interview!",
  },
  {
    company: "Event Cinemas & HOYTS Australia",
    minAge: "15 Years",
    award: "Amusement, Events and Recreation Award [MA000080]",
    roles: "Cinema Crew, Box Office, Candy Bar Assistant, Usher",
    howToApply: "Apply online via Event Hospitality Careers or HOYTS Careers portal",
    tip: "Generous free movie passes for staff and friends, late evening weekend penalty rates, and fun team culture.",
  },
  {
    company: "Rebel Sport (Super Retail Group)",
    minAge: "16 Years (STRICT REQUIREMENT)",
    award: "General Retail Industry Award [MA000004]",
    roles: "Retail Sales Assistant (Footwear, Apparel, Fitness Equipment)",
    howToApply: "Apply online via Super Retail Group Careers portal (minimum age 16 required)",
    tip: "Fantastic role for sports and fitness lovers; 20% team member discount across Rebel, BCF, Supercheap Auto, and Macpac.",
  },
  {
    company: "Guzman y Gomez (GYG)",
    minAge: "14–15 Years",
    award: "Fast Food Industry Award [MA000003]",
    roles: "Crew Member (Kitchen, Assembly Line, Cashier)",
    howToApply: "Apply online via GYG Careers or visit local restaurant with a polished resume",
    tip: "One of Australia's fastest growing fresh food brands with rapid progression to assistant shift leader.",
  },
  {
    company: "Bakers Delight & Local Bakeries",
    minAge: "14–15 Years",
    award: "General Retail or Fast Food Award",
    roles: "Customer Service Assistant, Bakery Trainee, Product Packaging",
    howToApply: "Drop in during early afternoon (1:30pm–3:00pm) with a clean 1-page resume and ask for the franchise owner",
    tip: "Early morning weekend shifts allow teens to earn high penalty rates and still enjoy the entire rest of their Saturday and Sunday!",
  },
  {
    company: "Sports Refereeing & Umpiring (Football, Basketball, Netball)",
    minAge: "13–15 Years",
    award: "Independent Match Fees ($30–$65 per match)",
    roles: "Junior Soccer Referee, Basketball Umpire, Netball Umpire, Touch Football Referee",
    howToApply: "Register for a Level 4 / Community Referee Course with Football QLD, Basketball NSW, etc.",
    tip: "Earn $35–$45 per 50-minute match in cash or direct bank transfer. Ref 3 matches on a Saturday morning to earn $105–$135 while staying fit and building authoritative leadership skills!",
  },
  {
    company: "Swim Teaching & Pool Deck Attendant",
    minAge: "15–16 Years",
    award: "Fitness Industry Award [MA000094]",
    roles: "Assistant Swim Instructor, Deck Attendant, Kiosk Assistant",
    howToApply: "Apply directly to local aquatic centres or swim schools (Kingswim, Rackley, Sam Riley)",
    tip: "Earn $20–$28/hr! Complete HLTAID009 CPR certificate to instantly qualify for assistant instructor roles.",
  },
  {
    company: "Babysitting & Local Childcare",
    minAge: "14–15 Years",
    award: "Independent Private Rate ($20–$30/hr)",
    roles: "Evening Babysitter, After-School Mother's Helper",
    howToApply: "Word of mouth through family friends, neighbours, school parents, and local community noticeboards",
    tip: "Reliability and trust are everything. Complete a basic first-aid/CPR course and provide 2 solid non-parent character references.",
  },
];

/** 15-Year-Old Independence Roadmap Milestones */
export const FIFTEEN_YO_ROADMAP_MILESTONES = [
  {
    step: 1,
    title: 'Apply for Your Free Tax File Number (TFN)',
    badge: 'Step 1 • Legal Prerequisite',
    summary: 'Apply online through Australia Post or myGov. It is 100% free (never pay a third-party fee!). Giving it to your employer & bank stops 47% top marginal withholding tax.',
    action: 'Book a free identity appointment at Australia Post with your Birth Certificate & Student ID.',
    linkKey: 'auspost_tfn',
  },
  {
    step: 2,
    title: 'Open a Zero-Fee 5.0%+ Youth Bank Account',
    badge: 'Step 2 • Banking & Savings',
    summary: 'Open a fee-free youth transaction account with Visa/Mastercard Debit and Apple Pay / Google Wallet. Provide your TFN to stop 47% tax on savings interest, and set up a cardless Mojo buffer.',
    action: 'Compare BOQ Future Saver (5.80%), Newcastle Permanent (5.75%), or Great Southern Bank (5.50%).',
    linkKey: 'moneysmart_banking',
  },
  {
    step: 3,
    title: 'Claim Your Own Green Medicare Card',
    badge: 'Step 3 • Healthcare Independence',
    summary: 'From age 15 in Australia, Services Australia allows you to get your own separate green Medicare card (via myGov or Form MS011 / MS004) to visit bulk-billing doctors independently with 100% confidential medical privacy.',
    action: 'Submit Services Australia Form MS011/MS004 or apply online via myGov under "Get a new card and number".',
    linkKey: 'services_australia_medicare_15',
  },
  {
    step: 4,
    title: 'Land Your First Casual Job & Master Junior Pay',
    badge: 'Step 4 • First Paycheck',
    summary: 'Understand your junior rate ($11.12–$15.64/hr base + 25% casual loading = $13.90–$16.53/hr), enforce the 3-hour minimum shift rule, paid 10-minute rest pauses, and the 1-hour unpaid trial limit.',
    action: 'Use our Teen Resume Builder and submit applications to Woolies, Coles, Maccas, or sports refereeing.',
    linkKey: 'fairwork_awards',
  },
  {
    step: 5,
    title: 'Claim the $22,575 Effective Tax-Free Threshold',
    badge: 'Step 5 • Zero Tax & Super',
    summary: 'Select YES to Question 8 on ATO Form NAT 3092. Combined with the $700 Low Income Tax Offset (LITO), you pay $0 tax up to $22,575. Fill out NAT 13080 to staple your super (12.0% SG over 30h/wk).',
    action: 'Submit Form NAT 3092 (TFN Declaration) and Form NAT 13080 (Super Choice) to your new employer.',
    linkKey: 'ato_tfn_form',
  },
  {
    step: 6,
    title: 'Automate Barefoot 3-Buckets ($500 Mojo Buffer)',
    badge: 'Step 6 • Paycheck Wealth',
    summary: 'Take advantage of $0 rent: allocate 60% Blow, 20% Mojo (until $500 safety buffer is reached), and 20% -> 40% Grow in a high-interest savings account for a first car bought in cash.',
    action: 'Set up T+0 payday bank automation so your Mojo and Grow funds transfer the instant your pay lands.',
    linkKey: 'moneysmart_budget',
  },
  {
    step: 7,
    title: 'Study PrepL / DKT for Your Ls at 16',
    badge: 'Step 7 • Driving Prep',
    summary: 'At 15 years and 11 months you can enrol in PrepL (QLD $29.70) or practice the DKT (NSW) so your Learner licence issues on your 16th birthday. Remember: 10 professional lessons count as 30 logbook hours!',
    action: 'Run free practice road rules quizzes on your state transport portal and budget for lessons.',
    linkKey: 'qld_prepl',
  },
  {
    step: 8,
    title: 'Unlock Student Concessions & Scam Protection',
    badge: 'Step 8 • Real World Savings',
    summary: 'Get 50c public transport fares (QLD) or Concession Opal (NSW), join Student Edge / UNiDAYS for $3,000+/yr in discounts, and protect against money muling recruitment scams.',
    action: 'Download Student Edge, verify your high school status, and never let anyone transfer money through your account.',
    linkKey: 'student_edge',
  },
];

export interface StudentDiscountItem {
  id: string;
  category: 'Transport' | 'Phone & Internet' | 'Tech & Hardware' | 'Music & Streaming' | 'Cinema & Entertainment' | 'Food & Retail';
  title: string;
  provider: string;
  discount: string;
  estimatedYearlySavings: number;
  howToGet: string;
  linkKey: string;
}

export const STUDENT_DISCOUNTS_AU: StudentDiscountItem[] = [
  {
    id: "translink_50c",
    category: "Transport",
    title: "50c Flat Public Transport Fares (QLD)",
    provider: "Translink (Buses, Trains, Ferries, Light Rail across SEQ)",
    discount: "Flat 50c per trip across all zones ($5.00/wk for daily commuting)",
    estimatedYearlySavings: 1250,
    howToGet: "Universal access across South East Queensland. Tap on and off with standard go card, contactless debit card, or smartphone.",
    linkKey: "translink_50c_fares",
  },
  {
    id: "nsw_opal_concession",
    category: "Transport",
    title: "50% Concession Opal & Free School Travel (NSW)",
    provider: "Transport for NSW (Trains, Metro, Buses, Ferries, Light Rail)",
    discount: "50% off adult fares (capped at $8.90/day Mon-Thu, $4.45/day weekends); 100% FREE school travel via SSTS School Opal",
    estimatedYearlySavings: 850,
    howToGet: "Order Child/Youth Opal (under 16) or present Senior Secondary Student Concession Card (16+). Apply for School Opal online.",
    linkKey: "transportnsw_child_youth",
  },
  {
    id: "vic_youth_myki_free",
    category: "Transport",
    title: "Free Under-18 Travel & Concession Myki (VIC)",
    provider: "Public Transport Victoria (PTV)",
    discount: "100% FREE travel for under-18s on registered Youth myki; 50% concession for tertiary students ($5.30 daily cap)",
    estimatedYearlySavings: 750,
    howToGet: "Order a Youth myki card online or at station booking offices and carry student ID.",
    linkKey: "ptv_children_students",
  },
  {
    id: "wa_smartrider_free_student",
    category: "Transport",
    title: "Free Student Travel on Transperth (WA)",
    provider: "Transperth (Trains, Buses, Ferries)",
    discount: "100% FREE travel Monday to Friday during school term + free travel for all on Sundays",
    estimatedYearlySavings: 800,
    howToGet: "Obtain a registered Student SmartRider card through your Western Australian secondary school.",
    linkKey: "transperth_student_smartrider",
  },
  {
    id: "sa_adelaide_metro_pass",
    category: "Transport",
    title: "Adelaide Metro $30.30 28-Day Unlimited Pass (SA)",
    provider: "Adelaide Metro (Buses, Trains, Trams)",
    discount: "$30.30 for 28 days of unlimited public transport ($1.08/day vs $123.20 full adult)",
    estimatedYearlySavings: 850,
    howToGet: "Purchase via Adelaide Metro Buy & Go app or load onto a Student metroCARD with secondary school ID.",
    linkKey: "adelaidemetro_fares",
  },
  {
    id: "student_edge_portal",
    category: "Food & Retail",
    title: "Student Edge Australia Free Membership",
    provider: "Student Edge (Deals across 100+ national retailers)",
    discount: "$12.50 HOYTS movie tickets, 10–15% off Boost Juice, $5 Macca's meal deals, JB Hi-Fi BYOD portal",
    estimatedYearlySavings: 280,
    howToGet: "Sign up for free at studentedge.org (open to all students aged 11+) and download digital card.",
    linkKey: "student_edge",
  },
  {
    id: "unidays_au_portal",
    category: "Food & Retail",
    title: "UNiDAYS Australia Retail & Tech Perks",
    provider: "UNiDAYS (Nike, Apple, Samsung, Cotton On, ASOS, The Iconic)",
    discount: "10%–20% instant promotional codes on sneakers, apparel, tech, and subscriptions",
    estimatedYearlySavings: 320,
    howToGet: "Verify secondary or tertiary student status with school email address (.edu.au) or student ID.",
    linkKey: "unidays_au",
  },
  {
    id: "student_beans_au",
    category: "Food & Retail",
    title: "Student Beans Australia Discount Network",
    provider: "Student Beans (Gymshark, Princess Polly, Dell, ASOS, Typo)",
    discount: "10%–15% exclusive single-use promo codes on fashion and electronics",
    estimatedYearlySavings: 200,
    howToGet: "Create free account at studentbeans.com/au with school email or student portal proof.",
    linkKey: "studentbeans_au",
  },
  {
    id: "apple_education_store",
    category: "Tech & Hardware",
    title: "Apple Education Store Pricing & Back to Uni Gifts",
    provider: "Apple Australia",
    discount: "$100–$300 discount on MacBooks & iPads + 10% off AppleCare+ + free AirPods/gift card during Back to School",
    estimatedYearlySavings: 250,
    howToGet: "Access apple.com/au-edu/store online or present student ID at physical Apple Store.",
    linkKey: "apple_education_store",
  },
  {
    id: "samsung_education_store",
    category: "Tech & Hardware",
    title: "Samsung Student & Youth Store (Up to 30% Off)",
    provider: "Samsung Australia",
    discount: "20% to 30% off Galaxy smartphones, tablets, laptops, monitors, and smartwatches",
    estimatedYearlySavings: 220,
    howToGet: "Log in via UNiDAYS or Student Edge partner links at samsung.com/au/offer/education-store.",
    linkKey: "samsung_education_store",
  },
  {
    id: "microsoft_365_free",
    category: "Tech & Hardware",
    title: "Microsoft 365 Education (100% Free Suite + 1TB OneDrive)",
    provider: "Microsoft Australia",
    discount: "100% FREE full Word, Excel, PowerPoint, OneNote suite + 1TB cloud storage ($109/yr value)",
    estimatedYearlySavings: 109,
    howToGet: "Enter your valid school email address (.edu.au or @eq.edu.au) at microsoft.com/en-au/education/products/office.",
    linkKey: "microsoft_365_education",
  },
  {
    id: "github_student_pack",
    category: "Tech & Hardware",
    title: "GitHub Student Developer Pack ($100k+ Value of Tools)",
    provider: "GitHub / Microsoft / JetBrains",
    discount: "100% FREE GitHub Copilot AI ($120/yr), Codespaces, JetBrains IDEs ($289/yr), cloud credits, and free domains",
    estimatedYearlySavings: 450,
    howToGet: "Apply with school email or report card at education.github.com/pack (open to students aged 13+).",
    linkKey: "github_student_pack",
  },
  {
    id: "adobe_creative_cloud_student",
    category: "Tech & Hardware",
    title: "Adobe Creative Cloud Student Discount (60%+ Off)",
    provider: "Adobe Australia",
    discount: "Full Creative Cloud suite (Photoshop, Illustrator, Premiere) for ~$35/mo vs $88/mo standard ($695/yr savings!)",
    estimatedYearlySavings: 695,
    howToGet: "Enrol via adobe.com/au/creativecloud/buy/students.html with school ID or email.",
    linkKey: "adobe_creative_cloud_students",
  },
  {
    id: "autodesk_education_free",
    category: "Tech & Hardware",
    title: "Autodesk Professional 3D & CAD Software (100% Free)",
    provider: "Autodesk (AutoCAD, Revit, Fusion 360, Maya, 3ds Max)",
    discount: "100% FREE educational license for software normally costing $2,500+/year",
    estimatedYearlySavings: 1500,
    howToGet: "Verify student status via SheerID at autodesk.com/education/edu-software.",
    linkKey: "autodesk_education_software",
  },
  {
    id: "jetbrains_student_pack",
    category: "Tech & Hardware",
    title: "JetBrains All Products Developer Pack (100% Free)",
    provider: "JetBrains (IntelliJ IDEA, PyCharm Pro, WebStorm, CLion)",
    discount: "100% FREE professional developer licenses ($289/year commercial value)",
    estimatedYearlySavings: 289,
    howToGet: "Apply at jetbrains.com/community/education/#students with .edu.au email address.",
    linkKey: "jetbrains_education_licenses",
  },
  {
    id: "figma_education_free",
    category: "Tech & Hardware",
    title: "Figma Professional Tier for Students (100% Free)",
    provider: "Figma",
    discount: "100% FREE Figma & FigJam Professional ($144/year commercial value)",
    estimatedYearlySavings: 144,
    howToGet: "Sign up at figma.com/education with student account verification.",
    linkKey: "figma_education",
  },
  {
    id: "jbhifi_byod_portal",
    category: "Tech & Hardware",
    title: "JB Hi-Fi Education BYOD Hardware Pricing",
    provider: "JB Hi-Fi Education",
    discount: "Education-only pricing on school laptops, MacBooks, iPads, and accidental damage insurance",
    estimatedYearlySavings: 180,
    howToGet: "Access via school BYOD program portal code or via Student Edge partner links.",
    linkKey: "jbhifi_education_byod",
  },
  {
    id: "spotify_student_plan",
    category: "Music & Streaming",
    title: "Spotify Premium Student ($6.99/mo vs $14.49/mo)",
    provider: "Spotify Australia",
    discount: "$6.99/month for ad-free offline music downloads ($78/year direct cash savings)",
    estimatedYearlySavings: 78,
    howToGet: "Verify student enrolment via SheerID in the Spotify subscription portal.",
    linkKey: "spotify_student_au",
  },
  {
    id: "apple_music_student_tv",
    category: "Music & Streaming",
    title: "Apple Music Student + FREE Bundled Apple TV+",
    provider: "Apple Australia",
    discount: "$6.99/mo for Apple Music AND includes free Apple TV+ ($12.99/mo standalone value = $215/yr saved!)",
    estimatedYearlySavings: 215,
    howToGet: "Select student tier in Apple Music settings and authenticate via UNiDAYS.",
    linkKey: "apple_music_student_au",
  },
  {
    id: "youtube_premium_student",
    category: "Music & Streaming",
    title: "YouTube Premium Student ($8.99/mo vs $16.99/mo)",
    provider: "Google / YouTube Australia",
    discount: "$8.99/month for ad-free YouTube, background play, downloads, and YouTube Music Premium",
    estimatedYearlySavings: 96,
    howToGet: "Verify enrolment annually via SheerID inside YouTube subscription settings.",
    linkKey: "youtube_premium_student_au",
  },
  {
    id: "event_cinemas_cinebuzz",
    category: "Cinema & Entertainment",
    title: "Event Cinemas Cinebuzz 50% Off Student Mondays",
    provider: "Event Cinemas",
    discount: "50% off full-price tickets on Cinebuzz Student Mondays (V-Max, IMAX, Original) + $12–$14 Tue-Thu tickets",
    estimatedYearlySavings: 140,
    howToGet: "Join Cinebuzz Rewards for free and link your student ID card at the box office.",
    linkKey: "event_cinemas_cinebuzz_students",
  },
  {
    id: "hoyts_student_saver",
    category: "Cinema & Entertainment",
    title: "HOYTS $12.50 Student Saver Movie Tickets",
    provider: "HOYTS Australia (via Student Edge)",
    discount: "$12.50 General Admission tickets Monday to Thursday ($22–$25 standard weekend price)",
    estimatedYearlySavings: 130,
    howToGet: "Book online through Student Edge deal link or show Student Edge app at the counter.",
    linkKey: "hoyts_deals_student_edge",
  },
  {
    id: "mvno_sim_only_strategy",
    category: "Phone & Internet",
    title: "Budget MVNO SIM-Only Strategy (Boost, Belong, Felix)",
    provider: "Low-cost carriers on Telstra & Optus Wholesale Networks",
    discount: "$15–$25/month for 25–40GB 5G data vs $65–$85/month lock-in major carrier contracts",
    estimatedYearlySavings: 540,
    howToGet: "Bring your own unlocked handset and purchase a 30-day SIM-only plan outright.",
    linkKey: "boost_mobile_au",
  },
  {
    id: "optus_student_hub",
    category: "Phone & Internet",
    title: "Optus Student Hub 10% Discounted SIM Plans",
    provider: "Optus Australia",
    discount: "10% ongoing discount on eligible SIM-only mobile plans with large bonus data banks",
    estimatedYearlySavings: 90,
    howToGet: "Verify student status via UNiDAYS or sign up with .edu.au email at optus.com.au/student-hub.",
    linkKey: "optus_student_hub",
  },
  {
    id: "vodafone_student_plans",
    category: "Phone & Internet",
    title: "Vodafone Student 10% Off SIM-Only Plans",
    provider: "Vodafone Australia",
    discount: "10% off month-to-month SIM plans with endless data and $5 roaming",
    estimatedYearlySavings: 90,
    howToGet: "Apply via UNiDAYS or enter student ID number during checkout at vodafone.com.au.",
    linkKey: "vodafone_student_discount",
  },
  {
    id: "qld_play_on_vouchers",
    category: "Food & Retail",
    title: "Queensland Play On! Sports Vouchers ($200/yr)",
    provider: "Queensland Government (Department of Tourism and Sport)",
    discount: "Up to $200 per child per financial year towards club registration, swimming, or sports fees",
    estimatedYearlySavings: 200,
    howToGet: "Apply online for QLD children aged 5–17 via Health Care Card or referral agent pathway.",
    linkKey: "qld_playon_sports_vouchers",
  },
  {
    id: "nsw_active_kids",
    category: "Food & Retail",
    title: "NSW Active & Creative Kids Vouchers ($100/yr)",
    provider: "Service NSW / NSW Government",
    discount: "Two $50 vouchers per child per year for sport, swimming, music, coding, or drama",
    estimatedYearlySavings: 100,
    howToGet: "Apply in Service NSW app for children aged 4.5–18 receiving Family Tax Benefit.",
    linkKey: "nsw_active_creative_kids",
  },
  {
    id: "vic_get_active_kids",
    category: "Food & Retail",
    title: "Victoria Get Active Kids Vouchers ($200/yr)",
    provider: "Victorian Government (Department of Jobs, Skills, Industry and Regions)",
    discount: "Up to $200 per child per round towards club fees, uniforms, and sports gear",
    estimatedYearlySavings: 200,
    howToGet: "Apply online at getactive.vic.gov.au for Victorian children named on a Health Care Card.",
    linkKey: "vic_get_active_kids",
  },
  {
    id: "wa_kidsport_vouchers",
    category: "Food & Retail",
    title: "Western Australia KidSport Vouchers ($300/yr)",
    provider: "WA Department of Local Government, Sport and Cultural Industries",
    discount: "Up to $300 per child per financial year for approved club fees and uniforms",
    estimatedYearlySavings: 300,
    howToGet: "Apply online at kidsport.dlgsc.wa.gov.au for WA youth aged 5–18 on Health Care Card.",
    linkKey: "wa_kidsport_vouchers",
  },
  {
    id: "sa_sports_vouchers",
    category: "Food & Retail",
    title: "South Australia Sports Vouchers ($200/yr)",
    provider: "SA Office for Recreation, Sport and Racing",
    discount: "Two $100 vouchers per child per calendar year for sport, swimming, and music lessons",
    estimatedYearlySavings: 200,
    howToGet: "Provide child's Medicare number when registering with approved South Australian clubs.",
    linkKey: "sa_sports_vouchers",
  },
  {
    id: "tas_ticket_to_play",
    category: "Food & Retail",
    title: "Tasmania Ticket to Play Vouchers ($200/yr)",
    provider: "Active Tasmania (Tasmanian Government)",
    discount: "Two $100 vouchers per financial year for Tasmanian youth aged 5–18 towards club fees",
    estimatedYearlySavings: 200,
    howToGet: "Apply online at tickettoplay.tas.gov.au with valid Health Care Card or FTB Part A.",
    linkKey: "tas_ticket_to_play",
  },
  {
    id: "nt_sport_voucher",
    category: "Food & Retail",
    title: "Northern Territory Sport Vouchers ($200/yr)",
    provider: "Northern Territory Government",
    discount: "Two $100 vouchers per year (Jan & Jul) for urban NT students from Transition to Year 12",
    estimatedYearlySavings: 200,
    howToGet: "Apply via GrantsNT portal at nt.gov.au for enrolled Northern Territory school students.",
    linkKey: "nt_sport_voucher_scheme",
  },
];

/**
 * Proven Savings Goals & Paycheck Allocation Frameworks for Teens
 */
export const SAVINGS_GOALS_FRAMEWORKS = {
  barefoot3Bucket: {
    name: 'The Barefoot Investor 3-Bucket System for Teens',
    author: 'Scott Pape',
    description: 'Adapted specifically for Australian teenagers aged 14–17 living at home with $0 rent and $0 utility expenses. When Mojo reaches the $500 safety buffer, Mojo contributions stop and cascade into Grow, expanding long-term savings to 40%!',
    allocations: [
      { name: 'Blow (60%)', purpose: 'Daily expenses, transport (50c QLD fares / Concession Opal), lunch with friends, phone plan, and everyday spending.' },
      { name: 'Mojo (20%)', purpose: 'High-interest $500 cash emergency cushion stored in a separate bank with NO debit card to create psychological friction against impulse buys.' },
      { name: 'Grow (20% -> 40%)', purpose: 'Long-term goal: first car bought in cash, 10 driving lessons ($700), Year 12 formal, or first ETF investing at 18. Expands to 40% once Mojo is fully funded!' },
    ],
    paycheckModels: [
      {
        hoursPerWeek: 8,
        hourlyRate: 13.90, // 15yo casual base $11.12 + 25% loading
        weeklyGross: 111.20,
        blow: 66.72,
        mojo: 22.24,
        grow: 22.24,
        weeksToFundMojo500: 23, // $500 / $22.24 = 22.5 weeks
        note: 'After 23 weeks, Mojo ($500) is locked! Weekly Grow increases to $44.48/wk ($2,313/year saved in HISA).'
      },
      {
        hoursPerWeek: 12,
        hourlyRate: 14.50, // 15yo casual restaurant / retail
        weeklyGross: 174.00,
        blow: 104.40,
        mojo: 34.80,
        grow: 34.80,
        weeksToFundMojo500: 15, // $500 / $34.80 = 14.4 weeks
        note: 'After 15 weeks, Mojo is fully funded! Weekly Grow leaps to $69.60/wk ($3,619/year saved in HISA).'
      }
    ],
  },
  teen50_30_20: {
    name: 'Inverted Teen 50/30/20 Rule',
    description: 'Traditional adult 50/30/20 budgets allocate 50% to "Needs" (rent, groceries, electricity). Because a 15-year-old living with family has $0 accommodation costs, the traditional rule fails. The Inverted Rule flips this advantage to supercharge future wealth!',
    allocations: [
      { name: 'Grow & Wealth (50%)', purpose: 'Capitalise on living at home with $0 rent by allocating 50% directly into high-interest savings (BOQ 5.80% / Newcastle Perm 5.75%) and car funds.' },
      { name: 'Guilt-Free Splurge (30%)', purpose: 'Dining out with mates, gaming, sneakers, concert tickets, and social life — completely guilt-free.' },
      { name: 'Daily Essentials (20%)', purpose: 'Personal admin, mobile plan ($15-$25/mo MVNO), transport fares, school stationery, and haircut.' },
    ],
    automationTip: 'Set up T+0 payday automation: schedule automatic bank transfers on payday evening so 50% Grow moves into your HISA before you ever touch your transaction debit card.',
  },
  fourBucketSystem: {
    name: 'The 4-Bucket Envelope System',
    allocations: [
      { name: 'Daily Spend (Blow)', purpose: 'Everyday transaction account with debit card and Apple Pay / Google Wallet for contactless taps.' },
      { name: 'Sinking Funds (Smile)', purpose: 'Dedicated sub-accounts for predictable irregular expenses (school formal, festival tickets, gifts).' },
      { name: 'Mojo Safety Buffer', purpose: '$500 locked cash safety cushion in a separate 5.0%+ HISA with no linked debit card.' },
      { name: 'Big Goal (Grow)', purpose: 'Used car purchase, professional driving lessons, university laptop, or index ETF compounding at 18.' },
    ],
  },
  hoursWorkedRule: {
    name: 'The Hours of Work Psychology Conversion',
    formula: 'Cost of Item / Junior Hourly Take-Home Wage = Hours of Physical Labour Required',
    example: 'At $13.90/hr (15yo casual retail/fast food rate), a $140 pair of sneakers requires 10.1 hours of continuous dishwashing or burger-flipping. Asking yourself "Is this hoodie worth 8 hours on my feet?" instantly breaks impulse dopamine shopping.',
  },
  coolingOffRule: {
    name: 'The 24-Hour & 7-Day Cooling Off System',
    tier1: 'Under $100: Enforce a mandatory 24-hour waiting period before tapping your card. If the urge fades, you just saved $50–$100.',
    tier2: 'Over $100: Add the item to a 7-day or 30-day "Cooling-Off Wishlist" note in your phone. If you still want it after 7 days and your sinking fund is funded, buy it with zero regret.',
    deInfluencingTip: 'Beware social media "haul" culture and TikTok affiliate links. 90% of promoted products are paid sponsorships designed to trigger artificial FOMO.',
  },
  sinkingFundsGuide: {
    name: 'SMART Teen Sinking Funds Target Blueprint',
    shortTerm: 'Short-Term ($50–$300, 1–3 months): Concert/festival tickets ($120–$250), new sneakers ($140), gaming releases ($90). Weekly target: $15–$30/wk.',
    mediumTerm: 'Medium-Term ($300–$1,500, 3–12 months): $500 Mojo buffer ($22–$35/wk), 10 professional driving lessons ($700–$850 total = $18/wk over 9 months), Year 12 formal outfit and ticket ($400–$800 = $15/wk), study laptop ($900–$1,400 = $25/wk).',
    longTerm: 'Long-Term ($2,000–$10,000, 1–3 years): Reliable used first car ($4,000–$7,000) PLUS first-year car running costs sinking fund ($2,500–$3,500 for rego, CTP, young driver comprehensive insurance, and servicing). Weekly target: $50–$80/wk.',
    tip: 'Open named savings spaces in apps like Up, Great Southern Bank, or ANZ Plus. Watching a bar fill to 100% harnesses visual gamification psychology!',
  },
  drivingLessonEconomics: {
    name: 'Queensland Driving Lesson Economics & 3-for-1 Rule',
    tmrPrepL: 'Enrol in PrepL at age 15 years and 11 months ($29.70 fee, 12-month access, free unlimited retests) so your Learner licence issues on your 16th birthday ($80.15 for 3 years).',
    threeForOneRule: 'Under TMR regulations, 1 hour of professional driving lessons with an accredited instructor counts as 3 hours in your logbook (capped at 10 actual hours = 30 logbook hours!).',
    nightHoursNuance: 'Night lessons cannot double-dip: an instructor night hour either counts as 3 daytime logbook hours OR 1 night hour at 1-for-1. Complete your 10 instructor hours during the day, and do night hours with parents.',
    parentTimeSaved: '10 professional lessons save parents 20 hours in the passenger seat. Valued at adult average earnings ($45–$55/hr), this represents $900–$1,100 of parent opportunity cost saved!',
    vehicleWearSaved: '20 avoided suburban hours = ~750 km of avoided driving on the family car (~$660 in fuel, tyres, brakes, and servicing at ATO 88c/km benchmark).',
    safetyBenefit: 'Dual-control instructor pedals prevent novice curb strikes and fender benders during the most dangerous early learning phase, while professional defensive training dramatically lowers the risk of failing the $69.40 Q-SAFE practical test.',
  },
  compoundGrowthComparison: {
    name: 'The Mathematical Magic of Starting at Age 15 (15yo vs 25yo Comparison)',
    scenarioA: 'Investor A starts at 15. Contributes $30/week ($1,560/year) for 10 years until age 25 (total cash invested: $15,600). Stops contributing completely at 25 and lets the balance compound at 8.0% p.a. (ASX 200 historical long-term average with dividends reinvested) for 40 years until age 65.',
    scenarioB: 'Investor B starts at 25. Contributes $30/week ($1,560/year) continuously for 40 years until age 65 (total cash invested: $62,400 — FOUR TIMES MORE CASH!). Compounds at the same 8.0% p.a.',
    resultAt65: 'Investor A ends up with ~$518,000 to $584,000 at age 65! Investor B ends up with ~$410,000 to $458,000 at age 65. Investor A finishes with over $100,000 MORE money despite investing $46,800 LESS cash and never adding a cent after their 25th birthday!',
    ruleOf72: 'Rule of 72 doubling times: At 5.5% HISA = doubles every 13.1 years. At 8.0% ASX index ETF = doubles every 9.0 years. At 10.0% high growth = doubles every 7.2 years.',
    inflationPurchasingPowerWarning: 'Inflation destroys idle cash: at 3.0% CPI inflation, $10,000 left in a 0.05% everyday bank account loses 58.8% of its real purchasing power over 30 years (dropping to just $4,120 in real value). Keeping long-term wealth in a high-yield HISA (5.0%+) or diversified index ETFs is essential to beat inflation.',
    moral: 'Time in the market beats timing the market. The money you invest between 15 and 25 has up to 50 years to compound, making every dollar worth up to 45 times its initial value at retirement!',
  },
};

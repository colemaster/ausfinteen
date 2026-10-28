/**
 * Cars & Driving — Brisbane, QLD reference data (2026-2027 parameters).
 *
 * Verified October 2026 against official statutory & market benchmarks:
 *  - Australian Financial Security Authority (ppsr.gov.au): official $2.00 PPSR search fee;
 *    warning against commercial copycat websites charging $25-$35+ markups.
 *  - Queensland Government / TMR (qld.gov.au): driver licence fees (1 July 2026 schedule),
 *    graduated licensing pathway, vehicle registration fees & transfer duty (1 Oct 2026 schedule).
 *  - Motor Accident Insurance Commission (maic.qld.gov.au): QLD CTP Class 1 scheme parameters
 *    and licensed insurers (Suncorp, Allianz, QBE; noting RACQ's underwriting exit on 1 Oct 2023).
 *  - Insurance market data (iSelect, Canstar, RACQ, Budget Direct): young provisional driver
 *    (16-20yo) comprehensive insurance quotes ($1,600-$2,800/yr) and excess structures.
 *  - Fuel: Brisbane daily averages (FuelRadar, PetrolSpy, RACQ Fair Fuel), price-cycle reporting
 *    (typical ULP 91 / E10 range ~$2.10-$2.38/L).
 *  - Australian Energy Regulator (AER) Default Market Offer 2026-27 (Energex residential tariff 28c/kWh),
 *    off-peak / EV night tariffs (18c-22c/kWh), and public DC fast charging networks (55c-75c/kWh).
 *  - Vehicle maintenance benchmarks: popular used hatchbacks (Toyota Corolla, Hyundai i30,
 *    Mazda 3, Kia Cerato) vs modern battery electric vehicles (EVs).
 *  - Brisbane City Council (brisbane.qld.gov.au): on-street parking zones, meter terms, free parking.
 *
 * All figures are historical reference data as at October 2026 for education only,
 * NOT live quotes and NOT financial advice. Verify against official sources before purchasing.
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

/** QLD graduated licensing pathway (under-25 driver, the standard teen route) — 2026-2027 schedule (qld.gov.au) */
export const QLD_LICENCE_PATH: QldLicenceStep[] = [
  {
    stage: 'Learner (L)',
    plates: 'L plates (yellow with black L)',
    minAge: 16,
    holdTime: '12 months minimum',
    fees: 'PrepL $29.70 + learner licence $80.15 (3 yrs)',
    requirements:
      'Enrol in PrepL online from age 15y11m ($29.70, 12 months access, 100% mastery) or pass the in-person written test ($29.70). Drivers under 25 must log 100 supervised driving hours (at least 10 night hours between sunset and sunrise) in the official Queensland Learner Logbook app or hardcopy book ($25.90). 3-for-1 instructor credit: up to 10 hours of professional lessons count as 30 logbook hours. Submit logbook 12+ business days before booking the practical test.',
    restrictions:
      'Must be supervised by an open licence holder (held for 1+ year). Display L plates on front and rear (visible from 20m; $276 fine + 2 demerit points). Strictly 0.00 BAC (supervisor must be under 0.05 BAC). Zero mobile phone use for learners under 25 (no hands-free, Bluetooth, smartwatch, or loudspeaker — camera fine $1,295 + 4 demerit points).',
  },
  {
    stage: 'Provisional P1 (Red P)',
    plates: 'Red P plates (white with red P)',
    minAge: 17,
    holdTime: '12 months',
    fees: 'HPT $42.70 + practical test $69.40 + P1 licence $94.65 (1 yr)',
    requirements:
      'Hold Ls for 12 months minimum and finish 100 logbook hours. Pass the online Hazard Perception Test (HPT, $42.70, unlocked after 6 months on Ls, valid 12 months), then pass the Q-SAFE 30-minute on-road practical driving test ($69.40).',
    restrictions:
      'Display red P plates front and rear ($276 fine + 2 demerits). Strictly 0.00 BAC. Zero mobile phone use under 25 (no hands-free, wireless audio, smartwatch, or GPS touch — camera fine $1,295 + 4 demerit points). Peer passenger restriction: between 11:00 PM and 5:00 AM, maximum 1 passenger under 21 who is not immediate family (penalty: $518 fine + 3 demerit points). No high-powered vehicles (>130 kW/tonne, exemption fee $51.45). Demerit point cliff: 4 points within 1 year triggers licence suspension. No blanket night curfew.',
  },
  {
    stage: 'Provisional P2 (Green P)',
    plates: 'Green P plates (white with green P)',
    minAge: 18,
    holdTime: '2 years if under 25 (or 1 year if issued at 25+)',
    fees: 'P2 licence $132.00 (2 yrs) — $94.65 (1 yr) option also available',
    requirements:
      'Hold P1 for 12 months with a clean record (no suspensions or disqualifications). Upgrades automatically to P2 without extra driving tests.',
    restrictions:
      'Display green P plates front and rear ($276 fine + 2 demerits). Strictly 0.00 BAC. Hands-free phone use permitted (e.g. phone mounted in an approved cradle for GPS navigation, Bluetooth calls). Peer passenger 11pm–5am restriction lifted. High-powered vehicle ban continues for under-25 drivers. Demerit point threshold remains 4 points within 1 year.',
  },
  {
    stage: 'Open Licence',
    plates: 'No plates required',
    minAge: 20,
    holdTime: 'Unrestricted (renew every 1 to 5 years)',
    fees: 'Open licence $94.65 (1 yr) / $132.00 (2 yrs) / $163.25 (3 yrs) / $188.95 (4 yrs) / $212.00 (5 yrs)',
    requirements:
      'Hold P2 for the required period (minimum open-licence age 20 for under-25 starters; 1 year if P2 was issued at 25+). Automatically upgrades to Open.',
    restrictions:
      'Standard QLD road rules apply. Legal BAC limit under 0.05 (0.00 for heavy vehicles, buses, taxis, rideshare, tow trucks). Demerit point cap increases to 12 points in a 3-year rolling period. High-powered vehicle restrictions lifted.',
  },
];

export interface QldLicenceFee {
  item: string;
  cost: number; // AUD as at 1 July 2026
  note: string;
}

/** QLD licence test & licence fees — 2026-2027 schedule (qld.gov.au/transport/licensing/driver-licensing/fees) */
export const QLD_LICENCE_FEES: QldLicenceFee[] = [
  { item: 'PrepL online road rules test', cost: 29.70, note: 'Sit online from age 15y11m — 100% mastery, 12 months access with unlimited retries' },
  { item: 'Written road rules (knowledge) test', cost: 29.70, note: 'In-person alternative to PrepL at TMR centre — 30 questions, 90% to pass' },
  { item: 'Learner licence (3 years)', cost: 80.15, note: 'Issued from age 16 with photo card' },
  { item: 'Replacement card / logbook / exemptions', cost: 37.40, note: 'Replacement card $37.40; hardcopy logbook $25.90; logbook exemption $51.45; high-powered exemption $51.45' },
  { item: 'Hazard Perception Test (HPT)', cost: 42.70, note: 'Available after 6 months on Ls; result valid 12 months' },
  { item: 'Practical driving test (all classes)', cost: 69.40, note: 'Q-SAFE on-road test, booked through TMR' },
  { item: 'P1 provisional licence (1 year)', cost: 94.65, note: 'Red P stage — $132.00 (2 yrs) and $163.25 (3 yrs) options' },
  { item: 'P2 provisional licence (2 years)', cost: 132.00, note: 'Green P stage — $94.65 (1 yr), $188.95 (4 yrs) and $212.00 (5 yrs) options' },
  { item: 'Open licence (1 year)', cost: 94.65, note: 'Full licence — 5-yr $212.00. Fee set by licence period; 2026-2027 schedule' },
];

/** Minimal mandatory government fees to progress from Ls to first Open licence (PrepL + Learner + HPT + Practical + P1 1-yr + P2 2-yr + Open 1-yr) */
export const QLD_STANDARD_PATHWAY_GOV_COST = 543.25;

/** Standard pathway cost if selecting a 5-year Open licence upfront ($212.00 vs $94.65) */
export const QLD_STANDARD_PATHWAY_5YR_COST = 660.60;

export interface QldLicenceTermOption {
  term: string;
  cost: number;
  costPerYear: number;
  savingsVsOneYearTotal: number;
}

/** Official QLD driver licence terms & pricing (1 to 5 years) — 2026-2027 schedule (qld.gov.au) */
export const QLD_LICENCE_TERM_OPTIONS: QldLicenceTermOption[] = [
  { term: '1 year', cost: 94.65, costPerYear: 94.65, savingsVsOneYearTotal: 0 },
  { term: '2 years', cost: 132.00, costPerYear: 66.00, savingsVsOneYearTotal: 57.30 },
  { term: '3 years', cost: 163.25, costPerYear: 54.42, savingsVsOneYearTotal: 120.70 },
  { term: '4 years', cost: 188.95, costPerYear: 47.24, savingsVsOneYearTotal: 189.65 },
  { term: '5 years', cost: 212.00, costPerYear: 42.40, savingsVsOneYearTotal: 261.25 },
];

export interface QldTrafficFine {
  offence: string;
  fine: number;
  demeritPoints: number;
  appliesTo: string;
  note: string;
}

/** QLD Road Rules, Camera Fines & Demerit Points — 2026-2027 schedule (Transport Operations Regulation & TMR) */
export const QLD_ROAD_RULES_FINES: QldTrafficFine[] = [
  {
    offence: 'Mobile phone use while driving (camera detected or police)',
    fine: 1295,
    demeritPoints: 4,
    appliesTo: 'All drivers (Learner & P1 under 25 have ZERO mobile phone privilege — no hands-free or Bluetooth)',
    note: 'Double demerits (8 pts) for repeat within 12 months. Single fine immediately triggers licence suspension for P-platers (4-point limit)!',
  },
  {
    offence: 'Driver or passenger not wearing seatbelt properly adjusted',
    fine: 1295,
    demeritPoints: 4,
    appliesTo: 'Driver (fined per unbelted passenger) and passengers 16+',
    note: 'AI cameras detect unbuckled belts or belts worn under arm. Double demerits for repeat within 12 months.',
  },
  {
    offence: 'Contravening peer passenger restriction (11:00 PM to 5:00 AM)',
    fine: 518,
    demeritPoints: 3,
    appliesTo: 'P1 provisional drivers under 25',
    note: 'Max 1 peer passenger under 21 (non-immediate family) between 11pm and 5am. 3 penalty units ($172.70/unit). Leaves only 1 demerit margin!',
  },
  {
    offence: 'Drink driving / Zero BAC breach (>0.00% BAC on L, P1, or P2)',
    fine: 2417,
    demeritPoints: 0,
    appliesTo: 'Learner, P1 and P2 drivers (must be strictly 0.00% BAC)',
    note: 'Mandatory Magistrates Court appearance. Immediate 24-hour police suspension, minimum 3 to 9 months licence disqualification, and court fine up to 14 penalty units ($2,417). Demerit points do not apply because criminal court disqualification is mandatory.',
  },
  {
    offence: 'Failing to display L or P plates (or unauthorised display)',
    fine: 276,
    demeritPoints: 2,
    appliesTo: 'Learner, P1 and P2 drivers',
    note: 'Plates must be clearly visible from 20m front and rear. Open drivers must remove plates when driving.',
  },
  {
    offence: 'Running a red traffic light (camera detected or police)',
    fine: 690,
    demeritPoints: 3,
    appliesTo: 'All drivers',
    note: 'Intersection cameras photograph vehicle crossing stop line on red signal and continuing through.',
  },
  {
    offence: 'Speeding 1–10 km/h over limit',
    fine: 345,
    demeritPoints: 1,
    appliesTo: 'All drivers',
    note: 'Lowest speeding tier. Still counts towards provisional 4-point annual cap.',
  },
  {
    offence: 'Speeding 11–20 km/h over limit',
    fine: 518,
    demeritPoints: 3,
    appliesTo: 'All drivers',
    note: '3 penalty units. Puts provisional drivers 1 point away from licence suspension.',
  },
  {
    offence: 'Speeding 21–30 km/h over limit',
    fine: 777,
    demeritPoints: 4,
    appliesTo: 'All drivers',
    note: 'Immediate 4 demerit points — instant licence suspension for P1/P2 drivers in a single offence! Double demerits for repeat in 12 months.',
  },
  {
    offence: 'Speeding 31–40 km/h over limit',
    fine: 1295,
    demeritPoints: 6,
    appliesTo: 'All drivers',
    note: 'Severe speeding offence. Double demerit points for repeat in 12 months.',
  },
  {
    offence: 'Speeding more than 40 km/h over limit',
    fine: 1986,
    demeritPoints: 8,
    appliesTo: 'All drivers',
    note: 'Automatic mandatory 6-month licence suspension plus 8 demerit points.',
  },
];

/** QLD light-vehicle registration & CTP cost components (qld.gov.au/transport/registration/fees — 2026-2027 schedule) */
export const QLD_REGO_CTP_COSTS = {
  registrationFourCylinder: 385.45,
  registrationEvOrUpToThreeCylinders: 303.10,
  registrationFiveOrSixCylinder: 602.80,
  registrationSevenOrEightCylinder: 838.10,
  trafficImprovementFee: 67.25,
  ctpClass1Min: 411.80,
  ctpClass1Max: 427.80,
  transferFee: 33.65, // TMR vehicle registration transfer fee (distinct from interstate licence transfer fee: $87.05)
  interstateLicenceTransferFee: 87.05, // TMR interstate driver licence transfer fee
  latePaymentFee: 76.65,
  penaltyUnitValue: 172.70, // QLD penalty unit value
};

/** QLD vehicle registration duty (stamp duty) rates (qld.gov.au) */
export const QLD_VEHICLE_DUTY_RATES = {
  hybridOrElectricPer100: 2.00, // $2.00 per $100 (2.0%)
  upToFourCylindersPer100: 3.00, // $3.00 per $100 (3.0%)
  fiveOrSixCylindersPer100: 3.50, // $3.50 per $100 (3.5%)
  sevenOrMoreCylindersPer100: 4.00, // $4.00 per $100 (4.0%)
  transferFee: 33.65, // TMR vehicle transfer fee
  lodgementDeadlineDays: 14, // Buyer must submit transfer within 14 days
};

export interface QldRegoCylinderTier {
  category: string;
  cylinders: string;
  registrationFee: number;
  trafficImprovementFee: number;
  ctpClass1Estimate: number;
  totalAnnualRego: number;
  transferDutyRatePct: number;
  dutyPer100: number;
  transferDutyOn5k: number;
  transferDutyOn10k: number;
  examples: string;
  economicWarning?: string;
}

/**
 * Queensland Annual Registration & Transfer Duty by Engine Cylinders (2026-2027 TMR Schedule)
 * Shows how cylinder count dramatically escalates both annual registration and purchase transfer duty.
 */
export const QLD_REGO_CYLINDER_TIERS: QldRegoCylinderTier[] = [
  {
    category: 'Electric & Up to 3 Cylinders',
    cylinders: '1–3 Cylinders / Electric / Rotary (1 rotor)',
    registrationFee: 303.10,
    trafficImprovementFee: 67.25,
    ctpClass1Estimate: 419.80,
    totalAnnualRego: 790.15,
    transferDutyRatePct: 2.0,
    dutyPer100: 2.00,
    transferDutyOn5k: 100,
    transferDutyOn10k: 200,
    examples: 'BYD Dolphin, MG4, Nissan Leaf, Mitsubishi Mirage (3-cyl)',
    economicWarning: 'Lowest ongoing registration in QLD; qualifies for 2.0% transfer duty green concession.',
  },
  {
    category: '4 Cylinders (First Car Sweet Spot)',
    cylinders: '4 Cylinders / 2 Rotors',
    registrationFee: 385.45,
    trafficImprovementFee: 67.25,
    ctpClass1Estimate: 419.80,
    totalAnnualRego: 872.50,
    transferDutyRatePct: 3.0,
    dutyPer100: 3.00,
    transferDutyOn5k: 150,
    transferDutyOn10k: 300,
    examples: 'Toyota Corolla, Hyundai i30, Mazda 3, Kia Cerato',
    economicWarning: 'The recommended sweet spot for young drivers: balanced rego, affordable insurance, standard 3.0% duty.',
  },
  {
    category: '5 or 6 Cylinders (Higher Ongoing Cost)',
    cylinders: '5–6 Cylinders / 3 Rotors',
    registrationFee: 602.80,
    trafficImprovementFee: 67.25,
    ctpClass1Estimate: 419.80,
    totalAnnualRego: 1089.85,
    transferDutyRatePct: 3.5,
    dutyPer100: 3.50,
    transferDutyOn5k: 175,
    transferDutyOn10k: 350,
    examples: 'Holden Commodore V6, Ford Falcon 4.0L, Subaru Outback 3.6R',
    economicWarning: 'Adds +$217/yr in base rego over a 4-cyl; 3.5% duty rate; higher fuel burn (+30-40%).',
  },
  {
    category: '7 or 8 Cylinders (V8 Money Pit)',
    cylinders: '7–8 Cylinders',
    registrationFee: 838.10,
    trafficImprovementFee: 67.25,
    ctpClass1Estimate: 419.80,
    totalAnnualRego: 1325.15,
    transferDutyRatePct: 4.0,
    dutyPer100: 4.00,
    transferDutyOn5k: 200,
    transferDutyOn10k: 400,
    examples: 'Holden Commodore V8, Ford Falcon XR8, Toyota LandCruiser V8',
    economicWarning: 'Adds +$453/yr in rego over a 4-cyl ($2,265 extra over 5 years!); 4.0% duty rate; severe under-25 insurance surcharge.',
  },
];

export interface RoadsideAssistanceBenchmark {
  provider: string;
  state: string;
  planName: string;
  annualFee: number;
  towingDistanceKm: number;
  calloutsPerYear: string;
  keyFeatures: string;
}

/** Roadside Assistance benchmark options for Australian drivers (2026-2027) */
export const ROADSIDE_ASSISTANCE_BENCHMARKS: RoadsideAssistanceBenchmark[] = [
  {
    provider: 'RACQ',
    state: 'QLD',
    planName: 'Everyday Roadside',
    annualFee: 109,
    towingDistanceKm: 20,
    calloutsPerYear: 'Unlimited standard callouts',
    keyFeatures: 'Covers vehicle for any driver; flat tyres, flat battery jumpstarts, fuel delivery, lockout assistance, 20km metro towing.',
  },
  {
    provider: 'RACQ',
    state: 'QLD',
    planName: 'Everyday Plus',
    annualFee: 179,
    towingDistanceKm: 50,
    calloutsPerYear: 'Unlimited callouts',
    keyFeatures: 'Extended 50km towing radius; caravan & boat trailer cover; up to $1,100 breakdown accommodation or rental car benefit.',
  },
  {
    provider: 'NRMA',
    state: 'NSW / ACT',
    planName: 'Everyday Care',
    annualFee: 139,
    towingDistanceKm: 25,
    calloutsPerYear: 'Unlimited standard callouts',
    keyFeatures: '24/7 roadside assistance, mobile battery replacement, lockout assistance, free metro towing up to 25km.',
  },
];

/** Typical driving lesson cost in South East Queensland (per hour), Oct 2026 — most schools $75–$90/hr (median ~$85); 10-lesson blocks from ~$850 */
export const QLD_DRIVING_LESSON_RANGE = { min: 75, max: 95 };

/** Typical lessons a new learner books before the practical test (~10-lesson blocks ≈ $850) */
export const TYPICAL_LESSON_COUNT = 10;

// ============================================================================
// 1. OFFICIAL PPSR SEARCH PARAMETERS & WARNINGS
// ============================================================================

export interface PpsrFactorCheck {
  factor: string;
  description: string;
  riskIfNotChecked: string;
}

export interface PpsrSearchData {
  officialFee: number; // 2.00 AUD (GST exempt)
  officialUrl: string;
  registerName: string;
  governingBody: string;
  thirdPartyMarkupRange: { min: number; max: number };
  thirdPartyWarning: string;
  whatItChecks: PpsrFactorCheck[];
  buyerChecklist: string[];
}

/** Official PPSR (Personal Property Securities Register) benchmark data — 2026-2027 */
export const OFFICIAL_PPSR_DATA: PpsrSearchData = {
  officialFee: 2.00,
  officialUrl: 'https://www.ppsr.gov.au',
  registerName: 'Personal Property Securities Register (PPSR)',
  governingBody: 'Australian Financial Security Authority (AFSA)',
  thirdPartyMarkupRange: { min: 25, max: 35 },
  thirdPartyWarning:
    'CAUTION: Do not pay $25 to $35+ on commercial reseller websites ranking on Google Ads. The official Australian Government search fee on ppsr.gov.au is strictly $2.00 (exempt from GST). Third-party sites often run the identical $2 search and pocket a 12x–17x markup.',
  whatItChecks: [
    {
      factor: 'Security Interest (Car Loan / Chattel Mortgage Owing)',
      description:
        'Verifies if a bank, finance company, or dealership holds a registered legal claim over the car from an unpaid loan or debt.',
      riskIfNotChecked:
        'Under section 45 of the PPSA 2009, if the previous owner defaults on their loan, the lender can legally seize and repossess YOUR car with $0 compensation, even if you bought it in complete good faith.',
    },
    {
      factor: 'Written-Off Vehicle Register (NEVDIS Total Loss)',
      description:
        'Checks national records to confirm whether the vehicle was ever declared a total loss due to structural collision, flood, hail, or fire damage.',
      riskIfNotChecked:
        'Statutory write-offs can NEVER legally be registered or driven again in Australia. Repairable write-offs suffer a 20%–30% drop in market resale value and may have hidden structural fatigue.',
    },
    {
      factor: 'Stolen Vehicle Status (NEVDIS / Police Register)',
      description:
        'Confirms the vehicle has not been reported stolen on national police registers across any Australian state or territory.',
      riskIfNotChecked:
        'If you buy a stolen car, police will confiscate it immediately upon detection and return it to the original owner or insurer. You will lose the car and 100% of the money you paid.',
    },
    {
      factor: 'Odometer Inspection History',
      description:
        'Displays historical odometer readings recorded during safety inspections or transfer events to uncover odometer rollbacks.',
      riskIfNotChecked:
        'Odometer tampering hides hundreds of thousands of kilometres of wear and tear, masking impending engine or transmission failure.',
    },
  ],
  buyerChecklist: [
    'Always search using the 17-character VIN (Vehicle Identification Number), NOT just the registration number (plates can be swapped or cloned).',
    'Physically cross-check that the VIN stamped on the car chassis, door jamb, and engine bay matches the registration certificate and the PPSR certificate.',
    'Perform the $2 search on ppsr.gov.au on the EXACT DAY of purchase immediately prior to handing over money (ensures statutory search window protection under the PPSA).',
    'Download and retain the official Australian Government PDF search certificate with its unique search number and timestamp for your records.',
  ],
};

// ============================================================================
// 2. QLD CTP INSURANCE CLASS 1 SCHEME & PROVIDERS
// ============================================================================

export interface QldCtpProvider {
  name: string;
  annualTotalEstimate: number; // Class 1 private passenger total (incl. all levies)
  insurerBasePortion: number; // Insurer premium portion (~$340-$370)
  statutoryLeviesPortion: number; // Statutory levies + TMR admin (~$73.80)
  marketShareNotes: string;
}

export interface QldCtpClass1Breakdown {
  regulationBody: string;
  governingAct: string;
  vehicleClass: string;
  class1MinAnnual: number;
  class1MaxAnnual: number;
  class1AverageAnnual: number;
  insurerPremiumRange: { min: number; max: number };
  statutoryLeviesTotal: number;
  leviesBreakdown: {
    niisqLevy: number;
    statutoryInsuranceSchemeLevy: number;
    hospitalEmergencyLevy: number;
    nominalDefendantLevy: number;
    tmrAdminFee: number;
  };
  racqMarketExitNote: string;
  criticalCoverageNotice: string;
}

/** Licensed QLD CTP insurers and Class 1 indicative rates — 2026-2027 (MAIC regulated) */
export const QLD_CTP_PROVIDERS: QldCtpProvider[] = [
  {
    name: 'Suncorp Insurance',
    annualTotalEstimate: 414.20,
    insurerBasePortion: 340.40,
    statutoryLeviesPortion: 73.80,
    marketShareNotes: 'Largest QLD CTP underwriter; highly competitive quarterly filings within MAIC band.',
  },
  {
    name: 'Allianz Australia',
    annualTotalEstimate: 418.60,
    insurerBasePortion: 344.80,
    statutoryLeviesPortion: 73.80,
    marketShareNotes: 'Consistently priced near scheme median across all quarters.',
  },
  {
    name: 'QBE Insurance',
    annualTotalEstimate: 422.80,
    insurerBasePortion: 349.00,
    statutoryLeviesPortion: 73.80,
    marketShareNotes: 'Third licensed underwriter in the Queensland private vehicle CTP market.',
  },
];

/** Detailed QLD CTP Class 1 statutory breakdown (Motor Accident Insurance Commission, Oct 2026 schedule) */
export const QLD_CTP_CLASS1_BREAKDOWN: QldCtpClass1Breakdown = {
  regulationBody: 'Motor Accident Insurance Commission (MAIC)',
  governingAct: 'Motor Accident Insurance Act 1994 (Qld)',
  vehicleClass: 'Class 1 (Cars, station wagons, and light utilities under 4.5t GVM)',
  class1MinAnnual: 411.80,
  class1MaxAnnual: 427.80,
  class1AverageAnnual: 419.80,
  insurerPremiumRange: { min: 338.00, max: 354.00 },
  statutoryLeviesTotal: 73.80,
  leviesBreakdown: {
    niisqLevy: 106.60, // National Injury Insurance Scheme Queensland (lifetime catastrophic care)
    statutoryInsuranceSchemeLevy: 1.40,
    hospitalEmergencyLevy: 20.60,
    nominalDefendantLevy: 8.40,
    tmrAdminFee: 8.50,
  },
  racqMarketExitNote:
    'IMPORTANT NOTE: RACQ formally exited the Queensland CTP underwriting market on 1 October 2023. RACQ members choose Suncorp, Allianz, or QBE on their registration renewal notice. RACQ continues to sell voluntary Comprehensive and Third-Party Property policies.',
  criticalCoverageNotice:
    'CRITICAL INSURANCE WARNING: CTP covers $0 of vehicle or property damage! It strictly covers liability for personal injury caused to other people (and catastrophic treatment under NIISQ). If you cause an accident and damage someone else\'s vehicle, CTP pays nothing toward their car repairs. Every driver needs at least Third-Party Property Damage insurance to protect against crippling personal liability.',
};

// ============================================================================
// 3. YOUNG DRIVER INSURANCE PROFILES & EXCESS BENCHMARKS (16-20yo)
// ============================================================================

export interface YoungDriverInsuranceProfile {
  ageGroup: string;
  licenceStage: string;
  comprehensiveRange: { min: number; max: number; median: number };
  thirdPartyPropertyRange: { min: number; max: number; median: number };
  typicalTotalExcess: number;
  riskNotes: string;
}

export interface YoungDriverExcessBreakdown {
  standardExcess: number;
  ageExcessUnder21: number;
  inexperiencedDriverExcess: number;
  unlistedDriverExcess: number;
  totalAtFaultExcessEstimate: number;
}

/** Comprehensive & Third-Party Property Insurance benchmarks for young drivers (16-20yo in QLD, 2026-2027) */
export const YOUNG_DRIVER_INSURANCE_PROFILES: YoungDriverInsuranceProfile[] = [
  {
    ageGroup: '16–17 years old',
    licenceStage: 'Learner (L) to Provisional P1 (Red P)',
    comprehensiveRange: { min: 2100, max: 2800, median: 2450 },
    thirdPartyPropertyRange: { min: 480, max: 680, median: 580 },
    typicalTotalExcess: 2100,
    riskNotes:
      'Highest statistical risk tier. Comprehensive insurance can equal over 50% of the market value of a $4,500 runabout every single year. Third-Party Property Damage (TPPD) is the sensible, cost-effective alternative for older cash cars.',
  },
  {
    ageGroup: '18–19 years old',
    licenceStage: 'Provisional P1 / P2 (Green P)',
    comprehensiveRange: { min: 1800, max: 2500, median: 2150 },
    thirdPartyPropertyRange: { min: 440, max: 620, median: 520 },
    typicalTotalExcess: 1800,
    riskNotes:
      'Gradual decrease as the driver progresses to P2 plates and builds 1–2 years of verified claim-free driving history.',
  },
  {
    ageGroup: '20 years old',
    licenceStage: 'Provisional P2 / Open Licence',
    comprehensiveRange: { min: 1600, max: 2200, median: 1850 },
    thirdPartyPropertyRange: { min: 380, max: 540, median: 450 },
    typicalTotalExcess: 1500,
    riskNotes:
      'Premiums begin easing as drivers approach adult age brackets; inexperience loadings drop substantially after age 21 and 25.',
  },
];

/** Typical out-of-pocket claim excess breakdown for under-21 drivers involved in an at-fault accident */
export const YOUNG_DRIVER_EXCESS_BREAKDOWN: YoungDriverExcessBreakdown = {
  standardExcess: 650,
  ageExcessUnder21: 800,
  inexperiencedDriverExcess: 650,
  unlistedDriverExcess: 1500,
  totalAtFaultExcessEstimate: 2100,
};

/** Young driver insurance money-saving tips & fraud warnings */
export const YOUNG_DRIVER_INSURANCE_TIPS = [
  {
    tip: 'Avoid "Fronting" (Listing a Parent as Primary Driver)',
    detail:
      'Never list a parent as the main driver if the young driver drives the car the majority of the time. Insurers investigate collision claims thoroughly; discovering fronting is treated as insurance fraud, resulting in outright claim denial and policy cancellation.',
  },
  {
    tip: 'Choose Third-Party Property Damage for Sub-$6,000 Cars',
    detail:
      'If your car is worth $4,000 to $5,000, paying $2,400/year for comprehensive insurance means you repurchased the car in insurance fees every 2 years! Third-Party Property Damage ($450–$650/yr) covers up to $20M in damage you cause to other luxury cars while you self-insure your own runabout.',
  },
  {
    tip: 'Pay Annually Instead of Monthly',
    detail:
      'Insurers charge 10% to 18% extra in administration and interest fees when paying month-to-month. Paying annually saves $200–$400 upfront.',
  },
  {
    tip: 'Select Cars with Low Risk Profiles and High ANCAP Safety',
    detail:
      'Small 4-cylinder naturally aspirated hatchbacks (Corolla, i30, Cerato) have the lowest statistical claims rates. Turbocharged, modified, rear-wheel-drive, or older performance cars incur massive risk loadings.',
  },
  {
    tip: 'Take Advantage of Low-Kilometre or Pay-As-You-Drive Discounts',
    detail:
      'If driving under 10,000 km/year (e.g., local commute to school, uni, or part-time work), choose a pay-as-you-drive policy for discounts of 15% to 25%.',
  },
];

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
 * First-car running-cost defaults for QLD under-25 drivers (2026-2027 parameters) — the single
 * source of truth for the teen-car calculator defaults.
 */
export const FIRST_CAR_COST_DEFAULTS: FirstCarCostDefaults = {
  averagePurchasePrice: 4500, // typical teen first-car budget (used small hatch)
  regoAnnual:
    QLD_REGO_CTP_COSTS.registrationFourCylinder + QLD_REGO_CTP_COSTS.trafficImprovementFee, // $452.70 (4-cyl, excl. CTP)
  ctpAnnual: (QLD_REGO_CTP_COSTS.ctpClass1Min + QLD_REGO_CTP_COSTS.ctpClass1Max) / 2, // $419.80 (midpoint of Class 1 CTP)
  comprehensiveInsuranceUnder25: 1650, // under-25 comprehensive quotes $1,532–$2,178 (iSelect, Oct 2026)
  servicingAnnual: 450, // annual logbook service + fluid changes for a used hatch
  tiresAndRepairsAnnual: 350, // tyres amortised over life + minor repairs
  fuelWeekly: 50, // ~15,000 km/yr @ 6.5–7.0L/100km @ $2.38/L ULP 91 ≈ $49.66/wk
  roadsideAssistanceAnnual: 109, // RACQ Everyday roadside assistance (racq.com.au)
};

// ============================================================================
// 4. FUEL & EV CHARGING BENCHMARKS
// ============================================================================

export interface BrisbaneFuelPrice {
  fuel: string;
  pricePerLitre: number; // avg $/L 2026-2027
  note: string;
}

/** Brisbane retail fuel prices (FuelRadar, PetrolSpy, BP terminal gate prices, RACQ quarterly reports) */
export const BRISBANE_FUEL_PRICES: BrisbaneFuelPrice[] = [
  { fuel: 'E10', pricePerLitre: 2.34, note: 'Cheapest ethanol blend — typically 2–5c under ULP 91; cycle range ~$2.05 to $2.34/L' },
  { fuel: 'Unleaded 91', pricePerLitre: 2.38, note: 'Brisbane daily cycle peak 237.7c/L; cycle average ~$2.10–$2.38/L (sawtooth cycle trough dips to ~$1.80–$1.95/L)' },
  { fuel: 'Premium 95', pricePerLitre: 2.50, note: 'For engines requiring 95 RON min — ~12–15c over 91 (Fuel Daddy Brisbane avg U95: 250.0c–255.0c)' },
  { fuel: 'Premium 98', pricePerLitre: 2.63, note: 'Brisbane ULP 98 average ~$2.63/L at cycle peaks' },
  { fuel: 'Diesel', pricePerLitre: 2.66, note: 'Brisbane diesel ~265.5c/L — steadier pricing with no retail sawtooth price cycle' },
  { fuel: 'LPG', pricePerLitre: 1.15, note: 'Australia average ~115c/L — scarce availability; requires dedicated LPG conversion' },
];

export interface BrisbaneFuelCycleMetrics {
  typicalCycleDaysMin: number; // ~28 days (4 weeks)
  typicalCycleDaysMax: number; // ~45 days (6.5 weeks)
  averageCycleDays: number; // ~35 days (5 weeks)
  troughPriceUlp91Min: number; // 1.80 AUD/L
  troughPriceUlp91Max: number; // 1.95 AUD/L
  peakPriceUlp91Min: number; // 2.30 AUD/L
  peakPriceUlp91Max: number; // 2.45 AUD/L
  priceDifferencePerLitre: number; // ~0.40 - $0.55/L spread (avg 0.50)
  savingsPer50LTank: number; // $20.00 - $27.50 per tank
  annualCommuterSavings: number; // $400 - $600/year (15,000km/yr @ 7.5L/100km = 1,125L/yr)
  discountingPhaseDurationWeeks: string; // "4 to 5 weeks gradual price erosion (~1-2c/day)"
  hikePhaseDurationHours: string; // "Rapid 24 to 48 hours spike (+25c to +50c/L)"
}

export const BRISBANE_FUEL_CYCLE_METRICS: BrisbaneFuelCycleMetrics = {
  typicalCycleDaysMin: 28,
  typicalCycleDaysMax: 45,
  averageCycleDays: 35,
  troughPriceUlp91Min: 1.80,
  troughPriceUlp91Max: 1.95,
  peakPriceUlp91Min: 2.30,
  peakPriceUlp91Max: 2.45,
  priceDifferencePerLitre: 0.50,
  savingsPer50LTank: 25.00,
  annualCommuterSavings: 562.50,
  discountingPhaseDurationWeeks: '4 to 5 weeks gradual price drop (~1–2¢/day)',
  hikePhaseDurationHours: '24 to 48 hours rapid surge (+25¢ to +50¢/L)',
};

export interface QldFuelReportingScheme {
  regulation: string;
  governingAct: string;
  enforcementAgency: string;
  reportingWindowMinutes: number;
  maximumPenaltyUnits: number;
  openDataAggregation: string;
  consumerApps: string[];
  fairFuelIndicatorNotes: string;
}

/** Mandatory real-time fuel price reporting in Queensland (Fair Trading Regulation 2018) */
export const QLD_FUEL_REPORTING_SCHEME: QldFuelReportingScheme = {
  regulation: 'Fair Trading (Fuel Price Reporting) Regulation 2018',
  governingAct: 'Fair Trading Act 1989 (Qld)',
  enforcementAgency: 'Queensland Office of Fair Trading (OFT)',
  reportingWindowMinutes: 30, // Retailers must report price changes to state aggregator within 30 mins
  maximumPenaltyUnits: 20, // Infringement notices and statutory fines up to 20 penalty units
  openDataAggregation: 'Central electronic aggregation system publishing real-time open data to authorised publishers',
  consumerApps: ['RACQ Fuel and Deals (Fair Fuel Finder)', 'PetrolSpy', 'FuelRadar', 'MotorMouth', 'Simples'],
  fairFuelIndicatorNotes:
    'RACQ Fair Fuel monitors live open data to rate bowser prices (fair vs unfair) and track Brisbane cycle phases (bottom/trough vs spike/peak), steering motorists to fill up before price hikes.',
};

/** Brisbane fuel price cycle — historically an extended ~4 to 6.5-week "sawtooth" (ACCC & RACQ). Fill at the trough or use live fuel apps. */
export const BRISBANE_PRICE_CYCLE = {
  days: 35,
  durationRange: '4 to 6.5 weeks (28–45 days)',
  troughRange: '$1.80 – $1.95 / L',
  peakRange: '$2.30 – $2.45 / L',
  annualCommuterSavings: '$400 – $600 / year',
  note: 'Brisbane and South East Queensland run an asymmetric ~4 to 6.5-week "sawtooth" price cycle tracked by RACQ and the ACCC. Prices fall slowly by 1–2¢/day over 4–5 weeks until bottoming out at ~$1.80–$1.95/L, then surge 25–50¢/L in just 24–48 hours to peak at ~$2.30–$2.45/L. Filling only during the trough saves $20–$27.50 per 50L tank — yielding $400–$600/year in annual commuting savings for a typical driver!',
};

export interface EvChargingTier {
  tier: string;
  pricePerKwh: number;
  typicalRateRange: string;
  sourceOrProvider: string;
  notes: string;
}

/** EV charging tariff tiers in South East Queensland (Energex network, 2026-2027) */
export const EV_CHARGING_TIERS: EvChargingTier[] = [
  {
    tier: 'Rooftop Solar Self-Consumption',
    pricePerKwh: 0.07,
    typicalRateRange: '$0.05 – $0.08 / kWh',
    sourceOrProvider: 'Home Solar PV System',
    notes: 'Opportunity cost of solar feed-in tariff (FIT) forgone. The cheapest possible way to fuel an EV in Queensland.',
  },
  {
    tier: 'Home Dedicated EV / Super Off-Peak',
    pricePerKwh: 0.20,
    typicalRateRange: '$0.18 – $0.22 / kWh',
    sourceOrProvider: 'Energex Controlled Load 2 / Retailer EV Night Tariffs (e.g. 12am–6am)',
    notes: 'Dedicated overnight EV charging window. Fully replenishes a 60 kWh battery from 10% to 80% for ~$8.40.',
  },
  {
    tier: 'Home Flat Residential Tariff',
    pricePerKwh: 0.28,
    typicalRateRange: '$0.26 – $0.30 / kWh',
    sourceOrProvider: 'AER Default Market Offer (DMO 2026-27, Energex Network: 27.97c/kWh)',
    notes: 'Standard single-rate home tariff. Charging at any time of day costs ~2.5x less than equivalent petrol per 100km.',
  },
  {
    tier: 'Public Destination AC (7kW–22kW)',
    pricePerKwh: 0.40,
    typicalRateRange: '$0.35 – $0.50 / kWh',
    sourceOrProvider: 'Shopping centres, councils, hotels (Chargefox, Exploren)',
    notes: 'Slow AC charging while parked for 2–4 hours. Some council and shopping centres offer free 1–2 hr top-ups.',
  },
  {
    tier: 'Public DC Fast / Ultra-Rapid (50kW–350kW)',
    pricePerKwh: 0.65,
    typicalRateRange: '$0.55 – $0.75 / kWh',
    sourceOrProvider: 'Evie Networks, Chargefox, BP Pulse, Tesla Supercharger',
    notes: 'High-speed highway corridor charging (adds ~250km in 20-30 min). Per-km cost approaches efficient petrol hatchbacks.',
  },
];

export interface EvVsPetrolDefaults {
  kmPerYear: number;
  petrolLPer100km: number;
  petrolPricePerLitre: number;
  evKwhPer100km: number;
  homeOffPeakPricePerKwh: number;
  publicFastPricePerKwh: number;
  publicFastSharePct: number; // % of EV charging done at public fast chargers
}

/** Default 2026-2027 assumptions for the EV vs Petrol comparator */
export const EV_VS_PETROL_DEFAULTS: EvVsPetrolDefaults = {
  kmPerYear: 15000,
  petrolLPer100km: 7.5, // typical small hatchback in mixed Brisbane traffic (2026-2027)
  petrolPricePerLitre: 2.38, // Brisbane ULP 91 cycle benchmark
  evKwhPer100km: 15.0, // typical compact EV (e.g. BYD Dolphin / MG4 / Atto 3)
  homeOffPeakPricePerKwh: 0.28, // AER Default Market Offer 2026-27: Energex flat residential 27.97c/kWh
  publicFastPricePerKwh: 0.65, // DC public fast charging ~55–75c/kWh; ~65c at Evie/Chargefox hubs
  publicFastSharePct: 10, // 90% home charging / 10% public fast charging
};

// ============================================================================
// 5. MAINTENANCE BENCHMARKS: USED HATCHBACK VS EV
// ============================================================================

export interface CarMaintenanceBenchmark {
  model: string;
  category: 'ICE Petrol' | 'Hybrid' | 'Electric (EV)';
  serviceInterval: string;
  annualServiceCost: { min: number; max: number; average: number };
  fiveYearMaintenanceTotal: number;
  brakesLifespanKm: string;
  tyresLifespanKm: string;
  timingMechanism: 'Timing Chain (No replacement)' | 'Timing Belt (Replace every 100k km)' | 'Direct Drive / Reduction Gear';
  keyAdvantages: string;
  firstCarBuyerTips: string;
}

/** Real-world maintenance & reliability benchmarks for popular used first cars in Australia */
export const CAR_MAINTENANCE_BENCHMARKS: CarMaintenanceBenchmark[] = [
  {
    model: 'Toyota Corolla (1.8L / 2.0L Petrol / Hybrid)',
    category: 'ICE Petrol',
    serviceInterval: '12 months or 15,000 km',
    annualServiceCost: { min: 245, max: 350, average: 280 },
    fiveYearMaintenanceTotal: 1750,
    brakesLifespanKm: '50,000 – 70,000 km (Pads) / 100,000 km (Rotors)',
    tyresLifespanKm: '45,000 – 60,000 km',
    timingMechanism: 'Timing Chain (No replacement)',
    keyAdvantages:
      'Gold standard for first-car reliability in Australia; lowest capped-price servicing fees; abundant cheap aftermarket and wreckers parts; rock-solid resale value.',
    firstCarBuyerTips:
      'Check logbook for regular 10,000–15,000 km oil changes. Beware ex-rideshare or delivery vehicles with 250,000+ km disguised with fake stamps.',
  },
  {
    model: 'Hyundai i30 (2.0L / 1.6L Petrol)',
    category: 'ICE Petrol',
    serviceInterval: '12 months or 15,000 km',
    annualServiceCost: { min: 300, max: 420, average: 350 },
    fiveYearMaintenanceTotal: 1950,
    brakesLifespanKm: '45,000 – 65,000 km',
    tyresLifespanKm: '40,000 – 55,000 km',
    timingMechanism: 'Timing Chain (No replacement)',
    keyAdvantages:
      'High reliability record, modern infotainment (Apple CarPlay/Android Auto standard on 2017+ models), extensive independent mechanic familiarity.',
    firstCarBuyerTips:
      'Check clutch pedal engagement on manual models, and ensure dual-clutch automatic transmissions (DCT on 1.6T models) shift cleanly without shuddering at low speeds.',
  },
  {
    model: 'Mazda 3 (2.0L / 2.5L SkyActiv Petrol)',
    category: 'ICE Petrol',
    serviceInterval: '12 months or 10,000 km (shorter interval!)',
    annualServiceCost: { min: 340, max: 480, average: 390 },
    fiveYearMaintenanceTotal: 2350,
    brakesLifespanKm: '40,000 – 60,000 km',
    tyresLifespanKm: '40,000 – 50,000 km',
    timingMechanism: 'Timing Chain (No replacement)',
    keyAdvantages:
      'Premium interior craftsmanship, engaging driving dynamics, durable naturally aspirated SkyActiv engines.',
    firstCarBuyerTips:
      'CRITICAL: Mazda 3 requires servicing every 10,000 km (rather than 15,000 km). Driving 15,000 km/year requires 3 services every 2 years, increasing long-term maintenance costs.',
  },
  {
    model: 'Kia Cerato (2.0L Petrol)',
    category: 'ICE Petrol',
    serviceInterval: '12 months or 15,000 km',
    annualServiceCost: { min: 320, max: 520, average: 380 },
    fiveYearMaintenanceTotal: 2150,
    brakesLifespanKm: '45,000 – 65,000 km',
    tyresLifespanKm: '40,000 – 55,000 km',
    timingMechanism: 'Timing Chain (No replacement)',
    keyAdvantages:
      '7-year factory warranty transfers to subsequent owners if within age and kilometre caps; spacious cabin and practical hatchback cargo volume.',
    firstCarBuyerTips:
      'Minor logbook services are affordable (~$320), but major milestone services (e.g. 4-year / 60,000 km) spike to $650+. Ask the seller if the 60,000 km service has already been completed.',
  },
  {
    model: 'Electric Vehicle (e.g. BYD Dolphin / Atto 3, MG4, Tesla Model 3)',
    category: 'Electric (EV)',
    serviceInterval: '12–24 months or 20,000 km (or condition-based)',
    annualServiceCost: { min: 150, max: 250, average: 190 },
    fiveYearMaintenanceTotal: 980,
    brakesLifespanKm: '100,000 – 150,000+ km (Regenerative braking saves friction pads)',
    tyresLifespanKm: '35,000 – 45,000 km (Faster wear due to battery mass and instant torque)',
    timingMechanism: 'Direct Drive / Reduction Gear',
    keyAdvantages:
      '40% to 60% cheaper annual maintenance than petrol hatches; zero oil changes, spark plugs, timing belts, fuel filters, exhaust mufflers, or catalytic converters; brake pads last over 100,000 km.',
    firstCarBuyerTips:
      'Consumables warning: EV tyres wear 15%–25% faster due to battery weight and instant electric motor torque. Budget $700–$1,000 for quality low-rolling-resistance tyres every 3–4 years. Always request a high-voltage battery State of Health (SOH) readout before purchasing used.',
  },
];

// ============================================================================
// 6. FIRST-CAR BUYER CHECKLIST & RED FLAGS
// ============================================================================

export interface FirstCarBuyerStep {
  stepNumber: number;
  title: string;
  cost: string;
  description: string;
  redFlags: string[];
}

export const FIRST_CAR_BUYER_CHECKLIST: FirstCarBuyerStep[] = [
  {
    stepNumber: 1,
    title: 'Pre-Inspection Online Background Check',
    cost: '$2.00 (ppsr.gov.au)',
    description:
      'Obtain the 17-character VIN from the seller and run a $2 search on ppsr.gov.au. Confirm $0 finance owing, zero statutory/repairable write-off records, and no stolen vehicle alerts.',
    redFlags: [
      'Seller refuses to provide the VIN before meeting.',
      'PPSR shows registered finance interest (bank can repossess car).',
      'Listed as statutory write-off (illegal to register in Australia).',
    ],
  },
  {
    stepNumber: 2,
    title: 'QLD Safety Certificate (Roadworthy / RWC)',
    cost: '$0 (Seller\'s legal obligation)',
    description:
      'In Queensland, private sellers are legally required to obtain a valid Safety Certificate before offering a light vehicle for sale. Certificates are valid for 2 months or 2,000 km (whichever comes first) for private sellers.',
    redFlags: [
      'Seller claims "it will easily pass a roadworthy, you just get it yourself". Never buy without an existing, verified Safety Certificate.',
      'Safety Certificate expired or issued for a different VIN.',
    ],
  },
  {
    stepNumber: 3,
    title: 'Independent Mechanical Pre-Purchase Inspection',
    cost: '$180 – $280',
    description:
      'Hire a mobile mechanic (RACQ, RedBook Inspect, or trusted local workshop) to inspect engine compression, transmission shifting, suspension bushings, cooling system, and underbody structural rust.',
    redFlags: [
      'Seller refuses to allow a professional mobile mechanic to inspect the vehicle.',
      'Milky white substance under engine oil cap (blown head gasket).',
      'Blue or thick white smoke from exhaust upon acceleration.',
    ],
  },
  {
    stepNumber: 4,
    title: 'Test Drive & Operational Checks',
    cost: '$0',
    description:
      'Drive the car from a completely cold start. Test air conditioning, power windows, wipers, lights, reverse gear, emergency brake on a hill, and feel for vibrations at 80–100 km/h on an open road.',
    redFlags: [
      'Engine is already warm when you arrive (seller may be hiding hard cold-start issues or smoky morning starts).',
      'Car pulls to one side when braking in a straight line.',
      'Check engine light illuminated or bulb removed to hide error codes.',
    ],
  },
  {
    stepNumber: 5,
    title: 'Transfer of Vehicle Registration & Duty',
    cost: '$33.65 transfer fee + 3.0%–3.5% stamp duty',
    description:
      'Complete the TMR vehicle transfer application (Form F3520 or via myaccount.qld.gov.au within 14 days). Queensland vehicle registration transfer duty is $3.00 per $100 for 1–4 cylinder/hybrid/EV vehicles up to $4,500.',
    redFlags: [
      'Seller requests understating purchase price on transfer form to dodge stamp duty (violates TMR regulations and voids dispute protections).',
      'Name on registration papers does not match the seller\'s driver licence.',
    ],
  },
];

// ============================================================================
// 7. BRISBANE PARKING ZONES & RULES
// ============================================================================

export interface BrisbaneParkingZone {
  zone: string;
  area: string;
  weekdayHourly: number; // indicative $/hr weekday short-stay (≤3hr)
  weekendHourly: string;
  freeAfter7pm: string;
  note: string;
}

/** Brisbane on-street parking zones (Brisbane City Council rates verified for 2026-2027) */
export const BRISBANE_PARKING_ZONES: BrisbaneParkingZone[] = [
  {
    zone: 'Zone 1',
    area: 'Brisbane CBD (Inner Core)',
    weekdayHourly: 6.85,
    weekendHourly: '$3.70/hr (≤3hr) / $2.55/hr (4hr+, capped $14.25)',
    freeAfter7pm: 'Free after 7pm on weekends; Mon–Fri free after 7pm only in 4hr+ meters (≤3hr meters charged $3.70/hr to midnight)',
    note: 'Highest demand area. Weekday 7am–7pm: $6.85/hr (≤3hr) or $4.50/hr for 4hr+ (capped $18.25/day). Weekends: NOT free during daytime — $3.70/hr (7am–7pm). Free 15 mins available with rego registration.',
  },
  {
    zone: 'Zone 2',
    area: 'City Fringe (Fortitude Valley, South Brisbane, Spring Hill, Milton)',
    weekdayHourly: 4.95,
    weekendHourly: '$3.45/hr (≤3hr, 7am–7pm)',
    freeAfter7pm: 'Free after 7pm on weekends; Mon–Fri free after 7pm only in 4hr+ meters (≤3hr meters charged $3.45/hr to midnight)',
    note: 'Fringe entertainment & office hubs. Weekday 7am–7pm: $4.95/hr (≤3hr) or $3.45/hr for 4hr+ (capped $16.75/day). Weekends: $3.45/hr (≤3hr, 7am–7pm). Check event zones near Suncorp Stadium (Milton) / Gabba.',
  },
  {
    zone: 'Zone 3',
    area: 'Suburbs across Brisbane (Outer Fringe)',
    weekdayHourly: 3.45,
    weekendHourly: 'FREE all weekend (meters do not operate Sat/Sun)',
    freeAfter7pm: 'Free after 7pm Mon–Fri in 4hr+ meters (≤3hr meters metered 7am–10pm at $3.45/hr)',
    note: 'Suburban commercial strips. 4hr+ meters discounted to $2.45/hr (capped $13.25/day). Completely free all day Saturday & Sunday. Check every sign — fines are $90+.',
  },
];

/** Free parking golden rules (Brisbane City Council) */
export const BRISBANE_FREE_PARKING_TIPS = [
  'Free 15-minute parking in 7,500+ on-street spaces — BUT you MUST start a session at the meter or in the CellOPark / PayStay app with your vehicle rego to avoid a fine.',
  'Weekend parking trap: In Zone 1 (CBD) and Zone 2 (Fortitude Valley, South Brisbane, Spring Hill), parking is NOT free on Saturday/Sunday daytime (charged $3.70/hr or $3.45/hr between 7am and 7pm).',
  'Zone 3 (suburbs) is 100% free all weekend (Saturday and Sunday), and free after 7pm on weeknights for 4hr+ meters.',
  'Evening free parking: In Zone 1 & 2, long-stay (4hr+) meters are free after 7pm Mon–Fri, but short-stay (≤3hr) meters remain metered until midnight.',
  'Check every sign — clearways, transit lanes, and passenger loading zones carry $150–$300+ tow-away fees!',
];

/** Indicative off-street (car park) daily rates in the Brisbane CBD (Parkhound / Ray White 2026) */
export const BRISBANE_OFFSTREET_PARKING = {
  dailyMax: '$78–83',
  note: 'Brisbane CBD private operators (Secure, Wilson) charge Australia\'s most expensive drive-up daily parking (~$79.83/day average). Council car parks are far cheaper (max ~$49 to 6pm).',
  councilCarParks: 'King George Square: early bird $28, max $49 to 6pm ($64 overnight). Wickham Terrace: early bird $26, max $49 ($55 overnight), evenings after 4pm $6 flat, weekends $6 flat. 15 min free in both.',
};

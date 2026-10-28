/**
 * Australian stamp duty (transfer duty) tables by state/territory — 2026-27.
 * Sources: State Revenue Offices (SRO VIC, Revenue NSW, QRO, RevenueWA, RevenueSA, SRO TAS, ACT Revenue, NT SRO).
 * Updated with 2026-27 statutory rates, brackets, and first home buyer thresholds.
 */

export interface DutyBracket {
  min: number;
  max: number;
  rate: number;   // marginal rate above min
  base: number;   // flat duty payable up to min
}

export interface FHBConcession {
  fullExemptionThreshold: number;
  concessionTopThreshold?: number;
  grantAmount?: number;            // FHOG for new homes
  grantPriceCapNew?: number;
  isUnlimitedNewHome?: boolean;    // SA & QLD uncapped new build exemption
  vacantLandExemption?: number;    // First home vacant land full exemption
  vacantLandConcession?: number;   // First home vacant land concession top
}

export interface StampDutyTable {
  stateName: string;
  general: DutyBracket[];
  firstHomeBuyer: FHBConcession;
  foreignSurchargeRate?: number;   // Additional duty for foreign purchasers
}

// ─── Victoria ────────────────────────────────────────────────────────────────
// SRO Victoria: First Home Buyer duty exemption up to $600k, concession up to $750k.
// Sliding formula: duty = fullDuty * ((price - 600,000) / 150,000).
// FHOG $10,000 for new builds up to $750,000. Foreign purchaser surcharge 8%.
export const VIC_STAMP_DUTY: StampDutyTable = {
  stateName: 'Victoria',
  general: [
    { min: 0,       max: 25000,    rate: 0.014,  base: 0 },
    { min: 25000,   max: 130000,   rate: 0.024,  base: 350 },
    { min: 130000,  max: 960000,   rate: 0.06,   base: 2870 },
    { min: 960000,  max: 2000000,  rate: 0.055,  base: 52670 },
    { min: 2000000, max: Infinity, rate: 0.065,  base: 109870 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 600000,
    concessionTopThreshold: 750000,
    grantAmount: 10000,
    grantPriceCapNew: 750000,
    vacantLandExemption: 0,
  },
  foreignSurchargeRate: 0.08,
};

// ─── New South Wales ──────────────────────────────────────────────────────────
// Revenue NSW: Brackets indexed for 2026-27 (CPI adjusted premium bracket $3,870,000).
// First Home Buyers Assistance Scheme (FHBAS): full exemption to $800k, concessional
// sliding scale to $1,000,000 under Duties Act 1997. Vacant land exemption to $350k,
// concession to $450k. FHOG $10,000 for new homes <= $600k. Foreign surcharge 9% (from 1 Jan 2025).
export const NSW_STAMP_DUTY: StampDutyTable = {
  stateName: 'New South Wales',
  general: [
    { min: 0,        max: 18000,    rate: 0.0125, base: 0 },
    { min: 18000,    max: 38000,    rate: 0.015,  base: 225 },
    { min: 38000,    max: 103000,   rate: 0.0175, base: 525 },
    { min: 103000,   max: 387000,   rate: 0.035,  base: 1662 },
    { min: 387000,   max: 1290000,  rate: 0.045,  base: 11602 },
    { min: 1290000,  max: 3870000,  rate: 0.055,  base: 52237 },
    { min: 3870000,  max: Infinity, rate: 0.07,   base: 194137 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 800000,
    concessionTopThreshold: 1000000,
    grantAmount: 10000,
    grantPriceCapNew: 600000,
    vacantLandExemption: 350000,
    vacantLandConcession: 450000,
  },
  foreignSurchargeRate: 0.09,
};

// ─── Queensland ──────────────────────────────────────────────────────────────
// Queensland Revenue Office (QRO):
// 1. Established home First Home Concession: nil duty <= $700,000, concessional rates up to $800,000.
//    Sliding scale deduction from home concession duty tapering by $1,735 per $10k bracket.
// 2. First Home Vacant Land: full exemption <= $350k, concession up to $500k.
// 3. Uncapped New Home exemption under Duties Act 2001 s 92A/92B (contracts >= 1 May 2025):
//    nil duty with NO price cap for eligible first home buyers buying or building new homes.
// 4. FHOG: $30,000 for new builds up to $750,000. Foreign surcharge (AFAD): 8%.
export const QLD_STAMP_DUTY: StampDutyTable = {
  stateName: 'Queensland',
  general: [
    { min: 0,       max: 5000,     rate: 0,      base: 0 },
    { min: 5000,    max: 75000,    rate: 0.015,  base: 0 },
    { min: 75000,   max: 540000,   rate: 0.035,  base: 1050 },
    { min: 540000,  max: 1000000,  rate: 0.045,  base: 17325 },
    { min: 1000000, max: Infinity, rate: 0.0575, base: 38025 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 700000,  // Full exemption to $700k
    concessionTopThreshold: 800000,  // Phases out to $800k
    grantAmount: 30000,              // $30,000 FHOG for new homes <= $750k
    grantPriceCapNew: 750000,
    isUnlimitedNewHome: true,        // Duties Act 2001 s 92A/92B: nil duty on new builds with no price cap
    vacantLandExemption: 350000,     // Vacant land full exemption <= $350k
    vacantLandConcession: 500000,    // Vacant land concession <= $500k
  },
  foreignSurchargeRate: 0.08,
};

// ─── Western Australia ────────────────────────────────────────────────────────
// RevenueWA: First Home Owner Rate of Duty (FHOR):
// Full exemption up to $450k, concessional rate ($15.01 per $100 over $450k) up to $600k.
// (Note: Expanded from 7 May 2026 to $600k exemption / $800k concession statewide).
// FHOG $10,000 for new homes up to $750k. Foreign buyer duty surcharge 7%.
export const WA_STAMP_DUTY: StampDutyTable = {
  stateName: 'Western Australia',
  general: [
    { min: 0,       max: 120000,   rate: 0.019,  base: 0 },
    { min: 120000,  max: 150000,   rate: 0.0285, base: 2280 },
    { min: 150000,  max: 360000,   rate: 0.038,  base: 3135 },
    { min: 360000,  max: 725000,   rate: 0.0475, base: 11115 },
    { min: 725000,  max: Infinity, rate: 0.0515, base: 28453 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 450000,   // First home owner rate exemption up to $450k
    concessionTopThreshold: 600000,   // Concessional rate up to $600k ($15.01 per $100 over $450k)
    grantAmount: 10000,
    grantPriceCapNew: 750000,
    vacantLandExemption: 300000,
    vacantLandConcession: 400000,
  },
  foreignSurchargeRate: 0.07,
};

// ─── South Australia ──────────────────────────────────────────────────────────
// RevenueSA:
// Uncapped stamp duty exemption for eligible first home buyers buying or building a NEW home
// (contracts on or after 6 June 2024: NO property value cap).
// FHOG $15,000 for new homes with NO price cap (cap removed June 2024).
// Established homes: Do not qualify for FHB duty relief (standard general duty applies).
// Foreign surcharge 7%.
export const SA_STAMP_DUTY: StampDutyTable = {
  stateName: 'South Australia',
  general: [
    { min: 0,       max: 12000,    rate: 0.01,   base: 0 },
    { min: 12000,   max: 30000,    rate: 0.02,   base: 120 },
    { min: 30000,   max: 50000,    rate: 0.03,   base: 480 },
    { min: 50000,   max: 100000,   rate: 0.035,  base: 1080 },
    { min: 100000,  max: 200000,   rate: 0.04,   base: 2830 },
    { min: 200000,  max: 250000,   rate: 0.0425, base: 6830 },
    { min: 250000,  max: 300000,   rate: 0.0475, base: 8955 },
    { min: 300000,  max: 500000,   rate: 0.05,   base: 11330 },
    { min: 500000,  max: Infinity, rate: 0.055,  base: 21330 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 0,       // No duty exemption on established homes
    concessionTopThreshold: 0,
    grantAmount: 15000,              // $15,000 FHOG for new homes
    grantPriceCapNew: Infinity,       // Price cap abolished from 6 June 2024
    isUnlimitedNewHome: true,        // SA 2024+: 0 stamp duty on new builds for FHBs with no property cap
  },
  foreignSurchargeRate: 0.07,
};

// ─── Tasmania ─────────────────────────────────────────────────────────────────
// State Revenue Office Tasmania:
// First home buyers receive 50% discount on property transfer duty up to $750,000.
// FHOG $20,000 for new homes up to $750,000 in 2026-27.
// Foreign purchaser surcharge 8%.
export const TAS_STAMP_DUTY: StampDutyTable = {
  stateName: 'Tasmania',
  general: [
    { min: 0,       max: 3000,     rate: 0,      base: 50 },
    { min: 3000,    max: 25000,    rate: 0.0175, base: 50 },
    { min: 25000,   max: 50000,    rate: 0.0225, base: 435 },
    { min: 50000,   max: 100000,   rate: 0.0275, base: 998 },
    { min: 100000,  max: 200000,   rate: 0.035,  base: 2373 },
    { min: 200000,  max: 375000,   rate: 0.04,   base: 5873 },
    { min: 375000,  max: 725000,   rate: 0.0425, base: 12873 },
    { min: 725000,  max: Infinity, rate: 0.045,  base: 27748 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 750000,  // 50% discount on property transfer duty up to $750k for first home buyers
    concessionTopThreshold: 750000,
    grantAmount: 20000,              // $20,000 FHOG for new homes in 2026-27
    grantPriceCapNew: 750000,
  },
  foreignSurchargeRate: 0.08,
};

// ─── Australian Capital Territory ─────────────────────────────────────────────
// ACT Revenue Office: Home Buyer Concession Scheme (HBCS).
// Transfer duty is fully abolished ($0 duty payable) for eligible first home buyer owner-occupiers
// with NO property price cap. No FHOG (abolished in 2019). Foreign buyer surcharge 8%.
export const ACT_STAMP_DUTY: StampDutyTable = {
  stateName: 'Australian Capital Territory',
  general: [
    { min: 0,       max: 260000,   rate: 0.0049, base: 0 },
    { min: 260000,  max: 300000,   rate: 0.014,  base: 1274 },
    { min: 300000,  max: 500000,   rate: 0.0242, base: 1834 },
    { min: 500000,  max: 750000,   rate: 0.034,  base: 6674 },
    { min: 750000,  max: 1000000,  rate: 0.043,  base: 15174 },
    { min: 1000000, max: 1455000,  rate: 0.055,  base: 25924 },
    { min: 1455000, max: Infinity, rate: 0.0454, base: 50949 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: Infinity, // Home Buyer Concession Scheme: full exemption with no price cap
    concessionTopThreshold: Infinity,
    grantAmount: 0,
    grantPriceCapNew: Infinity,
  },
  foreignSurchargeRate: 0.08,
};

// ─── Northern Territory ───────────────────────────────────────────────────────
// Territory Revenue Office (NT SRO):
// Statutory polynomial formula for properties <= $525,000:
//   D = (0.06571441 * V^2) + (15 * V) where V = dutiable value / 1000.
// Properties > $525,000: 4.95% flat to $3M; 5.75% $3M-$5M; 5.95% over $5M.
// First home buyers:
// - HomeGrown Territory Grant: $50,000 for new builds/house and land, no property price cap.
// - House and Land Package Exemption (HLPE): 100% duty exemption for new house & land packages.
// - Established homes: standard conveyance duty applies. Foreign surcharge 0%.
export const NT_STAMP_DUTY: StampDutyTable = {
  stateName: 'Northern Territory',
  general: [
    { min: 0,       max: 525000,   rate: 0.0495, base: 0 },
    { min: 525000,  max: 3000000,  rate: 0.0495, base: 25988 },
    { min: 3000000, max: 5000000,  rate: 0.0575, base: 172500 },
    { min: 5000000, max: Infinity, rate: 0.0595, base: 287500 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 0,       // No duty exemption on established homes
    concessionTopThreshold: 0,
    grantAmount: 50000,              // HomeGrown Territory Grant ($50,000 for new builds)
    grantPriceCapNew: Infinity,       // No price cap
    isUnlimitedNewHome: true,        // HLPE: 100% duty relief on new house & land packages
  },
  foreignSurchargeRate: 0,
};

// ─── State lookup ─────────────────────────────────────────────────────────────
export type AustralianState = 'VIC' | 'NSW' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

export const STATE_TABLES: Record<AustralianState, StampDutyTable> = {
  VIC: VIC_STAMP_DUTY,
  NSW: NSW_STAMP_DUTY,
  QLD: QLD_STAMP_DUTY,
  WA:  WA_STAMP_DUTY,
  SA:  SA_STAMP_DUTY,
  TAS: TAS_STAMP_DUTY,
  ACT: ACT_STAMP_DUTY,
  NT:  NT_STAMP_DUTY,
};

export interface StampDutyResult {
  dutyPayable: number;
  fullDuty: number;
  concessionApplied: boolean;
  concessionSaving: number;
  fhogAmount: number;
  foreignSurcharge: number;
  netCost: number;     // dutyPayable + foreignSurcharge - fhogAmount
}

/**
 * Calculate Queensland standard owner-occupier Home Concession duty.
 * Rates:
 * $0 - $350,000: 1%
 * $350,001 - $540,000: $3,500 + 3.5%
 * $540,001 - $1,000,000: $10,150 + 4.5%
 * Over $1,000,000: $30,850 + 5.75%
 */
export function calcQldHomeConcession(price: number): number {
  if (price <= 350000) {
    return price * 0.01;
  }
  if (price <= 540000) {
    return 3500 + (price - 350000) * 0.035;
  }
  if (price <= 1000000) {
    return 10150 + (price - 540000) * 0.045;
  }
  return 30850 + (price - 1000000) * 0.0575;
}

/**
 * Calculate stamp duty for a property purchase across all 8 Australian jurisdictions.
 * @param price - Purchase price in AUD
 * @param state - Australian state/territory (VIC, NSW, QLD, WA, SA, TAS, ACT, NT)
 * @param firstHomeBuyer - Whether purchaser is an eligible first home buyer
 * @param isNewHome - Whether property is a new build (affects FHOG, QLD s 92A, SA uncapped, NT HLPE)
 * @param isForeignPurchaser - Whether purchaser is subject to foreign buyer surcharge
 * @param isVacantLand - Whether purchase is vacant land for first home build
 */
export function calculateStampDuty(
  price: number,
  state: AustralianState,
  firstHomeBuyer: boolean,
  isNewHome = false,
  isForeignPurchaser = false,
  isVacantLand = false,
): StampDutyResult {
  if (price <= 0) {
    return {
      dutyPayable: 0,
      fullDuty: 0,
      concessionApplied: false,
      concessionSaving: 0,
      fhogAmount: 0,
      foreignSurcharge: 0,
      netCost: 0,
    };
  }

  const table = STATE_TABLES[state];
  const fullDuty = calcDutyFromTable(price, table.general, state);
  const fhb = table.firstHomeBuyer;

  let dutyPayable = fullDuty;
  let concessionApplied = false;
  let concessionSaving = 0;
  let fhogAmount = 0;

  if (firstHomeBuyer) {
    // 1. Vacant land specific concessions (QLD & NSW)
    if (isVacantLand && fhb.vacantLandExemption) {
      if (price <= fhb.vacantLandExemption) {
        dutyPayable = 0;
        concessionApplied = true;
        concessionSaving = fullDuty;
      } else if (fhb.vacantLandConcession && price <= fhb.vacantLandConcession) {
        const range = fhb.vacantLandConcession - fhb.vacantLandExemption;
        const overshoot = price - fhb.vacantLandExemption;
        const fraction = overshoot / range;
        dutyPayable = fullDuty * fraction;
        concessionApplied = true;
        concessionSaving = fullDuty - dutyPayable;
      }
    }
    // 2. Uncapped New Home exemptions:
    // - QLD Duties Act 2001 s 92A/92B (effective 1 May 2025): nil duty with no price cap
    // - SA 2024+ reform: 0 stamp duty on new builds for FHBs with no property cap
    // - NT House and Land Package Exemption (HLPE): 100% duty relief on new packages
    else if ((state === 'SA' || state === 'QLD' || state === 'NT') && isNewHome && fhb.isUnlimitedNewHome) {
      dutyPayable = 0;
      concessionApplied = true;
      concessionSaving = fullDuty;
    }
    // 3. TAS 50% discount for first home buyers up to $750k
    else if (state === 'TAS' && price <= fhb.fullExemptionThreshold) {
      dutyPayable = fullDuty * 0.5;
      concessionApplied = true;
      concessionSaving = fullDuty * 0.5;
    }
    // 4. Standard full exemption: VIC <= $600k, NSW <= $800k, QLD <= $700k (established), WA <= $450k, ACT all
    else if (price <= fhb.fullExemptionThreshold) {
      dutyPayable = 0;
      concessionApplied = true;
      concessionSaving = fullDuty;
    }
    // 5. Sliding scale / concessional phase-outs:
    else if (fhb.concessionTopThreshold && price <= fhb.concessionTopThreshold) {
      if (state === 'WA') {
        // WA statutory concessional formula: $15.01 per $100 over $450,000
        dutyPayable = (price - fhb.fullExemptionThreshold) * 0.1501;
        concessionApplied = true;
        concessionSaving = Math.max(0, fullDuty - dutyPayable);
      } else if (state === 'QLD') {
        // QLD First Home Concession for established homes ($700k - $800k):
        // Standard home concession duty minus deduction ($17,350 reduced by $1,735 per $10k bracket)
        const homeDuty = calcQldHomeConcession(price);
        const excess = price - 700000;
        const deduction = Math.max(0, 17350 - Math.floor(excess / 10000) * 1735);
        dutyPayable = Math.max(0, homeDuty - deduction);
        concessionApplied = true;
        concessionSaving = Math.max(0, fullDuty - dutyPayable);
      } else if (state === 'NSW') {
        // NSW statutory sliding scale formula (Duties Act 1997 s 78A):
        // Concession discount = ((concessionTop - price) / range) * dutyAtLowerThreshold
        const dutyAt800k = calcDutyFromTable(fhb.fullExemptionThreshold, table.general, state);
        const range = fhb.concessionTopThreshold - fhb.fullExemptionThreshold;
        const discount = ((fhb.concessionTopThreshold - price) / range) * dutyAt800k;
        dutyPayable = Math.max(0, fullDuty - discount);
        concessionApplied = true;
        concessionSaving = Math.max(0, fullDuty - dutyPayable);
      } else {
        // VIC & standard sliding scale: interpolate duty payable
        const range = fhb.concessionTopThreshold - fhb.fullExemptionThreshold;
        const overshoot = price - fhb.fullExemptionThreshold;
        const fraction = range > 0 ? overshoot / range : 1;
        dutyPayable = fullDuty * fraction;
        concessionApplied = true;
        concessionSaving = fullDuty - dutyPayable;
      }
    }

    // FHOG for new homes
    if (
      fhb.grantAmount &&
      isNewHome &&
      fhb.grantPriceCapNew &&
      price <= fhb.grantPriceCapNew
    ) {
      fhogAmount = fhb.grantAmount;
    }
  }

    const foreignSurcharge = isForeignPurchaser && table.foreignSurchargeRate
    ? Math.round(price * table.foreignSurchargeRate)
    : 0;

  const roundedDuty = Math.round(dutyPayable);
  const roundedFull = Math.round(fullDuty);
  if (concessionApplied) {
    concessionSaving = Math.max(0, roundedFull - roundedDuty);
  }

  return {
    dutyPayable: roundedDuty,
    fullDuty: roundedFull,
    concessionApplied,
    concessionSaving,
    fhogAmount,
    foreignSurcharge,
    netCost: Math.round(roundedDuty + foreignSurcharge - fhogAmount),
  };
}

function calcDutyFromTable(price: number, brackets: DutyBracket[], state?: AustralianState): number {
  if (state === 'NT') {
    // NT statutory formula and flat percentages
    if (price <= 525000) {
      // D = (0.06571441 * V^2) + (15 * V) where V = dutiable value / 1000
      const v = price / 1000;
      return Math.round(0.06571441 * v * v + 15 * v);
    }
    if (price < 3000000) {
      return Math.round(price * 0.0495);
    }
    if (price < 5000000) {
      return Math.round(price * 0.0575);
    }
    return Math.round(price * 0.0595);
  }

  for (const b of brackets) {
    if (price <= b.max) {
      return b.base + (price - b.min) * b.rate;
    }
  }
  return 0;
}

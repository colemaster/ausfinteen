/**
 * Australian stamp duty (transfer duty) tables by state/territory — 2026-27.
 * Sources: State Revenue Offices (SRO VIC, Revenue NSW, QRO, RevenueWA, RevenueSA, SRO TAS, ACT Revenue, NT SRO).
 * Updated with 2026-27 rates and thresholds.
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
  isUnlimitedNewHome?: boolean;    // SA 2024+ reform for new builds
}

export interface StampDutyTable {
  stateName: string;
  general: DutyBracket[];
  firstHomeBuyer: FHBConcession;
  foreignSurchargeRate?: number;   // Additional duty for foreign purchasers
}

// ─── Victoria ────────────────────────────────────────────────────────────────
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
  },
  foreignSurchargeRate: 0.08,
};

// ─── New South Wales ──────────────────────────────────────────────────────────
export const NSW_STAMP_DUTY: StampDutyTable = {
  stateName: 'New South Wales',
  general: [
    { min: 0,        max: 18000,    rate: 0.0125, base: 0 },
    { min: 18000,    max: 38000,    rate: 0.015,  base: 225 },
    { min: 38000,    max: 103000,   rate: 0.0175, base: 525 },
    { min: 103000,   max: 387000,   rate: 0.035,  base: 1662 },
    { min: 387000,   max: 1290000,  rate: 0.045,  base: 11602 },
    { min: 1290000,  max: 3505000,  rate: 0.055,  base: 52237 },
    { min: 3505000,  max: Infinity, rate: 0.07,   base: 175830 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 800000,
    concessionTopThreshold: 1000000,
    grantAmount: 10000,
    grantPriceCapNew: 600000,
  },
  foreignSurchargeRate: 0.09,
};

// ─── Queensland ──────────────────────────────────────────────────────────────
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
    fullExemptionThreshold: 700000,  // Full concession to $700k
    concessionTopThreshold: 800000,  // Phases out to $800k
    grantAmount: 30000,              // $30k FHOG for new homes (locked in 2026-27 Budget)
    grantPriceCapNew: 750000,
  },
  foreignSurchargeRate: 0.08,
};

// ─── Western Australia ────────────────────────────────────────────────────────
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
    fullExemptionThreshold: 600000,   // From 7 May 2026
    concessionTopThreshold: 800000,   // From 7 May 2026
    grantAmount: 10000,
    grantPriceCapNew: 800000,         // Increased to $800k from 7 May 2026
  },
  foreignSurchargeRate: 0.07,
};

// ─── South Australia ──────────────────────────────────────────────────────────
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
    fullExemptionThreshold: 650000,
    concessionTopThreshold: 700000,
    grantAmount: 15000,
    grantPriceCapNew: 650000,
    isUnlimitedNewHome: true, // SA 2024: 0 stamp duty on new builds for FHBs with no property cap
  },
  foreignSurchargeRate: 0.07,
};

// ─── Tasmania ─────────────────────────────────────────────────────────────────
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
    fullExemptionThreshold: 750000, // 50% discount on duty for homes up to $750k
    concessionTopThreshold: 750000,
    grantAmount: 10000,
    grantPriceCapNew: 750000,
  },
  foreignSurchargeRate: 0.08,
};

// ─── Australian Capital Territory ─────────────────────────────────────────────
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
    fullExemptionThreshold: 1000000, // ACT Home Buyer Concession full exemption (income-tested)
    concessionTopThreshold: 1000000,
    grantAmount: 0,
    grantPriceCapNew: 1000000,
  },
  foreignSurchargeRate: 0.08,
};

// ─── Northern Territory ───────────────────────────────────────────────────────
export const NT_STAMP_DUTY: StampDutyTable = {
  stateName: 'Northern Territory',
  general: [
    { min: 0,       max: 525000,   rate: 0.0495, base: 0 },
    { min: 525000,  max: 3000000,  rate: 0.0495, base: 25988 },
    { min: 3000000, max: Infinity, rate: 0.0545, base: 148500 },
  ],
  firstHomeBuyer: {
    fullExemptionThreshold: 650000,
    concessionTopThreshold: 650000,
    grantAmount: 10000,
    grantPriceCapNew: 650000,
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
 * Calculate stamp duty for a property purchase across all 8 Australian jurisdictions.
 * @param price - Purchase price in AUD
 * @param state - Australian state/territory
 * @param firstHomeBuyer - Whether purchaser is an eligible first home buyer
 * @param isNewHome - Whether property is a new build (affects FHOG and SA exemption)
 * @param isForeignPurchaser - Whether purchaser is subject to foreign buyer surcharge
 */
export function calculateStampDuty(
  price: number,
  state: AustralianState,
  firstHomeBuyer: boolean,
  isNewHome = false,
  isForeignPurchaser = false,
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
    // Special SA rule: 0 stamp duty on all new builds for FHBs
    if (state === 'SA' && isNewHome && fhb.isUnlimitedNewHome) {
      dutyPayable = 0;
      concessionApplied = true;
      concessionSaving = fullDuty;
    } else if (state === 'TAS' && price <= fhb.fullExemptionThreshold) {
      // TAS 50% concession for FHBs up to threshold
      dutyPayable = fullDuty * 0.5;
      concessionApplied = true;
      concessionSaving = fullDuty * 0.5;
    } else if (price <= fhb.fullExemptionThreshold) {
      dutyPayable = 0;
      concessionApplied = true;
      concessionSaving = fullDuty;
    } else if (fhb.concessionTopThreshold && price <= fhb.concessionTopThreshold) {
      // Sliding scale: interpolate between full exemption and full duty
      const range = fhb.concessionTopThreshold - fhb.fullExemptionThreshold;
      const overshoot = price - fhb.fullExemptionThreshold;
      const fraction = range > 0 ? overshoot / range : 1;
      dutyPayable = fullDuty * fraction;
      concessionApplied = true;
      concessionSaving = fullDuty - dutyPayable;
    }

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

  return {
    dutyPayable: Math.round(dutyPayable),
    fullDuty: Math.round(fullDuty),
    concessionApplied,
    concessionSaving: Math.round(concessionSaving),
    fhogAmount,
    foreignSurcharge,
    netCost: Math.round(dutyPayable + foreignSurcharge - fhogAmount),
  };
}

function calcDutyFromTable(price: number, brackets: DutyBracket[], state?: AustralianState): number {
  if (state === 'NT' && price <= 525000) {
    // NT polynomial statutory formula: V * (0.06571441 * V + 150) / 1000 where V is thousands, or exact formula
    const v = price / 1000;
    return Math.round((0.06571441 * v * v + 150 * v));
  }

  for (const b of brackets) {
    if (price <= b.max) {
      return b.base + (price - b.min) * b.rate;
    }
  }
  return 0;
}
/**
 * House Affordability Stamp Duty & First Home Buyer Grants Interface.
 * Re-exports and wraps the core state stamp duty tables and calculation engine.
 */

export {
  calculateStampDuty,
  calcQldHomeConcession,
  STATE_TABLES,
  VIC_STAMP_DUTY,
  NSW_STAMP_DUTY,
  QLD_STAMP_DUTY,
  WA_STAMP_DUTY,
  SA_STAMP_DUTY,
  TAS_STAMP_DUTY,
  ACT_STAMP_DUTY,
  NT_STAMP_DUTY,
  type DutyBracket,
  type FHBConcession,
  type StampDutyTable,
  type AustralianState,
  type StampDutyResult,
} from '../../data/stamp-duty-tables';

import {
  calculateStampDuty,
  STATE_TABLES,
  type AustralianState,
  type StampDutyResult,
} from '../../data/stamp-duty-tables';

export interface StateFHBOverview {
  state: AustralianState;
  stateName: string;
  fullExemptionThreshold: number;
  concessionTopThreshold: number;
  fhogAmount: number;
  fhogPriceCapNew: number;
  isUnlimitedNewHome: boolean;
  foreignSurchargeRate: number;
  summary: string;
}

/**
 * Returns a structured summary of First Home Buyer stamp duty concessions and grants by state.
 */
export function getStateFHBOverview(state: AustralianState): StateFHBOverview {
  const table = STATE_TABLES[state];
  const fhb = table.firstHomeBuyer;

  let summary = '';
  switch (state) {
    case 'QLD':
      summary = 'Full exemption to $700k (established), concessions to $800k. Uncapped nil duty on new builds under s 92A/92B. $30k FHOG to $750k.';
      break;
    case 'NSW':
      summary = 'First Home Buyers Assistance Scheme: full exemption to $800k, concessions to $1M. $10k FHOG to $600k.';
      break;
    case 'VIC':
      summary = 'First Home Buyer duty exemption to $600k, concession to $750k. $10k FHOG to $750k.';
      break;
    case 'WA':
      summary = 'First Home Owner Rate: full exemption to $450k, concession to $600k ($15.01 per $100 over $450k). $10k FHOG to $750k.';
      break;
    case 'SA':
      summary = 'Uncapped stamp duty exemption for new builds (no price cap). $15k FHOG with no cap. Established homes pay full duty.';
      break;
    case 'TAS':
      summary = '50% property transfer duty discount up to $750k for first home buyers. $20k FHOG for new homes up to $750k.';
      break;
    case 'ACT':
      summary = 'Home Buyer Concession Scheme: full exemption with no price cap for eligible buyers. $0 FHOG.';
      break;
    case 'NT':
      summary = '$50k HomeGrown Territory Grant for new builds (no price cap) & 100% duty relief on new house & land packages.';
      break;
  }

  return {
    state,
    stateName: table.stateName,
    fullExemptionThreshold: fhb.fullExemptionThreshold,
    concessionTopThreshold: fhb.concessionTopThreshold ?? fhb.fullExemptionThreshold,
    fhogAmount: fhb.grantAmount ?? 0,
    fhogPriceCapNew: fhb.grantPriceCapNew ?? 0,
    isUnlimitedNewHome: fhb.isUnlimitedNewHome ?? false,
    foreignSurchargeRate: table.foreignSurchargeRate ?? 0,
    summary,
  };
}

/**
 * Estimate stamp duty and FHOG for a given property scenario.
 */
export function estimateStampDuty(
  price: number,
  state: AustralianState,
  firstHomeBuyer: boolean,
  isNewHome = false,
  isForeignPurchaser = false,
  isVacantLand = false,
): StampDutyResult {
  return calculateStampDuty(price, state, firstHomeBuyer, isNewHome, isForeignPurchaser, isVacantLand);
}

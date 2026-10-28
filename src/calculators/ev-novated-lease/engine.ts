/**
 * Electric Vehicle (EV) Novated Lease vs Cash vs Loan Engine (FY2026-27 parameters)
 * Implements FBTAA s 8A 100% FBT exemption for zero-emission vehicles under the
 * Fuel-Efficient Luxury Car Tax (LCT) limit ($91,387 FY2026-27),
 * $6,334 max GST credit (1/11th of $69,674 car cost limit),
 * ATO PCG 2024/2 EV home charging safe harbour rate (4.2c/km), RFBA, and 3-way TCO comparison.
 */

import { getCombinedMarginalRate } from '../../data/tax-brackets';

export interface EVNovatedLeaseParams {
  vehiclePurchasePrice: number;   // In AUD (incl. GST)
  annualSalary: number;           // Gross annual salary
  leaseTermYears: number;         // 1, 2, 3, 4, or 5 years
  annualKilometres: number;       // e.g. 15,000 km
  leaseInterestRate: number;      // e.g. 0.0825 (8.25%)
  carLoanInterestRate: number;    // e.g. 0.075 (7.5%)
  opportunityCostRate: number;    // e.g. 0.055 (5.5% HISA/Offset return on cash)
  isElectricVehicle: boolean;     // BEV or eligible zero-emission vehicle
  includeHomeChargingSafeHarbour?: boolean;
  safeHarbourRatePerKm?: number;  // Optional custom rate (e.g. 0.0547 commencing 1 April 2026)
  customLctLimit?: number;        // Optional LCT limit override (e.g. 91661 for FY27)
  isPHEV?: boolean;               // Plug-in hybrid electric vehicle
  phevContractDateBeforeSunset?: boolean; // Whether PHEV was ordered before 1 April 2025 sunset
}

export interface EVNovatedLeaseResult {
  isFBTExempt: boolean;
  lctLimit: number;
  fbtSavedVsNonExempt: number;
  postTaxContributionECM: number;
  gstSavingOnPurchase: number;
  netFinancedAmount: number;
  residualBalloonAmount: number;
  residualPercentage: number;
  annualRunningCosts: {
    chargingElectricity: number;
    comprehensiveInsurance: number;
    tyresAndMaintenance: number;
    registrationAndCTP: number;
    totalGSTSavings: number;
    totalPreTaxRunningCost: number;
  };
  monthlyPreTaxDeduction: number;
  annualTaxSavings: number;
  netAnnualTakeHomePayReduction: number;
  reportableFringeBenefitAmount: number; // RFBA
  fiveYearTotalCostOfOwnership: {
    novatedLease: number;
    outrightCash: number;
    securedCarLoan: number;
  };
  totalSavingsVsCash: number;
  totalSavingsVsLoan: number;
}

// ─── Statutory Constants (FY2026-27) ───────────────────────────────────────────
export const EV_LEASE_CONSTANTS = {
  fuelEfficientLCTLimit2025: 91387,
  fuelEfficientLCTLimit2026: 91387,
  fuelEfficientLCTLimit2027: 91661,    // FY2026-27 ATO indexed threshold
  fuelEfficientLCTLimit: 91387,        // FY2025-26 baseline ($91,387) / FY2026-27 ($91,661)
  standardVehicleLCTLimit2027: 80809,  // Non-fuel-efficient luxury car threshold
  maxGSTCredit: 6334,                  // 1/11th of $69,674 car cost depreciation cap
  carCostLimit: 69674,                 // Income tax car cost depreciation limit
  atoSafeHarbourElectricityPerKm: 0.0420, // ATO PCG 2024/2 (4.20 cents / km for FBT years up to 31 March 2026)
  atoSafeHarbourElectricityPerKm2026: 0.0547, // ATO PCG 2024/2 updated rate (5.47 cents / km commencing 1 April 2026)
  fbtStatutoryFormulaRate: 0.20,      // 20% statutory fraction (FBTAA s 9)
  rfbaGrossUpRateType2: 1.8868,        // Type 2 gross-up factor (FBTAA s 135R)
  phevSunsetDate: '2025-04-01',        // Electric Car Discount Act 2022 PHEV sunset cutoff
  statutoryResiduals: {
    1: 0.6563, // 65.63%
    2: 0.5625, // 56.25%
    3: 0.4688, // 46.88%
    4: 0.3750, // 37.50%
    5: 0.2813, // 28.13%
  } as Record<number, number>,
};

/**
 * Calculate the monthly amortization repayment with a residual balloon.
 */
function calcMonthlyLeasePayment(principal: number, annualRate: number, years: number, balloon: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return (principal - balloon) / n;
  // Standard present value formula with future balloon: P = PMT * (1 - (1+r)^-n)/r + FV * (1+r)^-n
  const pmt = (principal - balloon * Math.pow(1 + r, -n)) * (r / (1 - Math.pow(1 + r, -n)));
  return pmt;
}

/**
 * Run full EV Novated Lease vs Cash vs Secured Loan comparison.
 */
export function calculateEVNovatedLease(params: EVNovatedLeaseParams): EVNovatedLeaseResult {
  const {
    vehiclePurchasePrice,
    annualSalary,
    leaseTermYears,
    annualKilometres,
    leaseInterestRate,
    carLoanInterestRate,
    opportunityCostRate,
    isElectricVehicle,
    includeHomeChargingSafeHarbour = true,
    safeHarbourRatePerKm,
    customLctLimit,
    isPHEV = false,
    phevContractDateBeforeSunset = true,
  } = params;

  // 1. Check FBT exemption under FBTAA s 8A (FY2026-27 LCT limit: $91,387 or indexed $91,661)
  // Plug-in hybrid (PHEV) vehicles ceased to be exempt if ordered/committed on or after 1 April 2025.
  const lctLimit = customLctLimit ?? EV_LEASE_CONSTANTS.fuelEfficientLCTLimit;
  const phevQualifies = !isPHEV || phevContractDateBeforeSunset;
  const isFBTExempt = isElectricVehicle && phevQualifies && vehiclePurchasePrice <= lctLimit;

  // 2. GST Savings on Purchase Price (capped at $6,334)
  const uncappedGST = vehiclePurchasePrice / 11;
  const gstSavingOnPurchase = Math.min(uncappedGST, EV_LEASE_CONSTANTS.maxGSTCredit);
  const netFinancedAmount = vehiclePurchasePrice - gstSavingOnPurchase;

  // 3. Minimum ATO Residual / Balloon Payment
  const resRate = EV_LEASE_CONSTANTS.statutoryResiduals[leaseTermYears] ?? 0.2813;
  const residualBalloonAmount = Math.round(netFinancedAmount * resRate);

  // 4. Monthly Finance Payment on Lease
  const monthlyFinancePayment = calcMonthlyLeasePayment(
    netFinancedAmount,
    leaseInterestRate,
    leaseTermYears,
    residualBalloonAmount
  );

  // 5. Annual Running Costs (Electricity/Fuel, Tyres, Insurance, Rego)
  const safeHarbourRate = safeHarbourRatePerKm ?? EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm;
  const chargingCost = includeHomeChargingSafeHarbour
    ? annualKilometres * safeHarbourRate
    : (annualKilometres / 100) * 15 * 0.28; // 15 kWh/100km at $0.28/kWh

  const comprehensiveInsurance = 1650;
  const tyresAndMaintenance = 900;
  const registrationAndCTP = 850;

  const totalGrossRunningCosts = chargingCost + comprehensiveInsurance + tyresAndMaintenance + registrationAndCTP;
  const runningCostsGSTSavings = totalGrossRunningCosts / 11;
  const totalPreTaxRunningCost = totalGrossRunningCosts - runningCostsGSTSavings;

  // 6. Salary Sacrifice & Tax Savings
  const annualLeaseFinance = monthlyFinancePayment * 12;
  const totalAnnualPackageCost = annualLeaseFinance + totalPreTaxRunningCost;
  const marginalRate = getCombinedMarginalRate(annualSalary);

  // Statutory fringe benefit value (20% statutory fraction)
  const taxableFringeBenefit = vehiclePurchasePrice * EV_LEASE_CONSTANTS.fbtStatutoryFormulaRate;

  let postTaxContributionECM = 0;
  let preTaxSacrifice = totalAnnualPackageCost;

  if (!isFBTExempt) {
    // If vehicle exceeds LCT threshold ($91,387) or is not an EV, Employee Contribution Method (ECM)
    // requires after-tax salary to offset the taxable fringe benefit to $0 FBT.
    postTaxContributionECM = Math.min(totalAnnualPackageCost, taxableFringeBenefit);
    preTaxSacrifice = Math.max(0, totalAnnualPackageCost - postTaxContributionECM);
  }

  const monthlyPreTaxDeduction = preTaxSacrifice / 12;
  const annualTaxSavings = preTaxSacrifice * marginalRate;
  const netAnnualTakeHomePayReduction = (preTaxSacrifice - annualTaxSavings) + postTaxContributionECM;

  // Annual tax savings specifically attributable to FBTAA s 8A exemption
  const fbtSavedVsNonExempt = isFBTExempt ? Math.round(taxableFringeBenefit * marginalRate) : 0;

  // 7. RFBA (Reportable Fringe Benefits Amount)
  // Base value (purchase price) * 20% statutory fraction * 1.8868 type 2 gross-up factor
  const reportableFringeBenefitAmount = Math.round(taxableFringeBenefit * EV_LEASE_CONSTANTS.rfbaGrossUpRateType2);

  // 8. 5-Year Total Cost of Ownership (TCO) Comparison
  // Novated Lease: Net out-of-pocket cost over term + balloon
  const totalLeaseCost = (netAnnualTakeHomePayReduction * leaseTermYears) + residualBalloonAmount;

  // Outright Cash Purchase: Purchase Price + Gross Running Costs + Foregone investment return
  const grossRunningCostsOverTerm = totalGrossRunningCosts * leaseTermYears;
  const cashOpportunityCost = (vehiclePurchasePrice * Math.pow(1 + opportunityCostRate, leaseTermYears)) - vehiclePurchasePrice;
  const totalCashCost = vehiclePurchasePrice + grossRunningCostsOverTerm + cashOpportunityCost;

  // Secured Car Loan: Full Purchase Price financed + Interest + Gross Running Costs
  const monthlyLoanPayment = calcMonthlyLeasePayment(vehiclePurchasePrice, carLoanInterestRate, leaseTermYears, 0);
  const totalLoanRepayments = monthlyLoanPayment * 12 * leaseTermYears;
  const totalLoanCost = totalLoanRepayments + grossRunningCostsOverTerm;

  return {
    isFBTExempt,
    lctLimit,
    fbtSavedVsNonExempt,
    postTaxContributionECM: Math.round(postTaxContributionECM),
    gstSavingOnPurchase: Math.round(gstSavingOnPurchase),
    netFinancedAmount: Math.round(netFinancedAmount),
    residualBalloonAmount,
    residualPercentage: Math.round(resRate * 1000) / 10,
    annualRunningCosts: {
      chargingElectricity: Math.round(chargingCost),
      comprehensiveInsurance,
      tyresAndMaintenance,
      registrationAndCTP,
      totalGSTSavings: Math.round(runningCostsGSTSavings),
      totalPreTaxRunningCost: Math.round(totalPreTaxRunningCost),
    },
    monthlyPreTaxDeduction: Math.round(monthlyPreTaxDeduction),
    annualTaxSavings: Math.round(annualTaxSavings),
    netAnnualTakeHomePayReduction: Math.round(netAnnualTakeHomePayReduction),
    reportableFringeBenefitAmount,
    fiveYearTotalCostOfOwnership: {
      novatedLease: Math.round(totalLeaseCost),
      outrightCash: Math.round(totalCashCost),
      securedCarLoan: Math.round(totalLoanCost),
    },
    totalSavingsVsCash: Math.round(totalCashCost - totalLeaseCost),
    totalSavingsVsLoan: Math.round(totalLoanCost - totalLeaseCost),
  };
}

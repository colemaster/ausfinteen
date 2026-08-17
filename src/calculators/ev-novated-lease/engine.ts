/**
 * Electric Vehicle (EV) Novated Lease vs Cash vs Loan Engine
 * Implements FBTAA s 8A 100% FBT exemption, Fuel-Efficient LCT cap ($91,387),
 * $6,334 max GST credit, ATO PCG 2024/2 electricity rate (4.2c/km), RFBA, and 3-way TCO comparison.
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
  isElectricVehicle: boolean;     // BEV or eligible PHEV
  includeHomeChargingSafeHarbour?: boolean;
}

export interface EVNovatedLeaseResult {
  isFBTExempt: boolean;
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

// ─── Statutory Constants ───────────────────────────────────────────────────────
export const EV_LEASE_CONSTANTS = {
  fuelEfficientLCTLimit2025: 91387,
  fuelEfficientLCTLimit2026: 91661,
  maxGSTCredit: 6334,                  // 1/11th of $69,674 car cost depreciation cap
  carCostLimit: 69674,
  atoSafeHarbourElectricityPerKm: 0.0420, // ATO PCG 2024/2 (4.2 cents / km)
  fbtStatutoryFormulaRate: 0.20,      // 20% statutory fraction
  rfbaGrossUpRateType2: 1.8868,        // Type 2 gross-up factor
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
  } = params;

  // 1. Check FBT exemption under FBTAA s 8A
  const lctLimit = EV_LEASE_CONSTANTS.fuelEfficientLCTLimit2026;
  const isFBTExempt = isElectricVehicle && vehiclePurchasePrice <= lctLimit;

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
  const chargingCost = includeHomeChargingSafeHarbour
    ? annualKilometres * EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm
    : (annualKilometres / 100) * 16 * 0.28; // ~16 kWh/100km at $0.28/kWh

  const comprehensiveInsurance = 1650;
  const tyresAndMaintenance = 900;
  const registrationAndCTP = 850;

  const totalGrossRunningCosts = chargingCost + comprehensiveInsurance + tyresAndMaintenance + registrationAndCTP;
  const runningCostsGSTSavings = totalGrossRunningCosts / 11;
  const totalPreTaxRunningCost = totalGrossRunningCosts - runningCostsGSTSavings;

  // 6. Salary Sacrifice & Tax Savings
  const annualLeaseFinancePreTax = monthlyFinancePayment * 12;
  const totalAnnualPreTaxSacrifice = annualLeaseFinancePreTax + totalPreTaxRunningCost;
  const monthlyPreTaxDeduction = totalAnnualPreTaxSacrifice / 12;

  const marginalRate = getCombinedMarginalRate(annualSalary);
  const annualTaxSavings = totalAnnualPreTaxSacrifice * marginalRate;
  const netAnnualTakeHomePayReduction = totalAnnualPreTaxSacrifice - annualTaxSavings;

  // 7. RFBA (Reportable Fringe Benefits Amount)
  // Base value (purchase price) * 20% statutory fraction * 1.8868
  const baseValue = vehiclePurchasePrice;
  const taxableFringeBenefit = baseValue * EV_LEASE_CONSTANTS.fbtStatutoryFormulaRate;
  const reportableFringeBenefitAmount = Math.round(taxableFringeBenefit * EV_LEASE_CONSTANTS.rfbaGrossUpRateType2);

  // 8. 5-Year Total Cost of Ownership (TCO) Comparison
  // Novated Lease: Net out-of-pocket cost over term + balloon
  const totalLeaseCost = (netAnnualTakeHomePayReduction * leaseTermYears) + residualBalloonAmount;

  // Outright Cash Purchase: Purchase Price + Gross Running Costs - Foregone investment return
  const grossRunningCostsOverTerm = totalGrossRunningCosts * leaseTermYears;
  const cashOpportunityCost = (vehiclePurchasePrice * Math.pow(1 + opportunityCostRate, leaseTermYears)) - vehiclePurchasePrice;
  const totalCashCost = vehiclePurchasePrice + grossRunningCostsOverTerm + cashOpportunityCost;

  // Secured Car Loan: Full Purchase Price financed + Interest + Gross Running Costs
  const monthlyLoanPayment = calcMonthlyLeasePayment(vehiclePurchasePrice, carLoanInterestRate, leaseTermYears, 0);
  const totalLoanRepayments = monthlyLoanPayment * 12 * leaseTermYears;
  const totalLoanCost = totalLoanRepayments + grossRunningCostsOverTerm;

  return {
    isFBTExempt,
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

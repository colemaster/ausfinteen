import { describe, it, expect } from 'vitest';
import { calculateEVNovatedLease, EV_LEASE_CONSTANTS } from './engine';

describe('EV Novated Lease Engine (FY2026-27 parameters)', () => {
  it('correctly qualifies EV under Fuel-Efficient LCT cap ($91,387) for 100% FBT exemption', () => {
    const res = calculateEVNovatedLease({
      vehiclePurchasePrice: 65000,
      annualSalary: 120000,
      leaseTermYears: 5,
      annualKilometres: 15000,
      leaseInterestRate: 0.0825,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.055,
      isElectricVehicle: true,
    });

    expect(res.isFBTExempt).toBe(true);
    expect(res.lctLimit).toBe(91387);
    expect(res.postTaxContributionECM).toBe(0);
    expect(res.fbtSavedVsNonExempt).toBeGreaterThan(0);
    // GST saving capped at $6,334
    expect(res.gstSavingOnPurchase).toBeLessThanOrEqual(EV_LEASE_CONSTANTS.maxGSTCredit);
    expect(res.gstSavingOnPurchase).toBe(Math.min(Math.round(65000 / 11), EV_LEASE_CONSTANTS.maxGSTCredit));
    expect(res.totalSavingsVsCash).toBeGreaterThan(0);
    expect(res.totalSavingsVsLoan).toBeGreaterThan(0);
  });

  it('verifies exact threshold boundary at $91,387 LCT limit', () => {
    // Exactly at or just below $91,387 threshold
    const underCap = calculateEVNovatedLease({
      vehiclePurchasePrice: 91387,
      annualSalary: 150000,
      leaseTermYears: 3,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
    });
    expect(underCap.isFBTExempt).toBe(true);
    expect(underCap.postTaxContributionECM).toBe(0);

    // Over $91,387 threshold by even $1
    const overCap = calculateEVNovatedLease({
      vehiclePurchasePrice: 91388,
      annualSalary: 150000,
      leaseTermYears: 3,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
    });
    expect(overCap.isFBTExempt).toBe(false);
    expect(overCap.postTaxContributionECM).toBeGreaterThan(0);
    // Over-cap has significantly lower tax savings than exempt lease
    expect(overCap.annualTaxSavings).toBeLessThan(underCap.annualTaxSavings);
  });

  it('correctly calculates RFBA gross-up amount', () => {
    const res = calculateEVNovatedLease({
      vehiclePurchasePrice: 50000,
      annualSalary: 95000,
      leaseTermYears: 3,
      annualKilometres: 12000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
    });

    // RFBA = $50,000 * 20% * 1.8868 = $18,868
    expect(res.reportableFringeBenefitAmount).toBe(18868);
  });

  it('caps upfront GST input tax credit at $6,334 for luxury vehicles', () => {
    const res = calculateEVNovatedLease({
      vehiclePurchasePrice: 85000,
      annualSalary: 130000,
      leaseTermYears: 4,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
    });

    // $85,000 / 11 = $7,727.27, capped at $6,334
    expect(res.gstSavingOnPurchase).toBe(6334);
    expect(res.netFinancedAmount).toBe(85000 - 6334);
  });

  it('correctly disallows FBT exemption for PHEVs ordered after 1 April 2025 sunset date', () => {
    // Grandfathered PHEV ordered before 1 April 2025
    const phevExempt = calculateEVNovatedLease({
      vehiclePurchasePrice: 60000,
      annualSalary: 110000,
      leaseTermYears: 3,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
      isPHEV: true,
      phevContractDateBeforeSunset: true,
    });
    expect(phevExempt.isFBTExempt).toBe(true);

    // PHEV ordered after 1 April 2025 sunset
    const phevNonExempt = calculateEVNovatedLease({
      vehiclePurchasePrice: 60000,
      annualSalary: 110000,
      leaseTermYears: 3,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
      isPHEV: true,
      phevContractDateBeforeSunset: false,
    });
    expect(phevNonExempt.isFBTExempt).toBe(false);
    expect(phevNonExempt.postTaxContributionECM).toBeGreaterThan(0);
  });

  it('supports ATO PCG 2024/2 updated safe harbour rate (5.47c/km from 1 April 2026)', () => {
    const res = calculateEVNovatedLease({
      vehiclePurchasePrice: 55000,
      annualSalary: 100000,
      leaseTermYears: 3,
      annualKilometres: 15000,
      leaseInterestRate: 0.08,
      carLoanInterestRate: 0.075,
      opportunityCostRate: 0.05,
      isElectricVehicle: true,
      includeHomeChargingSafeHarbour: true,
      safeHarbourRatePerKm: EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm2026,
    });

    // 15,000 km * 0.0547 = $820.50 -> rounded to $821
    expect(res.annualRunningCosts.chargingElectricity).toBe(821);
  });
});

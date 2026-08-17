import { describe, it, expect } from 'vitest';
import { calculateEVNovatedLease, EV_LEASE_CONSTANTS } from './engine';

describe('EV Novated Lease Engine', () => {
  it('correctly qualifies EV under Fuel-Efficient LCT cap for 100% FBT exemption', () => {
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
    // GST saving capped at $6,334
    expect(res.gstSavingOnPurchase).toBeLessThanOrEqual(EV_LEASE_CONSTANTS.maxGSTCredit);
    expect(res.gstSavingOnPurchase).toBe(Math.min(Math.round(65000 / 11), EV_LEASE_CONSTANTS.maxGSTCredit));
    expect(res.totalSavingsVsCash).toBeGreaterThan(0);
    expect(res.totalSavingsVsLoan).toBeGreaterThan(0);
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
});

import { useState, useMemo, useCallback } from 'react';
import { calculateEVNovatedLease, EV_LEASE_CONSTANTS } from './engine';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  Zap,
  Car,
  Sparkles,
  Download,
  Share2,
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface CarPreset {
  name: string;
  price: number;
  badge: string;
  powertrain?: 'BEV' | 'PHEV';
}

const POPULAR_EV_PRESETS: CarPreset[] = [
  { name: 'BYD Dolphin Essential', price: 38890, badge: 'Budget BEV', powertrain: 'BEV' },
  { name: 'MG4 Excite 51', price: 39990, badge: 'Best Value', powertrain: 'BEV' },
  { name: 'BYD Atto 3 Standard', price: 44499, badge: 'Popular SUV', powertrain: 'BEV' },
  { name: 'BYD Seal Dynamic', price: 49888, badge: 'Sport Sedan', powertrain: 'BEV' },
  { name: 'Tesla Model 3 RWD', price: 58900, badge: 'Top Seller', powertrain: 'BEV' },
  { name: 'Tesla Model Y RWD', price: 63900, badge: 'Top AU EV', powertrain: 'BEV' },
  { name: 'Outlander PHEV ES', price: 57290, badge: 'PHEV Sunset', powertrain: 'PHEV' },
  { name: 'Hyundai Ioniq 5', price: 69800, badge: 'Premium', powertrain: 'BEV' },
  { name: 'Kia EV9 Earth', price: 89900, badge: 'Near Cap', powertrain: 'BEV' },
  { name: 'BMW i4 eDrive40', price: 98900, badge: 'Over Cap', powertrain: 'BEV' },
];

export function EVNovatedLeaseCalc() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(63900);
  const [annualSalary, setAnnualSalary] = useState<number>(115000);
  const [leaseTerm, setLeaseTerm] = useState<number>(5);
  const [powertrain, setPowertrain] = useState<'BEV' | 'PHEV' | 'ICE'>('BEV');
  const [phevGrandfathered, setPhevGrandfathered] = useState<boolean>(false);
  const [safeHarbourRate, setSafeHarbourRate] = useState<number>(EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm);
  const [useIndexedLct, setUseIndexedLct] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showRfbaHelp, setShowRfbaHelp] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const annualKm = 15000;
  const leaseRate = 8.25;
  const loanRate = 7.5;
  const opportunityRate = 5.5;

  const result = useMemo(() => {
    return calculateEVNovatedLease({
      vehiclePurchasePrice: vehiclePrice,
      annualSalary,
      leaseTermYears: leaseTerm,
      annualKilometres: annualKm,
      leaseInterestRate: leaseRate / 100,
      carLoanInterestRate: loanRate / 100,
      opportunityCostRate: opportunityRate / 100,
      isElectricVehicle: powertrain !== 'ICE',
      isPHEV: powertrain === 'PHEV',
      phevContractDateBeforeSunset: phevGrandfathered,
      safeHarbourRatePerKm: safeHarbourRate,
      customLctLimit: useIndexedLct ? EV_LEASE_CONSTANTS.fuelEfficientLCTLimit2027 : EV_LEASE_CONSTANTS.fuelEfficientLCTLimit,
      includeHomeChargingSafeHarbour: true,
    });
  }, [
    vehiclePrice,
    annualSalary,
    leaseTerm,
    annualKm,
    leaseRate,
    loanRate,
    opportunityRate,
    powertrain,
    phevGrandfathered,
    safeHarbourRate,
    useIndexedLct,
  ]);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Vehicle Purchase Price', `$${vehiclePrice}`],
      ['Vehicle Powertrain', `${powertrain} (${powertrain === 'PHEV' ? (phevGrandfathered ? 'Pre-1 Apr 2025 Grandfathered' : 'Post-Sunset') : powertrain})`],
      ['Gross Annual Salary', `$${annualSalary}`],
      ['Lease Term (Years)', `${leaseTerm}`],
      ['LCT Limit', `$${result.lctLimit}`],
      ['FBT Exemption Status', result.isFBTExempt ? '100% FBT Exempt (FBTAA s 8A)' : 'FBT Applies (Over Cap or Post-Sunset PHEV / ECM Required)'],
      ['Upfront GST Saved on Purchase', `$${result.gstSavingOnPurchase}`],
      ['Annual Running Costs GST Saved', `$${result.annualRunningCosts.totalGSTSavings}`],
      ['Monthly Pre-Tax Deduction', `$${result.monthlyPreTaxDeduction}`],
      ['Annual Income Tax Saved', `$${result.annualTaxSavings}`],
      ['Net Take-Home Reduction (Per Month)', `$${Math.round(result.netAnnualTakeHomePayReduction / 12)}`],
      ['Residual Balloon at End of Term', `$${result.residualBalloonAmount}`],
      ['Reportable Fringe Benefit (RFBA)', `$${result.reportableFringeBenefitAmount}`],
      ['Total 5-Year Lease Cost', `$${result.fiveYearTotalCostOfOwnership.novatedLease}`],
      ['Total 5-Year Cash Cost', `$${result.fiveYearTotalCostOfOwnership.outrightCash}`],
      ['Total 5-Year Car Loan Cost', `$${result.fiveYearTotalCostOfOwnership.securedCarLoan}`],
      ['Total Savings vs Cash Purchase', `$${result.totalSavingsVsCash}`],
      ['Total Savings vs Car Loan', `$${result.totalSavingsVsLoan}`],
    ];
    exportToCSV('EV_Novated_Lease_Comparison.csv', headers, rows);
    toast.success('Lease comparison exported to CSV!');
  };

  const handleReset = useCallback(() => {
    setVehiclePrice(63900);
    setAnnualSalary(115000);
    setLeaseTerm(5);
    setPowertrain('BEV');
    setPhevGrandfathered(false);
    setSafeHarbourRate(EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm);
    setUseIndexedLct(false);
  }, []);

  const summaryText = useMemo(() => {
    return [
      '--- EV Novated Lease vs Cash vs Car Loan (FY2026-27) ---',
      `Vehicle: $${vehiclePrice.toLocaleString()} (${powertrain} | ${result.isFBTExempt ? '100% FBT Exempt' : 'FBT Non-Exempt'}) | Term: ${leaseTerm} yrs`,
      `LCT Limit: $${result.lctLimit.toLocaleString()} (${useIndexedLct ? 'FY2026-27 indexed' : 'FY2025-26 statutory baseline'})`,
      `Gross Salary: $${annualSalary.toLocaleString()} | Upfront GST Saved: $${result.gstSavingOnPurchase.toLocaleString()}`,
      `Annual Tax Saved: $${result.annualTaxSavings.toLocaleString()}/yr | Net Monthly Pay Impact: $${Math.round(result.netAnnualTakeHomePayReduction / 12).toLocaleString()}/mo`,
      `Reportable Fringe Benefit (RFBA): $${result.reportableFringeBenefitAmount.toLocaleString()} (on Payment Summary)`,
      `5-Yr TCO Novated Lease: $${result.fiveYearTotalCostOfOwnership.novatedLease.toLocaleString()}`,
      `5-Yr TCO Outright Cash: $${result.fiveYearTotalCostOfOwnership.outrightCash.toLocaleString()} (Saving: $${result.totalSavingsVsCash.toLocaleString()})`,
      `5-Yr TCO Secured Loan: $${result.fiveYearTotalCostOfOwnership.securedCarLoan.toLocaleString()} (Saving: $${result.totalSavingsVsLoan.toLocaleString()})`,
      `Calculated via AusFinTools EV Novated Lease Suite`,
    ].join('\n');
  }, [vehiclePrice, powertrain, useIndexedLct, leaseTerm, annualSalary, result]);

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = { vehiclePrice, annualSalary, leaseTerm, annualKm, leaseRate, powertrain, phevGrandfathered, safeHarbourRate };
    const hash = await encodePlanToHash(state);
    const url = `${window.location.origin}${window.location.pathname}#plan=${hash}`;
    setShareUrl(url);
    setShowShareModal(true);
    navigator.clipboard.writeText(url);
    toast.success('Shareable link copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              FBTAA Section 8A 100% Exemption & ATO Safe Harbour
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              EV Novated Lease vs Cash vs Car Loan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Calculate pre-tax salary sacrifice savings under the FY2026-27 LCT cap (${EV_LEASE_CONSTANTS.fuelEfficientLCTLimit.toLocaleString()}), GST savings up to $6,334, and 5-year TCO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <CalculatorActions
              onReset={handleReset}
              summaryText={summaryText}
              summaryTitle="EV Novated Lease"
            />
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleSharePlan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Plan
            </button>
          </div>
        </div>
      </div>

      {/* Preset Model Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Quick Select Popular Electric Vehicles (FY2026-27)
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {POPULAR_EV_PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                sound.playClick();
                setVehiclePrice(p.price);
                if (p.powertrain) {
                  setPowertrain(p.powertrain);
                } else {
                  setPowertrain('BEV');
                }
              }}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                vehiclePrice === p.price
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{p.name}</span>
              <span className="font-mono opacity-80">${(p.price / 1000).toFixed(1)}k</span>
              {p.price > result.lctLimit && (
                <span className="text-[9px] bg-rose-500/20 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded">Over Cap</span>
              )}
              {p.powertrain === 'PHEV' && (
                <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded">PHEV</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FBT Status Banner */}
      {result.isFBTExempt ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-sm block">
              100% FBT Exempt (FBTAA Section 8A)
              {powertrain === 'PHEV' && <span className="ml-2 text-xs font-normal text-emerald-700 dark:text-emerald-300">(Grandfathered Pre-1 April 2025 Lease)</span>}
            </span>
            <p className="opacity-90">
              This vehicle (${vehiclePrice.toLocaleString()}) sits under the {useIndexedLct ? 'FY2026-27 indexed' : 'FY2025-26'} Fuel-Efficient Luxury Car Tax (LCT) threshold of <strong>${result.lctLimit.toLocaleString()}</strong>.
              All lease payments, charging electricity, insurance, tyres, and registration are 100% salary sacrificed from pre-tax pay with <strong>$0 Fringe Benefits Tax</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-950 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-sm block">
              {powertrain === 'PHEV' && !phevGrandfathered
                ? 'FBT Exemption Ended — Plug-in Hybrid (PHEV) Sunset Date (1 April 2025)'
                : vehiclePrice > result.lctLimit
                ? `FBT Applies — Over $${result.lctLimit.toLocaleString()} Fuel-Efficient LCT Threshold`
                : 'FBT Applies — Conventional Combustion Vehicle'}
            </span>
            <p className="opacity-90">
              {powertrain === 'PHEV' && !phevGrandfathered
                ? `Under the Treasury Laws Amendment (Electric Car Discount) Act 2022, plug-in hybrids (PHEVs) ordered or leased on or after 1 April 2025 no longer receive 0% FBT. To avoid employer FBT at 47%, an Employee Contribution Method (ECM) post-tax contribution of $${result.postTaxContributionECM.toLocaleString()}/yr is required from after-tax salary.`
                : vehiclePrice > result.lctLimit
                ? `Vehicles priced above $${result.lctLimit.toLocaleString()} do not qualify for the 100% FBT discount. To avoid employer FBT at 47%, an Employee Contribution Method (ECM) post-tax contribution of $${result.postTaxContributionECM.toLocaleString()}/yr is required from after-tax salary, reducing your take-home tax savings.`
                : `Conventional petrol/diesel vehicles do not qualify for the Electric Car Discount. An after-tax ECM contribution of $${result.postTaxContributionECM.toLocaleString()}/yr is required to offset employer FBT.`}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            FBT Exemption Status
          </span>
          <div className={`text-xl sm:text-2xl font-extrabold ${result.isFBTExempt ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {result.isFBTExempt ? '100% Tax Free' : 'FBT Applies'}
          </div>
          <span className="text-[10px] text-muted-foreground">Cap: ${EV_LEASE_CONSTANTS.fuelEfficientLCTLimit.toLocaleString()} (FY2026-27)</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            GST Saved Upfront
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            <OdometerCounter value={result.gstSavingOnPurchase} />
          </div>
          <span className="text-[10px] text-muted-foreground">Max $6,334 statutory cap</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Annual Tax Saved
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            <OdometerCounter value={result.annualTaxSavings} />
            <span className="text-xs font-normal text-muted-foreground">/yr</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {result.isFBTExempt ? '100% pre-tax salary sacrifice' : 'Reduced by ECM post-tax payment'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Net Monthly Pay Impact
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            <OdometerCounter value={Math.round(result.netAnnualTakeHomePayReduction / 12)} />
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Includes all fuel, tyres, ins & rego</span>
        </div>
      </div>

      {/* 3-Way TCO Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Novated Lease */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-card border-2 border-emerald-500/40 space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            Recommended Package
          </div>
          <h3 className="text-base font-bold text-foreground">Option 1: EV Novated Lease</h3>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            <OdometerCounter value={result.fiveYearTotalCostOfOwnership.novatedLease} />
          </div>
          <p className="text-xs text-muted-foreground">
            Net out-of-pocket cost over {leaseTerm} years including all running costs, GST credits, and the {result.residualPercentage}% balloon (${result.residualBalloonAmount.toLocaleString()}).
          </p>
        </div>

        {/* Outright Cash */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Option 2: Cash Purchase</span>
          <h3 className="text-base font-bold text-foreground">Buy Outright in Cash</h3>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            <OdometerCounter value={result.fiveYearTotalCostOfOwnership.outrightCash} />
          </div>
          <p className="text-xs text-muted-foreground">
            Saves <strong>${result.totalSavingsVsCash.toLocaleString()}</strong> by leasing instead of spending cash upfront and forfeiting HISA/offset returns.
          </p>
        </div>

        {/* Secured Loan */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Option 3: Bank Car Loan</span>
          <h3 className="text-base font-bold text-foreground">5-Year Secured Loan</h3>
          <div className="text-2xl font-extrabold text-warning font-mono">
            <OdometerCounter value={result.fiveYearTotalCostOfOwnership.securedCarLoan} />
          </div>
          <p className="text-xs text-muted-foreground">
            Saves <strong>${result.totalSavingsVsLoan.toLocaleString()}</strong> vs paying with after-tax car loan repayments (7.5% p.a.).
          </p>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Vehicle & Salary Settings</h3>

          {/* Powertrain Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">Vehicle Powertrain Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPowertrain('BEV');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  powertrain === 'BEV'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted/70 text-foreground hover:bg-muted'
                }`}
              >
                ⚡️ Battery EV (BEV)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPowertrain('PHEV');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  powertrain === 'PHEV'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-muted/70 text-foreground hover:bg-muted'
                }`}
              >
                🔌 Plug-in Hybrid
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPowertrain('ICE');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  powertrain === 'ICE'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-muted/70 text-foreground hover:bg-muted'
                }`}
              >
                ⛽️ Petrol / Diesel
              </button>
            </div>
          </div>

          {/* PHEV Sunset Warning and Grandfathering Checkbox */}
          {powertrain === 'PHEV' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 text-amber-950 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="phev-grandfathered"
                  checked={phevGrandfathered}
                  onChange={e => setPhevGrandfathered(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="phev-grandfathered" className="font-semibold cursor-pointer">
                  Financially committed / lease entered into before 1 April 2025 sunset date (Grandfathered)
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-amber-300/80">
                Under the Treasury Laws Amendment (Electric Car Discount) Act 2022, PHEVs ordered on or after <strong>1 April 2025</strong> do not qualify for 0% FBT. Pre-existing leases remain grandfathered until the lease term ends.
              </p>
            </div>
          )}

          {/* Vehicle Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="ev-price" className="text-muted-foreground">Vehicle Price (Driveaway incl. GST)</label>
              <span className="font-mono text-foreground">${vehiclePrice.toLocaleString()}</span>
            </div>
            <input
              id="ev-price"
              type="range"
              min={30000}
              max={110000}
              step={1000}
              value={vehiclePrice}
              onChange={e => {
                sound.playTick();
                setVehiclePrice(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>$30k</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">LCT Cap: ${result.lctLimit.toLocaleString()}</span>
              <span>$110k</span>
            </div>
          </div>

          {/* LCT Threshold Toggle */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-muted-foreground font-medium">Fuel-Efficient LCT Cap:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setUseIndexedLct(false)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !useIndexedLct ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                $91,387 (FY25-26)
              </button>
              <button
                type="button"
                onClick={() => setUseIndexedLct(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  useIndexedLct ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                $91,661 (FY26-27)
              </button>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="ev-salary" className="text-muted-foreground">Annual Gross Salary</label>
              <span className="font-mono text-foreground">${annualSalary.toLocaleString()}</span>
            </div>
            <input
              id="ev-salary"
              type="range"
              min={45000}
              max={250000}
              step={2500}
              value={annualSalary}
              onChange={e => {
                sound.playTick();
                setAnnualSalary(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Lease Term */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="ev-term" className="text-muted-foreground">Lease Term: {leaseTerm} Years</label>
              <span className="font-mono text-muted-foreground">
                ATO Balloon: {result.residualPercentage}% (${result.residualBalloonAmount.toLocaleString()})
              </span>
            </div>
            <input
              id="ev-term"
              type="range"
              min={1}
              max={5}
              step={1}
              value={leaseTerm}
              onChange={e => {
                sound.playTick();
                setLeaseTerm(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Breakdown Column */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Annual Running Costs (100% Pre-Tax)</h3>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              +${result.annualRunningCosts.totalGSTSavings} GST Saved
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-border/60">
            {/* Safe Harbour Charging Rate with Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-1.5">
              <div className="space-y-0.5">
                <span className="text-muted-foreground block">ATO PCG 2024/2 Home Charging</span>
                <span className="text-[10px] text-muted-foreground">
                  {annualKm.toLocaleString()} km @ {(safeHarbourRate * 100).toFixed(2)}c/km
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSafeHarbourRate(EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      safeHarbourRate === EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    4.20c
                  </button>
                  <button
                    type="button"
                    onClick={() => setSafeHarbourRate(EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm2026)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      safeHarbourRate === EV_LEASE_CONSTANTS.atoSafeHarbourElectricityPerKm2026
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    5.47c (FY27+)
                  </button>
                </div>
                <span className="font-mono font-bold text-foreground">${result.annualRunningCosts.chargingElectricity}</span>
              </div>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Comprehensive EV Insurance</span>
              <span className="font-mono font-bold text-foreground">${result.annualRunningCosts.comprehensiveInsurance}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Tyres, Servicing & Maintenance</span>
              <span className="font-mono font-bold text-foreground">${result.annualRunningCosts.tyresAndMaintenance}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Registration & CTP</span>
              <span className="font-mono font-bold text-foreground">${result.annualRunningCosts.registrationAndCTP}</span>
            </div>
            <div className="flex justify-between py-1.5 text-primary font-bold">
              <div className="flex items-center gap-1">
                <span>Reportable Fringe Benefit (RFBA)</span>
                <button
                  type="button"
                  onClick={() => setShowRfbaHelp(!showRfbaHelp)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-mono">${result.reportableFringeBenefitAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Running Cost Savings Snapshot vs Petrol */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-foreground font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                EV vs Petrol Annual Fuel Economics ({annualKm.toLocaleString()} km)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                +${Math.round(3278 - result.annualRunningCosts.chargingElectricity).toLocaleString()}/yr Saved
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              • <strong>Petrol car / SUV:</strong> 9.5L/100km @ $2.30/L = <strong>$3,278/yr</strong> ($21.85/100km)<br />
              • <strong>EV electricity:</strong> 15 kWh/100km @ 28c flat = <strong>$630/yr</strong> ($4.20/100km)<br />
              • <strong>Off-peak EV tariff:</strong> 8c–15c/kWh = <strong>~$180–$338/yr</strong> (~$1.20–$2.25/100km)<br />
              • <strong>Annual fuel savings: $2,600+ every year</strong> (over $13,000 saved across 5 years).
            </p>
          </div>

          {showRfbaHelp && (
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground space-y-2">
              <span className="font-bold text-foreground block">What is RFBA & How Does It Affect You?</span>
              <p>
                Even though eligible EVs are <strong>100% exempt from FBT</strong> under FBTAA s 8A, the ATO requires employers to report the grossed-up fringe benefit on your annual income statement (myGov) when taxable value exceeds $2,000.
              </p>
              <div className="p-2 rounded-lg bg-card border border-border/60 font-mono text-[10px]">
                RFBA = Purchase Price × 20% statutory fraction × 1.8868 (Type 2 gross-up factor)
              </div>
              <p>
                <strong>What RFBA Affects:</strong> RFBA is <em>not</em> added to taxable income for standard income tax. However, it <strong>IS</strong> included in adjusted taxable income for:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>HECS / HELP loan repayments:</strong> Increases Repayment Income (RI), which can increase compulsory loan repayments.</li>
                <li><strong>Medicare Levy Surcharge (MLS):</strong> Counted towards the $97k+ single / $194k+ family MLS threshold.</li>
                <li><strong>Division 293 tax:</strong> Assessed against the $250,000 high-income superannuation threshold.</li>
                <li><strong>Centrelink Family Assistance:</strong> Assessed for Family Tax Benefit (FTB) and Child Care Subsidy (CCS) entitlement tests.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Share EV Lease Plan</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: generateSimpleQRCodeSVG(shareUrl, 160) }} />

            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full p-2 rounded-xl bg-muted border border-border text-[11px] font-mono text-foreground select-all"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Copied URL to clipboard!');
                setShowShareModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

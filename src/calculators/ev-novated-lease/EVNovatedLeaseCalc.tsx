import { useState, useMemo } from 'react';
import { calculateEVNovatedLease, EV_LEASE_CONSTANTS } from './engine';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  Zap,
  Car,
  Sparkles,
  Download,
  Share2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface CarPreset {
  name: string;
  price: number;
  badge: string;
}

const POPULAR_EV_PRESETS: CarPreset[] = [
  { name: 'BYD Dolphin Essential', price: 38890, badge: 'Budget BEV' },
  { name: 'MG4 Excite 51', price: 39990, badge: 'Best Value' },
  { name: 'BYD Atto 3 Standard', price: 44499, badge: 'Popular SUV' },
  { name: 'BYD Seal Dynamic', price: 49888, badge: 'Sport Sedan' },
  { name: 'Tesla Model 3 RWD', price: 58900, badge: 'Top Seller' },
  { name: 'Tesla Model Y RWD', price: 63900, badge: 'Top AU EV' },
  { name: 'Hyundai Ioniq 5', price: 69800, badge: 'Premium' },
];

export function EVNovatedLeaseCalc() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(63900);
  const [annualSalary, setAnnualSalary] = useState<number>(115000);
  const [leaseTerm, setLeaseTerm] = useState<number>(5);
  const [isEV, setIsEV] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
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
      isElectricVehicle: isEV,
      includeHomeChargingSafeHarbour: true,
    });
  }, [vehiclePrice, annualSalary, leaseTerm, annualKm, leaseRate, loanRate, opportunityRate, isEV]);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Vehicle Purchase Price', `$${vehiclePrice}`],
      ['Gross Annual Salary', `$${annualSalary}`],
      ['Lease Term (Years)', `${leaseTerm}`],
      ['FBT Status', result.isFBTExempt ? '100% FBT Exempt' : 'Standard FBT'],
      ['GST Saving on Purchase', `$${result.gstSavingOnPurchase}`],
      ['Monthly Pre-Tax Deduction', `$${result.monthlyPreTaxDeduction}`],
      ['Annual Income Tax Saved', `$${result.annualTaxSavings}`],
      ['Net Take-Home Reduction (Per Month)', `$${Math.round(result.netAnnualTakeHomePayReduction / 12)}`],
      ['Residual Balloon at End of Term', `$${result.residualBalloonAmount}`],
      ['Total 5-Year Lease Cost', `$${result.fiveYearTotalCostOfOwnership.novatedLease}`],
      ['Total 5-Year Cash Cost', `$${result.fiveYearTotalCostOfOwnership.outrightCash}`],
      ['Total 5-Year Car Loan Cost', `$${result.fiveYearTotalCostOfOwnership.securedCarLoan}`],
      ['Total Savings vs Cash Purchase', `$${result.totalSavingsVsCash}`],
      ['Total Savings vs Car Loan', `$${result.totalSavingsVsLoan}`],
    ];
    exportToCSV('EV_Novated_Lease_Comparison.csv', headers, rows);
    toast.success('Lease comparison exported to CSV!');
  };

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = { vehiclePrice, annualSalary, leaseTerm, annualKm, leaseRate, isEV };
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
              Calculate pre-tax salary packaging savings on EVs, GST exemptions up to $6,334, and 5-year TCO.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
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
          Quick Select Popular Electric Vehicles
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {POPULAR_EV_PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                sound.playClick();
                setVehiclePrice(p.price);
                setIsEV(true);
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
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            FBT Exemption Status
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {result.isFBTExempt ? '100% Tax Free' : 'FBT Applies'}
          </div>
          <span className="text-[10px] text-muted-foreground">Under ${EV_LEASE_CONSTANTS.fuelEfficientLCTLimit2026.toLocaleString()} LCT Cap</span>
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
          <span className="text-[10px] text-muted-foreground">Via 100% pre-tax salary sacrifice</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Net Monthly Pay Impact
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            <OdometerCounter value={Math.round(result.netAnnualTakeHomePayReduction / 12)} />
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Includes all fuel, tyres & rego</span>
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
            Net 5-year out-of-pocket cost including all running costs and residual balloon.
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
            Saves <strong>${result.totalSavingsVsCash.toLocaleString()}</strong> by leasing instead of paying cash upfront.
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
            Saves <strong>${result.totalSavingsVsLoan.toLocaleString()}</strong> vs paying with after-tax car loan repayments.
          </p>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Vehicle & Salary Settings</h3>

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
                Balloon: {result.residualPercentage}% (${result.residualBalloonAmount.toLocaleString()})
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
          <h3 className="text-sm font-bold text-foreground">Annual Running Costs (100% Pre-Tax)</h3>

          <div className="space-y-2 text-xs divide-y divide-border/60">
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">ATO Safe Harbour Charging ({annualKm.toLocaleString()} km @ 4.2c/km)</span>
              <span className="font-mono font-bold text-foreground">${result.annualRunningCosts.chargingElectricity}</span>
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
              <span>Reportable Fringe Benefit (RFBA on Tax Return)</span>
              <span className="font-mono">${result.reportableFringeBenefitAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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

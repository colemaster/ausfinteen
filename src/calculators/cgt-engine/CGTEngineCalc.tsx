import { useState, useMemo } from 'react';
import { calculateCGT } from './engine';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { sound } from '@/lib/sound-synthesizer';
import { exportToCSV, encodePlanToHash, generateSimpleQRCodeSVG } from '@/lib/share-state';
import {
  FileText,
  Home,
  CheckCircle2,
  Download,
  Share2,
  X,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function CGTEngineCalc() {
  const [assetType, setAssetType] = useState<'property' | 'shares' | 'crypto'>('property');
  const [purchasePrice, setPurchasePrice] = useState<number>(650000);
  const [salePrice, setSalePrice] = useState<number>(920000);
  const [ownershipMonths, setOwnershipMonths] = useState<number>(36);
  const [buyingCosts, setBuyingCosts] = useState<number>(28000); // Stamp duty & conveyancing
  const [renovations] = useState<number>(15000);
  const [sellingCosts, setSellingCosts] = useState<number>(22000); // Agent commission & legal
  const [div43Clawback, setDiv43Clawback] = useState<number>(8000); // Capital works depreciation
  const currentLosses = 0;
  const priorLosses = 0;
  const isMainResidence = true;
  const wasRentedOut = true;
  const [taxableIncome, setTaxableIncome] = useState<number>(110000);
  // 6-Year Rule
  const [rentedMonths, setRentedMonths] = useState<number>(48);
  const [electedSixYear, setElectedSixYear] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const result = useMemo(() => {
    return calculateCGT({
      assetType,
      purchasePrice,
      salePrice,
      ownershipMonths,
      costBaseElements: {
        purchasePrice,
        incidentalAcquisitionCosts: buyingCosts,
        capitalImprovementsRenovations: renovations,
        titleAndSellingCosts: sellingCosts,
        division43CapitalWorksClaimed: div43Clawback,
      },
      currentYearCapitalLosses: currentLosses,
      priorYearCarriedForwardLosses: priorLosses,
      regularTaxableIncome: taxableIncome,
      isMainResidence: assetType === 'property' && isMainResidence,
      wasRentedOut: assetType === 'property' && wasRentedOut,
      rentedMonths,
      electedSixYearExemption: electedSixYear,
    });
  }, [
    assetType,
    purchasePrice,
    salePrice,
    ownershipMonths,
    buyingCosts,
    renovations,
    sellingCosts,
    div43Clawback,
    currentLosses,
    priorLosses,
    taxableIncome,
    isMainResidence,
    wasRentedOut,
    rentedMonths,
    electedSixYear,
  ]);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['CGT Item', 'Amount ($)'];
    const rows = [
      ['Gross Sale Price', salePrice],
      ['Adjusted Cost Base (incl. Div 43 Clawback)', result.adjustedCostBase],
      ['Gross Capital Gain', result.grossCapitalGain],
      ['Capital Losses Offset', result.lossesOffsetApplied],
      ['50% CGT Discount Deducted', result.cgtDiscount50PercentAmount],
      ['Net Taxable Capital Gain', result.netTaxableCapitalGain],
      ['Total Tax with Capital Gain', result.taxWithCapitalGain],
      ['CGT Tax Payable to ATO', result.cgtTaxPayable],
    ];
    exportToCSV('Capital_Gains_Tax_Schedule.csv', headers, rows);
    toast.success('CGT schedule exported to CSV!');
  };

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = {
      assetType,
      purchasePrice,
      salePrice,
      ownershipMonths,
      taxableIncome,
      isMainResidence,
      wasRentedOut,
      rentedMonths,
    };
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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              ITAA 1997 Div 115, s 102-5 & s 118-145 Compliant
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Capital Gains Tax & 6-Year Rule Engine
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Accurately model the 50% CGT discount, loss ordering priorities, 6-year absence exemption, and Div 43 cost base clawback.
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

      {/* Asset Type Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-2xl w-fit">
        {(['property', 'shares', 'crypto'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => {
              sound.playClick();
              setAssetType(type);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              assetType === type
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {type === 'property' ? '🏡 Real Estate Property' : type === 'shares' ? '📈 Shares & ETFs' : '🪙 Crypto & Digital Assets'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Gross Capital Gain
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">
            <OdometerCounter value={result.grossCapitalGain} />
          </div>
          <span className="text-[10px] text-muted-foreground">Sale Price - Cost Base</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            50% CGT Discount
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            -<OdometerCounter value={result.cgtDiscount50PercentAmount} />
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {result.discountEligible ? '50% discount applied (>12 mos)' : 'Held <12 months (0%)'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Net Taxable Gain (ATO)
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
            <OdometerCounter value={result.netTaxableCapitalGain} />
          </div>
          <span className="text-[10px] text-muted-foreground">Added to taxable income</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            CGT Tax Payable
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-danger font-mono">
            <OdometerCounter value={result.cgtTaxPayable} />
          </div>
          <span className="text-[10px] text-muted-foreground">Effective CGT: {result.effectiveCGTRateOnGrossGain}%</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Purchase & Sale Sliders */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Transaction & Cost Base Elements</h3>

          {/* Sale Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-sale-price" className="text-muted-foreground">Sale / Disposal Price</label>
              <span className="font-mono text-foreground">${salePrice.toLocaleString()}</span>
            </div>
            <input
              id="cgt-sale-price"
              type="range"
              min={10000}
              max={2500000}
              step={10000}
              value={salePrice}
              onChange={e => {
                sound.playTick();
                setSalePrice(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-purchase-price" className="text-muted-foreground">Original Purchase Price</label>
              <span className="font-mono text-foreground">${purchasePrice.toLocaleString()}</span>
            </div>
            <input
              id="cgt-purchase-price"
              type="range"
              min={5000}
              max={2000000}
              step={10000}
              value={purchasePrice}
              onChange={e => {
                sound.playTick();
                setPurchasePrice(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Ownership Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-ownership-months" className="text-muted-foreground">Holding Period: {ownershipMonths} Months</label>
              <span className="font-mono text-muted-foreground">
                ({(ownershipMonths / 12).toFixed(1)} Years)
              </span>
            </div>
            <input
              id="cgt-ownership-months"
              type="range"
              min={1}
              max={120}
              step={1}
              value={ownershipMonths}
              onChange={e => {
                sound.playTick();
                setOwnershipMonths(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Regular Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-taxable-income" className="text-muted-foreground">Your Regular Annual Taxable Income</label>
              <span className="font-mono text-foreground">${taxableIncome.toLocaleString()}</span>
            </div>
            <input
              id="cgt-taxable-income"
              type="range"
              min={0}
              max={250000}
              step={5000}
              value={taxableIncome}
              onChange={e => {
                sound.playTick();
                setTaxableIncome(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* 6-Year Rule & Deductions Column */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-foreground">Exemptions & Cost Base Adjustments</h3>

          {assetType === 'property' && (
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-primary" />
                  Section 118-145 6-Year Absence Rule
                </span>
                <input
                  type="checkbox"
                  checked={electedSixYear}
                  onChange={e => {
                    sound.playClick();
                    setElectedSixYear(e.target.checked);
                  }}
                  className="w-4 h-4 accent-primary rounded-sm cursor-pointer"
                />
              </div>

              {electedSixYear && (
                <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
                  <div className="flex justify-between">
                    <label htmlFor="cgt-rented-months" className="text-muted-foreground">Months Rented Out:</label>
                    <span className="font-mono font-bold text-foreground">{rentedMonths} Months ({Math.round(rentedMonths / 12)} Yrs)</span>
                  </div>
                  <input
                    id="cgt-rented-months"
                    type="range"
                    min={1}
                    max={120}
                    step={1}
                    value={rentedMonths}
                    onChange={e => setRentedMonths(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  {result.isFullyExemptUnderSixYearRule ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      100% Tax Exempt under the 6-Year Main Residence Rule!
                    </div>
                  ) : (
                    <div className="text-[11px] text-warning font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Exceeds 6 years (72 mos). Partial CGT of {result.taxableApportionmentPercentage}% applies to excess.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Incidental & Selling Costs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="cgt-buying-costs" className="text-[11px] text-muted-foreground font-semibold">Buying Costs (Stamp Duty)</label>
              <input
                id="cgt-buying-costs"
                type="number"
                value={buyingCosts}
                onChange={e => setBuyingCosts(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-muted border border-border font-mono text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="cgt-selling-costs" className="text-[11px] text-muted-foreground font-semibold">Selling Costs (Agent/Legal)</label>
              <input
                id="cgt-selling-costs"
                type="number"
                value={sellingCosts}
                onChange={e => setSellingCosts(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-muted border border-border font-mono text-foreground"
              />
            </div>
          </div>

          {/* Div 43 Clawback */}
          {assetType === 'property' && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <label htmlFor="cgt-div43" className="text-[11px] text-muted-foreground font-semibold">Div 43 Capital Works Depreciation Claimed (Clawback)</label>
                <span className="font-mono text-danger font-bold">-${div43Clawback.toLocaleString()}</span>
              </div>
              <input
                id="cgt-div43"
                type="number"
                value={div43Clawback}
                onChange={e => setDiv43Clawback(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-muted border border-border font-mono text-foreground"
              />
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Share CGT Calculation</h3>
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

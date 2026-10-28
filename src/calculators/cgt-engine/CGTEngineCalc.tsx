import { useState, useMemo, useCallback } from 'react';
import {
  calculateCGT,
  cgtOnDisposal,
  type TaxpayerEntity,
} from './engine';
import { OdometerCounter } from '@/components/shared/OdometerCounter';
import { QuickPresetBar, type ScenarioPreset } from '../../components/ui/QuickPresetBar';
import { CalculatorActions } from '../../components/shared/CalculatorActions';
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
  Hammer,
  KeyRound,
  Landmark,
  ReceiptText,
  ShieldAlert,
  TrendingDown,
  BookOpen,
  Info,
  Scale,
} from 'lucide-react';
import { toast } from '@/lib/toast';

const WORKFLOW_STEPS = [
  { id: 'buy', label: 'Buy', icon: KeyRound },
  { id: 'improve', label: 'Improve & Hold', icon: Hammer },
  { id: 'rent', label: 'Rent / Absence', icon: Home },
  { id: 'losses', label: 'Losses & Offsets', icon: TrendingDown },
  { id: 'sell', label: 'Sell & Tax', icon: Landmark },
] as const;

interface CGTPreset {
  assetType: 'property' | 'shares' | 'crypto';
  purchasePrice: number;
  salePrice: number;
  ownershipMonths: number;
  buyingCosts: number;
  renovations: number;
  sellingCosts: number;
  div43Clawback: number;
  holdingCosts?: number;
  currentLosses?: number;
  priorLosses?: number;
  taxableIncome: number;
  rentedMonths: number;
  electedSixYear: boolean;
  taxpayerEntity?: TaxpayerEntity;
  isAustralianResident?: boolean;
}

const PRESETS: ScenarioPreset<CGTPreset>[] = [
  {
    id: 'rental-property',
    label: 'Investment Property ($920k)',
    badge: 'Div 43 & 6-Yr',
    description: 'Property bought for $650k, sold for $920k after 3 years renting with Div 43 clawback',
    values: {
      assetType: 'property',
      purchasePrice: 650000,
      salePrice: 920000,
      ownershipMonths: 36,
      buyingCosts: 28000,
      renovations: 15000,
      sellingCosts: 22000,
      div43Clawback: 8000,
      holdingCosts: 0,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 110000,
      rentedMonths: 36,
      electedSixYear: true,
      taxpayerEntity: 'individual',
      isAustralianResident: true,
    },
  },
  {
    id: 'asx-etf-sale',
    label: 'ASX ETF Sale ($210k)',
    badge: '50% CGT Discount',
    description: 'Long-term ETF portfolio held 2+ years with $90k gross capital gain',
    values: {
      assetType: 'shares',
      purchasePrice: 120000,
      salePrice: 210000,
      ownershipMonths: 24,
      buyingCosts: 50,
      renovations: 0,
      sellingCosts: 500,
      div43Clawback: 0,
      holdingCosts: 0,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 130000,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'individual',
      isAustralianResident: true,
    },
  },
  {
    id: 'crypto-gains',
    label: 'Crypto Asset Sale ($95k)',
    badge: 'Digital Assets',
    description: 'Crypto acquired for $25k sold for $95k after 18 months holding',
    values: {
      assetType: 'crypto',
      purchasePrice: 25000,
      salePrice: 95000,
      ownershipMonths: 18,
      buyingCosts: 100,
      renovations: 0,
      sellingCosts: 400,
      div43Clawback: 0,
      holdingCosts: 0,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 95000,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'individual',
      isAustralianResident: true,
    },
  },
  {
    id: 'minor-gifted-trap',
    label: 'Minor Gifted Shares ($25k)',
    badge: 'Div 6AA 47% Penalty',
    description: 'Child under 18 selling gifted shares triggers 47% penalty tax on unearned capital gains above $416',
    values: {
      assetType: 'shares',
      purchasePrice: 5000,
      salePrice: 25000,
      ownershipMonths: 18,
      buyingCosts: 30,
      renovations: 0,
      sellingCosts: 30,
      div43Clawback: 0,
      holdingCosts: 0,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 0,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'minor_unearned',
      isAustralianResident: true,
    },
  },
  {
    id: 'minor-job-savings',
    label: 'Teen Own Job Wages ($25k)',
    badge: 'Excepted ($18.2k Free)',
    description: 'Teen invested savings from their own retail/fast-food job: 100% exempt from Div 6AA penalty tax',
    values: {
      assetType: 'shares',
      purchasePrice: 5000,
      salePrice: 25000,
      ownershipMonths: 18,
      buyingCosts: 30,
      renovations: 0,
      sellingCosts: 30,
      div43Clawback: 0,
      holdingCosts: 0,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 4500,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'minor_excepted',
      isAustralianResident: true,
    },
  },
  {
    id: 'vacant-land-holding',
    label: 'Vacant Land Holding ($480k)',
    badge: 'Element 3 Costs',
    description: 'Non-income producing land: rates, land tax & interest reduce capital gains under s 110-25(4)',
    values: {
      assetType: 'property',
      purchasePrice: 320000,
      salePrice: 480000,
      ownershipMonths: 48,
      buyingCosts: 18000,
      renovations: 10000,
      sellingCosts: 14000,
      div43Clawback: 0,
      holdingCosts: 35000,
      currentLosses: 0,
      priorLosses: 0,
      taxableIncome: 125000,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'individual',
      isAustralianResident: true,
    },
  },
  {
    id: 'carried-forward-losses',
    label: 'Prior Loss Netting ($180k)',
    badge: 's 102-5 Priority',
    description: '$35k prior capital losses offset dollar-for-dollar against gross gain BEFORE 50% discount',
    values: {
      assetType: 'shares',
      purchasePrice: 80000,
      salePrice: 180000,
      ownershipMonths: 24,
      buyingCosts: 100,
      renovations: 0,
      sellingCosts: 500,
      div43Clawback: 0,
      holdingCosts: 0,
      currentLosses: 10000,
      priorLosses: 25000,
      taxableIncome: 105000,
      rentedMonths: 0,
      electedSixYear: false,
      taxpayerEntity: 'individual',
      isAustralianResident: true,
    },
  },
];

export function CGTEngineCalc() {
  const [assetType, setAssetType] = useState<'property' | 'shares' | 'crypto'>('property');
  const [taxpayerEntity, setTaxpayerEntity] = useState<TaxpayerEntity>('individual');
  const [isAustralianResident, setIsAustralianResident] = useState<boolean>(true);
  const [purchasePrice, setPurchasePrice] = useState<number>(650000);
  const [salePrice, setSalePrice] = useState<number>(920000);
  const [ownershipMonths, setOwnershipMonths] = useState<number>(36);
  const [buyingCosts, setBuyingCosts] = useState<number>(28000); // Stamp duty, conveyancing, brokerage
  const [renovations, setRenovations] = useState<number>(15000);
  const [holdingCosts, setHoldingCosts] = useState<number>(0); // Element 3 non-deductible rates, land tax, interest
  const [sellingCosts, setSellingCosts] = useState<number>(22000); // Agent commission & legal
  const [div43Clawback, setDiv43Clawback] = useState<number>(8000); // Capital works depreciation
  const [currentLosses, setCurrentLosses] = useState<number>(0);
  const [priorLosses, setPriorLosses] = useState<number>(0);
  const isMainResidence = true;
  const wasRentedOut = true;
  const [taxableIncome, setTaxableIncome] = useState<number>(110000);
  // 6-Year Rule
  const [rentedMonths, setRentedMonths] = useState<number>(48);
  const [electedSixYear, setElectedSixYear] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string | undefined>(undefined);
  const [activeEducationalTab, setActiveEducationalTab] = useState<'minors' | 'elements' | 'losses' | 'sixyear'>('minors');

  const handleApplyPreset = useCallback((preset: ScenarioPreset<CGTPreset>) => {
    setActivePreset(preset.id);
    if (!preset.values) return;
    if (preset.values.assetType !== undefined) setAssetType(preset.values.assetType);
    if (preset.values.purchasePrice !== undefined) setPurchasePrice(preset.values.purchasePrice);
    if (preset.values.salePrice !== undefined) setSalePrice(preset.values.salePrice);
    if (preset.values.ownershipMonths !== undefined) setOwnershipMonths(preset.values.ownershipMonths);
    if (preset.values.buyingCosts !== undefined) setBuyingCosts(preset.values.buyingCosts);
    if (preset.values.renovations !== undefined) setRenovations(preset.values.renovations);
    if (preset.values.sellingCosts !== undefined) setSellingCosts(preset.values.sellingCosts);
    if (preset.values.div43Clawback !== undefined) setDiv43Clawback(preset.values.div43Clawback);
    if (preset.values.holdingCosts !== undefined) setHoldingCosts(preset.values.holdingCosts);
    if (preset.values.currentLosses !== undefined) setCurrentLosses(preset.values.currentLosses);
    if (preset.values.priorLosses !== undefined) setPriorLosses(preset.values.priorLosses);
    if (preset.values.taxableIncome !== undefined) setTaxableIncome(preset.values.taxableIncome);
    if (preset.values.rentedMonths !== undefined) setRentedMonths(preset.values.rentedMonths);
    if (preset.values.electedSixYear !== undefined) setElectedSixYear(preset.values.electedSixYear);
    if (preset.values.taxpayerEntity !== undefined) setTaxpayerEntity(preset.values.taxpayerEntity);
    if (preset.values.isAustralianResident !== undefined) setIsAustralianResident(preset.values.isAustralianResident);
  }, []);

  const handleReset = useCallback(() => {
    setActivePreset(undefined);
    setAssetType('property');
    setTaxpayerEntity('individual');
    setIsAustralianResident(true);
    setPurchasePrice(650000);
    setSalePrice(920000);
    setOwnershipMonths(36);
    setBuyingCosts(28000);
    setRenovations(15000);
    setHoldingCosts(0);
    setSellingCosts(22000);
    setDiv43Clawback(8000);
    setCurrentLosses(0);
    setPriorLosses(0);
    setTaxableIncome(110000);
    setRentedMonths(48);
    setElectedSixYear(true);
  }, []);

  // ATO section references for the current scenario (workflow model)
  const disposalRefs = useMemo(
    () => {
      const r = cgtOnDisposal(purchasePrice, salePrice, {
        buyCosts: buyingCosts,
        sellCosts: sellingCosts,
        holdingCosts: holdingCosts,
        capitalWorksClaimed: assetType === 'property' ? div43Clawback : 0,
        incomeProducedWhileRented: assetType === 'property' && wasRentedOut ? 1 : 0,
        monthsRented: assetType === 'property' ? rentedMonths : 0,
        totalMonthsOwned: ownershipMonths,
      }, { currentYearLosses: currentLosses, carriedForwardLosses: priorLosses });
      return r.atoReferences;
    },
    [assetType, purchasePrice, salePrice, buyingCosts, sellingCosts, holdingCosts, div43Clawback, wasRentedOut, rentedMonths, ownershipMonths, currentLosses, priorLosses],
  );

  const result = useMemo(() => {
    return calculateCGT({
      assetType,
      purchasePrice,
      salePrice,
      ownershipMonths,
      costBaseElements: {
        purchasePrice,
        incidentalAcquisitionCosts: buyingCosts,
        holdingCosts,
        capitalImprovementsRenovations: renovations,
        titleAndSellingCosts: sellingCosts,
        division43CapitalWorksClaimed: assetType === 'property' ? div43Clawback : 0,
      },
      currentYearCapitalLosses: currentLosses,
      priorYearCarriedForwardLosses: priorLosses,
      regularTaxableIncome: taxableIncome,
      isMainResidence: assetType === 'property' && isMainResidence,
      wasRentedOut: assetType === 'property' && wasRentedOut,
      rentedMonths,
      electedSixYearExemption: electedSixYear,
      taxpayerEntity,
      isAustralianTaxResident: isAustralianResident,
    });
  }, [
    assetType,
    purchasePrice,
    salePrice,
    ownershipMonths,
    buyingCosts,
    holdingCosts,
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
    taxpayerEntity,
    isAustralianResident,
  ]);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['CGT Schedule Item', 'Amount / Value'];
    const rows = [
      ['Taxpayer Entity Profile', taxpayerEntity.replace('_', ' ').toUpperCase()],
      ['Australian Tax Resident', isAustralianResident ? 'YES' : 'NO (Foreign Resident)'],
      ['Asset Type', assetType.toUpperCase()],
      ['Gross Sale Proceeds', salePrice],
      ['Adjusted Cost Base (Elements 1-5 minus Div 43)', result.adjustedCostBase],
      ['Reduced Cost Base (Excludes Element 3 Holding Costs)', result.reducedCostBase],
      ['Gross Capital Gain', result.grossCapitalGain],
      ['Current Year Capital Losses Offset', Math.min(result.grossCapitalGain, currentLosses)],
      ['Prior Year Carried-Forward Losses Offset', Math.max(0, result.lossesOffsetApplied - currentLosses)],
      ['Total Losses Offset Applied (s 102-5)', result.lossesOffsetApplied],
      ['Remaining Carried-Forward Losses (Indefinite)', result.remainingCarriedForwardLosses],
      ['CGT Discount Rate Applied', `${result.discountPercentage}%`],
      ['CGT Discount Deducted', result.cgtDiscount50PercentAmount],
      ['Net Taxable Capital Gain (Assessable to ATO)', result.netTaxableCapitalGain],
      ['Division 6AA Applied', result.isDivision6AAApplied ? 'YES (Minor Unearned Income)' : 'NO'],
      ['Total Tax with Capital Gain', result.taxWithCapitalGain],
      ['CGT Tax Payable to ATO', result.cgtTaxPayable],
      ['Effective CGT Rate on Gross Gain', `${result.effectiveCGTRateOnGrossGain}%`],
    ];
    exportToCSV('Capital_Gains_Tax_Schedule.csv', headers, rows);
    toast.success('CGT schedule exported to CSV!');
  };

  const handleSharePlan = async () => {
    sound.playSuccess();
    const state = {
      assetType,
      taxpayerEntity,
      isAustralianResident,
      purchasePrice,
      salePrice,
      ownershipMonths,
      holdingCosts,
      currentLosses,
      priorLosses,
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

  const summaryText = useMemo(() => {
    return [
      '--- Capital Gains Tax & Loss Engine Summary ---',
      `Entity: ${taxpayerEntity.toUpperCase()} | Resident: ${isAustralianResident ? 'Yes' : 'No'} | Asset: ${assetType.toUpperCase()}`,
      `Purchase: $${purchasePrice.toLocaleString()} -> Sale: $${salePrice.toLocaleString()} (${ownershipMonths} mos)`,
      `Adjusted Cost Base: $${result.adjustedCostBase.toLocaleString()} (Holding Costs: $${holdingCosts.toLocaleString()})`,
      `Gross Capital Gain: $${result.grossCapitalGain.toLocaleString()}`,
      `Capital Losses Offset (s 102-5): -$${result.lossesOffsetApplied.toLocaleString()} (Remaining Carry-Forward: $${result.remainingCarriedForwardLosses.toLocaleString()})`,
      `CGT Discount (${result.discountPercentage}%): -$${result.cgtDiscount50PercentAmount.toLocaleString()}`,
      `Net Taxable Capital Gain: $${result.netTaxableCapitalGain.toLocaleString()}`,
      `Estimated CGT Tax Payable: $${result.cgtTaxPayable.toLocaleString()} (Effective: ${result.effectiveCGTRateOnGrossGain}%)`,
      ...(result.isDivision6AAApplied ? [`Division 6AA Penalty Tax: $${result.division6AAPenaltyTax?.toLocaleString()} applied to minor unearned income`] : []),
      `Calculated via AusFinTools CGT Engine`,
    ].join('\n');
  }, [taxpayerEntity, isAustralianResident, assetType, purchasePrice, salePrice, ownershipMonths, result, holdingCosts]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 via-primary/5 to-card border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                ITAA 1997 Div 115, s 102-5 & s 118-145
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                Div 6AA Minor Rules
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Capital Gains Tax, Loss & 6-Year Rule Engine
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Accurately model the 50% CGT discount, Section 102-5 loss ordering, 5-element cost base (Element 3 holding costs), minor Division 6AA tax rates, and Section 118-145 6-year exemption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <CalculatorActions
              onReset={handleReset}
              summaryText={summaryText}
              summaryTitle="Capital Gains Tax"
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

      {/* Preset Bar */}
      <QuickPresetBar
        presets={PRESETS}
        activePresetId={activePreset}
        onSelect={handleApplyPreset}
        title="Asset Disposal & Taxpayer Scenarios"
      />

      {/* Profile & Entity Selectors Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Asset Type */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Asset Category
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-xl">
              {(['property', 'shares', 'crypto'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAssetType(type);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    assetType === type
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {type === 'property' ? '🏡 Real Estate' : type === 'shares' ? '📈 Shares & ETFs' : '🪙 Crypto & Digital'}
                </button>
              ))}
            </div>
          </div>

          {/* Taxpayer Entity */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Taxpayer Legal Profile
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTaxpayerEntity('individual');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taxpayerEntity === 'individual'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                👤 Adult Individual
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTaxpayerEntity('minor_unearned');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taxpayerEntity === 'minor_unearned'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                🧒 Minor (Gifted/Trust)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTaxpayerEntity('minor_excepted');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taxpayerEntity === 'minor_excepted'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                💼 Teen Own Wages
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTaxpayerEntity('super_fund');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taxpayerEntity === 'super_fund'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                🏛️ Super Fund (15%)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTaxpayerEntity('company');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taxpayerEntity === 'company'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                🏢 Company (25%)
              </button>
            </div>
          </div>

          {/* Residency Toggle */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Residency (s 115-105)
            </span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAustralianResident(!isAustralianResident);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isAustralianResident
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                  : 'bg-danger/10 text-danger border-danger/20'
              }`}
            >
              {isAustralianResident ? '🇦🇺 Australian Tax Resident (50% CGT Eligible)' : '🌏 Foreign / Non-Resident (0% Discount)'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Minor Tax Alert Banner (Division 6AA vs Excepted Income) */}
      {taxpayerEntity === 'minor_unearned' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground space-y-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                ATO Division 6AA Minor Penalty Tax Warning (ITAA 1936 Part III)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Because this asset was funded via gifts, parental money, or a discretionary family trust distribution, net capital gains are classified as <strong>unearned passive income</strong>. Under Division 6AA anti-avoidance rules:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                <div className="p-2 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">1. $0 to $416</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">0% Tax-Free</span>
                </div>
                <div className="p-2 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">2. $417 to $1,307</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">66% Shade-in Rate</span>
                </div>
                <div className="p-2 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">3. Over $1,307</span>
                  <span className="font-bold text-danger">45% Top Rate (+ 2% Medicare = 47%)</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 pt-1">
                💡 <strong>The 18th Birthday Strategy:</strong> Realized capital gains face 47% tax now, but unrealized gains are NOT taxed. If the asset is held in an informal bare trust (&quot;Adult &lt;Minor A/C&gt;&quot;) and transferred to the child upon turning 18, <strong>no CGT event occurs on transfer</strong> (ITAA 1997 s 106-50 &amp; TD 2017/11). Once 18, they can sell at adult marginal rates with the $18,200 tax-free threshold!
              </p>
            </div>
          </div>
        </div>
      )}

      {taxpayerEntity === 'minor_excepted' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-2 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Excepted Net Income (s 102AE(2)) — 100% Exempt from Division 6AA!
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Because this asset was purchased using the teen&apos;s <strong>own employment wages</strong> (personal exertion from a job) or inherited from a deceased estate (will or testamentary trust), it is legally classified as <em>excepted income</em>.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                ✅ The minor receives the full adult $18,200 tax-free threshold, low income tax offset (LITO), and standard progressive brackets — saving thousands of dollars compared to gifted assets!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Stepper Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    document.getElementById(`cgt-step-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors group whitespace-nowrap"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-extrabold border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="hidden sm:block text-left">
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                    <span className="block text-xs font-bold text-foreground">{step.label}</span>
                  </span>
                </button>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="h-px flex-1 bg-border hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards (5 key metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Gross Capital Gain */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            1. Gross Capital Gain
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono">
            <OdometerCounter value={result.grossCapitalGain} />
          </div>
          <span className="text-[10px] text-muted-foreground">Sale - Cost Base</span>
        </div>

        {/* Section 102-5 Loss Offset */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            2. Losses Offset (s 102-5)
          </span>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            -<OdometerCounter value={result.lossesOffsetApplied} />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {result.remainingCarriedForwardLosses > 0
              ? `$${result.remainingCarriedForwardLosses.toLocaleString()} carry forward`
              : 'Offsets before 50% discount'}
          </span>
        </div>

        {/* CGT Discount */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            3. CGT Discount ({result.discountPercentage}%)
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            -<OdometerCounter value={result.cgtDiscount50PercentAmount} />
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
            {result.discountEligible ? `${result.discountPercentage}% discount (>12 mos)` : 'Ineligible (0%)'}
          </span>
        </div>

        {/* Net Taxable Gain */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            4. Net Taxable Gain
          </span>
          <div className="text-xl font-extrabold text-primary font-mono">
            <OdometerCounter value={result.netTaxableCapitalGain} />
          </div>
          <span className="text-[10px] text-muted-foreground">Taxable assessable</span>
        </div>

        {/* CGT Tax Payable */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            5. CGT Tax Payable
          </span>
          <div className="text-xl font-extrabold text-danger font-mono">
            <OdometerCounter value={result.cgtTaxPayable} />
          </div>
          <span className="text-[10px] text-muted-foreground">
            Effective: {result.effectiveCGTRateOnGrossGain}% (Top: {result.marginalRateApplied}%)
          </span>
        </div>
      </div>

      {/* Main Grid: Steps 1 through 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1 — Buy (Elements 1 & 2) */}
        <div id="cgt-step-buy" className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border scroll-mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Step 1 — Buy (Elements 1 &amp; 2)
          </h3>

          {/* Purchase Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-purchase-price" className="text-muted-foreground">
                Element 1: Original Purchase / Acquisition Price (s 110-25(2))
              </label>
              <span className="font-mono text-foreground">${purchasePrice.toLocaleString()}</span>
            </div>
            <input
              id="cgt-purchase-price"
              type="range"
              min={1000}
              max={2000000}
              step={5000}
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
              <label htmlFor="cgt-ownership-months" className="text-muted-foreground">
                Holding Period: {ownershipMonths} Months ({(ownershipMonths / 12).toFixed(1)} Years)
              </label>
              <span className={`font-mono text-xs font-bold ${ownershipMonths >= 12 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {ownershipMonths >= 12 ? '≥ 12 Months (Discount Eligible)' : '< 12 Months (No 50% Discount)'}
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
            <p className="text-[10px] text-muted-foreground">
              Under ITAA 1997 s 115-25, assets must be acquired at least 12 months before disposal (excluding acquisition and sale days) to qualify for the 50% CGT discount.
            </p>
          </div>

          {/* Buying Costs (Element 2) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="cgt-buying-costs" className="text-muted-foreground">
                Element 2: Incidental Costs (Stamp Duty, Brokerage, Conveyancing)
              </label>
              <span className="font-mono text-foreground">${buyingCosts.toLocaleString()}</span>
            </div>
            <input
              id="cgt-buying-costs"
              type="range"
              min={0}
              max={150000}
              step={500}
              value={buyingCosts}
              onChange={e => {
                sound.playTick();
                setBuyingCosts(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Step 2 — Improve & Hold (Elements 3 & 4 + Div 43 Clawback) */}
        <div id="cgt-step-improve" className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border scroll-mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Hammer className="w-4 h-4 text-primary" />
            Step 2 — Improve &amp; Hold (Elements 3 &amp; 4 + Div 43)
          </h3>

          {/* Renovations (Element 4) */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <label htmlFor="cgt-renovations" className="text-[11px] text-muted-foreground font-semibold">
                Element 4: Capital Improvements &amp; Renovations (s 110-25(5))
              </label>
              <span className="font-mono text-foreground font-bold">+${renovations.toLocaleString()}</span>
            </div>
            <input
              id="cgt-renovations"
              type="range"
              min={0}
              max={300000}
              step={5000}
              value={renovations}
              onChange={e => {
                sound.playTick();
                setRenovations(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Holding Costs (Element 3) */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <label htmlFor="cgt-holding-costs" className="text-[11px] text-muted-foreground font-semibold">
                Element 3: Non-Deductible Holding Costs (Rates, Land Tax, Interest)
              </label>
              <span className="font-mono text-foreground font-bold">+${holdingCosts.toLocaleString()}</span>
            </div>
            <input
              id="cgt-holding-costs"
              type="range"
              min={0}
              max={100000}
              step={1000}
              value={holdingCosts}
              onChange={e => {
                sound.playTick();
                setHoldingCosts(Number(e.target.value));
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              <strong>ATO Rule (s 110-25(4) &amp; s 110-55(4)):</strong> Only costs that could NOT be claimed as rental tax deductions (e.g. vacant land or private holiday homes) can be added. Holding costs reduce capital gain but <em>cannot create or increase a capital loss</em>.
            </p>
          </div>

          {/* Div 43 Clawback */}
          {assetType === 'property' && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <label htmlFor="cgt-div43" className="text-[11px] text-muted-foreground font-semibold">
                  Div 43 Capital Works Claimed (Cost Base Clawback, s 110-45)
                </label>
                <span className="font-mono text-danger font-bold">-${div43Clawback.toLocaleString()}</span>
              </div>
              <input
                id="cgt-div43"
                type="range"
                min={0}
                max={200000}
                step={1000}
                value={div43Clawback}
                onChange={e => {
                  sound.playTick();
                  setDiv43Clawback(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                Building write-off depreciation (2.5% p.a.) claimed during ownership must be subtracted from the cost base on sale.
              </p>
            </div>
          )}
        </div>

        {/* Step 3 — Rent / Absence (6-Year Rule) */}
        <div id="cgt-step-rent" className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border scroll-mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Step 3 — Rent (Section 118-145 6-Year Main Residence Rule)
          </h3>

          {assetType === 'property' ? (
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-primary" />
                  Elected Section 118-145 Absence Exemption
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
                    <span className="font-mono font-bold text-foreground">
                      {rentedMonths} Months ({(rentedMonths / 12).toFixed(1)} Yrs)
                    </span>
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
                      100% Tax Exempt under the 6-Year (72 month) Main Residence Rule!
                    </div>
                  ) : (
                    <div className="text-[11px] text-warning font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Exceeds 6 years (72 mos). Partial CGT of {result.taxableApportionmentPercentage}% applies to the excess period ({rentedMonths - 72} months).
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
              The 6-year main residence absence rule only applies to real estate. {assetType === 'shares' ? 'Shares and ETFs' : 'Crypto and digital assets'} are always 100% taxable upon disposal.
            </div>
          )}
        </div>

        {/* Step 4 — Losses & Offsets (Section 102-5 Ordering) */}
        <div id="cgt-step-losses" className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-card border border-border scroll-mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Step 4 — Capital Losses &amp; Offsets (s 102-5 Ordering)
          </h3>

          <div className="space-y-3">
            {/* Current Year Losses */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <label htmlFor="cgt-current-losses" className="text-muted-foreground">
                  Current-Year Capital Losses (s 102-5 Step 1)
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400">${currentLosses.toLocaleString()}</span>
              </div>
              <input
                id="cgt-current-losses"
                type="range"
                min={0}
                max={150000}
                step={1000}
                value={currentLosses}
                onChange={e => {
                  sound.playTick();
                  setCurrentLosses(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Prior Year Losses */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <label htmlFor="cgt-prior-losses" className="text-muted-foreground">
                  Prior-Year Carried-Forward Losses (s 102-5 Step 2)
                </label>
                <span className="font-mono text-amber-600 dark:text-amber-400">${priorLosses.toLocaleString()}</span>
              </div>
              <input
                id="cgt-prior-losses"
                type="range"
                min={0}
                max={200000}
                step={2000}
                value={priorLosses}
                onChange={e => {
                  sound.playTick();
                  setPriorLosses(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Loss Ordering Explainer Banner */}
            <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                ATO Statutory Loss Ordering Rule (ITAA 1997 s 102-5):
              </div>
              <p className="text-muted-foreground">
                Losses must be deducted from gross capital gains <strong>BEFORE</strong> halving with the 50% CGT discount. Net losses cannot offset salary income, but carry forward <strong>indefinitely</strong> into future tax years.
              </p>
              {result.lossesOffsetApplied > 0 && (
                <div className="p-2 rounded-lg bg-card border border-border font-mono text-[10px] space-y-0.5">
                  <div className="text-foreground">Gross Gain: ${result.grossCapitalGain.toLocaleString()}</div>
                  <div className="text-amber-600 dark:text-amber-400">Total Losses Applied: -${result.lossesOffsetApplied.toLocaleString()}</div>
                  <div className="text-foreground">Net Before Discount: ${result.netGainBeforeDiscount.toLocaleString()}</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Remaining Carried-Forward Loss: ${result.remainingCarriedForwardLosses.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5 — Sell & Tax (Element 5 & Taxable Income) */}
        <div id="cgt-step-sell" className="lg:col-span-12 space-y-4 p-5 rounded-2xl bg-card border border-border scroll-mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            Step 5 — Sell &amp; Tax Impact (Element 5 &amp; Taxable Income)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sale Price */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="cgt-sale-price" className="text-muted-foreground">Disposal / Sale Price</label>
                <span className="font-mono text-foreground">${salePrice.toLocaleString()}</span>
              </div>
              <input
                id="cgt-sale-price"
                type="range"
                min={5000}
                max={2500000}
                step={5000}
                value={salePrice}
                onChange={e => {
                  sound.playTick();
                  setSalePrice(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Selling Costs (Element 5) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="cgt-selling-costs" className="text-muted-foreground">
                  Element 5: Selling Costs (Agent Commission, Legal, Advertising)
                </label>
                <span className="font-mono text-foreground">${sellingCosts.toLocaleString()}</span>
              </div>
              <input
                id="cgt-selling-costs"
                type="range"
                min={0}
                max={150000}
                step={500}
                value={sellingCosts}
                onChange={e => {
                  sound.playTick();
                  setSellingCosts(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Regular Income */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="cgt-taxable-income" className="text-muted-foreground">Regular Annual Taxable Income</label>
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
        </div>
      </div>

      {/* ATO Section References */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-primary" />
          Statutory ATO References Triggered in This Scenario
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {disposalRefs.map(ref => (
            <li key={ref} className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{ref}</span>
            </li>
          ))}
          {taxpayerEntity === 'minor_unearned' && (
            <li className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>ITAA 1936 Part III Division 6AA &amp; Income Tax Rates Act 1986 Schedule 11: Minor unearned income penalty tax</span>
            </li>
          )}
          {taxpayerEntity === 'minor_excepted' && (
            <li className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>ITAA 1936 s 102AE(2): Excepted income (personal exertion wages) exempt from Division 6AA penalty tax</span>
            </li>
          )}
        </ul>
      </div>

      {/* Educational Deep-Dive Tabs */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Official Australian CGT Rules &amp; Tax Architecture
          </h3>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            ATO ITAA 1997 &amp; 1936 Reference
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-xl">
          <button
            type="button"
            onClick={() => setActiveEducationalTab('minors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEducationalTab === 'minors' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🧒 Minor Division 6AA Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveEducationalTab('elements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEducationalTab === 'elements' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏛️ 5 Elements of Cost Base
          </button>
          <button
            type="button"
            onClick={() => setActiveEducationalTab('losses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEducationalTab === 'losses' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📉 Section 102-5 Loss Ordering
          </button>
          <button
            type="button"
            onClick={() => setActiveEducationalTab('sixyear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEducationalTab === 'sixyear' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏡 6-Year Absence Rule (s 118-145)
          </button>
        </div>

        {/* Tab 1: Minor Division 6AA Rules */}
        {activeEducationalTab === 'minors' && (
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed animate-fade-in">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Do Under-18 Capital Gains Trigger Division 6AA Penalty Tax?
            </h4>
            <p>
              <strong>YES, unless the asset qualifies as excepted income.</strong> Under Part III Division 6AA of the Income Tax Assessment Act 1936, special penalty rates apply to minors under 18 for unearned (passive) income to prevent high-earning parents from streaming passive capital gains through children:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-300 block text-xs">
                  ❌ Unearned / Gifted Income (Penalty Rates)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Assets bought with money gifted by parents, grandparents, or distributed via a family discretionary trust.
                </p>
                <ul className="text-[10px] space-y-0.5 text-muted-foreground pt-1 list-disc list-inside">
                  <li>$0 - $416: 0% tax-free limit</li>
                  <li>$417 - $1,307: 66% shade-in rate on excess over $416</li>
                  <li>Over $1,307: 45% flat (+ 2% Medicare = 47%) on entire gain!</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-xs">
                  ✅ Excepted Net Income (s 102AE(2))
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Assets bought with the minor&apos;s <strong>own employment savings</strong> (wages earned at retail/fast food), or inherited under a will (testamentary trust).
                </p>
                <ul className="text-[10px] space-y-0.5 text-muted-foreground pt-1 list-disc list-inside">
                  <li>Full $18,200 adult tax-free threshold applies!</li>
                  <li>Normal progressive tax brackets (16%, 30%, 37%, 45%)</li>
                  <li>Low Income Tax Offset (LITO) up to $700 available</li>
                </ul>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/60 border border-border">
              <span className="font-bold text-foreground block mb-0.5">Bare Trust Off-Market Transfer at 18 (TD 2017/11):</span>
              If parents open an informal minor account (e.g. Pearler, Superhero, or Vanguard designated &quot;Parent &lt;Child A/C&gt;&quot;), beneficial ownership belongs to the child. When the child turns 18, legal title transfers into their own name off-market <strong>without triggering a CGT disposal event</strong> (ITAA 1997 s 106-50). The adult child can then sell at ordinary adult rates!
            </div>
          </div>
        )}

        {/* Tab 2: 5 Elements of Cost Base */}
        {activeEducationalTab === 'elements' && (
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed animate-fade-in">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary" />
              The 5 Statutory Elements of a CGT Cost Base (ITAA 1997 Division 110)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground block text-xs">Element 1: Acquisition (s 110-25(2))</span>
                <p className="text-[11px]">Money paid or market value of property given to acquire the asset (purchase price).</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground block text-xs">Element 2: Incidental Costs (s 110-25(3))</span>
                <p className="text-[11px]">Stamp duty, conveyancing legal fees, valuation search fees, and buy/sell brokerage.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground block text-xs">Element 3: Holding Costs (s 110-25(4))</span>
                <p className="text-[11px]">Rates, land tax, loan interest on vacant land or holiday home. <em>Non-deductible only; cannot create a capital loss (s 110-55(4)).</em></p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground block text-xs">Element 4: Improvements (s 110-25(5))</span>
                <p className="text-[11px]">Capital expenditure to enhance or preserve the asset (renovations, extensions, retaining walls).</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 sm:col-span-2 md:col-span-1">
                <span className="font-bold text-foreground block text-xs">Element 5: Title Defense (s 110-25(6))</span>
                <p className="text-[11px]">Legal expenses incurred to defend boundary disputes, preserve title, and selling agent commission.</p>
              </div>
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 space-y-1 sm:col-span-2 md:col-span-1">
                <span className="font-bold text-danger block text-xs">Div 43 Clawback (s 110-45)</span>
                <p className="text-[11px]">Any building-structure depreciation claimed during ownership must be subtracted from the cost base.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Section 102-5 Loss Ordering */}
        {activeEducationalTab === 'losses' && (
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed animate-fade-in">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              Section 102-5 Capital Loss Offsetting &amp; Carry-Forward
            </h4>
            <p>
              Under the ITAA 1997 Section 102-5 Method Statement, taxpayers calculate their net capital gain through a strict 5-step order:
            </p>
            <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-foreground">
              <li><strong>Step 1:</strong> Current year capital gains are reduced by current year capital losses.</li>
              <li><strong>Step 2:</strong> Any remaining capital gains are reduced by prior year net capital losses carried forward.</li>
              <li><strong>Step 3:</strong> Any remaining discount capital gains are reduced by the 50% CGT discount (Division 115).</li>
              <li><strong>Step 4:</strong> Small business CGT concessions applied if eligible (Div 152).</li>
              <li><strong>Step 5:</strong> Remaining net capital gain is added into assessable income and taxed at marginal rates.</li>
            </ol>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-foreground">
              ⚠️ <strong>Critical Rule:</strong> Losses reduce the gross gain <em>BEFORE</em> applying the 50% discount. For example, if you have a $100k gross gain and $40k carried-forward losses, you offset $40k first to arrive at $60k, then apply 50% discount to arrive at $30k taxable gain (you do NOT halve to $50k and deduct $40k to get $10k). Unused losses carry forward <strong>indefinitely</strong>.
            </div>
          </div>
        )}

        {/* Tab 4: 6-Year Main Residence Rule */}
        {activeEducationalTab === 'sixyear' && (
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed animate-fade-in">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary" />
              Section 118-145 6-Year Main Residence Absence Rule
            </h4>
            <p>
              If a dwelling was your main residence first, you can move out and rent it for up to <strong>6 years (72 months)</strong> continuously without losing your 100% main residence CGT exemption, provided you do not nominate another property as your main residence for the same period.
            </p>
            <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] space-y-1">
              <span className="font-bold text-foreground block">Excess Beyond 6 Years:</span>
              If rented for longer than 72 months (e.g. 96 months out of 96 total owned), only the excess portion (96 - 72 = 24 months) is taxable:
              <div className="font-mono text-primary font-bold pt-0.5">
                Taxable Apportionment = (Rented Months − 72) / Total Months Owned
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-pop-in">
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
              Copy Link &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

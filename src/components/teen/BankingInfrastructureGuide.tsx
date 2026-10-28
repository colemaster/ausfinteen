import { useState, useId } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  Landmark,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Smartphone,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Key,
  Ban,
  Zap,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface ADILicenceEntry {
  brand: string;
  parentEntity: string;
  sharedLicenceBrands: string[];
  adiStatus: 'APRA Regulated ADI' | 'Non-ADI Fintech / Crypto';
  isFcsCovered: boolean;
  notes: string;
}

const ADI_DATA: ADILicenceEntry[] = [
  {
    brand: 'Bankwest',
    parentEntity: 'Commonwealth Bank of Australia',
    sharedLicenceBrands: ['Commonwealth Bank of Australia', 'Bankwest'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Shares CBA’s single $250,000 FCS guarantee. If you hold $180k in CBA and $120k in Bankwest, your combined $300k balance exceeds the single $250k ADI limit by $50,000.',
  },
  {
    brand: 'Commonwealth Bank (CBA)',
    parentEntity: 'Commonwealth Bank of Australia',
    sharedLicenceBrands: ['Commonwealth Bank of Australia', 'Bankwest'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Primary licence holder. Bankwest operates under this single licence.',
  },
  {
    brand: 'St. George Bank',
    parentEntity: 'Westpac Banking Corporation',
    sharedLicenceBrands: ['Westpac', 'St. George Bank', 'Bank of Melbourne', 'BankSA', 'RAMS'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Westpac, St. George, Bank of Melbourne, and BankSA operate under Westpac’s single ADI licence with a combined $250,000 FCS limit.',
  },
  {
    brand: 'Bank of Melbourne',
    parentEntity: 'Westpac Banking Corporation',
    sharedLicenceBrands: ['Westpac', 'St. George Bank', 'Bank of Melbourne', 'BankSA', 'RAMS'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Shares Westpac’s single $250,000 FCS limit alongside St. George and BankSA.',
  },
  {
    brand: 'BankSA',
    parentEntity: 'Westpac Banking Corporation',
    sharedLicenceBrands: ['Westpac', 'St. George Bank', 'Bank of Melbourne', 'BankSA', 'RAMS'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Shares Westpac’s single $250,000 FCS limit across all Westpac subsidiary brands.',
  },
  {
    brand: 'Westpac',
    parentEntity: 'Westpac Banking Corporation',
    sharedLicenceBrands: ['Westpac', 'St. George Bank', 'Bank of Melbourne', 'BankSA', 'RAMS'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Primary licence holder for Westpac, St. George, Bank of Melbourne, and BankSA.',
  },
  {
    brand: 'ME Bank (Members Equity)',
    parentEntity: 'Bank of Queensland Limited',
    sharedLicenceBrands: ['Bank of Queensland (BOQ)', 'ME Bank', 'Virgin Money Australia'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'ME Bank and Virgin Money operate under BOQ’s single ADI licence. Total FCS protection across all three brands is capped at $250,000.',
  },
  {
    brand: 'Bank of Queensland (BOQ)',
    parentEntity: 'Bank of Queensland Limited',
    sharedLicenceBrands: ['Bank of Queensland (BOQ)', 'ME Bank', 'Virgin Money Australia'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Primary licence holder for BOQ Future Saver, ME Bank, and Virgin Money.',
  },
  {
    brand: 'Up Bank',
    parentEntity: 'Bendigo and Adelaide Bank Limited',
    sharedLicenceBrands: ['Bendigo Bank', 'Up Bank', 'Adelaide Bank', 'Delphi Bank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Up is a digital banking app powered by Bendigo and Adelaide Bank Ltd. All customer deposits are held by Bendigo Bank and share its single $250,000 FCS limit.',
  },
  {
    brand: 'Bendigo Bank',
    parentEntity: 'Bendigo and Adelaide Bank Limited',
    sharedLicenceBrands: ['Bendigo Bank', 'Up Bank', 'Adelaide Bank', 'Delphi Bank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Primary licence holder for Bendigo Bank, Up Bank, and Adelaide Bank.',
  },
  {
    brand: 'UBank',
    parentEntity: 'National Australia Bank Limited',
    sharedLicenceBrands: ['National Australia Bank (NAB)', 'UBank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'UBank (including former 86 400 accounts) operates under NAB’s single ADI licence with a shared $250,000 cap.',
  },
  {
    brand: 'National Australia Bank (NAB)',
    parentEntity: 'National Australia Bank Limited',
    sharedLicenceBrands: ['National Australia Bank (NAB)', 'UBank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Primary licence holder for NAB and UBank.',
  },
  {
    brand: 'Macquarie Bank',
    parentEntity: 'Macquarie Bank Limited',
    sharedLicenceBrands: ['Macquarie Bank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Independent APRA ADI licence. $250,000 FCS guarantee dedicated to Macquarie accounts.',
  },
  {
    brand: 'Great Southern Bank',
    parentEntity: 'Credit Union Australia Limited',
    sharedLicenceBrands: ['Great Southern Bank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Customer-owned bank with an independent ADI licence. Dedicated $250,000 FCS protection.',
  },
  {
    brand: 'Newcastle Permanent',
    parentEntity: 'NGM Group Australia Limited',
    sharedLicenceBrands: ['Newcastle Permanent', 'Greater Bank'],
    adiStatus: 'APRA Regulated ADI',
    isFcsCovered: true,
    notes: 'Newcastle Permanent and Greater Bank merged under NGM Group Australia Ltd and share one $250,000 FCS licence cap.',
  },
  {
    brand: 'Spriggy',
    parentEntity: 'Pocket Enterprise Pty Ltd / Prepaid Program',
    sharedLicenceBrands: ['Spriggy Pocket Money'],
    adiStatus: 'Non-ADI Fintech / Crypto',
    isFcsCovered: false,
    notes: 'Spriggy is NOT an APRA-regulated ADI bank. Funds sit on a prepaid card program and are NOT covered by the Australian Government FCS $250k deposit guarantee.',
  },
  {
    brand: 'Afterpay / Zip BNPL',
    parentEntity: 'Non-Bank Credit Provider',
    sharedLicenceBrands: ['Afterpay', 'Zip Co'],
    adiStatus: 'Non-ADI Fintech / Crypto',
    isFcsCovered: false,
    notes: 'Buy Now Pay Later providers are credit entities, not deposit-taking banks. They hold zero APRA ADI status and zero FCS deposit protection.',
  },
  {
    brand: 'Crypto Exchanges (CoinSpot, Binance)',
    parentEntity: 'Digital Currency Exchange',
    sharedLicenceBrands: ['Crypto Exchanges'],
    adiStatus: 'Non-ADI Fintech / Crypto',
    isFcsCovered: false,
    notes: 'Cryptocurrency balances and exchange cash accounts have ZERO government guarantee and zero APRA FCS backing.',
  },
];

interface MockSubscription {
  id: string;
  name: string;
  category: string;
  amount: string;
  frequency: string;
  status: 'active' | 'paused' | 'cancelled';
}

export function BankingInfrastructureGuide() {
  const [activeTab, setActiveTab] = useState('fcs');
  const [selectedBrand, setSelectedBrand] = useState('Bankwest');
  const searchSelectId = useId();

  // Mock PayTo Mandates Simulator
  const [subscriptions, setSubscriptions] = useState<MockSubscription[]>([
    {
      id: 'sub-gym',
      name: 'Iron Core Fitness Gym',
      category: 'Fitness',
      amount: '$24.50',
      frequency: 'Weekly',
      status: 'active',
    },
    {
      id: 'sub-stream',
      name: 'StreamFlix Australia',
      category: 'Entertainment',
      amount: '$18.99',
      frequency: 'Monthly',
      status: 'active',
    },
    {
      id: 'sub-music',
      name: 'SoundWave Premium',
      category: 'Audio',
      amount: '$12.99',
      frequency: 'Monthly',
      status: 'paused',
    },
  ]);

  const handleSubscriptionAction = (id: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
    );
  };

  const selectedEntry = ADI_DATA.find((item) => item.brand === selectedBrand) ?? ADI_DATA[0];

  return (
    <Card variant="glass" className="p-5 sm:p-6 space-y-6 border-primary/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Landmark className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              AU Banking Infrastructure & Regulatory Safeguards
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            APRA Financial Claims Scheme (FCS), Modern Payment Rails (NPP, PayID, Osko, PayTo), and CDR Open Banking rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold border-primary/40 text-primary">
            Statutory Protections
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'fcs', label: '1. APRA FCS $250k Guarantee' },
          { id: 'payments', label: '2. Payment Rails (NPP, PayID, PayTo)' },
          { id: 'cdr', label: '3. CDR Open Banking Security' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth
      />

      {/* TAB 1: APRA FCS Guarantee & Shared ADI Licences */}
      {activeTab === 'fcs' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          {/* Statutory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                $250,000 per ADI
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Under Part II, Division 2AA of the <em>Banking Act 1959</em>, deposits are legally guaranteed by the Australian Government up to $250,000 AUD per depositor per Authorised Deposit-taking Institution (ADI).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                7-Day Payout Target
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                If an ADI were to fail, the Federal Treasurer activates the scheme, and APRA aims to reimburse depositors within 7 business days via electronic bank transfer or cheque.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Joint Accounts Rule
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Joint accounts are deemed held in equal 50/50 shares. Each person receives coverage up to their separate $250,000 limit across all personal and joint accounts held with that ADI.
              </p>
            </div>
          </div>

          {/* Shared Licence Explorer */}
          <Card variant="glass" className="p-5 space-y-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Shared Banking Licence Checker (Single ADI Cap)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Crucial Rule: Multiple retail brands operating under a single parent ADI licence share one combined $250,000 FCS cap!
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor={searchSelectId} className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Check Bank:
                </label>
                <select
                  id={searchSelectId}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="text-xs font-medium bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  {ADI_DATA.map((item) => (
                    <option key={item.brand} value={item.brand}>
                      {item.brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Brand Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{selectedEntry.brand}</span>
                  <Badge
                    variant={selectedEntry.isFcsCovered ? 'success' : 'danger'}
                    className="text-[10px]"
                  >
                    {selectedEntry.adiStatus}
                  </Badge>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Parent Licence Holder:</strong>{' '}
                    {selectedEntry.parentEntity}
                  </p>
                  <p>
                    <strong className="text-foreground">Brands Sharing This Single Cap:</strong>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEntry.sharedLicenceBrands.map((b) => (
                      <span
                        key={b}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b === selectedEntry.brand
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Regulatory Impact & Cap Analysis
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedEntry.notes}
                </p>
                {selectedEntry.isFcsCovered ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Covered up to $250,000 AUD under Banking Act 1959.
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    ZERO APRA FCS Protection. Deposits at complete risk of loss if company fails.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Exclusions Notice */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              What Is Legally EXCLUDED from the APRA Financial Claims Scheme?
            </span>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>
                <strong>Foreign Bank Branches:</strong> Deposits with Australian branches of foreign banks are NOT covered by the FCS guarantee. (Locally incorporated subsidiaries are covered).
              </li>
              <li>
                <strong>Non-Bank Fintech Wallets & Prepaid Cards:</strong> Spriggy prepaid cards, Revolut (standard non-ADI accounts), and Beem wallet balances do not hold statutory FCS guarantees.
              </li>
              <li>
                <strong>Buy Now Pay Later (BNPL):</strong> Afterpay and Zip are credit providers, not ADIs; no FCS protections apply.
              </li>
              <li>
                <strong>Cryptocurrency Exchanges:</strong> CoinSpot, Binance, Swyftx, and independent crypto wallets have 0% government backing.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.apra_fcs} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_banking} />
          </div>
        </div>
      )}

      {/* TAB 2: Payment Rails (NPP, PayID, Osko, PayTo) */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          {/* Rails Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-primary" />
                  PayID & Confirmation of Payee
                </span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  NPP Addressing
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Links your mobile phone number, email address, or ABN to your bank account. Senders see your verified legal registered name (Confirmation of Payee / NameCheck) <strong>before</strong> confirming the transfer, wiping out BSB typos and payment redirection scams.
              </p>
              <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground">
                <strong className="text-foreground">Scam Alert:</strong> PayID is 100% free. Any online buyer claiming you must pay $300 to &ldquo;upgrade to a PayID Business Account&rdquo; is a criminal!
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Osko by BPAY
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Sub-60s Rail
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The primary retail overlay service on the New Payments Platform (NPP). Transfers clear and settle in under 60 seconds, 24/7/365, even at 2 AM on Christmas Day, between participating Australian ADIs.
              </p>
              <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground">
                <strong className="text-foreground">ISO 20022 Messaging:</strong> Supports up to 280 characters of payment description, replacing cryptic 18-character Direct Entry truncation.
              </div>
            </div>
          </div>

          {/* PayTo vs Legacy Direct Debit Showdown */}
          <Card variant="glass" className="p-5 space-y-4 border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  PayTo (Modern Digital Mandates) vs Legacy BECS Direct Debit
                </h3>
                <p className="text-xs text-muted-foreground">
                  PayTo replaces legacy 50-year-old direct debits with upfront customer in-app approval and instant cancellation.
                </p>
              </div>
              <Badge variant="default" className="text-[10px]">
                NPP Modern Rail
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-emerald-500/30 space-y-2">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Modern PayTo Mandates
                </span>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong>Upfront Consent:</strong> Pushed directly to your bank app; authorized with Face ID or biometric fingerprint.</li>
                  <li><strong>Full In-App Visibility:</strong> View all upcoming deductions, amounts, and merchant names in one dashboard.</li>
                  <li><strong>Instant Pause & Cancel:</strong> You can pause or cancel a PayTo agreement inside your banking app at any time with one tap. Merchants cannot debit once cancelled.</li>
                  <li><strong>Zero Surprise Dishonour Fees:</strong> Checks available funds in real-time before initiating the debit.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-card border border-rose-500/30 space-y-2">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Legacy BECS Direct Debit (Old Way)
                </span>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong>Blind Form Authority:</strong> You write your BSB and account number on paper or a web form; merchant pulls money at will.</li>
                  <li><strong>Zero App Visibility:</strong> You cannot see upcoming debits in your banking app before money is pulled.</li>
                  <li><strong>Difficult Cancellation:</strong> Cancelling requires contacting the merchant or lodging formal bank disputes; rogue billers can keep charging.</li>
                  <li><strong>Dishonour Penalties:</strong> Failed overnight batch debits trigger $15–$35 bank and merchant penalty fees.</li>
                </ul>
              </div>
            </div>

            {/* Interactive PayTo Subscription Manager Simulator */}
            <div className="pt-2 space-y-3">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                Interactive PayTo Simulator: Experience Instant In-App Mandate Control
              </span>
              <p className="text-xs text-muted-foreground">
                Try pausing or cancelling a digital subscription below. Notice how PayTo empowers you to unilaterally lock out merchant charges directly from your mobile app:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      sub.status === 'active'
                        ? 'bg-card border-border hover:border-emerald-500/40'
                        : sub.status === 'paused'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-rose-500/10 border-rose-500/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-foreground text-xs">{sub.name}</span>
                      <Badge
                        variant={
                          sub.status === 'active'
                            ? 'success'
                            : sub.status === 'paused'
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-[9px] uppercase font-bold"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-3">
                      <span className="text-foreground font-semibold">{sub.amount}</span> / {sub.frequency} ({sub.category})
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sub.status === 'active' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSubscriptionAction(sub.id, 'paused')}
                            className="flex-1 text-[10px] font-semibold py-1 px-2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 flex items-center justify-center gap-1"
                          >
                            <PauseCircle className="w-3 h-3" />
                            Pause
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubscriptionAction(sub.id, 'cancelled')}
                            className="flex-1 text-[10px] font-semibold py-1 px-2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30 flex items-center justify-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            Cancel
                          </button>
                        </>
                      )}

                      {sub.status === 'paused' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSubscriptionAction(sub.id, 'active')}
                            className="flex-1 text-[10px] font-semibold py-1 px-2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 flex items-center justify-center gap-1"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Resume
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubscriptionAction(sub.id, 'cancelled')}
                            className="flex-1 text-[10px] font-semibold py-1 px-2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30 flex items-center justify-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            Cancel
                          </button>
                        </>
                      )}

                      {sub.status === 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleSubscriptionAction(sub.id, 'active')}
                          className="w-full text-[10px] font-semibold py-1 px-2 rounded-md bg-muted text-foreground hover:bg-muted/80 flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reactivate Mandate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2 pt-2">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.payid_platform} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.payto_platform} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.osko_platform} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.npp_australia} />
          </div>
        </div>
      )}

      {/* TAB 3: CDR Open Banking Security */}
      {activeTab === 'cdr' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          {/* Regulatory Architecture Card */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Statutory Architecture: Competition and Consumer Act 2010 (Part IVD)
              </span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                ACCC & OAIC Co-Regulated
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Consumer Data Right (CDR), known as <strong>Open Banking</strong>, gives Australian consumers legal ownership over their personal financial records. Two federal regulators enforce statutory compliance:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                <strong className="text-foreground">ACCC (Australian Competition & Consumer Commission):</strong>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Accredits third-party Data Recipients (ADRs), maintains the public Register of Participants, drafts CDR operational rules, and prosecutes anti-competitive misconduct.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                <strong className="text-foreground">OAIC (Office of the Australian Information Commissioner):</strong>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Enforces the 13 statutory <strong>CDR Privacy Safeguards</strong>, monitors cryptographic privacy compliance, and investigates consumer data privacy complaints.
                </p>
              </div>
            </div>
          </div>

          {/* CDR vs Screen Scraping Head-to-Head */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ACCC-Accredited Open Banking (CDR)
                </span>
                <Badge variant="success" className="text-[10px]">OAuth 2.0 / FAPI</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Zero Password Sharing:</strong> You log into your bank&rsquo;s official portal. The app receives an encrypted, time-limited OAuth 2.0 API token. The third-party app NEVER sees your password.
                </li>
                <li>
                  <strong>ePayments Code Protection Maintained:</strong> Because you never disclosed your banking credentials, you remain 100% protected against unauthorised transaction fraud.
                </li>
                <li>
                  <strong>Granular & Revocable Consent:</strong> You choose exactly which accounts to share and can revoke access anytime with one click in your banking app.
                </li>
                <li>
                  <strong>Right to Deletion (Safeguard 12):</strong> Under Privacy Safeguard 12, when you revoke consent, you can mandate that the recipient permanently delete or de-identify your financial data.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-card border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Unsafe &ldquo;Screen Scraping&rdquo; Apps
                </span>
                <Badge variant="danger" className="text-[10px]">ePayments Void</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Passcode Exposure:</strong> You type your actual internet banking username and secret password into the third-party app.
                </li>
                <li>
                  <strong>ASIC ePayments Code Liability Shift:</strong> Sharing your login credentials directly violates bank terms of use. If fraud occurs, <strong>you can be held 100% liable</strong> for all stolen funds!
                </li>
                <li>
                  <strong>Uncontrolled Scraping Bots:</strong> Automated bots log into your online banking as &ldquo;you&rdquo;, parsing entire bank statements without granular limits.
                </li>
                <li>
                  <strong>Zero Deletion Guarantees:</strong> Scraped financial history often resides permanently in third-party offshore databases with minimal regulatory oversight.
                </li>
              </ul>
            </div>
          </div>

          {/* Teen Cyber Shield Checklist */}
          <Card variant="glass" className="p-4 space-y-2 border-primary/20 bg-primary/5">
            <span className="font-bold text-xs text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Budgeting App Security Rule: The 3-Second Verification Test
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When connecting any budgeting or finance tracker (e.g. PocketSmith, WeMoney, Frollo):
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Check the Login URL:</strong> Does the app redirect you to your bank&rsquo;s official domain (e.g. <code>commbank.com.au</code> or <code>westpac.com.au</code>) to authenticate? If YES, it is using secure Open Banking OAuth 2.0.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Never Enter Passwords in App Fields:</strong> If the budgeting app asks for your bank password inside its own text box, ABORT immediately! That is dangerous screen scraping.
                </span>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2 pt-2">
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.accc_cdr} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.oaic_cdr_privacy} />
            <WebReferenceLink link={OFFICIAL_WEB_LINKS.acsc_cyber_safety} />
          </div>
        </div>
      )}
    </Card>
  );
}
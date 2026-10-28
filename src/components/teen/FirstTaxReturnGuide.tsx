import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  ReceiptText,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  Sparkles,
  Car,
  AlertTriangle,
  Calendar,
  Laptop,
  Info,
} from 'lucide-react';
import {
  EFFECTIVE_TAX_FREE_THRESHOLD,
  CENTS_PER_KM_RATE,
  WFH_FIXED_RATE_HOURLY,
  STANDARD_DEDUCTION_2026_27,
  SUBSTANTIATION_THRESHOLD_NO_RECEIPTS,
  LAUNDRY_THRESHOLD_NO_RECEIPTS,
  INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27,
} from '@/calculators/teen-tax/engine';

interface TaxReturnStep {
  step: number;
  title: string;
  summary: string;
  detail: string;
  actionChecklist: string[];
  keyFact: string;
  badge: string;
  icon: typeof ShieldCheck;
}

const TAX_RETURN_STEPS: TaxReturnStep[] = [
  {
    step: 1,
    title: 'Link ATO to Your myGov Account via Linking Code',
    summary: 'Create a myGov account with a permanent personal email and link the Australian Taxation Office (ATO).',
    detail: 'As a teenager lodging your first tax return, you have no prior Notice of Assessment (NOA) history to answer online security questions. The fastest, approved ATO method is to phone the ATO directly on 13 28 61. Have your 9-digit Tax File Number (TFN), full legal name, date of birth, and an Australian identity document (birth certificate, passport, or Medicare card) ready. The ATO officer will generate a unique 6-character ATO Linking Code valid for 24 hours. Enter this code under myGov > "Link a service" > "Australian Taxation Office" to connect permanently!',
    actionChecklist: [
      'Create a myGov account using a personal email address (never a school email that expires after graduation).',
      'Have your TFN, date of birth, and Australian birth certificate or passport in front of you.',
      'Call ATO Individual Enquiries on 13 28 61 (8am–6pm Mon–Fri) and request a "First-Time Lodger Linking Code".',
      'Enter the 6-character linking code into myGov within 24 hours to link your account forever.',
    ],
    keyFact: 'Tip: You only need to link myGov once. In all future years, you can log in instantly with your passkey or digital ID.',
    badge: 'Step 1 • myGov Linking',
    icon: ShieldCheck,
  },
  {
    step: 2,
    title: 'Wait for "Tax Ready" & Third-Party Pre-Fill (Mid-August)',
    summary: 'Employers finalize Single Touch Payroll (STP) by July 14, but third-party data lands in mid-August.',
    detail: 'Never rush to lodge on July 1! Employers have until July 14 to mark your Single Touch Payroll (STP) income statement as "Tax Ready". Furthermore, Australian banks (reporting your high-interest savings account interest), health insurers, and share registries upload pre-fill data throughout July and early August. The ATO explicitly recommends waiting until mid-August so that all interest, dividends, and earnings automatically pre-populate into myTax. Lodging before pre-fill is ready risks omitting bank interest, triggering an automated ATO review and amended assessment.',
    actionChecklist: [
      'Check your myGov ATO inbox until your employer status flips from "Not Tax Ready" to "Tax Ready" (by 14 July).',
      'Wait until mid-August (usually around 10–15 August) for your bank interest (e.g., HISA earnings) to auto-populate.',
      'Log into myGov and verify that every bank where you hold a savings account has pre-filled its gross interest.',
    ],
    keyFact: 'Pre-fill saves you from digging through 12 bank statements: the ATO imports your exact interest and tax withheld automatically.',
    badge: 'Step 2 • Pre-Fill Timing',
    icon: Calendar,
  },
  {
    step: 3,
    title: `Verify Wages & The $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} Effective Tax-Free Threshold`,
    summary: 'Check that pre-filled gross pay and tax withheld match your final June payslip.',
    detail: `In myTax, your pre-filled income statement shows your gross earnings and PAYG (Pay-As-You-Go) tax withheld. Under 2026-27 Stage 3 rates (15% on $18,201–$45,000), the $700 Low Income Tax Offset (LITO) completely wipes out the tax on the first $4,666.67 above $18,200 ($700 ÷ 0.15). This creates an effective tax-free threshold of $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')}! If your total taxable income is $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} or less, your net income tax liability is exactly $0, and 100% of all PAYG tax withheld throughout the financial year is refunded into your bank account. Note: starting work mid-year does NOT pro-rate this threshold for Australian residents.`,
    actionChecklist: [
      'Compare pre-filled gross wages against your last June 30 payslip.',
      'Check the total PAYG tax withheld figure — this is the maximum refund you can receive back from employment.',
      `Confirm your total annual income is under $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} to ensure a 100% tax refund payout.`,
    ],
    keyFact: `Effective Threshold: $18,200 statutory + ($700 LITO ÷ 15%) = $${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')}. You pay $0 tax up to this amount!`,
    badge: 'Step 3 • Wages & LITO',
    icon: DollarSign,
  },
  {
    step: 4,
    title: 'Claim Legitimate Work Deductions (Uniforms, Laundry, WFH & 91c/km Car Travel)',
    summary: 'Reduce assessable income by claiming legitimate work expenses, WFH hours, and job travel.',
    detail: `You can only claim expenses you paid for yourself that directly relate to earning your income:
• Compulsory Logo Uniforms: Shirts, aprons, caps, and jackets permanently bearing your employer logo (e.g. McDonald's, Coles, Hungry Jack's). Plain black pants, white shirts, or ordinary business wear are NOT deductible, even if compulsory.
• Laundry Allowance: Up to $150 per year for washing logo uniforms without receipts ($1.00 per load for work clothes only, $0.50 per load if washed with personal laundry).
• Protective Gear: Non-slip kitchen shoes, steel-cap boots, high-vis vests, safety goggles, and sun protection (sunscreen, UV-rated sunglasses, broad-brim hats) for outdoor workers (lifeguards, gardeners, car detailers).
• Working From Home (WFH) Fixed Rate Method: Claim ${Math.round(WFH_FIXED_RATE_HOURLY * 100)}c/hour under ATO PCG 2023/1 for remote work shifts (admin, tutoring, customer support). This rate covers electricity, gas, internet, mobile phone usage, and stationery without separate apportionment! Keep a continuous record/timesheet of actual hours worked.
• Work-Related Car Travel: If you use your own vehicle for work duties (e.g. delivering pizzas, running errands between branches, carrying heavy tools), claim using the ATO cents-per-km method at ${Math.round(CENTS_PER_KM_RATE * 100)}c/km (up to 5,000 km without a logbook). Note: ordinary home-to-work travel is NEVER deductible.
• Self-Education & Courses: RSA (Responsible Service of Alcohol), RCG, or First Aid certification fees required for your current job.
• Substantiation Rules: Under s 900-35 ITAA 1997, claims up to $${SUBSTANTIATION_THRESHOLD_NO_RECEIPTS} do not require written receipts (records of calculation still required). From 2026-27, eligible workers can also opt for the automatic $${STANDARD_DEDUCTION_2026_27} standard deduction if receipts are minimal.`,
    actionChecklist: [
      'Keep digital photos or receipts of non-slip shoes, safety boots, and work course fees.',
      `Calculate uniform laundry ($${LAUNDRY_THRESHOLD_NO_RECEIPTS} limit without written proof: e.g. 3 work-only loads/wk × 40 wks = $120).`,
      `Track remote work hours to claim WFH at ${Math.round(WFH_FIXED_RATE_HOURLY * 100)}c/hr (PCG 2023/1) with a continuous log or timesheet.`,
      `Record work travel kilometres (deliveries/errands only) to claim at ${Math.round(CENTS_PER_KM_RATE * 100)}c/km (up to 5,000 km max).`,
      'Do NOT claim plain black pants, gym wear, ordinary shoes, or commuting costs from home to work.',
    ],
    keyFact: `2026-27 Rates: Vehicle rate is ${Math.round(CENTS_PER_KM_RATE * 100)}c/km (up to 5,000 km = $${(5000 * CENTS_PER_KM_RATE).toLocaleString('en-AU')}) and WFH rate is ${Math.round(WFH_FIXED_RATE_HOURLY * 100)}c/hr without separate apportionment.`,
    badge: 'Step 4 • Deductions',
    icon: Sparkles,
  },
  {
    step: 5,
    title: 'Submit via myTax & Receive Notice of Assessment (NOA) + Direct Refund',
    summary: 'Lodge 100% free online via myTax by 31 October (or 15 May via a tax agent) for direct bank deposit.',
    detail: `Enter your Australian bank account details (BSB and account number). Electronically lodged returns through myTax are processed rapidly by the ATO—usually in 10 to 14 business days. Your refund will be electronically transferred directly into your bank account.
• Lodgement Deadlines:
  - 31 October: Statutory deadline for self-lodgers lodging online via myTax or paper.
  - Up to 15 May next year: Extended deadline if you use a registered tax agent, PROVIDED you are registered on their client list on or before 31 October and have no overdue tax returns from previous years!
• Notice of Assessment (NOA): The ATO delivers your official NOA to your myGov inbox. The NOA itemises taxable income, tax calculated, tax offsets (LITO), PAYG tax withheld, and the exact refund credited. Download and save the NOA PDF—it is your permanent proof of independent taxable income!`,
    actionChecklist: [
      'Double check your BSB and account number in myTax so your refund lands in the right account.',
      'Submit your return before the 31 October deadline (or ensure you are on a registered tax agent\'s client roll before 31 October for the 15 May extension).',
      'Check your bank account 10–14 business days later for the electronic funds transfer from the ATO.',
      'Download and store your Notice of Assessment (NOA) PDF from your myGov inbox.',
    ],
    keyFact: 'Notice of Assessment (NOA): Save this document! Banks and universities use your NOA as proof of independent taxable income.',
    badge: 'Step 5 • NOA & Refund',
    icon: CheckCircle2,
  },
];

interface DeductionItem {
  name: string;
  category: string;
  isClaimable: boolean;
  rateOrRule: string;
  reason: string;
}

const DEDUCTION_EXAMPLES: DeductionItem[] = [
  {
    name: 'Compulsory logo polo / apron',
    category: 'Clothing',
    isClaimable: true,
    rateOrRule: 'Actual cost with receipt',
    reason: 'Must have employer company logo permanently attached (e.g. McDonald’s, Coles).',
  },
  {
    name: 'Plain black pants or white shirts',
    category: 'Clothing',
    isClaimable: false,
    rateOrRule: '$0 deduction',
    reason: 'Ordinary plain everyday clothing is never deductible, even if employer requires it.',
  },
  {
    name: 'Logo uniform laundry allowance',
    category: 'Laundry',
    isClaimable: true,
    rateOrRule: '$1/load work only, 50c mixed (up to $150 no receipts)',
    reason: 'ATO allows reasonable laundry claims for washing compulsory logo uniforms.',
  },
  {
    name: 'Non-slip shoes / steel-cap boots',
    category: 'Safety Gear',
    isClaimable: true,
    rateOrRule: 'Actual cost with receipt',
    reason: 'Protective footwear designed to prevent workplace injury (kitchens, trade, warehouse).',
  },
  {
    name: 'Work car errands / deliveries',
    category: 'Vehicle',
    isClaimable: true,
    rateOrRule: `${Math.round(CENTS_PER_KM_RATE * 100)}c/km (up to 5,000 km, max $${(5000 * CENTS_PER_KM_RATE).toLocaleString('en-AU')})`,
    reason: 'Using your own vehicle for work duties (delivering food, inter-store travel).',
  },
  {
    name: 'Daily commute from home to work',
    category: 'Vehicle',
    isClaimable: false,
    rateOrRule: '$0 deduction',
    reason: 'Travel between home and a regular place of work is considered private travel by the ATO.',
  },
  {
    name: 'Working from home (WFH) fixed rate',
    category: 'WFH',
    isClaimable: true,
    rateOrRule: `${Math.round(WFH_FIXED_RATE_HOURLY * 100)}c/hour (PCG 2023/1)`,
    reason: 'Covers energy, internet, phone, stationery/consumables without separate apportionment (requires continuous hours log).',
  },
  {
    name: 'Outdoor sunscreen & UV sunglasses',
    category: 'Protection',
    isClaimable: true,
    rateOrRule: 'Actual cost (pro-rated for work use)',
    reason: 'Sun protection for outdoor workers (lifeguards, landscaping, outdoor coaching).',
  },
  {
    name: 'RSA / RCG certificate course',
    category: 'Training',
    isClaimable: true,
    rateOrRule: 'Actual course fee with receipt',
    reason: 'Required to maintain or advance in your current hospitality employment.',
  },
  {
    name: 'Freelance ABN gear under $20,000',
    category: 'Sole Trader',
    isClaimable: true,
    rateOrRule: `100% instant write-off (s 328-180)`,
    reason: `Small business sole traders under $10M turnover can immediately write off business assets under $${INSTANT_ASSET_WRITE_OFF_THRESHOLD_2026_27.toLocaleString('en-AU')} (cameras, laptops, mower).`,
  },
  {
    name: 'Conventional business suit or stylish retail shoes',
    category: 'Clothing',
    isClaimable: false,
    rateOrRule: '$0 deduction',
    reason: 'Conventional attire is non-deductible even if employer mandates designer clothing or in-store purchases.',
  },
];

export function FirstTaxReturnGuide() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'deductions' | 'noa-sample' | 'div6aa'>('walkthrough');
  const current = TAX_RETURN_STEPS.find(s => s.step === activeStep)!;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ReceiptText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Teen First Tax Return Blueprint (ATO & myTax)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete guide for teenagers: myGov linking codes, mid-August pre-fill, legitimate deductions (91c/km, logo gear), and getting your 100% PAYG refund!
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="success">
            2026-27 ATO Stage 3
          </Badge>
          <Badge variant="info">
            Effective ${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} Tax-Free
          </Badge>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('walkthrough')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'walkthrough' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📋 5-Step Lodgement Blueprint
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('deductions')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'deductions' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🏷️ Deductions Checker (Claimable vs No)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('noa-sample')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'noa-sample' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📄 Notice of Assessment (NOA) Explainer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('div6aa')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'div6aa' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ⚠️ Division 6AA Unearned Income Rules
        </button>
      </div>

      {/* TAB 1: 5-Step Walkthrough */}
      {activeTab === 'walkthrough' && (
        <div className="space-y-4">
          {/* Step Selection Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TAX_RETURN_STEPS.map(s => {
              const isSelected = s.step === activeStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">{s.badge}</div>
                  <div className="text-xs font-extrabold truncate">
                    {s.step}. {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Content Card */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {current.badge}
                </span>
                <h3 className="text-base font-extrabold text-foreground mt-0.5">{current.title}</h3>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
                Step {current.step} of 5
              </Badge>
            </div>

            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {current.summary}
            </p>

            <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {current.detail}
            </div>

            {/* Action Checklist */}
            <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Action Checklist for Step {current.step}:
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {current.actionChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Fact / Tip */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground font-medium">{current.keyFact}</span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 disabled:opacity-40 text-foreground"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={activeStep === TAX_RETURN_STEPS.length}
                onClick={() => setActiveStep(prev => Math.min(TAX_RETURN_STEPS.length, prev + 1))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Deductions Checker */}
      {activeTab === 'deductions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card/70 border border-border/80">
            <h3 className="text-sm font-bold text-foreground mb-1">
              What Can You Deduct on a Teen Tax Return?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every dollar of legitimate work-related deductions reduces your taxable income. To be claimable under ATO rules:
              (1) you must have spent the money yourself without reimbursement, (2) it must directly relate to earning your income, and
              (3) you must have a record (receipt, bank statement, or written calculation) to prove it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEDUCTION_EXAMPLES.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  item.isClaimable
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-rose-500/5 border-rose-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-foreground">{item.name}</span>
                    <Badge variant={item.isClaimable ? 'success' : 'danger'} className="text-[10px]">
                      {item.isClaimable ? '✓ Claimable' : '✗ NOT Deductible'}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-primary mb-1">
                    Rule: {item.rateOrRule}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-start gap-2">
              <Car className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Car Cents-Per-Km Method ({Math.round(CENTS_PER_KM_RATE * 100)}c/km):</strong>
                {' '}Up to 5,000 work km (max ${(5000 * CENTS_PER_KM_RATE).toLocaleString('en-AU')} deduction) without a formal logbook. Keep a diary showing dates and errands/deliveries! Commuting between home and work is strictly non-deductible.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-start gap-2">
              <Laptop className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">WFH Fixed Rate ({Math.round(WFH_FIXED_RATE_HOURLY * 100)}c/hr per PCG 2023/1):</strong>
                {' '}Covers energy, internet, phone, and stationery without separate apportionment. Keep a continuous record/timesheet of all hours worked from home. Tech/furniture depreciation is claimable on top!
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Substantiation Thresholds vs $1,000 Standard Deduction:</strong>
              {' '}Under s 900-35, claims under ${SUBSTANTIATION_THRESHOLD_NO_RECEIPTS} (and laundry under ${LAUNDRY_THRESHOLD_NO_RECEIPTS}) do not need receipts, but are NOT automatic gifts—you must have incurred the expense and be able to explain it. From 2026-27, wage earners can also opt for the automatic ${STANDARD_DEDUCTION_2026_27} standard work deduction if actual itemised receipts are lower.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Notice of Assessment (NOA) Explainer */}
      {activeTab === 'noa-sample' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card/70 border border-border/80">
            <h3 className="text-sm font-bold text-foreground mb-1">
              Sample Notice of Assessment (NOA) Walkthrough
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When the ATO completes processing your myTax return, they deliver an official document titled <strong>Notice of Assessment</strong> to your myGov inbox.
              Here is how the calculation works for a typical teen earning $14,000/year with $650 PAYG tax withheld:
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Commonwealth of Australia — Notice of Assessment
              </span>
              <Badge variant="outline">2026-27 Financial Year</Badge>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gross Employment Wages (from STP)</span>
                <span className="font-bold text-foreground">$14,500.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
                <span>Less: Allowable Deductions (Logo uniform $100 + Laundry $50)</span>
                <span className="font-bold">-$150.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60 bg-muted/30 px-2 rounded-lg font-bold">
                <span className="text-foreground">Taxable Income</span>
                <span className="text-foreground">$14,350.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Tax on Taxable Income (under $18,200)</span>
                <span className="text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Low Income Tax Offset (LITO)</span>
                <span className="text-foreground">$0.00 (not needed, tax is already $0)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Medicare Levy (under $28,011 threshold)</span>
                <span className="text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 bg-muted/20 px-2 rounded-lg">
                <span className="font-bold text-foreground">Total Assessed Tax Payable</span>
                <span className="font-bold text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
                <span>Less: PAYG Tax Withheld by Employer (Prepaid)</span>
                <span className="font-bold">-$650.00</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-500/10 border border-emerald-500/30 px-3 rounded-xl text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                <span>RESULT OF THIS ASSESSMENT: REFUND</span>
                <span>+$650.00</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground font-sans pt-2">
              The $650.00 refund is sent via Electronic Funds Transfer (EFT) directly into your bank account within 10–14 business days!
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: Division 6AA Unearned Income Rules */}
      {activeTab === 'div6aa' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              ATO Division 6AA: Minor Unearned Income Tax Trap
            </div>
            <p className="leading-relaxed">
              Under Part III, Division 6AA of the <em>Income Tax Assessment Act 1936</em>, minors (under 18) face special anti-avoidance tax rules on
              <strong> unearned (passive) income</strong> such as bank interest, share dividends, and family trust distributions.
              This was enacted by Parliament to stop wealthy adult relatives from diverting investment portfolios into children’s names to exploit their tax-free thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <Badge variant="success" className="mb-1 text-[10px]">$0 – $416</Badge>
              <h4 className="font-bold text-foreground mb-0.5">Nil Tax (0%)</h4>
              <p className="text-muted-foreground">Up to $416 per financial year in unearned interest/dividends is 100% tax-free.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <Badge variant="warning" className="mb-1 text-[10px]">$417 – $1,307</Badge>
              <h4 className="font-bold text-foreground mb-0.5">66% Shade-In Rate</h4>
              <p className="text-muted-foreground">Every dollar between $417 and $1,307 is taxed at 66% on the amount above $416.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <Badge variant="danger" className="mb-1 text-[10px]">Over $1,307</Badge>
              <h4 className="font-bold text-foreground mb-0.5">45% Flat Top Rate</h4>
              <p className="text-muted-foreground">Once unearned income exceeds $1,307, the entire unearned income is taxed at 45% flat.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground space-y-1">
            <strong className="text-emerald-700 dark:text-emerald-400 block">Crucial Protection: Employment Wages are 100% Exempt!</strong>
            <p className="text-muted-foreground leading-relaxed">
              Division 6AA does NOT apply to earned wages from a part-time or casual job (fast food, retail, refereeing, tutoring).
              Your wages enjoy the full standard adult $18,200 threshold + $700 LITO offset (${EFFECTIVE_TAX_FREE_THRESHOLD.toLocaleString('en-AU')} effective threshold)!
            </p>
          </div>
        </div>
      )}

      {/* Official Tax Links */}
      <div className="pt-2 flex flex-wrap gap-2.5">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_mytax} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_mygov} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_under18} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_deductions_clothing} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_deductions_wfh} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_instant_asset_write_off} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_minor_income} />
      </div>
    </Card>
  );
}

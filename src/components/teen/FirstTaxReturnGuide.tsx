import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { ReceiptText, CheckCircle2, ShieldCheck, DollarSign, ArrowRight, Sparkles } from 'lucide-react';

const TAX_RETURN_STEPS = [
  {
    step: 1,
    title: 'Link ATO to Your myGov Account',
    summary: 'Create a myGov account with your email and link the Australian Taxation Office (ATO).',
    detail: 'Because you are 15 with no previous tax history, link by phone or by answering two secret questions (such as your bank account BSB/Account number where your pay was deposited and your super fund details).',
    badge: 'Step 1 • Setup',
    icon: ShieldCheck,
  },
  {
    step: 2,
    title: 'Wait for "Tax Ready" Status (July 14+)',
    summary: 'Employers report your pay through Single Touch Payroll (STP) and have until July 14 to finalise your income statement.',
    detail: 'Do not lodge on July 1! Wait until your myGov income statement displays "Tax Ready". This ensures every shift, penalty rate, and tax withheld dollar is 100% accurate.',
    badge: 'Step 2 • Pre-Fill',
    icon: ReceiptText,
  },
  {
    step: 3,
    title: 'Review Pre-Filled Wages & Withholding',
    summary: 'Log into myTax on myGov — your employer has already entered your gross income and tax withheld.',
    detail: 'Check that the gross earnings and PAYG tax withheld match your final payslip of the financial year (ended 30 June). If you earned under $18,200, 100% of any tax withheld will be refunded.',
    badge: 'Step 3 • Verify',
    icon: DollarSign,
  },
  {
    step: 4,
    title: 'Claim Work Deductions (Uniforms & Laundry)',
    summary: 'Reduce your taxable income further by claiming legitimate work expenses.',
    detail: 'You can claim up to $150 for washing work uniforms with company logos without receipts ($1/load for work clothes only, or 50c/load mixed). You can also claim RSA/RCG course fees if already working in the industry.',
    badge: 'Step 4 • Deductions',
    icon: Sparkles,
  },
  {
    step: 5,
    title: 'Submit & Receive Direct Bank Refund',
    summary: 'Submit your myTax return between July 1 and October 31.',
    detail: 'The ATO processes electronic returns rapidly. Your refund is deposited directly into your Australian bank account within 10 to 14 business days, and your Notice of Assessment (NOA) appears in your myGov inbox.',
    badge: 'Step 5 • Refund Payout',
    icon: CheckCircle2,
  },
];

export function FirstTaxReturnGuide() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const current = TAX_RETURN_STEPS.find(s => s.step === activeStep)!;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ReceiptText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">15yo First Tax Return Walkthrough (myTax & ATO)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Step-by-step guide to lodging online via myGov, claiming your uniform laundry deductions, and getting your 100% PAYG tax refund!
          </p>
        </div>
        <Badge variant="success">
          ATO myTax Direct Refund
        </Badge>
      </div>

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
              <div className="text-xs font-extrabold truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</div>
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
          <Badge variant="outline" className="text-xs font-mono font-bold">
            Step {current.step} of 5
          </Badge>
        </div>

        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {current.summary}
        </p>

        <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed">
          {current.detail}
        </div>

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

      {/* Official Tax Links */}
      <div className="pt-2 flex flex-wrap gap-2.5">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_mytax} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_mygov} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_under18} />
      </div>
    </Card>
  );
}

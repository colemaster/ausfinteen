import { FinancialStressTestCalc } from '@/calculators/financial-stress-test/FinancialStressTestCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { PrintResultButton } from '@/components/shared/PrintResultButton';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const STRESS_TEST_TOPICS = [
  {
    id: 'st-1',
    moduleId: 'financial-stress-test',
    moduleTitle: 'Financial Runway & Crisis Planning 🛡️',
    question: 'How do you calculate HISA vs Mortgage Offset pre-tax yield arbitrage?',
    answer: 'Because mortgage offset interest savings are 100% tax-free, you must earn a substantially higher pre-tax return in a High Interest Savings Account (HISA) to match it. The exact formula is Pre-Tax Equivalent Return = Mortgage Rate / (1 - Marginal Tax Rate). For example, at a 32% marginal rate and a 6.2% mortgage, a HISA must pay 9.12% gross return to break even!',
    actionStep: 'Keep your primary liquid savings buffer in your mortgage offset account.',
  },
  {
    id: 'st-2',
    moduleId: 'financial-stress-test',
    moduleTitle: 'Financial Runway & Crisis Planning 🛡️',
    question: 'What is the Centrelink JobSeeker Liquid Assets Waiting Period (LAWP)?',
    answer: 'If you suddenly lose your job, Services Australia imposes a Liquid Assets Waiting Period of 1 to 13 weeks before you can receive JobSeeker payments if you have liquid cash reserves over $5,500 (single) or $11,000 (couple). Having an emergency runway is critical to survive this mandatory waiting window.',
    actionStep: 'Build a minimum of 3 to 6 months of living expenses in an accessible offset or HISA buffer.',
  },
  {
    id: 'st-3',
    moduleId: 'financial-stress-test',
    moduleTitle: 'Financial Runway & Crisis Planning 🛡️',
    question: 'What is the APRA +300 bps Interest Rate Buffer Test?',
    answer: 'The Australian Prudential Regulation Authority (APRA) mandates that banks stress-test all home loan borrowers against a +3.00% (+300 basis points) interest rate spike above their current loan rate under Prudential Standard APS 220 and APG 223. Our stress test simulator models your cashflow resilience under this exact regulatory shock.',
    actionStep: 'Test your monthly surplus under the +300bps simulation card above.',
  },
  {
    id: 'st-4',
    moduleId: 'financial-stress-test',
    moduleTitle: 'Financial Runway & Crisis Planning 🛡️',
    question: 'What is Comprehensive Credit Reporting (CCR) and the 60-Day Mortgage Default Rule?',
    answer: 'Under the National Credit Code (NCCP Act), if loan repayments remain unpaid for 60+ days, the lender can serve a formal Section 88 Default Notice. Unremedied defaults are lodged with Equifax, Experian, and illion for 5 full years, severely degrading your borrowing capacity. In addition, 24 months of Repayment History Information (RHI) records any payment missed by even 14 days.',
    actionStep: 'If facing hardship, contact your bank hardship team early under the Banking Code of Practice or call the National Debt Helpline (1800 007 007).',
  },
  {
    id: 'st-5',
    moduleId: 'financial-stress-test',
    moduleTitle: 'Financial Runway & Crisis Planning 🛡️',
    question: 'How does the RBA 4.60% Cash Rate transmit into household mortgage repayments?',
    answer: 'The Reserve Bank of Australia cash rate target sits at 4.60% (as established in September/October 2026). Commercial banks pass cash rate changes directly to variable mortgages. As a benchmark, each 0.25% (25 bps) rate hike increases monthly repayments by roughly $80 to $105 per $500,000 borrowed on a 30-year loan term.',
    actionStep: 'Use the Reverse Stress Test card above to find your household\'s maximum survivable borrowing rate.',
  },
];

export function FinancialStressTest() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">Emergency Runway & Stress Tester</span>
      </div>

      <section data-print-section>
        <FinancialStressTestCalc />
      </section>

      <div className="flex justify-end">
        <PrintResultButton />
      </div>

      <div className="max-w-5xl mx-auto space-y-6 content-auto">
        <TopicGuideAccordion
          topics={STRESS_TEST_TOPICS}
          title="Emergency Runway & Macroeconomic Stress Resilience Guide"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

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
    answer: 'The Australian Prudential Regulation Authority (APRA) mandates that banks stress-test all home loan borrowers against a +3.00% (+300 basis points) interest rate spike above their current loan rate. Our stress test simulator models your cashflow resilience under this exact regulatory shock.',
    actionStep: 'Test your monthly surplus under the +300bps simulation card above.',
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

      <div className="max-w-5xl mx-auto space-y-6">
        <TopicGuideAccordion
          topics={STRESS_TEST_TOPICS}
          title="Emergency Runway & Macroeconomic Stress Resilience Guide"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

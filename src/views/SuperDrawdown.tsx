import { SuperDrawdownCalc } from '@/calculators/super-drawdown/SuperDrawdownCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const SUPER_DRAWDOWN_TOPICS = [
  {
    id: 'sd-1',
    moduleId: 'super-drawdown',
    moduleTitle: 'Retirement Phase & Pension Rules ⭐️',
    question: 'How do Account-Based Pension (ABP) minimum drawdowns work?',
    answer: 'Under Schedule 7 of the Superannuation Industry (Supervision) Regulations (SISR), once you convert super to an Account-Based Pension, you must withdraw a statutory minimum percentage each year based on your age (4% under 65, 5% for 65-74, 6% for 75-79, 7% for 80-84, 9% for 85-89, 11% for 90-94, 14% for 95+). All investment earnings inside the pension phase are 100% tax-free under ECPI rules!',
    actionStep: 'Check your super fund portal to ensure your annual drawdown schedule is optimized.',
  },
  {
    id: 'sd-2',
    moduleId: 'super-drawdown',
    moduleTitle: 'Retirement Phase & Pension Rules ⭐️',
    question: 'How does the Services Australia Age Pension dual Means Test work?',
    answer: 'To qualify for the Centrelink Age Pension (age 67+), you are evaluated under BOTH an Assets Test and an Income Test (using deeming rates of 1.25% and 3.25% on financial assets). Whichever test produces the LOWER pension payment is the one Services Australia applies. Primary family homes are 100% exempt from the assets test.',
    actionStep: 'Use the calculator above to see if your pension is restricted by the Assets Test or Deeming Test.',
  },
  {
    id: 'sd-3',
    moduleId: 'super-drawdown',
    moduleTitle: 'Retirement Phase & Pension Rules ⭐️',
    question: 'What is the Younger Spouse Super Exemption Strategy?',
    answer: 'If your spouse is younger than their preservation age (or Age Pension age) and their super remains in the accumulation phase, their super balance is 100% EXEMPT from Centrelink assets testing and deeming tests! Moving assessable assets into a younger spouse\'s super can dramatically increase your Centrelink Age Pension entitlement.',
    actionStep: 'Consult a licensed financial adviser to evaluate spouse contribution splitting before age 67.',
  },
];

export function SuperDrawdown() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">Super Drawdown & Age Pension Optimizer</span>
      </div>

      <SuperDrawdownCalc />

      <div className="max-w-5xl mx-auto space-y-6">
        <TopicGuideAccordion
          topics={SUPER_DRAWDOWN_TOPICS}
          title="Retirement Phase & Centrelink Means Test Masterclass"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

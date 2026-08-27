import { HECSPayoffCalc } from '@/calculators/hecs-payoff/HECSPayoffCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { PrintResultButton } from '@/components/shared/PrintResultButton';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const HECS_TOPICS = [
  {
    id: 'hecs-1',
    moduleId: 'hecs-payoff',
    moduleTitle: 'HECS-HELP Loan Reforms 🎓',
    question: 'How does the 2025–2027 Universities Accord marginal repayment system work?',
    answer: 'From 1 July 2026, Australia transitions from a cliff-edge system to a marginal repayment system with a $69,528 threshold. Under this new system, you only pay a percentage on the portion of your income ABOVE $69,528 (15% on $69,529-$129,717, 17% on $129,718-$186,050, and 10% above $186,050), saving average graduates hundreds of dollars every year.',
    actionStep: 'Use the calculator above to compare your repayment under the marginal system vs the older 19-tier system.',
  },
  {
    id: 'hecs-2',
    moduleId: 'hecs-payoff',
    moduleTitle: 'HECS-HELP Loan Reforms 🎓',
    question: 'What is the min(CPI, WPI) indexation cap and when is it applied?',
    answer: 'Indexation is applied annually on 1 June to your HECS debt that has been outstanding for more than 11 months. Under the 2024 Albanese Government reform, annual indexation is strictly capped at the lower of the Consumer Price Index (CPI) or the Wage Price Index (WPI), preventing runaway debt during high inflation spikes.',
    actionStep: 'Check your ATO HECS balance on myGov in late May before 1 June indexation is applied.',
  },
  {
    id: 'hecs-3',
    moduleId: 'hecs-payoff',
    moduleTitle: 'HECS-HELP Loan Reforms 🎓',
    question: 'Should I make voluntary repayments or invest in ASX ETFs (VAS/VGS) / Mortgage Offset?',
    answer: 'Because HECS-HELP has 0% real commercial interest (only indexation to match inflation), voluntary payoff generally has a lower financial return than investing in broad-market index ETFs (historical 8-9% return) or parking spare cash in a mortgage offset account (guaranteed 6%+ tax-free return). However, paying off HECS eliminates the compulsory paycheck withholding and boosts your home loan borrowing capacity by ~9.5x of the annual repayment.',
    actionStep: 'Check the borrowing capacity impact badge above before applying for a home loan.',
  },
];

export function HECSPayoff() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">HECS-HELP Payoff Simulator</span>
      </div>

      <section data-print-section>
        <HECSPayoffCalc />
      </section>

      <div className="flex justify-end">
        <PrintResultButton />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <TopicGuideAccordion
          topics={HECS_TOPICS}
          title="HECS-HELP Loan Masterclass & ATO Rules"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

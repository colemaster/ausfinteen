import { CGTEngineCalc } from '@/calculators/cgt-engine/CGTEngineCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const CGT_TOPICS = [
  {
    id: 'cgt-1',
    moduleId: 'cgt-engine',
    moduleTitle: 'Capital Gains Tax & Main Residence Rules 🏡',
    question: 'How does the Section 118-145 6-Year Main Residence Absence Rule work?',
    answer: 'Under Section 118-145 of the Income Tax Assessment Act 1997, if you move out of your main residence and rent it out to produce income, you can continue to treat it as your main residence for CGT purposes for up to 6 years of renting. If you sell within 6 years and elect the exemption (and nominate no other home as your main residence), the entire capital gain is 100% tax-free!',
    actionStep: 'Keep records of your date of moving out and moving back in.',
  },
  {
    id: 'cgt-2',
    moduleId: 'cgt-engine',
    moduleTitle: 'Capital Gains Tax & Main Residence Rules 🏡',
    question: 'What is the Section 102-5 Capital Loss Ordering Rule?',
    answer: 'Under Section 102-5 of the ITAA 1997, if you have current year or carried-forward capital losses, they MUST be applied against your gross capital gains FIRST, before applying the 50% CGT discount. Applying losses before the discount ensures full statutory compliance with ATO rules.',
    actionStep: 'Log your historical carried-forward losses from prior year tax returns.',
  },
  {
    id: 'cgt-3',
    moduleId: 'cgt-engine',
    moduleTitle: 'Capital Gains Tax & Main Residence Rules 🏡',
    question: 'How does Division 43 Capital Works Depreciation reduce your cost base?',
    answer: 'Under Section 110-45, any Division 43 capital works deductions (building structure write-offs claimed at 2.5% p.a.) you claimed during property ownership must be subtracted from your cost base upon disposal. This prevents "double-dipping" and increases the taxable capital gain upon sale.',
    actionStep: 'Check your quantity surveyor tax depreciation schedule for total Div 43 claimed.',
  },
];

export function CGTEngine() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">Capital Gains Tax & 6-Year Rule Engine</span>
      </div>

      <CGTEngineCalc />

      <div className="max-w-5xl mx-auto space-y-6">
        <TopicGuideAccordion
          topics={CGT_TOPICS}
          title="Australian Capital Gains Tax & ITAA 1997 Rules Guide"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

import { EVNovatedLeaseCalc } from '@/calculators/ev-novated-lease/EVNovatedLeaseCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const EV_LEASE_TOPICS = [
  {
    id: 'ev-1',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'How does the Treasury Electric Car Discount (FBTAA s 8A) work?',
    answer: 'Under the Electric Car Discount Act 2022 (Section 8A of the Fringe Benefits Tax Assessment Act), eligible zero and low emission vehicles (BEVs and eligible PHEVs) are 100% exempt from Fringe Benefits Tax (FBT) if first held after 1 July 2022 and priced below the Fuel-Efficient Luxury Car Tax threshold ($91,387 for FY25, $91,661 for FY26). This allows 100% of the lease finance and running costs to be paid with pre-tax salary!',
    actionStep: 'Verify your vehicle invoice price driveaway is strictly below $91,387 before signing.',
  },
  {
    id: 'ev-2',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'How do GST savings on the car purchase and running costs work?',
    answer: 'When salary packaging an EV through your employer, your employer claims the 10% GST input tax credit on the purchase price (capped at $6,334 based on the car cost limit of $69,674). In addition, all charging electricity, tyres, insurance, and servicing are paid 100% pre-tax with GST removed.',
    actionStep: 'Check the GST savings badge above to verify your upfront tax savings.',
  },
  {
    id: 'ev-3',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'What is the ATO PCG 2024/2 Safe Harbour Home Charging Rate (4.2c/km)?',
    answer: 'Under ATO Practical Compliance Guideline PCG 2024/2, drivers can use a statutory safe harbour rate of 4.20 cents per kilometre ($0.0420/km) to calculate electricity costs for home charging without needing a dedicated smart sub-meter, simplifying pre-tax expense claims.',
    actionStep: 'Log your odometer reading at the start and end of each FBT year (1 April to 31 March).',
  },
];

export function EVNovatedLease() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">EV Novated Lease vs Cash vs Car Loan</span>
      </div>

      <EVNovatedLeaseCalc />

      <div className="max-w-5xl mx-auto space-y-6">
        <TopicGuideAccordion
          topics={EV_LEASE_TOPICS}
          title="Electric Vehicle Novated Leasing & FBT Exemption Guide"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

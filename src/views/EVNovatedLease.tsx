import { EVNovatedLeaseCalc } from '@/calculators/ev-novated-lease/EVNovatedLeaseCalc';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { PrintResultButton } from '@/components/shared/PrintResultButton';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';

const EV_LEASE_TOPICS = [
  {
    id: 'ev-1',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'How does the Treasury Electric Car Discount (FBTAA s 8A) work?',
    answer: 'Under the Treasury Laws Amendment (Electric Car Discount) Act 2022 (Section 8A of the Fringe Benefits Tax Assessment Act), eligible zero and low emissions vehicles (BEVs and FCEVs) are 100% exempt from Fringe Benefits Tax (FBT) if first held after 1 July 2022 and priced below the Fuel-Efficient Luxury Car Tax threshold ($91,387 for FY25-26, indexed to $91,661 for FY26-27). This allows 100% of the lease finance and operating running costs to be paid with pre-tax salary, saving thousands each year!',
    actionStep: 'Verify your vehicle driveaway retail invoice is strictly below $91,387 before signing.',
  },
  {
    id: 'ev-phev-sunset',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'What happened to Plug-in Hybrids (PHEVs) on 1 April 2025?',
    answer: 'Under the Electric Car Discount Act 2022, plug-in hybrid electric vehicles (PHEVs) ceased to qualify as eligible zero/low emission vehicles on 1 April 2025. PHEVs delivered or contracted on or after 1 April 2025 no longer receive 0% FBT. Only PHEVs with a legally binding commitment entered into before 1 April 2025 that continue uninterrupted remain grandfathered until the lease ends. Battery Electric Vehicles (BEVs) and hydrogen fuel cell vehicles continue to enjoy 100% FBT exemption ongoing.',
    actionStep: 'Choose a pure Battery Electric Vehicle (BEV) to guarantee 100% FBT-free salary sacrifice.',
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
    question: 'What is the ATO PCG 2024/2 Safe Harbour Home Charging Rate (4.2c / 5.47c per km)?',
    answer: 'Under ATO Practical Compliance Guideline PCG 2024/2, drivers can use a statutory safe harbour rate of 4.20 cents per kilometre (increased to 5.47 cents per kilometre commencing 1 April 2026 for FY2026-27) to calculate electricity costs for home charging without needing a dedicated smart sub-meter, simplifying pre-tax expense packaging.',
    actionStep: 'Log your vehicle odometer reading at the start and end of each FBT year (1 April to 31 March).',
  },
  {
    id: 'ev-rfba',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'How does the Reportable Fringe Benefit (RFBA) impact HECS, MLS, and Family Assistance?',
    answer: 'Even though you pay $0 in FBT, the ATO requires employers to report the grossed-up statutory value on your annual income statement (myGov) if it exceeds $2,000. Taxable fringe value is 20% of the vehicle purchase price, multiplied by the Type 2 gross-up factor of 1.8868 (e.g. a $60,000 EV creates a $22,642 RFBA). While RFBA does not increase your regular income tax, it is included in adjusted taxable income for compulsory HECS/HELP repayments, Medicare Levy Surcharge thresholds, Division 293 tax (> $250k), and Family Tax Benefit (FTB) / Child Care Subsidy income tests.',
    actionStep: 'Check your HECS repayment brackets and family income thresholds before finalizing your lease size.',
  },
  {
    id: 'ev-running-costs',
    moduleId: 'ev-novated-lease',
    moduleTitle: 'EV Novated Leasing & FBT Rules ⚡️',
    question: 'How do EV operating and fuel costs compare to a petrol car?',
    answer: 'An average petrol car/SUV consuming 9.5L/100km at $2.30/L costs ~$21.85 per 100km ($3,278/yr over 15,000 km). A typical EV consuming 15 kWh/100km costs only $4.20 per 100km at standard 28c/kWh flat rates ($630/yr), or ~$1.50 per 100km on off-peak EV night tariffs ($225/yr). That delivers $2,600 to $3,050+ in direct annual fuel savings, plus reduced maintenance (no oil, spark plugs, or timing belts).',
    actionStep: 'Compare residential electricity plans with off-peak EV charging windows (e.g. 8c–12c/kWh between midnight and 6 AM).',
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

      <section data-print-section>
        <EVNovatedLeaseCalc />
      </section>

      <div className="flex justify-end">
        <PrintResultButton />
      </div>

      <div className="max-w-5xl mx-auto space-y-6 content-auto">
        <TopicGuideAccordion
          topics={EV_LEASE_TOPICS}
          title="Electric Vehicle Novated Leasing & FBT Exemption Guide"
        />
        <Disclaimer />
      </div>
    </div>
  );
}

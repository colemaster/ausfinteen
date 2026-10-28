export interface NavModule {
  id: string;
  title: string;
  emoji: string;
  route: string;
  description: string;
  graphicUrl?: string;
  topicsCount: number;
}

export const NAV_MODULES: NavModule[] = [
  {
    id: 'money-and-you',
    title: 'Money & You',
    emoji: '🤠',
    route: '/money-and-you',
    graphicUrl: '/assets/graphics/popmart_mascot.jpg',
    description: 'Master your money mindset, defeat Gen Z doom spending & money dysmorphia, evaluate finfluencers under ASIC INFO 269, crush peer pressure with proven scripts, and build your digital Mojo buffer.',
    topicsCount: 18,
  },
  {
    id: 'careers-employment',
    title: 'Careers & Employment',
    emoji: '💼',
    route: '/careers-employment',
    graphicUrl: '/assets/graphics/popmart_job.jpg',
    description: 'Master Australian Modern Awards, 2026-27 junior pay scales, weekend & public holiday penalty rates (225%/250%/275%), the 3-hour minimum shift rule, 1.5-hr retail student exceptions, QLD Form CE1 compliance, and payslip underpayment audits.',
    topicsCount: 22,
  },
  {
    id: 'super-retirement',
    title: 'Super & Retirement',
    emoji: '⭐️',
    route: '/super-retirement',
    graphicUrl: '/assets/graphics/popmart_super.jpg',
    description: "Master Australia's 12.0% Super Guarantee, find and consolidate lost super via myGov, understand Payday Super, and harness 44-year compound growth in low-cost indexed funds.",
    topicsCount: 14,
  },
  {
    id: 'tax-guide',
    title: 'Tax & Tax Returns',
    emoji: '💰',
    route: '/tax-guide',
    graphicUrl: '/assets/graphics/popmart_tax.jpg',
    description: 'Understand the $18,200 Tax-Free Threshold ($22,866 effective with LITO), 2026-27 Stage 3 rates (15% lowest tier), PAYG refunds, Division 6AA minor rules, and lodging your first return via myTax.',
    topicsCount: 16,
  },
  {
    id: 'teen-budgeting',
    title: 'Budgeting & Paychecks',
    emoji: '💵',
    route: '/teen-budgeting',
    graphicUrl: '/assets/graphics/popmart_budget.jpg',
    description: 'Master your first casual paychecks with the Barefoot 3-bucket system, Inverted 50/30/20 rules, automated Pay Yourself First transfers, digital pocket money apps, cost-of-living hacks, and sinking funds for school formals, phones, and first cars.',
    topicsCount: 18,
  },
  {
    id: 'spending-saving',
    title: 'Spending & Saving',
    emoji: '🛍️',
    route: '/spending-saving',
    graphicUrl: '/assets/graphics/popmart_budget.jpg',
    description: 'Unlock top Australian youth savings accounts (5.0%–6.0%), APRA FCS protection, PayID & PayTo control, mobile SIM-only showdowns, grocery inflation survival, sharehouse budgets, and Centrelink Youth Allowance student income bank rules.',
    topicsCount: 20,
  },
  {
    id: 'investing-shares',
    title: 'Investing & Shares',
    emoji: '⚡️',
    route: '/investing-shares',
    graphicUrl: '/assets/graphics/popmart_invest.jpg',
    description: 'Master the ASX, broad-market index ETFs (VAS/VGS/DHHF/IVV), micro-investing apps, bare trusts, Division 6AA minor tax, dollar-cost averaging, and 50-year compounding math.',
    topicsCount: 15,
  },
  {
    id: 'interest-products',
    title: 'Interest & Financial Products',
    emoji: '🧬',
    route: '/interest-products',
    description: 'Find top AU youth savings accounts (5%+ rates), APRA $250k FCS guarantee & shared ADI licences, compound interest mechanics, debit vs credit cards, BNPL traps, PayID/Osko fast rails, PayTo digital direct debits, CDR Open Banking, and cyber scam protection.',
    topicsCount: 18,
  },
  {
    id: 'dealing-with-debt',
    title: 'Dealing with Debt',
    emoji: '💥',
    route: '/dealing-with-debt',
    graphicUrl: '/assets/graphics/popmart_debt.jpg',
    description: 'Avoid Buy Now Pay Later (BNPL) debt traps, credit card interest, debt snowball strategies, and protect your credit score.',
    topicsCount: 14,
  },
  {
    id: 'car-driving',
    title: 'Cars & Driving',
    emoji: '🚗',
    route: '/car-driving',
    graphicUrl: '/assets/graphics/popmart_car.jpg',
    description: 'Calculate the total cost of buying a first car, QLD L/P plate rules, peer passenger limits, camera fines, petrol vs EV running costs, rego, and insurance.',
    topicsCount: 15,
  },
  {
    id: 'brisbane-qld',
    title: 'Brisbane, QLD',
    emoji: '🏙️',
    route: '/brisbane-qld',
    graphicUrl: '/assets/graphics/popmart_bne.jpg',
    description: 'Budgeting for young Aussies in Brisbane: Translink 50c flat fares, QCE & ATAR, 9 SEQ universities, suburb rent, top high schools, and Brisbane 2032 Olympic career opportunities.',
    topicsCount: 17,
  },
];

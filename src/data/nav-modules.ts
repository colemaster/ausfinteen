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
    description: 'Master your money mindset, financial mental health, myGov digital identity, consumer rights, teen cyber safety, and scam protection.',
    topicsCount: 12,
  },
  {
    id: 'careers-employment',
    title: 'Careers & Employment',
    emoji: '💼',
    route: '/careers-employment',
    graphicUrl: '/assets/graphics/popmart_career.jpg',
    description: 'Navigate your first job, resume building, STAR interview prep, Fair Work junior award rates, workplace rights, and super.',
    topicsCount: 14,
  },
  {
    id: 'super-retirement',
    title: 'Super & Retirement',
    emoji: '⭐️',
    route: '/super-retirement',
    graphicUrl: '/assets/graphics/popmart_super.jpg',
    description: 'Learn superannuation fundamentals, compound growth, fund selection, choosing default super, and avoiding multiple fees.',
    topicsCount: 14,
  },
  {
    id: 'tax-guide',
    title: 'Tax & Tax Returns',
    emoji: '💰',
    route: '/tax-guide',
    graphicUrl: '/assets/graphics/popmart_tax.jpg',
    description: 'Master Australian tax brackets, tax-free thresholds, TFN registration, Medicare levy, work-related deductions, and myTax.',
    topicsCount: 14,
  },
  {
    id: 'teen-budgeting',
    title: 'Budgeting & Paychecks',
    emoji: '💵',
    route: '/teen-budgeting',
    graphicUrl: '/assets/graphics/popmart_budget.jpg',
    description: 'Track paychecks with the 50/30/20 rule, Barefoot 3-bucket system, emergency Mojo buffers, and bank app automation.',
    topicsCount: 14,
  },
  {
    id: 'spending-saving',
    title: 'Spending & Saving',
    emoji: '🛍️',
    route: '/spending-saving',
    graphicUrl: '/assets/graphics/popmart_savings.jpg',
    description: 'Find high-interest savings accounts (5.0%+), APRA guarantees, fee-free youth banking, student discounts, and smart spending.',
    topicsCount: 15,
  },
  {
    id: 'investing-shares',
    title: 'Investing & Shares',
    emoji: '⚡️',
    route: '/investing-shares',
    graphicUrl: '/assets/graphics/popmart_invest.jpg',
    description: 'Understand Australian shares, ASX index ETFs (VAS/VGS), compound interest engines, CHESS sponsorship, and risk management.',
    topicsCount: 14,
  },
  {
    id: 'interest-products',
    title: 'Interest & Financial Products',
    emoji: '🧬',
    route: '/interest-products',
    description: 'Demystify simple vs compound interest, credit card traps, term deposits, and Australian financial product disclosure (PDS).',
    topicsCount: 13,
  },
  {
    id: 'dealing-with-debt',
    title: 'Dealing with Debt',
    emoji: '💥',
    route: '/dealing-with-debt',
    graphicUrl: '/assets/graphics/popmart_debt.jpg',
    description: 'Avoid Buy Now Pay Later (BNPL) debt traps, credit score impacts, debt spirals, and free National Debt Helpline assistance.',
    topicsCount: 14,
  },
  {
    id: 'car-driving',
    title: 'Cars & Driving',
    emoji: '🚗',
    route: '/car-driving',
    graphicUrl: '/assets/graphics/popmart_car.jpg',
    description: 'Calculate first car purchase costs, QLD PrepL, CTP & comprehensive insurance, rego, fuel, servicing, and EV comparisons.',
    topicsCount: 15,
  },
  {
    id: 'brisbane-qld',
    title: 'Brisbane, QLD',
    emoji: '🏙️',
    route: '/brisbane-qld',
    graphicUrl: '/assets/graphics/popmart_bne.jpg',
    description: 'Southeast Queensland living guides: TransLink 50c flat fares, Brisbane teen rent, UQ/QUT/Griffith pathways, and QLD school rules.',
    topicsCount: 14,
  },
];

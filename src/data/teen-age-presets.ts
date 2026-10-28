export interface AgeMilestone {
  title: string;
  category: 'legal' | 'career' | 'banking' | 'driving' | 'tax' | 'lifestyle';
  description: string;
  badge: string;
}

export interface AgeChecklistItem {
  task: string;
  category: 'action' | 'legal' | 'admin' | 'money' | 'banking' | 'tax';
  detail: string;
}

export interface AgeWarningFlag {
  title: string;
  severity: 'high' | 'medium' | 'info';
  warning: string;
  solution: string;
}

export interface TypicalWeeklyBudget {
  grossIncome: number;
  estimatedTax: number;
  netIncome: number;
  superGuarantee: number;
  typicalExpenses: {
    transport: number;
    phoneAndTech: number;
    foodAndSocial: number;
    personalAndClothing: number;
    carOrBoard: number;
    studyOrWorkSupplies: number;
  };
  totalEstimatedExpenses: number;
  estimatedWeeklySurplus: number;
}

export interface AgePreset {
  age: number;
  label: string;
  stageName: string;
  jobTitle: string;
  hourlyRate: number;
  hoursPerWeek: number;
  claimsTaxFreeThreshold: boolean;
  savingsGoalName: string;
  savingsGoalTarget: number;
  currentSavings: number;
  tagline: string;
  stageDescription: string;
  legalRightsSummary: string;
  superRuleExplanation: string;
  taxExplanation: string;
  typicalBudget: TypicalWeeklyBudget;
  milestones: AgeMilestone[];
  checklist: AgeChecklistItem[];
  warningFlags: AgeWarningFlag[];
  recommendedModules: string[];
}

export const SUPPORTED_PRESET_AGES = [14, 15, 16, 17, 18, 19, 20] as const;
export type SupportedPresetAge = typeof SUPPORTED_PRESET_AGES[number];

/**
 * Age presets use the 2026-27 effective junior award rate for the worker's
 * age band (Fast Food / Retail Level 1 adult base $27.81/hr from 1 July 2026,
 * junior % applied: under 16 = 40%, 16 = 50%, 17 = 60%, 18 = 70%,
 * 19 = 80%, 20 = 90% (first 6 months with an employer)).
 * Note: from the first full pay period on or after 1 December 2026 the FWC
 * ([2026] FWCFB 75, PR813654) phases 18-20s with MORE than 6 months' service
 * up +5 percentage points per 1 Dec/1 Jul step until 100% — 20s by 1 Jul 2027,
 * 19s by 1 Jul 2028, 18s by 1 Jul 2029 (Retail, Fast Food & Pharmacy awards).
 * Under-18 rates and new starters (<=6 months' service) are unchanged.
 * Verified 18 Oct 2026 (calculate.fairwork.gov.au pay guides, fwc.gov.au).
 */
export const AGE_PRESETS: Record<number, AgePreset> = {
  14: {
    age: 14,
    label: '14yo First Hustle',
    stageName: 'First Cash & Savings Habit',
    jobTitle: 'Junior Casual / Referee / Babysitter / Odd Jobs',
    hourlyRate: 13.90, // Under-16 junior award rate (40% x $27.81 adult base x 1.25 casual loading = $13.90/hr)
    hoursPerWeek: 5, // Strict adherence to state child employment limits during school terms (<12h/wk)
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Mini Mojo Safety Buffer ($300) & Tech Goal',
    savingsGoalTarget: 600,
    currentSavings: 180,
    tagline: 'Earn your first independent cash, open a 5%+ youth bank account, and get your free lifetime TFN.',
    stageDescription: 'At 14 in Australia, you can start doing light casual work (babysitting, sports refereeing, lawn care, paper rounds, or retail/fast food subject to state child employment limits such as QLD Form CE1 parent consent). This is the best age to open your first fee-free bank account independently in your own name with Apple Pay / Google Wallet and get your free lifetime Tax File Number (TFN) from the ATO.',
    legalRightsSummary: 'Maximum 12 hours/week during school terms in QLD and VIC. Form CE1 parent consent in QLD; Victorian child employment permits apply under 15. Curfew between 9pm/10pm and 6am. Employers must pay at least the junior award rate ($13.90/hr casual under 16). Unpaid trials longer than 1 hour are illegal wage theft.',
    superRuleExplanation: 'Under-18 workers are not entitled to compulsory 12% super unless they work more than 30 hours in a single week. At 5 hrs/wk, no super is legally required unless specified by an employer enterprise agreement.',
    taxExplanation: 'Earned personal income (wages) has an effective tax-free threshold of $22,575 ($18,200 base + $700 LITO). You pay $0 tax on wages. However, passive unearned income (bank interest, dividends, family trust distributions) over $416 is hit with punitive Division 6AA minor penalty tax rates (up to 47%-66%)!',
    typicalBudget: {
      grossIncome: 69.50,
      estimatedTax: 0,
      netIncome: 69.50,
      superGuarantee: 0,
      typicalExpenses: {
        transport: 5.00,
        phoneAndTech: 7.50,
        foodAndSocial: 20.00,
        personalAndClothing: 12.00,
        carOrBoard: 0,
        studyOrWorkSupplies: 5.00,
      },
      totalEstimatedExpenses: 49.50,
      estimatedWeeklySurplus: 20.00,
    },
    milestones: [
      {
        title: 'Apply for Free Tax File Number (TFN)',
        category: 'legal',
        description: 'Book a free identity appointment at Australia Post with your birth certificate and student ID. Never pay third-party fee scams.',
        badge: 'Legal Essential',
      },
      {
        title: 'Open a Zero-Fee 5.00%+ Youth Savings Account',
        category: 'banking',
        description: 'Open a high-interest youth account (e.g. BOQ Future Saver, Westpac Bump, Great Southern Bank) and attach your TFN to stop 47% withholding tax.',
        badge: 'Banking Milestone',
      },
      {
        title: 'First Visa/Mastercard Debit Card & Apple Pay',
        category: 'banking',
        description: 'At age 14, major Australian banks allow debit cards with digital wallet setup and independent accounts without requiring a parent co-sign.',
        badge: 'Independence',
      },
      {
        title: 'Build $300 Mini-Mojo Emergency Buffer',
        category: 'lifestyle',
        description: 'Store $300 in a separate sub-account with no debit card attached to build an ironclad savings habit.',
        badge: 'Wealth Habit',
      },
    ],
    checklist: [
      { task: 'Gather identity documents', category: 'admin', detail: 'Collect birth certificate, school student ID card, and parent Medicare card for identity verification.' },
      { task: 'Apply for free TFN via ATO/AusPost', category: 'legal', detail: 'Submit online application on the ATO website and verify at your local post office for $0.' },
      { task: 'Open a fee-free high-interest youth savings account', category: 'banking', detail: 'Compare youth accounts earning 5.00%+ p.a. (BOQ Future Saver, Great Southern Bank). Open independently in own name from 14.' },
      { task: 'Add TFN to bank account online', category: 'money', detail: 'Input your 9-digit TFN into your banking app to stop 47% tax from being withheld on interest.' },
      { task: 'Create a 1-page junior resume', category: 'action', detail: 'List your school achievements, sports teams, babysitting experience, and non-parent character references.' },
      { task: 'Automate 50/50 Barefoot Junior split', category: 'money', detail: 'Allocate 50% of every dollar earned to Splurge (fun/snacks) and 50% to your Vault savings goal.' },
    ],
    warningFlags: [
      {
        title: 'Division 6AA Penalty Tax on Passive Income',
        severity: 'high',
        warning: 'Minors under 18 who earn passive investment or interest income over $416/year are taxed at up to 66% under Division 6AA.',
        solution: 'Genuine earned personal wages from employment are exempt from Division 6AA and taxed at adult rates ($18.2k tax-free threshold).',
      },
      {
        title: 'Unpaid Shift / "Trial" Exploitation',
        severity: 'high',
        warning: 'Some cafes and businesses ask 14-year-olds to work multiple unpaid 4-hour shifts under the guise of an "evaluation".',
        solution: 'Under Fair Work regulations, unpaid trials are only lawful for the minimum time to demonstrate skills (rarely over 1 hour).',
      },
      {
        title: 'Uninsured Cash-in-Hand Underpayment',
        severity: 'medium',
        warning: 'Unregistered cash jobs often pay $8-$10/hr and leave you with zero workers compensation if injured on the job.',
        solution: 'Insist on official award pay ($13.90/hr casual minimum) with payslips or reputable local babysitting/refereeing.',
      },
      {
        title: 'Social Media Money Muling Scams',
        severity: 'high',
        warning: 'Scammers on TikTok/Snapchat message teens offering $200 to receive a bank transfer and withdraw cash.',
        solution: 'Never let anyone transfer funds through your account. This is criminal money laundering and leads to frozen bank accounts.',
      },
    ],
    recommendedModules: ['money-and-you', 'teen-budgeting', 'spending-saving', 'careers-employment'],
  },
  15: {
    age: 15,
    label: '15yo First Job',
    stageName: 'First Job, TFN & Medicare Independence',
    jobTitle: 'Fast Food / Retail Junior (Casual)',
    hourlyRate: 13.90, // $11.12 base + 25% casual loading ($13.90/hr)
    hoursPerWeek: 8,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Mojo Safety Buffer ($500) & First Phone',
    savingsGoalTarget: 800,
    currentSavings: 250,
    tagline: 'First real job roster, your own green Medicare card, and the $500 Mojo safety buffer.',
    stageDescription: 'At 15, you can legally work in retail and fast food nationwide without special employer permits (e.g. Victorian child employment permits end at 15). You also unlock healthcare independence: Services Australia allows you to order your own separate green Medicare card (via Form MS004, MS011, or myGov) for 100% confidential doctor visits without parental notification. It is time to lock down your first paycheck budget.',
    legalRightsSummary: 'You must receive at least the Fast Food / General Retail Level 1 junior award rate ($13.90/hr casual). Entitled to a paid 10-minute rest pause for shifts over 4 hours, and 3-hour minimum pay per shift (or 1.5h on school days in Retail with consent).',
    superRuleExplanation: 'Under Section 11 of the Superannuation Guarantee (Administration) Act 1992, workers under 18 only receive 12.0% employer superannuation if they work more than 30 hours in a given week. Casuals working 8 hrs/wk do not receive compulsory super unless an EBA mandates it.',
    taxExplanation: 'Claim the Tax-Free Threshold on Question 8 of your ATO TFN Declaration (NAT 3092). Because you earn $5,782/year (8 hrs @ $13.90), your annual income is well below the $22,575 effective tax-free threshold. Estimated PAYG withholding is $0.',
    typicalBudget: {
      grossIncome: 111.20,
      estimatedTax: 0,
      netIncome: 111.20,
      superGuarantee: 0,
      typicalExpenses: {
        transport: 7.00,
        phoneAndTech: 8.75,
        foodAndSocial: 30.00,
        personalAndClothing: 18.00,
        carOrBoard: 0,
        studyOrWorkSupplies: 7.45,
      },
      totalEstimatedExpenses: 71.20,
      estimatedWeeklySurplus: 40.00,
    },
    milestones: [
      {
        title: 'Land First Roster & Submit TFN Declaration',
        category: 'career',
        description: 'Complete Form NAT 3092 for your employer, ticking Yes to Tax-Free Threshold to ensure $0 PAYG withholding.',
        badge: 'First Paycheck',
      },
      {
        title: 'Claim Your Own Green Medicare Card (Form MS004)',
        category: 'legal',
        description: 'From age 15, Services Australia allows you to get your own separate green Medicare card (Form MS004 to copy/transfer or myGov) for 100% confidential doctor visits without parental notification.',
        badge: 'Health Privacy',
      },
      {
        title: 'Verify First Payslip Within 1 Business Day',
        category: 'tax',
        description: 'Check your payslip for employer ABN, legal name, correct junior rate ($13.90+), and 25% casual loading.',
        badge: 'Fair Work Check',
      },
      {
        title: 'Automate Barefoot 3-Bucket Split ($500 Mojo)',
        category: 'banking',
        description: 'Direct 60% to Daily Splurge, 20% to untouchable Mojo ($500 buffer), and 20% to Grow in high-interest savings.',
        badge: 'Wealth Habit',
      },
      {
        title: 'Enrol in PrepL / DKT Practice at 15y 11m',
        category: 'driving',
        description: 'Study your state road rules 1 month before turning 16 so you can sit the test on your 16th birthday.',
        badge: 'Driving Prep',
      },
    ],
    checklist: [
      { task: 'Complete TFN Declaration (NAT 3092)', category: 'legal', detail: 'Claim the tax-free threshold on Question 8 and enter your 9-digit TFN accurately.' },
      { task: 'Audit your very first payslip', category: 'action', detail: 'Ensure your base rate matches $11.12 + 25% casual loading = $13.90/hr under the modern award.' },
      { task: 'Apply for own separate Medicare card', category: 'admin', detail: 'Submit Services Australia Form MS004 (copy from family card) or apply through myGov under "Get a new card and number" for confidential medical privacy.' },
      { task: 'Set up automated payday bank transfers', category: 'money', detail: 'Schedule automatic transfers the morning after pay lands so savings are locked away first.' },
      { task: 'Sign up for Student Edge & UNiDAYS', category: 'money', detail: 'Register with your high school student email to unlock $1,000+ per year in student discounts.' },
      { task: 'Download PrepL / practice DKT road rules app', category: 'action', detail: 'Complete online practice quizzes so you ace your learner permit test the week you turn 16.' },
    ],
    warningFlags: [
      {
        title: 'Under-18 Super Guarantee Exemption Confusion',
        severity: 'info',
        warning: 'Australian law does not mandate 12% super for workers under 18 working 30 hours or less per week.',
        solution: 'Do not panic if super is $0 on payslips unless you work >30 hours in a week or your specific enterprise agreement pays it.',
      },
      {
        title: 'Flat $10/hr Cash-in-Hand Rate',
        severity: 'high',
        warning: 'Suburban cafes frequently underpay 15-year-olds with flat cash rates, dodging weekend penalty rates ($17.38-$20.85/hr).',
        solution: 'Know your modern award rights. You are legally entitled to $13.90/hr weekdays and penalty rates on weekends/public holidays.',
      },
      {
        title: 'The 3-Hour Minimum Shift Rule Violation',
        severity: 'medium',
        warning: 'Managers cannot roster or pay you for less than 3 hours under Fast Food & Retail Awards, even if sent home early.',
        solution: 'If sent home after 1.5 hours because it is quiet, politely remind payroll that award conditions require 3 hours minimum pay.',
      },
      {
        title: 'Unpaid Off-The-Clock Cleaning',
        severity: 'medium',
        warning: 'Being forced to clock out at 9:00pm but stay until 9:45pm to mop floors or complete closing tasks without pay.',
        solution: 'All mandatory work activities must be recorded on the timeclock and fully compensated down to the minute.',
      },
    ],
    recommendedModules: ['careers-employment', 'teen-budgeting', 'tax-guide', 'spending-saving'],
  },
  16: {
    age: 16,
    label: '16yo Part-Timer & Ls',
    stageName: 'L-Plates, 25% Birthday Pay Rise & Car Savings',
    jobTitle: 'Supermarket Service Assistant / Cafe Junior',
    hourlyRate: 17.39, // $13.91 base (50% of adult $27.81) + 25% casual loading ($17.39/hr)
    hoursPerWeek: 12,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Car Deposit & Driving Lessons',
    savingsGoalTarget: 3500,
    currentSavings: 950,
    tagline: 'Earn a 25% birthday pay rise to $17.39/hr, get your Learner licence, and log your 100 driving hours.',
    stageDescription: 'Turning 16 brings an immediate +25% automatic pay rise under modern awards (rate jumps from 40% to 50% of the adult base). It is also the legal milestone to pass your road rules test, get your yellow L-plates, and start the 100-hour (QLD) or 120-hour (NSW/VIC) logbook journey. Balancing school and 12 hours of shifts teaches real-world budgeting.',
    legalRightsSummary: 'Your minimum award rate automatically increases on your 16th birthday to 50% of adult base ($17.39/hr casual). Entitled to meal break (30-60 min unpaid) if working shift longer than 5 hours. School attendance is compulsory, so shifts cannot conflict with school hours.',
    superRuleExplanation: 'Under Section 11 SGAA 1992, workers under 18 still require >30 hours in a week to qualify for statutory 12.0% Super Guarantee. However, during school holidays, if you pick up extra shifts totaling 31+ hours in a Monday-Sunday week, your employer MUST pay 12% super on your entire pay that week!',
    taxExplanation: 'At 12 hrs/wk x $17.39/hr = $208.68/wk ($10,851/year), you are well within the $22,575 effective tax-free threshold. Estimated PAYG withholding remains $0 as long as you claimed the threshold on Form NAT 3092.',
    typicalBudget: {
      grossIncome: 208.68,
      estimatedTax: 0,
      netIncome: 208.68,
      superGuarantee: 0,
      typicalExpenses: {
        transport: 10.00,
        phoneAndTech: 10.00,
        foodAndSocial: 45.00,
        personalAndClothing: 25.00,
        carOrBoard: 35.00,
        studyOrWorkSupplies: 10.00,
      },
      totalEstimatedExpenses: 135.00,
      estimatedWeeklySurplus: 73.68,
    },
    milestones: [
      {
        title: 'Pass Road Rules Test & Pick Up L-Plates',
        category: 'driving',
        description: 'Complete PrepL (QLD), DKT (NSW), or VicRoads LPTO (VIC) and get your official Learner licence issued at the transport service center.',
        badge: 'L-Plates',
      },
      {
        title: 'Confirm 16th Birthday Pay Rise to $17.39/hr',
        category: 'career',
        description: 'Ensure payroll updates your junior percentage from 40% to 50% on your first pay cycle after turning 16 (+25.1% raise!).',
        badge: 'Pay Rise',
      },
      {
        title: 'Book 10 Professional Driving Instructor Hours',
        category: 'driving',
        description: 'Under the 3-for-1 rule, the first 10 hours with an accredited instructor count as 30 logbook hours, saving massive time.',
        badge: 'Logbook Hack',
      },
      {
        title: 'Open Dedicated "Car & Rego" High-Interest Sinking Fund',
        category: 'banking',
        description: 'Create a separate bank bucket and automate $50/week toward your first car, CTP, and insurance.',
        badge: 'Sinking Fund',
      },
      {
        title: 'Log 50 Verified Supervised Driving Hours',
        category: 'driving',
        description: 'Reach the halfway mark in your state logbook app across night driving, rain, highway, and heavy traffic conditions.',
        badge: '50 Hours',
      },
    ],
    checklist: [
      { task: 'Verify 50% junior rate on post-birthday payslip', category: 'action', detail: 'Check that hourly rate reflects $17.39 casual ($13.91 base) on your first payslip after turning 16.' },
      { task: 'Download official digital logbook app', category: 'admin', detail: 'Use the official state transport app (e.g. QLD Learner Logbook) to record drives with GPS verification.' },
      { task: 'Book 10 driving instructor lessons', category: 'action', detail: 'Schedule professional lessons early to master safe habits and bank the 30-hour bonus allowance.' },
      { task: 'Calculate total cost of car ownership', category: 'money', detail: 'Use our First Car Cost Calculator to budget for stamp duty, registration ($850), and insurance ($2,000+).' },
      { task: 'Automate $50+/week into high-interest car fund', category: 'money', detail: 'Channel surplus income directly into an account earning 5.00%+ p.a. to buy a reliable car in cash.' },
      { task: 'Track holiday work hours for 12% super eligibility', category: 'legal', detail: 'If working holiday rosters over 30 hours in a single week, confirm payroll contributes 12% super.' },
    ],
    warningFlags: [
      {
        title: 'Payroll Forgetting 16th Birthday Pay Rise',
        severity: 'high',
        warning: 'Many automated payroll systems fail to update junior age rates automatically upon turning 16.',
        solution: 'Check your payslip. If your rate did not jump to $17.39/hr, email your store manager or payroll department immediately for back-pay.',
      },
      {
        title: 'Falsifying Logbook Hours Trap',
        severity: 'high',
        warning: 'Forging driving hours in your logbook is a serious criminal offence with harsh fines and automatic 6-month licence suspensions.',
        solution: 'Log genuine drives systematically every week. Spreading 100 hours over 12 months is only ~2 hours per week.',
      },
      {
        title: 'Predatory Dealer Car Loans / Finance',
        severity: 'high',
        warning: 'High-interest car finance (12%-22% APR) or payday car loans will destroy your financial flexibility throughout your early 20s.',
        solution: 'Never borrow money for your first car. Buy a safe, economical Japanese hatchback (Corolla, Yaris, Mazda 3, i30) in 100% cash.',
      },
      {
        title: 'Shift Creep Overwhelming Year 11 Academics',
        severity: 'medium',
        warning: 'Picking up 20+ hours of casual shifts during assessment periods can permanently hurt your Year 11 foundations and ATAR potential.',
        solution: 'Cap school-term work at 10-12 hours per week. Your long-term career earning potential is worth more than extra short-term shifts.',
      },
    ],
    recommendedModules: ['car-driving', 'careers-employment', 'teen-budgeting', 'teen-savings'],
  },
  17: {
    age: 17,
    label: '17yo Senior Student',
    stageName: 'P-Plates, Year 12, QTAC & Senior Casual',
    jobTitle: 'Cafe / Bakery Front-of-House / Senior Retail',
    hourlyRate: 20.86, // $16.69 base (60% of adult $27.81) + 25% casual loading ($20.86/hr)
    hoursPerWeek: 15,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Car Rego, CTP & Insurance Sinking Fund',
    savingsGoalTarget: 4500,
    currentSavings: 2100,
    tagline: 'Earn $20.86/hr, get your Red P-plates, conquer Year 12 ATAR/QTAC, and avoid insurance shock.',
    stageDescription: 'At 17, your award pay jumps to 60% ($20.86/hr casual). You reach the provisional driving milestone: completing 100 logbook hours, passing the practical driving test (e.g. QLD Q-SAFE, NSW Driving Test), and driving solo on your Red Ps. It is also the pivotal Year 12 senior schooling year with ATAR, QTAC/UAC applications, evaluating Centrelink Youth Allowance / ABSTUDY eligibility for independent students, and planning for uni, TAFE, or trade apprenticeships.',
    legalRightsSummary: 'Junior casual rate is 60% of adult base ($20.86/hr). Penalty rates apply: 150% on Sundays ($29.21/hr) and 225%-250% on public holidays ($43.81/hr). Pre-enrolment for federal voting opens at 17 on the AEC website. Under-18 super rule still applies (<30h/wk = no compulsory super).',
    superRuleExplanation: 'Under 18 workers are exempt from statutory super unless working >30 hrs/wk. However, as you approach your 18th birthday, prepare your stapled super fund details because 12.0% super will become compulsory on EVERY single hour worked the day you turn 18.',
    taxExplanation: 'At 15 hrs/wk x $20.86/hr = $312.90/wk ($16,270/year). Since $16,270 is below the $18,200 standard threshold ($22,575 effective threshold with LITO), you pay $0 tax. Weekly PAYG withholding should be $0.',
    typicalBudget: {
      grossIncome: 312.90,
      estimatedTax: 0,
      netIncome: 312.90,
      superGuarantee: 0,
      typicalExpenses: {
        transport: 45.00,
        phoneAndTech: 12.00,
        foodAndSocial: 55.00,
        personalAndClothing: 30.00,
        carOrBoard: 50.00,
        studyOrWorkSupplies: 15.00,
      },
      totalEstimatedExpenses: 207.00,
      estimatedWeeklySurplus: 105.90,
    },
    milestones: [
      {
        title: 'Complete 100 Logbook Hours & Hazard Perception Test',
        category: 'driving',
        description: 'Finalise your 100 logbook hours (with 10 night hours) and pass the online Hazard Perception Test (HPT).',
        badge: 'Logbook Complete',
      },
      {
        title: 'Pass Practical Driving Test (Q-SAFE) & Get Red P-Plates (P1)',
        category: 'driving',
        description: 'Pass your driving assessment (e.g. QLD Q-SAFE) on your 17th birthday and secure your provisional P1 licence for independent driving.',
        badge: 'Red P-Plates',
      },
      {
        title: 'Lock In Comprehensive or Third-Party Property Insurance',
        category: 'banking',
        description: 'Never drive solo with CTP alone. Ensure vehicle has at least Third-Party Property damage coverage before driving.',
        badge: 'Risk Protection',
      },
      {
        title: 'Verify 17th Birthday Pay Rise to $20.86/hr',
        category: 'career',
        description: 'Confirm payroll upgrades award percentage to 60% ($20.86/hr casual) with Sunday rates reaching $29.21/hr.',
        badge: 'Pay Rise',
      },
      {
        title: 'Submit Tertiary Preferences (QTAC / UAC / VTAC)',
        category: 'career',
        description: 'Finalise university degree preferences, explore Commonwealth Supported Places (CSP), or apply for trade apprenticeships.',
        badge: 'Future Career',
      },
      {
        title: 'Pre-Enrol to Vote with AEC at 17',
        category: 'legal',
        description: 'Australians aged 17 can pre-enrol on the Australian Electoral Commission roll so you are automatically ready at 18.',
        badge: 'Democracy Ready',
      },
      {
        title: 'Assess Youth Allowance & ABSTUDY Independence Eligibility',
        category: 'legal',
        description: 'Explore Services Australia Youth Allowance or ABSTUDY criteria for independent students, tertiary study away from home, and regional relocation scholarships.',
        badge: 'Income Support',
      },
    ],
    checklist: [
      { task: 'Pass Hazard Perception Test (HPT)', category: 'action', detail: 'Complete the mandatory interactive video hazard test before booking your practical driving exam.' },
      { task: 'Secure Third-Party Property Car Insurance', category: 'money', detail: 'Get quotes online; CTP only covers human medical injury, leaving you exposed to tens of thousands in vehicle damage.' },
      { task: 'Build a $1,500 Young Driver Insurance Excess Buffer', category: 'money', detail: 'Save enough cash to cover young driver insurance excess ($1,500-$2,500) if an accident occurs.' },
      { task: 'Confirm 17yo award rate update to $20.86/hr', category: 'admin', detail: 'Audit your payslip following your 17th birthday to ensure the 60% award rate is applied.' },
      { task: 'Pre-enrol to vote with the AEC', category: 'legal', detail: 'Visit aec.gov.au and pre-enrol so your voter registration activates automatically on your 18th birthday.' },
      { task: 'Scale back shifts during Year 12 exam blocks', category: 'action', detail: 'Reduce casual hours to 6-8 hrs/week during mock and final external exam periods to protect ATAR scores.' },
      { task: 'Assess Centrelink Youth Allowance / ABSTUDY eligibility', category: 'admin', detail: 'Check Services Australia payment finder for independent student allowance, Rent Assistance, or Tertiary Access Payments.' },
      { task: 'Research HECS-HELP and CSP university course costs', category: 'admin', detail: 'Use our HECS calculator to understand future student loan indexation and repayment thresholds.' },
    ],
    warningFlags: [
      {
        title: 'Driving With CTP Insurance Only (Catastrophic Debt Risk)',
        severity: 'high',
        warning: 'CTP only covers personal injuries to people, NOT damage to vehicles or property. Hitting a $100k vehicle without property insurance means bankruptcy.',
        solution: 'Always purchase Comprehensive or Third-Party Property Damage insurance before your first solo drive on P-plates.',
      },
      {
        title: 'P1 Peer Passenger Curfew Violations',
        severity: 'high',
        warning: 'In QLD, NSW, and other states, P1 drivers under 25 cannot carry more than one peer passenger aged 16-20 between 11pm and 5am.',
        solution: 'Respect passenger curfews. Police strictly enforce this; violations carry heavy fines and 3 demerit points (leading to instant licence suspension).',
      },
      {
        title: 'Year 12 Assessment Burnout & Shift Pressure',
        severity: 'medium',
        warning: 'Managers often pressure senior 17yo staff to close stores late on weeknights during crucial Year 12 assessment periods.',
        solution: 'Communicate exam blackout periods in writing 4 weeks in advance. Your high school diploma and ATAR are your top financial priority.',
      },
      {
        title: 'Formal & Schoolies Debt Traps',
        severity: 'medium',
        warning: 'Teens frequently blow $2,000-$4,000 of hard-earned car savings on designer formal outfits, luxury car hires, and unbudgeted Schoolies trips.',
        solution: 'Set a strict sinking fund budget for formal and graduation celebrations. Never touch your core emergency Mojo buffer for parties.',
      },
    ],
    recommendedModules: ['car-driving', 'brisbane-qld', 'careers-employment', 'teen-budgeting'],
  },
  18: {
    age: 18,
    label: '18yo Adult & School Leaver',
    stageName: 'Legal Adulthood, 12% Super & Micro-Investing',
    jobTitle: 'Retail Level 1 / Barista / Apprentice / Sports Referee',
    hourlyRate: 24.34, // 70% ($19.47 base) + 25% casual loading = $24.34/hr; with >6mo service steps +5pp from 1 Dec 2026, reaching 100% by 1 Jul 2029 ([2026] FWCFB 75)
    hoursPerWeek: 20,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Emergency Buffer ($2,000) & First Index ETF Portfolio',
    savingsGoalTarget: 6000,
    currentSavings: 3400,
    tagline: 'Legal adulthood: compulsory 12% super on every dollar, voting, first tax return, and micro-investing.',
    stageDescription: 'Turning 18 is the legal threshold to full adulthood in Australia. The 30-hour superannuation exemption vanishes: your employer must pay 12.0% super into your stapled fund on EVERY single dollar earned. You gain the legal right to sign contracts, open micro-investing accounts (ETFs), lodge your own full tax return, and vote in Australian elections.',
    legalRightsSummary: 'Full legal contract capacity: can sign leases, loans, and phone contracts. Voting in federal, state, and local elections is compulsory by law. Junior award rate is 70% ($24.34/hr casual), but under FWC [2026] FWCFB 75, workers with >6 months service step up towards 100% adult rate ($34.76/hr casual). Can legally hold RSA/RSG for hospitality work.',
    superRuleExplanation: 'CRITICAL 18YO LAW: The under-18 30-hour rule EXPIRES immediately on your 18th birthday! Section 11 of the SG Act requires employers to pay statutory 12.0% Super Guarantee on all Ordinary Time Earnings (OTE) regardless of whether you work 2 hours or 38 hours a week. At 20 hrs/wk, you get $58.42/week ($3,037/year) invested into compounding super!',
    taxExplanation: 'At 20 hrs/wk x $24.34/hr = $486.80/wk ($25,313/year). Since your income exceeds the $18,200 threshold, you now pay tax! After the $700 LITO offset, tax begins above $22,575. Estimated tax withheld is approx $21/week. You must lodge an annual tax return via myGov by 31 October.',
    typicalBudget: {
      grossIncome: 486.80,
      estimatedTax: 21.00,
      netIncome: 465.80,
      superGuarantee: 58.42,
      typicalExpenses: {
        transport: 50.00,
        phoneAndTech: 15.00,
        foodAndSocial: 85.00,
        personalAndClothing: 40.00,
        carOrBoard: 75.00,
        studyOrWorkSupplies: 20.00,
      },
      totalEstimatedExpenses: 285.00,
      estimatedWeeklySurplus: 180.80,
    },
    milestones: [
      {
        title: 'Unlock 12.0% Super Guarantee on Every Dollar',
        category: 'legal',
        description: 'Confirm your employer deposits 12.0% super into your stapled account regardless of how few hours you work each week.',
        badge: '12% Super Unlocked',
      },
      {
        title: 'Mandatory AEC Voter Enrolment',
        category: 'legal',
        description: 'Enrol on the electoral roll. Voting in Australian federal, state, and council elections is compulsory from age 18.',
        badge: 'AEC Enrolment',
      },
      {
        title: 'Get RSA / White Card for High-Paying Adult Roles',
        category: 'career',
        description: 'Complete Responsible Service of Alcohol (RSA) or construction White Card to access weekend penalty shifts ($30-$38/hr).',
        badge: 'Career Tickets',
      },
      {
        title: 'Open Adult Brokerage & Buy First Index ETF',
        category: 'banking',
        description: 'Open a CHESS-sponsored brokerage (Pearler, Stake, Betashares Direct) and buy your first $500 of diversified broad-market ETFs (A200/VGS).',
        badge: 'First ETF Investment',
      },
      {
        title: 'Lodge First Full Annual Tax Return on myGov',
        category: 'tax',
        description: 'Lodge between 1 July and 31 October via ATO myGov; claim laundry deductions, union fees, and work gear to maximize your refund.',
        badge: 'Tax Return Lodged',
      },
      {
        title: 'Build Full $2,000 Adult Emergency Buffer',
        category: 'lifestyle',
        description: 'Establish a rock-solid $2,000 cash emergency buffer in a top-tier fee-free adult high-interest savings account (5.00%+).',
        badge: 'Financial Fortress',
      },
    ],
    checklist: [
      { task: 'Check first payslip after turning 18 for 12% super', category: 'action', detail: 'Verify superannuation guarantee (12.0%) is calculated on all gross earnings, even if under 30 hours.' },
      { task: 'Staple your super fund via myGov ATO portal', category: 'legal', detail: 'Check ATO online to ensure all employers pay into ONE single fund, eliminating duplicate insurance and admin fees.' },
      { task: 'Complete AEC electoral enrolment', category: 'admin', detail: 'Register at aec.gov.au to avoid non-voting fines in upcoming federal, state, or municipal elections.' },
      { task: 'Switch from youth bank account to adult fee-free HISA', category: 'banking', detail: 'Upgrade to top adult savings accounts (e.g. Ubank, Macquarie, ING, BOQ) with zero account-keeping fees.' },
      { task: 'Open a low-cost micro-investing or brokerage account', category: 'money', detail: 'Set up an automated recurring $50/fortnight investment into low-fee diversified index ETFs (VAS, VGS, A200).' },
      { task: 'Lodge your annual income tax return on myGov', category: 'action', detail: 'Wait for STP income statements to show "Tax Ready" in late July, then lodge before the October 31 deadline.' },
    ],
    warningFlags: [
      {
        title: 'Predatory Buy Now Pay Later (BNPL) & Credit Cards',
        severity: 'high',
        warning: 'Marketing from Afterpay, Zip, and credit card companies floods your feeds at 18, encouraging debt for fleeting lifestyle items.',
        solution: 'Adopt the Golden Rule: If you cannot pay for it in full with cash in your bank account today, you cannot afford it.',
      },
      {
        title: 'Super Fund Duplication & Fee Drain',
        severity: 'high',
        warning: 'Starting new jobs often leads to new default super funds being opened, draining $400+/year in duplicate fees and life insurance.',
        solution: 'Use ATO myGov to consolidate multiple accounts into your single preferred low-fee industry super fund.',
      },
      {
        title: 'Co-signing Contracts / Becoming a Guarantor',
        severity: 'high',
        warning: 'Signing a phone contract, car loan, or lease agreement for a romantic partner or friend makes you 100% legally liable for their debt.',
        solution: 'Never co-sign any loan or contract. If they fail to pay, your credit score will be ruined for at least 5 years.',
      },
      {
        title: 'Unpaid Super Theft by Unscrupulous Employers',
        severity: 'medium',
        warning: 'Some dishonest employers continue exploiting the under-18 30-hour exemption even after the worker turns 18.',
        solution: 'Check your super fund portal every quarter. Employers must legally remit super at least quarterly (28 Oct, 28 Jan, 28 Apr, 28 Jul).',
      },
    ],
    recommendedModules: ['tax-guide', 'super-retirement', 'investing-shares', 'careers-employment'],
  },
  19: {
    age: 19,
    label: '19yo Uni / TAFE / Apprentice',
    stageName: 'Tertiary Study, HECS-HELP & Sharehousing',
    jobTitle: 'Customer Service & Admin / 2nd-Yr Apprentice / Senior Barista',
    hourlyRate: 27.81, // 80% ($22.25 base) + 25% casual loading = $27.81/hr; 100% by 1 Jul 2028 with >6mo service ([2026] FWCFB 75)
    hoursPerWeek: 22,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Uni Laptop, Textbooks & Rental Bond Fund',
    savingsGoalTarget: 8000,
    currentSavings: 4800,
    tagline: 'Earn $27.81/hr, navigate HECS-HELP debt, master sharehouse rental bonds, and build real wealth.',
    stageDescription: 'At 19, you are navigating higher education (Uni/TAFE), a skilled trade apprenticeship, or progressing in your career. Your award rate rises to 80% ($27.81/hr casual). Key financial milestones include managing Commonwealth Supported Places (HECS-HELP student debt), understanding compulsory repayment thresholds, moving into a sharehouse, and mastering independent adult cash flow.',
    legalRightsSummary: 'Junior award rate is 80% of adult base ($27.81/hr casual). Entitled to full penalty rates (125% Saturdays, 150% Sundays, 225% public holidays). Apprentices are protected by modern award apprentice training conditions and eligible for interest-free Australian Apprenticeship Support Loans. Tenancy rights protected under state Residential Tenancies Acts.',
    superRuleExplanation: '12.0% statutory Super Guarantee applies to every dollar of Ordinary Time Earnings. On 22 hrs/wk at $27.81/hr ($611.82 gross/wk), your employer pays $73.42/week ($3,818/year) directly into your super fund. At age 19, ensure your super is invested in a high-growth or indexed share option to maximize 45-year compound growth.',
    taxExplanation: 'At 22 hrs/wk x $27.81/hr = $611.82/wk ($31,815/year). PAYG tax withheld is approximately $48/week (~$2,500/yr). Because income is below the HECS-HELP compulsory repayment threshold ($67,000+ in 2026-27), ZERO student loan repayments are withheld from your pay! You can claim course-related deductions only if directly related to your current employment.',
    typicalBudget: {
      grossIncome: 611.82,
      estimatedTax: 48.00,
      netIncome: 563.82,
      superGuarantee: 73.42,
      typicalExpenses: {
        transport: 35.00,
        phoneAndTech: 15.00,
        foodAndSocial: 110.00,
        personalAndClothing: 45.00,
        carOrBoard: 210.00,
        studyOrWorkSupplies: 25.00,
      },
      totalEstimatedExpenses: 440.00,
      estimatedWeeklySurplus: 123.82,
    },
    milestones: [
      {
        title: 'Master HECS-HELP Indexation & CSP Mechanics',
        category: 'legal',
        description: 'Track your student loan balance via myGov ATO and understand that indexation is capped at the lower of CPI or WPI following Australian reforms.',
        badge: 'HECS Mastery',
      },
      {
        title: 'Lodge Official 4-Week Rental Bond with State Authority',
        category: 'lifestyle',
        description: 'When moving into a sharehouse, always ensure your bond is officially lodged with the RTA (QLD) or Rental Bonds Online (NSW).',
        badge: 'Tenant Protection',
      },
      {
        title: 'Switch Super Option to 100% High Growth / Indexed Shares',
        category: 'banking',
        description: 'Log into your industry super fund and switch out of default balanced options into High Growth or Indexed International Shares for max compounding.',
        badge: 'Super Compounder',
      },
      {
        title: 'Establish $100/mo Dollar-Cost Averaging into ETFs',
        category: 'banking',
        description: 'Set up an automated monthly investment into diversified broad-market index ETFs (A200, VAS, VGS, BGBL) to build your long-term share portfolio.',
        badge: 'Wealth Builder',
      },
      {
        title: 'Claim Tertiary Student Travel Concessions',
        category: 'lifestyle',
        description: 'Register your student ID with your public transport authority to secure 50% concession fares or flat 50c fares across Queensland.',
        badge: 'Student Discount',
      },
    ],
    checklist: [
      { task: 'Submit eCAF for Commonwealth Supported Place', category: 'admin', detail: 'Complete your electronic Commonwealth Assistance Form before the university census date to defer tuition fees.' },
      { task: 'Lodge rental bond directly with state bond authority', category: 'legal', detail: 'Never hand cash bonds to flatmates without an official RTA/RBO bond lodgement confirmation receipt.' },
      { task: 'Switch super investment option to High Growth / Shares', category: 'money', detail: 'Take advantage of a 45-year investment horizon by switching to aggressive, low-fee growth asset allocations.' },
      { task: 'Set up a household expense tracking system (Splitwise)', category: 'action', detail: 'Coordinate utility bills, WiFi, and shared pantry staples fairly with your roommates to prevent financial disputes.' },
      { task: 'Claim work uniform and tool deductions on tax return', category: 'tax', detail: 'Keep receipts for compulsory branded workwear, safety boots, and trade tools to claim on your annual return.' },
      { task: 'Build a $4,000 emergency sharehouse buffer', category: 'money', detail: 'Protect against sudden car repairs, bond transfers, or temporary job loss with an automated emergency fund.' },
    ],
    warningFlags: [
      {
        title: 'Rental Bond & Fake Sublet Scams',
        severity: 'high',
        warning: 'Scammers post fake apartment listings on Facebook Marketplace demanding cash deposits before an inspection is conducted.',
        solution: 'Never transfer money until you have inspected the property in person, met the landlord or lead tenant, and signed a formal agreement.',
      },
      {
        title: 'Voluntary HECS Repayment Misconception',
        severity: 'medium',
        warning: 'Many students make voluntary repayments on HECS debt when earning under $67,000, losing valuable liquidity.',
        solution: 'HECS has 0% real commercial interest (only inflation indexation). Prioritize emergency cash and high-interest savings before paying down HECS.',
      },
      {
        title: 'Joint and Several Tenancy Liability Trap',
        severity: 'high',
        warning: 'On a shared lease, every named tenant is 100% legally liable for unpaid rent or damage caused by an irresponsible roommate.',
        solution: 'Carefully vet housemates. If a roommate falls behind, communicate with the property manager immediately to protect your rental history.',
      },
      {
        title: 'Centrelink Youth Allowance Reporting Errors',
        severity: 'medium',
        warning: 'Failing to report gross fortnightly income accurately while receiving Youth Allowance triggers automated Centrelink debt recovery.',
        solution: 'Log in to your Centrelink app on your reporting day and input the exact gross earnings displayed on your employer payslip.',
      },
    ],
    recommendedModules: ['tax-guide', 'investing-shares', 'super-retirement', 'spending-saving'],
  },
  20: {
    age: 20,
    label: '20yo Young Adult',
    stageName: 'Career Progression & Wealth Acceleration',
    jobTitle: 'Shift Supervisor / Department Coordinator / 3rd-Yr Apprentice',
    hourlyRate: 31.29, // 90% ($25.03 base, first 6 months) + 25% casual loading = $31.29/hr; with >6mo service steps +5pp from 1 Dec 2026 to 100% by 1 Jul 2027 ([2026] FWCFB 75)
    hoursPerWeek: 28,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Home Deposit & ETF Portfolio',
    savingsGoalTarget: 15000,
    currentSavings: 8200,
    tagline: 'Transition to full adult award rates ($31.29-$34.76/hr), supercharge your ETF portfolio, and build your First Home Super Saver (FHSS) deposit.',
    stageDescription: 'At 20, you are stepping into senior leadership, finishing your degree or trade apprenticeship, and moving toward 100% adult award rates ($34.76/hr casual). You are in prime position to start utilizing the First Home Super Saver Scheme (FHSSS) and accelerating long-term wealth creation.',
    legalRightsSummary: '90% of adult base ($31.29/hr casual), moving to 100% ($34.76/hr casual) after 6 months continuous service under General Retail Industry Award clause 16.3 and FWC [2026] FWCFB 75. Full adult employment rights, overtime penalties after 38 hours or 10 hours in a day, and compulsory 12% Super Guarantee on all earnings.',
    superRuleExplanation: '12.0% SG applies to all earnings. On 28 hrs/wk at $31.29/hr ($876.12/wk), employer pays $105.13/wk ($5,467/year) into super. Can begin voluntary concessional salary sacrifice into super to take advantage of the First Home Super Saver Scheme (FHSSS).',
    taxExplanation: 'At 28 hrs/wk x $31.29/hr = $876.12/wk ($45,558/year). PAYG tax withheld is approx $95/wk (~$4,950/yr). Income approaches the lower threshold for HECS-HELP repayments ($67,000+). Full tax return deductions should be optimized annually.',
    typicalBudget: {
      grossIncome: 876.12,
      estimatedTax: 95.00,
      netIncome: 781.12,
      superGuarantee: 105.13,
      typicalExpenses: {
        transport: 55.00,
        phoneAndTech: 20.00,
        foodAndSocial: 140.00,
        personalAndClothing: 60.00,
        carOrBoard: 260.00,
        studyOrWorkSupplies: 25.00,
      },
      totalEstimatedExpenses: 560.00,
      estimatedWeeklySurplus: 221.12,
    },
    milestones: [
      {
        title: 'Reach 100% Adult Wage Rate ($34.76/hr Casual)',
        category: 'career',
        description: 'Qualify for full adult award rates under the FWC junior phase-in reforms after 6 months continuous service.',
        badge: 'Full Adult Wage',
      },
      {
        title: 'Accumulate First $10,000 Liquid Net Worth',
        category: 'banking',
        description: 'Hit five figures across high-interest savings and diversified index ETF investments.',
        badge: '$10k Net Worth',
      },
      {
        title: 'Research First Home Super Saver Scheme (FHSSS)',
        category: 'tax',
        description: 'Learn how to make voluntary concessional super contributions to save for a home deposit taxed at just 15% instead of your marginal rate.',
        badge: 'FHSS Strategy',
      },
      {
        title: 'Upgrade Green P2 to Full Open Driver Licence',
        category: 'driving',
        description: 'Complete your P2 provisional period and transition to a full, unrestricted Australian open driver licence.',
        badge: 'Open Licence',
      },
      {
        title: 'Audit Credit Score on Equifax / Experian',
        category: 'lifestyle',
        description: 'Check your free annual credit report via MoneySmart to verify an unblemished, prime credit profile.',
        badge: 'Prime Credit',
      },
    ],
    checklist: [
      { task: 'Verify adult award rate transition with payroll', category: 'action', detail: 'Ensure your rate reflects full adult rates or 90% junior rate moving towards 100% under FWC PR813654.' },
      { task: 'Explore voluntary concessional super contributions for FHSSS', category: 'money', detail: 'Take advantage of the FHSS scheme to withdraw up to $50,000 in voluntary contributions for a first home deposit.' },
      { task: 'Automate a weekly investment transfer into index ETFs', category: 'money', detail: 'Set up automated transfers to compound wealth in broad-market funds like VAS, VGS, A200, and NDQ.' },
      { task: 'Upgrade to Full Open Driver Licence', category: 'action', detail: 'Submit your open licence application after holding P2 green plates for the required state period.' },
      { task: 'Conduct annual insurance and utility market comparison', category: 'admin', detail: 'Compare car insurance, health insurance, and mobile plans using government comparison tools (Energy Made Easy).' },
    ],
    warningFlags: [
      {
        title: 'Lifestyle Creep As Incomes Rise',
        severity: 'medium',
        warning: 'As weekly pay expands towards $800-$1,000 net, increasing spending on dining out, new cars, and luxury goods keeps you trapped paycheck-to-paycheck.',
        solution: 'Automate savings first. Send 30% of pay directly into investments and home deposit funds before touching discretionary spending.',
      },
      {
        title: 'Speculative Meme Coins & Forex Trading Schemes',
        severity: 'high',
        warning: 'High-risk trading schemes promising overnight riches frequently wipe out young adults during their highest wealth-building years.',
        solution: 'Stick to boring, proven wealth accumulation: low-cost broad-market index ETFs, compounding super, and high-interest cash reserves.',
      },
      {
        title: 'Overlooking FHSSS Tax Concessions',
        severity: 'info',
        warning: 'Saving for a house deposit in standard bank accounts incurs personal marginal income tax on every dollar of interest earned.',
        solution: 'Salary sacrifice through the FHSSS to save at a concessional 15% tax rate, turbocharging your deposit savings by thousands.',
      },
    ],
    recommendedModules: ['investing-shares', 'super-retirement', 'tax-guide', 'spending-saving'],
  },
};

/**
 * Helper to fetch a preset by age with fallback to the 15yo standard profile.
 */
export function getAgePreset(age: number): AgePreset {
  return AGE_PRESETS[age] || AGE_PRESETS[15];
}

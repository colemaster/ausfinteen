/**
 * Official Australian Teen Financial Reference Data (2026-27)
 * Sources: ATO, Fair Work Ombudsman, Moneysmart, Services Australia, APRA, ACCC, PPSR, SafeWork Australia, RTBA, RBO, RTA, RACQ
 */

export interface WebLink {
  title: string;
  url: string;
  source: 'ATO' | 'Fair Work' | 'Moneysmart' | 'Services Australia' | 'PPSR' | 'Reserve Bank' | 'Scamwatch' | 'ACCC' | 'APRA' | 'SafeWork' | 'ASX' | 'Moomoo' | 'ETF Provider' | 'Media' | 'Research' | 'QLD Government' | 'Brisbane City Council' | 'Federal Government' | 'University' | 'Australia Post' | 'Transport' | 'Student Discount' | 'Bank' | 'Community' | 'Legal';
  description: string;
  formCode?: string;
}

export interface AgePreset {
  age: number;
  label: string;
  jobTitle: string;
  hourlyRate: number;
  hoursPerWeek: number;
  claimsTaxFreeThreshold: boolean;
  savingsGoalName: string;
  savingsGoalTarget: number;
  currentSavings: number;
}

/**
 * Age presets use the 2026-27 effective junior award rate for the worker's
 * age band (Fast Food / Retail Level 1 adult base $27.81/hr from 1 July 2026,
 * junior % applied: under 16 = 40%, 16 = 50%, 17 = 60%, 18 = 70%).
 * Note: from 1 December 2026 the FWC ([2026] FWCFB 75) phases 18-20s up to
 * the full adult rate after 6 months with the same employer (Retail, Fast
 * Food & Pharmacy awards). Under-18 rates are unchanged.
 */
export const AGE_PRESETS: Record<number, AgePreset> = {
  15: {
    age: 15,
    label: '15yo First Job',
    jobTitle: 'Fast Food / Retail Junior (Casual)',
    hourlyRate: 13.90, // $11.12 base + 25% casual loading ($13.90/hr)
    hoursPerWeek: 8,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Mojo Safety Buffer ($500)',
    savingsGoalTarget: 500,
    currentSavings: 150,
  },
  16: {
    age: 16,
    label: '16yo Part-Timer',
    jobTitle: 'Supermarket Service Assistant',
    hourlyRate: 17.39, // $13.91 base + 25% casual loading ($17.39/hr)
    hoursPerWeek: 12,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Car Deposit & Driving Lessons',
    savingsGoalTarget: 3500,
    currentSavings: 850,
  },
  17: {
    age: 17,
    label: '17yo Senior Student',
    jobTitle: 'Cafe / Bakery Front-of-House',
    hourlyRate: 20.86, // $16.69 base + 25% casual loading ($20.86/hr)
    hoursPerWeek: 15,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Car Rego, CTP & Insurance Sinking Fund',
    savingsGoalTarget: 4500,
    currentSavings: 1800,
  },
  18: {
    age: 18,
    label: '18yo School Leaver',
    jobTitle: 'Junior Sports Referee / Retail Level 1',
    hourlyRate: 24.34, // $19.47 base + 25% casual loading ($24.34/hr, moves to $34.76 after 6mo per FWCFB 75)
    hoursPerWeek: 20,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Emergency Buffer ($2,000) & Index ETFs',
    savingsGoalTarget: 6000,
    currentSavings: 3200,
  },
  19: {
    age: 19,
    label: '19yo Uni / TAFE Student',
    jobTitle: 'Customer Service & Admin Team',
    hourlyRate: 27.81, // $22.25 base + 25% casual loading ($27.81/hr)
    hoursPerWeek: 22,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Uni Laptop, Textbooks & Rental Bond Fund',
    savingsGoalTarget: 8000,
    currentSavings: 4500,
  },
  20: {
    age: 20,
    label: '20yo Young Adult',
    jobTitle: 'Shift Supervisor / Department Coordinator',
    hourlyRate: 34.76, // $27.81 adult base + 25% casual loading ($34.76/hr)
    hoursPerWeek: 28,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Home Deposit & ETF Portfolio',
    savingsGoalTarget: 15000,
    currentSavings: 7800,
  },
};

/**
 * ATO Division 6AA Minor Unearned Income Tax Rates (FY 2024–27).
 * Source: ATO — ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old
 */
export const MINOR_UNEARNED_TAX_RATES = {
  taxFreeLimit: 416,
  threshold66: 1307,
  shadeInRate: 0.66,
  topRate: 0.45,
} as const;

/**
 * Centrelink Youth Allowance & Student Assistance Rates (2026-27 indexed, source: Services Australia).
 */
export const CENTRELINK_YOUTH_ALLOWANCE_RATES = {
  singleUnder18AtHome: 456.60,
  single18PlusAtHome: 549.00,
  singleAwayFromHome: 677.20,
  incomeFreeFortnight: 559,
  taperRateLow: 0.50,
  taperRateHigh: 0.60,
  studentStartUpLoan: 1349,
  abstudyAwayFromHome: 677.20,
  abstudyAway22Plus: 799.70,
  incomeBankCap: 13500,
  parentalIncomeFree: 66722,
} as const;

export const OFFICIAL_WEB_LINKS: Record<string, WebLink> = {
  moneysmart_banking: {
    title: 'Moneysmart: Bank Accounts & High-Interest Savings',
    url: 'https://moneysmart.gov.au/banking',
    source: 'Moneysmart',
    description: 'Australian Government guide to choosing bank accounts, high-interest savings bonus conditions, and zero-fee accounts.',
  },
  apra_fcs: {
    title: 'APRA: Financial Claims Scheme ($250,000 Deposit Guarantee)',
    url: 'https://www.fcs.gov.au/',
    source: 'APRA',
    description: 'Official Australian Government guarantee protecting up to $250,000 per depositor per bank (ADI).',
  },
  accc_cdr: {
    title: 'ACCC: Consumer Data Right (Open Banking Security)',
    url: 'https://www.cdr.gov.au/',
    source: 'ACCC',
    description: 'Official portal on Open Banking security allowing teens to connect budgeting apps safely via OAuth without password sharing.',
  },
  ato_tfn_bank: {
    title: 'ATO: Providing Your TFN to Banks (Section 202D)',
    url: 'https://www.ato.gov.au/individuals-and-families/tax-file-number/in-what-situations-do-you-need-a-tfn',
    source: 'ATO',
    description: 'ATO rule: providing your TFN to your bank prevents 47% top marginal withholding tax on savings interest.',
  },
  ato_tfn_form: {
    title: 'ATO: Tax File Number Declaration Form (NAT 3092)',
    url: 'https://www.ato.gov.au/forms-and-instructions/tax-file-number-declaration',
    source: 'ATO',
    formCode: 'NAT 3092',
    description: 'Official ATO form completed when starting a new job to claim the $18,200 Tax-Free Threshold.',
  },
  ato_tfn_myid: {
    title: 'ATO: Online TFN Application via myID (Digital Identity)',
    url: 'https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn/australian-residents-tfn-application#ApplyusingDigitalIDmyID',
    source: 'ATO',
    description: '100% online TFN application for 15+ year olds with Strong myID strength (Passport + Birth Cert + Face Verification).',
  },
  ato_tfn_nat2717: {
    title: 'ATO: Paper TFN Application Form for Individuals (NAT 2717)',
    url: 'https://www.ato.gov.au/forms-and-instructions/tax-file-number-application-or-enquiry-for-an-individual',
    source: 'ATO',
    formCode: 'NAT 2717',
    description: 'Official ATO paper application form for applicants unable to use online or Australia Post channels.',
  },
  ato_super_choice_form: {
    title: 'ATO: Superannuation Standard Choice Form (NAT 13080)',
    url: 'https://www.ato.gov.au/forms-and-instructions/superannuation-standard-choice-form',
    source: 'ATO',
    formCode: 'NAT 13080',
    description: 'Official ATO form to provide your existing stapled super fund USI & Member ID to your new employer.',
  },
  ato_minor_income: {
    title: 'ATO: Division 6AA Tax Rates for Minors Under 18',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old',
    source: 'ATO',
    description: 'ATO unearned income tax rates: $416 tax-free threshold for minor investment & interest income.',
  },
  fairwork_fwis: {
    title: 'Fair Work Information Statement (FWIS)',
    url: 'https://www.fairwork.gov.au/employment-conditions/information-statements/fair-work-information-statement',
    source: 'Fair Work',
    formCode: 'FWIS',
    description: 'Mandatory document employers must provide to all new employees outlining minimum workplace rights.',
  },
  fairwork_ceis: {
    title: 'Casual Employment Information Statement (CEIS)',
    url: 'https://www.fairwork.gov.au/employment-conditions/information-statements/casual-employment-information-statement',
    source: 'Fair Work',
    formCode: 'CEIS',
    description: 'Mandatory statement given to casual workers detailing 25% casual loading & casual conversion rights.',
  },
  fairwork_unpaid_trials: {
    title: 'Fair Work Ombudsman: Unpaid Trials & Work Rights',
    url: 'https://www.fairwork.gov.au/starting-employment/unpaid-work/unpaid-trials',
    source: 'Fair Work',
    description: 'Official guidelines stating skills tests can only last 1-2 hours; paid shifts required beyond that.',
  },
  safework_au: {
    title: 'SafeWork Australia: Young Worker Health & Safety',
    url: 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/young-workers',
    source: 'SafeWork',
    description: 'Workplace health and safety (WHS) rights, injury reporting, and WorkCover insurance for teens.',
  },
  ato_under18: {
    title: 'ATO: Income Tax Rates & Rules for Under 18s',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old',
    source: 'ATO',
    description: 'Official ATO guide on earned income vs unearned income tax rates for minors.',
  },
  ato_tfn: {
    title: 'ATO: How to Apply for a Tax File Number (TFN)',
    url: 'https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn',
    source: 'ATO',
    description: 'Step-by-step TFN application rules for 13-15 and 15+ year olds via myID and Post Office.',
  },
  ato_super_guarantee: {
    title: 'ATO: Super Guarantee Eligibility Rules',
    url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-need-to-pay-super',
    source: 'ATO',
    description: 'Under 18 super guarantee rule: must work >30 hours in a calendar week under SGAA 1992 s 19(10) to receive 12.0% Super.',
  },
  fairwork_awards: {
    title: 'Fair Work Ombudsman: Pay & Junior Award Rates Calculator',
    url: 'https://calculate.fairwork.gov.au/',
    source: 'Fair Work',
    description: 'Official PACT calculator for Retail, Fast Food, and Hospitality junior pay percentage rates.',
  },
  fairwork_payslip: {
    title: 'Fair Work Ombudsman: Legal Payslip Requirements',
    url: 'https://www.fairwork.gov.au/pay-and-wages/paying-wages/pay-slips',
    source: 'Fair Work',
    description: 'Mandatory line items on Australian payslips under Section 536 of the Fair Work Act 2009.',
  },
  moneysmart_budget: {
    title: 'Moneysmart: Budgeting & Saving for Young People',
    url: 'https://moneysmart.gov.au/budgeting',
    source: 'Moneysmart',
    description: 'Australian Government MoneySmart tools for setting up spending, saving, and emergency buffer buckets.',
  },
  moneysmart_car: {
    title: 'Moneysmart: Buying & Running Your First Car',
    url: 'https://moneysmart.gov.au/buying-a-car',
    source: 'Moneysmart',
    description: 'True cost of car ownership guide including rego, CTP green slip, insurance, and servicing.',
  },
  ppsr_check: {
    title: 'PPSR: Official Australian Vehicle Financial Search ($2)',
    url: 'https://www.ppsr.gov.au/searching/do-used-car-check',
    source: 'PPSR',
    description: 'Official government register to check if a second-hand car has money owing or was written off ($2 fee).',
  },
  ato_mygov: {
    title: 'ATO: myGov & Digital Identity Portal',
    url: 'https://www.ato.gov.au/online-services/online-services-for-individuals-and-sole-traders/mygov',
    source: 'ATO',
    description: 'Official Australian Government portal connecting ATO tax, Medicare, and Centrelink.',
  },
  ato_mytax: {
    title: 'ATO: myTax Online Tax Return Lodgement',
    url: 'https://www.ato.gov.au/individuals-and-families/your-tax-return/how-to-lodge-your-tax-return/lodge-your-tax-return-online-with-mytax',
    source: 'ATO',
    description: 'Official ATO portal for lodging your annual individual tax return online.',
  },
  fairwork_pact: {
    title: 'Fair Work Ombudsman: Pay and Conditions Tool (PACT)',
    url: 'https://calculate.fairwork.gov.au/',
    source: 'Fair Work',
    description: 'Official PACT calculator for base pay rates, junior percentages, penalty rates, and allowances.',
  },
  fairwork_min_age: {
    title: 'Fair Work Ombudsman: Minimum Working Age Rules',
    url: 'https://www.fairwork.gov.au/starting-employment/young-workers-and-students/minimum-working-age',
    source: 'Fair Work',
    description: 'Official rules on the minimum age for work in each state and territory, including school attendance protections.',
  },
  fairwork_clubs_award: {
    title: 'Fair Work: Registered and Licensed Clubs Award [MA000058]',
    url: 'https://www.fairwork.gov.au/employment-conditions/awards/awards-summary/ma000058-summary',
    source: 'Fair Work',
    description: 'Modern award rules and junior pay rates for sporting, bowling, RSL, and community clubs.',
  },
  qld_school_based: {
    title: 'QLD: School-Based Apprenticeships & Traineeships (SATs)',
    url: 'https://desbt.qld.gov.au/training/apprentices/school-based',
    source: 'QLD Government',
    description: 'Start an apprenticeship or traineeship in Years 10-12: combine paid work, TAFE training and school to earn a national qualification.',
  },
  ato_lost_super: {
    title: 'ATO: Find & Consolidate Lost Super',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/find-and-consolidate-your-super',
    source: 'ATO',
    description: 'Use myGov to find lost super accounts, check balances and roll everything into one stapled fund to stop fee drain.',
  },
  moneysmart_super: {
    title: 'Moneysmart: Superannuation & How It Works',
    url: 'https://moneysmart.gov.au/how-super-works',
    source: 'Moneysmart',
    description: 'Government guide to choosing super funds, low-fee options, and long-term compounding.',
  },
  moneysmart_debt: {
    title: 'Moneysmart: Managing Debt & Credit Traps',
    url: 'https://moneysmart.gov.au/managing-debt',
    source: 'Moneysmart',
    description: 'Government guide on BNPL risks, credit cards, and National Debt Helpline (1800 007 007) support.',
  },
  translink_50c_fares: {
    title: 'Translink: Queensland 50-Cent Public Transport Fares',
    url: 'https://translink.com.au/tickets-and-fares/50-cent-fares',
    source: 'QLD Government',
    description: 'Official details on Queensland\'s flat 50-cent fare initiative across trains, buses, ferries, and light rail.',
  },
  racq_car_running_costs: {
    title: 'RACQ: Car Running Costs & Ownership Guide',
    url: 'https://www.racq.com.au/car/buying-a-car/car-running-costs',
    source: 'Research',
    description: 'RACQ annual breakdown of car servicing, fuel, insurance, and depreciation in QLD.',
  },
  accc_consumer_rights: {
    title: 'ACCC: Australian Consumer Law & Guarantees',
    url: 'https://www.accc.gov.au/consumers',
    source: 'ACCC',
    description: 'Official consumer rights guide on repairs, replacements, refunds, and faulty products.',
  },
  services_australia_youth: {
    title: 'Services Australia: Youth Allowance & Student Start-up Loan',
    url: 'https://www.servicesaustralia.gov.au/youth-allowance',
    source: 'Services Australia',
    description: 'Centrelink independence test, fortnightly income-free area ($559 for students in 2026-27), and student start-up loans.',
  },
  scamwatch_au: {
    title: 'Scamwatch: Spotting & Reporting Financial Scams',
    url: 'https://www.scamwatch.gov.au',
    source: 'Scamwatch',
    description: 'ACCC Scamwatch guide for young people on identifying social media & banking scams, smishing, and impersonation fraud.',
  },
  scamwatch_youth_scams: {
    title: 'Scamwatch: Spotting Job, Task & Money Muling Scams',
    url: 'https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams',
    source: 'Scamwatch',
    description: 'ACCC Scamwatch guide on fake TikTok/Instagram remote jobs, task scams, and the legal dangers of "money muling" through your bank account.',
  },
  acsc_cyber_safety: {
    title: 'Cyber.gov.au: Australian Cyber Security Centre (ACSC)',
    url: 'https://www.cyber.gov.au/protect-yourself/resources',
    source: 'Federal Government',
    description: 'Official Australian Government guidance on multi-factor authentication (MFA), passkeys, phishing defense, and reporting cyber incidents.',
  },
  studyassist_hecs: {
    title: 'StudyAssist: HECS-HELP & VET Student Loans',
    url: 'https://www.studyassist.gov.au',
    source: 'Services Australia',
    description: 'Government guide to Commonwealth Supported Places (CSPs) and HELP repayment thresholds.',
  },
  moomoo_au: {
    title: 'moomoo Australia: Share Trading Platform',
    url: 'https://www.moomoo.com/au',
    source: 'Moomoo',
    description: 'Australia\'s top-rated trading app. Trade 26,000+ stocks & ETFs on the ASX, US and Hong Kong markets. CHESS-sponsored on all ASX trades.',
  },
  moomoo_etf_guide: {
    title: 'moomoo: How to Invest in ETFs in Australia',
    url: 'https://www.moomoo.com/au/invest/etf',
    source: 'Moomoo',
    description: 'Beginner ETF guide covering diversification, low fees, transparency and how ETFs trade like shares during market hours.',
  },
  moomoo_dividend_etfs: {
    title: 'moomoo: 10 Best High Dividend ETFs in Australia',
    url: 'https://www.moomoo.com/au/learn/detail-best-dividend-etf-australia-117437-240938044',
    source: 'Moomoo',
    description: 'Research on top ASX high dividend ETFs (VHY, SYI, IHD, RDV) including dividend yield, MER and distribution history.',
  },
  asx_etf_centre: {
    title: 'ASX: ETF & ETP Products Hub',
    url: 'https://www.asx.com.au/markets/trade-our-cash-market/list-of-etfs',
    source: 'ASX',
    description: 'Official ASX list of all exchange traded products including ETFs, monthly FUM data and product documents.',
  },
  asx_invest_education: {
    title: 'ASX: Learn How to Invest in Shares & ETFs',
    url: 'https://www.asx.com.au/education',
    source: 'ASX',
    description: 'Free ASX investor education covering how the market works, index investing, diversification and trading basics.',
  },
  moneysmart_investing: {
    title: 'Moneysmart: How to Invest in Shares & ETFs',
    url: 'https://moneysmart.gov.au/how-to-invest',
    source: 'Moneysmart',
    description: 'Australian Government guide to shares, ETFs, managed funds, risk and the "investing is a marathon" mindset.',
  },
  moneysmart_compound: {
    title: 'Moneysmart: Compound Interest Explained',
    url: 'https://moneysmart.gov.au/saving-and-budgeting/compound-interest',
    source: 'Moneysmart',
    description: 'Government interactive compound interest tool showing how early investing supercharges long-term growth.',
  },
  vanguard_etfs: {
    title: 'Vanguard Australia: ETF Range & Education',
    url: 'https://www.vanguard.com.au/personal/invest-with-us/etf',
    source: 'ETF Provider',
    description: 'Vanguard index ETFs (VAS, VGS, VTS) with performance, distributions and PDS documents.',
  },
  betashares_etfs: {
    title: 'Betashares: ETF Range & Research',
    url: 'https://www.betashares.com.au',
    source: 'ETF Provider',
    description: 'Betashares ETFs (A200, NDQ, ETHI) including annual performance tables, distributions and DRP details.',
  },
  blackrock_etfs: {
    title: 'iShares by BlackRock: ASX ETF Range',
    url: 'https://www.ishares.com/au',
    source: 'ETF Provider',
    description: 'iShares ETFs (IVV, IOZ) with fund performance, holdings and distribution history.',
  },
  services_australia_medicare_15: {
    title: 'Services Australia: Getting Your Own Medicare Card at 15 (Form MS011)',
    url: 'https://www.servicesaustralia.gov.au/how-to-get-your-own-medicare-card-or-number',
    source: 'Services Australia',
    formCode: 'MS011',
    description: 'From age 15, Australian teens can get their own green Medicare card (via myGov or Form MS011) for confidential doctor visits and bulk-billing.',
  },
  auspost_tfn: {
    title: 'Australia Post: TFN Application for Australian Residents & Students',
    url: 'https://auspost.com.au/id-and-document-services/apply-for-a-tax-file-number',
    source: 'Australia Post',
    description: 'Free TFN application at Australia Post: fill out online form, book a free appointment, and present Australian Birth Certificate + Student ID.',
  },
  student_edge: {
    title: 'Student Edge: Free Australian Student Discounts & Perks',
    url: 'https://studentedge.org/au',
    source: 'Student Discount',
    description: 'Free student membership offering discounts on tech, food, cinema tickets, fashion, and retail for Australian high school students.',
  },
  unidays_au: {
    title: 'UNiDAYS Australia: High School & Student Discounts',
    url: 'https://www.myunidays.com/AU/en-AU',
    source: 'Student Discount',
    description: 'Official verified student discount portal for Apple Education, Samsung, ASOS, Nike, and tech savings.',
  },
  fairwork_minimum_shifts: {
    title: 'Fair Work Ombudsman: Minimum Hours per Shift Rules',
    url: 'https://www.fairwork.gov.au/starting-employment/types-of-employees/casual-employees',
    source: 'Fair Work',
    description: 'By law under Fast Food and Retail Awards, employers must provide a minimum of 3 hours per shift for casual workers.',
  },
  fairwork_breaks: {
    title: 'Fair Work Ombudsman: Rest Pauses & Meal Break Entitlements',
    url: 'https://www.fairwork.gov.au/employment-conditions/hours-of-work-breaks-and-rosters/breaks',
    source: 'Fair Work',
    description: 'Official award break rules: 10-minute paid rest pause for 4+ hour shifts; 30-60 minute unpaid meal break for 5+ hour shifts.',
  },
  qld_prepl: {
    title: 'Queensland Government: PrepL Online Driving Course & Test',
    url: 'https://www.qld.gov.au/transport/licensing/getting-licence/prepl',
    source: 'QLD Government',
    description: 'Sit your QLD learner driver knowledge test online at home from age 15 years 11 months ($30.70 fee).',
  },
  nsw_dkt_practice: {
    title: 'Transport for NSW: Practice Driver Knowledge Test (DKT)',
    url: 'https://www.nsw.gov.au/driving-boating-and-transport/driver-and-rider-licences/driver-licences/learner-driver-licence/driver-knowledge-test',
    source: 'Transport',
    description: 'Official NSW practice test tool for 15-year-olds preparing to get their Learner licence on their 16th birthday.',
  },
  vic_learner_practice: {
    title: 'VicRoads: Learner Permit Practice Test Online',
    url: 'https://www.vicroads.vic.gov.au/licences/your-ls/get-your-ls/prepare-for-the-learner-permit-test',
    source: 'Transport',
    description: 'Official Victoria practice road rules knowledge test to study before sitting the Learner Permit test at 16.',
  },
  qld_rta: {
    title: 'Residential Tenancies Authority (RTA) Queensland: Rental Bonds',
    url: 'https://www.rta.qld.gov.au/starting-a-tenancy/rental-bond',
    source: 'QLD Government',
    description: 'Official QLD rental bond rules: 4-week maximum bond for rent <=$700/wk and mandatory 10-day lodgement with the RTA.',
  },
  barefoot_teen_buckets: {
    title: 'The Barefoot Investor: 3-Bucket System for Young Earners',
    url: 'https://barefootinvestor.com/',
    source: 'Media',
    description: 'Scott Pape\'s proven 60% Blow, 20% Mojo, and 20% Grow account structure tailored for casual paychecks.',
  },
  boq_future_saver: {
    title: 'Bank of Queensland (BOQ): Future Saver Account (5.80% p.a.)',
    url: 'https://www.boq.com.au/personal/banking/savings-and-term-deposits/future-saver-account',
    source: 'Research',
    description: 'High-interest savings account (up to 5.80% p.a.) where all bonus criteria are automatically waived for 14-17 year olds.',
  },
  anz_plus_save: {
    title: 'ANZ Plus: Growth Saver Account (5.10% p.a.)',
    url: 'https://www.anz.com.au/plus/save/',
    source: 'Research',
    description: 'App-based digital banking with interactive goal buckets and 5.10% bonus interest available from age 15.',
  },
  ato_super_co_contribution: {
    title: 'ATO: Super Co-Contribution for Low Earners ($500 Matching)',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax/super-co-contribution',
    source: 'ATO',
    description: 'Federal Government co-contribution matches 50c per dollar of after-tax super contributions up to $500 for low and middle-income earners.',
  },
  ato_tax_rates: {
    title: 'ATO: Individual Income Tax Rates & Stage 3 Brackets',
    url: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
    source: 'ATO',
    description: 'Official 2026-27 Australian resident individual tax brackets including the $18,200 threshold and 16% lowest bracket.',
  },
  ato_lito: {
    title: 'ATO: Low Income Tax Offset (LITO Up to $700)',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-and-middle-income-earner-tax-offsets',
    source: 'ATO',
    description: 'Full $700 LITO offset for incomes up to $37,500, lifting the effective tax-free threshold to $22,575.',
  },
  ato_deductions_clothing: {
    title: 'ATO: Clothing, Laundry & Work-Related Deductions',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/clothes-and-items-you-wear-at-work/clothing-laundry-and-dry-cleaning-expenses',
    source: 'ATO',
    description: 'Rules for claiming compulsory logo uniforms, $150 laundry allowance without receipts, protective gear, and work-required certificates.',
  },
  qld_licence_steps: {
    title: 'Queensland Government: Getting a Driver Licence (PrepL to Open)',
    url: 'https://www.qld.gov.au/transport/licensing/getting-licence',
    source: 'QLD Government',
    description: 'Official step-by-step roadmap from PrepL at 15.9 to Learner licence at 16, 100 logbook hours, P1, P2, and open licence.',
  },
  qld_hpt: {
    title: 'Queensland Government: Hazard Perception Test (HPT)',
    url: 'https://www.qld.gov.au/transport/licensing/getting-licence/hazard-perception-test',
    source: 'QLD Government',
    description: 'Online test required before booking your practical driving test ($44.15 fee, valid 12 months).',
  },
  qld_getting_licence: {
    title: 'Queensland Government: Graduated Driver Licensing System',
    url: 'https://www.qld.gov.au/transport/licensing/driver-licensing',
    source: 'QLD Government',
    description: 'Complete rules and regulations for Queensland learner and provisional P1/P2 drivers.',
  },
  qld_rego: {
    title: 'Queensland Government: Vehicle Registration & Transfer Duty',
    url: 'https://www.qld.gov.au/transport/registration/fees/cost',
    source: 'QLD Government',
    description: 'Official breakdown of registration fees, traffic improvement fees, and vehicle registration duty in QLD.',
  },
  green_vehicle_guide: {
    title: 'Green Vehicle Guide: Compare EV & Fuel Efficiency',
    url: 'https://www.greenvehicleguide.gov.au',
    source: 'Federal Government',
    description: 'Official Australian Government fuel consumption (L/100km) and EV energy use (kWh/100km) ratings.',
  },
  racq_fuel: {
    title: 'RACQ: Queensland Fuel Prices & Price Cycle',
    url: 'https://www.racq.com.au/car/queensland-fuel-prices',
    source: 'Research',
    description: 'Queensland fuel price comparison and the South East QLD 23-to-28 day price cycle.',
  },
  bcc_parking: {
    title: 'Brisbane City Council: Parking Meters, Zones & Permits',
    url: 'https://www.brisbane.qld.gov.au/traffic-and-transport/parking-in-brisbane/metered-parking',
    source: 'Brisbane City Council',
    description: 'Zones 1–3 on-street parking rates, free 15-minute parking, and weekend/night parking rules.',
  },
  translink_gocard: {
    title: 'Translink: Go Card & Concession Fares',
    url: 'https://translink.com.au/tickets-and-fares/go-card',
    source: 'QLD Government',
    description: 'Translink ticketing, student concession verification, and travel across SEQ.',
  },
  qtac: {
    title: 'QTAC: Queensland Tertiary Admissions Centre',
    url: 'https://www.qtac.edu.au',
    source: 'University',
    description: 'Official portal for university preferences, ATAR scaling, and guaranteed early offer schemes in Queensland.',
  },
  qld_fhog: {
    title: 'Queensland Revenue Office: $30,000 First Home Owner Grant',
    url: 'https://qro.qld.gov.au/property-concessions-grants/first-home-grant/',
    source: 'QLD Government',
    description: 'Up to $30,000 for new homes under $750,000 in Queensland, plus transfer duty exemptions.',
  },
  tafe_qld: {
    title: 'TAFE Queensland: Fee-Free TAFE & Free Apprenticeships Under 25',
    url: 'https://tafeqld.edu.au/courses/apply-and-enrol/subsidised-training/fee-free',
    source: 'QLD Government',
    description: 'Over 40+ tuition-free diploma/cert courses and 130+ free apprenticeships for under 25s.',
  },
  qce_atar: {
    title: 'QCAA: Queensland Certificate of Education (QCE) & Senior Syllabus',
    url: 'https://www.qcaa.qld.edu.au/senior/certificates-and-qualifications/qce',
    source: 'QLD Government',
    description: 'Official 20-credit QCE requirements, core subjects, and ATAR eligibility rules.',
  },
  qut_study: {
    title: 'QUT: Courses, Degrees & Brisbane 2032 Innovation',
    url: 'https://www.qut.edu.au/study',
    source: 'University',
    description: 'Queensland University of Technology degree pathways, CSP fees, and Olympic innovation hubs.',
  },
  qcaa: {
    title: 'QCAA: Queensland Curriculum and Assessment Authority',
    url: 'https://www.qcaa.qld.edu.au',
    source: 'QLD Government',
    description: 'Senior curriculum, subject syllabuses, external assessment, and Academic Integrity course.',
  },
  reviewetf: {
    title: 'ReviewETF: Best Performing ASX ETFs',
    url: 'https://www.reviewetf.com.au/best-etfs',
    source: 'Research',
    description: 'Independent comparison of 500+ ASX ETFs ranked by 1-year returns, MER and fund size.',
  },
  etfinfo: {
    title: 'ASX: ETF Course & Information Hub',
    url: 'https://www.asx.com.au/markets/trade-our-cash-market/asx-investment-products-directory/etfs',
    source: 'ASX',
    description: 'ASX official directory and educational materials for exchange-traded funds.',
  },
  fool_etf_news: {
    title: 'Motley Fool Australia: Top ASX ETFs',
    url: 'https://www.fool.com.au/investing/etfs/',
    source: 'Media',
    description: 'Australian market analysis, ETF trends, and beginner share investing guides.',
  },
  uq_study: {
    title: 'The University of Queensland: Study & Degrees',
    url: 'https://study.uq.edu.au',
    source: 'University',
    description: 'UQ undergraduate programs, Go8 entry ranks, CSP fee bands, and campus life.',
  },
  griffith_study: {
    title: 'Griffith University: Study & Degree Programs',
    url: 'https://www.griffith.edu.au/study',
    source: 'University',
    description: 'Griffith University degrees across South Bank, Nathan, and Gold Coast.',
  },
  unisc_study: {
    title: 'UniSC: University of the Sunshine Coast & Moreton Bay',
    url: 'https://www.unisc.edu.au/study',
    source: 'University',
    description: 'UniSC programs at Sippy Downs, Moreton Bay (Petrie), Caboolture, and Fraser Coast.',
  },
  unisq_study: {
    title: 'UniSQ: University of Southern Queensland (Springfield & Ipswich)',
    url: 'https://www.unisq.edu.au/study',
    source: 'University',
    description: 'UniSQ undergraduate degrees #1 in Australia for graduate starting salaries.',
  },
  acu_study: {
    title: 'ACU: Australian Catholic University (Banyo, Brisbane)',
    url: 'https://www.acu.edu.au/study-at-acu',
    source: 'University',
    description: 'ACU degrees in nursing, paramedicine, education, physiotherapy, and law.',
  },
  cqu_study: {
    title: 'CQUniversity: Brisbane CBD & Regional Queensland',
    url: 'https://www.cqu.edu.au/courses',
    source: 'University',
    description: 'CQU dual-sector university and TAFE pathways with direct industry links.',
  },
  jcu_study: {
    title: 'James Cook University: Brisbane & North Queensland',
    url: 'https://www.jcu.edu.au/courses',
    source: 'University',
    description: 'JCU degrees in marine science, tropical medicine, dentistry, and veterinary science.',
  },
  bond_study: {
    title: 'Bond University: Accelerated 2-Year Degrees (Robina, Gold Coast)',
    url: 'https://bond.edu.au/study',
    source: 'University',
    description: 'Bond University 3-semester per year accelerated bachelor programs and early offers.',
  },
  qilt_survey: {
    title: 'QILT: Quality Indicators for Learning and Teaching',
    url: 'https://www.qilt.edu.au',
    source: 'Research',
    description: 'Official Australian Government survey of graduate salaries, full-time employment, and student satisfaction.',
  },
  qld_boost_to_buy: {
    title: 'Queensland Government: Boost to Buy Shared Equity Scheme',
    url: 'https://www.qld.gov.au/housing/buying-owning-home/financial-help-concessions/boost-to-buy',
    source: 'QLD Government',
    description: 'Queensland Government shared equity scheme helping eligible buyers purchase with a 2% deposit.',
  },
  qld_licence_fees: {
    title: 'Queensland Government: Driver Licensing Fees (2026-27)',
    url: 'https://www.qld.gov.au/transport/licensing/driver-licensing/fees',
    source: 'QLD Government',
    description: 'Statutory fees for PrepL, Learner licences, Hazard Perception Tests, and Provisional licences.',
  },
  qld_practical_test: {
    title: 'Queensland Government: Booking Your Practical Driving Test (Q-SAFE)',
    url: 'https://www.qld.gov.au/transport/licensing/getting-licence/tests/practical-driving-test',
    source: 'QLD Government',
    description: 'How to prepare and book your 30-minute on-road practical driving test with TMR ($71.75 fee).',
  },
  aip_fuel_prices: {
    title: 'Australian Institute of Petroleum (AIP): Weekly Petrol Prices',
    url: 'https://www.aip.com.au/pricing/weekly-petrol-prices',
    source: 'Research',
    description: 'Official national and state terminal gate and retail fuel price data.',
  },
  bcc_council_carparks: {
    title: 'Brisbane City Council: King George Square & Wickham Tce Car Parks',
    url: 'https://www.brisbane.qld.gov.au/traffic-and-transport/parking-in-brisbane/council-car-parks',
    source: 'Brisbane City Council',
    description: 'Official council parking facilities in the Brisbane CBD with night and weekend flat rate specials.',
  },
  // --- ADDITIONAL ATO & SUPERANNUATION SOURCES ---
  ato_lito: {
    title: 'ATO: Low Income Tax Offset (LITO)',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-and-middle-income-earner-tax-offsets',
    source: 'ATO',
    description: 'Low Income Tax Offset entitlement up to $700, effectively raising the effective tax-free threshold to $22,575.',
  },
  ato_non_lodgment: {
    title: 'ATO: Non-Lodgment Advice Form (NAT 2586)',
    url: 'https://www.ato.gov.au/individuals-and-families/your-tax-return/how-to-lodge-your-tax-return/lodge-a-non-lodgment-advice',
    source: 'ATO',
    formCode: 'NAT 2586',
    description: 'Official procedure to notify the ATO if you earned under $18,200 with zero tax withheld.',
  },
  ato_stapled_super: {
    title: 'ATO: Stapled Super Funds Explained',
    url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-contributions/super-guidance-for-employers/request-stapled-super-fund-details-for-employees',
    source: 'ATO',
    description: 'Rules preventing duplicate default super accounts by linking a worker to their existing stapled fund upon job change.',
  },
  ato_super_co_contribution: {
    title: 'ATO: Super Co-Contribution Scheme for Low Earners',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax/super-co-contribution',
    source: 'ATO',
    description: 'Australian Government matching contribution of up to $500 for eligible after-tax non-concessional personal contributions.',
  },
  ato_fhsss: {
    title: 'ATO: First Home Super Saver Scheme (FHSSS)',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/withdrawing-and-using-your-super/first-home-super-saver-scheme',
    source: 'ATO',
    description: 'Voluntary salary sacrifice super scheme allowing first home buyers to save up to $50,000 inside low-tax super.',
  },
  ato_deductions_clothing: {
    title: 'ATO: Work Clothing, Shoes & Laundry Expenses',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/clothes-and-items-you-wear-at-work/clothing-laundry-and-dry-cleaning-expenses',
    source: 'ATO',
    description: 'Allowable deductions for occupation-specific clothing, logo uniforms, protective gear, and $150 laundry allowance without receipts.',
  },
  ato_deductions_wfh: {
    title: 'ATO: Working from Home Fixed Rate Deductions',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/working-from-home-expenses',
    source: 'ATO',
    description: 'Fixed rate method (67c per hour) covering electricity, gas, internet, mobile phone usage, and stationery.',
  },
  ato_deductions_study: {
    title: 'ATO: Self-Education and Study Expenses',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/education-and-study-expenses',
    source: 'ATO',
    description: 'Eligibility criteria for claiming courses and certifications directly connected to earning current employment income.',
  },
  ato_deductions_travel: {
    title: 'ATO: Vehicle and Travel Expenses Deductions',
    url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/vehicle-and-travel-expenses',
    source: 'ATO',
    description: 'Cents per kilometre and logbook methods for claiming work-related travel between separate workplaces.',
  },
  ato_abn_apply: {
    title: 'ATO / ABR: Applying for an Australian Business Number (ABN)',
    url: 'https://www.abr.gov.au/business-super-funds-charities/applying-abn',
    source: 'ATO',
    description: 'Free online registration for sole traders, freelancers, and independent contractors starting commercial activities.',
  },
  ato_contractor_vs_employee: {
    title: 'ATO: Employee vs Independent Contractor Decision Tool',
    url: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/employee-or-independent-contractor',
    source: 'ATO',
    description: 'Guidelines determining legal status, super entitlements, and worker protections to prevent sham contracting.',
  },
  ato_study_loans: {
    title: 'ATO: Study and Training Support Loans Repayment Guidelines',
    url: 'https://www.ato.gov.au/individuals-and-families/study-and-training-support-loans',
    source: 'ATO',
    description: 'Income-contingent repayment thresholds, compulsory withholding schedules, and indexation rules for HELP/HECS debts.',
  },

  // --- ADDITIONAL FAIR WORK OMBUDSMAN SOURCES ---
  fairwork_minimum_shifts: {
    title: 'Fair Work: Minimum Shift Engagement Periods',
    url: 'https://www.fairwork.gov.au/starting-employment/types-of-employees/casual-employees',
    source: 'Fair Work',
    description: 'Standard minimum call-out hours (typically 2 or 3 hours) ensuring casuals are compensated for rostered time.',
  },
  fairwork_breaks: {
    title: 'Fair Work Ombudsman: Rest Pauses and Meal Breaks',
    url: 'https://www.fairwork.gov.au/employment-conditions/hours-of-work-breaks-and-rosters/breaks',
    source: 'Fair Work',
    description: 'Statutory requirements: paid 10-minute rest breaks for 4+ hours work and unpaid 30-60 minute lunch breaks for 5+ hours.',
  },
  fairwork_penalty_rates: {
    title: 'Fair Work: Penalty Rates & Public Holiday Pay',
    url: 'https://www.fairwork.gov.au/pay-and-wages/penalty-rates-and-allowances',
    source: 'Fair Work',
    description: 'Overtime and penalty multiplier percentages for Saturday, Sunday, late-night shifts, and public holiday work.',
  },
  fairwork_dispute: {
    title: 'Fair Work Ombudsman: Reporting Underpayment & Workplace Disputes',
    url: 'https://www.fairwork.gov.au/workplace-problems/common-workplace-issues/resolving-workplace-issues',
    source: 'Fair Work',
    description: 'Step-by-step tools and anonymous reporting pathways for unpaid wages, sham contracting, and bullying.',
  },
  fairwork_children_services_award: {
    title: 'Fair Work: Children\'s Services Award 2010 [MA000120]',
    url: 'https://www.fairwork.gov.au/employment-conditions/awards/awards-summary/ma000120-summary',
    source: 'Fair Work',
    description: 'Award rates for early childhood, after school care (OSHC), and junior support workers (Under 17 = 70%, 19 = 100%).',
  },
  fairwork_storage_wholesale_award: {
    title: 'Fair Work: Storage Services and Wholesale Award 2020 [MA000084]',
    url: 'https://www.fairwork.gov.au/employment-conditions/awards/awards-summary/ma000084-summary',
    source: 'Fair Work',
    description: 'Junior wage rates and conditions for warehouse, wholesale distribution, and logistics pick-pack workers.',
  },

  // --- ADDITIONAL SERVICES AUSTRALIA SOURCES ---
  services_australia_youth_jobseeker: {
    title: 'Services Australia: Youth Allowance for Job Seekers',
    url: 'https://www.servicesaustralia.gov.au/youth-allowance-for-job-seekers',
    source: 'Services Australia',
    description: 'Income support for young jobseekers aged 16 to 21 looking for work or undertaking approved employment activities.',
  },
  services_australia_abstudy: {
    title: 'Services Australia: ABSTUDY Supporting Indigenous Students',
    url: 'https://www.servicesaustralia.gov.au/abstudy',
    source: 'Services Australia',
    description: 'Living allowance, travel assistance, and schooling support for Aboriginal and Torres Strait Islander students.',
  },
  services_australia_start_up_loan: {
    title: 'Services Australia: Student Start-up Loan ($1,349/semester)',
    url: 'https://www.servicesaustralia.gov.au/student-start-up-loan',
    source: 'Services Australia',
    description: 'Voluntary income-contingent HELP loan to help higher education students buy textbooks, laptops, and study materials.',
  },
  services_australia_relocation: {
    title: 'Services Australia: Relocation Scholarship',
    url: 'https://www.servicesaustralia.gov.au/relocation-scholarship',
    source: 'Services Australia',
    description: 'Annual payment helping regional and remote students moving to study higher education at metropolitan universities.',
  },
  services_australia_tap: {
    title: 'Services Australia: Tertiary Access Payment (TAP)',
    url: 'https://www.servicesaustralia.gov.au/tertiary-access-payment',
    source: 'Services Australia',
    description: 'One-off payment up to $5,000 assisting outer regional and remote students with costs of relocating for study.',
  },
  services_australia_rent_assistance: {
    title: 'Services Australia: Commonwealth Rent Assistance',
    url: 'https://www.servicesaustralia.gov.au/rent-assistance',
    source: 'Services Australia',
    description: 'Supplementary payment helping young renters on Centrelink payments meet private rental or boarding house costs.',
  },
  services_australia_income_bank: {
    title: 'Services Australia: Student Income Bank ($13,500 Cap)',
    url: 'https://www.servicesaustralia.gov.au/income-bank',
    source: 'Services Australia',
    description: 'Mechanism allowing students to accumulate unused fortnight income-free credits to work holiday shifts without losing benefits.',
  },
  services_australia_reporting: {
    title: 'Services Australia: How to Report Employment Income',
    url: 'https://www.servicesaustralia.gov.au/how-to-report-your-employment-income',
    source: 'Services Australia',
    description: 'Official procedure for reporting gross fortnightly earnings and hours worked via myGov or the Express Plus app.',
  },
  services_australia_health_care_card: {
    title: 'Services Australia: Low Income Health Care Card',
    url: 'https://www.servicesaustralia.gov.au/low-income-health-care-card',
    source: 'Services Australia',
    description: 'Concession card providing cheaper PBS prescriptions, medical subsidies, and discounted state utility services.',
  },
  services_australia_ms011: {
    title: 'Services Australia: Form MS011 (Medicare Card Transfer / Copy)',
    url: 'https://www.servicesaustralia.gov.au/ms011',
    source: 'Services Australia',
    formCode: 'MS011',
    description: 'Application to transfer or copy to your own green Medicare card at age 15 without requiring parental consent.',
  },
  services_australia_ms004: {
    title: 'Services Australia: Form MS004 (Medicare Enrolment Application)',
    url: 'https://www.servicesaustralia.gov.au/ms004',
    source: 'Services Australia',
    formCode: 'MS004',
    description: 'First-time Medicare enrolment application form for individuals and permanent residents.',
  },

  // --- ADDITIONAL PRUDENTIAL & CONSUMER REGULATORS ---
  apra_adi_register: {
    title: 'APRA: Register of Authorized Deposit-taking Institutions (ADIs)',
    url: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions',
    source: 'APRA',
    description: 'Official government directory verifying licensed banks, credit unions, and building societies covered by the FCS.',
  },
  apra_super_heatmap: {
    title: 'APRA: Superannuation Fund Performance Heatmaps',
    url: 'https://www.apra.gov.au/superannuation-heatmaps',
    source: 'APRA',
    description: 'Prudential regulator assessment comparing fees, net investment returns, and sustainability across Australian super funds.',
  },
  accc_gift_cards: {
    title: 'ACCC: Mandatory 3-Year Expiry Rules for Gift Cards',
    url: 'https://www.accc.gov.au/consumers/payment-methods/gift-cards',
    source: 'ACCC',
    description: 'Federal law requiring all gift cards and vouchers sold in Australia to carry a minimum validity of three years.',
  },
  worksafe_qld: {
    title: 'WorkSafe Queensland: Young Worker Safety & Workers Compensation',
    url: 'https://www.worksafe.qld.gov.au/',
    source: 'SafeWork',
    description: 'Queensland WorkCover claims, injury support, incident reporting, and mandatory safety guidelines for apprentices and casuals.',
  },

  // --- STATE CHILD EMPLOYMENT REGULATORS & PERMITS ---
  qld_form1_consent: {
    title: 'Business Queensland: Parent\'s Consent Form for Child Employment (Form 1)',
    url: 'https://www.business.qld.gov.au/running-business/employing/child-employment/forms',
    source: 'QLD Government',
    formCode: 'Form 1',
    description: 'Mandatory Queensland consent form required for workers under 16 documenting capped hours and school hours.',
  },
  vic_child_employment: {
    title: 'Workforce Inspectorate Victoria: Child Employment Standards',
    url: 'https://www.vic.gov.au/child-employment',
    source: 'Research',
    description: 'Victorian child employment regulations: under-15 licensing requirements and lifting of restrictions at age 15.',
  },
  nsw_child_employment: {
    title: 'NSW Office of the Children\'s Guardian: Child Employment Standards',
    url: 'https://ocg.nsw.gov.au/child-safe-scheme',
    source: 'Research',
    description: 'NSW regulation of child employment, entertainment codes of practice, and young worker guidelines.',
  },
  wa_child_employment: {
    title: 'DEMIRS Wageline: Child Employment Laws in Western Australia',
    url: 'https://www.commerce.wa.gov.au/wageline/child-employment-laws-western-australia',
    source: 'Research',
    description: 'WA statutory working hours, written parental permission for 13-14 year olds, and age 15 workforce transition.',
  },
  sa_child_employment: {
    title: 'SafeWork SA: Young Workers and Schooling Protections',
    url: 'https://www.safework.sa.gov.au/',
    source: 'SafeWork',
    description: 'South Australian laws under Education Act 2019 s 74 banning work during school hours or work causing school fatigue.',
  },
  tas_child_employment: {
    title: 'WorkSafe Tasmania: Young Workers Safety & Attendance',
    url: 'https://www.worksafe.tas.gov.au/',
    source: 'SafeWork',
    description: 'Tasmanian workplace health and safety and compulsory education standards for secondary students.',
  },
  act_child_employment: {
    title: 'ACT Community Services: Child & Young People Employment Standards',
    url: 'https://www.act.gov.au/community/children-and-families/child-employment',
    source: 'Research',
    description: 'ACT Children and Young People Act 2008: 10 hr/wk light work limit for under-15s and young person rights at 15-17.',
  },
  nt_child_employment: {
    title: 'NT Government: Child Employment Rules & Night Work Curfew',
    url: 'https://nt.gov.au/employ/money-and-conditions/child-employment',
    source: 'Research',
    description: 'Care and Protection of Children Act 2007: 10pm-6am curfew for under-15s and full-time work eligibility at 15 with Year 10.',
  },

  // --- HIGH-INTEREST YOUTH SAVINGS ACCOUNTS ---
  boq_future_saver: {
    title: 'BOQ: Future Saver Account (5.80% p.a. for Ages 14–35)',
    url: 'https://www.boq.com.au/personal/banking/savings-and-term-deposits/future-saver-account',
    source: 'Bank',
    description: 'Market-leading youth savings rate (5.80% p.a. up to $50k) with deposit and card hurdles automatically WAIVED for ages 14–17.',
  },
  newcastle_permanent_saver: {
    title: 'Newcastle Permanent: Smart Saver Account Under 25s (5.75% p.a.)',
    url: 'https://www.newcastlepermanent.com.au/personal-banking/savings-accounts/smart-saver',
    source: 'Bank',
    description: 'High-interest youth account paying 5.75% p.a. up to $50k with simple monthly balance growth and max 2 withdrawals.',
  },
  great_southern_youth: {
    title: 'Great Southern Bank: Youth eSaver Account (5.50% p.a.)',
    url: 'https://www.greatsouthernbank.com.au/bank-accounts/savings-accounts/youth-esaver',
    source: 'Bank',
    description: 'Flat 5.50% p.a. condition-free starter savings account on balances up to $5,000 for savers aged 10–17.',
  },
  ing_savings_maximiser: {
    title: 'ING: Savings Maximiser (5.50% p.a.)',
    url: 'https://www.ing.com.au/savings/savings-maximiser.html',
    source: 'Bank',
    description: 'High $100k balance limit paying 5.50% p.a. for teens aged 15+ meeting external deposit and 5 card purchase criteria.',
  },
  amp_go_save: {
    title: 'AMP Bank: GO Save Account (5.25% p.a.)',
    url: 'https://www.amp.com.au/banking/savings-accounts/go-save',
    source: 'Bank',
    description: 'Flat unconditional 5.25% p.a. savings rate up to $50,000 with up to 99 customizable savings spaces.',
  },
  anz_plus_growth: {
    title: 'ANZ Plus: Growth Saver Account (5.10% p.a.)',
    url: 'https://www.anz.com.au/plus/growth-saver/',
    source: 'Bank',
    description: 'Smart mobile app savings account for ages 15+ paying 5.10% p.a. up to $250k with $100/mo net growth hurdle.',
  },
  westpac_bump_saver: {
    title: 'Westpac: Bump Savings Account (5.05% p.a.)',
    url: 'https://www.westpac.com.au/personal-banking/bank-accounts/savings-accounts/bump/',
    source: 'Bank',
    description: 'Youth savings account for ages 0–17 paying 5.05% p.a. with 1.75% base rate protection and Smart ATM cash deposits.',
  },
  cba_youthsaver: {
    title: 'CommBank: Youthsaver Account (5.05% p.a.)',
    url: 'https://www.commbank.com.au/banking/youthsaver.html',
    source: 'Bank',
    description: 'Leading teen savings account paying 5.05% p.a. up to $50k with 2.15% base rate and NameCheck anti-scam verification.',
  },
  up_bank_saver: {
    title: 'Up Bank: Saver Account (5.00% p.a.)',
    url: 'https://up.com.au/features/savers/',
    source: 'Bank',
    description: 'Next-gen digital banking for ages 16+ paying 5.00% p.a. with automated roundups and 5 monthly debit purchases.',
  },
  macquarie_savings: {
    title: 'Macquarie Bank: Savings & Everyday Transaction Account (5.00% p.a.)',
    url: 'https://www.macquarie.com.au/everyday-banking/savings-account.html',
    source: 'Bank',
    description: 'Zero conditions: earns 5.00% p.a. on both savings and everyday transaction account with refunds on all domestic ATM fees.',
  },

  // --- FINANCIAL COUNSELLING & CREDIT REPORTING ---
  national_debt_helpline: {
    title: 'National Debt Helpline: Free Financial Counselling (1800 007 007)',
    url: 'https://ndh.org.au/',
    source: 'Community',
    description: 'Free, confidential Australian government-funded financial counselling service for anyone struggling with debt.',
  },
  afca_dispute: {
    title: 'Australian Financial Complaints Authority (AFCA)',
    url: 'https://www.afca.org.au/',
    source: 'Legal',
    description: 'Free, independent ombudsman resolving disputes between consumers and banks, insurers, and credit providers.',
  },
  equifax_credit_report: {
    title: 'Equifax Australia: Free Annual Credit Report Access',
    url: 'https://www.equifax.com.au/personal/products/free-credit-report',
    source: 'Research',
    description: 'Access your statutory free credit report from Australia\'s largest credit reporting bureau under the Privacy Act.',
  },
  experian_credit_report: {
    title: 'Experian Australia: Free Credit Score & Report Check',
    url: 'https://www.experian.com.au/consumer/free-credit-report',
    source: 'Research',
    description: 'Official portal to review your Comprehensive Credit Reporting (CCR) score and repayment history information.',
  },
  illion_credit_report: {
    title: 'illion: Free Credit Check Australia',
    url: 'https://www.illion.com.au/personal/credit-check/',
    source: 'Research',
    description: 'Check your credit rating and verify whether any default listings or credit inquiries are recorded in your name.',
  },

  // --- RESERVE BANK & MACROECONOMIC DATA ---
  rba_cash_rate: {
    title: 'Reserve Bank of Australia: Cash Rate Target Decisions',
    url: 'https://www.rba.gov.au/monetary-policy/cash-rate-target.html',
    source: 'Reserve Bank',
    description: 'Official RBA board decisions on the monetary policy cash rate target and policy statements.',
  },
  rba_inflation_calc: {
    title: 'Reserve Bank of Australia: Inflation Calculator',
    url: 'https://www.rba.gov.au/calculator/',
    source: 'Reserve Bank',
    description: 'Official purchasing power calculator measuring changes in Australian prices using the Consumer Price Index (CPI).',
  },
  rba_education: {
    title: 'Reserve Bank of Australia: High School Economics & Finance Hub',
    url: 'https://www.rba.gov.au/education/',
    source: 'Reserve Bank',
    description: 'Curriculum resources, economic explainers, monetary policy guides, and student video presentations.',
  },
  rba_surcharges: {
    title: 'Reserve Bank of Australia: Card Surcharges & Payment Rules',
    url: 'https://www.rba.gov.au/payments-and-infrastructure/review-of-card-payments-regulation/q-and-a/card-payments-regulation.html',
    source: 'Reserve Bank',
    description: 'Consumer protections preventing excessive merchant surcharges on debit and credit card tap-and-pay transactions.',
  },

  // --- QUEENSLAND SENIOR CURRICULUM & ADMISSIONS ---
  qcaa_qce: {
    title: 'QCAA: Queensland Certificate of Education (QCE) Requirements',
    url: 'https://www.qcaa.qld.edu.au/senior/certificates-and-qualifications/qce',
    source: 'QLD Government',
    description: 'Official 20-credit criteria: core requirements, literacy/numeracy competencies, and qualifying learning options.',
  },
  qcaa_senior_syllabuses: {
    title: 'QCAA: Senior General and Applied Subject Syllabuses',
    url: 'https://www.qcaa.qld.edu.au/senior/senior-subjects',
    source: 'QLD Government',
    description: 'Syllabus specifications, unit objectives, and assessment standards for General and Applied Year 11-12 subjects.',
  },
  qcaa_external_assessment: {
    title: 'QCAA: External Assessment Rules & Timetables',
    url: 'https://www.qcaa.qld.edu.au/senior/assessment/external-assessment',
    source: 'QLD Government',
    description: 'Exam conditions, approved calculators, timetable releases, and past papers for Year 12 external assessments.',
  },
  qcaa_academic_integrity: {
    title: 'QCAA: Academic Integrity Course for Senior Students',
    url: 'https://www.qcaa.qld.edu.au/senior/assessment/academic-integrity',
    source: 'QLD Government',
    description: 'Mandatory principles of citation, avoiding plagiarism, and ethical use of generative AI in secondary assessment tasks.',
  },
  qtac_atar: {
    title: 'QTAC: ATAR Calculation and Subject Scaling Principles',
    url: 'https://www.qtac.edu.au/atar',
    source: 'University',
    description: 'Official explanation of how 5 General subjects (or 4 General + 1 Applied/Cert III) scale to produce a percentile ranking out of 99.95.',
  },
  qtac_eas: {
    title: 'QTAC: Educational Access Scheme (EAS) Adjustment Factors',
    url: 'https://www.qtac.edu.au/educational-access-scheme',
    source: 'University',
    description: 'Up to 10 adjustment points for students facing financial hardship, home illness, school disruption, or regional disadvantage.',
  },
  qtac_preferences: {
    title: 'QTAC: How Preference Lists and Offer Rounds Work',
    url: 'https://www.qtac.edu.au/applications/preferencing',
    source: 'University',
    description: 'Strategic guide on ordering up to 6 preferences, major December/January offer rounds, and responding to tertiary offers.',
  },

  // --- QUEENSLAND SCHOLARSHIPS & TAFE PATHWAYS ---
  uq_scholarships: {
    title: 'The University of Queensland: Scholarships & UQ Link Support',
    url: 'https://scholarships.uq.edu.au/',
    source: 'University',
    description: 'Merit-based scholarships, rural relocation grants, and UQ Link equity scheme providing financial bursaries.',
  },
  qut_equity_scholarships: {
    title: 'QUT: Equity Scholarships & Educational Support',
    url: 'https://www.qut.edu.au/study/fees-and-scholarships/scholarships/equity-scholarships-scheme',
    source: 'University',
    description: 'QUT bursaries assisting students experiencing financial hardship with textbook allowances, laptops, and living stipends.',
  },
  griffith_scholarships: {
    title: 'Griffith University: Scholarships and Academic Bursaries',
    url: 'https://www.griffith.edu.au/apply/scholarships',
    source: 'University',
    description: 'Over 600 undergraduate scholarships supporting first-in-family learners, Indigenous students, and academic excellence.',
  },
  tafe_qld_fee_free: {
    title: 'TAFE Queensland: Fee-Free TAFE Training in Queensland',
    url: 'https://tafeqld.edu.au/courses/apply-and-enrol/subsidised-training/fee-free',
    source: 'QLD Government',
    description: 'Fully subsidized certificate and diploma programs in healthcare, IT, childcare, engineering, and renewable energy.',
  },
  tafe_qld_free_apprenticeships: {
    title: 'TAFE Queensland: Free Apprenticeships for Under 25s',
    url: 'https://tafeqld.edu.au/courses/apply-and-enrol/subsidised-training/free-apprenticeships-under-25',
    source: 'QLD Government',
    description: '100% government-funded training for eligible Queenslanders aged under 25 in priority trade apprenticeships.',
  },
  github_student_pack: {
    title: 'GitHub: Student Developer Pack Free Tools ($1,000+ Value)',
    url: 'https://education.github.com/pack',
    source: 'Student Discount',
    description: 'Free access to GitHub Pro, cloud hosting credits, domain names, and developer software tools for high school and uni students.',
  },
};

/**
 * Junior Award Percentage Rates under Modern Awards (2026-27).
 * Adult base rates reflect the 2026-27 Fair Work Commission Annual Wage Review (from 1 July 2026).
 * From 1 December 2026 the FWC ([2026] FWCFB 75) phases 18-20s up to the full adult rate
 * after 6 months with the same employer (Retail, Fast Food & Pharmacy awards). Under-18 rates are unchanged.
 */
export const JUNIOR_AWARD_RATES = {
  fast_food: {
    code: 'MA000003',
    name: 'Fast Food Industry Award 2020 [MA000003]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $11.12/hr (Casual: $13.90/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months with employer)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: '3-hour minimum shift for casuals. 25% casual loading. Saturday: 125% perm / 150% casual; Sunday Level 1: 150%; Public Holiday: 250% casual.',
  },
  retail: {
    code: 'MA000004',
    name: 'General Retail Industry Award 2020 [MA000004]',
    adultBaseRate: 27.81, // Level 1, 2026-27 ($1,056.80/wk)
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr (Casual: $15.64/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months with employer)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Junior rates apply to Levels 1–3 only; Levels 4+ always adult rate. 3-hour minimum shift. Saturday: 150% casual; Sunday: 175% casual; Public Holiday: 250% casual.',
  },
  restaurant: {
    code: 'MA000119',
    name: 'Restaurant Industry Award 2020 [MA000119]',
    adultBaseRate: 26.44, // Level 1 Introductory / Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: '2-hour minimum shift for casuals. Saturday: 150% casual; Sunday (Intro–Level 2): 150% casual (Level 3+: 175%); Public Holiday: 250% casual.',
  },
  hospitality: {
    code: 'MA000009',
    name: 'Hospitality Industry (General) Award 2020 [MA000009]',
    adultBaseRate: 26.44, // Level 1 Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: '2-hour minimum shift for casuals. Saturday: 150% casual; Sunday: 175% casual; Public Holiday: 250% casual.',
  },
  clubs: {
    code: 'MA000058',
    name: 'Registered and Licensed Clubs Award 2020 [MA000058]',
    adultBaseRate: 26.44, // Level 1 Adult Base 2026-27
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate — $13.22/hr (Casual: $16.53/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $15.86/hr (Casual: $19.83/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.51/hr (Casual: $23.14/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $22.47/hr (Casual: $28.09/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $26.44/hr (Casual: $33.05/hr)' },
    ],
    note: 'Liquor service exception: juniors serving liquor MUST be paid 100% full adult rate regardless of age. 2-hour minimum casual shift.',
  },
  pharmacy: {
    code: 'MA000012',
    name: 'Community Pharmacy Award 2020 [MA000012]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr (Casual: $15.64/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Junior rates apply to Levels 1–2 only. Sunday work attracts a high 200% perm / 225% casual multiplier.',
  },
  fitness: {
    code: 'MA000094',
    name: 'Fitness Industry Award 2020 [MA000094]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 17', pct: 0.55, label: '55% of Adult Rate — $15.30/hr (Casual: $19.13/hr)' },
      { age: '17 years', pct: 0.65, label: '65% of Adult Rate — $18.08/hr (Casual: $22.60/hr)' },
      { age: '18 years', pct: 0.75, label: '75% of Adult Rate — $20.86/hr (Casual: $26.08/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $23.64/hr (Casual: $29.55/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: '3-hour minimum shift for casuals. Pool lifeguards, gym instructors and reception staff.',
  },
  hair_beauty: {
    code: 'MA000005',
    name: 'Hair and Beauty Industry Award 2020 [MA000005]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $11.12/hr (Casual: $13.90/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr (Casual: $17.39/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr (Casual: $20.86/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate — $25.03/hr (Casual: $31.29/hr)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Salon assistants and junior styling crew. 3-hour minimum shift for casuals.',
  },
  cleaning: {
    code: 'MA000022',
    name: 'Cleaning Services Award 2020 [MA000022]',
    adultBaseRate: 27.81, // Full adult rate applies to standard cleaners regardless of age!
    rates: [
      { age: 'Under 16 (General Cleaner)', pct: 1.00, label: '100% Adult Rate — $27.81/hr (No Junior Scale for Cleaners!)' },
      { age: '16–20 years (General Cleaner)', pct: 1.00, label: '100% Adult Rate — $27.81/hr (Casual: $34.76/hr)' },
      { age: 'Under 16 (Trolley Collector)', pct: 0.50, label: '50% — $13.91/hr (Shopping Trolley Collection only)' },
      { age: '16–17 (Trolley Collector)', pct: 0.60, label: '60% — $16.69/hr (Shopping Trolley Collection only)' },
      { age: '18+ (Trolley Collector)', pct: 1.00, label: '100% Adult Rate — $27.81/hr' },
    ],
    note: 'IMPORTANT: General cleaning staff have NO junior rates — any teen working as a cleaner receives 100% full adult wages ($27.81/hr base / $34.76/hr casual)!',
  },
  amusement: {
    code: 'MA000080',
    name: 'Amusement, Events and Recreation Award 2020 [MA000080]',
    adultBaseRate: 27.81, // Grade 1, 2026-27
    rates: [
      { age: 'Under 17', pct: 0.55, label: '55% of Adult Rate — $15.30/hr (Casual: $19.13/hr)' },
      { age: '17 years', pct: 0.65, label: '65% of Adult Rate — $18.08/hr (Casual: $22.60/hr)' },
      { age: '18 years', pct: 0.75, label: '75% of Adult Rate — $20.86/hr (Casual: $26.08/hr)' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate — $23.64/hr (Casual: $29.55/hr)' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'Theme parks, sports stadiums, bowling alleys, and entertainment centers. 3-hour minimum casual shift.',
  },
  children_services: {
    code: 'MA000120',
    name: 'Children\'s Services Award 2010 [MA000120]',
    adultBaseRate: 27.81, // Support Worker Level 1 (2026-27)
    rates: [
      { age: 'Under 17', pct: 0.70, label: '70% of Adult Rate — $19.47/hr (Casual: $24.34/hr)' },
      { age: '17 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr (Casual: $27.81/hr)' },
      { age: '18 years', pct: 0.90, label: '90% of Adult Rate — $25.03/hr (Casual: $31.29/hr)' },
      { age: '19+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr (Casual: $34.76/hr)' },
    ],
    note: 'After school care (OSHC) assistants, holiday camp leaders, and junior childcare support staff. 2-hour minimum casual shift.',
  },
  storage_wholesale: {
    code: 'MA000084',
    name: 'Storage Services and Wholesale Award 2020 [MA000084]',
    adultBaseRate: 27.08, // Storeworker Grade 1 (2026-27)
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $10.83/hr (Casual: $13.54/hr)' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.54/hr (Casual: $16.93/hr)' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.25/hr (Casual: $20.31/hr)' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $18.96/hr (Casual: $23.70/hr)' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $21.66/hr (Casual: $27.08/hr)' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate — $24.37/hr (Casual: $30.46/hr)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.08/hr (Casual: $33.85/hr)' },
    ],
    note: 'Warehouse junior storeworkers, order picking, and wholesale logistics assistants. 4-hour minimum casual shift.',
  },
};

/** Penalty Rate Multipliers under Australian Awards */
export const PENALTY_RATES = {
  ordinary: { label: 'Ordinary Weekday Shift', multiplier: 1.00, icon: '📅' },
  saturday: { label: 'Saturday Shift (+25% to +50%)', multiplier: 1.25, icon: '⚡️' },
  sunday: { label: 'Sunday Shift (+50% to +75%)', multiplier: 1.50, icon: '🔥' },
  public_holiday_perm: { label: 'Public Holiday (permanent, 225%–250% total)', multiplier: 2.50, icon: '🎉' },
  public_holiday_casual: { label: 'Public Holiday (casual, 250%–275% incl. loading)', multiplier: 2.75, icon: '🎉' },
  night_shift: { label: 'Night / Evening Loading (+15%)', multiplier: 1.15, icon: '🌙' },
};

/** Allowances (indexed 1 July 2026 — award-specific, check PACT) */
export const WORKPLACE_ALLOWANCES = {
  mealAllowance: 18.15,
  uniformAllowancePerShift: 1.85,
  travelAllowancePerKm: 0.98,
};

/** Car Cost Defaults for 16-20yo Drivers (QLD 2026-27, source: qld.gov.au / RACQ) */
export const TEEN_CAR_COST_DEFAULTS = {
  averagePurchasePrice: 4500,
  ppsrCheckFee: 2.00,                      // Official PPSR register check at ppsr.gov.au
  qldTransferFee: 33.10,                   // TMR vehicle title transfer fee
  qldStampDutyPer100: 3.00,                // 1-4 cyl/hybrid/EV ($3 per $100 dutiable value)
  regoAnnual: 453.00,                      // QLD 4-cyl: rego $385.45 + traffic improvement fee $67.25 (1 Jul 2026)
  ctpGreenSlipAnnual: 418.00,              // QLD CTP Class 1 scheme average ($411.80-$424.80, 2026-27)
  comprehensiveInsuranceUnder25: 1650.00,  // Under-25 young driver comprehensive policy avg ($1,400-$2,000)
  thirdPartyPropertyUnder25: 520.00,       // Third-party property damage only (for low-value cash cars)
  fuelWeekly: 47.50,                       // ~$45-$55/wk based on ~13,500km/yr at 6.8L/100km @ $1.97/L
  servicingAnnual: 450.00,                 // Annual logbook minor service + fluid changes
  tiresAndRepairsAnnual: 350.00,           // Tyres ($400-$600 set amortised over 3-4 yrs) + minor repairs
  roadsideAssistanceAnnual: 125.00,        // RACQ Standard Roadside Cover
};

/** High Yield Teen Savings Account Comparison (2026-27 verified rates) */
export const TEEN_SAVINGS_ACCOUNTS = [
  {
    bank: 'BOQ Future Saver (Under 18 Waiver)',
    maxRate: 5.80,
    baseRate: 0.05,
    conditions: 'Criteria WAIVED for ages 14–17! Automatic 5.80% p.a. without deposit or card transaction hurdles up to $50,000.',
    maxAge: 35,
    minAge: 14,
    bestFor: 'Top rate for 14–17 year olds with >$5k wanting zero monthly hurdles',
  },
  {
    bank: 'Newcastle Permanent Smart Saver (Under 25s)',
    maxRate: 5.75,
    baseRate: 0.05,
    conditions: 'Grow balance by any amount + ≤2 withdrawals per calendar month (up to $50k)',
    maxAge: 25,
    minAge: 0,
    bestFor: 'Highest rate under 25 with simple monthly growth hurdle',
  },
  {
    bank: 'Great Southern Bank Youth eSaver',
    maxRate: 5.50,
    baseRate: 5.50,
    conditions: '100% condition-free: flat 5.50% p.a. on balances up to $5,000 (1.00% above $5k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Best starter account for balances up to $5,000 with 0 conditions',
  },
  {
    bank: 'ING Savings Maximiser (Orange Everyday Youth)',
    maxRate: 5.50,
    baseRate: 0.05,
    conditions: 'Deposit $1,000+ from external bank + 5 settled card purchases + grow balance (up to $100k)',
    maxAge: 99,
    minAge: 15,
    bestFor: 'High $100k balance limit for working teens with regular paychecks',
  },
  {
    bank: 'AMP Bank GO Save (No Conditions)',
    maxRate: 5.25,
    baseRate: 5.25,
    conditions: 'Zero conditions — flat unconditional ongoing rate up to $50,000',
    maxAge: 99,
    minAge: 13,
    bestFor: 'Unconditional rate for balances between $5k and $50k',
  },
  {
    bank: 'ANZ Plus (Growth Saver)',
    maxRate: 5.10,
    baseRate: 0.10,
    conditions: 'Grow balance by $100+ in the calendar month (excluding interest) on balances up to $250k',
    maxAge: 99,
    minAge: 15,
    bestFor: 'Visual multi-goal savers, automatic round-ups, and modern app UX',
  },
  {
    bank: 'Westpac Bump Savings',
    maxRate: 5.05,
    baseRate: 1.75,
    conditions: 'Grow balance each month + 1 deposit, balance >$0 (3.30% bonus, up to $30k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Big Four bank branch access, cash deposit Smart ATMs, 1.75% base rate',
  },
  {
    bank: 'CommBank Youthsaver',
    maxRate: 5.05,
    baseRate: 2.15,
    conditions: 'Deposit ≥$0.01 and ensure closing balance is higher than opening balance (up to $50k)',
    maxAge: 17,
    minAge: 0,
    bestFor: 'Australia’s #1 teen banking app with NameCheck scam protection',
  },
  {
    bank: 'Up Bank (Savers)',
    maxRate: 5.00,
    baseRate: 1.50,
    conditions: 'Make 5 settled purchases per month using Up debit card or digital wallet (balances up to $50k across all Savers)',
    maxAge: 99,
    minAge: 16,
    bestFor: 'Ages 16+ wanting automated round-ups, custom save targets, and gamified app design',
  },
  {
    bank: 'Macquarie Bank Savings Account',
    maxRate: 5.00,
    baseRate: 5.00,
    conditions: 'Zero conditions — flat 5.00% ongoing (5.35% 4-mo welcome). Earns 5.00% on everyday spending balance too!',
    maxAge: 99,
    minAge: 12,
    bestFor: 'Earn 5.00% on spending account, $0 international fees, refunds all domestic ATM fees',
  },
];

/**
 * Australian State & Territory Working Age & School Hours Rules for 15-Year-Olds.
 * Sources: Fair Work Ombudsman, State Child Employment Acts across all 8 jurisdictions.
 */
export interface StateWorkingHoursRule {
  state: string;
  stateCode: 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  legislation: string;
  regulator: string;
  minAgeGeneral: string;
  minAgeLightOrDelivery: string;
  parentConsentMandatory: boolean;
  parentConsentDetails: string;
  schoolTermMaxHours: string;
  schoolDayMaxHours: string;
  nonSchoolDayMaxHours?: string;
  holidayMaxHours: string;
  nightWorkRestrictions: string;
  mandatoryRestBreaks: string;
  rulesFor15YearOlds: string;
  keyRule: string;
}

export const AU_STATE_WORKING_HOURS_RULES: StateWorkingHoursRule[] = [
  {
    state: 'Queensland (QLD)',
    stateCode: 'QLD',
    legislation: 'Child Employment Act 2006 & Child Employment Regulation 2016',
    regulator: 'Office of Industrial Relations / Business Queensland',
    minAgeGeneral: '13 years (retail, fast food, hospitality)',
    minAgeLightOrDelivery: '11 years (supervised delivery of newspapers & pamphlets)',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory signed Parent\'s Consent Form (Form 1) required before starting work; must state school hours and be updated if school hours change.',
    schoolTermMaxHours: 'Max 12 hours per week during school terms',
    schoolDayMaxHours: 'Max 4 hours on a school day',
    nonSchoolDayMaxHours: 'Max 8 hours on a non-school day (weekend)',
    holidayMaxHours: 'Max 38 hours per week in school holidays (max 8 hrs/day)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am',
    mandatoryRestBreaks: '1-hour rest pause after 4 continuous hours; minimum 12-hour break between shifts',
    rulesFor15YearOlds: 'Under QLD law, 15-year-olds who have not completed Year 10 are classified as "school-aged children" and subject to the 12 hr/week term cap, 4 hr school-day limit, Form 1 parental consent, and 10pm curfew.',
    keyRule: 'School attendance is compulsory; employers cannot roster students during school hours. Form 1 parental consent is legally mandatory for all workers under 16.',
  },
  {
    state: 'Victoria (VIC)',
    stateCode: 'VIC',
    legislation: 'Child Employment Act 2003 (as amended) & Education and Training Reform Act 2006',
    regulator: 'Workforce Inspectorate Victoria (Wage Inspectorate)',
    minAgeGeneral: '15 years without permit/licence (13–14 requires Child Employment Licence)',
    minAgeLightOrDelivery: '13–14 years for light work (retail, food, delivery) with employer licence; under 13 entertainment only',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for under-15 Child Employment Licence; optional standard HR consent once 15.',
    schoolTermMaxHours: 'Max 12 hours per week during school terms (for under 15)',
    schoolDayMaxHours: 'Max 3 hours on a school day (for under 15)',
    nonSchoolDayMaxHours: 'Max 6 hours on a non-school day (for under 15)',
    holidayMaxHours: 'Max 30 hours per week in school holidays (max 6 hrs/day for under 15; 38 hrs/wk for 15+)',
    nightWorkRestrictions: 'Strict curfew: No work between 9:00pm and 6:00am (for under 15)',
    mandatoryRestBreaks: '30-minute rest break after 3 continuous hours; minimum 12-hour break between shifts for under-15s',
    rulesFor15YearOlds: 'At 15, teens are no longer classified as "children" under the Child Employment Act; employers do not need a licence for retail/hospitality. However, school is compulsory until 17 so work during school hours is prohibited.',
    keyRule: 'Under Child Employment Act 2003, at 15 you can work in retail or hospitality without an employer permit. Under-15s require an employer licence and direct WWCC adult supervision.',
  },
  {
    state: 'New South Wales (NSW)',
    stateCode: 'NSW',
    legislation: 'Industrial Relations (Child Employment) Act 2006 & Education Act 1990',
    regulator: 'NSW Industrial Relations / Office of the Children\'s Guardian',
    minAgeGeneral: 'No statutory minimum age for retail/hospitality (Modern Awards apply)',
    minAgeLightOrDelivery: 'Office of Children\'s Guardian authority required for entertainment, modelling & door-to-door sales',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard employer HR onboarding practice for under-16s; legally mandatory in entertainment and door-to-door sales.',
    schoolTermMaxHours: 'No strict statutory hour cap; compulsory schooling until 17 (work cannot interfere with education)',
    schoolDayMaxHours: 'Max 4 hours on a school day (under 15 guideline); strictly outside school hours (8:30am–3:30pm)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Cannot work after 9:00pm on school nights (under 15); safe travel home required for late shifts',
    mandatoryRestBreaks: '1-hour rest break after 4 hours of work; minimum 12-hour break between shifts (under 15 guidelines)',
    rulesFor15YearOlds: '15-year-olds can work in retail, supermarkets, and cafes outside school hours under Modern Awards (e.g. Retail or Fast Food Award). Must not work during official school hours.',
    keyRule: 'Work must not interfere with education or health. Compulsory schooling applies until 17; employers must ensure shifts end with safe transport home.',
  },
  {
    state: 'Western Australia (WA)',
    stateCode: 'WA',
    legislation: 'Children and Community Services Act 2004 (Part 7) & School Education Act 1999',
    regulator: 'Department of Energy, Mines, Industry Regulation and Safety (DEMIRS) / Wageline',
    minAgeGeneral: '15 years for general retail, food services & hospitality',
    minAgeLightOrDelivery: '13–14 years for light work (shops, cafes, trolley collection, pamphlet delivery); 10–12 for paper rounds only',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written Wageline Parental Permission Form for 13–14 year olds before starting work; fines up to $120k for non-compliance.',
    schoolTermMaxHours: 'No work during school hours; max 12–16 hrs/week recommended outside school times',
    schoolDayMaxHours: 'Outside school hours only (after 3:30pm; between 6:00am and 10:00pm)',
    nonSchoolDayMaxHours: 'Standard award limits (between 6:00am and 10:00pm)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for 13–14 year olds',
    mandatoryRestBreaks: 'Modern award meal and rest break rules apply; shifts must end with safe travel arrangements',
    rulesFor15YearOlds: '15-year-olds can work in retail, hospitality, and fast food outside school hours without the statutory 13–14 parent permission form. School attendance is compulsory until end of year turned 17.',
    keyRule: 'Parental permission form is legally mandatory for 13–14 year olds under s 190. 15-year-olds can work retail and hospitality freely outside school hours.',
  },
  {
    state: 'South Australia (SA)',
    stateCode: 'SA',
    legislation: 'Education and Children\'s Services Act 2019 (s 74) & Work Health and Safety Act 2012',
    regulator: 'SafeWork SA / Department for Education',
    minAgeGeneral: 'No statutory minimum age (businesses set hiring policies, typically 14 or 15)',
    minAgeLightOrDelivery: 'No statutory minimum age for light work',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard employer onboarding practice for minors; formal exemption from school principal required for full-time work at 15.',
    schoolTermMaxHours: 'Cannot work during school hours; work must not render child unfit for school/education',
    schoolDayMaxHours: 'Outside school hours only (afternoons/evenings)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'No work that compromises sleep, health, safety, or school fitness (s 74 offence)',
    mandatoryRestBreaks: 'Standard Modern Award rest and meal break schedules apply',
    rulesFor15YearOlds: '15-year-olds can work part-time/casual shifts in retail and hospitality outside school hours. Full-time employment (30+ hrs/wk) requires a formal school exemption from the school principal.',
    keyRule: 'Section 74 of the Education and Children\'s Services Act 2019 makes it an offence (max $10,000 fine) to employ a school-aged child during school hours or if it causes school fatigue.',
  },
  {
    state: 'Tasmania (TAS)',
    stateCode: 'TAS',
    legislation: 'Education Act 2016 & Work Health and Safety Act 2012',
    regulator: 'WorkSafe Tasmania / Department for Education, Children and Young People (DECYP)',
    minAgeGeneral: 'No statutory minimum age (employer policy applies, typically 14 or 15)',
    minAgeLightOrDelivery: 'No statutory minimum age for light work',
    parentConsentMandatory: false,
    parentConsentDetails: 'Standard onboarding policy for under-16/18 employees; formal DECYP exemption needed for full-time work before 18.',
    schoolTermMaxHours: 'Work must not conflict with school attendance (compulsory until 18 or Year 12 / Cert III)',
    schoolDayMaxHours: 'Outside school hours only (after 3:30pm)',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Modern Award late-night conditions; WorkSafe guidelines require safe transport home after dark',
    mandatoryRestBreaks: 'Modern Award break schedules apply (e.g. 10-min paid rest per 4 hrs, 30-min unpaid meal per 5+ hrs)',
    rulesFor15YearOlds: '15-year-olds are eligible for casual/part-time roles in supermarkets, fast food, and retail outside school hours. Education is compulsory until 18 unless in approved full-time vocational training.',
    keyRule: 'Under Education Act 2016, employment during school hours is unlawful without DECYP exemption. Work outside school must not interfere with education or wellbeing.',
  },
  {
    state: 'Australian Capital Territory (ACT)',
    stateCode: 'ACT',
    legislation: 'Children and Young People Act 2008 (Chapter 21) & Education Act 2004',
    regulator: 'Access Canberra / ACT Community Services Directorate',
    minAgeGeneral: '15 years ("young person" — no hour caps outside school)',
    minAgeLightOrDelivery: 'Under 15 ("child" — restricted to light work, max 10 hrs/wk, max 6 days/wk)',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for children under 15; employer must notify Director-General within 7 days for regular work.',
    schoolTermMaxHours: 'Max 10 hours per week of light work for under-15s; no statutory cap for 15+ outside school hours',
    schoolDayMaxHours: 'Outside school hours only (max 6 days in any week for under-15s)',
    nonSchoolDayMaxHours: 'Outside school hours; subject to 10 hr/wk total cap for under-15s',
    holidayMaxHours: 'Max 10 hours per week for under-15s; max 38 hours per week for 15+ under Modern Awards',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for children under 15',
    mandatoryRestBreaks: 'Modern award rest and meal breaks; safe travel home required for late evening shifts',
    rulesFor15YearOlds: 'Under ACT law, 15-year-olds are classified as "young persons" rather than "children", meaning the 10 hr/week light work cap does not apply. They can work award hours outside compulsory school hours.',
    keyRule: 'Children under 15 are restricted to 10 hrs/week of light work with mandatory parental consent. 15-year-olds can work general award hours outside school times.',
  },
  {
    state: 'Northern Territory (NT)',
    stateCode: 'NT',
    legislation: 'Care and Protection of Children Act 2007 (Part 5.3) & Education Act 2015',
    regulator: 'Territory Families, Housing and Communities / NT WorkSafe',
    minAgeGeneral: '15 years for general employment without child employment permit restrictions',
    minAgeLightOrDelivery: 'Under 15 subject to Part 5.3 child employment protections and parent consent',
    parentConsentMandatory: true,
    parentConsentDetails: 'Mandatory written parental consent for workers under 15; must be retained by employer.',
    schoolTermMaxHours: 'Work must not interfere with school attendance or education (compulsory until 17)',
    schoolDayMaxHours: 'Outside school hours only',
    nonSchoolDayMaxHours: 'Standard award limits (up to 8 hrs/day)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Strict curfew: No work between 10:00pm and 6:00am for children under 15',
    mandatoryRestBreaks: 'Minimum 12 continuous hours of rest between consecutive shifts for under-15s',
    rulesFor15YearOlds: 'At 15, Part 5.3 child employment restrictions lift. 15-year-olds who have completed Year 10 can transition to full-time work or work casual/part-time award hours outside school times.',
    keyRule: 'Under Care and Protection of Children Act 2007, under-15s cannot work 10pm–6am, must have 12-hour rest between shifts, and require written parent consent. 15-year-olds work under standard Modern Awards.',
  },
];

/** Minimum Shift Lengths Under Australian Modern Awards */
export const MINIMUM_SHIFT_LENGTHS = [
  { award: 'Fast Food Industry Award [MA000003]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'If sent home early, employer must still pay the full 3 hours.' },
  { award: 'General Retail Industry Award [MA000004]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to supermarkets, department stores, fashion & hardware.' },
  { award: 'Restaurant Industry Award [MA000119]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to cafes, restaurants and takeaway outlets.' },
  { award: 'Hospitality Industry Award [MA000009]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to hotels, resorts, event catering and function centres.' },
  { award: 'Registered and Licensed Clubs Award [MA000058]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to sporting, RSL, and community clubs.' },
  { award: 'Community Pharmacy Award [MA000012]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to pharmacy assistants and shop floor crew.' },
  { award: 'Fitness Industry Award [MA000094]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to pool lifeguards, gym receptionists, and swim instructors.' },
  { award: 'Cleaning Services Award [MA000022]', casualMin: '2–3 Hours', partTimeMin: '3 Hours', note: 'Cleaners get 100% full adult rates ($27.81/hr) regardless of age!' },
  { award: 'Amusement & Events Award [MA000080]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to theme parks, bowling alleys, and sports grounds.' },
];

/** Legal Meal & Rest Break Entitlements Under Modern Awards */
export const MEAL_AND_REST_BREAKS = [
  { shiftLength: 'Under 4 Hours', restPause: 'None required', mealBreak: 'None', isPaid: 'N/A' },
  { shiftLength: '4 to 5 Hours', restPause: '1 × 10-minute rest break', mealBreak: 'None', isPaid: '10-min break is 100% PAID by employer' },
  { shiftLength: '5 to 7 Hours', restPause: '1 × 10-minute rest break', mealBreak: '1 × 30-to-60 minute meal break', isPaid: 'Rest break is PAID; meal break is UNPAID' },
  { shiftLength: '7 to 10 Hours', restPause: '2 × 10-minute rest breaks', mealBreak: '1 × 30-to-60 minute meal break', isPaid: 'Both 10-min breaks are PAID; meal break is UNPAID' },
];

/** 100-Point Identification Checklist for 15-Year-Olds (Bank Accounts, TFN & Medicare) */
export const TEEN_ID_CHECKLIST_15YO = [
  { type: 'Primary ID (70 Points)', examples: 'Australian Birth Certificate, Australian Passport, Australian Citizenship Certificate', note: 'Most important document for 15yos' },
  { type: 'Secondary Photo ID (40 Points)', examples: 'Current High School Student ID Card (with photo), Proof of Age Card, Learner Driver Licence', note: 'Must have your photo and full legal name' },
  { type: 'Supporting Documents (25 Points each)', examples: 'Medicare Card (as a dependant or own card), Bank Debit Card, Letter from School Principal, Youth Transport Concession Card', note: 'Shows your current address or relationship' },
];

/** Top Australian Employers for 15-Year-Old First Job Seekers */
export const TOP_TEEN_EMPLOYERS_AU = [
  {
    company: 'Woolworths Supermarkets',
    minAge: '15 Years',
    award: 'Retail Award / EBA',
    roles: 'Service Cashier, Online Personal Shopper, Grocery Replenishment',
    howToApply: 'Woolworths Careers website (online application + short video/game assessment)',
    tip: 'Apply in August–October for big Christmas casual hiring intakes! Practice Situational Judgement Tests (SJT) emphasizing customer safety.',
  },
  {
    company: 'Coles Supermarkets',
    minAge: '15 Years',
    award: 'Retail Award / EBA',
    roles: 'Customer Service, Click & Collect Shopper, Night Fill Team',
    howToApply: 'Coles Careers online portal — set up job alerts for local stores',
    tip: 'Highlight teamwork, punctuality, and wide availability for weekend and afternoon shifts.',
  },
  {
    company: "McDonald's Australia",
    minAge: '14–15 Years (State dependent)',
    award: 'Fast Food Award / EBA',
    roles: 'Front Counter Crew, Drive-Thru Team, Kitchen & Grill',
    howToApply: "Maccas Careers / 'Olivia' AI chat assistant on mcdonalds.com.au",
    tip: 'Australia’s #1 youth employer — amazing training & globally recognized resume credential. Open up broad roster availability for instant interview invitations.',
  },
  {
    company: "Hungry Jack's",
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Front Counter, Drive-Thru, Burger Crew',
    howToApply: "Hungry Jack's Careers website or hand resume in-store during quiet hours (2–4pm Tue–Thu)",
    tip: 'Great weekend hours and structured shift training. Present yourself neatly in school uniform or smart casual.',
  },
  {
    company: 'KFC Australia (Collins Foods / Yum!)',
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Customer Service Team, Cook / Food Prep, Drive-Thru Runner',
    howToApply: 'KFC Careers portal / Collins Foods online application',
    tip: 'Emphasize high energy, speed, and safety orientation. Highlight any team sports experience.',
  },
  {
    company: 'Subway Australia',
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Sandwich Artist, POS Cashier, Food Prep Assistant',
    howToApply: 'Walk-in applications directly to store manager during quiet window (2:30pm–4:00pm) with 1-page resume',
    tip: 'Subway franchises hire largely through in-person walk-ins. Ask politely for the store manager and hand your resume with a confident smile.',
  },
  {
    company: 'Boost Juice',
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Juice Maker, Register Operator, Fruit Prep Crew',
    howToApply: 'Boost Juice Careers portal — complete the Boost "personality vibe" assessment',
    tip: 'Bubbly positive energy, big smiles, and quick hands are essential. They hire for personality and train for skill!',
  },
  {
    company: 'Guzman y Gomez (GYG)',
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Guest Experience Crew, Kitchen Prep, Line Cook',
    howToApply: 'GYG Careers website online portal',
    tip: 'One of Australia’s fastest-growing food chains. High pace, clean hygiene, and passion for fresh food are valued.',
  },
  {
    company: 'Kmart Australia',
    minAge: '15 Years',
    award: 'Retail Award / EBA',
    roles: 'Store Team Member, Checkout, Fitting Room, Stocking',
    howToApply: 'Kmart Careers online application portal',
    tip: 'Massive hiring pushes before holiday periods; friendly customer service attitude and tidy presentation are key.',
  },
  {
    company: 'Bunnings Warehouse',
    minAge: '15–16 Years',
    award: 'Retail Award / EBA',
    roles: 'Customer Service Team, Plant Nursery Assistant, Front Register',
    howToApply: 'Bunnings Careers portal online',
    tip: 'Loved for supportive team culture. Highlight any DIY interest, gardening hobby, or helpful friendly nature.',
  },
  {
    company: 'Rebel Sport (Super Retail Group)',
    minAge: '15 Years',
    award: 'Retail Award',
    roles: 'Footwear Specialist, Apparel Assistant, Equipment Sales',
    howToApply: 'Super Retail Group Careers portal',
    tip: 'Highlight your personal sports participation (soccer, basketball, netball, gym) on your resume to stand out immediately.',
  },
  {
    company: 'Event Cinemas & HOYTS',
    minAge: '15 Years',
    award: 'Amusement & Events Award [MA000080]',
    roles: 'Box Office Cashier, Scoop Alley / Candy Bar Attendant, Usher',
    howToApply: 'Cinema careers portal online (look out for annual Christmas casual intake in Sep–Oct)',
    tip: 'Fantastic social first job with 3-hour minimum casual shifts and free movie passes! Group assessment days test teamwork and friendliness.',
  },
  {
    company: 'Local Sports Associations (Refereeing / Umpiring)',
    minAge: '13–15 Years',
    award: 'Sports Officiating Rate ($25–$55 per match)',
    roles: 'Soccer Referee, Basketball Referee, Netball Umpire, Touch Football Referee',
    howToApply: 'Contact your local junior sports club or complete a Level 1 Junior Referee course',
    tip: 'Highest hourly pay for 15yos ($25–$55/match tax-free honorarium or direct bank pay), active, weekend morning shifts, builds massive leadership skills.',
  },
  {
    company: 'Swim Schools (Austswim / Royal Life Saving)',
    minAge: '15 Years',
    award: 'Fitness Industry Award [MA000094]',
    roles: 'Assistant Swim Instructor, Deck Attendant, Kiosk Assistant',
    howToApply: 'Apply directly to local aquatic centres or swim schools (Kingswim, Rackley, Sam Riley)',
    tip: 'Earn $20–$28/hr! Complete HLTAID009 CPR certificate to instantly qualify for assistant instructor roles.',
  },
  {
    company: 'Babysitting & Local Childcare',
    minAge: '14–15 Years',
    award: 'Independent Private Rate ($20–$30/hr)',
    roles: 'Evening Babysitter, After-School Mother\'s Helper',
    howToApply: 'Word of mouth through family friends, neighbours, school parents, and local community noticeboards',
    tip: 'Reliability and trust are everything. Complete a basic first-aid/CPR course and provide 2 solid non-parent character references.',
  },
  {
    company: 'Bakers Delight & Local Bakeries',
    minAge: '14–15 Years',
    award: 'General Retail or Fast Food Award',
    roles: 'Customer Service Assistant, Bakery Trainee, Product Packaging',
    howToApply: 'Drop in during early afternoon (1:30pm–3:00pm) with a clean 1-page resume and ask for the franchise owner',
    tip: 'Early morning weekend shifts allow teens to earn high penalty rates and still enjoy the entire rest of their Saturday and Sunday!',
  },
];

/** 15-Year-Old Independence Roadmap Milestones */
export const FIFTEEN_YO_ROADMAP_MILESTONES = [
  {
    step: 1,
    title: 'Apply for Your Free Tax File Number (TFN)',
    badge: 'Step 1 • Legal Prerequisite',
    summary: 'Apply online through Australia Post or myGov. It is 100% free (never pay a third-party fee!). Stop 47% tax from being withheld.',
    action: 'Book a free identity appointment at Australia Post with your Birth Certificate & Student ID.',
    linkKey: 'auspost_tfn',
  },
  {
    step: 2,
    title: 'Open a Zero-Fee 5.0%+ Youth Bank Account',
    badge: 'Step 2 • Banking & Savings',
    summary: 'Open a fee-free youth transaction account with Visa/Mastercard Debit and Apple Pay / Google Wallet. Provide your TFN to stop 47% tax on savings interest!',
    action: 'Compare BOQ Future Saver (5.80%), Newcastle Permanent (5.75%), or Great Southern Bank (5.50%).',
    linkKey: 'moneysmart_banking',
  },
  {
    step: 3,
    title: 'Claim Your Own Green Medicare Card',
    badge: 'Step 3 • Healthcare Independence',
    summary: 'From age 15 in Australia, Services Australia allows you to get your own separate green Medicare card (via myGov or Form MS011) to visit bulk-billing doctors independently and manage your own health records.',
    action: 'Submit Services Australia Form MS011 or apply online via myGov under "Get a new card and number".',
    linkKey: 'services_australia_medicare_15',
  },
  {
    step: 4,
    title: 'Land Your First Casual Job & Master Junior Pay',
    badge: 'Step 4 • First Paycheck',
    summary: 'Understand your junior rate ($11.12–$15.64/hr + 25% casual loading), claim the $18,200 tax-free threshold on Form NAT 3092, and enforce the 3-hour minimum shift rule.',
    action: 'Use our Teen Resume Builder and submit applications to Woolies, Coles, Maccas, or sports refereeing.',
    linkKey: 'fairwork_awards',
  },
  {
    step: 5,
    title: 'Practice PrepL / DKT for Your Ls at 16',
    badge: 'Step 5 • Driving Prep',
    summary: 'At 15 you can study and practice the road rules tests online (PrepL in QLD, DKT in NSW, Learner test in VIC) so you are ready to get your Ls on the exact day you turn 16!',
    action: 'Run free practice road rules quizzes on your state transport portal.',
    linkKey: 'qld_prepl',
  },
  {
    step: 6,
    title: 'Unlock Student Concessions & Scam Protection',
    badge: 'Step 6 • Real World Savings',
    summary: 'Get 50c public transport fares (QLD) or Concession Opal (NSW), join Student Edge / UNiDAYS for tech discounts, and protect against money muling and task scams.',
    action: 'Download Student Edge and verify your high school status for student discounts.',
    linkKey: 'student_edge',
  },
];

export interface StudentDiscountItem {
  id: string;
  category: 'Transport' | 'Phone & Internet' | 'Tech & Hardware' | 'Music & Streaming' | 'Cinema & Entertainment' | 'Food & Retail';
  title: string;
  provider: string;
  discount: string;
  estimatedYearlySavings: number;
  howToGet: string;
  linkKey: string;
}

export const STUDENT_DISCOUNTS_AU: StudentDiscountItem[] = [
  {
    id: 'translink_50c',
    category: 'Transport',
    title: '50c Flat Public Transport Fares (QLD)',
    provider: 'Translink (Buses, Trains, Ferries, Light Rail)',
    discount: '50c per trip across all zones',
    estimatedYearlySavings: 1100,
    howToGet: 'Tap on/off with standard go card or contactless bank card / smartphone across South East Queensland.',
    linkKey: 'translink_50c_fares',
  },
  {
    id: 'nsw_opal_concession',
    category: 'Transport',
    title: '50% Concession Opal Fares (NSW)',
    provider: 'Transport for NSW',
    discount: '50% off adult standard peak/off-peak fares',
    estimatedYearlySavings: 650,
    howToGet: 'Order a Child/Youth Opal card or present Secondary Student Concession Card.',
    linkKey: 'moneysmart_budget',
  },
  {
    id: 'vic_myki_concession',
    category: 'Transport',
    title: '50% Youth Concession Myki Fares (VIC)',
    provider: 'Public Transport Victoria (PTV)',
    discount: '50% off adult standard metropolitan and regional fares',
    estimatedYearlySavings: 550,
    howToGet: 'Purchase a Concession Myki card and carry your Victorian student pass or proof of age.',
    linkKey: 'moneysmart_budget',
  },
  {
    id: 'sim_only_mvno',
    category: 'Phone & Internet',
    title: 'Prepaid / SIM-Only MVNO Mobile Plan',
    provider: 'Moose Mobile / Boost Mobile / ALDI Mobile / Circles.Life',
    discount: '$15–$25/mo vs $65/mo lock-in Telstra/Optus contract',
    estimatedYearlySavings: 480,
    howToGet: 'Bring your own handset and purchase a 30-day SIM-only plan on the Telstra or Optus wholesale network.',
    linkKey: 'student_edge',
  },
  {
    id: 'spotify_student',
    category: 'Music & Streaming',
    title: 'Spotify Premium Student Plan',
    provider: 'Spotify Australia',
    discount: '$6.99/mo (50% off standard $13.99/mo)',
    estimatedYearlySavings: 84,
    howToGet: 'Verify high school / tertiary enrollment via SheerID inside the Spotify app.',
    linkKey: 'unidays_au',
  },
  {
    id: 'apple_music_student',
    category: 'Music & Streaming',
    title: 'Apple Music Student + Free Apple TV+',
    provider: 'Apple',
    discount: '$6.99/mo + complimentary Apple TV+ access',
    estimatedYearlySavings: 190,
    howToGet: 'Verify student status with UNiDAYS in the Apple Music subscription settings.',
    linkKey: 'unidays_au',
  },
  {
    id: 'youtube_premium_student',
    category: 'Music & Streaming',
    title: 'YouTube Premium Student Membership',
    provider: 'Google / YouTube Australia',
    discount: '$8.99/mo (ad-free video + YouTube Music)',
    estimatedYearlySavings: 96,
    howToGet: 'Verify student status via SheerID inside YouTube account settings.',
    linkKey: 'unidays_au',
  },
  {
    id: 'apple_education_tech',
    category: 'Tech & Hardware',
    title: 'Apple Education Store Hardware Discount',
    provider: 'Apple Australia',
    discount: 'Up to $250 off Mac / iPad + 20% off AppleCare+',
    estimatedYearlySavings: 200,
    howToGet: 'Shop online via Apple Australia Education Store or present student ID at Apple Store.',
    linkKey: 'unidays_au',
  },
  {
    id: 'microsoft_office_free',
    category: 'Tech & Hardware',
    title: 'Microsoft 365 Education (100% Free Office Suite)',
    provider: 'Microsoft Australia',
    discount: '100% Free Word, Excel, PowerPoint & 1TB OneDrive cloud storage ($109/yr value)',
    estimatedYearlySavings: 109,
    howToGet: 'Enter your valid school email address (.edu.au or @eq.edu.au) at microsoft.com/education.',
    linkKey: 'unidays_au',
  },
  {
    id: 'samsung_student_store',
    category: 'Tech & Hardware',
    title: 'Samsung Student Enhanced Offers',
    provider: 'Samsung Australia',
    discount: 'Up to 20% off Galaxy phones, tablets, monitors, and laptops',
    estimatedYearlySavings: 150,
    howToGet: 'Register with UNiDAYS or Student Edge to unlock the Samsung Education Store.',
    linkKey: 'unidays_au',
  },
  {
    id: 'event_cinemas_student',
    category: 'Cinema & Entertainment',
    title: 'Student Cinebuzz $10 Monday Movies',
    provider: 'Event Cinemas',
    discount: '$10 standard movie tickets on Mondays + free popcorn refills',
    estimatedYearlySavings: 120,
    howToGet: 'Join Cinebuzz Rewards for free and link your student ID card.',
    linkKey: 'student_edge',
  },
  {
    id: 'hoyts_student_deals',
    category: 'Cinema & Entertainment',
    title: 'HOYTS Student Ticket Pricing & Candy Bar Deals',
    provider: 'HOYTS Australia',
    discount: '$12–$14 student movie tickets Monday to Thursday + combo discounts',
    estimatedYearlySavings: 110,
    howToGet: 'Present valid Student ID or show UNiDAYS membership at the box office.',
    linkKey: 'unidays_au',
  },
  {
    id: 'student_edge_retail',
    category: 'Food & Retail',
    title: 'Student Edge 10–15% Retail & Dining Deals',
    provider: 'Student Edge (Boost Juice, McDonald’s, ASOS, JD Sports)',
    discount: '10% off Boost Juice, $5 meal deals, 15% off shoes & fashion',
    estimatedYearlySavings: 160,
    howToGet: 'Download the free Student Edge app and show digital membership card at checkout.',
    linkKey: 'student_edge',
  },
  {
    id: 'unidays_fashion_deals',
    category: 'Food & Retail',
    title: 'UNiDAYS 10–20% Apparel & Sportswear Perks',
    provider: 'UNiDAYS (Nike, Cotton On, The Iconic, ASOS, Under Armour)',
    discount: '10%–20% instant promo codes on full-price and sale items',
    estimatedYearlySavings: 180,
    howToGet: 'Generate single-use promo codes in the UNiDAYS app before checking out online.',
    linkKey: 'unidays_au',
  },
];

/**
 * Proven Savings Goals & Paycheck Allocation Frameworks for Teens
 */
export const SAVINGS_GOALS_FRAMEWORKS = {
  barefoot3Bucket: {
    name: 'The Barefoot Investor 3-Bucket System',
    author: 'Scott Pape',
    allocations: [
      { name: 'Blow (60%)', purpose: 'Daily expenses, public transport (50c fares), lunch with friends, phone credit, and guilt-free fun' },
      { name: 'Mojo (20%)', purpose: 'High-interest emergency buffer ($500 to $1,000) for broken gear or unexpected emergencies' },
      { name: 'Grow (20%)', purpose: 'Long-term goal: first car bought in cash, driving lessons, moving-out bond, or early investing' },
    ],
  },
  teen50_30_20: {
    name: 'Inverted Teen 50/30/20 Rule',
    allocations: [
      { name: 'Future Wealth (50%)', purpose: 'Take advantage of living at home with zero rent by saving 50% into HISA & investing' },
      { name: 'Guilt-Free Fun (30%)', purpose: 'Entertainment, dining out, games, sneakers, and weekend social life' },
      { name: 'Admin & Needs (20%)', purpose: 'Phone bill, transport, school supplies, haircut, and personal care' },
    ],
  },
  fourBucketSystem: {
    name: 'The 4-Bucket Envelope System',
    allocations: [
      { name: 'Daily Spend', purpose: 'Everyday transaction account with debit card and Apple Pay / Google Wallet' },
      { name: 'Sinking Funds', purpose: 'Predictable irregular expenses (school formal, sports fees, holidays)' },
      { name: 'Mojo Safety Buffer', purpose: '$500 locked cash safety cushion in a 5.0%+ HISA' },
      { name: 'Big Goal / Grow', purpose: 'Car purchase, university laptop, or long-term index ETF compounding' },
    ],
  },
  hoursWorkedRule: {
    name: 'The Hours Worked Psychology Rule',
    formula: 'Cost of Item / Hourly Wage = Hours of Labor Required',
    example: 'At $11.12/hr (15yo fast food base rate), a $100 hoodie = 9 hours of hard work on the kitchen fryer.',
  },
  coolingOffRule: {
    name: 'The 24-Hour & 7-Day Cooling Off System',
    tier1: 'Under $100: Enforce a mandatory 24-hour waiting period before buying.',
    tier2: 'Over $100: Add to a 7-day phone Wishlist. If you still want it after 7 days and have cash in your sinking fund, buy it guilt-free.',
  },
  sinkingFundsGuide: {
    name: 'Teen Sinking Funds Target Blueprint',
    shortTerm: 'Short-term (<6 months): New phone upgrade, concert tickets, sneakers ($150–$400)',
    mediumTerm: 'Medium-term (1–2 years): First cash car ($4,000), 10 professional driving lessons ($750), Year 12 formal ($500)',
    longTerm: 'Long-term (3+ years): University rental bond ($3,500), first index ETF portfolio at 18 ($2,000+)',
    tip: 'Create dedicated savings sub-accounts in your banking app for each sinking fund with automated payday transfers.',
  },
  compoundGrowthComparison: {
    name: 'The 15 vs 25 Compound Growth Proof',
    earlySaver: 'Saving $25/wk at 5.5% HISA from 15 to 18 = $4,238. Rolling into index ETFs at 8% until age 60 = $677,963!',
    lateSaver: 'Starting at 25 and saving DOUBLE ($50/wk) at 8% until age 60 yields only $561,226 — despite depositing $32,500 MORE cash!',
    moral: 'Starting at 15 beats doubling your money later. Time in the market is the ultimate financial superpower.',
  },
};

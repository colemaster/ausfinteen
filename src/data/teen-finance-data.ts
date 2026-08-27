/**
 * Official Australian Teen Financial Reference Data
 * Sources: ATO, Fair Work Ombudsman, Moneysmart, Services Australia, PPSR, SafeWork Australia, RTBA, RBO, RTA
 */

export interface WebLink {
  title: string;
  url: string;
  source: 'ATO' | 'Fair Work' | 'Moneysmart' | 'Services Australia' | 'PPSR' | 'Reserve Bank' | 'Scamwatch' | 'ACCC' | 'APRA' | 'SafeWork' | 'ASX' | 'Moomoo' | 'ETF Provider' | 'Media' | 'Research' | 'QLD Government' | 'Brisbane City Council' | 'Federal Government' | 'University' | 'Australia Post' | 'Transport' | 'Student Discount';
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
    jobTitle: 'Fast Food / Retail Crew (40% junior rate)',
    hourlyRate: 11.12,
    hoursPerWeek: 8,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Phone & Savings',
    savingsGoalTarget: 1200,
    currentSavings: 350,
  },
  16: {
    age: 16,
    label: '16yo High School',
    jobTitle: 'Supermarket / Cafe Worker (50% junior rate)',
    hourlyRate: 13.91,
    hoursPerWeek: 12,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'First Car & Emergency Buffer',
    savingsGoalTarget: 4000,
    currentSavings: 850,
  },
  17: {
    age: 17,
    label: '17yo Senior Teen',
    jobTitle: 'Senior Retail Crew (60% junior rate)',
    hourlyRate: 16.69,
    hoursPerWeek: 16,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Car Deposit & Travel Fund',
    savingsGoalTarget: 6000,
    currentSavings: 1500,
  },
  18: {
    age: 18,
    label: '18yo Young Adult',
    jobTitle: 'Part-Time Team Member (70% junior rate)',
    hourlyRate: 19.47,
    hoursPerWeek: 22,
    claimsTaxFreeThreshold: true,
    savingsGoalName: 'Moving Out & Emergency Fund',
    savingsGoalTarget: 8000,
    currentSavings: 2800,
  },
};

/** Division 6AA ATO Minor Unearned Income Tax Rates (Interest & Dividends under 18) */
export const MINOR_UNEARNED_TAX_RATES = {
  taxFreeLimit: 416, // $0 to $416 is tax-free
  threshold66: 1307, // $417 to $1,307 is taxed at 66%
  overThresholdRate: 0.45, // over $1,307 is taxed at 45%
};

/** Superannuation Rules for Under 25s & Low Balances */
export const SUPER_YOUTH_RULES = {
  lowBalanceFeeCapPct: 0.03, // 3% fee cap on accounts under $6,000
  pmifAgeLimit: 25, // PMIF Act: default insurance opted out for under 25s to protect savings
  superGuaranteeRate: 0.12, // 12.0% statutory rate for FY 2025-26 & FY 2026-27 (effective 1 July 2025 under SGAA 1992 s 19(10))
};

/** ABN & Side Hustle Rules */
export const SIDE_HUSTLE_RULES = {
  gstThreshold: 75000, // mandatory GST registration threshold
  hobbyVsBusinessRule: 'If casual or irregular without intention of profit, it is a hobby. If regular & commercial, an ABN is required.',
};

/** Youth Allowance (2026-27 rates, effective 1 Jan 2026 for under-22) */
export const YOUTH_ALLOWANCE_2026_27 = {
  /** Fortnightly base rate — under 18, living at home (Services Australia, 1 Jan 2026) */
  under18AtHome: 418.90,
  /** Fortnightly base rate — 18+, living at home */
  over18AtHome: 482.40,
  /** Fortnightly base rate — living away from home (under 22 & apprentices) */
  awayFromHome: 677.20,
  /** Income-free area for students/apprentices (fortnightly) — $539 pf (from 1 Jan 2026), accrual via Income Bank up to $13,500 */
  incomeFreeAreaStudent: 539,
  /** Income-free area for other recipients (fortnightly) — $528 pf (DSS 4.2.2) */
  incomeFreeAreaOther: 528,
  /** Second taper threshold: $539–$646 at 50c/$1, then 60c/$1 above $646 (plus $53.50 fixed adjustment) */
  taperThreshold2: 646,
  taperRateLow: 0.50,
  taperRateHigh: 0.60,
  /** Student Start-up Loan (one-off per loan period, max 2/yr, HECS-indexed) */
  studentStartUpLoan: 1349,
  /** ABSTUDY Living Allowance (away from home, under 22 — same as YA away) */
  abstudyAwayFromHome: 677.20,
  /** ABSTUDY 22+ away from home / Energy supplement variants: $799.70 (22+), $3.90–$7.00 energy supplement */
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
    description: 'Under 18 super guarantee rule: must work >30 hours in a calendar week to receive 12.0% Super.',
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
    description: 'Mandatory line items on Australian payslips including gross pay, PAYG tax, and super.',
  },
  moneysmart_budget: {
    title: 'Moneysmart: Budgeting & Saving for Young People',
    url: 'https://moneysmart.gov.au/budgeting',
    source: 'Moneysmart',
    description: 'Australian Government MoneySmart tools for setting up spending and saving buckets.',
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
    description: 'Official government register to check if a second-hand car has money owing or was written off.',
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
    description: 'Government guide on BNPL risks, credit cards, and National Debt Helpline support.',
  },
  translink_50c_fares: {
    title: 'Translink: Queensland 50-Cent Public Transport Fares',
    url: 'https://translink.com.au/tickets-and-fares/50-cent-fares',
    source: 'QLD Government',
    description: 'Official details on Queensland\'s flat 50-cent fare initiative across trains, buses, and ferries.',
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
    description: 'ACCC Scamwatch guide for young people on identifying social media & banking scams.',
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
    description: 'Australia\'s most downloaded trading app. Trade 26,000+ stocks & ETFs on the ASX, US and Hong Kong markets. CHESS-sponsored on all ASX trades.',
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
  reviewetf: {
    title: 'ReviewETF: Best Performing ASX ETFs',
    url: 'https://www.reviewetf.com.au/best-etfs',
    source: 'Research',
    description: 'Independent comparison of 500+ ASX ETFs ranked by 1-year returns, MER and fund size.',
  },
  etfinfo: {
    title: 'ETF Info Australia: ETF Data & Comparison',
    url: 'https://etfinfo.com.au',
    source: 'Research',
    description: 'Australian ETF database with AUM, MER, distributions, monthly flows and performance rankings.',
  },
  fool_etf_news: {
    title: 'Motley Fool Australia: ETF News & Guides',
    url: 'https://www.fool.com.au/category/sector/etfs/',
    source: 'Media',
    description: 'Plain-English Australian ETF news including the annual "10 most popular ASX ETFs by FUM" report.',
  },
  qld_rta: {
    title: 'RTA Queensland: Rental Bonds & Tenancy Rules',
    url: 'https://www.rta.qld.gov.au',
    source: 'QLD Government',
    description: 'Official Residential Tenancies Authority: 4-week max bond, lodgement, refunds and renters rights in Queensland.',
  },
  qld_fhog: {
    title: 'QLD Revenue Office: First Home Owner Grant',
    url: 'https://qro.qld.gov.au/property-concessions-grants/first-home-grant/',
    source: 'QLD Government',
    description: 'Up to $30,000 for new homes under $750,000 in Queensland, plus first-home transfer duty concessions.',
  },
  qld_boost_to_buy: {
    title: 'QLD: Boost to Buy Shared Equity Scheme',
    url: 'https://www.qld.gov.au/housing/buying-owning-home/home-buyers-financial-help/boost-to-buy-home-ownership-scheme',
    source: 'QLD Government',
    description: 'Queensland Government helps eligible buyers with a 2% deposit — contributing up to 30% of a new home price.',
  },
  translink_gocard: {
    title: 'TransLink: Go Card & Student Concessions',
    url: 'https://translink.com.au/tickets-and-fares/go-card',
    source: 'QLD Government',
    description: 'Queensland public transport: concession Go Card = 50% off fares, weekly caps, free transfers and 9-then-free travel.',
  },
  qld_rego: {
    title: 'QLD: Vehicle Registration Costs',
    url: 'https://www.qld.gov.au/transport/registration/fees/cost',
    source: 'QLD Government',
    description: 'Official breakdown of Queensland rego: registration fee + traffic improvement fee + CTP insurance.',
  },
  uq_study: {
    title: 'University of Queensland: Degrees & Entry',
    url: 'https://study.uq.edu.au',
    source: 'University',
    description: 'UQ St Lucia study options, guaranteed ATAR thresholds, HECS-HELP and scholarships.',
  },
  qut_study: {
    title: 'QUT: Courses, Fees & HECS-HELP',
    url: 'https://www.qut.edu.au/study',
    source: 'University',
    description: 'Queensland University of Technology course guide, CSP fees, HECS-HELP loans and scholarships.',
  },
  griffith_study: {
    title: 'Griffith University: Programs & Campuses',
    url: 'https://www.griffith.edu.au/study',
    source: 'University',
    description: 'Griffith University Nathan, South Bank and Gold Coast programs, fees and entry pathways.',
  },
  unisc_study: {
    title: 'UniSC: Moreton Bay & Sunshine Coast Degrees',
    url: 'https://www.usc.edu.au/study',
    source: 'University',
    description: 'UniSC Petrie rail hub and Sippy Downs campus degrees, #1 student experience ranking, and early offers.',
  },
  unisq_study: {
    title: 'UniSQ: Springfield, Ipswich & Toowoomba Courses',
    url: 'https://www.unisq.edu.au/study',
    source: 'University',
    description: 'University of Southern Queensland #1 graduate starting salaries ($78.2k), aviation flight sims, and nursing.',
  },
  acu_study: {
    title: 'ACU: Australian Catholic University Banyo Study',
    url: 'https://www.acu.edu.au/study',
    source: 'University',
    description: 'ACU Banyo North Brisbane campus: top nursing, paramedicine, physiotherapy, and education specialist degrees.',
  },
  qtac: {
    title: 'QTAC: Queensland Tertiary Admissions Centre',
    url: 'https://www.qtac.edu.au',
    source: 'University',
    description: 'Official QLD application hub for Year 12 leavers — preferences, ATAR offers, EAS access schemes, and scholarships.',
  },
  qcaa: {
    title: 'QCAA: Queensland Curriculum & Assessment Authority',
    url: 'https://www.qcaa.qld.edu.au',
    source: 'QLD Government',
    description: 'Official authority for the QCE, ATAR, senior subject syllabuses, and Year 12 assessment in Queensland.',
  },
  qce_atar: {
    title: 'QTAC: How ATAR is Calculated in Queensland',
    url: 'https://www.qtac.edu.au/atar',
    source: 'University',
    description: 'Official explanation of how the Australian Tertiary Admission Rank is derived from QCE results.',
  },
  qilt_survey: {
    title: 'QILT: Quality Indicators for Learning and Teaching',
    url: 'https://www.qilt.edu.au',
    source: 'Federal Government',
    description: 'Official federal government survey data on Australian university graduate employment rates, median starting salaries, and student satisfaction.',
  },
  tafe_qld: {
    title: 'TAFE Queensland: Courses & Apprenticeships',
    url: 'https://tafeqld.edu.au',
    source: 'QLD Government',
    description: 'Practical diploma and apprenticeship pathways across Queensland — Fee-Free TAFE and direct guaranteed uni articulation.',
  },
  qld_licence_fees: {
    title: 'QLD Government: Driver Licence & Test Fees',
    url: 'https://www.qld.gov.au/transport/licensing/driver-licensing/fees',
    source: 'QLD Government',
    description: 'Official 2026 QLD licence fees: PrepL, learner, hazard perception test, practical driving test, P1/P2 and open licences.',
  },
  qld_getting_licence: {
    title: 'QLD TMR: Getting a Licence (Steps & Tests)',
    url: 'https://www.tmr.qld.gov.au/Licensing/Getting-a-licence',
    source: 'QLD Government',
    description: 'Official QLD graduated licensing system: written & practical tests, licence classes and what you need to get your P\'s.',
  },
  qld_prepl: {
    title: 'QLD: PrepL Online Road Rules Test',
    url: 'https://www.qld.gov.au/transport/licensing/getting/learner/prepl',
    source: 'QLD Government',
    description: 'PrepL is the free-to-study online road rules knowledge test you sit to qualify for your QLD learner licence.',
  },
  qld_hpt: {
    title: 'QLD: Hazard Perception Test (HPT)',
    url: 'https://www.qld.gov.au/transport/licensing/getting/hazard/car-hazard-perception-test',
    source: 'QLD Government',
    description: 'Online QLD hazard perception test you must pass before your practical driving test (12-month access after paying).',
  },
  qld_practical_test: {
    title: 'QLD: Practical Driving Test (Q-SAFE)',
    url: 'https://www.qld.gov.au/transport/licensing/getting/practical-tests',
    source: 'QLD Government',
    description: 'Book and prepare for your QLD practical driving test to upgrade from your learner to a provisional licence.',
  },
  qld_licence_steps: {
    title: 'QLD: Steps From Learner to Provisional Licence',
    url: 'https://www.qld.gov.au/transport/licensing/getting/steps',
    source: 'QLD Government',
    description: 'Official QLD pathway from learner (12 months + 100 logbook hours) to P1 and P2 provisional licences.',
  },
  bcc_parking: {
    title: 'Brisbane City Council: Parking Meters & Fees',
    url: 'https://www.brisbane.qld.gov.au/transport-and-parking/parking/parking-meters-and-fees',
    source: 'Brisbane City Council',
    description: 'Official Brisbane parking zones, hourly meter fees, free 15-minute parking and free-after-7pm times.',
  },
  bcc_council_carparks: {
    title: 'Brisbane City Council: Council Car Parks',
    url: 'https://www.brisbane.qld.gov.au/transport-and-parking/parking/council-car-parks',
    source: 'Brisbane City Council',
    description: 'King George Square & Wickham Terrace car parks — early bird, night and weekend rates.',
  },
  green_vehicle_guide: {
    title: 'Green Vehicle Guide: Compare EV & Fuel Efficiency',
    url: 'https://www.greenvehicleguide.gov.au',
    source: 'Federal Government',
    description: 'Official Australian Government fuel consumption (L/100km) and EV energy use (kWh/100km) ratings.',
  },
  ev_council: {
    title: 'Electric Vehicle Council: EV Ownership Costs',
    url: 'https://electricvehiclecouncil.com.au',
    source: 'Research',
    description: 'EV charging costs, ownership comparisons and Australian EV market research.',
  },
  racq_fuel: {
    title: 'RACQ: Queensland Fuel Prices & Price Cycle',
    url: 'https://www.racq.com.au/car/queensland-fuel-prices',
    source: 'Research',
    description: 'Queensland fuel price comparison and the South East QLD price cycle so you can fill up at the cheap window.',
  },
  aip_fuel_prices: {
    title: 'AIP: Official Retail Fuel Price Tables',
    url: 'https://aip.com.au/resources/retail-fuel-price-tables',
    source: 'Research',
    description: 'Australian Institute of Petroleum weekly average retail petrol & diesel prices for Queensland.',
  },
  services_australia_medicare_15: {
    title: 'Services Australia: Getting Your Own Medicare Card at 15',
    url: 'https://www.servicesaustralia.gov.au/how-to-get-your-own-medicare-card-or-number',
    source: 'Services Australia',
    formCode: 'MS004',
    description: 'From age 15 in Australia, you can get your own green Medicare card for free to visit bulk-billing doctors independently and manage your own health records.',
  },
  auspost_tfn: {
    title: 'Australia Post: TFN Application for Australian Residents & Students',
    url: 'https://auspost.com.au/id-and-document-services/apply-for-a-tax-file-number',
    source: 'Australia Post',
    description: 'Free TFN application at Australia Post: fill out online form, book a free appointment, and present Australian Birth Certificate + Student ID.',
  },
  scamwatch_youth_scams: {
    title: 'Scamwatch: Spotting Job, Task & Money Muling Scams',
    url: 'https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams',
    source: 'Scamwatch',
    description: 'ACCC Scamwatch guide on fake TikTok/Instagram remote jobs, task scams, and the legal dangers of "money muling" through your bank account.',
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
};

/**
 * Junior Award Percentage Rates under Modern Awards.
 * Adult base rates are 2026-27 (4.75% increase from the first full pay period
 * on or after 1 July 2026 per the FWC Annual Wage Review).
 * IMPORTANT: From 1 December 2026 the FWC ([2026] FWCFB 75) phases out junior
 * rates for 18-20 year olds under the Retail, Fast Food and Pharmacy awards —
 * they move to the full adult rate after 6 months with the same employer.
 * Under-18 percentages below are unchanged.
 */
export const JUNIOR_AWARD_RATES = {
  fast_food: {
    code: 'MA000003',
    name: 'Fast Food Industry Award 2020 [MA000003]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate — $11.12/hr' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr' },
    ],
  },
  retail: {
    code: 'MA000004',
    name: 'General Retail Industry Award 2020 [MA000004]',
    adultBaseRate: 27.81, // Level 1, $1,056.80/wk 2026-27
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr (≤6 months with employer)' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (>6 months; from 1 Dec 2026 [2026] FWCFB 75)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate) — $27.81/hr' },
    ],
    note: 'Junior rates apply to Levels 1–3 only; Levels 4+ always adult rate. From 1 Dec 2026 FWCFB 75: 18–20 move to 100% after 6 months with same employer, phased to 1 July 2029.',
  },
  hospitality: {
    code: 'MA000009',
    name: 'Restaurant & Hospitality Award [MA000009]',
    adultBaseRate: 26.44, // National minimum wage, 2026-27 (Restaurant award base)
    rates: [
      { age: 'Under 17', pct: 0.50, label: '50% of Adult Rate' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate' },
      { age: '20 years', pct: 1.00, label: '100% (Adult Rate)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate)' },
    ],
  },
  pharmacy: {
    code: 'MA000012',
    name: 'Community Pharmacy Award 2020 [MA000012]',
    adultBaseRate: 27.81, // 2026-27 Levels 1–2 only
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate — $12.51/hr' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate — $13.91/hr' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate — $16.69/hr' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate — $19.47/hr' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate — $22.25/hr' },
      { age: '20 years (≤6 months)', pct: 0.90, label: '90% — $25.03/hr' },
      { age: '20 years (>6 months)', pct: 1.00, label: '100% — $27.81/hr (from 1 Dec 2026)' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate)' },
    ],
  },
  fitness: {
    code: 'MA000094',
    name: 'Fitness Industry Award 2020 [MA000094]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 17', pct: 0.55, label: '55% of Adult Rate' },
      { age: '17 years', pct: 0.65, label: '65% of Adult Rate' },
      { age: '18 years', pct: 0.75, label: '75% of Adult Rate' },
      { age: '19 years', pct: 0.85, label: '85% of Adult Rate' },
      { age: '20+ years', pct: 1.00, label: '100% (Adult Rate)' },
    ],
  },
};

/** Penalty Rate Multipliers under Australian Awards (illustrative — check PACT for exact award) */
export const PENALTY_RATES = {
  ordinary: { label: 'Ordinary Weekday Shift', multiplier: 1.00, icon: '📅' },
  saturday: { label: 'Saturday Shift (+25%)', multiplier: 1.25, icon: '⚡️' },
  sunday: { label: 'Sunday Shift (+50%)', multiplier: 1.50, icon: '🔥' },
  public_holiday_perm: { label: 'Public Holiday (permanent, 250% total)', multiplier: 2.50, icon: '🎉' },
  public_holiday_casual: { label: 'Public Holiday (casual, 275% incl. loading)', multiplier: 2.75, icon: '🎉' },
  night_shift: { label: 'Night / Evening Loading (+15%)', multiplier: 1.15, icon: '🌙' },
};

/** Allowances (indexed 1 July 2026 — award-specific, check PACT) */
export const WORKPLACE_ALLOWANCES = {
  mealAllowance: 18.15,
  uniformAllowancePerShift: 1.85,
  travelAllowancePerKm: 0.98,
};

/** Car Cost Defaults for 16-20yo Drivers (QLD 2026-27, source: qld.gov.au) */
export const TEEN_CAR_COST_DEFAULTS = {
  averagePurchasePrice: 4500,
  ppsrCheckFee: 2,
  regoAnnual: 453,          // QLD 4-cyl: registration $385.45 + traffic improvement fee $67.25 (1 Jul 2026)
  ctpGreenSlipAnnual: 418,  // QLD CTP class 1 average ($411.80-$424.80, 2026)
  comprehensiveInsuranceUnder25: 1650,
  fuelWeekly: 45,
  servicingAnnual: 450,
  tiresAndRepairsAnnual: 350,
};

/** High Yield Teen Savings Account Comparison (as at 15 Aug 2026 — rates variable, verify provider) */
export const TEEN_SAVINGS_ACCOUNTS = [
  {
    bank: 'Great Southern Bank Youth eSaver',
    maxRate: 5.50,
    baseRate: 5.50,
    conditions: 'No conditions — flat 5.50% to $5k (from 1 Jul 2026), then 1.00% excess; no monthly deposit required',
    maxAge: 17,
  },
  {
    bank: 'Newcastle Permanent Smart Saver (Under 25s)',
    maxRate: 5.75,
    baseRate: 0.05,
    conditions: 'Grow balance by any amount + ≤2 withdrawals per month (4.95% bonus)',
    maxAge: 25,
  },
  {
    bank: 'Westpac Bump Savings',
    maxRate: 5.05,
    baseRate: 1.75,
    conditions: 'Grow balance each month + 1 deposit, balance >$0 (3.30% bonus)',
    maxAge: 29,
  },
  {
    bank: 'ING Savings Maximiser (with Orange Everyday)',
    maxRate: 5.50,
    baseRate: 0.01,
    conditions: 'Deposit $1,000 + 5 settled card purchases + grow balance; 1 acct ≤$100k (0.10% above)',
    maxAge: 99,
  },
  {
    bank: 'CommBank Youthsaver',
    maxRate: 5.05,
    baseRate: 2.15,
    conditions: 'Grow balance each month (≤$50k at bonus rate; then 0.35%)',
    maxAge: 17,
  },
  {
    bank: 'AMP Bank GO Save — no-conditions benchmark',
    maxRate: 5.10,
    baseRate: 5.10,
    conditions: 'No deposit/withdrawal conditions — best ongoing no-conditions comparison',
    maxAge: 99,
  },
];

/**
 * Australian State & Territory Working Age & School Hours Rules for 15-Year-Olds.
 * Sources: Fair Work Ombudsman, State Child Employment Acts.
 */
export interface StateWorkingHoursRule {
  state: string;
  minAgeGeneral: string;
  schoolTermMaxHours: string;
  schoolDayMaxHours: string;
  holidayMaxHours: string;
  nightWorkRestrictions: string;
  keyRule: string;
}

export const AU_STATE_WORKING_HOURS_RULES: StateWorkingHoursRule[] = [
  {
    state: 'Queensland (QLD)',
    minAgeGeneral: '13 years (11 for paper delivery)',
    schoolTermMaxHours: 'Max 12 hours per week during school terms',
    schoolDayMaxHours: 'Max 4 hours on a school day',
    holidayMaxHours: 'Max 38 hours per week in school holidays (max 8 hrs/day)',
    nightWorkRestrictions: 'No work between 10:00pm and 6:00am',
    keyRule: 'School attendance is compulsory; employers cannot roster students during school hours.',
  },
  {
    state: 'New South Wales (NSW)',
    minAgeGeneral: 'No set minimum age for general retail/fast food',
    schoolTermMaxHours: 'No strict statutory hour cap, but compulsory schooling until 17',
    schoolDayMaxHours: 'Cannot work during official school hours (typically 8:30am–3:30pm)',
    holidayMaxHours: 'Standard award full-time limits apply (max 38 hrs/week)',
    nightWorkRestrictions: 'Must have safe travel home arrangements; late night work restricted',
    keyRule: 'Work must not interfere with education or health. Parental consent required for younger teens.',
  },
  {
    state: 'Victoria (VIC)',
    minAgeGeneral: '15 years for retail & food without permit (13–14 requires light work licence)',
    schoolTermMaxHours: 'Max 12 hours per week during school terms',
    schoolDayMaxHours: 'Max 3 hours on a school day',
    holidayMaxHours: 'Max 30 hours per week in school holidays (max 6 hrs/day)',
    nightWorkRestrictions: 'Cannot work after 9:00pm or before 6:00am',
    keyRule: 'Under Child Employment Act 2003, at 15 you can work in retail or hospitality without an employer permit.',
  },
  {
    state: 'Western Australia (WA)',
    minAgeGeneral: '15 years for general retail & food; 13–14 for light work with parental consent',
    schoolTermMaxHours: 'No work during school hours; max 12–16 hrs/week recommended',
    schoolDayMaxHours: 'Outside school hours only (after 3:30pm)',
    holidayMaxHours: 'Standard award limits apply',
    nightWorkRestrictions: 'No work between 10:00pm and 6:00am for under-15s',
    keyRule: 'Parental permission form required for 13-14 year olds; 15 year olds can work retail/hospitality freely.',
  },
  {
    state: 'South Australia (SA)',
    minAgeGeneral: 'No statutory minimum age, but compulsory education/training until 17',
    schoolTermMaxHours: 'Cannot work during school hours',
    schoolDayMaxHours: 'After school only',
    holidayMaxHours: 'Standard award limits apply',
    nightWorkRestrictions: 'No work that endangers safety or education',
    keyRule: 'Compulsory education law strictly prohibits employment during school hours without an exemption.',
  },
  {
    state: 'Tasmania / ACT / NT',
    minAgeGeneral: '15 years (or light work with parent consent)',
    schoolTermMaxHours: 'Work must not conflict with school attendance',
    schoolDayMaxHours: 'Outside school hours only',
    holidayMaxHours: 'Standard award limits apply',
    nightWorkRestrictions: 'Standard youth curfew protections apply',
    keyRule: 'Employers must comply with National Employment Standards and ensure shifts end with safe transport home.',
  },
];

/** Minimum Shift Lengths Under Australian Modern Awards */
export const MINIMUM_SHIFT_LENGTHS = [
  { award: 'Fast Food Industry Award [MA000003]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'If sent home early, employer must still pay the full 3 hours.' },
  { award: 'General Retail Industry Award [MA000004]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to supermarkets, department stores, fashion & hardware.' },
  { award: 'Restaurant Industry Award [MA000119]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to cafes, restaurants and takeaway outlets.' },
  { award: 'Hospitality Industry Award [MA000009]', casualMin: '2 Hours', partTimeMin: '3 Hours', note: 'Applies to hotels, resorts, event catering and function centres.' },
  { award: 'Community Pharmacy Award [MA000012]', casualMin: '3 Hours', partTimeMin: '3 Hours', note: 'Applies to pharmacy assistants and shop floor crew.' },
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
  { type: 'Secondary Photo ID (40 Points)', examples: 'Current High School Student ID Card (with photo), Proof of Age Card', note: 'Must have your photo and full legal name' },
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
    tip: 'Apply in August–October for big Christmas casual hiring intakes!',
  },
  {
    company: 'Coles Supermarkets',
    minAge: '15 Years',
    award: 'Retail Award / EBA',
    roles: 'Customer Service, Click & Collect Shopper, Night Fill Team',
    howToApply: 'Coles Careers online portal — set up job alerts for local stores',
    tip: 'Highlight teamwork and availability for weekend shifts.',
  },
  {
    company: "McDonald's Australia",
    minAge: '14–15 Years (State dependent)',
    award: 'Fast Food Award / EBA',
    roles: 'Front Counter Crew, Drive-Thru Team, Kitchen & Grill',
    howToApply: "Maccas Careers / 'Olivia' AI chat assistant on mcdonalds.com.au",
    tip: 'Australia’s #1 youth employer — amazing training & recognized resume credential.',
  },
  {
    company: "Hungry Jack's",
    minAge: '14–15 Years',
    award: 'Fast Food Award',
    roles: 'Front Counter, Drive-Thru, Burger Crew',
    howToApply: "Hungry Jack's Careers website or hand resume in-store during quiet hours (2–4pm)",
    tip: 'Great weekend hours and structured shift training.',
  },
  {
    company: 'Kmart Australia',
    minAge: '15 Years',
    award: 'Retail Award / EBA',
    roles: 'Store Team Member, Checkout, Fitting Room, Stocking',
    howToApply: 'Kmart Careers online application portal',
    tip: 'Massive hiring pushes before holiday periods; friendly customer service attitude is key.',
  },
  {
    company: 'Local Sports Associations (Refereeing / Umpiring)',
    minAge: '13–15 Years',
    award: 'Sports Officiating Rate ($20–$35 per game)',
    roles: 'Soccer Referee, Basketball Referee, Netball Umpire, Touch Football Referee',
    howToApply: 'Contact your local junior sports club or complete a Level 1 Junior Referee course',
    tip: 'Highest hourly pay for 15yos (cash or bank transfer, $25–$35/game), active, weekend morning shifts.',
  },
];

/** 15-Year-Old Independence Roadmap Milestones */
export const FIFTEEN_YO_ROADMAP_MILESTONES = [
  {
    step: 1,
    title: 'Apply for Your Free Tax File Number (TFN)',
    badge: 'Step 1 • Legal Prerequisite',
    summary: 'Apply online through Australia Post or myGov. It is 100% free (never pay a third-party fee!).',
    action: 'Book a free identity appointment at Australia Post with your Birth Certificate & Student ID.',
    linkKey: 'auspost_tfn',
  },
  {
    step: 2,
    title: 'Open a Zero-Fee 5.0%+ Youth Bank Account',
    badge: 'Step 2 • Banking & Savings',
    summary: 'Open a fee-free youth transaction account with Visa/Mastercard Debit and Apple Pay / Google Wallet. Provide your TFN to stop 47% tax on savings interest!',
    action: 'Compare Great Southern Bank (5.50%), Newcastle Permanent (5.75%), or Westpac Bump (5.00%).',
    linkKey: 'moneysmart_banking',
  },
  {
    step: 3,
    title: 'Claim Your Own Green Medicare Card',
    badge: 'Step 3 • Healthcare Independence',
    summary: 'From age 15 in Australia, Services Australia allows you to get your own separate green Medicare card to visit bulk-billing doctors independently and manage your own health records.',
    action: 'Submit Services Australia Form MS004 online or at a service centre.',
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
    id: 'student_edge_retail',
    category: 'Food & Retail',
    title: 'Student Edge 10–15% Retail & Dining Deals',
    provider: 'Student Edge (Boost Juice, McDonald’s, ASOS, JD Sports)',
    discount: '10% off Boost Juice, $5 meal deals, 15% off shoes & fashion',
    estimatedYearlySavings: 160,
    howToGet: 'Download the free Student Edge app and show digital membership card at checkout.',
    linkKey: 'student_edge',
  },
];


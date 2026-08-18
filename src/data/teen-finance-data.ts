/**
 * Official Australian Teen Financial Reference Data
 * Sources: ATO, Fair Work Ombudsman, Moneysmart, Services Australia, PPSR, SafeWork Australia, RTBA, RBO, RTA
 */

export interface WebLink {
  title: string;
  url: string;
  source: 'ATO' | 'Fair Work' | 'Moneysmart' | 'Services Australia' | 'PPSR' | 'Reserve Bank' | 'Scamwatch' | 'ACCC' | 'APRA' | 'SafeWork' | 'ASX' | 'Moomoo' | 'ETF Provider' | 'Media' | 'Research' | 'QLD Government' | 'Brisbane City Council' | 'Federal Government' | 'University';
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
    description: 'Centrelink independence test, fortnightly income-free area ($539), and student start-up loans.',
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
  qtac: {
    title: 'QTAC: Queensland Tertiary Admissions Centre',
    url: 'https://www.qtac.edu.au',
    source: 'University',
    description: 'Official QLD application hub for school leavers — preferences, ATAR offers and scholarships.',
  },
  tafe_qld: {
    title: 'TAFE Queensland: Courses & Apprenticeships',
    url: 'https://tafeqld.edu.au',
    source: 'QLD Government',
    description: 'Practical diploma and apprenticeship pathways across Queensland — often cheaper than uni.',
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
      { age: 'Under 16', pct: 0.40, label: '40% of Adult Rate' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate)' },
    ],
  },
  retail: {
    code: 'MA000004',
    name: 'General Retail Industry Award 2020 [MA000004]',
    adultBaseRate: 27.81, // Level 1, 2026-27
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate' },
      { age: '21+ years', pct: 1.00, label: '100% (Adult Rate)' },
    ],
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
    adultBaseRate: 27.81, // 2026-27
    rates: [
      { age: 'Under 16', pct: 0.45, label: '45% of Adult Rate' },
      { age: '16 years', pct: 0.50, label: '50% of Adult Rate' },
      { age: '17 years', pct: 0.60, label: '60% of Adult Rate' },
      { age: '18 years', pct: 0.70, label: '70% of Adult Rate' },
      { age: '19 years', pct: 0.80, label: '80% of Adult Rate' },
      { age: '20 years', pct: 0.90, label: '90% of Adult Rate' },
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

/** Penalty Rate Multipliers under Australian Awards */
export const PENALTY_RATES = {
  ordinary: { label: 'Ordinary Weekday Shift', multiplier: 1.00, icon: '📅' },
  saturday: { label: 'Saturday Shift (+25% to +50%)', multiplier: 1.25, icon: '⚡️' },
  sunday: { label: 'Sunday Shift (+50% to +100%)', multiplier: 1.50, icon: '🔥' },
  public_holiday: { label: 'Public Holiday (+125% to +150%)', multiplier: 2.25, icon: '🎉' },
  night_shift: { label: 'Night Shift Loading (+15%)', multiplier: 1.15, icon: '🌙' },
};

/** Allowances */
export const WORKPLACE_ALLOWANCES = {
  mealAllowance: 15.50,
  uniformAllowancePerShift: 1.50,
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

/** High Yield Teen Savings Account Comparison (Aug 2026 — rates as at 18 Aug 2026) */
export const TEEN_SAVINGS_ACCOUNTS = [
  {
    bank: 'Great Southern Bank Youth eSaver',
    maxRate: 5.50,
    baseRate: 5.50,
    conditions: 'No conditions — flat rate on balances up to $5,000',
    maxAge: 17,
  },
  {
    bank: 'Newcastle Permanent Smart Saver (Under 25s)',
    maxRate: 5.75,
    baseRate: 0.05,
    conditions: 'Meet monthly bonus conditions (deposit & no withdrawals)',
    maxAge: 25,
  },
  {
    bank: 'Westpac Bump Savings',
    maxRate: 5.00,
    baseRate: 0.40,
    conditions: 'Grow balance each month (deposit > $0)',
    maxAge: 29,
  },
  {
    bank: 'ING Savings Maximiser',
    maxRate: 5.50,
    baseRate: 0.55,
    conditions: 'Deposit $1,000, make 5 card purchases in month',
    maxAge: 99,
  },
  {
    bank: 'CommBank Youthsaver',
    maxRate: 5.00,
    baseRate: 0.35,
    conditions: 'Deposit at least $1 per month & make 0 withdrawals',
    maxAge: 17,
  },
];

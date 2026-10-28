/**
 * Essential Australian Statutory & Regulatory Web Links (2026-27)
 * Lightweight subset (127 links) actively referenced by calculators, student discounts, and module guides.
 */

export interface WebLink {
  title: string;
  url: string;
  source: string;
  description: string;
  formCode?: string;
  productCode?: string;
}

export const STATUTORY_LINKS: Record<string, WebLink> = {
  "accc_cdr": {
    "title": "ACCC: Consumer Data Right (Open Banking Security)",
    "url": "https://www.cdr.gov.au/",
    "source": "ACCC",
    "description": "Official portal on Open Banking security allowing teens to connect budgeting apps safely via OAuth without password sharing."
  },
  "accc_consumer_rights": {
    "title": "ACCC: Australian Consumer Law & Guarantees",
    "url": "https://www.accc.gov.au/consumers",
    "source": "ACCC",
    "description": "Official consumer rights guide on repairs, replacements, refunds, and faulty products."
  },
  "acsc_cyber_safety": {
    "title": "Cyber.gov.au: Australian Cyber Security Centre (ACSC)",
    "url": "https://www.cyber.gov.au/protect-yourself-and-your-family-online",
    "source": "Federal Government",
    "description": "Official Australian Government guidance on multi-factor authentication (MFA), passkeys, phishing defense, and reporting cyber incidents."
  },
  "acu_study": {
    "title": "ACU: Australian Catholic University (Banyo, Brisbane)",
    "url": "https://www.acu.edu.au/study-at-acu",
    "source": "University",
    "description": "ACU degrees in nursing, paramedicine, education, physiotherapy, and law."
  },
  "afca_financial_disputes": {
    "title": "AFCA: Australian Financial Complaints Authority",
    "url": "https://www.afca.org.au/",
    "source": "AFCA",
    "description": "Free, independent external dispute resolution body (1800 931 678) resolving consumer complaints against banks, BNPL providers, and insurers."
  },
  "aip_fuel_prices": {
    "title": "Australian Institute of Petroleum (AIP): Weekly Petrol Prices",
    "url": "https://aip.com.au/pricing/weekly-prices-reports/",
    "source": "Research",
    "description": "Official national and state terminal gate and retail fuel price data."
  },
  "apra_fcs": {
    "title": "APRA: Financial Claims Scheme ($250,000 Deposit Guarantee)",
    "url": "https://www.fcs.gov.au/",
    "source": "APRA",
    "description": "Official Australian Government guarantee protecting up to $250,000 per depositor per bank (ADI)."
  },
  "asic_info_269": {
    "title": "ASIC INFO 269: Discussing Financial Products & Services Online",
    "url": "https://asic.gov.au/regulatory-resources/financial-services/giving-financial-product-advice/discussing-financial-products-and-services-online/",
    "source": "ASIC",
    "description": "Official ASIC regulatory guidance on social media 'finfluencers', unlicenced financial product advice, affiliate link dealing, and penalties under the Corporations Act 2001."
  },
  "asx_etf_centre": {
    "title": "ASX: ETF & ETP Products Hub",
    "url": "https://www.asx.com.au/markets/trade-our-cash-market/overview/etfs-and-other-etps",
    "source": "ASX",
    "description": "Official ASX list of all exchange traded products including ETFs, monthly FUM data and product documents."
  },
  "asx_invest_education": {
    "title": "ASX: Learn How to Invest in Shares & ETFs",
    "url": "https://www.asx.com.au/investors/investment-tools-and-resources/online-courses",
    "source": "ASX",
    "description": "Free ASX investor education covering how the market works, index investing, diversification and trading basics."
  },
  "ato_deductions_clothing": {
    "title": "ATO: Clothing, Laundry & Work-Related Deductions",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/clothes-and-items-you-wear-at-work/clothing-laundry-and-dry-cleaning-expenses",
    "source": "ATO",
    "description": "Rules for claiming compulsory logo uniforms, $150 laundry allowance without receipts, protective gear, and work-required certificates."
  },
  "ato_deductions_wfh": {
    "title": "ATO: Working from Home Fixed Rate Method (PCG 2023/1)",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/working-from-home-expenses",
    "source": "ATO",
    "description": "Revised fixed rate method (70c/hour per PCG 2023/1) covering electricity, gas, internet, mobile phone usage, and stationery without separate apportionment."
  },
  "ato_deductions_travel": {
    "title": "ATO: Motor Vehicle Cents-Per-Km & Travel Deductions",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/work-related-deductions/cars-transport-and-travel",
    "source": "ATO",
    "description": "Cents-per-kilometre deduction rate (91c/km up to 5,000 km) and logbook methods for claiming work-related travel between separate workplaces."
  },
  "ato_instant_asset_write_off": {
    "title": "ATO: Small Business Instant Asset Write-Off ($20,000 Threshold)",
    "url": "https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/depreciation-and-capital-expenses-and-allowances/simpler-depreciation-for-small-business/instant-asset-write-off",
    "source": "ATO",
    "description": "Small business instant asset write-off allowing sole traders and small businesses under $10M turnover to immediately deduct eligible assets under $20,000."
  },
  "ato_lito": {
    "title": "ATO: Low Income Tax Offset (LITO Up to $700)",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-and-middle-income-earner-tax-offsets",
    "source": "ATO",
    "description": "Full $700 LITO offset for incomes up to $37,500, lifting the effective tax-free threshold to $22,575."
  },
  "ato_lost_super": {
    "title": "ATO: Find & Consolidate Lost Super",
    "url": "https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/keeping-track-of-your-super",
    "source": "ATO",
    "description": "Use myGov to find lost super accounts, check balances and roll everything into one stapled fund to stop fee drain."
  },
  "ato_minor_income": {
    "title": "ATO: Division 6AA Tax Rates for Minors Under 18",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old",
    "source": "ATO",
    "description": "ATO unearned income tax rates: $416 tax-free threshold for minor investment & interest income."
  },
  "ato_mygov": {
    "title": "ATO: myGov & Digital Identity Portal",
    "url": "https://www.ato.gov.au/online-services/online-services-for-individuals-and-sole-traders/ato-online-services-and-mygov/create-a-mygov-account-and-link-it-to-the-ato",
    "source": "ATO",
    "description": "Official Australian Government portal connecting ATO tax, Medicare, and Centrelink."
  },
  "ato_mytax": {
    "title": "ATO: myTax Online Tax Return Lodgement",
    "url": "https://www.ato.gov.au/individuals-and-families/your-tax-return/how-to-lodge-your-tax-return/lodge-your-tax-return-online-with-mytax",
    "source": "ATO",
    "description": "Official ATO portal for lodging your annual individual tax return online."
  },
  "ato_study_loans": {
    "title": "ATO: Study and Training Support Loans Repayment Guidelines",
    "url": "https://www.ato.gov.au/individuals-and-families/study-and-training-support-loans",
    "source": "ATO",
    "description": "Income-contingent repayment thresholds, compulsory withholding schedules, and indexation rules for HELP/HECS debts."
  },
  "ato_super_choice_form": {
    "title": "ATO: Superannuation Standard Choice Form (NAT 13080)",
    "url": "https://www.ato.gov.au/forms-and-instructions/superannuation-standard-choice-form",
    "source": "ATO",
    "description": "Official ATO form to provide your existing stapled super fund USI & Member ID to your new employer.",
    "formCode": "NAT 13080"
  },
  "ato_super_co_contribution": {
    "title": "ATO: Super Co-Contribution for Low Earners ($500 Matching)",
    "url": "https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/how-to-save-more-in-your-super/government-super-contributions/super-co-contribution",
    "source": "ATO",
    "description": "Federal Government co-contribution matches 50c per dollar of after-tax super contributions up to $500 for low and middle-income earners."
  },
  "ato_super_guarantee": {
    "title": "ATO: Super Guarantee Eligibility Rules",
    "url": "https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super",
    "source": "ATO",
    "description": "Under 18 super guarantee rule: must work >30 hours in a calendar week under SGAA 1992 s 19(10) to receive 12.0% Super."
  },
  "ato_tax_rates": {
    "title": "ATO: Individual Income Tax Rates & Stage 3 Brackets",
    "url": "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
    "source": "ATO",
    "description": "Official 2026-27 Australian resident individual tax brackets including the $18,200 threshold and 15% lowest bracket."
  },
  "ato_tfn": {
    "title": "ATO: How to Apply for a Tax File Number (TFN)",
    "url": "https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn",
    "source": "ATO",
    "description": "Step-by-step TFN application rules for 13-15 and 15+ year olds via myID and Post Office."
  },
  "ato_tfn_bank": {
    "title": "ATO: Providing Your TFN to Banks (Section 202D)",
    "url": "https://www.ato.gov.au/individuals-and-families/tax-file-number/what-is-a-tax-file-number",
    "source": "ATO",
    "description": "ATO rule: providing your TFN to your bank prevents 47% top marginal withholding tax on savings interest."
  },
  "ato_tfn_form": {
    "title": "ATO: Tax File Number Declaration Form (NAT 3092)",
    "url": "https://www.ato.gov.au/forms-and-instructions/tfn-declaration",
    "source": "ATO",
    "description": "Official ATO form completed when starting a new job to claim the $18,200 Tax-Free Threshold.",
    "formCode": "NAT 3092"
  },
  "ato_under18": {
    "title": "ATO: Income Tax Rates & Rules for Under 18s",
    "url": "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/your-income-if-you-are-under-18-years-old",
    "source": "ATO",
    "description": "Official ATO guide on earned income vs unearned income tax rates for minors."
  },
  "auspost_tfn": {
    "title": "Australia Post: TFN Application for Australian Residents & Students",
    "url": "https://auspost.com.au/id-and-document-services/apply-for-a-tax-file-number",
    "source": "Australia Post",
    "description": "Free TFN application at Australia Post: fill out online form, book a free appointment, and present Australian Birth Certificate + Student ID."
  },
  "barefoot_teen_buckets": {
    "title": "The Barefoot Investor: 3-Bucket System for Young Earners",
    "url": "https://barefootinvestor.com/",
    "source": "Media",
    "description": "Scott Pape's proven 60% Blow, 20% Mojo, and 20% Grow account structure tailored for casual paychecks."
  },
  "bcc_council_carparks": {
    "title": "Brisbane City Council: King George Square & Wickham Tce Car Parks",
    "url": "https://www.brisbane.qld.gov.au/transport-and-parking/parking/council-car-parks",
    "source": "Brisbane City Council",
    "description": "Official council parking facilities in the Brisbane CBD with night and weekend flat rate specials."
  },
  "bcc_parking": {
    "title": "Brisbane City Council: Parking Meters, Zones & Permits",
    "url": "https://www.brisbane.qld.gov.au/transport-and-parking/parking/parking-meters-and-fees",
    "source": "Brisbane City Council",
    "description": "Zones 1–3 on-street parking rates, free 15-minute parking, and weekend/night parking rules."
  },
  "betashares_etfs": {
    "title": "Betashares: ETF Range & Research",
    "url": "https://www.betashares.com.au",
    "source": "ETF Provider",
    "description": "Betashares ETFs (A200, NDQ, ETHI) including annual performance tables, distributions and DRP details."
  },
  "blackrock_etfs": {
    "title": "iShares by BlackRock: ASX ETF Range",
    "url": "https://www.ishares.com/au",
    "source": "ETF Provider",
    "description": "iShares ETFs (IVV, IOZ) with fund performance, holdings and distribution history."
  },
  "boq_future_saver_youth": {
    "title": "BOQ: Future Saver Account (5.80% p.a. for Ages 14–35)",
    "url": "https://www.boq.com.au/personal/banking/savings-and-term-deposits/future-saver-account",
    "source": "Bank",
    "description": "Market-leading youth savings rate (5.80% p.a. up to $50k) with deposit and card hurdles automatically WAIVED for ages 14–17."
  },
  "etfinfo": {
    "title": "ASX: ETF Course & Information Hub",
    "url": "https://www.asx.com.au/markets/trade-our-cash-market/overview/etfs-and-other-etps",
    "source": "ASX",
    "description": "ASX official directory and educational materials for exchange-traded funds."
  },
  "ev_council": {
    "title": "Electric Vehicle Council Australia: State of EVs",
    "url": "https://evc.org.au",
    "source": "Transport",
    "description": "Official peak industry body for electric vehicles in Australia, publishing national EV data, charging network maps, and ownership economics."
  },
  "fairwork_awards": {
    "title": "Fair Work Ombudsman: Pay & Junior Award Rates Calculator",
    "url": "https://calculate.fairwork.gov.au/",
    "source": "Fair Work",
    "description": "Official PACT calculator for Retail, Fast Food, and Hospitality junior pay percentage rates."
  },
  "fairwork_breaks": {
    "title": "Fair Work Ombudsman: Rest Pauses & Meal Break Entitlements",
    "url": "https://www.fairwork.gov.au/employment-conditions/hours-of-work-breaks-and-rosters/breaks",
    "source": "Fair Work",
    "description": "Official award break rules: 10-minute paid rest pause for 4+ hour shifts; 30-60 minute unpaid meal break for 5+ hour shifts."
  },
  "fairwork_ceis": {
    "title": "Casual Employment Information Statement (CEIS)",
    "url": "https://www.fairwork.gov.au/employment-conditions/information-statements/casual-employment-information-statement",
    "source": "Fair Work",
    "description": "Mandatory statement given to casual workers detailing 25% casual loading & casual conversion rights.",
    "formCode": "CEIS"
  },
  "fairwork_fwis": {
    "title": "Fair Work Information Statement (FWIS)",
    "url": "https://www.fairwork.gov.au/employment-conditions/information-statements/fair-work-information-statement",
    "source": "Fair Work",
    "description": "Mandatory document employers must provide to all new employees outlining minimum workplace rights.",
    "formCode": "FWIS"
  },
  "fairwork_min_age": {
    "title": "Fair Work Ombudsman: Minimum Working Age Rules",
    "url": "https://www.fairwork.gov.au/find-help-for/young-workers-and-students/minimum-working-age",
    "source": "Fair Work",
    "description": "Official rules on the minimum age for work in each state and territory, including school attendance protections."
  },
  "fairwork_minimum_shifts": {
    "title": "Fair Work Ombudsman: Minimum Hours per Shift Rules",
    "url": "https://www.fairwork.gov.au/starting-employment/types-of-employees/casual-employees",
    "source": "Fair Work",
    "description": "By law under Fast Food and Retail Awards, employers must provide a minimum of 3 hours per shift for casual workers."
  },
  "fairwork_payslip": {
    "title": "Fair Work Ombudsman: Legal Payslip Requirements",
    "url": "https://www.fairwork.gov.au/pay-and-wages/paying-wages/pay-slips",
    "source": "Fair Work",
    "description": "Mandatory line items on Australian payslips under Section 536 of the Fair Work Act 2009."
  },
  "fairwork_penalty_rates": {
    "title": "Fair Work: Penalty Rates & Public Holiday Pay",
    "url": "https://www.fairwork.gov.au/pay-and-wages/penalty-rates-allowances-and-other-payments/penalty-rates",
    "source": "Fair Work",
    "description": "Overtime and penalty multiplier percentages for Saturday, Sunday, late-night shifts, and public holiday work."
  },
  "fairwork_unpaid_trials": {
    "title": "Fair Work Ombudsman: Unpaid Trials & Work Rights",
    "url": "https://www.fairwork.gov.au/starting-employment/unpaid-work/unpaid-trials",
    "source": "Fair Work",
    "description": "Official guidelines stating skills tests can only last 1-2 hours; paid shifts required beyond that."
  },
  "fairwork_young_workers": {
    "title": "Fair Work Ombudsman: Young Workers & Students",
    "url": "https://www.fairwork.gov.au/find-help-for/young-workers-and-students",
    "source": "Federal Government",
    "description": "Official Fair Work Ombudsman hub for teenagers entering the workforce, covering junior pay, trial shifts, break entitlements, and school hours."
  },
  "fool_etf_news": {
    "title": "Motley Fool Australia: Top ASX ETFs",
    "url": "https://www.fool.com.au/investing/etfs/",
    "source": "Media",
    "description": "Australian market analysis, ETF trends, and beginner share investing guides."
  },
  "green_vehicle_guide": {
    "title": "Green Vehicle Guide: Compare EV & Fuel Efficiency",
    "url": "https://www.greenvehicleguide.gov.au",
    "source": "Federal Government",
    "description": "Official Australian Government fuel consumption (L/100km) and EV energy use (kWh/100km) ratings."
  },
  "griffith_study": {
    "title": "Griffith University: Study & Degree Programs",
    "url": "https://www.griffith.edu.au/study",
    "source": "University",
    "description": "Griffith University degrees across South Bank, Nathan, and Gold Coast."
  },
  "mob_strong_debt": {
    "title": "Mob Strong Debt Help: First Nations Financial Rights",
    "url": "https://financialrights.org.au/mob-strong-debt-help/",
    "source": "Financial Rights Legal Centre",
    "description": "Dedicated, culturally safe free legal and financial advice service on 1800 808 488 for Aboriginal and Torres Strait Islander mob across Australia."
  },
  "moneysmart_banking": {
    "title": "Moneysmart: Bank Accounts & High-Interest Savings",
    "url": "https://moneysmart.gov.au/banking",
    "source": "Moneysmart",
    "description": "Australian Government guide to choosing bank accounts, high-interest savings bonus conditions, and zero-fee accounts."
  },
  "moneysmart_budget": {
    "title": "Moneysmart: Budgeting & Saving for Young People",
    "url": "https://moneysmart.gov.au/budgeting",
    "source": "Moneysmart",
    "description": "Australian Government MoneySmart tools for setting up spending, saving, and emergency buffer buckets."
  },
  "moneysmart_car": {
    "title": "Moneysmart: Buying & Running Your First Car",
    "url": "https://moneysmart.gov.au/buying-a-car",
    "source": "Moneysmart",
    "description": "True cost of car ownership guide including rego, CTP green slip, insurance, and servicing."
  },
  "moneysmart_compound": {
    "title": "Moneysmart: Compound Interest Explained",
    "url": "https://moneysmart.gov.au/budgeting/compound-interest-calculator",
    "source": "Moneysmart",
    "description": "Government interactive compound interest tool showing how early investing supercharges long-term growth."
  },
  "moneysmart_debt": {
    "title": "Moneysmart: Managing Debt & Credit Traps",
    "url": "https://moneysmart.gov.au/managing-debt",
    "source": "Moneysmart",
    "description": "Government guide on BNPL risks, credit cards, and National Debt Helpline (1800 007 007) support."
  },
  "ndh_helpline": {
    "title": "National Debt Helpline (NDH): Free Financial Counselling",
    "url": "https://ndh.org.au/",
    "source": "Federal Government",
    "description": "100% free, confidential, government-funded community financial counselling on 1800 007 007, 24/7 online chat, and legal hardship templates."
  },
  "moneysmart_investing": {
    "title": "Moneysmart: How to Invest in Shares & ETFs",
    "url": "https://moneysmart.gov.au/how-to-invest",
    "source": "Moneysmart",
    "description": "Australian Government guide to shares, ETFs, managed funds, risk and the \"investing is a marathon\" mindset."
  },
  "moneysmart_saving_goals": {
    "title": "ASIC Moneysmart: Savings Goals Calculator",
    "url": "https://moneysmart.gov.au/saving/savings-goals-calculator",
    "source": "Federal Government",
    "description": "Official ASIC Moneysmart calculator helping young Australians calculate how long it takes to save for emergency buffers, cars, or study."
  },
  "moneysmart_super": {
    "title": "Moneysmart: Superannuation & How It Works",
    "url": "https://moneysmart.gov.au/how-super-works",
    "source": "Moneysmart",
    "description": "Government guide to choosing super funds, low-fee options, and long-term compounding."
  },
  "moomoo_au": {
    "title": "moomoo Australia: Share Trading Platform",
    "url": "https://www.moomoo.com/au",
    "source": "Moomoo",
    "description": "Australia's top-rated trading app. Trade 26,000+ stocks & ETFs on the ASX, US and Hong Kong markets. CHESS-sponsored on all ASX trades."
  },
  "moomoo_dividend_etfs": {
    "title": "moomoo: 10 Best High Dividend ETFs in Australia",
    "url": "https://www.moomoo.com/au/learn/detail-best-dividend-etf-australia-117437-240938044",
    "source": "Moomoo",
    "description": "Research on top ASX high dividend ETFs (VHY, SYI, IHD, RDV) including dividend yield, MER and distribution history."
  },
  "moomoo_etf_guide": {
    "title": "moomoo: How to Invest in ETFs in Australia",
    "url": "https://www.moomoo.com/au/invest/etf",
    "source": "Moomoo",
    "description": "Beginner ETF guide covering diversification, low fees, transparency and how ETFs trade like shares during market hours."
  },
  "nsw_dkt_practice": {
    "title": "Transport for NSW: Practice Driver Knowledge Test (DKT)",
    "url": "https://www.service.nsw.gov.au/services/learner-driver-licence",
    "source": "Transport",
    "description": "Official NSW practice test tool for 15-year-olds preparing to get their Learner licence on their 16th birthday."
  },
  "ppsr_check": {
    "title": "PPSR: Official Australian Vehicle Financial Search ($2)",
    "url": "https://www.ppsr.gov.au/searching/do-used-car-or-vehicle-search",
    "source": "PPSR",
    "description": "Official government register to check if a second-hand car has money owing or was written off ($2 fee)."
  },
  "qcaa": {
    "title": "QCAA: Queensland Curriculum and Assessment Authority",
    "url": "https://www.qcaa.qld.edu.au",
    "source": "QLD Government",
    "description": "Senior curriculum, subject syllabuses, external assessment, and Academic Integrity course."
  },
  "qcaa_academic_integrity": {
    "title": "QCAA: Academic Integrity Course for Senior Students",
    "url": "https://www.qcaa.qld.edu.au/senior/assessment/academic-integrity",
    "source": "QLD Government",
    "description": "Mandatory principles of citation, avoiding plagiarism, and ethical use of generative AI in secondary assessment tasks."
  },
  "qce_atar": {
    "title": "QCAA: Queensland Certificate of Education (QCE) & Senior Syllabus",
    "url": "https://www.qcaa.qld.edu.au/senior/certificates-and-qualifications/qce",
    "source": "QLD Government",
    "description": "Official 20-credit QCE requirements, core subjects, and ATAR eligibility rules."
  },
  "qilt_survey": {
    "title": "QILT: Quality Indicators for Learning and Teaching",
    "url": "https://www.qilt.edu.au",
    "source": "Research",
    "description": "Official Australian Government survey of graduate salaries, full-time employment, and student satisfaction."
  },
  "qld_boost_to_buy": {
    "title": "Queensland Government: Boost to Buy Shared Equity Scheme",
    "url": "https://www.treasury.qld.gov.au/policies-and-programs/home-ownership/boost-to-buy/",
    "source": "QLD Government",
    "description": "Queensland Government shared equity scheme helping eligible buyers purchase with a 2% deposit."
  },
  "qld_child_employment_ce1": {
    "title": "Queensland Government: Parent's Consent Form CE1 (Child Employment Act 2006)",
    "url": "https://www.business.qld.gov.au/running-business/employing/hiring-recruitment/employing-children",
    "source": "QLD Government",
    "description": "Statutory Form CE1 parent consent form required for school-aged children under 16 working in Queensland.",
    "formCode": "CE1"
  },
  "qld_fhog": {
    "title": "Queensland Revenue Office: $30,000 First Home Owner Grant",
    "url": "https://qro.qld.gov.au/property-concessions-grants/first-home-grant/",
    "source": "QLD Government",
    "description": "Up to $30,000 for new homes under $750,000 in Queensland, plus transfer duty exemptions."
  },
  "qld_getting_licence": {
    "title": "Queensland Government: Graduated Driver Licensing System",
    "url": "https://www.qld.gov.au/transport/licensing/driver-licensing",
    "source": "QLD Government",
    "description": "Complete rules and regulations for Queensland learner and provisional P1/P2 drivers."
  },
  "qld_hpt": {
    "title": "Queensland Government: Hazard Perception Test (HPT)",
    "url": "https://www.qld.gov.au/transport/licensing/getting/hazard-perception-test",
    "source": "QLD Government",
    "description": "Online test required before booking your practical driving test ($42.70 fee, valid 12 months)."
  },
  "qld_licence_fees": {
    "title": "Queensland Government: Driver Licensing Fees (2026-27)",
    "url": "https://www.qld.gov.au/transport/licensing/driver-licensing/fees",
    "source": "QLD Government",
    "description": "Statutory fees for PrepL, Learner licences, Hazard Perception Tests, and Provisional licences."
  },
  "qld_licence_steps": {
    "title": "Queensland Government: Getting a Driver Licence (PrepL to Open)",
    "url": "https://www.qld.gov.au/transport/licensing/getting",
    "source": "QLD Government",
    "description": "Official step-by-step roadmap from PrepL at 15.9 to Learner licence at 16, 100 logbook hours, P1, P2, and open licence."
  },
  "qld_practical_test": {
    "title": "Queensland Government: Booking Your Practical Driving Test (Q-SAFE)",
    "url": "https://www.qld.gov.au/transport/licensing/getting/practical-tests-driving-test",
    "source": "QLD Government",
    "description": "How to prepare and book your 30-minute on-road practical driving test with TMR ($69.40 fee)."
  },
  "qld_prepl": {
    "title": "Queensland Government: PrepL Online Driving Course & Test",
    "url": "https://www.qld.gov.au/transport/licensing/getting/learner/prepl",
    "source": "QLD Government",
    "description": "Sit your QLD learner driver knowledge test online at home from age 15 years 11 months ($29.70 fee)."
  },
  "qld_rego": {
    "title": "Queensland Government: Vehicle Registration & Transfer Duty",
    "url": "https://www.qld.gov.au/transport/registration/fees/cost",
    "source": "QLD Government",
    "description": "Official breakdown of registration fees, traffic improvement fees, and vehicle registration duty in QLD."
  },
  "qld_rta": {
    "title": "Residential Tenancies Authority (RTA) Queensland: Rental Bonds & Tenant Rights",
    "url": "https://www.rta.qld.gov.au/starting-a-tenancy/rental-bond",
    "source": "QLD Government",
    "description": "Official QLD rental rules: 4-week maximum bond for all tenancies, 12-month limit on rent increases attached to the property, and mandatory 10-day bond lodgement."
  },
  "qld_school_based": {
    "title": "QLD: School-Based Apprenticeships & Traineeships (SATs)",
    "url": "https://desbt.qld.gov.au/training/apprentices/school-based",
    "source": "QLD Government",
    "description": "Start an apprenticeship or traineeship in Years 10-12: combine paid work, TAFE training and school to earn a national qualification."
  },
  "qtac": {
    "title": "QTAC: Queensland Tertiary Admissions Centre",
    "url": "https://www.qtac.edu.au",
    "source": "University",
    "description": "Official portal for university preferences, ATAR scaling, and guaranteed early offer schemes in Queensland."
  },
  "qut_study": {
    "title": "QUT: Courses, Degrees & Brisbane 2032 Innovation",
    "url": "https://www.qut.edu.au/study",
    "source": "University",
    "description": "Queensland University of Technology degree pathways, CSP fees, and Olympic innovation hubs."
  },
  "racq_fuel": {
    "title": "RACQ: Queensland Fuel Prices & Price Cycle",
    "url": "https://www.racq.com.au/car/queensland-fuel-prices",
    "source": "Research",
    "description": "Queensland fuel price comparison and the South East QLD 23-to-28 day price cycle."
  },
  "rba_cash_rate": {
    "title": "Reserve Bank of Australia: Cash Rate Target Decisions",
    "url": "https://www.rba.gov.au/statistics/cash-rate/",
    "source": "Reserve Bank",
    "description": "Official RBA board decisions on the monetary policy cash rate target and policy statements."
  },
  "reviewetf": {
    "title": "ReviewETF: Best Performing ASX ETFs",
    "url": "https://www.reviewetf.com.au/best-etfs",
    "source": "Research",
    "description": "Independent comparison of 500+ ASX ETFs ranked by 1-year returns, MER and fund size."
  },
  "safework_au": {
    "title": "SafeWork Australia: Young Worker Health & Safety",
    "url": "https://www.safeworkaustralia.gov.au/safety-topic/managing-health-and-safety/young-workers/overview",
    "source": "SafeWork",
    "description": "Workplace health and safety (WHS) rights, injury reporting, and WorkCover insurance for teens."
  },
  "scamwatch_au": {
    "title": "Scamwatch: Spotting & Reporting Financial Scams",
    "url": "https://www.scamwatch.gov.au",
    "source": "Scamwatch",
    "description": "ACCC Scamwatch guide for young people on identifying social media & banking scams, smishing, and impersonation fraud."
  },
  "scamwatch_youth_scams": {
    "title": "Scamwatch: Spotting Job, Task & Money Muling Scams",
    "url": "https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams",
    "source": "Scamwatch",
    "description": "ACCC Scamwatch guide on fake TikTok/Instagram remote jobs, task scams, and the legal dangers of \"money muling\" through your bank account."
  },
  "services_australia_medicare_15": {
    "title": "Services Australia: Getting Your Own Medicare Card at 15 (Form MS011)",
    "url": "https://www.servicesaustralia.gov.au/have-your-own-medicare-card-and-number-if-youre-15-or-older-and-enrolled-medicare",
    "source": "Services Australia",
    "description": "From age 15, Australian teens can get their own green Medicare card (via myGov or Form MS011) for confidential doctor visits and bulk-billing.",
    "formCode": "MS011"
  },
  "services_australia_medicare_ms004": {
    "title": "Services Australia: Application to Copy or Transfer from Medicare Card (Form MS004)",
    "url": "https://www.servicesaustralia.gov.au/ms004",
    "source": "Services Australia",
    "description": "Statutory application form to transfer or copy from one Medicare card to another for young people aged 15 and older.",
    "formCode": "MS004"
  },
  "services_australia_rent_assistance": {
    "title": "Services Australia: Commonwealth Rent Assistance",
    "url": "https://www.servicesaustralia.gov.au/rent-assistance",
    "source": "Services Australia",
    "description": "Supplementary payment helping young renters on Centrelink payments meet private rental or boarding house costs."
  },
  "services_australia_start_up_loan": {
    "title": "Services Australia: Student Start-up Loan ($1,349/semester)",
    "url": "https://www.servicesaustralia.gov.au/student-start-up-loan",
    "source": "Services Australia",
    "description": "Voluntary income-contingent HELP loan to help higher education students buy textbooks, laptops, and study materials."
  },
  "services_australia_youth": {
    "title": "Services Australia: Youth Allowance & Student Start-up Loan",
    "url": "https://www.servicesaustralia.gov.au/youth-allowance",
    "source": "Services Australia",
    "description": "Centrelink independence test, fortnightly income-free area ($539 for students in 2026-27, then 50c/$539–$646 and 60c above), and student start-up loans."
  },
  "student_edge": {
    "title": "Student Edge: Free Australian Student Discounts & Perks",
    "url": "https://studentedge.org/au",
    "source": "Student Discount",
    "description": "Free student membership offering discounts on tech, food, cinema tickets, fashion, and retail for Australian high school students."
  },
  "studyassist_hecs": {
    "title": "StudyAssist: HECS-HELP & VET Student Loans",
    "url": "https://www.studyassist.gov.au",
    "source": "Services Australia",
    "description": "Government guide to Commonwealth Supported Places (CSPs) and HELP repayment thresholds."
  },
  "tafe_qld": {
    "title": "TAFE Queensland: Fee-Free TAFE & Free Apprenticeships Under 25",
    "url": "https://tafeqld.edu.au/courses/apply-and-enrol/subsidised-training/fee-free",
    "source": "QLD Government",
    "description": "Over 40+ tuition-free diploma/cert courses and 130+ free apprenticeships for under 25s."
  },
  "translink_50c_fares": {
    "title": "Translink: Queensland 50-Cent Public Transport Fares & Smart Ticketing",
    "url": "https://translink.com.au/tickets-and-fares/50-cent-fares",
    "source": "QLD Government",
    "description": "Official details on Queensland's permanent flat 50-cent fare and Smart Ticketing contactless payment rules across SEQ trains, buses, ferries, and light rail."
  },
  "translink_smart_ticketing": {
    "title": "Translink: Smart Ticketing Payment Rules & Contactless Travel",
    "url": "https://translink.com.au/about-translink/projects-and-initiatives/smart-ticketing",
    "source": "QLD Government",
    "description": "Official rules for contactless Visa/Mastercard tap-on/off, device tokens, and card clash prevention across SEQ transit."
  },
  "translink_gocard": {
    "title": "Translink: Go Card & Concession Fares",
    "url": "https://translink.com.au/tickets-and-fares/go-card",
    "source": "QLD Government",
    "description": "Translink ticketing, student concession verification, and travel across SEQ."
  },
  "unisc_study": {
    "title": "UniSC: University of the Sunshine Coast & Moreton Bay",
    "url": "https://www.unisc.edu.au/study",
    "source": "University",
    "description": "UniSC programs at Sippy Downs, Moreton Bay (Petrie), Caboolture, and Fraser Coast."
  },
  "unisq_study": {
    "title": "UniSQ: University of Southern Queensland (Springfield & Ipswich)",
    "url": "https://www.unisq.edu.au/study",
    "source": "University",
    "description": "UniSQ undergraduate degrees #1 in Australia for graduate starting salaries."
  },
  "up_bank_saver": {
    "title": "Up Bank: Saver Account (5.00% p.a.)",
    "url": "https://up.com.au/features/savers/",
    "source": "Bank",
    "description": "Next-gen digital banking for ages 16+ paying 5.00% p.a. with automated roundups and 5 monthly debit purchases."
  },
  "uq_study": {
    "title": "The University of Queensland: Study & Degrees",
    "url": "https://study.uq.edu.au",
    "source": "University",
    "description": "UQ undergraduate programs, Go8 entry ranks, CSP fee bands, and campus life."
  },
  "vanguard_etfs": {
    "title": "Vanguard Australia: ETF Range & Education",
    "url": "https://www.vanguard.com.au/personal/invest-with-us/etf",
    "source": "ETF Provider",
    "description": "Vanguard index ETFs (VAS, VGS, VTS) with performance, distributions and PDS documents."
  },
  "vic_learner_practice": {
    "title": "VicRoads: Learner Permit Practice Test Online",
    "url": "https://www.vicroads.vic.gov.au/licences/your-ls/get-your-ls/prepare-for-the-learner-permit-test",
    "source": "Transport",
    "description": "Official Victoria practice road rules knowledge test to study before sitting the Learner Permit test at 16."
  },
  "westpac_bump_saver": {
    "title": "Westpac: Bump Savings Account (5.05% p.a.)",
    "url": "https://www.westpac.com.au/personal-banking/bank-accounts/savings-accounts/bump/",
    "source": "Bank",
    "description": "Youth savings account for ages 0–17 paying 5.05% p.a. with 1.75% base rate protection and Smart ATM cash deposits."
  },
  "transportnsw_child_youth": {
    "title": "Transport for NSW: Child & Youth Concession Opal",
    "url": "https://transportnsw.info/tickets-opal/opal/concessions-discounts/child-youth-concessions",
    "source": "Transport",
    "description": "Official Transport for NSW guide to 50% concession Opal fares and School Opal for eligible NSW students."
  },
  "ptv_children_students": {
    "title": "Public Transport Victoria: Children & Students Travel",
    "url": "https://www.ptv.vic.gov.au/tickets/fares/concession-fares/students-and-children/",
    "source": "Transport",
    "description": "PTV official portal for Victorian youth concession myki fares, Victorian Student Passes, and free school travel."
  },
  "transperth_student_smartrider": {
    "title": "Transperth: Student SmartRider Travel",
    "url": "https://www.transperth.wa.gov.au/tickets-fares/fares/special-fares/student-fares",
    "source": "Transport",
    "description": "Official Western Australian Transperth portal for primary and secondary student SmartRider fares and free term-time travel."
  },
  "adelaidemetro_fares": {
    "title": "Adelaide Metro: Student Concession Fares & 28-Day Pass",
    "url": "https://www.adelaidemetro.com.au/tickets-and-fares/fares",
    "source": "Transport",
    "description": "South Australian Department for Infrastructure and Transport guide to discounted student metroCARD fares and unlimited passes."
  },
  "unidays_au": {
    "title": "UNiDAYS Australia: High School & Student Discounts",
    "url": "https://www.myunidays.com/AU/en-AU",
    "source": "Student Discount",
    "description": "Official verified student discount portal for Apple Education, Samsung, ASOS, Nike, and tech savings."
  },
  "studentbeans_au": {
    "title": "Student Beans Australia: Student Discount Portal",
    "url": "https://www.studentbeans.com/au",
    "source": "Student Discount",
    "description": "Free discount network providing Australian secondary and university students with promo codes across fashion, tech, and fitness."
  },
  "apple_education_store": {
    "title": "Apple Australia: Education Store Pricing",
    "url": "https://www.apple.com/au-edu/store",
    "source": "Student Discount",
    "description": "Official Apple Australia Education portal offering discounted MacBooks, iPads, and AppleCare+ for students and educators."
  },
  "samsung_education_store": {
    "title": "Samsung Australia: Student & Youth Store",
    "url": "https://www.samsung.com/au/offer/education-store/",
    "source": "Student Discount",
    "description": "Official Samsung Australia student store with up to 30% off Galaxy smartphones, tablets, monitors, and wearables."
  },
  "microsoft_365_education": {
    "title": "Microsoft Australia: Free Office 365 for Students",
    "url": "https://www.microsoft.com/en-au/education/products/office",
    "source": "Student Discount",
    "description": "Official Microsoft portal providing 100% free Word, Excel, PowerPoint, and 1TB OneDrive cloud storage for enrolled students."
  },
  "github_student_pack": {
    "title": "GitHub: Student Developer Pack Free Tools ($1,000+ Value)",
    "url": "https://education.github.com/pack",
    "source": "Student Discount",
    "description": "Free access to GitHub Pro, cloud hosting credits, domain names, and developer software tools for high school and uni students."
  },
  "adobe_creative_cloud_students": {
    "title": "Adobe Australia: Creative Cloud Student Discount",
    "url": "https://www.adobe.com/au/creativecloud/buy/students.html",
    "source": "Student Discount",
    "description": "Official Adobe Australia education discount offering over 60% off the complete Creative Cloud suite for students."
  },
  "autodesk_education_software": {
    "title": "Autodesk: Free Educational Software Licenses",
    "url": "https://www.autodesk.com/education/edu-software",
    "source": "Student Discount",
    "description": "Official Autodesk portal granting free 1-year renewable licenses for AutoCAD, Revit, Maya, and Fusion 360 to eligible students."
  },
  "jetbrains_education_licenses": {
    "title": "JetBrains: Free Student Developer Licenses",
    "url": "https://www.jetbrains.com/community/education/#students",
    "source": "Student Discount",
    "description": "Official JetBrains education portal providing free access to all professional IDEs (IntelliJ, PyCharm, WebStorm) for students."
  },
  "figma_education": {
    "title": "Figma: Free Professional Tier for Education",
    "url": "https://www.figma.com/education/",
    "source": "Student Discount",
    "description": "Official Figma education portal granting free access to Figma Design and FigJam Professional tools for verified students."
  },
  "jbhifi_education_byod": {
    "title": "JB Hi-Fi: Education BYOD Hardware Solutions",
    "url": "https://www.jbhifi.education/",
    "source": "Student Discount",
    "description": "JB Hi-Fi Education portal for discounted student BYOD laptops, tablets, and extended warranty support."
  },
  "spotify_student_au": {
    "title": "Spotify Australia: Premium Student Subscription",
    "url": "https://www.spotify.com/au/student/",
    "source": "Student Discount",
    "description": "Official Spotify Australia portal for verified student pricing on ad-free offline music downloads and playlists."
  },
  "apple_music_student_au": {
    "title": "Apple Music Australia: Student Plan with Apple TV+",
    "url": "https://www.apple.com/au/apple-music/",
    "source": "Student Discount",
    "description": "Official Apple Australia subscription portal for discounted student music streaming including complimentary Apple TV+ access."
  },
  "youtube_premium_student_au": {
    "title": "YouTube Australia: Premium Student Membership",
    "url": "https://www.youtube.com/premium/student",
    "source": "Student Discount",
    "description": "Official YouTube Australia portal for discounted student membership with ad-free videos, background play, and YouTube Music."
  },
  "event_cinemas_cinebuzz_students": {
    "title": "Event Cinemas: Cinebuzz Student Discounts",
    "url": "https://www.eventcinemas.com.au/cinebuzz",
    "source": "Student Discount",
    "description": "Official Event Cinemas Cinebuzz rewards program offering discounted student tickets on Mondays and weekday sessions."
  },
  "hoyts_deals_student_edge": {
    "title": "HOYTS Australia: Student Edge Ticket Deals",
    "url": "https://studentedge.org/au/deals/hoyts",
    "source": "Student Discount",
    "description": "Official Student Edge partnership portal offering discounted general admission movie tickets at HOYTS cinemas across Australia."
  },
  "boost_mobile_au": {
    "title": "Boost Mobile Australia: Full Telstra Network Prepaid Plans",
    "url": "https://boost.com.au/",
    "source": "Student Discount",
    "description": "Australian prepaid MVNO operating on the full Telstra retail mobile network with rollover data and no lock-in contracts."
  },
  "optus_student_hub": {
    "title": "Optus Australia: Student Hub Deals",
    "url": "https://www.optus.com.au/student-hub",
    "source": "Student Discount",
    "description": "Official Optus Australia student portal offering 10% discounts on eligible SIM-only mobile plans and generous data banks."
  },
  "vodafone_student_discount": {
    "title": "Vodafone Australia: Student Discount Plans",
    "url": "https://www.vodafone.com.au/students",
    "source": "Student Discount",
    "description": "Official Vodafone Australia student hub offering 10% off month-to-month SIM plans with endless data."
  },
  "qld_playon_sports_vouchers": {
    "title": "Queensland Government: Play On! Sports Vouchers",
    "url": "https://www.qld.gov.au/recreation/sports/funding/playon",
    "source": "QLD Government",
    "description": "Queensland Department of Tourism and Sport vouchers providing up to $200 per financial year for youth sport club memberships."
  },
  "nsw_active_creative_kids": {
    "title": "Service NSW: Active and Creative Kids Voucher Scheme",
    "url": "https://www.service.nsw.gov.au/transaction/apply-for-an-active-and-creative-kids-voucher",
    "source": "Federal Government",
    "description": "Service NSW voucher program providing two $50 vouchers per eligible child per year for sport, dance, coding, and music."
  },
  "vic_get_active_kids": {
    "title": "Victorian Government: Get Active Kids Voucher Program",
    "url": "https://www.getactive.vic.gov.au/vouchers/",
    "source": "Federal Government",
    "description": "Victorian Department of Jobs, Skills, Industry and Regions voucher providing up to $200 per child for club registration and equipment."
  },
  "wa_kidsport_vouchers": {
    "title": "Government of Western Australia: KidSport Vouchers",
    "url": "https://www.dlgsc.wa.gov.au/funding/sport-and-recreation/kidsport",
    "source": "Federal Government",
    "description": "WA Department of Local Government, Sport and Cultural Industries providing up to $300 per child per financial year for sports club fees."
  },
  "sa_sports_vouchers": {
    "title": "Government of South Australia: Sports Vouchers Program",
    "url": "https://www.sportsvouchers.sa.gov.au/",
    "source": "Federal Government",
    "description": "Office for Recreation, Sport and Racing providing two $100 vouchers per child per calendar year towards sport, dance, and music fees."
  },
  "tas_ticket_to_play": {
    "title": "Tasmanian Government: Ticket to Play Voucher Program",
    "url": "https://www.tickettoplay.tas.gov.au/",
    "source": "Federal Government",
    "description": "Active Tasmania initiative providing two $100 vouchers per financial year to eligible Tasmanian youth towards club registration."
  },
  "nt_sport_voucher_scheme": {
    "title": "Northern Territory Government: Sport Voucher Scheme",
    "url": "https://nt.gov.au/community/sport/sport-voucher-scheme-urban",
    "source": "Federal Government",
    "description": "Northern Territory Government grants providing two $100 vouchers per year for urban school-enrolled students for sport, recreation, and arts."
  },
  "spriggy_pocket_money": {
    "title": "Spriggy: Pocket Money & Prepaid Card for Australian Kids and Teens",
    "url": "https://www.spriggy.com.au/",
    "source": "Bank",
    "description": "Australian family pocket money platform and prepaid Visa card featuring automated chores, visual savings goals, and SPRK teen mode."
  },
  "kit_pocket_money": {
    "title": "Kit: Pocket Money App & Prepaid Card by CommBank (x15ventures)",
    "url": "https://www.heykit.com.au/",
    "source": "Bank",
    "description": "Financial education and digital pocket money app by Commonwealth Bank with Money Quests, Split PayDay, and merchant controls."
  },
  "mission_australia_youth_survey": {
    "title": "Mission Australia: National Youth Survey Report",
    "url": "https://www.missionaustralia.com.au/publications/youth-survey",
    "source": "Research",
    "description": "Australia's largest annual survey of teenagers aged 14–19 tracking cost of living, financial stress, mental health, and housing concerns."
  },
  "everyday_mobile_woolworths": {
    "title": "Everyday Mobile from Woolworths (10% Monthly Grocery Discount)",
    "url": "https://everyday.com.au/mobile",
    "source": "Student Discount",
    "description": "Prepaid and SIM-only mobile plans powered by the Telstra Wholesale Network with 10% off one in-store Woolworths shop per month."
  },
  "prime_student_au": {
    "title": "Amazon Prime Student Australia (50% Off)",
    "url": "https://www.amazon.com.au/joinstudent",
    "source": "Student Discount",
    "description": "Discounted student membership with Prime Video, free priority shipping, Amazon Music, and Deliveroo Plus subscription perks."
  },
  "moneysmart_micro_investing": {
    "title": "Moneysmart: Micro-Investing Apps Explained",
    "url": "https://moneysmart.gov.au/how-to-invest/micro-investing",
    "source": "Moneysmart",
    "description": "Australian Government consumer guide on micro-investing apps, recurring fee drag, and custodial structures."
  },
  "asic_day_trading_warning": {
    "title": "ASIC: Retail Trading & CFD Risk Warnings",
    "url": "https://www.asic.gov.au/about-asic/news-centre/find-a-media-release/2023-releases/23-243mr-asic-takes-aim-at-the-distribution-of-otc-derivatives-and-other-high-risk-products-to-retail-clients/",
    "source": "ASIC",
    "description": "ASIC reports showing over 68% of retail CFD day traders lose money with net losses exceeding $458 million."
  },
  "pearler_headstart": {
    "title": "Pearler: Headstart & Minor Trust Investing",
    "url": "https://pearler.com/headstart",
    "source": "Pearler",
    "description": "Long-term ETF investing platform for Australian teens and kids with automated micro and CHESS-sponsored accounts."
  },
  "betashares_direct": {
    "title": "Betashares Direct: Kids & Bare Trust Accounts",
    "url": "https://www.betashares.com.au/direct/",
    "source": "Betashares",
    "description": "Zero-brokerage ETF investing platform offering dedicated informal minor trust accounts for Australian children."
  },
  "payid_platform": {
    "title": "PayID: Fast & Secure Bank Payments",
    "url": "https://payid.com.au/",
    "source": "AP+",
    "description": "Official Australian PayID addressing service linking your mobile number or email for instant, typo-free payments without disclosing BSB/account numbers."
  },
  "payto_platform": {
    "title": "PayTo: Modern Digital Direct Debits",
    "url": "https://payto.com.au/",
    "source": "AP+",
    "description": "Official PayTo platform offering pre-authorised digital payment agreements with complete in-app visibility and instant pause/cancel controls."
  },
  "osko_platform": {
    "title": "Osko: 24/7 Real-Time Fast Payments",
    "url": "https://osko.com.au/",
    "source": "BPAY / AP+",
    "description": "NPP retail overlay enabling instant payments settling in under 60 seconds 24/7/365 across participating Australian financial institutions."
  },
  "npp_australia": {
    "title": "New Payments Platform (NPP Australia)",
    "url": "https://nppa.com.au/",
    "source": "AP+",
    "description": "Australia's national real-time payment rails supporting ISO 20022 rich data messaging and instant settlement."
  },
  "oaic_cdr_privacy": {
    "title": "OAIC: Consumer Data Right Privacy Safeguards",
    "url": "https://www.oaic.gov.au/consumer-data-right",
    "source": "OAIC",
    "description": "Official Australian Information Commissioner guidance on the 13 CDR Privacy Safeguards and personal financial data protection."
  }
};

export const OFFICIAL_WEB_LINKS = STATUTORY_LINKS;

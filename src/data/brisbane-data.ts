/**
 * Brisbane, QLD — reference data for the "Brisbane, QLD" location module.
 *
 * Sources (2026):
 *  - CoreLogic / SQM Research / ProperEasy (Brisbane median rents, early 2026)
 *  - Student Accommodation Council National Survey 2026 (median shared rent $286/wk within 5km of CBD)
 *  - amberstudent.com / studyau.au student cost-of-living guides (2026)
 *  - TransLink (concession Go Card fares & weekly caps)
 *  - Queensland Revenue Office (First Home Owner Grant $30k, transfer duty concessions)
 *  - RTA Queensland (4-week max bond, no rent threshold since 30 Sep 2024)
 *  - StudyAssist / UQ / QUT / Griffith (CSP fee bands, guaranteed ATAR)
 *  - QLD TMR / MAIC (rego = registration + traffic improvement fee + CTP)
 *
 * All figures are historical reference data as at mid-2026 for education only,
 * NOT live quotes and NOT financial advice. Verify against official sources.
 */

export interface BudgetItem {
  category: string;
  emoji: string;
  weekly: number; // weekly cost in AUD
  note: string;
}

/** Typical weekly living costs for a student / young adult in Brisbane (sharehouse) */
export const BRISBANE_WEEKLY_BUDGET: BudgetItem[] = [
  { category: 'Rent (sharehouse room)', emoji: '🏠', weekly: 280, note: 'Median shared room within 5km of CBD ≈ $286/wk (2026)' },
  { category: 'Groceries & food', emoji: '🛒', weekly: 100, note: 'Aldi/Woolies deals; West End & Rocklea markets' },
  { category: 'Public transport (50c Translink fares)', emoji: '🚌', weekly: 5, note: 'Queensland permanent 50-cent flat fare across all SE QLD trains, buses & ferries ≈ $5/wk' },
  { category: 'Phone + internet', emoji: '📱', weekly: 15, note: 'Budget SIM plans from $15/mo' },
  { category: 'Utilities (electricity, water, gas share)', emoji: '💡', weekly: 25, note: 'Split between sharehouse housemates' },
  { category: 'Eating out & coffee', emoji: '☕', weekly: 50, note: 'Lunch $15-25, coffee $4-6' },
  { category: 'Entertainment & misc', emoji: '🎬', weekly: 35, note: 'South Bank, uni clubs, free events' },
];

export const BRISBANE_BUDGET_TOTAL_WEEKLY = BRISBANE_WEEKLY_BUDGET.reduce((s, i) => s + i.weekly, 0);

export interface UniCourse {
  code: string;
  title: string;
  field: 'Engineering' | 'Health & Medicine' | 'Business & Commerce' | 'IT & Computer Science' | 'Law & Criminology' | 'Creative Arts' | 'Science & Environment' | 'Education';
  atarMin: number;
  atarMedian: number;
  duration: string;
  cspBandFee: number;
  careerOutcome: string;
  medianGraduateSalary: number;
  qtacCode?: string;
  studyMode?: string;
  prerequisites?: string;
}

export interface DetailedBrisbaneUni {
  code: string;
  name: string;
  tagline: string;
  worldRankQS: string;
  ausRank: string;
  campuses: Array<{ name: string; location: string; transitTip: string }>;
  enrollments: {
    total: number;
    undergrad: number;
    postgrad: number;
    domesticPct: number;
    internationalPct: number;
    femalePct: number;
    malePct: number;
    firstInFamilyPct: number;
    regionalRuralPct: number;
  };
  atarDetails: {
    overallMinATAR: number;
    overallMedianATAR: number;
    qtacCodePrefix: string;
    adjustmentFactors: string;
    offerRounds: string;
  };
  earlyOfferScheme: {
    name: string;
    criteria: string;
    deadline: string;
    guaranteedRanks: string;
  };
  specialistStrengths: string[];
  olympicRole2032: string;
  feesAndFinancials: {
    avgCSPAnnual: number;
    ssafAnnual: number;
    scholarshipPool: string;
    hecsHelpEligible: boolean;
  };
  qiltMetrics: {
    fullTimeEmpPct: number;
    medianGraduateSalary: number;
    overallSatisfactionPct: number;
  };
  studentLife: {
    vibe: string;
    clubsCount: number;
    housingOptions: Array<{ type: string; weeklyCost: string; details: string }>;
  };
  recentNews: Array<{ headline: string; year: string; summary: string }>;
  top10Courses: UniCourse[];
  url: string;
  logoEmoji: string;
}

export interface BrisbaneUni {
  code: string;
  name: string;
  campuses: string;
  strength: string;
  cspBand: string;
  atar: string;
  scholarships: string;
  url: string;
}

/** Main Brisbane tertiary institutions for school leavers */
export const BRISBANE_UNIS: BrisbaneUni[] = [
  {
    code: 'UQ',
    name: 'University of Queensland',
    campuses: 'St Lucia (main) + Herston, Gatton',
    strength: 'Australia\'s top research university — law, medicine, engineering, science.',
    cspBand: '≈ $9,690–$16,030/yr',
    atar: '72–99.5 (varies by degree)',
    scholarships: 'Academic excellence & equity scholarships',
    url: 'https://study.uq.edu.au',
  },
  {
    code: 'QUT',
    name: 'Queensland University of Technology',
    campuses: 'Gardens Point + Kelvin Grove (both inner-city)',
    strength: 'Real-world, industry-linked degrees — nursing, business, IT, creative industries.',
    cspBand: '≈ $4,738–$17,399/yr + SSAF $373',
    atar: '70–85 (varies by degree)',
    scholarships: 'Vice-Chancellor\'s scholarships & equity support',
    url: 'https://www.qut.edu.au/study',
  },
  {
    code: 'GRIFFITH',
    name: 'Griffith University',
    campuses: 'Nathan + South Bank (Brisbane), plus Gold Coast & Logan',
    strength: 'Great practical degrees — health, music/arts (South Bank), business, science.',
    cspBand: '≈ $4,738–$17,399/yr + SSAF $373',
    atar: '68–88 (varies by degree)',
    scholarships: 'Griffith Remarkable & equity scholarships',
    url: 'https://www.griffith.edu.au/study',
  },
  {
    code: 'UniSC',
    name: 'UniSC Moreton Bay',
    campuses: 'Moreton Bay (Petrie station hub) + Sunshine Coast',
    strength: 'High-tech North Brisbane hub — nursing, IT, cyber security, allied health.',
    cspBand: '≈ $4,738–$17,399/yr + SSAF $373',
    atar: '60–85 (varies by degree)',
    scholarships: 'UniSC Merit & First-in-Family access grants',
    url: 'https://www.usc.edu.au/study',
  },
  {
    code: 'UniSQ',
    name: 'UniSQ Springfield & Ipswich',
    campuses: 'Springfield (Ipswich West) + Ipswich, Toowoomba',
    strength: '#1 in Australia for Graduate Starting Salaries — aviation, space, nursing, engineering.',
    cspBand: '≈ $4,738–$17,399/yr + SSAF $373',
    atar: '60–88 (varies by degree)',
    scholarships: 'UniSQ Vice-Chancellor & Regional Excellence',
    url: 'https://www.unisq.edu.au/study',
  },
  {
    code: 'ACU',
    name: 'Australian Catholic University',
    campuses: 'Banyo (North Brisbane)',
    strength: 'Top healthcare, nursing, education & paramedicine specialist campus.',
    cspBand: '≈ $4,738–$17,399/yr + SSAF $373 (nursing/education from $4,738)',
    atar: '60–92 (varies by degree)',
    scholarships: 'ACU Guarantee & Equity Scholarships',
    url: 'https://www.acu.edu.au/study',
  },
  {
    code: 'TAFE',
    name: 'TAFE Queensland',
    campuses: 'South Bank, Kangaroo Point, Mt Gravatt, Acacia Ridge',
    strength: 'Hands-on diplomas, certificates & apprenticeships — cheaper, faster, job-ready.',
    cspBand: 'From $0 (Fee-Free 2026) – $5,000/yr',
    atar: 'No ATAR required',
    scholarships: 'Fee-Free TAFE + VET Student Loans',
    url: 'https://tafeqld.edu.au',
  },
];

/** Comprehensive 2026/2027 Brisbane Tertiary Metrics Dataset */
export const DETAILED_BRISBANE_UNIS: DetailedBrisbaneUni[] = [
  {
    code: 'UQ',
    name: 'University of Queensland',
    tagline: "Australia's Top Go8 Research & Medical Powerhouse",
    worldRankQS: '#40 World (QS 2026/2027)',
    ausRank: '#5 in Australia',
    logoEmoji: '🏰',
    url: 'https://study.uq.edu.au',
    campuses: [
      { name: 'St Lucia', location: 'St Lucia (7km CBD, riverside)', transitTip: '50c CityCat Ferry or Eleanor Schonell Bridge Busway' },
      { name: 'Herston', location: 'Herston (3km CBD, Royal Brisbane Hospital)', transitTip: 'Herston Busway Station direct' },
      { name: 'Gatton', location: 'Gatton (Lockyer Valley, 1hr West)', transitTip: 'UQ Inter-campus shuttle bus' },
    ],
    enrollments: {
      total: 55400,
      undergrad: 37500,
      postgrad: 17900,
      domesticPct: 68,
      internationalPct: 32,
      femalePct: 54,
      malePct: 46,
      firstInFamilyPct: 21,
      regionalRuralPct: 18,
    },
    atarDetails: {
      overallMinATAR: 72.00,
      overallMedianATAR: 88.40,
      qtacCodePrefix: '70xxxx (UQ St Lucia / Herston)',
      adjustmentFactors: 'Up to +5 rank points via Subject Bonus (Maths Methods, Specialist, Physics, LOTE), Educational Access Scheme (EAS), and Rural Access Scheme.',
      offerRounds: 'Major QTAC December & January rounds; direct early offer pathways available.',
    },
    earlyOfferScheme: {
      name: 'UQ Guaranteed ATAR & Subject Incentive',
      criteria: 'Meet published ATAR threshold on first QTAC round + up to +5 subject bonus points.',
      deadline: 'December QTAC Major Offer Round',
      guaranteedRanks: 'Guaranteed place in 85%+ of undergraduate degrees when threshold met.',
    },
    specialistStrengths: [
      'Go8 Medical School, Dentistry & Pharmacy (Herston Health Precinct)',
      'World Top 5 Mineral & Mining Engineering (QS World Rankings)',
      'Advanced Finance & Economics with Bloomberg Trading Suites',
      'Veterinary Science & Agriscience at Gatton Campus',
    ],
    olympicRole2032: 'Official Olympic & Paralympic Training Hub — $120M Sports Science Institute at St Lucia',
    feesAndFinancials: {
      avgCSPAnnual: 9850,
      ssafAnnual: 373,
      scholarshipPool: '$25M+ awarded annually in academic, sports & equity support',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 84.5,
      medianGraduateSalary: 76500,
      overallSatisfactionPct: 83.2,
    },
    studentLife: {
      vibe: 'Vibrant sandstone university experience with Great Court, UQ Union, lakes, and massive sports precincts.',
      clubsCount: 220,
      housingOptions: [
        { type: 'On-Campus Colleges', weeklyCost: '$450–$680/wk', details: 'Catered room, academic tutoring (Duchesne, Emmanuel, King\'s, St John\'s)' },
        { type: 'St Lucia Sharehouse', weeklyCost: '$300–$420/wk', details: 'Private room in student sharehouse within walking distance' },
        { type: 'Toowong / Guyatt Park', weeklyCost: '$280–$380/wk', details: 'Ferry/bus access 10 mins away' },
      ],
    },
    recentNews: [
      { headline: 'UQ Unveils $120M Brisbane 2032 Olympic Sports Science Institute', year: '2026', summary: 'State-of-the-art biomechanics and high-performance training center at St Lucia for 2032 Olympic athletes.' },
      { headline: 'UQ Green Hydrogen Fuel Cell Breakthrough Achieves Commercial Trial', year: '2026', summary: 'Engineers pioneer low-cost catalyst technology for clean energy export across Queensland.' },
      { headline: 'UQ Medical School Expands Regional Queensland Clinical Placements', year: '2026', summary: '$30M federal grant providing funded regional hospital rotations for junior doctors.' },
    ],
    top10Courses: [
      { code: 'UQ-ENG', title: 'Bachelor of Engineering (Honours)', field: 'Engineering', atarMin: 84.00, atarMedian: 93.10, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Civil, Mechanical, Mechatronics, Software Engineer', medianGraduateSalary: 78000 },
      { code: 'UQ-DEN', title: 'Bachelor of Dental Science (Honours)', field: 'Health & Medicine', atarMin: 99.00, atarMedian: 99.65, duration: '5 Years FT', cspBandFee: 17399, careerOutcome: 'Dentist, Dental Surgeon', medianGraduateSalary: 105000 },
      { code: 'UQ-LAW', title: 'Bachelor of Laws (Honours)', field: 'Law & Criminology', atarMin: 97.00, atarMedian: 98.20, duration: '4 Years FT', cspBandFee: 13558, careerOutcome: 'Solicitor, Barrister, Legal Counsel, Policy Advisor', medianGraduateSalary: 77000 },
      { code: 'UQ-CS', title: 'Bachelor of Computer Science', field: 'IT & Computer Science', atarMin: 84.00, atarMedian: 92.40, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Software Developer, AI Engineer, Data Scientist', medianGraduateSalary: 76000 },
      { code: 'UQ-MD', title: 'Doctor of Medicine (Provisional Pathway)', field: 'Health & Medicine', atarMin: 99.00, atarMedian: 99.70, duration: '7 Years FT', cspBandFee: 17399, careerOutcome: 'Medical Practitioner, Resident Doctor, Surgeon', medianGraduateSalary: 88000 },
      { code: 'UQ-AFE', title: 'Bachelor of Advanced Finance & Economics', field: 'Business & Commerce', atarMin: 98.00, atarMedian: 99.10, duration: '4 Years FT', cspBandFee: 13558, careerOutcome: 'Investment Banker, Quant Analyst, Economist', medianGraduateSalary: 92000 },
      { code: 'UQ-NURS', title: 'Bachelor of Nursing', field: 'Health & Medicine', atarMin: 76.00, atarMedian: 84.30, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Nurse, Clinical Specialist', medianGraduateSalary: 78500 },
      { code: 'UQ-SCI', title: 'Bachelor of Science / Biomedical Science', field: 'Science & Environment', atarMin: 79.00, atarMedian: 87.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Biomedical Researcher, Geneticist, Lab Scientist', medianGraduateSalary: 68000 },
      { code: 'UQ-VET', title: 'Bachelor of Veterinary Science (Honours)', field: 'Science & Environment', atarMin: 96.00, atarMedian: 98.10, duration: '5 Years FT', cspBandFee: 17399, careerOutcome: 'Veterinary Surgeon, Livestock Specialist', medianGraduateSalary: 74000 },
      { code: 'UQ-PSYCH', title: 'Bachelor of Psychological Science (Honours)', field: 'Health & Medicine', atarMin: 87.00, atarMedian: 93.80, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Psychologist, Organisational Advisor', medianGraduateSalary: 69000 },
    ],
  },
  {
    code: 'QUT',
    name: 'Queensland University of Technology',
    tagline: 'The University for the Real World — Inner-City Tech & Industry Hub',
    worldRankQS: '#189 World (QS 2026/2027)',
    ausRank: '#12 in Australia',
    logoEmoji: '🚀',
    url: 'https://www.qut.edu.au/study',
    campuses: [
      { name: 'Gardens Point', location: 'Brisbane CBD (adjacent to City Botanic Gardens)', transitTip: 'Walk across Goodwill Bridge or CBD South Bank bus/train' },
      { name: 'Kelvin Grove', location: 'Kelvin Grove (2km North of CBD)', transitTip: 'Dedicated QUT free shuttle bus connecting Gardens Point & KG' },
    ],
    enrollments: {
      total: 53100,
      undergrad: 41200,
      postgrad: 11900,
      domesticPct: 82,
      internationalPct: 18,
      femalePct: 52,
      malePct: 48,
      firstInFamilyPct: 29,
      regionalRuralPct: 22,
    },
    atarDetails: {
      overallMinATAR: 70.00,
      overallMedianATAR: 82.50,
      qtacCodePrefix: '40xxxx (QUT Gardens Point / Kelvin Grove)',
      adjustmentFactors: 'QUT Year 12 Bonus Scheme gives up to +5 rank points for Specialist Maths, Physics, Chemistry, LOTE, and QUT START extension study.',
      offerRounds: 'QUT Year 12 Offer Guarantee: hit the published threshold rank for early QTAC placement.',
    },
    earlyOfferScheme: {
      name: 'QUT Year 12 Offer Guarantee & START QUT',
      criteria: 'Hit published guaranteed ATAR threshold + up to +5 rank bonus points.',
      deadline: 'November / December QTAC Rounds',
      guaranteedRanks: 'Guaranteed place in Business, IT, Creative Industries, Science, Engineering.',
    },
    specialistStrengths: [
      'Centre for Robotics & Autonomous Systems (World-leading research)',
      'Hollywood-Grade Virtual Production LED Stage at Kelvin Grove',
      'Clinical Nursing, Paramedicine & Medical Imaging suites',
      'Triple-Crown Accredited Business School (Top 1% globally)',
    ],
    olympicRole2032: 'Digital Broadcast Media & Sports Technology Partner — Virtual Arenas & Analytics',
    feesAndFinancials: {
      avgCSPAnnual: 9550,
      ssafAnnual: 373,
      scholarshipPool: '$18M+ Vice-Chancellor\'s & Equity Scholarships pool',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 86.1,
      medianGraduateSalary: 74800,
      overallSatisfactionPct: 84.5,
    },
    studentLife: {
      vibe: 'Modern, fast-paced inner-city campus life with high tech focus, QUT Guild, e-Sports arenas, and rooftop lounges.',
      clubsCount: 160,
      housingOptions: [
        { type: 'Kelvin Grove Student Village', weeklyCost: '$320–$450/wk', details: 'Fully furnished apartments right on campus' },
        { type: 'South Bank / Woolloongabba', weeklyCost: '$300–$420/wk', details: 'Quick walk or bus across Goodwill Bridge' },
        { type: 'Spring Hill / Herston', weeklyCost: '$270–$380/wk', details: 'Suburban rooms 15 mins to Kelvin Grove' },
      ],
    },
    recentNews: [
      { headline: 'QUT Opens $45M Virtual Production LED Stage at Kelvin Grove', year: '2026', summary: 'State-of-the-art Hollywood-grade filmmaking facility for film, animation, and gaming students.' },
      { headline: 'QUT Centre for Robotics Wins Global Autonomous Vehicle Challenge', year: '2026', summary: 'Engineering team showcases AI navigation for agriculture and emergency response.' },
      { headline: 'QUT Business School Awarded Triple Crown Accreditation Renewal', year: '2026', summary: 'Maintains elite top 1% global ranking for business and finance programs.' },
    ],
    top10Courses: [
      { code: 'QUT-IT', title: 'Bachelor of Information Technology (AI & Software)', field: 'IT & Computer Science', atarMin: 74.00, atarMedian: 83.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Software Architect, Cybersecurity Consultant, Data Engineer', medianGraduateSalary: 75000 },
      { code: 'QUT-NURS', title: 'Bachelor of Nursing', field: 'Health & Medicine', atarMin: 72.00, atarMedian: 81.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Clinical Nurse, Trauma Nurse, Emergency Care Specialist', medianGraduateSalary: 79000 },
      { code: 'QUT-BUS', title: 'Bachelor of Business (Finance / Marketing)', field: 'Business & Commerce', atarMin: 70.00, atarMedian: 78.40, duration: '3 Years FT', cspBandFee: 13558, careerOutcome: 'Financial Analyst, Marketing Director, Business Consultant', medianGraduateSalary: 72000 },
      { code: 'QUT-ENG', title: 'Bachelor of Engineering (Honours)', field: 'Engineering', atarMin: 82.00, atarMedian: 90.10, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Electrical, Renewable Energy, Structural Engineer', medianGraduateSalary: 77500 },
      { code: 'QUT-CI', title: 'Bachelor of Creative Industries', field: 'Creative Arts', atarMin: 70.00, atarMedian: 79.20, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Game Designer, Creative Producer, Digital Specialist', medianGraduateSalary: 62000 },
      { code: 'QUT-PARA', title: 'Bachelor of Paramedic Science', field: 'Health & Medicine', atarMin: 87.00, atarMedian: 93.40, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Ambulance Paramedic, Flight Rescue Officer', medianGraduateSalary: 84000 },
      { code: 'QUT-LAW', title: 'Bachelor of Laws (Honours)', field: 'Law & Criminology', atarMin: 85.00, atarMedian: 92.60, duration: '4 Years FT', cspBandFee: 13558, careerOutcome: 'Corporate Lawyer, Commercial Advocate, Legal Tech Developer', medianGraduateSalary: 75000 },
      { code: 'QUT-EDU', title: 'Bachelor of Education (Secondary)', field: 'Education', atarMin: 70.00, atarMedian: 77.80, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Secondary High School Teacher, STEM Educator', medianGraduateSalary: 78000 },
      { code: 'QUT-MEDIMG', title: 'Bachelor of Medical Imaging (Honours)', field: 'Health & Medicine', atarMin: 96.00, atarMedian: 98.40, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Radiographer, MRI Specialist, Medical Imaging Professional', medianGraduateSalary: 88000 },
      { code: 'QUT-DATA', title: 'Bachelor of Data Science', field: 'IT & Computer Science', atarMin: 78.00, atarMedian: 86.90, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Machine Learning Specialist, Analytics Consultant', medianGraduateSalary: 82000 },
    ],
  },
  {
    code: 'GRIFFITH',
    name: 'Griffith University',
    tagline: 'Practical, Innovative & Health-Focused University of SEQ',
    worldRankQS: '#243 World (QS 2026/2027)',
    ausRank: '#16 in Australia',
    logoEmoji: '🌿',
    url: 'https://www.griffith.edu.au/study',
    campuses: [
      { name: 'Nathan', location: 'Nathan (12km South of CBD, eco-bushland setting)', transitTip: 'Southeast Busway to Griffith University Busway Station' },
      { name: 'South Bank', location: 'South Bank (Cultural Precinct)', transitTip: 'Walk from South Brisbane Train Station / CityCat' },
      { name: 'Gold Coast & Logan', location: 'South Coast Health & Knowledge Precinct', transitTip: 'G:link Light Rail direct to Gold Coast campus' },
    ],
    enrollments: {
      total: 49800,
      undergrad: 38100,
      postgrad: 11700,
      domesticPct: 76,
      internationalPct: 24,
      femalePct: 57,
      malePct: 43,
      firstInFamilyPct: 34,
      regionalRuralPct: 25,
    },
    atarDetails: {
      overallMinATAR: 65.00,
      overallMedianATAR: 78.20,
      qtacCodePrefix: '20xxxx (Griffith Brisbane & Gold Coast)',
      adjustmentFactors: 'Up to +6 rank points via Griffith Bonus Scheme (Subject bonuses, Educational Access, Regional preference).',
      offerRounds: 'Griffith Guaranteed Admission scheme for Year 12 leavers hitting published threshold ranks.',
    },
    earlyOfferScheme: {
      name: 'Griffith Guaranteed Admission & Early Offer',
      criteria: 'Achieve guaranteed threshold ATAR or complete Griffith Head Start subjects (+2 rank points).',
      deadline: 'Mid-November QTAC Early Offer Round',
      guaranteedRanks: 'Guaranteed admission across 100+ high-demand undergraduate degrees.',
    },
    specialistStrengths: [
      'Queensland Conservatorium of Music (South Bank Cultural Precinct)',
      'Griffith Film School (Top creative & animation hub in Australia)',
      'Gold Coast Health & Knowledge Precinct (Allied health & pharmacy)',
      'Marine Biology, Coastal Ecology & Reef Conservation',
    ],
    olympicRole2032: 'Aquatic High Performance Centre & Climate-Positive Village Operations Partner',
    feesAndFinancials: {
      avgCSPAnnual: 9200,
      ssafAnnual: 373,
      scholarshipPool: '$15M+ Griffith Remarkable & First Peoples scholarship pool',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 83.8,
      medianGraduateSalary: 72500,
      overallSatisfactionPct: 85.1,
    },
    studentLife: {
      vibe: 'Relaxed, friendly community environment with bushland trails at Nathan and vibrant cultural hub at South Bank.',
      clubsCount: 140,
      housingOptions: [
        { type: 'Nathan Campus Residential Colleges', weeklyCost: '$260–$380/wk', details: 'On-campus rooms surrounded by Toohey Forest' },
        { type: 'Annerley / Tarragindi Sharehouse', weeklyCost: '$240–$350/wk', details: 'Affordable student living 10 mins busway to Nathan' },
        { type: 'South Bank Apartments', weeklyCost: '$380–$520/wk', details: 'Urban living for arts & conservatorium students' },
      ],
    },
    recentNews: [
      { headline: 'Griffith Opens $85M Health & Micro-Genomics Facility', year: '2026', summary: 'Advanced research center targeting vaccine development and personalised cancer therapies.' },
      { headline: 'Queensland Conservatorium at South Bank Celebrates 70th Anniversary', year: '2026', summary: 'Renowned music hub launches 2026 concert series featuring world-class alumni performers.' },
      { headline: 'Griffith Ranks #1 in QLD for Climate Action & Sustainability in Times Higher Ed', year: '2026', summary: 'Recognized for carbon-neutral campus operations and Toohey Forest conservation.' },
    ],
    top10Courses: [
      { code: 'GRIFF-MED', title: 'Bachelor of Medical Science (MD Pathway)', field: 'Health & Medicine', atarMin: 99.00, atarMedian: 99.75, duration: '2 Years Accelerated', cspBandFee: 17399, careerOutcome: 'Doctor, Medical Officer, Clinical Specialist', medianGraduateSalary: 87000 },
      { code: 'GRIFF-NURS', title: 'Bachelor of Nursing', field: 'Health & Medicine', atarMin: 68.00, atarMedian: 77.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Nurse, Acute Care Specialist', medianGraduateSalary: 78000 },
      { code: 'GRIFF-CRIM', title: 'Bachelor of Criminology & Criminal Justice', field: 'Law & Criminology', atarMin: 65.00, atarMedian: 74.20, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Intelligence Analyst, Corrective Officer, Crime Prevention Officer', medianGraduateSalary: 66000 },
      { code: 'GRIFF-FILM', title: 'Bachelor of Film & Screen Media Production', field: 'Creative Arts', atarMin: 68.00, atarMedian: 78.00, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Cinematographer, Editor, Film Director', medianGraduateSalary: 58000 },
      { code: 'GRIFF-MAR', title: 'Bachelor of Marine Science', field: 'Science & Environment', atarMin: 68.00, atarMedian: 76.40, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Marine Biologist, Coastal Manager, Reef Ecologist', medianGraduateSalary: 67000 },
      { code: 'GRIFF-BUS', title: 'Bachelor of Business', field: 'Business & Commerce', atarMin: 65.00, atarMedian: 73.80, duration: '3 Years FT', cspBandFee: 13558, careerOutcome: 'Event Manager, HR Consultant, Financial Advisor', medianGraduateSalary: 69000 },
      { code: 'GRIFF-PHYSIO', title: 'Bachelor of Physiotherapy', field: 'Health & Medicine', atarMin: 94.00, atarMedian: 97.10, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Sports Physiotherapist, Hospital Rehabilitation Specialist', medianGraduateSalary: 82000 },
      { code: 'GRIFF-MUS', title: 'Bachelor of Music (Qld Conservatorium)', field: 'Creative Arts', atarMin: 65.00, atarMedian: 75.00, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Professional Musician, Composer, Music Educator', medianGraduateSalary: 60000 },
      { code: 'GRIFF-SE', title: 'Bachelor of Software Engineering (Honours)', field: 'IT & Computer Science', atarMin: 75.00, atarMedian: 84.60, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Full Stack Engineer, Systems Architect', medianGraduateSalary: 76000 },
      { code: 'GRIFF-ENV', title: 'Bachelor of Environmental Science', field: 'Science & Environment', atarMin: 65.00, atarMedian: 74.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Environmental Consultant, Sustainability Officer', medianGraduateSalary: 66500 },
    ],
  },
  {
    code: 'UniSC',
    name: 'University of the Sunshine Coast (Moreton Bay)',
    tagline: 'Fastest-Growing High-Tech Campus Hub in North Brisbane',
    worldRankQS: 'Top 2% Globally (#1 QLD for Student Experience)',
    ausRank: '#1 in QLD for Overall Experience (QILT)',
    logoEmoji: '☀️',
    url: 'https://www.usc.edu.au/study',
    campuses: [
      { name: 'Moreton Bay (Petrie)', location: 'Petrie (25 min Train North of Brisbane CBD)', transitTip: 'Immediate 2-min walk from Petrie Train Station' },
      { name: 'Sunshine Coast', location: 'Sippy Downs (Sunshine Coast)', transitTip: 'Direct highway/bus connection' },
    ],
    enrollments: {
      total: 18500,
      undergrad: 15200,
      postgrad: 3300,
      domesticPct: 89,
      internationalPct: 11,
      femalePct: 61,
      malePct: 39,
      firstInFamilyPct: 46,
      regionalRuralPct: 38,
    },
    atarDetails: {
      overallMinATAR: 60.00,
      overallMedianATAR: 72.50,
      qtacCodePrefix: '30xxxx (UniSC Moreton Bay & Sunshine Coast)',
      adjustmentFactors: 'Up to +6 rank points via UniSC Access Scheme, Regional preference, and Subject bonuses.',
      offerRounds: 'Early offer pathway available in September/October via school recommendation.',
    },
    earlyOfferScheme: {
      name: 'UniSC Early Offer Guarantee',
      criteria: 'Principal recommendation based on Year 12 Term 3 results before final ATARs release.',
      deadline: 'October Early Offer Round',
      guaranteedRanks: 'Early unconditional offers across Moreton Bay & Sunshine Coast degrees.',
    },
    specialistStrengths: [
      'Direct Petrie Train Station Transit Hub (Zero-commute campus access)',
      '#1 in QLD for Student Experience & Teaching Quality (QILT Survey)',
      'Advanced $100M Bio-Engineering, Paramedicine & Nursing Super-Labs',
      'Dedicated Cyber Security Operations & Data Intelligence Centre',
    ],
    olympicRole2032: 'Sunshine Coast Olympic Basketball, Cycling & Athlete Recovery Centre Partnerships',
    feesAndFinancials: {
      avgCSPAnnual: 8900,
      ssafAnnual: 373,
      scholarshipPool: '$8M+ access & merit scholarship funding',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 85.4,
      medianGraduateSalary: 71000,
      overallSatisfactionPct: 88.7,
    },
    studentLife: {
      vibe: 'Modern, highly accessible campus environment with brand new super-labs, collaborative study pods, and 50c train access.',
      clubsCount: 85,
      housingOptions: [
        { type: 'Petrie / Lawnton Sharehouses', weeklyCost: '$220–$320/wk', details: 'Affordable rooms near Petrie station' },
        { type: 'Strathpine / Chermside', weeklyCost: '$250–$350/wk', details: '10–15 min train ride to Petrie campus' },
      ],
    },
    recentNews: [
      { headline: 'UniSC Moreton Bay Completes Stage 2 $100M Bio-Engineering Labs', year: '2026', summary: 'State-of-the-art medical science facilities serving Moreton Bay and North Brisbane school leavers.' },
      { headline: 'UniSC Ranks #1 in Queensland for Student Experience for 4th Consecutive Year', year: '2026', summary: 'National QILT survey highlights small class sizes and accessible academic mentors.' },
      { headline: 'UniSC Partners with Moreton Bay City Council for Innovation Precinct', year: '2026', summary: 'New tech incubator creating 500 local graduate job placements.' },
    ],
    top10Courses: [
      { code: 'USC-NURS', title: 'Bachelor of Nursing Science', field: 'Health & Medicine', atarMin: 65.00, atarMedian: 74.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Nurse, Clinical Care Specialist', medianGraduateSalary: 78000 },
      { code: 'USC-CS', title: 'Bachelor of Computer Science', field: 'IT & Computer Science', atarMin: 65.00, atarMedian: 73.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Software Engineer, Mobile App Developer', medianGraduateSalary: 73500 },
      { code: 'USC-CYBER', title: 'Bachelor of Cyber Security', field: 'IT & Computer Science', atarMin: 65.00, atarMedian: 75.20, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Cyber Security Analyst, Threat Hunter', medianGraduateSalary: 79000 },
      { code: 'USC-BUS', title: 'Bachelor of Business', field: 'Business & Commerce', atarMin: 60.00, atarMedian: 69.80, duration: '3 Years FT', cspBandFee: 13558, careerOutcome: 'Business Analyst, Marketing Specialist', medianGraduateSalary: 68000 },
      { code: 'USC-OT', title: 'Bachelor of Occupational Therapy (Honours)', field: 'Health & Medicine', atarMin: 78.00, atarMedian: 85.00, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Occupational Therapist, Rehabilitation Specialist', medianGraduateSalary: 76000 },
      { code: 'USC-BIOMED', title: 'Bachelor of Biomedical Science', field: 'Science & Environment', atarMin: 60.00, atarMedian: 70.40, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Medical Lab Scientist, Biotechnology Researcher', medianGraduateSalary: 65000 },
      { code: 'USC-EDU', title: 'Bachelor of Primary Education', field: 'Education', atarMin: 65.00, atarMedian: 73.00, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Primary School Teacher, Educational Mentor', medianGraduateSalary: 76500 },
      { code: 'USC-ECO', title: 'Bachelor of Animal Ecology', field: 'Science & Environment', atarMin: 60.00, atarMedian: 71.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Wildlife Biologist, Conservation Officer', medianGraduateSalary: 63000 },
      { code: 'USC-SW', title: 'Bachelor of Social Work', field: 'Health & Medicine', atarMin: 60.00, atarMedian: 68.50, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Social Worker, Youth Advocate, Community Leader', medianGraduateSalary: 71000 },
      { code: 'USC-CRIM', title: 'Bachelor of Criminology & Justice', field: 'Law & Criminology', atarMin: 60.00, atarMedian: 67.90, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Justice Officer, Policy Developer, Youth Justice Specialist', medianGraduateSalary: 65000 },
    ],
  },
  {
    code: 'UniSQ',
    name: 'University of Southern Queensland (Springfield & Ipswich)',
    tagline: 'Western Corridor Leader in Space, Aviation & Allied Health',
    worldRankQS: '#351-400 QS 2026/2027',
    ausRank: '#1 in Australia for Graduate Starting Salaries (QILT)',
    logoEmoji: '✈️',
    url: 'https://www.unisq.edu.au/study',
    campuses: [
      { name: 'Springfield', location: 'Greater Springfield (25km West of CBD)', transitTip: 'Springfield Central Train Station direct' },
      { name: 'Ipswich', location: 'Ipswich (Historic medical campus)', transitTip: 'Short bus ride from Ipswich Station' },
    ],
    enrollments: {
      total: 27200,
      undergrad: 19800,
      postgrad: 7400,
      domesticPct: 84,
      internationalPct: 16,
      femalePct: 56,
      malePct: 44,
      firstInFamilyPct: 42,
      regionalRuralPct: 45,
    },
    atarDetails: {
      overallMinATAR: 60.00,
      overallMedianATAR: 74.00,
      qtacCodePrefix: '10xxxx (UniSQ Springfield & Ipswich)',
      adjustmentFactors: 'Up to +6 rank points via UniSQ Access & Regional School bonus scheme.',
      offerRounds: 'Early offer scheme via school principal recommendation in September.',
    },
    earlyOfferScheme: {
      name: 'UniSQ Accelerated Early Offer & Principal Recommendation',
      criteria: 'Year 12 school recommendation + subject achievement in English and Maths.',
      deadline: 'September / October Early Offer Round',
      guaranteedRanks: 'Unconditional early offers for aviation, engineering, nursing and business.',
    },
    specialistStrengths: [
      '#1 in Australia for Graduate Starting Salaries ($78,200 QILT Median)',
      'Commercial-grade Boeing 737 Flight Simulators at Springfield',
      'Aerospace, Space Propulsion & Rocketry Research Hub',
      'High-Fidelity Simulated Hospital Wards replicating real ambulance intakes',
    ],
    olympicRole2032: 'Aviation Transport, Regional Logistics & Athlete Travel Coordinator',
    feesAndFinancials: {
      avgCSPAnnual: 8950,
      ssafAnnual: 373,
      scholarshipPool: '$10M+ Regional & Industry Excellence scholarships',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 87.9,
      medianGraduateSalary: 78200,
      overallSatisfactionPct: 85.0,
    },
    studentLife: {
      vibe: 'Industry-linked, highly supportive campus culture with world-class flight simulators and clinical simulation wards.',
      clubsCount: 70,
      housingOptions: [
        { type: 'Springfield Central Apartments', weeklyCost: '$260–$360/wk', details: 'Modern apartments near Orion Shopping Centre & UniSQ' },
        { type: 'Ipswich Sharehouses', weeklyCost: '$200–$300/wk', details: 'Very affordable housing options in historic Ipswich' },
      ],
    },
    recentNews: [
      { headline: 'UniSQ Ranked #1 in Australia for Graduate Starting Salaries in QILT 2026', year: '2026', summary: 'Graduates achieve national top median salary of $78,200 thanks to practical industry training.' },
      { headline: 'UniSQ Springfield Opens $40M Boeing 737 Flight Simulator & Space Hub', year: '2026', summary: 'Aviation students train on commercial-grade flight simulators for major Australian airlines.' },
      { headline: 'UniSQ Ipswich Expands Nursing & Paramedicine Simulation Hospital Wards', year: '2026', summary: 'New emergency medical training suite replicating real QAS ambulance responses.' },
    ],
    top10Courses: [
      { code: 'USQ-AV', title: 'Bachelor of Aviation (Flight Operations)', field: 'Engineering', atarMin: 68.00, atarMedian: 77.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Commercial Airline Pilot, Flight Operations Manager', medianGraduateSalary: 88000 },
      { code: 'USQ-NURS', title: 'Bachelor of Nursing', field: 'Health & Medicine', atarMin: 65.00, atarMedian: 73.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Nurse, Clinical Nurse Consultant', medianGraduateSalary: 79500 },
      { code: 'USQ-ENG', title: 'Bachelor of Engineering (Honours)', field: 'Engineering', atarMin: 70.00, atarMedian: 80.20, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Civil, Mechanical, Mechatronic Engineer', medianGraduateSalary: 81000 },
      { code: 'USQ-IT', title: 'Bachelor of Information Technology', field: 'IT & Computer Science', atarMin: 62.00, atarMedian: 71.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Network Administrator, Systems Specialist', medianGraduateSalary: 74000 },
      { code: 'USQ-PARA', title: 'Bachelor of Paramedicine', field: 'Health & Medicine', atarMin: 80.00, atarMedian: 88.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Ambulance Paramedic, Emergency Responder', medianGraduateSalary: 85000 },
      { code: 'USQ-SURV', title: 'Bachelor of Spatial Science / Surveying', field: 'Engineering', atarMin: 65.00, atarMedian: 74.00, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Licensed Surveyor, GIS Mapping Specialist', medianGraduateSalary: 84000 },
      { code: 'USQ-BUS', title: 'Bachelor of Business', field: 'Business & Commerce', atarMin: 60.00, atarMedian: 68.00, duration: '3 Years FT', cspBandFee: 13558, careerOutcome: 'Accountant, HR Officer, Business Analyst', medianGraduateSalary: 70000 },
      { code: 'USQ-AGRI', title: 'Bachelor of Agricultural Science', field: 'Science & Environment', atarMin: 62.00, atarMedian: 70.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Agronomist, Agricultural Technologist', medianGraduateSalary: 72000 },
      { code: 'USQ-EDU', title: 'Bachelor of Education (Secondary)', field: 'Education', atarMin: 65.00, atarMedian: 72.40, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Secondary High School Teacher', medianGraduateSalary: 77000 },
      { code: 'USQ-PSYCH', title: 'Bachelor of Psychology (Honours)', field: 'Health & Medicine', atarMin: 75.00, atarMedian: 83.00, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Psychologist, Human Factors Specialist', medianGraduateSalary: 70000 },
    ],
  },
  {
    code: 'ACU',
    name: 'Australian Catholic University (Banyo)',
    tagline: "Brisbane's Top Healthcare, Nursing & Education Campus",
    worldRankQS: 'Top 80 World for Nursing & Education (QS 2026/2027)',
    ausRank: '#1 in Australia for Graduate Employer Satisfaction (QILT)',
    logoEmoji: '🩺',
    url: 'https://www.acu.edu.au/study',
    campuses: [
      { name: 'Banyo', location: 'Banyo (12km North of Brisbane CBD)', transitTip: 'Direct shuttle bus from Toombul & Earnshaw Train Station' },
    ],
    enrollments: {
      total: 33500,
      undergrad: 26800,
      postgrad: 6700,
      domesticPct: 88,
      internationalPct: 12,
      femalePct: 71,
      malePct: 29,
      firstInFamilyPct: 36,
      regionalRuralPct: 28,
    },
    atarDetails: {
      overallMinATAR: 60.00,
      overallMedianATAR: 75.50,
      qtacCodePrefix: '50xxxx (ACU Banyo)',
      adjustmentFactors: 'Up to +5 rank points via ACU Guarantee scheme, Access ACU, and Subject bonus points.',
      offerRounds: 'ACU Guarantee early offers released in September before final Year 12 exams.',
    },
    earlyOfferScheme: {
      name: 'ACU Guarantee Scheme',
      criteria: 'Assessed on Year 11 results + personal statement / community service experience.',
      deadline: 'September Early Offer Round (prior to Year 12 exams)',
      guaranteedRanks: 'Early conditional/unconditional offers for Nursing, Paramedicine, Physio, Teaching.',
    },
    specialistStrengths: [
      '#1 Nationally for Employer Satisfaction in QILT Survey',
      'Top 80 in World for Nursing & Education (QS Subject Rankings)',
      'Clinical Paramedic Response & Acute Care simulation suites',
      '100% Renewable Solar-Powered Banyo Campus Operation',
    ],
    olympicRole2032: 'High Performance Sport Science & Athlete Physiotherapy Rehabilitation Provider',
    feesAndFinancials: {
      avgCSPAnnual: 8750,
      ssafAnnual: 373,
      scholarshipPool: '$12M+ ACU Guarantee & Community Leadership scholarships',
      hecsHelpEligible: true,
    },
    qiltMetrics: {
      fullTimeEmpPct: 86.8,
      medianGraduateSalary: 76000,
      overallSatisfactionPct: 86.2,
    },
    studentLife: {
      vibe: 'Tight-knit, supportive campus community set amidst historic brick buildings and sprawling ovals.',
      clubsCount: 65,
      housingOptions: [
        { type: 'Banyo / Nundah Sharehouse', weeklyCost: '$240–$340/wk', details: 'Suburban student sharehouses near train station' },
        { type: 'Chermside Student Rooms', weeklyCost: '$250–$350/wk', details: 'Direct bus link to Banyo campus' },
      ],
    },
    recentNews: [
      { headline: 'ACU Banyo Opens $35M Health Sciences & Paramedicine Simulation Centre', year: '2026', summary: 'High-fidelity hospital wards and emergency response suites for nursing & paramedic training.' },
      { headline: 'ACU Ranks #1 Nationally for Employer Satisfaction in QILT Survey 2026', year: '2026', summary: 'Employers praise ACU nursing and education graduates for clinical readiness and ethics.' },
      { headline: 'ACU Banyo Campus Achieves 100% Renewable Solar Power Operation', year: '2026', summary: 'Roof-mounted solar array generates complete campus energy needs.' },
    ],
    top10Courses: [
      { code: 'ACU-NURS', title: 'Bachelor of Nursing', field: 'Health & Medicine', atarMin: 65.00, atarMedian: 74.50, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Registered Nurse, Clinical Nurse Specialist', medianGraduateSalary: 79000 },
      { code: 'ACU-PARA', title: 'Bachelor of Paramedicine', field: 'Health & Medicine', atarMin: 82.00, atarMedian: 89.00, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Ambulance Paramedic, Emergency Responder', medianGraduateSalary: 84500 },
      { code: 'ACU-PHYSIO', title: 'Bachelor of Physiotherapy', field: 'Health & Medicine', atarMin: 92.00, atarMedian: 96.20, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Physiotherapist, Rehabilitation Consultant', medianGraduateSalary: 81500 },
      { code: 'ACU-OT', title: 'Bachelor of Occupational Therapy', field: 'Health & Medicine', atarMin: 78.00, atarMedian: 85.40, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Occupational Therapist, Paediatric Specialist', medianGraduateSalary: 75500 },
      { code: 'ACU-PRIM', title: 'Bachelor of Primary Education', field: 'Education', atarMin: 65.00, atarMedian: 73.10, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Primary School Teacher, Curriculum Specialist', medianGraduateSalary: 77000 },
      { code: 'ACU-SPEECH', title: 'Bachelor of Speech Pathology', field: 'Health & Medicine', atarMin: 80.00, atarMedian: 87.00, duration: '4 Years FT', cspBandFee: 9537, careerOutcome: 'Speech Pathologist, Communication Specialist', medianGraduateSalary: 76000 },
      { code: 'ACU-SPORT', title: 'Bachelor of High Performance Sport / Exercise Science', field: 'Health & Medicine', atarMin: 65.00, atarMedian: 73.80, duration: '3 Years FT', cspBandFee: 9537, careerOutcome: 'Sports Scientist, Strength & Conditioning Coach', medianGraduateSalary: 68000 },
      { code: 'ACU-SW', title: 'Bachelor of Social Work', field: 'Health & Medicine', atarMin: 60.00, atarMedian: 68.00, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Social Worker, Family Services Officer', medianGraduateSalary: 71500 },
      { code: 'ACU-YOUTH', title: 'Bachelor of Youth Work', field: 'Health & Medicine', atarMin: 60.00, atarMedian: 66.50, duration: '3 Years FT', cspBandFee: 4738, careerOutcome: 'Youth Worker, Community Project Leader', medianGraduateSalary: 64000 },
      { code: 'ACU-INCEDU', title: 'Bachelor of Inclusive Education', field: 'Education', atarMin: 65.00, atarMedian: 71.50, duration: '4 Years FT', cspBandFee: 4738, careerOutcome: 'Special Needs Teacher, Inclusive Education Advisor', medianGraduateSalary: 77500 },
    ],
  },
  {
    code: 'TAFE',
    name: 'TAFE Queensland (Brisbane & SEQ)',
    tagline: 'Practical VET Diplomas, Certificates & Accelerated Pathways to Uni',
    worldRankQS: '#1 Vocational Training Provider in Queensland',
    ausRank: '88.5% Graduate Employment & Study Rate',
    logoEmoji: '🛠️',
    url: 'https://tafeqld.edu.au',
    campuses: [
      { name: 'South Bank', location: 'South Bank (Cultural precinct)', transitTip: 'Walk from South Bank train/busway station' },
      { name: 'Kangaroo Point', location: 'Kangaroo Point (Engineering & Maritime)', transitTip: 'CityHopper Ferry or Bus' },
      { name: 'Mt Gravatt & Acacia Ridge', location: 'Acacia Ridge (Trades & Automotive)', transitTip: 'Direct bus connection' },
    ],
    enrollments: {
      total: 120000,
      undergrad: 110000,
      postgrad: 10000,
      domesticPct: 93,
      internationalPct: 7,
      femalePct: 51,
      malePct: 49,
      firstInFamilyPct: 52,
      regionalRuralPct: 41,
    },
    atarDetails: {
      overallMinATAR: 0,
      overallMedianATAR: 0,
      qtacCodePrefix: 'Direct TAFE Application / QTAC',
      adjustmentFactors: 'No ATAR required! Completion of Year 12, Certificate III/IV or work experience guarantees admission.',
      offerRounds: 'Rolling intakes in February, July, and October.',
    },
    earlyOfferScheme: {
      name: 'TAFE Direct Guaranteed Admission & Uni Articulation',
      criteria: 'Zero ATAR required. Direct online enrollment via TAFE QLD or QTAC.',
      deadline: 'Rolling semester intakes (Feb / July / Oct)',
      guaranteedRanks: '100% Guaranteed admission to Diploma + 1 year credit transfer to UQ, QUT, Griffith.',
    },
    specialistStrengths: [
      'Fee-Free TAFE Queensland for Under-25s in Priority Skills Shortages',
      'Direct guaranteed articulation pathways into 2nd year of university',
      'Advanced Acacia Ridge Trades & Electrotechnology Complex',
      'South Bank Digital Design, Film & eSports Studio Labs',
    ],
    olympicRole2032: 'Official Trades, Construction & Hospitality Workforce Training Pipeline for 2032 Games',
    feesAndFinancials: {
      avgCSPAnnual: 3200,
      ssafAnnual: 0,
      scholarshipPool: 'Fee-Free TAFE Queensland scheme covers 100% of tuition for eligible priority courses',
      hecsHelpEligible: false,
    },
    qiltMetrics: {
      fullTimeEmpPct: 88.5,
      medianGraduateSalary: 71500,
      overallSatisfactionPct: 89.2,
    },
    studentLife: {
      vibe: 'Hands-on practical training in workshops, simulated hospital wards, commercial kitchens, and digital labs.',
      clubsCount: 30,
      housingOptions: [
        { type: 'Brisbane Sharehouses', weeklyCost: '$220–$340/wk', details: 'Flexibility across suburbs close to TAFE campuses' },
      ],
    },
    recentNews: [
      { headline: 'Fee-Free TAFE Queensland Extended for 2026/2027 Priority Skill Shortage Degrees', year: '2026', summary: '10,000+ fee-free places available for Queensland school leavers in Nursing, IT, Trades, and Early Childhood.' },
      { headline: 'TAFE QLD Direct Uni Pathways Guarantee Full Credit Transfer to UQ, QUT & Griffith', year: '2026', summary: 'Complete a 1-year TAFE Diploma and enter 2nd year of university with zero ATAR required.' },
      { headline: 'TAFE QLD South Bank Opens $25M Digital Design & eSports Arena', year: '2026', summary: 'State-of-the-art graphics, 3D animation, and broadcast media production labs.' },
    ],
    top10Courses: [
      { code: 'TAFE-NURS', title: 'Diploma of Nursing (Enrolled Nurse)', field: 'Health & Medicine', atarMin: 0, atarMedian: 0, duration: '1.5 Years FT', cspBandFee: 4200, careerOutcome: 'Enrolled Nurse in Public/Private Hospitals', medianGraduateSalary: 68000 },
      { code: 'TAFE-IT', title: 'Diploma of Information Technology (Cyber & Networking)', field: 'IT & Computer Science', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 3800, careerOutcome: 'IT Support Specialist, Junior Cyber Analyst', medianGraduateSalary: 70000 },
      { code: 'TAFE-BUS', title: 'Diploma of Business', field: 'Business & Commerce', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 3200, careerOutcome: 'Office Manager, Business Administrator', medianGraduateSalary: 62000 },
      { code: 'TAFE-ECE', title: 'Diploma of Early Childhood Education & Care', field: 'Education', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 2800, careerOutcome: 'Childcare Director, Early Childhood Educator', medianGraduateSalary: 60000 },
      { code: 'TAFE-DES', title: 'Diploma of Graphic Design', field: 'Creative Arts', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 4500, careerOutcome: 'Graphic Designer, UI/UX Junior Developer', medianGraduateSalary: 58000 },
      { code: 'TAFE-CYBER', title: 'Certificate IV in Cyber Security', field: 'IT & Computer Science', atarMin: 0, atarMedian: 0, duration: '6 Months FT', cspBandFee: 2500, careerOutcome: 'Cyber Security Operations Junior', medianGraduateSalary: 65000 },
      { code: 'TAFE-COMM', title: 'Diploma of Community Services', field: 'Health & Medicine', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 3500, careerOutcome: 'Case Worker, Community Support Specialist', medianGraduateSalary: 64000 },
      { code: 'TAFE-ELEC', title: 'Certificate III in Electrotechnology (Electrician)', field: 'Engineering', atarMin: 0, atarMedian: 0, duration: '4 Years Apprenticeship', cspBandFee: 1200, careerOutcome: 'Licensed Electrician, Electrical Tradesperson', medianGraduateSalary: 82000 },
      { code: 'TAFE-EVENT', title: 'Diploma of Events & Hospitality Management', field: 'Business & Commerce', atarMin: 0, atarMedian: 0, duration: '1 Year FT', cspBandFee: 3600, careerOutcome: 'Event Coordinator, Venue Manager', medianGraduateSalary: 59000 },
      { code: 'TAFE-ENG', title: 'Diploma of Engineering Technical', field: 'Engineering', atarMin: 0, atarMedian: 0, duration: '1.5 Years FT', cspBandFee: 4100, careerOutcome: 'Engineering Technician, CAD Draftsperson', medianGraduateSalary: 74000 },
    ],
  },
];

/** HECS-HELP student contribution amounts 2026 (per StudyAssist, 1 Jan 2026) */
export const HECS_BANDS_2026 = [
  { band: 'Cluster 1 — Law, accounting, administration, economics, commerce, communications, society & culture', fee: 17399, label: '≈ $17,399/yr' },
  { band: 'Cluster 2a — Education, clinical psychology, English, mathematics, statistics', fee: 4738, label: '≈ $4,738/yr' },
  { band: 'Cluster 2b — Allied health, other health, built environment, computing, visual & performing arts, professional pathway psychology/social work', fee: 9537, label: '≈ $9,537/yr' },
  { band: 'Cluster 3a — Nursing, Indigenous & foreign languages', fee: 4738, label: '≈ $4,738/yr (nursing/languages)' },
  { band: 'Cluster 3b — Engineering, surveying, environmental studies, science', fee: 9537, label: '≈ $9,537/yr (engineering/science)' },
  { band: 'Cluster 4a — Agriculture', fee: 4738, label: '≈ $4,738/yr (agriculture)' },
  { band: 'Cluster 4c — Medicine, dentistry, veterinary science', fee: 13558, label: '≈ $13,558/yr' },
];

/** Student Services & Amenities Fee (SSAF) cap for 2026 (Dept of Education — $373 max, $279.75 part-time) */
export const SSAF_CAP_2026 = 373;

/** Median weekly rents by Brisbane suburb (early 2026) */
export interface SuburbRent {
  suburb: string;
  sharedWeekly: string; // room in sharehouse
  unitWeekly: string; // 1-2 bed unit median
  commute: string;
  vibe: string;
}

export const BRISBANE_SUBURBS: SuburbRent[] = [
  { suburb: 'St Lucia', sharedWeekly: '$350–500', unitWeekly: '$550+', commute: 'Bus/ferry 15 min', vibe: 'UQ student hub' },
  { suburb: 'Toowong', sharedWeekly: '$280–400', unitWeekly: '$480–620', commute: 'Train 10 min', vibe: 'Convenient, safe' },
  { suburb: 'South Bank / West End', sharedWeekly: '$380–520', unitWeekly: '$650–700', commute: 'Walk/bus 10 min', vibe: 'Trendy, riverside' },
  { suburb: 'Fortitude Valley', sharedWeekly: '$400–600', unitWeekly: '$600+', commute: 'Train 5 min', vibe: 'Nightlife district' },
  { suburb: 'Indooroopilly', sharedWeekly: '$280–400', unitWeekly: '$470–580', commute: 'Train 20 min', vibe: 'Affordable, family-friendly' },
  { suburb: 'Chermside', sharedWeekly: '$250–350', unitWeekly: '$420–520', commute: 'Bus 30 min', vibe: 'Suburban value' },
  { suburb: 'Kelvin Grove', sharedWeekly: '$330–450', unitWeekly: '$520+', commute: 'Bus 15 min', vibe: 'QUT creative campus' },
  { suburb: 'Annerley', sharedWeekly: '$240–350', unitWeekly: '$430–520', commute: 'Bus 25 min', vibe: 'Budget south-side option' },
];

/** QLD first home buyer help (2026) */
export const QLD_FIRST_HOME_HELP = [
  { name: 'First Home Owner Grant', amount: '$30,000', note: 'New homes under $750,000 (contracts from 1 July 2026)' },
  { name: 'First Home Transfer Duty Concession', amount: 'Up to 100% off', note: 'Full or partial stamp duty reduction on your first home' },
  { name: 'Boost to Buy shared equity', amount: 'Gov up to 30%', note: '2% deposit; government co-invests on new homes' },
  { name: 'First Home Guarantee', amount: '5% deposit', note: 'Federal scheme — no LMI with just 5% down' },
];

/** QLD teen-specific state rules */
export interface QLDRule {
  title: string;
  emoji: string;
  detail: string;
}

export const QLD_TEEN_RULES: QLDRule[] = [
  {
    title: 'Rental bond = max 4 weeks',
    emoji: '🔑',
    detail: 'In Queensland your bond is capped at 4 weeks rent (no rent threshold since Sep 2024). The agent must lodge it with the RTA within 10 days.',
  },
  {
    title: '50c flat fares',
    emoji: '🚌',
    detail: 'Since 5 August 2024, all Queensland public transport (bus, train, ferry, tram) is a flat 50c per trip — no Go Card, no concession needed. Free transfers within 60 minutes; no daily/weekly cap required. School students no longer need a concession card.',
  },
  {
    title: 'QLD rego = 3 parts',
    emoji: '🚗',
    detail: 'Queensland rego combines the registration fee, traffic improvement fee, and CTP insurance. CTP is priced on your car class (not your age) — QLD has the lowest CTP in mainland Australia.',
  },
  {
    title: 'Learner licence from 16',
    emoji: '🪪',
    detail: 'You can get your Ls at 16 in Queensland (PrepL online road rules test). Under 25s must log 100 supervised driving hours (incl. 10 at night) before the P1 test — use the QLD Learner Logbook app to track them.',
  },
  {
    title: 'Super for under 18s',
    emoji: '⭐️',
    detail: 'Same ATO rule nationwide: under 18, employers must pay 12% super only if you work more than 30 hours in a calendar week. Over 18, super is on all hours.',
  },
  {
    title: 'Public holidays',
    emoji: '🎉',
    detail: 'QLD public holidays (Easter, Ekka Show Day in August, Christmas) earn penalty rates of +125% to +150% for casuals — a great weekend pay boost.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUEENSLAND UNIVERSITIES (2026-27)
// Sources: QS World University Rankings 2027 (published 18 Jun 2026), THE World 2026, institutional websites, StudyAssist 1 Jan 2026
// CSP 2026: $4,738 (Education/Nursing/Agriculture) / $9,537 (Allied Health/Engineering/Science/Computing) / $13,558 (Medicine/Dentistry/Vet) / $17,399 (Law/Commerce)
// SSAF cap 2026: $373 for all providers ($279.75 part-time; was $365 in 2025)
// ═══════════════════════════════════════════════════════════════════════════

export interface University {
  name: string;
  abbreviation: string;
  qsWorld2027?: number;
  qsNational2027?: number;
  timesWorld2026?: number;
  mainCampus: string;
  campuses: string[];
  typicalATAR: string;          // indicative range for most courses
  competitiveATAR: string;      // popular courses (e.g. med, law)
  domesticUndergradFees: string;
  cspBands: { band1: number; band2: number; band3: number; band4: number };
  ssaf2026: number;
  notable: string;
  website: string;
}

export const QLD_UNIVERSITIES: University[] = [
  {
    name: 'The University of Queensland',
    abbreviation: 'UQ',
    qsWorld2027: 40,
    qsNational2027: 6,
    timesWorld2026: 77,
    mainCampus: 'St Lucia',
    campuses: ['St Lucia', 'Gatton', 'Herston', 'Ponce (UQ Downtown)'],
    typicalATAR: '80–90',
    competitiveATAR: 'Medicine 95 adj + UCAT/MMI (99+ competitive) / Law 97.5 / Dentistry 98+',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'Group of Eight. QS 40= world (up 2 from 42 in 2026), THE 77–79. Strong in medicine, agriculture, mining, business. St Lucia riverside campus.',
    website: 'https://www.uq.edu.au',
  },
  {
    name: 'Queensland University of Technology',
    abbreviation: 'QUT',
    qsWorld2027: 240,
    qsNational2027: 16,
    timesWorld2026: 201,
    mainCampus: 'Gardens Point (CBD)',
    campuses: ['Gardens Point', 'Kelvin Grove'],
    typicalATAR: '70–85',
    competitiveATAR: 'Law 84 threshold / 87 guarantee / Nursing 74 / Engineering 82',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'Real-world, industry-focused. QS 240 (down 14 from 226 in 2026), strong in creative industries, IT, business, law. Two inner-city campuses.',
    website: 'https://www.qut.edu.au',
  },
  {
    name: 'Griffith University',
    abbreviation: 'Griffith',
    qsWorld2027: 230,
    qsNational2027: 15,
    timesWorld2026: 301,
    mainCampus: 'Nathan / Gold Coast',
    campuses: ['Nathan', 'Gold Coast', 'Mt Gravatt', 'South Bank', 'Logan'],
    typicalATAR: '65–80',
    competitiveATAR: 'Medicine 99.90 (Gold Coast/Brisbane South) / Law 78–88',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'QS 230 (up 38 from 268 in 2026 — largest AU jump top 250). Strong in environmental science, tourism, criminology, music. Five SEQ campuses.',
    website: 'https://www.griffith.edu.au',
  },
  {
    name: 'University of the Sunshine Coast',
    abbreviation: 'UniSC',
    qsWorld2027: 851,
    qsNational2027: 32,
    timesWorld2026: 601,
    mainCampus: 'Sippy Downs',
    campuses: ['Sippy Downs', 'Sunshine Coast Health (Birtinya)', 'Moreton Bay', 'Fraser Coast', 'Gympie'],
    typicalATAR: '60–75',
    competitiveATAR: 'Nursing 70 / Education 70 / Paramedicine 80',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'QS 851–900 (2027). THE 501–600. Fast-growing regional. Strong in nursing, education, sport science. Moreton Bay campus now open (2020).',
    website: 'https://www.usc.edu.au',
  },
  {
    name: 'University of Southern Queensland',
    abbreviation: 'UniSQ',
    qsWorld2027: 411,
    qsNational2027: 23,
    timesWorld2026: 501,
    mainCampus: 'Toowoomba',
    campuses: ['Toowoomba', 'Springfield', 'Ipswich'],
    typicalATAR: '60–75',
    competitiveATAR: 'Aviation 68 / Engineering 75 / Education 70',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'QS 411 (down 1 from 410 in 2026) — #1 QLD regional for online. Leader in engineering, agriculture, surveying, aviation.',
    website: 'https://www.unisq.edu.au',
  },
  {
    name: 'Australian Catholic University',
    abbreviation: 'ACU',
    qsWorld2027: 851,
    qsNational2027: 33,
    timesWorld2026: 601,
    mainCampus: 'Banyo (Brisbane)',
    campuses: ['Banyo', 'North Sydney', 'Melbourne', 'Canberra', 'Ballarat'],
    typicalATAR: '60–80',
    competitiveATAR: 'Nursing 75 / Education 70 / Paramedicine 85',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'QS 851–900 (stable). THE 501–600. Strong in nursing, education, health, social work. Banyo campus north Brisbane.',
    website: 'https://www.acu.edu.au',
  },
  {
    name: 'CQUniversity Australia',
    abbreviation: 'CQU',
    qsWorld2027: 436,
    qsNational2027: 25,
    timesWorld2026: 501,
    mainCampus: 'Rockhampton',
    campuses: ['Rockhampton', 'Brisbane (King St)', 'Bundaberg', 'Cairns', 'Gladstone', 'Mackay', 'Melbourne', 'Sydney', 'Perth'],
    typicalATAR: '60–75 (plus extensive VET-to-degree pathways)',
    competitiveATAR: 'Engineering 70 / Nursing 70 / Education 70',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'Largest regional uni in Australia (30k students, 20 campuses). QS 436 (up 63 from 499 in 2026). Leader in online/distance and apprenticeships. Fee-Free TAFE partner.',
    website: 'https://www.cqu.edu.au',
  },
  {
    name: 'James Cook University',
    abbreviation: 'JCU',
    qsWorld2027: 438,
    qsNational2027: 26,
    timesWorld2026: 351,
    mainCampus: 'Townsville (Bebegu Yumba)',
    campuses: ['Townsville', 'Cairns (Nguma-bada)', 'Brisbane (Exchange)', 'Mackay', 'Mount Isa'],
    typicalATAR: '60–80',
    competitiveATAR: 'Medicine 84.15 lowest / 97.90 median (rural-access) / Dentistry 95+ / Marine Biology 70',
    domesticUndergradFees: 'CSP $4,738–$17,399/yr + SSAF $373',
    cspBands: { band1: 4738, band2: 9537, band3: 13558, band4: 17399 },
    ssaf2026: 373,
    notable: 'QS 438= (up 2 from 440 in 2026), THE 351–400. World leader in tropical medicine, marine biology (Reef), and rural health.',
    website: 'https://www.jcu.edu.au',
  },
  {
    name: 'Bond University',
    abbreviation: 'Bond',
    qsWorld2027: 518,
    qsNational2027: 28,
    timesWorld2026: 401,
    mainCampus: 'Robina (Gold Coast)',
    campuses: ['Robina (Gold Coast)'],
    typicalATAR: 'No ATAR threshold — psychometric + interview (competitive ~95+ for Medicine)',
    competitiveATAR: 'Law ~85+ / Medicine (full-fee, UCAT + interview, competitive 96+)',
    domesticUndergradFees: 'Full-fee private: ~$50k–$75k/yr (accelerated 2-yr bachelor; no CSP)',
    cspBands: { band1: 0, band2: 0, band3: 0, band4: 0 },
    ssaf2026: 0,
    notable: 'Private not-for-profit, QS 518= (up 73 from 591 in 2026). Trimester model — finish bachelor in 2 years. Full-fee only (FEE-HELP available).',
    website: 'https://bond.edu.au',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUEENSLAND YEAR 12 — QCAA, QCE & ATAR (2026)
// Sources: Queensland Curriculum & Assessment Authority (QCAA), QTAC
// ═══════════════════════════════════════════════════════════════════════════

export interface QCEInfo {
  title: string;
  detail: string;
}

export const QLD_YEAR12_OVERVIEW: QCEInfo[] = [
  {
    title: 'QCE (Queensland Certificate of Education)',
    detail: 'Awarded when you achieve at least 20 credits (12 credits must be from completed Core courses) and meet literacy/numeracy requirements. Learning account must be opened while enrolled at a QLD school; at least one Core credit completed while enrolled. Replaced the OP system in 2020. From Aug 2026 all QCE graduates must complete the 1-hour QCAA Academic Integrity Course via the myQCE Portal.',
  },
  {
    title: 'ATAR (Australian Tertiary Admission Rank)',
    detail: 'A national rank from 0.00 to 99.95 in steps of 0.05 used for university admission, calculated by QTAC. An ATAR of 80.00 means you performed better than 80% of the QLD age cohort. Below 30 reported as “30.00 or less”. Valid for 5 years.',
  },
  {
    title: 'Subjects & scaling',
    detail: '46 General + 2 Extension (English&Literature Ext, Music Ext) + Senior External Examination variants, ~22 Applied (incl. Essential English & Essential Mathematics), 4 Short Courses (Literacy, Numeracy, Aboriginal & Torres Strait Islander Languages, Career Education), plus VET. General subjects are scaled and contribute fully; only ONE Applied or ONE completed VET Cert III+ can count toward the ATAR aggregate.',
  },
  {
    title: 'How ATAR is calculated',
    detail: 'QTAC scales your results, then sums your best 5 scaled results (max aggregate 500) — either 5 General subjects, or 4 General + 1 Applied, or 4 General + 1 completed VET Cert III+. English (any of English/EAL/Literature/E&L Ext/Essential English) must be passed at C or higher for ATAR eligibility but only contributes if it is in your top 5. Results must be accumulated within 5 years. Selection rank = ATAR + adjustments (max ~5 points, institution-specific).',
  },
  {
    title: 'Key dates 2026–27',
    detail: 'QTAC applications open 4 Aug 2026. ATAR released 18 Dec 2026 at 12pm (register via QTAC ATAR Portal). Change-of-preference 19–20 Dec 2026. Major Year 12 offers 23 Dec 2026; further rounds 14/21/28 Jan & 4/11 Feb 2027 (weekly Thu rounds from 6 Aug 2026). Y12 Early Offers 4 Sep / 16 Oct / 20 Nov 2026 (VET/Head Start).',
  },
  {
    title: 'Literacy & numeracy',
    detail: 'QCE requires demonstrated literacy and numeracy — met via C or higher in a General/Applied English or Maths (Units 3&4), or C in QCAA Short Courses (Literacy/Numeracy), or 4+ in IB, or recognised studies. Literacy: English, EAL, Literature, English & Literature Extension or Essential English. Numeracy: General/Essential Mathematics, Maths Methods, Specialist Mathematics.',
  },
];

/** Indicative 2026 ATAR cut-offs for popular QLD courses (QTAC, indicative only) */
export interface ATARCutoff {
  course: string;
  provider: string;
  atar: string;
}

export const QLD_ATAR_CUTOFFS_2026: ATARCutoff[] = [
  { course: 'Medicine (provisional entry)', provider: 'UQ', atar: '95.00 adjusted + UCAT/MMI (competitive 99.00+ lowest 2290 UCAT non-rural)' },
  { course: 'Dentistry', provider: 'UQ', atar: '98.00+ (Honours, very high demand)' },
  { course: 'Laws (Honours)', provider: 'UQ', atar: '97.50 (Honours); Law Admission Scheme can assist' },
  { course: 'Engineering (Honours)', provider: 'UQ', atar: '84.00' },
  { course: 'Commerce / Business Management', provider: 'UQ', atar: '84.00 (Business Management 74 adjusted)' },
  { course: 'Nursing', provider: 'UQ', atar: '83.00 threshold; median 88.35 (lowest 78.40 incl. adj)' },
  { course: 'Science', provider: 'UQ', atar: '78.00' },
  { course: 'Nursing', provider: 'QUT', atar: '74.00 threshold / 80.00 guarantee; median 82.30 incl. adj' },
  { course: 'Laws (Honours)', provider: 'QUT', atar: '84.00 threshold / 87.00 guarantee' },
  { course: 'Engineering (Honours)', provider: 'QUT', atar: '82.00 (median 87.90 incl. adj; lowest 82.00)' },
  { course: 'Information Technology', provider: 'QUT', atar: '70–75.00' },
  { course: 'Medical Imaging (Honours)', provider: 'QUT', atar: '96.00' },
  { course: 'Nursing', provider: 'Griffith', atar: '72.00 threshold; median 80.70 incl. adj (Shanghai #1 for nursing)' },
  { course: 'Engineering/Business (Honours)', provider: 'Griffith', atar: '75.25 incl. adj (median 81.15; lowest 67.25 raw)' },
  { course: 'Physiotherapy (Honours)', provider: 'Griffith', atar: '94.00 (median 97.10)' },
  { course: 'Medicine', provider: 'Griffith (Gold Coast/Brisbane South)', atar: '99.90 (99.80–99.90 range, UCAT tie-breaker)' },
  { course: 'Biomedical Science (MD Pathway)', provider: 'Griffith', atar: '82.00' },
  { course: 'Nursing', provider: 'ACU (Brisbane)', atar: '65.00 incl. adj (median 78.95; lowest 56.75 raw)' },
  { course: 'Education (Primary)', provider: 'ACU (Brisbane)', atar: '70.00' },
  { course: 'Medicine', provider: 'JCU (Townsville/Cairns)', atar: '84.15 lowest / 97.90 median (rural-access focus, interview + written app)' },
  { course: 'Education (Primary)', provider: 'UniSC', atar: '70.00' },
  { course: 'Paramedicine', provider: 'QUT / UniSC', atar: '87.00 (QUT) / 80.00 (UniSC)' },
  { course: 'Aviation (Flight Ops)', provider: 'UniSQ', atar: '68.00' },
  { course: 'Nursing (Enrolled via TAFE→B)', provider: 'TAFE QLD', atar: 'No ATAR — Cert III/Diploma pathway' },
  { course: 'Business / Data Science (dual)', provider: 'QUT', atar: '80.00 threshold; median 94.30 incl. adj (lowest 81.00)' },
  { course: 'Data Science', provider: 'QUT', atar: '84.00 threshold; median 97.30 incl. adj (lowest 82.40)' },
  { course: 'Commerce / Science (dual)', provider: 'UQ', atar: '84.00 threshold; median 94.55 incl. adj (lowest 84.20)' },
  { course: 'Behavioural Science (Psychology) / Business', provider: 'QUT', atar: '70.00 threshold; median 85.20 incl. adj (lowest 62.50)' },
  { course: 'Biomedical Science / Business', provider: 'QUT', atar: '70.00 threshold; median 77.20 incl. adj (lowest 65.15)' },
  { course: 'Business / Data Science (dual)', provider: 'Griffith', atar: '63.00 threshold (strong demand)' },
  { course: 'Psychology (Honours)', provider: 'UQ / Griffith / QUT', atar: '82.00 (UQ) / 75.00 (Griffith) / 70.00 (QUT)' },
  { course: 'Commerce', provider: 'UQ', atar: '84.00 (Business Management 74 adjusted)' },
  { course: 'Science / Data Science (dual)', provider: 'UQ', atar: '84.00 (entry to BSc, data sci major)' },
];

/** QCAA subject categories available to Year 11–12 students (QCAA syllabuses 2025/2026) */
export const QCE_SUBJECT_CATEGORIES = [
  { category: 'General subjects', count: 46, note: 'University-oriented, +2 Extension (English & Literature Ext, Music Ext) + SEE — scaled for ATAR (e.g. Maths Methods, Physics, English)' },
  { category: 'Applied subjects', count: 22, note: 'Incl. Essential English & Essential Mathematics — only ONE can count toward ATAR' },
  { category: 'Short Courses', count: 4, note: 'Literacy, Numeracy, Aboriginal & Torres Strait Islander Languages, Career Education — up to 1 Short Course credit can count' },
  { category: 'VET qualifications', count: 'many', note: 'Cert I–IV, Diploma & Advanced Diploma; ONE completed Cert III+ can count toward ATAR' },
];

/** Sample QCAA General & Applied subjects (scaled for ATAR where noted). Source: QCAA 2025–26 syllabus list. */
export const QCE_SUBJECT_EXAMPLES = {
  general: [
    'English', 'English as an Additional Language (EAL)', 'Literature', 'English & Literature Extension',
    'General Mathematics', 'Mathematical Methods', 'Specialist Mathematics', 'Essential Mathematics (Applied)',
    'Biology', 'Chemistry', 'Physics', 'Earth & Environmental Science', 'Marine Science', 'Agricultural Science',
    'Accounting', 'Business', 'Economics', 'Geography', 'Modern History', 'Ancient History', 'Philosophy & Reason',
    'Legal Studies', 'Psychology', 'Social & Community Studies (Applied)', 'Tourism (Applied)',
    'Health', 'Physical Education', 'Sport & Recreation (Applied)', 'Early Childhood Studies',
    'Visual Art', 'Visual Art in Practice (Applied)', 'Drama', 'Dance', 'Music', 'Film, Television & New Media', 'Media Arts in Practice (Applied)',
    'Design', 'Digital Solutions', 'Engineering', 'Aerospace Systems', 'Industrial Technology Skills (Applied)', 'Information & Communication Technology (Applied)',
    'Chinese', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Spanish', 'Latin', 'Arabic', 'Vietnamese',
  ],
  applied: [
    'Essential English', 'Essential Mathematics', 'Social & Community Studies', 'Tourism', 'Sport & Recreation',
    'Building & Construction Skills', 'Furnishing Skills', 'Hospitality Practices', 'Industrial Graphics Skills',
    'Information & Communication Technologies', 'Dance in Practice', 'Media Arts in Practice', 'Visual Arts in Practice',
    'Aquatic Practices', 'Agricultural Practices', 'Engineering Skills', 'Food & Nutrition', 'Music in Practice',
  ],
  shortCourses: [
    'Literacy', 'Numeracy', 'Aboriginal & Torres Strait Islander Languages', 'Career Education',
  ],
  seniorExternal: [
    'Chinese', 'General Mathematics', 'Geography', 'Modern History', 'Physics', 'Chemistry', 'Biology', 'Accounting', 'Legal Studies',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// QUEENSLAND HIGH SCHOOLS (2026)
// Sources: My School (ACARA), NAPLAN, school websites
// ═══════════════════════════════════════════════════════════════════════════

export interface HighSchool {
  name: string;
  type: 'State' | 'Catholic' | 'Independent';
  suburb: string;
  yearLevels: string;
  indicativeICSEA?: number;   // Index of Community Socio-Educational Advantage (ACARA, 1–1500 approx)
  notable: string;
  website: string;
}

export const QLD_HIGH_SCHOOLS: HighSchool[] = [
  {
    name: 'Brisbane State High School',
    type: 'State',
    suburb: 'South Brisbane',
    yearLevels: '7–12',
    indicativeICSEA: 1145,
    notable: 'Selective entry (academic + cultural + sporting). Consistently top-performing state school; strong ATAR results (94th percentile). MySchool 2025: 3,594 students.',
    website: 'https://brisbaneshs.eq.edu.au',
  },
  {
    name: 'Brisbane Grammar School',
    type: 'Independent',
    suburb: 'Spring Hill',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1212,
    notable: 'Boys school, non-selective. GPS. Consistently top NAPLAN/ATAR (median ATAR ~92, 60%+ achieve 90+). Y12 fees ~$36,300 (2026). Tutoring Lounge composite score 98.5.',
    website: 'https://www.brisbanegrammar.com',
  },
  {
    name: 'Brisbane Girls Grammar School',
    type: 'Independent',
    suburb: 'Spring Hill',
    yearLevels: '7–12',
    indicativeICSEA: 1206,
    notable: 'Girls school. Median ATAR 96.2 (2024), strong academic tradition. Most selective girls school in QLD.',
    website: 'https://www.bggs.qld.edu.au',
  },
  {
    name: 'Anglican Church Grammar School (Churchie)',
    type: 'Independent',
    suburb: 'East Brisbane',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1173,
    notable: 'Boys school, GPS. NAPLAN avg 506.6 (2025). Y12 ~$32k. 60% improvement in numeracy/writing vs similar schools.',
    website: 'https://www.churchie.com.au',
  },
  {
    name: 'St Aidan\'s Anglican Girls\' School',
    type: 'Independent',
    suburb: 'Corinda',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1158,
    notable: 'Girls school. Median ATAR 94.1 (2024), high NAPLAN results.',
    website: 'https://www.staidans.qld.edu.au',
  },
  {
    name: 'St Joseph\'s College (Gregory Terrace)',
    type: 'Catholic',
    suburb: 'Spring Hill',
    yearLevels: '5–12',
    indicativeICSEA: 1135,
    notable: 'Boys Catholic school. Strong academics and rugby; fees ~$24,214 (Y12 2026).',
    website: 'https://www.terrace.qld.edu.au',
  },
  {
    name: 'Ormiston College',
    type: 'Independent',
    suburb: 'Ormiston',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1140,
    notable: 'Co-ed independent. Consistently strong NAPLAN results.',
    website: 'https://www.ormistoncollege.com.au',
  },
  {
    name: 'Indooroopilly State High School',
    type: 'State',
    suburb: 'Indooroopilly',
    yearLevels: '7–12',
    indicativeICSEA: 1090,
    notable: 'Large suburban state school with strong academic and IB options.',
    website: 'https://indoorooshs.eq.edu.au',
  },
  {
    name: 'Mansfield State High School',
    type: 'State',
    suburb: 'Mansfield',
    yearLevels: '7–12',
    indicativeICSEA: 1080,
    notable: 'High-performing south-side state school with selective STEM and languages.',
    website: 'https://mansfieldshs.eq.edu.au',
  },
  {
    name: 'Cavendish Road State High School',
    type: 'State',
    suburb: 'Holland Park',
    yearLevels: '7–12',
    indicativeICSEA: 1075,
    notable: 'Popular south-side state school with strong academic and sporting programs.',
    website: 'https://cavendishroadshs.eq.edu.au',
  },
  {
    name: 'Somerville House',
    type: 'Independent',
    suburb: 'South Brisbane',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1186,
    notable: 'Girls independent (Uniting Church). NAPLAN avg 513.1 (2025, #3 QLD). Median ATAR ~92.9. Y12 ~$31,872.',
    website: 'https://www.somerville.qld.edu.au',
  },
  {
    name: 'Brisbane Boys\' College',
    type: 'Independent',
    suburb: 'Toowong',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1164,
    notable: 'Boys independent school (Uniting Church). Strong academics, sport and music. Y12 ~$33,260.',
    website: 'https://www.bbc.qld.edu.au',
  },
  {
    name: 'St Margaret\'s Anglican Girls School',
    type: 'Independent',
    suburb: 'Ascot',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1175,
    notable: 'Girls independent school. Consistently high ATAR and boarding facilities.',
    website: 'https://www.stmargarets.qld.edu.au',
  },
  {
    name: 'All Hallows\' School',
    type: 'Catholic',
    suburb: 'Fortitude Valley',
    yearLevels: 'Year 5–12',
    indicativeICSEA: 1182,
    notable: 'Catholic girls school. Long academic tradition, central city; fees ~$18,950 (2026).',
    website: 'https://www.ahs.qld.edu.au',
  },
  {
    name: 'Villanova College',
    type: 'Catholic',
    suburb: 'Coorparoo',
    yearLevels: 'Year 5–12',
    indicativeICSEA: 1135,
    notable: 'Catholic boys school (Augustinian). Strong community and sporting culture.',
    website: 'https://www.villanova.qld.edu.au',
  },
  {
    name: 'Marist College Ashgrove',
    type: 'Catholic',
    suburb: 'Ashgrove',
    yearLevels: 'Year 5–12',
    indicativeICSEA: 1125,
    notable: 'Catholic boys school. Large boarding and day school, strong rugby tradition. Fees ~$18,710.',
    website: 'https://www.maristashgrove.qld.edu.au',
  },
  {
    name: 'St Peter\'s Lutheran College',
    type: 'Independent',
    suburb: 'Indooroopilly',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1186,
    notable: 'Co-ed independent (Lutheran). NAPLAN avg 515.2 (2025, #2 QLD). Day and boarding, strong academics and music.',
    website: 'https://www.stpeters.qld.edu.au',
  },
  {
    name: 'Queensland Academy for Science Mathematics & Technology (QASMT)',
    type: 'State',
    suburb: 'Toowong',
    yearLevels: '7–12',
    indicativeICSEA: 1185,
    notable: 'Selective IB World School. Median IB 38 (ATAR 95+), top state performer. Entry by exam + interview.',
    website: 'https://qasmt.eq.edu.au',
  },
  {
    name: 'Somerset College',
    type: 'Independent',
    suburb: 'Mudgeeraba (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1165,
    notable: 'Co-ed independent. Consistently Gold Coast’s top ATAR school, strong IB and NAPLAN.',
    website: 'https://www.somerset.qld.edu.au',
  },
  {
    name: 'Whitsunday Anglican School',
    type: 'Independent',
    suburb: 'Mackay',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1120,
    notable: 'Regional star: 22% of cohort achieved 99+ ATAR (2024), top regional QLD performer.',
    website: 'https://www.whitsunday.qld.edu.au',
  },
  {
    name: 'Loreto College Coorparoo',
    type: 'Catholic',
    suburb: 'Coorparoo',
    yearLevels: '7–12',
    indicativeICSEA: 1145,
    notable: 'Girls Catholic school. Strong ATAR (median ~90), music and social justice focus.',
    website: 'https://www.loreto.qld.edu.au',
  },
  {
    name: 'Stuartholme School',
    type: 'Independent',
    suburb: 'Toowong',
    yearLevels: '7–12',
    indicativeICSEA: 1163,
    notable: 'Girls boarding/day school (Sacred Heart). Strong ATAR and boarding community.',
    website: 'https://www.stuartholme.com',
  },
  {
    name: 'St Rita\'s College',
    type: 'Catholic',
    suburb: 'Clayfield',
    yearLevels: '7–12',
    indicativeICSEA: 1155,
    notable: 'Girls Catholic school. Consistently high ATAR, Clayfield prestige precinct.',
    website: 'https://www.stritas.qld.edu.au',
  },
  {
    name: 'Cairns State High School',
    type: 'State',
    suburb: 'Cairns',
    yearLevels: '7–12',
    indicativeICSEA: 1005,
    notable: 'Top regional North QLD state school with selective academic entry.',
    website: 'https://cairnsshs.eq.edu.au',
  },
  {
    name: 'Townsville State High School',
    type: 'State',
    suburb: 'Townsville',
    yearLevels: '7–12',
    indicativeICSEA: 1010,
    notable: 'Leading North QLD state school with STEM and rugby league academy.',
    website: 'https://townsvilleshs.eq.edu.au',
  },
  {
    name: 'Toowoomba State High School',
    type: 'State',
    suburb: 'Toowoomba',
    yearLevels: '7–12',
    indicativeICSEA: 1000,
    notable: 'Major Darling Downs state school with agricultural and trade focus.',
    website: 'https://toowoombashs.eq.edu.au',
  },
  {
    name: 'Gladstone State High School',
    type: 'State',
    suburb: 'Gladstone',
    yearLevels: '7–12',
    indicativeICSEA: 980,
    notable: 'Central QLD state school with strong VET and trade pathways.',
    website: 'https://gladstoneshs.eq.edu.au',
  },
  {
    name: 'Rockhampton State High School',
    type: 'State',
    suburb: 'Rockhampton (Wandal)',
    yearLevels: '7–12',
    indicativeICSEA: 985,
    notable: 'Central QLD regional leader with STEM and agricultural academy.',
    website: 'https://rockhamptonshs.eq.edu.au',
  },
  {
    name: 'Sunshine Coast Grammar School',
    type: 'Independent',
    suburb: 'Forest Glen',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1130,
    notable: 'Co-ed independent on the Sunshine Coast. Strong academics and agriculture.',
    website: 'https://www.scgs.qld.edu.au',
  },
  {
    name: 'Matthew Flinders Anglican College',
    type: 'Independent',
    suburb: 'Buderim',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1140,
    notable: 'Co-ed independent on the Sunshine Coast. High NAPLAN and ATAR results.',
    website: 'https://www.mfac.edu.au',
  },
  {
    name: 'Cannon Hill Anglican College (CHAC)',
    type: 'Independent',
    suburb: 'Cannon Hill',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1125,
    notable: 'Co-ed Anglican school, east Brisbane. Strong music and academic culture.',
    website: 'https://www.chac.qld.edu.au',
  },
  {
    name: 'Iona College',
    type: 'Catholic',
    suburb: 'Wynnum West',
    yearLevels: '5–12',
    indicativeICSEA: 1130,
    notable: 'Boys Catholic school (Oblates). Bayside prestige, strong sport and music.',
    website: 'https://www.iona.qld.edu.au',
  },
  {
    name: 'Redeemer Lutheran College',
    type: 'Independent',
    suburb: 'Rochedale South',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1046,
    notable: 'Co-ed Lutheran school. NAPLAN avg 499.8 (2025, #7 QLD). Strong value private option.',
    website: 'https://www.redeemer.qld.edu.au',
  },
  {
    name: 'All Saints Anglican School',
    type: 'Independent',
    suburb: 'Merrimac (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1133,
    notable: 'Co-ed Anglican school. NAPLAN avg 494.5 (2025, #9 QLD). Strong academics on Gold Coast.',
    website: 'https://www.all-saints.qld.edu.au',
  },
  {
    name: 'Corinda State High School',
    type: 'State',
    suburb: 'Corinda',
    yearLevels: '7–12',
    indicativeICSEA: 1072,
    notable: 'NAPLAN standout among Brisbane\'s 20 largest schools (2025). Outperforms similar-ICSEA schools in 60%+ of tests. Strong academic and performing arts.',
    website: 'https://corindashs.eq.edu.au',
  },
  {
    name: 'Kelvin Grove State College',
    type: 'State',
    suburb: 'Kelvin Grove',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1094,
    notable: 'IB World School with specialist programs. ICSEA 1094 MySchool 2025. Strong academic and creative options.',
    website: 'https://kelv Grove.eq.edu.au',
  },
  {
    name: 'Ferny Grove State High School',
    type: 'State',
    suburb: 'Ferny Grove',
    yearLevels: '7–12',
    indicativeICSEA: 1060,
    notable: 'Strong academic results in Brisbane\'s northwest. Popular state school with good ATAR outcomes.',
    website: 'https://fernygrove.eq.edu.au',
  },
  {
    name: 'Kenmore State High School',
    type: 'State',
    suburb: 'Kenmore',
    yearLevels: '7–12',
    indicativeICSEA: 1075,
    notable: 'Consistent academic performer in Brisbane\'s western suburbs. Strong STEM and music programs.',
    website: 'https://kenmoreshs.eq.edu.au',
  },
  // ─── Gold Coast ───────────────────────────────────────────────────────────────
  {
    name: 'A.B. Paterson College',
    type: 'Independent',
    suburb: 'Arundel (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1150,
    notable: 'Co-ed independent. Median ATAR 88.15 (2024), 24.4% achieved 95+ ATAR. Strong all-round academics.',
    website: 'https://www.abpat.qld.edu.au',
  },
  {
    name: 'St Hilda\'s School',
    type: 'Independent',
    suburb: 'Southport (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1160,
    notable: 'Girls independent (Anglican). Median ATAR 89.00 (2024), strong academics and boarding.',
    website: 'https://www.sthildas.qld.edu.au',
  },
  {
    name: 'The Southport School (TSS)',
    type: 'Independent',
    suburb: 'Southport (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1155,
    notable: 'Boys independent (Anglican). Median ATAR 85.95 (2024). GPS sport and strong academics.',
    website: 'https://www.tss.qld.edu.au',
  },
  {
    name: 'Emmanuel College',
    type: 'Independent',
    suburb: 'Carrara (Gold Coast)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1120,
    notable: 'Co-ed independent (Uniting Church). 23.6% achieved 95+ ATAR (2024). Strong community.',
    website: 'https://www.emmanuel.qld.edu.au',
  },
  {
    name: 'Benowa State High School',
    type: 'State',
    suburb: 'Benowa (Gold Coast)',
    yearLevels: '7–12',
    indicativeICSEA: 1080,
    notable: 'Top Gold Coast public school. NAPLAN avg 574.8. Selective academic enrichment program.',
    website: 'https://benowashs.eq.edu.au',
  },
  {
    name: 'Miami State High School',
    type: 'State',
    suburb: 'Miami (Gold Coast)',
    yearLevels: '7–12',
    indicativeICSEA: 1065,
    notable: 'Gold Coast public school. Median ATAR 85.70 (2024). "Stellar Academic Excellence" program.',
    website: 'https://miamishs.eq.edu.au',
  },
  // ─── Toowoomba (Darling Downs) ────────────────────────────────────────────────
  {
    name: 'Toowoomba Grammar School',
    type: 'Independent',
    suburb: 'Toowoomba',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1150,
    notable: 'Boys independent (non-selective). Better Education 95 (top 13% QLD). Strong boarding and academics.',
    website: 'https://www.tgs.qld.edu.au',
  },
  {
    name: 'Fairholme College',
    type: 'Independent',
    suburb: 'Toowoomba',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1160,
    notable: 'Girls independent (Presbyterian). Better Education 95. One of QLD\'s top regional schools.',
    website: 'https://www.fairholme.qld.edu.au',
  },
  {
    name: 'The Glennie School',
    type: 'Independent',
    suburb: 'Toowoomba',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1130,
    notable: 'Girls independent (Anglican). Better Education 95. Boarding and day, strong academics.',
    website: 'https://www.glennie.qld.edu.au',
  },
  {
    name: 'Toowoomba Anglican School',
    type: 'Independent',
    suburb: 'East Toowoomba',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1140,
    notable: 'Co-ed Anglican school. Better Education 97 (top 7% QLD) — highest-ranked Toowoomba school.',
    website: 'https://www.toowoombaanglican.com.au',
  },
  {
    name: 'Concordia Lutheran College',
    type: 'Independent',
    suburb: 'Toowoomba',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1110,
    notable: 'Co-ed Lutheran school. Better Education 94. Strong regional academics and boarding.',
    website: 'https://www.concordia.qld.edu.au',
  },
  // ─── Townsville (North QLD) ───────────────────────────────────────────────────
  {
    name: 'Townsville Grammar School',
    type: 'Independent',
    suburb: 'North Ward (Townsville)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1160,
    notable: 'Co-ed independent. Better Education 97 (top 9% QLD) — leading North QLD school. Boarding.',
    website: 'https://www.tgs.qld.edu.au',
  },
  {
    name: 'The Cathedral School',
    type: 'Independent',
    suburb: 'Mundingburra (Townsville)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1150,
    notable: 'Co-ed independent (Anglican). Better Education 96 (top 11% QLD). Strong academics and boarding.',
    website: 'https://www.cathedral.qld.edu.au',
  },
  {
    name: 'Ryan Catholic College',
    type: 'Catholic',
    suburb: 'Kirwan (Townsville)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1080,
    notable: 'Co-ed Catholic school. Better Education 86 (top 35% QLD). Large North QLD Catholic college.',
    website: 'https://www.ryancatholic.qld.edu.au',
  },
  // ─── Cairns (Far North QLD) ───────────────────────────────────────────────────
  {
    name: 'St Monica\'s College',
    type: 'Catholic',
    suburb: 'Cairns',
    yearLevels: '7–12',
    indicativeICSEA: 1100,
    notable: 'Girls Catholic school. Better Education 94 (top 15% QLD). Leading Far North QLD school.',
    website: 'https://www.stmonicas.qld.edu.au',
  },
  {
    name: 'St Augustine\'s College',
    type: 'Catholic',
    suburb: 'Cairns',
    yearLevels: '7–12',
    indicativeICSEA: 1100,
    notable: 'Boys Catholic school. Better Education 94 (top 16% QLD). Strong academics and sport.',
    website: 'https://www.saintaug.qld.edu.au',
  },
  {
    name: 'Cairns School of Distance Education',
    type: 'State',
    suburb: 'Manunda (Cairns)',
    yearLevels: 'Prep–12',
    indicativeICSEA: 1040,
    notable: 'Better Education 94 (top 15% QLD). Largest QLD distance-ed school (3,700 students statewide).',
    website: 'https://cairnssde.eq.edu.au',
  },
];

/** QLD school cost reference (annual tuition, indicative 2026 — Brisbane/South-East) */
export const QLD_SCHOOL_COSTS = {
  stateSchool: {
    tuition: '$0 (free)',
    extras: '~$500–$1,500/yr (Student Resource Scheme, devices, uniforms, excursions)',
    note: 'No tuition fees at Queensland state schools. Selective schools (BSHS, QASMT) have subject/resource levies. Devices ~$500–$900. Trade Training Allowance $164 Y7-10 / $357 Y11-12 offsets costs.',
  },
  catholicSchool: {
    tuition: '$11,280–$24,214/yr secondary (2026 Brisbane)',
    extras: '~$1,000–$2,500/yr (building levy 8–15%, uniforms $500–$800, excursions/camps)',
    note: 'Brisbane Catholic secondary 2026: systemic primary $3k–$6k, secondary $11k (Lourdes Hill/Padua low) to $24k (Terrace). Typical $14k–$19k (All Hallows $18,950, Marist $18,710). Sibling discounts 10–15% at most colleges.',
  },
  independentSchool: {
    tuition: '$11,280–$36,300/yr (median $18,703)',
    extras: '~$2,000–$5,000/yr (capital/building levy, uniforms, excursions, technology)',
    note: 'Brisbane independent median $18,703 (35 schools). Most expensive: Brisbane Grammar $36,300, BGGS ~$34k, Somerville ~$31,872. Cheapest independent ~$11k. Boarding adds $28k–$36k. Total K-12 Futurity: Gov $113k / Catholic metro QLD $273k / Independent metro QLD $423k.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VOCATIONAL / TAFE QUEENSLAND (2026)
// Sources: TAFE Queensland, Department of Employment
// ═══════════════════════════════════════════════════════════════════════════

export const QLD_TAFE = {
  feeFreeCourses2026: [
    'CHC33021 Certificate III in Individual Support (Ageing/Disability) — aged care',
    'CHC43121 Certificate IV in Disability Support (must hold Cert III + existing worker)',
    'CHC30121 Certificate III in Early Childhood Education and Care',
    'CHC52021 Diploma of Community Services — case management',
    'HLT54121 Diploma of Nursing (Enrolled Nurse)',
    'UEE30820 Certificate III in Electrotechnology Electrician (pre-apprenticeship)',
    'CPC30220 Certificate III in Carpentry (Construction)',
    'RII30820 Certificate III in Civil Construction',
    'SIT30821 Certificate III in Commercial Cookery',
    'SHB30416 Certificate III in Hairdressing',
    'AUR30620 Certificate III in Light Vehicle Mechanical Technology',
    'SIT40521 Certificate IV in Kitchen Management',
    'BSB40120 Certificate IV in Business',
    'ICT50220 Diploma of Information Technology (Cyber & Networking)',
    'ICT30120 Certificate III in Information Technology',
    'SIS30321 Certificate III in Fitness',
    'BSB41419 Certificate IV in Work Health & Safety',
    'UEE32220 Certificate III in Air-conditioning & Refrigeration',
    'AUR31120 Certificate III in Heavy Commercial Vehicle Mechanical',
    'CPC32420 Certificate III in Plumbing',
    'SHB30516 Certificate III in Barbering',
    'MSL40122 Certificate IV in Laboratory Techniques',
    'CPC33020 Certificate III in Bricklaying/Blocklaying',
    'CPC32720 Certificate III in Gas Fitting',
    'CPC32620 Certificate III in Roof Plumbing',
    'CPC31920 Certificate III in Joinery',
    'CPC30620 Certificate III in Painting and Decorating',
    'MEM30219 Certificate III in Engineering — Mechanical Trade',
    'MEM30319 Certificate III in Engineering — Fabrication Trade',
    'AUR32721 Certificate III in Automotive Electrical Vehicle Technology',
  ],
  feeFreeNote: 'Fee-Free TAFE extended to 31 Dec 2026 at TAFE QLD + CQUniversity only. One Fee-Free qualification per student 2023-2026 (exception: both Cert III + Diploma of Early Childhood allowed). Covers Free Nursing & Free Construction Apprenticeships (incl. Over-25s). Open to QLD residents 15+ not enrolled at school/uni, with priority cohorts (under 25, jobseekers, First Nations, carers, disability) guaranteed. 40+ qualifications across 7 study areas.',
  freeApprenticeships: {
    note: 'Free Apprenticeships for Under 25s extended to 30 June 2027. Covers 130+ priority apprenticeships and traineeships across automotive, construction, engineering, electrotechnology, hospitality, horticulture, manufacturing, retail, and more. Training fees (~$1.60/hr) fully subsidised by QLD Government.',
    industries: ['Automotive', 'Construction & Civil', 'Electrotechnology & Utilities', 'Engineering & Aviation', 'Hospitality & Cookery', 'Agriculture & Horticulture', 'Manufacturing & Furnishing', 'Community Services', 'Arts & Entertainment', 'Retail & Recreation'],
    eligibility: 'Under 25, QLD resident, employed as apprentice/trainee in a priority qualification, contract commenced 1 Jan 2021 – 30 Jun 2027.',
  },
  freeConstructionOver25: 'Free Construction Apprenticeships for Over 25s covers full tuition for priority construction trades (bricklaying, carpentry, plumbing, painting, tiling, roofing, civil construction). Available at TAFE QLD + CQUniversity.',
  typicalCourseCost: '$0–$3,000 (Fee-Free) or $4,000–$15,000 (full-fee diplomas); Free Apprenticeships under 25 cover tuition for priority trades',
  apprenticeshipNote: 'School-based apprenticeships (SATs) available from Year 10 — minimum 7.5 hours/week paid employment + training. SATs combine paid work, TAFE training and school to earn a national qualification while completing QCE.',
};

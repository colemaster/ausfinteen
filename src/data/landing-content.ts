/**
 * Landing page content for a 15-year-old-first experience.
 * All figures are derived from existing src/data modules (no duplicated constants).
 * Based on Sept 2026 ATO / Fair Work / RBA / QTAC / TAFE QLD reference data.
 */

import { AGE_PRESETS, JUNIOR_AWARD_RATES, TEEN_SAVINGS_ACCOUNTS } from '@/data/teen-finance-data';
import {
  QTAC_FEES_2027,
  QLD_ATAR_CUTOFFS_2026,
  QLD_HIGH_SCHOOLS,
  QLD_TAFE,
  BRISBANE_SUBURBS,
} from '@/data/brisbane-data';
import { MANDY_MODULES } from '@/data/mandy-topics';
import {
  HELP_REPAYMENT_THRESHOLDS_2026_27,
  NATIONAL_MINIMUM_WAGE_2026,
  RBA_CASH_RATE_SEPT_2026,
} from '@/data/constants';
import { SUPER_RULES } from '@/data/super-rules';

export interface HeroStat {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  emoji: string;
}

export interface JourneyStep {
  age: 15 | 16 | 17 | 18;
  milestone: string;
  emoji: string;
  bullets: [string, string];
  route: string;
}

export interface MythFact {
  myth: string;
  fact: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StatBandItem {
  id: string;
  label: string;
  value: string;
  sublabel: string;
}

// ─── Derived primitives (single source of truth, never hardcoded) ────────────

const TOP_HISA_RATE: number = Math.max(...TEEN_SAVINGS_ACCOUNTS.map((account) => account.maxRate));

const TOP_HISA_BANK: string =
  TEEN_SAVINGS_ACCOUNTS.find((account) => account.maxRate === TOP_HISA_RATE)?.bank ??
  'youth savings account';

const TOTAL_GUIDE_COUNT: number = MANDY_MODULES.reduce((sum, mod) => sum + mod.topics.length, 0);

const MODULE_COUNT: number = MANDY_MODULES.length;

const SCHOOL_COUNT: number = QLD_HIGH_SCHOOLS.length;

const FEE_FREE_COUNT: number = QLD_TAFE.feeFreeCourses2026.length;

const FREE_APPRENTICE_COUNT: number = QLD_TAFE.freeApprenticeshipCoursesU25.length;

const ATAR_CUTOFF_COUNT: number = QLD_ATAR_CUTOFFS_2026.length;

const SUBURB_COUNT: number = BRISBANE_SUBURBS.length;

const FIRST_SUBURB: string = BRISBANE_SUBURBS[0].suburb;

const HELP_FREE_UNTIL: number = HELP_REPAYMENT_THRESHOLDS_2026_27[0].max;

const SG_PCT: string = `${(SUPER_RULES.sgRate * 100).toFixed(1)}%`;

const RBA_PCT: string = `${(RBA_CASH_RATE_SEPT_2026 * 100).toFixed(2)}%`;

const NMW_HOURLY: string = NATIONAL_MINIMUM_WAGE_2026.hourly.toFixed(2);

const ADULT_L1_BASE: string = NATIONAL_MINIMUM_WAGE_2026.retailFastFoodL1Base.toFixed(2);

function moduleRoute(moduleId: string): string {
  return MANDY_MODULES.find((mod) => mod.id === moduleId)?.route ?? '/';
}

// ─── HERO_STATS ──────────────────────────────────────────────────────────────

export const HERO_STATS: HeroStat[] = [
  {
    id: 'top-hisa',
    label: 'Top youth savings rate',
    value: `${TOP_HISA_RATE.toFixed(2)}% p.a.`,
    sublabel: `${TOP_HISA_BANK} — cash rate backdrop ${RBA_PCT}`,
    emoji: '🏦',
  },
  {
    id: 'sg-rate',
    label: 'Super Guarantee on your pay',
    value: SG_PCT,
    sublabel: 'Paid on top of wages, delivered each payday',
    emoji: '⭐️',
  },
  {
    id: 'help-threshold',
    label: 'HELP repayments start above',
    value: `$${HELP_FREE_UNTIL.toLocaleString('en-AU')}`,
    sublabel: 'No compulsory repayment below this income',
    emoji: '🎓',
  },
  {
    id: 'schools',
    label: 'QLD high schools profiled',
    value: `${SCHOOL_COUNT}`,
    sublabel: 'State, Catholic and Independent options',
    emoji: '🏫',
  },
  {
    id: 'guides',
    label: 'Bite-size money guides',
    value: `${TOTAL_GUIDE_COUNT}`,
    sublabel: `Across ${MODULE_COUNT} Mandy modules`,
    emoji: '📚',
  },
];

// ─── JOURNEY_STEPS ───────────────────────────────────────────────────────────

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    age: 15,
    milestone: 'First job, TFN and first paycheck',
    emoji: '🐣',
    bullets: [
      `Earn $${AGE_PRESETS[15].hourlyRate.toFixed(2)}/hr as ${AGE_PRESETS[15].jobTitle} on the ${AGE_PRESETS[15].hoursPerWeek} hrs/week preset`,
      `Covered by ${JUNIOR_AWARD_RATES.fast_food.name} at ${(JUNIOR_AWARD_RATES.fast_food.rates[0].pct * 100).toFixed(0)}% of the $${JUNIOR_AWARD_RATES.fast_food.adultBaseRate.toFixed(2)} adult base`,
    ],
    route: `${moduleRoute('careers-employment')}?tab=first-job&preset=15`,
  },
  {
    age: 16,
    milestone: 'Paycheck routine and Mojo buffer',
    emoji: '💵',
    bullets: [
      `Preset: ${AGE_PRESETS[16].jobTitle} at $${AGE_PRESETS[16].hourlyRate.toFixed(2)}/hr saving for “${AGE_PRESETS[16].savingsGoalName}”`,
      `Check ${JUNIOR_AWARD_RATES.retail.code} junior percentages against the $${NMW_HOURLY}/hr national minimum and $${ADULT_L1_BASE} retail adult base`,
    ],
    route: `${moduleRoute('teen-budgeting')}?tab=budget-planner&preset=16`,
  },
  {
    age: 17,
    milestone: 'Wheels, work hours and independence',
    emoji: '🚗',
    bullets: [
      `Preset: ${AGE_PRESETS[17].jobTitle} at $${AGE_PRESETS[17].hourlyRate.toFixed(2)}/hr over ${AGE_PRESETS[17].hoursPerWeek} hrs/week towards “${AGE_PRESETS[17].savingsGoalName}”`,
      `Park rego and insurance savings at up to ${TOP_HISA_RATE.toFixed(2)}% p.a. with ${TOP_HISA_BANK}`,
    ],
    route: `${moduleRoute('car-driving')}?tab=car-costs&preset=17`,
  },
  {
    age: 18,
    milestone: 'Super on every hour plus uni or TAFE choice',
    emoji: '🎓',
    bullets: [
      `Preset: ${AGE_PRESETS[18].jobTitle} at $${AGE_PRESETS[18].hourlyRate.toFixed(2)}/hr — ${SG_PCT} super now applies to every hour worked`,
      `QTAC Year 12 applications from $${QTAC_FEES_2027.year12Early} with major offers ${QTAC_FEES_2027.majorOfferRound1} and ${QTAC_FEES_2027.majorOfferRound2}`,
    ],
    route: `${moduleRoute('brisbane-qld')}?tab=uni-compare&preset=18`,
  },
];

// ─── MYTH_FACTS ──────────────────────────────────────────────────────────────

export const MYTH_FACTS: MythFact[] = [
  {
    myth: 'Small teen balances earn nothing worth chasing.',
    fact: `Youth savers reach ${TOP_HISA_RATE.toFixed(2)}% p.a. with ${TOP_HISA_BANK} while the cash rate sits at ${RBA_PCT}, so even pocket-money balances compound.`,
  },
  {
    myth: 'Super comes out of my wages and cuts my pay.',
    fact: `Super at ${SG_PCT} is paid on top of ordinary earnings, and younger staff qualify in weeks they exceed ${SUPER_RULES.under18WeeklyHoursThreshold} hours until the age rule falls away.`,
  },
  {
    myth: 'HELP takes a cut from my first casual paycheck.',
    fact: `No compulsory HELP repayment applies at or below $${HELP_FREE_UNTIL.toLocaleString('en-AU')}, so typical after-school earnings attract no compulsory repayment.`,
  },
  {
    myth: 'Every junior job pays the same tiny rate.',
    fact: `Under ${JUNIOR_AWARD_RATES.cleaning.name}, general cleaners earn ${(JUNIOR_AWARD_RATES.cleaning.rates[0].pct * 100).toFixed(0)}% of the $${JUNIOR_AWARD_RATES.cleaning.adultBaseRate.toFixed(2)} adult base with no junior discount, unlike ${JUNIOR_AWARD_RATES.fast_food.code} juniors.`,
  },
  {
    myth: 'The minimum wage is one flat number for all teens.',
    fact: `The national minimum is $${NMW_HOURLY}/hr while the retail and fast food adult base is $${ADULT_L1_BASE}/hr, with juniors paid an age percentage plus casual loading.`,
  },
  {
    myth: 'You need a sky-high ATAR or uni costs a fortune upfront.',
    fact: `We track ${ATAR_CUTOFF_COUNT} indicative cut-offs plus ${FEE_FREE_COUNT} Fee-Free TAFE courses with no ATAR requirement and HELP deferral for eligible uni places.`,
  },
];

// ─── FAQ_ITEMS ───────────────────────────────────────────────────────────────

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What savings rate can a 15-year-old get right now?',
    answer: `The top tracked youth rate is ${TOP_HISA_RATE.toFixed(2)}% p.a. with ${TOP_HISA_BANK}, well above the September cash rate of ${RBA_PCT}. Check the monthly bonus conditions so you actually earn the top rate.`,
  },
  {
    question: 'Do I get super on my first casual job at 15?',
    answer: `You earn ${SG_PCT} super on top of wages only in weeks you exceed ${SUPER_RULES.under18WeeklyHoursThreshold} hours, then on every hour once you are older. Since last July it must land within days of each payday, so check your fund after pay day.`,
  },
  {
    question: 'When do I have to start repaying HELP or HECS?',
    answer: `You pay nothing compulsorily while repayment income stays at or below $${HELP_FREE_UNTIL.toLocaleString('en-AU')}. Above that, marginal bands apply instead of a flat cut from dollar one.`,
  },
  {
    question: 'How much is QTAC and when do offers come out?',
    answer: `Year 12 early applications cost $${QTAC_FEES_2027.year12Early} with ATARs released ${QTAC_FEES_2027.atarRelease} and major Year 12 offers on ${QTAC_FEES_2027.majorOfferRound1} and ${QTAC_FEES_2027.majorOfferRound2}.`,
  },
  {
    question: 'Is Fee-Free TAFE real for school leavers?',
    answer: `Yes, we list ${FEE_FREE_COUNT} Fee-Free courses plus ${FREE_APPRENTICE_COUNT} free under-25 apprenticeship pathways for eligible Queensland residents. One Fee-Free qualification rule and residency checks still apply.`,
  },
  {
    question: 'What ATAR do I need for Brisbane courses?',
    answer: `It varies widely by course and provider, so we track ${ATAR_CUTOFF_COUNT} indicative January-offer cut-offs to compare selection ranks side by side. Use them as a guide only and check QTAC for the current round.`,
  },
  {
    question: 'What can a 15-year-old legally be paid?',
    answer: `Our 15-year-old preset earns $${AGE_PRESETS[15].hourlyRate.toFixed(2)}/hr for around ${AGE_PRESETS[15].hoursPerWeek} hours a week under ${JUNIOR_AWARD_RATES.fast_food.code}, which is a junior percentage of the $${ADULT_L1_BASE} adult base. Always confirm your award on the Fair Work calculator.`,
  },
  {
    question: 'Where do Brisbane students live affordably?',
    answer: `We compare ${SUBURB_COUNT} suburbs from ${FIRST_SUBURB} share rooms to outer-suburb value alongside ${SCHOOL_COUNT} profiled high schools for planning the move. Public transport stays simple with the flat statewide fare.`,
  },
];

// ─── STAT_BAND ───────────────────────────────────────────────────────────────

export const STAT_BAND: StatBandItem[] = [
  {
    id: 'schools',
    label: 'QLD high schools profiled',
    value: `${SCHOOL_COUNT}`,
    sublabel: 'State, Catholic and Independent',
  },
  {
    id: 'guides',
    label: 'Teen money guides',
    value: `${TOTAL_GUIDE_COUNT}`,
    sublabel: `Across ${MODULE_COUNT} modules`,
  },
  {
    id: 'fee-free',
    label: 'Fee-Free TAFE courses',
    value: `${FEE_FREE_COUNT}`,
    sublabel: 'QLD priority skills list',
  },
  {
    id: 'atar-cutoffs',
    label: 'Indicative ATAR cut-offs',
    value: `${ATAR_CUTOFF_COUNT}`,
    sublabel: 'Brisbane January offers sample',
  },
  {
    id: 'hisa',
    label: 'Top youth savings rate',
    value: `${TOP_HISA_RATE.toFixed(2)}% p.a.`,
    sublabel: TOP_HISA_BANK,
  },
  {
    id: 'sg',
    label: 'Super Guarantee rate',
    value: SG_PCT,
    sublabel: 'Paid on top of wages',
  },
];

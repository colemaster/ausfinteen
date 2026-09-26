import type { TopicGuide } from './modules/types';

export interface ResolvedSpotlight {
  topic: TopicGuide;
  route: string;
  moduleLabel: string;
  moduleEmoji: string;
}

export const RESOLVED_SPOTLIGHTS: readonly ResolvedSpotlight[] = [
  {
    "topic": {
      "id": "tg-13",
      "moduleId": "tax-guide",
      "moduleTitle": "Tax & Tax Returns 💰",
      "question": "13. $1,000 Standard Deduction (From 2026-27): No Receipts Needed",
      "answer": "From 1 July 2026, workers with wage income automatically get up to a $1,000 deduction against labour income — no receipts, no records, no spending required (worth ~$160–$450 depending on your bracket). It is capped at your labour income and reduces taxable income, not your tax bill directly. Claim actual expenses instead only if they exceed $1,000 (then you need full records). Union and professional fees stay claimable ON TOP. First claimed in the 2026–27 return you lodge in July 2027.",
      "actionStep": "Casual with few receipts? Take the standard $1,000. Tradie with big tool costs? Keep every receipt.",
      "webLink": {
        "title": "ATO: Individual Income Tax Rates & Stage 3 Brackets",
        "url": "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
        "source": "ATO",
        "description": "Official 2026-27 Australian resident individual tax brackets including the $18,200 threshold and 16% lowest bracket."
      }
    },
    "route": "/tax-guide",
    "moduleLabel": "Tax & Tax Returns",
    "moduleEmoji": "💰"
  },
  {
    "topic": {
      "id": "sr-13",
      "moduleId": "super-retirement",
      "moduleTitle": "Super & Retirement ⭐️",
      "question": "13. Payday Super (From 1 July 2026): Your Super Must Arrive Every Payday",
      "answer": "Quarterly super is gone — from 1 July 2026 your employer must have your 12% super RECEIVED by your fund within 7 business days of each payday (20 business days for a brand-new fund). It is reported every pay run via Single Touch Payroll, and late payments trigger the Super Guarantee Charge plus penalties. Teens miss super most often, so check each payslip against your fund app and myGov > ATO > Super — if money is missing after ~7 business days, ask payroll in writing.",
      "actionStep": "After your next payday, confirm the super landed in your fund within 7 business days.",
      "webLink": {
        "title": "ATO: Super Guarantee Eligibility Rules",
        "url": "https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-need-to-pay-super",
        "source": "ATO",
        "description": "Under 18 super guarantee rule: must work >30 hours in a calendar week under SGAA 1992 s 19(10) to receive 12.0% Super."
      }
    },
    "route": "/super-retirement",
    "moduleLabel": "Super & Retirement",
    "moduleEmoji": "⭐️"
  },
  {
    "topic": {
      "id": "bq-13",
      "moduleId": "brisbane-qld",
      "moduleTitle": "Brisbane, QLD 🏙️",
      "question": "13. QTAC 2027 Playbook: $75 Early-Bird, 18 Dec ATAR, 23 Dec Offers",
      "answer": "QTAC applications for 2027 intake opened 4 August 2026 — Year 12s pay just $75 if they apply by 30 September (then $159). ATARs release 9am Friday 18 December 2026, with change-of-preference windows before the major offer rounds on 23 December 2026 and 14 January 2027 (further rounds into February). Early-offer schemes (QUT, Griffith, UniSC, UniSQ, ACU) can land from September — but every pathway still needs prerequisites plus a QTAC preference, so list all 6 preferences strategically and use a personal email you will keep.",
      "actionStep": "Apply on QTAC before 30 September to save $84 and lock in your 6 preferences.",
      "webLink": {
        "title": "QTAC: Queensland Tertiary Admissions Centre",
        "url": "https://www.qtac.edu.au",
        "source": "University",
        "description": "Official portal for university preferences, ATAR scaling, and guaranteed early offer schemes in Queensland."
      }
    },
    "route": "/brisbane-qld",
    "moduleLabel": "Brisbane, QLD",
    "moduleEmoji": "🏙️"
  },
  {
    "topic": {
      "id": "is-14",
      "moduleId": "investing-shares",
      "moduleTitle": "Investing & Shares ⚡️",
      "question": "14. CGT Discount Ends 1 July 2027: Keep Every Buy Record From Now",
      "answer": "The 50% CGT discount for individuals ends for gains accruing from 1 July 2027 (now law) — replaced by CPI indexation of your cost base plus a 30% minimum tax on post-2027 real gains, with pre-July-2027 growth grandfathered. Super funds keep their 33.33% discount and the main residence stays exempt. For a teen investor this changes nothing today but everything later: indexation needs exact buy dates, prices and brokerage, so keep every contract note from your first trade — your 40-year-old self will thank you.",
      "actionStep": "Create a folder today for every brokerage contract note and dividend statement.",
      "webLink": {
        "title": "Moneysmart: How to Invest in Shares & ETFs",
        "url": "https://moneysmart.gov.au/how-to-invest",
        "source": "Moneysmart",
        "description": "Australian Government guide to shares, ETFs, managed funds, risk and the \"investing is a marathon\" mindset."
      }
    },
    "route": "/investing-shares",
    "moduleLabel": "Investing & Shares",
    "moduleEmoji": "⚡️"
  },
  {
    "topic": {
      "id": "ss-14",
      "moduleId": "spending-saving",
      "moduleTitle": "Spending & Saving 🛍️",
      "question": "14. Up Bank 5.35% Grow: The No-Withdrawal Rule That Trips Everyone Up",
      "answer": "Up pays 5.35% on Savers up to $250k combined — but only if you make 5 settled card purchases a month AND make zero withdrawals or transfers out of that Saver all calendar month. Touch it once and the whole Saver drops to ~2.00% Flow for the month; miss the 5 purchases and you earn 0%. The hack: run up to 50 Savers — keep bills and spending in one Flow saver and your emergency fund locked in an untouched saver, with 5 tiny early-month top-ups to lock the purchase count.",
      "actionStep": "Set five $1 early-month transfers and move your emergency fund to a Saver you never touch.",
      "webLink": {
        "title": "Up Bank: Saver Account (5.00% p.a.)",
        "url": "https://up.com.au/features/savers/",
        "source": "Bank",
        "description": "Next-gen digital banking for ages 16+ paying 5.00% p.a. with automated roundups and 5 monthly debit purchases."
      }
    },
    "route": "/spending-saving",
    "moduleLabel": "Spending & Saving",
    "moduleEmoji": "🛍️"
  },
  {
    "topic": {
      "id": "ce-13",
      "moduleId": "careers-employment",
      "moduleTitle": "Careers & Employment 💼",
      "question": "13. Cleaning Award Secret: Full Adult Pay From Day One (No Junior Rates!)",
      "answer": "The Cleaning Services Award (MA000022) has NO junior percentage rates — a 15-year-old cleaner earns the full adult Level 1 rate of $27.81/hr ($34.76/hr casual with 25% loading) from 1 July 2026, plus Saturday 150%, Sunday 200% and public holiday 250%. That can double what Retail juniors earn at the same age. Exception: trolley collectors hired via contractors (not directly by supermarkets) DO get junior rates — always confirm who your legal employer is.",
      "actionStep": "Target contract-cleaning firms for maximum hourly pay and verify your Level 1 rate on the Fair Work PACT calculator.",
      "webLink": {
        "title": "Fair Work Ombudsman: Pay & Junior Award Rates Calculator",
        "url": "https://calculate.fairwork.gov.au/",
        "source": "Fair Work",
        "description": "Official PACT calculator for Retail, Fast Food, and Hospitality junior pay percentage rates."
      }
    },
    "route": "/careers-employment",
    "moduleLabel": "Careers & Employment",
    "moduleEmoji": "💼"
  }
];

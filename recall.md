# AusFinTools — Recall Log

> Running chain-of-thought log. Read this first when resuming after context compaction.

---

## Versioning Gates

| Version | Phase | Description | Status |
|---------|-------|-------------|--------|
| v0.1.0  | Phase 0–1  | File reorg + Vite/React/TS/Tailwind v4/Vitest scaffold | Pushed |
| v0.2.0  | Phase 2    | Australian data layer + utils | Pushed |
| v0.3.0  | Phase 3    | Shared UI components + theme + routing shell | Pushed |
| v0.4.0  | Phase 4    | Calculator: Offset vs Debt Recycling | Pushed |
| v0.5.0  | Phase 5    | Calculator: Direct Investing vs DR | Pushed |
| v0.6.0  | Phase 6    | Calculator: Tax Savings Guide (4 sub-tabs) | Pushed |
| v0.7.0  | Phase 7    | Calculator: House Affordability | Pushed |
| v0.8.0  | Phase 8    | Calculator: FIRE Suite (5 sub-tabs) | Pushed |
| v0.9.0  | Phase 9    | Calculator: Investment Comparison | Pushed |
| v0.10.0 | Phase 10   | Calculator: Savings Rate Impact | Pushed |
| v0.11.0 | Phase 11   | Calculator: Property Research Tool | Pushed |
| v1.0.0  | Phase 12   | README, LICENSE, CONTRIBUTING, GitHub Actions deploy | Pushed |
| v1.1.0  | Post-v1    | UX polish: dark mode fix, branding rename, default reset, AboutCalc, output explanations, IO/PI toggle, DR framing | Pushed |
| v1.2.0  | Post-v1    | Portfolio view, gear icon, light mode contrast, Investment lock, nav reorder/rerename, DR text removal | Pushed |
| v2.0.0  | 2027 Overhaul | Complete frontend rebuild: OKLCH design system, shadcn charts, Motion 12+ animations, 2027 CSS, performance optimization, premium UI components | Pushed |
| v2.1.0  | Teen Overhaul | Complete pivot to Teenager / First Job / 16yo Persona: 10 Mandy Money Book modules, 160+ Q&A topics, 10 interactive teen tools, official AU web links | Pushed |
| v2.2.0  | Careers Module| Ultimate Careers & Employment Super-Module: ATO Forms NAT 3092/13080, FWIS/CEIS, 8 Junior Awards, Penalty Rates, Barefoot & Broke Millennial Scripts, Teen Resume Builder | Pushed |
| v3.0.0  | End-to-End | Complete 10-Module Overhaul: Money Mindset Quiz, Barefoot 3-Buckets, Broke Millennial scripts, Div 6AA minor tax, Super Fee Caps, 4-wk rental bond, 200+ Q&A topics | Pushed |
| v3.1.0  | Car Module | Replace Module 10 "Wealth & Property" with a thorough "Cars & Driving" module: QLD licence path (costs/tests/timeframes), first-car true costs + PPSR, EV vs petrol calculator, Brisbane fuel & parking data; car content consolidated out of Module 6 | Local (push blocked) |
| v3.2.0  | ETF Upgrade | Investing & Shares upgrade: "Best 3 starter ETF portfolios" (weighted MER/returns computed live), "Next Big Things in ASX ETFs 2026" trends, $10k growth (total return) chart with annual-returns toggle, refreshed trailing returns to mid-2026 | Local (push blocked) |

---

## v3.1.0 — CARS & DRIVING MODULE (replaces Wealth & Property)

### Summary
Module 10 "Wealth & Property 🌱" was replaced with a thorough "Cars & Driving 🚗" module (`/car-driving`) focused on Brisbane, QLD: driver licensing step-by-step with 2026 fees, first-car true-cost tooling, EV vs petrol running costs, Brisbane fuel prices/cycle, and parking zones. All car content was consolidated out of Module 6.

### Key Changes
1. **New data layer `src/data/car-data.ts`**:
   - `QLD_LICENCE_PATH` — L (16, 12mo, 100 logbook hrs) → P1 (17, 12mo) → P2 (18, 12–24mo) → Open (20), with fees/requirements/restrictions.
   - `QLD_LICENCE_FEES` (1 July 2026): PrepL $29.70, learner $80.15, HPT $42.70, practical $69.40, P1 $94.65, P2 $132.00, open $94.65 (~$543 total gov fees).
   - `BRISBANE_FUEL_PRICES` (late Jul 2026): E10 $1.94, ULP91 $1.96, P95 $2.14, P98 $2.21, diesel $2.37, LPG $1.15; ~23-day price cycle.
   - `EV_VS_PETROL_DEFAULTS` — petrol 6.5L/100km @ $1.96 vs EV 16kWh/100km, home off-peak $0.30/kWh, public fast $0.65/kWh.
   - `BRISBANE_PARKING_ZONES` — Zone 1 CBD $6.85/hr, Zone 2 fringe $4.95/hr, Zone 3 suburbs $3.45/hr + free-parking golden rules + off-street daily max $78–83.
2. **New page `src/pages/CarDriving.tsx`** (replaces `WealthProperty.tsx`): hero, `FirstCarCostCalculator` (moved from Module 6), new `EvVsPetrolCalculator`, Tabs (Licence Path / Fuel & EVs / Parking), highlights, TopicGuideAccordion, web sources. `WealthProperty.tsx` and `calculators/teen-property/MovingOutCostEstimator.tsx` deleted.
3. **New calculator `src/calculators/teen-car/EvVsPetrolCalculator.tsx`** — interactive sliders (km/yr, L/100km, $/L, kWh/100km, home & public rates, fast-charge share) → annual petrol vs EV cost + savings.
4. **`mandy-topics.ts`**: `wealth-property` module replaced with `car-driving` (9 topics). Car Q&A (true cost of first car, PPSR) moved into car module; Module 6 `spending-saving` now covers phone contract trap + Medicare.
5. **New web links**: QLD licence fees/getting licence/PrepL/HPT/practical test/steps, BCC parking + council car parks, Green Vehicle Guide, EV Council, RACQ fuel, AIP fuel tables. `WebLink.source` union extended with `'Brisbane City Council' | 'Federal Government'`.
6. **Routes**: `/wealth-property` → `/car-driving`; legacy `house-affordability`, `property-research`, `wealth-property` redirect to `/car-driving`.

---

## v3.2.0 — INVESTING & SHARES ETF UPGRADE

### Summary
Upgraded Module 7 `/investing-shares`: replaced the noisy annual-returns-only explorer with a clearer "Growth of $10,000" total-return chart (view toggle vs annual returns), added a "Best 3 Starter ETF Portfolios" section with live-weighted MER/returns, and a "Next Big Things in ASX ETFs (2026)" trends section. Refreshed trailing returns to mid-2026 figures.

### Key Changes
1. **`src/data/asx-etf-data.ts`**:
   - New `buildGrowthSeries()` — compounds $10k through calendar-year total returns into a growth-of-$10k chart series.
   - New `computePortfolioStats()` — weighted-average MER, 1Y/3Y/5Y trailing, yield, FUM for any allocation set.
   - New `BEST_3_ETF_PORTFOLIOS` — Balanced Starter (VAS 40/VGS 30/A200 30), Global Growth (VAS 30/VGS 40/IVV 30), Yield + Quality (A200 40/DACE 25/QUAL 20/MGOC 15).
   - New `NEXT_BIG_ASX_ETF_TRENDS` — 6 forward-looking 2026 themes: global/offshore, AI & robotics (RBTZ/HMND/VTEK), commodities & energy transition (CPPR/VOLT/URNM/ACDC), bitcoin (IBTC), private equity (PEET), cheaper S&P 500 (V500).
   - Trailing returns refreshed to mid-2026 (e.g. IVV 1Y 8.57%, NDQ 1Y 9.91%, VGS 1Y 15.31%) per ReviewETF/PortfoliosLab/issuer data.
2. **New `src/calculators/teen-investing/ETFPortfolioPicker.tsx`** — 3 model portfolio cards with risk badges, allocation chips, weighted 1Y/3Y/5Y/MER/yield stats computed live from the data, education-only footer.
3. **New `src/calculators/teen-investing/NextBigEtfs.tsx`** — 6 gradient trend cards with example tickers, "why" and amber "caution" callouts.
4. **`ASXETFExplorer.tsx`** — headline chart now defaults to **Growth of $10,000** (total return, distributions reinvested) with a custom dollar tooltip and domain auto-scaling; added "Growth / Annual Returns" view toggle; trailing returns now show +/− formatting to 1dp.
5. **New tests** `src/data/asx-etf-data.test.ts` — growth-series compounding, missing-year skipping, weighted MER/1Y/5Y math, all-portfolios-weighting. 8 test files / 81 tests green.

---

## v3.0.0 — END-TO-END 10-MODULE TEEN FINANCIAL SUPER-PLATFORM

### Summary
Complete end-to-end content and interactive tool upgrade across all 10 modules, integrating insights from **The Mandy Money Book**, **The Barefoot Investor** (Scott Pape), and **Broke Millennial** (Erin Lowry).

### Key Additions
1. **Interactive Mindset Quiz**:
   - `MoneyMindsetQuiz.tsx` on Module 1 (`/money-and-you`) mapping users to Barefoot Builder, Broke Millennial Strategist, or Mandy Money Planner archetypes.
2. **Upgraded Calculators & Tools Across All 10 Modules**:
   - `FirstPaycheckSplitter.tsx` (Module 5): 3-Way System Comparison (Barefoot 3-Bucket vs 50/30/20 vs 4-Bucket).
   - `FirstCarCostCalculator.tsx` (Module 6): Barefoot Cash vs 3-Year Dealer Loan Trap comparison.
   - `TeenSuperCalculator.tsx` (Module 3): Low balance 3% fee cap (<$6,000) & stapling simulator.
   - `TeenTaxCalculator.tsx` (Module 4): Work Expense Deductions (uniforms, RSA/RCG) & Division 6AA minor unearned income tax rates ($416 threshold).
   - `TeenCompoundGrowthCalc.tsx` (Module 7): ASX 200 Index ETF Micro-Investing vs Cash Savings simulator.
   - `TeenSavingsAccountFinder.tsx` (Module 8): Bonus Interest Conditions Simulator.
   - `BNPLDebtTrapVisualizer.tsx` (Module 9): Debt Snowball vs Avalanche payoff engine.
   - `MovingOutCostEstimator.tsx` (Module 10): 4-week rental bond math & ABN Side Hustle GST threshold estimator ($75k).

---

## v2.1.0 — TEEN PERSONA & MANDY MONEY OVERHAUL

### Summary
Complete content & calculator pivot targeting **16-year-olds & first-job teens in Australia**. Modeled directly on **The Mandy Money Book: Your Real World Money Guide** (10 modules, 160+ Q&A topics).

### Key Additions
1. **10 Real-World Mandy Money Modules**:
   - `Money & You 🤠` (/money-and-you) — Mindset, mental health, myGov/myID, consumer rights, scam protection
   - `Careers & Employment 🎓` (/careers-employment) — First job, junior award rates, resumes, contracts, payslips
   - `Super & Retirement ⭐️` (/super-retirement) — 12% Super Guarantee, >30h/wk under 18 rule, stapling
   - `Tax & Tax Returns 💰` (/tax-guide) — $18,200 Tax-Free Threshold, Stage 3 tax brackets, myTax returns
   - `Budgeting & Paychecks 🌈` (/teen-budgeting) — 50/30/20 teen rule, 4-bucket system, pay yourself first
   - `Spending, Saving & Real World 🌎` (/spending-saving) — SMART goals, true cost of first car, PPSR, phone plans, Medicare
   - `Investing & Shares ⚡️` (/investing-shares) — ASX, ETFs, minor accounts, crypto risk warning, compound growth
   - `Interest & Financial Products 🧬` (/interest-products) — 5%+ teen savings accounts, compound interest, zero fees
   - `Dealing with Debt 💥` (/dealing-with-debt) — BNPL traps (Afterpay/Zip), credit scores, payday loan warnings
   - `Wealth & Property 🌱` (/wealth-property) — Moving out costs, 4-week rental bond rules, bill splitting, side hustles

2. **Interactive Teen Tools**:
   - `PayslipAnalyzer.tsx` — Gross pay, PAYG tax withheld, net bank pay, 12% super eligibility
   - `TeenTaxCalculator.tsx` — Annual income vs $18,200 threshold, tax refund estimator
   - `TeenSuperCalculator.tsx` — 40+ year compound super growth from a first job
   - `FirstPaycheckSplitter.tsx` — 50/30/20 & 4-bucket paycheck splitter
   - `FirstCarCostCalculator.tsx` — Upfront purchase + true annual running costs (rego, CTP green slip, insurance, fuel)
   - `TeenSavingsAccountFinder.tsx` — Comparison of top AU teen savings accounts & bonus interest conditions
   - `TeenCompoundGrowthCalc.tsx` — Weekly micro-investing compound growth simulator
   - `BNPLDebtTrapVisualizer.tsx` — Late fee accumulator & credit score impact simulator
   - `MovingOutCostEstimator.tsx` — Upfront rental bond (4 weeks) + advance rent + utility/furniture startup cash
   - `TeenProfile.tsx` — Personalized 16yo profile configuration (hourly wage, hours/wk, savings goals)

3. **Official Australian Web References**:
   - Verified links embedded across all topic guides pointing to ATO, Fair Work Ombudsman, Moneysmart.gov.au, Services Australia, and PPSR.gov.au.

---

## v2.0.0 — 2027 FRONTEND OVERHAUL

### Summary
Complete frontend modernisation across 75 source files (40 modified, 13 new). Zero engine logic changes. All 73 tests passing.

### Phase 1: Foundation
- Dependencies upgraded: React 19.2.8, Recharts 3.10.1, Tailwind 4.3.3, Vite 7.3.1, Vitest 4.1.10
- New deps: motion 12.43.0, lucide-react 1.28.0, clsx 2.1.1, tailwind-merge 3.6.0, class-variance-authority 0.7.1, sonner 2.0.7, cmdk 1.0.0
- TypeScript target ES2024, path aliases (@/), shadcn CLI config

### Phase 2: Design System
- OKLCH color palette with light/dark mode CSS custom properties
- Google Fonts: Inter (body) + JetBrains Mono (numbers)
- All 40+ .tsx files migrated from hardcoded Tailwind slate to CSS variables
- Glassmorphism, mesh gradient, shimmer animation utilities

### Phase 3: shadcn Charts
- All 8 calculator charts migrated to ChartContainer + ChartConfig system
- ChartTooltipContent + ChartLegendContent with theme-aware styling
- SVG gradient fills on Area charts, rounded bars, bold lines
- Chart animations: 1200ms ease-in-out entry

### Phase 4: Animation (Motion 12+)
- motion/react integrated into 9 calculator/layout files
- fadeInUp, scaleIn, staggerContainer, pageTransition variants
- Animated results panels across all calculators
- Mobile nav drawer spring animation

### Phase 5: Performance
- React.memo on pure display components (Disclaimer, Assumptions, AboutCalc, PortfolioField)
- useDeferredValue on expensive chart data
- Speculation Rules for route prefetching
- content-visibility: auto on calculator sections
- Google Fonts preloaded with fetchpriority="high"

### Phase 6: Modern CSS
- Container Queries, @starting-style, scroll-driven animations
- View Transitions API for route changes
- CSS color-mix(), :has(), native nesting
- @property registrations for animatable gradients
- prefers-reduced-motion comprehensive fallback

### Phase 7: Premium UI Components
- NEW: Card (3 variants), Badge (5 variants), Skeleton, Progress, Separator, AnimatedNumber, CommandPalette (Cmd+K), Toaster
- REBUILT: StatCard (gradient border, animated value), NumberInput (premium styling), SliderControl (glow thumb), Tabs (pill-style), Navbar (frosted glass, lucide icons), Footer, Landing (hero + mesh gradient), Portfolio (progress tracker)

### Phase 8: Polish
- ErrorBoundary component with graceful fallback UI
- SEO: title tags, meta descriptions, Open Graph, JSON-LD structured data
- Accessibility: focus-visible, scrollbar styling, reduced-motion
- TypeScript strict: 0 errors, 73 tests passing, production build 2.85s

### Key Technical Notes
- shadcn chart.tsx: uses explicit prop types for Recharts v3 compatibility (not RechartsPrimitive.Tooltip intersection)
- Design token migration removes all dark: variant classes — CSS variables handle theme switching
- Motion imported from "motion/react" (not "framer-motion")
- cn() utility at src/lib/utils.ts (clsx + tailwind-merge)

---

## PROJECT COMPLETE — v1.2.0

All 12 phases delivered + v1.1.0 and v1.2.0 UX polish. 9 views (Portfolio + 8 calculators) live.

### v1.1.0 Changes (post-v1.0)

- **Dark mode**: Added `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css` — Tailwind v4 requires this for class-based dark mode (the `dark:` prefix was silently no-oping without it)
- **Branding**: "AusFinTools" → "Australian Personal Finance Tools" everywhere (Navbar, Footer, Landing, README, CONTRIBUTING, package.json, index.html)
- **Neutral defaults**: All 8 calculators updated with round-number, non-personal defaults (e.g., income $85k, rate 6%, margTax 34.5%)
- **AboutCalc component**: New `src/components/shared/AboutCalc.tsx` — collapsible "About this calculator" accordion with plain-English definitions and reputable source links (Wikipedia, ATO, MoneySmart). Added to all 8 calculators.
- **Output explanations**: Plain-text explainer divs added above key data panels in all calculators (OffsetVsDR, DirectVsDR, HouseAffordability, InvestmentCompare, SavingsRate) — each with a free/public source link (MoneySmart, ATO, Wikipedia)
- **IO/PI toggle (Offset vs DR)**: `runDebtRecycling` engine now accepts optional `investLoanType: 'io' | 'pi'`, with PI amortisation logic. OffsetVsDR.tsx adds toggle buttons + 2-line plain-English explanation. Separate `useState` used (not useUrlParams) since it's a union type.
- **Direct vs DR framing fix**: AboutCalc explains why DR shows lower net wealth early (IO loan stays on books — net wealth = portfolio minus loan). Breakeven callout + result explanations added.
- **SuperBridge**: Added editable "Current Super Balance" NumberInput (previously hardcoded, was non-interactive)

### What was built

**Data layer (src/data/)**
- tax-brackets.ts: 2024-25 Stage 3 cuts, calcIncomeTax, calcMedicareLevy, getMarginalRate
- super-rules.ts: SG 12%, $30k concessional cap, Division 293, carry-forward rules
- stamp-duty-tables.ts: VIC + NSW full, QLD + WA stubs, calculateStampDuty()
- constants.ts: HELP thresholds, CGT discounts, LMI estimates, APRA buffer

**Utils (src/utils/)**
- formatters.ts: formatCompact, formatCurrency, formatPercent, formatDiff
- financial.ts: monthlyRepayment, futureValue, futureValueAnnuity, yearsToTarget, projectGrowth, estimateLMI, maxBorrowingCapacity

**Shared UI (src/components/)**
- ui/: SliderControl, NumberInput, StatCard, Tabs, Toggle, BarCompare
- layout/: Navbar (mobile hamburger), Footer, Layout (Outlet wrapper)
- shared/: Disclaimer, Assumptions (collapsible)

**Hooks (src/hooks/)**
- useTheme: dark/light toggle, URL param persist, dark class on html
- useUrlParams: generic calculator state sync to URL

**Calculators (src/calculators/) — 73 tests passing**
- offset-vs-dr: runOffset, runDebtRecycling, year-by-year comparison
- direct-vs-dr: runDirectInvest, findBreakevenReturn, leverage comparison
- tax-savings: super sacrifice (Div293), negative gearing, DR tax benefit, bracket visualiser
- house-affordability: APRA borrowing capacity, state stamp duty, LMI, stress test
- fire: Classic/Coast/Barista/LeanFat FIRE + SuperBridge (AU-specific dual-phase)
- investment-compare: up to 4 scenarios, marginal/super/tax-free tax treatment
- savings-rate: rate vs years-to-FIRE chart
- property-research: 130-point checklist, dealbreakers, live score panel

**Deploy**
- .github/workflows/deploy.yml: GitHub Actions → GitHub Pages (VITE_BASE=/PersonalFinanceToolkit/)
- vite.config.ts: VITE_BASE env var for base path (defaults to / for Vercel)

---

## Key Technical Notes (if resuming)

- React Router v7: createBrowserRouter + RouterProvider in App.tsx
- Tailwind v4: @tailwindcss/vite plugin, no config file, @import "tailwindcss" in CSS
- Tailwind v4 dark mode: requires `@custom-variant dark (&:where(.dark, .dark *));` in index.css — without it, `dark:` classes are silently ignored even when the `dark` class is on `<html>`
- TypeScript strict: no any, all engine functions fully typed
- Recharts Tooltip formatter: value is ValueType | undefined, always guard
- URL params: useUrlParams<T>(defaults) for all calculator state — no localStorage
- GitHub Pages base: set via VITE_BASE env var in deploy workflow
- Git email: ravisha22@users.noreply.github.com (set in repo-level git config)

---

## Deferred (post-v1.0)

- Stamp duty full tables: QLD, WA, SA, TAS, ACT, NT (stubs in place)
- Franking credits on ETF dividends (not modelled — noted in Assumptions)
- Inflation-adjusted projections
- Variable rate scenarios
- FIRE: sequence-of-returns risk modelling

---

## v1.2.0 — COMPLETE

### Fixes

**Fix 1 — Gear icon for settings (Offset vs Debt Recycling)**
- Heroicons cog SVG + "Settings"/"Close" text in top-right of card header. Replaces external toggle button. Settings panel expands inline.

**Fix 2 — Light mode contrast (elegant, not jarring)**
- Page bg: `bg-slate-50` → `bg-slate-100`; card borders: `→ border-slate-300`; label text: `text-slate-400` → `text-slate-500`; stat cards add `shadow-sm`

**Fix 3 — Portfolio view (new first view)**
- `src/pages/Portfolio.tsx` + `src/context/PortfolioContext.tsx` (session-only React Context, no localStorage)
- Sections: Income & Tax, Cash & Savings, Mortgage, Investments, Superannuation, Expenses (17 itemised categories)
- Footer CTA: "→ Continue to Tax Savings"
- All 7 downstream calculators consume context as optional initial defaults (fall back to built-in defaults when portfolio is 0)
- Wired: TaxSavingsGuide (salary + margTax + mortgageBalance + mortgageRate), FIREDashboard (savingsBalance+etfValue, monthlySavingsContrib×12, superBalance), SavingsRate (grossSalary, savingsBalance+etfValue), HouseAffordability (grossSalary, savingsBalance, propertyValue, mortgageRate, mortgageYearsRemaining), InvestmentCompare (3 scenarios pre-filled from etfValue/superBalance/savingsBalance + monthlys), OffsetVsDR (mortgageBalance, mortgageRate, mortgageYearsRemaining, etfReturn, margTax), DirectVsDR (etfValue, etfReturn, mortgageRate, margTax)

**Fix 4 — Investment Comparison: lock default scenarios**
- Remove button hidden for default 3 scenarios; only user-added 4th can be removed (`i >= DEFAULT_SCENARIOS.length`)

**Fix 5 — Navigation reorder + route renames**
- `/offset-vs-dr` → `/offset-vs-debt-recycling`; `/direct-vs-dr` → `/direct-vs-debt-recycling`; old routes get `<Navigate replace />`
- Nav order: Portfolio → Tax Savings → Savings Rate → FIRE → Investment Comparison → House Affordability → Property Research → Offset vs Debt Recycling → Direct vs Debt Recycling

**Fix 6 — Remove "DR" abbreviation everywhere**
- All user-facing text uses "Debt Recycling" in full (OffsetVsDR.tsx and DirectVsDR.tsx updated; internal file names unchanged)

### Also added
- `docs/PersonaFlowAnalysis.md` — market research document with real ATO/APRA/ABS/BetaShares data, 7 persona definitions, tool relevance matrix, recommended nav order rationale


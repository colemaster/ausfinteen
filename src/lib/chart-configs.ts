import type { ChartConfig } from "@/components/ui/chart";

/** Offset vs Debt Recycling chart colors */
export const offsetVsDRConfig = {
  offset: { label: "Offset Strategy", color: "var(--chart-1)" },
  debtRecycling: { label: "Debt Recycling", color: "var(--chart-2)" },
  difference: { label: "Difference", color: "var(--chart-4)" },
} satisfies ChartConfig;

/** Direct Investing vs Debt Recycling chart colors */
export const directVsDRConfig = {
  direct: { label: "Direct Investing", color: "var(--chart-1)" },
  debtRecycling: { label: "Debt Recycling", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Classic FIRE trajectory chart colors */
export const fireTrajectoryConfig = {
  portfolio: { label: "Portfolio Value", color: "var(--chart-2)" },
  target: { label: "FIRE Target", color: "var(--chart-5)" },
} satisfies ChartConfig;

/** Super Bridge chart colors */
export const superBridgeConfig = {
  bridgeCapital: { label: "Bridge Capital", color: "var(--chart-1)" },
  superBalance: { label: "Super Balance", color: "var(--chart-6)" },
} satisfies ChartConfig;

/** Investment Comparison — dynamic config builder */
export function buildInvestmentCompareConfig(
  scenarios: { name: string }[]
): ChartConfig {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
  const config: ChartConfig = {};
  scenarios.forEach((s, i) => {
    config[`scenario${i}`] = { label: s.name, color: colors[i % colors.length] };
  });
  return config;
}

/** Savings Rate chart colors */
export const savingsRateConfig = {
  yearsToFI: { label: "Years to FI", color: "var(--chart-6)" },
} satisfies ChartConfig;

/** Tax Bracket Visualizer chart colors */
export const taxBracketConfig = {
  marginalRate: { label: "Marginal Rate", color: "var(--chart-1)" },
  effectiveRate: { label: "Effective Rate", color: "var(--chart-2)" },
  taxPayable: { label: "Tax Payable", color: "var(--chart-3)" },
} satisfies ChartConfig;

/** Portfolio asset allocation donut chart colors */
export const portfolioAllocationConfig = {
  cash: { label: "Cash & Savings", color: "var(--chart-1)" },
  investments: { label: "Investments", color: "var(--chart-2)" },
  super: { label: "Superannuation", color: "var(--chart-4)" },
  property: { label: "Property Equity", color: "var(--chart-3)" },
} satisfies ChartConfig;

/** ASX ETF top-10 annual returns chart colors (indexed by position) */
export const asxTopEtfConfig = {
  vas: { label: "VAS", color: "var(--chart-1)" },
  vgs: { label: "VGS", color: "var(--chart-2)" },
  ivv: { label: "IVV", color: "var(--chart-3)" },
  a200: { label: "A200", color: "var(--chart-4)" },
  qual: { label: "QUAL", color: "var(--chart-5)" },
  ioz: { label: "IOZ", color: "var(--chart-6)" },
  ndq: { label: "NDQ", color: "var(--chart-7)" },
  dace: { label: "DACE", color: "var(--chart-1)" },
  v1ac: { label: "V1AC", color: "var(--chart-2)" },
  vts: { label: "VTS", color: "var(--chart-3)" },
} satisfies ChartConfig;

/** ASX ETF dividend yield comparison chart colors */
export const asxEtfYieldConfig = {
  dividendYield: { label: "Dist. Yield", color: "var(--chart-6)" },
} satisfies ChartConfig;

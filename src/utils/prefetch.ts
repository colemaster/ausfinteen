/**
 * Intelligent Route & Module Prefetching Utility
 * Preloads page chunk JS modules on hover/focus for 0ms perceived navigation latency.
 */

const prefetchedRoutes = new Set<string>();

const ROUTE_IMPORTS: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/Landing'),
  '/profile': () => import('../pages/TeenProfile'),
  '/money-and-you': () => import('../pages/MoneyAndYou'),
  '/careers-employment': () => import('../pages/CareersEmployment'),
  '/super-retirement': () => import('../pages/SuperRetirement'),
  '/tax-guide': () => import('../pages/TaxGuide'),
  '/teen-budgeting': () => import('../pages/TeenBudgeting'),
  '/spending-saving': () => import('../pages/SpendingSavingRealWorld'),
  '/investing-shares': () => import('../pages/InvestingShares'),
  '/interest-products': () => import('../pages/InterestFinancialProducts'),
  '/dealing-with-debt': () => import('../pages/DealingWithDebt'),
  '/car-driving': () => import('../pages/CarDriving'),
  '/brisbane-qld': () => import('../pages/BrisbaneQLD'),
};

export function prefetchRoute(path: string): void {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (prefetchedRoutes.has(cleanPath)) return;

  const importer = ROUTE_IMPORTS[cleanPath];
  if (importer) {
    prefetchedRoutes.add(cleanPath);
    // Request idle callback or microtask to load non-blockingly
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importer());
    } else {
      setTimeout(() => importer(), 50);
    }
  }
}

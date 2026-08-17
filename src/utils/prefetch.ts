/**
 * Intelligent Route & Module Prefetching Utility
 * Preloads page chunk JS modules on hover/focus for 0ms perceived navigation latency.
 */

const prefetchedRoutes = new Set<string>();

const ROUTE_IMPORTS: Record<string, () => Promise<unknown>> = {
  '/': () => import('../views/Landing'),
  '/profile': () => import('../views/TeenProfile'),
  '/money-and-you': () => import('../views/MoneyAndYou'),
  '/careers-employment': () => import('../views/CareersEmployment'),
  '/super-retirement': () => import('../views/SuperRetirement'),
  '/tax-guide': () => import('../views/TaxGuide'),
  '/teen-budgeting': () => import('../views/TeenBudgeting'),
  '/spending-saving': () => import('../views/SpendingSavingRealWorld'),
  '/investing-shares': () => import('../views/InvestingShares'),
  '/interest-products': () => import('../views/InterestFinancialProducts'),
  '/dealing-with-debt': () => import('../views/DealingWithDebt'),
  '/car-driving': () => import('../views/CarDriving'),
  '/brisbane-qld': () => import('../views/BrisbaneQLD'),
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

import { createBrowserRouter, RouterProvider, Navigate, type To, type RouterNavigateOptions } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { TeenProfileProvider } from './context/TeenProfileContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded Modules & Calculators
import { lazy, Suspense, type ReactNode } from 'react';

const Landing                   = lazy(() => import('./views/Landing').then(m => ({ default: m.Landing })));
const TeenProfile               = lazy(() => import('./views/TeenProfile').then(m => ({ default: m.TeenProfile })));
const CalculatorsHub            = lazy(() => import('./views/CalculatorsHub').then(m => ({ default: m.CalculatorsHub })));
const HECSPayoff                = lazy(() => import('./views/HECSPayoff').then(m => ({ default: m.HECSPayoff })));
const SuperDrawdown             = lazy(() => import('./views/SuperDrawdown').then(m => ({ default: m.SuperDrawdown })));
const EVNovatedLease            = lazy(() => import('./views/EVNovatedLease').then(m => ({ default: m.EVNovatedLease })));
const CGTEngine                 = lazy(() => import('./views/CGTEngine').then(m => ({ default: m.CGTEngine })));
const FinancialStressTest       = lazy(() => import('./views/FinancialStressTest').then(m => ({ default: m.FinancialStressTest })));

const MoneyAndYou               = lazy(() => import('./views/MoneyAndYou').then(m => ({ default: m.MoneyAndYou })));
const CareersEmployment         = lazy(() => import('./views/CareersEmployment').then(m => ({ default: m.CareersEmployment })));
const SuperRetirement           = lazy(() => import('./views/SuperRetirement').then(m => ({ default: m.SuperRetirement })));
const TaxGuide                  = lazy(() => import('./views/TaxGuide').then(m => ({ default: m.TaxGuide })));
const TeenBudgeting             = lazy(() => import('./views/TeenBudgeting').then(m => ({ default: m.TeenBudgeting })));
const SpendingSavingRealWorld   = lazy(() => import('./views/SpendingSavingRealWorld').then(m => ({ default: m.SpendingSavingRealWorld })));
const InvestingShares           = lazy(() => import('./views/InvestingShares').then(m => ({ default: m.InvestingShares })));
const InterestFinancialProducts = lazy(() => import('./views/InterestFinancialProducts').then(m => ({ default: m.InterestFinancialProducts })));
const DealingWithDebt           = lazy(() => import('./views/DealingWithDebt').then(m => ({ default: m.DealingWithDebt })));
const CarDriving                 = lazy(() => import('./views/CarDriving').then(m => ({ default: m.CarDriving })));
const BrisbaneQLD               = lazy(() => import('./views/BrisbaneQLD').then(m => ({ default: m.BrisbaneQLD })));
const NotFound                  = lazy(() => import('./views/NotFound').then(m => ({ default: m.NotFound })));

import { Toaster } from '@/components/ui/Toaster';

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="text-muted-foreground font-medium animate-pulse">Loading AusFinance Suite...</div>
    </div>
  );
}

function Wrap({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Wrap><Landing /></Wrap> },
      { path: 'profile',               element: <Wrap><TeenProfile /></Wrap> },
      { path: 'calculators',           element: <Wrap><CalculatorsHub /></Wrap> },
      { path: 'hecs-payoff',           element: <Wrap><HECSPayoff /></Wrap> },
      { path: 'super-drawdown',        element: <Wrap><SuperDrawdown /></Wrap> },
      { path: 'ev-novated-lease',       element: <Wrap><EVNovatedLease /></Wrap> },
      { path: 'cgt-engine',            element: <Wrap><CGTEngine /></Wrap> },
      { path: 'financial-stress-test', element: <Wrap><FinancialStressTest /></Wrap> },

      // Real-World Modules
      { path: 'money-and-you',         element: <Wrap><MoneyAndYou /></Wrap> },
      { path: 'careers-employment',    element: <Wrap><CareersEmployment /></Wrap> },
      { path: 'super-retirement',      element: <Wrap><SuperRetirement /></Wrap> },
      { path: 'tax-guide',             element: <Wrap><TaxGuide /></Wrap> },
      { path: 'teen-budgeting',        element: <Wrap><TeenBudgeting /></Wrap> },
      { path: 'spending-saving',       element: <Wrap><SpendingSavingRealWorld /></Wrap> },
      { path: 'investing-shares',      element: <Wrap><InvestingShares /></Wrap> },
      { path: 'interest-products',     element: <Wrap><InterestFinancialProducts /></Wrap> },
      { path: 'dealing-with-debt',     element: <Wrap><DealingWithDebt /></Wrap> },
      { path: 'car-driving',           element: <Wrap><CarDriving /></Wrap> },
      { path: 'brisbane-qld',          element: <Wrap><BrisbaneQLD /></Wrap> },

      // Legacy Route Redirects
      { path: 'portfolio',                  element: <Navigate to="/profile" replace /> },
      { path: 'offset-vs-debt-recycling',   element: <Navigate to="/careers-employment" replace /> },
      { path: 'direct-vs-debt-recycling',   element: <Navigate to="/investing-shares" replace /> },
      { path: 'tax-savings',                element: <Navigate to="/tax-guide" replace /> },
      { path: 'house-affordability',        element: <Navigate to="/car-driving" replace /> },
      { path: 'fire',                       element: <Navigate to="/super-drawdown" replace /> },
      { path: 'investment-compare',         element: <Navigate to="/investing-shares" replace /> },
      { path: 'savings-rate',               element: <Navigate to="/teen-budgeting" replace /> },
      { path: 'property-research',          element: <Navigate to="/car-driving" replace /> },
      { path: 'wealth-property',            element: <Navigate to="/car-driving" replace /> },
      { path: '*',                          element: <Wrap><NotFound /></Wrap> },
    ],
  },
]);

// Patch router.navigate for View Transitions
const originalNavigate = router.navigate;
const viewTransitionNavigate = async (
  to: To | number | null,
  opts?: RouterNavigateOptions,
): Promise<void> => {
  const navigate = () => {
    if (typeof to === 'number') return originalNavigate(to);
    return originalNavigate(to, opts);
  };

  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    try {
      const transition = (document as unknown as { startViewTransition: (fn: () => void) => ViewTransition }).startViewTransition(navigate);
      if (transition && transition.finished) {
        transition.finished.catch(() => {});
        try {
          await transition.finished;
        } catch {
          // Swallow rejection
        }
      }
      return;
    } catch {
      // Fall back to direct navigation if transition creation fails
      navigate();
      return;
    }
  }

  navigate();
};

try {
  router.navigate = viewTransitionNavigate;
} catch {
  // Leave router.navigate untouched if the patch fails.
}

export default function App() {
  return (
    <TeenProfileProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TeenProfileProvider>
  );
}

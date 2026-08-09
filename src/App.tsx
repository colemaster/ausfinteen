import { createBrowserRouter, RouterProvider, Navigate, type To, type RouterNavigateOptions } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { TeenProfileProvider } from './context/TeenProfileContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded Teen Modules & Pages
import { lazy, Suspense, type ReactNode } from 'react';

const Landing                   = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const TeenProfile               = lazy(() => import('./pages/TeenProfile').then(m => ({ default: m.TeenProfile })));
const MoneyAndYou               = lazy(() => import('./pages/MoneyAndYou').then(m => ({ default: m.MoneyAndYou })));
const CareersEmployment         = lazy(() => import('./pages/CareersEmployment').then(m => ({ default: m.CareersEmployment })));
const SuperRetirement           = lazy(() => import('./pages/SuperRetirement').then(m => ({ default: m.SuperRetirement })));
const TaxGuide                  = lazy(() => import('./pages/TaxGuide').then(m => ({ default: m.TaxGuide })));
const TeenBudgeting             = lazy(() => import('./pages/TeenBudgeting').then(m => ({ default: m.TeenBudgeting })));
const SpendingSavingRealWorld   = lazy(() => import('./pages/SpendingSavingRealWorld').then(m => ({ default: m.SpendingSavingRealWorld })));
const InvestingShares           = lazy(() => import('./pages/InvestingShares').then(m => ({ default: m.InvestingShares })));
const InterestFinancialProducts = lazy(() => import('./pages/InterestFinancialProducts').then(m => ({ default: m.InterestFinancialProducts })));
const DealingWithDebt           = lazy(() => import('./pages/DealingWithDebt').then(m => ({ default: m.DealingWithDebt })));
const CarDriving                 = lazy(() => import('./pages/CarDriving').then(m => ({ default: m.CarDriving })));
const BrisbaneQLD               = lazy(() => import('./pages/BrisbaneQLD').then(m => ({ default: m.BrisbaneQLD })));
const NotFound                  = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

import { Toaster } from '@/components/ui/Toaster';

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="text-muted-foreground font-medium animate-pulse">Loading Teen Money Guide...</div>
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
      { path: 'profile',           element: <Wrap><TeenProfile /></Wrap> },
      { path: 'money-and-you',      element: <Wrap><MoneyAndYou /></Wrap> },
      { path: 'careers-employment', element: <Wrap><CareersEmployment /></Wrap> },
      { path: 'super-retirement',   element: <Wrap><SuperRetirement /></Wrap> },
      { path: 'tax-guide',          element: <Wrap><TaxGuide /></Wrap> },
      { path: 'teen-budgeting',     element: <Wrap><TeenBudgeting /></Wrap> },
      { path: 'spending-saving',    element: <Wrap><SpendingSavingRealWorld /></Wrap> },
      { path: 'investing-shares',   element: <Wrap><InvestingShares /></Wrap> },
      { path: 'interest-products',  element: <Wrap><InterestFinancialProducts /></Wrap> },
      { path: 'dealing-with-debt',  element: <Wrap><DealingWithDebt /></Wrap> },
      { path: 'car-driving',       element: <Wrap><CarDriving /></Wrap> },
      { path: 'brisbane-qld',       element: <Wrap><BrisbaneQLD /></Wrap> },
      // Legacy Route Redirects
      { path: 'portfolio',                  element: <Navigate to="/profile" replace /> },
      { path: 'offset-vs-debt-recycling',   element: <Navigate to="/careers-employment" replace /> },
      { path: 'direct-vs-debt-recycling',   element: <Navigate to="/investing-shares" replace /> },
      { path: 'tax-savings',                element: <Navigate to="/tax-guide" replace /> },
      { path: 'house-affordability',        element: <Navigate to="/car-driving" replace /> },
      { path: 'fire',                       element: <Navigate to="/super-retirement" replace /> },
      { path: 'investment-compare',         element: <Navigate to="/investing-shares" replace /> },
      { path: 'savings-rate',               element: <Navigate to="/teen-budgeting" replace /> },
      { path: 'property-research',          element: <Navigate to="/car-driving" replace /> },
      { path: 'wealth-property',            element: <Navigate to="/car-driving" replace /> },
      { path: '*',                          element: <Wrap><NotFound /></Wrap> },
    ],
  },
]);

// Patch router.navigate for View Transitions.
// Runs once at module scope (outside render), so it is React Compiler safe.
// Falls back to plain navigation when the View Transitions API is unavailable
// or fails, so navigation never hangs or throws.
const originalNavigate = router.navigate;
const viewTransitionNavigate = async (
  to: To | number | null,
  opts?: RouterNavigateOptions,
): Promise<void> => {
  const navigate = () => {
    if (typeof to === 'number') return originalNavigate(to);
    return originalNavigate(to, opts);
  };

  let transition: ViewTransition | undefined;
  if (document.startViewTransition) {
    try {
      transition = document.startViewTransition(navigate);
    } catch {
      transition = undefined;
    }
  }

  if (transition) {
    try {
      await transition.finished;
    } catch {
      // The transition callback rejected (navigation already ran or was
      // interrupted). Swallow so callers never hang on an unhandled rejection.
    }
  } else {
    navigate();
  }
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

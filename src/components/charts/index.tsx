/**
 * Deferred chart primitives.
 *
 * Recharts (plus its d3 lineage) is ~95-110 KB gzip — measured at 902 KB gzip
 * across the nine pages that render a chart, which is 17% of all JavaScript the
 * site ships. Charts are always below the fold of an interactive calculator, so
 * paying for that on first paint delays the controls the user actually came for.
 *
 * This module keeps the Recharts API but moves the library itself into an async
 * chunk. `ResponsiveContainer` is the single choke point every chart in this
 * codebase passes through (directly, or via `ChartContainer` in `ui/chart.tsx`),
 * so it doubles as the Suspense boundary and the viewport gate. That means no
 * call site has to change its JSX.
 *
 * Trade-off: charts are now client-rendered rather than pre-rendered into the
 * static HTML, so they require JavaScript. A size-stable skeleton reserves the
 * exact chart height first, so this costs no layout shift.
 */
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type { ResponsiveContainerProps } from 'recharts';

// A single dynamic import means every lazy component below resolves out of one
// shared chunk, and the promise is memoised so re-renders never re-request it.
type RechartsModule = typeof import('recharts');
let pending: Promise<RechartsModule> | null = null;
const loadRecharts = (): Promise<RechartsModule> => (pending ??= import('recharts'));

export const BarChart = lazy(() => loadRecharts().then((m) => ({ default: m.BarChart })));
export const Bar = lazy(() => loadRecharts().then((m) => ({ default: m.Bar })));
export const LineChart = lazy(() => loadRecharts().then((m) => ({ default: m.LineChart })));
export const Line = lazy(() => loadRecharts().then((m) => ({ default: m.Line })));
export const AreaChart = lazy(() => loadRecharts().then((m) => ({ default: m.AreaChart })));
export const Area = lazy(() => loadRecharts().then((m) => ({ default: m.Area })));
export const PieChart = lazy(() => loadRecharts().then((m) => ({ default: m.PieChart })));
export const Pie = lazy(() => loadRecharts().then((m) => ({ default: m.Pie })));
export const Cell = lazy(() => loadRecharts().then((m) => ({ default: m.Cell })));
export const XAxis = lazy(() => loadRecharts().then((m) => ({ default: m.XAxis })));
export const YAxis = lazy(() => loadRecharts().then((m) => ({ default: m.YAxis })));
export const CartesianGrid = lazy(() => loadRecharts().then((m) => ({ default: m.CartesianGrid })));
export const Tooltip = lazy(() => loadRecharts().then((m) => ({ default: m.Tooltip })));
export const Legend = lazy(() => loadRecharts().then((m) => ({ default: m.Legend })));
export const ReferenceLine = lazy(() => loadRecharts().then((m) => ({ default: m.ReferenceLine })));

const LazyResponsiveContainer = lazy(() =>
  loadRecharts().then((m) => ({ default: m.ResponsiveContainer })),
);

/** Distance ahead of the viewport at which the chart starts loading. */
const PRELOAD_MARGIN_PX = 200;

/**
 * Placeholder shown while the chart is off-screen or in flight. Uses the exact
 * height the chart will occupy so nothing reflows when it arrives.
 */
function ChartSkeleton({ height }: { height: ResponsiveContainerProps['height'] }) {
  return (
    <div
      aria-hidden="true"
      data-chart-skeleton=""
      className="h-full w-full animate-pulse rounded-lg bg-[var(--muted)]/25"
      style={typeof height === 'number' ? { height } : undefined}
    />
  );
}

/**
 * Recharts' `ResponsiveContainer`, plus the lazy boundary and viewport gate.
 *
 * Renders a height-stable skeleton until the chart approaches the viewport, then
 * suspends on the Recharts chunk. Matches Recharts' behaviour of inheriting its
 * parent's dimensions when no explicit width/height is supplied.
 */
export function ResponsiveContainer({
  children,
  height,
  ...props
}: ResponsiveContainerProps & { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers, some test environments):
    // load straight away rather than never showing the chart.
    if (typeof IntersectionObserver === 'undefined') {
      setWanted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setWanted(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${PRELOAD_MARGIN_PX}px 0px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="h-full w-full"
      style={typeof height === 'number' ? { height } : undefined}
    >
      {wanted ? (
        <Suspense fallback={<ChartSkeleton height={height} />}>
          <LazyResponsiveContainer height={height} {...props}>
            {children}
          </LazyResponsiveContainer>
        </Suspense>
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  );
}

export type {
  ResponsiveContainerProps,
  ComponentProps as RechartsComponentProps,
};

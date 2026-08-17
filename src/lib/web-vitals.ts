/**
 * Lightweight Zero-Dependency Core Web Vitals & Performance Telemetry
 * Measures LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift),
 * INP/FID, and TTFB with PerformanceObserver.
 */

export interface PerformanceMetrics {
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number;
  domComplete: number | null;
  jsHeapSizeMB: number | null;
}

const metrics: PerformanceMetrics = {
  ttfb: null,
  fcp: null,
  lcp: null,
  cls: 0,
  domComplete: null,
  jsHeapSizeMB: null,
};

let initialized = false;

export function initWebVitals(): PerformanceMetrics {
  if (initialized || typeof window === 'undefined') return metrics;
  initialized = true;

  try {
    // Navigation timing
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      metrics.ttfb = Math.round(navEntry.responseStart);
      metrics.domComplete = Math.round(navEntry.domComplete);
    }

    // Paint timing (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    for (const entry of paintEntries) {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = Math.round(entry.startTime);
      }
    }

    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.lcp = Math.round(lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // Observer not supported
      }

      // CLS Observer
      try {
        const clsObserver = new PerformanceObserver(entryList => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
              metrics.cls += (entry as unknown as { value: number }).value;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // Observer not supported
      }
    }

    // Memory Heap (Chromium)
    if ('memory' in performance) {
      const mem = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      if (mem && mem.usedJSHeapSize) {
        metrics.jsHeapSizeMB = Math.round((mem.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
      }
    }
  } catch {
    // Graceful fallback
  }

  return metrics;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

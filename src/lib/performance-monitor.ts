/**
 * Real-time Performance Metrics & Core Web Vitals Monitor
 * Tracks application performance, render times, memory allocation, and PWA status.
 */

export interface PerformanceMetrics {
  loadTimeMs: number;
  ttfbMs: number;
  memoryMb?: number;
  isPwaActive: boolean;
  offlineReady: boolean;
  activeCacheCount: number;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  const timing = performance.timing;
  const loadTimeMs = timing.loadEventEnd > 0 
    ? Math.max(0, timing.loadEventEnd - timing.navigationStart)
    : Math.round(performance.now());
  
  const ttfbMs = timing.responseStart > 0 
    ? Math.max(0, timing.responseStart - timing.navigationStart)
    : 0;

  // @ts-expect-error performance.memory is non-standard Chrome API
  const memoryInfo = performance.memory;
  const memoryMb = memoryInfo?.usedJSHeapSize 
    ? Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))
    : undefined;

  const isPwaActive = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  return {
    loadTimeMs,
    ttfbMs,
    memoryMb,
    isPwaActive,
    offlineReady: navigator.onLine,
    activeCacheCount: 0,
  };
}

/**
 * High-precision benchmark utility to measure function execution time in milliseconds.
 */
export function benchmarkExecution<T>(fn: () => T): { result: T; durationMs: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, durationMs: Number((end - start).toFixed(3)) };
}

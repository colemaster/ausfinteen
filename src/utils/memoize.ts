/**
 * High-performance LRU Memoization utility for client-side financial calculations.
 * Prevents redundant computations when parameters remain identical across re-renders.
 */
export function memoize<T extends (...args: any[]) => any>(fn: T, maxCacheSize = 200): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as T;
}

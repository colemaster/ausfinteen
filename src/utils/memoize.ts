/**
 * High-performance LRU Memoization utility for client-side financial calculations.
 * Prevents redundant computations when parameters remain identical across re-renders.
 */
function makeKey(args: any[]): string {
  const len = args.length;
  if (len === 1) {
    const a = args[0];
    if (typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean') return String(a);
  }
  for (let i = 0; i < len; i++) {
    const a = args[i];
    if (a !== null && typeof a === 'object') {
      return JSON.stringify(args);
    }
  }
  return args.join(';');
}

export function memoize<T extends (...args: any[]) => any>(fn: T, maxCacheSize = 200): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = makeKey(args);
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

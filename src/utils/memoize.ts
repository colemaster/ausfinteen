/**
 * High-performance LRU Memoization utility for client-side financial calculations.
 * Prevents redundant computations when parameters remain identical across re-renders.
 */
function makeKey(args: readonly unknown[]): string {
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

export function memoize<TArgs extends readonly unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  maxCacheSize = 200,
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>();

  return (...args: TArgs): TResult => {
    const key = makeKey(args);
    if (cache.has(key)) {
      return cache.get(key) as TResult;
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
  };
}

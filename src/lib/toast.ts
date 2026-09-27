/**
 * Lazily-loaded Sonner toast API.
 *
 * Sonner is ~9.3 KB gzip and was being pulled into the critical path of all 20
 * hydrated pages purely so that a `toast.success(...)` call *might* fire later.
 * A toast is by definition a user-initiated, post-interaction event, so there is
 * no reason to pay for it on first paint.
 *
 * The exported `toast` is a Proxy with the same call surface as Sonner's, so
 * call sites are unchanged; it forwards to the real library the first time it is
 * used. The dynamic import is memoised so repeated toasts reuse one request.
 */

type SonnerModule = typeof import('sonner');
type SonnerToast = SonnerModule['toast'];

let pending: Promise<SonnerModule> | null = null;

/** Load (once) and return the real Sonner module. */
export const loadSonner = (): Promise<SonnerModule> => (pending ??= import('sonner'));

export const toast: SonnerToast = new Proxy({} as SonnerToast, {
  get(_target, property) {
    // Preserve non-function members so feature-detecting callers still work.
    if (typeof property === 'symbol') return undefined;
    return (...args: unknown[]) => {
      void loadSonner()
        .then(async (sonner) => {
          // Sonner renders into a portal, so nothing is visible until its <Toaster/> is
          // mounted. That mount is what pulls in React, so it is deferred to the first
          // actual toast rather than paid for on every page load.
          const { ensureToastHostMounted } = await import('@/lib/overlay-loader');
          await ensureToastHostMounted();
          const member = sonner.toast[property as keyof typeof sonner.toast];
          if (typeof member === 'function') {
            (member as (...a: unknown[]) => unknown).apply(sonner.toast, args);
          }
        })
        .catch(() => {
          // A failed toast must never surface as an unhandled rejection to the user.
        });
    };
  },
});

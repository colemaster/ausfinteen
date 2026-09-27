/**
 * Framework-free motion preference.
 *
 * Motion has to be resolved from two independent inputs: the OS
 * `prefers-reduced-motion` setting, and the in-app tri-state override. Neither
 * covers the other — a user who explicitly picks "full motion" while the OS says
 * "reduce" should get what they asked for, and a user who picks "reduce" while the
 * OS says "full motion" should not have to fight their own operating system.
 *
 * The resolved answer is written to a single attribute, `data-motion`, on `<html>`.
 * `src/index.css` keys every animation and the `--motion-*` duration tokens off
 * that one attribute, so there is exactly one source of truth and no component has
 * to consult the media query itself.
 *
 * This is deliberately free of React so the static Astro components (Navbar,
 * GlobalKeyboardShortcuts) and the React islands can all share it.
 */

export type MotionPreference = 'system' | 'full' | 'reduce';

const KEY = 'aus_motion';
const QUERY = '(prefers-reduced-motion: reduce)';

function isPreference(value: unknown): value is MotionPreference {
  return value === 'system' || value === 'full' || value === 'reduce';
}

export function readStoredPreference(): MotionPreference {
  if (typeof localStorage === 'undefined') return 'system';
  try {
    const raw = localStorage.getItem(KEY);
    return isPreference(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function systemPrefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

/** Resolve the stored override against the OS setting. */
export function resolveReducedMotion(preference: MotionPreference): boolean {
  if (preference === 'reduce') return true;
  if (preference === 'full') return false;
  return systemPrefersReduced();
}

/**
 * Write the resolved preference onto `<html>`.
 *
 * `data-motion` records the *choice* (system | full | reduce) so the UI can show
 * which option is active; `data-motion-reduce` records the *resolved* answer so
 * CSS can branch on it without duplicating the media query.
 */
export function applyMotionPreference(preference: MotionPreference): boolean {
  if (typeof document === 'undefined') return false;
  const reduced = resolveReducedMotion(preference);
  const root = document.documentElement;
  root.dataset.motion = preference;
  if (reduced) root.dataset.motionReduce = '';
  else delete root.dataset.motionReduce;
  return reduced;
}

export function setMotionPreference(preference: MotionPreference): boolean {
  if (typeof localStorage !== 'undefined') {
    try {
      if (preference === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, preference);
    } catch {
      // Private-mode / storage-denied: the choice simply will not persist.
    }
  }
  return applyMotionPreference(preference);
}

/**
 * Apply the stored preference and keep it in sync.
 *
 * Returns a teardown function. Safe to call more than once — the media-query and
 * storage listeners are bound exactly once per page, because Astro's ClientRouter
 * re-runs component scripts on every navigation.
 */
export function initMotionPreference(): () => void {
  const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : null;

  const sync = () => applyMotionPreference(readStoredPreference());

  sync();

  media?.addEventListener('change', sync);
  // Another tab changing the setting should be reflected here.
  window.addEventListener('storage', sync);
  // Re-apply after a ClientRouter navigation swaps the document.
  document.addEventListener('astro:page-load', sync);

  return () => {
    media?.removeEventListener('change', sync);
    window.removeEventListener('storage', sync);
    document.removeEventListener('astro:page-load', sync);
  };
}

/**
 * Screen WakeLock API Controller
 * Keeps the screen awake during active financial calculations and modeling sessions.
 */
import { useEffect, useState } from 'react';

let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || !navigator.wakeLock) {
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
    } catch {
      // Ignore error
    } finally {
      wakeLock = null;
    }
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released;
}

/**
 * Whether the `?wakelock=1` URL param is present — the opt-in switch for
 * the wake-lock user option (URL param only, NO localStorage).
 */
export function isWakeLockEnabledByUrl(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('wakelock') === '1';
  } catch {
    return false;
  }
}

export interface WakeLockState {
  /** True while the wake lock is held. */
  active: boolean;
  /** True if the browser exposes the Screen Wake Lock API at all. */
  supported: boolean;
}

/**
 * useWakeLock(enabled)
 * Keeps the screen awake while `enabled` is true AND the `?wakelock=1`
 * URL param is present. Re-acquires the lock when the tab becomes visible
 * again (browsers auto-release wake locks when a page is hidden).
 *
 * Usage:
 *   const { active, supported } = useWakeLock(running);
 *   // optional: <span>{supported && active ? 'Screen stays on' : ''}</span>
 */
export function useWakeLock(enabled: boolean): WakeLockState {
  const [active, setActive] = useState(false);
  const [supported] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return 'wakeLock' in navigator && navigator.wakeLock !== undefined;
  });

  useEffect(() => {
    const shouldRun = enabled && isWakeLockEnabledByUrl();
    if (!shouldRun) {
      releaseWakeLock();
      setActive(false);
      return;
    }

    let cancelled = false;
    requestWakeLock().then(ok => {
      if (!cancelled) setActive(ok);
    });

    // Browsers release the lock when the tab is hidden — re-acquire on return.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isWakeLockActive()) {
        requestWakeLock().then(ok => {
          if (!cancelled) setActive(ok);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled]);

  return { active, supported };
}

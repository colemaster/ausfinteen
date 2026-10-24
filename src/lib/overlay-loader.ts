/**
 * On-demand loader for the React overlay host (command palette + shortcuts modal).
 *
 * Why this exists: `CommandPalette` pulls in React, `cmdk` and `fuse.js`. Mounting it
 * as an Astro island put all of that on every page's critical path just so a keyboard shortcut
 * would work. Instead the Navbar (plain `.astro`, no framework) calls the functions below, and
 * React is only fetched the first time the user reaches for the palette.
 *
 * Both overlays self-register their document/window listeners on mount and expose their state
 * purely through custom events, so this module never needs to know how to open them — it only has
 * to guarantee the host exists before the open event is dispatched.
 */

type RootHandle = { render: (node: unknown) => void };
type CreateRoot = (container: Element) => RootHandle;

let mountPromise: Promise<void> | null = null;
let toastMountPromise: Promise<void> | null = null;

/** True once the React host has been mounted. */
let mounted = false;

export function isOverlayHostMounted(): boolean {
  return mounted;
}

function hostContainer(id: string): HTMLElement {
  let host = document.getElementById(id);
  if (!host) {
    host = document.createElement('div');
    host.id = id;
    document.body.appendChild(host);
  }
  return host;
}

function ensureHost(): Promise<void> {
  if (!mountPromise) {
    mountPromise = (async () => {
      // Sequential rather than parallel: `react-dom/client` and the host both need to agree on a
      // single React instance, and `resolve.dedupe` in astro.config.mjs guarantees one copy.
      const { createRoot } = (await import('react-dom/client')) as { createRoot: CreateRoot };
      const { createElement } = await import('react');
      const { OverlayHost } = await import('@/components/OverlayHost');

      // `render()` schedules work; the dialogs only subscribe to their open
      // events from an effect. Wait for the host's ready event so the first
      // open request cannot race the React commit.
      const ready = new Promise<void>(resolve => {
        document.addEventListener('overlay-host-ready', () => resolve(), { once: true });
      });
      createRoot(hostContainer('overlay-host')).render(createElement(OverlayHost));
      await ready;
      mounted = true;
    })().catch((error: unknown) => {
      // A failed load must not poison later attempts.
      mountPromise = null;
      throw error;
    });
  }
  return mountPromise;
}

/**
 * Mount just the toast viewport, without the command palette.
 *
 * Toasts are triggered by routine interactions, so pulling the palette's dependency graph
 * (cmdk, fuse.js) in to render a "Saved!" message would be a poor trade.
 */
function ensureToastHost(): Promise<void> {
  if (!toastMountPromise) {
    toastMountPromise = (async () => {
      const { createRoot } = (await import('react-dom/client')) as { createRoot: CreateRoot };
      const { createElement } = await import('react');
      const { ToastHost } = await import('@/components/ToastHost');

      createRoot(hostContainer('toast-host')).render(createElement(ToastHost));
    })().catch((error: unknown) => {
      toastMountPromise = null;
      throw error;
    });
  }
  return toastMountPromise;
}

/** Open the command palette, fetching React on first use. */
export async function openCommandPalette(): Promise<void> {
  await ensureHost();
  document.dispatchEvent(new CustomEvent('open-command-palette'));
}

/** Toggle the keyboard shortcuts modal, fetching React on first use. */
export async function toggleShortcutsModal(): Promise<void> {
  await ensureHost();
  document.dispatchEvent(new CustomEvent('toggle-shortcuts-modal'));
}

/** Open the performance/privacy modal, fetching React on first use. */
export async function openPerformanceModal(): Promise<void> {
  await ensureHost();
  document.dispatchEvent(new CustomEvent('open-performance-modal'));
}

/**
 * Ensure the Sonner viewport is mounted before the first toast is dispatched.
 * Exported for `src/lib/toast.ts`, which is the only caller.
 */
export async function ensureToastHostMounted(): Promise<void> {
  await ensureToastHost();
}

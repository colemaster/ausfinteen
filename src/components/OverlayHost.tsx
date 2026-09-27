import { useEffect, useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { PerformanceModal } from '@/components/shared/PerformanceModal';

/**
 * React host for the on-demand dialogs: command palette, shortcuts modal, performance modal.
 *
 * None of these are needed to render or interact with a page, so this host is mounted
 * **on demand** by `src/lib/overlay-loader.ts` rather than being an Astro island. That keeps
 * React, `motion`, `cmdk` and `fuse.js` out of every page's critical path — they are only
 * fetched the first time a user actually reaches for one of these.
 *
 * Once mounted it stays mounted: the overlays own their own open/close state via document
 * events, and re-mounting per navigation would throw away that state and the search index.
 */
export function OverlayHost() {
  const [perfOpen, setPerfOpen] = useState(false);

  useEffect(() => {
    const open = () => setPerfOpen(true);
    const close = () => setPerfOpen(false);
    document.addEventListener('open-performance-modal', open);
    document.addEventListener('close-performance-modal', close);
    return () => {
      document.removeEventListener('open-performance-modal', open);
      document.removeEventListener('close-performance-modal', close);
    };
  }, []);

  return (
    <>
      <CommandPalette />
      <KeyboardShortcutsModal />
      <PerformanceModal open={perfOpen} onClose={() => setPerfOpen(false)} />
    </>
  );
}

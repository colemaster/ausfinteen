import { useEffect } from 'react';

const BASE_TITLE = 'AusTeen Money';

/**
 * Sets the document title for the current page (browser tab + share previews).
 * Falls back to the base brand title when `title` is empty.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (!title) {
      document.title = BASE_TITLE;
      return;
    }
    document.title = `${title} · ${BASE_TITLE}`;
  }, [title]);
}
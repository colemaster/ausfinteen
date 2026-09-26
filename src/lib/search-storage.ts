/**
 * Lightweight search history and popular query helpers.
 * Kept separate from Fuse.js and datasets to allow instant rendering of search inputs.
 */

export const POPULAR_SEARCHES = [
  'HECS',
  'EV Novated Lease',
  'Super Drawdown',
  'CGT 6-Year Rule',
  'Emergency Stress Test',
  'HISA 5.0%',
  'APRA $250k',
  'PayID',
  'Stage 3 tax',
  'penalty rates',
  'super 12%',
  'tax-free threshold',
  'myID',
  '50c fares',
  'Open Banking CDR',
  'PPSR',
  'BNPL',
  'QLD licence',
  'ETF',
  'Mojo buffer',
];

const MAX_RECENT_SEARCHES = 5;
let recentSearches: string[] = [];

/**
 * Session-only history of the user's most recent searches (max 5).
 * Deliberately in-memory (module scope) and NEVER persisted — privacy-first,
 * no localStorage, nothing written to disk. Resets on page reload.
 */
export function getRecentSearches(): string[] {
  return [...recentSearches];
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;
  recentSearches = [
    trimmed,
    ...recentSearches.filter(q => q.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);
}

export function clearRecentSearches(): void {
  recentSearches = [];
}

import { describe, it, expect, beforeEach } from 'vitest';
import { searchSite, autocomplete, POPULAR_SEARCHES, addRecentSearch, getRecentSearches, clearRecentSearches } from '@/lib/site-search';

describe('searchSite', () => {
  it('returns empty results for a query under 2 characters', () => {
    expect(searchSite('a').total).toBe(0);
    expect(searchSite('').groups).toHaveLength(0);
  });

  it('finds topics by keyword with correct deep-link route', () => {
    const { groups, total } = searchSite('HECS');
    expect(total).toBeGreaterThan(0);
    const topicHits = groups.find(g => g.type === 'topic')?.hits ?? [];
    expect(topicHits.length).toBeGreaterThan(0);
    expect(topicHits[0].route).toMatch(/^\//);
    expect(topicHits[0].topicId).toBeTruthy();
  });

  it('is typo-tolerant (fuzzy match)', () => {
    const exact = searchSite('payslip').total;
    const typo = searchSite('payslup').total;
    expect(typo).toBeGreaterThan(0);
    expect(typo).toBeGreaterThanOrEqual(1);
    expect(exact).toBeGreaterThan(0);
  });

  it('ranks title matches above keyword-only matches', () => {
    const { groups } = searchSite('ETF');
    const topicHits = groups.find(g => g.type === 'topic')?.hits ?? [];
    if (topicHits.length >= 2) {
      // first hit should mention ETF in its question (title)
      expect(topicHits[0].title.toLowerCase()).toContain('etf');
    }
  });

  it('groups results by type', () => {
    const { groups } = searchSite('super');
    const types = groups.map(g => g.type);
    expect(types).toContain('topic');
    expect(types).toContain('module');
  });

  it('returns highlight match indices for rendering <mark>', () => {
    const { groups } = searchSite('BNPL');
    const topicHits = groups.find(g => g.type === 'topic')?.hits ?? [];
    const withMatch = topicHits.find(h => h.matches.length > 0);
    expect(withMatch).toBeDefined();
    if (withMatch) {
      const idx = withMatch.matches[0].indices[0];
      expect(idx[0]).toBeGreaterThanOrEqual(0);
      expect(idx[1]).toBeGreaterThan(idx[0]);
    }
  });

  it('respects maxPerGroup limit', () => {
    const { groups } = searchSite('australian', 3);
    groups.forEach(g => {
      expect(g.hits.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('autocomplete', () => {
  it('returns unique suggestion titles for a query', () => {
    const suggestions = autocomplete('tax');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(new Set(suggestions).size).toBe(suggestions.length);
  });

  it('returns empty for too-short query', () => {
    expect(autocomplete('x')).toHaveLength(0);
  });
});

describe('POPULAR_SEARCHES', () => {
  it('contains finance topics that return results', () => {
    POPULAR_SEARCHES.forEach(q => {
      const { total } = searchSite(q);
      expect(total, `popular search "${q}" should return results`).toBeGreaterThan(0);
    });
  });
});

describe('recent searches (session-only)', () => {
  beforeEach(() => {
    clearRecentSearches();
  });

  it('records queries most-recent-first', () => {
    addRecentSearch('HECS');
    addRecentSearch('super');
    expect(getRecentSearches()).toEqual(['super', 'HECS']);
  });

  it('dedupes case-insensitively and moves the duplicate to the front', () => {
    addRecentSearch('hecs');
    addRecentSearch('super');
    addRecentSearch('HECS');
    expect(getRecentSearches()).toEqual(['HECS', 'super']);
  });

  it('caps the history at 5 entries', () => {
    for (const q of ['aa', 'bb', 'cc', 'dd', 'ee', 'ff']) addRecentSearch(q);
    expect(getRecentSearches()).toHaveLength(5);
    expect(getRecentSearches()[0]).toBe('ff');
    expect(getRecentSearches()[4]).toBe('bb');
  });

  it('ignores blank and too-short queries', () => {
    addRecentSearch('   ');
    addRecentSearch('x');
    expect(getRecentSearches()).toHaveLength(0);
  });

  it('returns a copy so callers cannot mutate the store', () => {
    addRecentSearch('HECS');
    const first = getRecentSearches();
    first.push('hacked');
    expect(getRecentSearches()).toEqual(['HECS']);
  });

  it('clears all entries', () => {
    addRecentSearch('HECS');
    clearRecentSearches();
    expect(getRecentSearches()).toHaveLength(0);
  });
});

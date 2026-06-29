/**
 * useSearch — React hook for article search with pagination.
 *
 * - Reads the initial query from the `?q=` URL param on mount.
 * - Debounces input changes (300 ms) before firing a network request.
 * - Writes the committed query back to the URL so it is shareable.
 * - Exposes `query` (controlled input value), `setQuery`, `articles`,
 *   `loading`, `loadingMore`, `hasMore`, `loadMore`, `error`, and `clearSearch`.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useSearchController } from '../di/UseCaseContext';

const DEBOUNCE_MS = 300;
const PAGE_SIZE   = 20;

interface UseSearchState {
  /** Current value of the search input (may not yet be committed). */
  query: string;
  /** Update the controlled search input value. */
  setQuery: (q: string) => void;
  /** Programmatically submit a search (bypasses debounce). */
  submitSearch: (q: string) => void;
  /** Clear the search and return to the feed. */
  clearSearch: () => void;
  articles: ArticleDTO[];
  loading: boolean;
  /** True while an additional page is being fetched. */
  loadingMore: boolean;
  error: string | null;
  /** Whether more pages are available to load. */
  hasMore: boolean;
  loadMore: () => void;
}

export function useSearch(): UseSearchState {
  const controller = useSearchController();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive initial query from the URL param.
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQueryState]         = useState(initialQ);
  const [articles, setArticles]        = useState<ArticleDTO[]>([]);
  const [loading, setLoading]          = useState(false);
  const [loadingMore, setLoadingMore]  = useState(false);
  const [error, setError]              = useState<string | null>(null);
  const [hasMore, setHasMore]          = useState(false);

  // Track the committed query and current page in refs so async callbacks
  // always see up-to-date values without needing them in dependency arrays.
  const committedQueryRef = useRef(initialQ);
  const pageRef           = useRef(1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Execute a fresh (page 1) search and update URL. */
  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();

      // Sync URL param — remove it when empty.
      setSearchParams(
        trimmed ? { q: trimmed } : {},
        { replace: true },
      );

      if (!trimmed) {
        setArticles([]);
        setLoading(false);
        setError(null);
        setHasMore(false);
        return;
      }

      // Reset pagination state for the new query.
      committedQueryRef.current = trimmed;
      pageRef.current = 1;

      setLoading(true);
      setError(null);
      setArticles([]);
      setHasMore(false);

      const result = await controller.search({ q: trimmed, pageSize: PAGE_SIZE, page: 1 });

      if (result.ok) {
        const { articles: newArticles, totalResults } = result.data;
        setArticles(newArticles);
        setHasMore(newArticles.length > 0 && newArticles.length < totalResults);
      } else {
        setError(result.error);
        setArticles([]);
        setHasMore(false);
      }
      setLoading(false);
    },
    [controller, setSearchParams],
  );

  /** Load the next page of results and append (deduped). */
  const loadMore = useCallback(async () => {
    const q = committedQueryRef.current;
    if (!q || loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    const nextPage = pageRef.current + 1;
    const result   = await controller.search({ q, pageSize: PAGE_SIZE, page: nextPage });

    if (result.ok) {
      const { articles: newArticles, totalResults } = result.data;
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique      = newArticles.filter((a) => !existingIds.has(a.id));
        const merged      = [...prev, ...unique];
        setHasMore(merged.length < totalResults);
        return merged;
      });
      pageRef.current = nextPage;
    } else {
      setError(result.error);
    }
    setLoadingMore(false);
  }, [controller, loadingMore, hasMore]);

  /** Controlled setter — schedules a debounced search. */
  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        void runSearch(q);
      }, DEBOUNCE_MS);
    },
    [runSearch],
  );

  /** Immediately submit (e.g. on Enter / form submit). */
  const submitSearch = useCallback(
    (q: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setQueryState(q);
      void runSearch(q);
    },
    [runSearch],
  );

  /** Reset state and clear URL param. */
  const clearSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setQueryState('');
    setArticles([]);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(false);
    committedQueryRef.current = '';
    pageRef.current = 1;
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Run search on mount if the URL already has a ?q= param.
  useEffect(() => {
    if (initialQ.trim()) {
      void runSearch(initialQ);
    }
    // Only run on mount — `runSearch` changes identity when controller changes,
    // which only happens once. eslint-disable-next-line is intentional here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    query,
    setQuery,
    submitSearch,
    clearSearch,
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore: () => { void loadMore(); },
  };
}

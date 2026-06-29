/**
 * useSearch — React hook for article search.
 *
 * - Reads the initial query from the `?q=` URL param on mount.
 * - Debounces input changes (300 ms) before firing a network request.
 * - Writes the committed query back to the URL so it is shareable.
 * - Exposes `query` (controlled input value), `setQuery`, `articles`,
 *   `loading`, `error`, and `clearSearch`.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useSearchController } from '../di/UseCaseContext';

const DEBOUNCE_MS = 300;

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
  error: string | null;
}

export function useSearch(): UseSearchState {
  const controller = useSearchController();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive initial query from the URL param.
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQueryState]     = useState(initialQ);
  const [articles, setArticles]    = useState<ArticleDTO[]>([]);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Execute the search and update URL. */
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
        return;
      }

      setLoading(true);
      setError(null);

      const result = await controller.search({ q: trimmed, pageSize: 20 });

      if (result.ok) {
        setArticles(result.data);
      } else {
        setError(result.error);
        setArticles([]);
      }
      setLoading(false);
    },
    [controller, setSearchParams],
  );

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

  return { query, setQuery, submitSearch, clearSearch, articles, loading, error };
}

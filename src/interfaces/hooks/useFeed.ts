/**
 * useFeed — React hook that fetches top-headline articles with pagination.
 *
 * Accepts an optional `category` filter:
 *   - null / undefined  → fetches all 7 categories (5 per category)
 *   - a category string → fetches only that category (20 articles max)
 *
 * Re-fetches from page 1 automatically whenever `category` changes.
 * Calling `loadMore()` fetches the next page and appends results
 * (deduplicated by article id) to the existing list.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useFeedController } from '../di/UseCaseContext';

interface UseFeedOptions {
  /** Category to filter by. null means "all categories". */
  category?: string | null;
}

interface UseFeedState {
  articles: ArticleDTO[];
  /** True during the initial page load (articles list is empty). */
  loading: boolean;
  /** True while an additional page is being fetched. */
  loadingMore: boolean;
  error: string | null;
  /** Whether more pages are available to load. */
  hasMore: boolean;
  reload: () => void;
  loadMore: () => void;
}

export function useFeed({ category = null }: UseFeedOptions = {}): UseFeedState {
  const controller = useFeedController();

  const [articles, setArticles]       = useState<ArticleDTO[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [hasMore, setHasMore]         = useState(false);

  // Track the current page. Use a ref so loadMore closure always sees latest value.
  const pageRef = useRef(1);

  // Build the base input shape from the category option.
  const buildInput = useCallback(
    (page: number) =>
      category !== null
        ? { categories: [category], maxPerCategory: 20, page }
        : { maxPerCategory: 5, page },
    [category],
  );

  /** Initial (or forced) load — resets the list to page 1. */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setArticles([]);
    pageRef.current = 1;

    const result = await controller.loadFeed(buildInput(1));

    if (result.ok) {
      const { articles: newArticles, totalResults } = result.data;
      setArticles(newArticles);
      // hasMore: we've fetched page 1 worth; if total > what we got, there's more.
      setHasMore(newArticles.length > 0 && newArticles.length < totalResults);
    } else {
      setError(result.error);
      setHasMore(false);
    }
    setLoading(false);
  }, [controller, buildInput]);

  /** Fetch the next page and append (deduped) articles. */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    const nextPage = pageRef.current + 1;
    const result   = await controller.loadFeed(buildInput(nextPage));

    if (result.ok) {
      const { articles: newArticles, totalResults } = result.data;
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique      = newArticles.filter((a) => !existingIds.has(a.id));
        const merged      = [...prev, ...unique];
        // hasMore: are there more results beyond what we've accumulated?
        setHasMore(merged.length < totalResults);
        return merged;
      });
      pageRef.current = nextPage;
    } else {
      setError(result.error);
    }
    setLoadingMore(false);
  }, [controller, buildInput, loadingMore, hasMore]);

  // Reset + reload whenever category changes.
  useEffect(() => {
    void load();
  }, [load]);

  return {
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    reload: () => { void load(); },
    loadMore: () => { void loadMore(); },
  };
}

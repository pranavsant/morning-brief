/**
 * useFeed — React hook that fetches top-headline articles.
 *
 * Accepts an optional `category` filter:
 *   - null / undefined  → fetches all 7 categories (5 per category)
 *   - a category string → fetches only that category (20 articles max)
 *
 * Re-fetches automatically whenever `category` changes.
 * Keeps feed components dumb: they read articles / loading / error and
 * call reload() to manually refetch.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useFeedController } from '../di/UseCaseContext';

interface UseFeedOptions {
  /** Category to filter by. null means "all categories". */
  category?: string | null;
}

interface UseFeedState {
  articles: ArticleDTO[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFeed({ category = null }: UseFeedOptions = {}): UseFeedState {
  const controller = useFeedController();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const input =
      category !== null
        ? // Single-category view: request up to 20 articles to fill the grid.
          { categories: [category], maxPerCategory: 20 }
        : // All-categories view: 5 per category → up to 35 articles.
          { maxPerCategory: 5 };

    const result = await controller.loadFeed(input);

    if (result.ok) {
      setArticles(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [controller, category]);

  useEffect(() => {
    void load();
  }, [load]);

  return { articles, loading, error, reload: () => { void load(); } };
}

/**
 * useFeed — React hook that auto-fetches top-headline articles on mount.
 *
 * Keeps feed components dumb: they read articles / loading / error and
 * call reload() to refetch.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useFeedController } from '../di/UseCaseContext';

interface UseFeedState {
  articles: ArticleDTO[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFeed(): UseFeedState {
  const controller = useFeedController();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Request 5 articles from each of the 7 categories → up to 35 articles.
    const result = await controller.loadFeed({ maxPerCategory: 5 });

    if (result.ok) {
      setArticles(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [controller]);

  useEffect(() => {
    void load();
  }, [load]);

  return { articles, loading, error, reload: () => { void load(); } };
}

/**
 * useSavedArticles — persists bookmarked articles in localStorage.
 *
 * The hook is the single source of truth for saved articles. It reads
 * on first mount and writes on every change, keeping bookmarks alive
 * across page refreshes.
 *
 * Shape stored in localStorage (key: STORAGE_KEY):
 *   ArticleDTO[]  (array of plain serialisable article objects)
 *
 * Layer: interfaces.
 */

import { useCallback, useState } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'morning-brief:saved-articles';

// ── Serialisation helpers ─────────────────────────────────────────────────────

function readFromStorage(): ArticleDTO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Keep only entries that at least have an id and title string.
    return parsed.filter(
      (item): item is ArticleDTO =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === 'string' &&
        typeof (item as Record<string, unknown>).title === 'string',
    );
  } catch {
    return [];
  }
}

function writeToStorage(articles: ArticleDTO[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota exceeded).
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface SavedArticlesState {
  /** All bookmarked articles, newest-first. */
  savedArticles: ArticleDTO[];
  /** Save an article. No-op if already saved. */
  saveArticle: (article: ArticleDTO) => void;
  /** Remove a bookmarked article by its id. */
  removeArticle: (id: string) => void;
  /** Toggle saved state for an article. */
  toggleSaved: (article: ArticleDTO) => void;
  /** Returns true when the article with the given id is bookmarked. */
  isSaved: (id: string) => boolean;
  /** Remove all saved articles. */
  clearAll: () => void;
}

export function useSavedArticles(): SavedArticlesState {
  const [savedArticles, setSavedArticles] = useState<ArticleDTO[]>(() =>
    readFromStorage(),
  );

  const persist = useCallback((next: ArticleDTO[]) => {
    setSavedArticles(next);
    writeToStorage(next);
  }, []);

  const saveArticle = useCallback(
    (article: ArticleDTO) => {
      if (savedArticles.some((a) => a.id === article.id)) return;
      // Prepend so newest saved article appears first.
      persist([article, ...savedArticles]);
    },
    [savedArticles, persist],
  );

  const removeArticle = useCallback(
    (id: string) => {
      persist(savedArticles.filter((a) => a.id !== id));
    },
    [savedArticles, persist],
  );

  const toggleSaved = useCallback(
    (article: ArticleDTO) => {
      if (savedArticles.some((a) => a.id === article.id)) {
        persist(savedArticles.filter((a) => a.id !== article.id));
      } else {
        persist([article, ...savedArticles]);
      }
    },
    [savedArticles, persist],
  );

  const isSaved = useCallback(
    (id: string) => savedArticles.some((a) => a.id === id),
    [savedArticles],
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { savedArticles, saveArticle, removeArticle, toggleSaved, isSaved, clearAll };
}

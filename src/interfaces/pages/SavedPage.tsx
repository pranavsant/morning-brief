/**
 * SavedPage — displays all articles the user has bookmarked.
 *
 * Articles are loaded from localStorage via the useSavedArticles hook.
 * Clicking a card opens the ArticleDetailModal; clicking the bookmark
 * button on a card removes that article from the saved list.
 *
 * Layer: interfaces.
 */

import { useState } from 'react';
import { useSavedArticles } from '../hooks/useSavedArticles';
import { ArticleFeedCard } from '../components/ArticleFeedCard';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { ArticleDTO } from '@application/dtos/ArticleDTO';

export function SavedPage() {
  const { savedArticles, toggleSaved, isSaved, clearAll } = useSavedArticles();
  const [selectedArticle, setSelectedArticle] = useState<ArticleDTO | null>(null);

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
            🔖 Saved Articles
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {savedArticles.length === 0
              ? 'No saved articles yet.'
              : `${savedArticles.length} article${savedArticles.length === 1 ? '' : 's'} saved for later.`}
          </p>
        </div>

        {savedArticles.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex-shrink-0 text-sm font-medium text-slate-400 hover:text-red-500 focus:outline-none focus:underline transition dark:text-slate-500 dark:hover:text-red-400"
          >
            Clear all
          </button>
        )}
      </header>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {savedArticles.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="mb-4 text-5xl" aria-hidden="true">🔖</span>
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            Nothing saved yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-slate-400 dark:text-slate-500">
            Tap the bookmark icon on any article card or inside the article detail view to save it
            here for later reading.
          </p>
        </div>
      ) : (
        /* ── Article grid ────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedArticles.map((article) => (
            <ArticleFeedCard
              key={article.id}
              article={article}
              onSelect={setSelectedArticle}
              saved={isSaved(article.id)}
              onToggleSaved={toggleSaved}
            />
          ))}
        </div>
      )}

      {/* ── Article detail modal ─────────────────────────────────────────── */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        saved={selectedArticle ? isSaved(selectedArticle.id) : false}
        onToggleSaved={toggleSaved}
      />
    </main>
  );
}

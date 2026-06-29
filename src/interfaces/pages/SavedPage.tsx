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
import { useNavigate } from 'react-router-dom';
import { useSavedArticles } from '../hooks/useSavedArticles';
import { ArticleFeedCard } from '../components/ArticleFeedCard';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { EmptyState } from '../components/EmptyState';
import { ArticleDTO } from '@application/dtos/ArticleDTO';

function BookmarkIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      {/* Bookmark ribbon */}
      <path
        d="M20 12h40a4 4 0 0 1 4 4v48l-24-14L16 64V16a4 4 0 0 1 4-4z"
        className="fill-current opacity-20 stroke-current"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Plus mark — "add" affordance */}
      <line x1="40" y1="28" x2="40" y2="44" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="32" y1="36" x2="48" y2="36" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function SavedPage() {
  const { savedArticles, toggleSaved, isSaved, clearAll } = useSavedArticles();
  const [selectedArticle, setSelectedArticle] = useState<ArticleDTO | null>(null);
  const navigate = useNavigate();

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
        <EmptyState
          illustration={<BookmarkIllustration />}
          title="Nothing saved yet"
          description="Tap the bookmark icon on any article card or inside the article detail view to save it here for later reading."
          primaryAction={{ label: 'Browse headlines', onClick: () => navigate('/') }}
          secondaryAction={{ label: 'Read your brief', onClick: () => navigate('/brief') }}
          paddingClass="py-24"
        />
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

/**
 * HomePage — main page: live news feed + brief generation.
 *
 * The page renders in two sections:
 *  1. Top-headline feed — auto-fetched on mount, responsive article grid.
 *     Includes:
 *       • A SearchBar — submits queries to /v2/everything, results replace
 *         the headline grid. The active query is reflected in ?q= URL param.
 *       • A FeedCategoryBar — single-select category filter, hidden while
 *         a search query is active.
 *  2. Morning Brief — pick categories, generate an AI digest.
 *
 * Pure presentation + orchestration through useFeed, useSearch, and
 * useMorningBrief. No business logic, no infrastructure imports.
 *
 * Layer: interfaces.
 */

import { useState } from 'react';
import { useMorningBrief } from '../hooks/useMorningBrief';
import { useFeed } from '../hooks/useFeed';
import { useSearch } from '../hooks/useSearch';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { CategoryPicker } from '../components/CategoryPicker';
import { FeedCategoryBar } from '../components/FeedCategoryBar';
import { SearchBar } from '../components/SearchBar';
import { BriefView } from '../components/BriefView';
import { ArticleFeedCard } from '../components/ArticleFeedCard';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { FeedSkeleton } from '../components/FeedSkeleton';
import { LoadMoreButton } from '../components/LoadMoreButton';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { cn } from '../lib/cn';
import { ArticleDTO } from '@application/dtos/ArticleDTO';

export function HomePage() {
  const { brief, loading: briefLoading, error: briefError, generate, reset } = useMorningBrief();

  // null = "All categories", a string = single-category filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Article selected for detail modal (null = modal closed)
  const [selectedArticle, setSelectedArticle] = useState<ArticleDTO | null>(null);

  const {
    articles: feedArticles,
    loading: feedLoading,
    loadingMore: feedLoadingMore,
    error: feedError,
    hasMore: feedHasMore,
    reload,
    loadMore: feedLoadMore,
  } = useFeed({ category: activeCategory });

  const {
    query,
    setQuery,
    submitSearch,
    clearSearch,
    articles: searchArticles,
    loading: searchLoading,
    loadingMore: searchLoadingMore,
    error: searchError,
    hasMore: searchHasMore,
    loadMore: searchLoadMore,
  } = useSearch();

  // A search is "active" whenever there is a non-empty query string.
  const isSearchActive = query.trim().length > 0;

  // Persisted category preferences — shared with BriefPage and SettingsPage.
  const { categories: selected, toggleCategory } = useUserPreferences();

  const handleGenerate = () => {
    void generate({ categories: selected, maxArticlesPerCategory: 5, country: 'us' });
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const displayArticles    = isSearchActive ? searchArticles    : feedArticles;
  const displayLoading     = isSearchActive ? searchLoading     : feedLoading;
  const displayLoadingMore = isSearchActive ? searchLoadingMore : feedLoadingMore;
  const displayError       = isSearchActive ? searchError       : feedError;
  const displayHasMore     = isSearchActive ? searchHasMore     : feedHasMore;
  const displayLoadMore    = isSearchActive ? searchLoadMore    : feedLoadMore;

  const feedSectionTitle = isSearchActive
    ? `Results for "${query.trim()}"`
    : 'Top Headlines';

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-slate-900">☕ Morning Brief</h1>
        <p className="mt-2 text-slate-600">
          Your day, summarised by Claude. Pick what matters and get a crisp digest.
        </p>
      </header>

      {/* ── Morning Brief generator ──────────────────────────────────────── */}
      <section className="mb-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Generate your morning brief
        </h2>
        <CategoryPicker selected={selected} onToggle={toggleCategory} disabled={briefLoading} />

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={briefLoading || selected.length === 0}
            className={cn(
              'rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition',
              'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
              (briefLoading || selected.length === 0) && 'cursor-not-allowed opacity-50',
            )}
          >
            {briefLoading ? 'Generating…' : 'Generate my brief'}
          </button>
          {brief && !briefLoading && (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {briefError && (
          <div className="mt-4">
            <ErrorBanner message={briefError} />
          </div>
        )}
        {briefLoading && (
          <div className="mt-4">
            <Spinner label="Fetching headlines and asking Claude…" />
          </div>
        )}
        {!briefLoading && brief && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <BriefView brief={brief} />
          </div>
        )}
      </section>

      {/* ── Top Headlines / Search results feed ─────────────────────────── */}
      <section>
        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900">{feedSectionTitle}</h2>
          {!isSearchActive && !feedLoading && (
            <button
              type="button"
              onClick={reload}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:underline"
              aria-label="Refresh headlines"
            >
              ↻ Refresh
            </button>
          )}
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <div className="mb-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={submitSearch}
            onClear={clearSearch}
            disabled={feedLoading && !isSearchActive}
          />
        </div>

        {/* ── Category filter — hidden during search ───────────────────────── */}
        {!isSearchActive && (
          <div className="mb-5">
            <FeedCategoryBar
              active={activeCategory}
              onChange={setActiveCategory}
              disabled={feedLoading}
            />
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {displayError && (
          <div className="mb-4">
            <ErrorBanner
              message={displayError}
              onDismiss={isSearchActive ? clearSearch : reload}
            />
          </div>
        )}

        {/* ── Article grid / skeleton / empty state ────────────────────────── */}
        {displayLoading ? (
          <FeedSkeleton count={isSearchActive ? 12 : 20} />
        ) : (
          <>
            {displayArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayArticles.map((article) => (
                    <ArticleFeedCard
                      key={article.id}
                      article={article}
                      onSelect={setSelectedArticle}
                    />
                  ))}
                </div>

                <LoadMoreButton
                  hasMore={displayHasMore}
                  loadingMore={displayLoadingMore}
                  onLoadMore={displayLoadMore}
                />
              </>
            ) : (
              !displayError && (
                <div className="flex flex-col items-center py-20 text-center">
                  {isSearchActive ? (
                    <>
                      <span className="mb-3 text-4xl" aria-hidden="true">🔍</span>
                      <p className="text-base font-medium text-slate-700">
                        No results for &ldquo;{query.trim()}&rdquo;
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Try different keywords or{' '}
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="font-medium text-brand-600 hover:text-brand-800 focus:underline focus:outline-none"
                        >
                          browse the top headlines
                        </button>
                        .
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No headlines available. Try refreshing.
                    </p>
                  )}
                </div>
              )
            )}
          </>
        )}
      </section>

      {/* ── Article detail modal ─────────────────────────────────────────── */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

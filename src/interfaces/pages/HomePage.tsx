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
import { useSavedArticles } from '../hooks/useSavedArticles';
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
import { EmptyState } from '../components/EmptyState';
import { FeedErrorState } from '../components/FeedErrorState';
import { cn } from '../lib/cn';
import { ArticleDTO } from '@application/dtos/ArticleDTO';

/* ── Inline SVG illustrations for empty states ──────────────────────────── */

function SearchEmptyIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      {/* Magnifying glass body */}
      <circle cx="34" cy="34" r="18" className="stroke-current" strokeWidth="5" />
      {/* Handle */}
      <line
        x1="46.5"
        y1="46.5"
        x2="62"
        y2="62"
        className="stroke-current"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* X mark inside glass */}
      <line x1="27" y1="27" x2="41" y2="41" className="stroke-red-400 dark:stroke-red-500" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="41" y1="27" x2="27" y2="41" className="stroke-red-400 dark:stroke-red-500" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function FeedEmptyIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      {/* Newspaper / page outline */}
      <rect x="12" y="16" width="56" height="48" rx="5" className="fill-current opacity-20" />
      <rect x="12" y="16" width="56" height="48" rx="5" className="stroke-current" strokeWidth="4" />
      {/* Lines representing text */}
      <line x1="22" y1="30" x2="58" y2="30" className="stroke-current" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="22" y1="40" x2="50" y2="40" className="stroke-current" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="22" y1="50" x2="44" y2="50" className="stroke-current" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

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

  // Bookmarks — shared state so cards and modal stay in sync.
  const { toggleSaved, isSaved } = useSavedArticles();

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

  // Full-section error: error occurred on initial load with no articles to show.
  const showFullError = !!displayError && displayArticles.length === 0 && !displayLoading;

  // Load-more inline error: error occurred on pagination but we already have articles.
  const showInlineError = !!displayError && displayArticles.length > 0;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100">
          ☕ Morning Brief
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your day, summarised by Claude. Pick what matters and get a crisp digest.
        </p>
      </header>

      {/* ── Morning Brief generator ──────────────────────────────────────── */}
      <section className="mb-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {briefError && (
          <div className="mt-4">
            <ErrorBanner
              message={briefError}
              onRetry={handleGenerate}
              onDismiss={reset}
            />
          </div>
        )}
        {briefLoading && (
          <div className="mt-4">
            <Spinner label="Fetching headlines and asking Claude…" />
          </div>
        )}
        {!briefLoading && brief && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
            <BriefView brief={brief} />
          </div>
        )}
      </section>

      {/* ── Top Headlines / Search results feed ─────────────────────────── */}
      <section>
        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
            {feedSectionTitle}
          </h2>
          {!isSearchActive && !feedLoading && (
            <button
              type="button"
              onClick={reload}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:underline dark:text-brand-400 dark:hover:text-brand-300"
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

        {/* ── Load-more inline error (some articles already visible) ──────── */}
        {showInlineError && (
          <div className="mb-4">
            <ErrorBanner
              message={displayError!}
              onRetry={isSearchActive ? () => { void searchLoadMore(); } : () => { void feedLoadMore(); }}
              onDismiss={isSearchActive ? clearSearch : reload}
            />
          </div>
        )}

        {/* ── Article grid / skeleton / empty state / full error ───────────── */}
        {displayLoading ? (
          <FeedSkeleton count={isSearchActive ? 12 : 20} />
        ) : showFullError ? (
          /* ── Full-section error state ──────────────────────────────────── */
          isSearchActive ? (
            <FeedErrorState
              message={displayError!}
              onRetry={() => submitSearch(query)}
              retryLabel="Search again"
              secondaryLabel="Clear search"
              onSecondary={clearSearch}
            />
          ) : (
            <FeedErrorState
              message={displayError!}
              onRetry={reload}
              retryLabel="Refresh headlines"
            />
          )
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
                      saved={isSaved(article.id)}
                      onToggleSaved={toggleSaved}
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
              /* ── Empty state ─────────────────────────────────────────────── */
              isSearchActive ? (
                <EmptyState
                  illustration={<SearchEmptyIllustration />}
                  title={`No results for "${query.trim()}"`}
                  description="Try different keywords, check your spelling, or browse the latest top headlines."
                  primaryAction={{ label: 'Clear search', onClick: clearSearch }}
                />
              ) : (
                <EmptyState
                  illustration={<FeedEmptyIllustration />}
                  title="No headlines available right now"
                  description="We couldn't load any articles at the moment. This is usually temporary — try refreshing."
                  primaryAction={{ label: '↻ Refresh', onClick: reload }}
                />
              )
            )}
          </>
        )}
      </section>

      {/* ── Article detail modal ─────────────────────────────────────────── */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        saved={selectedArticle ? isSaved(selectedArticle.id) : false}
        onToggleSaved={toggleSaved}
      />
    </div>
  );
}

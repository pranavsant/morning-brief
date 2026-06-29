/**
 * HomePage — main page: live news feed + brief generation.
 *
 * The page renders in two sections:
 *  1. Top-headline feed — auto-fetched on mount, responsive article grid.
 *     Includes a FeedCategoryBar so users can filter by a single category.
 *  2. Morning Brief — pick categories, generate an AI digest.
 *
 * Pure presentation + orchestration through useFeed and useMorningBrief.
 * No business logic, no infrastructure imports.
 *
 * Layer: interfaces.
 */

import { useState } from 'react';
import { useMorningBrief } from '../hooks/useMorningBrief';
import { useFeed } from '../hooks/useFeed';
import { CategoryPicker } from '../components/CategoryPicker';
import { FeedCategoryBar } from '../components/FeedCategoryBar';
import { BriefView } from '../components/BriefView';
import { ArticleFeedCard } from '../components/ArticleFeedCard';
import { FeedSkeleton } from '../components/FeedSkeleton';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { cn } from '../lib/cn';

const DEFAULT_CATEGORIES = ['technology', 'business', 'science'];

export function HomePage() {
  const { brief, loading: briefLoading, error: briefError, generate, reset } = useMorningBrief();

  // null = "All categories", a string = single-category filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { articles, loading: feedLoading, error: feedError, reload } = useFeed({
    category: activeCategory,
  });

  const [selected, setSelected] = useState<string[]>(DEFAULT_CATEGORIES);

  const toggleCategory = (category: string) => {
    setSelected((prev: string[]) =>
      prev.includes(category) ? prev.filter((c: string) => c !== category) : [...prev, category],
    );
  };

  const handleGenerate = () => {
    void generate({ categories: selected, maxArticlesPerCategory: 5, country: 'us' });
  };

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

      {/* ── Top Headlines feed ───────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Top Headlines</h2>
          {!feedLoading && (
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

        {/* ── Category filter tab bar ────────────────────────────────────── */}
        <div className="mb-5">
          <FeedCategoryBar
            active={activeCategory}
            onChange={setActiveCategory}
            disabled={feedLoading}
          />
        </div>

        {feedError && (
          <div className="mb-4">
            <ErrorBanner message={feedError} onDismiss={reload} />
          </div>
        )}

        {feedLoading ? (
          <FeedSkeleton count={20} />
        ) : (
          <>
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {articles.map((article) => (
                  <ArticleFeedCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              !feedError && (
                <p className="py-16 text-center text-sm text-slate-400">
                  No headlines available. Try refreshing.
                </p>
              )
            )}
          </>
        )}
      </section>
    </div>
  );
}

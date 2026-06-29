/**
 * LoadMoreButton — centred CTA that the user clicks to fetch the next page
 * of articles.
 *
 * Renders a spinner inside the button while loading is in progress so the
 * user gets immediate feedback without layout shift.
 * Renders nothing when there are no more pages to load.
 *
 * Props:
 *   hasMore     — when false, the button is not rendered at all
 *   onLoadMore  — called when the button is clicked (page is not loading)
 *   loadingMore — when true, shows spinner and disables the button
 *
 * Layer: interfaces.
 */

import { Spinner } from './Spinner';

interface Props {
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore?: boolean;
}

export function LoadMoreButton({ hasMore, onLoadMore, loadingMore = false }: Props) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-8">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loadingMore}
        className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-700 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-slate-800"
        aria-busy={loadingMore}
        aria-label={loadingMore ? 'Loading more articles…' : 'Load more articles'}
      >
        {loadingMore ? (
          <Spinner label="Loading more…" inline />
        ) : (
          'Load more'
        )}
      </button>
    </div>
  );
}

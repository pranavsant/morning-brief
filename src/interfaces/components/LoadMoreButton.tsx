/**
 * LoadMoreButton — "Load more" trigger shown beneath the article grid.
 *
 * Displays a spinner row when `loadingMore` is true, the button when
 * more articles are available, and nothing when the list is exhausted.
 *
 * Layer: interfaces.
 */

import { cn } from '../lib/cn';

interface Props {
  /** Whether a next-page fetch is currently in-flight. */
  loadingMore: boolean;
  /** Whether more pages exist beyond what is currently displayed. */
  hasMore: boolean;
  /** Called when the user clicks "Load more". */
  onLoadMore: () => void;
}

export function LoadMoreButton({ loadingMore, hasMore, onLoadMore }: Props) {
  if (!hasMore && !loadingMore) return null;

  return (
    <div className="mt-8 flex justify-center">
      {loadingMore ? (
        <div
          className="flex items-center gap-2 text-sm text-slate-500"
          aria-live="polite"
          aria-label="Loading more articles"
        >
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500"
            aria-hidden="true"
          />
          Loading more…
        </div>
      ) : (
        <button
          type="button"
          onClick={onLoadMore}
          className={cn(
            'rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm',
            'transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
            'focus:outline-none focus:ring-2 focus:ring-brand-400',
          )}
        >
          Load more articles
        </button>
      )}
    </div>
  );
}

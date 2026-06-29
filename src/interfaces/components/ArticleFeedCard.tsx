/**
 * ArticleFeedCard — large card for the main news feed grid.
 *
 * Displays headline, source name, publish time, and a thumbnail.
 * Clicking the card calls `onSelect` to open the article detail modal,
 * which in turn provides direct access to the "Read full article" link
 * and the "Summarize with AI" button.
 *
 * An optional bookmark button floats in the top-right corner of the
 * thumbnail. If `onToggleSaved` is provided it is shown; `saved`
 * controls the filled/outlined icon state.
 *
 * Layer: interfaces.
 */

import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { cn } from '../lib/cn';

interface Props {
  article: ArticleDTO;
  /** Called when the user clicks the card to open the detail modal. */
  onSelect: (article: ArticleDTO) => void;
  /** Whether this article is currently bookmarked. */
  saved?: boolean;
  /** Called when the bookmark button is clicked. */
  onToggleSaved?: (article: ArticleDTO) => void;
}

/** Placeholder shown when an article has no thumbnail. */
function ImagePlaceholder({ category }: { category: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <span className="text-2xl capitalize text-slate-400" aria-hidden="true">
        {categoryEmoji(category)}
      </span>
    </div>
  );
}

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    business:      '💼',
    entertainment: '🎬',
    general:       '📰',
    health:        '❤️',
    science:       '🔬',
    sports:        '⚽',
    technology:    '💻',
  };
  return map[category] ?? '📰';
}

/** Bookmark icon — filled when saved, outlined when not. */
function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    /* Solid bookmark (saved) */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    /* Outline bookmark (not saved) */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
      />
    </svg>
  );
}

export function ArticleFeedCard({ article, onSelect, saved = false, onToggleSaved }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm text-left',
        'transition hover:border-brand-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400',
        'dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-600',
      )}
      aria-label={`Open details for: ${article.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder category={article.category} />
        )}
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
          {article.category}
        </span>

        {/* Bookmark button */}
        {onToggleSaved && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaved(article);
            }}
            aria-label={saved ? 'Remove bookmark' : 'Save article'}
            aria-pressed={saved}
            className={cn(
              'absolute right-3 top-3 flex items-center justify-center rounded-full p-1.5 shadow-sm backdrop-blur-sm transition',
              'focus:outline-none focus:ring-2 focus:ring-brand-400',
              saved
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-brand-600 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400',
            )}
          >
            <BookmarkIcon filled={saved} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-400">
          {article.title}
        </h3>

        {article.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {article.description}
          </p>
        )}

        {/* Footer: source + time */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
            {article.sourceName}
          </span>
          <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
            {article.relativeAge}
          </span>
        </div>
      </div>
    </button>
  );
}

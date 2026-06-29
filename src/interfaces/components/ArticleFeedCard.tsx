/**
 * ArticleFeedCard — large card for the main news feed grid.
 *
 * Displays headline, source name, publish time, and a thumbnail.
 * Clicking the card opens the article in a new tab.
 *
 * Layer: interfaces.
 */

import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { cn } from '../lib/cn';

interface Props {
  article: ArticleDTO;
}

/** Placeholder shown when an article has no thumbnail. */
function ImagePlaceholder({ category }: { category: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
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

export function ArticleFeedCard({ article }: Props) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        'transition hover:border-brand-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400',
      )}
      aria-label={article.title}
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-slate-100">
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
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700 shadow-sm backdrop-blur-sm">
          {article.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
          {article.title}
        </h3>

        {article.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {article.description}
          </p>
        )}

        {/* Footer: source + time */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-xs font-medium text-slate-600">
            {article.sourceName}
          </span>
          <span className="flex-shrink-0 text-xs text-slate-400">
            {article.relativeAge}
          </span>
        </div>
      </div>
    </a>
  );
}

/**
 * ArticleCard — renders a single article reference under the brief.
 *
 * Layer: interfaces.
 */

import { ArticleDTO } from '@application/dtos/ArticleDTO';

interface Props {
  article: ArticleDTO;
}

export function ArticleCard({ article }: Props) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:shadow-sm"
    >
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
        />
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-brand-700">
          {article.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          <span className="capitalize">{article.category}</span> · {article.sourceName} ·{' '}
          {article.relativeAge}
        </p>
      </div>
    </a>
  );
}

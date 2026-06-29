/**
 * BriefView — renders the AI summary plus the source articles.
 *
 * Layer: interfaces.
 */

import { BriefDTO } from '@application/dtos/BriefDTO';
import { renderMarkdown } from '../lib/markdown';
import { ArticleCard } from './ArticleCard';

interface Props {
  brief: BriefDTO;
}

export function BriefView({ brief }: Props) {
  const date = new Date(brief.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="space-y-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          Your Morning Brief
        </p>
        <h1 className="mt-1 font-serif text-3xl text-slate-900">{date}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {brief.categories.map((c) => c[0].toUpperCase() + c.slice(1)).join(' · ')}
        </p>
      </header>

      {brief.summary && (
        <section
          className="prose-sm max-w-none"
          // Summary is produced by Claude and rendered through a
          // restricted, HTML-escaping markdown renderer.
          dangerouslySetInnerHTML={{ __html: renderMarkdown(brief.summary) }}
        />
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Sources ({brief.articles.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {brief.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </article>
  );
}

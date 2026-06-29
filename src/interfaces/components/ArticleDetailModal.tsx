/**
 * ArticleDetailModal — overlay that shows full article metadata and an
 * on-demand "Summarize with AI" panel powered by Claude.
 *
 * The modal uses fixed positioning (z-50) so it renders above all content.
 * Focus is trapped via keyboard; pressing Escape or clicking the backdrop
 * closes it. Body scroll is locked while the modal is open.
 *
 * Props:
 *   article  — the ArticleDTO to display (null = modal is closed)
 *   onClose  — called when the user dismisses the modal
 *
 * Layer: interfaces.
 */

import { useEffect, useRef } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useArticleSummary } from '../hooks/useArticleSummary';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';
import { cn } from '../lib/cn';

interface Props {
  article: ArticleDTO | null;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: Props) {
  const { status, summary, error, summarise, reset } = useArticleSummary();

  // Close on Escape key
  useEffect(() => {
    if (!article) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [article, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [article]);

  // Reset summary state whenever a different article is opened
  const prevArticleId = useRef<string | null>(null);
  useEffect(() => {
    if (article && article.id !== prevArticleId.current) {
      reset();
      prevArticleId.current = article.id;
    }
    if (!article) {
      prevArticleId.current = null;
    }
  }, [article, reset]);

  if (!article) return null;

  const handleSummarise = () => {
    summarise({ title: article.title, description: article.description });
  };

  const isLoading    = status === 'loading';
  const hasResult    = status === 'success' && summary !== null;
  const hasError     = status === 'error'   && error   !== null;
  const canSummarise = status === 'idle';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div className="min-w-0 flex-1">
            <span className="mb-1.5 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-700">
              {article.category}
            </span>
            <h2 className="text-lg font-bold leading-snug text-slate-900">
              {article.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {article.sourceName} · {article.relativeAge}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Thumbnail */}
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              className="mb-5 h-52 w-full rounded-xl object-cover"
            />
          )}

          {/* Description */}
          {article.description && (
            <p className="mb-6 text-sm leading-relaxed text-slate-700">
              {article.description}
            </p>
          )}

          {/* ── AI Summary panel ────────────────────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base" aria-hidden="true">✨</span>
              <h3 className="text-sm font-semibold text-slate-800">AI Summary</h3>
            </div>

            {/* Idle — primary CTA */}
            {canSummarise && (
              <button
                type="button"
                onClick={handleSummarise}
                className={cn(
                  'rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
                  'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
                )}
              >
                Summarize with AI
              </button>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="py-2">
                <Spinner label="Asking Claude for a summary…" />
              </div>
            )}

            {/* Error state */}
            {hasError && (
              <div>
                <ErrorBanner message={error!} onDismiss={reset} />
                <button
                  type="button"
                  onClick={handleSummarise}
                  className={cn(
                    'mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
                    'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
                  )}
                >
                  Retry summary
                </button>
              </div>
            )}

            {/* Success — show summary text */}
            {hasResult && (
              <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus:underline"
          >
            Close
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
              'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
            )}
          >
            Read full article ↗
          </a>
        </div>
      </div>
    </div>
  );
}

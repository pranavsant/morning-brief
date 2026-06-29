/**
 * ArticleDetailModal — overlay that shows full article metadata and two
 * on-demand AI panels powered by Claude:
 *   • "AI Summary"       — 2–3 sentence plain-English summary
 *   • "Related Context"  — 3–5 bullet points of background context
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

import { useEffect, useRef, useState } from 'react';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { useArticleSummary } from '../hooks/useArticleSummary';
import { useArticleContext } from '../hooks/useArticleContext';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';
import { cn } from '../lib/cn';

interface Props {
  article: ArticleDTO | null;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: Props) {
  const { status: sumStatus, summary, error: sumError, summarise, reset: resetSummary } = useArticleSummary();
  const { status: ctxStatus, bullets, error: ctxError, getContext, reset: resetContext } = useArticleContext();

  // Whether the Related Context panel is expanded.
  const [contextOpen, setContextOpen] = useState(false);

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

  // Reset both AI panels and collapse context whenever a different article opens.
  const prevArticleId = useRef<string | null>(null);
  useEffect(() => {
    if (article && article.id !== prevArticleId.current) {
      resetSummary();
      resetContext();
      setContextOpen(false);
      prevArticleId.current = article.id;
    }
    if (!article) {
      prevArticleId.current = null;
    }
  }, [article, resetSummary, resetContext]);

  if (!article) return null;

  const handleSummarise = () => {
    summarise({ title: article.title, description: article.description });
  };

  const handleGetContext = () => {
    getContext({ title: article.title, description: article.description });
  };

  const handleToggleContext = () => {
    const nextOpen = !contextOpen;
    setContextOpen(nextOpen);
    // Auto-fetch context the first time the panel is opened.
    if (nextOpen && ctxStatus === 'idle') {
      getContext({ title: article.title, description: article.description });
    }
  };

  // Summary panel states
  const sumLoading    = sumStatus === 'loading';
  const sumHasResult  = sumStatus === 'success' && summary !== null;
  const sumHasError   = sumStatus === 'error'   && sumError !== null;
  const sumCanTrigger = sumStatus === 'idle';

  // Context panel states
  const ctxLoading    = ctxStatus === 'loading';
  const ctxHasResult  = ctxStatus === 'success' && bullets.length > 0;
  const ctxHasError   = ctxStatus === 'error'   && ctxError !== null;

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
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base" aria-hidden="true">✨</span>
              <h3 className="text-sm font-semibold text-slate-800">AI Summary</h3>
            </div>

            {/* Idle — primary CTA */}
            {sumCanTrigger && (
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
            {sumLoading && (
              <div className="py-2">
                <Spinner label="Asking Claude for a summary…" />
              </div>
            )}

            {/* Error state */}
            {sumHasError && (
              <div>
                <ErrorBanner message={sumError!} onDismiss={resetSummary} />
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
            {sumHasResult && (
              <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
            )}
          </div>

          {/* ── Related Context panel ────────────────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            {/* Toggle header */}
            <button
              type="button"
              onClick={handleToggleContext}
              className="flex w-full items-center justify-between gap-2 text-left focus:outline-none focus:ring-2 focus:ring-brand-400 rounded-md"
              aria-expanded={contextOpen}
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">🔍</span>
                <h3 className="text-sm font-semibold text-slate-800">Related Context</h3>
              </div>
              {/* Chevron rotates when open */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200',
                  contextOpen && 'rotate-180',
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Collapsible body */}
            {contextOpen && (
              <div className="mt-4">
                {/* Loading state */}
                {ctxLoading && (
                  <div className="py-2">
                    <Spinner label="Claude is gathering context…" />
                  </div>
                )}

                {/* Error state */}
                {ctxHasError && (
                  <div>
                    <ErrorBanner message={ctxError!} onDismiss={resetContext} />
                    <button
                      type="button"
                      onClick={handleGetContext}
                      className={cn(
                        'mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
                        'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
                      )}
                    >
                      Retry context
                    </button>
                  </div>
                )}

                {/* Success — bullet list */}
                {ctxHasResult && (
                  <ul className="space-y-2" aria-label="Background context">
                    {bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm leading-relaxed text-slate-700"
                      >
                        <span
                          className="mt-0.5 flex-shrink-0 text-brand-500"
                          aria-hidden="true"
                        >
                          •
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Fallback: dismissed error with no bullets yet — offer manual trigger */}
                {!ctxLoading && !ctxHasResult && !ctxHasError && (
                  <button
                    type="button"
                    onClick={handleGetContext}
                    className={cn(
                      'rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
                      'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
                    )}
                  >
                    Get context
                  </button>
                )}
              </div>
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

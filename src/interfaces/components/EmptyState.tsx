/**
 * EmptyState — reusable empty / zero-data placeholder.
 *
 * Renders a centred block with an illustration (SVG or emoji), a title,
 * a supporting description, and up to two CTAs (primary button + secondary
 * text link). All content is optional so callers can compose exactly what
 * they need.
 *
 * Usage:
 *   <EmptyState
 *     illustration={<SearchIllustration />}
 *     title="No results found"
 *     description="Try different keywords or browse the top headlines."
 *     primaryAction={{ label: 'Clear search', onClick: clearSearch }}
 *     secondaryAction={{ label: 'Go to home', onClick: () => navigate('/') }}
 *   />
 *
 * Layer: interfaces.
 */

import { ReactNode } from 'react';

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  /** An SVG element or emoji span rendered above the title. */
  illustration?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  /** Extra vertical padding class. Defaults to "py-20". */
  paddingClass?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  paddingClass = 'py-20',
}: Props) {
  return (
    <div className={`flex flex-col items-center text-center ${paddingClass}`}>
      {illustration && (
        <div className="mb-5 text-slate-300 dark:text-slate-600" aria-hidden="true">
          {illustration}
        </div>
      )}

      <p className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</p>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:underline dark:text-brand-400 dark:hover:text-brand-300"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

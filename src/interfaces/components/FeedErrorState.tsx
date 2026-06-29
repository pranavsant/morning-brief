/**
 * FeedErrorState — full-section error display for the news feed.
 *
 * Shown when the initial feed or search request fails and there are no
 * cached articles to display. Provides a prominent retry CTA and an
 * optional secondary action (e.g. "Clear search").
 *
 * Distinct from ErrorBanner which is an inline strip. FeedErrorState is
 * a centred, larger treatment appropriate for the main content area.
 *
 * Props:
 *   message         — human-readable error description
 *   onRetry         — primary CTA callback (always shown)
 *   retryLabel      — label for the retry button (default: "Try again")
 *   secondaryLabel  — optional label for a secondary text link
 *   onSecondary     — callback for the secondary link
 *
 * Layer: interfaces.
 */

interface Props {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** Disconnected-plug SVG illustration */
function ErrorIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      {/* Cloud shape */}
      <path
        d="M58 38c0-9.94-8.06-18-18-18a17.97 17.97 0 0 0-16.57 11.02A12 12 0 0 0 26 54h32a12 12 0 0 0 0-24z"
        className="fill-slate-200 dark:fill-slate-700"
      />
      {/* Lightning bolt / error mark */}
      <path
        d="M41 32l-5 10h4l-2 8 7-12h-4l2-6h-2z"
        className="fill-red-400 dark:fill-red-500"
      />
    </svg>
  );
}

export function FeedErrorState({
  message,
  onRetry,
  retryLabel = 'Try again',
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center py-20 text-center"
    >
      {/* Illustration */}
      <div className="mb-5" aria-hidden="true">
        <ErrorIllustration />
      </div>

      {/* Heading */}
      <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
        Something went wrong
      </p>

      {/* Detail message */}
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {retryLabel}
        </button>

        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="text-sm font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

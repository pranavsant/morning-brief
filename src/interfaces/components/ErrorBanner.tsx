/**
 * ErrorBanner — inline error message with optional dismiss and retry actions.
 *
 * Used inside panels (AI Summary, Related Context) as well as page-level
 * error states. Styled with a red/rose palette to differentiate it from
 * neutral UI surfaces.
 *
 * Props:
 *   message   — human-readable error text to display
 *   onDismiss — optional callback; when provided a "Dismiss" button appears
 *   onRetry   — optional callback; when provided a "Try again" button appears
 *
 * Layer: interfaces.
 */

interface Props {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      </svg>

      {/* Message */}
      <span className="flex-1 leading-relaxed">{message}</span>

      {/* Action buttons */}
      {(onRetry || onDismiss) && (
        <div className="flex flex-shrink-0 items-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium text-red-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-red-400"
            >
              Try again
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="font-medium text-red-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-red-400"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

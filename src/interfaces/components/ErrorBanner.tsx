/**
 * ErrorBanner — surfaces an error message to the user.
 *
 * Layer: interfaces.
 */

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="font-medium text-red-600 hover:text-red-800"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}

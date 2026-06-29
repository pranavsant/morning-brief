/**
 * Spinner — loading indicator with a contextual label.
 *
 * When `inline` is true the spinner renders horizontally and without
 * the vertical padding — useful inside buttons.
 *
 * Layer: interfaces.
 */

import { cn } from '../lib/cn';

interface Props {
  label?: string;
  /** Render inline (horizontal, no outer padding). Useful inside buttons. */
  inline?: boolean;
}

export function Spinner({ label = 'Loading…', inline = false }: Props) {
  if (inline) {
    return (
      <span className="flex items-center gap-2" role="status" aria-label={label}>
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        'text-slate-500 dark:text-slate-400',
      )}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-400"
        role="status"
        aria-label="loading"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/**
 * BriefPage — dedicated "Your Brief" view.
 *
 * Lets the user pick categories, generate a Claude-powered morning
 * digest from today's top headlines, and regenerate it on demand.
 *
 * The output is a structured markdown brief produced by Claude, with
 * H2-level sections per category (e.g. ## Technology, ## Business)
 * rendered through BriefView.
 *
 * No business logic here — all state and side-effects are delegated to
 * the useMorningBrief hook.
 *
 * Layer: interfaces.
 */

import { useMorningBrief } from '../hooks/useMorningBrief';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { CategoryPicker, CATEGORIES } from '../components/CategoryPicker';
import { BriefView } from '../components/BriefView';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/cn';

function BriefIdleIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      {/* Coffee cup body */}
      <path
        d="M16 32h40l-4 28H20L16 32z"
        className="fill-current opacity-20 stroke-current"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Cup handle */}
      <path
        d="M56 38h6a6 6 0 0 1 0 12h-6"
        className="stroke-current"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Steam lines */}
      <path d="M28 24c0-4 4-4 4-8" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 24c0-4 4-4 4-8" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 24c0-4 4-4 4-8" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BriefPage() {
  const { brief, loading, error, generate, reset } = useMorningBrief();

  // Read from and write to persisted user preferences.
  const { categories: selected, toggleCategory: toggle } = useUserPreferences();

  const handleGenerate = () => {
    void generate({ categories: selected, maxArticlesPerCategory: 5, country: 'us' });
  };

  const handleRegenerate = () => {
    reset();
    void generate({ categories: selected, maxArticlesPerCategory: 5, country: 'us' });
  };

  const hasBrief = brief !== null && !loading;

  return (
    <main className="mx-auto max-w-screen-lg px-4 py-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100">
          ☕ Your Morning Brief
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Select the topics that matter to you. Claude will read today's top headlines and craft a
          crisp, structured digest — grouped by category.
        </p>
      </header>

      {/* ── Configuration panel ─────────────────────────────────────────── */}
      <section
        aria-label="Brief configuration"
        className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Choose your topics
        </h2>

        <CategoryPicker selected={selected} onToggle={toggle} disabled={loading} />

        {/* Category helper text */}
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          {selected.length === 0
            ? 'Select at least one topic to continue.'
            : `${selected.length} of ${CATEGORIES.length} topic${selected.length !== 1 ? 's' : ''} selected`}
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!hasBrief ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || selected.length === 0}
              className={cn(
                'rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition',
                'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
                (loading || selected.length === 0) && 'cursor-not-allowed opacity-50',
              )}
            >
              {loading ? 'Generating…' : 'Generate my brief'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading || selected.length === 0}
                className={cn(
                  'rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition',
                  'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
                  (loading || selected.length === 0) && 'cursor-not-allowed opacity-50',
                )}
              >
                ↺ Regenerate
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus:underline dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Feedback states ──────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6">
          <ErrorBanner
            message={error}
            onRetry={handleGenerate}
            onDismiss={reset}
          />
        </div>
      )}

      {loading && (
        <Spinner label="Fetching today's top headlines and asking Claude to brief you…" />
      )}

      {/* ── Brief output ─────────────────────────────────────────────────── */}
      {hasBrief && (
        <section
          aria-label="Morning brief"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <BriefView brief={brief} />
        </section>
      )}

      {/* ── Empty / idle state ──────────────────────────────────────────────── */}
      {!brief && !loading && !error && (
        selected.length > 0 ? (
          <EmptyState
            illustration={<BriefIdleIllustration />}
            title="Your brief will appear here"
            description="Click Generate my brief to get a Claude-powered digest of today's top headlines."
            primaryAction={{ label: 'Generate my brief', onClick: handleGenerate }}
            paddingClass="py-20"
          />
        ) : (
          <EmptyState
            illustration={<BriefIdleIllustration />}
            title="Your brief will appear here"
            description="Select at least one topic above, then click Generate my brief."
            paddingClass="py-20"
          />
        )
      )}
    </main>
  );
}

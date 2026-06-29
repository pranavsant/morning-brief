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
import { cn } from '../lib/cn';

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
        <h1 className="font-serif text-4xl font-bold text-slate-900">☕ Your Morning Brief</h1>
        <p className="mt-2 text-slate-500">
          Select the topics that matter to you. Claude will read today's top headlines and craft a
          crisp, structured digest — grouped by category.
        </p>
      </header>

      {/* ── Configuration panel ─────────────────────────────────────────── */}
      <section
        aria-label="Brief configuration"
        className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Choose your topics
        </h2>

        <CategoryPicker selected={selected} onToggle={toggle} disabled={loading} />

        {/* Category helper text */}
        <p className="mt-3 text-xs text-slate-400">
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
                className="text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus:underline"
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
          <ErrorBanner message={error} onDismiss={reset} />
        </div>
      )}

      {loading && (
        <Spinner label="Fetching today's top headlines and asking Claude to brief you…" />
      )}

      {/* ── Brief output ─────────────────────────────────────────────────── */}
      {hasBrief && (
        <section
          aria-label="Morning brief"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <BriefView brief={brief} />
        </section>
      )}

      {/* ── Empty / idle state ──────────────────────────────────────────── */}
      {!brief && !loading && !error && (
        <div className="flex flex-col items-center py-20 text-center text-slate-400">
          <span className="mb-4 text-5xl" aria-hidden="true">📋</span>
          <p className="text-base font-medium text-slate-600">Your brief will appear here.</p>
          <p className="mt-1 text-sm">
            Select topics above and click <em>Generate my brief</em> to get started.
          </p>
        </div>
      )}
    </main>
  );
}

/**
 * HomePage — main page: pick categories, generate, and view the brief.
 *
 * Pure presentation + orchestration through the useMorningBrief hook.
 * No business logic, no infrastructure imports.
 *
 * Layer: interfaces.
 */

import { useState } from 'react';
import { useMorningBrief } from '../hooks/useMorningBrief';
import { CategoryPicker } from '../components/CategoryPicker';
import { BriefView } from '../components/BriefView';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { cn } from '../lib/cn';

const DEFAULT_CATEGORIES = ['technology', 'business', 'science'];

export function HomePage() {
  const { brief, loading, error, generate, reset } = useMorningBrief();
  const [selected, setSelected] = useState<string[]>(DEFAULT_CATEGORIES);

  const toggleCategory = (category: string) => {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleGenerate = () => {
    void generate({ categories: selected, maxArticlesPerCategory: 5, country: 'us' });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-slate-900">☕ Morning Brief</h1>
        <p className="mt-2 text-slate-600">
          Your day, summarised by Claude. Pick what matters and get a crisp digest.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Choose your topics
        </h2>
        <CategoryPicker selected={selected} onToggle={toggleCategory} disabled={loading} />

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={cn(
              'rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition',
              'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
              (loading || selected.length === 0) && 'cursor-not-allowed opacity-50',
            )}
          >
            {loading ? 'Generating…' : 'Generate my brief'}
          </button>
          {brief && !loading && (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <div className="mt-8">
        {error && <ErrorBanner message={error} />}
        {loading && <Spinner label="Fetching headlines and asking Claude…" />}
        {!loading && brief && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <BriefView brief={brief} />
          </div>
        )}
        {!loading && !brief && !error && (
          <p className="mt-10 text-center text-sm text-slate-400">
            Select your topics above and generate your first brief.
          </p>
        )}
      </div>
    </div>
  );
}

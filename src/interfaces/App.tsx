/**
 * App — root React component / router.
 *
 * Layer: interfaces.
 */

import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HomePage />
      <footer className="py-8 text-center text-xs text-slate-400">
        Morning Brief · Built with React, Tailwind, NewsAPI &amp; Claude · Clean Architecture
      </footer>
    </div>
  );
}

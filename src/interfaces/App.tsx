/**
 * App — root React component / router.
 *
 * Wraps the application in a BrowserRouter so that any page or hook
 * can use React Router's useSearchParams / useNavigate APIs.
 *
 * Layer: interfaces.
 */

import { BrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <HomePage />
        <footer className="py-8 text-center text-xs text-slate-400">
          Morning Brief · Built with React, Tailwind, NewsAPI &amp; Claude · Clean Architecture
        </footer>
      </div>
    </BrowserRouter>
  );
}

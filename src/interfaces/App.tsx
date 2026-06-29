/**
 * App — root React component / router.
 *
 * Wraps the application in a BrowserRouter so that any page or hook
 * can use React Router's useSearchParams / useNavigate APIs.
 *
 * Two top-level routes are defined:
 *   /        → HomePage  (live news feed with search & category filter)
 *   /brief   → BriefPage (dedicated "Your Brief" AI digest view)
 *
 * Layer: interfaces.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { BriefPage } from './pages/BriefPage';
import { SettingsPage } from './pages/SettingsPage';
import { SavedPage } from './pages/SavedPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brief" element={<BriefPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/saved" element={<SavedPage />} />
        </Routes>
        <footer className="py-8 text-center text-xs text-slate-400">
          Morning Brief · Built with React, Tailwind, NewsAPI &amp; Claude · Clean Architecture
        </footer>
      </div>
    </BrowserRouter>
  );
}

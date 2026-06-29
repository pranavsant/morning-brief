/**
 * App — root React component / router.
 *
 * Wraps the application in a BrowserRouter so that any page or hook
 * can use React Router's useSearchParams / useNavigate APIs.
 *
 * DarkModeProvider is mounted at the very top so the `dark` class is
 * applied to <html> before the first paint, and so both the Navbar toggle
 * and the SettingsPage section share the same state instance.
 *
 * The AppLayout component provides the persistent app shell:
 *   • Sticky header with logo, desktop navigation links, and dark-mode toggle
 *   • Fixed mobile bottom navigation bar
 *   • Consistent content area with safe bottom padding on mobile
 *
 * Four top-level routes are defined:
 *   /         → HomePage     (live news feed with search & category filter)
 *   /brief    → BriefPage    (dedicated "Your Brief" AI digest view)
 *   /saved    → SavedPage    (bookmarked articles)
 *   /settings → SettingsPage (topic preferences + dark mode)
 *
 * Layer: interfaces.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { BriefPage } from './pages/BriefPage';
import { SettingsPage } from './pages/SettingsPage';
import { SavedPage } from './pages/SavedPage';

export function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/brief" element={<BriefPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/saved" element={<SavedPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

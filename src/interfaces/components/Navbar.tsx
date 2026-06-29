/**
 * Navbar — top navigation bar.
 *
 * Links between the live news feed and the dedicated "Your Brief" page.
 * Uses NavLink from react-router-dom for active-state styling.
 *
 * Layer: interfaces.
 */

import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

const NAV_ITEMS = [
  { to: '/',       label: '📰 Feed'       },
  { to: '/brief',  label: '☕ Your Brief'  },
] as const;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <span className="font-serif text-lg font-bold text-slate-900">Morning Brief</span>

        {/* Nav links */}
        <ul className="flex items-center gap-1" role="list">
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition',
                    'focus:outline-none focus:ring-2 focus:ring-brand-400',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

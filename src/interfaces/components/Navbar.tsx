/**
 * Navbar — top navigation bar.
 *
 * Responsive design:
 *  • Desktop (md+): sticky top bar showing logo/wordmark on the left,
 *    all four navigation links in the centre, and a dark-mode toggle on
 *    the right.
 *  • Mobile (<md): sticky top bar showing logo/wordmark and the dark-mode
 *    toggle only. Navigation is handled by the BottomNav component.
 *
 * Uses NavLink from react-router-dom for automatic active-state styling.
 * Dark-mode state is read from DarkModeContext (set once in App.tsx).
 *
 * Layer: interfaces.
 */

import { NavLink } from 'react-router-dom';
import { useDarkModeContext } from '../context/DarkModeContext';
import { cn } from '../lib/cn';

const NAV_ITEMS = [
  { to: '/',         label: 'Feed'        },
  { to: '/brief',    label: 'Your Brief'  },
  { to: '/saved',    label: 'Saved'       },
  { to: '/settings', label: 'Preferences' },
] as const;

// ── Logo mark (inline SVG matching public/favicon.svg) ────────────────────────

function LogoMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="28"
      height="28"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#ee8418" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="34"
      >
        ☕
      </text>
    </svg>
  );
}

// ── Sun icon (shown in dark mode — click to switch to light) ──────────────────

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

// ── Moon icon (shown in light mode — click to switch to dark) ─────────────────

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Dark mode toggle button ───────────────────────────────────────────────────

function DarkModeToggle() {
  const { isDark, toggle } = useDarkModeContext();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn(
        'rounded-lg p-2 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      )}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <NavLink
          to="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-md"
          aria-label="Morning Brief — home"
        >
          <LogoMark />
          <span className="font-serif text-lg font-bold text-slate-900 leading-none dark:text-slate-100">
            Morning Brief
          </span>
        </NavLink>

        {/* ── Desktop nav — hidden below md breakpoint ───────────────────── */}
        <nav aria-label="Main navigation">
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Dark mode toggle — always visible ──────────────────────────── */}
        <DarkModeToggle />
      </div>
    </header>
  );
}

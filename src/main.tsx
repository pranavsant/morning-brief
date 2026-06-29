/**
 * main.tsx — application bootstrap / composition entry point.
 *
 * This file sits at the project root (not inside an architecture layer).
 * It is the single seam where the infrastructure composition root meets
 * the interfaces layer: it builds the use case registry and hands it to
 * the interfaces UseCaseProvider via dependency injection.
 *
 * Because the wiring lives here, the interfaces layer itself never
 * imports infrastructure — it only depends on the IUseCaseRegistry port.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import { buildUseCaseRegistry } from '@infrastructure/config/CompositionRoot';
import { UseCaseProvider } from '@interfaces/di/UseCaseContext';
import { App } from '@interfaces/App';
import { ErrorBanner } from '@interfaces/components/ErrorBanner';

import './index.css';

function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element #root not found.');

  const root = ReactDOM.createRoot(rootElement);

  try {
    const registry = buildUseCaseRegistry();
    root.render(
      <React.StrictMode>
        <UseCaseProvider registry={registry}>
          <App />
        </UseCaseProvider>
      </React.StrictMode>,
    );
  } catch (err) {
    // Most likely a missing env var — show a friendly configuration error.
    const message = err instanceof Error ? err.message : String(err);
    root.render(
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-4 font-serif text-2xl font-bold text-slate-900">
          ☕ Morning Brief — Configuration required
        </h1>
        <ErrorBanner message={message} />
        <p className="mt-4 text-sm text-slate-600">
          Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to{' '}
          <code className="rounded bg-slate-100 px-1">.env.local</code> and add your API keys,
          then restart the dev server.
        </p>
      </div>,
    );
  }
}

bootstrap();

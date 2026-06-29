/**
 * UseCaseContext — React dependency-injection boundary.
 *
 * The use case registry (built by the infrastructure composition root)
 * is injected at the application's outermost boot file and provided to
 * the component tree here. Components consume a ready BriefController
 * through the useBriefController() hook — they never import use cases,
 * domain, or infrastructure directly.
 *
 * Layer: interfaces.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { BriefController } from '../controllers/BriefController';
import { FeedController } from '../controllers/FeedController';

// ── Brief controller context ──────────────────────────────────────────────────

const ControllerContext = createContext<BriefController | null>(null);

// ── Feed controller context ───────────────────────────────────────────────────

const FeedControllerContext = createContext<FeedController | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface ProviderProps {
  registry: IUseCaseRegistry;
  children: ReactNode;
}

export function UseCaseProvider({ registry, children }: ProviderProps) {
  const briefController = useMemo(() => new BriefController(registry), [registry]);
  const feedController  = useMemo(() => new FeedController(registry),  [registry]);
  return (
    <ControllerContext.Provider value={briefController}>
      <FeedControllerContext.Provider value={feedController}>
        {children}
      </FeedControllerContext.Provider>
    </ControllerContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBriefController(): BriefController {
  const controller = useContext(ControllerContext);
  if (!controller) {
    throw new Error('useBriefController must be used within a <UseCaseProvider>.');
  }
  return controller;
}

export function useFeedController(): FeedController {
  const controller = useContext(FeedControllerContext);
  if (!controller) {
    throw new Error('useFeedController must be used within a <UseCaseProvider>.');
  }
  return controller;
}

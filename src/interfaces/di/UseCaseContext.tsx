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

const ControllerContext = createContext<BriefController | null>(null);

interface ProviderProps {
  registry: IUseCaseRegistry;
  children: ReactNode;
}

export function UseCaseProvider({ registry, children }: ProviderProps) {
  const controller = useMemo(() => new BriefController(registry), [registry]);
  return (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
}

export function useBriefController(): BriefController {
  const controller = useContext(ControllerContext);
  if (!controller) {
    throw new Error('useBriefController must be used within a <UseCaseProvider>.');
  }
  return controller;
}

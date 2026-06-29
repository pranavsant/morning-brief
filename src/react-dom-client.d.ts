/**
 * Minimal ambient declaration for 'react-dom/client' so TypeScript is happy
 * when @types/react-dom is not installed in this environment.
 *
 * This file can be deleted once `npm i --save-dev @types/react-dom` works.
 */
declare module 'react-dom/client' {
  import type { ReactNode } from 'react';

  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }

  export interface RootOptions {
    onRecoverableError?: (error: unknown) => void;
    identifierPrefix?: string;
  }

  export function createRoot(container: Element | DocumentFragment, options?: RootOptions): Root;
  export function hydrateRoot(
    container: Element | Document,
    initialChildren: ReactNode,
    options?: RootOptions,
  ): Root;
}

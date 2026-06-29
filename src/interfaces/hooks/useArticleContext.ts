/**
 * useArticleContext — React hook for on-demand AI-powered "Related Context".
 *
 * Exposes a `getContext(input)` trigger plus the standard loading / error /
 * result state tuple. The hook is idle until `getContext` is called; calling
 * it again on a different article resets state and fires a fresh request.
 *
 * Layer: interfaces.
 */

import { useCallback, useState } from 'react';
import { ArticleContextInput } from '@application/use-cases/GetArticleContextUseCase';
import { useSummariseController } from '../di/UseCaseContext';

type ContextStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseArticleContextState {
  status: ContextStatus;
  /** 3–5 bullet strings, available when status === 'success'. */
  bullets: string[];
  error: string | null;
  /** Trigger context generation for the given article. */
  getContext: (input: ArticleContextInput) => void;
  /** Reset the hook back to its idle state. */
  reset: () => void;
}

export function useArticleContext(): UseArticleContextState {
  const controller = useSummariseController();

  const [status,  setStatus]  = useState<ContextStatus>('idle');
  const [bullets, setBullets] = useState<string[]>([]);
  const [error,   setError]   = useState<string | null>(null);

  const getContext = useCallback(
    (input: ArticleContextInput) => {
      // Reset any previous result and start loading.
      setStatus('loading');
      setBullets([]);
      setError(null);

      void (async () => {
        const result = await controller.getContext(input);
        if (result.ok) {
          setBullets(result.data.bullets);
          setStatus('success');
        } else {
          setError(result.error);
          setStatus('error');
        }
      })();
    },
    [controller],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setBullets([]);
    setError(null);
  }, []);

  return { status, bullets, error, getContext, reset };
}

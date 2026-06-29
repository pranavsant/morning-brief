/**
 * useArticleSummary — React hook for on-demand single-article AI summarisation.
 *
 * Exposes a `summarise(input)` trigger plus the standard loading / error /
 * result state tuple. The hook is idle until `summarise` is called;
 * calling it again on a different article resets state and fires a fresh request.
 *
 * Layer: interfaces.
 */

import { useCallback, useState } from 'react';
import { ArticleSummaryInput } from '@application/use-cases/SummariseArticleUseCase';
import { useSummariseController } from '../di/UseCaseContext';

type SummaryStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseArticleSummaryState {
  status: SummaryStatus;
  summary: string | null;
  error: string | null;
  /** Trigger the summarisation for the given article. */
  summarise: (input: ArticleSummaryInput) => void;
  /** Reset the hook back to its idle state. */
  reset: () => void;
}

export function useArticleSummary(): UseArticleSummaryState {
  const controller = useSummariseController();

  const [status,  setStatus]  = useState<SummaryStatus>('idle');
  const [summary, setSummary] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const summarise = useCallback(
    (input: ArticleSummaryInput) => {
      // Reset any previous result and start loading.
      setStatus('loading');
      setSummary(null);
      setError(null);

      void (async () => {
        const result = await controller.summarise(input);
        if (result.ok) {
          setSummary(result.data.summary);
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
    setSummary(null);
    setError(null);
  }, []);

  return { status, summary, error, summarise, reset };
}

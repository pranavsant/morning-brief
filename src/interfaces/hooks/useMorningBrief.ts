/**
 * useMorningBrief — React hook encapsulating brief-generation state.
 *
 * Keeps components dumb: they call generate() and read loading/error/brief.
 *
 * Layer: interfaces.
 */

import { useCallback, useState } from 'react';
import { BriefDTO } from '@application/dtos/BriefDTO';
import { GenerateMorningBriefInput } from '@application/use-cases/GenerateMorningBriefUseCase';
import { useBriefController } from '../di/UseCaseContext';

interface UseMorningBriefState {
  brief: BriefDTO | null;
  loading: boolean;
  error: string | null;
  generate: (input: GenerateMorningBriefInput) => Promise<void>;
  reset: () => void;
}

export function useMorningBrief(): UseMorningBriefState {
  const controller = useBriefController();
  const [brief, setBrief] = useState<BriefDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input: GenerateMorningBriefInput) => {
      setLoading(true);
      setError(null);
      const result = await controller.generate(input);
      if (result.ok) {
        setBrief(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    [controller],
  );

  const reset = useCallback(() => {
    setBrief(null);
    setError(null);
  }, []);

  return { brief, loading, error, generate, reset };
}

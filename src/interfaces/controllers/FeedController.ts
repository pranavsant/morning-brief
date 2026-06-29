/**
 * FeedController — interface adapter for the news feed.
 *
 * Thin orchestration layer between the React feed UI and the
 * FetchTopHeadlinesUseCase. Translates application errors into a
 * UI-friendly result shape, identical to the pattern used by BriefController.
 *
 * Depends ONLY on the application layer (IUseCaseRegistry + DTOs).
 * No domain or infrastructure imports.
 *
 * Layer: interfaces.
 */

import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { FetchTopHeadlinesInput, FetchTopHeadlinesResult } from '@application/use-cases/FetchTopHeadlinesUseCase';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ControllerResult } from './BriefController';

export class FeedController {
  constructor(private readonly useCases: IUseCaseRegistry) {}

  async loadFeed(input: FetchTopHeadlinesInput = {}): Promise<ControllerResult<FetchTopHeadlinesResult>> {
    try {
      const data = await this.useCases.fetchTopHeadlines.execute(input);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: this.describeError(err) };
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof ApplicationError) return err.message;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred while loading the feed.';
  }
}

/**
 * SummariseController — interface adapter for single-article AI summarisation.
 *
 * Thin orchestration layer between the article detail UI and
 * SummariseArticleUseCase. Translates application errors into a
 * UI-friendly result shape, following the same ControllerResult
 * pattern used across all other controllers.
 *
 * Depends ONLY on the application layer (IUseCaseRegistry + DTOs).
 * No domain or infrastructure imports.
 *
 * Layer: interfaces.
 */

import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { ArticleSummaryInput, SummariseArticleResult } from '@application/use-cases/SummariseArticleUseCase';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ControllerResult } from './BriefController';

export class SummariseController {
  constructor(private readonly useCases: IUseCaseRegistry) {}

  async summarise(input: ArticleSummaryInput): Promise<ControllerResult<SummariseArticleResult>> {
    try {
      const data = await this.useCases.summariseArticle.execute(input);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: this.describeError(err) };
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof ApplicationError) return err.message;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred while generating the summary.';
  }
}

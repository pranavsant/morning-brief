/**
 * SearchController — interface adapter for article search.
 *
 * Thin orchestration layer between the React search UI and the
 * SearchArticlesUseCase. Follows the same pattern as FeedController.
 *
 * Layer: interfaces.
 */

import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { ArticleDTO } from '@application/dtos/ArticleDTO';
import { SearchArticlesInput } from '@application/use-cases/SearchArticlesUseCase';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ControllerResult } from './BriefController';

export class SearchController {
  constructor(private readonly useCases: IUseCaseRegistry) {}

  async search(input: SearchArticlesInput): Promise<ControllerResult<ArticleDTO[]>> {
    try {
      const data = await this.useCases.searchArticles.execute(input);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: this.describeError(err) };
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof ApplicationError) return err.message;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred while searching.';
  }
}

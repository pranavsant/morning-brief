/**
 * GenerateMorningBriefUseCase — primary use case.
 *
 * Orchestrates:
 *  1. Validate and parse user preferences.
 *  2. Fetch top-headline articles via the article repository (port).
 *  3. Assemble a Brief aggregate via the domain service.
 *  4. Request AI summarisation via the summarisation service (port).
 *  5. Persist the finished Brief via the brief repository (port).
 *  6. Return a BriefDTO.
 *
 * No infrastructure knowledge lives here — only interfaces injected
 * through the constructor.
 *
 * Layer: application.
 */

import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { IBriefRepository } from '@domain/repositories/IBriefRepository';
import { ISummarisationService } from '@domain/services/ISummarisationService';
import { BriefAssemblyService } from '@domain/services/BriefAssemblyService';
import { Category } from '@domain/value-objects/Category';
import { UserPreferences } from '@domain/entities/UserPreferences';

import { BriefDTO } from '../dtos/BriefDTO';
import { BriefMapper } from '../mappers/BriefMapper';
import { ApplicationError } from '../errors/ApplicationError';

export interface GenerateMorningBriefInput {
  /** Array of valid CategoryValue strings, e.g. ["technology", "science"]. */
  readonly categories: string[];
  readonly maxArticlesPerCategory?: number;
  /** ISO 3166-1 alpha-2 country code for headlines, e.g. "us". */
  readonly country?: string;
}

export class GenerateMorningBriefUseCase {
  constructor(
    private readonly articleRepository: IArticleRepository,
    private readonly briefRepository: IBriefRepository,
    private readonly summarisationService: ISummarisationService,
    private readonly briefAssemblyService: BriefAssemblyService,
  ) {}

  async execute(input: GenerateMorningBriefInput): Promise<BriefDTO> {
    // 1. Parse preferences (domain validates invariants)
    let preferences: UserPreferences;
    try {
      const categories = input.categories.map((c) => new Category(c));
      preferences = new UserPreferences(
        categories,
        input.maxArticlesPerCategory ?? 5,
      );
    } catch (err) {
      throw new ApplicationError(
        `Invalid preferences: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 2. Fetch articles
    let resultPage;
    try {
      resultPage = await this.articleRepository.fetchTopHeadlines({
        categories:     preferences.categories,
        maxPerCategory: preferences.maxArticlesPerCategory,
        country:        input.country ?? 'us',
      });
    } catch (err) {
      throw new ApplicationError(
        `Failed to fetch articles: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const articles = resultPage.articles;

    if (articles.length === 0) {
      throw new ApplicationError(
        'No articles were returned for the requested categories. Try different categories or check your NewsAPI key.',
      );
    }

    // 3. Assemble Brief aggregate
    const brief = this.briefAssemblyService.assemble(
      articles,
      [...preferences.categories],
      preferences.maxArticlesPerCategory,
    );

    // 4. Trigger AI summarisation
    brief.startGeneration();

    let summary: string;
    try {
      summary = await this.summarisationService.summarise(brief);
    } catch (err) {
      brief.failGeneration();
      await this.briefRepository.save(brief);
      throw new ApplicationError(
        `Summarisation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    brief.completeSummary(summary);

    // 5. Persist
    await this.briefRepository.save(brief);

    // 6. Return DTO
    return BriefMapper.toDTO(brief);
  }
}

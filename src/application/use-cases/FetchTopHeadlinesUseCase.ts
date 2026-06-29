/**
 * FetchTopHeadlinesUseCase — fetches top-headline articles for a given set
 * of categories and returns them as a flat list of ArticleDTOs.
 *
 * Used by the news-feed page to populate the initial article grid without
 * triggering AI summarisation.
 *
 * Layer: application.
 */

import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { Category, VALID_CATEGORIES } from '@domain/value-objects/Category';

import { ArticleDTO } from '../dtos/ArticleDTO';
import { ArticleMapper } from '../mappers/ArticleMapper';
import { ApplicationError } from '../errors/ApplicationError';

export interface FetchTopHeadlinesInput {
  /**
   * Category strings to fetch. Defaults to all valid categories when omitted.
   * Invalid values are silently skipped after logging a warning.
   */
  readonly categories?: string[];
  /**
   * Maximum number of articles to request per category.
   * Defaults to 5, giving ≥ 20 total across 5+ categories.
   */
  readonly maxPerCategory?: number;
  /** ISO 3166-1 alpha-2 country code. Defaults to "us". */
  readonly country?: string;
}

export class FetchTopHeadlinesUseCase {
  constructor(private readonly articleRepository: IArticleRepository) {}

  async execute(input: FetchTopHeadlinesInput = {}): Promise<ArticleDTO[]> {
    const categoryStrings: string[] =
      input.categories && input.categories.length > 0
        ? input.categories
        : [...VALID_CATEGORIES];

    // Parse into domain value objects, dropping any invalid strings.
    const categories: Category[] = [];
    for (const raw of categoryStrings) {
      try {
        categories.push(new Category(raw));
      } catch {
        // Skip invalid category values — don't crash the whole feed.
        console.warn(`FetchTopHeadlinesUseCase: skipping invalid category "${raw}".`);
      }
    }

    if (categories.length === 0) {
      throw new ApplicationError('No valid categories provided for the feed.');
    }

    let articles;
    try {
      articles = await this.articleRepository.fetchTopHeadlines({
        categories,
        maxPerCategory: input.maxPerCategory ?? 5,
        country: input.country ?? 'us',
      });
    } catch (err) {
      throw new ApplicationError(
        `Failed to fetch top headlines: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return ArticleMapper.toDTOList(articles);
  }
}

/**
 * SearchArticlesUseCase — searches articles using a free-text query.
 *
 * Delegates to the article repository's searchArticles method, which
 * wraps the NewsAPI /v2/everything endpoint. Returns a flat list of
 * ArticleDTOs ready for the interfaces layer.
 *
 * Layer: application.
 */

import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { ArticleDTO } from '../dtos/ArticleDTO';
import { ArticleMapper } from '../mappers/ArticleMapper';
import { ApplicationError } from '../errors/ApplicationError';

export interface SearchArticlesInput {
  /** Free-text search query. Must be a non-empty string. */
  readonly q: string;
  /** Maximum number of results to return. Defaults to 20. */
  readonly pageSize?: number;
  /** Sort order. Defaults to "relevancy". */
  readonly sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

export class SearchArticlesUseCase {
  constructor(private readonly articleRepository: IArticleRepository) {}

  async execute(input: SearchArticlesInput): Promise<ArticleDTO[]> {
    const query = input.q.trim();

    if (query.length === 0) {
      throw new ApplicationError('Search query must not be empty.');
    }

    let articles;
    try {
      articles = await this.articleRepository.searchArticles({
        q: query,
        pageSize: input.pageSize ?? 20,
        language: 'en',
        sortBy: input.sortBy ?? 'relevancy',
      });
    } catch (err) {
      throw new ApplicationError(
        `Failed to search articles: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return ArticleMapper.toDTOList(articles);
  }
}

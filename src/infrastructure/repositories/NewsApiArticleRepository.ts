/**
 * NewsApiArticleRepository — implements IArticleRepository.
 *
 * Translates NewsAPI raw response objects into Article domain entities.
 * All error mapping from HTTP/network failures happens here.
 *
 * Layer: infrastructure.
 */

import { IArticleRepository, FetchArticlesQuery } from '@domain/repositories/IArticleRepository';
import { Article } from '@domain/entities/Article';
import { ArticleId } from '@domain/value-objects/ArticleId';
import { Category } from '@domain/value-objects/Category';
import { SourceName } from '@domain/value-objects/SourceName';
import { DomainError } from '@domain/errors/DomainError';

import { NewsApiClient, NewsApiArticleRaw } from '../http/NewsApiClient';

export class NewsApiArticleRepository implements IArticleRepository {
  constructor(private readonly client: NewsApiClient) {}

  async fetchTopHeadlines(query: FetchArticlesQuery): Promise<Article[]> {
    const results: Article[] = [];

    // NewsAPI requires one request per category
    const fetches = query.categories.map(async (category) => {
      try {
        const response = await this.client.getTopHeadlines({
          category: category.value,
          country:  query.country ?? 'us',
          pageSize: query.maxPerCategory,
        });

        const articles = response.articles
          .filter((raw) => this.isUsable(raw))
          .map((raw)  => this.toDomainEntity(raw, category));

        results.push(...articles);
      } catch (err) {
        // Re-throw as a plain Error so the application layer can wrap it
        throw new Error(
          `NewsApiArticleRepository: failed for category "${category.value}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    });

    await Promise.all(fetches);
    return results;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private isUsable(raw: NewsApiArticleRaw): boolean {
    return (
      raw.url.trim().length > 0 &&
      raw.title.trim().length > 0 &&
      raw.title !== '[Removed]' &&
      raw.description !== '[Removed]'
    );
  }

  private toDomainEntity(raw: NewsApiArticleRaw, category: Category): Article {
    try {
      return new Article({
        id:          ArticleId.fromUrl(raw.url),
        title:       raw.title,
        description: raw.description ?? '',
        url:         raw.url,
        sourceName:  new SourceName(raw.source.name || 'Unknown'),
        category,
        publishedAt: new Date(raw.publishedAt),
        imageUrl:    raw.urlToImage,
        content:     raw.content,
      });
    } catch (err) {
      if (err instanceof DomainError) {
        throw new Error(`Mapping error: ${err.message}`);
      }
      throw err;
    }
  }
}

/**
 * IArticleRepository — repository interface (port).
 *
 * Defines WHAT the application can do with articles.
 * The HOW lives entirely in infrastructure/.
 *
 * Layer: domain — only primitives and domain types used.
 */

import { Article } from '../entities/Article';
import { Category } from '../value-objects/Category';

export interface FetchArticlesQuery {
  readonly categories: ReadonlyArray<Category>;
  /** ISO 3166-1 alpha-2 country code, e.g. "us". */
  readonly country?: string;
  readonly maxPerCategory: number;
  /** 1-based page number for pagination. Defaults to 1. */
  readonly page?: number;
}

export interface SearchArticlesQuery {
  /** Free-text search query sent to the /v2/everything endpoint. */
  readonly q: string;
  /** Maximum number of results to return (1–100). */
  readonly pageSize?: number;
  /** ISO 639-1 language code. Defaults to "en". */
  readonly language?: string;
  /** Sort order. Defaults to "publishedAt". */
  readonly sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  /** 1-based page number for pagination. Defaults to 1. */
  readonly page?: number;
}

/** Wraps a list of articles with the total count from the API. */
export interface ArticleResultPage {
  readonly articles: Article[];
  /** Total results available on the API (may exceed what was fetched). */
  readonly totalResults: number;
}

export interface IArticleRepository {
  /**
   * Fetch top-headline articles for the requested categories.
   * Returns articles + total result count for pagination.
   */
  fetchTopHeadlines(query: FetchArticlesQuery): Promise<ArticleResultPage>;

  /**
   * Search articles across all sources using a free-text query.
   * Wraps the /v2/everything endpoint.
   */
  searchArticles(query: SearchArticlesQuery): Promise<ArticleResultPage>;
}

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
}

export interface IArticleRepository {
  /**
   * Fetch top-headline articles for the requested categories.
   * Returns a flat list; callers may group by category.
   */
  fetchTopHeadlines(query: FetchArticlesQuery): Promise<Article[]>;
}

/**
 * ArticleDTO — data transfer object.
 *
 * Plain, serialisable representation of an Article sent out of
 * use cases. No domain types leak beyond the application boundary.
 *
 * Layer: application.
 */

export interface ArticleDTO {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly sourceName: string;
  readonly category: string;
  readonly publishedAt: string; // ISO 8601
  readonly imageUrl: string | null;
  readonly relativeAge: string;
}

/**
 * ArticleId — value object.
 *
 * Immutable wrapper around a string identifier for an Article.
 * Equality is by value, not reference.
 *
 * Layer: domain.
 */

import { DomainError } from '../errors/DomainError';

export class ArticleId {
  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new DomainError('ArticleId must not be empty.');
    }
    this.value = value.trim();
  }

  equals(other: ArticleId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  /** Factory: derive a stable ID from a URL (used when no explicit ID exists). */
  static fromUrl(url: string): ArticleId {
    // Simple deterministic hash from the URL string.
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (Math.imul(31, hash) + url.charCodeAt(i)) | 0;
    }
    return new ArticleId(`article_${Math.abs(hash).toString(16)}`);
  }
}

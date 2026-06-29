/**
 * Article — core domain entity.
 *
 * Represents a single news article fetched from an external source.
 * The entity owns its invariants: it will throw a DomainError if
 * constructed with invalid data.
 *
 * Layer: domain — no imports from outside domain/.
 */

import { ArticleId } from '../value-objects/ArticleId';
import { Category } from '../value-objects/Category';
import { SourceName } from '../value-objects/SourceName';
import { DomainError } from '../errors/DomainError';

export interface ArticleProps {
  readonly id: ArticleId;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly sourceName: SourceName;
  readonly category: Category;
  readonly publishedAt: Date;
  readonly imageUrl: string | null;
  readonly content: string | null;
}

export class Article {
  readonly id: ArticleId;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly sourceName: SourceName;
  readonly category: Category;
  readonly publishedAt: Date;
  readonly imageUrl: string | null;
  readonly content: string | null;

  constructor(props: ArticleProps) {
    if (props.title.trim().length === 0) {
      throw new DomainError('Article title must not be empty.');
    }
    if (props.url.trim().length === 0) {
      throw new DomainError('Article URL must not be empty.');
    }

    this.id          = props.id;
    this.title       = props.title.trim();
    this.description = props.description.trim();
    this.url         = props.url.trim();
    this.sourceName  = props.sourceName;
    this.category    = props.category;
    this.publishedAt = props.publishedAt;
    this.imageUrl    = props.imageUrl;
    this.content     = props.content;
  }

  /** Returns true when the article has a readable full-text snippet. */
  hasContent(): boolean {
    return this.content !== null && this.content.trim().length > 0;
  }

  /** Returns a short human-readable age label, e.g. "2 h ago". */
  relativeAge(): string {
    const diffMs      = Date.now() - this.publishedAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);

    if (diffMinutes < 60)  return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours   < 24)  return `${diffHours} h ago`;
    const diffDays  = Math.floor(diffHours   / 24);
    return `${diffDays} d ago`;
  }
}

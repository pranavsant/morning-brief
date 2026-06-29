/**
 * Brief — aggregate root.
 *
 * A Morning Brief is an AI-generated digest produced from a set of
 * articles. It belongs to a specific date and carries the final
 * summarised text returned by Claude.
 *
 * Layer: domain — no imports from outside domain/.
 */

import { BriefId } from '../value-objects/BriefId';
import { Category } from '../value-objects/Category';
import { Article } from './Article';
import { DomainError } from '../errors/DomainError';

export type BriefStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface BriefProps {
  readonly id: BriefId;
  readonly date: Date;
  readonly categories: ReadonlyArray<Category>;
  readonly articles: ReadonlyArray<Article>;
  readonly summary: string | null;
  readonly status: BriefStatus;
  readonly generatedAt: Date | null;
}

export class Brief {
  readonly id: BriefId;
  readonly date: Date;
  readonly categories: ReadonlyArray<Category>;
  private _articles: Article[];
  private _summary: string | null;
  private _status: BriefStatus;
  private _generatedAt: Date | null;

  constructor(props: BriefProps) {
    if (props.categories.length === 0) {
      throw new DomainError('A Brief must have at least one category.');
    }

    this.id           = props.id;
    this.date         = props.date;
    this.categories   = props.categories;
    this._articles    = [...props.articles];
    this._summary     = props.summary;
    this._status      = props.status;
    this._generatedAt = props.generatedAt;
  }

  get articles(): ReadonlyArray<Article> { return this._articles; }
  get summary():  string | null           { return this._summary; }
  get status():   BriefStatus             { return this._status; }
  get generatedAt(): Date | null          { return this._generatedAt; }

  /** Domain transition: mark the brief as currently being generated. */
  startGeneration(): void {
    if (this._status !== 'pending') {
      throw new DomainError(`Cannot start generation when status is "${this._status}".`);
    }
    this._status = 'generating';
  }

  /** Domain transition: attach the AI summary and mark as ready. */
  completeSummary(summary: string): void {
    if (this._status !== 'generating') {
      throw new DomainError(`Cannot complete a brief that is not generating (status="${this._status}").`);
    }
    if (summary.trim().length === 0) {
      throw new DomainError('Summary must not be empty.');
    }
    this._summary     = summary.trim();
    this._status      = 'ready';
    this._generatedAt = new Date();
  }

  /** Domain transition: mark the brief as failed with no summary. */
  failGeneration(): void {
    this._status  = 'failed';
    this._summary = null;
  }

  /** Returns articles filtered by a specific category. */
  articlesByCategory(category: Category): Article[] {
    return this._articles.filter((a) => a.category.equals(category));
  }

  isReady():   boolean { return this._status === 'ready'; }
  isFailed():  boolean { return this._status === 'failed'; }
  isPending(): boolean { return this._status === 'pending'; }
}

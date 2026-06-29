/**
 * GetArticleContextUseCase — application use case.
 *
 * Given a minimal article snapshot (title + description), asks Claude to
 * produce 3–5 bullet points of background context — key people involved,
 * what led to this event, and why it matters.
 *
 * The use case validates input and delegates all Claude I/O to the
 * IArticleContextProvider port, keeping the application layer free of
 * infrastructure concerns.
 *
 * Layer: application.
 */

import { ApplicationError } from '../errors/ApplicationError';

// ── Port ─────────────────────────────────────────────────────────────────────

/** Minimum article data the context provider needs. */
export interface ArticleContextInput {
  title: string;
  description: string;
}

/**
 * IArticleContextProvider — application-layer port.
 *
 * Implemented in infrastructure by ClaudeSummarisationService.
 * Kept here so the application layer has no knowledge of Claude internals.
 */
export interface IArticleContextProvider {
  getArticleContext(input: ArticleContextInput): Promise<string[]>;
}

// ── Result type ───────────────────────────────────────────────────────────────

export interface GetArticleContextResult {
  /** 3–5 bullet points of background context. */
  bullets: string[];
}

// ── Use case ──────────────────────────────────────────────────────────────────

export class GetArticleContextUseCase {
  constructor(private readonly contextProvider: IArticleContextProvider) {}

  async execute(input: ArticleContextInput): Promise<GetArticleContextResult> {
    if (!input.title || input.title.trim().length === 0) {
      throw new ApplicationError(
        'Article title is required to generate related context.',
      );
    }

    const bullets = await this.contextProvider.getArticleContext({
      title:       input.title.trim(),
      description: input.description.trim(),
    });

    if (bullets.length === 0) {
      throw new ApplicationError(
        'Claude could not generate context for this article.',
      );
    }

    return { bullets };
  }
}

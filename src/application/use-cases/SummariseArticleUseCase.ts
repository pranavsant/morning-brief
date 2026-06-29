/**
 * SummariseArticleUseCase — application use case.
 *
 * Given a minimal article snapshot (title + description), asks Claude
 * to produce a concise 2–3 sentence plain-English summary.
 *
 * The use case is deliberately light: it delegates prompt construction
 * and Claude I/O to the IArticleSummariser port, keeping business-rule
 * concerns (input validation, error wrapping) here in the application layer.
 *
 * Layer: application.
 */

import { ApplicationError } from '../errors/ApplicationError';

// ── Port ─────────────────────────────────────────────────────────────────────

/** Minimum article data the summariser needs. */
export interface ArticleSummaryInput {
  title: string;
  description: string;
}

/**
 * IArticleSummariser — application-layer port.
 *
 * Implemented in infrastructure by ClaudeSummarisationService.
 * Kept here so the application layer has no knowledge of Claude internals.
 */
export interface IArticleSummariser {
  summariseArticle(input: ArticleSummaryInput): Promise<string>;
}

// ── Result type ───────────────────────────────────────────────────────────────

export interface SummariseArticleResult {
  summary: string;
}

// ── Use case ──────────────────────────────────────────────────────────────────

export class SummariseArticleUseCase {
  constructor(private readonly summariser: IArticleSummariser) {}

  async execute(input: ArticleSummaryInput): Promise<SummariseArticleResult> {
    if (!input.title || input.title.trim().length === 0) {
      throw new ApplicationError('Article title is required to generate a summary.');
    }

    const summary = await this.summariser.summariseArticle({
      title:       input.title.trim(),
      description: input.description.trim(),
    });

    return { summary };
  }
}

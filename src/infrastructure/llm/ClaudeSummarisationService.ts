/**
 * ClaudeSummarisationService — implements ISummarisationService.
 *
 * Bridges the domain summarisation interface to the Claude API. It
 * delegates all HTTP / SDK concerns to {@link ClaudeApiClient} and all
 * prompt construction to the helpers in {@link prompts.ts}.
 *
 * Layer: infrastructure.
 */

import { ISummarisationService } from '@domain/services/ISummarisationService';
import { Brief } from '@domain/entities/Brief';
import { IArticleSummariser, ArticleSummaryInput } from '@application/use-cases/SummariseArticleUseCase';
import { IArticleContextProvider, ArticleContextInput } from '@application/use-cases/GetArticleContextUseCase';

import { ClaudeApiClient, ClaudeApiClientConfig } from './ClaudeApiClient';
import {
  DIGEST_SYSTEM_PROMPT,
  SUMMARISATION_SYSTEM_PROMPT,
  CONTEXT_SYSTEM_PROMPT,
  buildDigestPrompt,
  buildArticleSummaryPrompt,
  buildArticleContextPrompt,
} from './prompts';

export type { ClaudeApiClientConfig as ClaudeConfig };

export class ClaudeSummarisationService
  implements ISummarisationService, IArticleSummariser, IArticleContextProvider
{
  private readonly client: ClaudeApiClient;

  constructor(config: ClaudeApiClientConfig) {
    this.client = new ClaudeApiClient(config);
  }

  /** Full Morning Brief digest (domain Brief entity). */
  async summarise(brief: Brief): Promise<string> {
    return this.client.complete({
      system:     DIGEST_SYSTEM_PROMPT,
      userPrompt: buildDigestPrompt(brief),
      maxTokens:  1500,
    });
  }

  /** Single-article 2–3 sentence summary (plain input, no domain entity). */
  async summariseArticle(input: ArticleSummaryInput): Promise<string> {
    return this.client.complete({
      system:     SUMMARISATION_SYSTEM_PROMPT,
      userPrompt: buildArticleSummaryPrompt(input),
      maxTokens:  300,
    });
  }

  /**
   * Generate 3–5 bullet points of background context for an article.
   *
   * Parses Claude's response by splitting on newlines and retaining only
   * lines that start with the bullet prefix "• ". This makes the method
   * robust to any preamble or trailing text Claude might add.
   */
  async getArticleContext(input: ArticleContextInput): Promise<string[]> {
    const raw = await this.client.complete({
      system:     CONTEXT_SYSTEM_PROMPT,
      userPrompt: buildArticleContextPrompt(input),
      maxTokens:  500,
    });

    // Parse bullet lines; fall back to splitting on newlines if no "• " found.
    const bulletLines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('• '))
      .map((line) => line.slice(2).trim()); // strip the "• " prefix

    if (bulletLines.length > 0) {
      return bulletLines;
    }

    // Fallback: treat every non-empty line as a bullet point.
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}

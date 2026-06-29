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

import { ClaudeApiClient, ClaudeApiClientConfig } from './ClaudeApiClient';
import {
  DIGEST_SYSTEM_PROMPT,
  SUMMARISATION_SYSTEM_PROMPT,
  buildDigestPrompt,
  buildArticleSummaryPrompt,
} from './prompts';

export type { ClaudeApiClientConfig as ClaudeConfig };

export class ClaudeSummarisationService
  implements ISummarisationService, IArticleSummariser
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
}

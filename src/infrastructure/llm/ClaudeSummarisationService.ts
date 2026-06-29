/**
 * ClaudeSummarisationService — implements ISummarisationService.
 *
 * Wraps the Anthropic SDK behind the clean domain interface. Builds a
 * prompt from the Brief's articles and returns Claude's markdown digest.
 *
 * Layer: infrastructure.
 *
 * NOTE: Calling the Anthropic API directly from the browser exposes your
 * key to end users. For production, proxy these calls through a backend.
 * The SDK is configured with dangerouslyAllowBrowser:true purely so the
 * scaffold runs out-of-the-box for local development.
 */

import Anthropic from '@anthropic-ai/sdk';

import { ISummarisationService } from '@domain/services/ISummarisationService';
import { Brief } from '@domain/entities/Brief';

export interface ClaudeConfig {
  apiKey: string;
  model:  string;
}

export class ClaudeSummarisationService implements ISummarisationService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ClaudeConfig) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error('ClaudeSummarisationService: apiKey is required.');
    }
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model;
  }

  async summarise(brief: Brief): Promise<string> {
    const prompt = this.buildPrompt(brief);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system:
        'You are a sharp, concise news editor producing a personalised "Morning Brief". ' +
        'Write in clear markdown. Group stories by category with H2 headings. ' +
        'For each story give a one-sentence punchy summary and cite the source in italics. ' +
        'Open with a 2-sentence "TL;DR" of the day. Be neutral and factual.',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (text.length === 0) {
      throw new Error('Claude returned an empty response.');
    }

    return text;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildPrompt(brief: Brief): string {
    const lines: string[] = [];
    lines.push(`Date: ${brief.date.toDateString()}`);
    lines.push('');
    lines.push('Summarise the following headlines into a Morning Brief.');
    lines.push('');

    for (const category of brief.categories) {
      const articles = brief.articlesByCategory(category);
      if (articles.length === 0) continue;

      lines.push(`## ${category.label()}`);
      for (const article of articles) {
        lines.push(`- TITLE: ${article.title}`);
        if (article.description) lines.push(`  SUMMARY: ${article.description}`);
        lines.push(`  SOURCE: ${article.sourceName.value}`);
        lines.push(`  URL: ${article.url}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

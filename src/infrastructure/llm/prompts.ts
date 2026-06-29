/**
 * prompts — reusable prompt-builder functions for Claude.
 *
 * Centralises all Claude prompt strings and construction logic so that
 * every service in the llm/ layer can import consistent, versioned
 * templates rather than duplicating or drifting.
 *
 * Two template families are provided:
 *   • Summarisation  — condense an article for a card/preview
 *   • Digest         — produce a full Morning Brief markdown document
 *
 * Layer: infrastructure.
 */

import { Brief } from '@domain/entities/Brief';
import { Article } from '@domain/entities/Article';
import { ArticleSummaryInput } from '@application/use-cases/SummariseArticleUseCase';

// ── System prompts ───────────────────────────────────────────────────────────

/**
 * System instruction for the full Morning Brief digest.
 *
 * Shapes Claude's persona and output format: grouped by category,
 * markdown headings, punchy sentences, neutral tone, TL;DR opener.
 */
export const DIGEST_SYSTEM_PROMPT =
  'You are a sharp, concise news editor producing a personalised "Morning Brief". ' +
  'Write in clear markdown. Group stories by category with H2 headings. ' +
  'For each story give a one-sentence punchy summary and cite the source in italics. ' +
  'Open with a 2-sentence "TL;DR" of the day. Be neutral and factual.';

/**
 * System instruction for single-article summarisation.
 *
 * Shapes Claude's persona for producing a tight, 2–3 sentence summary
 * of one article, suitable for embedding in a card or preview.
 */
export const SUMMARISATION_SYSTEM_PROMPT =
  'You are a concise news summariser. ' +
  'Given an article title, description, and any body text, produce a 2–3 sentence ' +
  'plain-English summary that captures the key facts. ' +
  'Do not editorialize. Do not add information not present in the source. ' +
  'Return only the summary text — no headings, no bullet points.';

// ── User prompt builders ─────────────────────────────────────────────────────

/**
 * Build the user message for a full Morning Brief digest.
 *
 * Takes a {@link Brief} aggregate and formats all of its articles grouped
 * by category into a structured prompt. The model is expected to produce
 * a markdown-formatted Morning Brief in response.
 *
 * @param brief - The assembled Brief aggregate containing articles.
 * @returns     A multi-line string ready to be sent as the `user` message.
 */
export function buildDigestPrompt(brief: Brief): string {
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
      if (article.description.trim().length > 0) {
        lines.push(`  SUMMARY: ${article.description}`);
      }
      lines.push(`  SOURCE: ${article.sourceName.value}`);
      lines.push(`  URL: ${article.url}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build the user message for single-article summarisation.
 *
 * Packages the article's metadata into a structured prompt. The model
 * is expected to return a concise 2–3 sentence plain-English summary.
 *
 * @param article - The article to summarise.
 * @returns       A multi-line string ready to be sent as the `user` message.
 */
export function buildSummarisationPrompt(article: Article): string {
  const lines: string[] = [];
  lines.push(`TITLE: ${article.title}`);

  if (article.description.trim().length > 0) {
    lines.push(`DESCRIPTION: ${article.description}`);
  }

  if (article.content !== null && article.content.trim().length > 0) {
    // Truncate content to avoid blowing the context window.
    const truncated =
      article.content.length > 2000
        ? `${article.content.slice(0, 2000)}…`
        : article.content;
    lines.push(`CONTENT: ${truncated}`);
  }

  lines.push(`SOURCE: ${article.sourceName.value}`);
  lines.push('');
  lines.push('Please provide a 2-3 sentence summary of the above article.');

  return lines.join('\n');
}

/**
 * Build the user message for single-article summarisation from a plain DTO
 * (no domain entity required).
 *
 * Used by {@link SummariseArticleUseCase} when only the title and description
 * from the feed card are available.
 *
 * @param input - Minimal article data (title + description).
 * @returns     A multi-line string ready to be sent as the `user` message.
 */
export function buildArticleSummaryPrompt(input: ArticleSummaryInput): string {
  const lines: string[] = [];
  lines.push(`TITLE: ${input.title}`);

  if (input.description.trim().length > 0) {
    lines.push(`DESCRIPTION: ${input.description}`);
  }

  lines.push('');
  lines.push('Please provide a concise 3-sentence summary of the above article.');

  return lines.join('\n');
}

/**
 * ISummarisationService — domain service interface (port).
 *
 * Defines the contract for AI-powered text summarisation.
 * The concrete implementation (Claude) lives in infrastructure/.
 *
 * Layer: domain — only domain types appear in the signature.
 */

import { Brief } from '../entities/Brief';

export interface ISummarisationService {
  /**
   * Given a Brief with fetched articles, produce a markdown-formatted
   * morning digest and return it as a string.
   */
  summarise(brief: Brief): Promise<string>;
}

/**
 * BriefDTO — data transfer object.
 *
 * Layer: application.
 */

import { ArticleDTO } from './ArticleDTO';

export type BriefStatusDTO = 'pending' | 'generating' | 'ready' | 'failed';

export interface BriefDTO {
  readonly id: string;
  readonly date: string;            // ISO 8601
  readonly categories: string[];
  readonly articles: ArticleDTO[];
  readonly summary: string | null;
  readonly status: BriefStatusDTO;
  readonly generatedAt: string | null; // ISO 8601
}

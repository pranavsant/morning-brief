/**
 * BriefMapper — maps between Brief domain aggregates and BriefDTOs.
 *
 * Layer: application.
 */

import { Brief } from '@domain/entities/Brief';
import { BriefDTO } from '../dtos/BriefDTO';
import { ArticleMapper } from './ArticleMapper';

export class BriefMapper {
  static toDTO(brief: Brief): BriefDTO {
    return {
      id:          brief.id.value,
      date:        brief.date.toISOString(),
      categories:  brief.categories.map((c) => c.value),
      articles:    ArticleMapper.toDTOList(brief.articles),
      summary:     brief.summary,
      status:      brief.status,
      generatedAt: brief.generatedAt?.toISOString() ?? null,
    };
  }
}

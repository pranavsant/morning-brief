/**
 * BriefAssemblyService — domain service.
 *
 * Assembles a new Brief aggregate from a set of articles and user
 * preferences. Logic that doesn't belong naturally to any single
 * entity lives here.
 *
 * Layer: domain.
 */

import { Brief } from '../entities/Brief';
import { BriefId } from '../value-objects/BriefId';
import { Article } from '../entities/Article';
import { Category } from '../value-objects/Category';

export class BriefAssemblyService {
  /**
   * Create a fresh pending Brief from a list of articles.
   * Articles are limited per-category according to the cap provided.
   */
  assemble(
    articles: Article[],
    categories: Category[],
    maxPerCategory: number,
  ): Brief {
    const capped = this.capByCategory(articles, categories, maxPerCategory);

    return new Brief({
      id:          BriefId.generate(),
      date:        new Date(),
      categories,
      articles:    capped,
      summary:     null,
      status:      'pending',
      generatedAt: null,
    });
  }

  private capByCategory(
    articles: Article[],
    categories: Category[],
    max: number,
  ): Article[] {
    const result: Article[] = [];

    for (const category of categories) {
      const matching = articles
        .filter((a) => a.category.equals(category))
        .slice(0, max);
      result.push(...matching);
    }

    return result;
  }
}

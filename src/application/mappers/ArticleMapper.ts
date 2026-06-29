/**
 * ArticleMapper — maps between Article domain entities and ArticleDTOs.
 *
 * Layer: application.
 */

import { Article } from '@domain/entities/Article';
import { ArticleDTO } from '../dtos/ArticleDTO';

export class ArticleMapper {
  static toDTO(article: Article): ArticleDTO {
    return {
      id:          article.id.value,
      title:       article.title,
      description: article.description,
      url:         article.url,
      sourceName:  article.sourceName.value,
      category:    article.category.value,
      publishedAt: article.publishedAt.toISOString(),
      imageUrl:    article.imageUrl,
      relativeAge: article.relativeAge(),
    };
  }

  static toDTOList(articles: ReadonlyArray<Article>): ArticleDTO[] {
    return articles.map(ArticleMapper.toDTO);
  }
}

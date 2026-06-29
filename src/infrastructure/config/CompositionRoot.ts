/**
 * CompositionRoot — dependency injection wiring.
 *
 * This is the ONLY place where concrete infrastructure classes are
 * instantiated and injected into application use cases. The interfaces
 * layer receives an IUseCaseRegistry built here; it never touches
 * infrastructure directly.
 *
 * Layer: infrastructure (it is allowed to import application & domain).
 */

import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { GenerateMorningBriefUseCase } from '@application/use-cases/GenerateMorningBriefUseCase';
import { GetLatestBriefUseCase } from '@application/use-cases/GetLatestBriefUseCase';
import { FetchTopHeadlinesUseCase } from '@application/use-cases/FetchTopHeadlinesUseCase';
import { SearchArticlesUseCase } from '@application/use-cases/SearchArticlesUseCase';
import { SummariseArticleUseCase } from '@application/use-cases/SummariseArticleUseCase';
import { GetArticleContextUseCase } from '@application/use-cases/GetArticleContextUseCase';
import { BriefAssemblyService } from '@domain/services/BriefAssemblyService';

import { loadEnv } from './env';
import { NewsApiClient } from '../http/NewsApiClient';
import { NewsApiArticleRepository } from '../repositories/NewsApiArticleRepository';
import { InMemoryBriefRepository } from '../repositories/InMemoryBriefRepository';
import { ClaudeSummarisationService } from '../llm/ClaudeSummarisationService';

let cached: IUseCaseRegistry | null = null;

/**
 * Build (and memoise) the application's use cases with their concrete
 * infrastructure dependencies wired in. Returns an IUseCaseRegistry —
 * the only thing the interfaces layer is ever handed.
 */
export function buildUseCaseRegistry(): IUseCaseRegistry {
  if (cached) return cached;

  const env = loadEnv();

  // Infrastructure
  const newsApiClient        = new NewsApiClient(env.newsApiKey);
  const articleRepository    = new NewsApiArticleRepository(newsApiClient);
  const briefRepository      = new InMemoryBriefRepository();
  const summarisationService = new ClaudeSummarisationService({
    apiKey: env.anthropicApiKey,
    model:  env.claudeModel,
  });

  // Domain services
  const briefAssemblyService = new BriefAssemblyService();

  // Application use cases
  const generateMorningBrief = new GenerateMorningBriefUseCase(
    articleRepository,
    briefRepository,
    summarisationService,
    briefAssemblyService,
  );
  const getLatestBrief    = new GetLatestBriefUseCase(briefRepository);
  const fetchTopHeadlines = new FetchTopHeadlinesUseCase(articleRepository);
  const searchArticles    = new SearchArticlesUseCase(articleRepository);
  const summariseArticle  = new SummariseArticleUseCase(summarisationService);
  const getArticleContext = new GetArticleContextUseCase(summarisationService);

  cached = { generateMorningBrief, getLatestBrief, fetchTopHeadlines, searchArticles, summariseArticle, getArticleContext };
  return cached;
}

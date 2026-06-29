/**
 * IUseCaseRegistry — application port.
 *
 * Describes the set of use cases the interfaces layer may invoke,
 * WITHOUT exposing how they are constructed. The infrastructure
 * composition root produces an object satisfying this interface, and
 * the interfaces layer consumes it via dependency injection (React
 * context), never importing infrastructure directly.
 *
 * Layer: application.
 */

import { GenerateMorningBriefUseCase } from '../use-cases/GenerateMorningBriefUseCase';
import { GetLatestBriefUseCase } from '../use-cases/GetLatestBriefUseCase';

export interface IUseCaseRegistry {
  generateMorningBrief: GenerateMorningBriefUseCase;
  getLatestBrief:       GetLatestBriefUseCase;
}

/**
 * GetLatestBriefUseCase
 *
 * Retrieves the most recently generated Brief from the repository.
 * Returns null when no brief exists yet.
 *
 * Layer: application.
 */

import { IBriefRepository } from '@domain/repositories/IBriefRepository';
import { BriefDTO } from '../dtos/BriefDTO';
import { BriefMapper } from '../mappers/BriefMapper';

export class GetLatestBriefUseCase {
  constructor(private readonly briefRepository: IBriefRepository) {}

  async execute(): Promise<BriefDTO | null> {
    const brief = await this.briefRepository.findLatest();
    if (!brief) return null;
    return BriefMapper.toDTO(brief);
  }
}

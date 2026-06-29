/**
 * IBriefRepository — repository interface (port).
 *
 * Manages persistence of Brief aggregates.
 * In v1 this is backed by in-memory / sessionStorage infrastructure.
 *
 * Layer: domain.
 */

import { Brief } from '../entities/Brief';
import { BriefId } from '../value-objects/BriefId';

export interface IBriefRepository {
  save(brief: Brief): Promise<void>;
  findById(id: BriefId): Promise<Brief | null>;
  findLatest(): Promise<Brief | null>;
}

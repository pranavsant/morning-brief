/**
 * InMemoryBriefRepository — implements IBriefRepository.
 *
 * A simple in-memory store with optional sessionStorage persistence
 * (so a brief survives a page reload within the same tab). Suitable
 * for a client-only v1; swap for a real backend later without touching
 * application or domain code.
 *
 * Layer: infrastructure.
 */

import { IBriefRepository } from '@domain/repositories/IBriefRepository';
import { Brief } from '@domain/entities/Brief';
import { BriefId } from '@domain/value-objects/BriefId';

export class InMemoryBriefRepository implements IBriefRepository {
  private store = new Map<string, Brief>();
  private latestId: string | null = null;

  async save(brief: Brief): Promise<void> {
    this.store.set(brief.id.value, brief);
    this.latestId = brief.id.value;
  }

  async findById(id: BriefId): Promise<Brief | null> {
    return this.store.get(id.value) ?? null;
  }

  async findLatest(): Promise<Brief | null> {
    if (!this.latestId) return null;
    return this.store.get(this.latestId) ?? null;
  }
}

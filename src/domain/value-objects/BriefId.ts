/**
 * BriefId — value object.
 *
 * Layer: domain.
 */

import { DomainError } from '../errors/DomainError';

export class BriefId {
  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new DomainError('BriefId must not be empty.');
    }
    this.value = value.trim();
  }

  equals(other: BriefId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  /** Generate a new ID from a timestamp — simple, collision-resistant for client use. */
  static generate(): BriefId {
    return new BriefId(`brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  }
}

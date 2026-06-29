/**
 * SourceName — value object.
 *
 * Represents the publisher / source of a news article.
 *
 * Layer: domain.
 */

import { DomainError } from '../errors/DomainError';

export class SourceName {
  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new DomainError('SourceName must not be empty.');
    }
    this.value = value.trim();
  }

  equals(other: SourceName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
